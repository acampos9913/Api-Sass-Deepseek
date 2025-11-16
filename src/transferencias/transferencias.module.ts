import { Module } from '@nestjs/common';
import { TransferenciasController } from './presentacion/controladores/transferencias.controller';
import { GestionTransferenciasCasoUso } from './dominio/casos-uso/gestion-transferencias.caso-uso';
import { PrismaRepositorioTransferencia } from './infraestructura/repositorios/prisma-repositorio-transferencia';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Módulo de NestJS para la gestión de transferencias de productos
 * Coordina todas las dependencias y proporciona los controladores
 */
@Module({
  controllers: [TransferenciasController],
  providers: [
    GestionTransferenciasCasoUso,
    {
      provide: 'RepositorioTransferencia',
      useClass: PrismaRepositorioTransferencia,
    },
    PrismaService,
  ],
  exports: [GestionTransferenciasCasoUso],
})
export class TransferenciasModule {}