import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import type { RepositorioCaja } from '../../../punto-venta/dominio/interfaces/repositorio-caja.interface';
import { Caja, EstadoCaja } from '../../../punto-venta/dominio/entidades/caja.entity';

/**
 * Implementación del repositorio de cajas usando Prisma
 * Gestiona todas las operaciones de base de datos para las cajas
 */
@Injectable()
export class PrismaRepositorioCaja implements RepositorioCaja {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Guarda una nueva caja en la base de datos
   * @param caja - Entidad de caja a guardar
   * @returns La caja creada
   */
  async guardar(caja: Caja): Promise<Caja> {
    const cajaPrisma = await this.prisma.caja.create({
      data: {
        id: caja.id,
        sucursal_id: caja.sucursal_id,
        nombre: caja.nombre,
        estado: caja.estado,
        saldo_inicial: caja.saldo_inicial,
        saldo_actual: caja.saldo_actual,
        fecha_apertura: caja.fecha_apertura,
        fecha_cierre: caja.fecha_cierre,
        usuario_apertura_id: caja.usuario_apertura_id,
        usuario_cierre_id: caja.usuario_cierre_id,
        fecha_creacion: caja.fecha_creacion,
        fecha_actualizacion: caja.fecha_actualizacion,
      },
    });

    return this.mapearPrismaACaja(cajaPrisma);
  }

  /**
   * Busca una caja por su ID
   * @param id - ID de la caja
   * @returns La caja encontrada o null
   */
  async buscarPorId(id: string): Promise<Caja | null> {
    const cajaPrisma = await this.prisma.caja.findUnique({
      where: { id },
      include: {
        tickets: true,
      },
    });

    if (!cajaPrisma) {
      return null;
    }

    return this.mapearPrismaACaja(cajaPrisma);
  }

  /**
   * Busca cajas con filtros específicos
   * @param filtros - Filtros de búsqueda
   * @returns Lista de cajas que coinciden con los filtros
   */
  async buscarConFiltros(filtros: any): Promise<Caja[]> {
    const where: any = {};

    if (filtros.sucursal_id) {
      where.sucursal_id = filtros.sucursal_id;
    }

    if (filtros.estado) {
      where.estado = filtros.estado;
    }

    if (filtros.usuario_apertura_id) {
      where.usuario_apertura_id = filtros.usuario_apertura_id;
    }

    if (filtros.fecha_apertura_desde || filtros.fecha_apertura_hasta) {
      where.fecha_apertura = {};
      
      if (filtros.fecha_apertura_desde) {
        where.fecha_apertura.gte = new Date(filtros.fecha_apertura_desde);
      }
      
      if (filtros.fecha_apertura_hasta) {
        where.fecha_apertura.lte = new Date(filtros.fecha_apertura_hasta);
      }
    }

    const cajasPrisma = await this.prisma.caja.findMany({
      where,
      include: {
        tickets: true,
      },
      orderBy: {
        fecha_creacion: 'desc',
      },
    });

    return cajasPrisma.map(cajaPrisma => this.mapearPrismaACaja(cajaPrisma));
  }

  /**
   * Busca cajas por sucursal
   * @param sucursal_id - ID de la sucursal
   * @returns Lista de cajas de la sucursal
   */
  async buscarPorSucursal(sucursal_id: string): Promise<Caja[]> {
    const cajasPrisma = await this.prisma.caja.findMany({
      where: { sucursal_id },
      include: {
        tickets: true,
      },
      orderBy: {
        fecha_creacion: 'desc',
      },
    });

    return cajasPrisma.map(cajaPrisma => this.mapearPrismaACaja(cajaPrisma));
  }

  /**
   * Busca cajas abiertas por sucursal
   * @param sucursal_id - ID de la sucursal
   * @returns Lista de cajas abiertas de la sucursal
   */
  async buscarAbiertasPorSucursal(sucursal_id: string): Promise<Caja[]> {
    const cajasPrisma = await this.prisma.caja.findMany({
      where: { 
        sucursal_id,
        estado: EstadoCaja.ABIERTA,
      },
      include: {
        tickets: true,
      },
      orderBy: {
        fecha_apertura: 'desc',
      },
    });

    return cajasPrisma.map(cajaPrisma => this.mapearPrismaACaja(cajaPrisma));
  }

