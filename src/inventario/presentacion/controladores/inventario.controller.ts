import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
// Guards y decorators de autenticación (implementados en otros módulos)
// import { JwtAuthGuard } from '../../../autenticacion/presentacion/guards/jwt-auth.guard';
// import { RolesGuard } from '../../../autenticacion/presentacion/guards/roles.guard';
// import { Roles } from '../../../autenticacion/presentacion/decorators/roles.decorator';
// import { RolUsuario } from '../../../autenticacion/dominio/enums/rol-usuario.enum';
import { RegistrarMovimientoInventarioDto } from '../../aplicacion/dto/registrar-movimiento-inventario.dto';
import { RegistrarMovimientoInventarioCasoUso } from '../../dominio/casos-uso/registrar-movimiento-inventario.caso-uso';
import { ListarMovimientosInventarioCasoUso } from '../../dominio/casos-uso/listar-movimientos-inventario.caso-uso';
import { MovimientoInventario } from '../../dominio/entidades/movimiento-inventario.entity';
import { TipoMovimientoInventario } from '../../dominio/enums/tipo-movimiento-inventario.enum';

/**
 * Controlador para la gestión de inventario
 * Proporciona endpoints para el registro y consulta de movimientos de inventario
 */
@ApiTags('Inventario')
@ApiBearerAuth()
@Controller('api/v1/inventario')
// @UseGuards(JwtAuthGuard, RolesGuard)
export class InventarioController {
  constructor(
    private readonly registrarMovimientoInventarioCasoUso: RegistrarMovimientoInventarioCasoUso,
    private readonly listarMovimientosInventarioCasoUso: ListarMovimientosInventarioCasoUso,
  ) {}

