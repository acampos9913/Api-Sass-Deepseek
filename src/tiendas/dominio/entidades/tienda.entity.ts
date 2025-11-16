/**
 * Entidad de Dominio para Tiendas
 * Representa una tienda individual en el sistema multi-tenant
 * Sigue los principios de la Arquitectura Limpia
 */
export class Tienda {
  constructor(
    private readonly id: string,
    private readonly nombre: string,
    private readonly dominio: string,
    private configuracion: ConfiguracionTienda,
    private estado: EstadoTienda,
    private readonly fechaCreacion: Date,
    private fechaActualizacion: Date,
    private readonly propietarioId: string,
    private plan: PlanTienda,
    private readonly metadata: MetadataTienda,
  ) {}

  /**
   * Valida que la tienda sea válida
   */
  validar(): void {
    if (!this.id) {
      throw new Error('El ID de la tienda es requerido');
    }

    if (!this.nombre) {
      throw new Error('El nombre de la tienda es requerido');
    }

    if (!this.dominio) {
      throw new Error('El dominio de la tienda es requerido');
    }

    if (this.nombre.length > 100) {
      throw new Error('El nombre de la tienda no puede exceder 100 caracteres');
    }

    if (this.dominio.length > 255) {
      throw new Error('El dominio de la tienda no puede exceder 255 caracteres');
    }

    if (!this.validarDominio(this.dominio)) {
      throw new Error('El formato del dominio no es válido');
    }

    if (!this.propietarioId) {
      throw new Error('El ID del propietario es requerido');
    }

    this.validarConfiguracion();
    this.validarPlan();
  }

  /**
   * Valida la configuración de la tienda
   */
  private validarConfiguracion(): void {
    if (!this.configuracion.moneda) {
      throw new Error('La moneda de la tienda es requerida');
    }

    if (!this.configuracion.idioma) {
      throw new Error('El idioma de la tienda es requerido');
    }

    if (this.configuracion.zonaHoraria && !this.validarZonaHoraria(this.configuracion.zonaHoraria)) {
      throw new Error('La zona horaria no es válida');
    }

    if (this.configuracion.emailContacto && !this.validarEmail(this.configuracion.emailContacto)) {
      throw new Error('El email de contacto no tiene un formato válido');
    }

    if (this.configuracion.telefonoContacto && this.configuracion.telefonoContacto.length > 20) {
      throw new Error('El teléfono de contacto no puede exceder 20 caracteres');
    }
  }

  /**
   * Valida el plan de la tienda
   */
  private validarPlan(): void {
    if (!Object.values(TipoPlan).includes(this.plan.tipo)) {
      throw new Error('Tipo de plan no válido');
    }

    if (this.plan.fechaInicio && this.plan.fechaFin && this.plan.fechaInicio > this.plan.fechaFin) {
      throw new Error('La fecha de inicio no puede ser mayor que la fecha de fin');
    }

    if (this.plan.limiteProductos < 0) {
      throw new Error('El límite de productos no puede ser negativo');
    }

    if (this.plan.limiteOrdenes < 0) {
      throw new Error('El límite de órdenes no puede ser negativo');
    }

    if (this.plan.limiteAlmacenamiento < 0) {
      throw new Error('El límite de almacenamiento no puede ser negativo');
    }
  }

  /**
   * Valida el formato del dominio
   */
  private validarDominio(dominio: string): boolean {
    const dominioRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return dominioRegex.test(dominio);
  }

