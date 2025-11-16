import { Controller, Get, Post, Put, Delete, Body, Param, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { GestionNotificacionesCasoUso } from '../../dominio/casos-uso/gestion-notificaciones.caso-uso';
import { ConfiguracionNotificacionesDto, ActualizarConfiguracionNotificacionesDto } from '../../aplicacion/dto/configuracion-notificaciones.dto';

/**
 * Controlador para la gestión de notificaciones
 * Maneja las operaciones CRUD para la configuración de notificaciones
 */
@ApiTags('Configuración - Notificaciones')
@Controller('configuracion/notificaciones')
export class ControladorNotificaciones {
  constructor(private readonly gestionNotificacionesCasoUso: GestionNotificacionesCasoUso) {}

  /**
   * Crea una nueva configuración de notificaciones
   */
  @Post(':tiendaId')
  @ApiOperation({ 
    summary: 'Crear configuración de notificaciones',
    description: 'Crea una nueva configuración de notificaciones para una tienda específica'
  })
  @ApiParam({ 
    name: 'tiendaId', 
    description: 'ID de la tienda', 
    example: 'tienda-123' 
  })
  @ApiBody({ 
    type: ConfiguracionNotificacionesDto,
    description: 'Datos de la configuración de notificaciones'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Configuración de notificaciones creada exitosamente' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Error en los datos de entrada' 
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Error interno del servidor' 
  })
  async crear(
    @Param('tiendaId') tiendaId: string,
    @Body() datos: ConfiguracionNotificacionesDto,
  ) {
    return await this.gestionNotificacionesCasoUso.crear(tiendaId, datos);
  }

  /**
   * Obtiene la configuración de notificaciones de una tienda
   */
  @Get(':tiendaId')
  @ApiOperation({ 
    summary: 'Obtener configuración de notificaciones',
    description: 'Obtiene la configuración de notificaciones de una tienda específica'
  })
  @ApiParam({ 
    name: 'tiendaId', 
    description: 'ID de la tienda', 
    example: 'tienda-123' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Configuración de notificaciones obtenida exitosamente' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Configuración de notificaciones no encontrada' 
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Error interno del servidor' 
  })
  async obtener(@Param('tiendaId') tiendaId: string) {
    return await this.gestionNotificacionesCasoUso.obtener(tiendaId);
  }

  /**
   * Actualiza la configuración de notificaciones
   */
  @Put(':tiendaId')
  @ApiOperation({ 
    summary: 'Actualizar configuración de notificaciones',
    description: 'Actualiza la configuración de notificaciones de una tienda específica'
  })
  @ApiParam({ 
    name: 'tiendaId', 
    description: 'ID de la tienda', 
    example: 'tienda-123' 
  })
  @ApiBody({ 
    type: ActualizarConfiguracionNotificacionesDto,
    description: 'Datos actualizados de la configuración de notificaciones'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Configuración de notificaciones actualizada exitosamente' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Error en los datos de entrada' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Configuración de notificaciones no encontrada' 
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Error interno del servidor' 
  })
  async actualizar(
    @Param('tiendaId') tiendaId: string,
    @Body() datos: ActualizarConfiguracionNotificacionesDto,
  ) {
    return await this.gestionNotificacionesCasoUso.actualizar(tiendaId, datos);
  }

  /**
   * Reenvía la verificación del email del remitente
   */
  @Post(':tiendaId/reenviar-verificacion-email')
  @ApiOperation({ 
    summary: 'Reenviar verificación de email',
    description: 'Reenvía la verificación del email del remitente'
  })
  @ApiParam({ 
    name: 'tiendaId', 
    description: 'ID de la tienda', 
    example: 'tienda-123' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Verificación de email reenviada exitosamente' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Configuración de notificaciones no encontrada' 
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Error interno del servidor' 
  })
  async reenviarVerificacionEmail(@Param('tiendaId') tiendaId: string) {
    return await this.gestionNotificacionesCasoUso.reenviarVerificacionEmail(tiendaId);
  }

  /**
   * Activa/desactiva una notificación a cliente
   */
  @Put(':tiendaId/notificaciones-clientes/:tipoEvento')
  @ApiOperation({ 
    summary: 'Activar/desactivar notificación a cliente',
    description: 'Activa o desactiva una notificación específica para clientes'
  })
  @ApiParam({ 
    name: 'tiendaId', 
    description: 'ID de la tienda', 
    example: 'tienda-123' 
  })
  @ApiParam({ 
    name: 'tipoEvento', 
    description: 'Tipo de evento de notificación', 
    example: 'confirmacion_pedido' 
  })
  @ApiBody({ 
    schema: {
      type: 'object',
      properties: {
        habilitado: { type: 'boolean', example: true }
      }
    },
    description: 'Estado a establecer para la notificación'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Notificación a cliente actualizada exitosamente' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Error en los datos de entrada' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Configuración de notificaciones no encontrada' 
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Error interno del servidor' 
  })
  async activarDesactivarNotificacionCliente(
    @Param('tiendaId') tiendaId: string,
    @Param('tipoEvento') tipoEvento: string,
    @Body() body: { habilitado: boolean },
  ) {
    return await this.gestionNotificacionesCasoUso.activarDesactivarNotificacionCliente(
      tiendaId,
      tipoEvento,
      body.habilitado
    );
  }

  /**
   * Activa/desactiva un webhook
   */
  @Put(':tiendaId/webhooks/:tipoEvento')
  @ApiOperation({ 
    summary: 'Activar/desactivar webhook',
    description: 'Activa o desactiva un webhook específico'
  })
  @ApiParam({ 
    name: 'tiendaId', 
    description: 'ID de la tienda', 
    example: 'tienda-123' 
  })
  @ApiParam({ 
    name: 'tipoEvento', 
    description: 'Tipo de evento del webhook', 
    example: 'cliente.creado' 
  })
  @ApiBody({ 
    schema: {
      type: 'object',
      properties: {
        activo: { type: 'boolean', example: true }
      }
    },
    description: 'Estado a establecer para el webhook'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Webhook actualizado exitosamente' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Error en los datos de entrada' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Configuración de notificaciones no encontrada' 
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Error interno del servidor' 
  })
  async activarDesactivarWebhook(
    @Param('tiendaId') tiendaId: string,
    @Param('tipoEvento') tipoEvento: string,
    @Body() body: { activo: boolean },
  ) {
    return await this.gestionNotificacionesCasoUso.activarDesactivarWebhook(
      tiendaId,
      tipoEvento,
      body.activo
    );
  }

  /**
   * Agrega un nuevo webhook
   */
  @Post(':tiendaId/webhooks')
  @ApiOperation({ 
    summary: 'Agregar webhook',
    description: 'Agrega un nuevo webhook a la configuración de notificaciones'
  })
  @ApiParam({ 
    name: 'tiendaId', 
    description: 'ID de la tienda', 
    example: 'tienda-123' 
  })
  @ApiBody({ 
    schema: {
      type: 'object',
      properties: {
        tipo_evento: { type: 'string', example: 'cliente.creado' },
        formato: { type: 'string', example: 'JSON', enum: ['JSON', 'XML'] },
        url: { type: 'string', example: 'https://api.mitienda.com/webhooks' },
        version_api: { type: 'string', example: '2025-01', enum: ['unstable', '2026-01', '2025-10', '2025-07', '2025-04', '2025-01'] },
        activo: { type: 'boolean', example: true }
      }
    },
    description: 'Datos del webhook a agregar'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Webhook agregado exitosamente' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Error en los datos de entrada' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Configuración de notificaciones no encontrada' 
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Error interno del servidor' 
  })
  async agregarWebhook(
    @Param('tiendaId') tiendaId: string,
    @Body() webhook: any,
  ) {
    return await this.gestionNotificacionesCasoUso.agregarWebhook(tiendaId, webhook);
  }

  /**
   * Elimina un webhook
   */
  @Delete(':tiendaId/webhooks/:tipoEvento')
  @HttpCode(200)
  @ApiOperation({ 
    summary: 'Eliminar webhook',
    description: 'Elimina un webhook específico de la configuración de notificaciones'
  })
  @ApiParam({ 
    name: 'tiendaId', 
    description: 'ID de la tienda', 
    example: 'tienda-123' 
  })
  @ApiParam({ 
    name: 'tipoEvento', 
    description: 'Tipo de evento del webhook', 
    example: 'cliente.creado' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Webhook eliminado exitosamente' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Configuración de notificaciones no encontrada' 
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Error interno del servidor' 
  })
  async eliminarWebhook(
    @Param('tiendaId') tiendaId: string,
    @Param('tipoEvento') tipoEvento: string,
  ) {
    return await this.gestionNotificacionesCasoUso.eliminarWebhook(tiendaId, tipoEvento);
  }

  /**
   * Agrega un destinatario a una notificación a empleados
   */
  @Post(':tiendaId/notificaciones-empleados/:tipoEvento/destinatarios')
  @ApiOperation({ 
    summary: 'Agregar destinatario a notificación de empleados',
    description: 'Agrega un nuevo destinatario a una notificación específica para empleados'
  })
  @ApiParam({ 
    name: 'tiendaId', 
    description: 'ID de la tienda', 
    example: 'tienda-123' 
  })
  @ApiParam({ 
    name: 'tipoEvento', 
    description: 'Tipo de evento de notificación', 
    example: 'nuevo_pedido' 
  })
  @ApiBody({ 
    schema: {
      type: 'object',
      properties: {
        destinatario: { type: 'string', example: 'empleado@tienda.com' }
      }
    },
    description: 'Email del destinatario a agregar'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Destinatario agregado exitosamente' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Error en los datos de entrada' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Configuración de notificaciones no encontrada' 
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Error interno del servidor' 
  })
  async agregarDestinatarioEmpleado(
    @Param('tiendaId') tiendaId: string,
    @Param('tipoEvento') tipoEvento: string,
    @Body() body: { destinatario: string },
  ) {
    return await this.gestionNotificacionesCasoUso.agregarDestinatarioEmpleado(
      tiendaId,
      tipoEvento,
      body.destinatario
    );
  }

  /**
   * Elimina un destinatario de una notificación a empleados
   */
  @Delete(':tiendaId/notificaciones-empleados/:tipoEvento/destinatarios/:destinatario')
  @HttpCode(200)
  @ApiOperation({ 
    summary: 'Eliminar destinatario de notificación de empleados',
    description: 'Elimina un destinatario específico de una notificación para empleados'
  })
  @ApiParam({ 
    name: 'tiendaId', 
    description: 'ID de la tienda', 
    example: 'tienda-123' 
  })
  @ApiParam({ 
    name: 'tipoEvento', 
    description: 'Tipo de evento de notificación', 
    example: 'nuevo_pedido' 
  })
  @ApiParam({ 
    name: 'destinatario', 
    description: 'Email del destinatario', 
    example: 'empleado@tienda.com' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Destinatario eliminado exitosamente' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Configuración de notificaciones no encontrada' 
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Error interno del servidor' 
  })
  async eliminarDestinatarioEmpleado(
    @Param('tiendaId') tiendaId: string,
    @Param('tipoEvento') tipoEvento: string,
    @Param('destinatario') destinatario: string,
  ) {
    return await this.gestionNotificacionesCasoUso.eliminarDestinatarioEmpleado(
      tiendaId,
      tipoEvento,
      destinatario
    );
  }

  /**
   * Verifica si una notificación a cliente está habilitada
   */
  @Get(':tiendaId/notificaciones-clientes/:tipoEvento/estado')
  @ApiOperation({ 
    summary: 'Verificar estado de notificación a cliente',
    description: 'Verifica si una notificación específica para clientes está habilitada'
  })
  @ApiParam({ 
    name: 'tiendaId', 
    description: 'ID de la tienda', 
    example: 'tienda-123' 
  })
  @ApiParam({ 
    name: 'tipoEvento', 
    description: 'Tipo de evento de notificación', 
    example: 'confirmacion_pedido' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Estado de notificación obtenido exitosamente' 
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Error interno del servidor' 
  })
  async verificarEstadoNotificacionCliente(
    @Param('tiendaId') tiendaId: string,
    @Param('tipoEvento') tipoEvento: string,
  ) {
    return await this.gestionNotificacionesCasoUso.verificarEstadoNotificacionCliente(tiendaId, tipoEvento);
  }

  /**
   * Obtiene los webhooks activos para una tienda
   */
  @Get(':tiendaId/webhooks/activos')
  @ApiOperation({ 
    summary: 'Obtener webhooks activos',
    description: 'Obtiene la lista de webhooks activos para una tienda específica'
  })
  @ApiParam({ 
    name: 'tiendaId', 
    description: 'ID de la tienda', 
    example: 'tienda-123' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Webhooks activos obtenidos exitosamente' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Configuración de notificaciones no encontrada' 
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Error interno del servidor' 
  })
  async obtenerWebhooksActivos(@Param('tiendaId') tiendaId: string) {
    return await this.gestionNotificacionesCasoUso.obtenerWebhooksActivos(tiendaId);
  }
}