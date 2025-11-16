import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { DescuentosController } from './presentacion/controladores/descuentos.controller';
import { CrearDescuentoCasoUso } from './dominio/casos-uso/crear-descuento.caso-uso';
import { ListarDescuentosCasoUso } from './dominio/casos-uso/listar-descuentos.caso-uso';
import { PrismaRepositorioDescuento } from './infraestructura/repositorios/prisma-repositorio-descuento';

/**
 * Módulo de Descuentos para la gestión de descuentos y promociones en el sistema
 * Sigue la arquitectura limpia con separación de capas
 */
@Module({
  controllers: [DescuentosController],
  providers: [
    // Casos de uso
    CrearDescuentoCasoUso,
    ListarDescuentosCasoUso,
    
    // Repositorio
    {
      provide: 'RepositorioDescuento',
      useClass: PrismaRepositorioDescuento,
    },
    
    // Cliente de Prisma
    {
      provide: PrismaClient,
      useValue: new PrismaClient(),
    },
  ],
  exports: [CrearDescuentoCasoUso, ListarDescuentosCasoUso],
})
export class DescuentosModule {}