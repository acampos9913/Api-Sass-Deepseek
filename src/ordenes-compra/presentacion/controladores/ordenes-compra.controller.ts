import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpStatus, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { GestionOrdenesCompraCasoUso } from '../../dominio/casos-uso/gestion-ordenes-compra.caso-uso';
import type {
  CrearOrdenCompraDTO,
  ActualizarOrdenCompraDTO,
  RecibirProductosOrdenCompraDTO
} from '../../dominio/casos-uso/gestion-ordenes-compra.caso-uso';

/**
 * DTO para crear orden de compra (Swagger)
 */
class CrearOrdenCompraSwaggerDTO {
  numeroOrden: string;
  proveedorId: string;
  tiendaId: string;
  fechaEsperadaEntrega?: Date;
  notas?: string;
  items: Array<{
    productoId: string;
    cantidadSolicitada: number;
    costoUnitario: number;
  }>;
}

/**
 * DTO para actualizar orden de compra (Swagger)
 */
class ActualizarOrdenCompraSwaggerDTO {
  fechaEsperadaEntrega?: Date;
  notas?: string;
  items?: Array<{
    productoId: string;
    cantidadSolicitada: number;
    costoUnitario: number;
  }>;
}

/**
 * DTO para recibir productos de orden de compra (Swagger)
 */
class RecibirProductosOrdenCompraSwaggerDTO {
  items: Array<{
    itemId: string;
    cantidadRecibida: number;
  }>;
}

/**
 * Controlador para la gestión de órdenes de compra
 * Expone endpoints REST para operaciones CRUD y de negocio
 */
@ApiTags('ordenes-compra')
@Controller('api/v1/ordenes-compra')
export class OrdenesCompraController {
  constructor(private readonly gestionOrdenesCompraCasoUso: GestionOrdenesCompraCasoUso) {}

