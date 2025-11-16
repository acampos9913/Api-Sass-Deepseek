import { ExcepcionDominio } from '../../../comun/excepciones/excepcion-dominio';
import {
  ConfiguracionGeneralDto,
  ActualizarConfiguracionGeneralDto,
  DireccionFacturacionDto,
  MonedaDto,
  ConfiguracionPedidosDto,
  RecursosTiendaDto,
  SistemaUnidadesEnum,
  UnidadPesoEnum,
  ProcesamientoPedidosEnum
} from '../../aplicacion/dto/configuracion-general.dto';

/**
 * Entidad de Configuración General
 * Implementa todas las reglas de negocio y validaciones para la configuración general de la tienda
 */
export class ConfiguracionGeneral {
  private constructor(
    private readonly _id: string,
    private readonly _tiendaId: string,
    private _nombreTienda: string,
    private _email: string,
    private _telefono: string | null,
    private _direccionFacturacion: DireccionFacturacionDto,
    private _moneda: MonedaDto,
    private _regionCopiaSeguridad: string,
    private _sistemaUnidades: SistemaUnidadesEnum,
    private _unidadPeso: UnidadPesoEnum,
    private _zonaHoraria: string,
    private _configuracionPedidos: ConfiguracionPedidosDto,
    private _recursosTienda: RecursosTiendaDto | null = null,
    private _fechaCreacion: Date = new Date(),
    private _fechaActualizacion: Date = new Date()
  ) {
    this.validar();
  }

  /**
   * Factory method para crear una nueva configuración general
   */
  public static crear(
    id: string,
    tiendaId: string,
    nombreTienda: string,
    email: string,
    telefono: string | null,
    direccionFacturacion: DireccionFacturacionDto,
    moneda: MonedaDto,
    regionCopiaSeguridad: string,
    sistemaUnidades: SistemaUnidadesEnum,
    unidadPeso: UnidadPesoEnum,
    zonaHoraria: string,
    configuracionPedidos: ConfiguracionPedidosDto,
    recursosTienda: RecursosTiendaDto | null = null
  ): ConfiguracionGeneral {
    return new ConfiguracionGeneral(
      id,
      tiendaId,
      nombreTienda,
      email,
      telefono,
      direccionFacturacion,
      moneda,
      regionCopiaSeguridad,
      sistemaUnidades,
      unidadPeso,
      zonaHoraria,
      configuracionPedidos,
      recursosTienda
    );
  }

  /**
   * Factory method para reconstruir desde persistencia
   */
  public static reconstruir(
    id: string,
    tiendaId: string,
    nombreTienda: string,
    email: string,
    telefono: string | null,
    direccionFacturacion: DireccionFacturacionDto,
    moneda: MonedaDto,
    regionCopiaSeguridad: string,
    sistemaUnidades: SistemaUnidadesEnum,
    unidadPeso: UnidadPesoEnum,
    zonaHoraria: string,
    configuracionPedidos: ConfiguracionPedidosDto,
    recursosTienda: RecursosTiendaDto | null = null,
    fechaCreacion: Date = new Date(),
    fechaActualizacion: Date = new Date()
  ): ConfiguracionGeneral {
    return new ConfiguracionGeneral(
      id,
      tiendaId,
      nombreTienda,
      email,
      telefono,
      direccionFacturacion,
      moneda,
      regionCopiaSeguridad,
      sistemaUnidades,
      unidadPeso,
      zonaHoraria,
      configuracionPedidos,
      recursosTienda,
      fechaCreacion,
      fechaActualizacion
    );
  }

  /**
   * Validaciones de dominio
   */
  private validar(): void {
    this.validarNombreTienda();
    this.validarEmail();
    this.validarTelefono();
    this.validarDireccionFacturacion();
    this.validarMoneda();
    this.validarRegionCopiaSeguridad();
    this.validarZonaHoraria();
    this.validarConfiguracionPedidos();
    this.validarConsistenciaUnidades();
  }

