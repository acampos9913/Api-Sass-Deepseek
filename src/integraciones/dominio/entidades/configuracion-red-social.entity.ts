import { TipoRedSocial } from '../enums/tipo-red-social.enum';

/**
 * Entidad de dominio que representa la configuración de una integración con red social
 * Contiene toda la información necesaria para autenticar y utilizar las APIs de redes sociales
 */
export class ConfiguracionRedSocial {
  constructor(
    public readonly id: string,
    public readonly tienda_id: string,
    public readonly tipo_red_social: TipoRedSocial,
    public readonly nombre_cuenta: string,
    public readonly token_acceso: string,
    public readonly token_renovacion: string | null,
    public readonly fecha_expiracion_token: Date | null,
    public readonly configuracion_adicional: Record<string, any>,
    public readonly activa: boolean,
    public readonly fecha_creacion: Date,
    public readonly fecha_actualizacion: Date,
    public readonly productos_sincronizados: ProductoRedSocial[] = []
  ) {}

  /**
   * Verifica si el token de acceso está expirado
   * @returns true si el token está expirado o a punto de expirar (en 24 horas)
   */
  estaTokenExpirado(): boolean {
    if (!this.fecha_expiracion_token) {
      return false;
    }

    const ahora = new Date();
    const veinticuatroHoras = 24 * 60 * 60 * 1000; // 24 horas en milisegundos
    return this.fecha_expiracion_token.getTime() - ahora.getTime() <= veinticuatroHoras;
  }

  /**
   * Verifica si la configuración está activa y lista para usar
   * @returns true si está activa y el token no está expirado
   */
  estaActiva(): boolean {
    return this.activa && !this.estaTokenExpirado();
  }

  /**
   * Actualiza los tokens de acceso
   * @param nuevoTokenAcceso - Nuevo token de acceso
   * @param nuevoTokenRenovacion - Nuevo token de renovación (opcional)
   * @param nuevaFechaExpiracion - Nueva fecha de expiración
   */
  actualizarTokens(
    nuevoTokenAcceso: string,
    nuevoTokenRenovacion: string | null,
    nuevaFechaExpiracion: Date
  ): void {
    (this as any).token_acceso = nuevoTokenAcceso;
    (this as any).token_renovacion = nuevoTokenRenovacion;
    (this as any).fecha_expiracion_token = nuevaFechaExpiracion;
    (this as any).fecha_actualizacion = new Date();
  }

  /**
   * Actualiza la configuración adicional
   * @param nuevaConfiguracion - Nueva configuración adicional
   */
  actualizarConfiguracionAdicional(nuevaConfiguracion: Record<string, any>): void {
    (this as any).configuracion_adicional = {
      ...this.configuracion_adicional,
      ...nuevaConfiguracion
    };
    (this as any).fecha_actualizacion = new Date();
  }

  /**
   * Activa o desactiva la integración
   * @param activa - Estado de activación
   */
  cambiarEstado(activa: boolean): void {
    (this as any).activa = activa;
    (this as any).fecha_actualizacion = new Date();
  }

  /**
   * Agrega un producto sincronizado
   * @param productoSincronizado - Producto sincronizado
   */
  agregarProductoSincronizado(productoSincronizado: ProductoRedSocial): void {
    (this as any).productos_sincronizados.push(productoSincronizado);
  }

  /**
   * Obtiene un producto sincronizado por ID de producto
   * @param producto_id - ID del producto
   * @returns El producto sincronizado o null
   */
  obtenerProductoSincronizado(producto_id: string): ProductoRedSocial | null {
    return this.productos_sincronizados.find(
      producto => producto.producto_id === producto_id
    ) || null;
  }

  /**
   * Elimina un producto sincronizado
   * @param producto_id - ID del producto
   */
  eliminarProductoSincronizado(producto_id: string): void {
    (this as any).productos_sincronizados = this.productos_sincronizados.filter(
      producto => producto.producto_id !== producto_id
    );
  }

  /**
   * Valida que la configuración tenga todos los campos requeridos
   * @throws Error si falta algún campo requerido
   */
  validar(): void {
    if (!this.tienda_id) {
      throw new Error('El ID de la tienda es requerido');
    }

    if (!this.tipo_red_social) {
      throw new Error('El tipo de red social es requerido');
    }

    if (!this.nombre_cuenta) {
      throw new Error('El nombre de la cuenta es requerido');
    }

    if (!this.token_acceso) {
      throw new Error('El token de acceso es requerido');
    }
  }

  /**
   * Crea una nueva instancia de ConfiguracionRedSocial
   * @param datos - Datos para crear la configuración
   * @returns Nueva instancia de ConfiguracionRedSocial
   */
  static crear(datos: {
    id: string;
    tienda_id: string;
    tipo_red_social: TipoRedSocial;
    nombre_cuenta: string;
    token_acceso: string;
    token_renovacion?: string | null;
    fecha_expiracion_token?: Date | null;
    configuracion_adicional?: Record<string, any>;
    activa?: boolean;
  }): ConfiguracionRedSocial {
    const ahora = new Date();
    
    return new ConfiguracionRedSocial(
      datos.id,
      datos.tienda_id,
      datos.tipo_red_social,
      datos.nombre_cuenta,
      datos.token_acceso,
      datos.token_renovacion || null,
      datos.fecha_expiracion_token || null,
      datos.configuracion_adicional || {},
      datos.activa !== undefined ? datos.activa : true,
      ahora,
      ahora,
      []
    );
  }
}

/**
 * Entidad que representa un producto sincronizado con una red social
 */
export class ProductoRedSocial {
  constructor(
    public readonly id: string,
    public readonly configuracion_red_social_id: string,
    public readonly producto_id: string,
    public readonly id_externo: string,
    public readonly datos_externos: Record<string, any>,
    public readonly fecha_sincronizacion: Date,
    public readonly fecha_actualizacion: Date,
    public readonly estado: 'ACTIVO' | 'INACTIVO' | 'ERROR'
  ) {}

  /**
   * Actualiza los datos externos del producto
   * @param nuevosDatos - Nuevos datos externos
   */
  actualizarDatosExternos(nuevosDatos: Record<string, any>): void {
    (this as any).datos_externos = {
      ...this.datos_externos,
      ...nuevosDatos
    };
    (this as any).fecha_actualizacion = new Date();
  }

  /**
   * Cambia el estado del producto
   * @param nuevoEstado - Nuevo estado
   */
  cambiarEstado(nuevoEstado: 'ACTIVO' | 'INACTIVO' | 'ERROR'): void {
    (this as any).estado = nuevoEstado;
    (this as any).fecha_actualizacion = new Date();
  }

  /**
   * Crea una nueva instancia de ProductoRedSocial
   * @param datos - Datos para crear el producto sincronizado
   * @returns Nueva instancia de ProductoRedSocial
   */
  static crear(datos: {
    id: string;
    configuracion_red_social_id: string;
    producto_id: string;
    id_externo: string;
    datos_externos?: Record<string, any>;
  }): ProductoRedSocial {
    const ahora = new Date();
    
    return new ProductoRedSocial(
      datos.id,
      datos.configuracion_red_social_id,
      datos.producto_id,
      datos.id_externo,
      datos.datos_externos || {},
      ahora,
      ahora,
      'ACTIVO'
    );
  }
}