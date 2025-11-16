import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ReportesController } from './presentacion/controladores/reportes.controller';
import { GenerarReporteCasoUso } from './dominio/casos-uso/generar-reporte.caso-uso';
import { PrismaRepositorioReporte } from './infraestructura/repositorios/prisma-repositorio-reporte';

/**
 * Módulo de Reportes para la gestión de analíticas y reportes en el sistema
 * Sigue la arquitectura limpia con separación de capas
 */
@Module({
  controllers: [ReportesController],
  providers: [
    // Casos de uso
    GenerarReporteCasoUso,
    
    // Repositorio
    {
      provide: 'RepositorioReporte',
      useClass: PrismaRepositorioReporte,
    },
    
    // Repositorios de otros módulos (inyectados por tokens)
    {
      provide: 'RepositorioOrden',
      useValue: null, // Se inyectará desde el módulo de órdenes
    },
    {
      provide: 'RepositorioProducto',
      useValue: null, // Se inyectará desde el módulo de productos
    },
    {
      provide: 'RepositorioCliente',
      useValue: null, // Se inyectará desde el módulo de clientes
    },
    {
      provide: 'RepositorioDescuento',
      useValue: null, // Se inyectará desde el módulo de descuentos
    },
    
    // Cliente de Prisma
    {
      provide: PrismaClient,
      useValue: new PrismaClient(),
    },
  ],
  exports: [GenerarReporteCasoUso],
})
export class ReportesModule {}