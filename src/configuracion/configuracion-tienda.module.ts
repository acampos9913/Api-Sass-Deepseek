import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ControladorConfiguracionTienda } from './presentacion/controladores/controlador-configuracion-tienda';
import { CrearConfiguracionTiendaCasoUso } from './dominio/casos-uso/crear-configuracion-tienda.caso-uso';
import { PrismaRepositorioConfiguracionTienda } from './infraestructura/repositorios/prisma-repositorio-configuracion-tienda';
import { RepositorioConfiguracionTienda } from './dominio/interfaces/repositorio-configuracion-tienda.interface';

// Importaciones para submódulos de configuración
import { ConfiguracionNotificacionesModule } from './configuracion-notificaciones.module';

import { ControladorPoliticas } from './presentacion/controladores/controlador-politicas';
import { GestionPoliticasCasoUso } from './dominio/casos-uso/gestion-politicas.caso-uso';
import { PrismaRepositorioConfiguracionPoliticas } from './infraestructura/repositorios/prisma-repositorio-configuracion-politicas';
import { RepositorioConfiguracionPoliticas } from './dominio/interfaces/repositorio-configuracion-politicas.interface';

import { ControladorAplicacionesCanalesVenta } from './presentacion/controladores/controlador-aplicaciones-canales-venta';
import { GestionAplicacionesCanalesVentaCasoUso } from './dominio/casos-uso/gestion-aplicaciones-canales-venta.caso-uso';
import { PrismaRepositorioConfiguracionAplicacionesCanalesVenta } from './infraestructura/repositorios/prisma-repositorio-configuracion-aplicaciones-canales-venta';
import { RepositorioConfiguracionAplicacionesCanalesVenta } from './dominio/interfaces/repositorio-configuracion-aplicaciones-canales-venta.interface';

// Importaciones para submódulo de Dominios
import { ControladorDominios } from './presentacion/controladores/controlador-dominios';
import { GestionDominiosCasoUso } from './dominio/casos-uso/gestion-dominios.caso-uso';
import { PrismaRepositorioConfiguracionDominios } from './infraestructura/repositorios/prisma-repositorio-configuracion-dominios';
import { RepositorioConfiguracionDominios } from './dominio/interfaces/repositorio-configuracion-dominios.interface';

// Importaciones para submódulo de Usuarios y Roles
import { ControladorUsuarios } from './presentacion/controladores/controlador-usuarios';
import { GestionUsuariosCasoUso } from './dominio/casos-uso/gestion-usuarios.caso-uso';
import { PrismaRepositorioConfiguracionUsuarios } from './infraestructura/repositorios/prisma-repositorio-configuracion-usuarios';
import { RepositorioConfiguracionUsuarios } from './dominio/interfaces/repositorio-configuracion-usuarios.interface';

import { ControladorRoles } from './presentacion/controladores/controlador-roles';
import { GestionRolesCasoUso } from './dominio/casos-uso/gestion-roles.caso-uso';
import { RepositorioConfiguracionRoles } from './dominio/interfaces/repositorio-configuracion-roles.interface';

/**
 * Módulo de Configuración de Tienda
 * Sigue la arquitectura limpia con separación de capas
 * Incluye los submodulos de configuración completos: Notificaciones, Políticas, Aplicaciones y Canales de Venta, Dominios
 * Nota: Los submodulos de Sucursales e Idiomas requieren ajustes adicionales en su estructura
 */
@Module({
  imports: [
    ConfiguracionNotificacionesModule,
  ],
  controllers: [
    ControladorConfiguracionTienda,
    ControladorPoliticas,
    ControladorAplicacionesCanalesVenta,
    ControladorDominios,
    ControladorUsuarios,
    ControladorRoles,
  ],
  providers: [
    // Repositorios
    {
      provide: 'RepositorioConfiguracionTienda',
      useClass: PrismaRepositorioConfiguracionTienda,
    },
    {
      provide: 'RepositorioConfiguracionPoliticas',
      useClass: PrismaRepositorioConfiguracionPoliticas,
    },
    {
      provide: 'RepositorioConfiguracionAplicacionesCanalesVenta',
      useClass: PrismaRepositorioConfiguracionAplicacionesCanalesVenta,
    },
    {
      provide: 'RepositorioConfiguracionDominios',
      useClass: PrismaRepositorioConfiguracionDominios,
    },
    {
      provide: 'RepositorioConfiguracionUsuarios',
      useClass: PrismaRepositorioConfiguracionUsuarios,
    },
    {
      provide: 'RepositorioConfiguracionRoles',
      useClass: PrismaRepositorioConfiguracionUsuarios, // Usamos el mismo repositorio por ahora
    },
    
    // Casos de uso
    CrearConfiguracionTiendaCasoUso,
    GestionPoliticasCasoUso,
    GestionAplicacionesCanalesVentaCasoUso,
    GestionDominiosCasoUso,
    GestionUsuariosCasoUso,
    GestionRolesCasoUso,
    
    // Servicios comunes
    PrismaClient,
  ],
  exports: [
    // Casos de uso
    CrearConfiguracionTiendaCasoUso,
    GestionPoliticasCasoUso,
    GestionAplicacionesCanalesVentaCasoUso,
    GestionDominiosCasoUso,
    GestionUsuariosCasoUso,
    GestionRolesCasoUso,
    
    // Repositorios
    {
      provide: 'RepositorioConfiguracionTienda',
      useClass: PrismaRepositorioConfiguracionTienda,
    },
    {
      provide: 'RepositorioConfiguracionPoliticas',
      useClass: PrismaRepositorioConfiguracionPoliticas,
    },
    {
      provide: 'RepositorioConfiguracionAplicacionesCanalesVenta',
      useClass: PrismaRepositorioConfiguracionAplicacionesCanalesVenta,
    },
    {
      provide: 'RepositorioConfiguracionDominios',
      useClass: PrismaRepositorioConfiguracionDominios,
    },
    {
      provide: 'RepositorioConfiguracionUsuarios',
      useClass: PrismaRepositorioConfiguracionUsuarios,
    },
    {
      provide: 'RepositorioConfiguracionRoles',
      useClass: PrismaRepositorioConfiguracionUsuarios,
    },
    
    // Módulos
    ConfiguracionNotificacionesModule,
  ],
})
export class ConfiguracionTiendaModule {}