import { Injectable, Inject } from '@nestjs/common';
import { Producto } from '../entidades/producto.entity';
import { RepositorioProducto } from '../interfaces/repositorio-producto.interface';
import { ServicioRespuestaEstandar } from '../../../comun/aplicacion/servicios/servicio-respuesta-estandar';
import { ExcepcionDominio } from '../../../comun/excepciones/excepcion-dominio';
import { ActualizarProductoDto } from '../../aplicacion/dto/actualizar-producto.dto';

/**
 * Caso de uso para actualizar productos existentes
 * Implementa todas las validaciones de negocio para uso en producción
 */
@Injectable()
export class ActualizarProductoCasoUso {
  constructor(
    @Inject('RepositorioProducto')
    private readonly repositorioProducto: RepositorioProducto,
  ) {}

  /**
   * Ejecuta la actualización de un producto con todas las validaciones de negocio
   */
  async ejecutar(
    id: string,
    datosActualizacion: ActualizarProductoDto,
    usuarioId: string,
  ) {
    try {
      // 1. Validar que el producto existe
      const productoExistente = await this.repositorioProducto.encontrarPorId(id);
      if (!productoExistente) {
        throw ExcepcionDominio.Respuesta404(
          'Producto no encontrado',
          'Producto.NoEncontrado'
        );
      }

      // 2. Validar permisos de usuario (solo creador o admin puede actualizar)
      if (productoExistente.creadorId !== usuarioId) {
        // TODO: Verificar si el usuario es administrador
        throw ExcepcionDominio.Respuesta403(
          'No tienes permisos para actualizar este producto',
          'Producto.SinPermisosActualizacion'
        );
      }

      // 3. Validar SKU único si se está actualizando
      if (datosActualizacion.sku && datosActualizacion.sku !== productoExistente.sku) {
        await this.validarSkuUnico(datosActualizacion.sku, id);
      }

      // 4. Validar precio de comparación
      if (datosActualizacion.precioComparacion && datosActualizacion.precio) {
        this.validarPrecioComparacion(
          datosActualizacion.precio,
          datosActualizacion.precioComparacion
        );
      }

      // 5. Crear producto actualizado
      const productoActualizado = this.crearProductoActualizado(
        productoExistente,
        datosActualizacion
      );

      // 6. Guardar en base de datos
      const productoGuardado = await this.repositorioProducto.actualizar(
        id,
        productoActualizado
      );

      // 7. Retornar respuesta estándar
      return ServicioRespuestaEstandar.Respuesta200(
        this.aDto(productoGuardado),
        'Producto actualizado exitosamente',
        'Producto.ActualizadoExitosamente'
      );

    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      // Log del error para producción
      console.error(`Error al actualizar producto ${id}:`, error);
      throw ExcepcionDominio.Respuesta500(
        'Error interno del servidor al actualizar producto',
        'Servidor.ErrorActualizacionProducto'
      );
    }
  }

  /**
   * Valida que el SKU sea único en el sistema
   */
  private async validarSkuUnico(sku: string, productoIdExcluido: string): Promise<void> {
    if (!sku) return;

    const productoConMismoSku = await this.repositorioProducto.encontrarPorSku(sku);
    
    if (productoConMismoSku && productoConMismoSku.id !== productoIdExcluido) {
      throw ExcepcionDominio.Respuesta400(
        'El SKU ya existe en el sistema',
        'Producto.SkuDuplicado'
      );
    }
  }

  /**
   * Valida que el precio de comparación sea mayor al precio de venta
   */
  private validarPrecioComparacion(precio: number, precioComparacion: number): void {
    if (precioComparacion <= precio) {
      throw ExcepcionDominio.Respuesta400(
        'El precio de comparación debe ser mayor al precio de venta',
        'Producto.PrecioComparacionInvalido'
      );
    }
  }

  /**
   * Crea una nueva instancia de producto con los datos actualizados
   */
  private crearProductoActualizado(
    productoExistente: Producto,
    datosActualizacion: ActualizarProductoDto
  ): Producto {
    let producto = productoExistente;

    // Actualizar campos básicos
    if (datosActualizacion.titulo !== undefined) {
      producto = producto.actualizarTitulo(datosActualizacion.titulo);
    }

    if (datosActualizacion.descripcion !== undefined) {
      producto = producto.actualizarDescripcion(datosActualizacion.descripcion);
    }

    if (datosActualizacion.precio !== undefined) {
      producto = producto.actualizarPrecio(
        datosActualizacion.precio,
        datosActualizacion.precioComparacion
      );
    }

    // Actualizar visibilidad
    if (datosActualizacion.visible !== undefined) {
      producto = producto.actualizarVisibilidad(datosActualizacion.visible);
    }

    // Actualizar visibilidad por canal
    if (datosActualizacion.visibleTiendaOnline !== undefined || 
        datosActualizacion.visiblePointOfSale !== undefined) {
      producto = producto.actualizarVisibilidadCanales(
        datosActualizacion.visibleTiendaOnline ?? producto.visibleTiendaOnline,
        datosActualizacion.visiblePointOfSale ?? producto.visiblePointOfSale
      );
    }

    // Actualizar inventario
    if (datosActualizacion.cantidadInventario !== undefined ||
        datosActualizacion.inventarioGestionado !== undefined) {
      producto = producto.actualizarInventario(
        datosActualizacion.cantidadInventario ?? producto.cantidadInventario,
        datosActualizacion.inventarioGestionado ?? producto.inventarioGestionado
      );
    }

    // Actualizar estado
    if (datosActualizacion.estado) {
      producto = producto.cambiarEstado(datosActualizacion.estado as any);
    }

    // Actualizar SEO
    if (datosActualizacion.metatitulo !== undefined) {
      producto = producto.actualizarMetatitulo(datosActualizacion.metatitulo);
    }

    if (datosActualizacion.metadescripcion !== undefined) {
      producto = producto.actualizarMetadescripcion(datosActualizacion.metadescripcion);
    }

    if (datosActualizacion.slug !== undefined) {
      producto = producto.actualizarSlug(datosActualizacion.slug);
    }

    return producto;
  }

  /**
   * Convierte la entidad Producto a DTO de respuesta
   */
  private aDto(producto: Producto) {
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
      fechaCreacion: producto.fechaCreacion,
      fechaActualizacion: producto.fechaActualizacion,
      fechaPublicacion: producto.fechaPublicacion,
      fechaArchivado: producto.fechaArchivado,
      fechaEliminado: producto.fechaEliminado,
    };
  }
}