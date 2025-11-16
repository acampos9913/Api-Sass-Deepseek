// Importación temporal - se ajustará cuando se genere el cliente Prisma
// import { Plan as PlanPrisma } from '@prisma/client';

/**
 * Entidad de Dominio para Planes de Suscripción
 * Representa un plan de suscripción disponible para las tiendas
 */
export interface Plan {
  id: string;
  nombre: string;
  codigo: string;
  descripcion?: string;
  precioMensual: number;
  precioAnual?: number;
  moneda: string;
  estado: EstadoPlan;
  caracteristicas: CaracteristicasPlan;
  limites: LimitesPlan;
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

/**
 * Características del plan en formato estructurado
 */
export interface CaracteristicasPlan {
  productosMaximos: number;
  ordenesMaximasMensuales: number;
  almacenamientoGb: number;
  soportePrioritario: boolean;
  reportesAvanzados: boolean;
  integracionesApi: boolean;
  personalizacionTema: boolean;
  dominioPersonalizado: boolean;
  eliminacionMarcaAgua: boolean;
  accesoApi: boolean;
  [key: string]: any;
}

/**
 * Límites del plan en formato estructurado
 */
export interface LimitesPlan {
  productos: number;
  ordenesMensuales: number;
  almacenamiento: number;
  usuarios: number;
  integraciones: number;
  [key: string]: number;
}

/**
 * Estados posibles de un plan
 */
export enum EstadoPlan {
  ACTIVO = 'ACTIVO',
  INACTIVO = 'INACTIVO',
  ARCHIVADO = 'ARCHIVADO'
}

/**
 * Entidad de Dominio para Suscripción de Plan
 * Representa la suscripción activa de una tienda a un plan
 */
export interface SuscripcionPlan {
  id: string;
  tiendaId: string;
  planId: string;
  estado: EstadoSuscripcion;
  cicloFacturacion: CicloFacturacion;
  fechaInicio: Date;
  fechaRenovacion: Date;
  fechaCancelacion?: Date;
  metodoPagoId?: string;
  metodoPagoTipo?: string;
  ultimoPagoFecha?: Date;
  proximoPagoFecha?: Date;
  totalPagado: number;
  datosFacturacion?: DatosFacturacion;
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

/**
 * Estados posibles de una suscripción
 */
export enum EstadoSuscripcion {
  ACTIVA = 'ACTIVA',
  PENDIENTE = 'PENDIENTE',
  CANCELADA = 'CANCELADA',
  SUSPENDIDA = 'SUSPENDIDA',
  EXPIRADA = 'EXPIRADA'
}

/**
 * Ciclos de facturación disponibles
 */
export enum CicloFacturacion {
  MENSUAL = 'MENSUAL',
  ANUAL = 'ANUAL',
  SEMESTRAL = 'SEMESTRAL',
  TRIMESTRAL = 'TRIMESTRAL'
}

/**
 * Datos de facturación de la suscripción
 */
export interface DatosFacturacion {
  nombreCompleto: string;
  email: string;
  direccion: string;
  ciudad: string;
  provincia: string;
  codigoPostal: string;
  pais: string;
  telefono?: string;
  [key: string]: any;
}

/**
 * Entidad de Dominio para Historial de Cambios de Plan
 * Registra los cambios de plan realizados por una tienda
 */
export interface HistorialPlan {
  id: string;
  suscripcionId: string;
  planAnteriorId?: string;
  planNuevoId: string;
  fechaCambio: Date;
  motivo?: string;
  datosCambio?: DatosCambioPlan;
  usuarioId?: string;
}

/**
 * Datos adicionales del cambio de plan
 */
export interface DatosCambioPlan {
  precioAnterior: number;
  precioNuevo: number;
  cicloFacturacionAnterior: CicloFacturacion;
  cicloFacturacionNuevo: CicloFacturacion;
  [key: string]: any;
}

/**
 * Entidad de Dominio para Pago de Plan
 * Registra los pagos realizados para una suscripción
 */
export interface PagoPlan {
  id: string;
  suscripcionId: string;
  monto: number;
  moneda: string;
  estado: EstadoPagoPlan;
  fechaPago: Date;
  fechaVencimiento?: Date;
  referenciaPago?: string;
  metodoPago?: string;
  datosPago?: DatosPago;
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

/**
 * Estados posibles de un pago de plan
 */
export enum EstadoPagoPlan {
  PENDIENTE = 'PENDIENTE',
  EXITOSO = 'EXITOSO',
  FALLIDO = 'FALLIDO',
  REEMBOLSADO = 'REEMBOLSADO',
  CANCELADO = 'CANCELADO'
}

/**
 * Datos adicionales del pago
 */
export interface DatosPago {
  idTransaccion: string;
  metodo: string;
  ultimosDigitos?: string;
  [key: string]: any;
}

/**
 * Mapper para convertir entre entidades de dominio y modelos Prisma
 */
export class PlanMapper {
  /**
   * Convierte un modelo Prisma a entidad de dominio Plan
   */
  static toDomain(prismaPlan: any): Plan {
    return {
      id: prismaPlan.id,
      nombre: prismaPlan.nombre,
      codigo: prismaPlan.codigo,
      descripcion: prismaPlan.descripcion || undefined,
      precioMensual: Number(prismaPlan.precioMensual),
      precioAnual: prismaPlan.precioAnual ? Number(prismaPlan.precioAnual) : undefined,
      moneda: prismaPlan.moneda,
      estado: prismaPlan.estado as EstadoPlan,
      caracteristicas: prismaPlan.caracteristicas as CaracteristicasPlan,
      limites: prismaPlan.limites as LimitesPlan,
      fechaCreacion: prismaPlan.fechaCreacion,
      fechaActualizacion: prismaPlan.fechaActualizacion,
    };
  }

  /**
   * Convierte una entidad de dominio Plan a modelo Prisma
   */
  static toPersistence(plan: Plan): any {
    return {
      id: plan.id,
      nombre: plan.nombre,
      codigo: plan.codigo,
      descripcion: plan.descripcion,
      precioMensual: plan.precioMensual,
      precioAnual: plan.precioAnual,
      moneda: plan.moneda,
      estado: plan.estado,
      caracteristicas: plan.caracteristicas,
      limites: plan.limites,
      fechaCreacion: plan.fechaCreacion,
      fechaActualizacion: plan.fechaActualizacion,
    };
  }
}