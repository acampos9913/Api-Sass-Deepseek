import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { ConfiguracionAplicacionesCanalesVenta } from '../../dominio/entidades/configuracion-aplicaciones-canales-venta.entity';
import { RepositorioConfiguracionAplicacionesCanalesVenta } from '../../dominio/interfaces/repositorio-configuracion-aplicaciones-canales-venta.interface';
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
import { ExcepcionDominio } from '../../../comun/excepciones/excepcion-dominio';

/**
 * Implementación del repositorio de configuración de aplicaciones y canales de venta usando Prisma
 * Maneja la persistencia en PostgreSQL siguiendo la arquitectura limpia
 */
@Injectable()
export class PrismaRepositorioConfiguracionAplicacionesCanalesVenta 
  implements RepositorioConfiguracionAplicacionesCanalesVenta 
{
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Encuentra la configuración de aplicaciones y canales de venta por ID de tienda
   */
  async encontrarPorTiendaId(tiendaId: string): Promise<ConfiguracionAplicacionesCanalesVenta | null> {
    try {
      const configuracion = await this.prisma.configuracionAplicacionesCanalesVenta.findUnique({
        where: { tienda_id: tiendaId },
      });

      if (!configuracion) {
        return null;
      }

      return ConfiguracionAplicacionesCanalesVenta.crear(
        configuracion.id,
        configuracion.tienda_id,
        configuracion.apps_instaladas as any,
        configuracion.canales_venta as any,
        configuracion.apps_desarrollo as any,
        configuracion.apps_desinstaladas as any,
      );
    } catch (error) {
      throw ExcepcionDominio.Respuesta500(
        'Error al buscar configuración de aplicaciones y canales de venta',
        'Aplicaciones.ErrorBuscarConfiguracion'
      );
    }
  }

  /**
   * Crea una nueva configuración de aplicaciones y canales de venta
   */
  async crear(configuracion: ConfiguracionAplicacionesCanalesVenta): Promise<ConfiguracionAplicacionesCanalesVenta> {
    try {
      const configuracionCreada = await this.prisma.configuracionAplicacionesCanalesVenta.create({
        data: {
          id: configuracion.id,
          tienda_id: configuracion.tiendaId,
          apps_instaladas: configuracion.appsInstaladas,
          canales_venta: configuracion.canalesVenta,
          apps_desarrollo: configuracion.appsDesarrollo,
          apps_desinstaladas: configuracion.appsDesinstaladas,
          fecha_creacion: configuracion.fechaCreacion,
          fecha_actualizacion: configuracion.fechaActualizacion,
        },
      });

      return ConfiguracionAplicacionesCanalesVenta.crear(
        configuracionCreada.id,
        configuracionCreada.tienda_id,
        configuracionCreada.apps_instaladas as any,
        configuracionCreada.canales_venta as any,
        configuracionCreada.apps_desarrollo as any,
        configuracionCreada.apps_desinstaladas as any,
      );
    } catch (error) {
      throw ExcepcionDominio.Respuesta500(
        'Error al crear configuración de aplicaciones y canales de venta',
        'Aplicaciones.ErrorCrearConfiguracion'
      );
    }
  }

  /**
   * Actualiza una configuración existente de aplicaciones y canales de venta
   */
  async actualizar(configuracion: ConfiguracionAplicacionesCanalesVenta): Promise<ConfiguracionAplicacionesCanalesVenta> {
    try {
      const configuracionActualizada = await this.prisma.configuracionAplicacionesCanalesVenta.update({
        where: { id: configuracion.id },
        data: {
          apps_instaladas: configuracion.appsInstaladas,
          canales_venta: configuracion.canalesVenta,
          apps_desarrollo: configuracion.appsDesarrollo,
          apps_desinstaladas: configuracion.appsDesinstaladas,
          fecha_actualizacion: configuracion.fechaActualizacion,
        },
      });

      return ConfiguracionAplicacionesCanalesVenta.crear(
        configuracionActualizada.id,
        configuracionActualizada.tienda_id,
        configuracionActualizada.apps_instaladas as any,
        configuracionActualizada.canales_venta as any,
        configuracionActualizada.apps_desarrollo as any,
        configuracionActualizada.apps_desinstaladas as any,
      );
    } catch (error) {
      throw ExcepcionDominio.Respuesta500(
        'Error al actualizar configuración de aplicaciones y canales de venta',
        'Aplicaciones.ErrorActualizarConfiguracion'
      );
    }
  }

  /**
   * Elimina la configuración de aplicaciones y canales de venta por ID de tienda
   */
  async eliminarPorTiendaId(tiendaId: string): Promise<void> {
    try {
      await this.prisma.configuracionAplicacionesCanalesVenta.delete({
        where: { tienda_id: tiendaId },
      });
    } catch (error) {
      throw ExcepcionDominio.Respuesta500(
        'Error al eliminar configuración de aplicaciones y canales de venta',
        'Aplicaciones.ErrorEliminarConfiguracion'
      );
    }
  }

  /**
   * Métodos específicos para aplicaciones instaladas
   */

  async agregarAppInstalada(tiendaId: string, dto: CrearAppInstaladaDto): Promise<ConfiguracionAplicacionesCanalesVenta> {
    try {
      const configuracion = await this.encontrarPorTiendaId(tiendaId);
      if (!configuracion) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de aplicaciones y canales de venta no encontrada',
          'Aplicaciones.ConfiguracionNoEncontrada'
        );
      }

      configuracion.agregarAppInstalada(dto);
      return await this.actualizar(configuracion);
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

  async actualizarAppInstalada(tiendaId: string, appId: string, dto: ActualizarAppInstaladaDto): Promise<ConfiguracionAplicacionesCanalesVenta> {
    try {
      const configuracion = await this.encontrarPorTiendaId(tiendaId);
      if (!configuracion) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de aplicaciones y canales de venta no encontrada',
          'Aplicaciones.ConfiguracionNoEncontrada'
        );
      }

      configuracion.actualizarAppInstalada(appId, dto);
      return await this.actualizar(configuracion);
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

  async eliminarAppInstalada(tiendaId: string, appId: string): Promise<ConfiguracionAplicacionesCanalesVenta> {
    try {
      const configuracion = await this.encontrarPorTiendaId(tiendaId);
      if (!configuracion) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de aplicaciones y canales de venta no encontrada',
          'Aplicaciones.ConfiguracionNoEncontrada'
        );
      }

      configuracion.eliminarAppInstalada(appId);
      return await this.actualizar(configuracion);
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

  async obtenerAppInstaladaPorId(tiendaId: string, appId: string): Promise<any | null> {
    try {
      const configuracion = await this.encontrarPorTiendaId(tiendaId);
      if (!configuracion) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de aplicaciones y canales de venta no encontrada',
          'Aplicaciones.ConfiguracionNoEncontrada'
        );
      }

      return configuracion.obtenerAppInstaladaPorId(appId);
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al obtener aplicación instalada por ID',
        'Aplicaciones.ErrorObtenerAppInstaladaPorId'
      );
    }
  }

  async obtenerAppsInstaladasPorTipo(tiendaId: string, tipo: TipoAppEnum): Promise<any[]> {
    try {
      const configuracion = await this.encontrarPorTiendaId(tiendaId);
      if (!configuracion) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de aplicaciones y canales de venta no encontrada',
          'Aplicaciones.ConfiguracionNoEncontrada'
        );
      }

      return configuracion.obtenerAppsInstaladasPorTipo(tipo);
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
   * Métodos específicos para canales de venta
   */

  async agregarCanalVenta(tiendaId: string, dto: CrearCanalVentaDto): Promise<ConfiguracionAplicacionesCanalesVenta> {
    try {
      const configuracion = await this.encontrarPorTiendaId(tiendaId);
      if (!configuracion) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de aplicaciones y canales de venta no encontrada',
          'Aplicaciones.ConfiguracionNoEncontrada'
        );
      }

      configuracion.agregarCanalVenta(dto);
      return await this.actualizar(configuracion);
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

  async actualizarCanalVenta(tiendaId: string, canalId: string, dto: ActualizarCanalVentaDto): Promise<ConfiguracionAplicacionesCanalesVenta> {
    try {
      const configuracion = await this.encontrarPorTiendaId(tiendaId);
      if (!configuracion) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de aplicaciones y canales de venta no encontrada',
          'Aplicaciones.ConfiguracionNoEncontrada'
        );
      }

      configuracion.actualizarCanalVenta(canalId, dto);
      return await this.actualizar(configuracion);
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

  async eliminarCanalVenta(tiendaId: string, canalId: string): Promise<ConfiguracionAplicacionesCanalesVenta> {
    try {
      const configuracion = await this.encontrarPorTiendaId(tiendaId);
      if (!configuracion) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de aplicaciones y canales de venta no encontrada',
          'Aplicaciones.ConfiguracionNoEncontrada'
        );
      }

      configuracion.eliminarCanalVenta(canalId);
      return await this.actualizar(configuracion);
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

  async obtenerCanalVentaPorId(tiendaId: string, canalId: string): Promise<any | null> {
    try {
      const configuracion = await this.encontrarPorTiendaId(tiendaId);
      if (!configuracion) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de aplicaciones y canales de venta no encontrada',
          'Aplicaciones.ConfiguracionNoEncontrada'
        );
      }

      return configuracion.obtenerCanalVentaPorId(canalId);
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al obtener canal de venta por ID',
        'Aplicaciones.ErrorObtenerCanalVentaPorId'
      );
    }
  }

  async obtenerCanalesVentaPorTipo(tiendaId: string, tipo: TipoCanalEnum): Promise<any[]> {
    try {
      const configuracion = await this.encontrarPorTiendaId(tiendaId);
      if (!configuracion) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de aplicaciones y canales de venta no encontrada',
          'Aplicaciones.ConfiguracionNoEncontrada'
        );
      }

      return configuracion.obtenerCanalesVentaPorTipo(tipo);
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

  async obtenerCanalesVentaActivos(tiendaId: string): Promise<any[]> {
    try {
      const configuracion = await this.encontrarPorTiendaId(tiendaId);
      if (!configuracion) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de aplicaciones y canales de venta no encontrada',
          'Aplicaciones.ConfiguracionNoEncontrada'
        );
      }

      return configuracion.canalesVenta.filter(canal => canal.activo);
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
   * Métodos específicos para aplicaciones en desarrollo
   */

  async agregarAppDesarrollo(tiendaId: string, dto: CrearAppDesarrolloDto): Promise<ConfiguracionAplicacionesCanalesVenta> {
    try {
      const configuracion = await this.encontrarPorTiendaId(tiendaId);
      if (!configuracion) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de aplicaciones y canales de venta no encontrada',
          'Aplicaciones.ConfiguracionNoEncontrada'
        );
      }

      configuracion.agregarAppDesarrollo(dto);
      return await this.actualizar(configuracion);
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

  async actualizarAppDesarrollo(tiendaId: string, appId: string, dto: ActualizarAppDesarrolloDto): Promise<ConfiguracionAplicacionesCanalesVenta> {
    try {
      const configuracion = await this.encontrarPorTiendaId(tiendaId);
      if (!configuracion) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de aplicaciones y canales de venta no encontrada',
          'Aplicaciones.ConfiguracionNoEncontrada'
        );
      }

      configuracion.actualizarAppDesarrollo(appId, dto);
      return await this.actualizar(configuracion);
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

  async eliminarAppDesarrollo(tiendaId: string, appId: string): Promise<ConfiguracionAplicacionesCanalesVenta> {
    try {
      const configuracion = await this.encontrarPorTiendaId(tiendaId);
      if (!configuracion) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de aplicaciones y canales de venta no encontrada',
          'Aplicaciones.ConfiguracionNoEncontrada'
        );
      }

      configuracion.eliminarAppDesarrollo(appId);
      return await this.actualizar(configuracion);
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

  async obtenerAppDesarrolloPorId(tiendaId: string, appId: string): Promise<any | null> {
    try {
      const configuracion = await this.encontrarPorTiendaId(tiendaId);
      if (!configuracion) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de aplicaciones y canales de venta no encontrada',
          'Aplicaciones.ConfiguracionNoEncontrada'
        );
      }

      return configuracion.obtenerAppDesarrolloPorId(appId);
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al obtener aplicación en desarrollo por ID',
        'Aplicaciones.ErrorObtenerAppDesarrolloPorId'
      );
    }
  }

  async obtenerAppsDesarrolloPorEstado(tiendaId: string, estado: EstadoAppEnum): Promise<any[]> {
    try {
      const configuracion = await this.encontrarPorTiendaId(tiendaId);
      if (!configuracion) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de aplicaciones y canales de venta no encontrada',
          'Aplicaciones.ConfiguracionNoEncontrada'
        );
      }

      return configuracion.obtenerAppsDesarrolloPorEstado(estado);
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
   * Métodos específicos para aplicaciones desinstaladas
   */

  async agregarAppDesinstalada(tiendaId: string, dto: CrearAppDesinstaladaDto): Promise<ConfiguracionAplicacionesCanalesVenta> {
    try {
      const configuracion = await this.encontrarPorTiendaId(tiendaId);
      if (!configuracion) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de aplicaciones y canales de venta no encontrada',
          'Aplicaciones.ConfiguracionNoEncontrada'
        );
      }

      configuracion.agregarAppDesinstalada(dto);
      return await this.actualizar(configuracion);
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

  async eliminarAppDesinstalada(tiendaId: string, appId: string): Promise<ConfiguracionAplicacionesCanalesVenta> {
    try {
      const configuracion = await this.encontrarPorTiendaId(tiendaId);
      if (!configuracion) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de aplicaciones y canales de venta no encontrada',
          'Aplicaciones.ConfiguracionNoEncontrada'
        );
      }

      configuracion.eliminarAppDesinstalada(appId);
      return await this.actualizar(configuracion);
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

  async contarAppsInstaladas(tiendaId: string): Promise<number> {
    try {
      const configuracion = await this.encontrarPorTiendaId(tiendaId);
      if (!configuracion) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de aplicaciones y canales de venta no encontrada',
          'Aplicaciones.ConfiguracionNoEncontrada'
        );
      }

      return configuracion.contarAppsInstaladas();
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

  async contarCanalesVentaActivos(tiendaId: string): Promise<number> {
    try {
      const configuracion = await this.encontrarPorTiendaId(tiendaId);
      if (!configuracion) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de aplicaciones y canales de venta no encontrada',
          'Aplicaciones.ConfiguracionNoEncontrada'
        );
      }

      return configuracion.contarCanalesVentaActivos();
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

  async contarAppsEnDesarrollo(tiendaId: string): Promise<number> {
    try {
      const configuracion = await this.encontrarPorTiendaId(tiendaId);
      if (!configuracion) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de aplicaciones y canales de venta no encontrada',
          'Aplicaciones.ConfiguracionNoEncontrada'
        );
      }

      return configuracion.contarAppsEnDesarrollo();
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
   * Verifica si existe configuración para una tienda
   */
  async existePorTiendaId(tiendaId: string): Promise<boolean> {
    try {
      const configuracion = await this.prisma.configuracionAplicacionesCanalesVenta.findUnique({
        where: { tienda_id: tiendaId },
        select: { id: true },
      });

      return !!configuracion;
    } catch (error) {
      throw ExcepcionDominio.Respuesta500(
        'Error al verificar existencia de configuración',
        'Aplicaciones.ErrorVerificarExistencia'
      );
    }
  }
}