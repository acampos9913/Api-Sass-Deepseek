import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { TipoDescuento } from '../../dominio/enums/tipo-descuento.enum';
import type { RepositorioDescuento } from '../../dominio/interfaces/repositorio-descuento.interface';

/**
 * Implementación del repositorio de descuento usando Prisma
 * Adapta la interfaz de dominio a la implementación específica de Prisma
 */
@Injectable()
export class PrismaRepositorioDescuento implements RepositorioDescuento {
  constructor(private readonly prisma: PrismaClient) {}

  async crear(descuento: {
    id: string;
    codigo: string;
    tipo: TipoDescuento;
    valor: number;
    valorMinimo: number | null;
    usosMaximos: number | null;
    usosActuales: number;
    fechaInicio: Date | null;
    fechaFin: Date | null;
    activo: boolean;
    fechaCreacion: Date;
    fechaActualizacion: Date;
    // Nuevos campos para descuentos avanzados
    configuracionAvanzada?: Record<string, any> | null;
    reglasValidacion?: Record<string, any> | null;
    restricciones?: Record<string, any> | null;
    nombreCampana?: string | null;
    utmSource?: string | null;
    utmMedium?: string | null;
    utmCampaign?: string | null;
    cantidadLleva?: number | null;
    cantidadPaga?: number | null;
    productosAplicables?: string[];
    coleccionesAplicables?: string[];
    paisesPermitidos?: string[];
    segmentosPermitidos?: string[];
    requisitosMinimos?: Record<string, any> | null;
  }): Promise<void> {
    await this.prisma.descuento.create({
      data: {
        id: descuento.id,
        codigo: descuento.codigo,
        tipo: descuento.tipo,
        valor: descuento.valor,
        valor_minimo: descuento.valorMinimo,
        usos_maximos: descuento.usosMaximos,
        usos_actuales: descuento.usosActuales,
        fecha_inicio: descuento.fechaInicio,
        fecha_fin: descuento.fechaFin,
        activo: descuento.activo,
        fecha_creacion: descuento.fechaCreacion,
        fecha_actualizacion: descuento.fechaActualizacion,
        // Nuevos campos para descuentos avanzados
        configuracion_avanzada: descuento.configuracionAvanzada,
        reglas_validacion: descuento.reglasValidacion,
        restricciones: descuento.restricciones,
        nombre_campana: descuento.nombreCampana,
        utm_source: descuento.utmSource,
        utm_medium: descuento.utmMedium,
        utm_campaign: descuento.utmCampaign,
        cantidad_lleva: descuento.cantidadLleva,
        cantidad_paga: descuento.cantidadPaga,
        productos_aplicables: descuento.productosAplicables,
        colecciones_aplicables: descuento.coleccionesAplicables,
        paises_permitidos: descuento.paisesPermitidos,
        segmentos_permitidos: descuento.segmentosPermitidos,
        requisitos_minimos: descuento.requisitosMinimos,
      },
    });
  }

