/**
 * Enumeración que define los estados de una orden
 * Sigue la convención de nomenclatura en español
 */
export enum EstadoOrden {
  PENDIENTE = 'PENDIENTE',
  CONFIRMADA = 'CONFIRMADA',
  PROCESANDO = 'PROCESANDO',
  ENVIADA = 'ENVIADA',
  ENTREGADA = 'ENTREGADA',
  CANCELADA = 'CANCELADA',
  REEMBOLSADA = 'REEMBOLSADA',
}

/**
 * Enumeración que define los estados de pago de una orden
 */
export enum EstadoPago {
  PENDIENTE = 'PENDIENTE',
  PAGADO = 'PAGADO',
  FALLIDO = 'FALLIDO',
  REEMBOLSADO = 'REEMBOLSADO',
  CANCELADO = 'CANCELADO',
}

/**
 * Enumeración que define los métodos de pago disponibles
 */
export enum MetodoPago {
  TARJETA_CREDITO = 'TARJETA_CREDITO',
  PAYPAL = 'PAYPAL',
  TRANSFERENCIA = 'TRANSFERENCIA',
  EFECTIVO = 'EFECTIVO',
}