/**
 * Estados de las tarjetas de regalo
 */
export enum EstadoTarjetaRegalo {
  ACTIVA = 'ACTIVA',
  INACTIVA = 'INACTIVA',
  EXPIRADA = 'EXPIRADA',
  REDIMIDA = 'REDIMIDA',
  CANCELADA = 'CANCELADA'
}

/**
 * Tipos de transacciones de tarjetas de regalo
 */
export enum TipoTransaccionTarjetaRegalo {
  ACTIVACION = 'ACTIVACION',
  REDENCION = 'REDENCION',
  AJUSTE = 'AJUSTE',
  CANCELACION = 'CANCELACION'
}

/**
 * Entidad de Dominio para Tarjetas de Regalo
 * Representa una tarjeta de regalo o cupón en el sistema
 */
export class TarjetaRegalo {
  constructor(
    public readonly id: string,
    public readonly codigo: string,
    public montoInicial: number,
    public montoActual: number,
    public estado: EstadoTarjetaRegalo,
    public readonly fechaCreacion: Date,
    public readonly fechaExpiracion: Date | null,
    public fechaActivacion: Date | null,
    public fechaRedimida: Date | null,
    public notas: string | null,
    public readonly tiendaId: string | null,
    public readonly creadorId: string,
    public readonly usuarioId: string | null,
    public readonly transacciones: TransaccionTarjetaRegalo[] = []
  ) {}

  /**
   * Crea una nueva tarjeta de regalo en estado INACTIVA
   */
  static crear(
    codigo: string,
    montoInicial: number,
    tiendaId: string | null,
    creadorId: string,
    usuarioId: string | null,
    fechaExpiracion?: Date,
    notas?: string
  ): TarjetaRegalo {
    const ahora = new Date();
    return new TarjetaRegalo(
      '', // ID será generado por la base de datos
      codigo,
      montoInicial,
      montoInicial, // montoActual igual al inicial
      EstadoTarjetaRegalo.INACTIVA,
      ahora,
      fechaExpiracion || null,
      null, // fechaActivacion
      null, // fechaRedimida
      notas || null,
      tiendaId,
      creadorId,
      usuarioId,
      []
    );
  }

  /**
   * Activa la tarjeta de regalo
   */
  activar(): void {
    if (this.estado !== EstadoTarjetaRegalo.INACTIVA) {
      throw new Error('Solo se pueden activar tarjetas en estado INACTIVA');
    }

    // Verificar si la tarjeta ha expirado
    if (this.haExpirado()) {
      throw new Error('No se puede activar una tarjeta expirada');
    }

    this.estado = EstadoTarjetaRegalo.ACTIVA;
    this.fechaActivacion = new Date();
  }

  /**
   * Redime un monto de la tarjeta de regalo
   */
  redimir(monto: number, ordenId: string | null, notas?: string): void {
    if (this.estado !== EstadoTarjetaRegalo.ACTIVA) {
      throw new Error('Solo se pueden redimir tarjetas en estado ACTIVA');
    }

    if (this.haExpirado()) {
      throw new Error('No se puede redimir una tarjeta expirada');
    }

    if (monto <= 0) {
      throw new Error('El monto a redimir debe ser mayor a 0');
    }

    if (monto > this.montoActual) {
      throw new Error('Monto a redimir excede el saldo disponible');
    }

    this.montoActual -= monto;

    // Crear transacción de redención
    const transaccion = TransaccionTarjetaRegalo.crearRedencion(
      this.id,
      monto,
      ordenId,
      notas
    );
    this.transacciones.push(transaccion);

    // Verificar si la tarjeta se ha agotado
    if (this.montoActual === 0) {
      this.estado = EstadoTarjetaRegalo.REDIMIDA;
      this.fechaRedimida = new Date();
    }
  }

