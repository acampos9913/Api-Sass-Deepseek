import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaRepositorioUsuario } from '../autenticacion/infraestructura/repositorios/prisma-repositorio-usuario';
import { PrismaRepositorioTokenRecuperacionContrasena } from './infraestructura/repositorios/prisma-repositorio-token-recuperacion-contrasena';
import { ServicioJwt } from '../comun/infraestructura/servicios/servicio-jwt';
import { ServicioHashing } from '../comun/infraestructura/servicios/servicio-hashing';
import { AdminController } from './presentacion/controladores/admin.controller';
import { IniciarSesionAdminCasoUso } from './dominio/casos-uso/iniciar-sesion-admin.caso-uso';
import { RegistrarAdminCasoUso } from './dominio/casos-uso/registrar-admin.caso-uso';
import { SolicitarRecuperacionContrasenaCasoUso } from './dominio/casos-uso/solicitar-recuperacion-contrasena.caso-uso';
import { VerificarCodigoRecuperacionCasoUso } from './dominio/casos-uso/verificar-codigo-recuperacion.caso-uso';
import { RestablecerContrasenaCasoUso } from './dominio/casos-uso/restablecer-contrasena.caso-uso';

/**
 * Módulo de Admin para la gestión de autenticación y recuperación de contraseña
 * Integra todos los componentes del módulo Admin siguiendo la Arquitectura Limpia
 */
@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'clave-secreta-temporal-para-desarrollo',
      signOptions: {
        issuer: 'ecommerce-saas',
        audience: 'ecommerce-admin',
      },
    }),
  ],
  controllers: [AdminController],
  providers: [
    PrismaService,
    {
      provide: 'RepositorioUsuario',
      useClass: PrismaRepositorioUsuario,
    },
    {
      provide: 'RepositorioTokenRecuperacionContrasena',
      useClass: PrismaRepositorioTokenRecuperacionContrasena,
    },
    ServicioJwt,
    ServicioHashing,
    IniciarSesionAdminCasoUso,
    RegistrarAdminCasoUso,
    SolicitarRecuperacionContrasenaCasoUso,
    VerificarCodigoRecuperacionCasoUso,
    RestablecerContrasenaCasoUso,
  ],
  exports: [
    IniciarSesionAdminCasoUso,
    RegistrarAdminCasoUso,
    SolicitarRecuperacionContrasenaCasoUso,
    VerificarCodigoRecuperacionCasoUso,
    RestablecerContrasenaCasoUso,
    ServicioJwt,
    ServicioHashing,
  ],
})
export class AdminModule {}