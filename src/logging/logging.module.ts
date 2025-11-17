import { Module, MiddlewareConsumer, NestModule, Global } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingService } from './logging.service';
import { LoggingMiddleware } from './middleware/logging.middleware';
import { LoggingInterceptor } from './interceptores/logging.interceptor';
import { ServicioAgregacionLogs } from './infraestructura/servicios/servicio-agregacion-logs';

@Global()
@Module({
  providers: [
    LoggingService,
    ServicioAgregacionLogs,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
  exports: [LoggingService, ServicioAgregacionLogs],
})
export class LoggingModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Aplicar el middleware de logging a todas las rutas
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}