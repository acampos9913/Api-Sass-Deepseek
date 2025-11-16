/**
 * Enumeración de tipos de descuento
 * Define los diferentes tipos de descuentos y promociones disponibles
 */
export enum TipoDescuento {
  PORCENTAJE = 'PORCENTAJE',
  MONTO_FIJO = 'MONTO_FIJO',
  ENVIO_GRATIS = 'ENVIO_GRATIS',
  SUBTOTAL_CARRITO = 'SUBTOTAL_CARRITO',
  LLEVA_X_PAGA_Y = 'LLEGA_X_PAGA_Y',
  PROGRESIVO = 'PROGRESIVO',
  CAMPAÑA_UTM = 'CAMPAÑA_UTM',
  COMBO = 'COMBO',
}