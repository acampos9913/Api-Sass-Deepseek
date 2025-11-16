import { TipoMovimientoInventario } from '../enums/tipo-movimiento-inventario.enum';

/**
 * Entidad de MovimientoInventario que representa un movimiento en el inventario
 * Sigue los principios de Domain-Driven Design y Arquitectura Limpia
 */
export class MovimientoInventario {
  constructor(
    public readonly id: string,
    public readonly productoId: string,
    public readonly varianteId: string | null,
    public readonly tipo: TipoMovimientoInventario,
    public readonly cantidad: number,
    public readonly stockAnterior: number,
    public readonly stockActual: number,
    public readonly motivo: string,
    public readonly fechaCreacion: Date,
    public readonly usuarioId: string | null,
  ) {}

  /**
   * Verifica si el movimiento es de entrada (aumenta el stock)
   */
  esEntrada(): boolean {
    return this.tipo === TipoMovimientoInventario.ENTRADA || 
           this.tipo === TipoMovimientoInventario.DEVOLUCION;
  }

  /**
   * Verifica si el movimiento es de salida (reduce el stock)
   */
  esSalida(): boolean {
    return this.tipo === TipoMovimientoInventario.SALIDA || 
           this.tipo === TipoMovimientoInventario.VENTA;
  }

  /**
   * Verifica si el movimiento es un ajuste
   */
  esAjuste(): boolean {
    return this.tipo === TipoMovimientoInventario.AJUSTE;
  }

  /**
   * Calcula el cambio neto en el inventario
   */
  obtenerCambioNeto(): number {
    if (this.esEntrada()) {
      return this.cantidad;
    } else if (this.esSalida()) {
      return -this.cantidad;
    }
    return this.stockActual - this.stockAnterior;
  }

  /**
   * Valida que el movimiento sea consistente
   */
  validar(): boolean {
    // Validar que la cantidad sea positiva
    if (this.cantidad <= 0) {
      return false;
    }

    // Validar que el stock actual sea consistente con el movimiento
    const cambioEsperado = this.obtenerCambioNeto();
    const stockEsperado = this.stockAnterior + cambioEsperado;

    return stockEsperado === this.stockActual;
  }

  /**
   * Verifica si el movimiento afecta a una variante específica
   */
  afectaVariante(): boolean {
    return this.varianteId !== null;
  }

  /**
   * Obtiene una descripción legible del tipo de movimiento
   */
  obtenerDescripcionTipo(): string {
    const descripciones = {
      [TipoMovimientoInventario.ENTRADA]: 'Entrada de inventario',
      [TipoMovimientoInventario.SALIDA]: 'Salida de inventario',
      [TipoMovimientoInventario.AJUSTE]: 'Ajuste de inventario',
      [TipoMovimientoInventario.VENTA]: 'Venta',
      [TipoMovimientoInventario.DEVOLUCION]: 'Devolución',
    };

    return descripciones[this.tipo] || 'Movimiento desconocido';
  }
}