import { Controller, Get, Post, Put, Delete, Body, Param, Query, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { GestionColeccionesCasoUso } from '../../dominio/casos-uso/gestion-colecciones.caso-uso';

/**
 * DTO para crear una colección
 */
class CrearColeccionDto {
  nombre: string;
  descripcion?: string;
  slug?: string;
  imagenUrl?: string;
  tipo: 'MANUAL' | 'AUTOMATICA';
  reglas?: any;
  visibleTiendaOnline?: boolean;
  visiblePointOfSale?: boolean;
  tiendaId: string;
  creadorId: string;
}

/**
 * DTO para actualizar una colección
 */
class ActualizarColeccionDto {
  nombre?: string;
  descripcion?: string;
  slug?: string;
  imagenUrl?: string;
  reglas?: any;
  visibleTiendaOnline?: boolean;
  visiblePointOfSale?: boolean;
}

/**
 * DTO para agregar producto a colección
 */
class AgregarProductoDto {
  productoId: string;
  orden?: number;
}

/**
 * DTO para actualizar orden de productos
 */
class ActualizarOrdenProductosDto {
  productos: Array<{ productoId: string; orden: number }>;
}

/**
 * Controlador REST para la gestión de colecciones
 * Proporciona endpoints para todas las operaciones CRUD y avanzadas
 */
@ApiTags('colecciones')
@Controller('colecciones')
export class ColeccionesController {
  constructor(
    @Inject(GestionColeccionesCasoUso)
    private readonly gestionColeccionesCasoUso: GestionColeccionesCasoUso,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva colección', description: 'Crea una nueva colección manual o automática' })
  @ApiResponse({ status: 200, description: 'Colección creada exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos o slug duplicado' })
  async crearColeccion(@Body() datos: CrearColeccionDto) {
    try {
      const coleccion = await this.gestionColeccionesCasoUso.crearColeccion(datos);
      return {
        mensaje: 'Colección creada exitosamente',
        data: coleccion,
        tipo_mensaje: 'Exito',
        estado_respuesta: 200,
      };
    } catch (error) {
      return {
        mensaje: error.message,
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: 400,
      };
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener colección por ID', description: 'Obtiene los detalles de una colección específica' })
  @ApiParam({ name: 'id', description: 'ID de la colección' })
  @ApiResponse({ status: 200, description: 'Colección encontrada' })
  @ApiResponse({ status: 404, description: 'Colección no encontrada' })
  async obtenerColeccion(@Param('id') id: string) {
    try {
      const coleccion = await this.gestionColeccionesCasoUso.obtenerColeccionPorId(id);
      return {
        mensaje: 'Colección obtenida exitosamente',
        data: coleccion,
        tipo_mensaje: 'Exito',
        estado_respuesta: 200,
      };
    } catch (error) {
      return {
        mensaje: error.message,
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: 404,
      };
    }
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Obtener colección por slug', description: 'Obtiene los detalles de una colección por su slug' })
  @ApiParam({ name: 'slug', description: 'Slug de la colección' })
  @ApiResponse({ status: 200, description: 'Colección encontrada' })
  @ApiResponse({ status: 404, description: 'Colección no encontrada' })
  async obtenerColeccionPorSlug(@Param('slug') slug: string) {
    try {
      const coleccion = await this.gestionColeccionesCasoUso.obtenerColeccionPorSlug(slug);
      return {
        mensaje: 'Colección obtenida exitosamente',
        data: coleccion,
        tipo_mensaje: 'Exito',
        estado_respuesta: 200,
      };
    } catch (error) {
      return {
        mensaje: error.message,
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: 404,
      };
    }
  }

  @Get()
  @ApiOperation({ summary: 'Listar colecciones', description: 'Obtiene una lista paginada de colecciones con filtros opcionales' })
  @ApiQuery({ name: 'pagina', required: false, type: Number, description: 'Número de página' })
  @ApiQuery({ name: 'limite', required: false, type: Number, description: 'Límite de resultados por página' })
  @ApiQuery({ name: 'nombre', required: false, type: String, description: 'Filtrar por nombre' })
  @ApiQuery({ name: 'tiendaId', required: false, type: String, description: 'Filtrar por ID de tienda' })
  @ApiQuery({ name: 'estado', required: false, enum: ['ACTIVA', 'ARCHIVADA', 'ELIMINADA'], description: 'Filtrar por estado' })
  @ApiQuery({ name: 'tipo', required: false, enum: ['MANUAL', 'AUTOMATICA'], description: 'Filtrar por tipo' })
  @ApiQuery({ name: 'visibleTiendaOnline', required: false, type: Boolean, description: 'Filtrar por visibilidad en tienda online' })
  @ApiQuery({ name: 'visiblePointOfSale', required: false, type: Boolean, description: 'Filtrar por visibilidad en punto de venta' })
  @ApiResponse({ status: 200, description: 'Lista de colecciones obtenida exitosamente' })
  async listarColecciones(
    @Query('pagina') pagina: number = 1,
    @Query('limite') limite: number = 10,
    @Query('nombre') nombre?: string,
    @Query('tiendaId') tiendaId?: string,
    @Query('estado') estado?: 'ACTIVA' | 'ARCHIVADA' | 'ELIMINADA',
    @Query('tipo') tipo?: 'MANUAL' | 'AUTOMATICA',
    @Query('visibleTiendaOnline') visibleTiendaOnline?: boolean,
    @Query('visiblePointOfSale') visiblePointOfSale?: boolean,
  ) {
    try {
      const resultado = await this.gestionColeccionesCasoUso.listarColecciones(
        Number(pagina),
        Number(limite),
        {
          nombre,
          tiendaId,
          estado,
          tipo,
          visibleTiendaOnline: visibleTiendaOnline !== undefined ? JSON.parse(visibleTiendaOnline.toString()) : undefined,
          visiblePointOfSale: visiblePointOfSale !== undefined ? JSON.parse(visiblePointOfSale.toString()) : undefined,
        }
      );

      return {
        mensaje: 'Lista de colecciones obtenida exitosamente',
        data: {
          elementos: resultado.colecciones,
          paginacion: {
            total_elementos: resultado.total,
            total_paginas: Math.ceil(resultado.total / Number(limite)),
            pagina_actual: Number(pagina),
            limite: Number(limite),
          },
        },
        tipo_mensaje: 'Exito',
        estado_respuesta: 200,
      };
    } catch (error) {
      return {
        mensaje: error.message,
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: 400,
      };
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar colección', description: 'Actualiza los datos de una colección existente' })
  @ApiParam({ name: 'id', description: 'ID de la colección a actualizar' })
  @ApiResponse({ status: 200, description: 'Colección actualizada exitosamente' })
  @ApiResponse({ status: 404, description: 'Colección no encontrada' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  async actualizarColeccion(@Param('id') id: string, @Body() datos: ActualizarColeccionDto) {
    try {
      const coleccion = await this.gestionColeccionesCasoUso.actualizarColeccion(id, datos);
      return {
        mensaje: 'Colección actualizada exitosamente',
        data: coleccion,
        tipo_mensaje: 'Exito',
        estado_respuesta: 200,
      };
    } catch (error) {
      return {
        mensaje: error.message,
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: 404,
      };
    }
  }

  @Put(':id/archivar')
  @ApiOperation({ summary: 'Archivar colección', description: 'Cambia el estado de la colección a ARCHIVADA' })
  @ApiParam({ name: 'id', description: 'ID de la colección a archivar' })
  @ApiResponse({ status: 200, description: 'Colección archivada exitosamente' })
  @ApiResponse({ status: 404, description: 'Colección no encontrada' })
  async archivarColeccion(@Param('id') id: string) {
    try {
      const coleccion = await this.gestionColeccionesCasoUso.archivarColeccion(id);
      return {
        mensaje: 'Colección archivada exitosamente',
        data: coleccion,
        tipo_mensaje: 'Exito',
        estado_respuesta: 200,
      };
    } catch (error) {
      return {
        mensaje: error.message,
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: 404,
      };
    }
  }

  @Put(':id/desarchivar')
  @ApiOperation({ summary: 'Desarchivar colección', description: 'Cambia el estado de la colección a ACTIVA' })
  @ApiParam({ name: 'id', description: 'ID de la colección a desarchivar' })
  @ApiResponse({ status: 200, description: 'Colección desarchivada exitosamente' })
  @ApiResponse({ status: 404, description: 'Colección no encontrada' })
  async desarchivarColeccion(@Param('id') id: string) {
    try {
      const coleccion = await this.gestionColeccionesCasoUso.desarchivarColeccion(id);
      return {
        mensaje: 'Colección desarchivada exitosamente',
        data: coleccion,
        tipo_mensaje: 'Exito',
        estado_respuesta: 200,
      };
    } catch (error) {
      return {
        mensaje: error.message,
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: 404,
      };
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar colección', description: 'Elimina una colección (cambia su estado a ELIMINADA)' })
  @ApiParam({ name: 'id', description: 'ID de la colección a eliminar' })
  @ApiResponse({ status: 200, description: 'Colección eliminada exitosamente' })
  @ApiResponse({ status: 404, description: 'Colección no encontrada' })
  async eliminarColeccion(@Param('id') id: string) {
    try {
      await this.gestionColeccionesCasoUso.eliminarColeccion(id);
      return {
        mensaje: 'Colección eliminada exitosamente',
        data: null,
        tipo_mensaje: 'Exito',
        estado_respuesta: 200,
      };
    } catch (error) {
      return {
        mensaje: error.message,
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: 404,
      };
    }
  }

  @Post(':id/duplicar')
  @ApiOperation({ summary: 'Duplicar colección', description: 'Crea una copia de la colección con un nuevo ID y slug' })
  @ApiParam({ name: 'id', description: 'ID de la colección a duplicar' })
  @ApiResponse({ status: 200, description: 'Colección duplicada exitosamente' })
  @ApiResponse({ status: 404, description: 'Colección no encontrada' })
  async duplicarColeccion(@Param('id') id: string) {
    try {
      const coleccion = await this.gestionColeccionesCasoUso.duplicarColeccion(id);
      return {
        mensaje: 'Colección duplicada exitosamente',
        data: coleccion,
        tipo_mensaje: 'Exito',
        estado_respuesta: 200,
      };
    } catch (error) {
      return {
        mensaje: error.message,
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: 404,
      };
    }
  }

  @Post(':id/productos')
  @ApiOperation({ summary: 'Agregar producto a colección', description: 'Agrega un producto a una colección manual' })
  @ApiParam({ name: 'id', description: 'ID de la colección' })
  @ApiResponse({ status: 200, description: 'Producto agregado exitosamente' })
  @ApiResponse({ status: 404, description: 'Colección no encontrada' })
  @ApiResponse({ status: 400, description: 'No se pueden agregar productos a colecciones automáticas' })
  async agregarProducto(@Param('id') id: string, @Body() datos: AgregarProductoDto) {
    try {
      await this.gestionColeccionesCasoUso.agregarProductoAColeccion(id, datos.productoId, datos.orden);
      return {
        mensaje: 'Producto agregado a la colección exitosamente',
        data: null,
        tipo_mensaje: 'Exito',
        estado_respuesta: 200,
      };
    } catch (error) {
      return {
        mensaje: error.message,
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: 400,
      };
    }
  }

  @Delete(':id/productos/:productoId')
  @ApiOperation({ summary: 'Eliminar producto de colección', description: 'Elimina un producto de una colección manual' })
  @ApiParam({ name: 'id', description: 'ID de la colección' })
  @ApiParam({ name: 'productoId', description: 'ID del producto a eliminar' })
  @ApiResponse({ status: 200, description: 'Producto eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Colección o producto no encontrado' })
  async eliminarProducto(@Param('id') id: string, @Param('productoId') productoId: string) {
    try {
      await this.gestionColeccionesCasoUso.eliminarProductoDeColeccion(id, productoId);
      return {
        mensaje: 'Producto eliminado de la colección exitosamente',
        data: null,
        tipo_mensaje: 'Exito',
        estado_respuesta: 200,
      };
    } catch (error) {
      return {
        mensaje: error.message,
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: 404,
      };
    }
  }

  @Put(':id/productos/orden')
  @ApiOperation({ summary: 'Actualizar orden de productos', description: 'Actualiza el orden de los productos en una colección manual' })
  @ApiParam({ name: 'id', description: 'ID de la colección' })
  @ApiResponse({ status: 200, description: 'Orden actualizado exitosamente' })
  @ApiResponse({ status: 404, description: 'Colección no encontrada' })
  @ApiResponse({ status: 400, description: 'No se puede actualizar orden en colecciones automáticas' })
  async actualizarOrdenProductos(@Param('id') id: string, @Body() datos: ActualizarOrdenProductosDto) {
    try {
      await this.gestionColeccionesCasoUso.actualizarOrdenProductos(id, datos.productos);
      return {
        mensaje: 'Orden de productos actualizado exitosamente',
        data: null,
        tipo_mensaje: 'Exito',
        estado_respuesta: 200,
      };
    } catch (error) {
      return {
        mensaje: error.message,
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: 400,
      };
    }
  }

  @Get(':id/productos')
  @ApiOperation({ summary: 'Obtener productos de colección', description: 'Obtiene la lista de productos de una colección' })
  @ApiParam({ name: 'id', description: 'ID de la colección' })
  @ApiQuery({ name: 'pagina', required: false, type: Number, description: 'Número de página' })
  @ApiQuery({ name: 'limite', required: false, type: Number, description: 'Límite de resultados por página' })
  @ApiResponse({ status: 200, description: 'Productos obtenidos exitosamente' })
  @ApiResponse({ status: 404, description: 'Colección no encontrada' })
  async obtenerProductosColeccion(
    @Param('id') id: string,
    @Query('pagina') pagina: number = 1,
    @Query('limite') limite: number = 10,
  ) {
    try {
      const resultado = await this.gestionColeccionesCasoUso.obtenerProductosDeColeccion(
        id,
        Number(pagina),
        Number(limite)
      );

      return {
        mensaje: 'Productos de la colección obtenidos exitosamente',
        data: {
          elementos: resultado.productos,
          paginacion: {
            total_elementos: resultado.total,
            total_paginas: Math.ceil(resultado.total / Number(limite)),
            pagina_actual: Number(pagina),
            limite: Number(limite),
          },
        },
        tipo_mensaje: 'Exito',
        estado_respuesta: 200,
      };
    } catch (error) {
      return {
        mensaje: error.message,
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: 404,
      };
    }
  }

  @Get('exportar/csv')
  @ApiOperation({ summary: 'Exportar colecciones a CSV', description: 'Exporta las colecciones a formato CSV con filtros opcionales' })
  @ApiQuery({ name: 'tiendaId', required: false, type: String, description: 'Filtrar por ID de tienda' })
  @ApiQuery({ name: 'estado', required: false, enum: ['ACTIVA', 'ARCHIVADA', 'ELIMINADA'], description: 'Filtrar por estado' })
  @ApiQuery({ name: 'tipo', required: false, enum: ['MANUAL', 'AUTOMATICA'], description: 'Filtrar por tipo' })
  @ApiResponse({ status: 200, description: 'CSV generado exitosamente' })
  async exportarCSV(
    @Query('tiendaId') tiendaId?: string,
    @Query('estado') estado?: 'ACTIVA' | 'ARCHIVADA' | 'ELIMINADA',
    @Query('tipo') tipo?: 'MANUAL' | 'AUTOMATICA',
  ) {
    try {
      const csv = await this.gestionColeccionesCasoUso.exportarColeccionesCSV({
        tiendaId,
        estado,
        tipo,
      });

      return {
        mensaje: 'CSV generado exitosamente',
        data: { csv },
        tipo_mensaje: 'Exito',
        estado_respuesta: 200,
      };
    } catch (error) {
      return {
        mensaje: error.message,
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: 400,
      };
    }
  }

  @Post('importar/csv')
  @ApiOperation({ summary: 'Importar colecciones desde CSV', description: 'Importa colecciones desde un archivo CSV' })
  @ApiResponse({ status: 200, description: 'CSV importado exitosamente' })
  @ApiResponse({ status: 400, description: 'Error en el formato del CSV' })
  async importarCSV(
    @Body() datos: { csvData: string; tiendaId: string; creadorId: string },
  ) {
    try {
      const resultado = await this.gestionColeccionesCasoUso.importarColeccionesCSV(
        datos.csvData,
        datos.tiendaId,
        datos.creadorId,
      );

      return {
        mensaje: 'CSV importado exitosamente',
        data: resultado,
        tipo_mensaje: 'Exito',
        estado_respuesta: 200,
      };
    } catch (error) {
      return {
        mensaje: error.message,
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: 400,
      };
    }
  }

  @Put(':id/visibilidad')
  @ApiOperation({ summary: 'Actualizar visibilidad por canales', description: 'Actualiza la visibilidad de la colección en diferentes canales' })
  @ApiParam({ name: 'id', description: 'ID de la colección' })
  @ApiResponse({ status: 200, description: 'Visibilidad actualizada exitosamente' })
  @ApiResponse({ status: 404, description: 'Colección no encontrada' })
  async actualizarVisibilidad(
    @Param('id') id: string,
    @Body() datos: { tiendaOnline: boolean; pointOfSale: boolean },
  ) {
    try {
      const coleccion = await this.gestionColeccionesCasoUso.actualizarVisibilidadCanales(
        id,
        datos.tiendaOnline,
        datos.pointOfSale,
      );

      return {
        mensaje: 'Visibilidad actualizada exitosamente',
        data: coleccion,
        tipo_mensaje: 'Exito',
        estado_respuesta: 200,
      };
    } catch (error) {
      return {
        mensaje: error.message,
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: 404,
      };
    }
  }

  @Get('estadisticas/:tiendaId')
  @ApiOperation({ summary: 'Obtener estadísticas de colecciones', description: 'Obtiene estadísticas generales de las colecciones de una tienda' })
  @ApiParam({ name: 'tiendaId', description: 'ID de la tienda' })
  @ApiResponse({ status: 200, description: 'Estadísticas obtenidas exitosamente' })
  async obtenerEstadisticas(@Param('tiendaId') tiendaId: string) {
    try {
      const estadisticas = await this.gestionColeccionesCasoUso.obtenerEstadisticasColecciones(tiendaId);
      return {
        mensaje: 'Estadísticas obtenidas exitosamente',
        data: estadisticas,
        tipo_mensaje: 'Exito',
        estado_respuesta: 200,
      };
    } catch (error) {
      return {
        mensaje: error.message,
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: 400,
      };
    }
  }

  @Post(':id/ejecutar-reglas')
  @ApiOperation({ summary: 'Ejecutar reglas automáticas', description: 'Ejecuta las reglas automáticas de una colección para actualizar sus productos' })
  @ApiParam({ name: 'id', description: 'ID de la colección automática' })
  @ApiResponse({ status: 200, description: 'Reglas ejecutadas exitosamente' })
  @ApiResponse({ status: 404, description: 'Colección no encontrada' })
  @ApiResponse({ status: 400, description: 'La colección no es automática o no tiene reglas' })
  async ejecutarReglasAutomaticas(@Param('id') id: string) {
    try {
      const resultado = await this.gestionColeccionesCasoUso.ejecutarReglasAutomaticas(id);
      return {
        mensaje: 'Reglas ejecutadas exitosamente',
        data: resultado,
        tipo_mensaje: 'Exito',
        estado_respuesta: 200,
      };
    } catch (error) {
      return {
        mensaje: error.message,
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: 400,
      };
    }
  }
}