import { Injectable } from '@nestjs/common';
import { ConfiguracionGeneral } from '../entidades/configuracion-general.entity';
import type { RepositorioConfiguracionGeneral } from '../interfaces/repositorio-configuracion-general.interface';
import { ServicioRespuestaEstandar, type RespuestaEstandar } from '../../../comun/aplicacion/servicios/servicio-respuesta-estandar';
import { ExcepcionDominio } from '../../../comun/excepciones/excepcion-dominio';
import {
  ConfiguracionGeneralDto,
  ActualizarConfiguracionGeneralDto,
  DireccionFacturacionDto,
  MonedaDto,
  ConfiguracionPedidosDto,
  RecursosTiendaDto,
  SistemaUnidadesEnum,
  UnidadPesoEnum,
  ConfiguracionGeneralRespuestaDto
} from '../../aplicacion/dto/configuracion-general.dto';

/**
 * Caso de uso para la gestión de configuración general
 * Implementa todas las operaciones de negocio para la configuración general de la tienda
 */
@Injectable()
export class GestionGeneralCasoUso {
  constructor(
    private readonly repositorioGeneral: RepositorioConfiguracionGeneral,
  ) {}

  /**
   * Crear una nueva configuración general
   */
  async crear(
    tiendaId: string,
    datos: ConfiguracionGeneralDto
  ): Promise<RespuestaEstandar<ConfiguracionGeneralRespuestaDto>> {
    try {
      // Validar que no exista configuración para esta tienda
      const existe = await this.repositorioGeneral.existePorTiendaId(tiendaId);
      if (existe) {
        throw ExcepcionDominio.Respuesta400(
          'Ya existe una configuración general para esta tienda',
          'ConfiguracionGeneral.YaExiste'
        );
      }

      // Validar unicidad del nombre de tienda
      const nombreDisponible = await this.repositorioGeneral.verificarNombreTiendaDisponible(datos.nombre_tienda);
      if (!nombreDisponible) {
        throw ExcepcionDominio.Respuesta400(
          'El nombre de la tienda ya está en uso',
          'ConfiguracionGeneral.NombreTiendaDuplicado'
        );
      }

      // Validar unicidad del email
      const emailDisponible = await this.repositorioGeneral.verificarEmailDisponible(datos.email);
      if (!emailDisponible) {
        throw ExcepcionDominio.Respuesta400(
          'El correo electrónico ya está en uso',
          'ConfiguracionGeneral.EmailDuplicado'
        );
      }

      // Validar unicidad del teléfono si se proporciona
      if (datos.telefono) {
        const telefonoDisponible = await this.repositorioGeneral.verificarTelefonoDisponible(datos.telefono);
        if (!telefonoDisponible) {
          throw ExcepcionDominio.Respuesta400(
            'El teléfono ya está en uso',
            'ConfiguracionGeneral.TelefonoDuplicado'
          );
        }
      }

      // Crear la entidad de dominio
      const id = this.generarIdUnico();
      const configuracion = ConfiguracionGeneral.crear(
        id,
        tiendaId,
        datos.nombre_tienda,
        datos.email,
        datos.telefono || null,
        datos.direccion_facturacion,
        datos.moneda,
        datos.region_copia_seguridad,
        datos.sistema_unidades,
        datos.unidad_peso,
        datos.zona_horaria,
        datos.configuracion_pedidos,
        datos.recursos_tienda || null
      );

      // Guardar en el repositorio
      const configuracionGuardada = await this.repositorioGeneral.guardar(configuracion);

      return ServicioRespuestaEstandar.Respuesta201(
        'Configuración general creada exitosamente',
        this.aDtoRespuesta(configuracionGuardada),
        'ConfiguracionGeneral.CreadoExitosamente'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al crear la configuración general',
        'ConfiguracionGeneral.ErrorCreacion'
      );
    }
  }

  /**
   * Obtener configuración general por ID
   */
  async obtenerPorId(
    id: string
  ): Promise<RespuestaEstandar<ConfiguracionGeneralRespuestaDto>> {
    try {
      const configuracion = await this.repositorioGeneral.buscarPorId(id);
      
      if (!configuracion) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración general no encontrada',
          'ConfiguracionGeneral.NoEncontrado'
        );
      }

