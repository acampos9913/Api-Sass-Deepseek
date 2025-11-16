import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Plan, SuscripcionPlan, HistorialPlan, PagoPlan, PlanMapper } from '../../dominio/entidades/plan.entity';
import { RepositorioPlan } from '../../dominio/interfaces/repositorio-plan.interface';

/**
 * Repositorio de Planes implementado con Prisma
 * Gestiona la persistencia de planes, suscripciones, historial y pagos
 */
@Injectable()
export class PrismaRepositorioPlan implements RepositorioPlan {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Obtiene un plan por su ID
   */
  async obtenerPlanPorId(id: string): Promise<Plan | null> {
    const planPrisma = await this.prisma.plan.findUnique({
      where: { id },
    });

    if (!planPrisma) {
      return null;
    }

    return PlanMapper.toDomain(planPrisma);
  }

  /**
   * Obtiene un plan por su código único
   */
  async obtenerPlanPorCodigo(codigo: string): Promise<Plan | null> {
    const planPrisma = await this.prisma.plan.findUnique({
      where: { codigo },
    });

    if (!planPrisma) {
      return null;
    }

    return PlanMapper.toDomain(planPrisma);
  }

  /**
   * Obtiene todos los planes activos
   */
  async obtenerPlanesActivos(): Promise<Plan[]> {
    const planesPrisma = await this.prisma.plan.findMany({
      where: { estado: 'ACTIVO' },
      orderBy: { precio_mensual: 'asc' },
    });

    return planesPrisma.map(plan => PlanMapper.toDomain(plan));
  }

  /**
   * Crea un nuevo plan
   */
  async crearPlan(plan: Plan): Promise<Plan> {
    const planPrisma = await this.prisma.plan.create({
      data: PlanMapper.toPersistence(plan),
    });

    return PlanMapper.toDomain(planPrisma);
  }

  /**
   * Actualiza un plan existente
   */
  async actualizarPlan(id: string, plan: Partial<Plan>): Promise<Plan> {
    const planPrisma = await this.prisma.plan.update({
      where: { id },
      data: PlanMapper.toPersistence(plan as Plan),
    });

    return PlanMapper.toDomain(planPrisma);
  }

  /**
   * Obtiene la suscripción activa de una tienda
   */
  async obtenerSuscripcionPorTiendaId(tiendaId: string): Promise<SuscripcionPlan | null> {
    const suscripcionPrisma = await this.prisma.suscripcionPlan.findUnique({
      where: { tienda_id: tiendaId },
      include: {
        plan: true,
        historial_pagos: {
          orderBy: { fecha_pago: 'desc' },
          take: 1,
        },
      },
    });

    if (!suscripcionPrisma) {
      return null;
    }

    return this.mapSuscripcionPrismaADominio(suscripcionPrisma);
  }

  /**
   * Crea una nueva suscripción de plan
   */
  async crearSuscripcion(suscripcion: SuscripcionPlan): Promise<SuscripcionPlan> {
    const suscripcionPrisma = await this.prisma.suscripcionPlan.create({
      data: {
        id: suscripcion.id,
        tienda_id: suscripcion.tiendaId,
        plan_id: suscripcion.planId,
        estado: suscripcion.estado,
        ciclo_facturacion: suscripcion.cicloFacturacion,
        fecha_inicio: suscripcion.fechaInicio,
        fecha_renovacion: suscripcion.fechaRenovacion,
        fecha_cancelacion: suscripcion.fechaCancelacion,
        metodo_pago_id: suscripcion.metodoPagoId,
        metodo_pago_tipo: suscripcion.metodoPagoTipo,
        ultimo_pago_fecha: suscripcion.ultimoPagoFecha,
        proximo_pago_fecha: suscripcion.proximoPagoFecha,
        total_pagado: suscripcion.totalPagado,
        datos_facturacion: suscripcion.datosFacturacion,
        fecha_creacion: suscripcion.fechaCreacion,
        fecha_actualizacion: suscripcion.fechaActualizacion,
      },
      include: {
        plan: true,
      },
    });

    return this.mapSuscripcionPrismaADominio(suscripcionPrisma);
  }

  /**
   * Actualiza una suscripción existente
   */
  async actualizarSuscripcion(id: string, suscripcion: Partial<SuscripcionPlan>): Promise<SuscripcionPlan> {
    const suscripcionPrisma = await this.prisma.suscripcionPlan.update({
      where: { id },
      data: {
        ...suscripcion,
        fecha_actualizacion: new Date(),
      },
      include: {
        plan: true,
      },
    });

    return this.mapSuscripcionPrismaADominio(suscripcionPrisma);
  }

  /**
   * Cancela una suscripción
   */
  async cancelarSuscripcion(id: string, fechaCancelacion: Date): Promise<SuscripcionPlan> {
    const suscripcionPrisma = await this.prisma.suscripcionPlan.update({
      where: { id },
      data: {
        estado: 'CANCELADA',
        fecha_cancelacion: fechaCancelacion,
        fecha_actualizacion: new Date(),
      },
      include: {
        plan: true,
      },
    });

    return this.mapSuscripcionPrismaADominio(suscripcionPrisma);
  }

  /**
   * Obtiene el historial de cambios de plan de una suscripción
   */
  async obtenerHistorialPorSuscripcionId(suscripcionId: string): Promise<HistorialPlan[]> {
    const historialPrisma = await this.prisma.historialPlan.findMany({
      where: { suscripcion_id: suscripcionId },
      include: {
        plan_anterior: true,
        plan_nuevo: true,
        usuario: true,
      },
      orderBy: { fecha_cambio: 'desc' },
    });

    return historialPrisma.map(item => ({
      id: item.id,
      suscripcionId: item.suscripcion_id,
      planAnteriorId: item.plan_anterior_id || undefined,
      planNuevoId: item.plan_nuevo_id,
      fechaCambio: item.fecha_cambio,
      motivo: item.motivo || undefined,
      datosCambio: item.datos_cambio as any,
      usuarioId: item.usuario_id || undefined,
    }));
  }

