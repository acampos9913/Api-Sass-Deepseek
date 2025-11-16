import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { ConfiguracionDominios } from '../../dominio/entidades/configuracion-dominios.entity';
import { RepositorioConfiguracionDominios } from '../../dominio/interfaces/repositorio-configuracion-dominios.interface';
import {
  DominioDto,
  TipoDominioEnum,
  EstadoConexionDominioEnum,
  FuenteDominioEnum
} from '../../aplicacion/dto/configuracion-dominios.dto';
import { ExcepcionDominio } from '../../../comun/excepciones/excepcion-dominio';

/**
 * Implementación Prisma del repositorio para Configuración de Dominios
 * Maneja la persistencia en PostgreSQL usando Prisma ORM
 */
@Injectable()
export class PrismaRepositorioConfiguracionDominios implements RepositorioConfiguracionDominios {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Encontrar configuración de dominios por ID de tienda
   */
  async encontrarPorTiendaId(tiendaId: string): Promise<ConfiguracionDominios | null> {
    try {
      const configuracionBD = await this.prisma.configuracionDominios.findUnique({
        where: { tienda_id: tiendaId }
      });

      if (!configuracionBD) {
        return null;
      }

      return this.aEntidad(configuracionBD);
    } catch (error) {
      throw ExcepcionDominio.Respuesta500(
        'Error al buscar configuración de dominios por tienda',
        'Dominios.ErrorBusquedaPorTienda'
      );
    }
  }

  /**
   * Encontrar configuración de dominios por ID
   */
  async encontrarPorId(id: string): Promise<ConfiguracionDominios | null> {
    try {
      const configuracionBD = await this.prisma.configuracionDominios.findUnique({
        where: { id }
      });

      if (!configuracionBD) {
        return null;
      }

      return this.aEntidad(configuracionBD);
    } catch (error) {
      throw ExcepcionDominio.Respuesta500(
        'Error al buscar configuración de dominios por ID',
        'Dominios.ErrorBusquedaPorId'
      );
    }
  }

  /**
   * Guardar configuración de dominios (crear o actualizar)
   */
  async guardar(configuracion: ConfiguracionDominios): Promise<ConfiguracionDominios> {
    try {
      const existe = await this.prisma.configuracionDominios.findUnique({
        where: { tienda_id: configuracion.tiendaId }
      });

      if (existe) {
        return await this.actualizar(configuracion);
      } else {
        return await this.crear(configuracion);
      }
    } catch (error) {
      throw ExcepcionDominio.Respuesta500(
        'Error al guardar configuración de dominios',
        'Dominios.ErrorGuardar'
      );
    }
  }

  /**
   * Crear nueva configuración de dominios
   */
  async crear(configuracion: ConfiguracionDominios): Promise<ConfiguracionDominios> {
    try {
      const configuracionBD = await this.prisma.configuracionDominios.create({
        data: {
          id: configuracion.id,
          tienda_id: configuracion.tiendaId,
          dominios: configuracion.dominios as any, // Conversión a JSON para Prisma
          dominio_principal: configuracion.dominioPrincipal,
          redireccionamiento_global: configuracion.redireccionamientoGlobal,
          fecha_creacion: configuracion.fechaCreacion,
          fecha_actualizacion: configuracion.fechaActualizacion
        }
      });

      return this.aEntidad(configuracionBD);
    } catch (error) {
      if (error.code === 'P2002') {
        throw ExcepcionDominio.Respuesta400(
          'Ya existe una configuración de dominios para esta tienda',
          'Dominios.ConfiguracionExistente'
        );
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al crear configuración de dominios',
        'Dominios.ErrorCreacion'
      );
    }
  }

