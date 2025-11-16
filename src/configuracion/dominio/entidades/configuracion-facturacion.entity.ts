import { ExcepcionDominio } from '../../../comun/excepciones/excepcion-dominio';
import {
  DireccionFiscalDto,
  TipoMetodoPago,
  CicloFacturacion,
  EstadoFactura,
  FrecuenciaRecordatorio,
  MetodoPagoDto,
  FacturaHistorialDto,
  NotificacionPagoDto
} from '../../aplicacion/dto/configuracion-facturacion.dto';

/**
 * Entidad de Dominio para Configuración de Facturación
 * Implementa todas las reglas de negocio y validaciones
 */
export class ConfiguracionFacturacion {
  private constructor(
    private readonly _id: string,
    private readonly _tiendaId: string,
    private _nombreEmpresa: string,
    private _direccionFiscal: DireccionFiscalDto,
    private _emailFacturacion: string,
    private _telefonoContacto?: string,
    private _idFiscal?: string,
    private _metodosPago: MetodoPagoDto[] = [],
    private _cicloFacturacion: CicloFacturacion = CicloFacturacion.MENSUAL,
    private _fechaProxima: Date = new Date(),
    private _historialFacturas: FacturaHistorialDto[] = [],
    private _notificaciones?: NotificacionPagoDto,
    private _fechaCreacion: Date = new Date(),
    private _fechaActualizacion: Date = new Date()
  ) {
    this.validar();
  }

  /**
   * Factory method para crear una nueva configuración de facturación
   */
  public static crear(
    id: string,
    tiendaId: string,
    nombreEmpresa: string,
    direccionFiscal: DireccionFiscalDto,
    emailFacturacion: string,
    telefonoContacto?: string,
    idFiscal?: string,
    metodosPago: MetodoPagoDto[] = [],
    cicloFacturacion: CicloFacturacion = CicloFacturacion.MENSUAL,
    fechaProxima: Date = new Date(),
    historialFacturas: FacturaHistorialDto[] = [],
    notificaciones?: NotificacionPagoDto
  ): ConfiguracionFacturacion {
    return new ConfiguracionFacturacion(
      id,
      tiendaId,
      nombreEmpresa,
      direccionFiscal,
      emailFacturacion,
      telefonoContacto,
      idFiscal,
      metodosPago,
      cicloFacturacion,
      fechaProxima,
      historialFacturas,
      notificaciones
    );
  }

  /**
   * Factory method para reconstruir desde persistencia
   */
  public static reconstruir(
    id: string,
    tiendaId: string,
    nombreEmpresa: string,
    direccionFiscal: DireccionFiscalDto,
    emailFacturacion: string,
    telefonoContacto?: string,
    idFiscal?: string,
    metodosPago: MetodoPagoDto[] = [],
    cicloFacturacion: CicloFacturacion = CicloFacturacion.MENSUAL,
    fechaProxima: Date = new Date(),
    historialFacturas: FacturaHistorialDto[] = [],
    notificaciones?: NotificacionPagoDto,
    fechaCreacion: Date = new Date(),
    fechaActualizacion: Date = new Date()
  ): ConfiguracionFacturacion {
    return new ConfiguracionFacturacion(
      id,
      tiendaId,
      nombreEmpresa,
      direccionFiscal,
      emailFacturacion,
      telefonoContacto,
      idFiscal,
      metodosPago,
      cicloFacturacion,
      fechaProxima,
      historialFacturas,
      notificaciones,
      fechaCreacion,
      fechaActualizacion
    );
  }

