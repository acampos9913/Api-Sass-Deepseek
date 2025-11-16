import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import type { RepositorioPaquete } from '../../dominio/interfaces/repositorio-paquete.interface';

/**
 * Implementación del repositorio de paquete usando Prisma
 * Adapta la interfaz de dominio a la implementación específica de Prisma
 */
@Injectable()
export class PrismaRepositorioPaquete implements RepositorioPaquete {
  constructor(private readonly prisma: PrismaClient) {}

  async crear(paquete: {
    id: string;
    nombre: string;
    descripcion: string | null;
    precio: number;
    precioComparacion: number | null;
    sku: string | null;
    activo: boolean;
    fechaCreacion: Date;
    fechaActualizacion: Date;
    tiendaId: string | null;
    creadorId: string;
    items: Array<{
      productoId: string;
      varianteId: string | null;
      cantidad: number;
      precioUnitario: number | null;
    }>;
  }): Promise<void> {
    await this.prisma.paqueteProducto.create({
      data: {
        id: paquete.id,
        nombre: paquete.nombre,
        descripcion: paquete.descripcion,
        precio: paquete.precio,
        precio_comparacion: paquete.precioComparacion,
        sku: paquete.sku,
        activo: paquete.activo,
        fecha_creacion: paquete.fechaCreacion,
        fecha_actualizacion: paquete.fechaActualizacion,
        tienda_id: paquete.tiendaId,
        creador_id: paquete.creadorId,
        items: {
          create: paquete.items.map(item => ({
            producto_id: item.productoId,
            variante_id: item.varianteId,
            cantidad: item.cantidad,
            precio_unitario: item.precioUnitario,
          })),
        },
      },
    });
  }

