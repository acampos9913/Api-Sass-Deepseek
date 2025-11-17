import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { LoggingService } from '../logging.service';

/**
 * Middleware de logging para capturar automáticamente todas las solicitudes HTTP
 * Registra información de entrada y salida con correlación de solicitudes
 */
@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  constructor(private readonly loggingService: LoggingService) {}

  use(request: Request, response: Response, next: NextFunction) {
    // Registrar inicio de la solicitud
    this.loggingService.logInicioSolicitud(request);

    // Establecer tiempo de inicio para calcular duración
    (request as any)._startTime = Date.now();

    // Interceptar el evento 'finish' de la respuesta para registrar finalización
    response.on('finish', () => {
      const duracion = Date.now() - (request as any)._startTime;
      
      this.loggingService.logFinSolicitud(request, response, {
        duracion,
      });
    });

    // Interceptar el evento 'error' de la respuesta
    response.on('error', (error) => {
      this.loggingService.error(
        `Error en solicitud: ${request.method} ${request.url}`,
        error.stack,
        {
          modulo: 'middleware',
          metodo: request.method,
          url: request.url,
          ip: this.loggingService['obtenerIP'](request),
        }
      );
    });

    next();
  }
}