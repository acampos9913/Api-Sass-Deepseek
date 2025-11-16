import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { GestionSucursalesCasoUso } from '../../dominio/casos-uso/gestion-sucursales.caso-uso';
import { ConfiguracionSucursalesDto, ActualizarConfiguracionSucursalesDto } from '../../aplicacion/dto/configuracion-sucursales.dto';

/**
 * Controlador para la gestión de sucursales
 * Maneja las operaciones CRUD para la configuración de sucursales
 */
@ApiTags('Configuración - Sucursales')
@Controller('configuracion/sucursales')
export class ControladorSucursales {
  constructor(private readonly gestionSucursalesCasoUso: GestionSucursalesCasoUso) {}

  /**
   * Crea una nueva sucursal
   */
  @Post(':tiendaId')
  @ApiOperation({ 
    summary: 'Crear nueva sucursal',
    description: 'Crea una nueva configuración de sucursal para una tienda específica'
  })
  @ApiParam({ 
    name: 'tiendaId', 
    description: 'ID de la tienda', 
    example: 'tienda-123' 
  })
  @ApiBody({ 
    type: ConfiguracionSucursalesDto,
    description: 'Datos de la sucursal a crear'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Sucursal creada exitosamente' 
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
    @Body() datos: ConfiguracionSucursalesDto,
  ) {
    return await this.gestionSucursalesCasoUso.crear(tiendaId, datos);
  }

  /**
   * Obtiene todas las sucursales de una tienda
   */
  @Get(':tiendaId')
  @ApiOperation({ 
    summary: 'Obtener todas las sucursales',
    description: 'Obtiene la lista completa de sucursales de una tienda específica'
  })
  @ApiParam({ 
    name: 'tiendaId', 
    description: 'ID de la tienda', 
    example: 'tienda-123' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de sucursales obtenida exitosamente' 
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Error interno del servidor' 
  })
  async listar(@Param('tiendaId') tiendaId: string) {
    return await this.gestionSucursalesCasoUso.listar(tiendaId);
  }

  /**
   * Obtiene una sucursal específica por ID
   */
  @Get(':tiendaId/:id')
  @ApiOperation({ 
    summary: 'Obtener sucursal por ID',
    description: 'Obtiene los detalles de una sucursal específica por su ID'
  })
  @ApiParam({ 
    name: 'tiendaId', 
    description: 'ID de la tienda', 
    example: 'tienda-123' 
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID de la sucursal', 
    example: 'sucursal-456' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Sucursal obtenida exitosamente' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Sucursal no encontrada' 
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Error interno del servidor' 
  })
  async obtenerPorId(
    @Param('tiendaId') tiendaId: string,
    @Param('id') id: string,
  ) {
    return await this.gestionSucursalesCasoUso.obtenerPorId(id, tiendaId);
  }

  /**
   * Actualiza una sucursal existente
   */
  @Put(':tiendaId/:id')
  @ApiOperation({ 
    summary: 'Actualizar sucursal',
    description: 'Actualiza los datos de una sucursal existente'
  })
  @ApiParam({ 
    name: 'tiendaId', 
    description: 'ID de la tienda', 
    example: 'tienda-123' 
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID de la sucursal', 
    example: 'sucursal-456' 
  })
  @ApiBody({ 
    type: ActualizarConfiguracionSucursalesDto,
    description: 'Datos actualizados de la sucursal'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Sucursal actualizada exitosamente' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Error en los datos de entrada' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Sucursal no encontrada' 
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Error interno del servidor' 
  })
  async actualizar(
    @Param('tiendaId') tiendaId: string,
    @Param('id') id: string,
    @Body() datos: ActualizarConfiguracionSucursalesDto,
  ) {
    return await this.gestionSucursalesCasoUso.actualizar(id, tiendaId, datos);
  }

  /**
   * Elimina una sucursal
   */
  @Delete(':tiendaId/:id')
  @HttpCode(200)
  @ApiOperation({ 
    summary: 'Eliminar sucursal',
    description: 'Elimina una sucursal específica de la tienda'
  })
  @ApiParam({ 
    name: 'tiendaId', 
    description: 'ID de la tienda', 
    example: 'tienda-123' 
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID de la sucursal', 
    example: 'sucursal-456' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Sucursal eliminada exitosamente' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Sucursal no encontrada' 
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Error interno del servidor' 
  })
  async eliminar(
    @Param('tiendaId') tiendaId: string,
    @Param('id') id: string,
  ) {
    return await this.gestionSucursalesCasoUso.eliminar(id, tiendaId);
  }

  /**
   * Activa una sucursal
   */
  @Put(':tiendaId/:id/activar')
  @ApiOperation({ 
    summary: 'Activar sucursal',
    description: 'Activa una sucursal que estaba inactiva'
  })
  @ApiParam({ 
    name: 'tiendaId', 
    description: 'ID de la tienda', 
    example: 'tienda-123' 
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID de la sucursal', 
    example: 'sucursal-456' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Sucursal activada exitosamente' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Sucursal no encontrada' 
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Error interno del servidor' 
  })
  async activar(
    @Param('tiendaId') tiendaId: string,
    @Param('id') id: string,
  ) {
    return await this.gestionSucursalesCasoUso.activar(id, tiendaId);
  }

  /**
   * Desactiva una sucursal
   */
  @Put(':tiendaId/:id/desactivar')
  @ApiOperation({ 
    summary: 'Desactivar sucursal',
    description: 'Desactiva una sucursal que estaba activa'
  })
  @ApiParam({ 
    name: 'tiendaId', 
    description: 'ID de la tienda', 
    example: 'tienda-123' 
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID de la sucursal', 
    example: 'sucursal-456' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Sucursal desactivada exitosamente' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Sucursal no encontrada' 
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Error interno del servidor' 
  })
  async desactivar(
    @Param('tiendaId') tiendaId: string,
    @Param('id') id: string,
  ) {
    return await this.gestionSucursalesCasoUso.desactivar(id, tiendaId);
  }

  /**
   * Obtiene sucursales por estado
   */
  @Get(':tiendaId/estado/:estado')
  @ApiOperation({ 
    summary: 'Obtener sucursales por estado',
    description: 'Obtiene la lista de sucursales filtradas por estado (activa/inactiva)'
  })
  @ApiParam({ 
    name: 'tiendaId', 
    description: 'ID de la tienda', 
    example: 'tienda-123' 
  })
  @ApiParam({ 
    name: 'estado', 
    description: 'Estado de las sucursales', 
    enum: ['activa', 'inactiva'],
    example: 'activa'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Sucursales obtenidas exitosamente' 
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Error interno del servidor' 
  })
  async listarPorEstado(
    @Param('tiendaId') tiendaId: string,
    @Param('estado') estado: string,
  ) {
    return await this.gestionSucursalesCasoUso.listarPorEstado(tiendaId, estado);
  }
}