import { ExcepcionDominio } from '../../../comun/excepciones/excepcion-dominio';
import { 
  ConfiguracionNotificacionesDto, 
  ActualizarConfiguracionNotificacionesDto,
  ConfiguracionEmailRemitenteDto,
  NotificacionClienteDto,
  NotificacionEmpleadoDto,
  ConfiguracionWebhookDto,
  EstadoVerificacionEmailEnum,
  TipoEventoClienteEnum,
  TipoEventoEmpleadoEnum,
  FormatoWebhookEnum,
  VersionApiWebhookEnum
} from '../../aplicacion/dto/configuracion-notificaciones.dto';

/**
 * Entidad de dominio para la configuración de notificaciones
 */
export class ConfiguracionNotificaciones {
  private readonly id: string;
  private readonly tiendaId: string;
  private emailRemitente: ConfiguracionEmailRemitenteDto;
  private notificacionesClientes: NotificacionClienteDto[];
  private notificacionesEmpleados: NotificacionEmpleadoDto[];
  private webhooks: ConfiguracionWebhookDto[];
  private readonly fechaCreacion: Date;
  private fechaActualizacion: Date;

  constructor(
    id: string,
    tiendaId: string,
    emailRemitente: ConfiguracionEmailRemitenteDto,
    notificacionesClientes: NotificacionClienteDto[],
    notificacionesEmpleados: NotificacionEmpleadoDto[],
    webhooks: ConfiguracionWebhookDto[],
    fechaCreacion?: Date,
    fechaActualizacion?: Date
  ) {
    this.id = id;
    this.tiendaId = tiendaId;
    this.emailRemitente = emailRemitente;
    this.notificacionesClientes = notificacionesClientes;
    this.notificacionesEmpleados = notificacionesEmpleados;
    this.webhooks = webhooks;
    this.fechaCreacion = fechaCreacion || new Date();
    this.fechaActualizacion = fechaActualizacion || new Date();

    this.validar();
  }

  /**
   * Valida la entidad de configuración de notificaciones
   */
  private validar(): void {
    this.validarEmailRemitente();
    this.validarNotificacionesClientes();
    this.validarNotificacionesEmpleados();
    this.validarWebhooks();
  }

  /**
   * Valida la configuración del email del remitente
   */
  private validarEmailRemitente(): void {
    if (!this.emailRemitente) {
      throw ExcepcionDominio.Respuesta400(
        'La configuración del email del remitente es requerida',
        'Notificaciones.EmailRemitenteRequerido'
      );
    }

    if (!this.emailRemitente.email_remitente) {
      throw ExcepcionDominio.Respuesta400(
        'El email del remitente es requerido',
        'Notificaciones.EmailRemitenteVacio'
      );
    }

    if (!this.validarEmail(this.emailRemitente.email_remitente)) {
      throw ExcepcionDominio.Respuesta400(
        'El email del remitente debe ser un email válido',
        'Notificaciones.EmailRemitenteInvalido'
      );
    }

    if (!Object.values(EstadoVerificacionEmailEnum).includes(this.emailRemitente.estado_verificacion)) {
      throw ExcepcionDominio.Respuesta400(
        'El estado de verificación del email debe ser válido',
        'Notificaciones.EstadoVerificacionInvalido'
      );
    }
  }

  /**
   * Valida las notificaciones a clientes
   */
  private validarNotificacionesClientes(): void {
    if (!Array.isArray(this.notificacionesClientes)) {
      throw ExcepcionDominio.Respuesta400(
        'Las notificaciones a clientes deben ser un array',
        'Notificaciones.NotificacionesClientesNoArray'
      );
    }

    for (const notificacion of this.notificacionesClientes) {
      if (!Object.values(TipoEventoClienteEnum).includes(notificacion.tipo_evento)) {
        throw ExcepcionDominio.Respuesta400(
          `El tipo de evento ${notificacion.tipo_evento} no es válido para notificaciones a clientes`,
          'Notificaciones.TipoEventoClienteInvalido'
        );
      }

      if (typeof notificacion.habilitado !== 'boolean') {
        throw ExcepcionDominio.Respuesta400(
          'El estado de la notificación debe ser un booleano',
          'Notificaciones.EstadoNotificacionClienteInvalido'
        );
      }
    }
  }

  /**
   * Valida las notificaciones a empleados
   */
  private validarNotificacionesEmpleados(): void {
    if (!Array.isArray(this.notificacionesEmpleados)) {
      throw ExcepcionDominio.Respuesta400(
        'Las notificaciones a empleados deben ser un array',
        'Notificaciones.NotificacionesEmpleadosNoArray'
      );
    }

    for (const notificacion of this.notificacionesEmpleados) {
      if (!Object.values(TipoEventoEmpleadoEnum).includes(notificacion.tipo_evento)) {
        throw ExcepcionDominio.Respuesta400(
          `El tipo de evento ${notificacion.tipo_evento} no es válido para notificaciones a empleados`,
          'Notificaciones.TipoEventoEmpleadoInvalido'
        );
      }

      if (!Array.isArray(notificacion.destinatarios)) {
        throw ExcepcionDominio.Respuesta400(
          'Los destinatarios deben ser un array',
          'Notificaciones.DestinatariosNoArray'
        );
      }

      for (const destinatario of notificacion.destinatarios) {
        if (!this.validarEmail(destinatario)) {
          throw ExcepcionDominio.Respuesta400(
            `El destinatario ${destinatario} debe ser un email válido`,
            'Notificaciones.DestinatarioEmailInvalido'
          );
        }
      }

      if (notificacion.filtros_pedido && !Array.isArray(notificacion.filtros_pedido)) {
        throw ExcepcionDominio.Respuesta400(
          'Los filtros de pedido deben ser un array',
          'Notificaciones.FiltrosPedidoNoArray'
        );
      }
    }
  }

