import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { EstadoMercado } from '../../dominio/enums/estado-mercado.enum';
import type { RepositorioMercado } from '../../dominio/interfaces/repositorio-mercado.interface';

/**
 * Implementación del repositorio de mercado usando Prisma
 * Adapta la interfaz de dominio a la implementación específica de Prisma
 */
@Injectable()
export class PrismaRepositorioMercado implements RepositorioMercado {
  constructor(private readonly prisma: PrismaClient) {}

  async crear(mercado: {
    id: string;
    nombre: string;
    codigo: string;
    moneda: string;
    idioma: string;
    zonaHoraria: string;
    estado: EstadoMercado;
    activo: boolean;
    fechaCreacion: Date;
    fechaActualizacion: Date;
    tiendaId: string | null;
    configuracion: Record<string, any> | null;
  }): Promise<void> {
    await this.prisma.mercado.create({
      data: {
        id: mercado.id,
        nombre: mercado.nombre,
        codigo: mercado.codigo,
        moneda: mercado.moneda,
        idioma: mercado.idioma,
        zona_horaria: mercado.zonaHoraria,
        estado: mercado.estado,
        activo: mercado.activo,
        fecha_creacion: mercado.fechaCreacion,
        fecha_actualizacion: mercado.fechaActualizacion,
        tienda_id: mercado.tiendaId,
        configuracion: mercado.configuracion,
      },
    });
  }

  async buscarPorId(id: string): Promise<{
    id: string;
    nombre: string;
    codigo: string;
    moneda: string;
    idioma: string;
    zonaHoraria: string;
    estado: EstadoMercado;
    activo: boolean;
    fechaCreacion: Date;
    fechaActualizacion: Date;
    tiendaId: string | null;
    configuracion: Record<string, any> | null;
  } | null> {
    const mercado = await this.prisma.mercado.findUnique({
      where: { id },
    });

    if (!mercado) {
      return null;
    }

    return {
      id: mercado.id,
      nombre: mercado.nombre,
      codigo: mercado.codigo,
      moneda: mercado.moneda,
      idioma: mercado.idioma,
      zonaHoraria: mercado.zona_horaria,
      estado: mercado.estado as EstadoMercado,
      activo: mercado.activo,
      fechaCreacion: mercado.fecha_creacion,
      fechaActualizacion: mercado.fecha_actualizacion,
      tiendaId: mercado.tienda_id,
      configuracion: mercado.configuracion as Record<string, any> | null,
    };
  }

  async buscarPorCodigo(codigo: string): Promise<{
    id: string;
    nombre: string;
    codigo: string;
    moneda: string;
    idioma: string;
    zonaHoraria: string;
    estado: EstadoMercado;
    activo: boolean;
    fechaCreacion: Date;
    fechaActualizacion: Date;
    tiendaId: string | null;
    configuracion: Record<string, any> | null;
  } | null> {
    const mercado = await this.prisma.mercado.findUnique({
      where: { codigo },
    });

    if (!mercado) {
      return null;
    }

    return {
      id: mercado.id,
      nombre: mercado.nombre,
      codigo: mercado.codigo,
      moneda: mercado.moneda,
      idioma: mercado.idioma,
      zonaHoraria: mercado.zona_horaria,
      estado: mercado.estado as EstadoMercado,
      activo: mercado.activo,
      fechaCreacion: mercado.fecha_creacion,
      fechaActualizacion: mercado.fecha_actualizacion,
      tiendaId: mercado.tienda_id,
      configuracion: mercado.configuracion as Record<string, any> | null,
    };
  }

  async listar(filtros: {
    pagina: number;
    limite: number;
    activo?: boolean;
    estado?: EstadoMercado;
    tiendaId?: string;
    busqueda?: string;
  }): Promise<{
    mercados: Array<{
      id: string;
      nombre: string;
      codigo: string;
      moneda: string;
      idioma: string;
      zonaHoraria: string;
      estado: EstadoMercado;
      activo: boolean;
      fechaCreacion: Date;
      fechaActualizacion: Date;
      tiendaId: string | null;
      configuracion: Record<string, any> | null;
    }>;
    total: number;
  }> {
    const skip = (filtros.pagina - 1) * filtros.limite;

    // Construir condiciones where
    const where: any = {};

    if (filtros.activo !== undefined) {
      where.activo = filtros.activo;
    }

    if (filtros.estado) {
      where.estado = filtros.estado;
    }

    if (filtros.tiendaId) {
      where.tienda_id = filtros.tiendaId;
    }

    if (filtros.busqueda) {
      where.OR = [
        { nombre: { contains: filtros.busqueda, mode: 'insensitive' } },
        { codigo: { contains: filtros.busqueda, mode: 'insensitive' } },
      ];
    }

    const [mercados, total] = await Promise.all([
      this.prisma.mercado.findMany({
        where,
        skip,
        take: filtros.limite,
        orderBy: { fecha_creacion: 'desc' },
      }),
      this.prisma.mercado.count({ where }),
    ]);

    return {
      mercados: mercados.map((mercado) => ({
        id: mercado.id,
        nombre: mercado.nombre,
        codigo: mercado.codigo,
        moneda: mercado.moneda,
        idioma: mercado.idioma,
        zonaHoraria: mercado.zona_horaria,
        estado: mercado.estado as EstadoMercado,
        activo: mercado.activo,
        fechaCreacion: mercado.fecha_creacion,
        fechaActualizacion: mercado.fecha_actualizacion,
        tiendaId: mercado.tienda_id,
        configuracion: mercado.configuracion as Record<string, any> | null,
      })),
      total,
    };
  }

