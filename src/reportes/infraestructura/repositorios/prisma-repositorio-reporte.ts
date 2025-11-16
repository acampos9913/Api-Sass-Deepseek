import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { RepositorioReporte } from '../../dominio/interfaces/repositorio-reporte.interface';
import { TipoReporte, EstadoReporte, ParametrosReporte, DatosReporte } from '../../dominio/entidades/reporte.entity';

/**
 * Implementación del repositorio de reporte usando Prisma ORM
 * Sigue la interfaz definida en el dominio
 */
@Injectable()
export class PrismaRepositorioReporte implements RepositorioReporte {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Crea un nuevo reporte en el sistema
   */
  async crear(reporte: {
    id: string;
    tipo: TipoReporte;
    datos: DatosReporte;
    parametros: ParametrosReporte;
    fechaGeneracion: Date;
    fechaInicio: Date;
    fechaFin: Date;
    estado: EstadoReporte;
    metricas?: Record<string, any>;
  }): Promise<void> {
    await this.prisma.reporte.create({
      data: {
        id: reporte.id,
        tipo: reporte.tipo,
        datos: reporte.datos,
        parametros: reporte.parametros,
        fecha_generacion: reporte.fechaGeneracion,
        fecha_inicio: reporte.fechaInicio,
        fecha_fin: reporte.fechaFin,
        estado: reporte.estado,
        metricas: reporte.metricas || {},
        fecha_creacion: new Date(),
        fecha_actualizacion: new Date(),
      },
    });
  }

  /**
   * Busca un reporte por su ID único
   */
  async buscarPorId(id: string): Promise<{
    id: string;
    tipo: TipoReporte;
    datos: DatosReporte;
    parametros: ParametrosReporte;
    fechaGeneracion: Date;
    fechaInicio: Date;
    fechaFin: Date;
    estado: EstadoReporte;
    metricas?: Record<string, any>;
  } | null> {
    const reporte = await this.prisma.reporte.findUnique({
      where: { id },
    });

    if (!reporte) {
      return null;
    }

    return {
      id: reporte.id,
      tipo: reporte.tipo as TipoReporte,
      datos: reporte.datos as DatosReporte,
      parametros: reporte.parametros as ParametrosReporte,
      fechaGeneracion: reporte.fecha_generacion,
      fechaInicio: reporte.fecha_inicio,
      fechaFin: reporte.fecha_fin,
      estado: reporte.estado as EstadoReporte,
      metricas: reporte.metricas as Record<string, any>,
    };
  }

  /**
   * Lista todos los reportes con paginación y filtros
   */
  async listar(filtros: {
    pagina: number;
    limite: number;
    tipo?: TipoReporte;
    estado?: EstadoReporte;
    fechaInicio?: Date;
    fechaFin?: Date;
  }): Promise<{
    reportes: Array<{
      id: string;
      tipo: TipoReporte;
      parametros: ParametrosReporte;
      fechaGeneracion: Date;
      fechaInicio: Date;
      fechaFin: Date;
      estado: EstadoReporte;
      metricas?: Record<string, any>;
    }>;
    total: number;
  }> {
    const skip = (filtros.pagina - 1) * filtros.limite;
    
    // Construir condiciones de filtro
    const where: any = {};
    
    if (filtros.tipo) {
      where.tipo = filtros.tipo;
    }
    
    if (filtros.estado) {
      where.estado = filtros.estado;
    }
    
    if (filtros.fechaInicio || filtros.fechaFin) {
      where.fecha_generacion = {};
      
      if (filtros.fechaInicio) {
        where.fecha_generacion.gte = filtros.fechaInicio;
      }
      
      if (filtros.fechaFin) {
        where.fecha_generacion.lte = filtros.fechaFin;
      }
    }

    const [reportes, total] = await Promise.all([
      this.prisma.reporte.findMany({
        where,
        skip,
        take: filtros.limite,
        orderBy: {
          fecha_generacion: 'desc',
        },
        select: {
          id: true,
          tipo: true,
          parametros: true,
          fecha_generacion: true,
          fecha_inicio: true,
          fecha_fin: true,
          estado: true,
          metricas: true,
        },
      }),
      this.prisma.reporte.count({ where }),
    ]);

    return {
      reportes: reportes.map(reporte => ({
        id: reporte.id,
        tipo: reporte.tipo as TipoReporte,
        parametros: reporte.parametros as ParametrosReporte,
        fechaGeneracion: reporte.fecha_generacion,
        fechaInicio: reporte.fecha_inicio,
        fechaFin: reporte.fecha_fin,
        estado: reporte.estado as EstadoReporte,
        metricas: reporte.metricas as Record<string, any>,
      })),
      total,
    };
  }