  async buscarPorId(id: string): Promise<{
    id: string;
    codigo: string;
    tipo: TipoDescuento;
    valor: number;
    valorMinimo: number | null;
    usosMaximos: number | null;
    usosActuales: number;
    fechaInicio: Date | null;
    fechaFin: Date | null;
    activo: boolean;
    fechaCreacion: Date;
    fechaActualizacion: Date;
    // Nuevos campos para descuentos avanzados
    configuracionAvanzada: Record<string, any> | null;
    reglasValidacion: Record<string, any> | null;
    restricciones: Record<string, any> | null;
    nombreCampana: string | null;
    utmSource: string | null;
    utmMedium: string | null;
    utmCampaign: string | null;
    cantidadLleva: number | null;
    cantidadPaga: number | null;
    productosAplicables: string[];
    coleccionesAplicables: string[];
    paisesPermitidos: string[];
    segmentosPermitidos: string[];
    requisitosMinimos: Record<string, any> | null;
  } | null> {
    const descuento = await this.prisma.descuento.findUnique({
      where: { id },
    });

    if (!descuento) {
      return null;
    }

    return {
      id: descuento.id,
      codigo: descuento.codigo,
      tipo: descuento.tipo as TipoDescuento,
      valor: Number(descuento.valor),
      valorMinimo: descuento.valor_minimo ? Number(descuento.valor_minimo) : null,
      usosMaximos: descuento.usos_maximos,
      usosActuales: descuento.usos_actuales,
      fechaInicio: descuento.fecha_inicio,
      fechaFin: descuento.fecha_fin,
      activo: descuento.activo,
      fechaCreacion: descuento.fecha_creacion,
      fechaActualizacion: descuento.fecha_actualizacion,
      // Nuevos campos para descuentos avanzados
      configuracionAvanzada: descuento.configuracion_avanzada as Record<string, any> | null,
      reglasValidacion: descuento.reglas_validacion as Record<string, any> | null,
      restricciones: descuento.restricciones as Record<string, any> | null,
      nombreCampana: descuento.nombre_campana,
      utmSource: descuento.utm_source,
      utmMedium: descuento.utm_medium,
      utmCampaign: descuento.utm_campaign,
      cantidadLleva: descuento.cantidad_lleva,
      cantidadPaga: descuento.cantidad_paga,
      productosAplicables: descuento.productos_aplicables || [],
      coleccionesAplicables: descuento.colecciones_aplicables || [],
      paisesPermitidos: descuento.paises_permitidos || [],
      segmentosPermitidos: descuento.segmentos_permitidos || [],
      requisitosMinimos: descuento.requisitos_minimos as Record<string, any> | null,
    };
  }

  async buscarPorCodigo(codigo: string): Promise<{
    id: string;
    codigo: string;
    tipo: TipoDescuento;
    valor: number;
    valorMinimo: number | null;
    usosMaximos: number | null;
    usosActuales: number;
    fechaInicio: Date | null;
    fechaFin: Date | null;
    activo: boolean;
    fechaCreacion: Date;
    fechaActualizacion: Date;
    // Nuevos campos para descuentos avanzados
    configuracionAvanzada: Record<string, any> | null;
    reglasValidacion: Record<string, any> | null;
    restricciones: Record<string, any> | null;
    nombreCampana: string | null;
    utmSource: string | null;
    utmMedium: string | null;
    utmCampaign: string | null;
    cantidadLleva: number | null;
    cantidadPaga: number | null;
    productosAplicables: string[];
    coleccionesAplicables: string[];
    paisesPermitidos: string[];
    segmentosPermitidos: string[];
    requisitosMinimos: Record<string, any> | null;
  } | null> {
    const descuento = await this.prisma.descuento.findUnique({
      where: { codigo },
    });

    if (!descuento) {
      return null;
    }

    return {
      id: descuento.id,
      codigo: descuento.codigo,
      tipo: descuento.tipo as TipoDescuento,
      valor: Number(descuento.valor),
      valorMinimo: descuento.valor_minimo ? Number(descuento.valor_minimo) : null,
      usosMaximos: descuento.usos_maximos,
      usosActuales: descuento.usos_actuales,
      fechaInicio: descuento.fecha_inicio,
      fechaFin: descuento.fecha_fin,
      activo: descuento.activo,
      fechaCreacion: descuento.fecha_creacion,
      fechaActualizacion: descuento.fecha_actualizacion,
      // Nuevos campos para descuentos avanzados
      configuracionAvanzada: descuento.configuracion_avanzada as Record<string, any> | null,
      reglasValidacion: descuento.reglas_validacion as Record<string, any> | null,
      restricciones: descuento.restricciones as Record<string, any> | null,
      nombreCampana: descuento.nombre_campana,
      utmSource: descuento.utm_source,
      utmMedium: descuento.utm_medium,
      utmCampaign: descuento.utm_campaign,
      cantidadLleva: descuento.cantidad_lleva,
      cantidadPaga: descuento.cantidad_paga,
      productosAplicables: descuento.productos_aplicables || [],
      coleccionesAplicables: descuento.colecciones_aplicables || [],
      paisesPermitidos: descuento.paises_permitidos || [],
      segmentosPermitidos: descuento.segmentos_permitidos || [],
      requisitosMinimos: descuento.requisitos_minimos as Record<string, any> | null,
    };
  }