  async actualizar(
    id: string,
    datos: {
      nombre?: string;
      moneda?: string;
      idioma?: string;
      zonaHoraria?: string;
      estado?: EstadoMercado;
      activo?: boolean;
      configuracion?: Record<string, any>;
      fechaActualizacion: Date;
    },
  ): Promise<void> {
    await this.prisma.mercado.update({
      where: { id },
      data: {
        ...(datos.nombre && { nombre: datos.nombre }),
        ...(datos.moneda && { moneda: datos.moneda }),
        ...(datos.idioma && { idioma: datos.idioma }),
        ...(datos.zonaHoraria && { zona_horaria: datos.zonaHoraria }),
        ...(datos.estado && { estado: datos.estado }),
        ...(datos.activo !== undefined && { activo: datos.activo }),
        ...(datos.configuracion !== undefined && { configuracion: datos.configuracion }),
        fecha_actualizacion: datos.fechaActualizacion,
      },
    });
  }

  async eliminar(id: string): Promise<void> {
    await this.prisma.mercado.delete({
      where: { id },
    });
  }

  async existeCodigo(codigo: string, idExcluir?: string): Promise<boolean> {
    const where: any = {
      codigo,
    };

    if (idExcluir) {
      where.NOT = {
        id: idExcluir,
      };
    }

    const count = await this.prisma.mercado.count({
      where,
    });

    return count > 0;
  }

  async obtenerEstadisticas(tiendaId?: string): Promise<{
    totalMercados: number;
    mercadosActivos: number;
    mercadosInactivos: number;
    mercadosPorEstado: Record<EstadoMercado, number>;
    mercadosPorMoneda: Record<string, number>;
    mercadosPorIdioma: Record<string, number>;
  }> {
    const where: any = {};
    if (tiendaId) {
      where.tienda_id = tiendaId;
    }

    const [
      totalMercados,
      mercadosActivos,
      mercadosInactivos,
      mercadosPorEstado,
      mercadosPorMoneda,
      mercadosPorIdioma,
    ] = await Promise.all([
      this.prisma.mercado.count({ where }),
      this.prisma.mercado.count({ where: { ...where, activo: true } }),
      this.prisma.mercado.count({ where: { ...where, activo: false } }),
      this.prisma.mercado.groupBy({
        by: ['estado'],
        _count: {
          _all: true,
        },
        where,
      }),
      this.prisma.mercado.groupBy({
        by: ['moneda'],
        _count: {
          _all: true,
        },
        where,
      }),
      this.prisma.mercado.groupBy({
        by: ['idioma'],
        _count: {
          _all: true,
        },
        where,
      }),
    ]);

    // Convertir resultados de groupBy a objetos Record
    const mercadosPorEstadoObj = mercadosPorEstado.reduce((acc, item) => {
      acc[item.estado as EstadoMercado] = item._count._all;
      return acc;
    }, {} as Record<EstadoMercado, number>);

    const mercadosPorMonedaObj = mercadosPorMoneda.reduce((acc, item) => {
      acc[item.moneda] = item._count._all;
      return acc;
    }, {} as Record<string, number>);

    const mercadosPorIdiomaObj = mercadosPorIdioma.reduce((acc, item) => {
      acc[item.idioma] = item._count._all;
      return acc;
    }, {} as Record<string, number>);

    // Asegurarse de que todos los estados estén presentes
    Object.values(EstadoMercado).forEach((estado) => {
      if (!(estado in mercadosPorEstadoObj)) {
        mercadosPorEstadoObj[estado] = 0;
      }
    });

    return {
      totalMercados,
      mercadosActivos,
      mercadosInactivos,
      mercadosPorEstado: mercadosPorEstadoObj,
      mercadosPorMoneda: mercadosPorMonedaObj,
      mercadosPorIdioma: mercadosPorIdiomaObj,
    };
  }

  async listarPorTienda(tiendaId: string): Promise<Array<{
    id: string;
    nombre: string;
    codigo: string;
    moneda: string;
    idioma: string;
    estado: EstadoMercado;
    activo: boolean;
  }>> {
    const mercados = await this.prisma.mercado.findMany({
      where: { tienda_id: tiendaId },
      select: {
        id: true,
        nombre: true,
        codigo: true,
        moneda: true,
        idioma: true,
        estado: true,
        activo: true,
      },
      orderBy: { nombre: 'asc' },
    });

    return mercados.map((mercado) => ({
      id: mercado.id,
      nombre: mercado.nombre,
      codigo: mercado.codigo,
      moneda: mercado.moneda,
      idioma: mercado.idioma,
      estado: mercado.estado as EstadoMercado,
      activo: mercado.activo,
    }));
  }

