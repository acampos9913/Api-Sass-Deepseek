import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { LoggingService } from '../logging.service';

/**
 * Interceptor para capturar automáticamente logs de todas las solicitudes HTTP
 * Registra información de entrada, salida y errores con correlación de solicitudes
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly loggingService: LoggingService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const { method, url, body, query, params } = request;

    // Establecer tiempo de inicio
    const inicio = Date.now();

    // Log de inicio de procesamiento
    this.loggingService.log('Inicio procesamiento solicitud', {
      modulo: 'interceptor',
      metodo: method,
      url,
      cuerpo: this.sanitizarCuerpo(body),
      query,
      params,
    });

    return next.handle().pipe(
      tap((data) => {
        const duracion = Date.now() - inicio;
        
        // Log de éxito
        this.loggingService.log('Solicitud procesada exitosamente', {
          modulo: 'interceptor',
          metodo: method,
          url,
          estado: response.statusCode,
          duracion,
          tamanoRespuesta: this.calcularTamanoRespuesta(data),
        });
      }),
      catchError((error) => {
        const duracion = Date.now() - inicio;
        const estado = this.obtenerEstadoError(error);

        // Log de error
        this.loggingService.error(
          `Error procesando solicitud: ${method} ${url}`,
          error.stack,
          {
            modulo: 'interceptor',
            metodo: method,
            url,
            estado,
            duracion,
            tipoError: error.constructor.name,
            mensajeError: error.message,
            cuerpo: this.sanitizarCuerpo(body),
            query,
            params,
          }
        );

        return throwError(() => error);
      })
    );
  }

  /**
   * Sanitiza el cuerpo de la solicitud para no registrar datos sensibles
   */
  private sanitizarCuerpo(cuerpo: any): any {
    if (!cuerpo || typeof cuerpo !== 'object') {
      return cuerpo;
    }

    const sanitizado = { ...cuerpo };

    // Lista de campos sensibles que no deben registrarse
    const camposSensibles = [
      'contrasena',
      'password',
      'contrasenaActual',
      'nuevaContrasena',
      'confirmarContrasena',
      'token',
      'accessToken',
      'refreshToken',
      'apiKey',
      'secret',
      'clave',
      'pin',
      'cvv',
      'numeroTarjeta',
      'fechaExpiracion',
    ];

    camposSensibles.forEach(campo => {
      if (sanitizado[campo] !== undefined) {
        sanitizado[campo] = '***SENSIBLE***';
      }
    });

    return sanitizado;
  }

  /**
   * Calcula el tamaño aproximado de la respuesta
   */
  private calcularTamanoRespuesta(data: any): string {
    if (!data) return '0B';

    try {
      const jsonString = JSON.stringify(data);
      const bytes = new Blob([jsonString]).size;
      
      if (bytes < 1024) return `${bytes}B`;
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)}KB`;
      return `${(bytes / (1024 * 1024)).toFixed(2)}MB`;
    } catch {
      return 'Desconocido';
    }
  }

  /**
   * Obtiene el código de estado HTTP del error
   */
  private obtenerEstadoError(error: any): number {
    if (error instanceof HttpException) {
      return error.getStatus();
    }
    
    if (error.status) {
      return error.status;
    }

    return HttpStatus.INTERNAL_SERVER_ERROR;
  }
}