  async listar(filtros: {
    pagina: number;
    limite: number;
    activo?: boolean;
    tipo?: TipoDescuento;
    busqueda?: string;
  }): Promise<{
    descuentos: Array<{
      id: string;
      codigo: string;
      tipo: TipoDescuento;
      valor: number;
      valorMinimo: number | null;
      usosMaximos: number | null;
      usosActuales: number;
      fechaInicio: Date | null;
      fechaFin: Date | null;
      activo: boolean;
      fechaCreacion: Date;
      fechaActualizacion: Date;
    }>;
    total: number;
  }> {
    const skip = (filtros.pagina - 1) * filtros.limite;

    // Construir condiciones where
    const where: any = {};

    if (filtros.activo !== undefined) {
      where.activo = filtros.activo;
    }

    if (filtros.tipo) {
      where.tipo = filtros.tipo;
    }

    if (filtros.busqueda) {
      where.codigo = {
        contains: filtros.busqueda,
        mode: 'insensitive',
      };
    }

    const [descuentos, total] = await Promise.all([
      this.prisma.descuento.findMany({
        where,
        skip,
        take: filtros.limite,
        orderBy: { fecha_creacion: 'desc' },
      }),
      this.prisma.descuento.count({ where }),
    ]);

    return {
      descuentos: descuentos.map((descuento) => ({
        id: descuento.id,
        codigo: descuento.codigo,
        tipo: descuento.tipo as TipoDescuento,
        valor: Number(descuento.valor),
        valorMinimo: descuento.valor_minimo ? Number(descuento.valor_minimo) : null,
        usosMaximos: descuento.usos_maximos,
        usosActuales: descuento.usos_actuales,
        fechaInicio: descuento.fecha_inicio,
        fechaFin: descuento.fecha_fin,
        activo: descuento.activo,
        fechaCreacion: descuento.fecha_creacion,
        fechaActualizacion: descuento.fecha_actualizacion,
      })),
      total,
    };
  }

  async actualizar(
    id: string,
    datos: {
      codigo?: string;
      tipo?: TipoDescuento;
      valor?: number;
      valorMinimo?: number | null;
      usosMaximos?: number | null;
      usosActuales?: number;
      fechaInicio?: Date | null;
      fechaFin?: Date | null;
      activo?: boolean;
      fechaActualizacion: Date;
    },
  ): Promise<void> {
    await this.prisma.descuento.update({
      where: { id },
      data: {
        ...(datos.codigo && { codigo: datos.codigo }),
        ...(datos.tipo && { tipo: datos.tipo }),
        ...(datos.valor !== undefined && { valor: datos.valor }),
        ...(datos.valorMinimo !== undefined && { valor_minimo: datos.valorMinimo }),
        ...(datos.usosMaximos !== undefined && { usos_maximos: datos.usosMaximos }),
        ...(datos.usosActuales !== undefined && { usos_actuales: datos.usosActuales }),
        ...(datos.fechaInicio !== undefined && { fecha_inicio: datos.fechaInicio }),
        ...(datos.fechaFin !== undefined && { fecha_fin: datos.fechaFin }),
        ...(datos.activo !== undefined && { activo: datos.activo }),
        fecha_actualizacion: datos.fechaActualizacion,
      },
    });
  }

  async eliminar(id: string): Promise<void> {
    await this.prisma.descuento.delete({
      where: { id },
    });
  }

