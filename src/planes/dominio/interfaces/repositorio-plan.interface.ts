import { Plan, SuscripcionPlan, HistorialPlan, PagoPlan } from '../entidades/plan.entity';

/**
 * Interfaz para el repositorio de planes
 * Define las operaciones de persistencia para planes, suscripciones, historial y pagos
 */
export interface RepositorioPlan {
  // Operaciones para Planes
  obtenerPlanPorId(id: string): Promise<Plan | null>;
  obtenerPlanPorCodigo(codigo: string): Promise<Plan | null>;
  obtenerPlanesActivos(): Promise<Plan[]>;
  crearPlan(plan: Plan): Promise<Plan>;
  actualizarPlan(id: string, plan: Partial<Plan>): Promise<Plan>;

  // Operaciones para Suscripciones
  obtenerSuscripcionPorTiendaId(tiendaId: string): Promise<SuscripcionPlan | null>;
  crearSuscripcion(suscripcion: SuscripcionPlan): Promise<SuscripcionPlan>;
  actualizarSuscripcion(id: string, suscripcion: Partial<SuscripcionPlan>): Promise<SuscripcionPlan>;
  cancelarSuscripcion(id: string, fechaCancelacion: Date): Promise<SuscripcionPlan>;

  // Operaciones para Historial de Planes
  obtenerHistorialPorSuscripcionId(suscripcionId: string): Promise<HistorialPlan[]>;
  registrarCambioPlan(historial: HistorialPlan): Promise<HistorialPlan>;

  // Operaciones para Pagos
  registrarPago(pago: PagoPlan): Promise<PagoPlan>;
  verificarPagosPendientes(suscripcionId: string): Promise<boolean>;
  obtenerPagosPendientes(suscripcionId: string): Promise<PagoPlan[]>;
}