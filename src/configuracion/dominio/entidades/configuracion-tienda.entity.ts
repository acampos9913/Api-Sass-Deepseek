/**
 * Entidad de Dominio para la Configuración de la Tienda
 * Contiene la lógica de negocio para la configuración general de la tienda
 * Sigue los principios de la Arquitectura Limpia
 */
export class ConfiguracionTienda {
  constructor(
    private readonly id: string,
    private readonly nombreTienda: string,
    private readonly descripcionTienda: string | null,
    private readonly moneda: Moneda,
    private readonly impuestos: ConfiguracionImpuestos,
    private readonly direccion: DireccionTienda,
    private readonly contacto: ContactoTienda,
    private readonly configuracionEnvio: ConfiguracionEnvio,
    private readonly configuracionPagos: ConfiguracionPagos,
    private readonly configuracionGeneral: ConfiguracionGeneral,
    private readonly configuracionFacturacion: ConfiguracionFacturacion,
    private readonly fechaCreacion: Date,
    private readonly fechaActualizacion: Date,
  ) {}

  /**
   * Valida que la configuración de la tienda sea válida
   */
  validar(): void {
    if (!this.id) {
      throw new Error('El ID de configuración es requerido');
    }

    if (!this.nombreTienda || this.nombreTienda.trim().length === 0) {
      throw new Error('El nombre de la tienda es requerido');
    }

    if (this.nombreTienda.length > 100) {
      throw new Error('El nombre de la tienda no puede exceder 100 caracteres');
    }

    if (this.descripcionTienda && this.descripcionTienda.length > 500) {
      throw new Error('La descripción de la tienda no puede exceder 500 caracteres');
    }

    this.validarMoneda();
    this.validarImpuestos();
    this.validarDireccion();
    this.validarContacto();
    this.validarConfiguracionEnvio();
    this.validarConfiguracionPagos();
    this.validarConfiguracionGeneral();
    this.validarConfiguracionFacturacion();
  }

