import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';
import { TipoRedSocial } from '../../dominio/enums/tipo-red-social.enum';
import type { 
  AdaptadorRedSocial, 
  DatosProductoParaPublicacion, 
  ResultadoPublicacion 
} from '../../dominio/interfaces/adaptador-red-social.interface';

/**
 * Adaptador para TikTok que implementa la publicación de productos
 * Utiliza TikTok Shop API para publicar productos en TikTok Shop
 */
@Injectable()
export class TiktokAdaptador implements AdaptadorRedSocial {
  private readonly baseUrl = 'https://open-api.tiktokglobalshop.com';
  private readonly apiVersion = '202309';

  constructor(private readonly httpService: HttpService) {}

  /**
   * Obtiene el tipo de red social que maneja este adaptador
   */
  obtenerTipoRedSocial(): TipoRedSocial {
    return TipoRedSocial.TIKTOK;
  }

  /**
   * Publica un producto en TikTok Shop
   * @param producto - Datos del producto a publicar
   * @param tokenAcceso - Token de acceso para TikTok Shop API
   * @param configuracionAdicional - Configuración adicional (seller_id, etc.)
   * @returns Resultado de la publicación
   */
  async publicarProducto(
    producto: DatosProductoParaPublicacion,
    tokenAcceso: string,
    configuracionAdicional?: Record<string, any>
  ): Promise<ResultadoPublicacion> {
    try {
      const sellerId = configuracionAdicional?.seller_id;
      
      if (!sellerId) {
        throw new Error('Se requiere el ID del vendedor (seller_id) de TikTok Shop');
      }

      // 1. Crear el producto en TikTok Shop
      const productoTiktok = await this.crearProducto(
        producto,
        tokenAcceso,
        sellerId
      );

      // 2. Publicar el producto (cambiar estado a publicado)
      await this.publicarProductoEnTienda(
        productoTiktok.data.product_id,
        tokenAcceso,
        sellerId
      );

      return {
        exito: true,
        id_externo: productoTiktok.data.product_id,
        url_publicacion: `https://www.tiktok.com/@${sellerId}/product/${productoTiktok.data.product_id}`,
        mensaje: 'Producto publicado exitosamente en TikTok Shop',
        datos_adicionales: {
          producto_id_tiktok: productoTiktok.data.product_id,
          seller_id: sellerId,
          sku: productoTiktok.data.skus?.[0]?.seller_sku,
        },
        fecha_publicacion: new Date(),
      };

    } catch (error) {
      console.error('Error publicando producto en TikTok:', error);
      return {
        exito: false,
        mensaje: this.obtenerMensajeErrorTiktok(error),
        fecha_publicacion: new Date(),
      };
    }
  }

  /**
   * Actualiza un producto previamente publicado en TikTok Shop
   */
  async actualizarProducto(
    idExterno: string,
    producto: DatosProductoParaPublicacion,
    tokenAcceso: string,
    configuracionAdicional?: Record<string, any>
  ): Promise<ResultadoPublicacion> {
    try {
      const sellerId = configuracionAdicional?.seller_id;
      
      if (!sellerId) {
        throw new Error('Se requiere el ID del vendedor (seller_id) de TikTok Shop');
      }

      // Actualizar el producto en TikTok Shop
      await this.actualizarProductoExistente(
        idExterno,
        producto,
        tokenAcceso,
        sellerId
      );

      return {
        exito: true,
        id_externo: idExterno,
        mensaje: 'Producto actualizado exitosamente en TikTok Shop',
        datos_adicionales: {
          producto_id_tiktok: idExterno,
          seller_id: sellerId,
        },
        fecha_publicacion: new Date(),
      };

    } catch (error) {
      console.error('Error actualizando producto en TikTok:', error);
      return {
        exito: false,
        mensaje: this.obtenerMensajeErrorTiktok(error),
        fecha_publicacion: new Date(),
      };
    }
  }

