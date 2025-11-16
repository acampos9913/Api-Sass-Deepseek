import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { ConfiguracionSucursales } from '../../dominio/entidades/configuracion-sucursales.entity';
import type { RepositorioConfiguracionSucursales } from '../../dominio/interfaces/repositorio-configuracion-sucursales.interface';
import { ConfiguracionSucursalesDto, ActualizarConfiguracionSucursalesDto, EstadoSucursalEnum, TipoSuscripcionPosEnum } from '../../aplicacion/dto/configuracion-sucursales.dto';
import { ExcepcionDominio } from '../../../comun/excepciones/excepcion-dominio';

/**
 * Implementación del repositorio de configuración de sucursales con Prisma
 */
@Injectable()
export class PrismaRepositorioConfiguracionSucursales implements RepositorioConfiguracionSucursales {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crea una nueva configuración de sucursales
   */
  async crear(configuracionSucursales: ConfiguracionSucursales): Promise<ConfiguracionSucursales> {
    try {
      const sucursalCreada = await this.prisma.configuracionSucursales.create({
        data: {
          id: configuracionSucursales.getId(),
          tienda_id: configuracionSucursales.getTiendaId(),
          nombre_sucursal: configuracionSucursales.getNombreSucursal(),
          direccion: configuracionSucursales.getDireccion(),
          estado: configuracionSucursales.getEstado(),
          suscripcion_pos: configuracionSucursales.getSuscripcionPos(),
          capacidad_stock: configuracionSucursales.getCapacidadStock(),
          productos_asignados: configuracionSucursales.getProductosAsignados(),
          ventas_persona_estado: configuracionSucursales.getVentasPersonaEstado(),
          metodos_pago_local: configuracionSucursales.getMetodosPagoLocal(),
          responsable: configuracionSucursales.getResponsable(),
          horario: configuracionSucursales.getHorario(),
          telefono: configuracionSucursales.getTelefono(),
          email: configuracionSucursales.getEmail(),
          fecha_creacion: configuracionSucursales.getFechaCreacion(),
          fecha_actualizacion: configuracionSucursales.getFechaActualizacion(),
        },
      });

      return this.aEntidad(sucursalCreada);
    } catch (error) {
      if (error.code === 'P2002') {
        // Error de duplicado único de Prisma
        throw ExcepcionDominio.Respuesta400(
          'Ya existe una sucursal con los mismos datos',
          'Sucursal.Duplicada'
        );
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al crear la sucursal en la base de datos',
        'Sucursal.ErrorBaseDatos'
      );
    }
  }

  /**
   * Encuentra una configuración de sucursales por ID
   */
  async encontrarPorId(id: string, tiendaId: string): Promise<ConfiguracionSucursales | null> {
    try {
      const sucursal = await this.prisma.configuracionSucursales.findFirst({
        where: {
          id,
          tienda_id: tiendaId,
        },
      });

      if (!sucursal) {
        return null;
      }

      return this.aEntidad(sucursal);
    } catch (error) {
      throw ExcepcionDominio.Respuesta500(
        'Error al buscar la sucursal en la base de datos',
        'Sucursal.ErrorBusquedaBaseDatos'
      );
    }
  }

  /**
   * Encuentra todas las configuraciones de sucursales de una tienda
   */
  async encontrarTodasPorTienda(tiendaId: string): Promise<ConfiguracionSucursales[]> {
    try {
      const sucursales = await this.prisma.configuracionSucursales.findMany({
        where: {
          tienda_id: tiendaId,
        },
        orderBy: {
          fecha_creacion: 'desc',
        },
      });

      return sucursales.map(sucursal => this.aEntidad(sucursal));
    } catch (error) {
      throw ExcepcionDominio.Respuesta500(
        'Error al obtener las sucursales de la base de datos',
        'Sucursales.ErrorObtencionBaseDatos'
      );
    }
  }