  async obtenerPredeterminado(tiendaId: string): Promise<{
    id: string;
    nombre: string;
    codigo: string;
    moneda: string;
    idioma: string;
    zonaHoraria: string;
    estado: EstadoMercado;
    activo: boolean;
    fechaCreacion: Date;
    fechaActualizacion: Date;
    tiendaId: string | null;
    configuracion: Record<string, any> | null;
  } | null> {
    // Por ahora, devolvemos el primer mercado activo de la tienda
    // En una implementación real, habría un campo 'predeterminado' o similar
    const mercado = await this.prisma.mercado.findFirst({
      where: {
        tienda_id: tiendaId,
        activo: true,
        estado: EstadoMercado.ACTIVO,
      },
      orderBy: { fecha_creacion: 'asc' },
    });

    if (!mercado) {
      return null;
    }

    return {
      id: mercado.id,
      nombre: mercado.nombre,
      codigo: mercado.codigo,
      moneda: mercado.moneda,
      idioma: mercado.idioma,
      zonaHoraria: mercado.zona_horaria,
      estado: mercado.estado as EstadoMercado,
      activo: mercado.activo,
      fechaCreacion: mercado.fecha_creacion,
      fechaActualizacion: mercado.fecha_actualizacion,
      tiendaId: mercado.tienda_id,
      configuracion: mercado.configuracion as Record<string, any> | null,
    };
  }

  async establecerPredeterminado(tiendaId: string, mercadoId: string): Promise<void> {
    // En una implementación real, actualizaríamos un campo 'predeterminado'
    // Por ahora, simplemente verificamos que el mercado pertenezca a la tienda
    const mercado = await this.prisma.mercado.findFirst({
      where: {
        id: mercadoId,
        tienda_id: tiendaId,
      },
    });

    if (!mercado) {
      throw new Error('El mercado no pertenece a la tienda especificada');
    }

    // Aquí iría la lógica para establecer como predeterminado
    // Por ejemplo: actualizar un campo 'es_predeterminado' en la tabla
  }

  async obtenerProductosMercado(
    mercadoId: string,
    filtros?: {
      pagina?: number;
      limite?: number;
      disponible?: boolean;
    },
  ): Promise<{
    productos: Array<{
      id: string;
      productoId: string;
      mercadoId: string;
      precio: number | null;
      disponible: boolean;
      fechaCreacion: Date;
      fechaActualizacion: Date;
    }>;
    total: number;
  }> {
    const pagina = filtros?.pagina || 1;
    const limite = filtros?.limite || 20;
    const skip = (pagina - 1) * limite;

    const where: any = {
      mercado_id: mercadoId,
    };

    if (filtros?.disponible !== undefined) {
      where.disponible = filtros.disponible;
    }

    const [productos, total] = await Promise.all([
      this.prisma.productoMercado.findMany({
        where,
        skip,
        take: limite,
        orderBy: { fecha_creacion: 'desc' },
      }),
      this.prisma.productoMercado.count({ where }),
    ]);

    return {
      productos: productos.map((producto) => ({
        id: producto.id,
        productoId: producto.producto_id,
        mercadoId: producto.mercado_id,
        precio: producto.precio ? Number(producto.precio) : null,
        disponible: producto.disponible,
        fechaCreacion: producto.fecha_creacion,
        fechaActualizacion: producto.fecha_actualizacion,
      })),
      total,
    };
  }

  async sincronizarProductosMercado(
    mercadoId: string,
    productos: Array<{
      productoId: string;
      precio?: number;
      disponible?: boolean;
    }>,
  ): Promise<{
    exitosos: number;
    fallidos: number;
    errores: Array<{ productoId: string; error: string }>;
  }> {
    const errores: Array<{ productoId: string; error: string }> = [];
    let exitosos = 0;

    for (const producto of productos) {
      try {
        await this.prisma.productoMercado.upsert({
          where: {
            producto_id_mercado_id: {
              producto_id: producto.productoId,
              mercado_id: mercadoId,
            },
          },
          update: {
            ...(producto.precio !== undefined && { precio: producto.precio }),
            ...(producto.disponible !== undefined && { disponible: producto.disponible }),
            fecha_actualizacion: new Date(),
          },
          create: {
            producto_id: producto.productoId,
            mercado_id: mercadoId,
            precio: producto.precio ?? null,
            disponible: producto.disponible ?? true,
            fecha_creacion: new Date(),
            fecha_actualizacion: new Date(),
          },
        });
        exitosos++;
      } catch (error) {
        errores.push({
          productoId: producto.productoId,
          error: error instanceof Error ? error.message : 'Error desconocido',
        });
      }
    }

    return {
      exitosos,
      fallidos: errores.length,
      errores,
    };
  }
}