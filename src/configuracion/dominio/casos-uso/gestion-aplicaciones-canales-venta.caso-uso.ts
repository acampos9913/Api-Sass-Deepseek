import { Injectable, Inject } from '@nestjs/common';
import { ServicioRespuestaEstandar } from '../../../comun/aplicacion/servicios/servicio-respuesta-estandar';
import { ExcepcionDominio } from '../../../comun/excepciones/excepcion-dominio';
import { ConfiguracionAplicacionesCanalesVenta } from '../entidades/configuracion-aplicaciones-canales-venta.entity';
import type { RepositorioConfiguracionAplicacionesCanalesVenta } from '../interfaces/repositorio-configuracion-aplicaciones-canales-venta.interface';
import { 
  ConfiguracionAplicacionesCanalesVentaDto, 
  ActualizarConfiguracionAplicacionesCanalesVentaDto,
  CrearAppInstaladaDto,
  ActualizarAppInstaladaDto,
  CrearCanalVentaDto,
  ActualizarCanalVentaDto,
  CrearAppDesarrolloDto,
  ActualizarAppDesarrolloDto,
  CrearAppDesinstaladaDto,
  TipoAppEnum,
  TipoCanalEnum,
  EstadoAppEnum
} from '../../aplicacion/dto/configuracion-aplicaciones-canales-venta.dto';

/**
 * Caso de uso para la gestión de aplicaciones y canales de venta
 * Implementa la lógica de negocio para todas las operaciones relacionadas
 */
@Injectable()
export class GestionAplicacionesCanalesVentaCasoUso {
  constructor(
    @Inject('RepositorioConfiguracionAplicacionesCanalesVenta')
    private readonly repositorio: RepositorioConfiguracionAplicacionesCanalesVenta,
  ) {}

  /**
   * Obtiene la configuración de aplicaciones y canales de venta de una tienda
   */
  async obtenerPorTiendaId(tiendaId: string) {
    try {
      const configuracion = await this.repositorio.encontrarPorTiendaId(tiendaId);
      
      if (!configuracion) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de aplicaciones y canales de venta no encontrada',
          'Aplicaciones.ConfiguracionNoEncontrada'
        );
      }

