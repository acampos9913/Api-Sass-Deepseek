import { Module } from '@nestjs/common';
import { TarjetasRegaloController } from './presentacion/controladores/tarjetas-regalo.controller';
import { GestionTarjetasRegaloCasoUso } from './dominio/casos-uso/gestion-tarjetas-regalo.caso-uso';
import { PrismaRepositorioTarjetaRegalo } from './infraestructura/repositorios/prisma-repositorio-tarjeta-regalo';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Módulo de NestJS para la gestión de tarjetas de regalo
 * Coordina todas las dependencias y proporciona los controladores
 */
@Module({
  controllers: [TarjetasRegaloController],
  providers: [
    GestionTarjetasRegaloCasoUso,
    {
      provide: 'RepositorioTarjetaRegalo',
      useClass: PrismaRepositorioTarjetaRegalo,
    },
    PrismaService,
  ],
  exports: [GestionTarjetasRegaloCasoUso],
})
export class TarjetasRegaloModule {}