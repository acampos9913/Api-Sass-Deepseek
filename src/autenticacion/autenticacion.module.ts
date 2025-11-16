import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AutenticacionController } from './presentacion/controladores/autenticacion.controller';
import { AutenticarUsuarioCasoUso } from './dominio/casos-uso/autenticar-usuario.caso-uso';
import { PrismaRepositorioUsuario } from './infraestructura/repositorios/prisma-repositorio-usuario';
import { PrismaClient } from '@prisma/client';

/**
 * Módulo de Autenticación para el sistema ecommerce Tiendanube
 * Sigue la arquitectura limpia y convenciones en español
 */
@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'clave-secreta-temporal',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [AutenticacionController],
  providers: [
    AutenticarUsuarioCasoUso,
    {
      provide: 'RepositorioUsuario',
      useClass: PrismaRepositorioUsuario,
    },
    {
      provide: PrismaClient,
      useValue: new PrismaClient(),
    },
  ],
  exports: [AutenticarUsuarioCasoUso, JwtModule],
})
export class AutenticacionModule {}