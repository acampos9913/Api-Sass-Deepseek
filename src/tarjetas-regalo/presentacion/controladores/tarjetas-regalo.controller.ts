import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpStatus, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { GestionTarjetasRegaloCasoUso } from '../../dominio/casos-uso/gestion-tarjetas-regalo.caso-uso';
import type {
  CrearTarjetaRegaloDTO,
  ActivarTarjetaRegaloDTO,
  RedimirTarjetaRegaloDTO,
  AjustarSaldoTarjetaRegaloDTO,
  CancelarTarjetaRegaloDTO,
  ReactivarTarjetaRegaloDTO
} from '../../dominio/casos-uso/gestion-tarjetas-regalo.caso-uso';

/**
 * DTO para crear tarjeta de regalo (Swagger)
 */
class CrearTarjetaRegaloSwaggerDTO {
  montoInicial: number;
  tiendaId?: string;
  creadorId: string;
  usuarioId?: string;
  fechaExpiracion?: Date;
  notas?: string;
}

/**
 * DTO para activar tarjeta de regalo (Swagger)
 */
class ActivarTarjetaRegaloSwaggerDTO {
  tarjetaRegaloId: string;
}

/**
 * DTO para redimir tarjeta de regalo (Swagger)
 */
class RedimirTarjetaRegaloSwaggerDTO {
  tarjetaRegaloId: string;
  monto: number;
  ordenId?: string;
  notas?: string;
}

/**
 * DTO para ajustar saldo de tarjeta de regalo (Swagger)
 */
class AjustarSaldoTarjetaRegaloSwaggerDTO {
  tarjetaRegaloId: string;
  nuevoMonto: number;
  motivo: string;
}

/**
 * DTO para cancelar tarjeta de regalo (Swagger)
 */
class CancelarTarjetaRegaloSwaggerDTO {
  tarjetaRegaloId: string;
  motivo: string;
}

/**
 * DTO para reactivar tarjeta de regalo (Swagger)
 */
class ReactivarTarjetaRegaloSwaggerDTO {
  tarjetaRegaloId: string;
}

/**
 * Controlador para la gestión de tarjetas de regalo
 * Expone endpoints REST para operaciones CRUD y de negocio
 */
@ApiTags('tarjetas-regalo')
@Controller('api/v1/tarjetas-regalo')
export class TarjetasRegaloController {
  constructor(private readonly gestionTarjetasRegaloCasoUso: GestionTarjetasRegaloCasoUso) {}

