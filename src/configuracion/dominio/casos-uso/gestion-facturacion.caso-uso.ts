import { Injectable, Inject } from '@nestjs/common';
import { ConfiguracionFacturacion } from '../entidades/configuracion-facturacion.entity';
import type { RepositorioConfiguracionFacturacion } from '../interfaces/repositorio-configuracion-facturacion.interface';
import { ServicioRespuestaEstandar } from '../../../comun/aplicacion/servicios/servicio-respuesta-estandar';
import { ExcepcionDominio } from '../../../comun/excepciones/excepcion-dominio';
import {
  ConfiguracionFacturacionDto,
  MetodoPagoDto,
  FacturaHistorialDto,
  NotificacionPagoDto,
  TipoMetodoPago
} from '../../aplicacion/dto/configuracion-facturacion.dto';

/**
 * Caso de Uso para Gestión de Configuración de Facturación
 * Contiene toda la lógica de negocio para operaciones de facturación
 */
@Injectable()
export class GestionFacturacionCasoUso {
  constructor(
    @Inject('RepositorioConfiguracionFacturacion')
    private readonly repositorio: RepositorioConfiguracionFacturacion
  ) {}

  /**
   * Crear una nueva configuración de facturación
   */
  async crear(
    tiendaId: string,
    datos: ConfiguracionFacturacionDto
  ) {
    try {
      // Verificar si ya existe configuración para esta tienda
      const existe = await this.repositorio.existePorTiendaId(tiendaId);
      if (existe) {
        throw ExcepcionDominio.Respuesta400(
          'Ya existe una configuración de facturación para esta tienda',
          'Facturacion.ConfiguracionExistente'
        );
      }

      // Generar ID único
      const id = this.generarIdUnico();

      // Crear entidad de dominio
      const configuracion = ConfiguracionFacturacion.crear(
        id,
        tiendaId,
        datos.nombre_empresa,
        datos.direccion_fiscal,
        datos.email_facturacion,
        datos.telefono_contacto,
        datos.id_fiscal,
        datos.metodos_pago,
        datos.ciclo_facturacion,
        new Date(datos.fecha_proxima),
        datos.historial_facturas,
        datos.notificaciones
      );

      // Guardar en repositorio
      const configuracionGuardada = await this.repositorio.guardar(configuracion);

      return ServicioRespuestaEstandar.Respuesta201(
        this.aDto(configuracionGuardada),
        'Configuración de facturación creada exitosamente',
        'Facturacion.CreadaExitosamente'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al crear configuración de facturación',
        'Facturacion.ErrorCreacion'
      );
    }
  }

  /**
   * Obtener configuración de facturación por ID de tienda
   */
  async obtenerPorTiendaId(tiendaId: string) {
    try {
      const configuracion = await this.repositorio.buscarPorTiendaId(tiendaId);
      
      if (!configuracion) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de facturación no encontrada',
          'Facturacion.NoEncontrada'
        );
      }