  /**
   * Validar nombre de la tienda
   */
  private validarNombreTienda(): void {
    if (!this._nombreTienda || this._nombreTienda.trim().length < 2) {
      throw ExcepcionDominio.Respuesta400(
        'El nombre de la tienda debe tener al menos 2 caracteres',
        'ConfiguracionGeneral.NombreTiendaInvalido'
      );
    }

    if (this._nombreTienda.length > 100) {
      throw ExcepcionDominio.Respuesta400(
        'El nombre de la tienda no puede exceder los 100 caracteres',
        'ConfiguracionGeneral.NombreTiendaDemasiadoLargo'
      );
    }
  }

  /**
   * Validar email
   */
  private validarEmail(): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this._email)) {
      throw ExcepcionDominio.Respuesta400(
        'El formato del correo electrónico no es válido',
        'ConfiguracionGeneral.EmailInvalido'
      );
    }
  }

  /**
   * Validar teléfono
   */
  private validarTelefono(): void {
    if (this._telefono && !this.esTelefonoValido(this._telefono)) {
      throw ExcepcionDominio.Respuesta400(
        'El formato del teléfono no es válido',
        'ConfiguracionGeneral.TelefonoInvalido'
      );
    }
  }

  /**
   * Validar dirección de facturación
   */
  private validarDireccionFacturacion(): void {
    const { calle, ciudad, provincia, pais, codigo_postal } = this._direccionFacturacion;

    if (!calle || calle.trim().length < 5) {
      throw ExcepcionDominio.Respuesta400(
        'La calle debe tener al menos 5 caracteres',
        'ConfiguracionGeneral.CalleInvalida'
      );
    }

    if (!ciudad || ciudad.trim().length < 2) {
      throw ExcepcionDominio.Respuesta400(
        'La ciudad debe tener al menos 2 caracteres',
        'ConfiguracionGeneral.CiudadInvalida'
      );
    }

    if (!provincia || provincia.trim().length < 2) {
      throw ExcepcionDominio.Respuesta400(
        'La provincia debe tener al menos 2 caracteres',
        'ConfiguracionGeneral.ProvinciaInvalida'
      );
    }

    if (!pais || pais.trim().length < 2) {
      throw ExcepcionDominio.Respuesta400(
        'El país debe tener al menos 2 caracteres',
        'ConfiguracionGeneral.PaisInvalido'
      );
    }

    if (!codigo_postal || !this.esCodigoPostalValido(codigo_postal)) {
      throw ExcepcionDominio.Respuesta400(
        'El código postal no es válido',
        'ConfiguracionGeneral.CodigoPostalInvalido'
      );
    }
  }

  /**
   * Validar moneda
   */
  private validarMoneda(): void {
    const { codigo, simbolo, nombre } = this._moneda;

    if (!codigo || codigo.length !== 3) {
      throw ExcepcionDominio.Respuesta400(
        'El código de moneda debe tener exactamente 3 caracteres',
        'ConfiguracionGeneral.CodigoMonedaInvalido'
      );
    }

    if (!simbolo || simbolo.trim().length === 0) {
      throw ExcepcionDominio.Respuesta400(
        'El símbolo de moneda es requerido',
        'ConfiguracionGeneral.SimboloMonedaInvalido'
      );
    }

    if (!nombre || nombre.trim().length < 2) {
      throw ExcepcionDominio.Respuesta400(
        'El nombre de la moneda debe tener al menos 2 caracteres',
        'ConfiguracionGeneral.NombreMonedaInvalido'
      );
    }
  }

  /**
   * Validar región de copia de seguridad
   */
  private validarRegionCopiaSeguridad(): void {
    if (!this._regionCopiaSeguridad || this._regionCopiaSeguridad.trim().length < 2) {
      throw ExcepcionDominio.Respuesta400(
        'La región de copia de seguridad es requerida',
        'ConfiguracionGeneral.RegionCopiaSeguridadInvalida'
      );
    }
  }

  /**
   * Validar zona horaria
   */
  private validarZonaHoraria(): void {
    if (!this._zonaHoraria || !this.esZonaHorariaValida(this._zonaHoraria)) {
      throw ExcepcionDominio.Respuesta400(
        'La zona horaria no es válida',
        'ConfiguracionGeneral.ZonaHorariaInvalida'
      );
    }
  }

  /**
   * Validar configuración de pedidos
   */
  private validarConfiguracionPedidos(): void {
    const { prefijo, sufijo } = this._configuracionPedidos;

    if (prefijo && (prefijo.length > 10 || !/^[A-Z0-9_-]*$/.test(prefijo))) {
      throw ExcepcionDominio.Respuesta400(
        'El prefijo debe tener máximo 10 caracteres y solo puede contener letras mayúsculas, números, guiones y guiones bajos',
        'ConfiguracionGeneral.PrefijoInvalido'
      );
    }

    if (sufijo && (sufijo.length > 10 || !/^[A-Z0-9_-]*$/.test(sufijo))) {
      throw ExcepcionDominio.Respuesta400(
        'El sufijo debe tener máximo 10 caracteres y solo puede contener letras mayúsculas, números, guiones y guiones bajos',
        'ConfiguracionGeneral.SufijoInvalido'
      );
    }
  }

  /**
   * Validar consistencia entre sistema de unidades y unidad de peso
   */
  private validarConsistenciaUnidades(): void {
    if (this._sistemaUnidades === SistemaUnidadesEnum.METRICO && 
        (this._unidadPeso === UnidadPesoEnum.LIBRAS || this._unidadPeso === UnidadPesoEnum.ONZAS)) {
      throw ExcepcionDominio.Respuesta400(
        'No se puede usar unidades imperiales con sistema métrico',
        'ConfiguracionGeneral.UnidadesInconsistentes'
      );
    }

    if (this._sistemaUnidades === SistemaUnidadesEnum.IMPERIAL && 
        (this._unidadPeso === UnidadPesoEnum.KILOGRAMOS || this._unidadPeso === UnidadPesoEnum.GRAMOS)) {
      throw ExcepcionDominio.Respuesta400(
        'No se puede usar unidades métricas con sistema imperial',
        'ConfiguracionGeneral.UnidadesInconsistentes'
      );
    }
  }

  /**
   * Métodos de negocio
   */

  /**
   * Actualizar configuración general
   */
  public actualizar(datos: ActualizarConfiguracionGeneralDto): void {
    if (datos.nombre_tienda !== undefined) {
      this._nombreTienda = datos.nombre_tienda;
    }

    if (datos.email !== undefined) {
      this._email = datos.email;
    }

    if (datos.telefono !== undefined) {
      this._telefono = datos.telefono;
    }

    if (datos.direccion_facturacion !== undefined) {
      this._direccionFacturacion = datos.direccion_facturacion;
    }

    if (datos.moneda !== undefined) {
      this._moneda = datos.moneda;
    }

    if (datos.region_copia_seguridad !== undefined) {
      this._regionCopiaSeguridad = datos.region_copia_seguridad;
    }

    if (datos.sistema_unidades !== undefined) {
      this._sistemaUnidades = datos.sistema_unidades;
    }

    if (datos.unidad_peso !== undefined) {
      this._unidadPeso = datos.unidad_peso;
    }

    if (datos.zona_horaria !== undefined) {
      this._zonaHoraria = datos.zona_horaria;
    }

    if (datos.configuracion_pedidos !== undefined) {
      this._configuracionPedidos = datos.configuracion_pedidos;
    }

    if (datos.recursos_tienda !== undefined) {
      this._recursosTienda = datos.recursos_tienda;
    }

    this._fechaActualizacion = new Date();
    this.validar();
  }

  /**
   * Actualizar dirección de facturación
   */
  public actualizarDireccionFacturacion(direccion: DireccionFacturacionDto): void {
    this._direccionFacturacion = direccion;
    this._fechaActualizacion = new Date();
    this.validar();
  }

  /**
   * Actualizar configuración de moneda
   */
  public actualizarMoneda(moneda: MonedaDto): void {
    this._moneda = moneda;
    this._fechaActualizacion = new Date();
    this.validar();
  }

  /**
   * Actualizar configuración de pedidos
   */
  public actualizarConfiguracionPedidos(configuracion: ConfiguracionPedidosDto): void {
    this._configuracionPedidos = configuracion;
    this._fechaActualizacion = new Date();
    this.validar();
  }

  /**
   * Actualizar recursos de tienda
   */
  public actualizarRecursosTienda(recursos: RecursosTiendaDto): void {
    this._recursosTienda = recursos;
    this._fechaActualizacion = new Date();
    this.validar();
  }

  /**
   * Métodos de utilidad
   */

  /**
   * Verificar si el teléfono es válido
   */
  private esTelefonoValido(telefono: string): boolean {
    const telefonoRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return telefonoRegex.test(telefono.replace(/[\s\-\(\)]/g, ''));
  }

  /**
   * Verificar si el código postal es válido
   */
  private esCodigoPostalValido(codigoPostal: string): boolean {
    // Patrón básico para códigos postales internacionales
    const codigoPostalRegex = /^[A-Z0-9\-\s]{3,10}$/i;
    return codigoPostalRegex.test(codigoPostal);
  }

  /**
   * Verificar si la zona horaria es válida
   */
  private esZonaHorariaValida(zonaHoraria: string): boolean {
    // Lista de zonas horarias comunes
    const zonasHorariasValidas = [
      'America/Lima', 'America/New_York', 'America/Los_Angeles', 'Europe/London',
      'Europe/Paris', 'Asia/Tokyo', 'Australia/Sydney', 'UTC', 'GMT'
    ];
    return zonasHorariasValidas.includes(zonaHoraria);
  }

  /**
   * Convertir a DTO
   */
  public aDto(): ConfiguracionGeneralDto {
    return {
      nombre_tienda: this._nombreTienda,
      email: this._email,
      telefono: this._telefono || undefined,
      direccion_facturacion: this._direccionFacturacion,
      moneda: this._moneda,
      region_copia_seguridad: this._regionCopiaSeguridad,
      sistema_unidades: this._sistemaUnidades,
      unidad_peso: this._unidadPeso,
      zona_horaria: this._zonaHoraria,
      configuracion_pedidos: this._configuracionPedidos,
      recursos_tienda: this._recursosTienda || undefined
    };
  }

  /**
   * Obtener resumen de la configuración
   */
  public obtenerResumen(): {
    nombre_tienda: string;
    email: string;
    moneda: string;
    sistema_unidades: string;
    zona_horaria: string;
  } {
    return {
      nombre_tienda: this._nombreTienda,
      email: this._email,
      moneda: this._moneda.codigo,
      sistema_unidades: this._sistemaUnidades,
      zona_horaria: this._zonaHoraria
    };
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

  get nombreTienda(): string {
    return this._nombreTienda;
  }

  get email(): string {
    return this._email;
  }

  get telefono(): string | null {
    return this._telefono;
  }

  get direccionFacturacion(): DireccionFacturacionDto {
    return this._direccionFacturacion;
  }

  get moneda(): MonedaDto {
    return this._moneda;
  }

  get regionCopiaSeguridad(): string {
    return this._regionCopiaSeguridad;
  }

  get sistemaUnidades(): SistemaUnidadesEnum {
    return this._sistemaUnidades;
  }

  get unidadPeso(): UnidadPesoEnum {
    return this._unidadPeso;
  }

  get zonaHoraria(): string {
    return this._zonaHoraria;
  }

  get configuracionPedidos(): ConfiguracionPedidosDto {
    return this._configuracionPedidos;
  }

  get recursosTienda(): RecursosTiendaDto | null {
    return this._recursosTienda;
  }

  get fechaCreacion(): Date {
    return this._fechaCreacion;
  }

  get fechaActualizacion(): Date {
    return this._fechaActualizacion;
  }
}