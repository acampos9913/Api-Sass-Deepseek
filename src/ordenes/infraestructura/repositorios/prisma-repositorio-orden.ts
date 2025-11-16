import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Orden } from '../../dominio/entidades/orden.entity';
import { EstadoOrden, EstadoPago, MetodoPago } from '../../dominio/enums/estado-orden.enum';
import type { RepositorioOrden, FiltrosOrdenes } from '../../dominio/interfaces/repositorio-orden.interface';

/**
 * Repositorio de Orden implementado con Prisma
 * Sigue el principio de inversión de dependencias (DIP)
 */
@Injectable()
export class PrismaRepositorioOrden implements RepositorioOrden {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Convierte un modelo de Prisma a una entidad de Dominio
   */
  private aEntidad(prismaOrden: any): Orden {
    return new Orden(
      prismaOrden.id,
      prismaOrden.numero_orden,
      prismaOrden.cliente_id,
      prismaOrden.estado as EstadoOrden,
      Number(prismaOrden.subtotal),
      Number(prismaOrden.impuestos),
      Number(prismaOrden.total),
      prismaOrden.metodo_pago as MetodoPago,
      prismaOrden.estado_pago as EstadoPago,
      prismaOrden.metodo_envio,
      Number(prismaOrden.costo_envio),
      prismaOrden.direccion_envio_id,
      prismaOrden.notas,
      prismaOrden.notas_internas,
      prismaOrden.fecha_creacion,
      prismaOrden.fecha_actualizacion,
      prismaOrden.fecha_pago,
      prismaOrden.fecha_envio,
      prismaOrden.fecha_entrega,
      prismaOrden.fecha_abandono,
      prismaOrden.es_borrador,
      prismaOrden.archivada,
      prismaOrden.motivo_cancelacion,
      prismaOrden.datos_cliente,
      prismaOrden.datos_envio,
      prismaOrden.datos_facturacion,
      prismaOrden.creador_id,
      prismaOrden.orden_original_id,
    );
  }

  /**
   * Convierte una entidad de Dominio a un objeto para Prisma
   */
  private aPrisma(orden: Orden): any {
    return {
      id: orden.id,
      numero_orden: orden.numeroOrden,
      cliente_id: orden.clienteId,
      estado: orden.estado,
      subtotal: orden.subtotal,
      impuestos: orden.impuestos,
      total: orden.total,
      metodo_pago: orden.metodoPago,
      estado_pago: orden.estadoPago,
      metodo_envio: orden.metodoEnvio,
      costo_envio: orden.costoEnvio,
      direccion_envio_id: orden.direccionEnvioId,
      notas: orden.notas,
      notas_internas: orden.notasInternas,
      fecha_creacion: orden.fechaCreacion,
      fecha_actualizacion: orden.fechaActualizacion,
      fecha_pago: orden.fechaPago,
      fecha_envio: orden.fechaEnvio,
      fecha_entrega: orden.fechaEntrega,
      fecha_abandono: orden.fechaAbandono,
      es_borrador: orden.esBorrador,
      archivada: orden.archivada,
      motivo_cancelacion: orden.motivoCancelacion,
      datos_cliente: orden.datosCliente,
      datos_envio: orden.datosEnvio,
      datos_facturacion: orden.datosFacturacion,
      creador_id: orden.creadorId,
      orden_original_id: orden.ordenOriginalId,
    };
  }

  async buscarPorId(id: string): Promise<Orden | null> {
    const prismaOrden = await this.prisma.orden.findUnique({
      where: { id },
    });

    if (!prismaOrden) {
      return null;
    }

    return this.aEntidad(prismaOrden);
  }

  async buscarPorNumeroOrden(numeroOrden: string): Promise<Orden | null> {
    const prismaOrden = await this.prisma.orden.findUnique({
      where: { numero_orden: numeroOrden },
    });

    if (!prismaOrden) {
      return null;
    }

    return this.aEntidad(prismaOrden);
  }

  async guardar(orden: Orden): Promise<Orden> {
    const prismaOrden = await this.prisma.orden.create({
      data: this.aPrisma(orden),
    });

    return this.aEntidad(prismaOrden);
  }

  async actualizar(orden: Orden): Promise<Orden> {
    const prismaOrden = await this.prisma.orden.update({
      where: { id: orden.id },
      data: this.aPrisma(orden),
    });

    return this.aEntidad(prismaOrden);
  }

  async eliminar(id: string): Promise<void> {
    await this.prisma.orden.delete({
      where: { id },
    });
  }