  /**
   * Valida la configuración de moneda
   */
  private validarMoneda(): void {
    if (!this.moneda.codigo) {
      throw new Error('El código de moneda es requerido');
    }

    if (!this.moneda.simbolo) {
      throw new Error('El símbolo de moneda es requerido');
    }

    // Validar códigos de moneda ISO 4217 comunes
    const codigosMonedaValidos = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'MXN', 'BRL'];
    if (!codigosMonedaValidos.includes(this.moneda.codigo)) {
      throw new Error('Código de moneda no válido');
    }
  }

  /**
   * Valida la configuración de impuestos
   */
  private validarImpuestos(): void {
    if (this.impuestos.impuestoVenta < 0 || this.impuestos.impuestoVenta > 100) {
      throw new Error('El impuesto de venta debe estar entre 0 y 100');
    }

    if (this.impuestos.incluirImpuestosEnPrecios && this.impuestos.impuestoVenta === 0) {
      throw new Error('No se pueden incluir impuestos en precios si el impuesto es 0');
    }

    if (this.impuestos.pais && this.impuestos.pais.length > 100) {
      throw new Error('El país para impuestos no puede exceder 100 caracteres');
    }
  }

  /**
   * Valida la dirección de la tienda
   */
  private validarDireccion(): void {
    if (!this.direccion.calle) {
      throw new Error('La calle de la dirección es requerida');
    }

    if (!this.direccion.ciudad) {
      throw new Error('La ciudad de la dirección es requerida');
    }

    if (!this.direccion.codigoPostal) {
      throw new Error('El código postal de la dirección es requerido');
    }

    if (!this.direccion.pais) {
      throw new Error('El país de la dirección es requerido');
    }

    if (this.direccion.calle.length > 200) {
      throw new Error('La calle no puede exceder 200 caracteres');
    }

    if (this.direccion.ciudad.length > 100) {
      throw new Error('La ciudad no puede exceder 100 caracteres');
    }

    if (this.direccion.codigoPostal.length > 20) {
      throw new Error('El código postal no puede exceder 20 caracteres');
    }

    if (this.direccion.pais.length > 100) {
      throw new Error('El país no puede exceder 100 caracteres');
    }
  }

  /**
   * Valida la información de contacto
   */
  private validarContacto(): void {
    if (!this.contacto.email) {
      throw new Error('El email de contacto es requerido');
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.contacto.email)) {
      throw new Error('El formato del email no es válido');
    }

    if (this.contacto.telefono && this.contacto.telefono.length > 20) {
      throw new Error('El teléfono no puede exceder 20 caracteres');
    }

    if (this.contacto.sitioWeb) {
      try {
        new URL(this.contacto.sitioWeb);
      } catch {
        throw new Error('El formato del sitio web no es válido');
      }
    }
  }

  /**
   * Valida la configuración de envío
   */
  private validarConfiguracionEnvio(): void {
    if (this.configuracionEnvio.costoEnvioGratisMinimo < 0) {
      throw new Error('El costo mínimo para envío gratis no puede ser negativo');
    }

    if (this.configuracionEnvio.tiempoProcesamientoDias < 0) {
      throw new Error('El tiempo de procesamiento no puede ser negativo');
    }

    if (this.configuracionEnvio.tiempoProcesamientoDias > 30) {
      throw new Error('El tiempo de procesamiento no puede exceder 30 días');
    }
  }

  /**
   * Valida la configuración de pagos
   */
  private validarConfiguracionPagos(): void {
    if (!Array.isArray(this.configuracionPagos.metodosPagoAceptados)) {
      throw new Error('Los métodos de pago aceptados deben ser un array');
    }

    if (this.configuracionPagos.metodosPagoAceptados.length === 0) {
      throw new Error('Debe haber al menos un método de pago aceptado');
    }

    // Validar que los métodos de pago sean válidos
    const metodosValidos = ['TARJETA_CREDITO', 'PAYPAL', 'TRANSFERENCIA', 'EFECTIVO'];
    for (const metodo of this.configuracionPagos.metodosPagoAceptados) {
      if (!metodosValidos.includes(metodo)) {
        throw new Error(`Método de pago no válido: ${metodo}`);
      }
    }
  }

  /**
   * Valida la configuración general
   */
  private validarConfiguracionGeneral(): void {
    if (!this.configuracionGeneral.nombreTienda || this.configuracionGeneral.nombreTienda.trim().length === 0) {
      throw new Error('El nombre de la tienda es requerido');
    }

    if (this.configuracionGeneral.nombreTienda.length > 100) {
      throw new Error('El nombre de la tienda no puede exceder 100 caracteres');
    }

    if (!this.configuracionGeneral.correoContacto) {
      throw new Error('El correo de contacto es requerido');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.configuracionGeneral.correoContacto)) {
      throw new Error('El formato del correo de contacto no es válido');
    }

    if (this.configuracionGeneral.telefonoContacto && !/^[0-9]*$/.test(this.configuracionGeneral.telefonoContacto)) {
      throw new Error('El teléfono solo puede contener números');
    }

    if (!this.configuracionGeneral.direccionFacturacion) {
      throw new Error('La dirección de facturación es requerida');
    }

    if (this.configuracionGeneral.direccionFacturacion.length > 200) {
      throw new Error('La dirección de facturación no puede exceder 200 caracteres');
    }

    const monedasValidas = ['USD', 'PEN', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'MXN', 'BRL'];
    if (!monedasValidas.includes(this.configuracionGeneral.monedaPredeterminada)) {
      throw new Error('La moneda predeterminada debe ser una opción válida');
    }

    const regionesValidas = ['Perú', 'Estados Unidos', 'México', 'Colombia', 'Chile', 'Argentina', 'España', 'Brasil', 'Reino Unido', 'Canadá', 'Australia', 'Alemania', 'Francia', 'Italia'];
    if (!regionesValidas.includes(this.configuracionGeneral.regionRespaldo)) {
      throw new Error('La región de respaldo debe ser una opción válida');
    }

    if (!['Métrico', 'Imperial'].includes(this.configuracionGeneral.sistemaUnidades)) {
      throw new Error('El sistema de unidades debe ser "Métrico" o "Imperial"');
    }

    if (!['kg', 'g', 'lb', 'oz'].includes(this.configuracionGeneral.unidadPeso)) {
      throw new Error('La unidad de peso debe ser una opción válida');
    }

    if (this.configuracionGeneral.zonaHoraria && !this.esZonaHorariaValida(this.configuracionGeneral.zonaHoraria)) {
      throw new Error('Zona horaria no válida');
    }

    if (this.configuracionGeneral.prefijoPedido && this.configuracionGeneral.prefijoPedido.length > 5) {
      throw new Error('El prefijo de pedido no puede exceder 5 caracteres');
    }

    if (this.configuracionGeneral.sufijoPedido && this.configuracionGeneral.sufijoPedido.length > 5) {
      throw new Error('El sufijo de pedido no puede exceder 5 caracteres');
    }

    const opcionesProcesamiento = ['Sí - todos los artículos', 'Sí - solo tarjetas de regalo', 'No'];
    if (!opcionesProcesamiento.includes(this.configuracionGeneral.procesarPedidoAutomaticamente)) {
      throw new Error('La opción de procesar pedido automáticamente debe ser válida');
    }

    if (this.configuracionGeneral.mantenimiento && !this.configuracionGeneral.mensajeMantenimiento) {
      throw new Error('Se requiere un mensaje de mantenimiento cuando la tienda está en modo mantenimiento');
    }
  }

  /**
   * Valida la configuración de facturación
   */
  private validarConfiguracionFacturacion(): void {
    if (!this.configuracionFacturacion.nombre_empresa || this.configuracionFacturacion.nombre_empresa.trim().length === 0) {
      throw new Error('El nombre legal de la empresa es requerido');
    }

    if (this.configuracionFacturacion.nombre_empresa.length > 100) {
      throw new Error('El nombre legal no puede exceder 100 caracteres');
    }

    this.validarDireccionFiscal();
    this.validarEmailFacturacion();
    this.validarTelefonoContacto();
    this.validarIdFiscal();
    this.validarMetodosPago();
    this.validarCicloFacturacion();
    this.validarFechaProximaFactura();
    this.validarHistorialFacturas();
    this.validarNotificaciones();
  }

  /**
   * Valida la dirección fiscal
   */
  private validarDireccionFiscal(): void {
    const direccion = this.configuracionFacturacion.direccion_fiscal;
    
    if (!direccion.calle || direccion.calle.trim().length === 0) {
      throw new Error('La calle de la dirección fiscal es requerida');
    }

    if (!direccion.ciudad || direccion.ciudad.trim().length === 0) {
      throw new Error('La ciudad de la dirección fiscal es requerida');
    }

    if (!direccion.region || direccion.region.trim().length === 0) {
      throw new Error('La región de la dirección fiscal es requerida');
    }

    if (!direccion.pais || direccion.pais.trim().length === 0) {
      throw new Error('El país de la dirección fiscal es requerido');
    }

    if (!direccion.codigo_postal || direccion.codigo_postal.trim().length === 0) {
      throw new Error('El código postal de la dirección fiscal es requerido');
    }
  }

  /**
   * Valida el email de facturación
   */
  private validarEmailFacturacion(): void {
    if (!this.configuracionFacturacion.email_facturacion) {
      throw new Error('El email de facturación es requerido');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.configuracionFacturacion.email_facturacion)) {
      throw new Error('El formato del email de facturación no es válido');
    }
  }

  /**
   * Valida el teléfono de contacto
   */
  private validarTelefonoContacto(): void {
    if (this.configuracionFacturacion.telefono_contacto) {
      // Validación básica de teléfono (solo números, longitud máxima)
      if (!/^[0-9]*$/.test(this.configuracionFacturacion.telefono_contacto)) {
        throw new Error('El teléfono de contacto solo puede contener números');
      }

      if (this.configuracionFacturacion.telefono_contacto.length > 15) {
        throw new Error('El teléfono de contacto no puede exceder 15 caracteres');
      }
    }
  }

  /**
   * Valida el ID fiscal según la región
   */
  private validarIdFiscal(): void {
    if (this.configuracionFacturacion.id_fiscal) {
      // Validación básica de ID fiscal (solo números y letras, longitud máxima)
      if (!/^[A-Za-z0-9]*$/.test(this.configuracionFacturacion.id_fiscal)) {
        throw new Error('El ID fiscal solo puede contener letras y números');
      }

      if (this.configuracionFacturacion.id_fiscal.length > 20) {
        throw new Error('El ID fiscal no puede exceder 20 caracteres');
      }

      // Validación específica por país (ejemplo para Perú: RUC de 11 dígitos)
      const pais = this.configuracionFacturacion.direccion_fiscal.pais.toLowerCase();
      if (pais.includes('perú') || pais.includes('peru')) {
        if (!/^\d{11}$/.test(this.configuracionFacturacion.id_fiscal)) {
          throw new Error('Para Perú, el RUC debe tener 11 dígitos');
        }
      }
    }
  }

  /**
   * Valida los métodos de pago
   */
  private validarMetodosPago(): void {
    if (!Array.isArray(this.configuracionFacturacion.metodos_pago)) {
      throw new Error('Los métodos de pago deben ser un array');
    }

    // Validar que no haya métodos duplicados activos
    const metodosActivos = this.configuracionFacturacion.metodos_pago
      .filter(metodo => metodo.estado_activo)
      .map(metodo => metodo.tipo_metodo);

    const metodosUnicos = new Set(metodosActivos);
    if (metodosActivos.length !== metodosUnicos.size) {
      throw new Error('No se pueden tener métodos de pago duplicados activos');
    }

    // Validar cada método de pago
    for (const metodo of this.configuracionFacturacion.metodos_pago) {
      this.validarMetodoPagoIndividual(metodo);
    }
  }

  /**
   * Valida un método de pago individual
   */
  private validarMetodoPagoIndividual(metodo: any): void {
    if (!metodo.tipo_metodo) {
      throw new Error('El tipo de método de pago es requerido');
    }

    if (!metodo.datos_metodo) {
      throw new Error('Los datos del método de pago son requeridos');
    }

    if (typeof metodo.estado_activo !== 'boolean') {
      throw new Error('El estado activo del método de pago debe ser un valor booleano');
    }

    // Validar datos específicos por tipo de método
    switch (metodo.tipo_metodo) {
      case 'tarjeta de crédito':
        this.validarTarjetaCredito(metodo.datos_metodo);
        break;
      case 'PayPal':
        this.validarPayPal(metodo.datos_metodo);
        break;
      // Agregar validaciones para otros tipos de métodos
    }
  }

  /**
   * Valida datos de tarjeta de crédito
   */
  private validarTarjetaCredito(datos: any): void {
    if (datos.fecha_expiracion) {
      const [mes, ano] = datos.fecha_expiracion.split('/');
      const fechaExpiracion = new Date(Number('20' + ano), Number(mes) - 1);
      if (fechaExpiracion < new Date()) {
        throw new Error('La tarjeta de crédito ha expirado');
      }
    }
  }

  /**
   * Valida datos de PayPal
   */
  private validarPayPal(datos: any): void {
    if (datos.email_paypal) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(datos.email_paypal)) {
        throw new Error('El email de PayPal debe tener formato válido');
      }
    }
  }

  /**
   * Valida el ciclo de facturación
   */
  private validarCicloFacturacion(): void {
    if (!this.configuracionFacturacion.ciclo_facturacion) {
      throw new Error('El ciclo de facturación es requerido');
    }

    const ciclosValidos = ['mensual', 'anual'];
    if (!ciclosValidos.includes(this.configuracionFacturacion.ciclo_facturacion)) {
      throw new Error('Ciclo de facturación no válido');
    }
  }

  /**
   * Valida la fecha de próxima factura
   */
  private validarFechaProximaFactura(): void {
    if (!this.configuracionFacturacion.fecha_proxima) {
      throw new Error('La fecha de próxima factura es requerida');
    }

    const fechaProxima = new Date(this.configuracionFacturacion.fecha_proxima);
    if (fechaProxima <= new Date()) {
      throw new Error('La fecha de próxima factura debe ser posterior a la fecha actual');
    }
  }

  /**
   * Valida el historial de facturas
   */
  private validarHistorialFacturas(): void {
    if (!Array.isArray(this.configuracionFacturacion.historial_facturas)) {
      throw new Error('El historial de facturas debe ser un array');
    }

    const numerosFactura = new Set();
    for (const factura of this.configuracionFacturacion.historial_facturas) {
      if (!factura.nro_factura) {
        throw new Error('El número de factura es requerido');
      }

      if (numerosFactura.has(factura.nro_factura)) {
        throw new Error('Los números de factura deben ser únicos');
      }
      numerosFactura.add(factura.nro_factura);

      if (!factura.fecha) {
        throw new Error('La fecha de factura es requerida');
      }

      if (factura.monto < 0) {
        throw new Error('El monto de la factura debe ser positivo');
      }

      if (!factura.estado) {
        throw new Error('El estado de la factura es requerido');
      }

      const estadosValidos = ['pendiente', 'pagada', 'vencida'];
      if (!estadosValidos.includes(factura.estado)) {
        throw new Error('Estado de factura no válido');
      }
    }
  }

  /**
   * Valida las notificaciones de pago
   */
  private validarNotificaciones(): void {
    const notificaciones = this.configuracionFacturacion.notificaciones;
    
    if (!notificaciones.email_destinatario) {
      throw new Error('El email destinatario para notificaciones es requerido');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(notificaciones.email_destinatario)) {
      throw new Error('El email destinatario debe tener formato válido');
    }

    if (!notificaciones.frecuencia) {
      throw new Error('La frecuencia de recordatorio es requerida');
    }

    const frecuenciasValidas = ['diaria', 'semanal', 'antes de vencimiento'];
    if (!frecuenciasValidas.includes(notificaciones.frecuencia)) {
      throw new Error('Frecuencia de recordatorio no válida');
    }

    if (typeof notificaciones.estado_envio !== 'boolean') {
      throw new Error('El estado de envío debe ser un valor booleano');
    }
  }

  /**
   * Verifica si una zona horaria es válida (simulación)
   */
  private esZonaHorariaValida(zonaHoraria: string): boolean {
    const zonasValidas = [
      'America/Lima', 'America/New_York', 'America/Los_Angeles', 'Europe/London',
      'Europe/Paris', 'Asia/Tokyo', 'Australia/Sydney'
    ];
    return zonasValidas.includes(zonaHoraria);
  }

  /**
   * Calcula el impuesto para un monto dado
   */
  calcularImpuesto(monto: number): number {
    if (monto < 0) {
      throw new Error('El monto no puede ser negativo');
    }

    return monto * (this.impuestos.impuestoVenta / 100);
  }

  /**
   * Verifica si un método de pago es aceptado
   */
  esMetodoPagoAceptado(metodo: string): boolean {
    return this.configuracionPagos.metodosPagoAceptados.includes(metodo);
  }

  /**
   * Verifica si un pedido califica para envío gratis
   */
  calificaEnvioGratis(totalPedido: number): boolean {
    return totalPedido >= this.configuracionEnvio.costoEnvioGratisMinimo;
  }

  /**
   * Obtiene la fecha estimada de envío basada en la configuración
   */
  obtenerFechaEstimadaEnvio(): Date {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() + this.configuracionEnvio.tiempoProcesamientoDias);
    return fecha;
  }

  // Getters
  getId(): string { return this.id; }
  getNombreTienda(): string { return this.nombreTienda; }
  getDescripcionTienda(): string | null { return this.descripcionTienda; }
  getMoneda(): Moneda { return this.moneda; }
  getImpuestos(): ConfiguracionImpuestos { return this.impuestos; }
  getDireccion(): DireccionTienda { return this.direccion; }
  getContacto(): ContactoTienda { return this.contacto; }
  getConfiguracionEnvio(): ConfiguracionEnvio { return this.configuracionEnvio; }
  getConfiguracionPagos(): ConfiguracionPagos { return this.configuracionPagos; }
  getConfiguracionGeneral(): ConfiguracionGeneral { return this.configuracionGeneral; }
  getConfiguracionFacturacion(): ConfiguracionFacturacion { return this.configuracionFacturacion; }
  getFechaCreacion(): Date { return this.fechaCreacion; }
  getFechaActualizacion(): Date { return this.fechaActualizacion; }
}

