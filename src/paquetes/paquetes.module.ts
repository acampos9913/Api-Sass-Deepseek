import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PaquetesController } from './presentacion/controladores/paquetes.controller';
import { CrearPaqueteCasoUso } from './dominio/casos-uso/crear-paquete.caso-uso';
import { ListarPaquetesCasoUso } from './dominio/casos-uso/listar-paquetes.caso-uso';
import { PrismaRepositorioPaquete } from './infraestructura/repositorios/prisma-repositorio-paquete';

/**
 * Módulo de Paquetes para la gestión de paquetes/combos de productos en el sistema
 * Sigue la arquitectura limpia con separación de capas
 */
@Module({
  controllers: [PaquetesController],
  providers: [
    // Casos de uso
    CrearPaqueteCasoUso,
    ListarPaquetesCasoUso,
    
    // Repositorio
    {
      provide: 'RepositorioPaquete',
      useClass: PrismaRepositorioPaquete,
    },
    
    // Cliente de Prisma
    {
      provide: PrismaClient,
      useValue: new PrismaClient(),
    },
  ],
  exports: [CrearPaqueteCasoUso, ListarPaquetesCasoUso],
})
export class PaquetesModule {}