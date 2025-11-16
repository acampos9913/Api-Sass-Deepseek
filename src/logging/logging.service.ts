import { Injectable, Logger, LoggerService, Scope } from '@nestjs/common';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

/**
 * Interfaz para el contexto del log con correlación
 */
interface LogContext {
  modulo?: string;
  metodo?: string;
  usuarioId?: string;
  tiendaId?: string;
  ip?: string;
  userAgent?: string;
  duracion?: number;
  correlationId?: string;
  requestId?: string;
  [key: string]: any;
}

/**
 * Servicio de logging avanzado con correlación de solicitudes
 * Implementa logging estructurado para monitoreo distribuido
 */
@Injectable({ scope: Scope.REQUEST })
export class LoggingService implements LoggerService {
  private readonly logger = new Logger('EcommerceTiendanube');
  private correlationId: string;
  private requestId: string;

  /**
   * Establece el ID de correlación para la solicitud actual
   */
  setCorrelationId(id: string): void {
    this.correlationId = id;
  }

  /**
   * Establece el ID de la solicitud actual
   */
  setRequestId(id: string): void {
    this.requestId = id;
  }

  /**
   * Obtiene el ID de correlación actual
   */
  getCorrelationId(): string {
    return this.correlationId;
  }

  /**
   * Obtiene el ID de la solicitud actual
   */
  getRequestId(): string {
    return this.requestId;
  }

  /**
   * Genera un nuevo ID de correlación
   */
  generarCorrelationId(): string {
    return uuidv4();
  }

  /**
   * Log de mensaje de error
   */
  error(message: string, trace?: string, context?: string | LogContext): void {
    const logContext = this.normalizarContexto(context);
    const mensajeFormateado = this.formatearMensaje(message, logContext);
    
    if (trace) {
      this.logger.error(mensajeFormateado, trace);
    } else {
      this.logger.error(mensajeFormateado);
    }
  }

  /**
   * Log de mensaje de advertencia
   */
  warn(message: string, context?: string | LogContext): void {
    const logContext = this.normalizarContexto(context);
    const mensajeFormateado = this.formatearMensaje(message, logContext);
    this.logger.warn(mensajeFormateado);
  }

  /**
   * Log de mensaje informativo
   */
  log(message: string, context?: string | LogContext): void {
    const logContext = this.normalizarContexto(context);
    const mensajeFormateado = this.formatearMensaje(message, logContext);
    this.logger.log(mensajeFormateado);
  }

  /**
   * Log de mensaje de debug
   */
  debug(message: string, context?: string | LogContext): void {
    const logContext = this.normalizarContexto(context);
    const mensajeFormateado = this.formatearMensaje(message, logContext);
    this.logger.debug(mensajeFormateado);
  }

  /**
   * Log de mensaje detallado
   */
  verbose(message: string, context?: string | LogContext): void {
    const logContext = this.normalizarContexto(context);
    const mensajeFormateado = this.formatearMensaje(message, logContext);
    this.logger.verbose(mensajeFormateado);
  }

  /**
   * Log de solicitud HTTP
   */
  logHttpRequest(
    metodo: string,
    url: string,
    estado: number,
    duracion: number,
    contexto: LogContext = {},
  ): void {
    const nivel = this.determinarNivelHttp(estado);
    const mensaje = `${metodo} ${url} ${estado} ${duracion}ms`;
    const mensajeFormateado = this.formatearMensaje(mensaje, {
      ...contexto,
      tipo: 'http',
      metodo,
      url,
      estado,
      duracion,
    });

    if (nivel === 'error') {
      this.logger.error(mensajeFormateado);
    } else if (nivel === 'warn') {
      this.logger.warn(mensajeFormateado);
    } else {
      this.logger.log(mensajeFormateado);
    }
  }

  /**
   * Log de operación de base de datos
   */
  logBaseDatos(
    operacion: string,
    modelo: string,
    duracion: number,
    contexto: LogContext = {},
  ): void {
    const mensaje = `Operación BD: ${operacion} en ${modelo}`;
    const mensajeFormateado = this.formatearMensaje(mensaje, {
      ...contexto,
      tipo: 'database',
      operacion,
      modelo,
      duracion,
    });
    this.logger.log(mensajeFormateado);
  }

