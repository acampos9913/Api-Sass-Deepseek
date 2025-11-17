import { Inject, Injectable } from '@nestjs/common';
import { Producto } from '../entidades/producto.entity';
import type { RepositorioProducto } from '../interfaces/repositorio-producto.interface';
import { ExcepcionDominio } from '../../../comun/excepciones/excepcion-dominio';
import { ServicioRespuestaEstandar, RespuestaEstandar } from '../../../comun/aplicacion/servicios/servicio-respuesta-estandar';
import { ProductoCreadoEvento } from '../eventos/producto-creado.evento';
import { KafkaService } from '../../../comun/infraestructura/servicios/kafka.service';

/**
 * DTO para la creación de productos
 * Sigue los estándares de nomenclatura en español
 */
export interface CrearProductoDto {
  titulo: string;
  descripcion?: string;
  precio: number;
  precioComparacion?: number;
  sku?: string;
  codigoBarras?: string;
  peso?: number;
  ancho?: number;
  alto?: number;
  profundidad?: number;
  visible?: boolean;
  creadorId: string;
}

/**
 * Caso de uso para crear un nuevo producto
 * Incluye validaciones de negocio y lógica específica
 * Sigue los principios de Clean Architecture y estándares de codificación
 */
@Injectable()
export class CrearProductoCasoUso {
  constructor(
    @Inject('RepositorioProducto')
    private readonly repositorioProducto: RepositorioProducto,
    private readonly kafkaService: KafkaService,
  ) {}

  /**
   * Ejecuta el caso de uso de creación de producto
   * @param datos - Datos del producto a crear
   * @returns Promise con la respuesta estándar
   * @throws ExcepcionDominio si hay errores de validación
   */
  async ejecutar(datos: CrearProductoDto): Promise<RespuestaEstandar> {
    // Validar SKU único si se proporciona
    if (datos.sku) {
      const skuExiste = await this.repositorioProducto.existeSku(datos.sku);
      if (skuExiste) {
        throw ExcepcionDominio.Respuesta400(
          'El SKU ya existe en el sistema',
          'Producto.SkuDuplicado'
        );
      }
    }

    // Validar que el precio sea positivo
    if (datos.precio <= 0) {
      throw ExcepcionDominio.Respuesta400(
        'El precio debe ser mayor a cero',
        'Producto.PrecioInvalido'
      );
    }

    // Validar precio de comparación si se proporciona
    if (datos.precioComparacion && datos.precioComparacion <= datos.precio) {
      throw ExcepcionDominio.Respuesta400(
        'El precio de comparación debe ser mayor al precio de venta',
        'Producto.PrecioComparacionInvalido'
      );
    }

    // Crear la entidad de producto
    const producto = new Producto(
      this.generarId(), // En producción usaríamos una librería como nanoid
      datos.titulo,
      datos.descripcion || null,
      datos.precio,
      datos.precioComparacion || null,
      datos.sku || null,
      datos.codigoBarras || null,
      datos.peso || null,
      datos.ancho || null,
      datos.alto || null,
      datos.profundidad || null,
      datos.visible !== undefined ? datos.visible : true,
      new Date(),
      new Date(),
      datos.creadorId,
      'tienda-1', // tiendaId - valor por defecto para desarrollo
      null, // proveedor
      'ACTIVO', // estado
      true, // visibleTiendaOnline
      true, // visiblePointOfSale
      'FISICO', // tipoProducto
      true, // requiereEnvio
      true, // inventarioGestionado
      0, // cantidadInventario
      false, // permiteBackorder
      [], // tags
      null, // metatitulo
      null, // metadescripcion
      null, // slug
      null, // fechaPublicacion
      null, // fechaArchivado
      null, // fechaEliminado
    );

    // Guardar el producto en el repositorio
    const productoGuardado = await this.repositorioProducto.guardar(producto);

    // Emitir evento de dominio para sincronización con MongoDB
    const evento = ProductoCreadoEvento.desdeProducto(productoGuardado);
    await this.kafkaService.publicar(evento);

    // Convertir a DTO para la respuesta
    const productoDto = this.aDto(productoGuardado);

    // Construir respuesta estándar usando métodos estáticos
    return ServicioRespuestaEstandar.Respuesta201(
      'Producto creado exitosamente',
      productoDto,
      'Producto.CreadoExitosamente'
    );
  }

  /**
   * Genera un ID único para el producto
   * En producción se usaría una librería como nanoid
   */
  private generarId(): string {
    return `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Convierte una entidad de Producto a un DTO para la respuesta
   */
  private aDto(producto: Producto): any {
    return {
      id: producto.id,
      titulo: producto.titulo,
      descripcion: producto.descripcion,
      precio: producto.precio,
      precioComparacion: producto.precioComparacion,
      sku: producto.sku,
      codigoBarras: producto.codigoBarras,
      peso: producto.peso,
      ancho: producto.ancho,
      alto: producto.alto,
      profundidad: producto.profundidad,
      visible: producto.visible,
      fechaCreacion: producto.fechaCreacion,
      fechaActualizacion: producto.fechaActualizacion,
      creadorId: producto.creadorId,
      tiendaId: producto.tiendaId,
      proveedor: producto.proveedor,
      estado: producto.estado,
      visibleTiendaOnline: producto.visibleTiendaOnline,
      visiblePointOfSale: producto.visiblePointOfSale,
      tipoProducto: producto.tipoProducto,
      requiereEnvio: producto.requiereEnvio,
      inventarioGestionado: producto.inventarioGestionado,
      cantidadInventario: producto.cantidadInventario,
      permiteBackorder: producto.permiteBackorder,
      tags: producto.tags,
      metatitulo: producto.metatitulo,
      metadescripcion: producto.metadescripcion,
      slug: producto.slug,
      fechaPublicacion: producto.fechaPublicacion,
      fechaArchivado: producto.fechaArchivado,
      fechaEliminado: producto.fechaEliminado,
      tieneDescuento: producto.tieneDescuento(),
      porcentajeDescuento: producto.obtenerPorcentajeDescuento(),
      estaDisponible: producto.estaDisponible(),
      estaPublicado: producto.estaPublicado(),
    };
  }
}