  /**
   * Valida los webhooks
   */
  private validarWebhooks(): void {
    if (!Array.isArray(this.webhooks)) {
      throw ExcepcionDominio.Respuesta400(
        'Los webhooks deben ser un array',
        'Notificaciones.WebhooksNoArray'
      );
    }

    for (const webhook of this.webhooks) {
      if (!webhook.tipo_evento || webhook.tipo_evento.trim().length === 0) {
        throw ExcepcionDominio.Respuesta400(
          'El tipo de evento del webhook es requerido',
          'Notificaciones.TipoEventoWebhookRequerido'
        );
      }

      if (!Object.values(FormatoWebhookEnum).includes(webhook.formato)) {
        throw ExcepcionDominio.Respuesta400(
          'El formato del webhook debe ser JSON o XML',
          'Notificaciones.FormatoWebhookInvalido'
        );
      }

      if (!webhook.url || webhook.url.trim().length === 0) {
        throw ExcepcionDominio.Respuesta400(
          'La URL del webhook es requerida',
          'Notificaciones.UrlWebhookRequerida'
        );
      }

      if (!this.validarUrl(webhook.url)) {
        throw ExcepcionDominio.Respuesta400(
          'La URL del webhook debe ser una URL válida y segura (HTTPS)',
          'Notificaciones.UrlWebhookInvalida'
        );
      }

      if (!Object.values(VersionApiWebhookEnum).includes(webhook.version_api)) {
        throw ExcepcionDominio.Respuesta400(
          'La versión de API del webhook debe ser válida',
          'Notificaciones.VersionApiWebhookInvalida'
        );
      }

      if (typeof webhook.activo !== 'boolean') {
        throw ExcepcionDominio.Respuesta400(
          'El estado del webhook debe ser un booleano',
          'Notificaciones.EstadoWebhookInvalido'
        );
      }
    }
  }

  /**
   * Valida un email
   */
  private validarEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Valida una URL (debe ser HTTPS)
   */
  private validarUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  }

  /**
   * Actualiza la configuración de notificaciones
   */
  public actualizar(datos: ActualizarConfiguracionNotificacionesDto): void {
    if (datos.email_remitente !== undefined) {
      this.emailRemitente = datos.email_remitente;
    }

    if (datos.notificaciones_clientes !== undefined) {
      this.notificacionesClientes = datos.notificaciones_clientes;
    }

    if (datos.notificaciones_empleados !== undefined) {
      this.notificacionesEmpleados = datos.notificaciones_empleados;
    }

    if (datos.webhooks !== undefined) {
      this.webhooks = datos.webhooks;
    }

    this.fechaActualizacion = new Date();
    this.validar();
  }

  /**
   * Verifica si el email del remitente está verificado
   */
  public emailRemitenteEstaVerificado(): boolean {
    return this.emailRemitente.estado_verificacion === EstadoVerificacionEmailEnum.VERIFICADO;
  }

  /**
   * Obtiene las notificaciones a clientes habilitadas
   */
  public obtenerNotificacionesClientesHabilitadas(): NotificacionClienteDto[] {
    return this.notificacionesClientes.filter(notificacion => notificacion.habilitado);
  }

  /**
   * Obtiene los webhooks activos
   */
  public obtenerWebhooksActivos(): ConfiguracionWebhookDto[] {
    return this.webhooks.filter(webhook => webhook.activo);
  }

  /**
   * Verifica si una notificación a cliente está habilitada
   */
  public notificacionClienteEstaHabilitada(tipoEvento: TipoEventoClienteEnum): boolean {
    const notificacion = this.notificacionesClientes.find(n => n.tipo_evento === tipoEvento);
    return notificacion ? notificacion.habilitado : false;
  }

  /**
   * Getters
   */
  public getId(): string {
    return this.id;
  }

  public getTiendaId(): string {
    return this.tiendaId;
  }

  public getEmailRemitente(): ConfiguracionEmailRemitenteDto {
    return this.emailRemitente;
  }

  public getNotificacionesClientes(): NotificacionClienteDto[] {
    return this.notificacionesClientes;
  }

  public getNotificacionesEmpleados(): NotificacionEmpleadoDto[] {
    return this.notificacionesEmpleados;
  }

  public getWebhooks(): ConfiguracionWebhookDto[] {
    return this.webhooks;
  }

  public getFechaCreacion(): Date {
    return this.fechaCreacion;
  }

  public getFechaActualizacion(): Date {
    return this.fechaActualizacion;
  }

  /**
   * Crea una instancia desde DTO
   */
  public static crearDesdeDto(
    id: string,
    tiendaId: string,
    datos: ConfiguracionNotificacionesDto,
    fechaCreacion?: Date,
    fechaActualizacion?: Date
  ): ConfiguracionNotificaciones {
    return new ConfiguracionNotificaciones(
      id,
      tiendaId,
      datos.email_remitente,
      datos.notificaciones_clientes,
      datos.notificaciones_empleados,
      datos.webhooks,
      fechaCreacion,
      fechaActualizacion
    );
  }

  /**
   * Convierte a DTO
   */
  public aDto(): ConfiguracionNotificacionesDto {
    return {
      email_remitente: this.emailRemitente,
      notificaciones_clientes: this.notificacionesClientes,
      notificaciones_empleados: this.notificacionesEmpleados,
      webhooks: this.webhooks
    };
  }
}