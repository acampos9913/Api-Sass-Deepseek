import { Inject, Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import type { RepositorioPlan } from '../../dominio/interfaces/repositorio-plan.interface';
import { Plan, SuscripcionPlan, HistorialPlan, PagoPlan, EstadoPlan, EstadoSuscripcion, CicloFacturacion, EstadoPagoPlan } from '../../dominio/entidades/plan.entity';
import {
  CambiarPlanDto,
  CancelarPlanDto,
  CrearPlanDto,
  ActualizarPlanDto,
  PlanActualRespuestaDto,
  HistorialPlanesRespuestaDto,
  ValidacionPagosPendientesRespuestaDto
} from '../dto/plan.dto';

/**
 * Casos de Uso para la gestión de planes
 * Contiene la lógica de negocio para operaciones relacionadas con planes
 */
@Injectable()
export class CasosUsoPlan {
  constructor(
    @Inject('REPOSITORIO_PLAN') private readonly repositorioPlan: RepositorioPlan
  ) {}

  /**
   * Obtiene la información completa del plan actual de una tienda
   */
  async obtenerPlanActual(tiendaId: string): Promise<PlanActualRespuestaDto> {
    const suscripcion = await this.repositorioPlan.obtenerSuscripcionPorTiendaId(tiendaId);
    
    if (!suscripcion) {
      throw new NotFoundException('No se encontró una suscripción activa para esta tienda');
    }

    const plan = await this.repositorioPlan.obtenerPlanPorId(suscripcion.planId);
    if (!plan) {
      throw new NotFoundException('El plan asociado a esta suscripción no existe');
    }

    const historialCambios = await this.repositorioPlan.obtenerHistorialPorSuscripcionId(suscripcion.id);
    const pagosPendientes = await this.repositorioPlan.verificarPagosPendientes(suscripcion.id);

    // Extraer beneficios del plan
    const beneficios = this.extraerBeneficiosDelPlan(plan);

    return {
      plan: {
        ...plan,
        suscripcion: {
          estado: suscripcion.estado,
          cicloFacturacion: suscripcion.cicloFacturacion,
          fechaInicio: suscripcion.fechaInicio,
          fechaRenovacion: suscripcion.fechaRenovacion,
          fechaCancelacion: suscripcion.fechaCancelacion,
          totalPagado: suscripcion.totalPagado,
        }
      },
      estadoFacturacion: this.determinarEstadoFacturacion(suscripcion, pagosPendientes),
      fechaRenovacion: suscripcion.fechaRenovacion,
      metodoPago: suscripcion.metodoPagoTipo || 'No configurado',
      beneficios,
      historialCambios: historialCambios.slice(0, 5), // Últimos 5 cambios
    };
  }

  /**
   * Cambia el plan de una tienda
   */
  async cambiarPlan(tiendaId: string, datosCambio: CambiarPlanDto, usuarioId?: string): Promise<SuscripcionPlan> {
    // Validar fecha de renovación
    const fechaRenovacion = new Date(datosCambio.fechaRenovacion);
    if (fechaRenovacion < new Date()) {
      throw new BadRequestException('La fecha de renovación debe ser igual o mayor a la fecha actual');
    }

    // Obtener suscripción actual
    const suscripcionActual = await this.repositorioPlan.obtenerSuscripcionPorTiendaId(tiendaId);
    if (!suscripcionActual) {
      throw new NotFoundException('No se encontró una suscripción activa para esta tienda');
    }

    // Obtener el nuevo plan por tipo
    const nuevoPlan = await this.obtenerPlanPorTipo(datosCambio.tipoPlan);
    if (!nuevoPlan) {
      throw new NotFoundException(`El plan "${datosCambio.tipoPlan}" no existe`);
    }

    // Validar que no sea el mismo plan
    if (suscripcionActual.planId === nuevoPlan.id) {
      throw new BadRequestException('Ya tienes este plan activo');
    }

    // Registrar el cambio en el historial
    await this.repositorioPlan.registrarCambioPlan({
      id: this.generarIdUnico(),
      suscripcionId: suscripcionActual.id,
      planAnteriorId: suscripcionActual.planId,
      planNuevoId: nuevoPlan.id,
      fechaCambio: new Date(),
      motivo: 'Cambio de plan solicitado por el usuario',
      datosCambio: {
        precioAnterior: this.calcularPrecioPlan(suscripcionActual, await this.repositorioPlan.obtenerPlanPorId(suscripcionActual.planId)),
        precioNuevo: this.calcularPrecioPlan({ ...suscripcionActual, cicloFacturacion: this.determinarCicloFacturacion(datosCambio.fechaRenovacion) }, nuevoPlan),
        cicloFacturacionAnterior: suscripcionActual.cicloFacturacion,
        cicloFacturacionNuevo: this.determinarCicloFacturacion(datosCambio.fechaRenovacion),
        metodoPagoNuevo: datosCambio.metodoPagoAsociado,
      },
      usuarioId,
    });

    // Actualizar la suscripción
    const suscripcionActualizada = await this.repositorioPlan.actualizarSuscripcion(suscripcionActual.id, {
      planId: nuevoPlan.id,
      fechaRenovacion,
      metodoPagoId: datosCambio.metodoPagoAsociado,
      metodoPagoTipo: 'stripe', // Asumimos Stripe por ahora
      estado: EstadoSuscripcion.ACTIVA,
    });

    return suscripcionActualizada;
  }

  /**
   * Cancela el plan de una tienda
   */
  async cancelarPlan(tiendaId: string, datosCancelacion: CancelarPlanDto): Promise<SuscripcionPlan> {
    // Validar confirmaciones
    if (!datosCancelacion.confirmarCancelacion || !datosCancelacion.condicionesCancelacionAceptadas) {
      throw new BadRequestException('Debe confirmar la cancelación y aceptar las condiciones');
    }

    // Obtener suscripción actual
    const suscripcion = await this.repositorioPlan.obtenerSuscripcionPorTiendaId(tiendaId);
    if (!suscripcion) {
      throw new NotFoundException('No se encontró una suscripción activa para esta tienda');
    }

    // Validar que no haya pagos pendientes
    const hayPagosPendientes = await this.repositorioPlan.verificarPagosPendientes(suscripcion.id);
    if (hayPagosPendientes) {
      throw new ConflictException('No se puede cancelar el plan mientras tenga pagos pendientes');
    }

    // Cancelar la suscripción
    const suscripcionCancelada = await this.repositorioPlan.cancelarSuscripcion(suscripcion.id, new Date());

    return suscripcionCancelada;
  }

  /**
   * Obtiene el historial de planes de una tienda
   */
  async obtenerHistorialPlanes(tiendaId: string, pagina: number = 1, limite: number = 10): Promise<HistorialPlanesRespuestaDto> {
    const suscripcion = await this.repositorioPlan.obtenerSuscripcionPorTiendaId(tiendaId);
    
    if (!suscripcion) {
      throw new NotFoundException('No se encontró una suscripción para esta tienda');
    }

    const historialCompleto = await this.repositorioPlan.obtenerHistorialPorSuscripcionId(suscripcion.id);
    
    // Aplicar paginación
    const inicio = (pagina - 1) * limite;
    const fin = inicio + limite;
    const cambiosPaginados = historialCompleto.slice(inicio, fin);

    return {
      elementos: cambiosPaginados,
      paginacion: {
        total_elementos: historialCompleto.length,
        total_paginas: Math.ceil(historialCompleto.length / limite),
        pagina_actual: pagina,
        limite,
      },
    };
  }

  /**
   * Valida si hay pagos pendientes para una suscripción
   */
  async validarPagosPendientes(suscripcionId: string): Promise<ValidacionPagosPendientesRespuestaDto> {
    const pagosPendientes = await this.repositorioPlan.obtenerPagosPendientes(suscripcionId);
    const hayPagosPendientes = pagosPendientes.length > 0;

    if (!hayPagosPendientes) {
      return {
        hayPagosPendientes: false,
      };
    }

    const montoPendiente = pagosPendientes.reduce((total, pago) => total + pago.monto, 0);
    const fechaVencimiento = pagosPendientes[0].fechaVencimiento;

    return {
      hayPagosPendientes: true,
      montoPendiente,
      fechaVencimiento: fechaVencimiento?.toISOString(),
      advertencia: `Tiene ${pagosPendientes.length} pago(s) pendiente(s) por un total de $${montoPendiente.toFixed(2)} que debe(n) procesarse antes de cancelar`,
    };
  }

  /**
   * Crea un nuevo plan
   */
  async crearPlan(datosPlan: CrearPlanDto): Promise<Plan> {
    // Verificar si ya existe un plan con el mismo código
    const planExistente = await this.repositorioPlan.obtenerPlanPorCodigo(datosPlan.codigo);
    if (planExistente) {
      throw new ConflictException('Ya existe un plan con este código');
    }

    const plan: Plan = {
      id: this.generarIdUnico(),
      nombre: datosPlan.nombre,
      codigo: datosPlan.codigo,
      descripcion: datosPlan.descripcion,
      precioMensual: datosPlan.precioMensual,
      precioAnual: datosPlan.precioAnual,
      moneda: datosPlan.moneda,
      estado: EstadoPlan.ACTIVO,
      caracteristicas: datosPlan.caracteristicas as any,
      limites: datosPlan.limites as any,
      fechaCreacion: new Date(),
      fechaActualizacion: new Date(),
    };

    return await this.repositorioPlan.crearPlan(plan);
  }

  /**
   * Actualiza un plan existente
   */
  async actualizarPlan(id: string, datosPlan: ActualizarPlanDto): Promise<Plan> {
    const planExistente = await this.repositorioPlan.obtenerPlanPorId(id);
    if (!planExistente) {
      throw new NotFoundException('Plan no encontrado');
    }

    // Crear objeto de actualización con casting explícito
    const datosActualizacion: Partial<Plan> = {
      fechaActualizacion: new Date(),
    };

    // Asignar propiedades opcionales solo si están presentes
    if (datosPlan.nombre) datosActualizacion.nombre = datosPlan.nombre;
    if (datosPlan.descripcion) datosActualizacion.descripcion = datosPlan.descripcion;
    if (datosPlan.precioMensual) datosActualizacion.precioMensual = datosPlan.precioMensual;
    if (datosPlan.precioAnual) datosActualizacion.precioAnual = datosPlan.precioAnual;
    if (datosPlan.moneda) datosActualizacion.moneda = datosPlan.moneda;
    if (datosPlan.estado) datosActualizacion.estado = datosPlan.estado as EstadoPlan;
    if (datosPlan.caracteristicas) datosActualizacion.caracteristicas = datosPlan.caracteristicas as any;
    if (datosPlan.limites) datosActualizacion.limites = datosPlan.limites as any;

    return await this.repositorioPlan.actualizarPlan(id, datosActualizacion);
  }

  /**
   * Obtiene todos los planes activos
   */
  async obtenerPlanesActivos(): Promise<Plan[]> {
    return await this.repositorioPlan.obtenerPlanesActivos();
  }

  // Métodos auxiliares privados

  private async obtenerPlanPorTipo(tipoPlan: string): Promise<Plan | null> {
    // Mapear nombres de plan a códigos (esto podría venir de una configuración)
    const mapeoPlanes: { [key: string]: string } = {
      'Básico': 'basico',
      'Shopify': 'shopify',
      'Avanzado': 'avanzado',
      'Empresarial': 'empresarial',
    };

    const codigoPlan = mapeoPlanes[tipoPlan];
    if (!codigoPlan) {
      return null;
    }

    return await this.repositorioPlan.obtenerPlanPorCodigo(codigoPlan);
  }

  private extraerBeneficiosDelPlan(plan: Plan): string[] {
    const beneficios: string[] = [];
    const { caracteristicas, limites } = plan;

    if (limites.productos > 0) {
      beneficios.push(`${limites.productos} productos máximos`);
    }

    if (limites.ordenesMensuales > 0) {
      beneficios.push(`${limites.ordenesMensuales} órdenes mensuales`);
    }

    if (limites.almacenamiento > 0) {
      beneficios.push(`${limites.almacenamiento}GB de almacenamiento`);
    }

    if (limites.usuarios > 0) {
      beneficios.push(`${limites.usuarios} usuarios`);
    }

    if (caracteristicas.soportePrioritario) {
      beneficios.push('Soporte prioritario');
    }

    if (caracteristicas.reportesAvanzados) {
      beneficios.push('Reportes avanzados');
    }

    if (caracteristicas.integracionesApi) {
      beneficios.push('Integraciones API');
    }

    if (caracteristicas.personalizacionTema) {
      beneficios.push('Personalización de tema');
    }

    if (caracteristicas.dominioPersonalizado) {
      beneficios.push('Dominio personalizado');
    }

    if (caracteristicas.eliminacionMarcaAgua) {
      beneficios.push('Sin marca de agua');
    }

    if (caracteristicas.accesoApi) {
      beneficios.push('Acceso a API');
    }

    return beneficios;
  }

  private determinarEstadoFacturacion(suscripcion: SuscripcionPlan, hayPagosPendientes: boolean): string {
    if (hayPagosPendientes) {
      return 'PENDIENTE_PAGO';
    }

    if (suscripcion.estado === EstadoSuscripcion.CANCELADA) {
      return 'CANCELADA';
    }

    if (suscripcion.estado === EstadoSuscripcion.SUSPENDIDA) {
      return 'SUSPENDIDA';
    }

    if (suscripcion.estado === EstadoSuscripcion.EXPIRADA) {
      return 'EXPIRADA';
    }

    return 'ACTIVA';
  }

  private calcularPrecioPlan(suscripcion: SuscripcionPlan, plan: Plan | null): number {
    if (!plan) return 0;

    switch (suscripcion.cicloFacturacion) {
      case CicloFacturacion.ANUAL:
        return plan.precioAnual || plan.precioMensual * 12;
      case CicloFacturacion.SEMESTRAL:
        return plan.precioMensual * 6;
      case CicloFacturacion.TRIMESTRAL:
        return plan.precioMensual * 3;
      default: // MENSUAL
        return plan.precioMensual;
    }
  }

  private determinarCicloFacturacion(fechaRenovacion: string): CicloFacturacion {
    const fecha = new Date(fechaRenovacion);
    const hoy = new Date();
    const diferenciaMeses = (fecha.getFullYear() - hoy.getFullYear()) * 12 + (fecha.getMonth() - hoy.getMonth());

    if (diferenciaMeses >= 12) return CicloFacturacion.ANUAL;
    if (diferenciaMeses >= 6) return CicloFacturacion.SEMESTRAL;
    if (diferenciaMeses >= 3) return CicloFacturacion.TRIMESTRAL;
    return CicloFacturacion.MENSUAL;
  }

  private generarIdUnico(): string {
    return `plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}