/**
 * Entidad de VarianteProducto que representa una variante específica de un producto
 * Sigue los principios de Domain-Driven Design y Arquitectura Limpia
 * Implementa funcionalidades avanzadas tipo Shopify para variantes
 *
 * Funcionalidades críticas para producción:
 * - Gestión de costos y márgenes
 * - Configuración de envío y logística
 * - Control de inventario por ubicación
 * - Validaciones de negocio robustas
 * - Gestión de impuestos y aduanas
 */
export class VarianteProducto {
  constructor(
    public readonly id: string,
    public readonly productoId: string,
    public readonly titulo: string,
    public readonly precio: number,
    public readonly precioComparacion: number | null,
    public readonly precioUnitario: number | null, // Para productos a granel
    public readonly sku: string,
    public readonly codigoBarras: string | null,
    public readonly costoPorArticulo: number | null, // Costo interno
    public readonly cobrarImpuesto: boolean,
    public readonly productoFisico: boolean,
    public readonly peso: number | null, // en gramos
    public readonly ancho: number | null, // en cm
    public readonly alto: number | null, // en cm
    public readonly profundidad: number | null, // en cm
    public readonly cantidadInventario: number,
    public readonly permiteBackorder: boolean,
    public readonly fechaCreacion: Date,
    public readonly fechaActualizacion: Date,
    public readonly opciones: { [clave: string]: string }, // Ej: { color: 'Rojo', talla: 'M' }
    public readonly posicion: number, // Orden de la variante
    public readonly imagenId: string | null, // Imagen específica de la variante
    public readonly paisOrigen: string | null, // Para aduanas
    public readonly codigoSistemaArancelario: string | null, // Código SA para aduanas
    public readonly embalajeId: string | null, // Tipo de embalaje
  ) {}

  /**
   * Verifica si la variante tiene descuento
   */
  tieneDescuento(): boolean {
    return this.precioComparacion !== null && this.precioComparacion > this.precio;
  }

  /**
   * Calcula el porcentaje de descuento
   */
  obtenerPorcentajeDescuento(): number | null {
    if (!this.tieneDescuento() || !this.precioComparacion) {
      return null;
    }

    const descuento = ((this.precioComparacion - this.precio) / this.precioComparacion) * 100;
    return Math.round(descuento * 100) / 100; // Redondear a 2 decimales
  }

  /**
   * Verifica si la variante está disponible para la venta
   */
  estaDisponible(): boolean {
    return this.cantidadInventario > 0 || this.permiteBackorder;
  }

  /**
   * Actualiza el precio de la variante
   */
  actualizarPrecio(precio: number, precioComparacion?: number | null, precioUnitario?: number | null): VarianteProducto {
    return new VarianteProducto(
      this.id,
      this.productoId,
      this.titulo,
      precio,
      precioComparacion !== undefined ? precioComparacion : this.precioComparacion,
      precioUnitario !== undefined ? precioUnitario : this.precioUnitario,
      this.sku,
      this.codigoBarras,
      this.costoPorArticulo,
      this.cobrarImpuesto,
      this.productoFisico,
      this.peso,
      this.ancho,
      this.alto,
      this.profundidad,
      this.cantidadInventario,
      this.permiteBackorder,
      this.fechaCreacion,
      new Date(),
      this.opciones,
      this.posicion,
      this.imagenId,
      this.paisOrigen,
      this.codigoSistemaArancelario,
      this.embalajeId,
    );
  }

  /**
   * Actualiza el inventario de la variante
   */
  actualizarInventario(cantidad: number, permiteBackorder?: boolean): VarianteProducto {
    return new VarianteProducto(
      this.id,
      this.productoId,
      this.titulo,
      this.precio,
      this.precioComparacion,
      this.precioUnitario,
      this.sku,
      this.codigoBarras,
      this.costoPorArticulo,
      this.cobrarImpuesto,
      this.productoFisico,
      this.peso,
      this.ancho,
      this.alto,
      this.profundidad,
      cantidad,
      permiteBackorder !== undefined ? permiteBackorder : this.permiteBackorder,
      this.fechaCreacion,
      new Date(),
      this.opciones,
      this.posicion,
      this.imagenId,
      this.paisOrigen,
      this.codigoSistemaArancelario,
      this.embalajeId,
    );
  }

