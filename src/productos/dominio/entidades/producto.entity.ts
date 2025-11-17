import { VarianteProducto } from './variante-producto.entity';

/**
 * Entidad de Producto que representa un producto en el sistema
 * Sigue los principios de Domain-Driven Design y Arquitectura Limpia
 * Incluye todas las funcionalidades avanzadas tipo Shopify
 */
export class Producto {
  constructor(
    public readonly id: string,
    public readonly titulo: string,
    public readonly descripcion: string | null,
    public readonly precio: number,
    public readonly precioComparacion: number | null,
    public readonly sku: string | null,
    public readonly codigoBarras: string | null,
    public readonly peso: number | null, // en gramos
    public readonly ancho: number | null, // en cm
    public readonly alto: number | null, // en cm
    public readonly profundidad: number | null, // en cm
    public readonly visible: boolean,
    public readonly fechaCreacion: Date,
    public readonly fechaActualizacion: Date,
    public readonly creadorId: string,
    public readonly tiendaId: string,
    public readonly proveedor: string | null,
    public readonly estado: 'ACTIVO' | 'ARCHIVADO' | 'ELIMINADO',
    public readonly visibleTiendaOnline: boolean,
    public readonly visiblePointOfSale: boolean,
    public readonly tipoProducto: 'FISICO' | 'DIGITAL' | 'SERVICIO',
    public readonly requiereEnvio: boolean,
    public readonly inventarioGestionado: boolean,
    public readonly cantidadInventario: number,
    public readonly permiteBackorder: boolean,
    public readonly tags: string[],
    public readonly metatitulo: string | null,
    public readonly metadescripcion: string | null,
    public readonly slug: string | null,
    public readonly fechaPublicacion: Date | null,
    public readonly fechaArchivado: Date | null,
    public readonly fechaEliminado: Date | null,
    public readonly variantes: VarianteProducto[] = [], // Array de variantes del producto
    public readonly opcionesVariantes: { nombre: string; valores: string[] }[] = [], // Opciones de variantes (ej: Color, Talla)
    public readonly imagenIds: string[] = [], // IDs de imágenes del producto
    public readonly imagenPrincipalId: string | null = null, // ID de la imagen principal
  ) {}

  /**
   * Verifica si el producto está visible para los clientes
   */
  estaVisible(): boolean {
    return this.visible;
  }

  /**
   * Verifica si el producto tiene descuento
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
   * Actualiza la visibilidad del producto
   */
  actualizarVisibilidad(visible: boolean): Producto {
    return new Producto(
      this.id,
      this.titulo,
      this.descripcion,
      this.precio,
      this.precioComparacion,
      this.sku,
      this.codigoBarras,
      this.peso,
      this.ancho,
      this.alto,
      this.profundidad,
      visible,
      this.fechaCreacion,
      new Date(),
      this.creadorId,
      this.tiendaId,
      this.proveedor,
      this.estado,
      this.visibleTiendaOnline,
      this.visiblePointOfSale,
      this.tipoProducto,
      this.requiereEnvio,
      this.inventarioGestionado,
      this.cantidadInventario,
      this.permiteBackorder,
      this.tags,
      this.metatitulo,
      this.metadescripcion,
      this.slug,
      this.fechaPublicacion,
      this.fechaArchivado,
      this.fechaEliminado,
    );
  }

  /**
   * Actualiza el precio del producto
   */
  actualizarPrecio(precio: number, precioComparacion?: number | null): Producto {
    return new Producto(
      this.id,
      this.titulo,
      this.descripcion,
      precio,
      precioComparacion !== undefined ? precioComparacion : this.precioComparacion,
      this.sku,
      this.codigoBarras,
      this.peso,
      this.ancho,
      this.alto,
      this.profundidad,
      this.visible,
      this.fechaCreacion,
      new Date(),
      this.creadorId,
      this.tiendaId,
      this.proveedor,
      this.estado,
      this.visibleTiendaOnline,
      this.visiblePointOfSale,
      this.tipoProducto,
      this.requiereEnvio,
      this.inventarioGestionado,
      this.cantidadInventario,
      this.permiteBackorder,
      this.tags,
      this.metatitulo,
      this.metadescripcion,
      this.slug,
      this.fechaPublicacion,
      this.fechaArchivado,
      this.fechaEliminado,
      this.variantes,
      this.opcionesVariantes,
      this.imagenIds,
      this.imagenPrincipalId,
    );
  }

