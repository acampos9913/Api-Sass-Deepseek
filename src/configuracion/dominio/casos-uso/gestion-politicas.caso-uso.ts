import { Injectable, Inject } from '@nestjs/common';
import { ServicioRespuestaEstandar } from '../../../comun/aplicacion/servicios/servicio-respuesta-estandar';
import { ExcepcionDominio } from '../../../comun/excepciones/excepcion-dominio';
import type { RepositorioConfiguracionPoliticas } from '../interfaces/repositorio-configuracion-politicas.interface';
import { ConfiguracionPoliticas } from '../entidades/configuracion-politicas.entity';
import { ConfiguracionPoliticasDto, ActualizarConfiguracionPoliticasDto, EstadoReglasDevolucionEnum, TipoReglaDevolucionEnum, ReglaDevolucionDto } from '../../aplicacion/dto/configuracion-politicas.dto';

/**
 * Caso de uso para la gestión de configuración de políticas
 * Contiene la lógica de aplicación para operaciones CRUD de políticas
 */
@Injectable()
export class GestionPoliticasCasoUso {
  constructor(
    @Inject('RepositorioConfiguracionPoliticas')
    private readonly repositorioPoliticas: RepositorioConfiguracionPoliticas,
  ) {}

  /**
   * Crear una nueva configuración de políticas
   */
  async crear(
    tiendaId: string,
    dto: ConfiguracionPoliticasDto,
  ): Promise<any> {
    try {
      // Verificar que no exista ya una configuración para esta tienda
      const existeConfiguracion = await this.repositorioPoliticas.existePorTiendaId(tiendaId);
      if (existeConfiguracion) {
        throw ExcepcionDominio.duplicado(
          `Configuración de políticas para la tienda '${tiendaId}'`,
          'Politicas.ConfiguracionYaExiste'
        );
      }

      // Generar ID único
      const id = this.generarIdUnico();

      // Crear entidad de dominio
      const configuracion = ConfiguracionPoliticas.crearDesdeDto(id, tiendaId, {
        ...dto,
        estado_reglas_devolucion: dto.estado_reglas_devolucion || EstadoReglasDevolucionEnum.DESACTIVADO,
        reglas_devolucion: dto.reglas_devolucion || [],
        productos_venta_final: dto.productos_venta_final || [],
      });

      // Guardar en el repositorio
      const configuracionGuardada = await this.repositorioPoliticas.guardar(configuracion);

      return ServicioRespuestaEstandar.Respuesta201(
        'Configuración de políticas creada exitosamente',
        configuracionGuardada.aDto(),
        'Politicas.ConfiguracionCreadaExitosamente'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al crear configuración de políticas',
        'Politicas.ErrorCrearConfiguracion'
      );
    }
  }

  /**
   * Obtener configuración de políticas por ID de tienda
   */
  async obtenerPorTiendaId(tiendaId: string): Promise<any> {
    try {
      const configuracion = await this.repositorioPoliticas.buscarPorTiendaId(tiendaId);
      
      if (!configuracion) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de políticas no encontrada',
          'Politicas.ConfiguracionNoEncontrada'
        );
      }

