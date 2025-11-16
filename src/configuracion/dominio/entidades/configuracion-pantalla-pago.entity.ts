import { nanoid } from 'nanoid';
import { 
  TipoContactoPermitido,
  RequerimientoNombre,
  RequerimientoCampo,
  IdiomaPantallaPago,
  ConfiguracionContactoDto,
  ConfiguracionInformacionClienteDto,
  ConfiguracionMarketingDto,
  ConfiguracionPropinasDto,
  ConfiguracionIdiomaPersonalizacionDto,
  ConfiguracionReglasAvanzadasDto
} from '../../aplicacion/dto/configuracion-pantalla-pago.dto';
import { ExcepcionDominio } from '../../../comun/excepciones/excepcion-dominio';

/**
 * Entidad de dominio para configuración de pantalla de pago
 * Contiene la lógica de negocio y validaciones para la configuración del checkout
 */
export class ConfiguracionPantallaPago {
  public readonly id: string;
  public readonly tiendaId: string;
  
  // Configuraciones principales
  private _configuracionContacto: ConfiguracionContactoDto;
  private _configuracionInformacionCliente: ConfiguracionInformacionClienteDto;
  private _configuracionMarketing: ConfiguracionMarketingDto;
  private _configuracionPropinas: ConfiguracionPropinasDto;
  private _configuracionIdiomaPersonalizacion: ConfiguracionIdiomaPersonalizacionDto;
  private _configuracionReglasAvanzadas?: ConfiguracionReglasAvanzadasDto;
  private _configuracionAdicional?: Record<string, any>;

  // Auditoría
  public readonly fechaCreacion: Date;
  public fechaActualizacion: Date;

  /**
   * Constructor privado para forzar el uso de métodos de fábrica
   */
  private constructor(
    id: string,
    tiendaId: string,
    configuracionContacto: ConfiguracionContactoDto,
    configuracionInformacionCliente: ConfiguracionInformacionClienteDto,
    configuracionMarketing: ConfiguracionMarketingDto,
    configuracionPropinas: ConfiguracionPropinasDto,
    configuracionIdiomaPersonalizacion: ConfiguracionIdiomaPersonalizacionDto,
    configuracionReglasAvanzadas?: ConfiguracionReglasAvanzadasDto,
    configuracionAdicional?: Record<string, any>,
    fechaCreacion?: Date,
    fechaActualizacion?: Date
  ) {
    this.id = id;
    this.tiendaId = tiendaId;
    this._configuracionContacto = configuracionContacto;
    this._configuracionInformacionCliente = configuracionInformacionCliente;
    this._configuracionMarketing = configuracionMarketing;
    this._configuracionPropinas = configuracionPropinas;
    this._configuracionIdiomaPersonalizacion = configuracionIdiomaPersonalizacion;
    this._configuracionReglasAvanzadas = configuracionReglasAvanzadas;
    this._configuracionAdicional = configuracionAdicional;
    this.fechaCreacion = fechaCreacion || new Date();
    this.fechaActualizacion = fechaActualizacion || new Date();

    this.validar();
  }

  /**
   * Método de fábrica para crear una nueva configuración
   */
  static crear(
    tiendaId: string,
    configuracionContacto: ConfiguracionContactoDto,
    configuracionInformacionCliente: ConfiguracionInformacionClienteDto,
    configuracionMarketing: ConfiguracionMarketingDto,
    configuracionPropinas: ConfiguracionPropinasDto,
    configuracionIdiomaPersonalizacion: ConfiguracionIdiomaPersonalizacionDto,
    configuracionReglasAvanzadas?: ConfiguracionReglasAvanzadasDto,
    configuracionAdicional?: Record<string, any>
  ): ConfiguracionPantallaPago {
    const id = nanoid();
    return new ConfiguracionPantallaPago(
      id,
      tiendaId,
      configuracionContacto,
      configuracionInformacionCliente,
      configuracionMarketing,
      configuracionPropinas,
      configuracionIdiomaPersonalizacion,
      configuracionReglasAvanzadas,
      configuracionAdicional
    );
  }

