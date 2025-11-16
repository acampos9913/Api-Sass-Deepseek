/**
 * Enums para el módulo de órdenes
 * Reutilizados en el módulo de punto de venta
 */

/**
 * Métodos de pago disponibles
 */
export enum MetodoPago {
  TARJETA_CREDITO = 'TARJETA_CREDITO',
  PAYPAL = 'PAYPAL',
  TRANSFERENCIA = 'TRANSFERENCIA',
  EFECTIVO = 'EFECTIVO'
}

/**
 * Estados de pago
 */
export enum EstadoPago {
  PENDIENTE = 'PENDIENTE',
  PAGADO = 'PAGADO',
  FALLIDO = 'FALLIDO',
  REEMBOLSADO = 'REEMBOLSADO',
  CANCELADO = 'CANCELADO'
}

/**
 * Estados de órdenes
 */
export enum EstadoOrden {
  PENDIENTE = 'PENDIENTE',
  CONFIRMADA = 'CONFIRMADA',
  PROCESANDO = 'PROCESANDO',
  ENVIADA = 'ENVIADA',
  ENTREGADA = 'ENTREGADA',
  CANCELADA = 'CANCELADA',
  REEMBOLSADA = 'REEMBOLSADA'
}