  /**
   * Actualiza el estado de un reporte existente
   */
  async actualizarEstado(
    id: string,
    estado: EstadoReporte,
    datos?: DatosReporte,
    metricas?: Record<string, any>,
  ): Promise<void> {
    const updateData: any = {
      estado,
      fecha_actualizacion: new Date(),
    };

    if (datos) {
      updateData.datos = datos;
    }

    if (metricas) {
      updateData.metricas = metricas;
    }

    await this.prisma.reporte.update({
      where: { id },
      data: updateData,
    });
  }

  /**
   * Elimina un reporte del sistema
   */
  async eliminar(id: string): Promise<void> {
    await this.prisma.reporte.delete({
      where: { id },
    });
  }

  /**
   * Obtiene estadísticas de reportes generados
   */
  async obtenerEstadisticas(): Promise<{
    totalReportes: number;
    reportesPorTipo: Record<TipoReporte, number>;
    reportesPorEstado: Record<EstadoReporte, number>;
    reportesUltimaSemana: number;
  }> {
    const unaSemanaAtras = new Date();
    unaSemanaAtras.setDate(unaSemanaAtras.getDate() - 7);

    const [
      totalReportes,
      reportesPorTipo,
      reportesPorEstado,
      reportesUltimaSemana,
    ] = await Promise.all([
      this.prisma.reporte.count(),
      this.prisma.reporte.groupBy({
        by: ['tipo'],
        _count: {
          _all: true,
        },
      }),
      this.prisma.reporte.groupBy({
        by: ['estado'],
        _count: {
          _all: true,
        },
      }),
      this.prisma.reporte.count({
        where: {
          fecha_generacion: {
            gte: unaSemanaAtras,
          },
        },
      }),
    ]);

    // Convertir resultados a formato esperado
    const reportesPorTipoFormateado = {} as Record<TipoReporte, number>;
    reportesPorTipo.forEach(item => {
      reportesPorTipoFormateado[item.tipo as TipoReporte] = item._count._all;
    });

    const reportesPorEstadoFormateado = {} as Record<EstadoReporte, number>;
    reportesPorEstado.forEach(item => {
      reportesPorEstadoFormateado[item.estado as EstadoReporte] = item._count._all;
    });

    return {
      totalReportes,
      reportesPorTipo: reportesPorTipoFormateado,
      reportesPorEstado: reportesPorEstadoFormateado,
      reportesUltimaSemana,
    };
  }

  /**
   * Busca reportes por tipo y rango de fechas
   */
  async buscarPorTipoYRango(
    tipo: TipoReporte,
    fechaInicio: Date,
    fechaFin: Date,
  ): Promise<Array<{
    id: string;
    parametros: ParametrosReporte;
    fechaGeneracion: Date;
    estado: EstadoReporte;
  }>> {
    const reportes = await this.prisma.reporte.findMany({
      where: {
        tipo,
        fecha_generacion: {
          gte: fechaInicio,
          lte: fechaFin,
        },
      },
      select: {
        id: true,
        parametros: true,
        fecha_generacion: true,
        estado: true,
      },
      orderBy: {
        fecha_generacion: 'desc',
      },
    });

    return reportes.map(reporte => ({
      id: reporte.id,
      parametros: reporte.parametros as ParametrosReporte,
      fechaGeneracion: reporte.fecha_generacion,
      estado: reporte.estado as EstadoReporte,
    }));
  }

  /**
   * Obtiene el último reporte generado de un tipo específico
   */
  async obtenerUltimoReportePorTipo(tipo: TipoReporte): Promise<{
    id: string;
    fechaGeneracion: Date;
    parametros: ParametrosReporte;
    estado: EstadoReporte;
  } | null> {
    const reporte = await this.prisma.reporte.findFirst({
      where: { tipo },
      orderBy: {
        fecha_generacion: 'desc',
      },
      select: {
        id: true,
        fecha_generacion: true,
        parametros: true,
        estado: true,
      },
    });

    if (!reporte) {
      return null;
    }

    return {
      id: reporte.id,
      fechaGeneracion: reporte.fecha_generacion,
      parametros: reporte.parametros as ParametrosReporte,
      estado: reporte.estado as EstadoReporte,
    };
  }

  /**
   * Limpia reportes antiguos (más de 30 días)
   */
  async limpiarReportesAntiguos(): Promise<number> {
    const treintaDiasAtras = new Date();
    treintaDiasAtras.setDate(treintaDiasAtras.getDate() - 30);

    const resultado = await this.prisma.reporte.deleteMany({
      where: {
        fecha_generacion: {
          lt: treintaDiasAtras,
        },
      },
    });

    return resultado.count;
  }
}