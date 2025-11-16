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
import { CrearPaginaCasoUso } from '../../dominio/casos-uso/crear-pagina.caso-uso';
import type { RepositorioPagina } from '../../dominio/interfaces/repositorio-pagina.interface';
import { CrearPaginaDto } from '../../aplicacion/dto/crear-pagina.dto';
import { Pagina } from '../../dominio/entidades/pagina.entity';
import { ExcepcionDominio } from '../../../comun/excepciones/excepcion-dominio';

/**
 * Controlador para la gestión de páginas de la tienda online
 * Sigue los principios de REST y Clean Architecture
 */
@ApiTags('Páginas')
@ApiBearerAuth()
@Controller('api/v1/paginas')
export class PaginasController {
  constructor(
    private readonly crearPaginaCasoUso: CrearPaginaCasoUso,
    private readonly repositorioPagina: RepositorioPagina,
  ) {}

  /**
   * Crear una nueva página
   */
  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({
    summary: 'Crear una nueva página',
    description: 'Crea una nueva página para la tienda online con validaciones de negocio',
  })
  @ApiResponse({
    status: 201,
    description: 'Página creada exitosamente',
    schema: {
      example: {
        mensaje: 'Página creada exitosamente',
        data: {
          id: 'pag_123456789',
          titulo: 'Sobre Nosotros',
          contenido: '<h1>Bienvenidos</h1>',
          slug: 'sobre-nosotros',
          metaTitulo: 'Sobre Nosotros - Tienda',
          metaDescripcion: 'Conoce más sobre nuestra empresa',
          visible: true,
          fechaCreacion: '2024-01-01T00:00:00.000Z',
          fechaActualizacion: '2024-01-01T00:00:00.000Z',
          fechaPublicacion: '2024-01-01T00:00:00.000Z',
          autorId: 'usr_123456789',
          tiendaId: 'tienda_123456789',
        },
        tipo_mensaje: 'Exito',
        estado_respuesta: 201,
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Error de validación (slug duplicado)',
    schema: {
      example: {
        mensaje: 'Ya existe una página con el slug "sobre-nosotros"',
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: 400,
      },
    },
  })
  async crear(
    @Body() crearPaginaDto: CrearPaginaDto,
  ): Promise<any> {
    try {
      // TODO: Obtener el autorId del usuario autenticado
      const autorId = 'usuario_autenticado_id'; // Esto vendría del token JWT

      const datosCreacion = crearPaginaDto.aObjetoCreacion(autorId);
      const pagina = await this.crearPaginaCasoUso.ejecutar(datosCreacion);

      return {
        mensaje: 'Página creada exitosamente',
        data: this.mapearPaginaARespuesta(pagina),
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
   * Obtener lista de páginas con paginación
   */
  @Get()
  @ApiOperation({
    summary: 'Listar páginas',
    description: 'Obtiene una lista paginada de páginas con opciones de filtrado',
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
    description: 'Texto para buscar en título o contenido',
  })
  @ApiQuery({
    name: 'visible',
    required: false,
    type: Boolean,
    description: 'Filtrar por visibilidad',
  })
  @ApiQuery({
    name: 'autorId',
    required: false,
    type: String,
    description: 'Filtrar por autor',
  })
  @ApiQuery({
    name: 'tiendaId',
    required: false,
    type: String,
    description: 'Filtrar por tienda',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de páginas obtenida exitosamente',
    schema: {
      example: {
        mensaje: 'Lista de páginas obtenida',
        data: {
          paginas: [
            {
              id: 'pag_123456789',
              titulo: 'Sobre Nosotros',
              slug: 'sobre-nosotros',
              visible: true,
              fechaCreacion: '2024-01-01T00:00:00.000Z',
              fechaActualizacion: '2024-01-01T00:00:00.000Z',
              autorId: 'usr_123456789',
              tiendaId: 'tienda_123456789',
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
    @Query('visible') visible?: boolean,
    @Query('autorId') autorId?: string,
    @Query('tiendaId') tiendaId?: string,
  ): Promise<any> {
    const opciones = {
      pagina: Number(pagina),
      limite: Number(limite),
      buscar,
      visible: visible !== undefined ? Boolean(visible) : undefined,
      autorId,
      tiendaId,
    };

    const listado = await this.repositorioPagina.listar(opciones);

    return {
      mensaje: 'Lista de páginas obtenida',
      data: {
        paginas: listado.paginas.map(pagina => this.mapearPaginaARespuesta(pagina)),
        paginacion: listado.paginacion,
      },
      tipo_mensaje: 'Exito',
      estado_respuesta: HttpStatus.OK,
    };
  }

  /**
   * Obtener página por ID
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Obtener página por ID',
    description: 'Obtiene los detalles completos de una página específica',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la página',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Página encontrada',
    schema: {
      example: {
        mensaje: 'Página obtenida',
        data: {
          id: 'pag_123456789',
          titulo: 'Sobre Nosotros',
          contenido: '<h1>Bienvenidos</h1>',
          slug: 'sobre-nosotros',
          metaTitulo: 'Sobre Nosotros - Tienda',
          metaDescripcion: 'Conoce más sobre nuestra empresa',
          visible: true,
          fechaCreacion: '2024-01-01T00:00:00.000Z',
          fechaActualizacion: '2024-01-01T00:00:00.000Z',
          fechaPublicacion: '2024-01-01T00:00:00.000Z',
          autorId: 'usr_123456789',
          tiendaId: 'tienda_123456789',
        },
        tipo_mensaje: 'Exito',
        estado_respuesta: 200,
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Página no encontrada',
    schema: {
      example: {
        mensaje: 'Página no encontrada',
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: 404,
      },
    },
  })
  async obtenerPorId(@Param('id') id: string): Promise<any> {
    const pagina = await this.repositorioPagina.buscarPorId(id);

    if (!pagina) {
      return {
        mensaje: 'Página no encontrada',
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: HttpStatus.NOT_FOUND,
      };
    }

    return {
      mensaje: 'Página obtenida',
      data: this.mapearPaginaARespuesta(pagina),
      tipo_mensaje: 'Exito',
      estado_respuesta: HttpStatus.OK,
    };
  }

  /**
   * Obtener página por slug
   */
  @Get('slug/:slug')
  @ApiOperation({
    summary: 'Obtener página por slug',
    description: 'Obtiene los detalles completos de una página por su slug único',
  })
  @ApiParam({
    name: 'slug',
    description: 'Slug único de la página',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Página encontrada',
  })
  @ApiResponse({
    status: 200,
    description: 'Página no encontrada',
    schema: {
      example: {
        mensaje: 'Página no encontrada',
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: 404,
      },
    },
  })
  async obtenerPorSlug(@Param('slug') slug: string): Promise<any> {
    const pagina = await this.repositorioPagina.buscarPorSlug(slug);

    if (!pagina) {
      return {
        mensaje: 'Página no encontrada',
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: HttpStatus.NOT_FOUND,
      };
    }

    return {
      mensaje: 'Página obtenida',
      data: this.mapearPaginaARespuesta(pagina),
      tipo_mensaje: 'Exito',
      estado_respuesta: HttpStatus.OK,
    };
  }

  /**
   * Obtener páginas públicas
   */
  @Get('publicas/listar')
  @ApiOperation({
    summary: 'Listar páginas públicas',
    description: 'Obtiene una lista paginada de páginas visibles públicamente',
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
    description: 'Texto para buscar en título o contenido',
  })
  @ApiQuery({
    name: 'tiendaId',
    required: false,
    type: String,
    description: 'Filtrar por tienda',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de páginas públicas obtenida',
  })
  async listarPublicas(
    @Query('pagina') pagina: number = 1,
    @Query('limite') limite: number = 10,
    @Query('buscar') buscar?: string,
    @Query('tiendaId') tiendaId?: string,
  ): Promise<any> {
    const opciones = {
      pagina: Number(pagina),
      limite: Number(limite),
      buscar,
      tiendaId,
    };

    const listado = await this.repositorioPagina.listarPublicas(opciones);

    return {
      mensaje: 'Lista de páginas públicas obtenida',
      data: {
        paginas: listado.paginas.map(pagina => this.mapearPaginaARespuesta(pagina)),
        paginacion: listado.paginacion,
      },
      tipo_mensaje: 'Exito',
      estado_respuesta: HttpStatus.OK,
    };
  }

  /**
   * Obtener estadísticas de páginas por tienda
   */
  @Get('estadisticas/tienda/:tiendaId')
  @ApiOperation({
    summary: 'Obtener estadísticas de páginas por tienda',
    description: 'Obtiene estadísticas sobre las páginas de una tienda específica',
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
          totalPaginas: 25,
          paginasPublicas: 20,
          paginasOcultas: 5,
          paginasRecientes: 3,
          autorMasActivo: {
            autorId: 'usr_123456789',
            totalPaginas: 15,
          },
        },
        tipo_mensaje: 'Exito',
        estado_respuesta: 200,
      },
    },
  })
  async obtenerEstadisticas(@Param('tiendaId') tiendaId: string): Promise<any> {
    const estadisticas = await this.repositorioPagina.obtenerEstadisticasPorTienda(tiendaId);

    return {
      mensaje: 'Estadísticas obtenidas',
      data: estadisticas,
      tipo_mensaje: 'Exito',
      estado_respuesta: HttpStatus.OK,
    };
  }

  /**
   * Mapea la entidad Pagina a formato de respuesta
   */
  private mapearPaginaARespuesta(pagina: Pagina): any {
    return {
      id: pagina.id,
      titulo: pagina.titulo,
      contenido: pagina.contenido,
      slug: pagina.slug,
      metaTitulo: pagina.metaTitulo,
      metaDescripcion: pagina.metaDescripcion,
      visible: pagina.visible,
      fechaCreacion: pagina.fechaCreacion,
      fechaActualizacion: pagina.fechaActualizacion,
      fechaPublicacion: pagina.fechaPublicacion,
      autorId: pagina.autorId,
      tiendaId: pagina.tiendaId,
    };
  }
}