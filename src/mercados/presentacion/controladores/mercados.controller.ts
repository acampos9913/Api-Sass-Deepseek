import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
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
import { CrearMercadoDto } from '../../aplicacion/dto/crear-mercado.dto';
import { CrearMercadoCasoUso } from '../../dominio/casos-uso/crear-mercado.caso-uso';
import { ListarMercadosCasoUso, ParametrosListarMercados } from '../../dominio/casos-uso/listar-mercados.caso-uso';
import { Mercado } from '../../dominio/entidades/mercado.entity';
import { EstadoMercado } from '../../dominio/enums/estado-mercado.enum';

/**
 * Controlador para la gestión de mercados/multi-tienda
 * Proporciona endpoints para CRUD completo de mercados
 */
@ApiTags('Mercados')
@ApiBearerAuth()
@Controller('api/v1/mercados')
// @UseGuards(JwtAuthGuard, RolesGuard)
export class MercadosController {
  constructor(
    private readonly crearMercadoCasoUso: CrearMercadoCasoUso,
    private readonly listarMercadosCasoUso: ListarMercadosCasoUso,
  ) {}

  @Post()
  // @Roles(RolUsuario.ADMIN, RolUsuario.EDITOR)
  @ApiOperation({
    summary: 'Crear un nuevo mercado',
    description: 'Crea un nuevo mercado en el sistema con la información proporcionada',
  })
  @ApiResponse({
    status: 201,
    description: 'Mercado creado exitosamente',
    schema: {
      example: {
        mensaje: 'Mercado creado exitosamente',
        data: {
          id: 'mercado_123456789',
          nombre: 'Mercado Perú',
          codigo: 'PE',
          moneda: 'PEN',
          idioma: 'es',
          zonaHoraria: 'America/Lima',
          estado: 'EN_CONFIGURACION',
          activo: true,
          fechaCreacion: '2024-01-01T00:00:00.000Z',
          fechaActualizacion: '2024-01-01T00:00:00.000Z',
          tiendaId: 'tienda_123456789',
          configuracion: {
            impuestos: { iva: 18, igv: 18 },
            envio: { costoEstandar: 15, diasEntrega: 3 },
          },
        },
        tipo_mensaje: 'Exito',
        estado_respuesta: 201,
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Error de validación (código duplicado, datos inválidos)',
    schema: {
      example: {
        mensaje: 'Ya existe un mercado con este código',
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: 400,
      },
    },
  })
  async crear(@Body() crearMercadoDto: CrearMercadoDto) {
    try {
      // Validar el DTO
      const validacion = crearMercadoDto.validar();
      if (!validacion.esValido) {
        return {
          mensaje: `Errores de validación: ${validacion.errores.join(', ')}`,
          data: null,
          tipo_mensaje: 'ErrorCliente',
          estado_respuesta: HttpStatus.BAD_REQUEST,
        };
      }

      const mercado = await this.crearMercadoCasoUso.ejecutar(
        crearMercadoDto.aObjetoCreacion(),
      );

      return {
        mensaje: 'Mercado creado exitosamente',
        data: this.aDto(mercado),
        tipo_mensaje: 'Exito',
        estado_respuesta: HttpStatus.CREATED,
      };
    } catch (error) {
      return {
        mensaje: error.message,
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: HttpStatus.BAD_REQUEST,
      };
    }
  }

  @Get()
  // @Roles(RolUsuario.ADMIN, RolUsuario.EDITOR, RolUsuario.VENDEDOR)
  @ApiOperation({
    summary: 'Listar mercados',
    description: 'Obtiene una lista paginada de mercados con filtros opcionales',
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
    name: 'activo',
    required: false,
    type: Boolean,
    description: 'Filtrar por estado activo/inactivo',
    example: true,
  })
  @ApiQuery({
    name: 'estado',
    required: false,
    enum: EstadoMercado,
    description: 'Filtrar por estado del mercado',
    example: EstadoMercado.ACTIVO,
  })
  @ApiQuery({
    name: 'tiendaId',
    required: false,
    type: String,
    description: 'Filtrar por ID de tienda específica',
    example: 'tienda_123456789',
  })
  @ApiQuery({
    name: 'busqueda',
    required: false,
    type: String,
    description: 'Texto para buscar en nombre o código del mercado',
    example: 'Perú',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de mercados obtenida exitosamente',
    schema: {
      example: {
        mensaje: 'Lista de mercados obtenida exitosamente',
        data: {
          elementos: [
            {
              id: 'mercado_123456789',
              nombre: 'Mercado Perú',
              codigo: 'PE',
              moneda: 'PEN',
              idioma: 'es',
              zonaHoraria: 'America/Lima',
              estado: 'ACTIVO',
              activo: true,
              fechaCreacion: '2024-01-01T00:00:00.000Z',
              fechaActualizacion: '2024-01-01T00:00:00.000Z',
              tiendaId: 'tienda_123456789',
              configuracion: {
                impuestos: { iva: 18, igv: 18 },
              },
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
  async listar(
    @Query('pagina') pagina: number = 1,
    @Query('limite') limite: number = 20,
    @Query('activo') activo?: boolean,
    @Query('estado') estado?: EstadoMercado,
    @Query('tiendaId') tiendaId?: string,
    @Query('busqueda') busqueda?: string,
  ) {
    try {
      const parametros: ParametrosListarMercados = {
        pagina: Number(pagina),
        limite: Number(limite),
        activo: activo !== undefined ? Boolean(activo) : undefined,
        estado,
        tiendaId,
        busqueda,
      };

      const resultado = await this.listarMercadosCasoUso.ejecutar(parametros);

      return {
        mensaje: 'Lista de mercados obtenida exitosamente',
        data: {
          elementos: resultado.elementos.map(mercado => this.aDto(mercado)),
          paginacion: {
            total_elementos: resultado.paginacion.totalElementos,
            total_paginas: resultado.paginacion.totalPaginas,
            pagina_actual: resultado.paginacion.paginaActual,
            limite: resultado.paginacion.limite,
            tiene_siguiente: resultado.paginacion.tieneSiguiente,
            tiene_anterior: resultado.paginacion.tieneAnterior,
          },
        },
        tipo_mensaje: 'Exito',
        estado_respuesta: HttpStatus.OK,
      };
    } catch (error) {
      return {
        mensaje: error.message,
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: HttpStatus.BAD_REQUEST,
      };
    }
  }

  @Get('estadisticas')
  // @Roles(RolUsuario.ADMIN, RolUsuario.EDITOR)
  @ApiOperation({
    summary: 'Obtener estadísticas de mercados',
    description: 'Obtiene estadísticas generales sobre los mercados del sistema',
  })
  @ApiQuery({
    name: 'tiendaId',
    required: false,
    type: String,
    description: 'ID de tienda para filtrar estadísticas',
    example: 'tienda_123456789',
  })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas obtenidas exitosamente',
    schema: {
      example: {
        mensaje: 'Estadísticas de mercados obtenidas exitosamente',
        data: {
          totalMercados: 50,
          mercadosActivos: 35,
          mercadosInactivos: 15,
          mercadosPorEstado: {
            ACTIVO: 25,
            INACTIVO: 15,
            EN_CONFIGURACION: 8,
            SUSPENDIDO: 2,
          },
          mercadosPorMoneda: {
            PEN: 30,
            USD: 15,
            EUR: 5,
          },
          mercadosPorIdioma: {
            es: 40,
            en: 8,
            pt: 2,
          },
        },
        tipo_mensaje: 'Exito',
        estado_respuesta: 200,
      },
    },
  })
  async obtenerEstadisticas(@Query('tiendaId') tiendaId?: string) {
    try {
      const estadisticas = await this.listarMercadosCasoUso.obtenerEstadisticas(tiendaId);

      return {
        mensaje: 'Estadísticas de mercados obtenidas exitosamente',
        data: estadisticas,
        tipo_mensaje: 'Exito',
        estado_respuesta: HttpStatus.OK,
      };
    } catch (error) {
      return {
        mensaje: error.message,
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: HttpStatus.BAD_REQUEST,
      };
    }
  }

  @Get('tienda/:tiendaId')
  // @Roles(RolUsuario.ADMIN, RolUsuario.EDITOR, RolUsuario.VENDEDOR)
  @ApiOperation({
    summary: 'Listar mercados por tienda',
    description: 'Obtiene todos los mercados asociados a una tienda específica',
  })
  @ApiResponse({
    status: 200,
    description: 'Mercados de la tienda obtenidos exitosamente',
    schema: {
      example: {
        mensaje: 'Mercados de la tienda obtenidos exitosamente',
        data: [
          {
            id: 'mercado_123456789',
            nombre: 'Mercado Perú',
            codigo: 'PE',
            moneda: 'PEN',
            idioma: 'es',
            estado: 'ACTIVO',
            activo: true,
          },
        ],
        tipo_mensaje: 'Exito',
        estado_respuesta: 200,
      },
    },
  })
  async listarPorTienda(@Param('tiendaId') tiendaId: string) {
    try {
      const mercados = await this.listarMercadosCasoUso.listarPorTienda(tiendaId);

      return {
        mensaje: 'Mercados de la tienda obtenidos exitosamente',
        data: mercados,
        tipo_mensaje: 'Exito',
        estado_respuesta: HttpStatus.OK,
      };
    } catch (error) {
      return {
        mensaje: error.message,
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: HttpStatus.BAD_REQUEST,
      };
    }
  }

  @Get('tienda/:tiendaId/predeterminado')
  // @Roles(RolUsuario.ADMIN, RolUsuario.EDITOR, RolUsuario.VENDEDOR)
  @ApiOperation({
    summary: 'Obtener mercado predeterminado de tienda',
    description: 'Obtiene el mercado predeterminado para una tienda específica',
  })
  @ApiResponse({
    status: 200,
    description: 'Mercado predeterminado obtenido exitosamente',
    schema: {
      example: {
        mensaje: 'Mercado predeterminado obtenido exitosamente',
        data: {
          id: 'mercado_123456789',
          nombre: 'Mercado Perú',
          codigo: 'PE',
          moneda: 'PEN',
          idioma: 'es',
          zonaHoraria: 'America/Lima',
          estado: 'ACTIVO',
          activo: true,
          fechaCreacion: '2024-01-01T00:00:00.000Z',
          fechaActualizacion: '2024-01-01T00:00:00.000Z',
          tiendaId: 'tienda_123456789',
          configuracion: {
            impuestos: { iva: 18, igv: 18 },
          },
        },
        tipo_mensaje: 'Exito',
        estado_respuesta: 200,
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'No se encontró mercado predeterminado',
    schema: {
      example: {
        mensaje: 'No se encontró mercado predeterminado para esta tienda',
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: 404,
      },
    },
  })
  async obtenerPredeterminado(@Param('tiendaId') tiendaId: string) {
    try {
      const mercado = await this.listarMercadosCasoUso.obtenerPredeterminado(tiendaId);

      if (!mercado) {
        return {
          mensaje: 'No se encontró mercado predeterminado para esta tienda',
          data: null,
          tipo_mensaje: 'ErrorCliente',
          estado_respuesta: HttpStatus.NOT_FOUND,
        };
      }

      return {
        mensaje: 'Mercado predeterminado obtenido exitosamente',
        data: this.aDto(mercado),
        tipo_mensaje: 'Exito',
        estado_respuesta: HttpStatus.OK,
      };
    } catch (error) {
      return {
        mensaje: error.message,
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: HttpStatus.BAD_REQUEST,
      };
    }
  }

  @Get(':id')
  // @Roles(RolUsuario.ADMIN, RolUsuario.EDITOR, RolUsuario.VENDEDOR)
  @ApiOperation({
    summary: 'Obtener mercado por ID',
    description: 'Obtiene la información completa de un mercado específico',
  })
  @ApiResponse({
    status: 200,
    description: 'Mercado obtenido exitosamente',
    schema: {
      example: {
        mensaje: 'Mercado obtenido exitosamente',
        data: {
          id: 'mercado_123456789',
          nombre: 'Mercado Perú',
          codigo: 'PE',
          moneda: 'PEN',
          idioma: 'es',
          zonaHoraria: 'America/Lima',
          estado: 'ACTIVO',
          activo: true,
          fechaCreacion: '2024-01-01T00:00:00.000Z',
          fechaActualizacion: '2024-01-01T00:00:00.000Z',
          tiendaId: 'tienda_123456789',
          configuracion: {
            impuestos: { iva: 18, igv: 18 },
          },
        },
        tipo_mensaje: 'Exito',
        estado_respuesta: 200,
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Mercado no encontrado',
    schema: {
      example: {
        mensaje: 'Mercado no encontrado',
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: 404,
      },
    },
  })
  async obtenerPorId(@Param('id') id: string) {
    return {
      mensaje: 'Endpoint de obtener por ID - pendiente de implementación',
      data: null,
      tipo_mensaje: 'Advertencia',
      estado_respuesta: HttpStatus.NOT_IMPLEMENTED,
    };
  }

  @Put(':id')
  // @Roles(RolUsuario.ADMIN, RolUsuario.EDITOR)
  @ApiOperation({
    summary: 'Actualizar mercado',
    description: 'Actualiza la información de un mercado existente',
  })
  @ApiResponse({
    status: 200,
    description: 'Mercado actualizado exitosamente',
    schema: {
      example: {
        mensaje: 'Mercado actualizado exitosamente',
        data: {
          id: 'mercado_123456789',
          nombre: 'Mercado Perú Actualizado',
          codigo: 'PE',
          moneda: 'PEN',
          idioma: 'es',
          zonaHoraria: 'America/Lima',
          estado: 'ACTIVO',
          activo: true,
          fechaCreacion: '2024-01-01T00:00:00.000Z',
          fechaActualizacion: '2024-01-02T00:00:00.000Z',
          tiendaId: 'tienda_123456789',
          configuracion: {
            impuestos: { iva: 18, igv: 18 },
          },
        },
        tipo_mensaje: 'Exito',
        estado_respuesta: 200,
      },
    },
  })
  async actualizar(@Param('id') id: string) {
    return {
      mensaje: 'Endpoint de actualización - pendiente de implementación',
      data: null,
      tipo_mensaje: 'Advertencia',
      estado_respuesta: HttpStatus.NOT_IMPLEMENTED,
    };
  }

  @Delete(':id')
  // @Roles(RolUsuario.ADMIN, RolUsuario.EDITOR)
  @ApiOperation({
    summary: 'Eliminar mercado',
    description: 'Elimina permanentemente un mercado del sistema',
  })
  @ApiResponse({
    status: 200,
    description: 'Mercado eliminado exitosamente',
    schema: {
      example: {
        mensaje: 'Mercado eliminado exitosamente',
        data: null,
        tipo_mensaje: 'Exito',
        estado_respuesta: 200,
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Mercado no encontrado',
    schema: {
      example: {
        mensaje: 'Mercado no encontrado',
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: 404,
      },
    },
  })
  async eliminar(@Param('id') id: string) {
    return {
      mensaje: 'Endpoint de eliminación - pendiente de implementación',
      data: null,
      tipo_mensaje: 'Advertencia',
      estado_respuesta: HttpStatus.NOT_IMPLEMENTED,
    };
  }

  /**
   * Convierte una entidad Mercado a un DTO para la respuesta
   */
  private aDto(mercado: Mercado | any) {
    return {
      id: mercado.id,
      nombre: mercado.nombre,
      codigo: mercado.codigo,
      moneda: mercado.moneda,
      idioma: mercado.idioma,
      zonaHoraria: mercado.zonaHoraria,
      estado: mercado.estado,
      activo: mercado.activo,
      fechaCreacion: mercado.fechaCreacion,
      fechaActualizacion: mercado.fechaActualizacion,
      tiendaId: mercado.tiendaId,
      configuracion: mercado.configuracion,
    };
  }
}