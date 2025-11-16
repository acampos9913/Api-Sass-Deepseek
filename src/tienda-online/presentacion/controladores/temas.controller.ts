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
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CrearTemaCasoUso } from '../../dominio/casos-uso/crear-tema.caso-uso';
import type { RepositorioTema } from '../../dominio/interfaces/repositorio-tema.interface';
import { CrearTemaDto } from '../../aplicacion/dto/crear-tema.dto';
import { Tema } from '../../dominio/entidades/tema.entity';
import { ExcepcionDominio } from '../../../comun/excepciones/excepcion-dominio';

/**
 * Controlador para la gestión de temas de la tienda online
 * Sigue los principios de REST y Clean Architecture
 */
@ApiTags('Temas')
@ApiBearerAuth()
@Controller('api/v1/temas')
export class TemasController {
  constructor(
    private readonly crearTemaCasoUso: CrearTemaCasoUso,
    private readonly repositorioTema: RepositorioTema,
  ) {}

  /**
   * Crear un nuevo tema
   */
  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({
    summary: 'Crear un nuevo tema',
    description: 'Crea un nuevo tema para la tienda online con validaciones de negocio',
  })
  @ApiResponse({
    status: 201,
    description: 'Tema creado exitosamente',
    schema: {
      example: {
        mensaje: 'Tema creado exitosamente',
        data: {
          id: 'tema_123456789',
          nombre: 'Tema Moderno',
          descripcion: 'Un tema moderno con colores vibrantes',
          activo: true,
          esPredeterminado: false,
          configuracion: {
            colores: {
              primario: '#007bff',
              secundario: '#6c757d',
              texto: '#212529',
              fondo: '#ffffff',
            },
            fuentes: {
              principal: 'Arial, sans-serif',
              secundaria: 'Georgia, serif',
            },
            estilos: {
              borderRadius: '4px',
              sombra: '0 2px 4px rgba(0,0,0,0.1)',
            },
          },
          fechaCreacion: '2024-01-01T00:00:00.000Z',
          fechaActualizacion: '2024-01-01T00:00:00.000Z',
          tiendaId: 'tienda_123456789',
          creadorId: 'usr_123456789',
        },
        tipo_mensaje: 'Exito',
        estado_respuesta: 201,
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Error de validación (reglas de negocio)',
    schema: {
      example: {
        mensaje: 'Ya existe un tema activo para esta tienda. Solo puede haber un tema activo a la vez.',
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: 400,
      },
    },
  })
  async crear(
    @Body() crearTemaDto: CrearTemaDto,
  ): Promise<any> {
    try {
      // TODO: Obtener el creadorId del usuario autenticado
      const creadorId = 'usuario_autenticado_id'; // Esto vendría del token JWT

      const datosCreacion = crearTemaDto.aObjetoCreacion(creadorId);
      const tema = await this.crearTemaCasoUso.ejecutar(datosCreacion);

      return {
        mensaje: 'Tema creado exitosamente',
        data: this.mapearTemaARespuesta(tema),
        tipo_mensaje: 'Exito',
        estado_respuesta: HttpStatus.CREATED,
      };
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        return {
          mensaje: error.message,
          data: null,
          tipo_mensaje: 'ErrorCliente',
          estado_respuesta: HttpStatus.BAD_REQUEST,
        };
      }
      throw error;
    }
  }

  /**
   * Obtener lista de temas con paginación
   */
  @Get()
  @ApiOperation({
    summary: 'Listar temas',
    description: 'Obtiene una lista paginada de temas con opciones de filtrado',
  })
  @ApiQuery({
    name: 'pagina',
    required: false,
    type: Number,
    description: 'Número de página (por defecto: 1)',
  })
  @ApiQuery({
    name: 'limite',
    required: false,
    type: Number,
    description: 'Límite de elementos por página (por defecto: 10)',
  })
  @ApiQuery({
    name: 'buscar',
    required: false,
    type: String,
    description: 'Texto para buscar en nombre o descripción',
  })
  @ApiQuery({
    name: 'activo',
    required: false,
    type: Boolean,
    description: 'Filtrar por estado activo',
  })
  @ApiQuery({
    name: 'esPredeterminado',
    required: false,
    type: Boolean,
    description: 'Filtrar por tema predeterminado',
  })
  @ApiQuery({
    name: 'creadorId',
    required: false,
    type: String,
    description: 'Filtrar por creador',
  })
  @ApiQuery({
    name: 'tiendaId',
    required: false,
    type: String,
    description: 'Filtrar por tienda',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de temas obtenida exitosamente',
    schema: {
      example: {
        mensaje: 'Lista de temas obtenida',
        data: {
          temas: [
            {
              id: 'tema_123456789',
              nombre: 'Tema Moderno',
              descripcion: 'Un tema moderno con colores vibrantes',
              activo: true,
              esPredeterminado: false,
              fechaCreacion: '2024-01-01T00:00:00.000Z',
              fechaActualizacion: '2024-01-01T00:00:00.000Z',
              tiendaId: 'tienda_123456789',
              creadorId: 'usr_123456789',
            },
          ],
          paginacion: {
            totalElementos: 100,
            totalPaginas: 10,
            paginaActual: 1,
            limite: 10,
            tieneSiguiente: true,
            tieneAnterior: false,
          },
        },
        tipo_mensaje: 'Exito',
        estado_respuesta: 200,
      },
    },
  })
  async listar(
    @Query('pagina') pagina: number = 1,
    @Query('limite') limite: number = 10,
    @Query('buscar') buscar?: string,
    @Query('activo') activo?: boolean,
    @Query('esPredeterminado') esPredeterminado?: boolean,
    @Query('creadorId') creadorId?: string,
    @Query('tiendaId') tiendaId?: string,
  ): Promise<any> {
    const opciones = {
      pagina: Number(pagina),
      limite: Number(limite),
      buscar,
      activo: activo !== undefined ? Boolean(activo) : undefined,
      esPredeterminado: esPredeterminado !== undefined ? Boolean(esPredeterminado) : undefined,
      creadorId,
      tiendaId,
    };

    const listado = await this.repositorioTema.listar(opciones);

    return {
      mensaje: 'Lista de temas obtenida',
      data: {
        temas: listado.temas.map(tema => this.mapearTemaARespuesta(tema)),
        paginacion: listado.paginacion,
      },
      tipo_mensaje: 'Exito',
      estado_respuesta: HttpStatus.OK,
    };
  }

  /**
   * Obtener tema por ID
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Obtener tema por ID',
    description: 'Obtiene los detalles completos de un tema específico',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del tema',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Tema encontrado',
    schema: {
      example: {
        mensaje: 'Tema obtenido',
        data: {
          id: 'tema_123456789',
          nombre: 'Tema Moderno',
          descripcion: 'Un tema moderno con colores vibrantes',
          activo: true,
          esPredeterminado: false,
          configuracion: {
            colores: {
              primario: '#007bff',
              secundario: '#6c757d',
              texto: '#212529',
              fondo: '#ffffff',
            },
            fuentes: {
              principal: 'Arial, sans-serif',
              secundaria: 'Georgia, serif',
            },
            estilos: {
              borderRadius: '4px',
              sombra: '0 2px 4px rgba(0,0,0,0.1)',
            },
          },
          fechaCreacion: '2024-01-01T00:00:00.000Z',
          fechaActualizacion: '2024-01-01T00:00:00.000Z',
          tiendaId: 'tienda_123456789',
          creadorId: 'usr_123456789',
        },
        tipo_mensaje: 'Exito',
        estado_respuesta: 200,
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Tema no encontrado',
    schema: {
      example: {
        mensaje: 'Tema no encontrado',
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: 404,
      },
    },
  })
  async obtenerPorId(@Param('id') id: string): Promise<any> {
    const tema = await this.repositorioTema.buscarPorId(id);

    if (!tema) {
      return {
        mensaje: 'Tema no encontrado',
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: HttpStatus.NOT_FOUND,
      };
    }

    return {
      mensaje: 'Tema obtenido',
      data: this.mapearTemaARespuesta(tema),
      tipo_mensaje: 'Exito',
      estado_respuesta: HttpStatus.OK,
    };
  }

  /**
   * Obtener tema activo de una tienda
   */
  @Get('tienda/:tiendaId/activo')
  @ApiOperation({
    summary: 'Obtener tema activo de una tienda',
    description: 'Obtiene el tema activo actual de una tienda específica',
  })
  @ApiParam({
    name: 'tiendaId',
    description: 'ID de la tienda',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Tema activo encontrado',
  })
  @ApiResponse({
    status: 200,
    description: 'No hay tema activo para esta tienda',
    schema: {
      example: {
        mensaje: 'No hay tema activo para esta tienda',
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: 404,
      },
    },
  })
  async obtenerTemaActivo(@Param('tiendaId') tiendaId: string): Promise<any> {
    const tema = await this.repositorioTema.obtenerTemaActivo(tiendaId);

    if (!tema) {
      return {
        mensaje: 'No hay tema activo para esta tienda',
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: HttpStatus.NOT_FOUND,
      };
    }

    return {
      mensaje: 'Tema activo obtenido',
      data: this.mapearTemaARespuesta(tema),
      tipo_mensaje: 'Exito',
      estado_respuesta: HttpStatus.OK,
    };
  }

  /**
   * Obtener tema predeterminado de una tienda
   */
  @Get('tienda/:tiendaId/predeterminado')
  @ApiOperation({
    summary: 'Obtener tema predeterminado de una tienda',
    description: 'Obtiene el tema predeterminado de una tienda específica',
  })
  @ApiParam({
    name: 'tiendaId',
    description: 'ID de la tienda',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Tema predeterminado encontrado',
  })
  @ApiResponse({
    status: 200,
    description: 'No hay tema predeterminado para esta tienda',
    schema: {
      example: {
        mensaje: 'No hay tema predeterminado para esta tienda',
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: 404,
      },
    },
  })
  async obtenerTemaPredeterminado(@Param('tiendaId') tiendaId: string): Promise<any> {
    const tema = await this.repositorioTema.obtenerTemaPredeterminado(tiendaId);

    if (!tema) {
      return {
        mensaje: 'No hay tema predeterminado para esta tienda',
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: HttpStatus.NOT_FOUND,
      };
    }

    return {
      mensaje: 'Tema predeterminado obtenido',
      data: this.mapearTemaARespuesta(tema),
      tipo_mensaje: 'Exito',
      estado_respuesta: HttpStatus.OK,
    };
  }

  /**
   * Obtener estadísticas de temas por tienda
   */
  @Get('estadisticas/tienda/:tiendaId')
  @ApiOperation({
    summary: 'Obtener estadísticas de temas por tienda',
    description: 'Obtiene estadísticas sobre los temas de una tienda específica',
  })
  @ApiParam({
    name: 'tiendaId',
    description: 'ID de la tienda',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas obtenidas',
    schema: {
      example: {
        mensaje: 'Estadísticas obtenidas',
        data: {
          totalTemas: 10,
          temasActivos: 1,
          temasInactivos: 9,
          temasPredeterminados: 1,
          temasRecientes: 2,
          creadorMasActivo: {
            creadorId: 'usr_123456789',
            totalTemas: 8,
          },
        },
        tipo_mensaje: 'Exito',
        estado_respuesta: 200,
      },
    },
  })
  async obtenerEstadisticas(@Param('tiendaId') tiendaId: string): Promise<any> {
    const estadisticas = await this.repositorioTema.obtenerEstadisticasPorTienda(tiendaId);

    return {
      mensaje: 'Estadísticas obtenidas',
      data: estadisticas,
      tipo_mensaje: 'Exito',
      estado_respuesta: HttpStatus.OK,
    };
  }

  /**
   * Activar un tema
   */
  @Put(':id/activar')
  @ApiOperation({
    summary: 'Activar un tema',
    description: 'Activa un tema específico y desactiva otros temas de la misma tienda',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del tema a activar',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Tema activado exitosamente',
  })
  @ApiResponse({
    status: 200,
    description: 'Tema no encontrado',
  })
  async activar(@Param('id') id: string): Promise<any> {
    try {
      const tema = await this.repositorioTema.buscarPorId(id);
      
      if (!tema) {
        return {
          mensaje: 'Tema no encontrado',
          data: null,
          tipo_mensaje: 'ErrorCliente',
          estado_respuesta: HttpStatus.NOT_FOUND,
        };
      }

      // Desactivar otros temas de la misma tienda
      if (tema.tiendaId) {
        await this.repositorioTema.desactivarTodosLosTemas(tema.tiendaId, id);
      }

      tema.activar();
      const temaActualizado = await this.repositorioTema.guardar(tema);

      return {
        mensaje: 'Tema activado exitosamente',
        data: this.mapearTemaARespuesta(temaActualizado),
        tipo_mensaje: 'Exito',
        estado_respuesta: HttpStatus.OK,
      };
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        return {
          mensaje: error.message,
          data: null,
          tipo_mensaje: 'ErrorCliente',
          estado_respuesta: HttpStatus.BAD_REQUEST,
        };
      }
      throw error;
    }
  }

