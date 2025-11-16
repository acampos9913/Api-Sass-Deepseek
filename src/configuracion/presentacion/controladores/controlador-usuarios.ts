import { Controller, Get, Put, Post, Delete, Body, Param, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { GestionUsuariosCasoUso } from '../../dominio/casos-uso/gestion-usuarios.caso-uso';
import {
  ConfiguracionUsuariosDto,
  ActualizarConfiguracionUsuariosDto,
  AgregarAppConectadaDto,
  AgregarReglaDevolucionDto,
  ActualizarReglaDevolucionDto,
  AgregarMetodoAutenticacionDto,
  ActualizarMetodoAutenticacionDto,
  AgregarReglaCreditoDto,
  ActualizarReglaCreditoDto,
} from '../../aplicacion/dto/configuracion-usuarios.dto';

@ApiTags('Configuración - Usuarios')
@Controller('configuracion/usuarios')
@UsePipes(new ValidationPipe({ transform: true }))
export class ControladorUsuarios {
  constructor(private readonly gestionUsuariosCasoUso: GestionUsuariosCasoUso) {}

  @Get(':tiendaId')
  @ApiOperation({ summary: 'Obtener configuración de usuarios' })
  @ApiParam({ name: 'tiendaId', description: 'ID de la tienda' })
  @ApiResponse({ status: 200, description: 'Configuración obtenida exitosamente' })
  @ApiResponse({ status: 500, description: 'Error del servidor' })
  async obtenerConfiguracion(@Param('tiendaId') tiendaId: string) {
    return await this.gestionUsuariosCasoUso.obtenerConfiguracion(tiendaId);
  }

  @Put(':tiendaId')
  @ApiOperation({ summary: 'Actualizar configuración de usuarios' })
  @ApiParam({ name: 'tiendaId', description: 'ID de la tienda' })
  @ApiResponse({ status: 200, description: 'Configuración actualizada exitosamente' })
  @ApiResponse({ status: 500, description: 'Error del servidor' })
  async actualizarConfiguracion(
    @Param('tiendaId') tiendaId: string,
    @Body() datos: ActualizarConfiguracionUsuariosDto,
  ) {
    return await this.gestionUsuariosCasoUso.actualizarConfiguracion(tiendaId, datos);
  }

  @Post(':tiendaId/apps')
  @ApiOperation({ summary: 'Agregar app conectada' })
  @ApiParam({ name: 'tiendaId', description: 'ID de la tienda' })
  @ApiResponse({ status: 200, description: 'App conectada exitosamente' })
  @ApiResponse({ status: 400, description: 'La app ya está conectada' })
  @ApiResponse({ status: 500, description: 'Error del servidor' })
  async agregarAppConectada(
    @Param('tiendaId') tiendaId: string,
    @Body() datos: AgregarAppConectadaDto,
  ) {
    return await this.gestionUsuariosCasoUso.agregarAppConectada(tiendaId, datos.appId);
  }

  @Delete(':tiendaId/apps/:appId')
  @ApiOperation({ summary: 'Eliminar app conectada' })
  @ApiParam({ name: 'tiendaId', description: 'ID de la tienda' })
  @ApiParam({ name: 'appId', description: 'ID de la app' })
  @ApiResponse({ status: 200, description: 'App desconectada exitosamente' })
  @ApiResponse({ status: 404, description: 'App no encontrada' })
  @ApiResponse({ status: 500, description: 'Error del servidor' })
  async eliminarAppConectada(
    @Param('tiendaId') tiendaId: string,
    @Param('appId') appId: string,
  ) {
    return await this.gestionUsuariosCasoUso.eliminarAppConectada(tiendaId, appId);
  }

  @Get(':tiendaId/apps')
  @ApiOperation({ summary: 'Obtener apps conectadas' })
  @ApiParam({ name: 'tiendaId', description: 'ID de la tienda' })
  @ApiResponse({ status: 200, description: 'Apps obtenidas exitosamente' })
  @ApiResponse({ status: 500, description: 'Error del servidor' })
  async obtenerAppsConectadas(@Param('tiendaId') tiendaId: string) {
    return await this.gestionUsuariosCasoUso.obtenerAppsConectadas(tiendaId);
  }

  @Post(':tiendaId/reglas-devolucion')
  @ApiOperation({ summary: 'Agregar regla de devolución' })
  @ApiParam({ name: 'tiendaId', description: 'ID de la tienda' })
  @ApiResponse({ status: 200, description: 'Regla agregada exitosamente' })
  @ApiResponse({ status: 400, description: 'Regla ya existe' })
  @ApiResponse({ status: 500, description: 'Error del servidor' })
  async agregarReglaDevolucion(
    @Param('tiendaId') tiendaId: string,
    @Body() datos: AgregarReglaDevolucionDto,
  ) {
    return await this.gestionUsuariosCasoUso.agregarReglaDevolucion(tiendaId, datos);
  }

  @Put(':tiendaId/reglas-devolucion/:reglaId')
  @ApiOperation({ summary: 'Actualizar regla de devolución' })
  @ApiParam({ name: 'tiendaId', description: 'ID de la tienda' })
  @ApiParam({ name: 'reglaId', description: 'ID de la regla' })
  @ApiResponse({ status: 200, description: 'Regla actualizada exitosamente' })
  @ApiResponse({ status: 404, description: 'Regla no encontrada' })
  @ApiResponse({ status: 500, description: 'Error del servidor' })
  async actualizarReglaDevolucion(
    @Param('tiendaId') tiendaId: string,
    @Param('reglaId') reglaId: string,
    @Body() datos: ActualizarReglaDevolucionDto,
  ) {
    return await this.gestionUsuariosCasoUso.actualizarReglaDevolucion(tiendaId, reglaId, datos);
  }

  @Delete(':tiendaId/reglas-devolucion/:reglaId')
  @ApiOperation({ summary: 'Eliminar regla de devolución' })
  @ApiParam({ name: 'tiendaId', description: 'ID de la tienda' })
  @ApiParam({ name: 'reglaId', description: 'ID de la regla' })
  @ApiResponse({ status: 200, description: 'Regla eliminada exitosamente' })
  @ApiResponse({ status: 404, description: 'Regla no encontrada' })
  @ApiResponse({ status: 500, description: 'Error del servidor' })
  async eliminarReglaDevolucion(
    @Param('tiendaId') tiendaId: string,
    @Param('reglaId') reglaId: string,
  ) {
    return await this.gestionUsuariosCasoUso.eliminarReglaDevolucion(tiendaId, reglaId);
  }

  @Get(':tiendaId/reglas-devolucion')
  @ApiOperation({ summary: 'Obtener reglas de devolución' })
  @ApiParam({ name: 'tiendaId', description: 'ID de la tienda' })
  @ApiResponse({ status: 200, description: 'Reglas obtenidas exitosamente' })
  @ApiResponse({ status: 500, description: 'Error del servidor' })
  async obtenerReglasDevolucion(@Param('tiendaId') tiendaId: string) {
    return await this.gestionUsuariosCasoUso.obtenerReglasDevolucion(tiendaId);
  }

  @Post(':tiendaId/metodos-autenticacion')
  @ApiOperation({ summary: 'Agregar método de autenticación' })
  @ApiParam({ name: 'tiendaId', description: 'ID de la tienda' })
  @ApiResponse({ status: 200, description: 'Método agregado exitosamente' })
  @ApiResponse({ status: 400, description: 'Método ya existe' })
  @ApiResponse({ status: 500, description: 'Error del servidor' })
  async agregarMetodoAutenticacion(
    @Param('tiendaId') tiendaId: string,
    @Body() datos: AgregarMetodoAutenticacionDto,
  ) {
    return await this.gestionUsuariosCasoUso.agregarMetodoAutenticacion(tiendaId, datos);
  }

  @Put(':tiendaId/metodos-autenticacion/:metodoId')
  @ApiOperation({ summary: 'Actualizar método de autenticación' })
  @ApiParam({ name: 'tiendaId', description: 'ID de la tienda' })
  @ApiParam({ name: 'metodoId', description: 'ID del método' })
  @ApiResponse({ status: 200, description: 'Método actualizado exitosamente' })
  @ApiResponse({ status: 404, description: 'Método no encontrado' })
  @ApiResponse({ status: 500, description: 'Error del servidor' })
  async actualizarMetodoAutenticacion(
    @Param('tiendaId') tiendaId: string,
    @Param('metodoId') metodoId: string,
    @Body() datos: ActualizarMetodoAutenticacionDto,
  ) {
    return await this.gestionUsuariosCasoUso.actualizarMetodoAutenticacion(tiendaId, metodoId, datos);
  }

  @Delete(':tiendaId/metodos-autenticacion/:metodoId')
  @ApiOperation({ summary: 'Eliminar método de autenticación' })
  @ApiParam({ name: 'tiendaId', description: 'ID de la tienda' })
  @ApiParam({ name: 'metodoId', description: 'ID del método' })
  @ApiResponse({ status: 200, description: 'Método eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Método no encontrado' })
  @ApiResponse({ status: 500, description: 'Error del servidor' })
  async eliminarMetodoAutenticacion(
    @Param('tiendaId') tiendaId: string,
    @Param('metodoId') metodoId: string,
  ) {
    return await this.gestionUsuariosCasoUso.eliminarMetodoAutenticacion(tiendaId, metodoId);
  }

  @Get(':tiendaId/metodos-autenticacion')
  @ApiOperation({ summary: 'Obtener métodos de autenticación' })
  @ApiParam({ name: 'tiendaId', description: 'ID de la tienda' })
  @ApiResponse({ status: 200, description: 'Métodos obtenidos exitosamente' })
  @ApiResponse({ status: 500, description: 'Error del servidor' })
  async obtenerMetodosAutenticacion(@Param('tiendaId') tiendaId: string) {
    return await this.gestionUsuariosCasoUso.obtenerMetodosAutenticacion(tiendaId);
  }

  @Post(':tiendaId/reglas-credito')
  @ApiOperation({ summary: 'Agregar regla de crédito' })
  @ApiParam({ name: 'tiendaId', description: 'ID de la tienda' })
  @ApiResponse({ status: 200, description: 'Regla agregada exitosamente' })
  @ApiResponse({ status: 400, description: 'Regla ya existe' })
  @ApiResponse({ status: 500, description: 'Error del servidor' })
  async agregarReglaCredito(
    @Param('tiendaId') tiendaId: string,
    @Body() datos: AgregarReglaCreditoDto,
  ) {
    return await this.gestionUsuariosCasoUso.agregarReglaCredito(tiendaId, datos);
  }

  @Put(':tiendaId/reglas-credito/:reglaId')
  @ApiOperation({ summary: 'Actualizar regla de crédito' })
  @ApiParam({ name: 'tiendaId', description: 'ID de la tienda' })
  @ApiParam({ name: 'reglaId', description: 'ID de la regla' })
  @ApiResponse({ status: 200, description: 'Regla actualizada exitosamente' })
  @ApiResponse({ status: 404, description: 'Regla no encontrada' })
  @ApiResponse({ status: 500, description: 'Error del servidor' })
  async actualizarReglaCredito(
    @Param('tiendaId') tiendaId: string,
    @Param('reglaId') reglaId: string,
    @Body() datos: ActualizarReglaCreditoDto,
  ) {
    return await this.gestionUsuariosCasoUso.actualizarReglaCredito(tiendaId, reglaId, datos);
  }

  @Delete(':tiendaId/reglas-credito/:reglaId')
  @ApiOperation({ summary: 'Eliminar regla de crédito' })
  @ApiParam({ name: 'tiendaId', description: 'ID de la tienda' })
  @ApiParam({ name: 'reglaId', description: 'ID de la regla' })
  @ApiResponse({ status: 200, description: 'Regla eliminada exitosamente' })
  @ApiResponse({ status: 404, description: 'Regla no encontrada' })
  @ApiResponse({ status: 500, description: 'Error del servidor' })
  async eliminarReglaCredito(
    @Param('tiendaId') tiendaId: string,
    @Param('reglaId') reglaId: string,
  ) {
    return await this.gestionUsuariosCasoUso.eliminarReglaCredito(tiendaId, reglaId);
  }

  @Get(':tiendaId/reglas-credito')
  @ApiOperation({ summary: 'Obtener reglas de crédito' })
  @ApiParam({ name: 'tiendaId', description: 'ID de la tienda' })
  @ApiResponse({ status: 200, description: 'Reglas obtenidas exitosamente' })
  @ApiResponse({ status: 500, description: 'Error del servidor' })
  async obtenerReglasCredito(@Param('tiendaId') tiendaId: string) {
    return await this.gestionUsuariosCasoUso.obtenerReglasCredito(tiendaId);
  }
}