      return ServicioRespuestaEstandar.Respuesta200(
        'Configuración de políticas obtenida exitosamente',
        configuracion.aDto(),
        'Politicas.ConfiguracionObtenidaExitosamente'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al obtener configuración de políticas',
        'Politicas.ErrorObtenerConfiguracion'
      );
    }
  }

  /**
   * Actualizar configuración de políticas existente
   */
  async actualizar(
    tiendaId: string,
    dto: ActualizarConfiguracionPoliticasDto,
  ): Promise<any> {
    try {
      const configuracion = await this.repositorioPoliticas.buscarPorTiendaId(tiendaId);
      
      if (!configuracion) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de políticas no encontrada',
          'Politicas.ConfiguracionNoEncontrada'
        );
      }

      // Actualizar entidad de dominio
      configuracion.actualizar(dto);

      // Guardar cambios
      const configuracionActualizada = await this.repositorioPoliticas.actualizar(configuracion);

      return ServicioRespuestaEstandar.Respuesta200(
        'Configuración de políticas actualizada exitosamente',
        configuracionActualizada.aDto(),
        'Politicas.ConfiguracionActualizadaExitosamente'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al actualizar configuración de políticas',
        'Politicas.ErrorActualizarConfiguracion'
      );
    }
  }

  /**
   * Eliminar configuración de políticas
   */
  async eliminar(tiendaId: string): Promise<any> {
    try {
      const configuracion = await this.repositorioPoliticas.buscarPorTiendaId(tiendaId);
      
      if (!configuracion) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de políticas no encontrada',
          'Politicas.ConfiguracionNoEncontrada'
        );
      }

      await this.repositorioPoliticas.eliminar(configuracion.id);

      return ServicioRespuestaEstandar.Respuesta200(
        'Configuración de políticas eliminada exitosamente',
        null,
        'Politicas.ConfiguracionEliminadaExitosamente'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al eliminar configuración de políticas',
        'Politicas.ErrorEliminarConfiguracion'
      );
    }
  }

  /**
   * Activar reglas de devolución
   */
  async activarReglasDevolucion(tiendaId: string): Promise<any> {
    try {
      const configuracion = await this.repositorioPoliticas.buscarPorTiendaId(tiendaId);
      
      if (!configuracion) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de políticas no encontrada',
          'Politicas.ConfiguracionNoEncontrada'
        );
      }

      configuracion.activarReglasDevolucion();
      const configuracionActualizada = await this.repositorioPoliticas.actualizar(configuracion);

      return ServicioRespuestaEstandar.Respuesta200(
        'Reglas de devolución activadas exitosamente',
        configuracionActualizada.aDto(),
        'Politicas.ReglasDevolucionActivadasExitosamente'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al activar reglas de devolución',
        'Politicas.ErrorActivarReglasDevolucion'
      );
    }
  }

  /**
   * Desactivar reglas de devolución
   */
  async desactivarReglasDevolucion(tiendaId: string): Promise<any> {
    try {
      const configuracion = await this.repositorioPoliticas.buscarPorTiendaId(tiendaId);
      
      if (!configuracion) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de políticas no encontrada',
          'Politicas.ConfiguracionNoEncontrada'
        );
      }

      configuracion.desactivarReglasDevolucion();
      const configuracionActualizada = await this.repositorioPoliticas.actualizar(configuracion);

      return ServicioRespuestaEstandar.Respuesta200(
        'Reglas de devolución desactivadas exitosamente',
        configuracionActualizada.aDto(),
        'Politicas.ReglasDevolucionDesactivadasExitosamente'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al desactivar reglas de devolución',
        'Politicas.ErrorDesactivarReglasDevolucion'
      );
    }
  }

  /**
   * Agregar regla de devolución
   */
  async agregarReglaDevolucion(
    tiendaId: string,
    regla: ReglaDevolucionDto,
  ): Promise<any> {
    try {
      const configuracion = await this.repositorioPoliticas.buscarPorTiendaId(tiendaId);
      
      if (!configuracion) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de políticas no encontrada',
          'Politicas.ConfiguracionNoEncontrada'
        );
      }

      configuracion.agregarReglaDevolucion(regla);
      const configuracionActualizada = await this.repositorioPoliticas.actualizar(configuracion);

      return ServicioRespuestaEstandar.Respuesta200(
        'Regla de devolución agregada exitosamente',
        configuracionActualizada.aDto(),
        'Politicas.ReglaDevolucionAgregadaExitosamente'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al agregar regla de devolución',
        'Politicas.ErrorAgregarReglaDevolucion'
      );
    }
  }

  /**
   * Actualizar regla de devolución
   */
  async actualizarReglaDevolucion(
    tiendaId: string,
    indice: number,
    regla: ReglaDevolucionDto,
  ): Promise<any> {
    try {
      const configuracion = await this.repositorioPoliticas.buscarPorTiendaId(tiendaId);
      
      if (!configuracion) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de políticas no encontrada',
          'Politicas.ConfiguracionNoEncontrada'
        );
      }

      configuracion.actualizarReglaDevolucion(indice, regla);
      const configuracionActualizada = await this.repositorioPoliticas.actualizar(configuracion);

      return ServicioRespuestaEstandar.Respuesta200(
        'Regla de devolución actualizada exitosamente',
        configuracionActualizada.aDto(),
        'Politicas.ReglaDevolucionActualizadaExitosamente'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al actualizar regla de devolución',
        'Politicas.ErrorActualizarReglaDevolucion'
      );
    }
  }

  /**
   * Eliminar regla de devolución
   */
  async eliminarReglaDevolucion(
    tiendaId: string,
    indice: number,
  ): Promise<any> {
    try {
      const configuracion = await this.repositorioPoliticas.buscarPorTiendaId(tiendaId);
      
      if (!configuracion) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de políticas no encontrada',
          'Politicas.ConfiguracionNoEncontrada'
        );
      }

      configuracion.eliminarReglaDevolucion(indice);
      const configuracionActualizada = await this.repositorioPoliticas.actualizar(configuracion);

      return ServicioRespuestaEstandar.Respuesta200(
        'Regla de devolución eliminada exitosamente',
        configuracionActualizada.aDto(),
        'Politicas.ReglaDevolucionEliminadaExitosamente'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al eliminar regla de devolución',
        'Politicas.ErrorEliminarReglaDevolucion'
      );
    }
  }

  /**
   * Agregar producto a venta final
   */
  async agregarProductoVentaFinal(
    tiendaId: string,
    productoId: string,
  ): Promise<any> {
    try {
      const configuracion = await this.repositorioPoliticas.buscarPorTiendaId(tiendaId);
      
      if (!configuracion) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de políticas no encontrada',
          'Politicas.ConfiguracionNoEncontrada'
        );
      }

      configuracion.agregarProductoVentaFinal(productoId);
      const configuracionActualizada = await this.repositorioPoliticas.actualizar(configuracion);

      return ServicioRespuestaEstandar.Respuesta200(
        'Producto agregado a venta final exitosamente',
        configuracionActualizada.aDto(),
        'Politicas.ProductoVentaFinalAgregadoExitosamente'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al agregar producto a venta final',
        'Politicas.ErrorAgregarProductoVentaFinal'
      );
    }
  }

  /**
   * Eliminar producto de venta final
   */
  async eliminarProductoVentaFinal(
    tiendaId: string,
    productoId: string,
  ): Promise<any> {
    try {
      const configuracion = await this.repositorioPoliticas.buscarPorTiendaId(tiendaId);
      
      if (!configuracion) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de políticas no encontrada',
          'Politicas.ConfiguracionNoEncontrada'
        );
      }

      configuracion.eliminarProductoVentaFinal(productoId);
      const configuracionActualizada = await this.repositorioPoliticas.actualizar(configuracion);

      return ServicioRespuestaEstandar.Respuesta200(
        'Producto eliminado de venta final exitosamente',
        configuracionActualizada.aDto(),
        'Politicas.ProductoVentaFinalEliminadoExitosamente'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al eliminar producto de venta final',
        'Politicas.ErrorEliminarProductoVentaFinal'
      );
    }
  }

  /**
   * Verificar si las reglas de devolución están activas
   */
  async verificarReglasDevolucionActivas(tiendaId: string): Promise<any> {
    try {
      const configuracion = await this.repositorioPoliticas.buscarPorTiendaId(tiendaId);
      
      if (!configuracion) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de políticas no encontrada',
          'Politicas.ConfiguracionNoEncontrada'
        );
      }

      const reglasActivas = configuracion.reglasDevolucionEstanActivas();

      return ServicioRespuestaEstandar.Respuesta200(
        'Estado de reglas de devolución obtenido exitosamente',
        { reglas_activas: reglasActivas },
        'Politicas.EstadoReglasDevolucionObtenidoExitosamente'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al verificar reglas de devolución',
        'Politicas.ErrorVerificarReglasDevolucion'
      );
    }
  }

  /**
   * Verificar si un producto es de venta final
   */
  async verificarProductoVentaFinal(
    tiendaId: string,
    productoId: string,
  ): Promise<any> {
    try {
      const configuracion = await this.repositorioPoliticas.buscarPorTiendaId(tiendaId);
      
      if (!configuracion) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de políticas no encontrada',
          'Politicas.ConfiguracionNoEncontrada'
        );
      }

      const esVentaFinal = configuracion.esProductoVentaFinal(productoId);

      return ServicioRespuestaEstandar.Respuesta200(
        'Estado de producto en venta final obtenido exitosamente',
        { es_venta_final: esVentaFinal },
        'Politicas.EstadoProductoVentaFinalObtenidoExitosamente'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al verificar producto en venta final',
        'Politicas.ErrorVerificarProductoVentaFinal'
      );
    }
  }

  /**
   * Obtener reglas de devolución activas
   */
  async obtenerReglasDevolucionActivas(tiendaId: string): Promise<any> {
    try {
      const configuracion = await this.repositorioPoliticas.buscarPorTiendaId(tiendaId);
      
      if (!configuracion) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de políticas no encontrada',
          'Politicas.ConfiguracionNoEncontrada'
        );
      }

      const reglasActivas = configuracion.obtenerReglasDevolucionActivas();

      return ServicioRespuestaEstandar.Respuesta200(
        'Reglas de devolución activas obtenidas exitosamente',
        { reglas_activas: reglasActivas },
        'Politicas.ReglasDevolucionActivasObtenidasExitosamente'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al obtener reglas de devolución activas',
        'Politicas.ErrorObtenerReglasDevolucionActivas'
      );
    }
  }

  /**
   * Generar ID único para la configuración
   */
  private generarIdUnico(): string {
    return `pol-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}