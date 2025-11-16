import { Module } from '@nestjs/common';
import { ControladorCreditos } from './presentacion/controladores/controlador-creditos';
import { ServicioCreditosTienda } from './aplicacion/servicios/servicio-creditos-tienda';
import { PrismaRepositorioCreditoTienda } from './infraestructura/repositorios/prisma-repositorio-credito-tienda';
import { StripeService } from './infraestructura/servicios/stripe.service';
import { VerificacionCreditosGuard } from './aplicacion/guardias/verificacion-creditos.guard';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [],
  controllers: [ControladorCreditos],
  providers: [
    ServicioCreditosTienda,
    PrismaRepositorioCreditoTienda,
    StripeService,
    VerificacionCreditosGuard,
    PrismaService,
    {
      provide: 'RepositorioCreditoTienda',
      useClass: PrismaRepositorioCreditoTienda,
    },
  ],
  exports: [ServicioCreditosTienda, StripeService, VerificacionCreditosGuard],
})
export class CreditosModule {}