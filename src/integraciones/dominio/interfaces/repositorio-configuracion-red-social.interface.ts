import { ConfiguracionRedSocial, ProductoRedSocial } from '../entidades/configuracion-red-social.entity';
import { TipoRedSocial } from '../enums/tipo-red-social.enum';

/**
 * Interfaz para el repositorio de Configuración de Red Social
 * Define las operaciones de persistencia para entidades ConfiguracionRedSocial y ProductoRedSocial
 */
export interface RepositorioConfiguracionRedSocial {
  /**
   * Guarda una nueva configuración de red social
   * @param configuracion - Entidad de configuración a guardar
   * @returns Promise con la configuración guardada
   */
  guardar(configuracion: ConfiguracionRedSocial): Promise<ConfiguracionRedSocial>;

  /**
   * Busca una configuración por su ID
   * @param id - ID de la configuración
   * @returns Promise con la configuración encontrada o null
   */
  buscarPorId(id: string): Promise<ConfiguracionRedSocial | null>;

  /**
   * Busca configuraciones por ID de tienda
   * @param tienda_id - ID de la tienda
   * @returns Promise con array de configuraciones
   */
  buscarPorTienda(tienda_id: string): Promise<ConfiguracionRedSocial[]>;

  /**
   * Busca configuraciones por tipo de red social
   * @param tipo_red_social - Tipo de red social
   * @returns Promise con array de configuraciones
   */
  buscarPorTipoRedSocial(tipo_red_social: TipoRedSocial): Promise<ConfiguracionRedSocial[]>;

  /**
   * Busca configuraciones activas por tienda
   * @param tienda_id - ID de la tienda
   * @returns Promise con array de configuraciones activas
   */
  buscarActivasPorTienda(tienda_id: string): Promise<ConfiguracionRedSocial[]>;

  /**
   * Busca una configuración activa por tienda y tipo de red social
   * @param tienda_id - ID de la tienda
   * @param tipo_red_social - Tipo de red social
   * @returns Promise con la configuración encontrada o null
   */
  buscarActivaPorTiendaYTipo(tienda_id: string, tipo_red_social: TipoRedSocial): Promise<ConfiguracionRedSocial | null>;

  /**
   * Actualiza una configuración existente
   * @param configuracion - Entidad de configuración con datos actualizados
   * @returns Promise con la configuración actualizada
   */
  actualizar(configuracion: ConfiguracionRedSocial): Promise<ConfiguracionRedSocial>;

  /**
   * Elimina una configuración por su ID
   * @param id - ID de la configuración a eliminar
   * @returns Promise con el resultado de la operación
   */
  eliminar(id: string): Promise<void>;

  /**
   * Desactiva una configuración
   * @param id - ID de la configuración a desactivar
   * @returns Promise con la configuración actualizada
   */
  desactivar(id: string): Promise<ConfiguracionRedSocial>;

  /**
   * Activa una configuración
   * @param id - ID de la configuración a activar
   * @returns Promise con la configuración actualizada
   */
  activar(id: string): Promise<ConfiguracionRedSocial>;

  /**
   * Verifica si existe una configuración activa para una tienda y tipo de red social
   * @param tienda_id - ID de la tienda
   * @param tipo_red_social - Tipo de red social
   * @returns Promise con boolean indicando si existe
   */
  existeActivaPorTiendaYTipo(tienda_id: string, tipo_red_social: TipoRedSocial): Promise<boolean>;

  /**
   * Verifica si existe una configuración con el mismo nombre de cuenta para el mismo tipo de red social
   * @param nombre_cuenta - Nombre de la cuenta
   * @param tipo_red_social - Tipo de red social
   * @returns Promise con boolean indicando si existe
   */
  existeConNombreCuenta(nombre_cuenta: string, tipo_red_social: TipoRedSocial): Promise<boolean>;

  /**
   * Guarda un producto sincronizado
   * @param productoSincronizado - Entidad de producto sincronizado a guardar
   * @returns Promise con el producto sincronizado guardado
   */
  guardarProductoSincronizado(productoSincronizado: ProductoRedSocial): Promise<ProductoRedSocial>;

  /**
   * Busca un producto sincronizado por su ID
   * @param id - ID del producto sincronizado
   * @returns Promise con el producto sincronizado encontrado o null
   */
  buscarProductoSincronizadoPorId(id: string): Promise<ProductoRedSocial | null>;

  /**
   * Busca productos sincronizados por ID de configuración de red social
   * @param configuracion_red_social_id - ID de la configuración de red social
   * @returns Promise con array de productos sincronizados
   */
  buscarProductosSincronizadosPorConfiguracion(configuracion_red_social_id: string): Promise<ProductoRedSocial[]>;

  /**
   * Busca productos sincronizados por ID de producto
   * @param producto_id - ID del producto
   * @returns Promise con array de productos sincronizados
   */
  buscarProductosSincronizadosPorProducto(producto_id: string): Promise<ProductoRedSocial[]>;

  /**
   * Busca un producto sincronizado por ID de configuración y ID de producto
   * @param configuracion_red_social_id - ID de la configuración de red social
   * @param producto_id - ID del producto
   * @returns Promise con el producto sincronizado encontrado o null
   */
  buscarProductoSincronizadoPorConfiguracionYProducto(
    configuracion_red_social_id: string,
    producto_id: string
  ): Promise<ProductoRedSocial | null>;

  /**
   * Actualiza un producto sincronizado existente
   * @param productoSincronizado - Entidad de producto sincronizado con datos actualizados
   * @returns Promise con el producto sincronizado actualizado
   */
  actualizarProductoSincronizado(productoSincronizado: ProductoRedSocial): Promise<ProductoRedSocial>;

  /**
   * Elimina un producto sincronizado por su ID
   * @param id - ID del producto sincronizado a eliminar
   * @returns Promise con el resultado de la operación
   */
  eliminarProductoSincronizado(id: string): Promise<void>;

  /**
   * Elimina todos los productos sincronizados de una configuración de red social
   * @param configuracion_red_social_id - ID de la configuración de red social
   * @returns Promise con el resultado de la operación
   */
  eliminarProductosSincronizadosPorConfiguracion(configuracion_red_social_id: string): Promise<void>;

  /**
   * Busca configuraciones con tokens próximos a expirar
   * @param horas - Horas antes de la expiración para considerar próximo a expirar
   * @returns Promise con array de configuraciones con tokens próximos a expirar
   */
  buscarConTokensProximosAExpiracion(horas?: number): Promise<ConfiguracionRedSocial[]>;

  /**
   * Actualiza los tokens de una configuración
   * @param id - ID de la configuración
   * @param token_acceso - Nuevo token de acceso
   * @param token_renovacion - Nuevo token de renovación (opcional)
   * @param fecha_expiracion - Nueva fecha de expiración
   * @returns Promise con la configuración actualizada
   */
  actualizarTokens(
    id: string,
    token_acceso: string,
    token_renovacion: string | null,
    fecha_expiracion: Date
  ): Promise<ConfiguracionRedSocial>;
}