  /**
   * Crea una nueva tarjeta de regalo
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Crear tarjeta de regalo',
    description: 'Crea una nueva tarjeta de regalo en estado INACTIVA'
  })
  @ApiBody({ type: CrearTarjetaRegaloSwaggerDTO })
  @ApiResponse({ 
    status: 201, 
    description: 'Tarjeta de regalo creada exitosamente',
    schema: {
      example: {
        mensaje: 'Tarjeta de regalo creada exitosamente',
        data: {
          id: 'gift-card-123',
          codigo: 'GC-ABC123XYZ',
          montoInicial: 100,
          saldoActual: 100,
          estado: 'INACTIVA',
          fechaCreacion: '2024-01-15T10:30:00Z',
          fechaExpiracion: '2024-12-31T23:59:59Z'
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
        mensaje: 'Errores de validación en la creación de la tarjeta de regalo',
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: 400,
        errores: ['El monto inicial debe ser mayor a 0']
      }
    }
  })
  async crearTarjetaRegalo(@Body() dto: CrearTarjetaRegaloDTO) {
    const resultado = await this.gestionTarjetasRegaloCasoUso.crearTarjetaRegalo(dto);
    
    if (resultado.exito) {
      return {
        mensaje: resultado.mensaje,
        data: resultado.tarjetaRegalo,
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
   * Activa una tarjeta de regalo
   */
  @Put(':id/activar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Activar tarjeta de regalo',
    description: 'Activa una tarjeta de regalo existente'
  })
  @ApiParam({ name: 'id', description: 'ID de la tarjeta de regalo' })
  @ApiBody({ type: ActivarTarjetaRegaloSwaggerDTO })
  @ApiResponse({ 
    status: 200, 
    description: 'Tarjeta de regalo activada exitosamente',
    schema: {
      example: {
        mensaje: 'Tarjeta de regalo activada exitosamente',
        data: {
          id: 'gift-card-123',
          estado: 'ACTIVA',
          fechaActivacion: '2024-01-15T10:30:00Z'
        },
        tipo_mensaje: 'Exito',
        estado_respuesta: 200
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Tarjeta de regalo no encontrada',
    schema: {
      example: {
        mensaje: 'Tarjeta de regalo no encontrada',
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: 404
      }
    }
  })
  async activarTarjetaRegalo(@Param('id') id: string) {
    const dto: ActivarTarjetaRegaloDTO = { tarjetaRegaloId: id };
    const resultado = await this.gestionTarjetasRegaloCasoUso.activarTarjetaRegalo(dto);
    
    if (resultado.exito) {
      return {
        mensaje: resultado.mensaje,
        data: resultado.tarjetaRegalo,
        tipo_mensaje: 'Exito',
        estado_respuesta: HttpStatus.OK
      };
    } else {
      return {
        mensaje: resultado.mensaje,
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: HttpStatus.NOT_FOUND,
        errores: resultado.errores
      };
    }
  }

  /**
   * Redime una tarjeta de regalo
   */
  @Put(':id/redimir')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Redimir tarjeta de regalo',
    description: 'Redime un monto de una tarjeta de regalo activa'
  })
  @ApiParam({ name: 'id', description: 'ID de la tarjeta de regalo' })
  @ApiBody({ type: RedimirTarjetaRegaloSwaggerDTO })
  @ApiResponse({ 
    status: 200, 
    description: 'Tarjeta de regalo redimida exitosamente',
    schema: {
      example: {
        mensaje: 'Tarjeta de regalo redimida exitosamente',
        data: {
          id: 'gift-card-123',
          saldoActual: 50,
          transacciones: [
            {
              tipo: 'REDENCION',
              monto: 50,
              fecha: '2024-01-15T10:30:00Z'
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
    description: 'No se puede redimir la tarjeta de regalo',
    schema: {
      example: {
        mensaje: 'No se puede redimir la tarjeta de regalo',
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: 400,
        errores: ['La tarjeta no está activa, ha expirado o no tiene saldo disponible']
      }
    }
  })
  async redimirTarjetaRegalo(@Param('id') id: string, @Body() dto: Omit<RedimirTarjetaRegaloDTO, 'tarjetaRegaloId'>) {
    const dtoCompleto: RedimirTarjetaRegaloDTO = {
      tarjetaRegaloId: id,
      ...dto
    };
    
    const resultado = await this.gestionTarjetasRegaloCasoUso.redimirTarjetaRegalo(dtoCompleto);
    
    if (resultado.exito) {
      return {
        mensaje: resultado.mensaje,
        data: resultado.tarjetaRegalo,
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
   * Ajusta el saldo de una tarjeta de regalo
   */
  @Put(':id/ajustar-saldo')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Ajustar saldo de tarjeta de regalo',
    description: 'Ajusta el saldo de una tarjeta de regalo'
  })
  @ApiParam({ name: 'id', description: 'ID de la tarjeta de regalo' })
  @ApiBody({ type: AjustarSaldoTarjetaRegaloSwaggerDTO })
  @ApiResponse({ 
    status: 200, 
    description: 'Saldo de tarjeta de regalo ajustado exitosamente',
    schema: {
      example: {
        mensaje: 'Saldo de tarjeta de regalo ajustado exitosamente',
        data: {
          id: 'gift-card-123',
          saldoActual: 150,
          montoInicial: 100
        },
        tipo_mensaje: 'Exito',
        estado_respuesta: 200
      }
    }
  })
  async ajustarSaldoTarjetaRegalo(@Param('id') id: string, @Body() dto: Omit<AjustarSaldoTarjetaRegaloDTO, 'tarjetaRegaloId'>) {
    const dtoCompleto: AjustarSaldoTarjetaRegaloDTO = {
      tarjetaRegaloId: id,
      ...dto
    };
    
    const resultado = await this.gestionTarjetasRegaloCasoUso.ajustarSaldoTarjetaRegalo(dtoCompleto);
    
    if (resultado.exito) {
      return {
        mensaje: resultado.mensaje,
        data: resultado.tarjetaRegalo,
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
   * Cancela una tarjeta de regalo
   */
  @Put(':id/cancelar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Cancelar tarjeta de regalo',
    description: 'Cancela una tarjeta de regalo existente'
  })
  @ApiParam({ name: 'id', description: 'ID de la tarjeta de regalo' })
  @ApiBody({ type: CancelarTarjetaRegaloSwaggerDTO })
  @ApiResponse({ 
    status: 200, 
    description: 'Tarjeta de regalo cancelada exitosamente',
    schema: {
      example: {
        mensaje: 'Tarjeta de regalo cancelada exitosamente',
        data: {
          id: 'gift-card-123',
          estado: 'CANCELADA',
          fechaCancelacion: '2024-01-15T10:30:00Z'
        },
        tipo_mensaje: 'Exito',
        estado_respuesta: 200
      }
    }
  })
  async cancelarTarjetaRegalo(@Param('id') id: string, @Body() dto: Omit<CancelarTarjetaRegaloDTO, 'tarjetaRegaloId'>) {
    const dtoCompleto: CancelarTarjetaRegaloDTO = {
      tarjetaRegaloId: id,
      ...dto
    };
    
    const resultado = await this.gestionTarjetasRegaloCasoUso.cancelarTarjetaRegalo(dtoCompleto);
    
    if (resultado.exito) {
      return {
        mensaje: resultado.mensaje,
        data: resultado.tarjetaRegalo,
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
   * Reactiva una tarjeta de regalo cancelada
   */
  @Put(':id/reactivar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Reactivar tarjeta de regalo',
    description: 'Reactivar una tarjeta de regalo cancelada'
  })
  @ApiParam({ name: 'id', description: 'ID de la tarjeta de regalo' })
  @ApiBody({ type: ReactivarTarjetaRegaloSwaggerDTO })
  @ApiResponse({ 
    status: 200, 
    description: 'Tarjeta de regalo reactivada exitosamente',
    schema: {
      example: {
        mensaje: 'Tarjeta de regalo reactivada exitosamente',
        data: {
          id: 'gift-card-123',
          estado: 'ACTIVA'
        },
        tipo_mensaje: 'Exito',
        estado_respuesta: 200
      }
    }
  })
  async reactivarTarjetaRegalo(@Param('id') id: string) {
    const dto: ReactivarTarjetaRegaloDTO = { tarjetaRegaloId: id };
    const resultado = await this.gestionTarjetasRegaloCasoUso.reactivarTarjetaRegalo(dto);
    
    if (resultado.exito) {
      return {
        mensaje: resultado.mensaje,
        data: resultado.tarjetaRegalo,
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
   * Obtiene una tarjeta de regalo por su ID
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Obtener tarjeta de regalo por ID',
    description: 'Obtiene los detalles de una tarjeta de regalo específica'
  })
  @ApiParam({ name: 'id', description: 'ID de la tarjeta de regalo' })
  @ApiResponse({ 
    status: 200, 
    description: 'Tarjeta de regalo obtenida exitosamente',
    schema: {
      example: {
        mensaje: 'Tarjeta de regalo obtenida exitosamente',
        data: {
          id: 'gift-card-123',
          codigo: 'GC-ABC123XYZ',
          montoInicial: 100,
          saldoActual: 50,
          estado: 'ACTIVA',
          fechaCreacion: '2024-01-15T10:30:00Z'
        },
        tipo_mensaje: 'Exito',
        estado_respuesta: 200
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Tarjeta de regalo no encontrada',
    schema: {
      example: {
        mensaje: 'Tarjeta de regalo no encontrada',
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: 404
      }
    }
  })
  async obtenerTarjetaRegaloPorId(@Param('id') id: string) {
    const tarjetaRegalo = await this.gestionTarjetasRegaloCasoUso.obtenerTarjetaRegaloPorId(id);
    
    if (tarjetaRegalo) {
      return {
        mensaje: 'Tarjeta de regalo obtenida exitosamente',
        data: tarjetaRegalo,
        tipo_mensaje: 'Exito',
        estado_respuesta: HttpStatus.OK
      };
    } else {
      return {
        mensaje: 'Tarjeta de regalo no encontrada',
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: HttpStatus.NOT_FOUND
      };
    }
  }

  /**
   * Busca una tarjeta de regalo por su código
   */
  @Get('buscar/:codigo')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Buscar tarjeta de regalo por código',
    description: 'Busca una tarjeta de regalo utilizando su código único'
  })
  @ApiParam({ name: 'codigo', description: 'Código único de la tarjeta de regalo' })
  @ApiResponse({ 
    status: 200, 
    description: 'Tarjeta de regalo encontrada',
    schema: {
      example: {
        mensaje: 'Tarjeta de regalo encontrada',
        data: {
          id: 'gift-card-123',
          codigo: 'GC-ABC123XYZ',
          saldoActual: 50,
          estado: 'ACTIVA'
        },
        tipo_mensaje: 'Exito',
        estado_respuesta: 200
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Tarjeta de regalo no encontrada',
    schema: {
      example: {
        mensaje: 'Tarjeta de regalo no encontrada',
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: 404
      }
    }
  })
  async buscarTarjetaRegaloPorCodigo(@Param('codigo') codigo: string) {
    const tarjetaRegalo = await this.gestionTarjetasRegaloCasoUso.buscarTarjetaRegaloPorCodigo(codigo);
    
    if (tarjetaRegalo) {
      return {
        mensaje: 'Tarjeta de regalo encontrada',
        data: tarjetaRegalo,
        tipo_mensaje: 'Exito',
        estado_respuesta: HttpStatus.OK
      };
    } else {
      return {
        mensaje: 'Tarjeta de regalo no encontrada',
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: HttpStatus.NOT_FOUND
      };
    }
  }

  /**
   * Lista tarjetas de regalo con filtros opcionales
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Listar tarjetas de regalo',
    description: 'Obtiene una lista paginada de tarjetas de regalo con filtros opcionales'
  })
  @ApiQuery({ name: 'estado', required: false, description: 'Filtrar por estado (ACTIVA, INACTIVA, CANCELADA, EXPIRADA)' })
  @ApiQuery({ name: 'tiendaId', required: false, description: 'Filtrar por ID de tienda' })
  @ApiQuery({ name: 'usuarioId', required: false, description: 'Filtrar por ID de usuario' })
  @ApiQuery({ name: 'pagina', required: false, type: Number, description: 'Número de página (por defecto: 1)' })
  @ApiQuery({ name: 'limite', required: false, type: Number, description: 'Límite por página (por defecto: 10)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de tarjetas de regalo obtenida exitosamente',
    schema: {
      example: {
        mensaje: 'Lista de tarjetas de regalo obtenida exitosamente',
        data: {
          elementos: [
            {
              id: 'gift-card-123',
              codigo: 'GC-ABC123XYZ',
              montoInicial: 100,
              saldoActual: 50,
              estado: 'ACTIVA'
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
  async listarTarjetasRegalo(
    @Query('estado') estado?: string,
    @Query('tiendaId') tiendaId?: string,
    @Query('usuarioId') usuarioId?: string,
    @Query('pagina') pagina: number = 1,
    @Query('limite') limite: number = 10
  ) {
    const filtros: any = {};
    if (estado) filtros.estado = estado;
    if (tiendaId) filtros.tiendaId = tiendaId;
    if (usuarioId) filtros.usuarioId = usuarioId;

    const paginacion = { pagina, limite };
    
    const resultado = await this.gestionTarjetasRegaloCasoUso.listarTarjetasRegalo(filtros, paginacion);
    
    return {
      mensaje: 'Lista de tarjetas de regalo obtenida exitosamente',
      data: {
        elementos: resultado.tarjetas,
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
   * Obtiene el historial de transacciones de una tarjeta de regalo
   */
  @Get(':id/transacciones')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Obtener historial de transacciones',
    description: 'Obtiene el historial completo de transacciones de una tarjeta de regalo'
  })
  @ApiParam({ name: 'id', description: 'ID de la tarjeta de regalo' })
  @ApiResponse({ 
    status: 200, 
    description: 'Historial de transacciones obtenido exitosamente',
    schema: {
      example: {
        mensaje: 'Historial de transacciones obtenido exitosamente',
        data: [
          {
            tipo: 'REDENCION',
            monto: 50,
            fecha: '2024-01-15T10:30:00Z',
            ordenId: 'order-123'
          }
        ],
        tipo_mensaje: 'Exito',
        estado_respuesta: 200
      }
    }
  })
  async obtenerHistorialTransacciones(@Param('id') id: string) {
    const transacciones = await this.gestionTarjetasRegaloCasoUso.obtenerHistorialTransacciones(id);
    
    return {
      mensaje: 'Historial de transacciones obtenido exitosamente',
      data: transacciones,
      tipo_mensaje: 'Exito',
      estado_respuesta: HttpStatus.OK
    };
  }

  /**
   * Verifica el estado de una tarjeta de regalo
   */
  @Get(':id/verificar-estado')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Verificar estado de tarjeta de regalo',
    description: 'Verifica el estado actual de una tarjeta de regalo y actualiza por expiración si es necesario'
  })
  @ApiParam({ name: 'id', description: 'ID de la tarjeta de regalo' })
  @ApiResponse({ 
    status: 200, 
    description: 'Estado de tarjeta de regalo verificado',
    schema: {
      example: {
        mensaje: 'Estado de tarjeta de regalo verificado',
        data: {
          id: 'gift-card-123',
          estado: 'ACTIVA',
          puedeUtilizar: true
        },
        tipo_mensaje: 'Exito',
        estado_respuesta: 200
      }
    }
  })
  async verificarEstadoTarjetaRegalo(@Param('id') id: string) {
    const resultado = await this.gestionTarjetasRegaloCasoUso.verificarEstadoTarjetaRegalo(id);
    
    if (resultado.exito) {
      return {
        mensaje: resultado.mensaje,
        data: resultado.tarjetaRegalo,
        tipo_mensaje: 'Exito',
        estado_respuesta: HttpStatus.OK
      };
    } else {
      return {
        mensaje: resultado.mensaje,
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: HttpStatus.NOT_FOUND,
        errores: resultado.errores
      };
    }
  }

  /**
   * Exporta tarjetas de regalo a CSV
   */
  @Get('exportar/csv')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Exportar tarjetas de regalo a CSV',
    description: 'Exporta las tarjetas de regalo a formato CSV con filtros opcionales'
  })
  @ApiQuery({ name: 'estado', required: false, description: 'Filtrar por estado' })
  @ApiQuery({ name: 'tiendaId', required: false, description: 'Filtrar por ID de tienda' })
  @ApiResponse({ 
    status: 200, 
    description: 'CSV exportado exitosamente',
    schema: {
      example: {
        mensaje: 'CSV exportado exitosamente',
        data: 'codigo,montoInicial,saldoActual,estado\nGC-ABC123XYZ,100,50,ACTIVA',
        tipo_mensaje: 'Exito',
        estado_respuesta: 200
      }
    }
  })
  async exportarTarjetasRegaloCSV(
    @Query('estado') estado?: string,
    @Query('tiendaId') tiendaId?: string
  ) {
    const filtros: any = {};
    if (estado) filtros.estado = estado;
    if (tiendaId) filtros.tiendaId = tiendaId;

    const csvData = await this.gestionTarjetasRegaloCasoUso.exportarTarjetasRegaloCSV(filtros);
    
    return {
      mensaje: 'CSV exportado exitosamente',
      data: csvData,
      tipo_mensaje: 'Exito',
      estado_respuesta: HttpStatus.OK
    };
  }

  /**
   * Importa tarjetas de regalo desde CSV
   */
  @Post('importar/csv')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Importar tarjetas de regalo desde CSV',
    description: 'Importa tarjetas de regalo desde un archivo CSV'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        csvData: { type: 'string', description: 'Datos CSV en formato texto' },
        tiendaId: { type: 'string' },
        usuarioId: { type: 'string' }
      },
      required: ['csvData']
    }
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Tarjetas de regalo importadas exitosamente',
    schema: {
      example: {
        mensaje: 'Tarjetas de regalo importadas exitosamente',
        data: [
          {
            id: 'gift-card-123',
            codigo: 'GC-ABC123XYZ',
            montoInicial: 100,
            estado: 'INACTIVA'
          }
        ],
        tipo_mensaje: 'Exito',
        estado_respuesta: 201
      }
    }
  })
  async importarTarjetasRegaloCSV(
    @Body('csvData') csvData: string,
    @Body('tiendaId') tiendaId?: string,
    @Body('usuarioId') usuarioId?: string
  ) {
    const tarjetasImportadas = await this.gestionTarjetasRegaloCasoUso.importarTarjetasRegaloCSV(
      csvData, 
      tiendaId, 
      usuarioId
    );
    
    return {
      mensaje: 'Tarjetas de regalo importadas exitosamente',
      data: tarjetasImportadas,
      tipo_mensaje: 'Exito',
      estado_respuesta: HttpStatus.CREATED
    };
  }
}