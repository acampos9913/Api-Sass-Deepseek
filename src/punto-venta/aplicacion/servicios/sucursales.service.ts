import { Injectable, Inject } from '@nestjs/common';
import { CrearSucursalCasoUso } from '../../dominio/casos-uso/crear-sucursal.caso-uso';
import type { RepositorioSucursal } from '../../dominio/interfaces/repositorio-sucursal.interface';
import {
  CrearSucursalDto,
  CrearSucursalRespuestaDto,
  ListaSucursalesRespuestaDto,
  FiltrosSucursalDto,
  SucursalRespuestaDto,
  PaginacionDto,
} from '../dto/crear-sucursal.dto';
import { Sucursal } from '../../dominio/entidades/sucursal.entity';

/**
 * Servicio de aplicación para la gestión de sucursales
 * Orquesta los casos de uso y adapta los datos entre capas
 */
@Injectable()
export class SucursalesService {
  constructor(
    private readonly crearSucursalCasoUso: CrearSucursalCasoUso,
    @Inject('RepositorioSucursal')
    private readonly repositorioSucursal: RepositorioSucursal,
  ) {}

  /**
   * Crea una nueva sucursal
   * @param crearSucursalDto - Datos para crear la sucursal
   * @returns Respuesta de la operación
   */
  async crearSucursal(crearSucursalDto: CrearSucursalDto): Promise<CrearSucursalRespuestaDto> {
    const resultado = await this.crearSucursalCasoUso.ejecutar(crearSucursalDto);

    // Convertir la entidad a DTO de respuesta si existe
    const data = resultado.data ? this.mapearSucursalARespuestaDto(resultado.data) : null;

    return {
      mensaje: resultado.mensaje,
      data,
      tipo_mensaje: resultado.tipo_mensaje,
      estado_respuesta: resultado.estado_respuesta,
    };
  }

  /**
   * Obtiene una lista de sucursales con filtros
   * @param filtros - Filtros de búsqueda
   * @returns Lista de sucursales con paginación
   */
  async obtenerSucursales(filtros: FiltrosSucursalDto): Promise<ListaSucursalesRespuestaDto> {
    try {
      // Aplicar paginación
      const pagina = filtros.pagina || 1;
      const limite = filtros.limite || 10;
      const skip = (pagina - 1) * limite;

      // Construir filtros para el repositorio
      const filtrosRepositorio = {
        tienda_id: filtros.tienda_id,
        ciudad: filtros.ciudad,
        provincia: filtros.provincia,
        activo: filtros.activo,
        tiene_cajas_abiertas: filtros.tiene_cajas_abiertas,
        fecha_creacion_desde: filtros.fecha_creacion_desde,
        fecha_creacion_hasta: filtros.fecha_creacion_hasta,
      };

      // Obtener sucursales del repositorio
      const sucursales = await this.repositorioSucursal.buscarConFiltros(filtrosRepositorio);

      // Aplicar paginación manual (en una implementación real, el repositorio debería manejar la paginación)
      const sucursalesPaginadas = sucursales.slice(skip, skip + limite);

      // Mapear a DTOs de respuesta
      const elementos = sucursalesPaginadas.map(sucursal => 
        this.mapearSucursalARespuestaDto(sucursal)
      );

      // Construir respuesta de paginación
      const paginacion: PaginacionDto = {
        total_elementos: sucursales.length,
        total_paginas: Math.ceil(sucursales.length / limite),
        pagina_actual: pagina,
        limite: limite,
      };

      return {
        mensaje: 'Lista de sucursales obtenida exitosamente',
        data: {
          elementos,
          paginacion,
        },
        tipo_mensaje: 'Exito',
        estado_respuesta: 200,
      };
    } catch (error) {
      console.error('Error en SucursalesService.obtenerSucursales:', error);
      return {
        mensaje: 'Error interno del servidor al obtener sucursales',
        data: {
          elementos: [],
          paginacion: {
            total_elementos: 0,
            total_paginas: 0,
            pagina_actual: 1,
            limite: 10,
          },
        },
        tipo_mensaje: 'ErrorServidor',
        estado_respuesta: 500,
      };
    }
  }