  /**
   * Elimina un producto de TikTok Shop
   */
  async eliminarProducto(
    idExterno: string,
    tokenAcceso: string,
    configuracionAdicional?: Record<string, any>
  ): Promise<ResultadoPublicacion> {
    try {
      const sellerId = configuracionAdicional?.seller_id;
      
      if (!sellerId) {
        throw new Error('Se requiere el ID del vendedor (seller_id) de TikTok Shop');
      }

      // Eliminar producto de TikTok Shop
      await this.eliminarProductoExistente(
        idExterno,
        tokenAcceso,
        sellerId
      );

      return {
        exito: true,
        mensaje: 'Producto eliminado exitosamente de TikTok Shop',
        fecha_publicacion: new Date(),
      };

    } catch (error) {
      console.error('Error eliminando producto de TikTok:', error);
      return {
        exito: false,
        mensaje: this.obtenerMensajeErrorTiktok(error),
        fecha_publicacion: new Date(),
      };
    }
  }

  /**
   * Valida que el token de acceso sea válido
   */
  async validarToken(tokenAcceso: string): Promise<{
    valido: boolean;
    mensaje?: string;
    permisos?: string[];
    datosCuenta?: Record<string, any>;
  }> {
    try {
      const sellerId = 'seller_id_placeholder'; // En una implementación real, esto vendría de la configuración

      const response: AxiosResponse<any> = await firstValueFrom(
        this.httpService.get(
          `${this.baseUrl}/api/sellers/${sellerId}/profile`,
          {
            headers: {
              'Authorization': `Bearer ${tokenAcceso}`,
              'Content-Type': 'application/json',
            },
          }
        )
      );

      const datos = response.data;

      return {
        valido: true,
        permisos: ['product.management', 'order.management'],
        datosCuenta: {
          seller_id: datos.data?.seller_id,
          shop_name: datos.data?.shop_name,
          region: datos.data?.region,
          status: datos.data?.status,
        },
      };

    } catch (error) {
      console.error('Error validando token de TikTok:', error);
      return {
        valido: false,
        mensaje: 'Token de acceso inválido o expirado',
      };
    }
  }

  /**
   * Obtiene los permisos requeridos para publicar productos
   */
  obtenerPermisosRequeridos(): string[] {
    return [
      'product.management',
      'order.management',
      'logistics.management',
    ];
  }

  /**
   * Crea un producto en TikTok Shop
   */
  private async crearProducto(
    producto: DatosProductoParaPublicacion,
    tokenAcceso: string,
    sellerId: string
  ): Promise<any> {
    const datosProducto = {
      main_images: producto.imagen_url ? [producto.imagen_url] : [],
      product_name: producto.nombre,
      description: producto.descripcion,
      category_id: this.obtenerCategoriaTiktok(producto.categoria),
      skus: [
        {
          seller_sku: producto.sku || `SKU_${producto.id}`,
          original_price: producto.precio,
          available_stock: producto.cantidad,
          package_dimensions: {
            package_height: 10,
            package_length: 10,
            package_width: 10,
            package_weight: 1,
          },
        },
      ],
      brand: {
        id: producto.tienda_id,
        name: producto.tienda_id,
      },
      package_dimensions: {
        package_height: 10,
        package_length: 10,
        package_width: 10,
        package_weight: 1,
      },
      package_weight: 1,
      product_attributes: {
        condition: 'NEW',
      },
    };

    const response: AxiosResponse<any> = await firstValueFrom(
      this.httpService.post(
        `${this.baseUrl}/api/products/${this.apiVersion}/create`,
        datosProducto,
        {
          headers: {
            'Authorization': `Bearer ${tokenAcceso}`,
            'Content-Type': 'application/json',
            'X-Shop-Id': sellerId,
          },
        }
      )
    );

    return response.data;
  }