      return ServicioRespuestaEstandar.Respuesta200(
        this.aDto(configuracion),
        'Configuración de facturación obtenida exitosamente',
        'Facturacion.ObtenidaExitosamente'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al obtener configuración de facturación',
        'Facturacion.ErrorObtencion'
      );
    }
  }

  /**
   * Actualizar configuración de facturación
   */
  async actualizar(
    tiendaId: string,
    datos: Partial<ConfiguracionFacturacionDto>
  ) {
    try {
      // Obtener configuración existente
      const configuracionExistente = await this.repositorio.buscarPorTiendaId(tiendaId);
      
      if (!configuracionExistente) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de facturación no encontrada',
          'Facturacion.NoEncontrada'
        );
      }

      // Aplicar cambios parciales
      configuracionExistente.actualizarInformacion(
        datos.nombre_empresa,
        datos.direccion_fiscal,
        datos.email_facturacion,
        datos.telefono_contacto,
        datos.id_fiscal
      );

      // Actualizar en repositorio
      const configuracionActualizada = await this.repositorio.actualizar(configuracionExistente);

      return ServicioRespuestaEstandar.Respuesta200(
        this.aDto(configuracionActualizada),
        'Configuración de facturación actualizada exitosamente',
        'Facturacion.ActualizadaExitosamente'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al actualizar configuración de facturación',
        'Facturacion.ErrorActualizacion'
      );
    }
  }

  /**
   * Agregar método de pago
   */
  async agregarMetodoPago(
    tiendaId: string,
    metodoPago: MetodoPagoDto
  ) {
    try {
      const configuracion = await this.repositorio.buscarPorTiendaId(tiendaId);
      
      if (!configuracion) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de facturación no encontrada',
          'Facturacion.NoEncontrada'
        );
      }

      // Agregar método de pago a la entidad
      configuracion.agregarMetodoPago(metodoPago);

      // Actualizar en repositorio
      const configuracionActualizada = await this.repositorio.actualizar(configuracion);

      return ServicioRespuestaEstandar.Respuesta200(
        this.aDto(configuracionActualizada),
        'Método de pago agregado exitosamente',
        'Facturacion.MetodoPagoAgregado'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al agregar método de pago',
        'Facturacion.ErrorAgregarMetodoPago'
      );
    }
  }

  /**
   * Desactivar método de pago
   */
  async desactivarMetodoPago(
    tiendaId: string,
    tipoMetodo: string
  ) {
    try {
      const configuracion = await this.repositorio.buscarPorTiendaId(tiendaId);
      
      if (!configuracion) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de facturación no encontrada',
          'Facturacion.NoEncontrada'
        );
      }

      // Desactivar método de pago
      configuracion.desactivarMetodoPago(tipoMetodo as any);

      // Actualizar en repositorio
      const configuracionActualizada = await this.repositorio.actualizar(configuracion);

      return ServicioRespuestaEstandar.Respuesta200(
        this.aDto(configuracionActualizada),
        'Método de pago desactivado exitosamente',
        'Facturacion.MetodoPagoDesactivado'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al desactivar método de pago',
        'Facturacion.ErrorDesactivarMetodoPago'
      );
    }
  }

  /**
   * Agregar factura al historial
   */
  async agregarFacturaHistorial(
    tiendaId: string,
    factura: FacturaHistorialDto
  ) {
    try {
      const configuracion = await this.repositorio.buscarPorTiendaId(tiendaId);
      
      if (!configuracion) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de facturación no encontrada',
          'Facturacion.NoEncontrada'
        );
      }

      // Agregar factura al historial
      configuracion.agregarFacturaHistorial(factura);

      // Actualizar en repositorio
      const configuracionActualizada = await this.repositorio.actualizar(configuracion);

      return ServicioRespuestaEstandar.Respuesta200(
        this.aDto(configuracionActualizada),
        'Factura agregada al historial exitosamente',
        'Facturacion.FacturaAgregadaHistorial'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al agregar factura al historial',
        'Facturacion.ErrorAgregarFacturaHistorial'
      );
    }
  }

  /**
   * Actualizar notificaciones de pago
   */
  async actualizarNotificaciones(
    tiendaId: string,
    notificaciones: NotificacionPagoDto
  ) {
    try {
      const configuracion = await this.repositorio.buscarPorTiendaId(tiendaId);
      
      if (!configuracion) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de facturación no encontrada',
          'Facturacion.NoEncontrada'
        );
      }

      // Actualizar notificaciones (esto requiere actualizar la entidad)
      // Como la entidad no tiene método específico, reconstruimos con los nuevos datos
      const configuracionActualizada = ConfiguracionFacturacion.reconstruir(
        configuracion.id,
        configuracion.tiendaId,
        configuracion.nombreEmpresa,
        configuracion.direccionFiscal,
        configuracion.emailFacturacion,
        configuracion.telefonoContacto,
        configuracion.idFiscal,
        configuracion.metodosPago,
        configuracion.cicloFacturacion,
        configuracion.fechaProxima,
        configuracion.historialFacturas,
        notificaciones,
        configuracion.fechaCreacion,
        new Date() // Actualizar fecha de actualización
      );

      // Guardar en repositorio
      const configuracionGuardada = await this.repositorio.actualizar(configuracionActualizada);

      return ServicioRespuestaEstandar.Respuesta200(
        this.aDto(configuracionGuardada),
        'Notificaciones de pago actualizadas exitosamente',
        'Facturacion.NotificacionesActualizadas'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al actualizar notificaciones de pago',
        'Facturacion.ErrorActualizarNotificaciones'
      );
    }
  }

  /**
   * Eliminar configuración de facturación
   */
  async eliminar(tiendaId: string) {
    try {
      const configuracion = await this.repositorio.buscarPorTiendaId(tiendaId);
      
      if (!configuracion) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de facturación no encontrada',
          'Facturacion.NoEncontrada'
        );
      }

      await this.repositorio.eliminar(configuracion.id);

      return ServicioRespuestaEstandar.Respuesta200(
        'Configuración de facturación eliminada exitosamente',
        null,
        'Facturacion.EliminadaExitosamente'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al eliminar configuración de facturación',
        'Facturacion.ErrorEliminacion'
      );
    }
  }

  /**
   * Listar configuraciones de facturación (para administración)
   */
  async listar(pagina: number = 1, limite: number = 10) {
    try {
      const configuraciones = await this.repositorio.listarTodas(pagina, limite);
      const total = await this.repositorio.contarTotal();

      const datos = {
        configuraciones: configuraciones.map(config => this.aDto(config)),
        paginacion: {
          pagina,
          limite,
          total,
          totalPaginas: Math.ceil(total / limite)
        }
      };

      return ServicioRespuestaEstandar.Respuesta200(
        'Configuraciones de facturación listadas exitosamente',
        datos,
        'Facturacion.ListadasExitosamente'
      );
    } catch (error) {
      throw ExcepcionDominio.Respuesta500(
        'Error al listar configuraciones de facturación',
        'Facturacion.ErrorListado'
      );
    }
  }

  /**
   * Convertir entidad de dominio a DTO
   */
  private aDto(configuracion: ConfiguracionFacturacion): any {
    return {
      id: configuracion.id,
      tienda_id: configuracion.tiendaId,
      nombre_empresa: configuracion.nombreEmpresa,
      direccion_fiscal: configuracion.direccionFiscal,
      email_facturacion: configuracion.emailFacturacion,
      telefono_contacto: configuracion.telefonoContacto,
      id_fiscal: configuracion.idFiscal,
      metodos_pago: configuracion.metodosPago,
      ciclo_facturacion: configuracion.cicloFacturacion,
      fecha_proxima: configuracion.fechaProxima.toISOString(),
      historial_facturas: configuracion.historialFacturas,
      notificaciones: configuracion.notificaciones,
      fecha_creacion: configuracion.fechaCreacion.toISOString(),
      fecha_actualizacion: configuracion.fechaActualizacion.toISOString()
    };
  }

  /**
   * Generar ID único para la configuración
   */
  private generarIdUnico(): string {
    return `config-fact-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}