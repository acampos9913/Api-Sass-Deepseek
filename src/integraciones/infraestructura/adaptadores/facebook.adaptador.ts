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
 * Adaptador para Facebook que implementa la publicación de productos
 * Utiliza Facebook Graph API para publicar productos en páginas de Facebook
 */
@Injectable()
export class FacebookAdaptador implements AdaptadorRedSocial {
  private readonly baseUrl = 'https://graph.facebook.com/v19.0';

  constructor(private readonly httpService: HttpService) {}

  /**
   * Obtiene el tipo de red social que maneja este adaptador
   */
  obtenerTipoRedSocial(): TipoRedSocial {
    return TipoRedSocial.FACEBOOK;
  }

  /**
   * Publica un producto en Facebook
   * @param producto - Datos del producto a publicar
   * @param tokenAcceso - Token de acceso para Facebook Graph API
   * @param configuracionAdicional - Configuración adicional (page_id, etc.)
   * @returns Resultado de la publicación
   */
  async publicarProducto(
    producto: DatosProductoParaPublicacion,
    tokenAcceso: string,
    configuracionAdicional?: Record<string, any>
  ): Promise<ResultadoPublicacion> {
    try {
      const paginaId = configuracionAdicional?.pagina_id;
      
      if (!paginaId) {
        throw new Error('Se requiere el ID de la página de Facebook');
      }

      // 1. Primero creamos el producto en el catálogo de Facebook
      const productoFacebook = await this.crearProductoEnCatalogo(
        producto,
        tokenAcceso,
        paginaId
      );

      // 2. Luego creamos la publicación con el producto
      const publicacion = await this.crearPublicacion(
        producto,
        productoFacebook.id,
        tokenAcceso,
        paginaId
      );

      return {
        exito: true,
        id_externo: publicacion.id,
        url_publicacion: `https://facebook.com/${publicacion.id}`,
        mensaje: 'Producto publicado exitosamente en Facebook',
        datos_adicionales: {
          producto_id_facebook: productoFacebook.id,
          publicacion_id: publicacion.id,
          pagina_id: paginaId,
        },
        fecha_publicacion: new Date(),
      };

    } catch (error) {
      console.error('Error publicando producto en Facebook:', error);
      return {
        exito: false,
        mensaje: this.obtenerMensajeErrorFacebook(error),
        fecha_publicacion: new Date(),
      };
    }
  }

  /**
   * Actualiza un producto previamente publicado en Facebook
   */
  async actualizarProducto(
    idExterno: string,
    producto: DatosProductoParaPublicacion,
    tokenAcceso: string,
    configuracionAdicional?: Record<string, any>
  ): Promise<ResultadoPublicacion> {
    try {
      const paginaId = configuracionAdicional?.pagina_id;
      
      if (!paginaId) {
        throw new Error('Se requiere el ID de la página de Facebook');
      }

      // Actualizar el producto en el catálogo
      await this.actualizarProductoEnCatalogo(
        idExterno,
        producto,
        tokenAcceso
      );

      return {
        exito: true,
        id_externo: idExterno,
        mensaje: 'Producto actualizado exitosamente en Facebook',
        datos_adicionales: {
          producto_id_facebook: idExterno,
          pagina_id: paginaId,
        },
        fecha_publicacion: new Date(),
      };

    } catch (error) {
      console.error('Error actualizando producto en Facebook:', error);
      return {
        exito: false,
        mensaje: this.obtenerMensajeErrorFacebook(error),
        fecha_publicacion: new Date(),
      };
    }
  }