  /**
   * Ajusta el saldo de la tarjeta de regalo
   */
  ajustarSaldo(nuevoMonto: number, motivo: string): void {
    if (this.estado !== EstadoTarjetaRegalo.ACTIVA && 
        this.estado !== EstadoTarjetaRegalo.INACTIVA) {
      throw new Error('Solo se pueden ajustar tarjetas en estado ACTIVA o INACTIVA');
    }

    if (nuevoMonto < 0) {
      throw new Error('El monto no puede ser negativo');
    }

    const diferencia = nuevoMonto - this.montoActual;
    
    // Crear transacción de ajuste
    const transaccion = TransaccionTarjetaRegalo.crearAjuste(
      this.id,
      Math.abs(diferencia),
      diferencia >= 0 ? 'INCREMENTO' : 'DECREMENTO',
      motivo
    );
    this.transacciones.push(transaccion);

    this.montoActual = nuevoMonto;
    this.montoInicial = nuevoMonto; // Actualizar también el monto inicial si es necesario
  }

  /**
   * Cancela la tarjeta de regalo
   */
  cancelar(motivo: string): void {
    if (this.estado === EstadoTarjetaRegalo.REDIMIDA) {
      throw new Error('No se puede cancelar una tarjeta ya redimida');
    }

    if (this.estado === EstadoTarjetaRegalo.CANCELADA) {
      throw new Error('La tarjeta ya está cancelada');
    }

    this.estado = EstadoTarjetaRegalo.CANCELADA;

    // Crear transacción de cancelación
    const transaccion = TransaccionTarjetaRegalo.crearCancelacion(
      this.id,
      this.montoActual,
      motivo
    );
    this.transacciones.push(transaccion);
  }

  /**
   * Reactiva una tarjeta cancelada
   */
  reactivar(): void {
    if (this.estado !== EstadoTarjetaRegalo.CANCELADA) {
      throw new Error('Solo se pueden reactivar tarjetas canceladas');
    }

    this.estado = EstadoTarjetaRegalo.ACTIVA;

    // Crear transacción de activación
    const transaccion = TransaccionTarjetaRegalo.crearActivacion(
      this.id,
      this.montoActual
    );
    this.transacciones.push(transaccion);
  }

  /**
   * Verifica si la tarjeta ha expirado
   */
  haExpirado(): boolean {
    if (!this.fechaExpiracion) {
      return false;
    }
    return new Date() > this.fechaExpiracion;
  }

  /**
   * Actualiza el estado basado en la fecha de expiración
   */
  actualizarEstadoPorExpiracion(): void {
    if (this.haExpirado() && 
        this.estado !== EstadoTarjetaRegalo.REDIMIDA && 
        this.estado !== EstadoTarjetaRegalo.CANCELADA) {
      this.estado = EstadoTarjetaRegalo.EXPIRADA;
    }
  }

  /**
   * Obtiene el saldo disponible de la tarjeta
   */
  obtenerSaldoDisponible(): number {
    return this.montoActual;
  }

  /**
   * Obtiene el porcentaje de uso de la tarjeta
   */
  obtenerPorcentajeUso(): number {
    return this.montoInicial > 0 ? 
      ((this.montoInicial - this.montoActual) / this.montoInicial) * 100 : 0;
  }

  /**
   * Obtiene el historial de transacciones ordenado por fecha
   */
  obtenerHistorialTransacciones(): TransaccionTarjetaRegalo[] {
    return [...this.transacciones].sort((a, b) => 
      b.fechaCreacion.getTime() - a.fechaCreacion.getTime()
    );
  }

  /**
   * Obtiene el total redimido de la tarjeta
   */
  obtenerTotalRedimido(): number {
    return this.transacciones
      .filter(t => t.tipo === TipoTransaccionTarjetaRegalo.REDENCION)
      .reduce((sum, t) => sum + t.monto, 0);
  }

  /**
   * Verifica si la tarjeta puede ser utilizada
   */
  puedeUtilizar(): boolean {
    return this.estado === EstadoTarjetaRegalo.ACTIVA && 
           !this.haExpirado() && 
           this.montoActual > 0;
  }

  /**
   * Verifica si la tarjeta puede ser editada
   */
  puedeEditar(): boolean {
    return this.estado === EstadoTarjetaRegalo.INACTIVA || 
           this.estado === EstadoTarjetaRegalo.ACTIVA;
  }

  /**
   * Verifica si la tarjeta puede ser cancelada
   */
  puedeCancelar(): boolean {
    return this.estado !== EstadoTarjetaRegalo.REDIMIDA && 
           this.estado !== EstadoTarjetaRegalo.CANCELADA;
  }