  /**
   * Abre una caja
   * @param id - ID de la caja
   * @param usuario_id - ID del usuario que abre la caja
   * @param saldo_inicial - Saldo inicial de la caja
   * @returns La caja actualizada
   */
  async abrirCaja(id: string, usuario_id: string, saldo_inicial: number): Promise<Caja> {
    const cajaPrisma = await this.prisma.caja.update({
      where: { id },
      data: {
        estado: EstadoCaja.ABIERTA,
        saldo_inicial,
        saldo_actual: saldo_inicial,
        fecha_apertura: new Date(),
        usuario_apertura_id: usuario_id,
        fecha_actualizacion: new Date(),
      },
      include: {
        tickets: true,
      },
    });

    return this.mapearPrismaACaja(cajaPrisma);
  }

  /**
   * Cierra una caja
   * @param id - ID de la caja
   * @param usuario_id - ID del usuario que cierra la caja
   * @returns La caja actualizada
   */
  async cerrarCaja(id: string, usuario_id: string): Promise<Caja> {
    const cajaPrisma = await this.prisma.caja.update({
      where: { id },
      data: {
        estado: EstadoCaja.CERRADA,
        fecha_cierre: new Date(),
        usuario_cierre_id: usuario_id,
        fecha_actualizacion: new Date(),
      },
      include: {
        tickets: true,
      },
    });

    return this.mapearPrismaACaja(cajaPrisma);
  }

  /**
   * Registra una venta en la caja
   * @param id - ID de la caja
   * @param monto_venta - Monto de la venta
   * @returns La caja actualizada
   */
  async registrarVenta(id: string, monto_venta: number): Promise<Caja> {
    const cajaPrisma = await this.prisma.caja.update({
      where: { id },
      data: {
        saldo_actual: {
          increment: monto_venta,
        },
        fecha_actualizacion: new Date(),
      },
      include: {
        tickets: true,
      },
    });

    return this.mapearPrismaACaja(cajaPrisma);
  }

  /**
   * Registra un retiro de la caja
   * @param id - ID de la caja
   * @param monto_retiro - Monto del retiro
   * @returns La caja actualizada
   */
  async registrarRetiro(id: string, monto_retiro: number): Promise<Caja> {
    const cajaPrisma = await this.prisma.caja.update({
      where: { id },
      data: {
        saldo_actual: {
          decrement: monto_retiro,
        },
        fecha_actualizacion: new Date(),
      },
      include: {
        tickets: true,
      },
    });

    return this.mapearPrismaACaja(cajaPrisma);
  }

  /**
   * Suspende una caja temporalmente
   * @param id - ID de la caja
   * @returns La caja actualizada
   */
  async suspenderCaja(id: string): Promise<Caja> {
    const cajaPrisma = await this.prisma.caja.update({
      where: { id },
      data: {
        estado: EstadoCaja.SUSPENDIDA,
        fecha_actualizacion: new Date(),
      },
      include: {
        tickets: true,
      },
    });

    return this.mapearPrismaACaja(cajaPrisma);
  }

  /**
   * Reanuda una caja suspendida
   * @param id - ID de la caja
   * @returns La caja actualizada
   */
  async reanudarCaja(id: string): Promise<Caja> {
    const cajaPrisma = await this.prisma.caja.update({
      where: { id },
      data: {
        estado: EstadoCaja.ABIERTA,
        fecha_actualizacion: new Date(),
      },
      include: {
        tickets: true,
      },
    });

    return this.mapearPrismaACaja(cajaPrisma);
  }

