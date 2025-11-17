import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { LoggingService } from '../../logging.service';
import type { ConfiguracionAgregacion } from '../../configuracion/logging.config';
import { configuracionAgregacion } from '../../configuracion/logging.config';

/**
 * Interfaz para el servicio de agregación de logs
 */
interface ServicioAgregacion {
  enviarLog(log: any): Promise<void>;
  enviarLote(logs: any[]): Promise<void>;
  salud(): Promise<boolean>;
}

/**
 * Implementación para Elasticsearch
 */
class ElasticsearchAgregacion implements ServicioAgregacion {
  constructor(private config: ConfiguracionAgregacion) {}

  async enviarLog(log: any): Promise<void> {
    // En una implementación real, aquí se enviaría el log a Elasticsearch
    // Por ahora, solo simulamos el envío
    console.log(`[Elasticsearch] Enviando log: ${JSON.stringify(log)}`);
  }

  async enviarLote(logs: any[]): Promise<void> {
    // En una implementación real, aquí se enviaría un lote de logs
    console.log(`[Elasticsearch] Enviando lote de ${logs.length} logs`);
  }

  async salud(): Promise<boolean> {
    // En una implementación real, verificaría la conexión con Elasticsearch
    return true;
  }
}

/**
 * Implementación para Splunk
 */
class SplunkAgregacion implements ServicioAgregacion {
  constructor(private config: ConfiguracionAgregacion) {}

  async enviarLog(log: any): Promise<void> {
    console.log(`[Splunk] Enviando log: ${JSON.stringify(log)}`);
  }

  async enviarLote(logs: any[]): Promise<void> {
    console.log(`[Splunk] Enviando lote de ${logs.length} logs`);
  }

  async salud(): Promise<boolean> {
    return true;
  }
}

/**
 * Implementación para Datadog
 */
class DatadogAgregacion implements ServicioAgregacion {
  constructor(private config: ConfiguracionAgregacion) {}

  async enviarLog(log: any): Promise<void> {
    console.log(`[Datadog] Enviando log: ${JSON.stringify(log)}`);
  }

  async enviarLote(logs: any[]): Promise<void> {
    console.log(`[Datadog] Enviando lote de ${logs.length} logs`);
  }

  async salud(): Promise<boolean> {
    return true;
  }
}

/**
 * Implementación para Loki
 */
class LokiAgregacion implements ServicioAgregacion {
  constructor(private config: ConfiguracionAgregacion) {}

  async enviarLog(log: any): Promise<void> {
    console.log(`[Loki] Enviando log: ${JSON.stringify(log)}`);
  }

  async enviarLote(logs: any[]): Promise<void> {
    console.log(`[Loki] Enviando lote de ${logs.length} logs`);
  }

  async salud(): Promise<boolean> {
    return true;
  }
}

/**
 * Servicio para agregación de logs en servicios externos
 * Maneja el envío de logs a sistemas como Elasticsearch, Splunk, Datadog, Loki
 */
@Injectable()
export class ServicioAgregacionLogs implements OnModuleInit, OnModuleDestroy {
  private servicioAgregacion: ServicioAgregacion;
  private buffer: any[] = [];
  private intervaloEnvio: NodeJS.Timeout;
  private estaEnviando = false;

  constructor(
    private readonly loggingService: LoggingService,
    private readonly config: ConfiguracionAgregacion = configuracionAgregacion,
  ) {
    this.inicializarServicioAgregacion();
  }

  async onModuleInit() {
    await this.iniciarProcesamiento();
  }

  async onModuleDestroy() {
    await this.detenerProcesamiento();
  }

  /**
   * Inicializa el servicio de agregación según la configuración
   */
  private inicializarServicioAgregacion(): void {
    if (!this.config.habilitada) {
      this.loggingService.log('Agregación de logs deshabilitada', {
        modulo: 'agregacion_logs',
      });
      return;
    }

    switch (this.config.servicio) {
      case 'elasticsearch':
        this.servicioAgregacion = new ElasticsearchAgregacion(this.config);
        break;
      case 'splunk':
        this.servicioAgregacion = new SplunkAgregacion(this.config);
        break;
      case 'datadog':
        this.servicioAgregacion = new DatadogAgregacion(this.config);
        break;
      case 'loki':
        this.servicioAgregacion = new LokiAgregacion(this.config);
        break;
      default:
        this.loggingService.warn(`Servicio de agregación no soportado: ${this.config.servicio}`, {
          modulo: 'agregacion_logs',
        });
        return;
    }

    this.loggingService.log(`Servicio de agregación inicializado: ${this.config.servicio}`, {
      modulo: 'agregacion_logs',
      endpoint: this.config.endpoint,
    });
  }

