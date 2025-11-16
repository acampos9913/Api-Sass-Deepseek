import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpCode, HttpStatus, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { GestionIdiomasCasoUso } from '../../dominio/casos-uso/gestion-idiomas.caso-uso';
import { ServicioRespuestaEstandar, type RespuestaEstandar } from '../../../comun/aplicacion/servicios/servicio-respuesta-estandar';
import {
  ConfiguracionIdiomasDto,
  ActualizarConfiguracionIdiomasDto,
  AsignarIdiomaDominioDto,
  ExportarIdiomasDto,
  ImportarIdiomasDto,
  EstadoIdiomaEnum,
  EstadoTraduccionEnum,
  ConfiguracionIdiomasRespuestaDto
} from '../../aplicacion/dto/configuracion-idiomas.dto';

/**
 * Controlador para la gestión de configuración de idiomas
 * Expone endpoints RESTful para operaciones multilingües
 */
@ApiTags('Configuración - Idiomas')
@Controller('configuracion/idiomas')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class ControladorIdiomas {
  constructor(
    private readonly gestionIdiomasCasoUso: GestionIdiomasCasoUso,
  ) {}

  /**
   * Crear una nueva configuración de idiomas
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear configuración de idiomas',
    description: 'Crea una nueva configuración de idiomas para una tienda'
  })
  @ApiBody({ type: ConfiguracionIdiomasDto })
  @ApiResponse({
    status: 201,
    description: 'Configuración de idiomas creada exitosamente',
    type: ConfiguracionIdiomasRespuestaDto
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
    @Body() datos: ConfiguracionIdiomasDto
  ): Promise<RespuestaEstandar<ConfiguracionIdiomasRespuestaDto>> {
    return await this.gestionIdiomasCasoUso.crear(tiendaId, datos);
  }

  /**
   * Obtener configuración de idiomas por ID
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener configuración de idiomas por ID',
    description: 'Obtiene una configuración de idiomas específica por su ID'
  })
  @ApiParam({ name: 'id', description: 'ID de la configuración de idiomas' })
  @ApiResponse({
    status: 200,
    description: 'Configuración de idiomas obtenida exitosamente',
    type: ConfiguracionIdiomasRespuestaDto
  })
  @ApiResponse({
    status: 404,
    description: 'Configuración de idiomas no encontrada'
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor'
  })
  async obtenerPorId(
    @Param('id') id: string
  ): Promise<RespuestaEstandar<ConfiguracionIdiomasRespuestaDto>> {
    return await this.gestionIdiomasCasoUso.obtenerPorId(id);
  }

  /**
   * Listar todas las configuraciones de idiomas de una tienda
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Listar configuraciones de idiomas por tienda',
    description: 'Obtiene todas las configuraciones de idiomas de una tienda específica'
  })
  @ApiQuery({ name: 'tiendaId', required: true, description: 'ID de la tienda' })
  @ApiResponse({
    status: 200,
    description: 'Configuraciones de idiomas obtenidas exitosamente',
    type: [ConfiguracionIdiomasRespuestaDto]
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor'
  })
  async listarPorTienda(
    @Query('tiendaId') tiendaId: string
  ): Promise<RespuestaEstandar<ConfiguracionIdiomasRespuestaDto[]>> {
    return await this.gestionIdiomasCasoUso.listarPorTienda(tiendaId);
  }

  /**
   * Listar configuraciones de idiomas por estado
   */
  @Get('estado/:estado')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Listar configuraciones de idiomas por estado',
    description: 'Obtiene configuraciones de idiomas filtradas por estado específico'
  })
  @ApiParam({ 
    name: 'estado', 
    description: 'Estado del idioma',
    enum: EstadoIdiomaEnum 
  })
  @ApiQuery({ name: 'tiendaId', required: true, description: 'ID de la tienda' })
  @ApiResponse({
    status: 200,
    description: 'Configuraciones de idiomas obtenidas exitosamente',
    type: [ConfiguracionIdiomasRespuestaDto]
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor'
  })
  async listarPorEstado(
    @Query('tiendaId') tiendaId: string,
    @Param('estado') estado: EstadoIdiomaEnum
  ): Promise<RespuestaEstandar<ConfiguracionIdiomasRespuestaDto[]>> {
    return await this.gestionIdiomasCasoUso.listarPorEstado(tiendaId, estado);
  }

  /**
   * Actualizar configuración de idiomas
   */
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Actualizar configuración de idiomas',
    description: 'Actualiza una configuración de idiomas existente'
  })
  @ApiParam({ name: 'id', description: 'ID de la configuración de idiomas' })
  @ApiBody({ type: ActualizarConfiguracionIdiomasDto })
  @ApiResponse({
    status: 200,
    description: 'Configuración de idiomas actualizada exitosamente',
    type: ConfiguracionIdiomasRespuestaDto
  })
  @ApiResponse({
    status: 400,
    description: 'Error de validación en los datos proporcionados'
  })
  @ApiResponse({
    status: 404,
    description: 'Configuración de idiomas no encontrada'
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor'
  })
  async actualizar(
    @Param('id') id: string,
    @Body() datos: ActualizarConfiguracionIdiomasDto
  ): Promise<RespuestaEstandar<ConfiguracionIdiomasRespuestaDto>> {
    return await this.gestionIdiomasCasoUso.actualizar(id, datos);
  }

  /**
   * Eliminar configuración de idiomas
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Eliminar configuración de idiomas',
    description: 'Elimina una configuración de idiomas existente'
  })
  @ApiParam({ name: 'id', description: 'ID de la configuración de idiomas' })
  @ApiResponse({
    status: 200,
    description: 'Configuración de idiomas eliminada exitosamente'
  })
  @ApiResponse({
    status: 400,
    description: 'No se puede eliminar la configuración de idiomas'
  })
  @ApiResponse({
    status: 404,
    description: 'Configuración de idiomas no encontrada'
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor'
  })
  async eliminar(
    @Param('id') id: string
  ): Promise<RespuestaEstandar<null>> {
    return await this.gestionIdiomasCasoUso.eliminar(id);
  }

  /**
   * Establecer idioma como predeterminado
   */
  @Post(':id/predeterminado')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Establecer idioma como predeterminado',
    description: 'Establece un idioma como predeterminado para la tienda'
  })
  @ApiParam({ name: 'id', description: 'ID de la configuración de idiomas' })
  @ApiResponse({
    status: 200,
    description: 'Idioma establecido como predeterminado exitosamente',
    type: ConfiguracionIdiomasRespuestaDto
  })
  @ApiResponse({
    status: 400,
    description: 'No se puede establecer como predeterminado'
  })
  @ApiResponse({
    status: 404,
    description: 'Configuración de idiomas no encontrada'
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor'
  })
  async establecerComoPredeterminado(
    @Param('id') id: string
  ): Promise<RespuestaEstandar<ConfiguracionIdiomasRespuestaDto>> {
    return await this.gestionIdiomasCasoUso.establecerComoPredeterminado(id);
  }

  /**
   * Publicar idioma
   */
  @Post(':id/publicar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Publicar idioma',
    description: 'Publica un idioma para que esté disponible en la tienda'
  })
  @ApiParam({ name: 'id', description: 'ID de la configuración de idiomas' })
  @ApiResponse({
    status: 200,
    description: 'Idioma publicado exitosamente',
    type: ConfiguracionIdiomasRespuestaDto
  })
  @ApiResponse({
    status: 404,
    description: 'Configuración de idiomas no encontrada'
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor'
  })
  async publicar(
    @Param('id') id: string
  ): Promise<RespuestaEstandar<ConfiguracionIdiomasRespuestaDto>> {
    return await this.gestionIdiomasCasoUso.publicar(id);
  }

  /**
   * Despublicar idioma
   */
  @Post(':id/despublicar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Despublicar idioma',
    description: 'Despublica un idioma para que no esté disponible en la tienda'
  })
  @ApiParam({ name: 'id', description: 'ID de la configuración de idiomas' })
  @ApiResponse({
    status: 200,
    description: 'Idioma despublicado exitosamente',
    type: ConfiguracionIdiomasRespuestaDto
  })
  @ApiResponse({
    status: 400,
    description: 'No se puede despublicar el idioma'
  })
  @ApiResponse({
    status: 404,
    description: 'Configuración de idiomas no encontrada'
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor'
  })
  async despublicar(
    @Param('id') id: string
  ): Promise<RespuestaEstandar<ConfiguracionIdiomasRespuestaDto>> {
    return await this.gestionIdiomasCasoUso.despublicar(id);
  }

  /**
   * Asignar idioma a dominio
   */
  @Post(':id/dominios')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Asignar idioma a dominio',
    description: 'Asigna un idioma a un dominio específico'
  })
  @ApiParam({ name: 'id', description: 'ID de la configuración de idiomas' })
  @ApiBody({ type: AsignarIdiomaDominioDto })
  @ApiResponse({
    status: 200,
    description: 'Idioma asignado al dominio exitosamente',
    type: ConfiguracionIdiomasRespuestaDto
  })
  @ApiResponse({
    status: 400,
    description: 'Error en la asignación del dominio'
  })
  @ApiResponse({
    status: 404,
    description: 'Configuración de idiomas no encontrada'
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor'
  })
  async asignarADominio(
    @Param('id') id: string,
    @Body() asignacion: AsignarIdiomaDominioDto
  ): Promise<RespuestaEstandar<ConfiguracionIdiomasRespuestaDto>> {
    return await this.gestionIdiomasCasoUso.asignarADominio(id, asignacion);
  }

  /**
   * Desasignar idioma de dominio
   */
  @Delete(':id/dominios/:dominio')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Desasignar idioma de dominio',
    description: 'Desasigna un idioma de un dominio específico'
  })
  @ApiParam({ name: 'id', description: 'ID de la configuración de idiomas' })
  @ApiParam({ name: 'dominio', description: 'Dominio del cual desasignar' })
  @ApiResponse({
    status: 200,
    description: 'Idioma desasignado del dominio exitosamente',
    type: ConfiguracionIdiomasRespuestaDto
  })
  @ApiResponse({
    status: 400,
    description: 'Error en la desasignación del dominio'
  })
  @ApiResponse({
    status: 404,
    description: 'Configuración de idiomas no encontrada o dominio no asignado'
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor'
  })
  async desasignarDeDominio(
    @Param('id') id: string,
    @Param('dominio') dominio: string
  ): Promise<RespuestaEstandar<ConfiguracionIdiomasRespuestaDto>> {
    return await this.gestionIdiomasCasoUso.desasignarDeDominio(id, dominio);
  }

  /**
   * Actualizar progreso de traducción
   */
  @Put(':id/progreso-traduccion')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Actualizar progreso de traducción',
    description: 'Actualiza el progreso de traducción de un idioma'
  })
  @ApiParam({ name: 'id', description: 'ID de la configuración de idiomas' })
  @ApiQuery({ name: 'porcentaje', required: true, description: 'Porcentaje de traducción completado (0-100)' })
  @ApiQuery({ 
    name: 'estado', 
    required: false, 
    description: 'Estado de traducción',
    enum: EstadoTraduccionEnum 
  })
  @ApiResponse({
    status: 200,
    description: 'Progreso de traducción actualizado exitosamente',
    type: ConfiguracionIdiomasRespuestaDto
  })
  @ApiResponse({
    status: 400,
    description: 'Error en el progreso de traducción'
  })
  @ApiResponse({
    status: 404,
    description: 'Configuración de idiomas no encontrada'
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor'
  })
  async actualizarProgresoTraduccion(
    @Param('id') id: string,
    @Query('porcentaje') porcentaje: number,
    @Query('estado') estado?: EstadoTraduccionEnum
  ): Promise<RespuestaEstandar<ConfiguracionIdiomasRespuestaDto>> {
    return await this.gestionIdiomasCasoUso.actualizarProgresoTraduccion(
      id,
      Number(porcentaje),
      estado
    );
  }

  /**
   * Marcar como completamente traducido
   */
  @Post(':id/marcar-traducido')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Marcar como completamente traducido',
    description: 'Marca un idioma como completamente traducido (100%)'
  })
  @ApiParam({ name: 'id', description: 'ID de la configuración de idiomas' })
  @ApiResponse({
    status: 200,
    description: 'Idioma marcado como completamente traducido exitosamente',
    type: ConfiguracionIdiomasRespuestaDto
  })
  @ApiResponse({
    status: 404,
    description: 'Configuración de idiomas no encontrada'
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor'
  })
  async marcarComoTraducido(
    @Param('id') id: string
  ): Promise<RespuestaEstandar<ConfiguracionIdiomasRespuestaDto>> {
    return await this.gestionIdiomasCasoUso.marcarComoTraducido(id);
  }

  /**
   * Exportar configuración de idiomas
   */
  @Post('exportar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Exportar configuración de idiomas',
    description: 'Exporta la configuración de idiomas en formato JSON o CSV'
  })
  @ApiQuery({ name: 'tiendaId', required: true, description: 'ID de la tienda' })
  @ApiBody({ type: ExportarIdiomasDto })
  @ApiResponse({
    status: 200,
    description: 'Configuración de idiomas exportada exitosamente'
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor'
  })
  async exportar(
    @Query('tiendaId') tiendaId: string,
    @Body() datos: ExportarIdiomasDto
  ): Promise<RespuestaEstandar<string>> {
    return await this.gestionIdiomasCasoUso.exportar(datos, tiendaId);
  }

  /**
   * Importar configuración de idiomas
   */
  @Post('importar')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Importar configuración de idiomas',
    description: 'Importa configuración de idiomas desde archivo JSON o CSV'
  })
  @ApiQuery({ name: 'tiendaId', required: true, description: 'ID de la tienda' })
  @ApiBody({ type: ImportarIdiomasDto })
  @ApiResponse({
    status: 201,
    description: 'Configuración de idiomas importada exitosamente',
    type: [ConfiguracionIdiomasRespuestaDto]
  })
  @ApiResponse({
    status: 400,
    description: 'Error en el formato del archivo importado'
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor'
  })
  async importar(
    @Query('tiendaId') tiendaId: string,
    @Body() datos: ImportarIdiomasDto
  ): Promise<RespuestaEstandar<ConfiguracionIdiomasRespuestaDto[]>> {
    return await this.gestionIdiomasCasoUso.importar(datos, tiendaId);
  }

  /**
   * Obtener estadísticas de idiomas
   */
  @Get('estadisticas/generales')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener estadísticas de idiomas',
    description: 'Obtiene estadísticas generales sobre los idiomas de una tienda'
  })
  @ApiQuery({ name: 'tiendaId', required: true, description: 'ID de la tienda' })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas de idiomas obtenidas exitosamente'
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor'
  })
  async obtenerEstadisticas(
    @Query('tiendaId') tiendaId: string
  ): Promise<RespuestaEstandar<any>> {
    return await this.gestionIdiomasCasoUso.obtenerEstadisticas(tiendaId);
  }

  /**
   * Buscar idiomas por término
   */
  @Get('buscar/:termino')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Buscar idiomas por término',
    description: 'Busca idiomas por nombre o código'
  })
  @ApiParam({ name: 'termino', description: 'Término de búsqueda' })
  @ApiQuery({ name: 'tiendaId', required: true, description: 'ID de la tienda' })
  @ApiResponse({
    status: 200,
    description: 'Búsqueda de idiomas completada exitosamente',
    type: [ConfiguracionIdiomasRespuestaDto]
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor'
  })
  async buscar(
    @Query('tiendaId') tiendaId: string,
    @Param('termino') termino: string
  ): Promise<RespuestaEstandar<ConfiguracionIdiomasRespuestaDto[]>> {
    return await this.gestionIdiomasCasoUso.buscar(tiendaId, termino);
  }

  /**
   * Obtener idiomas que necesitan atención
   */
  @Get('atencion/necesaria')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener idiomas que necesitan atención',
    description: 'Obtiene idiomas que necesitan atención (sin traducir o bajo progreso)'
  })
  @ApiQuery({ name: 'tiendaId', required: true, description: 'ID de la tienda' })
  @ApiResponse({
    status: 200,
    description: 'Idiomas que necesitan atención obtenidos exitosamente',
    type: [ConfiguracionIdiomasRespuestaDto]
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor'
  })
  async obtenerQueNecesitanAtencion(
    @Query('tiendaId') tiendaId: string
  ): Promise<RespuestaEstandar<ConfiguracionIdiomasRespuestaDto[]>> {
    return await this.gestionIdiomasCasoUso.obtenerQueNecesitanAtencion(tiendaId);
  }
}