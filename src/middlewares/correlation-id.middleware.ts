import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { LoggingService } from '../logging/logging.service';

/**
 * Middleware para manejar IDs de correlación en solicitudes HTTP
 * Asegura que cada solicitud tenga un ID único para seguimiento distribuido
 */
@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  constructor(private readonly loggingService: LoggingService) {}

  use(request: Request, response: Response, next: NextFunction): void {
    // Establecer el tiempo de inicio de la solicitud
    (request as any)._startTime = Date.now();

    // Obtener o generar el ID de correlación
    const correlationId = 
      (request.headers['x-correlation-id'] as string) || 
      this.loggingService.generarCorrelationId();
    
    // Obtener o generar el ID de solicitud
    const requestId = 
      (request.headers['x-request-id'] as string) || 
      this.loggingService.generarCorrelationId();

    // Establecer los IDs en el servicio de logging
    this.loggingService.setCorrelationId(correlationId);
    this.loggingService.setRequestId(requestId);

    // Agregar los IDs a los headers de respuesta
    response.setHeader('X-Correlation-Id', correlationId);
    response.setHeader('X-Request-Id', requestId);

    // Log del inicio de la solicitud
    this.loggingService.logInicioSolicitud(request, {
      correlationId,
      requestId,
    });

    // Configurar listener para el evento de finalización de la respuesta
    response.on('finish', () => {
      this.loggingService.logFinSolicitud(request, response, {
        correlationId,
        requestId,
      });
    });

    next();
  }
}