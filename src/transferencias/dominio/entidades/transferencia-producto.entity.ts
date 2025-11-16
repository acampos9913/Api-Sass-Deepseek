/**
 * Estados de las transferencias de productos
 */
export enum EstadoTransferencia {
  BORRADOR = 'BORRADOR',
  ENVIADA = 'ENVIADA',
  PARCIALMENTE_RECIBIDA = 'PARCIALMENTE_RECIBIDA',
  COMPLETADA = 'COMPLETADA',
  CANCELADA = 'CANCELADA'
}

/**
 * Entidad de Dominio para Transferencias de Productos
 * Representa el movimiento de productos entre ubicaciones
 */
export class TransferenciaProducto {
  constructor(
    public readonly id: string,
    public readonly numeroTransferencia: string,
    public readonly ubicacionOrigen: string,
    public readonly ubicacionDestino: string,
    public estado: EstadoTransferencia,
    public readonly fechaEsperada: Date | null,
    public fechaCompletada: Date | null,
    public notas: string | null,
    public readonly fechaCreacion: Date,
    public fechaActualizacion: Date,
    public readonly tiendaId: string | null,
    public readonly creadorId: string,
    public readonly usuarioId: string | null,
    public readonly items: ItemTransferencia[] = []
  ) {}

  /**
   * Crea una nueva transferencia en estado BORRADOR
   */
  static crear(
    numeroTransferencia: string,
    ubicacionOrigen: string,
    ubicacionDestino: string,
    tiendaId: string | null,
    creadorId: string,
    usuarioId: string | null,
    notas?: string,
    fechaEsperada?: Date
  ): TransferenciaProducto {
    const ahora = new Date();
    return new TransferenciaProducto(
      '', // ID será generado por la base de datos
      numeroTransferencia,
      ubicacionOrigen,
      ubicacionDestino,
      EstadoTransferencia.BORRADOR,
      fechaEsperada || null,
      null, // fechaCompletada
      notas || null,
      ahora,
      ahora,
      tiendaId,
      creadorId,
      usuarioId,
      []
    );
  }

  /**
   * Envía la transferencia (marca como enviada)
   */
  enviar(): void {
    if (this.estado !== EstadoTransferencia.BORRADOR) {
      throw new Error('Solo se pueden enviar transferencias en estado BORRADOR');
    }
    
    if (this.items.length === 0) {
      throw new Error('No se puede enviar una transferencia sin items');
    }

    // Validar que todos los items tengan cantidad solicitada > 0
    const itemsInvalidos = this.items.filter(item => item.cantidadSolicitada <= 0);
    if (itemsInvalidos.length > 0) {
      throw new Error('Todos los items deben tener cantidad solicitada mayor a 0');
    }

    this.estado = EstadoTransferencia.ENVIADA;
    this.fechaActualizacion = new Date();
  }

  /**
   * Marca la transferencia como parcialmente recibida
   */
  marcarParcialmenteRecibida(): void {
    if (this.estado !== EstadoTransferencia.ENVIADA && 
        this.estado !== EstadoTransferencia.PARCIALMENTE_RECIBIDA) {
      throw new Error('Solo se pueden marcar como parcialmente recibidas transferencias ENVIADAS o PARCIALMENTE_RECIBIDAS');
    }

    this.estado = EstadoTransferencia.PARCIALMENTE_RECIBIDA;
    this.fechaActualizacion = new Date();
  }

  /**
   * Completa la recepción de la transferencia
   */
  completar(): void {
    if (this.estado !== EstadoTransferencia.PARCIALMENTE_RECIBIDA && 
        this.estado !== EstadoTransferencia.ENVIADA) {
      throw new Error('Solo se pueden completar transferencias PARCIALMENTE_RECIBIDAS o ENVIADAS');
    }

    // Validar que todos los items tengan cantidad recibida igual a cantidad enviada
    const itemsIncompletos = this.items.filter(item => item.cantidadRecibida !== item.cantidadEnviada);
    if (itemsIncompletos.length > 0) {
      throw new Error('No se puede completar la transferencia: algunos items no han sido completamente recibidos');
    }

    this.estado = EstadoTransferencia.COMPLETADA;
    this.fechaCompletada = new Date();
    this.fechaActualizacion = new Date();
  }

  /**
   * Cancela la transferencia
   */
  cancelar(motivo: string): void {
    if (this.estado === EstadoTransferencia.COMPLETADA) {
      throw new Error('No se puede cancelar una transferencia COMPLETADA');
    }

    if (this.estado === EstadoTransferencia.CANCELADA) {
      throw new Error('La transferencia ya está cancelada');
    }

    this.estado = EstadoTransferencia.CANCELADA;
    this.notas = motivo;
    this.fechaActualizacion = new Date();
  }

