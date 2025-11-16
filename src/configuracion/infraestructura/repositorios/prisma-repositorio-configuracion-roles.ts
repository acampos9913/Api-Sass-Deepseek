/**
 * Repositorio Prisma para la gestión de configuración de roles
 * Implementa la interfaz RepositorioConfiguracionRoles
 */
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RepositorioConfiguracionRoles } from '../../dominio/interfaces/repositorio-configuracion-roles.interface';
import { ExcepcionDominio } from 'src/comun/excepciones/excepcion-dominio';

@Injectable()
export class PrismaRepositorioConfiguracionRoles implements RepositorioConfiguracionRoles {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crea un rol personalizado
   */
  async crearRolPersonalizado(
    tiendaId: string,
    rol: {
      id: string;
      nombre: string;
      descripcion: string;
      permisos: string[];
      restricciones: string[];
    },
  ): Promise<void> {
    try {
      // Verificar si ya existe un rol con el mismo nombre
      const existe = await this.existeNombreRol(tiendaId, rol.nombre);
      if (existe) {
        throw ExcepcionDominio.Respuesta400(
          `Ya existe un rol con el nombre '${rol.nombre}'`,
          'Roles.NombreDuplicado'
        );
      }

      // Obtener o crear la configuración de usuarios y roles para la tienda
      const configuracionExistente = await this.prisma.configuracionUsuariosRoles.findUnique({
        where: { tienda_id: tiendaId },
      });

      if (configuracionExistente) {
        // Actualizar configuración existente
        const rolesPersonalizados = (configuracionExistente.roles_personalizados as unknown) as Array<{
          id: string;
          nombre: string;
          descripcion: string;
          permisos: string[];
          restricciones: string[];
          numeroEmpleados: number;
          fechaCreacion: Date;
        }>;

        rolesPersonalizados.push({
          id: rol.id,
          nombre: rol.nombre,
          descripcion: rol.descripcion,
          permisos: rol.permisos,
          restricciones: rol.restricciones,
          numeroEmpleados: 0,
          fechaCreacion: new Date(),
        });

        await this.prisma.configuracionUsuariosRoles.update({
          where: { tienda_id: tiendaId },
          data: {
            roles_personalizados: rolesPersonalizados,
            fecha_actualizacion: new Date(),
          },
        });
      } else {
        // Crear nueva configuración
        await this.prisma.configuracionUsuariosRoles.create({
          data: {
            tienda_id: tiendaId,
            roles_personalizados: [{
              id: rol.id,
              nombre: rol.nombre,
              descripcion: rol.descripcion,
              permisos: rol.permisos,
              restricciones: rol.restricciones,
              numeroEmpleados: 0,
              fechaCreacion: new Date(),
            }],
            configuracion_seguridad: {
              politicasUsuarios: {
                autenticacionDosPasosObligatoria: false,
                longitudMinimaContrasena: 8,
                expiracionContrasenaDias: 90,
                maximoIntentosInicioSesion: 5,
                bloqueoTemporalMinutos: 30,
                requiereVerificacionEmail: true,
                politicasContrasena: ['minimo_8_caracteres', 'mezcla_mayusculas_minusculas'],
              },
              configuracionSeguridad: {
                registroActividad: {
                  habilitado: true,
                  retencionDias: 365,
                  eventosRegistrados: ['login', 'logout', 'cambio_contrasena'],
                },
                dispositivosConectados: {
                  maximoDispositivosPorUsuario: 5,
                  sesionesConcurrentes: true,
                  notificacionesNuevoDispositivo: true,
                },
                colaboradores: {
                  codigoColaborador: this.generarCodigoColaboradorAleatorio(),
                  solicitudesPendientes: 0,
                  maximoColaboradores: 10,
                },
              },
            },
            fecha_creacion: new Date(),
            fecha_actualizacion: new Date(),
          },
        });
      }
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al crear rol personalizado',
        'Roles.ErrorCreacion'
      );
    }
  }

  /**
   * Actualiza un rol personalizado
   */
  async actualizarRolPersonalizado(
    tiendaId: string,
    rolId: string,
    datos: {
      nombre?: string;
      descripcion?: string;
      permisos?: string[];
      restricciones?: string[];
    },
  ): Promise<void> {
    try {
      const configuracion = await this.prisma.configuracionUsuariosRoles.findUnique({
        where: { tienda_id: tiendaId },
      });

      if (!configuracion) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de roles no encontrada',
          'Roles.ConfiguracionNoEncontrada'
        );
      }

      const rolesPersonalizados = (configuracion.roles_personalizados as unknown) as Array<{
        id: string;
        nombre: string;
        descripcion: string;
        permisos: string[];
        restricciones: string[];
        numeroEmpleados: number;
        fechaCreacion: Date;
      }>;

      const rolIndex = rolesPersonalizados.findIndex(rol => rol.id === rolId);
      if (rolIndex === -1) {
        throw ExcepcionDominio.Respuesta404(
          'Rol personalizado no encontrado',
          'Roles.RolNoEncontrado'
        );
      }

      // Verificar nombre duplicado si se está cambiando
      if (datos.nombre && datos.nombre !== rolesPersonalizados[rolIndex].nombre) {
        const existe = await this.existeNombreRol(tiendaId, datos.nombre, rolId);
        if (existe) {
          throw ExcepcionDominio.Respuesta400(
            `Ya existe un rol con el nombre '${datos.nombre}'`,
            'Roles.NombreDuplicado'
          );
        }
      }

      // Actualizar rol
      rolesPersonalizados[rolIndex] = {
        ...rolesPersonalizados[rolIndex],
        ...datos,
      };

      await this.prisma.configuracionUsuariosRoles.update({
        where: { tienda_id: tiendaId },
        data: {
          roles_personalizados: rolesPersonalizados,
          fecha_actualizacion: new Date(),
        },
      });
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al actualizar rol personalizado',
        'Roles.ErrorActualizacion'
      );
    }
  }

  /**
   * Elimina un rol personalizado
   */
  async eliminarRolPersonalizado(tiendaId: string, rolId: string): Promise<void> {
    try {
      const configuracion = await this.prisma.configuracionUsuariosRoles.findUnique({
        where: { tienda_id: tiendaId },
      });

      if (!configuracion) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de roles no encontrada',
          'Roles.ConfiguracionNoEncontrada'
        );
      }

      const rolesPersonalizados = (configuracion.roles_personalizados as unknown) as Array<{
        id: string;
        nombre: string;
        descripcion: string;
        permisos: string[];
        restricciones: string[];
        numeroEmpleados: number;
        fechaCreacion: Date;
      }>;

      const rolIndex = rolesPersonalizados.findIndex(rol => rol.id === rolId);
      if (rolIndex === -1) {
        throw ExcepcionDominio.Respuesta404(
          'Rol personalizado no encontrado',
          'Roles.RolNoEncontrado'
        );
      }

      // Verificar si el rol está siendo usado
      if (rolesPersonalizados[rolIndex].numeroEmpleados > 0) {
        throw ExcepcionDominio.Respuesta400(
          'No se puede eliminar un rol que está siendo usado por empleados',
          'Roles.RolEnUso'
        );
      }

      // Eliminar rol
      rolesPersonalizados.splice(rolIndex, 1);

      await this.prisma.configuracionUsuariosRoles.update({
        where: { tienda_id: tiendaId },
        data: {
          roles_personalizados: rolesPersonalizados,
          fecha_actualizacion: new Date(),
        },
      });
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al eliminar rol personalizado',
        'Roles.ErrorEliminacion'
      );
    }
  }

  /**
   * Obtiene todos los roles disponibles
   */
  async obtenerRoles(tiendaId: string): Promise<{
    rolesPredeterminados: Array<{
      nombre: string;
      descripcion: string;
      permisos: string[];
      restricciones: string[];
      gestionadoPorSistema: boolean;
      numeroEmpleados: number;
    }>;
    rolesPersonalizados: Array<{
      id: string;
      nombre: string;
      descripcion: string;
      permisos: string[];
      restricciones: string[];
      numeroEmpleados: number;
      fechaCreacion: Date;
    }>;
  }> {
    try {
      const configuracion = await this.prisma.configuracionUsuariosRoles.findUnique({
        where: { tienda_id: tiendaId },
      });

      const rolesPredeterminados = this.obtenerRolesPredeterminados();
      const rolesPersonalizados = (configuracion?.roles_personalizados as unknown) as Array<{
        id: string;
        nombre: string;
        descripcion: string;
        permisos: string[];
        restricciones: string[];
        numeroEmpleados: number;
        fechaCreacion: Date;
      }> || [];

      return {
        rolesPredeterminados,
        rolesPersonalizados,
      };
    } catch (error) {
      throw ExcepcionDominio.Respuesta500(
        'Error al obtener roles',
        'Roles.ErrorObtencion'
      );
    }
  }

  /**
   * Verifica si un nombre de rol ya existe
   */
  async existeNombreRol(tiendaId: string, nombre: string, rolIdExcluir?: string): Promise<boolean> {
    try {
      const configuracion = await this.prisma.configuracionUsuariosRoles.findUnique({
        where: { tienda_id: tiendaId },
      });

      if (!configuracion) {
        return false;
      }

      const rolesPersonalizados = (configuracion.roles_personalizados as unknown) as Array<{
        id: string;
        nombre: string;
        descripcion: string;
        permisos: string[];
        restricciones: string[];
        numeroEmpleados: number;
        fechaCreacion: Date;
      }>;

      return rolesPersonalizados.some(
        rol => rol.nombre.toLowerCase() === nombre.toLowerCase() && rol.id !== rolIdExcluir
      );
    } catch (error) {
      throw ExcepcionDominio.Respuesta500(
        'Error al verificar nombre de rol',
        'Roles.ErrorVerificacion'
      );
    }
  }

  /**
   * Obtiene la configuración de seguridad
   */
  async obtenerConfiguracionSeguridad(tiendaId: string): Promise<{
    politicasUsuarios: {
      autenticacionDosPasosObligatoria: boolean;
      longitudMinimaContrasena: number;
      expiracionContrasenaDias: number;
      maximoIntentosInicioSesion: number;
      bloqueoTemporalMinutos: number;
      requiereVerificacionEmail: boolean;
      politicasContrasena: string[];
    };
    configuracionSeguridad: {
      registroActividad: {
        habilitado: boolean;
        retencionDias: number;
        eventosRegistrados: string[];
      };
      dispositivosConectados: {
        maximoDispositivosPorUsuario: number;
        sesionesConcurrentes: boolean;
        notificacionesNuevoDispositivo: boolean;
      };
      colaboradores: {
        codigoColaborador: string;
        solicitudesPendientes: number;
        maximoColaboradores: number;
      };
    };
  }> {
    try {
      const configuracion = await this.prisma.configuracionUsuariosRoles.findUnique({
        where: { tienda_id: tiendaId },
      });

      if (!configuracion) {
        // Retornar configuración por defecto si no existe
        return this.obtenerConfiguracionSeguridadPorDefecto();
      }

      return configuracion.configuracion_seguridad as {
        politicasUsuarios: {
          autenticacionDosPasosObligatoria: boolean;
          longitudMinimaContrasena: number;
          expiracionContrasenaDias: number;
          maximoIntentosInicioSesion: number;
          bloqueoTemporalMinutos: number;
          requiereVerificacionEmail: boolean;
          politicasContrasena: string[];
        };
        configuracionSeguridad: {
          registroActividad: {
            habilitado: boolean;
            retencionDias: number;
            eventosRegistrados: string[];
          };
          dispositivosConectados: {
            maximoDispositivosPorUsuario: number;
            sesionesConcurrentes: boolean;
            notificacionesNuevoDispositivo: boolean;
          };
          colaboradores: {
            codigoColaborador: string;
            solicitudesPendientes: number;
            maximoColaboradores: number;
          };
        };
      };
    } catch (error) {
      throw ExcepcionDominio.Respuesta500(
        'Error al obtener configuración de seguridad',
        'Seguridad.ErrorObtencion'
      );
    }
  }

  /**
   * Actualiza la configuración de seguridad
   */
  async actualizarConfiguracionSeguridad(
    tiendaId: string,
    datos: {
      politicasUsuarios?: {
        autenticacionDosPasosObligatoria?: boolean;
        longitudMinimaContrasena?: number;
        expiracionContrasenaDias?: number;
        maximoIntentosInicioSesion?: number;
        bloqueoTemporalMinutos?: number;
        requiereVerificacionEmail?: boolean;
        politicasContrasena?: string[];
      };
      configuracionSeguridad?: {
        registroActividad?: {
          habilitado?: boolean;
          retencionDias?: number;
          eventosRegistrados?: string[];
        };
        dispositivosConectados?: {
          maximoDispositivosPorUsuario?: number;
          sesionesConcurrentes?: boolean;
          notificacionesNuevoDispositivo?: boolean;
        };
        colaboradores?: {
          codigoColaborador?: string;
          solicitudesPendientes?: number;
          maximoColaboradores?: number;
        };
      };
    },
  ): Promise<void> {
    try {
      const configuracionExistente = await this.prisma.configuracionUsuariosRoles.findUnique({
        where: { tienda_id: tiendaId },
      });

      const configuracionSeguridadActual = configuracionExistente 
        ? configuracionExistente.configuracion_seguridad as any
        : this.obtenerConfiguracionSeguridadPorDefecto();

      // Actualizar configuración
      const configuracionActualizada = {
        politicasUsuarios: {
          ...configuracionSeguridadActual.politicasUsuarios,
          ...datos.politicasUsuarios,
        },
        configuracionSeguridad: {
          ...configuracionSeguridadActual.configuracionSeguridad,
          ...datos.configuracionSeguridad,
        },
      };

      if (configuracionExistente) {
        await this.prisma.configuracionUsuariosRoles.update({
          where: { tienda_id: tiendaId },
          data: {
            configuracion_seguridad: configuracionActualizada,
            fecha_actualizacion: new Date(),
          },
        });
      } else {
        await this.prisma.configuracionUsuariosRoles.create({
          data: {
            tienda_id: tiendaId,
            configuracion_seguridad: configuracionActualizada,
            roles_personalizados: [],
            fecha_creacion: new Date(),
            fecha_actualizacion: new Date(),
          },
        });
      }
    } catch (error) {
      throw ExcepcionDominio.Respuesta500(
        'Error al actualizar configuración de seguridad',
        'Seguridad.ErrorActualizacion'
      );
    }
  }

  /**
   * Genera un nuevo código de colaborador
   */
  async generarCodigoColaborador(tiendaId: string): Promise<string> {
    try {
      const nuevoCodigo = this.generarCodigoColaboradorAleatorio();

      const configuracionExistente = await this.prisma.configuracionUsuariosRoles.findUnique({
        where: { tienda_id: tiendaId },
      });

      const configuracionSeguridadActual = configuracionExistente
        ? configuracionExistente.configuracion_seguridad as any
        : this.obtenerConfiguracionSeguridadPorDefecto();

      const configuracionActualizada = {
        ...configuracionSeguridadActual,
        configuracionSeguridad: {
          ...configuracionSeguridadActual.configuracionSeguridad,
          colaboradores: {
            ...configuracionSeguridadActual.configuracionSeguridad.colaboradores,
            codigoColaborador: nuevoCodigo,
          },
        },
      };

      if (configuracionExistente) {
        await this.prisma.configuracionUsuariosRoles.update({
          where: { tienda_id: tiendaId },
          data: {
            configuracion_seguridad: configuracionActualizada,
            fecha_actualizacion: new Date(),
          },
        });
      } else {
        await this.prisma.configuracionUsuariosRoles.create({
          data: {
            tienda_id: tiendaId,
            configuracion_seguridad: configuracionActualizada,
            roles_personalizados: [],
            fecha_creacion: new Date(),
            fecha_actualizacion: new Date(),
          },
        });
      }

      return nuevoCodigo;
    } catch (error) {
      throw ExcepcionDominio.Respuesta500(
        'Error al generar código de colaborador',
        'Colaboradores.ErrorGeneracion'
      );
    }
  }

  /**
   * Obtiene las solicitudes de colaborador pendientes
   */
  async obtenerSolicitudesColaborador(tiendaId: string): Promise<Array<{
    id: string;
    email: string;
    nombre: string;
    fechaSolicitud: Date;
    estado: 'pendiente' | 'aprobada' | 'rechazada';
  }>> {
    try {
      const configuracion = await this.prisma.configuracionUsuariosRoles.findUnique({
        where: { tienda_id: tiendaId },
      });

      if (!configuracion) {
        return [];
      }

      return (configuracion.solicitudes_colaboradores as unknown) as Array<{
        id: string;
        email: string;
        nombre: string;
        fechaSolicitud: Date;
        estado: 'pendiente' | 'aprobada' | 'rechazada';
      }> || [];
    } catch (error) {
      throw ExcepcionDominio.Respuesta500(
        'Error al obtener solicitudes de colaborador',
        'Colaboradores.ErrorObtencion'
      );
    }
  }

  /**
   * Aprueba una solicitud de colaborador
   */
  async aprobarSolicitudColaborador(tiendaId: string, solicitudId: string): Promise<void> {
    try {
      const configuracion = await this.prisma.configuracionUsuariosRoles.findUnique({
        where: { tienda_id: tiendaId },
      });

      if (!configuracion) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de roles no encontrada',
          'Roles.ConfiguracionNoEncontrada'
        );
      }

      const solicitudes = (configuracion.solicitudes_colaboradores as unknown) as Array<{
        id: string;
        email: string;
        nombre: string;
        fechaSolicitud: Date;
        estado: 'pendiente' | 'aprobada' | 'rechazada';
      }> || [];

      const solicitudIndex = solicitudes.findIndex(s => s.id === solicitudId);
      if (solicitudIndex === -1) {
        throw ExcepcionDominio.Respuesta404(
          'Solicitud de colaborador no encontrada',
          'Colaboradores.SolicitudNoEncontrada'
        );
      }

      solicitudes[solicitudIndex].estado = 'aprobada';

      await this.prisma.configuracionUsuariosRoles.update({
        where: { tienda_id: tiendaId },
        data: {
          solicitudes_colaboradores: solicitudes,
          fecha_actualizacion: new Date(),
        },
      });
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al aprobar solicitud de colaborador',
        'Colaboradores.ErrorAprobacion'
      );
    }
  }

  /**
   * Rechaza una solicitud de colaborador
   */
  async rechazarSolicitudColaborador(tiendaId: string, solicitudId: string): Promise<void> {
    try {
      const configuracion = await this.prisma.configuracionUsuariosRoles.findUnique({
        where: { tienda_id: tiendaId },
      });

      if (!configuracion) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de roles no encontrada',
          'Roles.ConfiguracionNoEncontrada'
        );
      }

      const solicitudes = (configuracion.solicitudes_colaboradores as unknown) as Array<{
        id: string;
        email: string;
        nombre: string;
        fechaSolicitud: Date;
        estado: 'pendiente' | 'aprobada' | 'rechazada';
      }> || [];

      const solicitudIndex = solicitudes.findIndex(s => s.id === solicitudId);
      if (solicitudIndex === -1) {
        throw ExcepcionDominio.Respuesta404(
          'Solicitud de colaborador no encontrada',
          'Colaboradores.SolicitudNoEncontrada'
        );
      }

      solicitudes[solicitudIndex].estado = 'rechazada';

      await this.prisma.configuracionUsuariosRoles.update({
        where: { tienda_id: tiendaId },
        data: {
          solicitudes_colaboradores: solicitudes,
          fecha_actualizacion: new Date(),
        },
      });
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al rechazar solicitud de colaborador',
        'Colaboradores.ErrorRechazo'
      );
    }
  }

  /**
   * Obtiene el registro de actividad de usuarios
   */
  async obtenerRegistroActividad(
    tiendaId: string,
    filtros?: {
      evento?: string;
      recurso?: string;
      fechaInicio?: Date;
      fechaFin?: Date;
      usuario?: string;
    },
  ): Promise<Array<{
    id: string;
    evento: string;
    recurso: string;
    fecha: Date;
    usuario: string;
    detalles: string;
  }>> {
    try {
      const configuracion = await this.prisma.configuracionUsuariosRoles.findUnique({
        where: { tienda_id: tiendaId },
      });

      if (!configuracion) {
        return [];
      }

      let registros = (configuracion.registro_actividad as unknown) as Array<{
        id: string;
        evento: string;
        recurso: string;
        fecha: Date;
        usuario: string;
        detalles: string;
      }> || [];

      // Aplicar filtros
      if (filtros) {
        if (filtros.evento) {
          registros = registros.filter(r => r.evento.includes(filtros.evento!));
        }
        if (filtros.recurso) {
          registros = registros.filter(r => r.recurso.includes(filtros.recurso!));
        }
        if (filtros.fechaInicio) {
          registros = registros.filter(r => r.fecha >= filtros.fechaInicio!);
        }
        if (filtros.fechaFin) {
          registros = registros.filter(r => r.fecha <= filtros.fechaFin!);
        }
        if (filtros.usuario) {
          registros = registros.filter(r => r.usuario.includes(filtros.usuario!));
        }
      }

      return registros;
    } catch (error) {
      throw ExcepcionDominio.Respuesta500(
        'Error al obtener registro de actividad',
        'Actividad.ErrorObtencion'
      );
    }
  }

  /**
   * Exporta el registro de actividad
   */
  async exportarRegistroActividad(
    tiendaId: string,
    filtros?: {
      evento?: string;
      recurso?: string;
      fechaInicio?: Date;
      fechaFin?: Date;
      usuario?: string;
    },
  ): Promise<string> {
    try {
      const registros = await this.obtenerRegistroActividad(tiendaId, filtros);
      
      // Convertir a formato CSV
      const csvHeaders = 'ID,Evento,Recurso,Fecha,Usuario,Detalles\n';
      const csvRows = registros.map(registro => 
        `${registro.id},${registro.evento},${registro.recurso},${registro.fecha.toISOString()},${registro.usuario},"${registro.detalles}"`
      ).join('\n');
      
      return csvHeaders + csvRows;
    } catch (error) {
      throw ExcepcionDominio.Respuesta500(
        'Error al exportar registro de actividad',
        'Actividad.ErrorExportacion'
      );
    }
  }

  // Métodos auxiliares

  /**
   * Obtiene los roles predeterminados del sistema
   */
  private obtenerRolesPredeterminados(): Array<{
    nombre: string;
    descripcion: string;
    permisos: string[];
    restricciones: string[];
    gestionadoPorSistema: boolean;
    numeroEmpleados: number;
  }> {
    return [
      {
        nombre: 'Desarrollador de aplicaciones',
        descripcion: 'Este rol otorga permisos para desarrollar apps y gestionar tiendas en desarrollo.',
        permisos: ['desarrollar_apps', 'gestionar_apps_partners', 'crear_tiendas_desarrollo'],
        restricciones: ['sin_acceso_tiendas_produccion', 'sin_gestion_usuarios', 'sin_datos_financieros'],
        gestionadoPorSistema: true,
        numeroEmpleados: 0,
      },
      {
        nombre: 'Atención al cliente',
        descripcion: 'Rol para gestionar consultas y soporte a clientes.',
        permisos: ['ver_clientes', 'ver_ordenes', 'gestionar_soporte'],
        restricciones: ['sin_acceso_configuracion', 'sin_datos_financieros'],
        gestionadoPorSistema: true,
        numeroEmpleados: 0,
      },
      {
        nombre: 'Especialista en marketing',
        descripcion: 'Rol para gestionar campañas de marketing y promociones.',
        permisos: ['gestionar_marketing', 'ver_analytics', 'crear_campanas'],
        restricciones: ['sin_acceso_datos_sensibles', 'sin_gestion_usuarios'],
        gestionadoPorSistema: true,
        numeroEmpleados: 0,
      },
      {
        nombre: 'Especialista en promoción de productos',
        descripcion: 'Rol para gestionar promociones y descuentos de productos.',
        permisos: ['gestionar_productos', 'crear_descuentos', 'ver_inventario'],
        restricciones: ['sin_acceso_configuracion', 'sin_datos_financieros'],
        gestionadoPorSistema: true,
        numeroEmpleados: 0,
      },
      {
        nombre: 'Editor de tiendas online',
        descripcion: 'Rol para gestionar contenido de la tienda online.',
        permisos: ['editar_paginas', 'gestionar_blog', 'editar_temas'],
        restricciones: ['sin_acceso_configuracion', 'sin_datos_financieros'],
        gestionadoPorSistema: true,
        numeroEmpleados: 0,
      },
      {
        nombre: 'Administrador',
        descripcion: 'Rol con acceso completo a todas las funcionalidades.',
        permisos: ['acceso_completo'],
        restricciones: [],
        gestionadoPorSistema: true,
        numeroEmpleados: 0,
      },
    ];
  }

  /**
   * Obtiene la configuración de seguridad por defecto
   */
  private obtenerConfiguracionSeguridadPorDefecto(): {
    politicasUsuarios: {
      autenticacionDosPasosObligatoria: boolean;
      longitudMinimaContrasena: number;
      expiracionContrasenaDias: number;
      maximoIntentosInicioSesion: number;
      bloqueoTemporalMinutos: number;
      requiereVerificacionEmail: boolean;
      politicasContrasena: string[];
    };
    configuracionSeguridad: {
      registroActividad: {
        habilitado: boolean;
        retencionDias: number;
        eventosRegistrados: string[];
      };
      dispositivosConectados: {
        maximoDispositivosPorUsuario: number;
        sesionesConcurrentes: boolean;
        notificacionesNuevoDispositivo: boolean;
      };
      colaboradores: {
        codigoColaborador: string;
        solicitudesPendientes: number;
        maximoColaboradores: number;
      };
    };
  } {
    return {
      politicasUsuarios: {
        autenticacionDosPasosObligatoria: false,
        longitudMinimaContrasena: 8,
        expiracionContrasenaDias: 90,
        maximoIntentosInicioSesion: 5,
        bloqueoTemporalMinutos: 30,
        requiereVerificacionEmail: true,
        politicasContrasena: ['minimo_8_caracteres', 'mezcla_mayusculas_minusculas'],
      },
      configuracionSeguridad: {
        registroActividad: {
          habilitado: true,
          retencionDias: 365,
          eventosRegistrados: ['login', 'logout', 'cambio_contrasena'],
        },
        dispositivosConectados: {
          maximoDispositivosPorUsuario: 5,
          sesionesConcurrentes: true,
          notificacionesNuevoDispositivo: true,
        },
        colaboradores: {
          codigoColaborador: this.generarCodigoColaboradorAleatorio(),
          solicitudesPendientes: 0,
          maximoColaboradores: 10,
        },
      },
    };
  }

  /**
   * Genera un código de colaborador aleatorio
   */
  private generarCodigoColaboradorAleatorio(): string {
    return Math.random().toString(36).substring(2, 6).toUpperCase();
  }
}