      return ServicioRespuestaEstandar.Respuesta200(
        configuracion.aDto(),
        'Configuración obtenida exitosamente',
        'Aplicaciones.ConfiguracionObtenida'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al obtener configuración de aplicaciones y canales de venta',
        'Aplicaciones.ErrorObtenerConfiguracion'
      );
    }
  }

  /**
   * Crea una nueva configuración de aplicaciones y canales de venta
   */
  async crear(tiendaId: string, dto: ConfiguracionAplicacionesCanalesVentaDto) {
    try {
      // Verificar si ya existe configuración para esta tienda
      const existe = await this.repositorio.existePorTiendaId(tiendaId);
      if (existe) {
        throw ExcepcionDominio.duplicado(
          'Ya existe configuración de aplicaciones y canales de venta para esta tienda',
          'Aplicaciones.ConfiguracionYaExiste'
        );
      }

      const configuracion = ConfiguracionAplicacionesCanalesVenta.crearDesdeDto(
        this.generarIdUnico(),
        tiendaId,
        dto
      );

      const configuracionGuardada = await this.repositorio.crear(configuracion);

      return ServicioRespuestaEstandar.Respuesta201(
        configuracionGuardada.aDto(),
        'Configuración creada exitosamente',
        'Aplicaciones.ConfiguracionCreada'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al crear configuración de aplicaciones y canales de venta',
        'Aplicaciones.ErrorCrearConfiguracion'
      );
    }
  }

  /**
   * Actualiza la configuración de aplicaciones y canales de venta
   */
  async actualizar(tiendaId: string, dto: ActualizarConfiguracionAplicacionesCanalesVentaDto) {
    try {
      const configuracion = await this.repositorio.encontrarPorTiendaId(tiendaId);
      
      if (!configuracion) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de aplicaciones y canales de venta no encontrada',
          'Aplicaciones.ConfiguracionNoEncontrada'
        );
      }

      const configuracionActualizada = await this.repositorio.actualizar(configuracion);

      return ServicioRespuestaEstandar.Respuesta200(
        configuracionActualizada.aDto(),
        'Configuración actualizada exitosamente',
        'Aplicaciones.ConfiguracionActualizada'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al actualizar configuración de aplicaciones y canales de venta',
        'Aplicaciones.ErrorActualizarConfiguracion'
      );
    }
  }

  /**
   * Elimina la configuración de aplicaciones y canales de venta
   */
  async eliminar(tiendaId: string) {
    try {
      const existe = await this.repositorio.existePorTiendaId(tiendaId);
      if (!existe) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de aplicaciones y canales de venta no encontrada',
          'Aplicaciones.ConfiguracionNoEncontrada'
        );
      }

      await this.repositorio.eliminarPorTiendaId(tiendaId);

      return ServicioRespuestaEstandar.Respuesta200(
        'Configuración eliminada exitosamente',
        null,
        'Aplicaciones.ConfiguracionEliminada'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al eliminar configuración de aplicaciones y canales de venta',
        'Aplicaciones.ErrorEliminarConfiguracion'
      );
    }
  }

  /**
   * Métodos para gestionar aplicaciones instaladas
   */

  async agregarAppInstalada(tiendaId: string, dto: CrearAppInstaladaDto) {
    try {
      const configuracion = await this.repositorio.agregarAppInstalada(tiendaId, dto);
      
      return ServicioRespuestaEstandar.Respuesta201(
        configuracion.aDto(),
        'Aplicación instalada agregada exitosamente',
        'Aplicaciones.AppInstaladaAgregada'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al agregar aplicación instalada',
        'Aplicaciones.ErrorAgregarAppInstalada'
      );
    }
  }

  async actualizarAppInstalada(tiendaId: string, appId: string, dto: ActualizarAppInstaladaDto) {
    try {
      const configuracion = await this.repositorio.actualizarAppInstalada(tiendaId, appId, dto);
      
      return ServicioRespuestaEstandar.Respuesta200(
        configuracion.aDto(),
        'Aplicación instalada actualizada exitosamente',
        'Aplicaciones.AppInstaladaActualizada'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al actualizar aplicación instalada',
        'Aplicaciones.ErrorActualizarAppInstalada'
      );
    }
  }

  async eliminarAppInstalada(tiendaId: string, appId: string) {
    try {
      const configuracion = await this.repositorio.eliminarAppInstalada(tiendaId, appId);
      
      return ServicioRespuestaEstandar.Respuesta200(
        configuracion.aDto(),
        'Aplicación instalada eliminada exitosamente',
        'Aplicaciones.AppInstaladaEliminada'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al eliminar aplicación instalada',
        'Aplicaciones.ErrorEliminarAppInstalada'
      );
    }
  }

  async obtenerAppInstaladaPorId(tiendaId: string, appId: string) {
    try {
      const app = await this.repositorio.obtenerAppInstaladaPorId(tiendaId, appId);
      
      if (!app) {
        throw ExcepcionDominio.Respuesta404(
          'Aplicación instalada no encontrada',
          'Aplicaciones.AppInstaladaNoEncontrada'
        );
      }

      return ServicioRespuestaEstandar.Respuesta200(
        app,
        'Aplicación instalada obtenida exitosamente',
        'Aplicaciones.AppInstaladaObtenida'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al obtener aplicación instalada',
        'Aplicaciones.ErrorObtenerAppInstalada'
      );
    }
  }

  async obtenerAppsInstaladasPorTipo(tiendaId: string, tipo: TipoAppEnum) {
    try {
      const apps = await this.repositorio.obtenerAppsInstaladasPorTipo(tiendaId, tipo);
      
      return ServicioRespuestaEstandar.Respuesta200(
        'Aplicaciones instaladas obtenidas exitosamente',
        apps,
        'Aplicaciones.AppsInstaladasObtenidas'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al obtener aplicaciones instaladas por tipo',
        'Aplicaciones.ErrorObtenerAppsInstaladasPorTipo'
      );
    }
  }

  /**
   * Métodos para gestionar canales de venta
   */

  async agregarCanalVenta(tiendaId: string, dto: CrearCanalVentaDto) {
    try {
      const configuracion = await this.repositorio.agregarCanalVenta(tiendaId, dto);
      
      return ServicioRespuestaEstandar.Respuesta201(
        configuracion.aDto(),
        'Canal de venta agregado exitosamente',
        'Aplicaciones.CanalVentaAgregado'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al agregar canal de venta',
        'Aplicaciones.ErrorAgregarCanalVenta'
      );
    }
  }

  async actualizarCanalVenta(tiendaId: string, canalId: string, dto: ActualizarCanalVentaDto) {
    try {
      const configuracion = await this.repositorio.actualizarCanalVenta(tiendaId, canalId, dto);
      
      return ServicioRespuestaEstandar.Respuesta200(
        configuracion.aDto(),
        'Canal de venta actualizado exitosamente',
        'Aplicaciones.CanalVentaActualizado'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al actualizar canal de venta',
        'Aplicaciones.ErrorActualizarCanalVenta'
      );
    }
  }

  async eliminarCanalVenta(tiendaId: string, canalId: string) {
    try {
      const configuracion = await this.repositorio.eliminarCanalVenta(tiendaId, canalId);
      
      return ServicioRespuestaEstandar.Respuesta200(
        configuracion.aDto(),
        'Canal de venta eliminado exitosamente',
        'Aplicaciones.CanalVentaEliminado'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al eliminar canal de venta',
        'Aplicaciones.ErrorEliminarCanalVenta'
      );
    }
  }

  async obtenerCanalVentaPorId(tiendaId: string, canalId: string) {
    try {
      const canal = await this.repositorio.obtenerCanalVentaPorId(tiendaId, canalId);
      
      if (!canal) {
        throw ExcepcionDominio.Respuesta404(
          'Canal de venta no encontrado',
          'Aplicaciones.CanalVentaNoEncontrado'
        );
      }

      return ServicioRespuestaEstandar.Respuesta200(
        canal,
        'Canal de venta obtenido exitosamente',
        'Aplicaciones.CanalVentaObtenido'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al obtener canal de venta',
        'Aplicaciones.ErrorObtenerCanalVenta'
      );
    }
  }

  async obtenerCanalesVentaPorTipo(tiendaId: string, tipo: TipoCanalEnum) {
    try {
      const canales = await this.repositorio.obtenerCanalesVentaPorTipo(tiendaId, tipo);
      
      return ServicioRespuestaEstandar.Respuesta200(
        'Canales de venta obtenidos exitosamente',
        canales,
        'Aplicaciones.CanalesVentaObtenidos'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al obtener canales de venta por tipo',
        'Aplicaciones.ErrorObtenerCanalesVentaPorTipo'
      );
    }
  }

  async obtenerCanalesVentaActivos(tiendaId: string) {
    try {
      const canales = await this.repositorio.obtenerCanalesVentaActivos(tiendaId);
      
      return ServicioRespuestaEstandar.Respuesta200(
        'Canales de venta activos obtenidos exitosamente',
        canales,
        'Aplicaciones.CanalesVentaActivosObtenidos'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al obtener canales de venta activos',
        'Aplicaciones.ErrorObtenerCanalesVentaActivos'
      );
    }
  }

  /**
   * Métodos para gestionar aplicaciones en desarrollo
   */

  async agregarAppDesarrollo(tiendaId: string, dto: CrearAppDesarrolloDto) {
    try {
      const configuracion = await this.repositorio.agregarAppDesarrollo(tiendaId, dto);
      
      return ServicioRespuestaEstandar.Respuesta201(
        configuracion.aDto(),
        'Aplicación en desarrollo agregada exitosamente',
        'Aplicaciones.AppDesarrolloAgregada'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al agregar aplicación en desarrollo',
        'Aplicaciones.ErrorAgregarAppDesarrollo'
      );
    }
  }

  async actualizarAppDesarrollo(tiendaId: string, appId: string, dto: ActualizarAppDesarrolloDto) {
    try {
      const configuracion = await this.repositorio.actualizarAppDesarrollo(tiendaId, appId, dto);
      
      return ServicioRespuestaEstandar.Respuesta200(
        configuracion.aDto(),
        'Aplicación en desarrollo actualizada exitosamente',
        'Aplicaciones.AppDesarrolloActualizada'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al actualizar aplicación en desarrollo',
        'Aplicaciones.ErrorActualizarAppDesarrollo'
      );
    }
  }

  async eliminarAppDesarrollo(tiendaId: string, appId: string) {
    try {
      const configuracion = await this.repositorio.eliminarAppDesarrollo(tiendaId, appId);
      
      return ServicioRespuestaEstandar.Respuesta200(
        configuracion.aDto(),
        'Aplicación en desarrollo eliminada exitosamente',
        'Aplicaciones.AppDesarrolloEliminada'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al eliminar aplicación en desarrollo',
        'Aplicaciones.ErrorEliminarAppDesarrollo'
      );
    }
  }

  async obtenerAppDesarrolloPorId(tiendaId: string, appId: string) {
    try {
      const app = await this.repositorio.obtenerAppDesarrolloPorId(tiendaId, appId);
      
      if (!app) {
        throw ExcepcionDominio.Respuesta404(
          'Aplicación en desarrollo no encontrada',
          'Aplicaciones.AppDesarrolloNoEncontrada'
        );
      }

      return ServicioRespuestaEstandar.Respuesta200(
        app,
        'Aplicación en desarrollo obtenida exitosamente',
        'Aplicaciones.AppDesarrolloObtenida'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al obtener aplicación en desarrollo',
        'Aplicaciones.ErrorObtenerAppDesarrollo'
      );
    }
  }

  async obtenerAppsDesarrolloPorEstado(tiendaId: string, estado: EstadoAppEnum) {
    try {
      const apps = await this.repositorio.obtenerAppsDesarrolloPorEstado(tiendaId, estado);
      
      return ServicioRespuestaEstandar.Respuesta200(
        'Aplicaciones en desarrollo obtenidas exitosamente',
        apps,
        'Aplicaciones.AppsDesarrolloObtenidas'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al obtener aplicaciones en desarrollo por estado',
        'Aplicaciones.ErrorObtenerAppsDesarrolloPorEstado'
      );
    }
  }

  /**
   * Métodos para gestionar aplicaciones desinstaladas
   */

  async agregarAppDesinstalada(tiendaId: string, dto: CrearAppDesinstaladaDto) {
    try {
      const configuracion = await this.repositorio.agregarAppDesinstalada(tiendaId, dto);
      
      return ServicioRespuestaEstandar.Respuesta201(
        configuracion.aDto(),
        'Aplicación desinstalada agregada exitosamente',
        'Aplicaciones.AppDesinstaladaAgregada'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al agregar aplicación desinstalada',
        'Aplicaciones.ErrorAgregarAppDesinstalada'
      );
    }
  }

  async eliminarAppDesinstalada(tiendaId: string, appId: string) {
    try {
      const configuracion = await this.repositorio.eliminarAppDesinstalada(tiendaId, appId);
      
      return ServicioRespuestaEstandar.Respuesta200(
        configuracion.aDto(),
        'Aplicación desinstalada eliminada exitosamente',
        'Aplicaciones.AppDesinstaladaEliminada'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al eliminar aplicación desinstalada',
        'Aplicaciones.ErrorEliminarAppDesinstalada'
      );
    }
  }

  /**
   * Métodos de consulta y estadísticas
   */

  async contarAppsInstaladas(tiendaId: string) {
    try {
      const total = await this.repositorio.contarAppsInstaladas(tiendaId);
      
      return ServicioRespuestaEstandar.Respuesta200(
        'Conteo de aplicaciones instaladas obtenido exitosamente',
        { total },
        'Aplicaciones.ContadorAppsInstaladasObtenido'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al contar aplicaciones instaladas',
        'Aplicaciones.ErrorContarAppsInstaladas'
      );
    }
  }

  async contarCanalesVentaActivos(tiendaId: string) {
    try {
      const total = await this.repositorio.contarCanalesVentaActivos(tiendaId);
      
      return ServicioRespuestaEstandar.Respuesta200(
        'Conteo de canales de venta activos obtenido exitosamente',
        { total },
        'Aplicaciones.ContadorCanalesVentaActivosObtenido'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al contar canales de venta activos',
        'Aplicaciones.ErrorContarCanalesVentaActivos'
      );
    }
  }

  async contarAppsEnDesarrollo(tiendaId: string) {
    try {
      const total = await this.repositorio.contarAppsEnDesarrollo(tiendaId);
      
      return ServicioRespuestaEstandar.Respuesta200(
        'Conteo de aplicaciones en desarrollo obtenido exitosamente',
        { total },
        'Aplicaciones.ContadorAppsDesarrolloObtenido'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al contar aplicaciones en desarrollo',
        'Aplicaciones.ErrorContarAppsDesarrollo'
      );
    }
  }

  /**
   * Método auxiliar para generar IDs únicos
   */
  private generarIdUnico(): string {
    return `config-app-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}