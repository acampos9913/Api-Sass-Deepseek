import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpStatus, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { GestionTransferenciasCasoUso } from '../../dominio/casos-uso/gestion-transferencias.caso-uso';
import type {
  CrearTransferenciaDTO,
  EnviarProductosTransferenciaDTO,
  RecibirProductosTransferenciaDTO
} from '../../dominio/casos-uso/gestion-transferencias.caso-uso';

/**
 * DTO para crear transferencia (Swagger)
 */
class CrearTransferenciaSwaggerDTO {
  numeroTransferencia: string;
  origenId: string;
  destinoId: string;
  fechaEsperadaEnvio?: Date;
  fechaEsperadaRecepcion?: Date;
  notas?: string;
  items: Array<{
    productoId: string;
    cantidadSolicitada: number;
  }>;
}

/**
 * DTO para enviar productos de transferencia (Swagger)
 */
class EnviarProductosTransferenciaSwaggerDTO {
  items: Array<{
    itemId: string;
    cantidadEnviada: number;
  }>;
}

/**
 * DTO para recibir productos de transferencia (Swagger)
 */
class RecibirProductosTransferenciaSwaggerDTO {
  items: Array<{
    itemId: string;
    cantidadRecibida: number;
  }>;
}

/**
 * Controlador para la gestión de transferencias de productos
 * Expone endpoints REST para operaciones CRUD y de negocio
 */
@ApiTags('transferencias')
@Controller('api/v1/transferencias')
export class TransferenciasController {
  constructor(private readonly gestionTransferenciasCasoUso: GestionTransferenciasCasoUso) {}

