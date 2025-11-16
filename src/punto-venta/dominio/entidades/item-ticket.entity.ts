import { IsNotEmpty, IsString, IsOptional, IsInt, IsDecimal } from 'class-validator';

/**
 * Entidad de dominio para ItemTicket
 * Representa un item individual en un ticket de venta
 */
export class ItemTicket {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsNotEmpty()
  @IsString()
  ticket_id: string;

  @IsNotEmpty()
  @IsString()
  producto_id: string;

  @IsOptional()
  @IsString()
  variante_id?: string;

  @IsInt()
  cantidad: number;

  @IsDecimal({ decimal_digits: '2' })
  precio_unitario: number;

  @IsDecimal({ decimal_digits: '2' })
  total: number;

  constructor(
    id: string,
    ticket_id: string,
    producto_id: string,
    cantidad: number,
    precio_unitario: number,
    total: number,
    variante_id?: string
  ) {
    this.id = id;
    this.ticket_id = ticket_id;
    this.producto_id = producto_id;
    this.variante_id = variante_id;
    this.cantidad = cantidad;
    this.precio_unitario = precio_unitario;
    this.total = total;
  }

  /**
   * Calcula el total del item basado en cantidad y precio unitario
   */
  calcularTotal(): void {
    this.total = this.cantidad * Number(this.precio_unitario);
  }

  /**
   * Actualiza la cantidad del item y recalcula el total
   */
  actualizarCantidad(nueva_cantidad: number): void {
    if (nueva_cantidad < 0) {
      throw new Error('La cantidad no puede ser negativa');
    }

    this.cantidad = nueva_cantidad;
    this.calcularTotal();
  }

  /**
   * Actualiza el precio unitario del item y recalcula el total
   */
  actualizarPrecioUnitario(nuevo_precio: number): void {
    if (nuevo_precio < 0) {
      throw new Error('El precio unitario no puede ser negativo');
    }

    this.precio_unitario = nuevo_precio;
    this.calcularTotal();
  }

  /**
   * Valida que el item tenga información válida
   */
  esValido(): boolean {
    return this.cantidad > 0 && this.precio_unitario >= 0 && this.total >= 0;
  }

  /**
   * Obtiene el subtotal del item (sin impuestos)
   */
  obtenerSubtotal(): number {
    return this.total;
  }

  /**
   * Genera un resumen del item
   */
  generarResumen(): { cantidad: number; precio_unitario: number; total: number } {
    return {
      cantidad: this.cantidad,
      precio_unitario: this.precio_unitario,
      total: this.total
    };
  }
}