  /**
   * Obtiene una sucursal por su ID
   * @param id - ID de la sucursal
   * @returns Respuesta con la sucursal encontrada
   */
  async obtenerSucursalPorId(id: string): Promise<CrearSucursalRespuestaDto> {
    try {
      const sucursal = await this.repositorioSucursal.buscarPorId(id);

      if (!sucursal) {
        return {
          mensaje: 'Sucursal no encontrada',
          data: null,
          tipo_mensaje: 'ErrorCliente',
          estado_respuesta: 404,
        };
      }

      return {
        mensaje: 'Sucursal encontrada exitosamente',
        data: this.mapearSucursalARespuestaDto(sucursal),
        tipo_mensaje: 'Exito',
        estado_respuesta: 200,
      };
    } catch (error) {
      console.error('Error en SucursalesService.obtenerSucursalPorId:', error);
      return {
        mensaje: 'Error interno del servidor al obtener la sucursal',
        data: null,
        tipo_mensaje: 'ErrorServidor',
        estado_respuesta: 500,
      };
    }
  }

  /**
   * Actualiza una sucursal existente
   * @param id - ID de la sucursal a actualizar
   * @param actualizarSucursalDto - Datos actualizados
   * @returns Respuesta de la operación
   */
  async actualizarSucursal(
    id: string,
    actualizarSucursalDto: CrearSucursalDto,
  ): Promise<CrearSucursalRespuestaDto> {
    try {
      // Verificar que la sucursal existe
      const sucursalExistente = await this.repositorioSucursal.buscarPorId(id);
      if (!sucursalExistente) {
        return {
          mensaje: 'Sucursal no encontrada',
          data: null,
          tipo_mensaje: 'ErrorCliente',
          estado_respuesta: 404,
        };
      }

      // Verificar si el nombre ya existe en otra sucursal de la misma tienda
      if (actualizarSucursalDto.nombre !== sucursalExistente.nombre) {
        const existeSucursal = await this.repositorioSucursal.existeConNombre(
          actualizarSucursalDto.nombre,
          actualizarSucursalDto.tienda_id,
        );

        if (existeSucursal) {
          return {
            mensaje: 'Ya existe una sucursal con el mismo nombre en esta tienda',
            data: null,
            tipo_mensaje: 'ErrorCliente',
            estado_respuesta: 409,
          };
        }
      }

      // Actualizar la entidad
      sucursalExistente.nombre = actualizarSucursalDto.nombre;
      sucursalExistente.direccion = actualizarSucursalDto.direccion;
      sucursalExistente.ciudad = actualizarSucursalDto.ciudad;
      sucursalExistente.provincia = actualizarSucursalDto.provincia;
      sucursalExistente.codigo_postal = actualizarSucursalDto.codigo_postal;
      sucursalExistente.pais = actualizarSucursalDto.pais;
      sucursalExistente.telefono = actualizarSucursalDto.telefono;
      sucursalExistente.email = actualizarSucursalDto.email;
      sucursalExistente.fecha_actualizacion = new Date();

      // Validar la entidad actualizada
      if (!sucursalExistente.validarInformacion()) {
        return {
          mensaje: 'La información de la sucursal no es válida',
          data: null,
          tipo_mensaje: 'ErrorCliente',
          estado_respuesta: 400,
        };
      }

      // Guardar los cambios
      const sucursalActualizada = await this.repositorioSucursal.actualizar(sucursalExistente);

      return {
        mensaje: 'Sucursal actualizada exitosamente',
        data: this.mapearSucursalARespuestaDto(sucursalActualizada),
        tipo_mensaje: 'Exito',
        estado_respuesta: 200,
      };
    } catch (error) {
      console.error('Error en SucursalesService.actualizarSucursal:', error);
      return {
        mensaje: 'Error interno del servidor al actualizar la sucursal',
        data: null,
        tipo_mensaje: 'ErrorServidor',
        estado_respuesta: 500,
      };
    }
  }

