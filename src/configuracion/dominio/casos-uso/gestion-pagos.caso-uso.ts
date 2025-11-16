import { Injectable, Inject } from '@nestjs/common';
import { ConfiguracionPagos } from '../entidades/configuracion-pagos.entity';
import type { RepositorioConfiguracionPagos } from '../interfaces/repositorio-configuracion-pagos.interface';
import { 
  CrearConfiguracionPagosDto, 
  ActualizarConfiguracionPagosDto,
  ModoCapturaPago,
  TipoProveedorPago,
  MetodoPago,
  CaducidadGiftcard,
  ProveedorPagoDto,
  MetodoPagoDto,
  MetodoPagoManualDto,
  ConfiguracionGiftcardDto,
  PersonalizacionPagosDto,
  RespuestaConfiguracionPagosDto
} from '../../aplicacion/dto/configuracion-pagos.dto';
import { ExcepcionDominio } from '../../../comun/excepciones/excepcion-dominio';
import { ServicioRespuestaEstandar, RespuestaEstandar } from '../../../comun/aplicacion/servicios/servicio-respuesta-estandar';

/**
 * Caso de uso para gestionar la configuración de pagos de la tienda
 * Implementa todas las operaciones CRUD y validaciones de negocio
 */
@Injectable()
export class GestionPagosCasoUso {
  constructor(
    @Inject('RepositorioConfiguracionPagos')
    private readonly repositorioConfiguracionPagos: RepositorioConfiguracionPagos,
  ) {}

  /**
   * Obtiene la configuración de pagos de una tienda
   */
  async obtenerPorTienda(tiendaId: string): Promise<RespuestaEstandar<RespuestaConfiguracionPagosDto>> {
    try {
      const configuracion = await this.repositorioConfiguracionPagos.buscarPorTiendaId(tiendaId);
      
      if (!configuracion) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de pagos no encontrada para esta tienda',
          'ConfiguracionPagos.NoEncontrada'
        );
      }

