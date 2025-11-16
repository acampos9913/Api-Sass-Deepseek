import { Module } from '@nestjs/common';
import { ControladorNotificaciones } from './presentacion/controladores/controlador-notificaciones';
import { GestionNotificacionesCasoUso } from './dominio/casos-uso/gestion-notificaciones.caso-uso';
import { PrismaRepositorioConfiguracionNotificaciones } from './infraestructura/repositorios/prisma-repositorio-configuracion-notificaciones';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Módulo de configuración de notificaciones
 * 
 * Este módulo proporciona funcionalidades para gestionar la configuración
 * de notificaciones de la tienda, incluyendo:
 * - Configuración de email del remitente
 * - Notificaciones a clientes (40+ tipos)
 * - Notificaciones a empleados
 * - Webhooks (100+ eventos)
 * - Gestión de destinatarios
 */
@Module({
  imports: [],
  controllers: [ControladorNotificaciones],
  providers: [
    GestionNotificacionesCasoUso,
    PrismaService,
    {
      provide: 'RepositorioConfiguracionNotificaciones',
      useClass: PrismaRepositorioConfiguracionNotificaciones,
    },
  ],
  exports: [
    GestionNotificacionesCasoUso,
    'RepositorioConfiguracionNotificaciones',
  ],
})
export class ConfiguracionNotificacionesModule {}