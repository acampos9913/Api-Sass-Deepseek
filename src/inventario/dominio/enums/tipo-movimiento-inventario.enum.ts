/**
 * Enumeración de tipos de movimiento de inventario
 * Define los diferentes tipos de operaciones que se pueden realizar en el inventario
 */
export enum TipoMovimientoInventario {
  ENTRADA = 'ENTRADA',
  SALIDA = 'SALIDA',
  AJUSTE = 'AJUSTE',
  VENTA = 'VENTA',
  DEVOLUCION = 'DEVOLUCION',
}