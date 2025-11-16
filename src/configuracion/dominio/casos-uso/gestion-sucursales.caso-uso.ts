import { Injectable, Inject } from '@nestjs/common';
import type { RepositorioConfiguracionSucursales } from '../interfaces/repositorio-configuracion-sucursales.interface';
import { ServicioRespuestaEstandar } from '../../../comun/aplicacion/servicios/servicio-respuesta-estandar';
import { ExcepcionDominio } from '../../../comun/excepciones/excepcion-dominio';
import { ConfiguracionSucursales } from '../entidades/configuracion-sucursales.entity';
import { ConfiguracionSucursalesDto, ActualizarConfiguracionSucursalesDto } from '../../aplicacion/dto/configuracion-sucursales.dto';

/**
 * Caso de uso para la gestión de sucursales
 */
@Injectable()
export class GestionSucursalesCasoUso {
  constructor(
    @Inject('RepositorioConfiguracionSucursales')
    private readonly repositorioSucursales: RepositorioConfiguracionSucursales,
  ) {}

  /**
   * Crea una nueva configuración de sucursales
   * @param tiendaId ID de la tienda
   * @param datos Datos de la configuración de sucursales
   * @returns Respuesta estándar con la configuración creada
   */
  async crear(
    tiendaId: string,
    datos: ConfiguracionSucursalesDto,
  ) {
    try {
      // Validar límites de sucursales por plan
      await this.validarLimitesPlan(tiendaId);

      // Validar que no exista una sucursal con el mismo nombre
      const existeConNombre = await this.repositorioSucursales.existeConNombre(
        datos.nombre_sucursal,
        tiendaId
      );

      if (existeConNombre) {
        throw ExcepcionDominio.Respuesta400(
          'Ya existe una sucursal con el mismo nombre en esta tienda',
          'Sucursal.NombreDuplicado'
        );
      }

      // Validar que no exista una sucursal con la misma dirección
      const existeConDireccion = await this.repositorioSucursales.existeConDireccion(
        datos.direccion,
        tiendaId
      );

      if (existeConDireccion) {
        throw ExcepcionDominio.Respuesta400(
          'Ya existe una sucursal con la misma dirección en esta tienda',
          'Sucursal.DireccionDuplicada'
        );
      }

      // Crear ID único para la sucursal
      const id = this.generarIdUnico();

      // Crear entidad de dominio
      const configuracionSucursales = ConfiguracionSucursales.crearDesdeDto(
        id,
        tiendaId,
        datos
      );

      // Guardar en el repositorio
      const sucursalCreada = await this.repositorioSucursales.crear(configuracionSucursales);

      return ServicioRespuestaEstandar.Respuesta201(
        'Sucursal creada exitosamente',
        sucursalCreada.aDto(),
        'Sucursal.CreadaExitosamente'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al crear la sucursal',
        'Sucursal.ErrorCreacion'
      );
    }
  }

  /**
   * Obtiene todas las sucursales de una tienda
   * @param tiendaId ID de la tienda
   * @returns Respuesta estándar con la lista de sucursales
   */
  async listar(tiendaId: string) {
    try {
      const sucursales = await this.repositorioSucursales.encontrarTodasPorTienda(tiendaId);

      const sucursalesDto = sucursales.map(sucursal => sucursal.aDto());

      return ServicioRespuestaEstandar.Respuesta200(
        'Sucursales obtenidas exitosamente',
        sucursalesDto,
        'Sucursales.ObtenidasExitosamente'
      );
    } catch (error) {
      throw ExcepcionDominio.Respuesta500(
        'Error al obtener las sucursales',
        'Sucursales.ErrorObtencion'
      );
    }
  }

  /**
   * Obtiene una sucursal por ID
   * @param id ID de la sucursal
   * @param tiendaId ID de la tienda
   * @returns Respuesta estándar con la sucursal encontrada
   */
  async obtenerPorId(id: string, tiendaId: string) {
    try {
      const sucursal = await this.repositorioSucursales.encontrarPorId(id, tiendaId);

      if (!sucursal) {
        throw ExcepcionDominio.Respuesta404(
          'Sucursal no encontrada',
          'Sucursal.NoEncontrada'
        );
      }

      return ServicioRespuestaEstandar.Respuesta200(
        'Sucursal obtenida exitosamente',
        sucursal.aDto(),
        'Sucursal.ObtenidaExitosamente'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al obtener la sucursal',
        'Sucursal.ErrorObtencion'
      );
    }
  }

  /**
   * Actualiza una sucursal
   * @param id ID de la sucursal
   * @param tiendaId ID de la tienda
   * @param datos Datos a actualizar
   * @returns Respuesta estándar con la sucursal actualizada
   */
  async actualizar(
    id: string,
    tiendaId: string,
    datos: ActualizarConfiguracionSucursalesDto,
  ) {
    try {
      // Verificar que la sucursal existe
      const sucursalExistente = await this.repositorioSucursales.encontrarPorId(id, tiendaId);

      if (!sucursalExistente) {
        throw ExcepcionDominio.Respuesta404(
          'Sucursal no encontrada',
          'Sucursal.NoEncontrada'
        );
      }

      // Validar nombre duplicado si se está actualizando
      if (datos.nombre_sucursal) {
        const existeConNombre = await this.repositorioSucursales.existeConNombre(
          datos.nombre_sucursal,
          tiendaId,
          id
        );

        if (existeConNombre) {
          throw ExcepcionDominio.Respuesta400(
            'Ya existe una sucursal con el mismo nombre en esta tienda',
            'Sucursal.NombreDuplicado'
          );
        }
      }

      // Validar dirección duplicada si se está actualizando
      if (datos.direccion) {
        const existeConDireccion = await this.repositorioSucursales.existeConDireccion(
          datos.direccion,
          tiendaId,
          id
        );

        if (existeConDireccion) {
          throw ExcepcionDominio.Respuesta400(
            'Ya existe una sucursal con la misma dirección en esta tienda',
            'Sucursal.DireccionDuplicada'
          );
        }
      }

      // Actualizar la sucursal
      const sucursalActualizada = await this.repositorioSucursales.actualizar(
        id,
        tiendaId,
        datos
      );

      return ServicioRespuestaEstandar.Respuesta200(
        'Sucursal actualizada exitosamente',
        sucursalActualizada.aDto(),
        'Sucursal.ActualizadaExitosamente'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al actualizar la sucursal',
        'Sucursal.ErrorActualizacion'
      );
    }
  }

