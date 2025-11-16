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
 * Adaptador para WhatsApp Business que implementa la publicación de productos
 * Utiliza WhatsApp Business API para enviar mensajes con productos a clientes
 */
@Injectable()
export class WhatsappAdaptador implements AdaptadorRedSocial {
  private readonly baseUrl = 'https://graph.facebook.com/v19.0';

  constructor(private readonly httpService: HttpService) {}

  /**
   * Obtiene el tipo de red social que maneja este adaptador
   */
  obtenerTipoRedSocial(): TipoRedSocial {
    return TipoRedSocial.WHATSAPP;
  }

  /**
   * Publica un producto en el catálogo de WhatsApp Business
   * @param producto - Datos del producto a publicar
   * @param tokenAcceso - Token de acceso para WhatsApp Business API
   * @param configuracionAdicional - Configuración adicional (catalog_id, etc.)
   * @returns Resultado de la publicación
   */
  async publicarProducto(
    producto: DatosProductoParaPublicacion,
    tokenAcceso: string,
    configuracionAdicional?: Record<string, any>
  ): Promise<ResultadoPublicacion> {
    try {
      const catalogId = configuracionAdicional?.catalog_id;
      
      if (!catalogId) {
        throw new Error('Se requiere el ID del catálogo (catalog_id) de WhatsApp Business');
      }

      // Crear el producto en el catálogo de WhatsApp Business
      const productoCreado = await this.crearProductoEnCatalogo(
        producto,
        tokenAcceso,
        catalogId
      );

      return {
        exito: true,
        id_externo: productoCreado.id,
        url_publicacion: `https://wa.me/c/${catalogId}/${productoCreado.id}`,
        mensaje: 'Producto publicado exitosamente en el catálogo de WhatsApp Business',
        datos_adicionales: {
          producto_id_whatsapp: productoCreado.id,
          catalog_id: catalogId,
          retailer_id: productoCreado.retailer_id,
        },
        fecha_publicacion: new Date(),
      };

    } catch (error) {
      console.error('Error publicando producto en WhatsApp:', error);
      return {
        exito: false,
        mensaje: this.obtenerMensajeErrorWhatsapp(error),
        fecha_publicacion: new Date(),
      };
    }
  }

  /**
   * Actualiza un producto previamente publicado en el catálogo de WhatsApp Business
   */
  async actualizarProducto(
    idExterno: string,
    producto: DatosProductoParaPublicacion,
    tokenAcceso: string,
    configuracionAdicional?: Record<string, any>
  ): Promise<ResultadoPublicacion> {
    try {
      const catalogId = configuracionAdicional?.catalog_id;
      
      if (!catalogId) {
        throw new Error('Se requiere el ID del catálogo (catalog_id) de WhatsApp Business');
      }

      // Actualizar el producto en el catálogo
      await this.actualizarProductoEnCatalogo(
        idExterno,
        producto,
        tokenAcceso,
        catalogId
      );

      return {
        exito: true,
        id_externo: idExterno,
        mensaje: 'Producto actualizado exitosamente en el catálogo de WhatsApp Business',
        datos_adicionales: {
          producto_id_whatsapp: idExterno,
          catalog_id: catalogId,
        },
        fecha_publicacion: new Date(),
      };

    } catch (error) {
      console.error('Error actualizando producto en WhatsApp:', error);
      return {
        exito: false,
        mensaje: this.obtenerMensajeErrorWhatsapp(error),
        fecha_publicacion: new Date(),
      };
    }
  }