  /**
   * Desactivar un tema
   */
  @Put(':id/desactivar')
  @ApiOperation({
    summary: 'Desactivar un tema',
    description: 'Desactiva un tema específico',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del tema a desactivar',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Tema desactivado exitosamente',
  })
  async desactivar(@Param('id') id: string): Promise<any> {
    try {
      const tema = await this.repositorioTema.buscarPorId(id);
      
      if (!tema) {
        return {
          mensaje: 'Tema no encontrado',
          data: null,
          tipo_mensaje: 'ErrorCliente',
          estado_respuesta: HttpStatus.NOT_FOUND,
        };
      }

      tema.desactivar();
      const temaActualizado = await this.repositorioTema.guardar(tema);

      return {
        mensaje: 'Tema desactivado exitosamente',
        data: this.mapearTemaARespuesta(temaActualizado),
        tipo_mensaje: 'Exito',
        estado_respuesta: HttpStatus.OK,
      };
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        return {
          mensaje: error.message,
          data: null,
          tipo_mensaje: 'ErrorCliente',
          estado_respuesta: HttpStatus.BAD_REQUEST,
        };
      }
      throw error;
    }
  }

  /**
   * Establecer tema como predeterminado
   */
  @Put(':id/predeterminado')
  @ApiOperation({
    summary: 'Establecer tema como predeterminado',
    description: 'Establece un tema como predeterminado y quita el estado de otros temas',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del tema a establecer como predeterminado',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Tema establecido como predeterminado exitosamente',
  })
  async establecerComoPredeterminado(@Param('id') id: string): Promise<any> {
    try {
      const tema = await this.repositorioTema.buscarPorId(id);
      
      if (!tema) {
        return {
          mensaje: 'Tema no encontrado',
          data: null,
          tipo_mensaje: 'ErrorCliente',
          estado_respuesta: HttpStatus.NOT_FOUND,
        };
      }

      // Quitar predeterminado de otros temas de la misma tienda
      if (tema.tiendaId) {
        await this.repositorioTema.quitarPredeterminadoDeTodosLosTemas(tema.tiendaId, id);
      }

      tema.establecerComoPredeterminado();
      const temaActualizado = await this.repositorioTema.guardar(tema);

      return {
        mensaje: 'Tema establecido como predeterminado exitosamente',
        data: this.mapearTemaARespuesta(temaActualizado),
        tipo_mensaje: 'Exito',
        estado_respuesta: HttpStatus.OK,
      };
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        return {
          mensaje: error.message,
          data: null,
          tipo_mensaje: 'ErrorCliente',
          estado_respuesta: HttpStatus.BAD_REQUEST,
        };
      }
      throw error;
    }
  }

  /**
   * Mapea la entidad Tema a formato de respuesta
   */
  private mapearTemaARespuesta(tema: Tema): any {
    return {
      id: tema.id,
      nombre: tema.nombre,
      descripcion: tema.descripcion,
      activo: tema.activo,
      esPredeterminado: tema.esPredeterminado,
      configuracion: tema.configuracion,
      fechaCreacion: tema.fechaCreacion,
      fechaActualizacion: tema.fechaActualizacion,
      tiendaId: tema.tiendaId,
      creadorId: tema.creadorId,
    };
  }
}