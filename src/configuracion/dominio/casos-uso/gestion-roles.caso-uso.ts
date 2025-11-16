import { Injectable, Inject } from '@nestjs/common';
import type { RepositorioConfiguracionRoles } from '../interfaces/repositorio-configuracion-roles.interface';
import { ServicioRespuestaEstandar } from '../../../comun/aplicacion/servicios/servicio-respuesta-estandar';
import { ExcepcionDominio } from '../../../comun/excepciones/excepcion-dominio';

@Injectable()
export class GestionRolesCasoUso {
  constructor(
    @Inject('RepositorioConfiguracionRoles')
    private readonly repositorioConfiguracionRoles: RepositorioConfiguracionRoles,
  ) {}

  async obtenerRoles(tiendaId: string) {
    try {
      const roles = await this.repositorioConfiguracionRoles.obtenerRoles(tiendaId);
      return ServicioRespuestaEstandar.Respuesta200(
        'Roles obtenidos exitosamente',
        roles,
        'ConfiguracionRoles.RolesObtenidosExitosamente'
      );
    } catch (error) {
      throw ExcepcionDominio.Respuesta500(
        'Error al obtener los roles',
        'ConfiguracionRoles.ErrorObtencionRoles'
      );
    }
  }

  async crearRolPersonalizado(
    tiendaId: string,
    datos: {
      id: string;
      nombre: string;
      descripcion: string;
      permisos: string[];
      restricciones: string[];
    },
  ) {
    try {
      const existeNombre = await this.repositorioConfiguracionRoles.existeNombreRol(tiendaId, datos.nombre);
      if (existeNombre) {
        throw ExcepcionDominio.Respuesta400(
          'Ya existe un rol con ese nombre',
          'ConfiguracionRoles.RolYaExiste'
        );
      }

      await this.repositorioConfiguracionRoles.crearRolPersonalizado(tiendaId, datos);
      return ServicioRespuestaEstandar.Respuesta201(
        'Rol personalizado creado exitosamente',
        null,
        'ConfiguracionRoles.RolPersonalizadoCreadoExitosamente'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al crear el rol personalizado',
        'ConfiguracionRoles.ErrorCreacionRolPersonalizado'
      );
    }
  }

  async actualizarRolPersonalizado(
    tiendaId: string,
    rolId: string,
    datos: {
      nombre?: string;
      descripcion?: string;
      permisos?: string[];
      restricciones?: string[];
    },
  ) {
    try {
      if (datos.nombre) {
        const existeNombre = await this.repositorioConfiguracionRoles.existeNombreRol(tiendaId, datos.nombre, rolId);
        if (existeNombre) {
          throw ExcepcionDominio.Respuesta400(
            'Ya existe un rol con ese nombre',
            'ConfiguracionRoles.RolYaExiste'
          );
        }
      }

      await this.repositorioConfiguracionRoles.actualizarRolPersonalizado(tiendaId, rolId, datos);
      return ServicioRespuestaEstandar.Respuesta200(
        'Rol personalizado actualizado exitosamente',
        null,
        'ConfiguracionRoles.RolPersonalizadoActualizadoExitosamente'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al actualizar el rol personalizado',
        'ConfiguracionRoles.ErrorActualizacionRolPersonalizado'
      );
    }
  }

  async eliminarRolPersonalizado(tiendaId: string, rolId: string) {
    try {
      await this.repositorioConfiguracionRoles.eliminarRolPersonalizado(tiendaId, rolId);
      return ServicioRespuestaEstandar.Respuesta200(
        'Rol personalizado eliminado exitosamente',
        null,
        'ConfiguracionRoles.RolPersonalizadoEliminadoExitosamente'
      );
    } catch (error) {
      throw ExcepcionDominio.Respuesta500(
        'Error al eliminar el rol personalizado',
        'ConfiguracionRoles.ErrorEliminacionRolPersonalizado'
      );
    }
  }

