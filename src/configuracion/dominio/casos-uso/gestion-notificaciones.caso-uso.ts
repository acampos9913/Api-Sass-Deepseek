import { Injectable, Inject } from '@nestjs/common';
import type { RepositorioConfiguracionNotificaciones } from '../interfaces/repositorio-configuracion-notificaciones.interface';
import { ServicioRespuestaEstandar } from '../../../comun/aplicacion/servicios/servicio-respuesta-estandar';
import { ExcepcionDominio } from '../../../comun/excepciones/excepcion-dominio';
import { ConfiguracionNotificaciones } from '../entidades/configuracion-notificaciones.entity';
import { ConfiguracionNotificacionesDto, ActualizarConfiguracionNotificacionesDto } from '../../aplicacion/dto/configuracion-notificaciones.dto';

/**
 * Caso de uso para la gestión de notificaciones
 */
@Injectable()
export class GestionNotificacionesCasoUso {
  constructor(
    @Inject('RepositorioConfiguracionNotificaciones')
    private readonly repositorioNotificaciones: RepositorioConfiguracionNotificaciones,
  ) {}

  /**
   * Crea una nueva configuración de notificaciones
   * @param tiendaId ID de la tienda
   * @param datos Datos de la configuración de notificaciones
   * @returns Respuesta estándar con la configuración creada
   */
  async crear(
    tiendaId: string,
    datos: ConfiguracionNotificacionesDto,
  ) {
    try {
      // Verificar si ya existe una configuración para esta tienda
      const existeConfiguracion = await this.repositorioNotificaciones.existeParaTienda(tiendaId);

      if (existeConfiguracion) {
        throw ExcepcionDominio.Respuesta400(
          'Ya existe una configuración de notificaciones para esta tienda',
          'Notificaciones.ConfiguracionDuplicada'
        );
      }

      // Crear ID único para la configuración
      const id = this.generarIdUnico();

      // Crear entidad de dominio
      const configuracionNotificaciones = ConfiguracionNotificaciones.crearDesdeDto(
        id,
        tiendaId,
        datos
      );

      // Guardar en el repositorio
      const configuracionCreada = await this.repositorioNotificaciones.crear(configuracionNotificaciones);

      return ServicioRespuestaEstandar.Respuesta201(
        'Configuración de notificaciones creada exitosamente',
        configuracionCreada.aDto(),
        'Notificaciones.CreadaExitosamente'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al crear la configuración de notificaciones',
        'Notificaciones.ErrorCreacion'
      );
    }
  }

  /**
   * Obtiene la configuración de notificaciones de una tienda
   * @param tiendaId ID de la tienda
   * @returns Respuesta estándar con la configuración encontrada
   */
  async obtener(tiendaId: string) {
    try {
      const configuracion = await this.repositorioNotificaciones.encontrarPorTiendaId(tiendaId);

      if (!configuracion) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de notificaciones no encontrada',
          'Notificaciones.NoEncontrada'
        );
      }

