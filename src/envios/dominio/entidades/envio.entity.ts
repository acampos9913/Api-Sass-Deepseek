/**
 * Entidad de Dominio para Envíos
 * Contiene la lógica de negocio para la gestión de envíos
 * Sigue los principios de la Arquitectura Limpia
 */
export class Envio {
  constructor(
    private readonly id: string,
    private readonly ordenId: string,
    private readonly direccionEnvio: DireccionEnvio,
    private readonly metodoEnvio: MetodoEnvio,
    private estado: EstadoEnvio,
    private readonly costo: number,
    private readonly fechaEstimadaEntrega: Date,
    private readonly fechaCreacion: Date,
    private fechaActualizacion: Date,
    private trackingNumber: string | null,
    private proveedorEnvio: string | null,
    private readonly detalles: DetallesEnvio,
  ) {}

  /**
   * Valida que el envío sea válido
   */
  validar(): void {
    if (!this.id) {
      throw new Error('El ID del envío es requerido');
    }

    if (!this.ordenId) {
      throw new Error('El ID de la orden es requerido');
    }

    if (this.costo < 0) {
      throw new Error('El costo del envío no puede ser negativo');
    }

    if (!this.fechaEstimadaEntrega) {
      throw new Error('La fecha estimada de entrega es requerida');
    }

    if (this.fechaEstimadaEntrega < new Date()) {
      throw new Error('La fecha estimada de entrega no puede ser en el pasado');
    }

    this.validarDireccionEnvio();
    this.validarMetodoEnvio();
    this.validarDetallesEnvio();
  }

