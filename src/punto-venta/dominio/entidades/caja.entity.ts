import { IsNotEmpty, IsString, IsBoolean, IsOptional, IsDate, IsDecimal, IsEnum, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { Ticket } from './ticket.entity';

/**
 * Enum para el estado de la caja
 */
export enum EstadoCaja {
  ABIERTA = 'ABIERTA',
  CERRADA = 'CERRADA',
  SUSPENDIDA = 'SUSPENDIDA'
}

/**
 * Entidad de dominio para Caja
 * Representa una caja registradora en el punto de venta
 */
export class Caja {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsNotEmpty()
  @IsString()
  sucursal_id: string;

  @IsNotEmpty()
  @IsString()
  nombre: string;

  @IsEnum(EstadoCaja)
  estado: EstadoCaja;

  @IsDecimal({ decimal_digits: '2' })
  saldo_inicial: number;

  @IsDecimal({ decimal_digits: '2' })
  saldo_actual: number;

  @IsOptional()
  @IsDate()
  fecha_apertura?: Date;

  @IsOptional()
  @IsDate()
  fecha_cierre?: Date;

  @IsOptional()
  @IsString()
  usuario_apertura_id?: string;

  @IsOptional()
  @IsString()
  usuario_cierre_id?: string;

  @IsDate()
  fecha_creacion: Date;

  @IsDate()
  fecha_actualizacion: Date;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Ticket)
  tickets?: Ticket[];

  constructor(
    id: string,
    sucursal_id: string,
    nombre: string,
    estado: EstadoCaja,
    saldo_inicial: number,
    saldo_actual: number,
    fecha_creacion: Date,
    fecha_actualizacion: Date,
    fecha_apertura?: Date,
    fecha_cierre?: Date,
    usuario_apertura_id?: string,
    usuario_cierre_id?: string,
    tickets?: Ticket[]
  ) {
    this.id = id;
    this.sucursal_id = sucursal_id;
    this.nombre = nombre;
    this.estado = estado;
    this.saldo_inicial = saldo_inicial;
    this.saldo_actual = saldo_actual;
    this.fecha_apertura = fecha_apertura;
    this.fecha_cierre = fecha_cierre;
    this.usuario_apertura_id = usuario_apertura_id;
    this.usuario_cierre_id = usuario_cierre_id;
    this.fecha_creacion = fecha_creacion;
    this.fecha_actualizacion = fecha_actualizacion;
    this.tickets = tickets;
  }

  /**
   * Abre la caja con un saldo inicial
   */
  abrir(usuario_id: string, saldo_inicial: number): void {
    if (this.estado !== EstadoCaja.CERRADA) {
      throw new Error('La caja ya está abierta o suspendida');
    }

    this.estado = EstadoCaja.ABIERTA;
    this.saldo_inicial = saldo_inicial;
    this.saldo_actual = saldo_inicial;
    this.fecha_apertura = new Date();
    this.usuario_apertura_id = usuario_id;
    this.fecha_actualizacion = new Date();
  }

  /**
   * Cierra la caja con el saldo final
   */
  cerrar(usuario_id: string): void {
    if (this.estado !== EstadoCaja.ABIERTA) {
      throw new Error('La caja no está abierta');
    }

    this.estado = EstadoCaja.CERRADA;
    this.fecha_cierre = new Date();
    this.usuario_cierre_id = usuario_id;
    this.fecha_actualizacion = new Date();
  }

  /**
   * Suspende temporalmente la caja
   */
  suspender(): void {
    if (this.estado !== EstadoCaja.ABIERTA) {
      throw new Error('Solo se pueden suspender cajas abiertas');
    }

    this.estado = EstadoCaja.SUSPENDIDA;
    this.fecha_actualizacion = new Date();
  }

  /**
   * Reanuda una caja suspendida
   */
  reanudar(): void {
    if (this.estado !== EstadoCaja.SUSPENDIDA) {
      throw new Error('Solo se pueden reanudar cajas suspendidas');
    }

    this.estado = EstadoCaja.ABIERTA;
    this.fecha_actualizacion = new Date();
  }

  /**
   * Registra una venta y actualiza el saldo
   */
  registrarVenta(monto: number): void {
    if (this.estado !== EstadoCaja.ABIERTA) {
      throw new Error('No se pueden registrar ventas en una caja cerrada o suspendida');
    }

    this.saldo_actual += monto;
    this.fecha_actualizacion = new Date();
  }

  /**
   * Registra un retiro de efectivo
   */
  registrarRetiro(monto: number): void {
    if (this.estado !== EstadoCaja.ABIERTA) {
      throw new Error('No se pueden registrar retiros en una caja cerrada o suspendida');
    }

    if (this.saldo_actual < monto) {
      throw new Error('Saldo insuficiente para realizar el retiro');
    }

    this.saldo_actual -= monto;
    this.fecha_actualizacion = new Date();
  }

  /**
   * Calcula el total de ventas del día
   */
  calcularTotalVentasDelDia(): number {
    if (!this.tickets) return 0;

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    return this.tickets
      .filter(ticket => {
        const fechaTicket = new Date(ticket.fecha_creacion);
        fechaTicket.setHours(0, 0, 0, 0);
        return fechaTicket.getTime() === hoy.getTime();
      })
      .reduce((total, ticket) => total + Number(ticket.total), 0);
  }

  /**
   * Valida si la caja puede realizar operaciones
   */
  puedeOperar(): boolean {
    return this.estado === EstadoCaja.ABIERTA;
  }

  /**
   * Obtiene la diferencia entre saldo actual y saldo esperado
   */
  calcularDiferencia(): number {
    const ventasDelDia = this.calcularTotalVentasDelDia();
    const saldoEsperado = this.saldo_inicial + ventasDelDia;
    return this.saldo_actual - saldoEsperado;
  }
}