      return ServicioRespuestaEstandar.Respuesta200(
        'Configuración de notificaciones obtenida exitosamente',
        configuracion.aDto(),
        'Notificaciones.ObtenidaExitosamente'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al obtener la configuración de notificaciones',
        'Notificaciones.ErrorObtencion'
      );
    }
  }

  /**
   * Actualiza la configuración de notificaciones
   * @param tiendaId ID de la tienda
   * @param datos Datos a actualizar
   * @returns Respuesta estándar con la configuración actualizada
   */
  async actualizar(
    tiendaId: string,
    datos: ActualizarConfiguracionNotificacionesDto,
  ) {
    try {
      // Verificar que la configuración existe
      const configuracionExistente = await this.repositorioNotificaciones.encontrarPorTiendaId(tiendaId);

      if (!configuracionExistente) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de notificaciones no encontrada',
          'Notificaciones.NoEncontrada'
        );
      }

      // Actualizar la configuración
      const configuracionActualizada = await this.repositorioNotificaciones.actualizar(tiendaId, datos);

      return ServicioRespuestaEstandar.Respuesta200(
        'Configuración de notificaciones actualizada exitosamente',
        configuracionActualizada.aDto(),
        'Notificaciones.ActualizadaExitosamente'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al actualizar la configuración de notificaciones',
        'Notificaciones.ErrorActualizacion'
      );
    }
  }

  /**
   * Reenvía la verificación del email del remitente
   * @param tiendaId ID de la tienda
   * @returns Respuesta estándar indicando éxito
   */
  async reenviarVerificacionEmail(tiendaId: string) {
    try {
      // Verificar que la configuración existe
      const configuracionExistente = await this.repositorioNotificaciones.encontrarPorTiendaId(tiendaId);

      if (!configuracionExistente) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de notificaciones no encontrada',
          'Notificaciones.NoEncontrada'
        );
      }

      // TODO: Implementar lógica de reenvío de verificación de email
      // Por ahora, simulamos el envío y actualizamos el estado a "pendiente"

      const configuracionActualizada = await this.repositorioNotificaciones.actualizarEstadoVerificacionEmail(
        tiendaId,
        'pendiente'
      );

      return ServicioRespuestaEstandar.Respuesta200(
        'Verificación de email reenviada exitosamente',
        configuracionActualizada.aDto(),
        'Notificaciones.VerificacionEmailReenviada'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al reenviar la verificación de email',
        'Notificaciones.ErrorReenvioVerificacionEmail'
      );
    }
  }

  /**
   * Activa/desactiva una notificación a cliente
   * @param tiendaId ID de la tienda
   * @param tipoEvento Tipo de evento de notificación
   * @param habilitado Estado a establecer
   * @returns Respuesta estándar con la configuración actualizada
   */
  async activarDesactivarNotificacionCliente(
    tiendaId: string,
    tipoEvento: string,
    habilitado: boolean,
  ) {
    try {
      // Verificar que la configuración existe
      const configuracionExistente = await this.repositorioNotificaciones.encontrarPorTiendaId(tiendaId);

      if (!configuracionExistente) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de notificaciones no encontrada',
          'Notificaciones.NoEncontrada'
        );
      }

      // Actualizar el estado de la notificación
      const configuracionActualizada = await this.repositorioNotificaciones.activarDesactivarNotificacionCliente(
        tiendaId,
        tipoEvento,
        habilitado
      );

      const mensaje = habilitado 
        ? 'Notificación a cliente activada exitosamente' 
        : 'Notificación a cliente desactivada exitosamente';

      const tipoMensaje = habilitado 
        ? 'Notificaciones.NotificacionClienteActivada' 
        : 'Notificaciones.NotificacionClienteDesactivada';

      return ServicioRespuestaEstandar.Respuesta200(
        mensaje,
        configuracionActualizada.aDto(),
        tipoMensaje
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al actualizar el estado de la notificación a cliente',
        'Notificaciones.ErrorActualizacionNotificacionCliente'
      );
    }
  }

  /**
   * Activa/desactiva un webhook
   * @param tiendaId ID de la tienda
   * @param tipoEvento Tipo de evento del webhook
   * @param activo Estado a establecer
   * @returns Respuesta estándar con la configuración actualizada
   */
  async activarDesactivarWebhook(
    tiendaId: string,
    tipoEvento: string,
    activo: boolean,
  ) {
    try {
      // Verificar que la configuración existe
      const configuracionExistente = await this.repositorioNotificaciones.encontrarPorTiendaId(tiendaId);

      if (!configuracionExistente) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de notificaciones no encontrada',
          'Notificaciones.NoEncontrada'
        );
      }

      // Actualizar el estado del webhook
      const configuracionActualizada = await this.repositorioNotificaciones.activarDesactivarWebhook(
        tiendaId,
        tipoEvento,
        activo
      );

      const mensaje = activo 
        ? 'Webhook activado exitosamente' 
        : 'Webhook desactivado exitosamente';

      const tipoMensaje = activo 
        ? 'Notificaciones.WebhookActivado' 
        : 'Notificaciones.WebhookDesactivado';

      return ServicioRespuestaEstandar.Respuesta200(
        mensaje,
        configuracionActualizada.aDto(),
        tipoMensaje
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al actualizar el estado del webhook',
        'Notificaciones.ErrorActualizacionWebhook'
      );
    }
  }

  /**
   * Agrega un nuevo webhook
   * @param tiendaId ID de la tienda
   * @param webhook Datos del webhook a agregar
   * @returns Respuesta estándar con la configuración actualizada
   */
  async agregarWebhook(tiendaId: string, webhook: any) {
    try {
      // Verificar que la configuración existe
      const configuracionExistente = await this.repositorioNotificaciones.encontrarPorTiendaId(tiendaId);

      if (!configuracionExistente) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de notificaciones no encontrada',
          'Notificaciones.NoEncontrada'
        );
      }

      // Verificar que no exista un webhook con el mismo tipo de evento
      const webhooksExistentes = configuracionExistente.getWebhooks();
      const webhookExistente = webhooksExistentes.find(w => w.tipo_evento === webhook.tipo_evento);

      if (webhookExistente) {
        throw ExcepcionDominio.Respuesta400(
          'Ya existe un webhook con el mismo tipo de evento',
          'Notificaciones.WebhookDuplicado'
        );
      }

      // Agregar el webhook
      const configuracionActualizada = await this.repositorioNotificaciones.agregarWebhook(tiendaId, webhook);

      return ServicioRespuestaEstandar.Respuesta200(
        'Webhook agregado exitosamente',
        configuracionActualizada.aDto(),
        'Notificaciones.WebhookAgregado'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al agregar el webhook',
        'Notificaciones.ErrorAgregarWebhook'
      );
    }
  }

  /**
   * Elimina un webhook
   * @param tiendaId ID de la tienda
   * @param tipoEvento Tipo de evento del webhook
   * @returns Respuesta estándar con la configuración actualizada
   */
  async eliminarWebhook(tiendaId: string, tipoEvento: string) {
    try {
      // Verificar que la configuración existe
      const configuracionExistente = await this.repositorioNotificaciones.encontrarPorTiendaId(tiendaId);

      if (!configuracionExistente) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de notificaciones no encontrada',
          'Notificaciones.NoEncontrada'
        );
      }

      // Verificar que el webhook existe
      const webhooksExistentes = configuracionExistente.getWebhooks();
      const webhookExistente = webhooksExistentes.find(w => w.tipo_evento === tipoEvento);

      if (!webhookExistente) {
        throw ExcepcionDominio.Respuesta404(
          'Webhook no encontrado',
          'Notificaciones.WebhookNoEncontrado'
        );
      }

      // Eliminar el webhook
      const configuracionActualizada = await this.repositorioNotificaciones.eliminarWebhook(tiendaId, tipoEvento);

      return ServicioRespuestaEstandar.Respuesta200(
        'Webhook eliminado exitosamente',
        configuracionActualizada.aDto(),
        'Notificaciones.WebhookEliminado'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al eliminar el webhook',
        'Notificaciones.ErrorEliminarWebhook'
      );
    }
  }

  /**
   * Agrega un destinatario a una notificación a empleados
   * @param tiendaId ID de la tienda
   * @param tipoEvento Tipo de evento de notificación
   * @param destinatario Email del destinatario
   * @returns Respuesta estándar con la configuración actualizada
   */
  async agregarDestinatarioEmpleado(
    tiendaId: string,
    tipoEvento: string,
    destinatario: string,
  ) {
    try {
      // Verificar que la configuración existe
      const configuracionExistente = await this.repositorioNotificaciones.encontrarPorTiendaId(tiendaId);

      if (!configuracionExistente) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de notificaciones no encontrada',
          'Notificaciones.NoEncontrada'
        );
      }

      // Verificar que la notificación a empleados existe
      const notificacionesEmpleados = configuracionExistente.getNotificacionesEmpleados();
      const notificacionExistente = notificacionesEmpleados.find(n => n.tipo_evento === tipoEvento);

      if (!notificacionExistente) {
        throw ExcepcionDominio.Respuesta404(
          'Notificación a empleados no encontrada',
          'Notificaciones.NotificacionEmpleadosNoEncontrada'
        );
      }

      // Verificar que el destinatario no esté ya agregado
      if (notificacionExistente.destinatarios.includes(destinatario)) {
        throw ExcepcionDominio.Respuesta400(
          'El destinatario ya está agregado a esta notificación',
          'Notificaciones.DestinatarioDuplicado'
        );
      }

      // Agregar el destinatario
      const configuracionActualizada = await this.repositorioNotificaciones.agregarDestinatarioEmpleado(
        tiendaId,
        tipoEvento,
        destinatario
      );

      return ServicioRespuestaEstandar.Respuesta200(
        'Destinatario agregado exitosamente',
        configuracionActualizada.aDto(),
        'Notificaciones.DestinatarioAgregado'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al agregar el destinatario',
        'Notificaciones.ErrorAgregarDestinatario'
      );
    }
  }

  /**
   * Elimina un destinatario de una notificación a empleados
   * @param tiendaId ID de la tienda
   * @param tipoEvento Tipo de evento de notificación
   * @param destinatario Email del destinatario
   * @returns Respuesta estándar con la configuración actualizada
   */
  async eliminarDestinatarioEmpleado(
    tiendaId: string,
    tipoEvento: string,
    destinatario: string,
  ) {
    try {
      // Verificar que la configuración existe
      const configuracionExistente = await this.repositorioNotificaciones.encontrarPorTiendaId(tiendaId);

      if (!configuracionExistente) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de notificaciones no encontrada',
          'Notificaciones.NoEncontrada'
        );
      }

      // Verificar que la notificación a empleados existe
      const notificacionesEmpleados = configuracionExistente.getNotificacionesEmpleados();
      const notificacionExistente = notificacionesEmpleados.find(n => n.tipo_evento === tipoEvento);

      if (!notificacionExistente) {
        throw ExcepcionDominio.Respuesta404(
          'Notificación a empleados no encontrada',
          'Notificaciones.NotificacionEmpleadosNoEncontrada'
        );
      }

      // Verificar que el destinatario existe
      if (!notificacionExistente.destinatarios.includes(destinatario)) {
        throw ExcepcionDominio.Respuesta404(
          'Destinatario no encontrado en esta notificación',
          'Notificaciones.DestinatarioNoEncontrado'
        );
      }

      // Eliminar el destinatario
      const configuracionActualizada = await this.repositorioNotificaciones.eliminarDestinatarioEmpleado(
        tiendaId,
        tipoEvento,
        destinatario
      );

      return ServicioRespuestaEstandar.Respuesta200(
        'Destinatario eliminado exitosamente',
        configuracionActualizada.aDto(),
        'Notificaciones.DestinatarioEliminado'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al eliminar el destinatario',
        'Notificaciones.ErrorEliminarDestinatario'
      );
    }
  }

  /**
   * Verifica si una notificación a cliente está habilitada
   * @param tiendaId ID de la tienda
   * @param tipoEvento Tipo de evento de notificación
   * @returns Respuesta estándar con el estado de la notificación
   */
  async verificarEstadoNotificacionCliente(tiendaId: string, tipoEvento: string) {
    try {
      const estaHabilitada = await this.repositorioNotificaciones.notificacionClienteEstaHabilitada(tiendaId, tipoEvento);

      return ServicioRespuestaEstandar.Respuesta200(
        'Estado de notificación obtenido exitosamente',
        { habilitado: estaHabilitada },
        'Notificaciones.EstadoObtenidoExitosamente'
      );
    } catch (error) {
      throw ExcepcionDominio.Respuesta500(
        'Error al verificar el estado de la notificación',
        'Notificaciones.ErrorVerificacionEstado'
      );
    }
  }

  /**
   * Obtiene los webhooks activos para una tienda
   * @param tiendaId ID de la tienda
   * @returns Respuesta estándar con la lista de webhooks activos
   */
  async obtenerWebhooksActivos(tiendaId: string) {
    try {
      const webhooksActivos = await this.repositorioNotificaciones.obtenerWebhooksActivos(tiendaId);

      return ServicioRespuestaEstandar.Respuesta200(
        'Webhooks activos obtenidos exitosamente',
        webhooksActivos,
        'Notificaciones.WebhooksActivosObtenidos'
      );
    } catch (error) {
      throw ExcepcionDominio.Respuesta500(
        'Error al obtener los webhooks activos',
        'Notificaciones.ErrorObtencionWebhooksActivos'
      );
    }
  }

  /**
   * Genera un ID único para la configuración
   * @returns ID único
   */
  private generarIdUnico(): string {
    // TODO: Implementar generación de ID único robusta (ej. nanoid)
    return `notificaciones-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}