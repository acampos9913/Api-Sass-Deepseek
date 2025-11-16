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
 * Adaptador para Instagram que implementa la publicación de productos
 * Utiliza Instagram Graph API para publicar productos en cuentas de Instagram Business
 */
@Injectable()
export class InstagramAdaptador implements AdaptadorRedSocial {
  private readonly baseUrl = 'https://graph.facebook.com/v19.0';

  constructor(private readonly httpService: HttpService) {}

  /**
   * Obtiene el tipo de red social que maneja este adaptador
   */
  obtenerTipoRedSocial(): TipoRedSocial {
    return TipoRedSocial.INSTAGRAM;
  }

  /**
   * Publica un producto en Instagram
   * @param producto - Datos del producto a publicar
   * @param tokenAcceso - Token de acceso para Instagram Graph API
   * @param configuracionAdicional - Configuración adicional (instagram_business_account_id, etc.)
   * @returns Resultado de la publicación
   */
  async publicarProducto(
    producto: DatosProductoParaPublicacion,
    tokenAcceso: string,
    configuracionAdicional?: Record<string, any>
  ): Promise<ResultadoPublicacion> {
    try {
      const cuentaId = configuracionAdicional?.instagram_business_account_id;
      
      if (!cuentaId) {
        throw new Error('Se requiere el ID de la cuenta de Instagram Business');
      }

      // 1. Crear el contenedor de medios para la imagen del producto
      const contenedorMedios = await this.crearContenedorMedios(
        producto,
        tokenAcceso,
        cuentaId
      );

      // 2. Publicar el contenedor de medios como publicación
      const publicacion = await this.crearPublicacion(
        producto,
        contenedorMedios.id,
        tokenAcceso,
        cuentaId
      );

      return {
        exito: true,
        id_externo: publicacion.id,
        url_publicacion: `https://instagram.com/p/${publicacion.id}`,
        mensaje: 'Producto publicado exitosamente en Instagram',
        datos_adicionales: {
          contenedor_medios_id: contenedorMedios.id,
          publicacion_id: publicacion.id,
          cuenta_id: cuentaId,
        },
        fecha_publicacion: new Date(),
      };

    } catch (error) {
      console.error('Error publicando producto en Instagram:', error);
      return {
        exito: false,
        mensaje: this.obtenerMensajeErrorInstagram(error),
        fecha_publicacion: new Date(),
      };
    }
  }

  /**
   * Actualiza un producto previamente publicado en Instagram
   * Nota: Instagram no permite actualizar publicaciones existentes
   * Se debe crear una nueva publicación y eliminar la anterior
   */
  async actualizarProducto(
    idExterno: string,
    producto: DatosProductoParaPublicacion,
    tokenAcceso: string,
    configuracionAdicional?: Record<string, any>
  ): Promise<ResultadoPublicacion> {
    try {
      // Instagram no permite actualizar publicaciones existentes
      // Por lo tanto, creamos una nueva publicación
      const resultadoNuevaPublicacion = await this.publicarProducto(
        producto,
        tokenAcceso,
        configuracionAdicional
      );

      // Y eliminamos la publicación anterior si la nueva fue exitosa
      if (resultadoNuevaPublicacion.exito) {
        await this.eliminarProducto(idExterno, tokenAcceso, configuracionAdicional);
      }

      return resultadoNuevaPublicacion;

    } catch (error) {
      console.error('Error actualizando producto en Instagram:', error);
      return {
        exito: false,
        mensaje: this.obtenerMensajeErrorInstagram(error),
        fecha_publicacion: new Date(),
      };
    }
  }