  /**
   * Agrega un item a la transferencia
   */
  agregarItem(item: ItemTransferencia): void {
    if (this.estado !== EstadoTransferencia.BORRADOR) {
      throw new Error('Solo se pueden agregar items a transferencias en estado BORRADOR');
    }

    // Validar que no exista ya el producto en la transferencia
    const productoExistente = this.items.find(i => i.productoId === item.productoId);
    if (productoExistente) {
      throw new Error('El producto ya existe en la transferencia');
    }

    this.items.push(item);
    this.fechaActualizacion = new Date();
  }

  /**
   * Remueve un item de la transferencia
   */
  removerItem(itemId: string): void {
    if (this.estado !== EstadoTransferencia.BORRADOR) {
      throw new Error('Solo se pueden remover items de transferencias en estado BORRADOR');
    }

    const index = this.items.findIndex(item => item.id === itemId);
    if (index === -1) {
      throw new Error('Item no encontrado en la transferencia');
    }

    this.items.splice(index, 1);
    this.fechaActualizacion = new Date();
  }

  /**
   * Actualiza la cantidad enviada de un item
   */
  actualizarCantidadEnviada(itemId: string, cantidadEnviada: number): void {
    if (this.estado !== EstadoTransferencia.ENVIADA && 
        this.estado !== EstadoTransferencia.PARCIALMENTE_RECIBIDA) {
      throw new Error('Solo se pueden actualizar cantidades enviadas en transferencias ENVIADAS o PARCIALMENTE_RECIBIDAS');
    }

    const item = this.items.find(item => item.id === itemId);
    if (!item) {
      throw new Error('Item no encontrado en la transferencia');
    }

    if (cantidadEnviada < 0 || cantidadEnviada > item.cantidadSolicitada) {
      throw new Error('Cantidad enviada inválida');
    }

    item.cantidadEnviada = cantidadEnviada;
    this.fechaActualizacion = new Date();

    // Verificar si la transferencia debe cambiar de estado
    this.verificarEstadoPorEnvio();
  }

  /**
   * Actualiza la cantidad recibida de un item
   */
  actualizarCantidadRecibida(itemId: string, cantidadRecibida: number): void {
    if (this.estado !== EstadoTransferencia.ENVIADA && 
        this.estado !== EstadoTransferencia.PARCIALMENTE_RECIBIDA) {
      throw new Error('Solo se pueden actualizar cantidades recibidas en transferencias ENVIADAS o PARCIALMENTE_RECIBIDAS');
    }

    const item = this.items.find(item => item.id === itemId);
    if (!item) {
      throw new Error('Item no encontrado en la transferencia');
    }

    if (cantidadRecibida < 0 || cantidadRecibida > item.cantidadEnviada) {
      throw new Error('Cantidad recibida inválida');
    }

    item.cantidadRecibida = cantidadRecibida;
    this.fechaActualizacion = new Date();

    // Verificar si la transferencia debe cambiar de estado
    this.verificarEstadoPorRecepcion();
  }

  /**
   * Verifica y actualiza el estado basado en el envío de items
   */
  private verificarEstadoPorEnvio(): void {
    const totalSolicitado = this.items.reduce((sum, item) => sum + item.cantidadSolicitada, 0);
    const totalEnviado = this.items.reduce((sum, item) => sum + item.cantidadEnviada, 0);

    if (totalEnviado === 0) {
      this.estado = EstadoTransferencia.ENVIADA;
    } else if (totalEnviado < totalSolicitado) {
      this.estado = EstadoTransferencia.PARCIALMENTE_RECIBIDA;
    } else {
      this.estado = EstadoTransferencia.COMPLETADA;
      this.fechaCompletada = new Date();
    }

    this.fechaActualizacion = new Date();
  }

  /**
   * Verifica y actualiza el estado basado en la recepción de items
   */
  private verificarEstadoPorRecepcion(): void {
    const totalEnviado = this.items.reduce((sum, item) => sum + item.cantidadEnviada, 0);
    const totalRecibido = this.items.reduce((sum, item) => sum + item.cantidadRecibida, 0);

    if (totalRecibido === 0) {
      this.estado = EstadoTransferencia.ENVIADA;
    } else if (totalRecibido < totalEnviado) {
      this.estado = EstadoTransferencia.PARCIALMENTE_RECIBIDA;
    } else {
      this.estado = EstadoTransferencia.COMPLETADA;
      this.fechaCompletada = new Date();
    }

    this.fechaActualizacion = new Date();
  }

