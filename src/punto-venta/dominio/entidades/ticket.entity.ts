import { IsNotEmpty, IsString, IsOptional, IsDate, IsDecimal, IsEnum, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ItemTicket } from './item-ticket.entity';
import { MetodoPago, EstadoPago } from '../../../ordenes/dominio/enums/orden.enum';

/**
 * Entidad de dominio para Ticket
 * Representa una venta realizada en el punto de venta
 */
export class Ticket {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsNotEmpty()
  @IsString()
  caja_id: string;

  @IsNotEmpty()
  @IsString()
  numero_ticket: string;

  @IsOptional()
  @IsString()
  cliente_id?: string;

  @IsDecimal({ decimal_digits: '2' })
  subtotal: number;

  @IsDecimal({ decimal_digits: '2' })
  impuestos: number;

  @IsDecimal({ decimal_digits: '2' })
  total: number;

  @IsEnum(MetodoPago)
  metodo_pago: MetodoPago;

  @IsEnum(EstadoPago)
  estado_pago: EstadoPago;

  @IsDate()
  fecha_creacion: Date;

  @IsDate()
  fecha_actualizacion: Date;

  @IsNotEmpty()
  @IsString()
  usuario_id: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemTicket)
  items_ticket?: ItemTicket[];

  constructor(
    id: string,
    caja_id: string,
    numero_ticket: string,
    subtotal: number,
    impuestos: number,
    total: number,
    metodo_pago: MetodoPago,
    estado_pago: EstadoPago,
    fecha_creacion: Date,
    fecha_actualizacion: Date,
    usuario_id: string,
    cliente_id?: string,
    items_ticket?: ItemTicket[]
  ) {
    this.id = id;
    this.caja_id = caja_id;
    this.numero_ticket = numero_ticket;
    this.cliente_id = cliente_id;
    this.subtotal = subtotal;
    this.impuestos = impuestos;
    this.total = total;
    this.metodo_pago = metodo_pago;
    this.estado_pago = estado_pago;
    this.fecha_creacion = fecha_creacion;
    this.fecha_actualizacion = fecha_actualizacion;
    this.usuario_id = usuario_id;
    this.items_ticket = items_ticket;
  }

  /**
   * Calcula el total del ticket basado en los items
   */
  calcularTotales(): void {
    if (!this.items_ticket || this.items_ticket.length === 0) {
      this.subtotal = 0;
      this.impuestos = 0;
      this.total = 0;
      return;
    }

    this.subtotal = this.items_ticket.reduce((sum, item) => sum + Number(item.total), 0);
    // Por simplicidad, asumimos un impuesto fijo del 18%
    this.impuestos = this.subtotal * 0.18;
    this.total = this.subtotal + this.impuestos;
  }

  /**
   * Agrega un item al ticket
   */
  agregarItem(item: ItemTicket): void {
    if (!this.items_ticket) {
      this.items_ticket = [];
    }
    this.items_ticket.push(item);
    this.calcularTotales();
    this.fecha_actualizacion = new Date();
  }

  /**
   * Elimina un item del ticket
   */
  eliminarItem(item_id: string): void {
    if (!this.items_ticket) return;

    this.items_ticket = this.items_ticket.filter(item => item.id !== item_id);
    this.calcularTotales();
    this.fecha_actualizacion = new Date();
  }

  /**
   * Actualiza la cantidad de un item
   */
  actualizarCantidadItem(item_id: string, nueva_cantidad: number): void {
    if (!this.items_ticket) return;

    const item = this.items_ticket.find(item => item.id === item_id);
    if (item) {
      item.cantidad = nueva_cantidad;
      item.calcularTotal();
      this.calcularTotales();
      this.fecha_actualizacion = new Date();
    }
  }

  /**
   * Aplica un descuento al ticket
   */
  aplicarDescuento(porcentaje_descuento: number): void {
    if (porcentaje_descuento < 0 || porcentaje_descuento > 100) {
      throw new Error('El porcentaje de descuento debe estar entre 0 y 100');
    }

    const descuento = this.subtotal * (porcentaje_descuento / 100);
    this.subtotal -= descuento;
    this.impuestos = this.subtotal * 0.18;
    this.total = this.subtotal + this.impuestos;
    this.fecha_actualizacion = new Date();
  }

  /**
   * Valida que el ticket tenga al menos un item
   */
  tieneItems(): boolean {
    return !!this.items_ticket && this.items_ticket.length > 0;
  }

  /**
   * Obtiene el número de items en el ticket
   */
  obtenerCantidadItems(): number {
    return this.items_ticket?.length || 0;
  }

  /**
   * Genera un resumen del ticket
   */
  generarResumen(): { items: number; subtotal: number; impuestos: number; total: number } {
    return {
      items: this.obtenerCantidadItems(),
      subtotal: this.subtotal,
      impuestos: this.impuestos,
      total: this.total
    };
  }

  /**
   * Marca el ticket como pagado
   */
  marcarComoPagado(): void {
    this.estado_pago = EstadoPago.PAGADO;
    this.fecha_actualizacion = new Date();
  }

  /**
   * Marca el ticket como fallido
   */
  marcarComoFallido(): void {
    this.estado_pago = EstadoPago.FALLIDO;
    this.fecha_actualizacion = new Date();
  }
}