  async obtenerConfiguracionSeguridad(tiendaId: string) {
    try {
      const configuracion = await this.repositorioConfiguracionRoles.obtenerConfiguracionSeguridad(tiendaId);
      return ServicioRespuestaEstandar.Respuesta200(
        'Configuración de seguridad obtenida exitosamente',
        configuracion,
        'ConfiguracionRoles.ConfiguracionSeguridadObtenidaExitosamente'
      );
    } catch (error) {
      throw ExcepcionDominio.Respuesta500(
        'Error al obtener la configuración de seguridad',
        'ConfiguracionRoles.ErrorObtencionConfiguracionSeguridad'
      );
    }
  }

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
  ) {
    try {
      await this.repositorioConfiguracionRoles.actualizarConfiguracionSeguridad(tiendaId, datos);
      return ServicioRespuestaEstandar.Respuesta200(
        'Configuración de seguridad actualizada exitosamente',
        null,
        'ConfiguracionRoles.ConfiguracionSeguridadActualizadaExitosamente'
      );
    } catch (error) {
      throw ExcepcionDominio.Respuesta500(
        'Error al actualizar la configuración de seguridad',
        'ConfiguracionRoles.ErrorActualizacionConfiguracionSeguridad'
      );
    }
  }

  async generarCodigoColaborador(tiendaId: string) {
    try {
      const codigo = await this.repositorioConfiguracionRoles.generarCodigoColaborador(tiendaId);
      return ServicioRespuestaEstandar.Respuesta200(
        'Código de colaborador generado exitosamente',
        { codigo },
        'ConfiguracionRoles.CodigoColaboradorGeneradoExitosamente'
      );
    } catch (error) {
      throw ExcepcionDominio.Respuesta500(
        'Error al generar el código de colaborador',
        'ConfiguracionRoles.ErrorGeneracionCodigoColaborador'
      );
    }
  }

  async obtenerSolicitudesColaborador(tiendaId: string) {
    try {
      const solicitudes = await this.repositorioConfiguracionRoles.obtenerSolicitudesColaborador(tiendaId);
      return ServicioRespuestaEstandar.Respuesta200(
        'Solicitudes de colaborador obtenidas exitosamente',
        solicitudes,
        'ConfiguracionRoles.SolicitudesColaboradorObtenidasExitosamente'
      );
    } catch (error) {
      throw ExcepcionDominio.Respuesta500(
        'Error al obtener las solicitudes de colaborador',
        'ConfiguracionRoles.ErrorObtencionSolicitudesColaborador'
      );
    }
  }

  async aprobarSolicitudColaborador(tiendaId: string, solicitudId: string) {
    try {
      await this.repositorioConfiguracionRoles.aprobarSolicitudColaborador(tiendaId, solicitudId);
      return ServicioRespuestaEstandar.Respuesta200(
        'Solicitud de colaborador aprobada exitosamente',
        null,
        'ConfiguracionRoles.SolicitudColaboradorAprobadaExitosamente'
      );
    } catch (error) {
      throw ExcepcionDominio.Respuesta500(
        'Error al aprobar la solicitud de colaborador',
        'ConfiguracionRoles.ErrorAprobacionSolicitudColaborador'
      );
    }
  }

  async rechazarSolicitudColaborador(tiendaId: string, solicitudId: string) {
    try {
      await this.repositorioConfiguracionRoles.rechazarSolicitudColaborador(tiendaId, solicitudId);
      return ServicioRespuestaEstandar.Respuesta200(
        'Solicitud de colaborador rechazada exitosamente',
        null,
        'ConfiguracionRoles.SolicitudColaboradorRechazadaExitosamente'
      );
    } catch (error) {
      throw ExcepcionDominio.Respuesta500(
        'Error al rechazar la solicitud de colaborador',
        'ConfiguracionRoles.ErrorRechazoSolicitudColaborador'
      );
    }
  }

  async obtenerRegistroActividad(
    tiendaId: string,
    filtros?: {
      evento?: string;
      recurso?: string;
      fechaInicio?: Date;
      fechaFin?: Date;
      usuario?: string;
    },
  ) {
    try {
      const registros = await this.repositorioConfiguracionRoles.obtenerRegistroActividad(tiendaId, filtros);
      return ServicioRespuestaEstandar.Respuesta200(
        'Registro de actividad obtenido exitosamente',
        registros,
        'ConfiguracionRoles.RegistroActividadObtenidoExitosamente'
      );
    } catch (error) {
      throw ExcepcionDominio.Respuesta500(
        'Error al obtener el registro de actividad',
        'ConfiguracionRoles.ErrorObtencionRegistroActividad'
      );
    }
  }

  async exportarRegistroActividad(
    tiendaId: string,
    filtros?: {
      evento?: string;
      recurso?: string;
      fechaInicio?: Date;
      fechaFin?: Date;
      usuario?: string;
    },
  ) {
    try {
      const datos = await this.repositorioConfiguracionRoles.exportarRegistroActividad(tiendaId, filtros);
      return ServicioRespuestaEstandar.Respuesta200(
        'Registro de actividad exportado exitosamente',
        { datos },
        'ConfiguracionRoles.RegistroActividadExportadoExitosamente'
      );
    } catch (error) {
      throw ExcepcionDominio.Respuesta500(
        'Error al exportar el registro de actividad',
        'ConfiguracionRoles.ErrorExportacionRegistroActividad'
      );
    }
  }
}