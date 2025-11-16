/**
 * Entidad de PaqueteProducto que representa un paquete o combo de productos
 * Sigue los principios de Domain-Driven Design y Arquitectura Limpia
 */
export class PaqueteProducto {
  constructor(
    public readonly id: string,
    public readonly nombre: string,
    public readonly descripcion: string | null,
    public readonly precio: number,
    public readonly precioComparacion: number | null,
    public readonly sku: string | null,
    public readonly activo: boolean,
    public readonly fechaCreacion: Date,
    public readonly fechaActualizacion: Date,
    public readonly tiendaId: string | null,
    public readonly creadorId: string,
    public readonly items: ItemPaquete[] = [],
  ) {}

  /**
   * Verifica si el paquete está activo y puede ser vendido
   */
  estaActivo(): boolean {
    return this.activo;
  }

  /**
   * Actualiza la información del paquete
   */
  actualizarInformacion(
    nombre?: string,
    descripcion?: string | null,
    precio?: number,
    precioComparacion?: number | null,
    activo?: boolean,
  ): PaqueteProducto {
    return new PaqueteProducto(
      this.id,
      nombre || this.nombre,
      descripcion !== undefined ? descripcion : this.descripcion,
      precio !== undefined ? precio : this.precio,
      precioComparacion !== undefined ? precioComparacion : this.precioComparacion,
      this.sku,
      activo !== undefined ? activo : this.activo,
      this.fechaCreacion,
      new Date(),
      this.tiendaId,
      this.creadorId,
      this.items,
    );
  }

  /**
   * Activa el paquete
   */
  activar(): PaqueteProducto {
    return this.actualizarInformacion(undefined, undefined, undefined, undefined, true);
  }

  /**
   * Desactiva el paquete
   */
  desactivar(): PaqueteProducto {
    return this.actualizarInformacion(undefined, undefined, undefined, undefined, false);
  }

  /**
   * Agrega un item al paquete
   */
  agregarItem(productoId: string, varianteId: string | null, cantidad: number, precioUnitario?: number): PaqueteProducto {
    const nuevoItem: ItemPaquete = {
      id: this.generarIdItem(),
      productoId,
      varianteId,
      cantidad,
      precioUnitario: precioUnitario || 0,
    };

    const itemsActualizados = [...this.items, nuevoItem];
    return new PaqueteProducto(
      this.id,
      this.nombre,
      this.descripcion,
      this.precio,
      this.precioComparacion,
      this.sku,
      this.activo,
      this.fechaCreacion,
      new Date(),
      this.tiendaId,
      this.creadorId,
      itemsActualizados,
    );
  }

  /**
   * Actualiza un item del paquete
   */
  actualizarItem(itemId: string, cantidad?: number, precioUnitario?: number): PaqueteProducto {
    const itemsActualizados = this.items.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          cantidad: cantidad !== undefined ? cantidad : item.cantidad,
          precioUnitario: precioUnitario !== undefined ? precioUnitario : item.precioUnitario,
        };
      }
      return item;
    });

    return new PaqueteProducto(
      this.id,
      this.nombre,
      this.descripcion,
      this.precio,
      this.precioComparacion,
      this.sku,
      this.activo,
      this.fechaCreacion,
      new Date(),
      this.tiendaId,
      this.creadorId,
      itemsActualizados,
    );
  }

  /**
   * Elimina un item del paquete
   */
  eliminarItem(itemId: string): PaqueteProducto {
    const itemsActualizados = this.items.filter(item => item.id !== itemId);
    return new PaqueteProducto(
      this.id,
      this.nombre,
      this.descripcion,
      this.precio,
      this.precioComparacion,
      this.sku,
      this.activo,
      this.fechaCreacion,
      new Date(),
      this.tiendaId,
      this.creadorId,
      itemsActualizados,
    );
  }

  /**
   * Calcula el costo total del paquete basado en los precios de los items
   */
  calcularCostoTotal(): number {
    return this.items.reduce((total, item) => {
      return total + (item.precioUnitario * item.cantidad);
    }, 0);
  }

  /**
   * Calcula el margen de ganancia del paquete
   */
  calcularMargenGanancia(): number {
    const costoTotal = this.calcularCostoTotal();
    return costoTotal > 0 ? ((this.precio - costoTotal) / costoTotal) * 100 : 0;
  }

  /**
   * Verifica si el paquete tiene un margen de ganancia válido (mínimo 10%)
   */
  tieneMargenValido(): boolean {
    return this.calcularMargenGanancia() >= 10;
  }

  /**
   * Valida que todos los items del paquete tengan productos válidos
   */
  validarItems(): { valido: boolean; errores: string[] } {
    const errores: string[] = [];

    if (this.items.length === 0) {
      errores.push('El paquete debe contener al menos un producto');
    }

    this.items.forEach((item, index) => {
      if (!item.productoId) {
        errores.push(`El item ${index + 1} no tiene un producto asignado`);
      }
      if (item.cantidad <= 0) {
        errores.push(`El item ${index + 1} debe tener una cantidad mayor a 0`);
      }
      if (item.precioUnitario < 0) {
        errores.push(`El item ${index + 1} no puede tener un precio unitario negativo`);
      }
    });

    return {
      valido: errores.length === 0,
      errores,
    };
  }

  /**
   * Obtiene el ahorro del cliente al comprar el paquete vs comprar los items por separado
   */
  obtenerAhorroCliente(): number {
    const costoTotalItems = this.calcularCostoTotal();
    return costoTotalItems - this.precio;
  }

  /**
   * Obtiene el porcentaje de ahorro del cliente
   */
  obtenerPorcentajeAhorro(): number {
    const costoTotalItems = this.calcularCostoTotal();
    return costoTotalItems > 0 ? ((costoTotalItems - this.precio) / costoTotalItems) * 100 : 0;
  }

  /**
   * Verifica si el paquete ofrece un ahorro significativo (mínimo 5%)
   */
  ofreceAhorroSignificativo(): boolean {
    return this.obtenerPorcentajeAhorro() >= 5;
  }

  /**
   * Genera un ID único para un item del paquete
   */
  private generarIdItem(): string {
    return `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Interfaz para los items del paquete
 */
export interface ItemPaquete {
  id: string;
  productoId: string;
  varianteId: string | null;
  cantidad: number;
  precioUnitario: number;
}