      return ServicioRespuestaEstandar.Respuesta200(
        'Configuración general obtenida exitosamente',
        this.aDtoRespuesta(configuracion),
        'ConfiguracionGeneral.ObtenidoExitosamente'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al obtener la configuración general',
        'ConfiguracionGeneral.ErrorObtencion'
      );
    }
  }

  /**
   * Obtener configuración general por ID de tienda
   */
  async obtenerPorTiendaId(
    tiendaId: string
  ): Promise<RespuestaEstandar<ConfiguracionGeneralRespuestaDto>> {
    try {
      const configuracion = await this.repositorioGeneral.buscarPorTiendaId(tiendaId);
      
      if (!configuracion) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración general no encontrada para esta tienda',
          'ConfiguracionGeneral.NoEncontrado'
        );
      }

      return ServicioRespuestaEstandar.Respuesta200(
        'Configuración general obtenida exitosamente',
        this.aDtoRespuesta(configuracion),
        'ConfiguracionGeneral.ObtenidoExitosamente'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al obtener la configuración general',
        'ConfiguracionGeneral.ErrorObtencion'
      );
    }
  }

  /**
   * Actualizar configuración general
   */
  async actualizar(
    id: string,
    datos: ActualizarConfiguracionGeneralDto
  ): Promise<RespuestaEstandar<ConfiguracionGeneralRespuestaDto>> {
    try {
      // Verificar que existe
      const configuracionExistente = await this.repositorioGeneral.buscarPorId(id);
      if (!configuracionExistente) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración general no encontrada',
          'ConfiguracionGeneral.NoEncontrado'
        );
      }

      // Validar unicidad del nombre de tienda si se está actualizando
      if (datos.nombre_tienda && datos.nombre_tienda !== configuracionExistente.nombreTienda) {
        const nombreDisponible = await this.repositorioGeneral.verificarNombreTiendaDisponible(
          datos.nombre_tienda,
          configuracionExistente.tiendaId
        );
        if (!nombreDisponible) {
          throw ExcepcionDominio.Respuesta400(
            'El nombre de la tienda ya está en uso',
            'ConfiguracionGeneral.NombreTiendaDuplicado'
          );
        }
      }

      // Validar unicidad del email si se está actualizando
      if (datos.email && datos.email !== configuracionExistente.email) {
        const emailDisponible = await this.repositorioGeneral.verificarEmailDisponible(
          datos.email,
          configuracionExistente.tiendaId
        );
        if (!emailDisponible) {
          throw ExcepcionDominio.Respuesta400(
            'El correo electrónico ya está en uso',
            'ConfiguracionGeneral.EmailDuplicado'
          );
        }
      }

      // Validar unicidad del teléfono si se está actualizando
      if (datos.telefono && datos.telefono !== configuracionExistente.telefono) {
        const telefonoDisponible = await this.repositorioGeneral.verificarTelefonoDisponible(
          datos.telefono,
          configuracionExistente.tiendaId
        );
        if (!telefonoDisponible) {
          throw ExcepcionDominio.Respuesta400(
            'El teléfono ya está en uso',
            'ConfiguracionGeneral.TelefonoDuplicado'
          );
        }
      }

      // Actualizar en el repositorio
      const configuracionActualizada = await this.repositorioGeneral.actualizar(id, datos);

      return ServicioRespuestaEstandar.Respuesta200(
        'Configuración general actualizada exitosamente',
        this.aDtoRespuesta(configuracionActualizada),
        'ConfiguracionGeneral.ActualizadoExitosamente'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al actualizar la configuración general',
        'ConfiguracionGeneral.ErrorActualizacion'
      );
    }
  }

  /**
   * Eliminar configuración general
   */
  async eliminar(
    id: string
  ): Promise<RespuestaEstandar<null>> {
    try {
      // Verificar que existe
      const configuracionExistente = await this.repositorioGeneral.buscarPorId(id);
      if (!configuracionExistente) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración general no encontrada',
          'ConfiguracionGeneral.NoEncontrado'
        );
      }

      // Eliminar del repositorio
      await this.repositorioGeneral.eliminar(id);

      return ServicioRespuestaEstandar.Respuesta200(
        'Configuración general eliminada exitosamente',
        null,
        'ConfiguracionGeneral.EliminadoExitosamente'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al eliminar la configuración general',
        'ConfiguracionGeneral.ErrorEliminacion'
      );
    }
  }

  /**
   * Operaciones específicas de actualización
   */

  /**
   * Actualizar dirección de facturación
   */
  async actualizarDireccionFacturacion(
    id: string,
    direccion: DireccionFacturacionDto
  ): Promise<RespuestaEstandar<ConfiguracionGeneralRespuestaDto>> {
    try {
      // Verificar que existe
      const configuracionExistente = await this.repositorioGeneral.buscarPorId(id);
      if (!configuracionExistente) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración general no encontrada',
          'ConfiguracionGeneral.NoEncontrado'
        );
      }

      // Actualizar dirección
      const configuracionActualizada = await this.repositorioGeneral.actualizarDireccionFacturacion(id, direccion);

      return ServicioRespuestaEstandar.Respuesta200(
        'Dirección de facturación actualizada exitosamente',
        this.aDtoRespuesta(configuracionActualizada),
        'ConfiguracionGeneral.DireccionActualizada'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al actualizar la dirección de facturación',
        'ConfiguracionGeneral.ErrorActualizacionDireccion'
      );
    }
  }

  /**
   * Actualizar moneda
   */
  async actualizarMoneda(
    id: string,
    moneda: MonedaDto
  ): Promise<RespuestaEstandar<ConfiguracionGeneralRespuestaDto>> {
    try {
      // Verificar que existe
      const configuracionExistente = await this.repositorioGeneral.buscarPorId(id);
      if (!configuracionExistente) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración general no encontrada',
          'ConfiguracionGeneral.NoEncontrado'
        );
      }

      // Actualizar moneda
      const configuracionActualizada = await this.repositorioGeneral.actualizarMoneda(id, moneda);

      return ServicioRespuestaEstandar.Respuesta200(
        'Moneda actualizada exitosamente',
        this.aDtoRespuesta(configuracionActualizada),
        'ConfiguracionGeneral.MonedaActualizada'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al actualizar la moneda',
        'ConfiguracionGeneral.ErrorActualizacionMoneda'
      );
    }
  }

  /**
   * Actualizar configuración de pedidos
   */
  async actualizarConfiguracionPedidos(
    id: string,
    configuracion: ConfiguracionPedidosDto
  ): Promise<RespuestaEstandar<ConfiguracionGeneralRespuestaDto>> {
    try {
      // Verificar que existe
      const configuracionExistente = await this.repositorioGeneral.buscarPorId(id);
      if (!configuracionExistente) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración general no encontrada',
          'ConfiguracionGeneral.NoEncontrado'
        );
      }

      // Actualizar configuración de pedidos
      const configuracionActualizada = await this.repositorioGeneral.actualizarConfiguracionPedidos(id, configuracion);

      return ServicioRespuestaEstandar.Respuesta200(
        'Configuración de pedidos actualizada exitosamente',
        this.aDtoRespuesta(configuracionActualizada),
        'ConfiguracionGeneral.ConfiguracionPedidosActualizada'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al actualizar la configuración de pedidos',
        'ConfiguracionGeneral.ErrorActualizacionPedidos'
      );
    }
  }

  /**
   * Actualizar recursos de tienda
   */
  async actualizarRecursosTienda(
    id: string,
    recursos: RecursosTiendaDto
  ): Promise<RespuestaEstandar<ConfiguracionGeneralRespuestaDto>> {
    try {
      // Verificar que existe
      const configuracionExistente = await this.repositorioGeneral.buscarPorId(id);
      if (!configuracionExistente) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración general no encontrada',
          'ConfiguracionGeneral.NoEncontrado'
        );
      }

      // Actualizar recursos de tienda
      const configuracionActualizada = await this.repositorioGeneral.actualizarRecursosTienda(id, recursos);

      return ServicioRespuestaEstandar.Respuesta200(
        'Recursos de tienda actualizados exitosamente',
        this.aDtoRespuesta(configuracionActualizada),
        'ConfiguracionGeneral.RecursosTiendaActualizados'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al actualizar los recursos de tienda',
        'ConfiguracionGeneral.ErrorActualizacionRecursos'
      );
    }
  }

  /**
   * Obtener estadísticas de configuraciones generales
   */
  async obtenerEstadisticas(): Promise<RespuestaEstandar<any>> {
    try {
      const estadisticas = await this.repositorioGeneral.obtenerEstadisticas();

      return ServicioRespuestaEstandar.Respuesta200(
        'Estadísticas de configuraciones generales obtenidas exitosamente',
        estadisticas,
        'ConfiguracionGeneral.EstadisticasObtenidas'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al obtener las estadísticas de configuraciones generales',
        'ConfiguracionGeneral.ErrorObtencionEstadisticas'
      );
    }
  }

  /**
   * Buscar configuraciones generales por término
   */
  async buscar(
    termino: string
  ): Promise<RespuestaEstandar<ConfiguracionGeneralRespuestaDto[]>> {
    try {
      const configuraciones = await this.repositorioGeneral.buscar(termino);
      
      const dtos = configuraciones.map(config => this.aDtoRespuesta(config));

      return ServicioRespuestaEstandar.Respuesta200(
        'Búsqueda de configuraciones generales completada exitosamente',
        dtos,
        'ConfiguracionGeneral.BusquedaExitosa'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al buscar configuraciones generales',
        'ConfiguracionGeneral.ErrorBusqueda'
      );
    }
  }

  /**
   * Métodos auxiliares
   */

  /**
   * Generar ID único para la configuración
   */
  private generarIdUnico(): string {
    return `config_general_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Convertir entidad a DTO de respuesta
   */
  private aDtoRespuesta(configuracion: ConfiguracionGeneral): ConfiguracionGeneralRespuestaDto {
    return {
      id: configuracion.id,
      tienda_id: configuracion.tiendaId,
      nombre_tienda: configuracion.nombreTienda,
      email: configuracion.email,
      telefono: configuracion.telefono || undefined,
      direccion_facturacion: configuracion.direccionFacturacion,
      moneda: configuracion.moneda,
      region_copia_seguridad: configuracion.regionCopiaSeguridad,
      sistema_unidades: configuracion.sistemaUnidades,
      unidad_peso: configuracion.unidadPeso,
      zona_horaria: configuracion.zonaHoraria,
      configuracion_pedidos: configuracion.configuracionPedidos,
      recursos_tienda: configuracion.recursosTienda || undefined,
      fecha_creacion: configuracion.fechaCreacion,
      fecha_actualizacion: configuracion.fechaActualizacion,
    };
  }
}