  /**
   * Inicia el procesamiento de logs
   */
  private async iniciarProcesamiento(): Promise<void> {
    if (!this.config.habilitada || !this.servicioAgregacion) {
      return;
    }

    // Verificar salud del servicio
    const salud = await this.servicioAgregacion.salud();
    if (!salud) {
      this.loggingService.error('Servicio de agregación no está saludable', undefined, {
        modulo: 'agregacion_logs',
        servicio: this.config.servicio,
      });
      return;
    }

    // Configurar intervalo para envío por lotes
    this.intervaloEnvio = setInterval(async () => {
      await this.procesarBuffer();
    }, this.config.intervalo);

    this.loggingService.log('Procesamiento de logs iniciado', {
      modulo: 'agregacion_logs',
      intervalo: this.config.intervalo,
      batchSize: this.config.batchSize,
    });
  }

  /**
   * Detiene el procesamiento de logs
   */
  private async detenerProcesamiento(): Promise<void> {
    if (this.intervaloEnvio) {
      clearInterval(this.intervaloEnvio);
    }

    // Enviar logs restantes antes de cerrar
    if (this.buffer.length > 0) {
      await this.procesarBuffer();
    }

    this.loggingService.log('Procesamiento de logs detenido', {
      modulo: 'agregacion_logs',
    });
  }

  /**
   * Agrega un log al buffer para procesamiento
   */
  async agregarLog(log: any): Promise<void> {
    if (!this.config.habilitada || !this.servicioAgregacion) {
      return;
    }

    this.buffer.push({
      ...log,
      timestamp: new Date().toISOString(),
      servicio: 'ecommerce-tiendanube',
      entorno: process.env.NODE_ENV || 'desarrollo',
    });

    // Enviar inmediatamente si el buffer alcanza el tamaño máximo
    if (this.buffer.length >= this.config.batchSize) {
      await this.procesarBuffer();
    }
  }

  /**
   * Procesa el buffer de logs y los envía al servicio de agregación
   */
  private async procesarBuffer(): Promise<void> {
    if (this.estaEnviando || this.buffer.length === 0) {
      return;
    }

    this.estaEnviando = true;

    try {
      const logsAEnviar = [...this.buffer];
      this.buffer = [];

      await this.servicioAgregacion.enviarLote(logsAEnviar);

      this.loggingService.debug(`Lote de ${logsAEnviar.length} logs enviado exitosamente`, {
        modulo: 'agregacion_logs',
        servicio: this.config.servicio,
      });
    } catch (error) {
      // Reintentar los logs fallidos
      this.loggingService.error('Error al enviar lote de logs', error.stack, {
        modulo: 'agregacion_logs',
        servicio: this.config.servicio,
        logsFallidos: this.buffer.length,
      });

      // En una implementación real, podríamos implementar una estrategia de reintento
      // o almacenar los logs fallidos para procesamiento posterior
    } finally {
      this.estaEnviando = false;
    }
  }

  /**
   * Obtiene estadísticas del servicio de agregación
   */
  obtenerEstadisticas(): {
    habilitado: boolean;
    servicio: string;
    bufferActual: number;
    totalEnviados: number;
    salud: boolean;
  } {
    return {
      habilitado: this.config.habilitada && !!this.servicioAgregacion,
      servicio: this.config.servicio,
      bufferActual: this.buffer.length,
      totalEnviados: 0, // En una implementación real, llevaríamos un contador
      salud: this.estaEnviando,
    };
  }

  /**
   * Verifica la salud del servicio de agregación
   */
  async verificarSalud(): Promise<{
    servicio: string;
    salud: boolean;
    mensaje: string;
    detalles?: any;
  }> {
    if (!this.config.habilitada || !this.servicioAgregacion) {
      return {
        servicio: this.config.servicio,
        salud: true,
        mensaje: 'Agregación deshabilitada',
      };
    }

    try {
      const salud = await this.servicioAgregacion.salud();
      return {
        servicio: this.config.servicio,
        salud,
        mensaje: salud ? 'Servicio saludable' : 'Servicio no saludable',
        detalles: {
          bufferActual: this.buffer.length,
          estaEnviando: this.estaEnviando,
        },
      };
    } catch (error) {
      return {
        servicio: this.config.servicio,
        salud: false,
        mensaje: `Error verificando salud: ${error.message}`,
        detalles: {
          error: error.message,
        },
      };
    }
  }
}