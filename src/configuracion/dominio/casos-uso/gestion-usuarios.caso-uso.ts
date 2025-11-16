import { Injectable, Inject } from '@nestjs/common';
import type { RepositorioConfiguracionUsuarios } from '../interfaces/repositorio-configuracion-usuarios.interface';
import { ServicioRespuestaEstandar } from '../../../comun/aplicacion/servicios/servicio-respuesta-estandar';
import { ExcepcionDominio } from '../../../comun/excepciones/excepcion-dominio';
import { TipoMetodoAutenticacion } from '../enums/tipo-metodo-autenticacion.enum';

@Injectable()
export class GestionUsuariosCasoUso {
  constructor(
    @Inject('RepositorioConfiguracionUsuarios')
    private readonly repositorioConfiguracionUsuarios: RepositorioConfiguracionUsuarios,
  ) {}

  async obtenerConfiguracion(tiendaId: string) {
    try {
      const configuracion = await this.repositorioConfiguracionUsuarios.obtenerConfiguracion(tiendaId);
      return ServicioRespuestaEstandar.Respuesta200(
        'Configuración de usuarios obtenida exitosamente',
        configuracion,
        'ConfiguracionUsuarios.ObtenidaExitosamente'
      );
    } catch (error) {
      throw ExcepcionDominio.Respuesta500(
        'Error al obtener la configuración de usuarios',
        'ConfiguracionUsuarios.ErrorObtencion'
      );
    }
  }

  async actualizarConfiguracion(
    tiendaId: string,
    datos: {
      modoCuentas?: 'recomendado' | 'clasico';
      metodoAutenticacion?: 'codigo_unico' | 'contrasena';
      mostrarEnlacesInicioSesion?: boolean;
      appsConectadas?: string[];
      personalizacionActiva?: boolean;
      creditoTienda?: boolean;
      devolucionAutoservicio?: boolean;
      reglasDevolucion?: Array<{
        condicion: string;
        limite: number;
        aplicable: boolean;
      }>;
      urlCuenta?: string;
      dominioPersonalizado?: string;
      metodosAutenticacion?: Array<{
        tipo: TipoMetodoAutenticacion;
        habilitado: boolean;
        configuracion?: any;
      }>;
    },
  ) {
    try {
      await this.repositorioConfiguracionUsuarios.actualizarConfiguracion(tiendaId, datos);
      return ServicioRespuestaEstandar.Respuesta200(
        'Configuración de usuarios actualizada exitosamente',
        null,
        'ConfiguracionUsuarios.ActualizadaExitosamente'
      );
    } catch (error) {
      throw ExcepcionDominio.Respuesta500(
        'Error al actualizar la configuración de usuarios',
        'ConfiguracionUsuarios.ErrorActualizacion'
      );
    }
  }

  async agregarAppConectada(tiendaId: string, appId: string) {
    try {
      const existeApp = await this.repositorioConfiguracionUsuarios.existeAppConectada(tiendaId, appId);
      if (existeApp) {
        throw ExcepcionDominio.Respuesta400(
          'La app ya está conectada',
          'ConfiguracionUsuarios.AppYaConectada'
        );
      }

      await this.repositorioConfiguracionUsuarios.agregarAppConectada(tiendaId, appId);
      return ServicioRespuestaEstandar.Respuesta200(
        'App conectada exitosamente',
        null,
        'ConfiguracionUsuarios.AppConectadaExitosamente'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al conectar la app',
        'ConfiguracionUsuarios.ErrorConexionApp'
      );
    }
  }

  async eliminarAppConectada(tiendaId: string, appId: string) {
    try {
      const existeApp = await this.repositorioConfiguracionUsuarios.existeAppConectada(tiendaId, appId);
      if (!existeApp) {
        throw ExcepcionDominio.Respuesta404(
          'App no encontrada',
          'ConfiguracionUsuarios.AppNoEncontrada'
        );
      }

      await this.repositorioConfiguracionUsuarios.eliminarAppConectada(tiendaId, appId);
      return ServicioRespuestaEstandar.Respuesta200(
        'App desconectada exitosamente',
        null,
        'ConfiguracionUsuarios.AppDesconectadaExitosamente'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al desconectar la app',
        'ConfiguracionUsuarios.ErrorDesconexionApp'
      );
    }
  }

  async obtenerAppsConectadas(tiendaId: string) {
    try {
      const apps = await this.repositorioConfiguracionUsuarios.obtenerAppsConectadas(tiendaId);
      return ServicioRespuestaEstandar.Respuesta200(
        'Apps conectadas obtenidas exitosamente',
        apps,
        'ConfiguracionUsuarios.AppsObtenidasExitosamente'
      );
    } catch (error) {
      throw ExcepcionDominio.Respuesta500(
        'Error al obtener las apps conectadas',
        'ConfiguracionUsuarios.ErrorObtencionApps'
      );
    }
  }