  /**
   * Actualizar configuración de dominios existente
   */
  async actualizar(configuracion: ConfiguracionDominios): Promise<ConfiguracionDominios> {
    try {
      const configuracionBD = await this.prisma.configuracionDominios.update({
        where: { id: configuracion.id },
        data: {
          dominios: configuracion.dominios as any, // Conversión a JSON para Prisma
          dominio_principal: configuracion.dominioPrincipal,
          redireccionamiento_global: configuracion.redireccionamientoGlobal,
          fecha_actualizacion: configuracion.fechaActualizacion
        }
      });

      return this.aEntidad(configuracionBD);
    } catch (error) {
      if (error.code === 'P2025') {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de dominios no encontrada',
          'Dominios.ConfiguracionNoEncontrada'
        );
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al actualizar configuración de dominios',
        'Dominios.ErrorActualizacion'
      );
    }
  }

  /**
   * Eliminar configuración de dominios
   */
  async eliminar(id: string): Promise<void> {
    try {
      await this.prisma.configuracionDominios.delete({
        where: { id }
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de dominios no encontrada',
          'Dominios.ConfiguracionNoEncontrada'
        );
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al eliminar configuración de dominios',
        'Dominios.ErrorEliminacion'
      );
    }
  }

  /**
   * Verificar si existe configuración para una tienda
   */
  async existePorTiendaId(tiendaId: string): Promise<boolean> {
    try {
      const configuracion = await this.prisma.configuracionDominios.findUnique({
        where: { tienda_id: tiendaId },
        select: { id: true }
      });

      return configuracion !== null;
    } catch (error) {
      throw ExcepcionDominio.Respuesta500(
        'Error al verificar existencia de configuración de dominios',
        'Dominios.ErrorVerificacionExistencia'
      );
    }
  }

  /**
   * Encontrar dominio específico por nombre
   */
  async encontrarDominioPorNombre(tiendaId: string, nombreDominio: string): Promise<DominioDto | null> {
    try {
      const configuracion = await this.prisma.configuracionDominios.findUnique({
        where: { tienda_id: tiendaId }
      });

      if (!configuracion) {
        return null;
      }

      const dominios = configuracion.dominios as any as DominioDto[];
      return dominios.find(dominio => dominio.nombre_dominio === nombreDominio) || null;
    } catch (error) {
      throw ExcepcionDominio.Respuesta500(
        'Error al buscar dominio por nombre',
        'Dominios.ErrorBusquedaDominioPorNombre'
      );
    }
  }

  /**
   * Encontrar dominios por tipo
   */
  async encontrarDominiosPorTipo(tiendaId: string, tipo: string): Promise<DominioDto[]> {
    try {
      const configuracion = await this.prisma.configuracionDominios.findUnique({
        where: { tienda_id: tiendaId }
      });

      if (!configuracion) {
        return [];
      }

      const dominios = configuracion.dominios as any as DominioDto[];
      return dominios.filter(dominio => dominio.tipo_dominio === tipo);
    } catch (error) {
      throw ExcepcionDominio.Respuesta500(
        'Error al buscar dominios por tipo',
        'Dominios.ErrorBusquedaDominiosPorTipo'
      );
    }
  }

  /**
   * Encontrar dominios conectados
   */
  async encontrarDominiosConectados(tiendaId: string): Promise<DominioDto[]> {
    try {
      const configuracion = await this.prisma.configuracionDominios.findUnique({
        where: { tienda_id: tiendaId }
      });

      if (!configuracion) {
        return [];
      }

      const dominios = configuracion.dominios as any as DominioDto[];
      return dominios.filter(dominio => dominio.estado === EstadoConexionDominioEnum.CONECTADO);
    } catch (error) {
      throw ExcepcionDominio.Respuesta500(
        'Error al buscar dominios conectados',
        'Dominios.ErrorBusquedaDominiosConectados'
      );
    }
  }

  /**
   * Contar dominios por tienda
   */
  async contarDominiosPorTienda(tiendaId: string): Promise<number> {
    try {
      const configuracion = await this.prisma.configuracionDominios.findUnique({
        where: { tienda_id: tiendaId }
      });

      if (!configuracion) {
        return 0;
      }

      const dominios = configuracion.dominios as any as DominioDto[];
      return dominios.length;
    } catch (error) {
      throw ExcepcionDominio.Respuesta500(
        'Error al contar dominios',
        'Dominios.ErrorContarDominios'
      );
    }
  }

  /**
   * Convertir entidad de base de datos a entidad de dominio
   */
  private aEntidad(configuracionBD: any): ConfiguracionDominios {
    const dominios = configuracionBD.dominios as any as DominioDto[];

    return ConfiguracionDominios.reconstruir(
      configuracionBD.id,
      configuracionBD.tienda_id,
      dominios,
      configuracionBD.dominio_principal,
      configuracionBD.redireccionamiento_global,
      configuracionBD.fecha_creacion,
      configuracionBD.fecha_actualizacion
    );
  }
}