  /**
   * Registra un cambio de plan en el historial
   */
  async registrarCambioPlan(historial: HistorialPlan): Promise<HistorialPlan> {
    const historialPrisma = await this.prisma.historialPlan.create({
      data: {
        id: historial.id,
        suscripcion_id: historial.suscripcionId,
        plan_anterior_id: historial.planAnteriorId,
        plan_nuevo_id: historial.planNuevoId,
        fecha_cambio: historial.fechaCambio,
        motivo: historial.motivo,
        datos_cambio: historial.datosCambio,
        usuario_id: historial.usuarioId,
      },
    });

    return {
      id: historialPrisma.id,
      suscripcionId: historialPrisma.suscripcion_id,
      planAnteriorId: historialPrisma.plan_anterior_id || undefined,
      planNuevoId: historialPrisma.plan_nuevo_id,
      fechaCambio: historialPrisma.fecha_cambio,
      motivo: historialPrisma.motivo || undefined,
      datosCambio: historialPrisma.datos_cambio as any,
      usuarioId: historialPrisma.usuario_id || undefined,
    };
  }

  /**
   * Registra un pago de plan
   */
  async registrarPago(pago: PagoPlan): Promise<PagoPlan> {
    const pagoPrisma = await this.prisma.pagoPlan.create({
      data: {
        id: pago.id,
        suscripcion_id: pago.suscripcionId,
        monto: pago.monto,
        moneda: pago.moneda,
        estado: pago.estado,
        fecha_pago: pago.fechaPago,
        fecha_vencimiento: pago.fechaVencimiento,
        referencia_pago: pago.referenciaPago,
        metodo_pago: pago.metodoPago,
        datos_pago: pago.datosPago,
        fecha_creacion: pago.fechaCreacion,
        fecha_actualizacion: pago.fechaActualizacion,
      },
    });

    return {
      id: pagoPrisma.id,
      suscripcionId: pagoPrisma.suscripcion_id,
      monto: Number(pagoPrisma.monto),
      moneda: pagoPrisma.moneda,
      estado: pagoPrisma.estado as any,
      fechaPago: pagoPrisma.fecha_pago,
      fechaVencimiento: pagoPrisma.fecha_vencimiento || undefined,
      referenciaPago: pagoPrisma.referencia_pago || undefined,
      metodoPago: pagoPrisma.metodo_pago || undefined,
      datosPago: pagoPrisma.datos_pago as any,
      fechaCreacion: pagoPrisma.fecha_creacion,
      fechaActualizacion: pagoPrisma.fecha_actualizacion,
    };
  }

  /**
   * Verifica si hay pagos pendientes para una suscripción
   */
  async verificarPagosPendientes(suscripcionId: string): Promise<boolean> {
    const pagosPendientes = await this.prisma.pagoPlan.count({
      where: {
        suscripcion_id: suscripcionId,
        estado: 'PENDIENTE',
        fecha_vencimiento: {
          gte: new Date(),
        },
      },
    });

    return pagosPendientes > 0;
  }

  /**
   * Obtiene los pagos pendientes de una suscripción
   */
  async obtenerPagosPendientes(suscripcionId: string): Promise<PagoPlan[]> {
    const pagosPrisma = await this.prisma.pagoPlan.findMany({
      where: {
        suscripcion_id: suscripcionId,
        estado: 'PENDIENTE',
        fecha_vencimiento: {
          gte: new Date(),
        },
      },
      orderBy: { fecha_vencimiento: 'asc' },
    });

    return pagosPrisma.map(pago => ({
      id: pago.id,
      suscripcionId: pago.suscripcion_id,
      monto: Number(pago.monto),
      moneda: pago.moneda,
      estado: pago.estado as any,
      fechaPago: pago.fecha_pago,
      fechaVencimiento: pago.fecha_vencimiento || undefined,
      referenciaPago: pago.referencia_pago || undefined,
      metodoPago: pago.metodo_pago || undefined,
      datosPago: pago.datos_pago as any,
      fechaCreacion: pago.fecha_creacion,
      fechaActualizacion: pago.fecha_actualizacion,
    }));
  }

  /**
   * Mapea una suscripción Prisma a entidad de dominio
   */
  private mapSuscripcionPrismaADominio(suscripcionPrisma: any): SuscripcionPlan {
    return {
      id: suscripcionPrisma.id,
      tiendaId: suscripcionPrisma.tienda_id,
      planId: suscripcionPrisma.plan_id,
      estado: suscripcionPrisma.estado,
      cicloFacturacion: suscripcionPrisma.ciclo_facturacion,
      fechaInicio: suscripcionPrisma.fecha_inicio,
      fechaRenovacion: suscripcionPrisma.fecha_renovacion,
      fechaCancelacion: suscripcionPrisma.fecha_cancelacion || undefined,
      metodoPagoId: suscripcionPrisma.metodo_pago_id || undefined,
      metodoPagoTipo: suscripcionPrisma.metodo_pago_tipo || undefined,
      ultimoPagoFecha: suscripcionPrisma.ultimo_pago_fecha || undefined,
      proximoPagoFecha: suscripcionPrisma.proximo_pago_fecha || undefined,
      totalPagado: Number(suscripcionPrisma.total_pagado),
      datosFacturacion: suscripcionPrisma.datos_facturacion as any,
      fechaCreacion: suscripcionPrisma.fecha_creacion,
      fechaActualizacion: suscripcionPrisma.fecha_actualizacion,
    };
  }
}