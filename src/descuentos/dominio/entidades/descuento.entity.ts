import { TipoDescuento } from '../enums/tipo-descuento.enum';

/**
 * Entidad de Descuento que representa un descuento o promoción en el sistema
 * Sigue los principios de Domain-Driven Design y Arquitectura Limpia
 */
export class Descuento {
  constructor(
    public readonly id: string,
    public readonly codigo: string,
    public readonly tipo: TipoDescuento,
    public readonly valor: number,
    public readonly valorMinimo: number | null,
    public readonly usosMaximos: number | null,
    public readonly usosActuales: number,
    public readonly fechaInicio: Date | null,
    public readonly fechaFin: Date | null,
    public readonly activo: boolean,
    public readonly fechaCreacion: Date,
    public readonly fechaActualizacion: Date,
    // Nuevos campos para descuentos avanzados
    public readonly configuracionAvanzada: Record<string, any> | null = null,
    public readonly reglasValidacion: Record<string, any> | null = null,
    public readonly restricciones: Record<string, any> | null = null,
    public readonly nombreCampana: string | null = null,
    public readonly utmSource: string | null = null,
    public readonly utmMedium: string | null = null,
    public readonly utmCampaign: string | null = null,
    public readonly cantidadLleva: number | null = null,
    public readonly cantidadPaga: number | null = null,
    public readonly productosAplicables: string[] = [],
    public readonly coleccionesAplicables: string[] = [],
    public readonly paisesPermitidos: string[] = [],
    public readonly segmentosPermitidos: string[] = [],
    public readonly requisitosMinimos: Record<string, any> | null = null,
  ) {}

  /**
   * Verifica si el descuento está activo y puede ser utilizado
   */
  estaActivo(): boolean {
    if (!this.activo) {
      return false;
    }

    const ahora = new Date();

    // Verificar fecha de inicio
    if (this.fechaInicio && this.fechaInicio > ahora) {
      return false;
    }

    // Verificar fecha de fin
    if (this.fechaFin && this.fechaFin < ahora) {
      return false;
    }

    // Verificar límite de usos
    if (this.usosMaximos && this.usosActuales >= this.usosMaximos) {
      return false;
    }

    return true;
  }

  /**
   * Verifica si el descuento puede aplicarse a un monto específico con contexto adicional
   */
  puedeAplicarse(monto: number, datosContexto?: {
    cantidadItems?: number;
    productosCarrito?: Array<{ id: string; precio: number; cantidad: number }>;
    utmParams?: { source?: string; medium?: string; campaign?: string };
    paisCliente?: string;
    segmentosCliente?: string[];
  }): boolean {
    if (!this.estaActivo()) {
      return false;
    }

    // Verificar valor mínimo
    if (this.valorMinimo && monto < this.valorMinimo) {
      return false;
    }

    // Validaciones avanzadas por tipo de descuento
    switch (this.tipo) {
      case TipoDescuento.SUBTOTAL_CARRITO:
        return this.validarDescuentoSubtotalCarrito(monto);
      
      case TipoDescuento.LLEVA_X_PAGA_Y:
        return this.validarDescuentoLlevaXPagaY(datosContexto?.productosCarrito || []);
      
      case TipoDescuento.PROGRESIVO:
        return this.validarDescuentoProgresivo(monto);
      
      case TipoDescuento.CAMPAÑA_UTM:
        return this.validarDescuentoCampañaUTM(datosContexto?.utmParams);
      
      case TipoDescuento.COMBO:
        return this.validarDescuentoCombo(datosContexto?.productosCarrito || []);
    }

    // Validaciones generales avanzadas
    if (!this.validarRestriccionesPais(datosContexto?.paisCliente)) {
      return false;
    }

    if (!this.validarRestriccionesSegmentos(datosContexto?.segmentosCliente || [])) {
      return false;
    }

    if (!this.validarProductosAplicables(datosContexto?.productosCarrito || [])) {
      return false;
    }

    return true;
  }