  async agregarReglaDevolucion(
    tiendaId: string,
    regla: {
      condicion: string;
      limite: number;
      aplicable: boolean;
    },
  ) {
    try {
      const existeRegla = await this.repositorioConfiguracionUsuarios.existeReglaDevolucion(tiendaId, regla.condicion);
      if (existeRegla) {
        throw ExcepcionDominio.Respuesta400(
          'La regla ya existe',
          'ConfiguracionUsuarios.ReglaYaExiste'
        );
      }

      await this.repositorioConfiguracionUsuarios.agregarReglaDevolucion(tiendaId, regla);
      return ServicioRespuestaEstandar.Respuesta200(
        'Regla de devolución agregada exitosamente',
        null,
        'ConfiguracionUsuarios.ReglaAgregadaExitosamente'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al agregar la regla de devolución',
        'ConfiguracionUsuarios.ErrorAgregarRegla'
      );
    }
  }

  async actualizarReglaDevolucion(
    tiendaId: string,
    reglaId: string,
    datos: {
      condicion?: string;
      limite?: number;
      aplicable?: boolean;
    },
  ) {
    try {
      await this.repositorioConfiguracionUsuarios.actualizarReglaDevolucion(tiendaId, reglaId, datos);
      return ServicioRespuestaEstandar.Respuesta200(
        'Regla de devolución actualizada exitosamente',
        null,
        'ConfiguracionUsuarios.ReglaActualizadaExitosamente'
      );
    } catch (error) {
      throw ExcepcionDominio.Respuesta500(
        'Error al actualizar la regla de devolución',
        'ConfiguracionUsuarios.ErrorActualizarRegla'
      );
    }
  }

  async eliminarReglaDevolucion(tiendaId: string, reglaId: string) {
    try {
      await this.repositorioConfiguracionUsuarios.eliminarReglaDevolucion(tiendaId, reglaId);
      return ServicioRespuestaEstandar.Respuesta200(
        'Regla de devolución eliminada exitosamente',
        null,
        'ConfiguracionUsuarios.ReglaEliminadaExitosamente'
      );
    } catch (error) {
      throw ExcepcionDominio.Respuesta500(
        'Error al eliminar la regla de devolución',
        'ConfiguracionUsuarios.ErrorEliminarRegla'
      );
    }
  }

  async obtenerReglasDevolucion(tiendaId: string) {
    try {
      const reglas = await this.repositorioConfiguracionUsuarios.obtenerReglasDevolucion(tiendaId);
      return ServicioRespuestaEstandar.Respuesta200(
        'Reglas de devolución obtenidas exitosamente',
        reglas,
        'ConfiguracionUsuarios.ReglasObtenidasExitosamente'
      );
    } catch (error) {
      throw ExcepcionDominio.Respuesta500(
        'Error al obtener las reglas de devolución',
        'ConfiguracionUsuarios.ErrorObtencionReglas'
      );
    }
  }

  async agregarMetodoAutenticacion(
    tiendaId: string,
    metodo: {
      tipo: TipoMetodoAutenticacion;
      habilitado: boolean;
      configuracion?: any;
    },
  ) {
    try {
      const existeMetodo = await this.repositorioConfiguracionUsuarios.existeMetodoAutenticacion(tiendaId, metodo.tipo);
      if (existeMetodo) {
        throw ExcepcionDominio.Respuesta400(
          'El método de autenticación ya existe',
          'ConfiguracionUsuarios.MetodoYaExiste'
        );
      }

      await this.repositorioConfiguracionUsuarios.agregarMetodoAutenticacion(tiendaId, metodo);
      return ServicioRespuestaEstandar.Respuesta200(
        'Método de autenticación agregado exitosamente',
        null,
        'ConfiguracionUsuarios.MetodoAgregadoExitosamente'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al agregar el método de autenticación',
        'ConfiguracionUsuarios.ErrorAgregarMetodo'
      );
    }
  }

  async actualizarMetodoAutenticacion(
    tiendaId: string,
    metodoId: string,
    datos: {
      habilitado?: boolean;
      configuracion?: any;
    },
  ) {
    try {
      await this.repositorioConfiguracionUsuarios.actualizarMetodoAutenticacion(tiendaId, metodoId, datos);
      return ServicioRespuestaEstandar.Respuesta200(
        'Método de autenticación actualizado exitosamente',
        null,
        'ConfiguracionUsuarios.MetodoActualizadoExitosamente'
      );
    } catch (error) {
      throw ExcepcionDominio.Respuesta500(
        'Error al actualizar el método de autenticación',
        'ConfiguracionUsuarios.ErrorActualizarMetodo'
      );
    }
  }