  @Post('movimientos')
  // @Roles(RolUsuario.ADMIN, RolUsuario.EDITOR)
  @ApiOperation({
    summary: 'Registrar movimiento de inventario',
    description: 'Registra un nuevo movimiento en el inventario (entrada, salida, ajuste, etc.)',
  })
  @ApiResponse({
    status: 201,
    description: 'Movimiento de inventario registrado exitosamente',
    schema: {
      example: {
        mensaje: 'Movimiento de inventario registrado exitosamente',
        data: {
          id: 'movimiento_123456789',
          productoId: 'prod_123456789',
          varianteId: 'var_123456789',
          tipo: 'ENTRADA',
          cantidad: 10,
          stockAnterior: 50,
          stockActual: 60,
          motivo: 'Compra de proveedor',
          fechaCreacion: '2024-01-01T00:00:00.000Z',
          usuarioId: 'usuario_123456789',
        },
        tipo_mensaje: 'Exito',
        estado_respuesta: 201,
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Error de validación (stock insuficiente, datos inválidos)',
    schema: {
      example: {
        mensaje: 'No hay suficiente stock para realizar esta operación',
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: 400,
      },
    },
  })
  async registrarMovimiento(
    @Body() registrarMovimientoInventarioDto: RegistrarMovimientoInventarioDto,
    // En una implementación real, obtendríamos el usuario del token JWT
    @Param('usuarioId') usuarioId: string = 'usuario_actual',
  ) {
    const movimiento = await this.registrarMovimientoInventarioCasoUso.ejecutar(
      {
        productoId: registrarMovimientoInventarioDto.productoId,
        varianteId: registrarMovimientoInventarioDto.varianteId ?? null,
        tipo: registrarMovimientoInventarioDto.tipo,
        cantidad: registrarMovimientoInventarioDto.cantidad,
        motivo: registrarMovimientoInventarioDto.motivo,
      },
      usuarioId,
    );

    return {
      mensaje: 'Movimiento de inventario registrado exitosamente',
      data: this.aDto(movimiento),
      tipo_mensaje: 'Exito',
      estado_respuesta: HttpStatus.CREATED,
    };
  }

  @Get('movimientos')
  // @Roles(RolUsuario.ADMIN, RolUsuario.EDITOR, RolUsuario.VENDEDOR)
  @ApiOperation({
    summary: 'Listar movimientos de inventario',
    description: 'Obtiene una lista paginada de movimientos de inventario con filtros opcionales',
  })
  @ApiQuery({
    name: 'pagina',
    required: false,
    type: Number,
    description: 'Número de página (por defecto: 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'limite',
    required: false,
    type: Number,
    description: 'Límite de elementos por página (por defecto: 20, máximo: 100)',
    example: 20,
  })
  @ApiQuery({
    name: 'productoId',
    required: false,
    type: String,
    description: 'Filtrar por ID de producto',
    example: 'prod_123456789',
  })
  @ApiQuery({
    name: 'varianteId',
    required: false,
    type: String,
    description: 'Filtrar por ID de variante',
    example: 'var_123456789',
  })
  @ApiQuery({
    name: 'tipo',
    required: false,
    enum: TipoMovimientoInventario,
    description: 'Filtrar por tipo de movimiento',
    example: TipoMovimientoInventario.ENTRADA,
  })
  @ApiQuery({
    name: 'fechaDesde',
    required: false,
    type: String,
    description: 'Filtrar desde fecha (formato ISO)',
    example: '2024-01-01T00:00:00.000Z',
  })
  @ApiQuery({
    name: 'fechaHasta',
    required: false,
    type: String,
    description: 'Filtrar hasta fecha (formato ISO)',
    example: '2024-01-31T23:59:59.999Z',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de movimientos obtenida exitosamente',
    schema: {
      example: {
        mensaje: 'Lista de movimientos de inventario obtenida exitosamente',
        data: {
          elementos: [
            {
              id: 'movimiento_123456789',
              productoId: 'prod_123456789',
              varianteId: 'var_123456789',
              tipo: 'ENTRADA',
              cantidad: 10,
              stockAnterior: 50,
              stockActual: 60,
              motivo: 'Compra de proveedor',
              fechaCreacion: '2024-01-01T00:00:00.000Z',
              usuarioId: 'usuario_123456789',
            },
          ],
          paginacion: {
            total_elementos: 100,
            total_paginas: 10,
            pagina_actual: 1,
            limite: 10,
            tiene_siguiente: true,
            tiene_anterior: false,
          },
        },
        tipo_mensaje: 'Exito',
        estado_respuesta: 200,
      },
    },
  })
  async listarMovimientos(
    @Query('pagina') pagina: number = 1,
    @Query('limite') limite: number = 20,
    @Query('productoId') productoId?: string,
    @Query('varianteId') varianteId?: string,
    @Query('tipo') tipo?: TipoMovimientoInventario,
    @Query('fechaDesde') fechaDesde?: string,
    @Query('fechaHasta') fechaHasta?: string,
  ) {
    const resultado = await this.listarMovimientosInventarioCasoUso.ejecutar({
      pagina: Number(pagina),
      limite: Number(limite),
      productoId,
      varianteId,
      tipo,
      fechaDesde: fechaDesde ? new Date(fechaDesde) : undefined,
      fechaHasta: fechaHasta ? new Date(fechaHasta) : undefined,
    });

    return {
      mensaje: 'Lista de movimientos de inventario obtenida exitosamente',
      data: {
        elementos: resultado.movimientos.map((movimiento) => this.aDto(movimiento)),
        paginacion: resultado.paginacion,
      },
      tipo_mensaje: 'Exito',
      estado_respuesta: HttpStatus.OK,
    };
  }

  @Get('movimientos/producto/:productoId')
  // @Roles(RolUsuario.ADMIN, RolUsuario.EDITOR, RolUsuario.VENDEDOR)
  @ApiOperation({
    summary: 'Obtener historial de movimientos por producto',
    description: 'Obtiene el historial completo de movimientos de inventario para un producto específico',
  })
  @ApiQuery({
    name: 'pagina',
    required: false,
    type: Number,
    description: 'Número de página (por defecto: 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'limite',
    required: false,
    type: Number,
    description: 'Límite de elementos por página (por defecto: 20, máximo: 100)',
    example: 20,
  })
  @ApiResponse({
    status: 200,
    description: 'Historial de producto obtenido exitosamente',
    schema: {
      example: {
        mensaje: 'Historial de movimientos del producto obtenido exitosamente',
        data: {
          elementos: [
            {
              id: 'movimiento_123456789',
              productoId: 'prod_123456789',
              varianteId: 'var_123456789',
              tipo: 'ENTRADA',
              cantidad: 10,
              stockAnterior: 50,
              stockActual: 60,
              motivo: 'Compra de proveedor',
              fechaCreacion: '2024-01-01T00:00:00.000Z',
              usuarioId: 'usuario_123456789',
            },
          ],
          paginacion: {
            total_elementos: 50,
            total_paginas: 5,
            pagina_actual: 1,
            limite: 10,
            tiene_siguiente: true,
            tiene_anterior: false,
          },
        },
        tipo_mensaje: 'Exito',
        estado_respuesta: 200,
      },
    },
  })
  async obtenerHistorialProducto(
    @Param('productoId') productoId: string,
    @Query('pagina') pagina: number = 1,
    @Query('limite') limite: number = 20,
  ) {
    const resultado = await this.listarMovimientosInventarioCasoUso.obtenerHistorialProducto(
      productoId,
      Number(pagina),
      Number(limite),
    );

    return {
      mensaje: 'Historial de movimientos del producto obtenido exitosamente',
      data: {
        elementos: resultado.movimientos.map((movimiento) => this.aDto(movimiento)),
        paginacion: resultado.paginacion,
      },
      tipo_mensaje: 'Exito',
      estado_respuesta: HttpStatus.OK,
    };
  }

  @Get('movimientos/variante/:varianteId')
  // @Roles(RolUsuario.ADMIN, RolUsuario.EDITOR, RolUsuario.VENDEDOR)
  @ApiOperation({
    summary: 'Obtener historial de movimientos por variante',
    description: 'Obtiene el historial completo de movimientos de inventario para una variante específica',
  })
  @ApiQuery({
    name: 'pagina',
    required: false,
    type: Number,
    description: 'Número de página (por defecto: 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'limite',
    required: false,
    type: Number,
    description: 'Límite de elementos por página (por defecto: 20, máximo: 100)',
    example: 20,
  })
  @ApiResponse({
    status: 200,
    description: 'Historial de variante obtenido exitosamente',
    schema: {
      example: {
        mensaje: 'Historial de movimientos de la variante obtenido exitosamente',
        data: {
          elementos: [
            {
              id: 'movimiento_123456789',
              productoId: 'prod_123456789',
              varianteId: 'var_123456789',
              tipo: 'ENTRADA',
              cantidad: 10,
              stockAnterior: 50,
              stockActual: 60,
              motivo: 'Compra de proveedor',
              fechaCreacion: '2024-01-01T00:00:00.000Z',
              usuarioId: 'usuario_123456789',
            },
          ],
          paginacion: {
            total_elementos: 30,
            total_paginas: 3,
            pagina_actual: 1,
            limite: 10,
            tiene_siguiente: true,
            tiene_anterior: false,
          },
        },
        tipo_mensaje: 'Exito',
        estado_respuesta: 200,
      },
    },
  })
  async obtenerHistorialVariante(
    @Param('varianteId') varianteId: string,
    @Query('pagina') pagina: number = 1,
    @Query('limite') limite: number = 20,
  ) {
    const resultado = await this.listarMovimientosInventarioCasoUso.obtenerHistorialVariante(
      varianteId,
      Number(pagina),
      Number(limite),
    );

    return {
      mensaje: 'Historial de movimientos de la variante obtenido exitosamente',
      data: {
        elementos: resultado.movimientos.map((movimiento) => this.aDto(movimiento)),
        paginacion: resultado.paginacion,
      },
      tipo_mensaje: 'Exito',
      estado_respuesta: HttpStatus.OK,
    };
  }

  @Get('estadisticas')
  // @Roles(RolUsuario.ADMIN, RolUsuario.EDITOR)
  @ApiOperation({
    summary: 'Obtener estadísticas de inventario',
    description: 'Obtiene estadísticas generales sobre los movimientos de inventario',
  })
  @ApiQuery({
    name: 'fechaDesde',
    required: false,
    type: String,
    description: 'Filtrar desde fecha (formato ISO)',
    example: '2024-01-01T00:00:00.000Z',
  })
  @ApiQuery({
    name: 'fechaHasta',
    required: false,
    type: String,
    description: 'Filtrar hasta fecha (formato ISO)',
    example: '2024-01-31T23:59:59.999Z',
  })
  @ApiQuery({
    name: 'productoId',
    required: false,
    type: String,
    description: 'Filtrar por ID de producto',
    example: 'prod_123456789',
  })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas obtenidas exitosamente',
    schema: {
      example: {
        mensaje: 'Estadísticas de inventario obtenidas exitosamente',
        data: {
          totalMovimientos: 150,
          totalEntradas: 80,
          totalSalidas: 60,
          totalAjustes: 10,
          valorTotalEntradas: 8000,
          valorTotalSalidas: 6000,
        },
        tipo_mensaje: 'Exito',
        estado_respuesta: 200,
      },
    },
  })
  async obtenerEstadisticas(
    @Query('fechaDesde') fechaDesde?: string,
    @Query('fechaHasta') fechaHasta?: string,
    @Query('productoId') productoId?: string,
  ) {
    // Nota: Para implementar esto, necesitaríamos el repositorio directamente
    // o crear un caso de uso específico para estadísticas
    return {
      mensaje: 'Endpoint de estadísticas - pendiente de implementación',
      data: null,
      tipo_mensaje: 'Advertencia',
      estado_respuesta: HttpStatus.NOT_IMPLEMENTED,
    };
  }