  /**
   * Calcula el monto del descuento para un monto base
   */
  calcularDescuento(montoBase: number, datosContexto?: {
    cantidadItems?: number;
    productosCarrito?: Array<{ id: string; precio: number; cantidad: number }>;
    utmParams?: { source?: string; medium?: string; campaign?: string };
    paisCliente?: string;
    segmentosCliente?: string[];
  }): number {
    if (!this.puedeAplicarse(montoBase, datosContexto)) {
      return 0;
    }

    switch (this.tipo) {
      case TipoDescuento.PORCENTAJE:
        return (montoBase * this.valor) / 100;
      
      case TipoDescuento.MONTO_FIJO:
        return Math.min(this.valor, montoBase);
      
      case TipoDescuento.ENVIO_GRATIS:
        return 0; // El envío gratis se maneja de forma especial
      
      case TipoDescuento.SUBTOTAL_CARRITO:
        return this.calcularDescuentoSubtotalCarrito(montoBase);
      
      case TipoDescuento.LLEVA_X_PAGA_Y:
        return this.calcularDescuentoLlevaXPagaY(datosContexto?.productosCarrito || []);
      
      case TipoDescuento.PROGRESIVO:
        return this.calcularDescuentoProgresivo(montoBase);
      
      case TipoDescuento.CAMPAÑA_UTM:
        return this.calcularDescuentoCampañaUTM(montoBase, datosContexto?.utmParams);
      
      case TipoDescuento.COMBO:
        return this.calcularDescuentoCombo(datosContexto?.productosCarrito || []);
      
      default:
        return 0;
    }
  }

  /**
   * Registra un uso del descuento
   */
  registrarUso(): Descuento {
    const nuevosUsosActuales = this.usosActuales + 1;

    // Si hay límite de usos y se ha alcanzado, desactivar el descuento
    const nuevoActivo = this.usosMaximos 
      ? nuevosUsosActuales < this.usosMaximos
      : this.activo;

    return new Descuento(
      this.id,
      this.codigo,
      this.tipo,
      this.valor,
      this.valorMinimo,
      this.usosMaximos,
      nuevosUsosActuales,
      this.fechaInicio,
      this.fechaFin,
      nuevoActivo,
      this.fechaCreacion,
      new Date(),
    );
  }

  /**
   * Activa el descuento
   */
  activar(): Descuento {
    return new Descuento(
      this.id,
      this.codigo,
      this.tipo,
      this.valor,
      this.valorMinimo,
      this.usosMaximos,
      this.usosActuales,
      this.fechaInicio,
      this.fechaFin,
      true,
      this.fechaCreacion,
      new Date(),
    );
  }

  /**
   * Desactiva el descuento
   */
  desactivar(): Descuento {
    return new Descuento(
      this.id,
      this.codigo,
      this.tipo,
      this.valor,
      this.valorMinimo,
      this.usosMaximos,
      this.usosActuales,
      this.fechaInicio,
      this.fechaFin,
      false,
      this.fechaCreacion,
      new Date(),
    );
  }

  /**
   * Actualiza la información del descuento
   */
  actualizarInformacion(datos: {
    codigo?: string;
    tipo?: TipoDescuento;
    valor?: number;
    valorMinimo?: number | null;
    usosMaximos?: number | null;
    fechaInicio?: Date | null;
    fechaFin?: Date | null;
    activo?: boolean;
  }): Descuento {
    return new Descuento(
      this.id,
      datos.codigo || this.codigo,
      datos.tipo || this.tipo,
      datos.valor !== undefined ? datos.valor : this.valor,
      datos.valorMinimo !== undefined ? datos.valorMinimo : this.valorMinimo,
      datos.usosMaximos !== undefined ? datos.usosMaximos : this.usosMaximos,
      this.usosActuales,
      datos.fechaInicio !== undefined ? datos.fechaInicio : this.fechaInicio,
      datos.fechaFin !== undefined ? datos.fechaFin : this.fechaFin,
      datos.activo !== undefined ? datos.activo : this.activo,
      this.fechaCreacion,
      new Date(),
    );
  }

  /**
   * Valida que el descuento tenga configuraciones válidas
   */
  validar(): boolean {
    // Validar código
    if (!this.codigo || this.codigo.trim().length === 0) {
      return false;
    }

    // Validar valor
    if (this.valor < 0) {
      return false;
    }

    // Validar porcentaje (0-100)
    if (this.tipo === TipoDescuento.PORCENTAJE && this.valor > 100) {
      return false;
    }

    // Validar fechas
    if (this.fechaInicio && this.fechaFin && this.fechaInicio > this.fechaFin) {
      return false;
    }

    // Validar usos
    if (this.usosMaximos && this.usosMaximos < 0) {
      return false;
    }

    if (this.usosActuales < 0) {
      return false;
    }

    if (this.usosMaximos && this.usosActuales > this.usosMaximos) {
      return false;
    }

    return true;
  }