  /**
   * Obtiene el porcentaje de envío de la transferencia
   */
  obtenerPorcentajeEnvio(): number {
    const totalSolicitado = this.items.reduce((sum, item) => sum + item.cantidadSolicitada, 0);
    const totalEnviado = this.items.reduce((sum, item) => sum + item.cantidadEnviada, 0);
    
    return totalSolicitado > 0 ? (totalEnviado / totalSolicitado) * 100 : 0;
  }

  /**
   * Obtiene el porcentaje de recepción de la transferencia
   */
  obtenerPorcentajeRecepcion(): number {
    const totalEnviado = this.items.reduce((sum, item) => sum + item.cantidadEnviada, 0);
    const totalRecibido = this.items.reduce((sum, item) => sum + item.cantidadRecibida, 0);
    
    return totalEnviado > 0 ? (totalRecibido / totalEnviado) * 100 : 0;
  }

  /**
   * Verifica si la transferencia puede ser editada
   */
  puedeEditar(): boolean {
    return this.estado === EstadoTransferencia.BORRADOR;
  }

  /**
   * Verifica si la transferencia puede ser cancelada
   */
  puedeCancelar(): boolean {
    return this.estado !== EstadoTransferencia.COMPLETADA && 
           this.estado !== EstadoTransferencia.CANCELADA;
  }

  /**
   * Obtiene el total de productos en la transferencia
   */
  obtenerTotalProductos(): number {
    return this.items.length;
  }

  /**
   * Obtiene la cantidad total solicitada
   */
  obtenerCantidadTotalSolicitada(): number {
    return this.items.reduce((sum, item) => sum + item.cantidadSolicitada, 0);
  }

  /**
   * Obtiene la cantidad total enviada
   */
  obtenerCantidadTotalEnviada(): number {
    return this.items.reduce((sum, item) => sum + item.cantidadEnviada, 0);
  }

  /**
   * Obtiene la cantidad total recibida
   */
  obtenerCantidadTotalRecibida(): number {
    return this.items.reduce((sum, item) => sum + item.cantidadRecibida, 0);
  }
}

/**
 * Entidad de Dominio para Items de Transferencias
 */
export class ItemTransferencia {
  constructor(
    public readonly id: string,
    public readonly transferenciaId: string,
    public readonly productoId: string,
    public cantidadSolicitada: number,
    public cantidadEnviada: number,
    public cantidadRecibida: number
  ) {}

  /**
   * Crea un nuevo item para transferencia
   */
  static crear(
    productoId: string,
    cantidadSolicitada: number
  ): ItemTransferencia {
    return new ItemTransferencia(
      '', // ID será generado por la base de datos
      '', // transferenciaId se asignará al guardar
      productoId,
      cantidadSolicitada,
      0, // cantidadEnviada inicial
      0  // cantidadRecibida inicial
    );
  }

  /**
   * Actualiza la cantidad solicitada del item
   */
  actualizarCantidadSolicitada(nuevaCantidad: number): void {
    if (nuevaCantidad <= 0) {
      throw new Error('La cantidad solicitada debe ser mayor a 0');
    }

    this.cantidadSolicitada = nuevaCantidad;
  }

  /**
   * Actualiza la cantidad enviada del item
   */
  actualizarCantidadEnviada(cantidad: number): void {
    if (cantidad < 0 || cantidad > this.cantidadSolicitada) {
      throw new Error('Cantidad enviada inválida');
    }

    this.cantidadEnviada = cantidad;
  }

  /**
   * Actualiza la cantidad recibida del item
   */
  actualizarCantidadRecibida(cantidad: number): void {
    if (cantidad < 0 || cantidad > this.cantidadEnviada) {
      throw new Error('Cantidad recibida inválida');
    }

    this.cantidadRecibida = cantidad;
  }

  /**
   * Obtiene el porcentaje de envío del item
   */
  obtenerPorcentajeEnvio(): number {
    return this.cantidadSolicitada > 0 ? (this.cantidadEnviada / this.cantidadSolicitada) * 100 : 0;
  }

  /**
   * Obtiene el porcentaje de recepción del item
   */
  obtenerPorcentajeRecepcion(): number {
    return this.cantidadEnviada > 0 ? (this.cantidadRecibida / this.cantidadEnviada) * 100 : 0;
  }

  /**
   * Verifica si el item está completamente enviado
   */
  estaCompletamenteEnviado(): boolean {
    return this.cantidadEnviada === this.cantidadSolicitada;
  }

  /**
   * Verifica si el item está completamente recibido
   */
  estaCompletamenteRecibido(): boolean {
    return this.cantidadRecibida === this.cantidadEnviada;
  }
}