  /**
   * Método de fábrica para reconstruir desde persistencia
   */
  static reconstruir(
    id: string,
    tiendaId: string,
    configuracionContacto: ConfiguracionContactoDto,
    configuracionInformacionCliente: ConfiguracionInformacionClienteDto,
    configuracionMarketing: ConfiguracionMarketingDto,
    configuracionPropinas: ConfiguracionPropinasDto,
    configuracionIdiomaPersonalizacion: ConfiguracionIdiomaPersonalizacionDto,
    configuracionReglasAvanzadas?: ConfiguracionReglasAvanzadasDto,
    configuracionAdicional?: Record<string, any>,
    fechaCreacion?: Date,
    fechaActualizacion?: Date
  ): ConfiguracionPantallaPago {
    return new ConfiguracionPantallaPago(
      id,
      tiendaId,
      configuracionContacto,
      configuracionInformacionCliente,
      configuracionMarketing,
      configuracionPropinas,
      configuracionIdiomaPersonalizacion,
      configuracionReglasAvanzadas,
      configuracionAdicional,
      fechaCreacion,
      fechaActualizacion
    );
  }

  /**
   * Validaciones de negocio
   */
  private validar(): void {
    // Validar que si requiere login, solo se permita correo electrónico
    if (this._configuracionContacto.requiere_login && 
        this._configuracionContacto.tipo_contacto !== TipoContactoPermitido.CORREO_ELECTRONICO) {
      throw ExcepcionDominio.Respuesta400(
        'Si se requiere login, solo se permite correo electrónico como tipo de contacto',
        'ConfiguracionPantallaPago.TipoContactoInvalido'
      );
    }

    // Validar que si se requiere nombre completo, no se use solo apellido
    if (this._configuracionInformacionCliente.nombre_requerido === RequerimientoNombre.SOLO_APELLIDO &&
        this._configuracionContacto.requiere_login) {
      throw ExcepcionDominio.Respuesta400(
        'No se puede requerir solo apellido cuando se requiere login',
        'ConfiguracionPantallaPago.RequerimientoNombreInvalido'
      );
    }

    // Validar opciones de propina
    if (this._configuracionPropinas.propinas_habilitadas) {
      if (this._configuracionPropinas.opciones_predefinidas) {
        const opcionesInvalidas = this._configuracionPropinas.opciones_predefinidas.filter(
          opcion => opcion < 0 || opcion > 100
        );
        if (opcionesInvalidas.length > 0) {
          throw ExcepcionDominio.Respuesta400(
            'Las opciones de propina predefinidas deben estar entre 0 y 100',
            'ConfiguracionPantallaPago.OpcionesPropinaInvalidas'
          );
        }
      }
    }

    // Validar límite de productos en carrito
    if (this._configuracionReglasAvanzadas?.limite_agregado_carrito) {
      if (this._configuracionReglasAvanzadas.limite_agregado_carrito < 1) {
        throw ExcepcionDominio.Respuesta400(
          'El límite de productos en carrito debe ser al menos 1',
          'ConfiguracionPantallaPago.LimiteCarritoInvalido'
        );
      }
    }

    // Validar reglas de pago
    if (this._configuracionReglasAvanzadas?.reglas_pago) {
      const condicionesValidas = ['monto_total', 'cantidad_productos', 'categoria_producto'];
      this._configuracionReglasAvanzadas.reglas_pago.forEach(regla => {
        const condicionValida = condicionesValidas.some(cond => regla.condicion.includes(cond));
        if (!condicionValida) {
          throw ExcepcionDominio.Respuesta400(
            `Condición inválida en regla de pago: ${regla.condicion}`,
            'ConfiguracionPantallaPago.ReglaPagoInvalida'
          );
        }
      });
    }
  }

  /**
   * Getters para acceder a las propiedades privadas
   */
  getConfiguracionContacto(): ConfiguracionContactoDto {
    return { ...this._configuracionContacto };
  }

  getConfiguracionInformacionCliente(): ConfiguracionInformacionClienteDto {
    return { ...this._configuracionInformacionCliente };
  }

  getConfiguracionMarketing(): ConfiguracionMarketingDto {
    return { ...this._configuracionMarketing };
  }

  getConfiguracionPropinas(): ConfiguracionPropinasDto {
    return { ...this._configuracionPropinas };
  }

  getConfiguracionIdiomaPersonalizacion(): ConfiguracionIdiomaPersonalizacionDto {
    return { ...this._configuracionIdiomaPersonalizacion };
  }

  getConfiguracionReglasAvanzadas(): ConfiguracionReglasAvanzadasDto | undefined {
    return this._configuracionReglasAvanzadas ? { ...this._configuracionReglasAvanzadas } : undefined;
  }

  getConfiguracionAdicional(): Record<string, any> | undefined {
    return this._configuracionAdicional ? { ...this._configuracionAdicional } : undefined;
  }

