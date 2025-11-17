import { Inject, Injectable } from '@nestjs/common';
import { Producto } from '../entidades/producto.entity';
import type { RepositorioProducto } from '../interfaces/repositorio-producto.interface';
import { ExcepcionDominio } from '../../../comun/excepciones/excepcion-dominio';
import { ServicioRespuestaEstandar, RespuestaEstandar } from '../../../comun/aplicacion/servicios/servicio-respuesta-estandar';

/**
 * Caso de uso para obtener un producto por ID desde PostgreSQL (fuente de verdad)
 * Optimizado para operaciones de escritura y gestión administrativa
 */
@Injectable()
export class ObtenerProductoPorIdCasoUso {
  constructor(
    @Inject('RepositorioProducto')
    private readonly repositorioProducto: RepositorioProducto,
  ) {}

  /**
   * Ejecuta el caso de uso de obtener producto por ID
   * @param id - ID del producto a buscar
   * @returns Promise con la respuesta estándar
   */
  async ejecutar(id: string): Promise<RespuestaEstandar> {
    // Validar que el ID no esté vacío
    if (!id || id.trim().length === 0) {
      throw ExcepcionDominio.Respuesta400(
        'El ID del producto es requerido',
        'Producto.IdRequerido'
      );
    }

    // Buscar producto en el repositorio
    const producto = await this.repositorioProducto.buscarPorId(id.trim());

    if (!producto) {
      throw ExcepcionDominio.Respuesta404(
        'Producto no encontrado',
        'Producto.NoEncontrado'
      );
    }

    return ServicioRespuestaEstandar.Respuesta200(
      'Producto obtenido exitosamente desde PostgreSQL',
      producto,
      'Producto.ObtenidoExitosamente'
    );
  }

  /**
   * Ejecuta el caso de uso de obtener producto por SKU
   * @param sku - SKU del producto a buscar
   * @returns Promise con la respuesta estándar
   */
  async ejecutarPorSku(sku: string): Promise<RespuestaEstandar> {
    if (!sku || sku.trim().length === 0) {
      throw ExcepcionDominio.Respuesta400(
        'El SKU del producto es requerido',
        'Producto.SkuRequerido'
      );
    }

    const producto = await this.repositorioProducto.buscarPorSku(sku.trim());

    if (!producto) {
      throw ExcepcionDominio.Respuesta404(
        'Producto no encontrado',
        'Producto.NoEncontrado'
      );
    }

    return ServicioRespuestaEstandar.Respuesta200(
      'Producto obtenido exitosamente por SKU',
      producto,
      'Producto.ObtenidoExitosamentePorSku'
    );
  }

  /**
   * Ejecuta el caso de uso de obtener producto por slug
   * @param slug - Slug del producto a buscar
   * @returns Promise con la respuesta estándar
   */
  async ejecutarPorSlug(slug: string): Promise<RespuestaEstandar> {
    if (!slug || slug.trim().length === 0) {
      throw ExcepcionDominio.Respuesta400(
        'El slug del producto es requerido',
        'Producto.SlugRequerido'
      );
    }

    const producto = await this.repositorioProducto.buscarPorSlug(slug.trim());

    if (!producto) {
      throw ExcepcionDominio.Respuesta404(
        'Producto no encontrado',
        'Producto.NoEncontrado'
      );
    }

    return ServicioRespuestaEstandar.Respuesta200(
      'Producto obtenido exitosamente por slug',
      producto,
      'Producto.ObtenidoExitosamentePorSlug'
    );
  }
}