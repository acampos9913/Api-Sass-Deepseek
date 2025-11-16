/**
 * Módulo de Envíos
 * Configura las dependencias y proveedores para la gestión de envíos
 * Sigue los principios de la Arquitectura Limpia
 */
import { Module } from '@nestjs/common';
import { EnviosController } from './presentacion/controladores/envios.controller';
import { CrearEnvioCasoUso } from './dominio/casos-uso/crear-envio.caso-uso';
import { ListarEnviosCasoUso } from './dominio/casos-uso/listar-envios.caso-uso';
import { PrismaRepositorioEnvio } from './infraestructura/repositorios/prisma-repositorio-envio';

@Module({
  controllers: [EnviosController],
  providers: [
    CrearEnvioCasoUso,
    ListarEnviosCasoUso,
    {
      provide: 'RepositorioEnvio',
      useClass: PrismaRepositorioEnvio,
    },
  ],
  exports: [
    CrearEnvioCasoUso,
    ListarEnviosCasoUso,
  ],
})
export class EnviosModule {}