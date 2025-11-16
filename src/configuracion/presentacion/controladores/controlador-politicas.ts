import { Controller, Get, Post, Put, Patch, Delete, Body, Param, UsePipes, ValidationPipe, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { GestionPoliticasCasoUso } from '../../dominio/casos-uso/gestion-politicas.caso-uso';
import { ConfiguracionPoliticasDto, ActualizarConfiguracionPoliticasDto, ReglaDevolucionDto } from '../../aplicacion/dto/configuracion-politicas.dto';

/**
 * Controlador REST para la gestión de políticas y devoluciones
 * Expone endpoints para configurar políticas legales, reglas de devolución y contactos
 */
@ApiTags('Configuración - Políticas')
@Controller('api/v1/configuracion/politicas')
@UsePipes(new ValidationPipe({ transform: true }))
export class ControladorPoliticas {
  constructor(
    private readonly gestionPoliticasCasoUso: GestionPoliticasCasoUso,
  ) {}

  /**
   * Crear configuración de políticas para una tienda
   */
  @Post(':tiendaId')
  @ApiOperation({ 
    summary: 'Crear configuración de políticas',
    description: 'Crea una nueva configuración de políticas para una tienda específica'
  })
  @ApiParam({
    name: 'tiendaId',
    description: 'ID de la tienda',
    example: 'tienda-123'
  })
  @ApiBody({
    type: ConfiguracionPoliticasDto,
    description: 'Datos de configuración de políticas'
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Configuración de políticas creada exitosamente'
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos de entrada inválidos'
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Ya existe una configuración para esta tienda'
  })
  async crear(
    @Param('tiendaId') tiendaId: string,
    @Body() dto: ConfiguracionPoliticasDto,
  ) {
    return await this.gestionPoliticasCasoUso.crear(tiendaId, dto);
  }

  /**
   * Obtener configuración de políticas por ID de tienda
   */
  @Get(':tiendaId')
  @ApiOperation({ 
    summary: 'Obtener configuración de políticas',
    description: 'Obtiene la configuración de políticas de una tienda específica'
  })
  @ApiParam({
    name: 'tiendaId',
    description: 'ID de la tienda',
    example: 'tienda-123'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Configuración de políticas obtenida exitosamente'
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Configuración de políticas no encontrada'
  })
  async obtenerPorTiendaId(@Param('tiendaId') tiendaId: string) {
    return await this.gestionPoliticasCasoUso.obtenerPorTiendaId(tiendaId);
  }

  /**
   * Actualizar configuración de políticas existente
   */
  @Put(':tiendaId')
  @ApiOperation({ 
    summary: 'Actualizar configuración de políticas',
    description: 'Actualiza la configuración de políticas de una tienda específica'
  })
  @ApiParam({
    name: 'tiendaId',
    description: 'ID de la tienda',
    example: 'tienda-123'
  })
  @ApiBody({
    type: ActualizarConfiguracionPoliticasDto,
    description: 'Datos actualizados de configuración de políticas'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Configuración de políticas actualizada exitosamente'
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Configuración de políticas no encontrada'
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos de entrada inválidos'
  })
  async actualizar(
    @Param('tiendaId') tiendaId: string,
    @Body() dto: ActualizarConfiguracionPoliticasDto,
  ) {
    return await this.gestionPoliticasCasoUso.actualizar(tiendaId, dto);
  }

  /**
   * Eliminar configuración de políticas
   */
  @Delete(':tiendaId')
  @ApiOperation({ 
    summary: 'Eliminar configuración de políticas',
    description: 'Elimina la configuración de políticas de una tienda específica'
  })
  @ApiParam({
    name: 'tiendaId',
    description: 'ID de la tienda',
    example: 'tienda-123'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Configuración de políticas eliminada exitosamente'
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Configuración de políticas no encontrada'
  })
  async eliminar(@Param('tiendaId') tiendaId: string) {
    return await this.gestionPoliticasCasoUso.eliminar(tiendaId);
  }

  /**
   * Activar reglas de devolución
   */
  @Patch(':tiendaId/reglas-devolucion/activar')
  @ApiOperation({ 
    summary: 'Activar reglas de devolución',
    description: 'Activa las reglas de devolución para una tienda específica'
  })
  @ApiParam({
    name: 'tiendaId',
    description: 'ID de la tienda',
    example: 'tienda-123'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Reglas de devolución activadas exitosamente'
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Configuración de políticas no encontrada'
  })
  async activarReglasDevolucion(@Param('tiendaId') tiendaId: string) {
    return await this.gestionPoliticasCasoUso.activarReglasDevolucion(tiendaId);
  }

  /**
   * Desactivar reglas de devolución
   */
  @Patch(':tiendaId/reglas-devolucion/desactivar')
  @ApiOperation({ 
    summary: 'Desactivar reglas de devolución',
    description: 'Desactiva las reglas de devolución para una tienda específica'
  })
  @ApiParam({
    name: 'tiendaId',
    description: 'ID de la tienda',
    example: 'tienda-123'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Reglas de devolución desactivadas exitosamente'
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Configuración de políticas no encontrada'
  })
  async desactivarReglasDevolucion(@Param('tiendaId') tiendaId: string) {
    return await this.gestionPoliticasCasoUso.desactivarReglasDevolucion(tiendaId);
  }

  /**
   * Agregar regla de devolución
   */
  @Post(':tiendaId/reglas-devolucion')
  @ApiOperation({ 
    summary: 'Agregar regla de devolución',
    description: 'Agrega una nueva regla de devolución a la configuración de políticas'
  })
  @ApiParam({
    name: 'tiendaId',
    description: 'ID de la tienda',
    example: 'tienda-123'
  })
  @ApiBody({
    type: ReglaDevolucionDto,
    description: 'Datos de la regla de devolución'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Regla de devolución agregada exitosamente'
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Configuración de políticas no encontrada'
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos de entrada inválidos'
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Ya existe una regla con el mismo tipo y condición'
  })
  async agregarReglaDevolucion(
    @Param('tiendaId') tiendaId: string,
    @Body() regla: ReglaDevolucionDto,
  ) {
    return await this.gestionPoliticasCasoUso.agregarReglaDevolucion(tiendaId, regla);
  }

  /**
   * Actualizar regla de devolución
   */
  @Put(':tiendaId/reglas-devolucion/:indice')
  @ApiOperation({ 
    summary: 'Actualizar regla de devolución',
    description: 'Actualiza una regla de devolución existente por su índice'
  })
  @ApiParam({
    name: 'tiendaId',
    description: 'ID de la tienda',
    example: 'tienda-123'
  })
  @ApiParam({
    name: 'indice',
    description: 'Índice de la regla de devolución',
    example: '0'
  })
  @ApiBody({
    type: ReglaDevolucionDto,
    description: 'Datos actualizados de la regla de devolución'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Regla de devolución actualizada exitosamente'
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Configuración de políticas o regla no encontrada'
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos de entrada inválidos'
  })
  async actualizarReglaDevolucion(
    @Param('tiendaId') tiendaId: string,
    @Param('indice') indice: number,
    @Body() regla: ReglaDevolucionDto,
  ) {
    return await this.gestionPoliticasCasoUso.actualizarReglaDevolucion(tiendaId, indice, regla);
  }

  /**
   * Eliminar regla de devolución
   */
  @Delete(':tiendaId/reglas-devolucion/:indice')
  @ApiOperation({ 
    summary: 'Eliminar regla de devolución',
    description: 'Elimina una regla de devolución por su índice'
  })
  @ApiParam({
    name: 'tiendaId',
    description: 'ID de la tienda',
    example: 'tienda-123'
  })
  @ApiParam({
    name: 'indice',
    description: 'Índice de la regla de devolución',
    example: '0'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Regla de devolución eliminada exitosamente'
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Configuración de políticas o regla no encontrada'
  })
  async eliminarReglaDevolucion(
    @Param('tiendaId') tiendaId: string,
    @Param('indice') indice: number,
  ) {
    return await this.gestionPoliticasCasoUso.eliminarReglaDevolucion(tiendaId, indice);
  }

  /**
   * Agregar producto a venta final
   */
  @Post(':tiendaId/productos-venta-final/:productoId')
  @ApiOperation({ 
    summary: 'Agregar producto a venta final',
    description: 'Agrega un producto a la lista de productos de venta final'
  })
  @ApiParam({
    name: 'tiendaId',
    description: 'ID de la tienda',
    example: 'tienda-123'
  })
  @ApiParam({
    name: 'productoId',
    description: 'ID del producto',
    example: 'prod-456'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Producto agregado a venta final exitosamente'
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Configuración de políticas no encontrada'
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'El producto ya está en la lista de venta final'
  })
  async agregarProductoVentaFinal(
    @Param('tiendaId') tiendaId: string,
    @Param('productoId') productoId: string,
  ) {
    return await this.gestionPoliticasCasoUso.agregarProductoVentaFinal(tiendaId, productoId);
  }

  /**
   * Eliminar producto de venta final
   */
  @Delete(':tiendaId/productos-venta-final/:productoId')
  @ApiOperation({ 
    summary: 'Eliminar producto de venta final',
    description: 'Elimina un producto de la lista de productos de venta final'
  })
  @ApiParam({
    name: 'tiendaId',
    description: 'ID de la tienda',
    example: 'tienda-123'
  })
  @ApiParam({
    name: 'productoId',
    description: 'ID del producto',
    example: 'prod-456'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Producto eliminado de venta final exitosamente'
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Configuración de políticas o producto no encontrado'
  })
  async eliminarProductoVentaFinal(
    @Param('tiendaId') tiendaId: string,
    @Param('productoId') productoId: string,
  ) {
    return await this.gestionPoliticasCasoUso.eliminarProductoVentaFinal(tiendaId, productoId);
  }

  /**
   * Verificar si las reglas de devolución están activas
   */
  @Get(':tiendaId/reglas-devolucion/estado')
  @ApiOperation({ 
    summary: 'Verificar estado de reglas de devolución',
    description: 'Verifica si las reglas de devolución están activas para una tienda'
  })
  @ApiParam({
    name: 'tiendaId',
    description: 'ID de la tienda',
    example: 'tienda-123'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Estado de reglas de devolución obtenido exitosamente'
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Configuración de políticas no encontrada'
  })
  async verificarReglasDevolucionActivas(@Param('tiendaId') tiendaId: string) {
    return await this.gestionPoliticasCasoUso.verificarReglasDevolucionActivas(tiendaId);
  }

  /**
   * Verificar si un producto es de venta final
   */
  @Get(':tiendaId/productos-venta-final/:productoId/verificar')
  @ApiOperation({ 
    summary: 'Verificar producto en venta final',
    description: 'Verifica si un producto está en la lista de venta final'
  })
  @ApiParam({
    name: 'tiendaId',
    description: 'ID de la tienda',
    example: 'tienda-123'
  })
  @ApiParam({
    name: 'productoId',
    description: 'ID del producto',
    example: 'prod-456'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Estado de producto en venta final obtenido exitosamente'
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Configuración de políticas no encontrada'
  })
  async verificarProductoVentaFinal(
    @Param('tiendaId') tiendaId: string,
    @Param('productoId') productoId: string,
  ) {
    return await this.gestionPoliticasCasoUso.verificarProductoVentaFinal(tiendaId, productoId);
  }

  /**
   * Obtener reglas de devolución activas
   */
  @Get(':tiendaId/reglas-devolucion/activas')
  @ApiOperation({ 
    summary: 'Obtener reglas de devolución activas',
    description: 'Obtiene todas las reglas de devolución que están activas'
  })
  @ApiParam({
    name: 'tiendaId',
    description: 'ID de la tienda',
    example: 'tienda-123'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Reglas de devolución activas obtenidas exitosamente'
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Configuración de políticas no encontrada'
  })
  async obtenerReglasDevolucionActivas(@Param('tiendaId') tiendaId: string) {
    return await this.gestionPoliticasCasoUso.obtenerReglasDevolucionActivas(tiendaId);
  }
}