  /**
   * Elimina un producto de Facebook
   */
  async eliminarProducto(
    idExterno: string,
    tokenAcceso: string,
    configuracionAdicional?: Record<string, any>
  ): Promise<ResultadoPublicacion> {
    try {
      // Eliminar producto del catálogo
      await firstValueFrom(
        this.httpService.delete(`${this.baseUrl}/${idExterno}`, {
          params: { access_token: tokenAcceso },
        })
      );

      return {
        exito: true,
        mensaje: 'Producto eliminado exitosamente de Facebook',
        fecha_publicacion: new Date(),
      };

    } catch (error) {
      console.error('Error eliminando producto de Facebook:', error);
      return {
        exito: false,
        mensaje: this.obtenerMensajeErrorFacebook(error),
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
      const response: AxiosResponse<any> = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/me`, {
          params: {
            access_token: tokenAcceso,
            fields: 'id,name,accounts{id,name,access_token,category}',
          },
        })
      );

      const datos = response.data;
      const paginas = datos.accounts?.data || [];

      return {
        valido: true,
        permisos: ['catalog_management', 'pages_manage_posts'],
        datosCuenta: {
          usuario_id: datos.id,
          usuario_nombre: datos.name,
          paginas: paginas.map((pagina: any) => ({
            id: pagina.id,
            nombre: pagina.name,
            categoria: pagina.category,
          })),
        },
      };

    } catch (error) {
      console.error('Error validando token de Facebook:', error);
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
      'catalog_management',
      'pages_manage_posts',
      'pages_read_engagement',
      'business_management',
    ];
  }

  /**
   * Crea un producto en el catálogo de Facebook
   */
  private async crearProductoEnCatalogo(
    producto: DatosProductoParaPublicacion,
    tokenAcceso: string,
    paginaId: string
  ): Promise<any> {
    const datosProducto = {
      name: producto.nombre,
      description: producto.descripcion,
      price: producto.precio,
      currency: producto.moneda || 'USD',
      condition: 'new',
      availability: producto.cantidad > 0 ? 'in stock' : 'out of stock',
      image_url: producto.imagen_url,
      url: `${process.env.APP_URL}/productos/${producto.id}`,
      category: producto.categoria || 'General',
      brand: producto.tienda_id,
      retailer_id: producto.sku || producto.id,
    };

    const response: AxiosResponse<any> = await firstValueFrom(
      this.httpService.post(
        `${this.baseUrl}/${paginaId}/products`,
        datosProducto,
        {
          params: { access_token: tokenAcceso },
        }
      )
    );

    return response.data;
  }

  /**
   * Actualiza un producto en el catálogo de Facebook
   */
  private async actualizarProductoEnCatalogo(
    productoId: string,
    producto: DatosProductoParaPublicacion,
    tokenAcceso: string
  ): Promise<any> {
    const datosActualizacion = {
      name: producto.nombre,
      description: producto.descripcion,
      price: producto.precio,
      availability: producto.cantidad > 0 ? 'in stock' : 'out of stock',
      image_url: producto.imagen_url,
    };

    const response: AxiosResponse<any> = await firstValueFrom(
      this.httpService.post(
        `${this.baseUrl}/${productoId}`,
        datosActualizacion,
        {
          params: { access_token: tokenAcceso },
        }
      )
    );

    return response.data;
  }

  /**
   * Crea una publicación con el producto en Facebook
   */
  private async crearPublicacion(
    producto: DatosProductoParaPublicacion,
    productoId: string,
    tokenAcceso: string,
    paginaId: string
  ): Promise<any> {
    const mensaje = `${producto.nombre}\n\n${producto.descripcion}\n\nPrecio: $${producto.precio}\n\nDisponible en nuestra tienda online.`;

    const datosPublicacion = {
      message: mensaje,
      attached_media: `[{"media_fbid":"${productoId}"}]`,
      published: true,
    };

    const response: AxiosResponse<any> = await firstValueFrom(
      this.httpService.post(
        `${this.baseUrl}/${paginaId}/feed`,
        datosPublicacion,
        {
          params: { access_token: tokenAcceso },
        }
      )
    );

    return response.data;
  }

  /**
   * Obtiene un mensaje de error legible de Facebook
   */
  private obtenerMensajeErrorFacebook(error: any): string {
    if (error.response?.data?.error) {
      const errorData = error.response.data.error;
      return `Error de Facebook: ${errorData.message} (Código: ${errorData.code})`;
    }

    if (error.code === 'ETIMEDOUT') {
      return 'Timeout al conectar con Facebook. Intente nuevamente.';
    }

    return 'Error desconocido al comunicarse con Facebook';
  }
}