  /**
   * Valida la dirección de envío
   */
  private validarDireccionEnvio(): void {
    if (!this.direccionEnvio.nombreCompleto) {
      throw new Error('El nombre completo del destinatario es requerido');
    }

    if (!this.direccionEnvio.calle) {
      throw new Error('La calle de la dirección es requerida');
    }

    if (!this.direccionEnvio.ciudad) {
      throw new Error('La ciudad de la dirección es requerida');
    }

    if (!this.direccionEnvio.codigoPostal) {
      throw new Error('El código postal de la dirección es requerido');
    }

    if (!this.direccionEnvio.pais) {
      throw new Error('El país de la dirección es requerido');
    }

    if (this.direccionEnvio.nombreCompleto.length > 200) {
      throw new Error('El nombre completo no puede exceder 200 caracteres');
    }

    if (this.direccionEnvio.calle.length > 200) {
      throw new Error('La calle no puede exceder 200 caracteres');
    }

    if (this.direccionEnvio.ciudad.length > 100) {
      throw new Error('La ciudad no puede exceder 100 caracteres');
    }

    if (this.direccionEnvio.codigoPostal.length > 20) {
      throw new Error('El código postal no puede exceder 20 caracteres');
    }

    if (this.direccionEnvio.pais.length > 100) {
      throw new Error('El país no puede exceder 100 caracteres');
    }

    if (this.direccionEnvio.telefono && this.direccionEnvio.telefono.length > 20) {
      throw new Error('El teléfono no puede exceder 20 caracteres');
    }

    if (this.direccionEnvio.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(this.direccionEnvio.email)) {
        throw new Error('El email del destinatario no tiene un formato válido');
      }
    }
  }

  /**
   * Valida el método de envío
   */
  private validarMetodoEnvio(): void {
    if (!this.metodoEnvio.tipo) {
      throw new Error('El tipo de método de envío es requerido');
    }

    if (!Object.values(TipoMetodoEnvio).includes(this.metodoEnvio.tipo)) {
      throw new Error('Tipo de método de envío no válido');
    }

    if (this.metodoEnvio.tiempoEstimadoDias < 1) {
      throw new Error('El tiempo estimado de envío debe ser al menos 1 día');
    }

    if (this.metodoEnvio.tiempoEstimadoDias > 90) {
      throw new Error('El tiempo estimado de envío no puede exceder 90 días');
    }
  }

  /**
   * Valida los detalles del envío
   */
  private validarDetallesEnvio(): void {
    if (this.detalles.pesoTotal < 0) {
      throw new Error('El peso total no puede ser negativo');
    }

    if (this.detalles.pesoTotal > 1000) {
      throw new Error('El peso total no puede exceder 1000 kg');
    }

    if (this.detalles.dimensiones.alto < 0) {
      throw new Error('La altura no puede ser negativa');
    }

    if (this.detalles.dimensiones.ancho < 0) {
      throw new Error('El ancho no puede ser negativo');
    }

    if (this.detalles.dimensiones.largo < 0) {
      throw new Error('El largo no puede ser negativo');
    }

    if (this.detalles.valorAsegurado < 0) {
      throw new Error('El valor asegurado no puede ser negativo');
    }

    if (this.detalles.esFragil && this.detalles.pesoTotal > 50) {
      throw new Error('Los paquetes frágiles no pueden pesar más de 50 kg');
    }
  }

  /**
   * Procesa el envío
   */
  async procesar(): Promise<void> {
    if (this.estado !== EstadoEnvio.PENDIENTE) {
      throw new Error('Solo se pueden procesar envíos en estado pendiente');
    }

    // Simulación de procesamiento
    this.estado = EstadoEnvio.PROCESANDO;
    this.fechaActualizacion = new Date();

    // Generar número de tracking
    this.trackingNumber = this.generarTrackingNumber();

    // Asignar proveedor de envío basado en el método
    this.proveedorEnvio = this.asignarProveedorEnvio();

    // En una implementación real, esto se conectaría con la API del proveedor de envíos
    await this.simularProcesamientoConProveedor();
  }

  /**
   * Marca el envío como enviado
   */
  marcarComoEnviado(): void {
    if (this.estado !== EstadoEnvio.PROCESANDO) {
      throw new Error('Solo se pueden marcar como enviado los envíos en estado procesando');
    }

    this.estado = EstadoEnvio.ENVIADO;
    this.fechaActualizacion = new Date();
    this.detalles.fechaEnvio = new Date();
  }

  /**
   * Marca el envío como en tránsito
   */
  marcarComoEnTransito(): void {
    if (this.estado !== EstadoEnvio.ENVIADO) {
      throw new Error('Solo se pueden marcar como en tránsito los envíos en estado enviado');
    }

    this.estado = EstadoEnvio.EN_TRANSITO;
    this.fechaActualizacion = new Date();
  }

  /**
   * Marca el envío como entregado
   */
  marcarComoEntregado(): void {
    if (this.estado !== EstadoEnvio.EN_TRANSITO && this.estado !== EstadoEnvio.ENVIADO) {
      throw new Error('Solo se pueden marcar como entregado los envíos en estado enviado o en tránsito');
    }

    this.estado = EstadoEnvio.ENTREGADO;
    this.fechaActualizacion = new Date();
    this.detalles.fechaEntrega = new Date();
  }

  /**
   * Cancela el envío
   */
  cancelar(): void {
    if (this.estado === EstadoEnvio.ENTREGADO || this.estado === EstadoEnvio.EN_TRANSITO) {
      throw new Error('No se puede cancelar un envío que ya está en tránsito o entregado');
    }

    this.estado = EstadoEnvio.CANCELADO;
    this.fechaActualizacion = new Date();
  }

  /**
   * Actualiza el estado del envío
   */
  actualizarEstado(nuevoEstado: EstadoEnvio): void {
    // Validar transición de estado
    const transicionesValidas: Record<EstadoEnvio, EstadoEnvio[]> = {
      [EstadoEnvio.PENDIENTE]: [EstadoEnvio.PROCESANDO, EstadoEnvio.CANCELADO],
      [EstadoEnvio.PROCESANDO]: [EstadoEnvio.ENVIADO, EstadoEnvio.CANCELADO],
      [EstadoEnvio.ENVIADO]: [EstadoEnvio.EN_TRANSITO, EstadoEnvio.ENTREGADO, EstadoEnvio.CANCELADO],
      [EstadoEnvio.EN_TRANSITO]: [EstadoEnvio.ENTREGADO, EstadoEnvio.CANCELADO],
      [EstadoEnvio.ENTREGADO]: [],
      [EstadoEnvio.CANCELADO]: [],
    };

    const estadosPermitidos = transicionesValidas[this.estado];
    if (!estadosPermitidos.includes(nuevoEstado)) {
      throw new Error(`Transición de estado no válida: ${this.estado} -> ${nuevoEstado}`);
    }

    this.estado = nuevoEstado;
    this.fechaActualizacion = new Date();

    // Actualizar fechas específicas según el estado
    if (nuevoEstado === EstadoEnvio.ENVIADO) {
      (this.detalles as any).fechaEnvio = new Date();
    } else if (nuevoEstado === EstadoEnvio.ENTREGADO) {
      (this.detalles as any).fechaEntrega = new Date();
    }
  }

  /**
   * Calcula el costo del envío basado en peso, dimensiones y método
   */
  calcularCosto(): number {
    let costoBase = 0;

    // Costo base por método de envío
    switch (this.metodoEnvio.tipo) {
      case TipoMetodoEnvio.ESTANDAR:
        costoBase = 10;
        break;
      case TipoMetodoEnvio.EXPRESS:
        costoBase = 25;
        break;
      case TipoMetodoEnvio.INTERNACIONAL:
        costoBase = 50;
        break;
      case TipoMetodoEnvio.GRATIS:
        return 0;
    }

    // Costo por peso (USD por kg)
    const costoPeso = this.detalles.pesoTotal * 2;

    // Costo por volumen (USD por m³)
    const volumen = (this.detalles.dimensiones.alto * this.detalles.dimensiones.ancho * this.detalles.dimensiones.largo) / 1000000;
    const costoVolumen = volumen * 100;

    // Costo adicional por características especiales
    let costoAdicional = 0;
    if (this.detalles.esFragil) {
      costoAdicional += 5;
    }
    if (this.detalles.requiereFirma) {
      costoAdicional += 3;
    }
    if (this.detalles.esRegalo) {
      costoAdicional += 2;
    }

    return costoBase + costoPeso + costoVolumen + costoAdicional;
  }

  /**
   * Verifica si el envío está atrasado
   */
  estaAtrasado(): boolean {
    if (this.estado === EstadoEnvio.ENTREGADO || this.estado === EstadoEnvio.CANCELADO) {
      return false;
    }

    return new Date() > this.fechaEstimadaEntrega;
  }

  /**
   * Obtiene el tiempo restante estimado para la entrega
   */
  obtenerTiempoRestante(): number {
    if (this.estado === EstadoEnvio.ENTREGADO) {
      return 0;
    }

    const ahora = new Date();
    const diferenciaMs = this.fechaEstimadaEntrega.getTime() - ahora.getTime();
    return Math.max(0, Math.ceil(diferenciaMs / (1000 * 60 * 60 * 24))); // Días restantes
  }

  /**
   * Genera un número de tracking único
   */
  private generarTrackingNumber(): string {
    const prefijo = this.proveedorEnvio?.substring(0, 3).toUpperCase() || 'TRK';
    return `${prefijo}${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  }

  /**
   * Asigna un proveedor de envío basado en el método
   */
  private asignarProveedorEnvio(): string {
    switch (this.metodoEnvio.tipo) {
      case TipoMetodoEnvio.ESTANDAR:
        return 'Correo Nacional';
      case TipoMetodoEnvio.EXPRESS:
        return 'Servicio Express';
      case TipoMetodoEnvio.INTERNACIONAL:
        return 'Correo Internacional';
      case TipoMetodoEnvio.GRATIS:
        return 'Envío Gratis';
      default:
        return 'Proveedor Desconocido';
    }
  }

  /**
   * Simula el procesamiento con el proveedor de envíos
   */
  private async simularProcesamientoConProveedor(): Promise<void> {
    // Simulación de procesamiento con proveedor
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Getters
  getId(): string { return this.id; }
  getOrdenId(): string { return this.ordenId; }
  getDireccionEnvio(): DireccionEnvio { return this.direccionEnvio; }
  getMetodoEnvio(): MetodoEnvio { return this.metodoEnvio; }
  getEstado(): EstadoEnvio { return this.estado; }
  getCosto(): number { return this.costo; }
  getFechaEstimadaEntrega(): Date { return this.fechaEstimadaEntrega; }
  getFechaCreacion(): Date { return this.fechaCreacion; }
  getFechaActualizacion(): Date { return this.fechaActualizacion; }
  getTrackingNumber(): string | null { return this.trackingNumber; }
  getProveedorEnvio(): string | null { return this.proveedorEnvio; }
  getDetalles(): DetallesEnvio { return this.detalles; }
}

/**
 * Enumeración de tipos de método de envío
 */
export enum TipoMetodoEnvio {
  ESTANDAR = 'ESTANDAR',
  EXPRESS = 'EXPRESS',
  INTERNACIONAL = 'INTERNACIONAL',
  GRATIS = 'GRATIS',
}

/**
 * Enumeración de estados del envío
 */
export enum EstadoEnvio {
  PENDIENTE = 'PENDIENTE',
  PROCESANDO = 'PROCESANDO',
  ENVIADO = 'ENVIADO',
  EN_TRANSITO = 'EN_TRANSITO',
  ENTREGADO = 'ENTREGADO',
  CANCELADO = 'CANCELADO',
}

/**
 * Interfaz para la dirección de envío
 */
export interface DireccionEnvio {
  nombreCompleto: string;
  calle: string;
  ciudad: string;
  estado?: string;
  codigoPostal: string;
  pais: string;
  telefono?: string;
  email?: string;
  instruccionesEspeciales?: string;
}

/**
 * Interfaz para el método de envío
 */
export interface MetodoEnvio {
  tipo: TipoMetodoEnvio;
  tiempoEstimadoDias: number;
  descripcion?: string;
  restricciones?: string[];
}

/**
 * Interfaz para los detalles del envío
 */
export interface DetallesEnvio {
  pesoTotal: number; // en kg
  dimensiones: Dimensiones;
  esFragil: boolean;
  requiereFirma: boolean;
  esRegalo: boolean;
  valorAsegurado: number;
  fechaEnvio?: Date;
  fechaEntrega?: Date;
  notas?: string;
}

/**
 * Interfaz para las dimensiones del paquete
 */
export interface Dimensiones {
  alto: number; // en cm
  ancho: number; // en cm
  largo: number; // en cm
}