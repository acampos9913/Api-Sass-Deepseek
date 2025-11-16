/**
 * Entidad de Dominio para Pagos
 * Contiene la lógica de negocio para la gestión de pagos
 * Sigue los principios de la Arquitectura Limpia
 */
export class Pago {
  constructor(
    private readonly id: string,
    private readonly ordenId: string,
    private readonly monto: number,
    private readonly moneda: string,
    private readonly metodoPago: MetodoPago,
    private estado: EstadoPago,
    private readonly referenciaExterna: string | null,
    private datosPago: DatosPago,
    private readonly fechaCreacion: Date,
    private fechaActualizacion: Date,
  ) {}

  /**
   * Valida que el pago sea válido
   */
  validar(): void {
    if (!this.id) {
      throw new Error('El ID del pago es requerido');
    }

    if (!this.ordenId) {
      throw new Error('El ID de la orden es requerido');
    }

    if (this.monto <= 0) {
      throw new Error('El monto del pago debe ser mayor a 0');
    }

    if (!this.moneda || this.moneda.trim().length === 0) {
      throw new Error('La moneda del pago es requerida');
    }

    if (!this.metodoPago) {
      throw new Error('El método de pago es requerido');
    }

    if (!this.estado) {
      throw new Error('El estado del pago es requerido');
    }

    this.validarMetodoPago();
    this.validarDatosPago();
  }

  /**
   * Valida el método de pago según el tipo
   */
  private validarMetodoPago(): void {
    switch (this.metodoPago.tipo) {
      case TipoMetodoPago.TARJETA_CREDITO:
        this.validarTarjetaCredito();
        break;
      case TipoMetodoPago.PAYPAL:
        this.validarPayPal();
        break;
      case TipoMetodoPago.TRANSFERENCIA:
        this.validarTransferencia();
        break;
      case TipoMetodoPago.EFECTIVO:
        this.validarEfectivo();
        break;
      default:
        throw new Error(`Tipo de método de pago no válido: ${this.metodoPago.tipo}`);
    }
  }

  /**
   * Valida los datos de pago según el tipo
   */
  private validarDatosPago(): void {
    switch (this.metodoPago.tipo) {
      case TipoMetodoPago.TARJETA_CREDITO:
        this.validarDatosTarjetaCredito();
        break;
      case TipoMetodoPago.PAYPAL:
        this.validarDatosPayPal();
        break;
      case TipoMetodoPago.TRANSFERENCIA:
        this.validarDatosTransferencia();
        break;
      case TipoMetodoPago.EFECTIVO:
        this.validarDatosEfectivo();
        break;
    }
  }

  private validarTarjetaCredito(): void {
    if (!this.metodoPago.detalles?.numeroTarjeta) {
      throw new Error('El número de tarjeta es requerido para pagos con tarjeta de crédito');
    }

    if (!this.metodoPago.detalles?.fechaExpiracion) {
      throw new Error('La fecha de expiración es requerida para pagos con tarjeta de crédito');
    }

    if (!this.metodoPago.detalles?.cvv) {
      throw new Error('El CVV es requerido para pagos con tarjeta de crédito');
    }

    if (!this.metodoPago.detalles?.nombreTitular) {
      throw new Error('El nombre del titular es requerido para pagos con tarjeta de crédito');
    }

    // Validar formato de número de tarjeta (simulación)
    const numeroTarjeta = this.metodoPago.detalles.numeroTarjeta.replace(/\s/g, '');
    if (numeroTarjeta.length < 13 || numeroTarjeta.length > 19) {
      throw new Error('El número de tarjeta debe tener entre 13 y 19 dígitos');
    }

    // Validar fecha de expiración
    const [mes, anio] = this.metodoPago.detalles.fechaExpiracion.split('/');
    const fechaExpiracion = new Date(parseInt(`20${anio}`), parseInt(mes) - 1);
    if (fechaExpiracion < new Date()) {
      throw new Error('La tarjeta de crédito ha expirado');
    }

    // Validar CVV
    if (this.metodoPago.detalles.cvv.length < 3 || this.metodoPago.detalles.cvv.length > 4) {
      throw new Error('El CVV debe tener 3 o 4 dígitos');
    }
  }