  /**
   * Métodos para actualizar configuraciones específicas
   */
  actualizarConfiguracionContacto(nuevaConfiguracion: ConfiguracionContactoDto): void {
    this._configuracionContacto = nuevaConfiguracion;
    this.validar();
    this.fechaActualizacion = new Date();
  }

  actualizarConfiguracionInformacionCliente(nuevaConfiguracion: ConfiguracionInformacionClienteDto): void {
    this._configuracionInformacionCliente = nuevaConfiguracion;
    this.validar();
    this.fechaActualizacion = new Date();
  }

  actualizarConfiguracionMarketing(nuevaConfiguracion: ConfiguracionMarketingDto): void {
    this._configuracionMarketing = nuevaConfiguracion;
    this.validar();
    this.fechaActualizacion = new Date();
  }

  actualizarConfiguracionPropinas(nuevaConfiguracion: ConfiguracionPropinasDto): void {
    this._configuracionPropinas = nuevaConfiguracion;
    this.validar();
    this.fechaActualizacion = new Date();
  }

  actualizarConfiguracionIdiomaPersonalizacion(nuevaConfiguracion: ConfiguracionIdiomaPersonalizacionDto): void {
    this._configuracionIdiomaPersonalizacion = nuevaConfiguracion;
    this.validar();
    this.fechaActualizacion = new Date();
  }

  actualizarConfiguracionReglasAvanzadas(nuevaConfiguracion: ConfiguracionReglasAvanzadasDto): void {
    this._configuracionReglasAvanzadas = nuevaConfiguracion;
    this.validar();
    this.fechaActualizacion = new Date();
  }

  actualizarConfiguracionAdicional(nuevaConfiguracion: Record<string, any>): void {
    this._configuracionAdicional = nuevaConfiguracion;
    this.validar();
    this.fechaActualizacion = new Date();
  }

  /**
   * Métodos de negocio específicos
   */
  habilitarPropinas(): void {
    this._configuracionPropinas.propinas_habilitadas = true;
    this.validar();
    this.fechaActualizacion = new Date();
  }

  deshabilitarPropinas(): void {
    this._configuracionPropinas.propinas_habilitadas = false;
    this.validar();
    this.fechaActualizacion = new Date();
  }

  cambiarIdioma(nuevoIdioma: IdiomaPantallaPago): void {
    this._configuracionIdiomaPersonalizacion.idioma_checkout = nuevoIdioma;
    this.validar();
    this.fechaActualizacion = new Date();
  }

  requerirLogin(requerir: boolean): void {
    this._configuracionContacto.requiere_login = requerir;
    this.validar();
    this.fechaActualizacion = new Date();
  }

  /**
   * Métodos de validación de compatibilidad
   */
  esCompatibleConAutenticacion(): boolean {
    return this._configuracionContacto.tipo_contacto === TipoContactoPermitido.CORREO_ELECTRONICO;
  }

  soportaMarketingPorEmail(): boolean {
    return this._configuracionMarketing.email_marketing && 
           this._configuracionContacto.tipo_contacto === TipoContactoPermitido.CORREO_ELECTRONICO;
  }

  tieneConfiguracionAvanzada(): boolean {
    return !!this._configuracionReglasAvanzadas && 
           (!!this._configuracionReglasAvanzadas.limite_agregado_carrito ||
            !!this._configuracionReglasAvanzadas.reglas_pago ||
            !!this._configuracionReglasAvanzadas.verificaciones);
  }

  /**
   * Método para verificar si la configuración está completa
   */
  estaCompleta(): boolean {
    return !!this._configuracionContacto &&
           !!this._configuracionInformacionCliente &&
           !!this._configuracionMarketing &&
           !!this._configuracionPropinas &&
           !!this._configuracionIdiomaPersonalizacion;
  }

  /**
   * Método para obtener resumen de configuración
   */
  obtenerResumen(): {
    tipoContacto: TipoContactoPermitido;
    requiereLogin: boolean;
    propinasHabilitadas: boolean;
    idioma: IdiomaPantallaPago;
    tieneConfiguracionAvanzada: boolean;
  } {
    return {
      tipoContacto: this._configuracionContacto.tipo_contacto,
      requiereLogin: this._configuracionContacto.requiere_login,
      propinasHabilitadas: this._configuracionPropinas.propinas_habilitadas,
      idioma: this._configuracionIdiomaPersonalizacion.idioma_checkout,
      tieneConfiguracionAvanzada: this.tieneConfiguracionAvanzada()
    };
  }
}