  /**
   * Crea una nueva orden de compra en estado BORRADOR
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Crear orden de compra',
    description: 'Crea una nueva orden de compra en estado BORRADOR'
  })
  @ApiBody({ type: CrearOrdenCompraSwaggerDTO })
  @ApiResponse({ 
    status: 201, 
    description: 'Orden de compra creada exitosamente',
    schema: {
      example: {
        mensaje: 'Orden de compra creada exitosamente',
        data: {
          id: 'orden-compra-123',
          numeroOrden: 'OC-2024-001',
          estado: 'BORRADOR',
          fechaCreacion: '2024-01-15T10:30:00Z',
          items: [
            {
              productoId: 'prod-123',
              cantidadSolicitada: 10,
              costoUnitario: 25.50
            }
          ]
        },
        tipo_mensaje: 'Exito',
        estado_respuesta: 201
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Error de validación en la creación',
    schema: {
      example: {
        mensaje: 'Errores de validación en la creación de la orden de compra',
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: 400,
        errores: ['El número de orden es requerido']
      }
    }
  })
  async crearOrdenCompra(@Body() dto: CrearOrdenCompraDTO) {
    const resultado = await this.gestionOrdenesCompraCasoUso.crearOrdenCompra(dto);
    
    if (resultado.exito) {
      return {
        mensaje: resultado.mensaje,
        data: resultado.ordenCompra,
        tipo_mensaje: 'Exito',
        estado_respuesta: HttpStatus.CREATED
      };
    } else {
      return {
        mensaje: resultado.mensaje,
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: HttpStatus.BAD_REQUEST,
        errores: resultado.errores
      };
    }
  }

  /**
   * Envía una orden de compra al proveedor
   */
  @Put(':id/enviar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Enviar orden de compra',
    description: 'Envía una orden de compra al proveedor cambiando su estado a ENVIADA'
  })
  @ApiParam({ name: 'id', description: 'ID de la orden de compra' })
  @ApiResponse({
    status: 200,
    description: 'Orden de compra enviada exitosamente',
    schema: {
      example: {
        mensaje: 'Orden de compra enviada exitosamente',
        data: {
          id: 'orden-compra-123',
          estado: 'ENVIADA',
          fechaEnvio: '2024-01-15T10:30:00Z'
        },
        tipo_mensaje: 'Exito',
        estado_respuesta: 200
      }
    }
  })
  async enviarOrdenCompra(@Param('id') id: string) {
    const resultado = await this.gestionOrdenesCompraCasoUso.enviarOrdenCompra(id);
    
    if (resultado.exito) {
      return {
        mensaje: resultado.mensaje,
        data: resultado.ordenCompra,
        tipo_mensaje: 'Exito',
        estado_respuesta: HttpStatus.OK
      };
    } else {
      return {
        mensaje: resultado.mensaje,
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: HttpStatus.BAD_REQUEST,
        errores: resultado.errores
      };
    }
  }

  /**
   * Confirma una orden de compra enviada
   */
  @Put(':id/confirmar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Confirmar orden de compra',
    description: 'Confirma una orden de compra enviada cambiando su estado a CONFIRMADA'
  })
  @ApiParam({ name: 'id', description: 'ID de la orden de compra' })
  @ApiResponse({
    status: 200,
    description: 'Orden de compra confirmada exitosamente',
    schema: {
      example: {
        mensaje: 'Orden de compra confirmada exitosamente',
        data: {
          id: 'orden-compra-123',
          estado: 'CONFIRMADA',
          fechaConfirmacion: '2024-01-16T09:15:00Z'
        },
        tipo_mensaje: 'Exito',
        estado_respuesta: 200
      }
    }
  })
  async confirmarOrdenCompra(@Param('id') id: string) {
    const resultado = await this.gestionOrdenesCompraCasoUso.confirmarOrdenCompra(id);
    
    if (resultado.exito) {
      return {
        mensaje: resultado.mensaje,
        data: resultado.ordenCompra,
        tipo_mensaje: 'Exito',
        estado_respuesta: HttpStatus.OK
      };
    } else {
      return {
        mensaje: resultado.mensaje,
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: HttpStatus.BAD_REQUEST,
        errores: resultado.errores
      };
    }
  }

  /**
   * Recibe productos de una orden de compra
   */
  @Put(':id/recibir')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Recibir productos de orden de compra',
    description: 'Registra la recepción de productos de una orden de compra'
  })
  @ApiParam({ name: 'id', description: 'ID de la orden de compra' })
  @ApiBody({ type: RecibirProductosOrdenCompraSwaggerDTO })
  @ApiResponse({
    status: 200,
    description: 'Productos recibidos exitosamente',
    schema: {
      example: {
        mensaje: 'Productos recibidos exitosamente',
        data: {
          id: 'orden-compra-123',
          estado: 'PARCIALMENTE_RECIBIDA',
          items: [
            {
              productoId: 'prod-123',
              cantidadSolicitada: 10,
              cantidadRecibida: 8,
              pendiente: 2
            }
          ]
        },
        tipo_mensaje: 'Exito',
        estado_respuesta: 200
      }
    }
  })
  async recibirProductosOrdenCompra(@Param('id') id: string, @Body() dto: RecibirProductosOrdenCompraDTO) {
    const resultado = await this.gestionOrdenesCompraCasoUso.recibirProductosOrdenCompra(id, dto);
    
    if (resultado.exito) {
      return {
        mensaje: resultado.mensaje,
        data: resultado.ordenCompra,
        tipo_mensaje: 'Exito',
        estado_respuesta: HttpStatus.OK
      };
    } else {
      return {
        mensaje: resultado.mensaje,
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: HttpStatus.BAD_REQUEST,
        errores: resultado.errores
      };
    }
  }

  /**
   * Completa la recepción de una orden de compra
   */
  @Put(':id/completar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Completar orden de compra',
    description: 'Completa la recepción de una orden de compra'
  })
  @ApiParam({ name: 'id', description: 'ID de la orden de compra' })
  @ApiResponse({
    status: 200,
    description: 'Orden de compra completada exitosamente',
    schema: {
      example: {
        mensaje: 'Orden de compra completada exitosamente',
        data: {
          id: 'orden-compra-123',
          estado: 'COMPLETADA',
          fechaCompletacion: '2024-01-15T10:30:00Z'
        },
        tipo_mensaje: 'Exito',
        estado_respuesta: 200
      }
    }
  })
  async completarOrdenCompra(@Param('id') id: string) {
    const resultado = await this.gestionOrdenesCompraCasoUso.completarOrdenCompra(id);
    
    if (resultado.exito) {
      return {
        mensaje: resultado.mensaje,
        data: resultado.ordenCompra,
        tipo_mensaje: 'Exito',
        estado_respuesta: HttpStatus.OK
      };
    } else {
      return {
        mensaje: resultado.mensaje,
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: HttpStatus.BAD_REQUEST,
        errores: resultado.errores
      };
    }
  }

  /**
   * Cancela una orden de compra
   */
  @Put(':id/cancelar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Cancelar orden de compra',
    description: 'Cancela una orden de compra existente'
  })
  @ApiParam({ name: 'id', description: 'ID de la orden de compra' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        motivo: { type: 'string' }
      },
      required: ['motivo']
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Orden de compra cancelada exitosamente',
    schema: {
      example: {
        mensaje: 'Orden de compra cancelada exitosamente',
        data: {
          id: 'orden-compra-123',
          estado: 'CANCELADA',
          fechaCancelacion: '2024-01-15T10:30:00Z',
          motivo: 'Proveedor no disponible'
        },
        tipo_mensaje: 'Exito',
        estado_respuesta: 200
      }
    }
  })
  async cancelarOrdenCompra(@Param('id') id: string, @Body('motivo') motivo: string) {
    const resultado = await this.gestionOrdenesCompraCasoUso.cancelarOrdenCompra(id, motivo);
    
    if (resultado.exito) {
      return {
        mensaje: resultado.mensaje,
        data: resultado.ordenCompra,
        tipo_mensaje: 'Exito',
        estado_respuesta: HttpStatus.OK
      };
    } else {
      return {
        mensaje: resultado.mensaje,
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: HttpStatus.BAD_REQUEST,
        errores: resultado.errores
      };
    }
  }

  /**
   * Obtiene una orden de compra por su ID
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Obtener orden de compra por ID',
    description: 'Obtiene los detalles de una orden de compra específica'
  })
  @ApiParam({ name: 'id', description: 'ID de la orden de compra' })
  @ApiResponse({ 
    status: 200, 
    description: 'Orden de compra obtenida exitosamente',
    schema: {
      example: {
        mensaje: 'Orden de compra obtenida exitosamente',
        data: {
          id: 'orden-compra-123',
          numeroOrden: 'OC-2024-001',
          estado: 'ENVIADA',
          fechaCreacion: '2024-01-15T10:30:00Z',
          items: [
            {
              productoId: 'prod-123',
              cantidadSolicitada: 10,
              cantidadRecibida: 0,
              costoUnitario: 25.50
            }
          ]
        },
        tipo_mensaje: 'Exito',
        estado_respuesta: 200
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Orden de compra no encontrada',
    schema: {
      example: {
        mensaje: 'Orden de compra no encontrada',
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: 404
      }
    }
  })
  async obtenerOrdenCompraPorId(@Param('id') id: string) {
    const ordenCompra = await this.gestionOrdenesCompraCasoUso.obtenerOrdenCompraPorId(id);
    
    if (ordenCompra) {
      return {
        mensaje: 'Orden de compra obtenida exitosamente',
        data: ordenCompra,
        tipo_mensaje: 'Exito',
        estado_respuesta: HttpStatus.OK
      };
    } else {
      return {
        mensaje: 'Orden de compra no encontrada',
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: HttpStatus.NOT_FOUND
      };
    }
  }

  /**
   * Lista órdenes de compra con filtros opcionales
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Listar órdenes de compra',
    description: 'Obtiene una lista paginada de órdenes de compra con filtros opcionales'
  })
  @ApiQuery({ name: 'estado', required: false, description: 'Filtrar por estado (BORRADOR, ENVIADA, CONFIRMADA, PARCIALMENTE_RECIBIDA, COMPLETADA, CANCELADA)' })
  @ApiQuery({ name: 'proveedorId', required: false, description: 'Filtrar por ID de proveedor' })
  @ApiQuery({ name: 'tiendaId', required: false, description: 'Filtrar por ID de tienda' })
  @ApiQuery({ name: 'fechaDesde', required: false, description: 'Filtrar por fecha de creación desde' })
  @ApiQuery({ name: 'fechaHasta', required: false, description: 'Filtrar por fecha de creación hasta' })
  @ApiQuery({ name: 'pagina', required: false, type: Number, description: 'Número de página (por defecto: 1)' })
  @ApiQuery({ name: 'limite', required: false, type: Number, description: 'Límite por página (por defecto: 10)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de órdenes de compra obtenida exitosamente',
    schema: {
      example: {
        mensaje: 'Lista de órdenes de compra obtenida exitosamente',
        data: {
          elementos: [
            {
              id: 'orden-compra-123',
              numeroOrden: 'OC-2024-001',
              estado: 'ENVIADA',
              fechaCreacion: '2024-01-15T10:30:00Z'
            }
          ],
          paginacion: {
            total_elementos: 100,
            total_paginas: 10,
            pagina_actual: 1,
            limite: 10
          }
        },
        tipo_mensaje: 'Exito',
        estado_respuesta: 200
      }
    }
  })
  async listarOrdenesCompra(
    @Query('estado') estado?: string,
    @Query('proveedorId') proveedorId?: string,
    @Query('tiendaId') tiendaId?: string,
    @Query('fechaDesde') fechaDesde?: string,
    @Query('fechaHasta') fechaHasta?: string,
    @Query('pagina') pagina: number = 1,
    @Query('limite') limite: number = 10
  ) {
    const filtros: any = {};
    if (estado) filtros.estado = estado;
    if (proveedorId) filtros.proveedorId = proveedorId;
    if (tiendaId) filtros.tiendaId = tiendaId;
    if (fechaDesde) filtros.fechaDesde = new Date(fechaDesde);
    if (fechaHasta) filtros.fechaHasta = new Date(fechaHasta);

    const paginacion = { pagina, limite };
    
    const resultado = await this.gestionOrdenesCompraCasoUso.listarOrdenesCompra(filtros, paginacion);
    
    return {
      mensaje: 'Lista de órdenes de compra obtenida exitosamente',
      data: {
        elementos: resultado.ordenes,
        paginacion: {
          total_elementos: resultado.total,
          total_paginas: Math.ceil(resultado.total / limite),
          pagina_actual: pagina,
          limite: limite
        }
      },
      tipo_mensaje: 'Exito',
      estado_respuesta: HttpStatus.OK
    };
  }

  /**
   * Exporta órdenes de compra a CSV
   */
  @Get('exportar/csv')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Exportar órdenes de compra a CSV',
    description: 'Exporta las órdenes de compra a formato CSV con filtros opcionales'
  })
  @ApiQuery({ name: 'estado', required: false, description: 'Filtrar por estado' })
  @ApiQuery({ name: 'proveedorId', required: false, description: 'Filtrar por ID de proveedor' })
  @ApiQuery({ name: 'tiendaId', required: false, description: 'Filtrar por ID de tienda' })
  @ApiResponse({ 
    status: 200, 
    description: 'CSV exportado exitosamente',
    schema: {
      example: {
        mensaje: 'CSV exportado exitosamente',
        data: 'numeroOrden,estado,fechaCreacion\nOC-2024-001,ENVIADA,2024-01-15',
        tipo_mensaje: 'Exito',
        estado_respuesta: 200
      }
    }
  })
  async exportarOrdenesCompraCSV(
    @Query('estado') estado?: string,
    @Query('proveedorId') proveedorId?: string,
    @Query('tiendaId') tiendaId?: string
  ) {
    const filtros: any = {};
    if (estado) filtros.estado = estado;
    if (proveedorId) filtros.proveedorId = proveedorId;
    if (tiendaId) filtros.tiendaId = tiendaId;

    const csvData = await this.gestionOrdenesCompraCasoUso.exportarOrdenesCompraCSV(filtros);
    
    return {
      mensaje: 'CSV exportado exitosamente',
      data: csvData,
      tipo_mensaje: 'Exito',
      estado_respuesta: HttpStatus.OK
    };
  }

  /**
   * Importa órdenes de compra desde CSV
   */
  @Post('importar/csv')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Importar órdenes de compra desde CSV',
    description: 'Importa órdenes de compra desde un archivo CSV'
  })
  @ApiBody({ 
    schema: {
      type: 'object',
      properties: {
        csvData: { type: 'string', description: 'Datos CSV en formato texto' },
        tiendaId: { type: 'string' },
        proveedorId: { type: 'string' }
      },
      required: ['csvData']
    }
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Órdenes de compra importadas exitosamente',
    schema: {
      example: {
        mensaje: 'Órdenes de compra importadas exitosamente',
        data: [
          {
            id: 'orden-compra-123',
            numeroOrden: 'OC-2024-001',
            estado: 'BORRADOR'
          }
        ],
        tipo_mensaje: 'Exito',
        estado_respuesta: 201
      }
    }
  })
  async importarOrdenesCompraCSV(
    @Body('csvData') csvData: string,
    @Body('tiendaId') tiendaId?: string,
    @Body('usuarioId') usuarioId?: string
  ) {
    const ordenesImportadas = await this.gestionOrdenesCompraCasoUso.importarOrdenesCompraCSV(
      csvData, 
      tiendaId, 
      usuarioId
    );
    
    return {
      mensaje: 'Órdenes de compra importadas exitosamente',
      data: ordenesImportadas,
      tipo_mensaje: 'Exito',
      estado_respuesta: HttpStatus.CREATED
    };
  }
}