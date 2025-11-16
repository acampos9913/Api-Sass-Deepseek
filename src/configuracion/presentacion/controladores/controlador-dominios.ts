import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { GestionDominiosCasoUso } from '../../dominio/casos-uso/gestion-dominios.caso-uso';
import {
  ConfiguracionDominiosDto,
  CrearDominioDto,
  ActualizarDominioDto,
  ActualizarConfiguracionDominiosDto,
  ConfiguracionDominiosRespuestaDto,
  DominioDto,
  TipoDominioEnum
} from '../../aplicacion/dto/configuracion-dominios.dto';

/**
 * Controlador RESTful para la gestión de configuración de dominios
 * Implementa todos los endpoints para operaciones CRUD y gestión de dominios
 */
@ApiTags('Configuración - Dominios')
@Controller('configuracion/dominios')
export class ControladorDominios {
  constructor(
    @Inject(GestionDominiosCasoUso)
    private readonly gestionDominiosCasoUso: GestionDominiosCasoUso,
  ) {}

  /**
   * Obtener configuración de dominios por ID de tienda
   */
  @Get(':tiendaId')
  @ApiOperation({ 
    summary: 'Obtener configuración de dominios',
    description: 'Obtiene la configuración completa de dominios para una tienda específica'
  })
  @ApiParam({
    name: 'tiendaId',
    description: 'ID de la tienda',
    example: 'tienda-123'
  })
  @ApiResponse({
    status: 200,
    description: 'Configuración de dominios obtenida exitosamente',
    type: ConfiguracionDominiosRespuestaDto
  })
  @ApiResponse({
    status: 404,
    description: 'Configuración de dominios no encontrada'
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor'
  })
  async obtenerConfiguracion(@Param('tiendaId') tiendaId: string) {
    return await this.gestionDominiosCasoUso.obtenerPorTiendaId(tiendaId);
  }

  /**
   * Crear configuración inicial de dominios
   */
  @Post(':tiendaId')
  @ApiOperation({ 
    summary: 'Crear configuración de dominios',
    description: 'Crea la configuración inicial de dominios para una tienda'
  })
  @ApiParam({
    name: 'tiendaId',
    description: 'ID de la tienda',
    example: 'tienda-123'
  })
  @ApiBody({
    type: ConfiguracionDominiosDto,
    description: 'Datos de configuración de dominios'
  })
  @ApiResponse({
    status: 201,
    description: 'Configuración de dominios creada exitosamente',
    type: ConfiguracionDominiosRespuestaDto
  })
  @ApiResponse({
    status: 400,
    description: 'Ya existe configuración para esta tienda o datos inválidos'
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor'
  })
  async crearConfiguracion(
    @Param('tiendaId') tiendaId: string,
    @Body() datos: ConfiguracionDominiosDto
  ) {
    return await this.gestionDominiosCasoUso.crearConfiguracion(tiendaId, datos);
  }

  /**
   * Actualizar configuración de dominios
   */
  @Put(':tiendaId')
  @ApiOperation({ 
    summary: 'Actualizar configuración de dominios',
    description: 'Actualiza la configuración completa de dominios para una tienda'
  })
  @ApiParam({
    name: 'tiendaId',
    description: 'ID de la tienda',
    example: 'tienda-123'
  })
  @ApiBody({
    type: ActualizarConfiguracionDominiosDto,
    description: 'Datos actualizados de configuración de dominios'
  })
  @ApiResponse({
    status: 200,
    description: 'Configuración de dominios actualizada exitosamente',
    type: ConfiguracionDominiosRespuestaDto
  })
  @ApiResponse({
    status: 404,
    description: 'Configuración de dominios no encontrada'
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos para la actualización'
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor'
  })
  async actualizarConfiguracion(
    @Param('tiendaId') tiendaId: string,
    @Body() datos: ActualizarConfiguracionDominiosDto
  ) {
    return await this.gestionDominiosCasoUso.actualizarConfiguracion(tiendaId, datos);
  }