  /**
   * Obtiene los días restantes hasta la expiración
   */
  obtenerDiasRestantes(): number | null {
    if (!this.fechaExpiracion) {
      return null;
    }

    const ahora = new Date();
    const diferencia = this.fechaExpiracion.getTime() - ahora.getTime();
    return Math.ceil(diferencia / (1000 * 60 * 60 * 24));
  }
}

/**
 * Entidad de Dominio para Transacciones de Tarjetas de Regalo
 */
export class TransaccionTarjetaRegalo {
  constructor(
    public readonly id: string,
    public readonly tarjetaRegaloId: string,
    public readonly tipo: TipoTransaccionTarjetaRegalo,
    public readonly monto: number,
    public readonly ordenId: string | null,
    public readonly notas: string | null,
    public readonly fechaCreacion: Date
  ) {}

  /**
   * Crea una nueva transacción de activación
   */
  static crearActivacion(
    tarjetaRegaloId: string,
    monto: number
  ): TransaccionTarjetaRegalo {
    return new TransaccionTarjetaRegalo(
      '', // ID será generado por la base de datos
      tarjetaRegaloId,
      TipoTransaccionTarjetaRegalo.ACTIVACION,
      monto,
      null, // ordenId
      'Activación de tarjeta de regalo',
      new Date()
    );
  }

  /**
   * Crea una nueva transacción de redención
   */
  static crearRedencion(
    tarjetaRegaloId: string,
    monto: number,
    ordenId: string | null,
    notas?: string
  ): TransaccionTarjetaRegalo {
    return new TransaccionTarjetaRegalo(
      '', // ID será generado por la base de datos
      tarjetaRegaloId,
      TipoTransaccionTarjetaRegalo.REDENCION,
      monto,
      ordenId,
      notas || 'Redención de tarjeta de regalo',
      new Date()
    );
  }

  /**
   * Crea una nueva transacción de ajuste
   */
  static crearAjuste(
    tarjetaRegaloId: string,
    monto: number,
    tipoAjuste: 'INCREMENTO' | 'DECREMENTO',
    motivo: string
  ): TransaccionTarjetaRegalo {
    const montoFinal = tipoAjuste === 'DECREMENTO' ? -monto : monto;
    return new TransaccionTarjetaRegalo(
      '', // ID será generado por la base de datos
      tarjetaRegaloId,
      TipoTransaccionTarjetaRegalo.AJUSTE,
      montoFinal,
      null, // ordenId
      `Ajuste de saldo: ${tipoAjuste.toLowerCase()} - ${motivo}`,
      new Date()
    );
  }

  /**
   * Crea una nueva transacción de cancelación
   */
  static crearCancelacion(
    tarjetaRegaloId: string,
    monto: number,
    motivo: string
  ): TransaccionTarjetaRegalo {
    return new TransaccionTarjetaRegalo(
      '', // ID será generado por la base de datos
      tarjetaRegaloId,
      TipoTransaccionTarjetaRegalo.CANCELACION,
      monto,
      null, // ordenId
      `Cancelación de tarjeta: ${motivo}`,
      new Date()
    );
  }

  /**
   * Verifica si la transacción es un incremento
   */
  esIncremento(): boolean {
    return this.monto > 0;
  }

  /**
   * Verifica si la transacción es un decremento
   */
  esDecremento(): boolean {
    return this.monto < 0;
  }

  /**
   * Obtiene el monto absoluto de la transacción
   */
  obtenerMontoAbsoluto(): number {
    return Math.abs(this.monto);
  }

  /**
   * Obtiene una descripción legible del tipo de transacción
   */
  obtenerDescripcionTipo(): string {
    switch (this.tipo) {
      case TipoTransaccionTarjetaRegalo.ACTIVACION:
        return 'Activación';
      case TipoTransaccionTarjetaRegalo.REDENCION:
        return 'Redención';
      case TipoTransaccionTarjetaRegalo.AJUSTE:
        return this.esIncremento() ? 'Ajuste (Incremento)' : 'Ajuste (Decremento)';
      case TipoTransaccionTarjetaRegalo.CANCELACION:
        return 'Cancelación';
      default:
        return 'Desconocido';
    }
  }
}