  /**
   * Actualiza un producto existente en TikTok Shop
   */
  private async actualizarProductoExistente(
    productoId: string,
    producto: DatosProductoParaPublicacion,
    tokenAcceso: string,
    sellerId: string
  ): Promise<any> {
    const datosActualizacion = {
      product_id: productoId,
      product_name: producto.nombre,
      description: producto.descripcion,
      main_images: producto.imagen_url ? [producto.imagen_url] : [],
      skus: [
        {
          seller_sku: producto.sku || `SKU_${producto.id}`,
          original_price: producto.precio,
          available_stock: producto.cantidad,
        },
      ],
    };

    const response: AxiosResponse<any> = await firstValueFrom(
      this.httpService.put(
        `${this.baseUrl}/api/products/${this.apiVersion}/update`,
        datosActualizacion,
        {
          headers: {
            'Authorization': `Bearer ${tokenAcceso}`,
            'Content-Type': 'application/json',
            'X-Shop-Id': sellerId,
          },
        }
      )
    );

    return response.data;
  }

  /**
   * Publica un producto en la tienda de TikTok
   */
  private async publicarProductoEnTienda(
    productoId: string,
    tokenAcceso: string,
    sellerId: string
  ): Promise<any> {
    const datosPublicacion = {
      product_ids: [productoId],
      operation: 'ACTIVATE',
    };

    const response: AxiosResponse<any> = await firstValueFrom(
      this.httpService.post(
        `${this.baseUrl}/api/products/${this.apiVersion}/activate`,
        datosPublicacion,
        {
          headers: {
            'Authorization': `Bearer ${tokenAcceso}`,
            'Content-Type': 'application/json',
            'X-Shop-Id': sellerId,
          },
        }
      )
    );

    return response.data;
  }

  /**
   * Elimina un producto existente de TikTok Shop
   */
  private async eliminarProductoExistente(
    productoId: string,
    tokenAcceso: string,
    sellerId: string
  ): Promise<any> {
    const datosEliminacion = {
      product_ids: [productoId],
    };

    const response: AxiosResponse<any> = await firstValueFrom(
      this.httpService.delete(
        `${this.baseUrl}/api/products/${this.apiVersion}/delete`,
        {
          headers: {
            'Authorization': `Bearer ${tokenAcceso}`,
            'Content-Type': 'application/json',
            'X-Shop-Id': sellerId,
          },
          data: datosEliminacion,
        }
      )
    );

    return response.data;
  }

  /**
   * Obtiene la categoría de TikTok basada en la categoría del producto
   */
  private obtenerCategoriaTiktok(categoria?: string): string {
    // Mapeo simplificado de categorías
    const mapeoCategorias: Record<string, string> = {
      'ropa': '670001',
      'electronica': '670002', 
      'hogar': '670003',
      'deportes': '670004',
      'belleza': '670005',
      'juguetes': '670006',
      'alimentos': '670007',
    };

    if (!categoria) {
      return '670000'; // Categoría general por defecto
    }

    const categoriaLower = categoria.toLowerCase();
    return mapeoCategorias[categoriaLower] || '670000';
  }

  /**
   * Obtiene un mensaje de error legible de TikTok
   */
  private obtenerMensajeErrorTiktok(error: any): string {
    if (error.response?.data?.message) {
      const errorData = error.response.data;
      
      // Mapeo de errores comunes de TikTok
      if (errorData.code === 'INVALID_TOKEN') {
        return 'Token de acceso inválido o expirado';
      }
      if (errorData.code === 'PERMISSION_DENIED') {
        return 'Permisos insuficientes para realizar esta acción';
      }
      if (errorData.code === 'PRODUCT_NOT_FOUND') {
        return 'Producto no encontrado en TikTok Shop';
      }
      
      return `Error de TikTok: ${errorData.message} (Código: ${errorData.code})`;
    }

    if (error.code === 'ETIMEDOUT') {
      return 'Timeout al conectar con TikTok. Intente nuevamente.';
    }

    return 'Error desconocido al comunicarse con TikTok';
  }
}