  /**
   * Obtiene una descripción legible del tipo de descuento
   */
  obtenerDescripcionTipo(): string {
    const descripciones = {
      [TipoDescuento.PORCENTAJE]: `Descuento del ${this.valor}%`,
      [TipoDescuento.MONTO_FIJO]: `Descuento de $${this.valor}`,
      [TipoDescuento.ENVIO_GRATIS]: 'Envío gratis',
      [TipoDescuento.SUBTOTAL_CARRITO]: `Descuento de ${this.valor}% sobre subtotal del carrito`,
      [TipoDescuento.LLEVA_X_PAGA_Y]: `Lleva ${this.cantidadLleva} paga ${this.cantidadPaga}`,
      [TipoDescuento.PROGRESIVO]: `Descuento progresivo hasta ${this.valor}%`,
      [TipoDescuento.CAMPAÑA_UTM]: `Campaña UTM: ${this.nombreCampana || this.utmCampaign}`,
      [TipoDescuento.COMBO]: `Combo especial con descuento`,
    };

    return descripciones[this.tipo] || 'Descuento desconocido';
  }

  // Métodos de validación para descuentos avanzados

  private validarDescuentoSubtotalCarrito(monto: number): boolean {
    return this.valorMinimo ? monto >= this.valorMinimo : true;
  }

  private validarDescuentoLlevaXPagaY(productosCarrito: Array<{ id: string; precio: number; cantidad: number }>): boolean {
    if (!this.cantidadLleva || !this.cantidadPaga) {
      return false;
    }

    const cantidadTotal = productosCarrito.reduce((total, producto) => total + producto.cantidad, 0);
    return cantidadTotal >= this.cantidadLleva;
  }

  private validarDescuentoProgresivo(monto: number): boolean {
    return this.valorMinimo ? monto >= this.valorMinimo : true;
  }

  private validarDescuentoCampañaUTM(utmParams?: { source?: string; medium?: string; campaign?: string }): boolean {
    if (!utmParams) return false;

    if (this.utmSource && utmParams.source !== this.utmSource) return false;
    if (this.utmMedium && utmParams.medium !== this.utmMedium) return false;
    if (this.utmCampaign && utmParams.campaign !== this.utmCampaign) return false;

    return true;
  }

  private validarDescuentoCombo(productosCarrito: Array<{ id: string; precio: number; cantidad: number }>): boolean {
    if (this.productosAplicables.length === 0) return true;

    const productosEnCarrito = productosCarrito.filter(producto =>
      this.productosAplicables.includes(producto.id)
    );

    return productosEnCarrito.length > 0;
  }

  private validarRestriccionesPais(paisCliente?: string): boolean {
    if (!paisCliente || this.paisesPermitidos.length === 0) return true;
    return this.paisesPermitidos.includes(paisCliente);
  }

  private validarRestriccionesSegmentos(segmentosCliente: string[]): boolean {
    if (this.segmentosPermitidos.length === 0) return true;
    return segmentosCliente.some(segmento => this.segmentosPermitidos.includes(segmento));
  }

  private validarProductosAplicables(productosCarrito: Array<{ id: string; precio: number; cantidad: number }>): boolean {
    if (this.productosAplicables.length === 0 && this.coleccionesAplicables.length === 0) return true;

    // Validar productos específicos
    if (this.productosAplicables.length > 0) {
      const tieneProductosAplicables = productosCarrito.some(producto =>
        this.productosAplicables.includes(producto.id)
      );
      if (!tieneProductosAplicables) return false;
    }

    // Nota: La validación de colecciones requeriría consultar la base de datos
    // por lo que se manejaría en una capa superior
    return true;
  }

  // Métodos de cálculo para descuentos avanzados

  private calcularDescuentoSubtotalCarrito(montoBase: number): number {
    return (montoBase * this.valor) / 100;
  }

