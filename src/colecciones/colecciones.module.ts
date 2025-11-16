import { Module } from '@nestjs/common';
import { ColeccionesController } from './presentacion/controladores/colecciones.controller';
import { GestionColeccionesCasoUso } from './dominio/casos-uso/gestion-colecciones.caso-uso';
import { PrismaRepositorioColeccion } from './infraestructura/repositorios/prisma-repositorio-coleccion';

/**
 * Módulo de NestJS para la gestión de colecciones de productos
 * Coordina todas las dependencias y proporciona los controladores
 */
@Module({
  controllers: [ColeccionesController],
  providers: [
    GestionColeccionesCasoUso,
    {
      provide: 'RepositorioColeccion',
      useClass: PrismaRepositorioColeccion,
    },
  ],
  exports: [GestionColeccionesCasoUso],
})
export class ColeccionesModule {}