  /**
   * Elimina un producto del catálogo de WhatsApp Business
   */
  async eliminarProducto(
    idExterno: string,
    tokenAcceso: string,
    configuracionAdicional?: Record<string, any>
  ): Promise<ResultadoPublicacion> {
    try {
      const catalogId = configuracionAdicional?.catalog_id;
      
      if (!catalogId) {
        throw new Error('Se requiere el ID del catálogo (catalog_id) de WhatsApp Business');
      }

      // Eliminar producto del catálogo
      await this.eliminarProductoDelCatalogo(
        idExterno,
        tokenAcceso,
        catalogId
      );

      return {
        exito: true,
        mensaje: 'Producto eliminado exitosamente del catálogo de WhatsApp Business',
        fecha_publicacion: new Date(),
      };

    } catch (error) {
      console.error('Error eliminando producto de WhatsApp:', error);
      return {
        exito: false,
        mensaje: this.obtenerMensajeErrorWhatsapp(error),
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
            fields: 'id,name,whatsapp_business_management',
          },
        })
      );

      const datos = response.data;

      return {
        valido: true,
        permisos: ['whatsapp_business_management', 'whatsapp_business_messaging'],
        datosCuenta: {
          business_id: datos.id,
          business_name: datos.name,
          whatsapp_management: datos.whatsapp_business_management,
        },
      };

    } catch (error) {
      console.error('Error validando token de WhatsApp:', error);
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
      'whatsapp_business_management',
      'whatsapp_business_messaging',
    ];
  }

  /**
   * Crea un producto en el catálogo de WhatsApp Business
   */
  private async crearProductoEnCatalogo(
    producto: DatosProductoParaPublicacion,
    tokenAcceso: string,
    catalogId: string
  ): Promise<any> {
    const datosProducto = {
      name: producto.nombre,
      description: producto.descripcion,
      retailer_id: producto.sku || producto.id,
      price: Math.round(producto.precio * 100), // WhatsApp espera el precio en centavos
      currency: producto.moneda || 'USD',
      image_url: producto.imagen_url,
      url: `${process.env.APP_URL || 'https://tienda.com'}/productos/${producto.id}`,
      is_hidden: false,
      availability: producto.cantidad > 0 ? 'IN_STOCK' : 'OUT_OF_STOCK',
      condition: 'NEW',
    };

    const response: AxiosResponse<any> = await firstValueFrom(
      this.httpService.post(
        `${this.baseUrl}/${catalogId}/products`,
        datosProducto,
        {
          headers: {
            'Authorization': `Bearer ${tokenAcceso}`,
            'Content-Type': 'application/json',
          },
        }
      )
    );

    return response.data;
  }

  /**
   * Actualiza un producto existente en el catálogo de WhatsApp Business
   */
  private async actualizarProductoEnCatalogo(
    productoId: string,
    producto: DatosProductoParaPublicacion,
    tokenAcceso: string,
    catalogId: string
  ): Promise<any> {
    const datosActualizacion = {
      name: producto.nombre,
      description: producto.descripcion,
      price: Math.round(producto.precio * 100), // WhatsApp espera el precio en centavos
      image_url: producto.imagen_url,
      availability: producto.cantidad > 0 ? 'IN_STOCK' : 'OUT_OF_STOCK',
    };

    const response: AxiosResponse<any> = await firstValueFrom(
      this.httpService.post(
        `${this.baseUrl}/${catalogId}/products/${productoId}`,
        datosActualizacion,
        {
          headers: {
            'Authorization': `Bearer ${tokenAcceso}`,
            'Content-Type': 'application/json',
          },
        }
      )
    );

    return response.data;
  }

  /**
   * Elimina un producto del catálogo de WhatsApp Business
   */
  private async eliminarProductoDelCatalogo(
    productoId: string,
    tokenAcceso: string,
    catalogId: string
  ): Promise<any> {
    const response: AxiosResponse<any> = await firstValueFrom(
      this.httpService.delete(
        `${this.baseUrl}/${catalogId}/products/${productoId}`,
        {
          headers: {
            'Authorization': `Bearer ${tokenAcceso}`,
            'Content-Type': 'application/json',
          },
        }
      )
    );

    return response.data;
  }

  /**
   * Obtiene un mensaje de error legible de WhatsApp
   */
  private obtenerMensajeErrorWhatsapp(error: any): string {
    if (error.response?.data?.error) {
      const errorData = error.response.data.error;
      
      // Mapeo de errores comunes de WhatsApp
      if (errorData.code === 100) {
        return 'Número de teléfono de WhatsApp Business no encontrado';
      }
      if (errorData.code === 190) {
        return 'Token de acceso expirado o inválido';
      }
      if (errorData.code === 131030) {
        return 'Número de destino inválido';
      }
      if (errorData.code === 131031) {
        return 'El número de destino no tiene WhatsApp';
      }
      
      return `Error de WhatsApp: ${errorData.message} (Código: ${errorData.code})`;
    }

    if (error.code === 'ETIMEDOUT') {
      return 'Timeout al conectar con WhatsApp. Intente nuevamente.';
    }

    return 'Error desconocido al comunicarse con WhatsApp';
  }
}