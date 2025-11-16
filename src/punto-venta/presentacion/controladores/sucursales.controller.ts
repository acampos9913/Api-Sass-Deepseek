import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UsePipes,
  ValidationPipe,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SucursalesService } from '../../aplicacion/servicios/sucursales.service';
import {
  CrearSucursalDto,
  CrearSucursalRespuestaDto,
  SucursalRespuestaDto,
  ListaSucursalesRespuestaDto,
  FiltrosSucursalDto,
} from '../../aplicacion/dto/crear-sucursal.dto';
import { JwtAuthGuard } from '../../../autenticacion/aplicacion/guards/jwt-auth.guard';
import { RolesGuard } from '../../../autenticacion/aplicacion/guards/roles.guard';
import { Roles } from '../../../autenticacion/aplicacion/decorators/roles.decorator';
import { RolUsuario } from '../../../autenticacion/dominio/enums/rol-usuario.enum';

/**
 * Controlador para la gestión de sucursales del punto de venta
 * Proporciona endpoints para operaciones CRUD de sucursales
 */
@ApiTags('Punto de Venta - Sucursales')
@ApiBearerAuth()
@Controller('api/v1/punto-venta/sucursales')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SucursalesController {
  constructor(private readonly sucursalesService: SucursalesService) {}

  /**
   * Crear una nueva sucursal
   */
  @Post()
  @Roles(RolUsuario.ADMIN, RolUsuario.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Crear una nueva sucursal',
    description: 'Crea una nueva sucursal para el punto de venta. Requiere permisos de ADMIN o SUPER_ADMIN.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Sucursal creada exitosamente',
    type: CrearSucursalRespuestaDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos de entrada inválidos',
    type: CrearSucursalRespuestaDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Ya existe una sucursal con el mismo nombre en esta tienda',
    type: CrearSucursalRespuestaDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'No autorizado - Token JWT requerido',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'No tiene permisos para realizar esta acción',
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async crearSucursal(
    @Body() crearSucursalDto: CrearSucursalDto,
  ): Promise<CrearSucursalRespuestaDto> {
    return this.sucursalesService.crearSucursal(crearSucursalDto);
  }

  /**
   * Obtener todas las sucursales con filtros
   */
  @Get()
  @Roles(RolUsuario.ADMIN, RolUsuario.SUPER_ADMIN, RolUsuario.EDITOR, RolUsuario.VENDEDOR)
  @ApiOperation({
    summary: 'Obtener lista de sucursales',
    description: 'Obtiene una lista de sucursales con opciones de filtrado y paginación.',
  })
  @ApiQuery({
    name: 'tienda_id',
    required: false,
    description: 'Filtrar por ID de tienda',
    type: String,
  })
  @ApiQuery({
    name: 'ciudad',
    required: false,
    description: 'Filtrar por ciudad',
    type: String,
  })
  @ApiQuery({
    name: 'provincia',
    required: false,
    description: 'Filtrar por provincia',
    type: String,
  })
  @ApiQuery({
    name: 'activo',
    required: false,
    description: 'Filtrar por estado activo/inactivo',
    type: Boolean,
  })
  @ApiQuery({
    name: 'tiene_cajas_abiertas',
    required: false,
    description: 'Filtrar por sucursales con cajas abiertas',
    type: Boolean,
  })
  @ApiQuery({
    name: 'pagina',
    required: false,
    description: 'Número de página para paginación',
    type: Number,
    example: 1,
  })
  @ApiQuery({
    name: 'limite',
    required: false,
    description: 'Límite de elementos por página',
    type: Number,
    example: 10,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de sucursales obtenida exitosamente',
    type: ListaSucursalesRespuestaDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'No autorizado - Token JWT requerido',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'No tiene permisos para realizar esta acción',
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async obtenerSucursales(
    @Query() filtros: FiltrosSucursalDto,
  ): Promise<ListaSucursalesRespuestaDto> {
    return this.sucursalesService.obtenerSucursales(filtros);
  }

  /**
   * Obtener una sucursal por ID
   */
  @Get(':id')
  @Roles(RolUsuario.ADMIN, RolUsuario.SUPER_ADMIN, RolUsuario.EDITOR, RolUsuario.VENDEDOR)
  @ApiOperation({
    summary: 'Obtener sucursal por ID',
    description: 'Obtiene los detalles de una sucursal específica por su ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la sucursal',
    type: String,
    example: 'suc_123456789',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Sucursal encontrada exitosamente',
    type: CrearSucursalRespuestaDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Sucursal no encontrada',
    type: CrearSucursalRespuestaDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'No autorizado - Token JWT requerido',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'No tiene permisos para realizar esta acción',
  })
  async obtenerSucursalPorId(
    @Param('id') id: string,
  ): Promise<CrearSucursalRespuestaDto> {
    return this.sucursalesService.obtenerSucursalPorId(id);
  }

  /**
   * Actualizar una sucursal
   */
  @Put(':id')
  @Roles(RolUsuario.ADMIN, RolUsuario.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Actualizar sucursal',
    description: 'Actualiza los datos de una sucursal existente. Requiere permisos de ADMIN o SUPER_ADMIN.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la sucursal a actualizar',
    type: String,
    example: 'suc_123456789',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Sucursal actualizada exitosamente',
    type: CrearSucursalRespuestaDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Sucursal no encontrada',
    type: CrearSucursalRespuestaDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos de entrada inválidos',
    type: CrearSucursalRespuestaDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'No autorizado - Token JWT requerido',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'No tiene permisos para realizar esta acción',
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async actualizarSucursal(
    @Param('id') id: string,
    @Body() actualizarSucursalDto: CrearSucursalDto,
  ): Promise<CrearSucursalRespuestaDto> {
    return this.sucursalesService.actualizarSucursal(id, actualizarSucursalDto);
  }

  /**
   * Eliminar una sucursal
   */
  @Delete(':id')
  @Roles(RolUsuario.ADMIN, RolUsuario.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Eliminar sucursal',
    description: 'Elimina una sucursal existente. Requiere permisos de ADMIN o SUPER_ADMIN.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la sucursal a eliminar',
    type: String,
    example: 'suc_123456789',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Sucursal eliminada exitosamente',
    type: CrearSucursalRespuestaDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Sucursal no encontrada',
    type: CrearSucursalRespuestaDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'No se puede eliminar la sucursal porque tiene cajas activas',
    type: CrearSucursalRespuestaDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'No autorizado - Token JWT requerido',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'No tiene permisos para realizar esta acción',
  })
  async eliminarSucursal(
    @Param('id') id: string,
  ): Promise<CrearSucursalRespuestaDto> {
    return this.sucursalesService.eliminarSucursal(id);
  }

  /**
   * Activar una sucursal
   */
  @Put(':id/activar')
  @Roles(RolUsuario.ADMIN, RolUsuario.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Activar sucursal',
    description: 'Activa una sucursal que estaba inactiva. Requiere permisos de ADMIN o SUPER_ADMIN.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la sucursal a activar',
    type: String,
    example: 'suc_123456789',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Sucursal activada exitosamente',
    type: CrearSucursalRespuestaDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Sucursal no encontrada',
    type: CrearSucursalRespuestaDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'No autorizado - Token JWT requerido',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'No tiene permisos para realizar esta acción',
  })
  async activarSucursal(
    @Param('id') id: string,
  ): Promise<CrearSucursalRespuestaDto> {
    return this.sucursalesService.activarSucursal(id);
  }

  /**
   * Desactivar una sucursal
   */
  @Put(':id/desactivar')
  @Roles(RolUsuario.ADMIN, RolUsuario.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Desactivar sucursal',
    description: 'Desactiva una sucursal activa. Requiere permisos de ADMIN o SUPER_ADMIN.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la sucursal a desactivar',
    type: String,
    example: 'suc_123456789',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Sucursal desactivada exitosamente',
    type: CrearSucursalRespuestaDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Sucursal no encontrada',
    type: CrearSucursalRespuestaDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'No se puede desactivar la sucursal porque tiene cajas abiertas',
    type: CrearSucursalRespuestaDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'No autorizado - Token JWT requerido',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'No tiene permisos para realizar esta acción',
  })
  async desactivarSucursal(
    @Param('id') id: string,
  ): Promise<CrearSucursalRespuestaDto> {
    return this.sucursalesService.desactivarSucursal(id);
  }

  /**
   * Obtener sucursales por tienda
   */
  @Get('tienda/:tienda_id')
  @Roles(RolUsuario.ADMIN, RolUsuario.SUPER_ADMIN, RolUsuario.EDITOR, RolUsuario.VENDEDOR)
  @ApiOperation({
    summary: 'Obtener sucursales por tienda',
    description: 'Obtiene todas las sucursales pertenecientes a una tienda específica.',
  })
  @ApiParam({
    name: 'tienda_id',
    description: 'ID de la tienda',
    type: String,
    example: 'tienda_123456789',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de sucursales obtenida exitosamente',
    type: ListaSucursalesRespuestaDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'No autorizado - Token JWT requerido',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'No tiene permisos para realizar esta acción',
  })
  async obtenerSucursalesPorTienda(
    @Param('tienda_id') tienda_id: string,
  ): Promise<ListaSucursalesRespuestaDto> {
    return this.sucursalesService.obtenerSucursalesPorTienda(tienda_id);
  }

  /**
   * Obtener sucursales activas por tienda
   */
  @Get('tienda/:tienda_id/activas')
  @Roles(RolUsuario.ADMIN, RolUsuario.SUPER_ADMIN, RolUsuario.EDITOR, RolUsuario.VENDEDOR)
  @ApiOperation({
    summary: 'Obtener sucursales activas por tienda',
    description: 'Obtiene todas las sucursales activas pertenecientes a una tienda específica.',
  })
  @ApiParam({
    name: 'tienda_id',
    description: 'ID de la tienda',
    type: String,
    example: 'tienda_123456789',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de sucursales activas obtenida exitosamente',
    type: ListaSucursalesRespuestaDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'No autorizado - Token JWT requerido',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'No tiene permisos para realizar esta acción',
  })
  async obtenerSucursalesActivasPorTienda(
    @Param('tienda_id') tienda_id: string,
  ): Promise<ListaSucursalesRespuestaDto> {
    return this.sucursalesService.obtenerSucursalesActivasPorTienda(tienda_id);
  }

  /**
   * Obtener estadísticas de sucursales por tienda
   */
  @Get('tienda/:tienda_id/estadisticas')
  @Roles(RolUsuario.ADMIN, RolUsuario.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Obtener estadísticas de sucursales por tienda',
    description: 'Obtiene estadísticas detalladas de todas las sucursales de una tienda.',
  })
  @ApiParam({
    name: 'tienda_id',
    description: 'ID de la tienda',
    type: String,
    example: 'tienda_123456789',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Estadísticas obtenidas exitosamente',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'No autorizado - Token JWT requerido',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'No tiene permisos para realizar esta acción',
  })
  async obtenerEstadisticasPorTienda(
    @Param('tienda_id') tienda_id: string,
  ) {
    return this.sucursalesService.obtenerEstadisticasPorTienda(tienda_id);
  }
}