  /**
   * Actualiza las opciones de la variante
   */
  actualizarOpciones(opciones: { [clave: string]: string }): VarianteProducto {
    return new VarianteProducto(
      this.id,
      this.productoId,
      this.titulo,
      this.precio,
      this.precioComparacion,
      this.precioUnitario,
      this.sku,
      this.codigoBarras,
      this.costoPorArticulo,
      this.cobrarImpuesto,
      this.productoFisico,
      this.peso,
      this.ancho,
      this.alto,
      this.profundidad,
      this.cantidadInventario,
      this.permiteBackorder,
      this.fechaCreacion,
      new Date(),
      opciones,
      this.posicion,
      this.imagenId,
      this.paisOrigen,
      this.codigoSistemaArancelario,
      this.embalajeId,
    );
  }

  /**
   * Actualiza la imagen de la variante
   */
  actualizarImagen(imagenId: string | null): VarianteProducto {
    return new VarianteProducto(
      this.id,
      this.productoId,
      this.titulo,
      this.precio,
      this.precioComparacion,
      this.precioUnitario,
      this.sku,
      this.codigoBarras,
      this.costoPorArticulo,
      this.cobrarImpuesto,
      this.productoFisico,
      this.peso,
      this.ancho,
      this.alto,
      this.profundidad,
      this.cantidadInventario,
      this.permiteBackorder,
      this.fechaCreacion,
      new Date(),
      this.opciones,
      this.posicion,
      imagenId,
      this.paisOrigen,
      this.codigoSistemaArancelario,
      this.embalajeId,
    );
  }

  /**
   * Actualiza el SKU de la variante
   */
  actualizarSku(sku: string): VarianteProducto {
    return new VarianteProducto(
      this.id,
      this.productoId,
      this.titulo,
      this.precio,
      this.precioComparacion,
      this.precioUnitario,
      sku,
      this.codigoBarras,
      this.costoPorArticulo,
      this.cobrarImpuesto,
      this.productoFisico,
      this.peso,
      this.ancho,
      this.alto,
      this.profundidad,
      this.cantidadInventario,
      this.permiteBackorder,
      this.fechaCreacion,
      new Date(),
      this.opciones,
      this.posicion,
      this.imagenId,
      this.paisOrigen,
      this.codigoSistemaArancelario,
      this.embalajeId,
    );
  }

  /**
   * Obtiene el título completo de la variante incluyendo las opciones
   */
  obtenerTituloCompleto(): string {
    const opcionesTexto = Object.values(this.opciones).join(' / ');
    return `${this.titulo} - ${opcionesTexto}`;
  }

  /**
   * Verifica si la variante coincide con las opciones especificadas
   */
  coincideConOpciones(opcionesBuscadas: { [clave: string]: string }): boolean {
    return Object.keys(opcionesBuscadas).every(
      clave => this.opciones[clave] === opcionesBuscadas[clave]
    );
  }

  /**
   * Obtiene el valor de una opción específica
   */
  obtenerValorOpcion(clave: string): string | null {
    return this.opciones[clave] || null;
  }

  /**
   * Duplica la variante para un nuevo producto
   */
  duplicarParaProducto(productoId: string): VarianteProducto {
    const nuevoId = `var-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const fechaActual = new Date();
    
    return new VarianteProducto(
      nuevoId,
      productoId,
      this.titulo,
      this.precio,
      this.precioComparacion,
      this.precioUnitario,
      `${this.sku}-COPY`,
      null, // Nuevo código de barras
      this.costoPorArticulo,
      this.cobrarImpuesto,
      this.productoFisico,
      this.peso,
      this.ancho,
      this.alto,
      this.profundidad,
      0, // Inventario en 0
      this.permiteBackorder,
      fechaActual,
      fechaActual,
      { ...this.opciones },
      this.posicion,
      this.imagenId,
      this.paisOrigen,
      this.codigoSistemaArancelario,
      this.embalajeId,
    );
  }
}