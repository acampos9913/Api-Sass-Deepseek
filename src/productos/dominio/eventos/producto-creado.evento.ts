import { EventoDominio } from '../../../comun/dominio/eventos/evento-dominio.base';
import { Producto } from '../entidades/producto.entity';
import { ExcepcionDominio } from '../../../comun/excepciones/excepcion-dominio';

/**
 * Evento de dominio que se dispara cuando se crea un nuevo producto
 * Este evento se publica en Kafka para sincronizar con MongoDB
 */
export class ProductoCreadoEvento extends EventoDominio {
  constructor(
    public readonly idProducto: string,
    public readonly titulo: string,
    public readonly descripcion: string | null,
    public readonly precio: number,
    public readonly precioComparacion: number | null,
    public readonly precioUnitario: string | null,
    public readonly cobrarImpuesto: boolean,
    public readonly costoPorArticulo: number | null,
    public readonly sku: string | null,
    public readonly codigoBarras: string | null,
    public readonly inventarioConSeguimiento: boolean,
    public readonly cantidadDisponible: number,
    public readonly venderSinExistencias: boolean,
    public readonly productoFisico: boolean,
    public readonly peso: number | null,
    public readonly unidadPeso: string | null,
    public readonly paisOrigen: string | null,
    public readonly codigoSA: string | null,
    public readonly estado: string,
    public readonly tipoProducto: string,
    public readonly proveedor: string | null,
    public readonly etiquetas: string[],
    public readonly fechaPublicacion: Date | null,
    public readonly fechaArchivado: Date | null,
    public readonly fechaEliminado: Date | null,
    public readonly tiendaId: string,
    public readonly usuarioId: string,
  ) {
    super('ProductoCreado', 1);
  }

  /**
   * Crea un evento ProductoCreado a partir de una entidad Producto
   */
  /**
   * Crea un evento ProductoCreado a partir de una entidad Producto
   * @param producto - Entidad Producto válida
   * @throws {ExcepcionDominio} Si la entidad producto es inválida
   */
  static desdeProducto(producto: Producto): ProductoCreadoEvento {
    // Validaciones de integridad de datos para producción
    if (!producto.id) {
      throw ExcepcionDominio.Respuesta400(
        'El ID del producto es requerido',
        'Producto.IDRequerido'
      );
    }

    if (!producto.titulo || producto.titulo.trim().length === 0) {
      throw ExcepcionDominio.Respuesta400(
        'El título del producto es requerido',
        'Producto.TituloRequerido'
      );
    }

    if (producto.precio <= 0) {
      throw ExcepcionDominio.Respuesta400(
        'El precio debe ser mayor a cero',
        'Producto.PrecioInvalido'
      );
    }

    return new ProductoCreadoEvento(
      producto.id,
      producto.titulo,
      producto.descripcion,
      producto.precio,
      producto.precioComparacion,
      null, // precioUnitario no existe en Producto entity
      true, // cobrarImpuesto por defecto en producción
      null, // costoPorArticulo no existe en Producto entity
      producto.sku,
      producto.codigoBarras,
      producto.inventarioGestionado,
      producto.cantidadInventario,
      producto.permiteBackorder,
      producto.tipoProducto === 'FISICO',
      producto.peso,
      'g', // unidadPeso por defecto en gramos
      null, // paisOrigen no existe en Producto entity
      null, // codigoSA no existe en Producto entity
      producto.estado,
      producto.tipoProducto,
      producto.proveedor,
      producto.tags,
      producto.fechaPublicacion,
      producto.fechaArchivado,
      producto.fechaEliminado,
      producto.tiendaId,
      producto.creadorId
    );
  }

  protected obtenerDatosEvento(): any {
    return {
      idProducto: this.idProducto,
      titulo: this.titulo,
      descripcion: this.descripcion,
      precio: this.precio,
      precioComparacion: this.precioComparacion,
      precioUnitario: this.precioUnitario,
      cobrarImpuesto: this.cobrarImpuesto,
      costoPorArticulo: this.costoPorArticulo,
      sku: this.sku,
      codigoBarras: this.codigoBarras,
      inventarioConSeguimiento: this.inventarioConSeguimiento,
      cantidadDisponible: this.cantidadDisponible,
      venderSinExistencias: this.venderSinExistencias,
      productoFisico: this.productoFisico,
      peso: this.peso,
      unidadPeso: this.unidadPeso,
      paisOrigen: this.paisOrigen,
      codigoSA: this.codigoSA,
      estado: this.estado,
      tipoProducto: this.tipoProducto,
      proveedor: this.proveedor,
      etiquetas: this.etiquetas,
      fechaPublicacion: this.fechaPublicacion?.toISOString() || null,
      fechaArchivado: this.fechaArchivado?.toISOString() || null,
      fechaEliminado: this.fechaEliminado?.toISOString() || null,
      tiendaId: this.tiendaId,
      usuarioId: this.usuarioId,
    };
  }
}

/**
 * Evento de dominio que se dispara cuando se actualiza un producto
 */
