import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PerfilGeneralController } from './presentacion/controladores/perfil-general.controller';
import { ObtenerPerfilCasoUso } from './dominio/casos-uso/obtener-perfil.caso-uso';
import { PrismaRepositorioPerfilGeneral } from './infraestructura/repositorios/prisma-repositorio-perfil-general';
import { ActualizarPerfilCasoUso } from './dominio/casos-uso/actualizar-perfil.caso-uso';
import { SubirFotoPerfilCasoUso } from './dominio/casos-uso/subir-foto-perfil.caso-uso';
import { CambiarCorreoPerfilCasoUso } from './dominio/casos-uso/cambiar-correo-perfil.caso-uso';
import { ActualizarTelefonoPerfilCasoUso } from './dominio/casos-uso/actualizar-telefono-perfil.caso-uso';
import { VincularServicioExternoCasoUso } from './dominio/casos-uso/vincular-servicio-externo.caso-uso';

@Module({
  controllers: [PerfilGeneralController],
  providers: [
    PrismaService,
    {
      provide: 'RepositorioPerfilGeneral',
      useClass: PrismaRepositorioPerfilGeneral,
    },
    ObtenerPerfilCasoUso,
    ActualizarPerfilCasoUso,
    SubirFotoPerfilCasoUso,
    CambiarCorreoPerfilCasoUso,
    ActualizarTelefonoPerfilCasoUso,
    VincularServicioExternoCasoUso,
  ],
  exports: [
    'RepositorioPerfilGeneral',
    ObtenerPerfilCasoUso,
    ActualizarPerfilCasoUso,
  ],
})
export class PerfilGeneralModule {}