/**
 * Interfaces para las diferentes configuraciones
 */

export interface Moneda {
  codigo: string;
  simbolo: string;
  decimales: number;
}

export interface ConfiguracionImpuestos {
  impuestoVenta: number;
  incluirImpuestosEnPrecios: boolean;
  pais?: string;
  estado?: string;
}

export interface DireccionTienda {
  calle: string;
  ciudad: string;
  estado?: string;
  codigoPostal: string;
  pais: string;
}

export interface ContactoTienda {
  email: string;
  telefono?: string;
  sitioWeb?: string;
}

export interface ConfiguracionEnvio {
  costoEnvioGratisMinimo: number;
  tiempoProcesamientoDias: number;
  politicasEnvio?: string;
}

export interface ConfiguracionPagos {
  metodosPagoAceptados: string[];
  monedaPorDefecto: string;
}

export interface ConfiguracionGeneral {
  zonaHoraria?: string;
  idioma?: string;
  mantenimiento: boolean;
  mensajeMantenimiento?: string;
  terminosServicio?: string;
  politicaPrivacidad?: string;
  nombreTienda: string;
  correoContacto: string;
  telefonoContacto?: string;
  direccionFacturacion: string;
  monedaPredeterminada: string;
  regionRespaldo: string;
  sistemaUnidades: string;
  unidadPeso: string;
  prefijoPedido?: string;
  sufijoPedido?: string;
  procesarPedidoAutomaticamente: string;
  archivarPedidoAutomaticamente?: boolean;
}

/**
 * Interfaces para la configuración de facturación
 */
export interface ConfiguracionFacturacion {
  nombre_empresa: string;
  direccion_fiscal: DireccionFiscal;
  email_facturacion: string;
  telefono_contacto?: string;
  id_fiscal?: string;
  metodos_pago: MetodoPago[];
  ciclo_facturacion: string;
  fecha_proxima: string;
  historial_facturas: FacturaHistorial[];
  notificaciones: NotificacionPago;
}

export interface DireccionFiscal {
  calle: string;
  ciudad: string;
  region: string;
  pais: string;
  codigo_postal: string;
}

export interface MetodoPago {
  tipo_metodo: string;
  datos_metodo: any;
  estado_activo: boolean;
  fecha_registro: string;
}

export interface FacturaHistorial {
  nro_factura: string;
  fecha: string;
  monto: number;
  estado: string;
}

export interface NotificacionPago {
  email_destinatario: string;
  frecuencia: string;
  estado_envio: boolean;
}