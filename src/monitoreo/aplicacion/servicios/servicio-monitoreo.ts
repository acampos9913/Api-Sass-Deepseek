import { Injectable } from '@nestjs/common';

export interface EstadoSalud {
  estado: 'saludable' | 'degradado' | 'critico';
  servicios: Array<{
    nombre: string;
    estado: 'activo' | 'inactivo' | 'degradado';
    tiempoRespuesta?: number;
    ultimaVerificacion: Date;
  }>;
  metricas: {
    usoMemoria: number;
    usoCPU: number;
    conexionesActivas: number;
    tiempoUptime: number;
  };
  timestamp: Date;
}

@Injectable()
export class ServicioMonitoreo {
  async verificarEstadoSalud(): Promise<EstadoSalud> {
    // Verificar estado de la base de datos
    const estadoBaseDatos = await this.verificarBaseDatos();
    
    // Verificar estado de Kafka
    const estadoKafka = await this.verificarKafka();
    
    // Obtener métricas del sistema
    const metricasSistema = await this.obtenerMetricasSistema();

    // Determinar estado general
    const estadoGeneral = this.determinarEstadoGeneral([
      estadoBaseDatos,
      estadoKafka,
    ]);

    return {
      estado: estadoGeneral,
      servicios: [
        estadoBaseDatos,
        estadoKafka,
      ],
      metricas: metricasSistema,
      timestamp: new Date(),
    };
  }

  private async verificarBaseDatos(): Promise<EstadoSalud['servicios'][0]> {
    try {
      const inicio = Date.now();
      // Aquí se implementaría una consulta simple para verificar la base de datos
      // Por ahora simulamos una respuesta exitosa
      await new Promise(resolve => setTimeout(resolve, 10));
      const tiempoRespuesta = Date.now() - inicio;

      return {
        nombre: 'Base de Datos PostgreSQL',
        estado: 'activo',
        tiempoRespuesta,
        ultimaVerificacion: new Date(),
      };
    } catch (error) {
      return {
        nombre: 'Base de Datos PostgreSQL',
        estado: 'inactivo',
        ultimaVerificacion: new Date(),
      };
    }
  }

  private async verificarKafka(): Promise<EstadoSalud['servicios'][0]> {
    try {
      const inicio = Date.now();
      // Aquí se implementaría la verificación de conexión con Kafka
      // Por ahora simulamos una respuesta exitosa
      await new Promise(resolve => setTimeout(resolve, 15));
      const tiempoRespuesta = Date.now() - inicio;

      return {
        nombre: 'Servicio Kafka',
        estado: 'activo',
        tiempoRespuesta,
        ultimaVerificacion: new Date(),
      };
    } catch (error) {
      return {
        nombre: 'Servicio Kafka',
        estado: 'inactivo',
        ultimaVerificacion: new Date(),
      };
    }
  }

  private async obtenerMetricasSistema(): Promise<EstadoSalud['metricas']> {
    const usoMemoria = process.memoryUsage().heapUsed / 1024 / 1024; // MB
    const usoCPU = await this.obtenerUsoCPU();
    const conexionesActivas = await this.obtenerConexionesActivas();
    const tiempoUptime = process.uptime();

    return {
      usoMemoria,
      usoCPU,
      conexionesActivas,
      tiempoUptime,
    };
  }

  private async obtenerUsoCPU(): Promise<number> {
    // Simulación del uso de CPU
    // En producción, usaría una librería como os-utils o similar
    return Math.random() * 100;
  }

  private async obtenerConexionesActivas(): Promise<number> {
    // Simulación de conexiones activas
    // En producción, se obtendría del servidor HTTP
    return Math.floor(Math.random() * 100) + 1;
  }

  private determinarEstadoGeneral(servicios: EstadoSalud['servicios']): EstadoSalud['estado'] {
    const serviciosInactivos = servicios.filter(s => s.estado === 'inactivo').length;
    const serviciosDegradados = servicios.filter(s => s.estado === 'degradado').length;

    if (serviciosInactivos > 0) {
      return 'critico';
    } else if (serviciosDegradados > 0) {
      return 'degradado';
    } else {
      return 'saludable';
    }
  }

  async verificarEstadoAPIsExternas(): Promise<Array<{
    nombre: string;
    estado: 'activo' | 'inactivo' | 'degradado';
    tiempoRespuesta?: number;
    ultimaVerificacion: Date;
  }>> {
    // Lista de APIs externas a verificar
    const apisExternas = [
      { nombre: 'API de Pagos', url: 'https://api.pagos.com/health' },
      { nombre: 'API de Envíos', url: 'https://api.envios.com/health' },
      { nombre: 'API de Notificaciones', url: 'https://api.notificaciones.com/health' },
    ];

    const resultados = await Promise.all(
      apisExternas.map(async (api) => {
        try {
          const inicio = Date.now();
          // En producción, aquí se haría una petición HTTP real
          // Por ahora simulamos una verificación
          await new Promise(resolve => setTimeout(resolve, 20 + Math.random() * 50));
          const tiempoRespuesta = Date.now() - inicio;

          // Simulamos que algunas APIs pueden fallar aleatoriamente
          const estado: 'activo' | 'degradado' = Math.random() > 0.1 ? 'activo' : 'degradado';

          return {
            nombre: api.nombre,
            estado,
            tiempoRespuesta,
            ultimaVerificacion: new Date(),
          };
        } catch (error) {
          return {
            nombre: api.nombre,
            estado: 'inactivo' as const,
            ultimaVerificacion: new Date(),
          };
        }
      })
    );

    return resultados;
  }
}