  /**
   * Validaciones de dominio
   */
  private validar(): void {
    // Validar nombre de empresa
    if (!this._nombreEmpresa || this._nombreEmpresa.trim().length === 0) {
      throw ExcepcionDominio.Respuesta400(
        'El nombre legal de la empresa es requerido',
        'Facturacion.NombreEmpresaRequerido'
      );
    }

    if (this._nombreEmpresa.length > 100) {
      throw ExcepcionDominio.Respuesta400(
        'El nombre legal no puede exceder 100 caracteres',
        'Facturacion.NombreEmpresaExcedeLimite'
      );
    }

    // Validar dirección fiscal
    if (!this._direccionFiscal) {
      throw ExcepcionDominio.Respuesta400(
        'La dirección fiscal es requerida',
        'Facturacion.DireccionFiscalRequerida'
      );
    }

    // Validar email de facturación
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this._emailFacturacion)) {
      throw ExcepcionDominio.Respuesta400(
        'El email de facturación debe tener formato válido',
        'Facturacion.EmailFacturacionInvalido'
      );
    }

    // Validar teléfono si está presente
    if (this._telefonoContacto && !/^[0-9]*$/.test(this._telefonoContacto)) {
      throw ExcepcionDominio.Respuesta400(
        'El teléfono solo puede contener números',
        'Facturacion.TelefonoInvalido'
      );
    }

    if (this._telefonoContacto && this._telefonoContacto.length > 15) {
      throw ExcepcionDominio.Respuesta400(
        'El teléfono no puede exceder 15 caracteres',
        'Facturacion.TelefonoExcedeLimite'
      );
    }

    // Validar ID fiscal si está presente
    if (this._idFiscal && this._idFiscal.length > 20) {
      throw ExcepcionDominio.Respuesta400(
        'El ID fiscal no puede exceder 20 caracteres',
        'Facturacion.IdFiscalExcedeLimite'
      );
    }

    // Validar métodos de pago
    this.validarMetodosPago();

    // Validar fecha próxima factura
    if (this._fechaProxima <= new Date()) {
      throw ExcepcionDominio.Respuesta400(
        'La fecha de próxima factura debe ser posterior a la fecha actual',
        'Facturacion.FechaProximaInvalida'
      );
    }

    // Validar historial de facturas
    this.validarHistorialFacturas();
  }

  /**
   * Validar métodos de pago
   */
  private validarMetodosPago(): void {
    const metodosActivos = this._metodosPago.filter(metodo => metodo.estado_activo);
    
    // Validar que no haya métodos duplicados activos
    const tiposActivos = metodosActivos.map(metodo => metodo.tipo_metodo);
    const tiposUnicos = new Set(tiposActivos);
    
    if (tiposActivos.length !== tiposUnicos.size) {
      throw ExcepcionDominio.Respuesta400(
        'No se pueden tener métodos de pago duplicados activos',
        'Facturacion.MetodosPagoDuplicados'
      );
    }

    // Validar datos específicos por tipo de método
    for (const metodo of this._metodosPago) {
      this.validarMetodoPago(metodo);
    }
  }

  /**
   * Validar método de pago individual
   */
  private validarMetodoPago(metodo: MetodoPagoDto): void {
    // Validar fecha de expiración para tarjetas
    if (metodo.tipo_metodo === TipoMetodoPago.TARJETA_CREDITO && metodo.datos_metodo.fecha_expiracion) {
      const [mes, ano] = metodo.datos_metodo.fecha_expiracion.split('/');
      const fechaExpiracion = new Date(parseInt('20' + ano), parseInt(mes) - 1);
      
      if (fechaExpiracion < new Date()) {
        throw ExcepcionDominio.Respuesta400(
          'La tarjeta de crédito ha expirado',
          'Facturacion.TarjetaExpirada'
        );
      }
    }
  }

  /**
   * Validar historial de facturas
   */
  private validarHistorialFacturas(): void {
    const numerosFactura = new Set();
    
    for (const factura of this._historialFacturas) {
      // Validar número de factura único
      if (numerosFactura.has(factura.nro_factura)) {
        throw ExcepcionDominio.Respuesta400(
          'Los números de factura deben ser únicos',
          'Facturacion.NumeroFacturaDuplicado'
        );
      }
      numerosFactura.add(factura.nro_factura);

      // Validar monto positivo
      if (factura.monto < 0) {
        throw ExcepcionDominio.Respuesta400(
          'El monto de la factura debe ser positivo',
          'Facturacion.MontoFacturaNegativo'
        );
      }
    }
  }

  /**
   * Métodos de negocio
   */

  /**
   * Agregar método de pago
   */
  public agregarMetodoPago(metodo: MetodoPagoDto): void {
    // Validar que no exista un método activo del mismo tipo
    const metodoExistente = this._metodosPago.find(
      m => m.tipo_metodo === metodo.tipo_metodo && m.estado_activo
    );

    if (metodoExistente && metodo.estado_activo) {
      throw ExcepcionDominio.Respuesta400(
        `Ya existe un método de pago activo del tipo ${metodo.tipo_metodo}`,
        'Facturacion.MetodoPagoExistente'
      );
    }

    this._metodosPago.push(metodo);
    this.validarMetodosPago();
    this._fechaActualizacion = new Date();
  }

  /**
   * Desactivar método de pago
   */
  public desactivarMetodoPago(tipoMetodo: TipoMetodoPago): void {
    const metodo = this._metodosPago.find(m => m.tipo_metodo === tipoMetodo && m.estado_activo);
    
    if (!metodo) {
      throw ExcepcionDominio.Respuesta404(
        'Método de pago no encontrado o ya está inactivo',
        'Facturacion.MetodoPagoNoEncontrado'
      );
    }

    metodo.estado_activo = false;
    this._fechaActualizacion = new Date();
  }

  /**
   * Agregar factura al historial
   */
  public agregarFacturaHistorial(factura: FacturaHistorialDto): void {
    // Validar que el número de factura no exista
    const facturaExistente = this._historialFacturas.find(f => f.nro_factura === factura.nro_factura);
    
    if (facturaExistente) {
      throw ExcepcionDominio.Respuesta400(
        'El número de factura ya existe en el historial',
        'Facturacion.NumeroFacturaExistente'
      );
    }

    this._historialFacturas.push(factura);
    this._fechaActualizacion = new Date();
  }

  /**
   * Actualizar información de facturación
   */
  public actualizarInformacion(
    nombreEmpresa?: string,
    direccionFiscal?: DireccionFiscalDto,
    emailFacturacion?: string,
    telefonoContacto?: string,
    idFiscal?: string
  ): void {
    if (nombreEmpresa) this._nombreEmpresa = nombreEmpresa;
    if (direccionFiscal) this._direccionFiscal = direccionFiscal;
    if (emailFacturacion) this._emailFacturacion = emailFacturacion;
    if (telefonoContacto !== undefined) this._telefonoContacto = telefonoContacto;
    if (idFiscal !== undefined) this._idFiscal = idFiscal;

    this.validar();
    this._fechaActualizacion = new Date();
  }

  /**
   * Getters
   */
  get id(): string {
    return this._id;
  }

  get tiendaId(): string {
    return this._tiendaId;
  }

  get nombreEmpresa(): string {
    return this._nombreEmpresa;
  }

  get direccionFiscal(): DireccionFiscalDto {
    return this._direccionFiscal;
  }

  get emailFacturacion(): string {
    return this._emailFacturacion;
  }

  get telefonoContacto(): string | undefined {
    return this._telefonoContacto;
  }

  get idFiscal(): string | undefined {
    return this._idFiscal;
  }

  get metodosPago(): MetodoPagoDto[] {
    return this._metodosPago;
  }

  get cicloFacturacion(): CicloFacturacion {
    return this._cicloFacturacion;
  }

  get fechaProxima(): Date {
    return this._fechaProxima;
  }

  get historialFacturas(): FacturaHistorialDto[] {
    return this._historialFacturas;
  }

  get notificaciones(): NotificacionPagoDto | undefined {
    return this._notificaciones;
  }

  get fechaCreacion(): Date {
    return this._fechaCreacion;
  }

  get fechaActualizacion(): Date {
    return this._fechaActualizacion;
  }
}