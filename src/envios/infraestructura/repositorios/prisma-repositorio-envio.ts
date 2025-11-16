/**
 * Repositorio de Envíos con Prisma
 * Implementa la interfaz de repositorio para la persistencia de envíos
 * Sigue los principios de la Arquitectura Limpia
 */
import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { RepositorioEnvio, EstadisticasEnvios, MetodoEnvioMasUtilizado } from '../../dominio/interfaces/repositorio-envio.interface';
import { Envio, EstadoEnvio, TipoMetodoEnvio, DireccionEnvio, MetodoEnvio, DetallesEnvio, Dimensiones } from '../../dominio/entidades/envio.entity';

@Injectable()
export class PrismaRepositorioEnvio implements RepositorioEnvio {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Guarda un nuevo envío en la base de datos
   */
  async guardar(envio: Envio): Promise<Envio> {
    const envioGuardado = await this.prisma.envio.create({
      data: {
        id: envio.getId(),
        ordenId: envio.getOrdenId(),
        direccionEnvio: envio.getDireccionEnvio(),
        metodoEnvio: envio.getMetodoEnvio(),
        estado: envio.getEstado(),
        costo: envio.getCosto(),
        fechaEstimadaEntrega: envio.getFechaEstimadaEntrega(),
        fechaCreacion: envio.getFechaCreacion(),
        fechaActualizacion: envio.getFechaActualizacion(),
        trackingNumber: envio.getTrackingNumber(),
        proveedorEnvio: envio.getProveedorEnvio(),
        detalles: envio.getDetalles(),
      },
    });

    return this.mapearEntidadPrismaAEnvio(envioGuardado);
  }

  /**
   * Busca un envío por su ID
   */
  async buscarPorId(id: string): Promise<Envio | null> {
    const envio = await this.prisma.envio.findUnique({
      where: { id },
    });

    if (!envio) {
      return null;
    }

    return this.mapearEntidadPrismaAEnvio(envio);
  }

  /**
   * Busca envíos por el ID de la orden
   */
  async buscarPorOrdenId(ordenId: string): Promise<Envio[]> {
    const envios = await this.prisma.envio.findMany({
      where: { ordenId },
      orderBy: { fechaCreacion: 'desc' },
    });

    return envios.map(envio => this.mapearEntidadPrismaAEnvio(envio));
  }

  /**
   * Busca envíos por número de tracking
   */
  async buscarPorTrackingNumber(trackingNumber: string): Promise<Envio | null> {
    const envio = await this.prisma.envio.findFirst({
      where: { trackingNumber },
    });

    if (!envio) {
      return null;
    }

    return this.mapearEntidadPrismaAEnvio(envio);
  }

  /**
   * Lista todos los envíos con paginación
   */
  async listar(pagina: number = 1, limite: number = 10): Promise<{ envios: Envio[]; total: number }> {
    const skip = (pagina - 1) * limite;

    const [envios, total] = await Promise.all([
      this.prisma.envio.findMany({
        skip,
        take: limite,
        orderBy: { fechaCreacion: 'desc' },
      }),
      this.prisma.envio.count(),
    ]);

    return {
      envios: envios.map(envio => this.mapearEntidadPrismaAEnvio(envio)),
      total,
    };
  }

  /**
   * Lista envíos por estado con paginación
   */
  async listarPorEstado(estado: EstadoEnvio, pagina: number = 1, limite: number = 10): Promise<{ envios: Envio[]; total: number }> {
    const skip = (pagina - 1) * limite;

    const [envios, total] = await Promise.all([
      this.prisma.envio.findMany({
        where: { estado },
        skip,
        take: limite,
        orderBy: { fechaCreacion: 'desc' },
      }),
      this.prisma.envio.count({ where: { estado } }),
    ]);

    return {
      envios: envios.map(envio => this.mapearEntidadPrismaAEnvio(envio)),
      total,
    };
  }

  /**
   * Lista envíos por método de envío con paginación
   */
  async listarPorMetodoEnvio(metodoEnvio: TipoMetodoEnvio, pagina: number = 1, limite: number = 10): Promise<{ envios: Envio[]; total: number }> {
    const skip = (pagina - 1) * limite;

    const [envios, total] = await Promise.all([
      this.prisma.envio.findMany({
        where: { 
          metodoEnvio: {
            path: ['tipo'],
            equals: metodoEnvio,
          }
        },
        skip,
        take: limite,
        orderBy: { fechaCreacion: 'desc' },
      }),
      this.prisma.envio.count({
        where: { 
          metodoEnvio: {
            path: ['tipo'],
            equals: metodoEnvio,
          }
        }
      }),
    ]);

    return {
      envios: envios.map(envio => this.mapearEntidadPrismaAEnvio(envio)),
      total,
    };
  }

