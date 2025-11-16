import { Controller, Get, Post, Put, Delete, Body, Param, Query, Inject, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { GestionPagosCasoUso } from '../../dominio/casos-uso/gestion-pagos.caso-uso';
import { 
  CrearConfiguracionPagosDto, 
  ActualizarConfiguracionPagosDto,
  ProveedorPagoDto,
  MetodoPagoManualDto,
  ConfiguracionGiftcardDto,
  CriteriosBusquedaPagosDto,
  RespuestaConfiguracionPagosDto
} from '../../aplicacion/dto/configuracion-pagos.dto';
import { RespuestaEstandar } from '../../../comun/aplicacion/servicios/servicio-respuesta-estandar';
import { ParametrosRutaTiendaDto } from '../../../comun/dto/parametros-ruta-tienda.dto';

/**
 * Controlador para la gestión de configuración de pagos
 * Expone endpoints RESTful para operaciones CRUD y específicas de configuración de pagos
 */
@ApiTags('Configuración - Pagos')
@Controller('configuracion/pagos')
export class ControladorPagos {
  constructor(
    @Inject(GestionPagosCasoUso)
    private readonly gestionPagosCasoUso: GestionPagosCasoUso,
  ) {}

  /**
   * Obtiene la configuración de pagos de una tienda
   */
  @Get(':tiendaId')
  @ApiOperation({ 
    summary: 'Obtener configuración de pagos',
    description: 'Obtiene la configuración completa de pagos para una tienda específica'
  })
  @ApiParam({
    name: 'tiendaId',
    description: 'ID de la tienda',
    example: 'tienda-123'
  })
  @ApiResponse({
    status: 200,
    description: 'Configuración de pagos obtenida exitosamente',
    type: RespuestaConfiguracionPagosDto
  })
  @ApiResponse({
    status: 404,
    description: 'Configuración de pagos no encontrada'
  })
  async obtenerPorTienda(
    @Param() parametros: ParametrosRutaTiendaDto
  ): Promise<RespuestaEstandar<RespuestaConfiguracionPagosDto>> {
    return await this.gestionPagosCasoUso.obtenerPorTienda(parametros.tiendaId);
  }

  /**
   * Crea una nueva configuración de pagos para una tienda
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Crear configuración de pagos',
    description: 'Crea una nueva configuración de pagos para una tienda'
  })
  @ApiBody({
    type: CrearConfiguracionPagosDto,
    description: 'Datos para crear la configuración de pagos'
  })
  @ApiResponse({
    status: 201,
    description: 'Configuración de pagos creada exitosamente',
    type: RespuestaConfiguracionPagosDto
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos o ya existe configuración'
  })
  async crear(
    @Body() datos: CrearConfiguracionPagosDto
  ): Promise<RespuestaEstandar<RespuestaConfiguracionPagosDto>> {
    return await this.gestionPagosCasoUso.crear(datos);
  }

  /**
   * Actualiza la configuración de pagos de una tienda
   */
  @Put(':tiendaId')
  @ApiOperation({ 
    summary: 'Actualizar configuración de pagos',
    description: 'Actualiza la configuración de pagos existente para una tienda'
  })
  @ApiParam({
    name: 'tiendaId',
    description: 'ID de la tienda',
    example: 'tienda-123'
  })
  @ApiBody({
    type: ActualizarConfiguracionPagosDto,
    description: 'Datos para actualizar la configuración de pagos'
  })
  @ApiResponse({
    status: 200,
    description: 'Configuración de pagos actualizada exitosamente',
    type: RespuestaConfiguracionPagosDto
  })
  @ApiResponse({
    status: 404,
    description: 'Configuración de pagos no encontrada'
  })
  async actualizar(
    @Param() parametros: ParametrosRutaTiendaDto,
    @Body() datos: ActualizarConfiguracionPagosDto
  ): Promise<RespuestaEstandar<RespuestaConfiguracionPagosDto>> {
    return await this.gestionPagosCasoUso.actualizar(parametros.tiendaId, datos);
  }

  /**
   * Elimina la configuración de pagos de una tienda
   */
  @Delete(':tiendaId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Eliminar configuración de pagos',
    description: 'Elimina la configuración de pagos de una tienda'
  })
  @ApiParam({
    name: 'tiendaId',
    description: 'ID de la tienda',
    example: 'tienda-123'
  })
  @ApiResponse({
    status: 200,
    description: 'Configuración de pagos eliminada exitosamente'
  })
  @ApiResponse({
    status: 404,
    description: 'Configuración de pagos no encontrada'
  })
  async eliminar(
    @Param() parametros: ParametrosRutaTiendaDto
  ): Promise<RespuestaEstandar<null>> {
    return await this.gestionPagosCasoUso.eliminar(parametros.tiendaId);
  }

  /**
   * Agrega un proveedor de pago a la configuración
   */
  @Post(':tiendaId/proveedores')
  @ApiOperation({ 
    summary: 'Agregar proveedor de pago',
    description: 'Agrega un nuevo proveedor de pago a la configuración existente'
  })
  @ApiParam({
    name: 'tiendaId',
    description: 'ID de la tienda',
    example: 'tienda-123'
  })
  @ApiBody({
    type: ProveedorPagoDto,
    description: 'Datos del proveedor de pago a agregar'
  })
  @ApiResponse({
    status: 200,
    description: 'Proveedor de pago agregado exitosamente',
    type: RespuestaConfiguracionPagosDto
  })
  @ApiResponse({
    status: 404,
    description: 'Configuración de pagos no encontrada'
  })
  async agregarProveedor(
    @Param() parametros: ParametrosRutaTiendaDto,
    @Body() proveedor: ProveedorPagoDto
  ): Promise<RespuestaEstandar<RespuestaConfiguracionPagosDto>> {
    return await this.gestionPagosCasoUso.agregarProveedor(parametros.tiendaId, proveedor);
  }

  /**
   * Activa/desactiva un proveedor de pago
   */
  @Put(':tiendaId/proveedores/:nombreProveedor/estado')
  @ApiOperation({ 
    summary: 'Cambiar estado de proveedor de pago',
    description: 'Activa o desactiva un proveedor de pago específico'
  })
  @ApiParam({
    name: 'tiendaId',
    description: 'ID de la tienda',
    example: 'tienda-123'
  })
  @ApiParam({
    name: 'nombreProveedor',
    description: 'Nombre del proveedor de pago',
    example: 'Stripe Payments'
  })
  @ApiQuery({
    name: 'activo',
    description: 'Estado del proveedor (true para activar, false para desactivar)',
    type: Boolean,
    required: true
  })
  @ApiResponse({
    status: 200,
    description: 'Estado del proveedor cambiado exitosamente',
    type: RespuestaConfiguracionPagosDto
  })
  @ApiResponse({
    status: 404,
    description: 'Configuración de pagos o proveedor no encontrado'
  })
  async cambiarEstadoProveedor(
    @Param() parametros: ParametrosRutaTiendaDto,
    @Param('nombreProveedor') nombreProveedor: string,
    @Query('activo') activo: boolean
  ): Promise<RespuestaEstandar<RespuestaConfiguracionPagosDto>> {
    return await this.gestionPagosCasoUso.cambiarEstadoProveedor(
      parametros.tiendaId, 
      nombreProveedor, 
      activo === true
    );
  }

  /**
   * Agrega un método de pago manual
   */
  @Post(':tiendaId/metodos-manuales')
  @ApiOperation({ 
    summary: 'Agregar método de pago manual',
    description: 'Agrega un nuevo método de pago manual a la configuración existente'
  })
  @ApiParam({
    name: 'tiendaId',
    description: 'ID de la tienda',
    example: 'tienda-123'
  })
  @ApiBody({
    type: MetodoPagoManualDto,
    description: 'Datos del método de pago manual a agregar'
  })
  @ApiResponse({
    status: 200,
    description: 'Método de pago manual agregado exitosamente',
    type: RespuestaConfiguracionPagosDto
  })
  @ApiResponse({
    status: 404,
    description: 'Configuración de pagos no encontrada'
  })
  async agregarMetodoManual(
    @Param() parametros: ParametrosRutaTiendaDto,
    @Body() metodoManual: MetodoPagoManualDto
  ): Promise<RespuestaEstandar<RespuestaConfiguracionPagosDto>> {
    return await this.gestionPagosCasoUso.agregarMetodoManual(parametros.tiendaId, metodoManual);
  }

  /**
   * Configura la caducidad de tarjetas de regalo
   */
  @Put(':tiendaId/giftcards/caducidad')
  @ApiOperation({ 
    summary: 'Configurar caducidad de tarjetas de regalo',
    description: 'Configura la caducidad y reglas de las tarjetas de regalo'
  })
  @ApiParam({
    name: 'tiendaId',
    description: 'ID de la tienda',
    example: 'tienda-123'
  })
  @ApiBody({
    type: ConfiguracionGiftcardDto,
    description: 'Configuración de caducidad para tarjetas de regalo'
  })
  @ApiResponse({
    status: 200,
    description: 'Configuración de caducidad actualizada exitosamente',
    type: RespuestaConfiguracionPagosDto
  })
  @ApiResponse({
    status: 404,
    description: 'Configuración de pagos no encontrada'
  })
  async configurarCaducidadGiftCard(
    @Param() parametros: ParametrosRutaTiendaDto,
    @Body() configuracionCaducidad: ConfiguracionGiftcardDto
  ): Promise<RespuestaEstandar<RespuestaConfiguracionPagosDto>> {
    return await this.gestionPagosCasoUso.configurarCaducidadGiftCard(
      parametros.tiendaId, 
      configuracionCaducidad
    );
  }

  /**
   * Obtiene estadísticas de uso de métodos de pago
   */
  @Get(':tiendaId/estadisticas')
  @ApiOperation({ 
    summary: 'Obtener estadísticas de pagos',
    description: 'Obtiene estadísticas de uso de métodos de pago para una tienda'
  })
  @ApiParam({
    name: 'tiendaId',
    description: 'ID de la tienda',
    example: 'tienda-123'
  })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas obtenidas exitosamente'
  })
  @ApiResponse({
    status: 404,
    description: 'Configuración de pagos no encontrada'
  })
  async obtenerEstadisticas(
    @Param() parametros: ParametrosRutaTiendaDto
  ): Promise<RespuestaEstandar<any>> {
    return await this.gestionPagosCasoUso.obtenerEstadisticas(parametros.tiendaId);
  }

  /**
   * Busca configuraciones de pagos por criterios específicos
   */
  @Get('buscar/criterios')
  @ApiOperation({ 
    summary: 'Buscar configuraciones por criterios',
    description: 'Busca configuraciones de pagos que cumplan con criterios específicos'
  })
  @ApiQuery({
    name: 'criterios',
    type: CriteriosBusquedaPagosDto,
    description: 'Criterios de búsqueda para filtrar configuraciones'
  })
  @ApiResponse({
    status: 200,
    description: 'Configuraciones encontradas exitosamente'
  })
  async buscarPorCriterios(
    @Query() criterios: CriteriosBusquedaPagosDto
  ): Promise<RespuestaEstandar<any>> {
    // Nota: Este endpoint necesitaría un caso de uso específico para búsquedas globales
    // Por ahora retornamos un error 501 (No implementado)
    return {
      mensaje: 'Búsqueda por criterios no implementada aún',
      data: null,
      tipo_mensaje: 'Funcionalidad.NoImplementada',
      estado_respuesta: 501
    };
  }
}