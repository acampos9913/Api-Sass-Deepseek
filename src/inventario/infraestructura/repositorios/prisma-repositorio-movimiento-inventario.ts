import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { TipoMovimientoInventario } from '../../dominio/enums/tipo-movimiento-inventario.enum';
import type { RepositorioMovimientoInventario } from '../../dominio/interfaces/repositorio-movimiento-inventario.interface';

/**
 * Implementación del repositorio de movimiento de inventario usando Prisma
 * Adapta la interfaz de dominio a la implementación específica de Prisma
 */
@Injectable()
export class PrismaRepositorioMovimientoInventario implements RepositorioMovimientoInventario {
  constructor(private readonly prisma: PrismaClient) {}

  async crear(movimiento: {
    id: string;
    productoId: string;
    varianteId: string | null;
    tipo: TipoMovimientoInventario;
    cantidad: number;
    stockAnterior: number;
    stockActual: number;
    motivo: string;
    fechaCreacion: Date;
    usuarioId: string | null;
  }): Promise<void> {
    await this.prisma.movimientoInventario.create({
      data: {
        id: movimiento.id,
        producto_id: movimiento.productoId,
        variante_id: movimiento.varianteId,
        tipo: movimiento.tipo,
        cantidad: movimiento.cantidad,
        stock_anterior: movimiento.stockAnterior,
        stock_actual: movimiento.stockActual,
        motivo: movimiento.motivo,
        fecha_creacion: movimiento.fechaCreacion,
        usuario_id: movimiento.usuarioId,
      },
    });
  }

  async buscarPorId(id: string): Promise<{
    id: string;
    productoId: string;
    varianteId: string | null;
    tipo: TipoMovimientoInventario;
    cantidad: number;
    stockAnterior: number;
    stockActual: number;
    motivo: string;
    fechaCreacion: Date;
    usuarioId: string | null;
  } | null> {
    const movimiento = await this.prisma.movimientoInventario.findUnique({
      where: { id },
    });

    if (!movimiento) {
      return null;
    }

    return {
      id: movimiento.id,
      productoId: movimiento.producto_id,
      varianteId: movimiento.variante_id,
      tipo: movimiento.tipo as TipoMovimientoInventario,
      cantidad: movimiento.cantidad,
      stockAnterior: movimiento.stock_anterior,
      stockActual: movimiento.stock_actual,
      motivo: movimiento.motivo,
      fechaCreacion: movimiento.fecha_creacion,
      usuarioId: movimiento.usuario_id,
    };
  }

  async listar(filtros: {
    pagina: number;
    limite: number;
    productoId?: string;
    varianteId?: string;
    tipo?: TipoMovimientoInventario;
    fechaDesde?: Date;
    fechaHasta?: Date;
  }): Promise<{
    movimientos: Array<{
      id: string;
      productoId: string;
      varianteId: string | null;
      tipo: TipoMovimientoInventario;
      cantidad: number;
      stockAnterior: number;
      stockActual: number;
      motivo: string;
      fechaCreacion: Date;
      usuarioId: string | null;
    }>;
    total: number;
  }> {
    const skip = (filtros.pagina - 1) * filtros.limite;

    // Construir condiciones where
    const where: any = {};

    if (filtros.productoId) {
      where.producto_id = filtros.productoId;
    }

    if (filtros.varianteId) {
      where.variante_id = filtros.varianteId;
    }

    if (filtros.tipo) {
      where.tipo = filtros.tipo;
    }

    if (filtros.fechaDesde || filtros.fechaHasta) {
      where.fecha_creacion = {};
      
      if (filtros.fechaDesde) {
        where.fecha_creacion.gte = filtros.fechaDesde;
      }
      
      if (filtros.fechaHasta) {
        where.fecha_creacion.lte = filtros.fechaHasta;
      }
    }

    const [movimientos, total] = await Promise.all([
      this.prisma.movimientoInventario.findMany({
        where,
        skip,
        take: filtros.limite,
        orderBy: { fecha_creacion: 'desc' },
        include: {
          producto: {
            select: {
              titulo: true,
            },
          },
          variante: {
            select: {
              titulo: true,
            },
          },
          usuario: {
            select: {
              nombre_completo: true,
            },
          },
        },
      }),
      this.prisma.movimientoInventario.count({ where }),
    ]);

    return {
      movimientos: movimientos.map((movimiento) => ({
        id: movimiento.id,
        productoId: movimiento.producto_id,
        varianteId: movimiento.variante_id,
        tipo: movimiento.tipo as TipoMovimientoInventario,
        cantidad: movimiento.cantidad,
        stockAnterior: movimiento.stock_anterior,
        stockActual: movimiento.stock_actual,
        motivo: movimiento.motivo,
        fechaCreacion: movimiento.fecha_creacion,
        usuarioId: movimiento.usuario_id,
      })),
      total,
    };
  }

  async obtenerHistorialProducto(
    productoId: string,
    pagina: number,
    limite: number,
  ): Promise<{
    movimientos: Array<{
      id: string;
      productoId: string;
      varianteId: string | null;
      tipo: TipoMovimientoInventario;
      cantidad: number;
      stockAnterior: number;
      stockActual: number;
      motivo: string;
      fechaCreacion: Date;
      usuarioId: string | null;
    }>;
    total: number;
  }> {
    const skip = (pagina - 1) * limite;

    const where = {
      producto_id: productoId,
    };

    const [movimientos, total] = await Promise.all([
      this.prisma.movimientoInventario.findMany({
        where,
        skip,
        take: limite,
        orderBy: { fecha_creacion: 'desc' },
      }),
      this.prisma.movimientoInventario.count({ where }),
    ]);

    return {
      movimientos: movimientos.map((movimiento) => ({
        id: movimiento.id,
        productoId: movimiento.producto_id,
        varianteId: movimiento.variante_id,
        tipo: movimiento.tipo as TipoMovimientoInventario,
        cantidad: movimiento.cantidad,
        stockAnterior: movimiento.stock_anterior,
        stockActual: movimiento.stock_actual,
        motivo: movimiento.motivo,
        fechaCreacion: movimiento.fecha_creacion,
        usuarioId: movimiento.usuario_id,
      })),
      total,
    };
  }