  private calcularDescuentoLlevaXPagaY(productosCarrito: Array<{ id: string; precio: number; cantidad: number }>): number {
    if (!this.cantidadLleva || !this.cantidadPaga) return 0;

    const cantidadTotal = productosCarrito.reduce((total, producto) => total + producto.cantidad, 0);
    const gruposCompletos = Math.floor(cantidadTotal / this.cantidadLleva);
    
    if (gruposCompletos === 0) return 0;

    const productosAPagar = gruposCompletos * this.cantidadPaga;
    const productosALlevar = gruposCompletos * this.cantidadLleva;
    const productosGratis = productosALlevar - productosAPagar;

    // Calcular el valor promedio de los productos para determinar el descuento
    const totalCarrito = productosCarrito.reduce((total, producto) =>
      total + (producto.precio * producto.cantidad), 0
    );
    const valorPromedio = totalCarrito / cantidadTotal;

    return productosGratis * valorPromedio;
  }

  private calcularDescuentoProgresivo(montoBase: number): number {
    if (!this.configuracionAvanzada?.niveles) return 0;

    const niveles = this.configuracionAvanzada.niveles as Array<{ monto: number; descuento: number }>;
    const nivelAplicable = niveles
      .sort((a, b) => b.monto - a.monto)
      .find(nivel => montoBase >= nivel.monto);

    return nivelAplicable ? (montoBase * nivelAplicable.descuento) / 100 : 0;
  }

  private calcularDescuentoCampañaUTM(montoBase: number, utmParams?: { source?: string; medium?: string; campaign?: string }): number {
    return (montoBase * this.valor) / 100;
  }

  private calcularDescuentoCombo(productosCarrito: Array<{ id: string; precio: number; cantidad: number }>): number {
    if (this.productosAplicables.length === 0) return 0;

    const productosCombo = productosCarrito.filter(producto =>
      this.productosAplicables.includes(producto.id)
    );

    if (productosCombo.length === 0) return 0;

    const totalCombo = productosCombo.reduce((total, producto) =>
      total + (producto.precio * producto.cantidad), 0
    );

    return (totalCombo * this.valor) / 100;
  }

  // Métodos auxiliares para actualizar la entidad con nuevos campos

  actualizarInformacionAvanzada(datos: {
    configuracionAvanzada?: Record<string, any> | null;
    reglasValidacion?: Record<string, any> | null;
    restricciones?: Record<string, any> | null;
    nombreCampana?: string | null;
    utmSource?: string | null;
    utmMedium?: string | null;
    utmCampaign?: string | null;
    cantidadLleva?: number | null;
    cantidadPaga?: number | null;
    productosAplicables?: string[];
    coleccionesAplicables?: string[];
    paisesPermitidos?: string[];
    segmentosPermitidos?: string[];
    requisitosMinimos?: Record<string, any> | null;
  }): Descuento {
    return new Descuento(
      this.id,
      this.codigo,
      this.tipo,
      this.valor,
      this.valorMinimo,
      this.usosMaximos,
      this.usosActuales,
      this.fechaInicio,
      this.fechaFin,
      this.activo,
      this.fechaCreacion,
      new Date(),
      datos.configuracionAvanzada !== undefined ? datos.configuracionAvanzada : this.configuracionAvanzada,
      datos.reglasValidacion !== undefined ? datos.reglasValidacion : this.reglasValidacion,
      datos.restricciones !== undefined ? datos.restricciones : this.restricciones,
      datos.nombreCampana !== undefined ? datos.nombreCampana : this.nombreCampana,
      datos.utmSource !== undefined ? datos.utmSource : this.utmSource,
      datos.utmMedium !== undefined ? datos.utmMedium : this.utmMedium,
      datos.utmCampaign !== undefined ? datos.utmCampaign : this.utmCampaign,
      datos.cantidadLleva !== undefined ? datos.cantidadLleva : this.cantidadLleva,
      datos.cantidadPaga !== undefined ? datos.cantidadPaga : this.cantidadPaga,
      datos.productosAplicables !== undefined ? datos.productosAplicables : this.productosAplicables,
      datos.coleccionesAplicables !== undefined ? datos.coleccionesAplicables : this.coleccionesAplicables,
      datos.paisesPermitidos !== undefined ? datos.paisesPermitidos : this.paisesPermitidos,
      datos.segmentosPermitidos !== undefined ? datos.segmentosPermitidos : this.segmentosPermitidos,
      datos.requisitosMinimos !== undefined ? datos.requisitosMinimos : this.requisitosMinimos,
    );
  }
}