import { ConfiguracionNotificaciones } from '../entidades/configuracion-notificaciones.entity';
import { ConfiguracionNotificacionesDto, ActualizarConfiguracionNotificacionesDto } from '../../aplicacion/dto/configuracion-notificaciones.dto';

/**
 * Interfaz para el repositorio de configuración de notificaciones
 */
export interface RepositorioConfiguracionNotificaciones {
  /**
   * Crea una nueva configuración de notificaciones
   * @param configuracionNotificaciones Configuración de notificaciones a crear
   * @returns Promise<ConfiguracionNotificaciones> Configuración creada
   */
  crear(configuracionNotificaciones: ConfiguracionNotificaciones): Promise<ConfiguracionNotificaciones>;

  /**
   * Encuentra una configuración de notificaciones por ID de tienda
   * @param tiendaId ID de la tienda
   * @returns Promise<ConfiguracionNotificaciones | null> Configuración encontrada o null
   */
  encontrarPorTiendaId(tiendaId: string): Promise<ConfiguracionNotificaciones | null>;

  /**
   * Actualiza una configuración de notificaciones
   * @param tiendaId ID de la tienda
   * @param datos Datos a actualizar
   * @returns Promise<ConfiguracionNotificaciones> Configuración actualizada
   */
  actualizar(
    tiendaId: string, 
    datos: ActualizarConfiguracionNotificacionesDto
  ): Promise<ConfiguracionNotificaciones>;

  /**
   * Verifica si el email del remitente está verificado para una tienda
   * @param tiendaId ID de la tienda
   * @returns Promise<boolean> True si está verificado, false si no
   */
  emailRemitenteEstaVerificado(tiendaId: string): Promise<boolean>;

  /**
   * Verifica si una notificación a cliente está habilitada
   * @param tiendaId ID de la tienda
   * @param tipoEvento Tipo de evento de notificación
   * @returns Promise<boolean> True si está habilitada, false si no
   */
  notificacionClienteEstaHabilitada(tiendaId: string, tipoEvento: string): Promise<boolean>;

  /**
   * Obtiene los webhooks activos para una tienda
   * @param tiendaId ID de la tienda
   * @returns Promise<ConfiguracionNotificacionesDto['webhooks']> Lista de webhooks activos
   */
  obtenerWebhooksActivos(tiendaId: string): Promise<any[]>;

  /**
   * Verifica si existe una configuración de notificaciones para una tienda
   * @param tiendaId ID de la tienda
   * @returns Promise<boolean> True si existe, false si no
   */
  existeParaTienda(tiendaId: string): Promise<boolean>;

  /**
   * Actualiza el estado de verificación del email del remitente
   * @param tiendaId ID de la tienda
   * @param estadoVerificacion Nuevo estado de verificación
   * @returns Promise<ConfiguracionNotificaciones> Configuración actualizada
   */
  actualizarEstadoVerificacionEmail(
    tiendaId: string, 
    estadoVerificacion: string
  ): Promise<ConfiguracionNotificaciones>;

  /**
   * Activa/desactiva una notificación a cliente
   * @param tiendaId ID de la tienda
   * @param tipoEvento Tipo de evento de notificación
   * @param habilitado Estado a establecer
   * @returns Promise<ConfiguracionNotificaciones> Configuración actualizada
   */
  activarDesactivarNotificacionCliente(
    tiendaId: string, 
    tipoEvento: string, 
    habilitado: boolean
  ): Promise<ConfiguracionNotificaciones>;

  /**
   * Activa/desactiva un webhook
   * @param tiendaId ID de la tienda
   * @param tipoEvento Tipo de evento del webhook
   * @param activo Estado a establecer
   * @returns Promise<ConfiguracionNotificaciones> Configuración actualizada
   */
  activarDesactivarWebhook(
    tiendaId: string, 
    tipoEvento: string, 
    activo: boolean
  ): Promise<ConfiguracionNotificaciones>;

  /**
   * Agrega un nuevo webhook
   * @param tiendaId ID de la tienda
   * @param webhook Datos del webhook a agregar
   * @returns Promise<ConfiguracionNotificaciones> Configuración actualizada
   */
  agregarWebhook(tiendaId: string, webhook: any): Promise<ConfiguracionNotificaciones>;

  /**
   * Elimina un webhook
   * @param tiendaId ID de la tienda
   * @param tipoEvento Tipo de evento del webhook a eliminar
   * @returns Promise<ConfiguracionNotificaciones> Configuración actualizada
   */
  eliminarWebhook(tiendaId: string, tipoEvento: string): Promise<ConfiguracionNotificaciones>;

  /**
   * Agrega un destinatario a una notificación a empleados
   * @param tiendaId ID de la tienda
   * @param tipoEvento Tipo de evento de notificación
   * @param destinatario Email del destinatario
   * @returns Promise<ConfiguracionNotificaciones> Configuración actualizada
   */
  agregarDestinatarioEmpleado(
    tiendaId: string, 
    tipoEvento: string, 
    destinatario: string
  ): Promise<ConfiguracionNotificaciones>;

  /**
   * Elimina un destinatario de una notificación a empleados
   * @param tiendaId ID de la tienda
   * @param tipoEvento Tipo de evento de notificación
   * @param destinatario Email del destinatario
   * @returns Promise<ConfiguracionNotificaciones> Configuración actualizada
   */
  eliminarDestinatarioEmpleado(
    tiendaId: string, 
    tipoEvento: string, 
    destinatario: string
  ): Promise<ConfiguracionNotificaciones>;
}