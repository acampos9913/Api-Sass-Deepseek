import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { ConfiguracionNotificaciones } from '../../dominio/entidades/configuracion-notificaciones.entity';
import type { RepositorioConfiguracionNotificaciones } from '../../dominio/interfaces/repositorio-configuracion-notificaciones.interface';
import { ConfiguracionNotificacionesDto, ActualizarConfiguracionNotificacionesDto, EstadoVerificacionEmailEnum } from '../../aplicacion/dto/configuracion-notificaciones.dto';
import { ExcepcionDominio } from '../../../comun/excepciones/excepcion-dominio';

/**
 * Implementación del repositorio de configuración de notificaciones usando Prisma
 */
@Injectable()
export class PrismaRepositorioConfiguracionNotificaciones implements RepositorioConfiguracionNotificaciones {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crea una nueva configuración de notificaciones
   */
  /**
   * Crea una nueva configuración de notificaciones
   */
  async crear(configuracionNotificaciones: ConfiguracionNotificaciones): Promise<ConfiguracionNotificaciones> {
    try {
      const configuracionCreada = await this.prisma.configuracionNotificaciones.create({
        data: {
          id: configuracionNotificaciones.getId(),
          tienda_id: configuracionNotificaciones.getTiendaId(),
          email_remitente: configuracionNotificaciones.getEmailRemitente(),
          notificaciones_clientes: configuracionNotificaciones.getNotificacionesClientes(),
          notificaciones_empleados: configuracionNotificaciones.getNotificacionesEmpleados(),
          webhooks: configuracionNotificaciones.getWebhooks(),
          fecha_creacion: configuracionNotificaciones.getFechaCreacion(),
          fecha_actualizacion: configuracionNotificaciones.getFechaActualizacion(),
        },
      });

      return this.aEntidad(configuracionCreada);
    } catch (error) {
      if (error.code === 'P2002') {
        throw ExcepcionDominio.Respuesta400(
          'Ya existe una configuración de notificaciones para esta tienda',
          'Notificaciones.ConfiguracionDuplicada'
        );
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al crear la configuración de notificaciones',
        'Notificaciones.ErrorCreacion'
      );
    }
  }

  /**
   * Encuentra una configuración de notificaciones por ID de tienda
   */
  async encontrarPorTiendaId(tiendaId: string): Promise<ConfiguracionNotificaciones | null> {
    try {
      const configuracion = await this.prisma.configuracionNotificaciones.findUnique({
        where: { tienda_id: tiendaId },
      });

      if (!configuracion) {
        return null;
      }

      return this.aEntidad(configuracion);
    } catch (error) {
      throw ExcepcionDominio.Respuesta500(
        'Error al obtener la configuración de notificaciones',
        'Notificaciones.ErrorObtencion'
      );
    }
  }

  /**
   * Actualiza una configuración de notificaciones
   */
  async actualizar(
    tiendaId: string,
    datos: ActualizarConfiguracionNotificacionesDto
  ): Promise<ConfiguracionNotificaciones> {
    try {
      // Primero obtener la entidad actual
      const configuracionExistente = await this.encontrarPorTiendaId(tiendaId);
      
      if (!configuracionExistente) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de notificaciones no encontrada',
          'Notificaciones.NoEncontrada'
        );
      }

      // Actualizar la entidad de dominio
      configuracionExistente.actualizar(datos);

      // Guardar en base de datos
      const configuracionActualizada = await this.prisma.configuracionNotificaciones.update({
        where: {
          tienda_id: tiendaId,
        },
        data: {
          email_remitente: datos.email_remitente,
          notificaciones_clientes: datos.notificaciones_clientes,
          notificaciones_empleados: datos.notificaciones_empleados,
          webhooks: datos.webhooks,
          fecha_actualizacion: new Date(),
        },
      });

