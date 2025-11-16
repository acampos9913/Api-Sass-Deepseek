import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { RepositorioConfiguracionPoliticas } from '../../dominio/interfaces/repositorio-configuracion-politicas.interface';
import { ConfiguracionPoliticas } from '../../dominio/entidades/configuracion-politicas.entity';
import { EstadoReglasDevolucionEnum, TipoReglaDevolucionEnum } from '../../aplicacion/dto/configuracion-politicas.dto';
import { ExcepcionDominio } from '../../../comun/excepciones/excepcion-dominio';

/**
 * Implementación del repositorio de configuración de políticas usando Prisma
 * Maneja la persistencia de datos en PostgreSQL para la configuración de políticas
 */
@Injectable()
export class PrismaRepositorioConfiguracionPoliticas implements RepositorioConfiguracionPoliticas {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Buscar configuración de políticas por ID
   */
  async buscarPorId(id: string): Promise<ConfiguracionPoliticas | null> {
    try {
      const configuracionDB = await this.prisma.configuracionPoliticas.findUnique({
        where: { id },
      });

      if (!configuracionDB) {
        return null;
      }

      return this.aEntidad(configuracionDB);
    } catch (error) {
      throw ExcepcionDominio.Respuesta500(
        'Error al buscar configuración de políticas por ID',
        'Politicas.ErrorBuscarPorId'
      );
    }
  }

  /**
   * Buscar configuración de políticas por ID de tienda
   */
  async buscarPorTiendaId(tiendaId: string): Promise<ConfiguracionPoliticas | null> {
    try {
      const configuracionDB = await this.prisma.configuracionPoliticas.findFirst({
        where: { tienda_id: tiendaId },
      });

      if (!configuracionDB) {
        return null;
      }

      return this.aEntidad(configuracionDB);
    } catch (error) {
      throw ExcepcionDominio.Respuesta500(
        'Error al buscar configuración de políticas por tienda',
        'Politicas.ErrorBuscarPorTiendaId'
      );
    }
  }

  /**
   * Guardar una nueva configuración de políticas
   */
  async guardar(configuracion: ConfiguracionPoliticas): Promise<ConfiguracionPoliticas> {
    try {
      const dto = configuracion.aDto();

      const configuracionDB = await this.prisma.configuracionPoliticas.create({
        data: {
          id: dto.id,
          tienda_id: dto.tienda_id,
          estado_reglas_devolucion: dto.estado_reglas_devolucion,
          reglas_devolucion: dto.reglas_devolucion,
          politica_privacidad: dto.politica_privacidad,
          terminos_servicio: dto.terminos_servicio,
          politica_envios: dto.politica_envios,
          informacion_contacto: dto.informacion_contacto,
          productos_venta_final: dto.productos_venta_final,
          fecha_creacion: dto.fecha_creacion,
          fecha_actualizacion: dto.fecha_actualizacion,
        },
      });

      return this.aEntidad(configuracionDB);
    } catch (error) {
      if (error.code === 'P2002') {
        throw ExcepcionDominio.duplicado(
          'Configuración de políticas',
          'Politicas.ConfiguracionDuplicada'
        );
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al guardar configuración de políticas',
        'Politicas.ErrorGuardarConfiguracion'
      );
    }
  }