  /**
   * Encuentra configuraciones de sucursales por estado
   */
  async encontrarPorEstado(tiendaId: string, estado: string): Promise<ConfiguracionSucursales[]> {
    try {
      const sucursales = await this.prisma.configuracionSucursales.findMany({
        where: {
          tienda_id: tiendaId,
          estado: estado as EstadoSucursalEnum,
        },
        orderBy: {
          fecha_creacion: 'desc',
        },
      });

      return sucursales.map(sucursal => this.aEntidad(sucursal));
    } catch (error) {
      throw ExcepcionDominio.Respuesta500(
        'Error al obtener las sucursales por estado de la base de datos',
        'Sucursales.ErrorObtencionPorEstadoBaseDatos'
      );
    }
  }

  /**
   * Actualiza una configuración de sucursales
   */
  async actualizar(
    id: string,
    tiendaId: string,
    datos: ActualizarConfiguracionSucursalesDto,
  ): Promise<ConfiguracionSucursales> {
    try {
      // Primero obtener la entidad actual
      const sucursalExistente = await this.encontrarPorId(id, tiendaId);
      
      if (!sucursalExistente) {
        throw ExcepcionDominio.Respuesta404(
          'Sucursal no encontrada',
          'Sucursal.NoEncontrada'
        );
      }

      // Actualizar la entidad de dominio
      sucursalExistente.actualizar(datos);

      // Guardar en base de datos
      const sucursalActualizada = await this.prisma.configuracionSucursales.update({
        where: {
          id,
          tienda_id: tiendaId,
        },
        data: {
          nombre_sucursal: datos.nombre_sucursal,
          direccion: datos.direccion,
          estado: datos.estado,
          suscripcion_pos: datos.suscripcion_pos,
          capacidad_stock: datos.capacidad_stock,
          productos_asignados: datos.productos_asignados,
          ventas_persona_estado: datos.ventas_persona_estado,
          metodos_pago_local: datos.metodos_pago_local,
          responsable: datos.responsable,
          horario: datos.horario,
          telefono: datos.telefono,
          email: datos.email,
          fecha_actualizacion: new Date(),
        },
      });

      return this.aEntidad(sucursalActualizada);
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      if (error.code === 'P2025') {
        // Registro no encontrado en Prisma
        throw ExcepcionDominio.Respuesta404(
          'Sucursal no encontrada',
          'Sucursal.NoEncontrada'
        );
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al actualizar la sucursal en la base de datos',
        'Sucursal.ErrorActualizacionBaseDatos'
      );
    }
  }

  /**
   * Elimina una configuración de sucursales
   */
  async eliminar(id: string, tiendaId: string): Promise<boolean> {
    try {
      await this.prisma.configuracionSucursales.delete({
        where: {
          id,
          tienda_id: tiendaId,
        },
      });

      return true;
    } catch (error) {
      if (error.code === 'P2025') {
        // Registro no encontrado en Prisma
        return false;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al eliminar la sucursal de la base de datos',
        'Sucursal.ErrorEliminacionBaseDatos'
      );
    }
  }

  /**
   * Activa una sucursal
   */
  async activar(id: string, tiendaId: string): Promise<ConfiguracionSucursales> {
    try {
      const sucursalActualizada = await this.prisma.configuracionSucursales.update({
        where: {
          id,
          tienda_id: tiendaId,
        },
        data: {
          estado: EstadoSucursalEnum.ACTIVA,
          fecha_actualizacion: new Date(),
        },
      });

      return this.aEntidad(sucursalActualizada);
    } catch (error) {
      if (error.code === 'P2025') {
        throw ExcepcionDominio.Respuesta404(
          'Sucursal no encontrada',
          'Sucursal.NoEncontrada'
        );
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al activar la sucursal en la base de datos',
        'Sucursal.ErrorActivacionBaseDatos'
      );
    }
  }