  /**
   * Log de métricas de negocio
   */
  logMetrica(
    nombre: string,
    valor: number,
    unidad: string,
    contexto: LogContext = {},
  ): void {
    const mensaje = `Métrica: ${nombre} = ${valor} ${unidad}`;
    const mensajeFormateado = this.formatearMensaje(mensaje, {
      ...contexto,
      tipo: 'metrica',
      nombre,
      valor,
      unidad,
    });
    this.logger.log(mensajeFormateado);
  }

  /**
   * Log de auditoría (para operaciones sensibles)
   */
  logAuditoria(
    accion: string,
    recurso: string,
    usuarioId: string,
    detalles: Record<string, any> = {},
  ): void {
    const mensaje = `Auditoría: ${accion} en ${recurso}`;
    const mensajeFormateado = this.formatearMensaje(mensaje, {
      tipo: 'auditoria',
      accion,
      recurso,
      usuarioId,
      ...detalles,
    });
    this.logger.log(mensajeFormateado);
  }

  /**
   * Log de error de negocio (errores controlados)
   */
  logErrorNegocio(
    codigo: string,
    mensaje: string,
    contexto: LogContext = {},
  ): void {
    const mensajeCompleto = `Error de negocio: ${codigo} - ${mensaje}`;
    const mensajeFormateado = this.formatearMensaje(mensajeCompleto, {
      ...contexto,
      tipo: 'error_negocio',
      codigo,
    });
    this.logger.error(mensajeFormateado);
  }

  /**
   * Obtiene estadísticas de logs recientes (placeholder)
   */
  async obtenerEstadisticas(
    desde: Date,
    hasta: Date = new Date(),
  ): Promise<{
    total: number;
    porNivel: Record<string, number>;
    porTipo: Record<string, number>;
  }> {
    // En una implementación real, esto consultaría una base de datos de logs
    // Por ahora retornamos datos de ejemplo
    return {
      total: 0,
      porNivel: {},
      porTipo: {},
    };
  }

  /**
   * Normaliza el contexto del log
   */
  private normalizarContexto(context?: string | LogContext): LogContext {
    if (!context) {
      return {};
    }

    if (typeof context === 'string') {
      return { modulo: context };
    }

    return context;
  }

  /**
   * Determina el nivel de log basado en el código de estado HTTP
   */
  private determinarNivelHttp(estado: number): string {
    if (estado >= 500) {
      return 'error';
    } else if (estado >= 400) {
      return 'warn';
    } else {
      return 'info';
    }
  }

  /**
   * Log de inicio de solicitud HTTP
   */
  logInicioSolicitud(
    request: Request,
    contextoAdicional: LogContext = {},
  ): void {
    const contexto = this.crearContextoHttp(request);
    const mensaje = `Inicio solicitud: ${request.method} ${request.url}`;
    const mensajeFormateado = this.formatearMensaje(mensaje, {
      ...contexto,
      ...contextoAdicional,
      tipo: 'inicio_solicitud',
    });
    this.logger.log(mensajeFormateado);
  }

  /**
   * Log de finalización de solicitud HTTP
   */
  logFinSolicitud(
    request: Request,
    response: Response,
    contextoAdicional: LogContext = {},
  ): void {
    const contexto = this.crearContextoHttp(request, response);
    const mensaje = `Fin solicitud: ${request.method} ${request.url} ${response.statusCode}`;
    const mensajeFormateado = this.formatearMensaje(mensaje, {
      ...contexto,
      ...contextoAdicional,
      tipo: 'fin_solicitud',
    });
    
    const nivel = this.determinarNivelHttp(response.statusCode);
    if (nivel === 'error') {
      this.logger.error(mensajeFormateado);
    } else if (nivel === 'warn') {
      this.logger.warn(mensajeFormateado);
    } else {
      this.logger.log(mensajeFormateado);
    }
  }

  /**
   * Log de métricas de rendimiento
   */
  logMetricaRendimiento(
    nombre: string,
    valor: number,
    unidad: string,
    umbralAlerta?: number,
    contexto: LogContext = {},
  ): void {
    const nivel = umbralAlerta && valor > umbralAlerta ? 'warn' : 'log';
    const mensaje = `Métrica rendimiento: ${nombre} = ${valor} ${unidad}`;
    const mensajeFormateado = this.formatearMensaje(mensaje, {
      ...contexto,
      tipo: 'metrica_rendimiento',
      nombre,
      valor,
      unidad,
      umbralAlerta,
    });

    if (nivel === 'warn') {
      this.logger.warn(mensajeFormateado);
    } else {
      this.logger.log(mensajeFormateado);
    }
  }