  /**
   * Agregar dominio a la configuración
   */
  @Post(':tiendaId/dominios')
  @ApiOperation({ 
    summary: 'Agregar dominio',
    description: 'Agrega un nuevo dominio a la configuración de la tienda'
  })
  @ApiParam({
    name: 'tiendaId',
    description: 'ID de la tienda',
    example: 'tienda-123'
  })
  @ApiBody({
    type: CrearDominioDto,
    description: 'Datos del dominio a agregar'
  })
  @ApiResponse({
    status: 200,
    description: 'Dominio agregado exitosamente',
    type: ConfiguracionDominiosRespuestaDto
  })
  @ApiResponse({
    status: 404,
    description: 'Configuración de dominios no encontrada'
  })
  @ApiResponse({
    status: 400,
    description: 'Dominio ya existe o datos inválidos'
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor'
  })
  async agregarDominio(
    @Param('tiendaId') tiendaId: string,
    @Body() dominio: CrearDominioDto
  ) {
    return await this.gestionDominiosCasoUso.agregarDominio(tiendaId, dominio);
  }

  /**
   * Actualizar dominio específico
   */
  @Put(':tiendaId/dominios/:nombreDominio')
  @ApiOperation({ 
    summary: 'Actualizar dominio',
    description: 'Actualiza un dominio específico en la configuración'
  })
  @ApiParam({
    name: 'tiendaId',
    description: 'ID de la tienda',
    example: 'tienda-123'
  })
  @ApiParam({
    name: 'nombreDominio',
    description: 'Nombre del dominio a actualizar',
    example: 'mi-tienda.com'
  })
  @ApiBody({
    type: ActualizarDominioDto,
    description: 'Datos actualizados del dominio'
  })
  @ApiResponse({
    status: 200,
    description: 'Dominio actualizado exitosamente',
    type: ConfiguracionDominiosRespuestaDto
  })
  @ApiResponse({
    status: 404,
    description: 'Configuración de dominios o dominio no encontrado'
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos para la actualización'
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor'
  })
  async actualizarDominio(
    @Param('tiendaId') tiendaId: string,
    @Param('nombreDominio') nombreDominio: string,
    @Body() dominioActualizado: ActualizarDominioDto
  ) {
    return await this.gestionDominiosCasoUso.actualizarDominio(tiendaId, nombreDominio, dominioActualizado);
  }

  /**
   * Eliminar dominio
   */
  @Delete(':tiendaId/dominios/:nombreDominio')
  @ApiOperation({ 
    summary: 'Eliminar dominio',
    description: 'Elimina un dominio específico de la configuración'
  })
  @ApiParam({
    name: 'tiendaId',
    description: 'ID de la tienda',
    example: 'tienda-123'
  })
  @ApiParam({
    name: 'nombreDominio',
    description: 'Nombre del dominio a eliminar',
    example: 'mi-tienda.com'
  })
  @ApiResponse({
    status: 200,
    description: 'Dominio eliminado exitosamente',
    type: ConfiguracionDominiosRespuestaDto
  })
  @ApiResponse({
    status: 404,
    description: 'Configuración de dominios o dominio no encontrado'
  })
  @ApiResponse({
    status: 400,
    description: 'No se puede eliminar el dominio principal con redireccionamiento activo'
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor'
  })
  async eliminarDominio(
    @Param('tiendaId') tiendaId: string,
    @Param('nombreDominio') nombreDominio: string
  ) {
    return await this.gestionDominiosCasoUso.eliminarDominio(tiendaId, nombreDominio);
  }

  /**
   * Establecer dominio principal
   */
  @Patch(':tiendaId/dominios/:nombreDominio/principal')
  @ApiOperation({ 
    summary: 'Establecer dominio principal',
    description: 'Establece un dominio como principal para la tienda'
  })
  @ApiParam({
    name: 'tiendaId',
    description: 'ID de la tienda',
    example: 'tienda-123'
  })
  @ApiParam({
    name: 'nombreDominio',
    description: 'Nombre del dominio a establecer como principal',
    example: 'mi-tienda.com'
  })
  @ApiResponse({
    status: 200,
    description: 'Dominio principal establecido exitosamente',
    type: ConfiguracionDominiosRespuestaDto
  })
  @ApiResponse({
    status: 404,
    description: 'Configuración de dominios o dominio no encontrado'
  })
  @ApiResponse({
    status: 400,
    description: 'No se puede establecer el dominio como principal'
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor'
  })
  async establecerDominioPrincipal(
    @Param('tiendaId') tiendaId: string,
    @Param('nombreDominio') nombreDominio: string
  ) {
    return await this.gestionDominiosCasoUso.establecerDominioPrincipal(tiendaId, nombreDominio);
  }