  /**
   * Desactiva una sucursal
   */
  async desactivar(id: string, tiendaId: string): Promise<ConfiguracionSucursales> {
    try {
      const sucursalActualizada = await this.prisma.configuracionSucursales.update({
        where: {
          id,
          tienda_id: tiendaId,
        },
        data: {
          estado: EstadoSucursalEnum.INACTIVA,
          fecha_actualizacion: new Date(),
        },
      });

      return this.aEntidad(sucursalActualizada);
    } catch (error) {
      if (error.code === 'P2025') {
        throw ExcepcionDominio.Respuesta404(
          'Sucursal no encontrada',
          'Sucursal.NoEncontrada'
        );
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al desactivar la sucursal en la base de datos',
        'Sucursal.ErrorDesactivacionBaseDatos'
      );
    }
  }

  /**
   * Verifica si existe una sucursal con el mismo nombre en la tienda
   */
  async existeConNombre(nombreSucursal: string, tiendaId: string, excludeId?: string): Promise<boolean> {
    try {
      const whereClause: any = {
        nombre_sucursal: nombreSucursal,
        tienda_id: tiendaId,
      };

      if (excludeId) {
        whereClause.NOT = {
          id: excludeId,
        };
      }

      const count = await this.prisma.configuracionSucursales.count({
        where: whereClause,
      });

      return count > 0;
    } catch (error) {
      throw ExcepcionDominio.Respuesta500(
        'Error al verificar duplicado de nombre en la base de datos',
        'Sucursal.ErrorVerificacionDuplicadoNombre'
      );
    }
  }

  /**
   * Verifica si existe una sucursal con la misma dirección en la tienda
   */
  async existeConDireccion(direccion: any, tiendaId: string, excludeId?: string): Promise<boolean> {
    try {
      const whereClause: any = {
        direccion: {
          equals: direccion,
        },
        tienda_id: tiendaId,
      };

      if (excludeId) {
        whereClause.NOT = {
          id: excludeId,
        };
      }

      const count = await this.prisma.configuracionSucursales.count({
        where: whereClause,
      });

      return count > 0;
    } catch (error) {
      throw ExcepcionDominio.Respuesta500(
        'Error al verificar duplicado de dirección en la base de datos',
        'Sucursal.ErrorVerificacionDuplicadoDireccion'
      );
    }
  }

  /**
   * Cuenta el número de sucursales activas por tienda
   */
  async contarSucursalesActivas(tiendaId: string): Promise<number> {
    try {
      return await this.prisma.configuracionSucursales.count({
        where: {
          tienda_id: tiendaId,
          estado: EstadoSucursalEnum.ACTIVA,
        },
      });
    } catch (error) {
      throw ExcepcionDominio.Respuesta500(
        'Error al contar sucursales activas en la base de datos',
        'Sucursales.ErrorContadorActivasBaseDatos'
      );
    }
  }

  /**
   * Encuentra sucursales por responsable
   */
  async encontrarPorResponsable(tiendaId: string, responsable: string): Promise<ConfiguracionSucursales[]> {
    try {
      const sucursales = await this.prisma.configuracionSucursales.findMany({
        where: {
          tienda_id: tiendaId,
          responsable,
        },
        orderBy: {
          fecha_creacion: 'desc',
        },
      });

      return sucursales.map(sucursal => this.aEntidad(sucursal));
    } catch (error) {
      throw ExcepcionDominio.Respuesta500(
        'Error al obtener sucursales por responsable de la base de datos',
        'Sucursales.ErrorObtencionPorResponsableBaseDatos'
      );
    }
  }

  /**
   * Convierte un registro de Prisma a entidad de dominio
   */
  private aEntidad(registro: any): ConfiguracionSucursales {
    return new ConfiguracionSucursales(
      registro.id,
      registro.tienda_id,
      registro.nombre_sucursal,
      registro.direccion,
      registro.estado,
      registro.productos_asignados || [],
      registro.ventas_persona_estado || false,
      registro.metodos_pago_local || [],
      registro.suscripcion_pos,
      registro.capacidad_stock,
      registro.responsable,
      registro.horario,
      registro.telefono,
      registro.email,
      registro.fecha_creacion,
      registro.fecha_actualizacion
    );
  }
}