  async obtenerHistorialVariante(
    varianteId: string,
    pagina: number,
    limite: number,
  ): Promise<{
    movimientos: Array<{
      id: string;
      productoId: string;
      varianteId: string | null;
      tipo: TipoMovimientoInventario;
      cantidad: number;
      stockAnterior: number;
      stockActual: number;
      motivo: string;
      fechaCreacion: Date;
      usuarioId: string | null;
    }>;
    total: number;
  }> {
    const skip = (pagina - 1) * limite;

    const where = {
      variante_id: varianteId,
    };

    const [movimientos, total] = await Promise.all([
      this.prisma.movimientoInventario.findMany({
        where,
        skip,
        take: limite,
        orderBy: { fecha_creacion: 'desc' },
      }),
      this.prisma.movimientoInventario.count({ where }),
    ]);

    return {
      movimientos: movimientos.map((movimiento) => ({
        id: movimiento.id,
        productoId: movimiento.producto_id,
        varianteId: movimiento.variante_id,
        tipo: movimiento.tipo as TipoMovimientoInventario,
        cantidad: movimiento.cantidad,
        stockAnterior: movimiento.stock_anterior,
        stockActual: movimiento.stock_actual,
        motivo: movimiento.motivo,
        fechaCreacion: movimiento.fecha_creacion,
        usuarioId: movimiento.usuario_id,
      })),
      total,
    };
  }

  async obtenerEstadisticas(filtros?: {
    fechaDesde?: Date;
    fechaHasta?: Date;
    productoId?: string;
  }): Promise<{
    totalMovimientos: number;
    totalEntradas: number;
    totalSalidas: number;
    totalAjustes: number;
    valorTotalEntradas: number;
    valorTotalSalidas: number;
  }> {
    const where: any = {};

    if (filtros?.fechaDesde || filtros?.fechaHasta) {
      where.fecha_creacion = {};
      
      if (filtros.fechaDesde) {
        where.fecha_creacion.gte = filtros.fechaDesde;
      }
      
      if (filtros.fechaHasta) {
        where.fecha_creacion.lte = filtros.fechaHasta;
      }
    }

    if (filtros?.productoId) {
      where.producto_id = filtros.productoId;
    }

    const [
      totalMovimientos,
      totalEntradas,
      totalSalidas,
      totalAjustes,
    ] = await Promise.all([
      this.prisma.movimientoInventario.count({ where }),
      this.prisma.movimientoInventario.count({
        where: {
          ...where,
          tipo: { in: [TipoMovimientoInventario.ENTRADA, TipoMovimientoInventario.DEVOLUCION] },
        },
      }),
      this.prisma.movimientoInventario.count({
        where: {
          ...where,
          tipo: { in: [TipoMovimientoInventario.SALIDA, TipoMovimientoInventario.VENTA] },
        },
      }),
      this.prisma.movimientoInventario.count({
        where: {
          ...where,
          tipo: TipoMovimientoInventario.AJUSTE,
        },
      }),
    ]);

    // Nota: Para calcular valores totales, necesitaríamos información de precios de productos
    // Por ahora devolvemos valores estimados basados en cantidad
    const valorTotalEntradas = totalEntradas * 10; // Valor estimado
    const valorTotalSalidas = totalSalidas * 10; // Valor estimado

    return {
      totalMovimientos,
      totalEntradas,
      totalSalidas,
      totalAjustes,
      valorTotalEntradas,
      valorTotalSalidas,
    };
  }

  async obtenerStockProducto(productoId: string): Promise<number> {
    // Para obtener el stock de un producto, sumamos el stock de todas sus variantes
    const variantes = await this.prisma.variante.findMany({
      where: { producto_id: productoId },
      select: { inventario: true },
    });

    return variantes.reduce((total, variante) => total + variante.inventario, 0);
  }

  async obtenerStockVariante(varianteId: string): Promise<number> {
    const variante = await this.prisma.variante.findUnique({
      where: { id: varianteId },
      select: { inventario: true },
    });

    return variante?.inventario || 0;
  }

  async verificarStockSuficiente(
    varianteId: string,
    cantidadRequerida: number,
  ): Promise<boolean> {
    const stockActual = await this.obtenerStockVariante(varianteId);
    return stockActual >= cantidadRequerida;
  }

  async obtenerProductosStockBajo(limiteMinimo: number): Promise<
    Array<{
      productoId: string;
      varianteId: string | null;
      stockActual: number;
      tituloProducto: string;
      tituloVariante?: string;
    }>
  > {
    const variantesStockBajo = await this.prisma.variante.findMany({
      where: {
        inventario: { lte: limiteMinimo },
      },
      include: {
        producto: {
          select: {
            titulo: true,
          },
        },
      },
    });

    return variantesStockBajo.map((variante) => ({
      productoId: variante.producto_id,
      varianteId: variante.id,
      stockActual: variante.inventario,
      tituloProducto: variante.producto.titulo,
      tituloVariante: variante.titulo,
    }));
  }
}