  /**
   * Elimina una sucursal
   * @param id - ID de la sucursal a eliminar
   * @returns Respuesta de la operación
   */
  async eliminarSucursal(id: string): Promise<CrearSucursalRespuestaDto> {
    try {
      // Verificar que la sucursal existe
      const sucursal = await this.repositorioSucursal.buscarPorId(id);
      if (!sucursal) {
        return {
          mensaje: 'Sucursal no encontrada',
          data: null,
          tipo_mensaje: 'ErrorCliente',
          estado_respuesta: 404,
        };
      }

      // Verificar que no tenga cajas activas
      if (sucursal.estaOperativa()) {
        return {
          mensaje: 'No se puede eliminar la sucursal porque tiene cajas activas',
          data: null,
          tipo_mensaje: 'ErrorCliente',
          estado_respuesta: 409,
        };
      }

      // Eliminar la sucursal
      await this.repositorioSucursal.eliminar(id);

      return {
        mensaje: 'Sucursal eliminada exitosamente',
        data: null,
        tipo_mensaje: 'Exito',
        estado_respuesta: 200,
      };
    } catch (error) {
      console.error('Error en SucursalesService.eliminarSucursal:', error);
      return {
        mensaje: 'Error interno del servidor al eliminar la sucursal',
        data: null,
        tipo_mensaje: 'ErrorServidor',
        estado_respuesta: 500,
      };
    }
  }

  /**
   * Activa una sucursal
   * @param id - ID de la sucursal a activar
   * @returns Respuesta de la operación
   */
  async activarSucursal(id: string): Promise<CrearSucursalRespuestaDto> {
    try {
      const sucursal = await this.repositorioSucursal.buscarPorId(id);
      if (!sucursal) {
        return {
          mensaje: 'Sucursal no encontrada',
          data: null,
          tipo_mensaje: 'ErrorCliente',
          estado_respuesta: 404,
        };
      }

      sucursal.activar();
      const sucursalActualizada = await this.repositorioSucursal.actualizar(sucursal);

      return {
        mensaje: 'Sucursal activada exitosamente',
        data: this.mapearSucursalARespuestaDto(sucursalActualizada),
        tipo_mensaje: 'Exito',
        estado_respuesta: 200,
      };
    } catch (error) {
      console.error('Error en SucursalesService.activarSucursal:', error);
      return {
        mensaje: 'Error interno del servidor al activar la sucursal',
        data: null,
        tipo_mensaje: 'ErrorServidor',
        estado_respuesta: 500,
      };
    }
  }

  /**
   * Desactiva una sucursal
   * @param id - ID de la sucursal a desactivar
   * @returns Respuesta de la operación
   */
  async desactivarSucursal(id: string): Promise<CrearSucursalRespuestaDto> {
    try {
      const sucursal = await this.repositorioSucursal.buscarPorId(id);
      if (!sucursal) {
        return {
          mensaje: 'Sucursal no encontrada',
          data: null,
          tipo_mensaje: 'ErrorCliente',
          estado_respuesta: 404,
        };
      }

      // Verificar que no tenga cajas abiertas
      if (sucursal.estaOperativa()) {
        return {
          mensaje: 'No se puede desactivar la sucursal porque tiene cajas abiertas',
          data: null,
          tipo_mensaje: 'ErrorCliente',
          estado_respuesta: 409,
        };
      }

      sucursal.desactivar();
      const sucursalActualizada = await this.repositorioSucursal.actualizar(sucursal);

      return {
        mensaje: 'Sucursal desactivada exitosamente',
        data: this.mapearSucursalARespuestaDto(sucursalActualizada),
        tipo_mensaje: 'Exito',
        estado_respuesta: 200,
      };
    } catch (error) {
      console.error('Error en SucursalesService.desactivarSucursal:', error);
      return {
        mensaje: 'Error interno del servidor al desactivar la sucursal',
        data: null,
        tipo_mensaje: 'ErrorServidor',
        estado_respuesta: 500,
      };
    }
  }