  /**
   * Cambia el estado del producto (ACTIVO, ARCHIVADO, ELIMINADO)
   */
  cambiarEstado(nuevoEstado: 'ACTIVO' | 'ARCHIVADO' | 'ELIMINADO'): Producto {
    const fechaActual = new Date();
    let fechaArchivado = this.fechaArchivado;
    let fechaEliminado = this.fechaEliminado;

    if (nuevoEstado === 'ARCHIVADO' && this.estado !== 'ARCHIVADO') {
      fechaArchivado = fechaActual;
    } else if (nuevoEstado === 'ELIMINADO' && this.estado !== 'ELIMINADO') {
      fechaEliminado = fechaActual;
    }

    return new Producto(
      this.id,
      this.titulo,
      this.descripcion,
      this.precio,
      this.precioComparacion,
      this.sku,
      this.codigoBarras,
      this.peso,
      this.ancho,
      this.alto,
      this.profundidad,
      this.visible,
      this.fechaCreacion,
      fechaActual,
      this.creadorId,
      this.tiendaId,
      this.proveedor,
      nuevoEstado,
      this.visibleTiendaOnline,
      this.visiblePointOfSale,
      this.tipoProducto,
      this.requiereEnvio,
      this.inventarioGestionado,
      this.cantidadInventario,
      this.permiteBackorder,
      this.tags,
      this.metatitulo,
      this.metadescripcion,
      this.slug,
      this.fechaPublicacion,
      fechaArchivado,
      fechaEliminado,
      this.variantes,
      this.opcionesVariantes,
      this.imagenIds,
      this.imagenPrincipalId,
    );
  }

  /**
   * Actualiza la visibilidad por canal de venta
   */
  actualizarVisibilidadCanales(tiendaOnline: boolean, pointOfSale: boolean): Producto {
    return new Producto(
      this.id,
      this.titulo,
      this.descripcion,
      this.precio,
      this.precioComparacion,
      this.sku,
      this.codigoBarras,
      this.peso,
      this.ancho,
      this.alto,
      this.profundidad,
      this.visible,
      this.fechaCreacion,
      new Date(),
      this.creadorId,
      this.tiendaId,
      this.proveedor,
      this.estado,
      tiendaOnline,
      pointOfSale,
      this.tipoProducto,
      this.requiereEnvio,
      this.inventarioGestionado,
      this.cantidadInventario,
      this.permiteBackorder,
      this.tags,
      this.metatitulo,
      this.metadescripcion,
      this.slug,
      this.fechaPublicacion,
      this.fechaArchivado,
      this.fechaEliminado,
      this.variantes,
      this.opcionesVariantes,
      this.imagenIds,
      this.imagenPrincipalId,
    );
  }