      return ServicioRespuestaEstandar.Respuesta200(
        'Configuración de pagos obtenida exitosamente',
        this.aDto(configuracion),
        'ConfiguracionPagos.ObtenidaExitosamente'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al obtener la configuración de pagos',
        'ConfiguracionPagos.ErrorObtencion'
      );
    }
  }

  /**
   * Crea una nueva configuración de pagos para una tienda
   */
  async crear(datos: CrearConfiguracionPagosDto): Promise<RespuestaEstandar<RespuestaConfiguracionPagosDto>> {
    try {
      // Validar que no exista ya una configuración para esta tienda
      const existe = await this.repositorioConfiguracionPagos.existePorTiendaId(datos.tiendaId);
      if (existe) {
        throw ExcepcionDominio.Respuesta400(
          'Ya existe una configuración de pagos para esta tienda',
          'ConfiguracionPagos.YaExiste'
        );
      }

      // Crear la entidad de dominio con validaciones
      const configuracionPagos = ConfiguracionPagos.crear(
        datos.tiendaId,
        datos.modo_captura,
        datos.proveedores_pago,
        datos.metodos_pago,
        datos.metodos_pago_manuales,
        datos.configuracion_giftcard,
        datos.personalizacion,
        datos.configuracion_adicional
      );

      // Guardar en el repositorio
      await this.repositorioConfiguracionPagos.guardar(configuracionPagos);

      return ServicioRespuestaEstandar.Respuesta201(
        'Configuración de pagos creada exitosamente',
        this.aDto(configuracionPagos),
        'ConfiguracionPagos.CreadaExitosamente'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al crear la configuración de pagos',
        'ConfiguracionPagos.ErrorCreacion'
      );
    }
  }

  /**
   * Actualiza la configuración de pagos de una tienda
   */
  async actualizar(tiendaId: string, datos: ActualizarConfiguracionPagosDto): Promise<RespuestaEstandar<RespuestaConfiguracionPagosDto>> {
    try {
      // Obtener configuración existente
      const configuracionExistente = await this.repositorioConfiguracionPagos.buscarPorTiendaId(tiendaId);
      if (!configuracionExistente) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de pagos no encontrada para esta tienda',
          'ConfiguracionPagos.NoEncontrada'
        );
      }

      // Actualizar los campos individuales
      if (datos.modo_captura) {
        configuracionExistente.cambiarModoCaptura(datos.modo_captura);
      }

      if (datos.configuracion_giftcard) {
        configuracionExistente.actualizarConfiguracionGiftcard(datos.configuracion_giftcard);
      }

      if (datos.personalizacion !== undefined) {
        configuracionExistente.actualizarPersonalizacion(datos.personalizacion);
      }

      if (datos.configuracion_adicional !== undefined) {
        configuracionExistente.actualizarConfiguracionAdicional(datos.configuracion_adicional);
      }

      // Guardar cambios
      await this.repositorioConfiguracionPagos.actualizar(configuracionExistente);

      return ServicioRespuestaEstandar.Respuesta200(
        'Configuración de pagos actualizada exitosamente',
        this.aDto(configuracionExistente),
        'ConfiguracionPagos.ActualizadaExitosamente'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al actualizar la configuración de pagos',
        'ConfiguracionPagos.ErrorActualizacion'
      );
    }
  }

  /**
   * Elimina la configuración de pagos de una tienda
   */
  async eliminar(tiendaId: string): Promise<RespuestaEstandar<null>> {
    try {
      const configuracion = await this.repositorioConfiguracionPagos.buscarPorTiendaId(tiendaId);
      if (!configuracion) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de pagos no encontrada para esta tienda',
          'ConfiguracionPagos.NoEncontrada'
        );
      }

      await this.repositorioConfiguracionPagos.eliminarPorTiendaId(tiendaId);

      return ServicioRespuestaEstandar.Respuesta200(
        'Configuración de pagos eliminada exitosamente',
        null,
        'ConfiguracionPagos.EliminadaExitosamente'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al eliminar la configuración de pagos',
        'ConfiguracionPagos.ErrorEliminacion'
      );
    }
  }

  /**
   * Agrega un proveedor de pago a la configuración
   */
  async agregarProveedor(tiendaId: string, proveedor: ProveedorPagoDto): Promise<RespuestaEstandar<RespuestaConfiguracionPagosDto>> {
    try {
      const configuracion = await this.repositorioConfiguracionPagos.buscarPorTiendaId(tiendaId);
      if (!configuracion) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de pagos no encontrada para esta tienda',
          'ConfiguracionPagos.NoEncontrada'
        );
      }

      configuracion.agregarProveedorPago(proveedor);

      await this.repositorioConfiguracionPagos.actualizar(configuracion);

      return ServicioRespuestaEstandar.Respuesta200(
        'Proveedor de pago agregado exitosamente',
        this.aDto(configuracion),
        'ConfiguracionPagos.ProveedorAgregado'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al agregar proveedor de pago',
        'ConfiguracionPagos.ErrorAgregarProveedor'
      );
    }
  }

  /**
   * Activa/desactiva un proveedor de pago
   */
  async cambiarEstadoProveedor(tiendaId: string, nombreProveedor: string, activo: boolean): Promise<RespuestaEstandar<RespuestaConfiguracionPagosDto>> {
    try {
      const configuracion = await this.repositorioConfiguracionPagos.buscarPorTiendaId(tiendaId);
      if (!configuracion) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de pagos no encontrada para esta tienda',
          'ConfiguracionPagos.NoEncontrada'
        );
      }

      const proveedores = configuracion.getProveedoresPago();
      const proveedor = proveedores.find(p => p.nombre_proveedor === nombreProveedor);
      
      if (!proveedor) {
        throw ExcepcionDominio.Respuesta404(
          `Proveedor ${nombreProveedor} no encontrado`,
          'ConfiguracionPagos.ProveedorNoEncontrado'
        );
      }

      const proveedorActualizado: ProveedorPagoDto = {
        ...proveedor,
        activo
      };

      configuracion.actualizarProveedorPago(nombreProveedor, proveedorActualizado);

      await this.repositorioConfiguracionPagos.actualizar(configuracion);

      const estado = activo ? 'activado' : 'desactivado';
      return ServicioRespuestaEstandar.Respuesta200(
        `Proveedor de pago ${estado} exitosamente`,
        this.aDto(configuracion),
        `ConfiguracionPagos.Proveedor${activo ? 'Activado' : 'Desactivado'}`
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al cambiar estado del proveedor',
        'ConfiguracionPagos.ErrorCambioEstadoProveedor'
      );
    }
  }

  /**
   * Agrega un método de pago manual
   */
  async agregarMetodoManual(tiendaId: string, metodoManual: MetodoPagoManualDto): Promise<RespuestaEstandar<RespuestaConfiguracionPagosDto>> {
    try {
      const configuracion = await this.repositorioConfiguracionPagos.buscarPorTiendaId(tiendaId);
      if (!configuracion) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de pagos no encontrada para esta tienda',
          'ConfiguracionPagos.NoEncontrada'
        );
      }

      configuracion.agregarMetodoPagoManual(metodoManual);

      await this.repositorioConfiguracionPagos.actualizar(configuracion);

      return ServicioRespuestaEstandar.Respuesta200(
        'Método de pago manual agregado exitosamente',
        this.aDto(configuracion),
        'ConfiguracionPagos.MetodoManualAgregado'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al agregar método de pago manual',
        'ConfiguracionPagos.ErrorAgregarMetodoManual'
      );
    }
  }

  /**
   * Configura la caducidad de tarjetas de regalo
   */
  async configurarCaducidadGiftCard(tiendaId: string, configuracionCaducidad: ConfiguracionGiftcardDto): Promise<RespuestaEstandar<RespuestaConfiguracionPagosDto>> {
    try {
      const configuracion = await this.repositorioConfiguracionPagos.buscarPorTiendaId(tiendaId);
      if (!configuracion) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de pagos no encontrada para esta tienda',
          'ConfiguracionPagos.NoEncontrada'
        );
      }

      configuracion.actualizarConfiguracionGiftcard(configuracionCaducidad);

      await this.repositorioConfiguracionPagos.actualizar(configuracion);

      return ServicioRespuestaEstandar.Respuesta200(
        'Configuración de caducidad de tarjetas de regalo actualizada exitosamente',
        this.aDto(configuracion),
        'ConfiguracionPagos.CaducidadGiftCardConfigurada'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al configurar caducidad de tarjetas de regalo',
        'ConfiguracionPagos.ErrorConfigurarCaducidadGiftCard'
      );
    }
  }

  /**
   * Obtiene estadísticas de uso de métodos de pago
   */
  async obtenerEstadisticas(tiendaId: string): Promise<RespuestaEstandar<any>> {
    try {
      const configuracion = await this.repositorioConfiguracionPagos.buscarPorTiendaId(tiendaId);
      if (!configuracion) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de pagos no encontrada para esta tienda',
          'ConfiguracionPagos.NoEncontrada'
        );
      }

      const estadisticas = await this.repositorioConfiguracionPagos.obtenerEstadisticas();

      return ServicioRespuestaEstandar.Respuesta200(
        'Estadísticas de uso de métodos de pago obtenidas exitosamente',
        estadisticas,
        'ConfiguracionPagos.EstadisticasObtenidas'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al obtener estadísticas de uso de métodos de pago',
        'ConfiguracionPagos.ErrorObtencionEstadisticas'
      );
    }
  }

  /**
   * Convierte la entidad de dominio a DTO para respuesta
   */
  private aDto(configuracion: ConfiguracionPagos): RespuestaConfiguracionPagosDto {
    return {
      id: configuracion.id,
      tiendaId: configuracion.tiendaId,
      modo_captura: configuracion.getModoCaptura(),
      proveedores_pago: configuracion.getProveedoresPago(),
      metodos_pago: configuracion.getMetodosPago(),
      metodos_pago_manuales: configuracion.getMetodosPagoManuales(),
      configuracion_giftcard: configuracion.getConfiguracionGiftcard(),
      personalizacion: configuracion.getPersonalizacion(),
      configuracion_adicional: configuracion.getConfiguracionAdicional(),
      fecha_creacion: configuracion.fechaCreacion,
      fecha_actualizacion: configuracion.fechaActualizacion
    };
  }
}