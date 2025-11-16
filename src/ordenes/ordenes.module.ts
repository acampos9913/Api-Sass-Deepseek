import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { OrdenesController } from './presentacion/controladores/ordenes.controller';
import { CrearOrdenCasoUso } from './dominio/casos-uso/crear-orden.caso-uso';
import { ListarOrdenesCasoUso } from './dominio/casos-uso/listar-ordenes.caso-uso';
import { GestionAvanzadaOrdenesCasoUso } from './dominio/casos-uso/gestion-avanzada-ordenes.caso-uso';
import { PrismaRepositorioOrden } from './infraestructura/repositorios/prisma-repositorio-orden';

/**
 * Módulo de Órdenes para el sistema ecommerce Tiendanube
 * Sigue la arquitectura limpia y convenciones en español
 */
@Module({
  imports: [],
  controllers: [OrdenesController],
  providers: [
    CrearOrdenCasoUso,
    ListarOrdenesCasoUso,
    GestionAvanzadaOrdenesCasoUso,
    {
      provide: 'RepositorioOrden',
      useClass: PrismaRepositorioOrden,
    },
    {
      provide: 'RepositorioCliente',
      useValue: null, // Placeholder - en producción se inyectaría el repositorio real de clientes
    },
    {
      provide: PrismaClient,
      useValue: new PrismaClient(),
    },
  ],
  exports: [CrearOrdenCasoUso, ListarOrdenesCasoUso, GestionAvanzadaOrdenesCasoUso],
})
export class OrdenesModule {}