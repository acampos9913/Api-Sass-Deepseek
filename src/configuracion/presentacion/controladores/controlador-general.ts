import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpCode, HttpStatus, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { GestionGeneralCasoUso } from '../../dominio/casos-uso/gestion-general.caso-uso';
import { ServicioRespuestaEstandar, type RespuestaEstandar } from '../../../comun/aplicacion/servicios/servicio-respuesta-estandar';
import {
  ConfiguracionGeneralDto,
  ActualizarConfiguracionGeneralDto,
  DireccionFacturacionDto,
  MonedaDto,
  ConfiguracionPedidosDto,
  RecursosTiendaDto,
  ConfiguracionGeneralRespuestaDto
} from '../../aplicacion/dto/configuracion-general.dto';

/**
 * Controlador para la gestión de configuración general
 * Expone endpoints RESTful para operaciones de configuración general de la tienda
 */
@ApiTags('Configuración - General')
@Controller('configuracion/general')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class ControladorGeneral {
  constructor(
    private readonly gestionGeneralCasoUso: GestionGeneralCasoUso,
  ) {}

  /**
   * Crear una nueva configuración general
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear configuración general',
    description: 'Crea una nueva configuración general para una tienda'
  })
  @ApiQuery({ name: 'tiendaId', required: true, description: 'ID de la tienda' })
  @ApiBody({ type: ConfiguracionGeneralDto })
  @ApiResponse({
    status: 201,
    description: 'Configuración general creada exitosamente',
    type: ConfiguracionGeneralRespuestaDto
  })
  @ApiResponse({
    status: 400,
    description: 'Error de validación en los datos proporcionados'
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor'
  })
  async crear(
    @Query('tiendaId') tiendaId: string,
    @Body() datos: ConfiguracionGeneralDto
  ): Promise<RespuestaEstandar<ConfiguracionGeneralRespuestaDto>> {
    return await this.gestionGeneralCasoUso.crear(tiendaId, datos);
  }

  /**
   * Obtener configuración general por ID
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener configuración general por ID',
    description: 'Obtiene una configuración general específica por su ID'
  })
  @ApiParam({ name: 'id', description: 'ID de la configuración general' })
  @ApiResponse({
    status: 200,
    description: 'Configuración general obtenida exitosamente',
    type: ConfiguracionGeneralRespuestaDto
  })
  @ApiResponse({
    status: 404,
    description: 'Configuración general no encontrada'
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor'
  })
  async obtenerPorId(
    @Param('id') id: string
  ): Promise<RespuestaEstandar<ConfiguracionGeneralRespuestaDto>> {
    return await this.gestionGeneralCasoUso.obtenerPorId(id);
  }

  /**
   * Obtener configuración general por ID de tienda
   */
  @Get('tienda/:tiendaId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener configuración general por ID de tienda',
    description: 'Obtiene la configuración general de una tienda específica'
  })
  @ApiParam({ name: 'tiendaId', description: 'ID de la tienda' })
  @ApiResponse({
    status: 200,
    description: 'Configuración general obtenida exitosamente',
    type: ConfiguracionGeneralRespuestaDto
  })
  @ApiResponse({
    status: 404,
    description: 'Configuración general no encontrada para esta tienda'
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor'
  })
  async obtenerPorTiendaId(
    @Param('tiendaId') tiendaId: string
  ): Promise<RespuestaEstandar<ConfiguracionGeneralRespuestaDto>> {
    return await this.gestionGeneralCasoUso.obtenerPorTiendaId(tiendaId);
  }

  /**
   * Actualizar configuración general
   */
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Actualizar configuración general',
    description: 'Actualiza una configuración general existente'
  })
  @ApiParam({ name: 'id', description: 'ID de la configuración general' })
  @ApiBody({ type: ActualizarConfiguracionGeneralDto })
  @ApiResponse({
    status: 200,
    description: 'Configuración general actualizada exitosamente',
    type: ConfiguracionGeneralRespuestaDto
  })
  @ApiResponse({
    status: 400,
    description: 'Error de validación en los datos proporcionados'
  })
  @ApiResponse({
    status: 404,
    description: 'Configuración general no encontrada'
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor'
  })
  async actualizar(
    @Param('id') id: string,
    @Body() datos: ActualizarConfiguracionGeneralDto
  ): Promise<RespuestaEstandar<ConfiguracionGeneralRespuestaDto>> {
    return await this.gestionGeneralCasoUso.actualizar(id, datos);
  }

  /**
   * Eliminar configuración general
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Eliminar configuración general',
    description: 'Elimina una configuración general existente'
  })
  @ApiParam({ name: 'id', description: 'ID de la configuración general' })
  @ApiResponse({
    status: 200,
    description: 'Configuración general eliminada exitosamente'
  })
  @ApiResponse({
    status: 404,
    description: 'Configuración general no encontrada'
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor'
  })
  async eliminar(
    @Param('id') id: string
  ): Promise<RespuestaEstandar<null>> {
    return await this.gestionGeneralCasoUso.eliminar(id);
  }

  /**
   * Actualizar dirección de facturación
   */
  @Put(':id/direccion-facturacion')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Actualizar dirección de facturación',
    description: 'Actualiza la dirección de facturación de la configuración general'
  })
  @ApiParam({ name: 'id', description: 'ID de la configuración general' })
  @ApiBody({ type: DireccionFacturacionDto })
  @ApiResponse({
    status: 200,
    description: 'Dirección de facturación actualizada exitosamente',
    type: ConfiguracionGeneralRespuestaDto
  })
  @ApiResponse({
    status: 400,
    description: 'Error en la dirección de facturación proporcionada'
  })
  @ApiResponse({
    status: 404,
    description: 'Configuración general no encontrada'
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor'
  })
  async actualizarDireccionFacturacion(
    @Param('id') id: string,
    @Body() direccion: DireccionFacturacionDto
  ): Promise<RespuestaEstandar<ConfiguracionGeneralRespuestaDto>> {
    return await this.gestionGeneralCasoUso.actualizarDireccionFacturacion(id, direccion);
  }

  /**
   * Actualizar moneda
   */
  @Put(':id/moneda')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Actualizar moneda',
    description: 'Actualiza la moneda de la configuración general'
  })
  @ApiParam({ name: 'id', description: 'ID de la configuración general' })
  @ApiBody({ type: MonedaDto })
  @ApiResponse({
    status: 200,
    description: 'Moneda actualizada exitosamente',
    type: ConfiguracionGeneralRespuestaDto
  })
  @ApiResponse({
    status: 400,
    description: 'Error en la moneda proporcionada'
  })
  @ApiResponse({
    status: 404,
    description: 'Configuración general no encontrada'
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor'
  })
  async actualizarMoneda(
    @Param('id') id: string,
    @Body() moneda: MonedaDto
  ): Promise<RespuestaEstandar<ConfiguracionGeneralRespuestaDto>> {
    return await this.gestionGeneralCasoUso.actualizarMoneda(id, moneda);
  }

  /**
   * Actualizar configuración de pedidos
   */
  @Put(':id/configuracion-pedidos')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Actualizar configuración de pedidos',
    description: 'Actualiza la configuración de pedidos de la configuración general'
  })
  @ApiParam({ name: 'id', description: 'ID de la configuración general' })
  @ApiBody({ type: ConfiguracionPedidosDto })
  @ApiResponse({
    status: 200,
    description: 'Configuración de pedidos actualizada exitosamente',
    type: ConfiguracionGeneralRespuestaDto
  })
  @ApiResponse({
    status: 400,
    description: 'Error en la configuración de pedidos proporcionada'
  })
  @ApiResponse({
    status: 404,
    description: 'Configuración general no encontrada'
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor'
  })
  async actualizarConfiguracionPedidos(
    @Param('id') id: string,
    @Body() configuracion: ConfiguracionPedidosDto
  ): Promise<RespuestaEstandar<ConfiguracionGeneralRespuestaDto>> {
    return await this.gestionGeneralCasoUso.actualizarConfiguracionPedidos(id, configuracion);
  }

  /**
   * Actualizar recursos de tienda
   */
  @Put(':id/recursos-tienda')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Actualizar recursos de tienda',
    description: 'Actualiza los recursos de tienda de la configuración general'
  })
  @ApiParam({ name: 'id', description: 'ID de la configuración general' })
  @ApiBody({ type: RecursosTiendaDto })
  @ApiResponse({
    status: 200,
    description: 'Recursos de tienda actualizados exitosamente',
    type: ConfiguracionGeneralRespuestaDto
  })
  @ApiResponse({
    status: 400,
    description: 'Error en los recursos de tienda proporcionados'
  })
  @ApiResponse({
    status: 404,
    description: 'Configuración general no encontrada'
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor'
  })
  async actualizarRecursosTienda(
    @Param('id') id: string,
    @Body() recursos: RecursosTiendaDto
  ): Promise<RespuestaEstandar<ConfiguracionGeneralRespuestaDto>> {
    return await this.gestionGeneralCasoUso.actualizarRecursosTienda(id, recursos);
  }

  /**
   * Obtener estadísticas de configuraciones generales
   */
  @Get('estadisticas/generales')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener estadísticas de configuraciones generales',
    description: 'Obtiene estadísticas generales sobre las configuraciones de tiendas'
  })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas de configuraciones generales obtenidas exitosamente'
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor'
  })
  async obtenerEstadisticas(): Promise<RespuestaEstandar<any>> {
    return await this.gestionGeneralCasoUso.obtenerEstadisticas();
  }

  /**
   * Buscar configuraciones generales por término
   */
  @Get('buscar/:termino')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Buscar configuraciones generales por término',
    description: 'Busca configuraciones generales por nombre de tienda, email, etc.'
  })
  @ApiParam({ name: 'termino', description: 'Término de búsqueda' })
  @ApiResponse({
    status: 200,
    description: 'Búsqueda de configuraciones generales completada exitosamente',
    type: [ConfiguracionGeneralRespuestaDto]
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor'
  })
  async buscar(
    @Param('termino') termino: string
  ): Promise<RespuestaEstandar<ConfiguracionGeneralRespuestaDto[]>> {
    return await this.gestionGeneralCasoUso.buscar(termino);
  }
}