  /**
   * Obtiene estadísticas de cajas por sucursal
   * @param sucursal_id - ID de la sucursal
   * @returns Estadísticas de las cajas
   */
  async obtenerEstadisticasPorSucursal(sucursal_id: string): Promise<any> {
    const cajas = await this.prisma.caja.findMany({
      where: { sucursal_id },
      include: {
        tickets: true,
      },
    });

    const total_cajas = cajas.length;
    const cajas_abiertas = cajas.filter(c => c.estado === EstadoCaja.ABIERTA).length;
    const cajas_cerradas = cajas.filter(c => c.estado === EstadoCaja.CERRADA).length;
    const cajas_suspendidas = cajas.filter(c => c.estado === EstadoCaja.SUSPENDIDA).length;

    // Calcular total de ventas del día (solo cajas abiertas hoy)
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    const cajasHoy = cajas.filter(c => 
      c.fecha_apertura && new Date(c.fecha_apertura) >= hoy
    );

    const total_ventas_dia = cajasHoy.reduce((total, caja) => {
      return total + (caja.saldo_actual - caja.saldo_inicial);
    }, 0);

    const promedio_ventas_por_caja = cajas_abiertas > 0 ? total_ventas_dia / cajas_abiertas : 0;

    // Calcular diferencia total (en una implementación real, esto vendría de los tickets)
    const diferencia_total = cajas.reduce((total, caja) => {
      // Simulación de cálculo de diferencia
      const diferenciaCaja = caja.tickets?.reduce((diff, ticket) => {
        return diff + (ticket.monto_total - ticket.monto_pagado);
      }, 0) || 0;
      
      return total + diferenciaCaja;
    }, 0);

    return {
      total_cajas,
      cajas_abiertas,
      cajas_cerradas,
      cajas_suspendidas,
      total_ventas_dia,
      promedio_ventas_por_caja,
      diferencia_total,
    };
  }

  /**
   * Obtiene el reporte de cierre de caja
   * @param caja_id - ID de la caja
   * @returns Reporte de cierre
   */
  async obtenerReporteCierre(caja_id: string): Promise<any> {
    const caja = await this.prisma.caja.findUnique({
      where: { id: caja_id },
      include: {
        tickets: {
          where: {
            fecha_creacion: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
            },
          },
        },
      },
    });

    if (!caja) {
      throw new Error('Caja no encontrada');
    }

    const total_ventas = caja.tickets.reduce((total, ticket) => {
      return total + ticket.monto_total;
    }, 0);

    const total_efectivo = caja.tickets.reduce((total, ticket) => {
      return total + (ticket.metodo_pago === 'EFECTIVO' ? ticket.monto_pagado : 0);
    }, 0);

    const total_tarjeta = caja.tickets.reduce((total, ticket) => {
      return total + (ticket.metodo_pago === 'TARJETA' ? ticket.monto_pagado : 0);
    }, 0);

    const total_otros = caja.tickets.reduce((total, ticket) => {
      return total + (ticket.metodo_pago !== 'EFECTIVO' && ticket.metodo_pago !== 'TARJETA' ? ticket.monto_pagado : 0);
    }, 0);

    const saldo_teorico = caja.saldo_inicial + total_efectivo;
    const diferencia = caja.saldo_actual - saldo_teorico;