  /**
   * Actualiza un envío existente
   */
  async actualizar(envio: Envio): Promise<Envio> {
    const envioActualizado = await this.prisma.envio.update({
      where: { id: envio.getId() },
      data: {
        ordenId: envio.getOrdenId(),
        direccionEnvio: envio.getDireccionEnvio(),
        metodoEnvio: envio.getMetodoEnvio(),
        estado: envio.getEstado(),
        costo: envio.getCosto(),
        fechaEstimadaEntrega: envio.getFechaEstimadaEntrega(),
        fechaActualizacion: envio.getFechaActualizacion(),
        trackingNumber: envio.getTrackingNumber(),
        proveedorEnvio: envio.getProveedorEnvio(),
        detalles: envio.getDetalles(),
      },
    });

    return this.mapearEntidadPrismaAEnvio(envioActualizado);
  }

  /**
   * Elimina un envío por su ID
   */
  async eliminar(id: string): Promise<void> {
    await this.prisma.envio.delete({
      where: { id },
    });
  }

  /**
   * Obtiene estadísticas de envíos
   */
  async obtenerEstadisticas(): Promise<EstadisticasEnvios> {
    const [
      totalEnvios,
      enviosPendientes,
      enviosProcesando,
      enviosEnviados,
      enviosEnTransito,
      enviosEntregados,
      enviosCancelados,
      costoTotalEnvios,
      metodosEnvioStats
    ] = await Promise.all([
      this.prisma.envio.count(),
      this.prisma.envio.count({ where: { estado: EstadoEnvio.PENDIENTE } }),
      this.prisma.envio.count({ where: { estado: EstadoEnvio.PROCESANDO } }),
      this.prisma.envio.count({ where: { estado: EstadoEnvio.ENVIADO } }),
      this.prisma.envio.count({ where: { estado: EstadoEnvio.EN_TRANSITO } }),
      this.prisma.envio.count({ where: { estado: EstadoEnvio.ENTREGADO } }),
      this.prisma.envio.count({ where: { estado: EstadoEnvio.CANCELADO } }),
      this.prisma.envio.aggregate({
        _sum: { costo: true },
      }),
      this.obtenerEstadisticasMetodosEnvio(),
    ]);

    // Calcular envíos atrasados
    const ahora = new Date();
    const enviosAtrasados = await this.prisma.envio.count({
      where: {
        estado: {
          in: [EstadoEnvio.PENDIENTE, EstadoEnvio.PROCESANDO, EstadoEnvio.ENVIADO, EstadoEnvio.EN_TRANSITO]
        },
        fechaEstimadaEntrega: { lt: ahora }
      }
    });

    // Calcular promedio de tiempo de entrega (simplificado)
    const promedioTiempoEntrega = await this.calcularPromedioTiempoEntrega();

    return {
      totalEnvios,
      enviosPendientes,
      enviosProcesando,
      enviosEnviados,
      enviosEnTransito,
      enviosEntregados,
      enviosCancelados,
      enviosAtrasados,
      costoTotalEnvios: costoTotalEnvios._sum.costo || 0,
      promedioTiempoEntrega,
      metodosEnvioMasUtilizados: metodosEnvioStats,
    };
  }

  /**
   * Busca envíos que están atrasados
   */
  async buscarEnviosAtrasados(): Promise<Envio[]> {
    const ahora = new Date();
    const enviosAtrasados = await this.prisma.envio.findMany({
      where: {
        estado: {
          in: [EstadoEnvio.PENDIENTE, EstadoEnvio.PROCESANDO, EstadoEnvio.ENVIADO, EstadoEnvio.EN_TRANSITO]
        },
        fechaEstimadaEntrega: { lt: ahora }
      },
      orderBy: { fechaEstimadaEntrega: 'asc' },
    });

    return enviosAtrasados.map(envio => this.mapearEntidadPrismaAEnvio(envio));
  }

  /**
   * Busca envíos por rango de fechas
   */
  async buscarPorRangoFechas(fechaInicio: Date, fechaFin: Date, pagina: number = 1, limite: number = 10): Promise<{ envios: Envio[]; total: number }> {
    const skip = (pagina - 1) * limite;

    const [envios, total] = await Promise.all([
      this.prisma.envio.findMany({
        where: {
          fechaCreacion: {
            gte: fechaInicio,
            lte: fechaFin,
          },
        },
        skip,
        take: limite,
        orderBy: { fechaCreacion: 'desc' },
      }),
      this.prisma.envio.count({
        where: {
          fechaCreacion: {
            gte: fechaInicio,
            lte: fechaFin,
          },
        },
      }),
    ]);

    return {
      envios: envios.map(envio => this.mapearEntidadPrismaAEnvio(envio)),
      total,
    };
  }