  async incrementarUsos(id: string): Promise<void> {
    await this.prisma.descuento.update({
      where: { id },
      data: {
        usos_actuales: {
          increment: 1,
        },
        fecha_actualizacion: new Date(),
      },
    });
  }

  async obtenerEstadisticas(): Promise<{
    totalDescuentos: number;
    descuentosActivos: number;
    descuentosInactivos: number;
    descuentosPorTipo: Record<TipoDescuento, number>;
    totalUsos: number;
  }> {
    const [
      totalDescuentos,
      descuentosActivos,
      descuentosInactivos,
      descuentosPorTipo,
      totalUsos,
    ] = await Promise.all([
      this.prisma.descuento.count(),
      this.prisma.descuento.count({ where: { activo: true } }),
      this.prisma.descuento.count({ where: { activo: false } }),
      this.prisma.descuento.groupBy({
        by: ['tipo'],
        _count: {
          _all: true,
        },
      }),
      this.prisma.descuento.aggregate({
        _sum: {
          usos_actuales: true,
        },
      }),
    ]);

    // Convertir el resultado de groupBy a un objeto Record
    const descuentosPorTipoObj = descuentosPorTipo.reduce((acc, item) => {
      acc[item.tipo as TipoDescuento] = item._count._all;
      return acc;
    }, {} as Record<TipoDescuento, number>);

    // Asegurarse de que todos los tipos estén presentes
    Object.values(TipoDescuento).forEach((tipo) => {
      if (!(tipo in descuentosPorTipoObj)) {
        descuentosPorTipoObj[tipo] = 0;
      }
    });

    return {
      totalDescuentos,
      descuentosActivos,
      descuentosInactivos,
      descuentosPorTipo: descuentosPorTipoObj,
      totalUsos: totalUsos._sum.usos_actuales || 0,
    };
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

    const count = await this.prisma.descuento.count({
      where,
    });

    return count > 0;
  }

  async obtenerProximosAExpirar(dias: number): Promise<
    Array<{
      id: string;
      codigo: string;
      tipo: TipoDescuento;
      fechaFin: Date;
      activo: boolean;
    }>
  > {
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() + dias);

    const descuentos = await this.prisma.descuento.findMany({
      where: {
        fecha_fin: {
          lte: fechaLimite,
          gte: new Date(), // Solo futuros
        },
        activo: true,
      },
      select: {
        id: true,
        codigo: true,
        tipo: true,
        fecha_fin: true,
        activo: true,
      },
      orderBy: { fecha_fin: 'asc' },
    });

    return descuentos.map((descuento) => ({
      id: descuento.id,
      codigo: descuento.codigo,
      tipo: descuento.tipo as TipoDescuento,
      fechaFin: descuento.fecha_fin!,
      activo: descuento.activo,
    }));
  }

  async obtenerConPocosUsosRestantes(porcentaje: number): Promise<
    Array<{
      id: string;
      codigo: string;
      tipo: TipoDescuento;
      usosActuales: number;
      usosMaximos: number;
      activo: boolean;
    }>
  > {
    const descuentos = await this.prisma.descuento.findMany({
      where: {
        usos_maximos: {
          not: null,
        },
        activo: true,
      },
      select: {
        id: true,
        codigo: true,
        tipo: true,
        usos_actuales: true,
        usos_maximos: true,
        activo: true,
      },
    });

    return descuentos
      .filter((descuento) => {
        if (!descuento.usos_maximos) return false;
        
        const porcentajeUsado = (descuento.usos_actuales / descuento.usos_maximos) * 100;
        return porcentajeUsado >= (100 - porcentaje);
      })
      .map((descuento) => ({
        id: descuento.id,
        codigo: descuento.codigo,
        tipo: descuento.tipo as TipoDescuento,
        usosActuales: descuento.usos_actuales,
        usosMaximos: descuento.usos_maximos!,
        activo: descuento.activo,
      }));
  }
}