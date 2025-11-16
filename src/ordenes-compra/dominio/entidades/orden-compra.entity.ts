/**
 * Estados de las órdenes de compra
 */
export enum EstadoOrdenCompra {
  BORRADOR = 'BORRADOR',
  ENVIADA = 'ENVIADA',
  CONFIRMADA = 'CONFIRMADA',
  PARCIALMENTE_RECIBIDA = 'PARCIALMENTE_RECIBIDA',
  COMPLETADA = 'COMPLETADA',
  CANCELADA = 'CANCELADA'
}

/**
 * Entidad de Dominio para Órdenes de Compra
 * Representa una orden de compra a proveedores en el sistema
 */
export class OrdenCompra {
  constructor(
    public readonly id: string,
    public readonly numeroOrden: string,
    public readonly proveedor: string,
    public estado: EstadoOrdenCompra,
    public readonly fechaEsperada: Date | null,
    public fechaEntrega: Date | null,
    public subtotal: number,
    public impuestos: number,
    public total: number,
    public notas: string | null,
    public readonly fechaCreacion: Date,
    public fechaActualizacion: Date,
    public readonly tiendaId: string | null,
    public readonly creadorId: string,
    public readonly usuarioId: string | null,
    public readonly items: ItemOrdenCompra[] = []
  ) {}

