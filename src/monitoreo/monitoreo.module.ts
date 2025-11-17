import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { MonitoreoController } from './presentacion/controladores/monitoreo.controller';
import { ServicioMetricas } from './aplicacion/servicios/servicio-metricas';
import { RepositorioMetricas } from './dominio/interfaces/repositorio-metricas.interface';
import { PrismaRepositorioMetricas } from './infraestructura/repositorios/prisma-repositorio-metricas';
import { PrismaClient } from '@prisma/client';
import { MetricasMiddleware } from './infraestructura/middleware/metricas.middleware';
import { ServicioMonitoreo } from './aplicacion/servicios/servicio-monitoreo';

@Module({
  controllers: [MonitoreoController],
  providers: [
    ServicioMetricas,
    ServicioMonitoreo,
    {
      provide: 'RepositorioMetricas',
      useClass: PrismaRepositorioMetricas,
    },
    {
      provide: PrismaClient,
      useValue: new PrismaClient(),
    },
    MetricasMiddleware,
  ],
  exports: [ServicioMetricas, ServicioMonitoreo, MetricasMiddleware],
})
export class MonitoreoModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(MetricasMiddleware)
      .forRoutes('*');
  }
}