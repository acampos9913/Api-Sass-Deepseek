import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
  ParseIntPipe,
  DefaultValuePipe
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiQuery, ApiParam } from '@nestjs/swagger';
import { CrearProductoDto } from '../../aplicacion/dto/crear-producto.dto';
import { ActualizarProductoDto } from '../../aplicacion/dto/actualizar-producto.dto';
import { CrearProductoCasoUso } from '../../dominio/casos-uso/crear-producto.caso-uso';
import { ListarProductosCasoUso, OpcionesListado, FiltrosProductos } from '../../dominio/casos-uso/listar-productos.caso-uso';
import {
  ListarProductosLecturaCasoUso,
  OpcionesListadoLectura,
  FiltrosProductosLectura
} from '../../dominio/casos-uso/listar-productos-lectura.caso-uso';
import { Producto } from '../../dominio/entidades/producto.entity';
import { ParametrosRutaProductoDto, ParametrosRutaProductoConIdDto } from '../dto/parametros-ruta-producto.dto';
import { ParametrosRutaProductoSimpleDto, ParametrosRutaProductoConTiendaDto } from '../dto/parametros-ruta-producto-simple.dto';

/**
 * Controlador para la gestión de productos
 * Expone todas las APIs necesarias para el frontend
 */
@ApiTags('Productos')
@Controller('api/v1/productos')
@UsePipes(new ValidationPipe({ transform: true }))
export class ProductosController {
  constructor(
    private readonly crearProductoCasoUso: CrearProductoCasoUso,
    private readonly listarProductosCasoUso: ListarProductosCasoUso,
    private readonly listarProductosLecturaCasoUso: ListarProductosLecturaCasoUso,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Listar productos',
    description: 'Obtiene una lista paginada de productos con filtros opcionales',
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
    description: 'Límite de productos por página (por defecto: 20, máximo: 100)',
    example: 20,
  })
  @ApiQuery({
    name: 'titulo',
    required: false,
    type: String,
    description: 'Filtrar por título (búsqueda parcial)',
    example: 'camiseta',
  })
  @ApiQuery({
    name: 'categoriaId',
    required: false,
    type: String,
    description: 'Filtrar por ID de categoría',
    example: 'cat-123',
  })
  @ApiQuery({
    name: 'visible',
    required: false,
    type: Boolean,
    description: 'Filtrar por visibilidad',
    example: true,
  })
  @ApiQuery({
    name: 'ordenarPor',
    required: false,
    enum: ['titulo', 'precio', 'fechaCreacion', 'fechaActualizacion'],
    description: 'Campo por el cual ordenar',
    example: 'fechaCreacion',
  })
  @ApiQuery({
    name: 'orden',
    required: false,
    enum: ['asc', 'desc'],
    description: 'Dirección del ordenamiento',
    example: 'desc',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de productos obtenida exitosamente',
    schema: {
      example: {
        mensaje: 'Productos obtenidos exitosamente',
        data: {
          productos: [
            {
              id: 'prod-123',
              titulo: 'Camiseta de algodón',
              descripcion: 'Camiseta 100% algodón',
              precio: 29.99,
              precioComparacion: 39.99,
              sku: 'CAM-ALG-BLK-M',
              codigoBarras: '1234567890123',
              peso: 150,
              ancho: 20,
              alto: 30,
              profundidad: 2,
              visible: true,
              fechaCreacion: '2024-01-01T00:00:00.000Z',
              fechaActualizacion: '2024-01-01T00:00:00.000Z',
              creadorId: 'user-123',
            },
          ],
          paginacion: {
            totalElementos: 100,
            totalPaginas: 5,
            paginaActual: 1,
            limite: 20,
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
    @Query('pagina', new DefaultValuePipe(1), ParseIntPipe) pagina: number = 1,
    @Query('limite', new DefaultValuePipe(20), ParseIntPipe) limite: number = 20,
    @Query('titulo') titulo?: string,
    @Query('categoriaId') categoriaId?: string,
    @Query('visible') visible?: boolean,
    @Query('ordenarPor') ordenarPor?: 'titulo' | 'precio' | 'fechaCreacion' | 'fechaActualizacion',
    @Query('orden') orden?: 'asc' | 'desc',
  ) {
    const opciones: OpcionesListado = {
      pagina,
      limite: Math.min(limite, 100), // Limitar máximo a 100
      ordenarPor,
      orden,
    };

    const filtros: FiltrosProductos = {
      titulo,
      categoriaId,
      visible: visible !== undefined ? Boolean(visible) : undefined,
    };

    return await this.listarProductosCasoUso.ejecutar(opciones, filtros);
  }

  @Get('buscar')
  @ApiOperation({
    summary: 'Buscar productos por título',
    description: 'Busca productos por título con paginación',
  })
  @ApiQuery({
    name: 'q',
    required: true,
    type: String,
    description: 'Término de búsqueda (mínimo 2 caracteres)',
    example: 'camiseta',
  })
  @ApiQuery({
    name: 'pagina',
    required: false,
    type: Number,
    description: 'Número de página',
    example: 1,
  })
  @ApiQuery({
    name: 'limite',
    required: false,
    type: Number,
    description: 'Límite de productos por página',
    example: 20,
  })
  @ApiResponse({
    status: 200,
    description: 'Búsqueda completada exitosamente',
  })
  @ApiResponse({
    status: 200,
    description: 'Término de búsqueda muy corto',
    schema: {
      example: {
        mensaje: 'El término de búsqueda debe tener al menos 2 caracteres',
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: 400,
      },
    },
  })
  async buscar(
    @Query('q') query: string,
    @Query('pagina', new DefaultValuePipe(1), ParseIntPipe) pagina: number = 1,
    @Query('limite', new DefaultValuePipe(20), ParseIntPipe) limite: number = 20,
  ) {
    const opciones: OpcionesListado = {
      pagina,
      limite: Math.min(limite, 100),
    };

    return await this.listarProductosCasoUso.buscarPorTitulo(query, opciones);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener producto por ID',
    description: 'Obtiene los detalles completos de un producto específico desde PostgreSQL (fuente de verdad)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del producto',
    example: 'prod-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Producto obtenido exitosamente desde PostgreSQL',
  })
  @ApiResponse({
    status: 200,
    description: 'Producto no encontrado',
    schema: {
      example: {
        mensaje: 'Producto no encontrado',
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: 404,
      },
    },
  })
  async obtenerPorId(@Param() parametros: ParametrosRutaProductoSimpleDto) {
    // TODO: Implementar caso de uso específico para obtener producto por ID desde PostgreSQL
    // Por ahora usamos el repositorio directamente como placeholder
    // En una implementación completa, usaríamos un caso de uso específico para escrituras
    return {
      mensaje: 'Endpoint para obtener producto por ID desde PostgreSQL - Pendiente de implementar',
      data: null,
      tipo_mensaje: 'Advertencia',
      estado_respuesta: 501,
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear nuevo producto',
    description: 'Crea un nuevo producto en el sistema',
  })
  @ApiResponse({
    status: 201,
    description: 'Producto creado exitosamente',
    schema: {
      example: {
        mensaje: 'Producto creado exitosamente',
        data: {
          id: 'prod-123',
          titulo: 'Camiseta de algodón',
          descripcion: 'Camiseta 100% algodón',
          precio: 29.99,
          precioComparacion: 39.99,
          sku: 'CAM-ALG-BLK-M',
          visible: true,
          fechaCreacion: '2024-01-01T00:00:00.000Z',
          fechaActualizacion: '2024-01-01T00:00:00.000Z',
          creadorId: 'user-123',
        },
        tipo_mensaje: 'Exito',
        estado_respuesta: 201,
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Error de validación',
    schema: {
      example: {
        mensaje: 'El SKU ya existe en el sistema',
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: 400,
      },
    },
  })
  async crear(@Body() crearProductoDto: CrearProductoDto) {
    // TODO: Obtener el ID del usuario autenticado del token JWT
    const creadorId = 'user-autenticado'; // Placeholder

    return await this.crearProductoCasoUso.ejecutar({
      ...crearProductoDto,
      creadorId,
    });
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Actualizar producto',
    description: 'Actualiza un producto existente',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del producto a actualizar',
    example: 'prod-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Producto actualizado exitosamente',
  })
  async actualizar(@Param() parametros: ParametrosRutaProductoSimpleDto, @Body() actualizarProductoDto: ActualizarProductoDto) {
    // TODO: Implementar caso de uso para actualizar producto
    return {
      mensaje: 'Endpoint para actualizar producto - Pendiente de implementar',
      data: null,
      tipo_mensaje: 'Advertencia',
      estado_respuesta: 501,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Eliminar producto',
    description: 'Elimina un producto del sistema',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del producto a eliminar',
    example: 'prod-123',
  })
  @ApiResponse({
    status: 204,
    description: 'Producto eliminado exitosamente',
  })
  @ApiResponse({
    status: 200,
    description: 'Producto no encontrado',
    schema: {
      example: {
        mensaje: 'Producto no encontrado',
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: 404,
      },
    },
  })
  async eliminar(@Param() parametros: ParametrosRutaProductoSimpleDto) {
    // TODO: Implementar caso de uso para eliminar producto
    return {
      mensaje: 'Endpoint para eliminar producto - Pendiente de implementar',
      data: null,
      tipo_mensaje: 'Advertencia',
      estado_respuesta: 501,
    };
  }

  // =============================================
  // ENDPOINTS OPTIMIZADOS PARA LECTURAS
  // =============================================

  @Get('lectura/tienda/:tiendaId')
  @ApiOperation({
    summary: 'Listar productos optimizado para lecturas',
    description: 'Obtiene una lista paginada de productos con filtros optimizados para lecturas rápidas usando base de datos de lectura',
  })
  @ApiParam({
    name: 'tiendaId',
    description: 'ID de la tienda',
    example: 'tienda-123',
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
    description: 'Límite de productos por página (por defecto: 50, máximo: 100)',
    example: 50,
  })
  @ApiQuery({
    name: 'visible_tienda_online',
    required: false,
    type: Boolean,
    description: 'Filtrar por visibilidad en tienda online',
    example: true,
  })
  @ApiQuery({
    name: 'categoria_id',
    required: false,
    type: String,
    description: 'Filtrar por ID de categoría',
    example: 'cat-123',
  })
  @ApiQuery({
    name: 'coleccion_id',
    required: false,
    type: String,
    description: 'Filtrar por ID de colección',
    example: 'col-123',
  })
  @ApiQuery({
    name: 'precio_min',
    required: false,
    type: Number,
    description: 'Precio mínimo',
    example: 10,
  })
  @ApiQuery({
    name: 'precio_max',
    required: false,
    type: Number,
    description: 'Precio máximo',
    example: 100,
  })
  @ApiQuery({
    name: 'tags',
    required: false,
    type: [String],
    description: 'Filtrar por tags',
    example: ['nuevo', 'oferta'],
  })
  @ApiQuery({
    name: 'busqueda',
    required: false,
    type: String,
    description: 'Texto de búsqueda',
    example: 'camiseta',
  })
  @ApiQuery({
    name: 'ordenarPor',
    required: false,
    enum: ['titulo', 'precio', 'fecha_publicacion', 'total_ventas', 'promedio_calificacion'],
    description: 'Campo por el cual ordenar',
    example: 'total_ventas',
  })
  @ApiQuery({
    name: 'orden',
    required: false,
    enum: ['asc', 'desc'],
    description: 'Dirección del ordenamiento',
    example: 'desc',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de productos obtenida exitosamente desde MongoDB',
  })
  async listarOptimizado(
    @Param('tiendaId') tiendaId: string,
    @Query('pagina', new DefaultValuePipe(1), ParseIntPipe) pagina: number = 1,
    @Query('limite', new DefaultValuePipe(50), ParseIntPipe) limite: number = 50,
    @Query('visible_tienda_online') visibleTiendaOnline?: boolean,
    @Query('categoria_id') categoriaId?: string,
    @Query('coleccion_id') coleccionId?: string,
    @Query('precio_min') precioMin?: number,
    @Query('precio_max') precioMax?: number,
    @Query('tags') tags?: string,
    @Query('busqueda') busqueda?: string,
    @Query('ordenarPor') ordenarPor?: 'titulo' | 'precio' | 'fecha_publicacion' | 'total_ventas' | 'promedio_calificacion',
    @Query('orden') orden?: 'asc' | 'desc',
  ) {
    const opciones: OpcionesListadoLectura = {
      pagina,
      limite: Math.min(limite, 100),
      ordenarPor,
      orden,
    };

    const filtros: FiltrosProductosLectura = {
      visible_tienda_online: visibleTiendaOnline !== undefined ? Boolean(visibleTiendaOnline) : undefined,
      categoria_id: categoriaId,
      coleccion_id: coleccionId,
      precio_min: precioMin ? Number(precioMin) : undefined,
      precio_max: precioMax ? Number(precioMax) : undefined,
      tags: tags ? tags.split(',') : undefined,
      busqueda,
    };

    const resultado = await this.listarProductosLecturaCasoUso.ejecutar(
      tiendaId,
      opciones,
      filtros
    );

    return {
      mensaje: 'Productos obtenidos exitosamente (Lectura optimizada)',
      data: resultado,
      tipo_mensaje: 'Exito',
      estado_respuesta: 200,
    };
  }

  @Get('lectura/buscar/:tiendaId')
  @ApiOperation({
    summary: 'Buscar productos optimizado para lecturas',
    description: 'Busca productos por texto usando búsqueda optimizada en base de datos de lectura',
  })
  @ApiParam({
    name: 'tiendaId',
    description: 'ID de la tienda',
    example: 'tienda-123',
  })
  @ApiQuery({
    name: 'q',
    required: true,
    type: String,
    description: 'Término de búsqueda (mínimo 2 caracteres)',
    example: 'camiseta algodón',
  })
  @ApiQuery({
    name: 'pagina',
    required: false,
    type: Number,
    description: 'Número de página',
    example: 1,
  })
  @ApiQuery({
    name: 'limite',
    required: false,
    type: Number,
    description: 'Límite de productos por página',
    example: 50,
  })
  @ApiResponse({
    status: 200,
    description: 'Búsqueda completada exitosamente desde MongoDB',
  })
  async buscarOptimizado(
    @Param('tiendaId') tiendaId: string,
    @Query('q') query: string,
    @Query('pagina', new DefaultValuePipe(1), ParseIntPipe) pagina: number = 1,
    @Query('limite', new DefaultValuePipe(50), ParseIntPipe) limite: number = 50,
  ) {
    const opciones: OpcionesListadoLectura = {
      pagina,
      limite: Math.min(limite, 100),
    };

    const resultado = await this.listarProductosLecturaCasoUso.buscarPorTexto(
      tiendaId,
      query,
      opciones
    );

    return {
      mensaje: 'Búsqueda completada exitosamente (Lectura optimizada)',
      data: resultado,
      tipo_mensaje: 'Exito',
      estado_respuesta: 200,
    };
  }

  @Get('lectura/mas-vendidos/:tiendaId')
  @ApiOperation({
    summary: 'Productos más vendidos',
    description: 'Obtiene los productos más vendidos desde base de datos de lectura optimizada',
  })
  @ApiParam({
    name: 'tiendaId',
    description: 'ID de la tienda',
    example: 'tienda-123',
  })
  @ApiQuery({
    name: 'limite',
    required: false,
    type: Number,
    description: 'Límite de productos (por defecto: 10, máximo: 50)',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Productos más vendidos obtenidos exitosamente',
  })
  async obtenerMasVendidos(
    @Param('tiendaId') tiendaId: string,
    @Query('limite', new DefaultValuePipe(10), ParseIntPipe) limite: number = 10,
  ) {
    const productos = await this.listarProductosLecturaCasoUso.obtenerMasVendidos(
      tiendaId,
      Math.min(limite, 50)
    );

    return {
      mensaje: 'Productos más vendidos obtenidos exitosamente',
      data: productos,
      tipo_mensaje: 'Exito',
      estado_respuesta: 200,
    };
  }

  @Get('lectura/mejor-calificados/:tiendaId')
  @ApiOperation({
    summary: 'Productos mejor calificados',
    description: 'Obtiene los productos mejor calificados desde base de datos de lectura optimizada',
  })
  @ApiParam({
    name: 'tiendaId',
    description: 'ID de la tienda',
    example: 'tienda-123',
  })
  @ApiQuery({
    name: 'limite',
    required: false,
    type: Number,
    description: 'Límite de productos (por defecto: 10, máximo: 50)',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Productos mejor calificados obtenidos exitosamente',
  })
  async obtenerMejorCalificados(
    @Param('tiendaId') tiendaId: string,
    @Query('limite', new DefaultValuePipe(10), ParseIntPipe) limite: number = 10,
  ) {
    const productos = await this.listarProductosLecturaCasoUso.obtenerMejorCalificados(
      tiendaId,
      Math.min(limite, 50)
    );

    return {
      mensaje: 'Productos mejor calificados obtenidos exitosamente',
      data: productos,
      tipo_mensaje: 'Exito',
      estado_respuesta: 200,
    };
  }

  @Get('lectura/:tiendaId/:id')
  @ApiOperation({
    summary: 'Obtener producto por ID optimizado',
    description: 'Obtiene los detalles de un producto específico desde base de datos de lectura optimizada',
  })
  @ApiParam({
    name: 'tiendaId',
    description: 'ID de la tienda',
    example: 'tienda-123',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del producto',
    example: 'prod-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Producto obtenido exitosamente desde MongoDB',
  })
  @ApiResponse({
    status: 200,
    description: 'Producto no encontrado',
  })
  async obtenerPorIdOptimizado(
    @Param() parametros: ParametrosRutaProductoConIdDto,
  ) {
    return await this.listarProductosLecturaCasoUso.encontrarPorId(
      parametros.tiendaId,
      parametros.id
    );
  }

  @Get('lectura/slug/:tiendaId/:slug')
  @ApiOperation({
    summary: 'Obtener producto por slug optimizado',
    description: 'Obtiene los detalles de un producto por slug desde base de datos de lectura optimizada',
  })
  @ApiParam({
    name: 'tiendaId',
    description: 'ID de la tienda',
    example: 'tienda-123',
  })
  @ApiParam({
    name: 'slug',
    description: 'Slug del producto',
    example: 'camiseta-algodon',
  })
  @ApiResponse({
    status: 200,
    description: 'Producto obtenido exitosamente desde MongoDB',
  })
  @ApiResponse({
    status: 200,
    description: 'Producto no encontrado',
  })
  async obtenerPorSlugOptimizado(
    @Param() parametros: ParametrosRutaProductoDto,
  ) {
    return await this.listarProductosLecturaCasoUso.encontrarPorSlug(
      parametros.tiendaId,
      parametros.slug
    );
  }
}