  /**
   * Actualizar una configuración de políticas existente
   */
  async actualizar(configuracion: ConfiguracionPoliticas): Promise<ConfiguracionPoliticas> {
    try {
      const dto = configuracion.aDto();

      const configuracionDB = await this.prisma.configuracionPoliticas.update({
        where: { id: dto.id },
        data: {
          estado_reglas_devolucion: dto.estado_reglas_devolucion,
          reglas_devolucion: dto.reglas_devolucion,
          politica_privacidad: dto.politica_privacidad,
          terminos_servicio: dto.terminos_servicio,
          politica_envios: dto.politica_envios,
          informacion_contacto: dto.informacion_contacto,
          productos_venta_final: dto.productos_venta_final,
          fecha_actualizacion: dto.fecha_actualizacion,
        },
      });

      return this.aEntidad(configuracionDB);
    } catch (error) {
      if (error.code === 'P2025') {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de políticas no encontrada',
          'Politicas.ConfiguracionNoEncontrada'
        );
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al actualizar configuración de políticas',
        'Politicas.ErrorActualizarConfiguracion'
      );
    }
  }

  /**
   * Eliminar configuración de políticas por ID
   */
  async eliminar(id: string): Promise<void> {
    try {
      await this.prisma.configuracionPoliticas.delete({
        where: { id },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de políticas no encontrada',
          'Politicas.ConfiguracionNoEncontrada'
        );
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al eliminar configuración de políticas',
        'Politicas.ErrorEliminarConfiguracion'
      );
    }
  }

  /**
   * Verificar si existe configuración de políticas para una tienda
   */
  async existePorTiendaId(tiendaId: string): Promise<boolean> {
    try {
      const count = await this.prisma.configuracionPoliticas.count({
        where: { tienda_id: tiendaId },
      });

      return count > 0;
    } catch (error) {
      throw ExcepcionDominio.Respuesta500(
        'Error al verificar existencia de configuración de políticas',
        'Politicas.ErrorVerificarExistencia'
      );
    }
  }

  /**
   * Buscar todas las configuraciones de políticas (para administración)
   */
  async buscarTodas(): Promise<ConfiguracionPoliticas[]> {
    try {
      const configuracionesDB = await this.prisma.configuracionPoliticas.findMany({
        orderBy: { fecha_creacion: 'desc' },
      });

      return configuracionesDB.map(configuracionDB => this.aEntidad(configuracionDB));
    } catch (error) {
      throw ExcepcionDominio.Respuesta500(
        'Error al buscar todas las configuraciones de políticas',
        'Politicas.ErrorBuscarTodas'
      );
    }
  }

  /**
   * Buscar configuraciones de políticas por estado de reglas de devolución
   */
  async buscarPorEstadoReglasDevolucion(estado: string): Promise<ConfiguracionPoliticas[]> {
    try {
      const configuracionesDB = await this.prisma.configuracionPoliticas.findMany({
        where: { estado_reglas_devolucion: estado },
        orderBy: { fecha_creacion: 'desc' },
      });

      return configuracionesDB.map(configuracionDB => this.aEntidad(configuracionDB));
    } catch (error) {
      throw ExcepcionDominio.Respuesta500(
        'Error al buscar configuraciones por estado de reglas de devolución',
        'Politicas.ErrorBuscarPorEstadoReglasDevolucion'
      );
    }
  }

  /**
   * Buscar configuraciones de políticas que contengan un producto en venta final
   */
  async buscarPorProductoVentaFinal(productoId: string): Promise<ConfiguracionPoliticas[]> {
    try {
      const configuracionesDB = await this.prisma.configuracionPoliticas.findMany({
        where: {
          productos_venta_final: {
            has: productoId,
          },
        },
        orderBy: { fecha_creacion: 'desc' },
      });

      return configuracionesDB.map(configuracionDB => this.aEntidad(configuracionDB));
    } catch (error) {
      throw ExcepcionDominio.Respuesta500(
        'Error al buscar configuraciones por producto en venta final',
        'Politicas.ErrorBuscarPorProductoVentaFinal'
      );
    }
  }

  /**
   * Contar el total de configuraciones de políticas
   */
  async contarTotal(): Promise<number> {
    try {
      return await this.prisma.configuracionPoliticas.count();
    } catch (error) {
      throw ExcepcionDominio.Respuesta500(
        'Error al contar configuraciones de políticas',
        'Politicas.ErrorContarTotal'
      );
    }
  }

  /**
   * Buscar configuraciones de políticas con paginación
   */
  async buscarConPaginacion(
    pagina: number,
    limite: number,
    tiendaId?: string,
  ): Promise<{
    configuraciones: ConfiguracionPoliticas[];
    total: number;
    paginas: number;
  }> {
    try {
      const skip = (pagina - 1) * limite;
      
      const where = tiendaId ? { tienda_id: tiendaId } : {};

      const [configuracionesDB, total] = await Promise.all([
        this.prisma.configuracionPoliticas.findMany({
          where,
          skip,
          take: limite,
          orderBy: { fecha_creacion: 'desc' },
        }),
        this.prisma.configuracionPoliticas.count({ where }),
      ]);

      const paginas = Math.ceil(total / limite);

      return {
        configuraciones: configuracionesDB.map(configuracionDB => this.aEntidad(configuracionDB)),
        total,
        paginas,
      };
    } catch (error) {
      throw ExcepcionDominio.Respuesta500(
        'Error al buscar configuraciones con paginación',
        'Politicas.ErrorBuscarConPaginacion'
      );
    }
  }

  /**
   * Convertir entidad de base de datos a entidad de dominio
   */
  private aEntidad(configuracionDB: any): ConfiguracionPoliticas {
    const configuracion = ConfiguracionPoliticas.crear(
      configuracionDB.id,
      configuracionDB.tienda_id,
      configuracionDB.estado_reglas_devolucion as EstadoReglasDevolucionEnum,
      configuracionDB.reglas_devolucion,
      configuracionDB.politica_privacidad,
      configuracionDB.terminos_servicio,
      configuracionDB.politica_envios,
      configuracionDB.informacion_contacto,
      configuracionDB.productos_venta_final,
    );

    // Asignar fechas desde la base de datos
    (configuracion as any).fechaCreacion = configuracionDB.fecha_creacion;
    (configuracion as any).fechaActualizacion = configuracionDB.fecha_actualizacion;

    return configuracion;
  }
}