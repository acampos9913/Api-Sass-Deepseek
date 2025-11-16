import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { ExcepcionDominio } from '../comun/excepciones/excepcion-dominio';
import { LoggingService } from '../logging/logging.service';

/**
 * Interfaz para la respuesta estándar de error
 */
interface RespuestaError {
  mensaje: string;
  data: any;
  tipo_mensaje: string;
  estado_respuesta: number;
}

/**
 * Filtro global de excepciones que maneja todos los errores de la aplicación
 * Sigue el estándar de respuesta definido en las reglas de codificación
 * Utiliza el servicio de logging estructurado para mejor trazabilidad
 */
@Catch()
export class ExcepcionGlobalFiltro implements ExceptionFilter {
  constructor(
    private readonly configService: ConfigService,
    @Inject(LoggingService)
    private readonly loggingService: LoggingService,
  ) {}

  catch(excepcion: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Determinar el estado HTTP y el tipo de mensaje
    let estadoHttp: number;
    let estadoRespuesta: number;
    let mensaje: string;
    let tipoMensaje: string;
    let datosError: any = null;

    const esDesarrollo = this.configService.get('NODE_ENV') === 'development';
    const correlationId = this.loggingService.getCorrelationId();
    const requestId = this.loggingService.getRequestId();

    // Manejar excepciones de dominio personalizadas
    if (excepcion instanceof ExcepcionDominio) {
      // Determinar si es error de cliente (4xx) o servidor (5xx)
      const esErrorCliente = excepcion.codigoEstado >= 400 && excepcion.codigoEstado < 500;
      
      estadoHttp = esErrorCliente ? 200 : excepcion.codigoEstado;
      estadoRespuesta = excepcion.codigoEstado;
      tipoMensaje = excepcion.tipoMensaje;
      mensaje = excepcion.message;
      
      // Incluir detalles del error solo en desarrollo
      if (esDesarrollo) {
        datosError = {
          stack: excepcion.stack,
          path: request.url,
          metodo: request.method,
          tipo_error: esErrorCliente ? 'ErrorCliente' : 'ErrorServidor',
          correlationId,
          requestId,
        };
      } else if (esErrorCliente) {
        // En producción, solo incluir detalles básicos para errores de cliente
        datosError = {
          path: request.url,
          metodo: request.method,
          correlationId,
          requestId,
        };
      } else {
        // En producción, ocultar detalles de errores de servidor
        mensaje = 'Error interno del servidor. Por favor, contacte a soporte.';
        datosError = null;
      }

      // Log estructurado del error
      this.loggingService.logErrorNegocio(
        tipoMensaje,
        mensaje,
        {
          modulo: 'ExcepcionGlobalFiltro',
          correlationId,
          requestId,
          url: request.url,
          metodo: request.method,
          estado: estadoRespuesta,
          tipoError: esErrorCliente ? 'ErrorCliente' : 'ErrorServidor',
        }
      );
    }
    // Manejar excepciones HTTP conocidas
    else if (excepcion instanceof HttpException) {
      estadoHttp = excepcion.getStatus();
      estadoRespuesta = excepcion.getStatus();
      
      // Determinar si es error de cliente o servidor
      if (estadoHttp >= 400 && estadoHttp < 500) {
        tipoMensaje = 'ErrorCliente';
        // Para errores de cliente, siempre responder con HTTP 200
        estadoHttp = 200;
      } else {
        tipoMensaje = 'ErrorServidor';
      }

      const respuestaExcepcion = excepcion.getResponse();
      
      if (typeof respuestaExcepcion === 'string') {
        mensaje = respuestaExcepcion;
      } else {
        const respuesta = respuestaExcepcion as any;
        mensaje = respuesta.message || 'Error interno del servidor';
        
        // Extraer tipo_mensaje personalizado si existe
        if (respuesta.tipo_mensaje) {
          tipoMensaje = respuesta.tipo_mensaje;
        }
        
        // En desarrollo, incluir detalles del error
        if (esDesarrollo) {
          datosError = {
            error: respuesta.error,
            stack: excepcion.stack,
            path: request.url,
            metodo: request.method,
            correlationId,
            requestId,
          };
        }
      }

      // Log estructurado del error HTTP
      this.loggingService.error(
        `Excepción HTTP: ${mensaje}`,
        excepcion.stack,
        {
          modulo: 'ExcepcionGlobalFiltro',
          correlationId,
          requestId,
          url: request.url,
          metodo: request.method,
          estado: estadoRespuesta,
          tipoExcepcion: 'HttpException',
        }
      );
    } else {
      // Manejar errores desconocidos (errores del servidor)
      estadoHttp = 500;
      estadoRespuesta = 500;
      tipoMensaje = 'ErrorServidor';
      
      // En desarrollo, mostrar detalles completos
      if (esDesarrollo) {
        mensaje = (excepcion as Error)?.message || 'Error interno del servidor';
        datosError = {
          error: (excepcion as Error)?.message,
          stack: (excepcion as Error)?.stack,
          path: request.url,
          metodo: request.method,
          tipo_error: 'ErrorServidor',
          correlationId,
          requestId,
        };
      } else {
        // En producción, ocultar detalles de errores de servidor
        mensaje = 'Error interno del servidor. Por favor, contacte a soporte.';
        datosError = null;
      }

      // Log estructurado del error no manejado
      this.loggingService.error(
        `Error no manejado: ${mensaje}`,
        (excepcion as Error)?.stack,
        {
          modulo: 'ExcepcionGlobalFiltro',
          correlationId,
          requestId,
          url: request.url,
          metodo: request.method,
          estado: estadoRespuesta,
          tipoExcepcion: 'ErrorNoManejado',
        }
      );
    }

    // Construir respuesta estándar
    const respuestaError: RespuestaError = {
      mensaje,
      data: datosError,
      tipo_mensaje: tipoMensaje,
      estado_respuesta: estadoRespuesta,
    };

    // Enviar respuesta con headers de correlación
    response.setHeader('X-Correlation-Id', correlationId);
    response.setHeader('X-Request-Id', requestId);
    response.status(estadoHttp).json(respuestaError);
  }
}