  /**
   * Activar redireccionamiento global
   */
  @Patch(':tiendaId/redireccionamiento/activar')
  @ApiOperation({ 
    summary: 'Activar redireccionamiento global',
    description: 'Activa el redireccionamiento global hacia el dominio principal'
  })
  @ApiParam({
    name: 'tiendaId',
    description: 'ID de la tienda',
    example: 'tienda-123'
  })
  @ApiResponse({
    status: 200,
    description: 'Redireccionamiento global activado exitosamente',
    type: ConfiguracionDominiosRespuestaDto
  })
  @ApiResponse({
    status: 404,
    description: 'Configuración de dominios no encontrada'
  })
  @ApiResponse({
    status: 400,
    description: 'No se puede activar redireccionamiento sin dominio principal'
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor'
  })
  async activarRedireccionamiento(@Param('tiendaId') tiendaId: string) {
    return await this.gestionDominiosCasoUso.toggleRedireccionamientoGlobal(tiendaId, true);
  }

  /**
   * Desactivar redireccionamiento global
   */
  @Patch(':tiendaId/redireccionamiento/desactivar')
  @ApiOperation({ 
    summary: 'Desactivar redireccionamiento global',
    description: 'Desactiva el redireccionamiento global hacia el dominio principal'
  })
  @ApiParam({
    name: 'tiendaId',
    description: 'ID de la tienda',
    example: 'tienda-123'
  })
  @ApiResponse({
    status: 200,
    description: 'Redireccionamiento global desactivado exitosamente',
    type: ConfiguracionDominiosRespuestaDto
  })
  @ApiResponse({
    status: 404,
    description: 'Configuración de dominios no encontrada'
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor'
  })
  async desactivarRedireccionamiento(@Param('tiendaId') tiendaId: string) {
    return await this.gestionDominiosCasoUso.toggleRedireccionamientoGlobal(tiendaId, false);
  }

  /**
   * Obtener dominios por tipo
   */
  @Get(':tiendaId/tipo/:tipo')
  @ApiOperation({ 
    summary: 'Obtener dominios por tipo',
    description: 'Obtiene todos los dominios de un tipo específico (principal, secundario, subdominio)'
  })
  @ApiParam({
    name: 'tiendaId',
    description: 'ID de la tienda',
    example: 'tienda-123'
  })
  @ApiParam({
    name: 'tipo',
    description: 'Tipo de dominio',
    enum: TipoDominioEnum,
    example: TipoDominioEnum.PRINCIPAL
  })
  @ApiResponse({
    status: 200,
    description: 'Dominios obtenidos exitosamente',
    type: [DominioDto]
  })
  @ApiResponse({
    status: 404,
    description: 'Configuración de dominios no encontrada'
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor'
  })
  async obtenerDominiosPorTipo(
    @Param('tiendaId') tiendaId: string,
    @Param('tipo') tipo: TipoDominioEnum
  ) {
    return await this.gestionDominiosCasoUso.obtenerDominiosPorTipo(tiendaId, tipo);
  }

  /**
   * Obtener dominios conectados
   */
  @Get(':tiendaId/conectados')
  @ApiOperation({ 
    summary: 'Obtener dominios conectados',
    description: 'Obtiene todos los dominios que están actualmente conectados'
  })
  @ApiParam({
    name: 'tiendaId',
    description: 'ID de la tienda',
    example: 'tienda-123'
  })
  @ApiResponse({
    status: 200,
    description: 'Dominios conectados obtenidos exitosamente',
    type: [DominioDto]
  })
  @ApiResponse({
    status: 404,
    description: 'Configuración de dominios no encontrada'
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor'
  })
  async obtenerDominiosConectados(@Param('tiendaId') tiendaId: string) {
    return await this.gestionDominiosCasoUso.obtenerDominiosConectados(tiendaId);
  }

  /**
   * Contar dominios por tienda
   */
  @Get(':tiendaId/contar')
  @ApiOperation({ 
    summary: 'Contar dominios',
    description: 'Obtiene el número total de dominios configurados para la tienda'
  })
  @ApiParam({
    name: 'tiendaId',
    description: 'ID de la tienda',
    example: 'tienda-123'
  })
  @ApiResponse({
    status: 200,
    description: 'Dominios contados exitosamente',
    schema: {
      type: 'object',
      properties: {
        total: { type: 'number', example: 5 }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Configuración de dominios no encontrada'
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor'
  })
  async contarDominios(@Param('tiendaId') tiendaId: string) {
    return await this.gestionDominiosCasoUso.contarDominios(tiendaId);
  }
}