  async listar(
    pagina: number,
    limite: number,
    filtros?: FiltrosOrdenes,
  ): Promise<{ ordenes: Orden[]; total: number }> {
    const skip = (pagina - 1) * limite;

    const where: any = {};

    if (filtros?.estado) {
      where.estado = filtros.estado;
    }

    if (filtros?.estadoPago) {
      where.estado_pago = filtros.estadoPago;
    }

    if (filtros?.clienteId) {
      where.cliente_id = filtros.clienteId;
    }

    if (filtros?.numeroOrden) {
      where.numero_orden = {
        contains: filtros.numeroOrden,
        mode: 'insensitive',
      };
    }

    // Filtros de fecha
    if (filtros?.fechaDesde || filtros?.fechaHasta) {
      where.fecha_creacion = {};
      
      if (filtros.fechaDesde) {
        where.fecha_creacion.gte = filtros.fechaDesde;
      }
      
      if (filtros.fechaHasta) {
        where.fecha_creacion.lte = filtros.fechaHasta;
      }
    }

    const [prismaOrdenes, total] = await Promise.all([
      this.prisma.orden.findMany({
        where,
        skip,
        take: limite,
        orderBy: { fecha_creacion: 'desc' },
        include: {
          cliente: {
            select: {
              id: true,
              nombre_completo: true,
              email: true,
            },
          },
        },
      }),
      this.prisma.orden.count({ where }),
    ]);

    const ordenes = prismaOrdenes.map(prismaOrden =>
      this.aEntidad(prismaOrden),
    );

    return { ordenes, total };
  }

  async listarPorCliente(
    clienteId: string,
    pagina: number,
    limite: number,
  ): Promise<{ ordenes: Orden[]; total: number }> {
    const skip = (pagina - 1) * limite;

    const where = {
      cliente_id: clienteId,
    };

    const [prismaOrdenes, total] = await Promise.all([
      this.prisma.orden.findMany({
        where,
        skip,
        take: limite,
        orderBy: { fecha_creacion: 'desc' },
      }),
      this.prisma.orden.count({ where }),
    ]);

    const ordenes = prismaOrdenes.map(prismaOrden =>
      this.aEntidad(prismaOrden),
    );

    return { ordenes, total };
  }

  async obtenerEstadisticas(
    fechaDesde?: Date,
    fechaHasta?: Date,
  ): Promise<{
    totalOrdenes: number;
    totalVentas: number;
    ordenesPorEstado: Record<EstadoOrden, number>;
    ordenesAbandonadas: number;
    totalBorradores: number;
    totalArchivadas: number;
  }> {
    const where: any = {};

    if (fechaDesde || fechaHasta) {
      where.fecha_creacion = {};
      
      if (fechaDesde) {
        where.fecha_creacion.gte = fechaDesde;
      }
      
      if (fechaHasta) {
        where.fecha_creacion.lte = fechaHasta;
      }
    }

    const [totalOrdenes, totalVentasResult, ordenesPorEstado, ordenesAbandonadas, totalBorradores, totalArchivadas] = await Promise.all([
      this.prisma.orden.count({ where }),
      this.prisma.orden.aggregate({
        where: {
          ...where,
          estado_pago: EstadoPago.PAGADO,
        },
        _sum: {
          total: true,
        },
      }),
      this.prisma.orden.groupBy({
        where,
        by: ['estado'],
        _count: {
          id: true,
        },
      }),
      this.prisma.orden.count({
        where: {
          ...where,
          fecha_abandono: { not: null },
        },
      }),
      this.prisma.orden.count({
        where: {
          ...where,
          es_borrador: true,
        },
      }),
      this.prisma.orden.count({
        where: {
          ...where,
          archivada: true,
        },
      }),
    ]);

    const totalVentas = Number(totalVentasResult._sum.total) || 0;

    // Convertir el resultado de ordenesPorEstado a un objeto Record
    const ordenesPorEstadoObj: Record<EstadoOrden, number> = Object.values(EstadoOrden).reduce((acc, estado) => {
      acc[estado] = 0;
      return acc;
    }, {} as Record<EstadoOrden, number>);

    ordenesPorEstado.forEach(item => {
      ordenesPorEstadoObj[item.estado as EstadoOrden] = item._count.id;
    });

    return {
      totalOrdenes,
      totalVentas,
      ordenesPorEstado: ordenesPorEstadoObj,
      ordenesAbandonadas,
      totalBorradores,
      totalArchivadas,
    };
  }

  async existeNumeroOrden(numeroOrden: string): Promise<boolean> {
    const count = await this.prisma.orden.count({
      where: {
        numero_orden: numeroOrden,
      },
    });

    return count > 0;
  }

  async listarAbandonadas(
    fechaDesde?: Date,
    fechaHasta?: Date,
    pagina: number = 1,
    limite: number = 10,
  ): Promise<{ ordenes: Orden[]; total: number }> {
    const skip = (pagina - 1) * limite;

    const where: any = {
      fecha_abandono: { not: null },
    };

    if (fechaDesde || fechaHasta) {
      where.fecha_abandono = {};
      if (fechaDesde) {
        where.fecha_abandono.gte = fechaDesde;
      }
      if (fechaHasta) {
        where.fecha_abandono.lte = fechaHasta;
      }
    }

    const [prismaOrdenes, total] = await Promise.all([
      this.prisma.orden.findMany({
        where,
        skip,
        take: limite,
        orderBy: { fecha_abandono: 'desc' },
      }),
      this.prisma.orden.count({ where }),
    ]);

    const ordenes = prismaOrdenes.map(prismaOrden =>
      this.aEntidad(prismaOrden),
    );

    return { ordenes, total };
  }

