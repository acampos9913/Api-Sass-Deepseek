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
  HttpCode,
  UseGuards 
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam, 
  ApiQuery, 
  ApiBearerAuth,
  ApiBody 
} from '@nestjs/swagger';
import { CajasService } from '../../aplicacion/servicios/cajas.service';
import {
  CrearCajaDto,
  CrearCajaRespuestaDto,
  ListaCajasRespuestaDto,
  FiltrosCajaDto,
  AbrirCajaDto,
  CerrarCajaDto,
  RegistrarVentaDto,
  RegistrarRetiroDto,
  ReporteCierreCajaDto,
} from '../../aplicacion/dto/crear-caja.dto';
import { JwtAuthGuard } from '../../../autenticacion/aplicacion/guards/jwt-auth.guard';
import { RolesGuard } from '../../../autenticacion/aplicacion/guards/roles.guard';
import { Roles } from '../../../autenticacion/aplicacion/decorators/roles.decorator';
import { RolUsuario } from '../../../autenticacion/dominio/enums/rol-usuario.enum';

/**
 * Controlador para la gestión de cajas del punto de venta
 * Proporciona endpoints para operaciones de caja: crear, abrir, cerrar, ventas, retiros, etc.
 */
@ApiTags('Punto de Venta - Cajas')
@ApiBearerAuth()
@Controller('api/v1/punto-venta/cajas')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CajasController {
  constructor(private readonly cajasService: CajasService) {}

  /**
   * Crear una nueva caja
   */
  @Post()
  @Roles(RolUsuario.ADMIN, RolUsuario.GERENTE, RolUsuario.SUPERVISOR)
  @ApiOperation({ 
    summary: 'Crear una nueva caja',
    description: 'Crea una nueva caja en el sistema de punto de venta. Requiere permisos de administrador, gerente o supervisor.'
  })
  @ApiBody({ type: CrearCajaDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Caja creada exitosamente',
    type: CrearCajaRespuestaDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Datos de entrada inválidos',
    schema: {
      example: {
        mensaje: 'Los datos de entrada son inválidos',
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: 400
      }
    }
  })
  @ApiResponse({ 
    status: 409, 
    description: 'Conflicto - Límite de cajas alcanzado o sucursal inactiva',
    schema: {
      example: {
        mensaje: 'La sucursal ha alcanzado el límite máximo de cajas permitidas',
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: 409
      }
    }
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async crearCaja(@Body() crearCajaDto: CrearCajaDto): Promise<CrearCajaRespuestaDto> {
    return await this.cajasService.crearCaja(crearCajaDto);
  }

  /**
   * Obtener lista de cajas con filtros
   */
  @Get()
  @Roles(RolUsuario.ADMIN, RolUsuario.GERENTE, RolUsuario.SUPERVISOR, RolUsuario.CAJERO)
  @ApiOperation({ 
    summary: 'Obtener lista de cajas',
    description: 'Obtiene una lista paginada de cajas con filtros opcionales. Disponible para administradores, gerentes, supervisores y cajeros.'
  })
  @ApiQuery({ name: 'sucursal_id', required: false, description: 'Filtrar por ID de sucursal' })
  @ApiQuery({ name: 'estado', required: false, description: 'Filtrar por estado de caja (ABIERTA, CERRADA, SUSPENDIDA)' })
  @ApiQuery({ name: 'usuario_apertura_id', required: false, description: 'Filtrar por ID de usuario que abrió la caja' })
  @ApiQuery({ name: 'fecha_apertura_desde', required: false, description: 'Filtrar desde fecha de apertura (YYYY-MM-DD)' })
  @ApiQuery({ name: 'fecha_apertura_hasta', required: false, description: 'Filtrar hasta fecha de apertura (YYYY-MM-DD)' })
  @ApiQuery({ name: 'pagina', required: false, description: 'Número de página (default: 1)' })
  @ApiQuery({ name: 'limite', required: false, description: 'Límite de resultados por página (default: 10)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de cajas obtenida exitosamente',
    type: ListaCajasRespuestaDto
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Error interno del servidor',
    schema: {
      example: {
        mensaje: 'Error interno del servidor al obtener cajas',
        data: null,
        tipo_mensaje: 'ErrorServidor',
        estado_respuesta: 500
      }
    }
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async obtenerCajas(@Query() filtros: FiltrosCajaDto): Promise<ListaCajasRespuestaDto> {
    return await this.cajasService.obtenerCajas(filtros);
  }

  /**
   * Obtener caja por ID
   */
  @Get(':id')
  @Roles(RolUsuario.ADMIN, RolUsuario.GERENTE, RolUsuario.SUPERVISOR, RolUsuario.CAJERO)
  @ApiOperation({ 
    summary: 'Obtener caja por ID',
    description: 'Obtiene los detalles de una caja específica por su ID. Disponible para administradores, gerentes, supervisores y cajeros.'
  })
  @ApiParam({ name: 'id', description: 'ID único de la caja' })
  @ApiResponse({ 
    status: 200, 
    description: 'Caja encontrada exitosamente',
    type: CrearCajaRespuestaDto
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Caja no encontrada',
    schema: {
      example: {
        mensaje: 'Caja no encontrada',
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: 404
      }
    }
  })
  async obtenerCajaPorId(@Param('id') id: string): Promise<CrearCajaRespuestaDto> {
    return await this.cajasService.obtenerCajaPorId(id);
  }

  /**
   * Abrir una caja
   */
  @Put(':id/abrir')
  @Roles(RolUsuario.ADMIN, RolUsuario.GERENTE, RolUsuario.SUPERVISOR, RolUsuario.CAJERO)
  @ApiOperation({ 
    summary: 'Abrir una caja',
    description: 'Abre una caja para comenzar operaciones. Requiere saldo inicial y usuario que abre la caja.'
  })
  @ApiParam({ name: 'id', description: 'ID único de la caja' })
  @ApiBody({ type: AbrirCajaDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Caja abierta exitosamente',
    type: CrearCajaRespuestaDto
  })
  @ApiResponse({ 
    status: 409, 
    description: 'La caja ya está abierta',
    schema: {
      example: {
        mensaje: 'La caja ya está abierta',
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: 409
      }
    }
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async abrirCaja(
    @Param('id') id: string, 
    @Body() abrirCajaDto: AbrirCajaDto
  ): Promise<CrearCajaRespuestaDto> {
    return await this.cajasService.abrirCaja(id, abrirCajaDto);
  }

  /**
   * Cerrar una caja
   */
  @Put(':id/cerrar')
  @Roles(RolUsuario.ADMIN, RolUsuario.GERENTE, RolUsuario.SUPERVISOR, RolUsuario.CAJERO)
  @ApiOperation({ 
    summary: 'Cerrar una caja',
    description: 'Cierra una caja para finalizar operaciones del día. Genera reporte de cierre automáticamente.'
  })
  @ApiParam({ name: 'id', description: 'ID único de la caja' })
  @ApiBody({ type: CerrarCajaDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Caja cerrada exitosamente',
    type: CrearCajaRespuestaDto
  })
  @ApiResponse({ 
    status: 409, 
    description: 'La caja no está abierta',
    schema: {
      example: {
        mensaje: 'La caja no está abierta, no se puede cerrar',
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: 409
      }
    }
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async cerrarCaja(
    @Param('id') id: string, 
    @Body() cerrarCajaDto: CerrarCajaDto
  ): Promise<CrearCajaRespuestaDto> {
    return await this.cajasService.cerrarCaja(id, cerrarCajaDto);
  }

  /**
   * Registrar venta en caja
   */
  @Put(':id/registrar-venta')
  @Roles(RolUsuario.ADMIN, RolUsuario.GERENTE, RolUsuario.SUPERVISOR, RolUsuario.CAJERO)
  @ApiOperation({ 
    summary: 'Registrar venta en caja',
    description: 'Registra una venta en la caja, actualizando el saldo actual. Solo funciona en cajas abiertas.'
  })
  @ApiParam({ name: 'id', description: 'ID único de la caja' })
  @ApiBody({ type: RegistrarVentaDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Venta registrada exitosamente',
    type: CrearCajaRespuestaDto
  })
  @ApiResponse({ 
    status: 409, 
    description: 'No se pueden registrar ventas en cajas cerradas o suspendidas',
    schema: {
      example: {
        mensaje: 'No se pueden registrar ventas en cajas cerradas',
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: 409
      }
    }
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async registrarVenta(
    @Param('id') id: string, 
    @Body() registrarVentaDto: RegistrarVentaDto
  ): Promise<CrearCajaRespuestaDto> {
    return await this.cajasService.registrarVenta(id, registrarVentaDto);
  }

  /**
   * Registrar retiro de caja
   */
  @Put(':id/registrar-retiro')
  @Roles(RolUsuario.ADMIN, RolUsuario.GERENTE, RolUsuario.SUPERVISOR, RolUsuario.CAJERO)
  @ApiOperation({ 
    summary: 'Registrar retiro de caja',
    description: 'Registra un retiro de efectivo de la caja. Solo funciona en cajas abiertas y con saldo suficiente.'
  })
  @ApiParam({ name: 'id', description: 'ID único de la caja' })
  @ApiBody({ type: RegistrarRetiroDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Retiro registrado exitosamente',
    type: CrearCajaRespuestaDto
  })
  @ApiResponse({ 
    status: 409, 
    description: 'Saldo insuficiente o caja no abierta',
    schema: {
      example: {
        mensaje: 'Saldo insuficiente para realizar el retiro',
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: 409
      }
    }
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async registrarRetiro(
    @Param('id') id: string, 
    @Body() registrarRetiroDto: RegistrarRetiroDto
  ): Promise<CrearCajaRespuestaDto> {
    return await this.cajasService.registrarRetiro(id, registrarRetiroDto);
  }

  /**
   * Suspender caja temporalmente
   */
  @Put(':id/suspender')
  @Roles(RolUsuario.ADMIN, RolUsuario.GERENTE, RolUsuario.SUPERVISOR)
  @ApiOperation({ 
    summary: 'Suspender caja temporalmente',
    description: 'Suspende una caja temporalmente, impidiendo nuevas operaciones. Solo disponible para cajas abiertas.'
  })
  @ApiParam({ name: 'id', description: 'ID único de la caja' })
  @ApiResponse({ 
    status: 200, 
    description: 'Caja suspendida exitosamente',
    type: CrearCajaRespuestaDto
  })
  @ApiResponse({ 
    status: 409, 
    description: 'Solo se pueden suspender cajas abiertas',
    schema: {
      example: {
        mensaje: 'Solo se pueden suspender cajas abiertas',
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: 409
      }
    }
  })
  async suspenderCaja(@Param('id') id: string): Promise<CrearCajaRespuestaDto> {
    return await this.cajasService.suspenderCaja(id);
  }

  /**
   * Reanudar caja suspendida
   */
  @Put(':id/reanudar')
  @Roles(RolUsuario.ADMIN, RolUsuario.GERENTE, RolUsuario.SUPERVISOR)
  @ApiOperation({ 
    summary: 'Reanudar caja suspendida',
    description: 'Reanuda una caja que estaba suspendida, permitiendo continuar con las operaciones.'
  })
  @ApiParam({ name: 'id', description: 'ID único de la caja' })
  @ApiResponse({ 
    status: 200, 
    description: 'Caja reanudada exitosamente',
    type: CrearCajaRespuestaDto
  })
  @ApiResponse({ 
    status: 409, 
    description: 'Solo se pueden reanudar cajas suspendidas',
    schema: {
      example: {
        mensaje: 'Solo se pueden reanudar cajas suspendidas',
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: 409
      }
    }
  })
  async reanudarCaja(@Param('id') id: string): Promise<CrearCajaRespuestaDto> {
    return await this.cajasService.reanudarCaja(id);
  }

  /**
   * Obtener cajas por sucursal
   */
  @Get('sucursal/:sucursal_id')
  @Roles(RolUsuario.ADMIN, RolUsuario.GERENTE, RolUsuario.SUPERVISOR, RolUsuario.CAJERO)
  @ApiOperation({ 
    summary: 'Obtener cajas por sucursal',
    description: 'Obtiene todas las cajas asociadas a una sucursal específica.'
  })
  @ApiParam({ name: 'sucursal_id', description: 'ID único de la sucursal' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de cajas por sucursal obtenida exitosamente',
    type: ListaCajasRespuestaDto
  })
  async obtenerCajasPorSucursal(@Param('sucursal_id') sucursal_id: string): Promise<ListaCajasRespuestaDto> {
    return await this.cajasService.obtenerCajasPorSucursal(sucursal_id);
  }

  /**
   * Obtener cajas abiertas por sucursal
   */
  @Get('sucursal/:sucursal_id/abiertas')
  @Roles(RolUsuario.ADMIN, RolUsuario.GERENTE, RolUsuario.SUPERVISOR, RolUsuario.CAJERO)
  @ApiOperation({ 
    summary: 'Obtener cajas abiertas por sucursal',
    description: 'Obtiene todas las cajas abiertas asociadas a una sucursal específica.'
  })
  @ApiParam({ name: 'sucursal_id', description: 'ID único de la sucursal' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de cajas abiertas por sucursal obtenida exitosamente',
    type: ListaCajasRespuestaDto
  })
  async obtenerCajasAbiertasPorSucursal(@Param('sucursal_id') sucursal_id: string): Promise<ListaCajasRespuestaDto> {
    return await this.cajasService.obtenerCajasAbiertasPorSucursal(sucursal_id);
  }

  /**
   * Obtener estadísticas de cajas por sucursal
   */
  @Get('sucursal/:sucursal_id/estadisticas')
  @Roles(RolUsuario.ADMIN, RolUsuario.GERENTE, RolUsuario.SUPERVISOR)
  @ApiOperation({ 
    summary: 'Obtener estadísticas de cajas por sucursal',
    description: 'Obtiene estadísticas detalladas de todas las cajas de una sucursal: totales, promedios, etc.'
  })
  @ApiParam({ name: 'sucursal_id', description: 'ID único de la sucursal' })
  @ApiResponse({ 
    status: 200, 
    description: 'Estadísticas obtenidas exitosamente',
    schema: {
      example: {
        mensaje: 'Estadísticas obtenidas exitosamente',
        data: {
          total_cajas: 5,
          cajas_abiertas: 2,
          cajas_cerradas: 2,
          cajas_suspendidas: 1,
          total_ventas_dia: 15000.50,
          promedio_ventas_por_caja: 7500.25,
          diferencia_total: 250.75
        },
        tipo_mensaje: 'Exito',
        estado_respuesta: 200
      }
    }
  })
  async obtenerEstadisticasPorSucursal(@Param('sucursal_id') sucursal_id: string) {
    return await this.cajasService.obtenerEstadisticasPorSucursal(sucursal_id);
  }

  /**
   * Obtener reporte de cierre de caja
   */
  @Get(':id/reporte-cierre')
  @Roles(RolUsuario.ADMIN, RolUsuario.GERENTE, RolUsuario.SUPERVISOR, RolUsuario.CAJERO)
  @ApiOperation({ 
    summary: 'Obtener reporte de cierre de caja',
    description: 'Genera y obtiene el reporte detallado de cierre de una caja específica.'
  })
  @ApiParam({ name: 'id', description: 'ID único de la caja' })
  @ApiResponse({ 
    status: 200, 
    description: 'Reporte de cierre obtenido exitosamente',
    type: ReporteCierreCajaDto
  })
  async obtenerReporteCierre(@Param('id') id: string) {
    return await this.cajasService.obtenerReporteCierre(id);
  }

  /**
   * Obtener historial de operaciones de caja
   */
  @Get(':id/historial-operaciones')
  @Roles(RolUsuario.ADMIN, RolUsuario.GERENTE, RolUsuario.SUPERVISOR)
  @ApiOperation({ 
    summary: 'Obtener historial de operaciones de caja',
    description: 'Obtiene el historial completo de operaciones (ventas, retiros) de una caja específica.'
  })
  @ApiParam({ name: 'id', description: 'ID único de la caja' })
  @ApiQuery({ name: 'fecha_desde', required: false, description: 'Fecha desde para filtrar (YYYY-MM-DD)' })
  @ApiQuery({ name: 'fecha_hasta', required: false, description: 'Fecha hasta para filtrar (YYYY-MM-DD)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Historial de operaciones obtenido exitosamente',
    schema: {
      example: {
        mensaje: 'Historial de operaciones obtenido exitosamente',
        data: [
          {
            tipo: 'VENTA',
            monto: 150.50,
            fecha: '2024-01-15T10:30:00Z',
            descripcion: 'Venta de productos varios'
          },
          {
            tipo: 'RETIRO',
            monto: 50.00,
            fecha: '2024-01-15T12:15:00Z',
            descripcion: 'Retiro para cambio'
          }
        ],
        tipo_mensaje: 'Exito',
        estado_respuesta: 200
      }
    }
  })
  async obtenerHistorialOperaciones(
    @Param('id') id: string,
    @Query('fecha_desde') fecha_desde?: string,
    @Query('fecha_hasta') fecha_hasta?: string
  ) {
    const fechaDesde = fecha_desde ? new Date(fecha_desde) : undefined;
    const fechaHasta = fecha_hasta ? new Date(fecha_hasta) : undefined;
    
    return await this.cajasService.obtenerHistorialOperaciones(id, fechaDesde, fechaHasta);
  }

  /**
   * Eliminar caja (solo para administradores)
   */
  @Delete(':id')
  @Roles(RolUsuario.ADMIN)
  @HttpCode(200)
  @ApiOperation({ 
    summary: 'Eliminar caja',
    description: 'Elimina permanentemente una caja del sistema. Solo disponible para administradores.'
  })
  @ApiParam({ name: 'id', description: 'ID único de la caja' })
  @ApiResponse({ 
    status: 200, 
    description: 'Caja eliminada exitosamente',
    schema: {
      example: {
        mensaje: 'Caja eliminada exitosamente',
        data: null,
        tipo_mensaje: 'Exito',
        estado_respuesta: 200
      }
    }
  })
  @ApiResponse({ 
    status: 409, 
    description: 'No se puede eliminar una caja abierta',
    schema: {
      example: {
        mensaje: 'No se puede eliminar una caja abierta',
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: 409
      }
    }
  })
  async eliminarCaja(@Param('id') id: string): Promise<CrearCajaRespuestaDto> {
    // En una implementación real, aquí se llamaría a un servicio de eliminación
    // Por ahora, retornamos un mensaje de éxito simulado
    return {
      mensaje: 'Caja eliminada exitosamente',
      data: null,
      tipo_mensaje: 'Exito',
      estado_respuesta: 200,
    };
  }
}