  private validarPayPal(): void {
    if (!this.metodoPago.detalles?.emailPayPal) {
      throw new Error('El email de PayPal es requerido para pagos con PayPal');
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.metodoPago.detalles.emailPayPal)) {
      throw new Error('El email de PayPal no tiene un formato válido');
    }
  }

  private validarTransferencia(): void {
    if (!this.metodoPago.detalles?.numeroCuenta) {
      throw new Error('El número de cuenta es requerido para transferencias');
    }

    if (!this.metodoPago.detalles?.banco) {
      throw new Error('El banco es requerido para transferencias');
    }

    if (!this.metodoPago.detalles?.tipoCuenta) {
      throw new Error('El tipo de cuenta es requerido para transferencias');
    }
  }

  private validarEfectivo(): void {
    if (!this.metodoPago.detalles?.puntoPago) {
      throw new Error('El punto de pago es requerido para pagos en efectivo');
    }
  }

  private validarDatosTarjetaCredito(): void {
    const datos = this.datosPago as DatosPagoTarjeta;
    
    if (!datos.idTransaccion) {
      throw new Error('El ID de transacción es requerido para pagos con tarjeta de crédito');
    }

    if (!datos.codigoAutorizacion) {
      throw new Error('El código de autorización es requerido para pagos con tarjeta de crédito');
    }

    if (!datos.procesadorPago) {
      throw new Error('El procesador de pago es requerido para pagos con tarjeta de crédito');
    }
  }

  private validarDatosPayPal(): void {
    const datos = this.datosPago as DatosPagoPayPal;
    
    if (!datos.idTransaccionPayPal) {
      throw new Error('El ID de transacción de PayPal es requerido');
    }

    if (!datos.estadoPayPal) {
      throw new Error('El estado de PayPal es requerido');
    }
  }

  private validarDatosTransferencia(): void {
    const datos = this.datosPago as DatosPagoTransferencia;
    
    if (!datos.numeroReferencia) {
      throw new Error('El número de referencia es requerido para transferencias');
    }

    if (!datos.fechaTransferencia) {
      throw new Error('La fecha de transferencia es requerida');
    }
  }

  private validarDatosEfectivo(): void {
    const datos = this.datosPago as DatosPagoEfectivo;
    
    if (!datos.fechaPago) {
      throw new Error('La fecha de pago es requerida para pagos en efectivo');
    }

    if (!datos.comprobante) {
      throw new Error('El número de comprobante es requerido para pagos en efectivo');
    }
  }

  /**
   * Procesa el pago según el método
   */
  async procesar(): Promise<void> {
    if (this.estado !== EstadoPago.PENDIENTE) {
      throw new Error('Solo se pueden procesar pagos en estado pendiente');
    }

    // Simulación de procesamiento
    switch (this.metodoPago.tipo) {
      case TipoMetodoPago.TARJETA_CREDITO:
        await this.procesarTarjetaCredito();
        break;
      case TipoMetodoPago.PAYPAL:
        await this.procesarPayPal();
        break;
      case TipoMetodoPago.TRANSFERENCIA:
        await this.procesarTransferencia();
        break;
      case TipoMetodoPago.EFECTIVO:
        await this.procesarEfectivo();
        break;
    }

    // Actualizar estado a completado
    this.estado = EstadoPago.COMPLETADO;
    this.fechaActualizacion = new Date();
  }

  private async procesarTarjetaCredito(): Promise<void> {
    // Simulación de procesamiento de tarjeta de crédito
    // En una implementación real, esto se conectaría con una pasarela de pago
    const datos = this.datosPago as DatosPagoTarjeta;
    
    // Simular procesamiento exitoso
    datos.idTransaccion = `txn_${Date.now()}`;
    datos.codigoAutorizacion = `auth_${Math.random().toString(36).substr(2, 9)}`;
    datos.procesadorPago = 'Stripe';
    datos.fechaProcesamiento = new Date();
  }

  private async procesarPayPal(): Promise<void> {
    // Simulación de procesamiento de PayPal
    const datos = this.datosPago as DatosPagoPayPal;
    
    datos.idTransaccionPayPal = `paypal_${Date.now()}`;
    datos.estadoPayPal = 'COMPLETED';
    datos.fechaProcesamiento = new Date();
  }

  private async procesarTransferencia(): Promise<void> {
    // Simulación de procesamiento de transferencia
    const datos = this.datosPago as DatosPagoTransferencia;
    
    datos.numeroReferencia = `ref_${Date.now()}`;
    datos.fechaProcesamiento = new Date();
  }

  private async procesarEfectivo(): Promise<void> {
    // Simulación de procesamiento de efectivo
    const datos = this.datosPago as DatosPagoEfectivo;
    
    datos.fechaPago = new Date();
    datos.comprobante = `comp_${Date.now()}`;
    datos.fechaProcesamiento = new Date();
  }

  /**
   * Reembolsa el pago
   */
  async reembolsar(): Promise<void> {
    if (this.estado !== EstadoPago.COMPLETADO) {
      throw new Error('Solo se pueden reembolsar pagos completados');
    }

    // Simulación de reembolso
    this.estado = EstadoPago.REEMBOLSADO;
    this.fechaActualizacion = new Date();

    // En una implementación real, esto se conectaría con la pasarela de pago
    // para procesar el reembolso
  }

  /**
   * Cancela el pago
   */
  cancelar(): void {
    if (this.estado !== EstadoPago.PENDIENTE) {
      throw new Error('Solo se pueden cancelar pagos pendientes');
    }

    this.estado = EstadoPago.CANCELADO;
    this.fechaActualizacion = new Date();
  }

  /**
   * Verifica si el pago está completado
   */
  estaCompletado(): boolean {
    return this.estado === EstadoPago.COMPLETADO;
  }

  /**
   * Verifica si el pago puede ser reembolsado
   */
  puedeReembolsar(): boolean {
    return this.estado === EstadoPago.COMPLETADO;
  }

  /**
   * Verifica si el pago puede ser cancelado
   */
  puedeCancelar(): boolean {
    return this.estado === EstadoPago.PENDIENTE;
  }

  // Getters
  getId(): string { return this.id; }
  getOrdenId(): string { return this.ordenId; }
  getMonto(): number { return this.monto; }
  getMoneda(): string { return this.moneda; }
  getMetodoPago(): MetodoPago { return this.metodoPago; }
  getEstado(): EstadoPago { return this.estado; }
  getReferenciaExterna(): string | null { return this.referenciaExterna; }
  getDatosPago(): DatosPago { return this.datosPago; }
  getFechaCreacion(): Date { return this.fechaCreacion; }
  getFechaActualizacion(): Date { return this.fechaActualizacion; }
}