  async listarBorradores(
    pagina: number = 1,
    limite: number = 10,
  ): Promise<{ ordenes: Orden[]; total: number }> {
    const skip = (pagina - 1) * limite;

    const where = {
      es_borrador: true,
    };

    const [prismaOrdenes, total] = await Promise.all([
      this.prisma.orden.findMany({
        where,
        skip,
        take: limite,
        orderBy: { fecha_creacion: 'desc' },
      }),
      this.prisma.orden.count({ where }),
    ]);

    const ordenes = prismaOrdenes.map(prismaOrden =>
      this.aEntidad(prismaOrden),
    );

    return { ordenes, total };
  }

  async listarArchivadas(
    pagina: number = 1,
    limite: number = 10,
  ): Promise<{ ordenes: Orden[]; total: number }> {
    const skip = (pagina - 1) * limite;

    const where = {
      archivada: true,
    };

    const [prismaOrdenes, total] = await Promise.all([
      this.prisma.orden.findMany({
        where,
        skip,
        take: limite,
        orderBy: { fecha_creacion: 'desc' },
      }),
      this.prisma.orden.count({ where }),
    ]);

    const ordenes = prismaOrdenes.map(prismaOrden =>
      this.aEntidad(prismaOrden),
    );

    return { ordenes, total };
  }

  async duplicarOrden(ordenId: string, creadorId: string): Promise<Orden> {
    const ordenOriginal = await this.buscarPorId(ordenId);
    if (!ordenOriginal) {
      throw new Error('Orden original no encontrada');
    }

    if (!ordenOriginal.puedeDuplicar()) {
      throw new Error('La orden no puede ser duplicada');
    }

    const nuevaOrden = new Orden(
      `ord_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      await this.generarNumeroOrdenUnico(),
      ordenOriginal.clienteId,
      EstadoOrden.PENDIENTE,
      ordenOriginal.subtotal,
      ordenOriginal.impuestos,
      ordenOriginal.total,
      ordenOriginal.metodoPago,
      EstadoPago.PENDIENTE,
      ordenOriginal.metodoEnvio,
      ordenOriginal.costoEnvio,
      ordenOriginal.direccionEnvioId,
      ordenOriginal.notas,
      `Duplicada de orden ${ordenOriginal.numeroOrden}`,
      new Date(),
      new Date(),
      null, // fechaPago
      null, // fechaEnvio
      null, // fechaEntrega
      null, // fechaAbandono
      false, // esBorrador
      false, // archivada
      null, // motivoCancelacion
      ordenOriginal.datosCliente,
      ordenOriginal.datosEnvio,
      ordenOriginal.datosFacturacion,
      creadorId,
      ordenOriginal.id, // ordenOriginalId
    );

    return await this.guardar(nuevaOrden);
  }

  async crearReposicion(ordenId: string, creadorId: string): Promise<Orden> {
    const ordenOriginal = await this.buscarPorId(ordenId);
    if (!ordenOriginal) {
      throw new Error('Orden original no encontrada');
    }

    if (!ordenOriginal.puedeReemplazar()) {
      throw new Error('La orden no puede ser reemplazada');
    }

    const nuevaOrden = new Orden(
      `ord_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      await this.generarNumeroOrdenUnico(),
      ordenOriginal.clienteId,
      EstadoOrden.PENDIENTE,
      ordenOriginal.subtotal,
      ordenOriginal.impuestos,
      ordenOriginal.total,
      ordenOriginal.metodoPago,
      EstadoPago.PENDIENTE,
      ordenOriginal.metodoEnvio,
      ordenOriginal.costoEnvio,
      ordenOriginal.direccionEnvioId,
      `Reposición de orden ${ordenOriginal.numeroOrden}`,
      `Reposición de orden ${ordenOriginal.numeroOrden} - ${ordenOriginal.motivoCancelacion || 'Sin motivo especificado'}`,
      new Date(),
      new Date(),
      null, // fechaPago
      null, // fechaEnvio
      null, // fechaEntrega
      null, // fechaAbandono
      false, // esBorrador
      false, // archivada
      null, // motivoCancelacion
      ordenOriginal.datosCliente,
      ordenOriginal.datosEnvio,
      ordenOriginal.datosFacturacion,
      creadorId,
      ordenOriginal.id, // ordenOriginalId
    );

    return await this.guardar(nuevaOrden);
  }

  private async generarNumeroOrdenUnico(): Promise<string> {
    let numeroOrden: string;
    let intentos = 0;
    const maxIntentos = 10;

    do {
      numeroOrden = this.generarNumeroOrden();
      intentos++;

      if (intentos > maxIntentos) {
        throw new Error('No se pudo generar un número de orden único después de varios intentos');
      }
    } while (await this.existeNumeroOrden(numeroOrden));

    return numeroOrden;
  }

  private generarNumeroOrden(): string {
    const fecha = new Date();
    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();

    return `ORD-${año}${mes}${dia}-${timestamp}-${random}`;
  }
}