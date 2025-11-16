import { TipoRedSocial } from '../enums/tipo-red-social.enum';

/**
 * Datos del producto para publicación en redes sociales
 */
export interface DatosProductoParaPublicacion {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  cantidad: number;
  imagen_url: string;
  tienda_id: string;
  categoria?: string;
  sku?: string;
  moneda?: string;
}

/**
 * Resultado de la publicación en red social
 */
export interface ResultadoPublicacion {
  exito: boolean;
  id_externo?: string;
  url_publicacion?: string;
  mensaje?: string;
  datos_adicionales?: Record<string, any>;
  fecha_publicacion?: Date;
}

/**
 * Interfaz para adaptadores de redes sociales
 * Define las operaciones que cada red social debe implementar
 */
export interface AdaptadorRedSocial {
  /**
   * Obtiene el tipo de red social que maneja este adaptador
   */
  obtenerTipoRedSocial(): TipoRedSocial;

  /**
   * Publica un producto en la red social
   * @param producto - Datos del producto a publicar
   * @param tokenAcceso - Token de acceso para la API
   * @param configuracionAdicional - Configuración adicional específica de la red social
   * @returns Resultado de la publicación
   */
  publicarProducto(
    producto: DatosProductoParaPublicacion,
    tokenAcceso: string,
    configuracionAdicional?: Record<string, any>
  ): Promise<ResultadoPublicacion>;

  /**
   * Actualiza un producto previamente publicado
   * @param idExterno - ID externo del producto en la red social
   * @param producto - Nuevos datos del producto
   * @param tokenAcceso - Token de acceso para la API
   * @param configuracionAdicional - Configuración adicional específica de la red social
   * @returns Resultado de la actualización
   */
  actualizarProducto(
    idExterno: string,
    producto: DatosProductoParaPublicacion,
    tokenAcceso: string,
    configuracionAdicional?: Record<string, any>
  ): Promise<ResultadoPublicacion>;

  /**
   * Elimina un producto de la red social
   * @param idExterno - ID externo del producto en la red social
   * @param tokenAcceso - Token de acceso para la API
   * @param configuracionAdicional - Configuración adicional específica de la red social
   * @returns Resultado de la eliminación
   */
  eliminarProducto(
    idExterno: string,
    tokenAcceso: string,
    configuracionAdicional?: Record<string, any>
  ): Promise<ResultadoPublicacion>;

  /**
   * Valida que el token de acceso sea válido y tenga los permisos necesarios
   * @param tokenAcceso - Token de acceso para validar
   * @returns Resultado de la validación
   */
  validarToken(tokenAcceso: string): Promise<{
    valido: boolean;
    mensaje?: string;
    permisos?: string[];
    datosCuenta?: Record<string, any>;
  }>;

  /**
   * Obtiene información sobre los permisos requeridos para publicar productos
   */
  obtenerPermisosRequeridos(): string[];
}