  /**
   * Crea una nueva transferencia en estado BORRADOR
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Crear transferencia',
    description: 'Crea una nueva transferencia de productos en estado BORRADOR'
  })
  @ApiBody({ type: CrearTransferenciaSwaggerDTO })
  @ApiResponse({ 
    status: 201, 
    description: 'Transferencia creada exitosamente',
    schema: {
      example: {
        mensaje: 'Transferencia creada exitosamente',
        data: {
          id: 'transferencia-123',
          numeroTransferencia: 'TR-2024-001',
          estado: 'BORRADOR',
          fechaCreacion: '2024-01-15T10:30:00Z',
          items: [
            {
              productoId: 'prod-123',
              cantidadSolicitada: 10,
              cantidadEnviada: 0,
              cantidadRecibida: 0
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
        mensaje: 'Errores de validación en la creación de la transferencia',
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: 400,
        errores: ['El número de transferencia es requerido']
      }
    }
  })
  async crearTransferencia(@Body() dto: CrearTransferenciaDTO) {
    const resultado = await this.gestionTransferenciasCasoUso.crearTransferencia(dto);
    
    if (resultado.exito) {
      return {
        mensaje: resultado.mensaje,
        data: resultado.transferencia,
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
   * Envía una transferencia (marca como enviada)
   */
  @Put(':id/enviar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Enviar transferencia',
    description: 'Envía una transferencia cambiando su estado a ENVIADA'
  })
  @ApiParam({ name: 'id', description: 'ID de la transferencia' })
  @ApiResponse({
    status: 200,
    description: 'Transferencia enviada exitosamente',
    schema: {
      example: {
        mensaje: 'Transferencia enviada exitosamente',
        data: {
          id: 'transferencia-123',
          estado: 'ENVIADA',
          fechaEnvio: '2024-01-15T10:30:00Z'
        },
        tipo_mensaje: 'Exito',
        estado_respuesta: 200
      }
    }
  })
  async enviarTransferencia(@Param('id') id: string) {
    const resultado = await this.gestionTransferenciasCasoUso.enviarTransferencia(id);
    
    if (resultado.exito) {
      return {
        mensaje: resultado.mensaje,
        data: resultado.transferencia,
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
   * Envía productos específicos de una transferencia
   */
  @Put(':id/enviar-productos')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Enviar productos de transferencia',
    description: 'Envía productos específicos de una transferencia'
  })
  @ApiParam({ name: 'id', description: 'ID de la transferencia' })
  @ApiBody({ type: EnviarProductosTransferenciaSwaggerDTO })
  @ApiResponse({
    status: 200,
    description: 'Productos enviados exitosamente',
    schema: {
      example: {
        mensaje: 'Productos enviados exitosamente',
        data: {
          id: 'transferencia-123',
          estado: 'ENVIADA',
          items: [
            {
              productoId: 'prod-123',
              cantidadSolicitada: 10,
              cantidadEnviada: 8,
              cantidadRecibida: 0
            }
          ]
        },
        tipo_mensaje: 'Exito',
        estado_respuesta: 200
      }
    }
  })
  async enviarProductosTransferencia(@Param('id') id: string, @Body() dto: EnviarProductosTransferenciaDTO) {
    const resultado = await this.gestionTransferenciasCasoUso.enviarProductosTransferencia(id, dto);
    
    if (resultado.exito) {
      return {
        mensaje: resultado.mensaje,
        data: resultado.transferencia,
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
   * Recibe productos de una transferencia
   */
  @Put(':id/recibir-productos')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Recibir productos de transferencia',
    description: 'Recibe productos de una transferencia'
  })
  @ApiParam({ name: 'id', description: 'ID de la transferencia' })
  @ApiBody({ type: RecibirProductosTransferenciaSwaggerDTO })
  @ApiResponse({
    status: 200,
    description: 'Productos recibidos exitosamente',
    schema: {
      example: {
        mensaje: 'Productos recibidos exitosamente',
        data: {
          id: 'transferencia-123',
          estado: 'PARCIALMENTE_RECIBIDA',
          items: [
            {
              productoId: 'prod-123',
              cantidadSolicitada: 10,
              cantidadEnviada: 8,
              cantidadRecibida: 5
            }
          ]
        },
        tipo_mensaje: 'Exito',
        estado_respuesta: 200
      }
    }
  })
  async recibirProductosTransferencia(@Param('id') id: string, @Body() dto: RecibirProductosTransferenciaDTO) {
    const resultado = await this.gestionTransferenciasCasoUso.recibirProductosTransferencia(id, dto);
    
    if (resultado.exito) {
      return {
        mensaje: resultado.mensaje,
        data: resultado.transferencia,
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
   * Completa la recepción de una transferencia
   */
  @Put(':id/completar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Completar transferencia',
    description: 'Completa la recepción de una transferencia'
  })
  @ApiParam({ name: 'id', description: 'ID de la transferencia' })
  @ApiResponse({
    status: 200,
    description: 'Transferencia completada exitosamente',
    schema: {
      example: {
        mensaje: 'Transferencia completada exitosamente',
        data: {
          id: 'transferencia-123',
          estado: 'COMPLETADA',
          fechaCompletacion: '2024-01-15T10:30:00Z'
        },
        tipo_mensaje: 'Exito',
        estado_respuesta: 200
      }
    }
  })
  async completarTransferencia(@Param('id') id: string) {
    const resultado = await this.gestionTransferenciasCasoUso.completarTransferencia(id);
    
    if (resultado.exito) {
      return {
        mensaje: resultado.mensaje,
        data: resultado.transferencia,
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
   * Cancela una transferencia
   */
  @Put(':id/cancelar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Cancelar transferencia',
    description: 'Cancela una transferencia existente'
  })
  @ApiParam({ name: 'id', description: 'ID de la transferencia' })
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
    description: 'Transferencia cancelada exitosamente',
    schema: {
      example: {
        mensaje: 'Transferencia cancelada exitosamente',
        data: {
          id: 'transferencia-123',
          estado: 'CANCELADA',
          fechaCancelacion: '2024-01-15T10:30:00Z',
          motivo: 'Ubicación destino no disponible'
        },
        tipo_mensaje: 'Exito',
        estado_respuesta: 200
      }
    }
  })
  async cancelarTransferencia(@Param('id') id: string, @Body('motivo') motivo: string) {
    const resultado = await this.gestionTransferenciasCasoUso.cancelarTransferencia(id, motivo);
    
    if (resultado.exito) {
      return {
        mensaje: resultado.mensaje,
        data: resultado.transferencia,
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
   * Obtiene una transferencia por su ID
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Obtener transferencia por ID',
    description: 'Obtiene los detalles de una transferencia específica'
  })
  @ApiParam({ name: 'id', description: 'ID de la transferencia' })
  @ApiResponse({ 
    status: 200, 
    description: 'Transferencia obtenida exitosamente',
    schema: {
      example: {
        mensaje: 'Transferencia obtenida exitosamente',
        data: {
          id: 'transferencia-123',
          numeroTransferencia: 'TR-2024-001',
          estado: 'ENVIADA',
          fechaCreacion: '2024-01-15T10:30:00Z',
          items: [
            {
              productoId: 'prod-123',
              cantidadSolicitada: 10,
              cantidadEnviada: 8,
              cantidadRecibida: 0
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
    description: 'Transferencia no encontrada',
    schema: {
      example: {
        mensaje: 'Transferencia no encontrada',
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: 404
      }
    }
  })
  async obtenerTransferenciaPorId(@Param('id') id: string) {
    const transferencia = await this.gestionTransferenciasCasoUso.obtenerTransferenciaPorId(id);
    
    if (transferencia) {
      return {
        mensaje: 'Transferencia obtenida exitosamente',
        data: transferencia,
        tipo_mensaje: 'Exito',
        estado_respuesta: HttpStatus.OK
      };
    } else {
      return {
        mensaje: 'Transferencia no encontrada',
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: HttpStatus.NOT_FOUND
      };
    }
  }

  /**
   * Lista transferencias con filtros opcionales
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Listar transferencias',
    description: 'Obtiene una lista paginada de transferencias con filtros opcionales'
  })
  @ApiQuery({ name: 'estado', required: false, description: 'Filtrar por estado (BORRADOR, ENVIADA, PARCIALMENTE_RECIBIDA, COMPLETADA, CANCELADA)' })
  @ApiQuery({ name: 'origenId', required: false, description: 'Filtrar por ID de ubicación origen' })
  @ApiQuery({ name: 'destinoId', required: false, description: 'Filtrar por ID de ubicación destino' })
  @ApiQuery({ name: 'fechaDesde', required: false, description: 'Filtrar por fecha de creación desde' })
  @ApiQuery({ name: 'fechaHasta', required: false, description: 'Filtrar por fecha de creación hasta' })
  @ApiQuery({ name: 'pagina', required: false, type: Number, description: 'Número de página (por defecto: 1)' })
  @ApiQuery({ name: 'limite', required: false, type: Number, description: 'Límite por página (por defecto: 10)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de transferencias obtenida exitosamente',
    schema: {
      example: {
        mensaje: 'Lista de transferencias obtenida exitosamente',
        data: {
          elementos: [
            {
              id: 'transferencia-123',
              numeroTransferencia: 'TR-2024-001',
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
  async listarTransferencias(
    @Query('estado') estado?: string,
    @Query('origenId') origenId?: string,
    @Query('destinoId') destinoId?: string,
    @Query('fechaDesde') fechaDesde?: string,
    @Query('fechaHasta') fechaHasta?: string,
    @Query('pagina') pagina: number = 1,
    @Query('limite') limite: number = 10
  ) {
    const filtros: any = {};
    if (estado) filtros.estado = estado;
    if (origenId) filtros.origenId = origenId;
    if (destinoId) filtros.destinoId = destinoId;
    if (fechaDesde) filtros.fechaDesde = new Date(fechaDesde);
    if (fechaHasta) filtros.fechaHasta = new Date(fechaHasta);

    const paginacion = { pagina, limite };
    
    const resultado = await this.gestionTransferenciasCasoUso.listarTransferencias(filtros, paginacion);
    
    return {
      mensaje: 'Lista de transferencias obtenida exitosamente',
      data: {
        elementos: resultado.transferencias,
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
   * Exporta transferencias a CSV
   */
  @Get('exportar/csv')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Exportar transferencias a CSV',
    description: 'Exporta las transferencias a formato CSV con filtros opcionales'
  })
  @ApiQuery({ name: 'estado', required: false, description: 'Filtrar por estado' })
  @ApiQuery({ name: 'origenId', required: false, description: 'Filtrar por ID de ubicación origen' })
  @ApiQuery({ name: 'destinoId', required: false, description: 'Filtrar por ID de ubicación destino' })
  @ApiResponse({ 
    status: 200, 
    description: 'CSV exportado exitosamente',
    schema: {
      example: {
        mensaje: 'CSV exportado exitosamente',
        data: 'numeroTransferencia,estado,fechaCreacion\nTR-2024-001,ENVIADA,2024-01-15',
        tipo_mensaje: 'Exito',
        estado_respuesta: 200
      }
    }
  })
  async exportarTransferenciasCSV(
    @Query('estado') estado?: string,
    @Query('origenId') origenId?: string,
    @Query('destinoId') destinoId?: string
  ) {
    const filtros: any = {};
    if (estado) filtros.estado = estado;
    if (origenId) filtros.origenId = origenId;
    if (destinoId) filtros.destinoId = destinoId;

    const csvData = await this.gestionTransferenciasCasoUso.exportarTransferenciasCSV(filtros);
    
    return {
      mensaje: 'CSV exportado exitosamente',
      data: csvData,
      tipo_mensaje: 'Exito',
      estado_respuesta: HttpStatus.OK
    };
  }

  /**
   * Importa transferencias desde CSV
   */
  @Post('importar/csv')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Importar transferencias desde CSV',
    description: 'Importa transferencias desde un archivo CSV'
  })
  @ApiBody({ 
    schema: {
      type: 'object',
      properties: {
        csvData: { type: 'string', description: 'Datos CSV en formato texto' },
        origenId: { type: 'string' },
        destinoId: { type: 'string' }
      },
      required: ['csvData']
    }
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Transferencias importadas exitosamente',
    schema: {
      example: {
        mensaje: 'Transferencias importadas exitosamente',
        data: [
          {
            id: 'transferencia-123',
            numeroTransferencia: 'TR-2024-001',
            estado: 'BORRADOR'
          }
        ],
        tipo_mensaje: 'Exito',
        estado_respuesta: 201
      }
    }
  })
  async importarTransferenciasCSV(
    @Body('csvData') csvData: string,
    @Body('origenId') origenId?: string,
    @Body('destinoId') destinoId?: string
  ) {
    const transferenciasImportadas = await this.gestionTransferenciasCasoUso.importarTransferenciasCSV(
      csvData, 
      origenId, 
      destinoId
    );
    
    return {
      mensaje: 'Transferencias importadas exitosamente',
      data: transferenciasImportadas,
      tipo_mensaje: 'Exito',
      estado_respuesta: HttpStatus.CREATED
    };
  }
}