      return this.aEntidad(configuracionActualizada);
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      if (error.code === 'P2025') {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de notificaciones no encontrada',
          'Notificaciones.NoEncontrada'
        );
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al actualizar la configuración de notificaciones',
        'Notificaciones.ErrorActualizacion'
      );
    }
  }

  /**
   * Verifica si el email del remitente está verificado para una tienda
   */
  async emailRemitenteEstaVerificado(tiendaId: string): Promise<boolean> {
    try {
      const configuracion = await this.encontrarPorTiendaId(tiendaId);
      return configuracion ? configuracion.emailRemitenteEstaVerificado() : false;
    } catch (error) {
      throw ExcepcionDominio.Respuesta500(
        'Error al verificar el estado del email del remitente',
        'Notificaciones.ErrorVerificacionEmail'
      );
    }
  }

  /**
   * Verifica si una notificación a cliente está habilitada
   */
  async notificacionClienteEstaHabilitada(tiendaId: string, tipoEvento: string): Promise<boolean> {
    try {
      const configuracion = await this.encontrarPorTiendaId(tiendaId);
      return configuracion ? configuracion.notificacionClienteEstaHabilitada(tipoEvento as any) : false;
    } catch (error) {
      throw ExcepcionDominio.Respuesta500(
        'Error al verificar el estado de la notificación a cliente',
        'Notificaciones.ErrorVerificacionNotificacionCliente'
      );
    }
  }

  /**
   * Obtiene los webhooks activos para una tienda
   */
  async obtenerWebhooksActivos(tiendaId: string): Promise<any[]> {
    try {
      const configuracion = await this.encontrarPorTiendaId(tiendaId);
      return configuracion ? configuracion.obtenerWebhooksActivos() : [];
    } catch (error) {
      throw ExcepcionDominio.Respuesta500(
        'Error al obtener los webhooks activos',
        'Notificaciones.ErrorObtencionWebhooksActivos'
      );
    }
  }

  /**
   * Verifica si existe una configuración de notificaciones para una tienda
   */
  async existeParaTienda(tiendaId: string): Promise<boolean> {
    try {
      const count = await this.prisma.configuracionNotificaciones.count({
        where: { tienda_id: tiendaId },
      });

      return count > 0;
    } catch (error) {
      throw ExcepcionDominio.Respuesta500(
        'Error al verificar la existencia de la configuración de notificaciones',
        'Notificaciones.ErrorVerificacionExistencia'
      );
    }
  }

  /**
   * Actualiza el estado de verificación del email del remitente
   */
  async actualizarEstadoVerificacionEmail(
    tiendaId: string,
    estadoVerificacion: string
  ): Promise<ConfiguracionNotificaciones> {
    try {
      const configuracion = await this.encontrarPorTiendaId(tiendaId);
      
      if (!configuracion) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de notificaciones no encontrada',
          'Notificaciones.NoEncontrada'
        );
      }

      const emailRemitenteActualizado = {
        ...configuracion.getEmailRemitente(),
        estado_verificacion: estadoVerificacion as EstadoVerificacionEmailEnum,
      };

      const configuracionActualizada = await this.prisma.configuracionNotificaciones.update({
        where: {
          tienda_id: tiendaId,
        },
        data: {
          email_remitente: emailRemitenteActualizado,
          fecha_actualizacion: new Date(),
        },
      });

      return this.aEntidad(configuracionActualizada);
    } catch (error) {
      if (error.code === 'P2025') {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de notificaciones no encontrada',
          'Notificaciones.NoEncontrada'
        );
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al actualizar el estado de verificación del email',
        'Notificaciones.ErrorActualizacionEstadoVerificacion'
      );
    }
  }

  /**
   * Activa/desactiva una notificación a cliente
   */
  async activarDesactivarNotificacionCliente(
    tiendaId: string,
    tipoEvento: string,
    habilitado: boolean
  ): Promise<ConfiguracionNotificaciones> {
    try {
      const configuracion = await this.encontrarPorTiendaId(tiendaId);
      
      if (!configuracion) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de notificaciones no encontrada',
          'Notificaciones.NoEncontrada'
        );
      }

      const notificacionesActualizadas = configuracion.getNotificacionesClientes().map(notificacion => {
        if (notificacion.tipo_evento === tipoEvento) {
          return { ...notificacion, habilitado };
        }
        return notificacion;
      });

      const configuracionActualizada = await this.prisma.configuracionNotificaciones.update({
        where: {
          tienda_id: tiendaId,
        },
        data: {
          notificaciones_clientes: notificacionesActualizadas,
          fecha_actualizacion: new Date(),
        },
      });

      return this.aEntidad(configuracionActualizada);
    } catch (error) {
      if (error.code === 'P2025') {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de notificaciones no encontrada',
          'Notificaciones.NoEncontrada'
        );
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al actualizar el estado de la notificación a cliente',
        'Notificaciones.ErrorActualizacionNotificacionCliente'
      );
    }
  }

  /**
   * Activa/desactiva un webhook
   */
  async activarDesactivarWebhook(
    tiendaId: string,
    tipoEvento: string,
    activo: boolean
  ): Promise<ConfiguracionNotificaciones> {
    try {
      const configuracion = await this.encontrarPorTiendaId(tiendaId);
      
      if (!configuracion) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de notificaciones no encontrada',
          'Notificaciones.NoEncontrada'
        );
      }

      const webhooksActualizados = configuracion.getWebhooks().map(webhook => {
        if (webhook.tipo_evento === tipoEvento) {
          return { ...webhook, activo };
        }
        return webhook;
      });

      const configuracionActualizada = await this.prisma.configuracionNotificaciones.update({
        where: {
          tienda_id: tiendaId,
        },
        data: {
          webhooks: webhooksActualizados,
          fecha_actualizacion: new Date(),
        },
      });

      return this.aEntidad(configuracionActualizada);
    } catch (error) {
      if (error.code === 'P2025') {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de notificaciones no encontrada',
          'Notificaciones.NoEncontrada'
        );
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al actualizar el estado del webhook',
        'Notificaciones.ErrorActualizacionWebhook'
      );
    }
  }

  /**
   * Agrega un nuevo webhook
   */
  async agregarWebhook(tiendaId: string, webhook: any): Promise<ConfiguracionNotificaciones> {
    try {
      const configuracion = await this.encontrarPorTiendaId(tiendaId);
      
      if (!configuracion) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de notificaciones no encontrada',
          'Notificaciones.NoEncontrada'
        );
      }

      const webhooksActualizados = [...configuracion.getWebhooks(), webhook];

      const configuracionActualizada = await this.prisma.configuracionNotificaciones.update({
        where: {
          tienda_id: tiendaId,
        },
        data: {
          webhooks: webhooksActualizados,
          fecha_actualizacion: new Date(),
        },
      });

      return this.aEntidad(configuracionActualizada);
    } catch (error) {
      if (error.code === 'P2025') {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de notificaciones no encontrada',
          'Notificaciones.NoEncontrada'
        );
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al agregar el webhook',
        'Notificaciones.ErrorAgregarWebhook'
      );
    }
  }

  /**
   * Elimina un webhook
   */
  async eliminarWebhook(tiendaId: string, tipoEvento: string): Promise<ConfiguracionNotificaciones> {
    try {
      const configuracion = await this.encontrarPorTiendaId(tiendaId);
      
      if (!configuracion) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de notificaciones no encontrada',
          'Notificaciones.NoEncontrada'
        );
      }

      const webhooksActualizados = configuracion.getWebhooks().filter(webhook =>
        webhook.tipo_evento !== tipoEvento
      );

      const configuracionActualizada = await this.prisma.configuracionNotificaciones.update({
        where: {
          tienda_id: tiendaId,
        },
        data: {
          webhooks: webhooksActualizados,
          fecha_actualizacion: new Date(),
        },
      });

      return this.aEntidad(configuracionActualizada);
    } catch (error) {
      if (error.code === 'P2025') {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de notificaciones no encontrada',
          'Notificaciones.NoEncontrada'
        );
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al eliminar el webhook',
        'Notificaciones.ErrorEliminarWebhook'
      );
    }
  }

  /**
   * Agrega un destinatario a una notificación a empleados
   */
  async agregarDestinatarioEmpleado(
    tiendaId: string,
    tipoEvento: string,
    destinatario: string
  ): Promise<ConfiguracionNotificaciones> {
    try {
      const configuracion = await this.encontrarPorTiendaId(tiendaId);
      
      if (!configuracion) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de notificaciones no encontrada',
          'Notificaciones.NoEncontrada'
        );
      }

      const notificacionesActualizadas = configuracion.getNotificacionesEmpleados().map(notificacion => {
        if (notificacion.tipo_evento === tipoEvento) {
          const destinatariosActualizados = [...new Set([...notificacion.destinatarios, destinatario])];
          return { ...notificacion, destinatarios: destinatariosActualizados };
        }
        return notificacion;
      });

      const configuracionActualizada = await this.prisma.configuracionNotificaciones.update({
        where: {
          tienda_id: tiendaId,
        },
        data: {
          notificaciones_empleados: notificacionesActualizadas,
          fecha_actualizacion: new Date(),
        },
      });

      return this.aEntidad(configuracionActualizada);
    } catch (error) {
      if (error.code === 'P2025') {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de notificaciones no encontrada',
          'Notificaciones.NoEncontrada'
        );
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al agregar el destinatario',
        'Notificaciones.ErrorAgregarDestinatario'
      );
    }
  }

  /**
   * Elimina un destinatario de una notificación a empleados
   */
  async eliminarDestinatarioEmpleado(
    tiendaId: string,
    tipoEvento: string,
    destinatario: string
  ): Promise<ConfiguracionNotificaciones> {
    try {
      const configuracion = await this.encontrarPorTiendaId(tiendaId);
      
      if (!configuracion) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de notificaciones no encontrada',
          'Notificaciones.NoEncontrada'
        );
      }

      const notificacionesActualizadas = configuracion.getNotificacionesEmpleados().map(notificacion => {
        if (notificacion.tipo_evento === tipoEvento) {
          const destinatariosActualizados = notificacion.destinatarios.filter(d => d !== destinatario);
          return { ...notificacion, destinatarios: destinatariosActualizados };
        }
        return notificacion;
      });

      const configuracionActualizada = await this.prisma.configuracionNotificaciones.update({
        where: {
          tienda_id: tiendaId,
        },
        data: {
          notificaciones_empleados: notificacionesActualizadas,
          fecha_actualizacion: new Date(),
        },
      });

      return this.aEntidad(configuracionActualizada);
    } catch (error) {
      if (error.code === 'P2025') {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de notificaciones no encontrada',
          'Notificaciones.NoEncontrada'
        );
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al eliminar el destinatario',
        'Notificaciones.ErrorEliminarDestinatario'
      );
    }
  }

  /**
   * Convierte un registro de Prisma a entidad de dominio
   */
  private aEntidad(registro: any): ConfiguracionNotificaciones {
    return ConfiguracionNotificaciones.crearDesdeDto(
      registro.id,
      registro.tienda_id,
      {
        email_remitente: registro.email_remitente,
        notificaciones_clientes: registro.notificaciones_clientes,
        notificaciones_empleados: registro.notificaciones_empleados,
        webhooks: registro.webhooks,
      },
      registro.fecha_creacion,
      registro.fecha_actualizacion
    );
  }
}