  /**
   * Valida el formato del email
   */
  private validarEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Valida la zona horaria
   */
  private validarZonaHoraria(zonaHoraria: string): boolean {
    try {
      Intl.DateTimeFormat(undefined, { timeZone: zonaHoraria });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Activa la tienda
   */
  activar(): void {
    if (this.estado === EstadoTienda.ACTIVA) {
      throw new Error('La tienda ya está activa');
    }

    if (this.estado === EstadoTienda.SUSPENDIDA) {
      throw new Error('No se puede activar una tienda suspendida');
    }

    (this as any).estado = EstadoTienda.ACTIVA;
    (this as any).fechaActualizacion = new Date();
  }

  /**
   * Suspende la tienda
   */
  suspender(): void {
    if (this.estado === EstadoTienda.SUSPENDIDA) {
      throw new Error('La tienda ya está suspendida');
    }

    (this as any).estado = EstadoTienda.SUSPENDIDA;
    (this as any).fechaActualizacion = new Date();
  }

  /**
   * Cancela la tienda
   */
  cancelar(): void {
    if (this.estado === EstadoTienda.CANCELADA) {
      throw new Error('La tienda ya está cancelada');
    }

    (this as any).estado = EstadoTienda.CANCELADA;
    (this as any).fechaActualizacion = new Date();
  }

  /**
   * Actualiza la configuración de la tienda
   */
  actualizarConfiguracion(nuevaConfiguracion: Partial<ConfiguracionTienda>): void {
    this.configuracion = { ...this.configuracion, ...nuevaConfiguracion };
    (this as any).fechaActualizacion = new Date();
  }

  /**
   * Actualiza el plan de la tienda
   */
  actualizarPlan(nuevoPlan: Partial<PlanTienda>): void {
    this.plan = { ...this.plan, ...nuevoPlan };
    (this as any).fechaActualizacion = new Date();
  }

  /**
   * Verifica si la tienda está activa
   */
  estaActiva(): boolean {
    return this.estado === EstadoTienda.ACTIVA;
  }

  /**
   * Verifica si la tienda ha excedido sus límites
   */
  verificarLimites(estadisticas: EstadisticasTienda): boolean {
    if (this.plan.limiteProductos > 0 && estadisticas.totalProductos > this.plan.limiteProductos) {
      return false;
    }

    if (this.plan.limiteOrdenes > 0 && estadisticas.totalOrdenes > this.plan.limiteOrdenes) {
      return false;
    }

    if (this.plan.limiteAlmacenamiento > 0 && estadisticas.almacenamientoUtilizado > this.plan.limiteAlmacenamiento) {
      return false;
    }

    return true;
  }

  /**
   * Genera la URL de la tienda
   */
  generarUrl(): string {
    if (this.configuracion.dominioPersonalizado) {
      return `https://${this.configuracion.dominioPersonalizado}`;
    }
    return `https://${this.dominio}.mi-saas.com`;
  }

  // Getters
  getId(): string { return this.id; }
  getNombre(): string { return this.nombre; }
  getDominio(): string { return this.dominio; }
  getConfiguracion(): ConfiguracionTienda { return this.configuracion; }
  getEstado(): EstadoTienda { return this.estado; }
  getFechaCreacion(): Date { return this.fechaCreacion; }
  getFechaActualizacion(): Date { return this.fechaActualizacion; }
  getPropietarioId(): string { return this.propietarioId; }
  getPlan(): PlanTienda { return this.plan; }
  getMetadata(): MetadataTienda { return this.metadata; }
}

/**
 * Enumeración de estados de la tienda
 */
export enum EstadoTienda {
  PENDIENTE = 'PENDIENTE',
  ACTIVA = 'ACTIVA',
  SUSPENDIDA = 'SUSPENDIDA',
  CANCELADA = 'CANCELADA',
}

/**
 * Enumeración de tipos de plan
 */
export enum TipoPlan {
  GRATIS = 'GRATIS',
  BASICO = 'BASICO',
  PROFESIONAL = 'PROFESIONAL',
  EMPRESA = 'EMPRESA',
}

/**
 * Interfaz para la configuración de la tienda
 */
export interface ConfiguracionTienda {
  moneda: string;
  idioma: string;
  zonaHoraria?: string;
  emailContacto?: string;
  telefonoContacto?: string;
  direccion?: DireccionTienda;
  dominioPersonalizado?: string;
  logoUrl?: string;
  tema?: string;
  configuracionPagos?: ConfiguracionPagos;
  configuracionEnvios?: ConfiguracionEnvios;
  configuracionImpuestos?: ConfiguracionImpuestos;
}

/**
 * Interfaz para el plan de la tienda
 */
export interface PlanTienda {
  tipo: TipoPlan;
  fechaInicio: Date;
  fechaFin?: Date;
  limiteProductos: number;
  limiteOrdenes: number;
  limiteAlmacenamiento: number; // en MB
  caracteristicas: string[];
  precioMensual: number;
}

/**
 * Interfaz para la dirección de la tienda
 */
export interface DireccionTienda {
  calle: string;
  ciudad: string;
  estado?: string;
  codigoPostal: string;
  pais: string;
}

/**
 * Interfaz para la configuración de pagos
 */
export interface ConfiguracionPagos {
  metodosAceptados: string[];
  monedaPorDefecto: string;
  configuracionStripe?: any;
  configuracionPaypal?: any;
}

/**
 * Interfaz para la configuración de envíos
 */
export interface ConfiguracionEnvios {
  metodosDisponibles: string[];
  zonasEnvio: ZonaEnvio[];
  politicasEnvio: PoliticaEnvio;
}

/**
 * Interfaz para la configuración de impuestos
 */
export interface ConfiguracionImpuestos {
  impuestosHabilitados: boolean;
  tasaImpuesto: number;
  paisImpuesto: string;
  incluirEnPrecio: boolean;
}

/**
 * Interfaz para las estadísticas de la tienda
 */
export interface EstadisticasTienda {
  totalProductos: number;
  totalOrdenes: number;
  almacenamientoUtilizado: number;
  ingresosTotales: number;
  clientesActivos: number;
}

/**
 * Interfaz para la zona de envío
 */
export interface ZonaEnvio {
  nombre: string;
  paises: string[];
  tarifas: TarifaEnvio[];
}

/**
 * Interfaz para la tarifa de envío
 */
export interface TarifaEnvio {
  nombre: string;
  precio: number;
  condiciones?: string;
}

/**
 * Interfaz para la política de envío
 */
export interface PoliticaEnvio {
  tiempoProcesamiento: number;
  politicasDevolucion: string;
  instruccionesEspeciales?: string;
}

/**
 * Interfaz para los metadatos de la tienda
 */
export interface MetadataTienda {
  versionTema: string;
  pluginsInstalados: string[];
  configuracionesPersonalizadas: Record<string, any>;
  fechaUltimaCopiaSeguridad?: Date;
}