  /**
   * Elimina una sucursal
   * @param id ID de la sucursal
   * @param tiendaId ID de la tienda
   * @returns Respuesta estándar indicando éxito
   */
  async eliminar(id: string, tiendaId: string) {
    try {
      // Verificar que la sucursal existe
      const sucursalExistente = await this.repositorioSucursales.encontrarPorId(id, tiendaId);

      if (!sucursalExistente) {
        throw ExcepcionDominio.Respuesta404(
          'Sucursal no encontrada',
          'Sucursal.NoEncontrada'
        );
      }

      // Eliminar la sucursal
      const eliminada = await this.repositorioSucursales.eliminar(id, tiendaId);

      if (!eliminada) {
        throw ExcepcionDominio.Respuesta500(
          'Error al eliminar la sucursal',
          'Sucursal.ErrorEliminacion'
        );
      }

      return ServicioRespuestaEstandar.Respuesta200(
        'Sucursal eliminada exitosamente',
        null,
        'Sucursal.EliminadaExitosamente'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al eliminar la sucursal',
        'Sucursal.ErrorEliminacion'
      );
    }
  }

  /**
   * Activa una sucursal
   * @param id ID de la sucursal
   * @param tiendaId ID de la tienda
   * @returns Respuesta estándar con la sucursal activada
   */
  async activar(id: string, tiendaId: string) {
    try {
      // Verificar que la sucursal existe
      const sucursalExistente = await this.repositorioSucursales.encontrarPorId(id, tiendaId);

      if (!sucursalExistente) {
        throw ExcepcionDominio.Respuesta404(
          'Sucursal no encontrada',
          'Sucursal.NoEncontrada'
        );
      }

      // Validar límites de sucursales por plan
      await this.validarLimitesPlan(tiendaId);

      // Activar la sucursal
      const sucursalActivada = await this.repositorioSucursales.activar(id, tiendaId);

      return ServicioRespuestaEstandar.Respuesta200(
        'Sucursal activada exitosamente',
        sucursalActivada.aDto(),
        'Sucursal.ActivadaExitosamente'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al activar la sucursal',
        'Sucursal.ErrorActivacion'
      );
    }
  }

  /**
   * Desactiva una sucursal
   * @param id ID de la sucursal
   * @param tiendaId ID de la tienda
   * @returns Respuesta estándar con la sucursal desactivada
   */
  async desactivar(id: string, tiendaId: string) {
    try {
      // Verificar que la sucursal existe
      const sucursalExistente = await this.repositorioSucursales.encontrarPorId(id, tiendaId);

      if (!sucursalExistente) {
        throw ExcepcionDominio.Respuesta404(
          'Sucursal no encontrada',
          'Sucursal.NoEncontrada'
        );
      }

      // Desactivar la sucursal
      const sucursalDesactivada = await this.repositorioSucursales.desactivar(id, tiendaId);

      return ServicioRespuestaEstandar.Respuesta200(
        'Sucursal desactivada exitosamente',
        sucursalDesactivada.aDto(),
        'Sucursal.DesactivadaExitosamente'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al desactivar la sucursal',
        'Sucursal.ErrorDesactivacion'
      );
    }
  }

  /**
   * Obtiene sucursales por estado
   * @param tiendaId ID de la tienda
   * @param estado Estado de la sucursal
   * @returns Respuesta estándar con la lista de sucursales
   */
  async listarPorEstado(tiendaId: string, estado: string) {
    try {
      const sucursales = await this.repositorioSucursales.encontrarPorEstado(tiendaId, estado);

      const sucursalesDto = sucursales.map(sucursal => sucursal.aDto());

      return ServicioRespuestaEstandar.Respuesta200(
        `Sucursales ${estado} obtenidas exitosamente`,
        sucursalesDto,
        'Sucursales.ObtenidasPorEstadoExitosamente'
      );
    } catch (error) {
      throw ExcepcionDominio.Respuesta500(
        'Error al obtener las sucursales por estado',
        'Sucursales.ErrorObtencionPorEstado'
      );
    }
  }

  /**
   * Valida los límites de sucursales por plan
   * @param tiendaId ID de la tienda
   */
  private async validarLimitesPlan(tiendaId: string): Promise<void> {
    // TODO: Implementar validación de límites según el plan de la tienda
    // Por ahora, asumimos que no hay límites
    const sucursalesActivas = await this.repositorioSucursales.contarSucursalesActivas(tiendaId);
    
    // Ejemplo: Límite de 10 sucursales por plan básico
    const limiteSucursales = 10;
    
    if (sucursalesActivas >= limiteSucursales) {
      throw ExcepcionDominio.Respuesta400(
        `Se ha alcanzado el límite de ${limiteSucursales} sucursales activas permitidas por el plan`,
        'Sucursal.LimitePlanExcedido'
      );
    }
  }

  /**
   * Genera un ID único para la sucursal
   * @returns ID único
   */
  private generarIdUnico(): string {
    // TODO: Implementar generación de ID único robusta (ej. nanoid)
    return `sucursal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}