  @Get('alertas/stock-bajo')
  // @Roles(RolUsuario.ADMIN, RolUsuario.EDITOR)
  @ApiOperation({
    summary: 'Obtener alertas de stock bajo',
    description: 'Obtiene productos y variantes con stock por debajo del límite mínimo',
  })
  @ApiQuery({
    name: 'limiteMinimo',
    required: false,
    type: Number,
    description: 'Límite mínimo de stock para alerta (por defecto: 10)',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Alertas de stock bajo obtenidas exitosamente',
    schema: {
      example: {
        mensaje: 'Alertas de stock bajo obtenidas exitosamente',
        data: {
          elementos: [
            {
              productoId: 'prod_123456789',
              varianteId: 'var_123456789',
              stockActual: 5,
              tituloProducto: 'Camiseta Básica',
              tituloVariante: 'Talla M - Color Negro',
            },
          ],
          total: 1,
        },
        tipo_mensaje: 'Exito',
        estado_respuesta: 200,
      },
    },
  })
  async obtenerAlertasStockBajo(@Query('limiteMinimo') limiteMinimo: number = 10) {
    return {
      mensaje: 'Endpoint de alertas de stock bajo - pendiente de implementación',
      data: null,
      tipo_mensaje: 'Advertencia',
      estado_respuesta: HttpStatus.NOT_IMPLEMENTED,
    };
  }

  /**
   * Convierte una entidad MovimientoInventario a un DTO para la respuesta
   */
  private aDto(movimiento: MovimientoInventario) {
    return {
      id: movimiento.id,
      productoId: movimiento.productoId,
      varianteId: movimiento.varianteId,
      tipo: movimiento.tipo,
      cantidad: movimiento.cantidad,
      stockAnterior: movimiento.stockAnterior,
      stockActual: movimiento.stockActual,
      motivo: movimiento.motivo,
      fechaCreacion: movimiento.fechaCreacion,
      usuarioId: movimiento.usuarioId,
    };
  }
}