  async eliminarMetodoAutenticacion(tiendaId: string, metodoId: string) {
    try {
      await this.repositorioConfiguracionUsuarios.eliminarMetodoAutenticacion(tiendaId, metodoId);
      return ServicioRespuestaEstandar.Respuesta200(
        'Método de autenticación eliminado exitosamente',
        null,
        'ConfiguracionUsuarios.MetodoEliminadoExitosamente'
      );
    } catch (error) {
      throw ExcepcionDominio.Respuesta500(
        'Error al eliminar el método de autenticación',
        'ConfiguracionUsuarios.ErrorEliminarMetodo'
      );
    }
  }

  async obtenerMetodosAutenticacion(tiendaId: string) {
    try {
      const metodos = await this.repositorioConfiguracionUsuarios.obtenerMetodosAutenticacion(tiendaId);
      return ServicioRespuestaEstandar.Respuesta200(
        'Métodos de autenticación obtenidos exitosamente',
        metodos,
        'ConfiguracionUsuarios.MetodosObtenidosExitosamente'
      );
    } catch (error) {
      throw ExcepcionDominio.Respuesta500(
        'Error al obtener los métodos de autenticación',
        'ConfiguracionUsuarios.ErrorObtencionMetodos'
      );
    }
  }

  async agregarReglaCredito(
    tiendaId: string,
    regla: {
      condicion: string;
      montoMaximo: number;
      aplicable: boolean;
    },
  ) {
    try {
      const existeRegla = await this.repositorioConfiguracionUsuarios.existeReglaCredito(tiendaId, regla.condicion);
      if (existeRegla) {
        throw ExcepcionDominio.Respuesta400(
          'La regla de crédito ya existe',
          'ConfiguracionUsuarios.ReglaCreditoYaExiste'
        );
      }

      await this.repositorioConfiguracionUsuarios.agregarReglaCredito(tiendaId, regla);
      return ServicioRespuestaEstandar.Respuesta200(
        'Regla de crédito agregada exitosamente',
        null,
        'ConfiguracionUsuarios.ReglaCreditoAgregadaExitosamente'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al agregar la regla de crédito',
        'ConfiguracionUsuarios.ErrorAgregarReglaCredito'
      );
    }
  }

  async actualizarReglaCredito(
    tiendaId: string,
    reglaId: string,
    datos: {
      condicion?: string;
      montoMaximo?: number;
      aplicable?: boolean;
    },
  ) {
    try {
      await this.repositorioConfiguracionUsuarios.actualizarReglaCredito(tiendaId, reglaId, datos);
      return ServicioRespuestaEstandar.Respuesta200(
        'Regla de crédito actualizada exitosamente',
        null,
        'ConfiguracionUsuarios.ReglaCreditoActualizadaExitosamente'
      );
    } catch (error) {
      throw ExcepcionDominio.Respuesta500(
        'Error al actualizar la regla de crédito',
        'ConfiguracionUsuarios.ErrorActualizarReglaCredito'
      );
    }
  }

  async eliminarReglaCredito(tiendaId: string, reglaId: string) {
    try {
      await this.repositorioConfiguracionUsuarios.eliminarReglaCredito(tiendaId, reglaId);
      return ServicioRespuestaEstandar.Respuesta200(
        'Regla de crédito eliminada exitosamente',
        null,
        'ConfiguracionUsuarios.ReglaCreditoEliminadaExitosamente'
      );
    } catch (error) {
      throw ExcepcionDominio.Respuesta500(
        'Error al eliminar la regla de crédito',
        'ConfiguracionUsuarios.ErrorEliminarReglaCredito'
      );
    }
  }

  async obtenerReglasCredito(tiendaId: string) {
    try {
      const reglas = await this.repositorioConfiguracionUsuarios.obtenerReglasCredito(tiendaId);
      return ServicioRespuestaEstandar.Respuesta200(
        'Reglas de crédito obtenidas exitosamente',
        reglas,
        'ConfiguracionUsuarios.ReglasCreditoObtenidasExitosamente'
      );
    } catch (error) {
      throw ExcepcionDominio.Respuesta500(
        'Error al obtener las reglas de crédito',
        'ConfiguracionUsuarios.ErrorObtencionReglasCredito'
      );
    }
  }
}