    return {
      caja_id: caja.id,
      caja_nombre: caja.nombre,
      fecha_apertura: caja.fecha_apertura,
      fecha_cierre: new Date(),
      saldo_inicial: caja.saldo_inicial,
      saldo_final: caja.saldo_actual,
      total_ventas,
      total_efectivo,
      total_tarjeta,
      total_otros,
      saldo_teorico,
      diferencia,
      cantidad_tickets: caja.tickets.length,
      estado: caja.estado,
    };
  }

  /**
   * Obtiene el historial de operaciones de una caja
   * @param caja_id - ID de la caja
   * @param fecha_desde - Fecha desde
   * @param fecha_hasta - Fecha hasta
   * @returns Historial de operaciones
   */
  async obtenerHistorialOperaciones(caja_id: string, fecha_desde?: Date, fecha_hasta?: Date): Promise<any[]> {
    const where: any = {
      caja_id,
    };

    if (fecha_desde || fecha_hasta) {
      where.fecha_creacion = {};
      
      if (fecha_desde) {
        where.fecha_creacion.gte = fecha_desde;
      }
      
      if (fecha_hasta) {
        where.fecha_creacion.lte = fecha_hasta;
      }
    }

    const tickets = await this.prisma.ticket.findMany({
      where,
      orderBy: {
        fecha_creacion: 'desc',
      },
    });

    // Mapear tickets a operaciones
    const operaciones = tickets.map(ticket => ({
      tipo: 'VENTA',
      monto: ticket.monto_total,
      fecha: ticket.fecha_creacion,
      descripcion: `Venta #${ticket.numero_ticket}`,
      metodo_pago: ticket.metodo_pago,
      ticket_id: ticket.id,
    }));

    // En una implementación real, aquí se agregarían también los retiros
    // Por ahora solo retornamos las ventas

    return operaciones;
  }

  /**
   * Verifica si una sucursal tiene cajas activas
   * @param sucursal_id - ID de la sucursal
   * @returns true si la sucursal tiene cajas activas
   */
  async existeCajaActivaEnSucursal(sucursal_id: string): Promise<boolean> {
    const cajaActiva = await this.prisma.caja.findFirst({
      where: {
        sucursal_id,
        estado: {
          in: [EstadoCaja.ABIERTA, EstadoCaja.SUSPENDIDA],
        },
      },
    });

    return !!cajaActiva;
  }

  /**
   * Cuenta el número de cajas en una sucursal
   * @param sucursal_id - ID de la sucursal
   * @returns Número de cajas en la sucursal
   */
  async contarCajasPorSucursal(sucursal_id: string): Promise<number> {
    return await this.prisma.caja.count({
      where: { sucursal_id },
    });
  }

  /**
   * Busca cajas por estado
   * @param estado - Estado de la caja
   * @returns Lista de cajas con el estado especificado
   */
  async buscarPorEstado(estado: EstadoCaja): Promise<Caja[]> {
    const cajasPrisma = await this.prisma.caja.findMany({
      where: { estado },
      include: {
        tickets: true,
      },
      orderBy: {
        fecha_creacion: 'desc',
      },
    });

    return cajasPrisma.map(cajaPrisma => this.mapearPrismaACaja(cajaPrisma));
  }

  /**
   * Actualiza una caja existente
   * @param caja - Entidad de caja con datos actualizados
   * @returns La caja actualizada
   */
  async actualizar(caja: Caja): Promise<Caja> {
    const cajaPrisma = await this.prisma.caja.update({
      where: { id: caja.id },
      data: {
        sucursal_id: caja.sucursal_id,
        nombre: caja.nombre,
        estado: caja.estado,
        saldo_inicial: caja.saldo_inicial,
        saldo_actual: caja.saldo_actual,
        fecha_apertura: caja.fecha_apertura,
        fecha_cierre: caja.fecha_cierre,
        usuario_apertura_id: caja.usuario_apertura_id,
        usuario_cierre_id: caja.usuario_cierre_id,
        fecha_actualizacion: new Date(),
      },
      include: {
        tickets: true,
      },
    });

    return this.mapearPrismaACaja(cajaPrisma);
  }

  /**
   * Elimina una caja por su ID
   * @param id - ID de la caja a eliminar
   */
  async eliminar(id: string): Promise<void> {
    await this.prisma.caja.delete({
      where: { id },
    });
  }

  /**
   * Verifica si existe una caja con el mismo nombre en la misma sucursal
   * @param nombre - Nombre de la caja
   * @param sucursal_id - ID de la sucursal
   * @returns true si existe una caja con el mismo nombre en la sucursal
   */
  async existeConNombre(nombre: string, sucursal_id: string): Promise<boolean> {
    const cajaExistente = await this.prisma.caja.findFirst({
      where: {
        nombre,
        sucursal_id,
      },
    });

    return !!cajaExistente;
  }

  /**
   * Mapea un objeto Prisma a una entidad Caja del dominio
   * @param cajaPrisma - Objeto Prisma de caja
   * @returns Entidad Caja del dominio
   */
  private mapearPrismaACaja(cajaPrisma: any): Caja {
    return new Caja(
      cajaPrisma.id,
      cajaPrisma.sucursal_id,
      cajaPrisma.nombre,
      cajaPrisma.estado as EstadoCaja,
      cajaPrisma.saldo_inicial,
      cajaPrisma.saldo_actual,
      cajaPrisma.fecha_apertura,
      cajaPrisma.fecha_cierre,
      cajaPrisma.usuario_apertura_id,
      cajaPrisma.usuario_cierre_id,
      cajaPrisma.fecha_creacion,
      cajaPrisma.fecha_actualizacion,
      cajaPrisma.tickets || []
    );
  }
}