/**
 * Enumeración de tipos de método de pago
 */
export enum TipoMetodoPago {
  TARJETA_CREDITO = 'TARJETA_CREDITO',
  PAYPAL = 'PAYPAL',
  TRANSFERENCIA = 'TRANSFERENCIA',
  EFECTIVO = 'EFECTIVO',
}

/**
 * Enumeración de estados del pago
 */
export enum EstadoPago {
  PENDIENTE = 'PENDIENTE',
  PROCESANDO = 'PROCESANDO',
  COMPLETADO = 'COMPLETADO',
  FALLIDO = 'FALLIDO',
  CANCELADO = 'CANCELADO',
  REEMBOLSADO = 'REEMBOLSADO',
}

/**
 * Interfaz para el método de pago
 */
export interface MetodoPago {
  tipo: TipoMetodoPago;
  detalles?: DetallesMetodoPago;
}

/**
 * Interfaz para detalles del método de pago
 */
export interface DetallesMetodoPago {
  // Tarjeta de crédito
  numeroTarjeta?: string;
  fechaExpiracion?: string;
  cvv?: string;
  nombreTitular?: string;

  // PayPal
  emailPayPal?: string;

  // Transferencia
  numeroCuenta?: string;
  banco?: string;
  tipoCuenta?: string;

  // Efectivo
  puntoPago?: string;
}

/**
 * Interfaces específicas para cada tipo de datos de pago
 */
export interface DatosPagoTarjeta {
  idTransaccion: string;
  codigoAutorizacion: string;
  procesadorPago: string;
  fechaProcesamiento: Date;
  codigoError?: string;
}

export interface DatosPagoPayPal {
  idTransaccionPayPal: string;
  estadoPayPal: string;
  fechaProcesamiento: Date;
  codigoError?: string;
}

export interface DatosPagoTransferencia {
  numeroReferencia: string;
  fechaTransferencia: Date;
  fechaProcesamiento: Date;
  codigoError?: string;
}

export interface DatosPagoEfectivo {
  fechaPago: Date;
  comprobante: string;
  fechaProcesamiento: Date;
  codigoError?: string;
}

/**
 * Tipo unión para todos los tipos de datos de pago
 */
export type DatosPago = 
  | DatosPagoTarjeta 
  | DatosPagoPayPal 
  | DatosPagoTransferencia 
  | DatosPagoEfectivo;