  /**
   * Log de eventos de negocio
   */
  logEventoNegocio(
    evento: string,
    entidad: string,
    entidadId: string,
    accion: string,
    detalles: Record<string, any> = {},
    contexto: LogContext = {},
  ): void {
    const mensaje = `Evento negocio: ${evento} - ${entidad}(${entidadId}) - ${accion}`;
    const mensajeFormateado = this.formatearMensaje(mensaje, {
      ...contexto,
      tipo: 'evento_negocio',
      evento,
      entidad,
      entidadId,
      accion,
      ...detalles,
    });
    this.logger.log(mensajeFormateado);
  }

  /**
   * Log de consulta a base de datos
   */
  logConsultaBaseDatos(
    operacion: string,
    modelo: string,
    duracion: number,
    filtros?: Record<string, any>,
    contexto: LogContext = {},
  ): void {
    const mensaje = `Consulta BD: ${operacion} en ${modelo}`;
    const mensajeFormateado = this.formatearMensaje(mensaje, {
      ...contexto,
      tipo: 'consulta_bd',
      operacion,
      modelo,
      duracion,
      filtros: filtros ? JSON.stringify(filtros) : undefined,
    });

    // Alertar si la consulta es lenta
    if (duracion > 1000) { // Más de 1 segundo
      this.logger.warn(mensajeFormateado);
    } else {
      this.logger.log(mensajeFormateado);
    }
  }

  /**
   * Formatea el mensaje con el contexto
   */
  private formatearMensaje(mensaje: string, contexto: LogContext): string {
    // Añadir correlación y request ID si están disponibles
    const contextoCompleto = {
      correlationId: this.correlationId,
      requestId: this.requestId,
      ...contexto,
    };

    const partesContexto = Object.entries(contextoCompleto)
      .filter(([key, value]) =>
        key !== 'modulo' &&
        value !== undefined &&
        value !== null &&
        key !== 'correlationId' && // Ya incluido en el formato
        key !== 'requestId' // Ya incluido en el formato
      )
      .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
      .join(' ');

    const modulo = contexto.modulo ? `[${contexto.modulo}]` : '';
    const correlacion = this.correlationId ? `[corr:${this.correlationId}]` : '';
    const solicitud = this.requestId ? `[req:${this.requestId}]` : '';

    return `${modulo}${correlacion}${solicitud} ${mensaje} ${partesContexto}`.trim();
  }

  /**
   * Crea un contexto de log para una solicitud HTTP
   */
  crearContextoHttp(
    request: Request,
    respuesta?: Response,
  ): LogContext {
    const contexto: LogContext = {
      modulo: 'http',
      ip: this.obtenerIP(request),
      userAgent: request.headers?.['user-agent'],
      metodo: request.method,
      url: request.url,
      correlationId: this.correlationId,
      requestId: this.requestId,
    };

    // Extraer información del usuario si está autenticado
    if ((request as any).user?.id) {
      contexto.usuarioId = (request as any).user.id;
    }

    // Extraer información de la tienda si está disponible
    if ((request as any).tiendaId) {
      contexto.tiendaId = (request as any).tiendaId;
    }

    // Extraer headers de correlación si existen
    const correlationIdHeader = request.headers['x-correlation-id'];
    if (correlationIdHeader && !this.correlationId) {
      this.correlationId = Array.isArray(correlationIdHeader)
        ? correlationIdHeader[0]
        : correlationIdHeader;
    }

    const requestIdHeader = request.headers['x-request-id'];
    if (requestIdHeader && !this.requestId) {
      this.requestId = Array.isArray(requestIdHeader)
        ? requestIdHeader[0]
        : requestIdHeader;
    }

    // Si no hay IDs, generarlos
    if (!this.correlationId) {
      this.correlationId = this.generarCorrelationId();
    }
    if (!this.requestId) {
      this.requestId = uuidv4();
    }

    // Información de la respuesta
    if (respuesta) {
      contexto.estado = respuesta.statusCode;
      contexto.duracion = Date.now() - ((request as any)._startTime || Date.now());
    }

    return contexto;
  }

  /**
   * Obtiene la IP real del cliente considerando proxies
   */
  private obtenerIP(request: Request): string {
    return (request.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
           request.ip ||
           request.connection?.remoteAddress ||
           'Desconocida';
  }
}