  /**
   * Duplica el producto creando uno nuevo con datos similares
   */
  duplicar(): Producto {
    const nuevoId = `prod-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const fechaActual = new Date();
    
    return new Producto(
      nuevoId,
      `${this.titulo} (Copia)`,
      this.descripcion,
      this.precio,
      this.precioComparacion,
      this.sku ? `${this.sku}-COPY` : null,
      null, // Nuevo código de barras
      this.peso,
      this.ancho,
      this.alto,
      this.profundidad,
      false, // No visible por defecto
      fechaActual,
      fechaActual,
      this.creadorId,
      this.tiendaId,
      this.proveedor,
      'ACTIVO',
      this.visibleTiendaOnline,
      this.visiblePointOfSale,
      this.tipoProducto,
      this.requiereEnvio,
      this.inventarioGestionado,
      0, // Inventario en 0
      this.permiteBackorder,
      [...this.tags],
      this.metatitulo,
      this.metadescripcion,
      null, // Nuevo slug
      null, // No publicado
      null,
      null,
      [...this.variantes], // Duplicar variantes
      [...this.opcionesVariantes], // Duplicar opciones de variantes
      [...this.imagenIds], // Duplicar IDs de imágenes
      this.imagenPrincipalId, // Mantener misma imagen principal
    );
  }

  /**
   * Verifica si el producto está disponible para la venta
   */
  estaDisponible(): boolean {
    return this.estado === 'ACTIVO' &&
           this.visible &&
           (this.inventarioGestionado === false || this.cantidadInventario > 0 || this.permiteBackorder);
  }

  /**
   * Actualiza el inventario del producto
   */
  actualizarInventario(cantidad: number, gestionarInventario?: boolean): Producto {
    return new Producto(
      this.id,
      this.titulo,
      this.descripcion,
      this.precio,
      this.precioComparacion,
      this.sku,
      this.codigoBarras,
      this.peso,
      this.ancho,
      this.alto,
      this.profundidad,
      this.visible,
      this.fechaCreacion,
      new Date(),
      this.creadorId,
      this.tiendaId,
      this.proveedor,
      this.estado,
      this.visibleTiendaOnline,
      this.visiblePointOfSale,
      this.tipoProducto,
      this.requiereEnvio,
      gestionarInventario !== undefined ? gestionarInventario : this.inventarioGestionado,
      cantidad,
      this.permiteBackorder,
      this.tags,
      this.metatitulo,
      this.metadescripcion,
      this.slug,
      this.fechaPublicacion,
      this.fechaArchivado,
      this.fechaEliminado,
      this.variantes,
      this.opcionesVariantes,
      this.imagenIds,
      this.imagenPrincipalId,
    );
  }

  /**
   * Genera enlaces para redes sociales
   */
  generarEnlacesRedesSociales(urlBase: string): { [red: string]: string } {
    const enlaces: { [red: string]: string } = {};
    const urlProducto = `${urlBase}/productos/${this.slug || this.id}`;
    const tituloCodificado = encodeURIComponent(this.titulo);
    const descripcionCodificada = encodeURIComponent(this.descripcion || '');

    enlaces.facebook = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(urlProducto)}`;
    enlaces.twitter = `https://twitter.com/intent/tweet?url=${encodeURIComponent(urlProducto)}&text=${tituloCodificado}`;
    enlaces.linkedin = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(urlProducto)}`;
    enlaces.pinterest = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(urlProducto)}&description=${tituloCodificado}`;
    enlaces.reddit = `https://reddit.com/submit?url=${encodeURIComponent(urlProducto)}&title=${tituloCodificado}`;

    return enlaces;
  }

  /**
   * Verifica si el producto puede ser archivado
   */
  puedeArchivar(): boolean {
    return this.estado === 'ACTIVO';
  }

  /**
   * Verifica si el producto puede ser eliminado
   */
  puedeEliminar(): boolean {
    return this.estado !== 'ELIMINADO';
  }

  /**
   * Verifica si el producto puede ser duplicado
   */
  puedeDuplicar(): boolean {
    return this.estado !== 'ELIMINADO';
  }

  /**
   * Verifica si el producto está publicado
   */
  estaPublicado(): boolean {
    return this.estado === 'ACTIVO' && this.fechaPublicacion !== null && this.fechaPublicacion <= new Date();
  }

  /**
   * Publica el producto
   */
  publicar(): Producto {
    return new Producto(
      this.id,
      this.titulo,
      this.descripcion,
      this.precio,
      this.precioComparacion,
      this.sku,
      this.codigoBarras,
      this.peso,
      this.ancho,
      this.alto,
      this.profundidad,
      true,
      this.fechaCreacion,
      new Date(),
      this.creadorId,
      this.tiendaId,
      this.proveedor,
      this.estado,
      this.visibleTiendaOnline,
      this.visiblePointOfSale,
      this.tipoProducto,
      this.requiereEnvio,
      this.inventarioGestionado,
      this.cantidadInventario,
      this.permiteBackorder,
      this.tags,
      this.metatitulo,
      this.metadescripcion,
      this.slug,
      new Date(), // Fecha de publicación
      this.fechaArchivado,
      this.fechaEliminado,
      this.variantes,
      this.opcionesVariantes,
      this.imagenIds,
      this.imagenPrincipalId,
    );
  }
}