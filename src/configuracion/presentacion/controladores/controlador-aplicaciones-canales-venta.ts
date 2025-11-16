import { Controller, Get, Post, Put, Delete, Body, Param, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { GestionAplicacionesCanalesVentaCasoUso } from '../../dominio/casos-uso/gestion-aplicaciones-canales-venta.caso-uso';
import { 
  ConfiguracionAplicacionesCanalesVentaDto, 
  ActualizarConfiguracionAplicacionesCanalesVentaDto,
  CrearAppInstaladaDto,
  ActualizarAppInstaladaDto,
  CrearCanalVentaDto,
  ActualizarCanalVentaDto,
  CrearAppDesarrolloDto,
  ActualizarAppDesarrolloDto,
  CrearAppDesinstaladaDto,
  TipoAppEnum,
  TipoCanalEnum,
  EstadoAppEnum
} from '../../aplicacion/dto/configuracion-aplicaciones-canales-venta.dto';

/**
 * Controlador RESTful para la gestión de aplicaciones y canales de venta
 * Implementa endpoints para gestionar aplicaciones instaladas, canales de venta,
 * aplicaciones en desarrollo y aplicaciones desinstaladas
 */
@ApiTags('Configuración - Aplicaciones y Canales de Venta')
@Controller('configuracion/aplicaciones-canales-venta')
export class ControladorAplicacionesCanalesVenta {
  constructor(
    private readonly gestionAplicacionesCanalesVentaCasoUso: GestionAplicacionesCanalesVentaCasoUso,
  ) {}

  /**
   * Endpoints principales de configuración
   */

  @Get(':tiendaId')
  @ApiOperation({ 
    summary: 'Obtener configuración de aplicaciones y canales de venta',
    description: 'Obtiene la configuración completa de aplicaciones y canales de venta para una tienda específica'
  })
  @ApiParam({ name: 'tiendaId', description: 'ID de la tienda', example: 'tienda-123' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Configuración obtenida exitosamente',
    schema: {
      example: {
        mensaje: 'Configuración obtenida exitosamente',
        data: {
          id: 'config-app-123456789',
          tienda_id: 'tienda-123',
          apps_instaladas: [],
          canales_venta: [],
          apps_desarrollo: [],
          apps_desinstaladas: [],
          fecha_creacion: '2024-01-01T00:00:00.000Z',
          fecha_actualizacion: '2024-01-01T00:00:00.000Z'
        },
        tipo_mensaje: 'Aplicaciones.ConfiguracionObtenida',
        estado_respuesta: 200
      }
    }
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Configuración no encontrada',
    schema: {
      example: {
        mensaje: 'Configuración de aplicaciones y canales de venta no encontrada',
        data: null,
        tipo_mensaje: 'Aplicaciones.ConfiguracionNoEncontrada',
        estado_respuesta: 404
      }
    }
  })
  async obtenerPorTiendaId(@Param('tiendaId') tiendaId: string) {
    return await this.gestionAplicacionesCanalesVentaCasoUso.obtenerPorTiendaId(tiendaId);
  }

  @Post(':tiendaId')
  @ApiOperation({ 
    summary: 'Crear configuración de aplicaciones y canales de venta',
    description: 'Crea una nueva configuración de aplicaciones y canales de venta para una tienda específica'
  })
  @ApiParam({ name: 'tiendaId', description: 'ID de la tienda', example: 'tienda-123' })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'Configuración creada exitosamente',
    schema: {
      example: {
        mensaje: 'Configuración creada exitosamente',
        data: {
          id: 'config-app-123456789',
          tienda_id: 'tienda-123',
          apps_instaladas: [],
          canales_venta: [],
          apps_desarrollo: [],
          apps_desinstaladas: [],
          fecha_creacion: '2024-01-01T00:00:00.000Z',
          fecha_actualizacion: '2024-01-01T00:00:00.000Z'
        },
        tipo_mensaje: 'Aplicaciones.ConfiguracionCreada',
        estado_respuesta: 201
      }
    }
  })
  @ApiResponse({ 
    status: HttpStatus.CONFLICT, 
    description: 'Ya existe configuración para esta tienda',
    schema: {
      example: {
        mensaje: 'Ya existe configuración de aplicaciones y canales de venta para esta tienda',
        data: null,
        tipo_mensaje: 'Aplicaciones.ConfiguracionYaExiste',
        estado_respuesta: 409
      }
    }
  })
  async crear(
    @Param('tiendaId') tiendaId: string,
    @Body() dto: ConfiguracionAplicacionesCanalesVentaDto
  ) {
    return await this.gestionAplicacionesCanalesVentaCasoUso.crear(tiendaId, dto);
  }

  @Put(':tiendaId')
  @ApiOperation({ 
    summary: 'Actualizar configuración de aplicaciones y canales de venta',
    description: 'Actualiza la configuración existente de aplicaciones y canales de venta para una tienda específica'
  })
  @ApiParam({ name: 'tiendaId', description: 'ID de la tienda', example: 'tienda-123' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Configuración actualizada exitosamente',
    schema: {
      example: {
        mensaje: 'Configuración actualizada exitosamente',
        data: {
          id: 'config-app-123456789',
          tienda_id: 'tienda-123',
          apps_instaladas: [],
          canales_venta: [],
          apps_desarrollo: [],
          apps_desinstaladas: [],
          fecha_creacion: '2024-01-01T00:00:00.000Z',
          fecha_actualizacion: '2024-01-02T00:00:00.000Z'
        },
        tipo_mensaje: 'Aplicaciones.ConfiguracionActualizada',
        estado_respuesta: 200
      }
    }
  })
  async actualizar(
    @Param('tiendaId') tiendaId: string,
    @Body() dto: ActualizarConfiguracionAplicacionesCanalesVentaDto
  ) {
    return await this.gestionAplicacionesCanalesVentaCasoUso.actualizar(tiendaId, dto);
  }

  @Delete(':tiendaId')
  @ApiOperation({ 
    summary: 'Eliminar configuración de aplicaciones y canales de venta',
    description: 'Elimina la configuración de aplicaciones y canales de venta para una tienda específica'
  })
  @ApiParam({ name: 'tiendaId', description: 'ID de la tienda', example: 'tienda-123' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Configuración eliminada exitosamente',
    schema: {
      example: {
        mensaje: 'Configuración eliminada exitosamente',
        data: null,
        tipo_mensaje: 'Aplicaciones.ConfiguracionEliminada',
        estado_respuesta: 200
      }
    }
  })
  async eliminar(@Param('tiendaId') tiendaId: string) {
    return await this.gestionAplicacionesCanalesVentaCasoUso.eliminar(tiendaId);
  }

  /**
   * Endpoints para aplicaciones instaladas
   */

  @Post(':tiendaId/apps-instaladas')
  @ApiOperation({ 
    summary: 'Agregar aplicación instalada',
    description: 'Agrega una nueva aplicación instalada a la configuración de la tienda'
  })
  @ApiParam({ name: 'tiendaId', description: 'ID de la tienda', example: 'tienda-123' })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'Aplicación instalada agregada exitosamente',
    schema: {
      example: {
        mensaje: 'Aplicación instalada agregada exitosamente',
        data: {
          id: 'config-app-123456789',
          tienda_id: 'tienda-123',
          apps_instaladas: [
            {
              id: 'app-inst-123',
              nombre_app: 'Mi App',
              tipo_app: 'tienda online',
              instalada: true,
              fecha_instalacion: '2024-01-01T00:00:00.000Z',
              version_app: '1.0.0',
              permisos: ['read_products', 'write_orders'],
              token_acceso: 'token-secreto',
              url_configuracion: 'https://mi-app.com/config',
              fecha_actualizacion: '2024-01-01T00:00:00.000Z'
            }
          ],
          canales_venta: [],
          apps_desarrollo: [],
          apps_desinstaladas: [],
          fecha_creacion: '2024-01-01T00:00:00.000Z',
          fecha_actualizacion: '2024-01-02T00:00:00.000Z'
        },
        tipo_mensaje: 'Aplicaciones.AppInstaladaAgregada',
        estado_respuesta: 201
      }
    }
  })
  async agregarAppInstalada(
    @Param('tiendaId') tiendaId: string,
    @Body() dto: CrearAppInstaladaDto
  ) {
    return await this.gestionAplicacionesCanalesVentaCasoUso.agregarAppInstalada(tiendaId, dto);
  }

  @Put(':tiendaId/apps-instaladas/:appId')
  @ApiOperation({ 
    summary: 'Actualizar aplicación instalada',
    description: 'Actualiza una aplicación instalada existente en la configuración de la tienda'
  })
  @ApiParam({ name: 'tiendaId', description: 'ID de la tienda', example: 'tienda-123' })
  @ApiParam({ name: 'appId', description: 'ID de la aplicación instalada', example: 'app-inst-123' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Aplicación instalada actualizada exitosamente'
  })
  async actualizarAppInstalada(
    @Param('tiendaId') tiendaId: string,
    @Param('appId') appId: string,
    @Body() dto: ActualizarAppInstaladaDto
  ) {
    return await this.gestionAplicacionesCanalesVentaCasoUso.actualizarAppInstalada(tiendaId, appId, dto);
  }

  @Delete(':tiendaId/apps-instaladas/:appId')
  @ApiOperation({ 
    summary: 'Eliminar aplicación instalada',
    description: 'Elimina una aplicación instalada de la configuración de la tienda'
  })
  @ApiParam({ name: 'tiendaId', description: 'ID de la tienda', example: 'tienda-123' })
  @ApiParam({ name: 'appId', description: 'ID de la aplicación instalada', example: 'app-inst-123' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Aplicación instalada eliminada exitosamente'
  })
  async eliminarAppInstalada(
    @Param('tiendaId') tiendaId: string,
    @Param('appId') appId: string
  ) {
    return await this.gestionAplicacionesCanalesVentaCasoUso.eliminarAppInstalada(tiendaId, appId);
  }

  @Get(':tiendaId/apps-instaladas/:appId')
  @ApiOperation({ 
    summary: 'Obtener aplicación instalada por ID',
    description: 'Obtiene una aplicación instalada específica por su ID'
  })
  @ApiParam({ name: 'tiendaId', description: 'ID de la tienda', example: 'tienda-123' })
  @ApiParam({ name: 'appId', description: 'ID de la aplicación instalada', example: 'app-inst-123' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Aplicación instalada obtenida exitosamente'
  })
  async obtenerAppInstaladaPorId(
    @Param('tiendaId') tiendaId: string,
    @Param('appId') appId: string
  ) {
    return await this.gestionAplicacionesCanalesVentaCasoUso.obtenerAppInstaladaPorId(tiendaId, appId);
  }

  @Get(':tiendaId/apps-instaladas/tipo/:tipo')
  @ApiOperation({ 
    summary: 'Obtener aplicaciones instaladas por tipo',
    description: 'Obtiene todas las aplicaciones instaladas de un tipo específico'
  })
  @ApiParam({ name: 'tiendaId', description: 'ID de la tienda', example: 'tienda-123' })
  @ApiParam({ 
    name: 'tipo', 
    description: 'Tipo de aplicación',
    enum: TipoAppEnum,
    example: 'tienda online'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Aplicaciones instaladas obtenidas exitosamente'
  })
  async obtenerAppsInstaladasPorTipo(
    @Param('tiendaId') tiendaId: string,
    @Param('tipo') tipo: TipoAppEnum
  ) {
    return await this.gestionAplicacionesCanalesVentaCasoUso.obtenerAppsInstaladasPorTipo(tiendaId, tipo);
  }

  /**
   * Endpoints para canales de venta
   */

  @Post(':tiendaId/canales-venta')
  @ApiOperation({ 
    summary: 'Agregar canal de venta',
    description: 'Agrega un nuevo canal de venta a la configuración de la tienda'
  })
  @ApiParam({ name: 'tiendaId', description: 'ID de la tienda', example: 'tienda-123' })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'Canal de venta agregado exitosamente'
  })
  async agregarCanalVenta(
    @Param('tiendaId') tiendaId: string,
    @Body() dto: CrearCanalVentaDto
  ) {
    return await this.gestionAplicacionesCanalesVentaCasoUso.agregarCanalVenta(tiendaId, dto);
  }

  @Put(':tiendaId/canales-venta/:canalId')
  @ApiOperation({ 
    summary: 'Actualizar canal de venta',
    description: 'Actualiza un canal de venta existente en la configuración de la tienda'
  })
  @ApiParam({ name: 'tiendaId', description: 'ID de la tienda', example: 'tienda-123' })
  @ApiParam({ name: 'canalId', description: 'ID del canal de venta', example: 'canal-123' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Canal de venta actualizado exitosamente'
  })
  async actualizarCanalVenta(
    @Param('tiendaId') tiendaId: string,
    @Param('canalId') canalId: string,
    @Body() dto: ActualizarCanalVentaDto
  ) {
    return await this.gestionAplicacionesCanalesVentaCasoUso.actualizarCanalVenta(tiendaId, canalId, dto);
  }

  @Delete(':tiendaId/canales-venta/:canalId')
  @ApiOperation({ 
    summary: 'Eliminar canal de venta',
    description: 'Elimina un canal de venta de la configuración de la tienda'
  })
  @ApiParam({ name: 'tiendaId', description: 'ID de la tienda', example: 'tienda-123' })
  @ApiParam({ name: 'canalId', description: 'ID del canal de venta', example: 'canal-123' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Canal de venta eliminado exitosamente'
  })
  async eliminarCanalVenta(
    @Param('tiendaId') tiendaId: string,
    @Param('canalId') canalId: string
  ) {
    return await this.gestionAplicacionesCanalesVentaCasoUso.eliminarCanalVenta(tiendaId, canalId);
  }

  @Get(':tiendaId/canales-venta/:canalId')
  @ApiOperation({ 
    summary: 'Obtener canal de venta por ID',
    description: 'Obtiene un canal de venta específico por su ID'
  })
  @ApiParam({ name: 'tiendaId', description: 'ID de la tienda', example: 'tienda-123' })
  @ApiParam({ name: 'canalId', description: 'ID del canal de venta', example: 'canal-123' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Canal de venta obtenido exitosamente'
  })
  async obtenerCanalVentaPorId(
    @Param('tiendaId') tiendaId: string,
    @Param('canalId') canalId: string
  ) {
    return await this.gestionAplicacionesCanalesVentaCasoUso.obtenerCanalVentaPorId(tiendaId, canalId);
  }

  @Get(':tiendaId/canales-venta/tipo/:tipo')
  @ApiOperation({ 
    summary: 'Obtener canales de venta por tipo',
    description: 'Obtiene todos los canales de venta de un tipo específico'
  })
  @ApiParam({ name: 'tiendaId', description: 'ID de la tienda', example: 'tienda-123' })
  @ApiParam({ 
    name: 'tipo', 
    description: 'Tipo de canal de venta',
    enum: TipoCanalEnum,
    example: 'tienda online'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Canales de venta obtenidos exitosamente'
  })
  async obtenerCanalesVentaPorTipo(
    @Param('tiendaId') tiendaId: string,
    @Param('tipo') tipo: TipoCanalEnum
  ) {
    return await this.gestionAplicacionesCanalesVentaCasoUso.obtenerCanalesVentaPorTipo(tiendaId, tipo);
  }

  @Get(':tiendaId/canales-venta/activos')
  @ApiOperation({ 
    summary: 'Obtener canales de venta activos',
    description: 'Obtiene todos los canales de venta activos de la tienda'
  })
  @ApiParam({ name: 'tiendaId', description: 'ID de la tienda', example: 'tienda-123' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Canales de venta activos obtenidos exitosamente'
  })
  async obtenerCanalesVentaActivos(@Param('tiendaId') tiendaId: string) {
    return await this.gestionAplicacionesCanalesVentaCasoUso.obtenerCanalesVentaActivos(tiendaId);
  }

  /**
   * Endpoints para aplicaciones en desarrollo
   */

  @Post(':tiendaId/apps-desarrollo')
  @ApiOperation({ 
    summary: 'Agregar aplicación en desarrollo',
    description: 'Agrega una nueva aplicación en desarrollo a la configuración de la tienda'
  })
  @ApiParam({ name: 'tiendaId', description: 'ID de la tienda', example: 'tienda-123' })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'Aplicación en desarrollo agregada exitosamente'
  })
  async agregarAppDesarrollo(
    @Param('tiendaId') tiendaId: string,
    @Body() dto: CrearAppDesarrolloDto
  ) {
    return await this.gestionAplicacionesCanalesVentaCasoUso.agregarAppDesarrollo(tiendaId, dto);
  }

  @Put(':tiendaId/apps-desarrollo/:appId')
  @ApiOperation({ 
    summary: 'Actualizar aplicación en desarrollo',
    description: 'Actualiza una aplicación en desarrollo existente en la configuración de la tienda'
  })
  @ApiParam({ name: 'tiendaId', description: 'ID de la tienda', example: 'tienda-123' })
  @ApiParam({ name: 'appId', description: 'ID de la aplicación en desarrollo', example: 'app-dev-123' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Aplicación en desarrollo actualizada exitosamente'
  })
  async actualizarAppDesarrollo(
    @Param('tiendaId') tiendaId: string,
    @Param('appId') appId: string,
    @Body() dto: ActualizarAppDesarrolloDto
  ) {
    return await this.gestionAplicacionesCanalesVentaCasoUso.actualizarAppDesarrollo(tiendaId, appId, dto);
  }

  @Delete(':tiendaId/apps-desarrollo/:appId')
  @ApiOperation({ 
    summary: 'Eliminar aplicación en desarrollo',
    description: 'Elimina una aplicación en desarrollo de la configuración de la tienda'
  })
  @ApiParam({ name: 'tiendaId', description: 'ID de la tienda', example: 'tienda-123' })
  @ApiParam({ name: 'appId', description: 'ID de la aplicación en desarrollo', example: 'app-dev-123' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Aplicación en desarrollo eliminada exitosamente'
  })
  async eliminarAppDesarrollo(
    @Param('tiendaId') tiendaId: string,
    @Param('appId') appId: string
  ) {
    return await this.gestionAplicacionesCanalesVentaCasoUso.eliminarAppDesarrollo(tiendaId, appId);
  }

  @Get(':tiendaId/apps-desarrollo/:appId')
  @ApiOperation({ 
    summary: 'Obtener aplicación en desarrollo por ID',
    description: 'Obtiene una aplicación en desarrollo específica por su ID'
  })
  @ApiParam({ name: 'tiendaId', description: 'ID de la tienda', example: 'tienda-123' })
  @ApiParam({ name: 'appId', description: 'ID de la aplicación en desarrollo', example: 'app-dev-123' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Aplicación en desarrollo obtenida exitosamente'
  })
  async obtenerAppDesarrolloPorId(
    @Param('tiendaId') tiendaId: string,
    @Param('appId') appId: string
  ) {
    return await this.gestionAplicacionesCanalesVentaCasoUso.obtenerAppDesarrolloPorId(tiendaId, appId);
  }

  @Get(':tiendaId/apps-desarrollo/estado/:estado')
  @ApiOperation({ 
    summary: 'Obtener aplicaciones en desarrollo por estado',
    description: 'Obtiene todas las aplicaciones en desarrollo de un estado específico'
  })
  @ApiParam({ name: 'tiendaId', description: 'ID de la tienda', example: 'tienda-123' })
  @ApiParam({ 
    name: 'estado', 
    description: 'Estado de la aplicación',
    enum: EstadoAppEnum,
    example: 'en desarrollo'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Aplicaciones en desarrollo obtenidas exitosamente'
  })
  async obtenerAppsDesarrolloPorEstado(
    @Param('tiendaId') tiendaId: string,
    @Param('estado') estado: EstadoAppEnum
  ) {
    return await this.gestionAplicacionesCanalesVentaCasoUso.obtenerAppsDesarrolloPorEstado(tiendaId, estado);
  }

  /**
   * Endpoints para aplicaciones desinstaladas
   */

  @Post(':tiendaId/apps-desinstaladas')
  @ApiOperation({ 
    summary: 'Agregar aplicación desinstalada',
    description: 'Agrega una nueva aplicación desinstalada a la configuración de la tienda'
  })
  @ApiParam({ name: 'tiendaId', description: 'ID de la tienda', example: 'tienda-123' })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'Aplicación desinstalada agregada exitosamente'
  })
  async agregarAppDesinstalada(
    @Param('tiendaId') tiendaId: string,
    @Body() dto: CrearAppDesinstaladaDto
  ) {
    return await this.gestionAplicacionesCanalesVentaCasoUso.agregarAppDesinstalada(tiendaId, dto);
  }

  @Delete(':tiendaId/apps-desinstaladas/:appId')
  @ApiOperation({ 
    summary: 'Eliminar aplicación desinstalada',
    description: 'Elimina una aplicación desinstalada de la configuración de la tienda'
  })
  @ApiParam({ name: 'tiendaId', description: 'ID de la tienda', example: 'tienda-123' })
  @ApiParam({ name: 'appId', description: 'ID de la aplicación desinstalada', example: 'app-uninst-123' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Aplicación desinstalada eliminada exitosamente'
  })
  async eliminarAppDesinstalada(
    @Param('tiendaId') tiendaId: string,
    @Param('appId') appId: string
  ) {
    return await this.gestionAplicacionesCanalesVentaCasoUso.eliminarAppDesinstalada(tiendaId, appId);
  }

  /**
   * Endpoints para consultas y estadísticas
   */

  @Get(':tiendaId/estadisticas/apps-instaladas/contar')
  @ApiOperation({ 
    summary: 'Contar aplicaciones instaladas',
    description: 'Obtiene el conteo total de aplicaciones instaladas en la tienda'
  })
  @ApiParam({ name: 'tiendaId', description: 'ID de la tienda', example: 'tienda-123' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Conteo de aplicaciones instaladas obtenido exitosamente'
  })
  async contarAppsInstaladas(@Param('tiendaId') tiendaId: string) {
    return await this.gestionAplicacionesCanalesVentaCasoUso.contarAppsInstaladas(tiendaId);
  }

  @Get(':tiendaId/estadisticas/canales-venta/contar')
  @ApiOperation({ 
    summary: 'Contar canales de venta activos',
    description: 'Obtiene el conteo total de canales de venta activos en la tienda'
  })
  @ApiParam({ name: 'tiendaId', description: 'ID de la tienda', example: 'tienda-123' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Conteo de canales de venta activos obtenido exitosamente'
  })
  async contarCanalesVentaActivos(@Param('tiendaId') tiendaId: string) {
    return await this.gestionAplicacionesCanalesVentaCasoUso.contarCanalesVentaActivos(tiendaId);
  }

  @Get(':tiendaId/estadisticas/apps-desarrollo/contar')
  @ApiOperation({ 
    summary: 'Contar aplicaciones en desarrollo',
    description: 'Obtiene el conteo total de aplicaciones en desarrollo en la tienda'
  })
  @ApiParam({ name: 'tiendaId', description: 'ID de la tienda', example: 'tienda-123' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Conteo de aplicaciones en desarrollo obtenido exitosamente'
  })
  async contarAppsEnDesarrollo(@Param('tiendaId') tiendaId: string) {
    return await this.gestionAplicacionesCanalesVentaCasoUso.contarAppsEnDesarrollo(tiendaId);
  }
}