  /**
   * Crea una nueva orden de compra en estado BORRADOR
   */
  static crear(
    numeroOrden: string,
    proveedor: string,
    subtotal: number,
    impuestos: number,
    total: number,
    tiendaId: string | null,
    creadorId: string,
    usuarioId: string | null,
    notas?: string,
    fechaEsperada?: Date
  ): OrdenCompra {
    const ahora = new Date();
    return new OrdenCompra(
      '', // ID será generado por la base de datos
      numeroOrden,
      proveedor,
      EstadoOrdenCompra.BORRADOR,
      fechaEsperada || null,
      null, // fechaEntrega
      subtotal,
      impuestos,
      total,
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
   * Envía la orden de compra al proveedor
   */
  enviar(): void {
    if (this.estado !== EstadoOrdenCompra.BORRADOR) {
      throw new Error('Solo se pueden enviar órdenes en estado BORRADOR');
    }
    
    if (this.items.length === 0) {
      throw new Error('No se puede enviar una orden sin items');
    }

    this.estado = EstadoOrdenCompra.ENVIADA;
    this.fechaActualizacion = new Date();
  }

  /**
   * Confirma la orden de compra con el proveedor
   */
  confirmar(): void {
    if (this.estado !== EstadoOrdenCompra.ENVIADA) {
      throw new Error('Solo se pueden confirmar órdenes en estado ENVIADA');
    }

    this.estado = EstadoOrdenCompra.CONFIRMADA;
    this.fechaActualizacion = new Date();
  }

  /**
   * Marca la orden como parcialmente recibida
   */
  marcarParcialmenteRecibida(): void {
    if (this.estado !== EstadoOrdenCompra.CONFIRMADA && 
        this.estado !== EstadoOrdenCompra.PARCIALMENTE_RECIBIDA) {
      throw new Error('Solo se pueden marcar como parcialmente recibidas órdenes CONFIRMADAS o PARCIALMENTE_RECIBIDAS');
    }

    this.estado = EstadoOrdenCompra.PARCIALMENTE_RECIBIDA;
    this.fechaActualizacion = new Date();
  }

  /**
   * Completa la recepción de la orden
   */
  completar(): void {
    if (this.estado !== EstadoOrdenCompra.PARCIALMENTE_RECIBIDA && 
        this.estado !== EstadoOrdenCompra.CONFIRMADA) {
      throw new Error('Solo se pueden completar órdenes PARCIALMENTE_RECIBIDAS o CONFIRMADAS');
    }

    this.estado = EstadoOrdenCompra.COMPLETADA;
    this.fechaEntrega = new Date();
    this.fechaActualizacion = new Date();
  }

  /**
   * Cancela la orden de compra
   */
  cancelar(motivo: string): void {
    if (this.estado === EstadoOrdenCompra.COMPLETADA) {
      throw new Error('No se puede cancelar una orden COMPLETADA');
    }

    if (this.estado === EstadoOrdenCompra.CANCELADA) {
      throw new Error('La orden ya está cancelada');
    }

    this.estado = EstadoOrdenCompra.CANCELADA;
    this.notas = motivo;
    this.fechaActualizacion = new Date();
  }

  /**
   * Agrega un item a la orden de compra
   */
  agregarItem(item: ItemOrdenCompra): void {
    if (this.estado !== EstadoOrdenCompra.BORRADOR) {
      throw new Error('Solo se pueden agregar items a órdenes en estado BORRADOR');
    }

    this.items.push(item);
    this.recalcularTotales();
  }

  /**
   * Remueve un item de la orden de compra
   */
  removerItem(itemId: string): void {
    if (this.estado !== EstadoOrdenCompra.BORRADOR) {
      throw new Error('Solo se pueden remover items de órdenes en estado BORRADOR');
    }

    const index = this.items.findIndex(item => item.id === itemId);
    if (index === -1) {
      throw new Error('Item no encontrado en la orden');
    }

    this.items.splice(index, 1);
    this.recalcularTotales();
  }

  /**
   * Actualiza la cantidad recibida de un item
   */
  actualizarCantidadRecibida(itemId: string, cantidadRecibida: number): void {
    const item = this.items.find(item => item.id === itemId);
    if (!item) {
      throw new Error('Item no encontrado en la orden');
    }

    if (cantidadRecibida < 0 || cantidadRecibida > item.cantidad) {
      throw new Error('Cantidad recibida inválida');
    }

    item.cantidadRecibida = cantidadRecibida;
    this.fechaActualizacion = new Date();

    // Verificar si la orden debe cambiar de estado
    this.verificarEstadoPorRecepcion();
  }

  /**
   * Verifica y actualiza el estado basado en la recepción de items
   */
  private verificarEstadoPorRecepcion(): void {
    if (this.estado === EstadoOrdenCompra.CONFIRMADA || 
        this.estado === EstadoOrdenCompra.PARCIALMENTE_RECIBIDA) {
      
      const totalCantidad = this.items.reduce((sum, item) => sum + item.cantidad, 0);
      const totalRecibido = this.items.reduce((sum, item) => sum + item.cantidadRecibida, 0);

      if (totalRecibido === 0) {
        this.estado = EstadoOrdenCompra.CONFIRMADA;
      } else if (totalRecibido < totalCantidad) {
        this.estado = EstadoOrdenCompra.PARCIALMENTE_RECIBIDA;
      } else {
        this.estado = EstadoOrdenCompra.COMPLETADA;
        this.fechaEntrega = new Date();
      }

      this.fechaActualizacion = new Date();
    }
  }

  /**
   * Recalcula los totales de la orden
   */
  private recalcularTotales(): void {
    this.subtotal = this.items.reduce((sum, item) => sum + item.total, 0);
    // Los impuestos se mantienen como están, podrían recalcularte si hay lógica de impuestos por item
    this.total = this.subtotal + this.impuestos;
    this.fechaActualizacion = new Date();
  }

  /**
   * Obtiene el porcentaje de recepción de la orden
   */
  obtenerPorcentajeRecepcion(): number {
    const totalCantidad = this.items.reduce((sum, item) => sum + item.cantidad, 0);
    const totalRecibido = this.items.reduce((sum, item) => sum + item.cantidadRecibida, 0);
    
    return totalCantidad > 0 ? (totalRecibido / totalCantidad) * 100 : 0;
  }

  /**
   * Verifica si la orden puede ser editada
   */
  puedeEditar(): boolean {
    return this.estado === EstadoOrdenCompra.BORRADOR;
  }

  /**
   * Verifica si la orden puede ser cancelada
   */
  puedeCancelar(): boolean {
    return this.estado !== EstadoOrdenCompra.COMPLETADA && 
           this.estado !== EstadoOrdenCompra.CANCELADA;
  }
}

/**
 * Entidad de Dominio para Items de Órdenes de Compra
 */
export class ItemOrdenCompra {
  constructor(
    public readonly id: string,
    public readonly ordenCompraId: string,
    public readonly productoId: string,
    public cantidad: number,
    public precioUnitario: number,
    public total: number,
    public cantidadRecibida: number
  ) {}

  /**
   * Crea un nuevo item para orden de compra
   */
  static crear(
    productoId: string,
    cantidad: number,
    precioUnitario: number
  ): ItemOrdenCompra {
    const total = cantidad * precioUnitario;
    return new ItemOrdenCompra(
      '', // ID será generado por la base de datos
      '', // ordenCompraId se asignará al guardar
      productoId,
      cantidad,
      precioUnitario,
      total,
      0 // cantidadRecibida inicial
    );
  }

  /**
   * Actualiza la cantidad del item
   */
  actualizarCantidad(nuevaCantidad: number): void {
    if (nuevaCantidad <= 0) {
      throw new Error('La cantidad debe ser mayor a 0');
    }

    this.cantidad = nuevaCantidad;
    this.total = nuevaCantidad * this.precioUnitario;
  }

  /**
   * Actualiza el precio unitario del item
   */
  actualizarPrecioUnitario(nuevoPrecio: number): void {
    if (nuevoPrecio <= 0) {
      throw new Error('El precio unitario debe ser mayor a 0');
    }

    this.precioUnitario = nuevoPrecio;
    this.total = this.cantidad * nuevoPrecio;
  }

  /**
   * Actualiza la cantidad recibida del item
   */
  actualizarCantidadRecibida(cantidad: number): void {
    if (cantidad < 0 || cantidad > this.cantidad) {
      throw new Error('Cantidad recibida inválida');
    }

    this.cantidadRecibida = cantidad;
  }

  /**
   * Obtiene el porcentaje de recepción del item
   */
  obtenerPorcentajeRecepcion(): number {
    return this.cantidad > 0 ? (this.cantidadRecibida / this.cantidad) * 100 : 0;
  }
}