  /**
   * Busca envíos por país de destino
   */
  async buscarPorPais(pais: string, pagina: number = 1, limite: number = 10): Promise<{ envios: Envio[]; total: number }> {
    const skip = (pagina - 1) * limite;

    const [envios, total] = await Promise.all([
      this.prisma.envio.findMany({
        where: {
          direccionEnvio: {
            path: ['pais'],
            equals: pais,
          }
        },
        skip,
        take: limite,
        orderBy: { fechaCreacion: 'desc' },
      }),
      this.prisma.envio.count({
        where: {
          direccionEnvio: {
            path: ['pais'],
            equals: pais,
          }
        },
      }),
    ]);

    return {
      envios: envios.map(envio => this.mapearEntidadPrismaAEnvio(envio)),
      total,
    };
  }

  /**
   * Busca envíos por ciudad de destino
   */
  async buscarPorCiudad(ciudad: string, pagina: number = 1, limite: number = 10): Promise<{ envios: Envio[]; total: number }> {
    const skip = (pagina - 1) * limite;

    const [envios, total] = await Promise.all([
      this.prisma.envio.findMany({
        where: {
          direccionEnvio: {
            path: ['ciudad'],
            equals: ciudad,
          }
        },
        skip,
        take: limite,
        orderBy: { fechaCreacion: 'desc' },
      }),
      this.prisma.envio.count({
        where: {
          direccionEnvio: {
            path: ['ciudad'],
            equals: ciudad,
          }
        },
      }),
    ]);

    return {
      envios: envios.map(envio => this.mapearEntidadPrismaAEnvio(envio)),
      total,
    };
  }

  /**
   * Verifica si existe un envío para una orden específica
   */
  async existeEnvioParaOrden(ordenId: string): Promise<boolean> {
    const count = await this.prisma.envio.count({
      where: { ordenId },
    });

    return count > 0;
  }

  /**
   * Obtiene el costo total de envíos en un período
   */
  async obtenerCostoTotalEnPeriodo(fechaInicio: Date, fechaFin: Date): Promise<number> {
    const resultado = await this.prisma.envio.aggregate({
      _sum: { costo: true },
      where: {
        fechaCreacion: {
          gte: fechaInicio,
          lte: fechaFin,
        },
      },
    });

    return resultado._sum.costo || 0;
  }

  /**
   * Obtiene los métodos de envío más utilizados
   */
  async obtenerMetodosEnvioMasUtilizados(limite: number = 5): Promise<MetodoEnvioMasUtilizado[]> {
    const totalEnvios = await this.prisma.envio.count();
    
    if (totalEnvios === 0) {
      return [];
    }

    const metodosEnvioStats = await this.obtenerEstadisticasMetodosEnvio();
    return metodosEnvioStats.slice(0, limite);
  }

  /**
   * Mapea la entidad de Prisma a la entidad de dominio Envio
   */
  private mapearEntidadPrismaAEnvio(envioPrisma: any): Envio {
    return new Envio(
      envioPrisma.id,
      envioPrisma.ordenId,
      envioPrisma.direccionEnvio as DireccionEnvio,
      envioPrisma.metodoEnvio as MetodoEnvio,
      envioPrisma.estado as EstadoEnvio,
      envioPrisma.costo,
      new Date(envioPrisma.fechaEstimadaEntrega),
      new Date(envioPrisma.fechaCreacion),
      new Date(envioPrisma.fechaActualizacion),
      envioPrisma.trackingNumber,
      envioPrisma.proveedorEnvio,
      envioPrisma.detalles as DetallesEnvio,
    );
  }

  /**
   * Obtiene estadísticas de métodos de envío
   */
  private async obtenerEstadisticasMetodosEnvio(): Promise<MetodoEnvioMasUtilizado[]> {
    const totalEnvios = await this.prisma.envio.count();
    
    if (totalEnvios === 0) {
      return [];
    }

    const metodosEnvio = await this.prisma.envio.groupBy({
      by: ['metodoEnvio'],
      _count: { id: true },
    });

    return metodosEnvio.map(item => ({
      metodoEnvio: item.metodoEnvio.tipo as TipoMetodoEnvio,
      cantidad: item._count.id,
      porcentaje: (item._count.id / totalEnvios) * 100,
    })).sort((a, b) => b.cantidad - a.cantidad);
  }

  /**
   * Calcula el promedio de tiempo de entrega (simplificado)
   */
  private async calcularPromedioTiempoEntrega(): Promise<number> {
    const enviosEntregados = await this.prisma.envio.findMany({
      where: { estado: EstadoEnvio.ENTREGADO },
      select: {
        fechaCreacion: true,
        detalles: true,
      },
    });

    if (enviosEntregados.length === 0) {
      return 0;
    }

    let totalDias = 0;
    let count = 0;

    for (const envio of enviosEntregados) {
      const fechaEntrega = envio.detalles.fechaEntrega;
      if (fechaEntrega) {
        const diasEntrega = Math.ceil(
          (new Date(fechaEntrega).getTime() - new Date(envio.fechaCreacion).getTime()) / (1000 * 60 * 60 * 24)
        );
        totalDias += diasEntrega;
        count++;
      }
    }

    return count > 0 ? totalDias / count : 0;
  }
}