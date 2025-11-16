import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { InventarioController } from './presentacion/controladores/inventario.controller';
import { RegistrarMovimientoInventarioCasoUso } from './dominio/casos-uso/registrar-movimiento-inventario.caso-uso';
import { ListarMovimientosInventarioCasoUso } from './dominio/casos-uso/listar-movimientos-inventario.caso-uso';
import { PrismaRepositorioMovimientoInventario } from './infraestructura/repositorios/prisma-repositorio-movimiento-inventario';

/**
 * Módulo de Inventario para la gestión de movimientos de inventario en el sistema
 * Sigue la arquitectura limpia con separación de capas
 */
@Module({
  controllers: [InventarioController],
  providers: [
    // Casos de uso
    RegistrarMovimientoInventarioCasoUso,
    ListarMovimientosInventarioCasoUso,
    
    // Repositorio
    {
      provide: 'RepositorioMovimientoInventario',
      useClass: PrismaRepositorioMovimientoInventario,
    },
    
    // Cliente de Prisma
    {
      provide: PrismaClient,
      useValue: new PrismaClient(),
    },
  ],
  exports: [
    RegistrarMovimientoInventarioCasoUso,
    ListarMovimientosInventarioCasoUso,
  ],
})
export class InventarioModule {}