  /**
   * Elimina una publicación de Instagram
   */
  async eliminarProducto(
    idExterno: string,
    tokenAcceso: string,
    configuracionAdicional?: Record<string, any>
  ): Promise<ResultadoPublicacion> {
    try {
      await firstValueFrom(
        this.httpService.delete(`${this.baseUrl}/${idExterno}`, {
          params: { access_token: tokenAcceso },
        })
      );

      return {
        exito: true,
        mensaje: 'Publicación eliminada exitosamente de Instagram',
        fecha_publicacion: new Date(),
      };

    } catch (error) {
      console.error('Error eliminando publicación de Instagram:', error);
      return {
        exito: false,
        mensaje: this.obtenerMensajeErrorInstagram(error),
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
            fields: 'id,name,accounts{id,name,username,access_token,instagram_business_account{id,username,name}}',
          },
        })
      );

      const datos = response.data;
      const paginas = datos.accounts?.data || [];
      const cuentasInstagram = paginas
        .filter((pagina: any) => pagina.instagram_business_account)
        .map((pagina: any) => ({
          pagina_id: pagina.id,
          pagina_nombre: pagina.name,
          instagram_id: pagina.instagram_business_account.id,
          instagram_username: pagina.instagram_business_account.username,
          instagram_nombre: pagina.instagram_business_account.name,
        }));

      return {
        valido: true,
        permisos: ['instagram_basic', 'instagram_content_publish', 'pages_read_engagement'],
        datosCuenta: {
          usuario_id: datos.id,
          usuario_nombre: datos.name,
          cuentas_instagram: cuentasInstagram,
        },
      };

    } catch (error) {
      console.error('Error validando token de Instagram:', error);
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
      'instagram_basic',
      'instagram_content_publish',
      'pages_read_engagement',
      'business_management',
    ];
  }

  /**
   * Crea un contenedor de medios para la imagen del producto
   */
  private async crearContenedorMedios(
    producto: DatosProductoParaPublicacion,
    tokenAcceso: string,
    cuentaId: string
  ): Promise<any> {
    if (!producto.imagen_url) {
      throw new Error('Se requiere una imagen para publicar en Instagram');
    }

    const datosContenedor = {
      image_url: producto.imagen_url,
      caption: this.generarLeyendaProducto(producto),
      access_token: tokenAcceso,
    };

    const response: AxiosResponse<any> = await firstValueFrom(
      this.httpService.post(
        `${this.baseUrl}/${cuentaId}/media`,
        datosContenedor
      )
    );

    return response.data;
  }

  /**
   * Crea la publicación en Instagram usando el contenedor de medios
   */
  private async crearPublicacion(
    producto: DatosProductoParaPublicacion,
    contenedorId: string,
    tokenAcceso: string,
    cuentaId: string
  ): Promise<any> {
    const datosPublicacion = {
      creation_id: contenedorId,
      access_token: tokenAcceso,
    };

    const response: AxiosResponse<any> = await firstValueFrom(
      this.httpService.post(
        `${this.baseUrl}/${cuentaId}/media_publish`,
        datosPublicacion
      )
    );

    return response.data;
  }

  /**
   * Genera la leyenda/descripción para la publicación de Instagram
   */
  private generarLeyendaProducto(producto: DatosProductoParaPublicacion): string {
    const hashtags = this.generarHashtags(producto);
    
    return `${producto.nombre}\n\n${producto.descripcion}\n\n💲 Precio: $${producto.precio}\n📦 Disponible: ${producto.cantidad} unidades\n\n🛒 Compra ahora en nuestra tienda online\n\n${hashtags}`;
  }

  /**
   * Genera hashtags relevantes para el producto
   */
  private generarHashtags(producto: DatosProductoParaPublicacion): string {
    const hashtagsBase = ['tiendaonline', 'ecommerce', 'comprasonline'];
    const hashtagsProducto = producto.categoria 
      ? [producto.categoria.toLowerCase().replace(/\s+/g, '')]
      : [];
    const hashtagsMarca = producto.tienda_id ? [producto.tienda_id.toLowerCase()] : [];
    
    const todosHashtags = [...hashtagsBase, ...hashtagsProducto, ...hashtagsMarca];
    return todosHashtags.map(tag => `#${tag}`).join(' ');
  }

  /**
   * Obtiene un mensaje de error legible de Instagram
   */
  private obtenerMensajeErrorInstagram(error: any): string {
    if (error.response?.data?.error) {
      const errorData = error.response.data.error;
      
      // Mapeo de errores comunes de Instagram
      if (errorData.code === 100) {
        return 'No se encontró la cuenta de Instagram Business asociada';
      }
      if (errorData.code === 190) {
        return 'Token de acceso expirado o inválido';
      }
      if (errorData.code === 368) {
        return 'La acción temporalmente no está disponible en Instagram';
      }
      
      return `Error de Instagram: ${errorData.message} (Código: ${errorData.code})`;
    }

    if (error.code === 'ETIMEDOUT') {
      return 'Timeout al conectar con Instagram. Intente nuevamente.';
    }

    return 'Error desconocido al comunicarse con Instagram';
  }
}