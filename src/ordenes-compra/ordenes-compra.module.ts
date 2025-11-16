import { Module } from '@nestjs/common';
import { OrdenesCompraController } from './presentacion/controladores/ordenes-compra.controller';
import { GestionOrdenesCompraCasoUso } from './dominio/casos-uso/gestion-ordenes-compra.caso-uso';
import { PrismaRepositorioOrdenCompra } from './infraestructura/repositorios/prisma-repositorio-orden-compra';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Módulo de NestJS para la gestión de órdenes de compra
 * Coordina todas las dependencias y proporciona los controladores
 */
@Module({
  controllers: [OrdenesCompraController],
  providers: [
    GestionOrdenesCompraCasoUso,
    {
      provide: 'RepositorioOrdenCompra',
      useClass: PrismaRepositorioOrdenCompra,
    },
    PrismaService,
  ],
  exports: [GestionOrdenesCompraCasoUso],
})
export class OrdenesCompraModule {}