  /**
   * Obtiene sucursales por tienda
   * @param tienda_id - ID de la tienda
   * @returns Lista de sucursales de la tienda
   */
  async obtenerSucursalesPorTienda(tienda_id: string): Promise<ListaSucursalesRespuestaDto> {
    try {
      const sucursales = await this.repositorioSucursal.buscarPorTienda(tienda_id);
      
      const elementos = sucursales.map(sucursal => 
        this.mapearSucursalARespuestaDto(sucursal)
      );

      const paginacion: PaginacionDto = {
        total_elementos: elementos.length,
        total_paginas: 1,
        pagina_actual: 1,
        limite: elementos.length,
      };

      return {
        mensaje: 'Lista de sucursales por tienda obtenida exitosamente',
        data: {
          elementos,
          paginacion,
        },
        tipo_mensaje: 'Exito',
        estado_respuesta: 200,
      };
    } catch (error) {
      console.error('Error en SucursalesService.obtenerSucursalesPorTienda:', error);
      return {
        mensaje: 'Error interno del servidor al obtener sucursales por tienda',
        data: {
          elementos: [],
          paginacion: {
            total_elementos: 0,
            total_paginas: 0,
            pagina_actual: 1,
            limite: 0,
          },
        },
        tipo_mensaje: 'ErrorServidor',
        estado_respuesta: 500,
      };
    }
  }

  /**
   * Obtiene sucursales activas por tienda
   * @param tienda_id - ID de la tienda
   * @returns Lista de sucursales activas de la tienda
   */
  async obtenerSucursalesActivasPorTienda(tienda_id: string): Promise<ListaSucursalesRespuestaDto> {
    try {
      const sucursales = await this.repositorioSucursal.buscarActivasPorTienda(tienda_id);
      
      const elementos = sucursales.map(sucursal => 
        this.mapearSucursalARespuestaDto(sucursal)
      );

      const paginacion: PaginacionDto = {
        total_elementos: elementos.length,
        total_paginas: 1,
        pagina_actual: 1,
        limite: elementos.length,
      };

      return {
        mensaje: 'Lista de sucursales activas por tienda obtenida exitosamente',
        data: {
          elementos,
          paginacion,
        },
        tipo_mensaje: 'Exito',
        estado_respuesta: 200,
      };
    } catch (error) {
      console.error('Error en SucursalesService.obtenerSucursalesActivasPorTienda:', error);
      return {
        mensaje: 'Error interno del servidor al obtener sucursales activas por tienda',
        data: {
          elementos: [],
          paginacion: {
            total_elementos: 0,
            total_paginas: 0,
            pagina_actual: 1,
            limite: 0,
          },
        },
        tipo_mensaje: 'ErrorServidor',
        estado_respuesta: 500,
      };
    }
  }

  /**
   * Obtiene estadísticas de sucursales por tienda
   * @param tienda_id - ID de la tienda
   * @returns Estadísticas de las sucursales
   */
  async obtenerEstadisticasPorTienda(tienda_id: string) {
    try {
      const estadisticas = await this.repositorioSucursal.obtenerEstadisticasPorTienda(tienda_id);

      return {
        mensaje: 'Estadísticas obtenidas exitosamente',
        data: estadisticas,
        tipo_mensaje: 'Exito',
        estado_respuesta: 200,
      };
    } catch (error) {
      console.error('Error en SucursalesService.obtenerEstadisticasPorTienda:', error);
      return {
        mensaje: 'Error interno del servidor al obtener estadísticas',
        data: null,
        tipo_mensaje: 'ErrorServidor',
        estado_respuesta: 500,
      };
    }
  }

  /**
   * Mapea una entidad Sucursal a un DTO de respuesta
   * @param sucursal - Entidad de sucursal
   * @returns DTO de respuesta de sucursal
   */
  private mapearSucursalARespuestaDto(sucursal: Sucursal): SucursalRespuestaDto {
    return {
      id: sucursal.id,
      nombre: sucursal.nombre,
      direccion: sucursal.direccion,
      ciudad: sucursal.ciudad,
      provincia: sucursal.provincia,
      codigo_postal: sucursal.codigo_postal,
      pais: sucursal.pais,
      telefono: sucursal.telefono,
      email: sucursal.email,
      activo: sucursal.activo,
      fecha_creacion: sucursal.fecha_creacion,
      fecha_actualizacion: sucursal.fecha_actualizacion,
      tienda_id: sucursal.tienda_id,
      cantidad_cajas: sucursal.cajas?.length || 0,
      cantidad_usuarios: sucursal.usuarios_sucursal?.length || 0,
    };
  }
}