  async buscarPorId(id: string): Promise<{
    id: string;
    nombre: string;
    descripcion: string | null;
    precio: number;
    precioComparacion: number | null;
    sku: string | null;
    activo: boolean;
    fechaCreacion: Date;
    fechaActualizacion: Date;
    tiendaId: string | null;
    creadorId: string;
    items: Array<{
      id: string;
      productoId: string;
      varianteId: string | null;
      cantidad: number;
      precioUnitario: number | null;
    }>;
  } | null> {
    const paquete = await this.prisma.paqueteProducto.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });

    if (!paquete) {
      return null;
    }

    return {
      id: paquete.id,
      nombre: paquete.nombre,
      descripcion: paquete.descripcion,
      precio: Number(paquete.precio),
      precioComparacion: paquete.precio_comparacion ? Number(paquete.precio_comparacion) : null,
      sku: paquete.sku,
      activo: paquete.activo,
      fechaCreacion: paquete.fecha_creacion,
      fechaActualizacion: paquete.fecha_actualizacion,
      tiendaId: paquete.tienda_id,
      creadorId: paquete.creador_id,
      items: paquete.items.map(item => ({
        id: item.id,
        productoId: item.producto_id,
        varianteId: item.variante_id,
        cantidad: item.cantidad,
        precioUnitario: item.precio_unitario ? Number(item.precio_unitario) : null,
      })),
    };
  }

  async buscarPorSku(sku: string): Promise<{
    id: string;
    nombre: string;
    descripcion: string | null;
    precio: number;
    precioComparacion: number | null;
    sku: string | null;
    activo: boolean;
    fechaCreacion: Date;
    fechaActualizacion: Date;
    tiendaId: string | null;
    creadorId: string;
    items: Array<{
      id: string;
      productoId: string;
      varianteId: string | null;
      cantidad: number;
      precioUnitario: number | null;
    }>;
  } | null> {
    const paquete = await this.prisma.paqueteProducto.findUnique({
      where: { sku },
      include: {
        items: true,
      },
    });

    if (!paquete) {
      return null;
    }

    return {
      id: paquete.id,
      nombre: paquete.nombre,
      descripcion: paquete.descripcion,
      precio: Number(paquete.precio),
      precioComparacion: paquete.precio_comparacion ? Number(paquete.precio_comparacion) : null,
      sku: paquete.sku,
      activo: paquete.activo,
      fechaCreacion: paquete.fecha_creacion,
      fechaActualizacion: paquete.fecha_actualizacion,
      tiendaId: paquete.tienda_id,
      creadorId: paquete.creador_id,
      items: paquete.items.map(item => ({
        id: item.id,
        productoId: item.producto_id,
        varianteId: item.variante_id,
        cantidad: item.cantidad,
        precioUnitario: item.precio_unitario ? Number(item.precio_unitario) : null,
      })),
    };
  }

  async listar(filtros: {
    pagina: number;
    limite: number;
    activo?: boolean;
    busqueda?: string;
    tiendaId?: string;
    ordenarPor?: string;
    orden?: 'asc' | 'desc';
  }): Promise<{
    paquetes: Array<{
      id: string;
      nombre: string;
      descripcion: string | null;
      precio: number;
      precioComparacion: number | null;
      sku: string | null;
      activo: boolean;
      fechaCreacion: Date;
      fechaActualizacion: Date;
      tiendaId: string | null;
      creadorId: string;
      items: Array<{
        id: string;
        productoId: string;
        varianteId: string | null;
        cantidad: number;
        precioUnitario: number | null;
      }>;
    }>;
    total: number;
  }> {
    const skip = (filtros.pagina - 1) * filtros.limite;

    // Construir condiciones where
    const where: any = {};

    if (filtros.activo !== undefined) {
      where.activo = filtros.activo;
    }

    if (filtros.tiendaId) {
      where.tienda_id = filtros.tiendaId;
    }

    if (filtros.busqueda) {
      where.OR = [
        { nombre: { contains: filtros.busqueda, mode: 'insensitive' } },
        { descripcion: { contains: filtros.busqueda, mode: 'insensitive' } },
        { sku: { contains: filtros.busqueda, mode: 'insensitive' } },
      ];
    }

    // Configurar ordenamiento
    const orderBy: any = {};
    const campoOrden = filtros.ordenarPor || 'fecha_creacion';
    const direccionOrden = filtros.orden || 'desc';
    
    orderBy[campoOrden] = direccionOrden;

    const [paquetes, total] = await Promise.all([
      this.prisma.paqueteProducto.findMany({
        where,
        skip,
        take: filtros.limite,
        orderBy,
        include: {
          items: true,
        },
      }),
      this.prisma.paqueteProducto.count({ where }),
    ]);

    return {
      paquetes: paquetes.map(paquete => ({
        id: paquete.id,
        nombre: paquete.nombre,
        descripcion: paquete.descripcion,
        precio: Number(paquete.precio),
        precioComparacion: paquete.precio_comparacion ? Number(paquete.precio_comparacion) : null,
        sku: paquete.sku,
        activo: paquete.activo,
        fechaCreacion: paquete.fecha_creacion,
        fechaActualizacion: paquete.fecha_actualizacion,
        tiendaId: paquete.tienda_id,
        creadorId: paquete.creador_id,
        items: paquete.items.map(item => ({
          id: item.id,
          productoId: item.producto_id,
          varianteId: item.variante_id,
          cantidad: item.cantidad,
          precioUnitario: item.precio_unitario ? Number(item.precio_unitario) : null,
        })),
      })),
      total,
    };
  }

  async actualizar(
    id: string,
    datos: {
      nombre?: string;
      descripcion?: string | null;
      precio?: number;
      precioComparacion?: number | null;
      activo?: boolean;
      fechaActualizacion: Date;
    },
  ): Promise<void> {
    await this.prisma.paqueteProducto.update({
      where: { id },
      data: {
        ...(datos.nombre && { nombre: datos.nombre }),
        ...(datos.descripcion !== undefined && { descripcion: datos.descripcion }),
        ...(datos.precio !== undefined && { precio: datos.precio }),
        ...(datos.precioComparacion !== undefined && { precio_comparacion: datos.precioComparacion }),
        ...(datos.activo !== undefined && { activo: datos.activo }),
        fecha_actualizacion: datos.fechaActualizacion,
      },
    });
  }

  async eliminar(id: string): Promise<void> {
    await this.prisma.paqueteProducto.delete({
      where: { id },
    });
  }

  async agregarItem(
    paqueteId: string,
    item: {
      id: string;
      productoId: string;
      varianteId: string | null;
      cantidad: number;
      precioUnitario: number | null;
    },
  ): Promise<void> {
    await this.prisma.itemPaquete.create({
      data: {
        id: item.id,
        paquete_id: paqueteId,
        producto_id: item.productoId,
        variante_id: item.varianteId,
        cantidad: item.cantidad,
        precio_unitario: item.precioUnitario,
      },
    });
  }

  async actualizarItem(
    paqueteId: string,
    itemId: string,
    datos: {
      cantidad?: number;
      precioUnitario?: number | null;
    },
  ): Promise<void> {
    await this.prisma.itemPaquete.update({
      where: { 
        id: itemId,
        paquete_id: paqueteId,
      },
      data: {
        ...(datos.cantidad !== undefined && { cantidad: datos.cantidad }),
        ...(datos.precioUnitario !== undefined && { precio_unitario: datos.precioUnitario }),
      },
    });
  }

  async eliminarItem(paqueteId: string, itemId: string): Promise<void> {
    await this.prisma.itemPaquete.delete({
      where: { 
        id: itemId,
        paquete_id: paqueteId,
      },
    });
  }

  async obtenerEstadisticas(tiendaId?: string): Promise<{
    totalPaquetes: number;
    paquetesActivos: number;
    paquetesInactivos: number;
    paquetesNuevosHoy: number;
    promedioPrecio: number;
    paquetesConAhorro: number;
  }> {
    const hoy = new Date();
    const inicioDelDia = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());

    const where: any = {};
    if (tiendaId) {
      where.tienda_id = tiendaId;
    }

    const [
      totalPaquetes,
      paquetesActivos,
      paquetesInactivos,
      paquetesNuevosHoy,
      promedioPrecioResult,
      paquetesConAhorro,
    ] = await Promise.all([
      this.prisma.paqueteProducto.count({ where }),
      this.prisma.paqueteProducto.count({ where: { ...where, activo: true } }),
      this.prisma.paqueteProducto.count({ where: { ...where, activo: false } }),
      this.prisma.paqueteProducto.count({
        where: {
          ...where,
          fecha_creacion: {
            gte: inicioDelDia,
          },
        },
      }),
      this.prisma.paqueteProducto.aggregate({
        where,
        _avg: { precio: true },
      }),
      this.prisma.paqueteProducto.count({
        where: {
          ...where,
          precio_comparacion: {
            gt: this.prisma.paqueteProducto.fields.precio,
          },
        },
      }),
    ]);

    const promedioPrecio = Number(promedioPrecioResult._avg.precio || 0);

    return {
      totalPaquetes,
      paquetesActivos,
      paquetesInactivos,
      paquetesNuevosHoy,
      promedioPrecio,
      paquetesConAhorro,
    };
  }

  async verificarDisponibilidad(paqueteId: string): Promise<{
    disponible: boolean;
    productosFaltantes: Array<{
      productoId: string;
      varianteId: string | null;
      cantidadRequerida: number;
      cantidadDisponible: number;
    }>;
  }> {
    const paquete = await this.buscarPorId(paqueteId);
    
    if (!paquete) {
      throw new Error('Paquete no encontrado');
    }

    const productosFaltantes: Array<{
      productoId: string;
      varianteId: string | null;
      cantidadRequerida: number;
      cantidadDisponible: number;
    }> = [];

    for (const item of paquete.items) {
      let cantidadDisponible = 0;

      if (item.varianteId) {
        // Verificar disponibilidad de variante
        const variante = await this.prisma.variante.findUnique({
          where: { id: item.varianteId },
        });

        if (variante) {
          cantidadDisponible = variante.inventario;
        }
      } else {
        // Verificar disponibilidad del producto principal
        const producto = await this.prisma.producto.findUnique({
          where: { id: item.productoId },
        });

        if (producto) {
          cantidadDisponible = producto.cantidad_inventario;
        }
      }

      if (cantidadDisponible < item.cantidad) {
        productosFaltantes.push({
          productoId: item.productoId,
          varianteId: item.varianteId,
          cantidadRequerida: item.cantidad,
          cantidadDisponible,
        });
      }
    }

    return {
      disponible: productosFaltantes.length === 0,
      productosFaltantes,
    };
  }

  async buscarPorProducto(productoId: string, varianteId?: string): Promise<Array<{
    id: string;
    nombre: string;
    descripcion: string | null;
    precio: number;
    precioComparacion: number | null;
    sku: string | null;
    activo: boolean;
    fechaCreacion: Date;
    fechaActualizacion: Date;
    tiendaId: string | null;
    creadorId: string;
    cantidadEnPaquete: number;
  }>> {
    const where: any = {
      items: {
        some: {
          producto_id: productoId,
        },
      },
      activo: true,
    };

    if (varianteId) {
      where.items.some.variante_id = varianteId;
    }

    const paquetes = await this.prisma.paqueteProducto.findMany({
      where,
      include: {
        items: {
          where: {
            producto_id: productoId,
            ...(varianteId && { variante_id: varianteId }),
          },
        },
      },
    });

    return paquetes.map(paquete => {
      const item = paquete.items[0]; // Siempre habrá al menos uno por el filtro
      return {
        id: paquete.id,
        nombre: paquete.nombre,
        descripcion: paquete.descripcion,
        precio: Number(paquete.precio),
        precioComparacion: paquete.precio_comparacion ? Number(paquete.precio_comparacion) : null,
        sku: paquete.sku,
        activo: paquete.activo,
        fechaCreacion: paquete.fecha_creacion,
        fechaActualizacion: paquete.fecha_actualizacion,
        tiendaId: paquete.tienda_id,
        creadorId: paquete.creador_id,
        cantidadEnPaquete: item.cantidad,
      };
    });
  }
}