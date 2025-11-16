import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CasosUsoPlan } from './aplicacion/casos-uso/casos-uso-plan';
import { ControladorPlan } from './presentacion/controladores/controlador-plan';
import { PrismaRepositorioPlan } from './infraestructura/repositorios/prisma-repositorio-plan';
import { RepositorioPlan } from './dominio/interfaces/repositorio-plan.interface';

/**
 * Módulo de Planes
 * Gestiona la suscripción y administración de planes para las tiendas
 */
@Module({
  imports: [],
  controllers: [ControladorPlan],
  providers: [
    PrismaService,
    CasosUsoPlan,
    {
      provide: 'REPOSITORIO_PLAN',
      useClass: PrismaRepositorioPlan,
    },
  ],
  exports: [CasosUsoPlan],
})
export class PlanesModule {}