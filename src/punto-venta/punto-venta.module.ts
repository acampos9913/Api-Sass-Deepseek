import { Module } from '@nestjs/common';
import { CajasController } from './presentacion/controladores/cajas.controller';
import { CajasService } from './aplicacion/servicios/cajas.service';
import { CrearCajaCasoUso } from './dominio/casos-uso/crear-caja.caso-uso';
import { PrismaRepositorioCaja } from './infraestructura/repositorios/prisma-repositorio-caja';

/**
 * Módulo de Punto de Venta (POS)
 * 
 * Este módulo gestiona todas las operaciones relacionadas con el punto de venta:
 * - Gestión de cajas (creación, apertura, cierre, operaciones)
 * - Tickets de venta
 * - Operaciones en tiempo real
 * - Reportes de cierre
 * 
 * Arquitectura:
 * - Presentación: Controladores que manejan las peticiones HTTP
 * - Aplicación: Servicios que orquestan los casos de uso
 * - Dominio: Casos de uso y entidades con lógica de negocio
 * - Infraestructura: Repositorios que acceden a la base de datos
 */
@Module({
  controllers: [CajasController],
  providers: [
    CajasService,
    CrearCajaCasoUso,
    {
      provide: 'RepositorioCaja',
      useClass: PrismaRepositorioCaja,
    },
  ],
  exports: [
    CajasService,
    'RepositorioCaja',
  ],
})
export class PuntoVentaModule {}