export class ProductoActualizadoEvento extends EventoDominio {
  constructor(
    public readonly idProducto: string,
    public readonly titulo: string,
    public readonly descripcion: string | null,
    public readonly precio: number,
    public readonly precioComparacion: number | null,
    public readonly precioUnitario: string | null,
    public readonly cobrarImpuesto: boolean,
    public readonly costoPorArticulo: number | null,
    public readonly sku: string | null,
    public readonly codigoBarras: string | null,
    public readonly inventarioConSeguimiento: boolean,
    public readonly cantidadDisponible: number,
    public readonly venderSinExistencias: boolean,
    public readonly productoFisico: boolean,
    public readonly peso: number | null,
    public readonly unidadPeso: string | null,
    public readonly paisOrigen: string | null,
    public readonly codigoSA: string | null,
    public readonly estado: string,
    public readonly tipoProducto: string,
    public readonly proveedor: string | null,
    public readonly etiquetas: string[],
    public readonly fechaPublicacion: Date | null,
    public readonly fechaArchivado: Date | null,
    public readonly fechaEliminado: Date | null,
    public readonly tiendaId: string,
    public readonly usuarioId: string,
  ) {
    super('ProductoActualizado', 1);
  }

  /**
   * Crea un evento ProductoActualizado a partir de una entidad Producto
   */
  /**
   * Crea un evento ProductoActualizado a partir de una entidad Producto
   * @param producto - Entidad Producto válida
   * @throws {ExcepcionDominio} Si la entidad producto es inválida
   */
  static desdeProducto(producto: Producto): ProductoActualizadoEvento {
    // Validaciones de integridad de datos para producción
    if (!producto.id) {
      throw ExcepcionDominio.Respuesta400(
        'El ID del producto es requerido',
        'Producto.IDRequerido'
      );
    }

    if (!producto.titulo || producto.titulo.trim().length === 0) {
      throw ExcepcionDominio.Respuesta400(
        'El título del producto es requerido',
        'Producto.TituloRequerido'
      );
    }

    if (producto.precio <= 0) {
      throw ExcepcionDominio.Respuesta400(
        'El precio debe ser mayor a cero',
        'Producto.PrecioInvalido'
      );
    }

    return new ProductoActualizadoEvento(
      producto.id,
      producto.titulo,
      producto.descripcion,
      producto.precio,
      producto.precioComparacion,
      null, // precioUnitario no existe en Producto entity
      true, // cobrarImpuesto por defecto en producción
      null, // costoPorArticulo no existe en Producto entity
      producto.sku,
      producto.codigoBarras,
      producto.inventarioGestionado,
      producto.cantidadInventario,
      producto.permiteBackorder,
      producto.tipoProducto === 'FISICO',
      producto.peso,
      'g', // unidadPeso por defecto en gramos
      null, // paisOrigen no existe en Producto entity
      null, // codigoSA no existe en Producto entity
      producto.estado,
      producto.tipoProducto,
      producto.proveedor,
      producto.tags,
      producto.fechaPublicacion,
      producto.fechaArchivado,
      producto.fechaEliminado,
      producto.tiendaId,
      producto.creadorId
    );
  }

  protected obtenerDatosEvento(): any {
    return {
      idProducto: this.idProducto,
      titulo: this.titulo,
      descripcion: this.descripcion,
      precio: this.precio,
      precioComparacion: this.precioComparacion,
      precioUnitario: this.precioUnitario,
      cobrarImpuesto: this.cobrarImpuesto,
      costoPorArticulo: this.costoPorArticulo,
      sku: this.sku,
      codigoBarras: this.codigoBarras,
      inventarioConSeguimiento: this.inventarioConSeguimiento,
      cantidadDisponible: this.cantidadDisponible,
      venderSinExistencias: this.venderSinExistencias,
      productoFisico: this.productoFisico,
      peso: this.peso,
      unidadPeso: this.unidadPeso,
      paisOrigen: this.paisOrigen,
      codigoSA: this.codigoSA,
      estado: this.estado,
      tipoProducto: this.tipoProducto,
      proveedor: this.proveedor,
      etiquetas: this.etiquetas,
      fechaPublicacion: this.fechaPublicacion?.toISOString() || null,
      fechaArchivado: this.fechaArchivado?.toISOString() || null,
      fechaEliminado: this.fechaEliminado?.toISOString() || null,
      tiendaId: this.tiendaId,
      usuarioId: this.usuarioId,
    };
  }
}

/**
 * Evento de dominio que se dispara cuando se elimina un producto
 */
export class ProductoEliminadoEvento extends EventoDominio {
  constructor(
    public readonly idProducto: string,
    public readonly tiendaId: string,
    public readonly usuarioId: string,
  ) {
    super('ProductoEliminado', 1);
  }

  protected obtenerDatosEvento(): any {
    return {
      idProducto: this.idProducto,
      tiendaId: this.tiendaId,
      usuarioId: this.usuarioId,
    };
  }
}