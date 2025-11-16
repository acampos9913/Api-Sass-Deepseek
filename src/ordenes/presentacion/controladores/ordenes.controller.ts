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
import { CrearOrdenDto } from '../../aplicacion/dto/crear-orden.dto';
import { CrearOrdenCasoUso } from '../../dominio/casos-uso/crear-orden.caso-uso';
import { ListarOrdenesCasoUso, OpcionesListadoOrdenes } from '../../dominio/casos-uso/listar-ordenes.caso-uso';
import { GestionAvanzadaOrdenesCasoUso } from '../../dominio/casos-uso/gestion-avanzada-ordenes.caso-uso';
import type { ExportarOrdenesCsvDto, ActualizarDatosClienteDto, ActualizarDatosEnvioDto, ActualizarDatosFacturacionDto } from '../../dominio/casos-uso/gestion-avanzada-ordenes.caso-uso';
import { FiltrosOrdenes } from '../../dominio/interfaces/repositorio-orden.interface';
import { Orden } from '../../dominio/entidades/orden.entity';
import { EstadoOrden, EstadoPago } from '../../dominio/enums/estado-orden.enum';

/**
 * Controlador para la gestión de órdenes
 * Expone todas las APIs necesarias para el frontend
 */
@ApiTags('Órdenes')
@Controller('api/v1/ordenes')
@UsePipes(new ValidationPipe({ transform: true }))
export class OrdenesController {
  constructor(
    private readonly crearOrdenCasoUso: CrearOrdenCasoUso,
    private readonly listarOrdenesCasoUso: ListarOrdenesCasoUso,
    private readonly gestionAvanzadaOrdenesCasoUso: GestionAvanzadaOrdenesCasoUso,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Listar órdenes',
    description: 'Obtiene una lista paginada de órdenes con filtros opcionales',
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
    description: 'Límite de órdenes por página (por defecto: 20, máximo: 100)',
    example: 20,
  })
  @ApiQuery({
    name: 'estado',
    required: false,
    enum: EstadoOrden,
    description: 'Filtrar por estado de orden',
    example: EstadoOrden.PENDIENTE,
  })
  @ApiQuery({
    name: 'estadoPago',
    required: false,
    enum: EstadoPago,
    description: 'Filtrar por estado de pago',
    example: EstadoPago.PAGADO,
  })
  @ApiQuery({
    name: 'clienteId',
    required: false,
    type: String,
    description: 'Filtrar por ID de cliente',
    example: 'cliente-123',
  })
  @ApiQuery({
    name: 'numeroOrden',
    required: false,
    type: String,
    description: 'Filtrar por número de orden (búsqueda parcial)',
    example: 'ORD-2024',
  })
  @ApiQuery({
    name: 'fechaDesde',
    required: false,
    type: String,
    description: 'Filtrar desde fecha (formato: YYYY-MM-DD)',
    example: '2024-01-01',
  })
  @ApiQuery({
    name: 'fechaHasta',
    required: false,
    type: String,
    description: 'Filtrar hasta fecha (formato: YYYY-MM-DD)',
    example: '2024-12-31',
  })
  @ApiQuery({
    name: 'ordenarPor',
    required: false,
    enum: ['fechaCreacion', 'fechaActualizacion', 'total', 'numeroOrden'],
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
    description: 'Lista de órdenes obtenida exitosamente',
    schema: {
      example: {
        mensaje: 'Órdenes obtenidas exitosamente',
        data: {
          ordenes: [
            {
              id: 'ord-123',
              numeroOrden: 'ORD-20240101-123456-ABCD',
              clienteId: 'cliente-123',
              estado: 'PENDIENTE',
              subtotal: 59.98,
              impuestos: 10.80,
              total: 70.78,
              metodoPago: 'TARJETA_CREDITO',
              estadoPago: 'PENDIENTE',
              metodoEnvio: 'Envío estándar',
              costoEnvio: 5.00,
              direccionEnvioId: 'dir-123',
              notas: 'Entregar después de las 5pm',
              fechaCreacion: '2024-01-01T00:00:00.000Z',
              fechaActualizacion: '2024-01-01T00:00:00.000Z',
              fechaPago: null,
              fechaEnvio: null,
              fechaEntrega: null,
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
    @Query('estado') estado?: EstadoOrden,
    @Query('estadoPago') estadoPago?: EstadoPago,
    @Query('clienteId') clienteId?: string,
    @Query('numeroOrden') numeroOrden?: string,
    @Query('fechaDesde') fechaDesde?: string,
    @Query('fechaHasta') fechaHasta?: string,
    @Query('ordenarPor') ordenarPor?: 'fechaCreacion' | 'fechaActualizacion' | 'total' | 'numeroOrden',
    @Query('orden') orden?: 'asc' | 'desc',
  ) {
    const opciones: OpcionesListadoOrdenes = {
      pagina,
      limite: Math.min(limite, 100),
      ordenarPor,
      orden,
    };

    const filtros: FiltrosOrdenes = {
      estado,
      estadoPago,
      clienteId,
      numeroOrden,
      fechaDesde: fechaDesde ? new Date(fechaDesde) : undefined,
      fechaHasta: fechaHasta ? new Date(fechaHasta) : undefined,
    };

    return await this.listarOrdenesCasoUso.ejecutar(opciones, filtros);
  }

  @Get('estadisticas')
  @ApiOperation({
    summary: 'Obtener estadísticas de órdenes',
    description: 'Obtiene estadísticas para el dashboard (total órdenes, ventas, etc.)',
  })
  @ApiQuery({
    name: 'fechaDesde',
    required: false,
    type: String,
    description: 'Fecha desde para filtrar (formato: YYYY-MM-DD)',
    example: '2024-01-01',
  })
  @ApiQuery({
    name: 'fechaHasta',
    required: false,
    type: String,
    description: 'Fecha hasta para filtrar (formato: YYYY-MM-DD)',
    example: '2024-12-31',
  })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas obtenidas exitosamente',
    schema: {
      example: {
        mensaje: 'Estadísticas obtenidas exitosamente',
        data: {
          totalOrdenes: 150,
          totalVentas: 45000,
          ordenesPorEstado: {
            PENDIENTE: 25,
            CONFIRMADA: 40,
            PROCESANDO: 30,
            ENVIADA: 35,
            ENTREGADA: 20,
            CANCELADA: 0,
            REEMBOLSADA: 0,
          },
          ventasPorPeriodo: [
            {
              periodo: '2024-01',
              totalVentas: 15000,
              cantidadOrdenes: 45,
            },
            {
              periodo: '2024-02',
              totalVentas: 18000,
              cantidadOrdenes: 52,
            },
          ],
        },
        tipo_mensaje: 'Exito',
        estado_respuesta: 200,
      },
    },
  })
  async obtenerEstadisticas(
    @Query('fechaDesde') fechaDesde?: string,
    @Query('fechaHasta') fechaHasta?: string,
  ) {
    return await this.listarOrdenesCasoUso.obtenerEstadisticas(
      fechaDesde ? new Date(fechaDesde) : undefined,
      fechaHasta ? new Date(fechaHasta) : undefined,
    );
  }

  @Get('buscar')
  @ApiOperation({
    summary: 'Buscar órdenes por número de orden',
    description: 'Busca órdenes por número de orden exacto',
  })
  @ApiQuery({
    name: 'q',
    required: true,
    type: String,
    description: 'Número de orden a buscar (mínimo 3 caracteres)',
    example: 'ORD-20240101',
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
    description: 'Límite de órdenes por página',
    example: 20,
  })
  @ApiResponse({
    status: 200,
    description: 'Búsqueda completada exitosamente',
  })
  async buscar(
    @Query('q') query: string,
    @Query('pagina', new DefaultValuePipe(1), ParseIntPipe) pagina: number = 1,
    @Query('limite', new DefaultValuePipe(20), ParseIntPipe) limite: number = 20,
  ) {
    const opciones: OpcionesListadoOrdenes = {
      pagina,
      limite: Math.min(limite, 100),
    };

    return await this.listarOrdenesCasoUso.buscarPorNumeroOrden(query, opciones);
  }

  @Get('cliente/:clienteId')
  @ApiOperation({
    summary: 'Listar órdenes por cliente',
    description: 'Obtiene las órdenes de un cliente específico',
  })
  @ApiParam({
    name: 'clienteId',
    description: 'ID del cliente',
    example: 'cliente-123',
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
    description: 'Límite de órdenes por página',
    example: 20,
  })
  @ApiResponse({
    status: 200,
    description: 'Órdenes del cliente obtenidas exitosamente',
  })
  async listarPorCliente(
    @Param('clienteId') clienteId: string,
    @Query('pagina', new DefaultValuePipe(1), ParseIntPipe) pagina: number = 1,
    @Query('limite', new DefaultValuePipe(20), ParseIntPipe) limite: number = 20,
  ) {
    const opciones: OpcionesListadoOrdenes = {
      pagina,
      limite: Math.min(limite, 100),
    };

    return await this.listarOrdenesCasoUso.listarPorCliente(clienteId, opciones);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener orden por ID',
    description: 'Obtiene los detalles completos de una orden específica',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la orden',
    example: 'ord-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Orden obtenida exitosamente',
  })
  @ApiResponse({
    status: 200,
    description: 'Orden no encontrada',
    schema: {
      example: {
        mensaje: 'Orden no encontrada',
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: 404,
      },
    },
  })
  async obtenerPorId(@Param('id') id: string) {
    // TODO: Implementar caso de uso para obtener orden por ID
    return {
      mensaje: 'Endpoint para obtener orden por ID - Pendiente de implementar',
      data: null,
      tipo_mensaje: 'Advertencia',
      estado_respuesta: 501,
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear nueva orden',
    description: 'Crea una nueva orden en el sistema',
  })
  @ApiResponse({
    status: 201,
    description: 'Orden creada exitosamente',
    schema: {
      example: {
        mensaje: 'Orden creada exitosamente',
        data: {
          id: 'ord-123',
          numeroOrden: 'ORD-20240101-123456-ABCD',
          clienteId: 'cliente-123',
          estado: 'PENDIENTE',
          subtotal: 59.98,
          impuestos: 10.80,
          total: 70.78,
          metodoPago: 'TARJETA_CREDITO',
          estadoPago: 'PENDIENTE',
          metodoEnvio: 'Envío estándar',
          costoEnvio: 5.00,
          direccionEnvioId: 'dir-123',
          notas: 'Entregar después de las 5pm',
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
        mensaje: 'El total calculado no coincide con el total proporcionado',
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: 400,
      },
    },
  })
  async crear(@Body() crearOrdenDto: CrearOrdenDto) {
    // TODO: Obtener el ID del usuario autenticado del token JWT
    const creadorId = 'user-autenticado'; // Placeholder

    return await this.crearOrdenCasoUso.ejecutar({
      ...crearOrdenDto,
      creadorId,
    });
  }

  @Put(':id/estado')
  @ApiOperation({
    summary: 'Actualizar estado de la orden',
    description: 'Actualiza el estado de una orden existente',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la orden a actualizar',
    example: 'ord-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Estado de orden actualizado exitosamente',
  })
  async actualizarEstado(@Param('id') id: string, @Body() actualizarEstadoDto: any) {
    // TODO: Implementar caso de uso para actualizar estado de orden
    return {
      mensaje: 'Endpoint para actualizar estado de orden - Pendiente de implementar',
      data: null,
      tipo_mensaje: 'Advertencia',
      estado_respuesta: 501,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Eliminar orden',
    description: 'Elimina una orden del sistema',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la orden a eliminar',
    example: 'ord-123',
  })
  @ApiResponse({
    status: 204,
    description: 'Orden eliminada exitosamente',
  })
  @ApiResponse({
    status: 200,
    description: 'Orden no encontrada',
    schema: {
      example: {
        mensaje: 'Orden no encontrada',
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: 404,
      },
    },
  })
  async eliminar(@Param('id') id: string) {
    // TODO: Implementar caso de uso para eliminar orden
    return {
      mensaje: 'Endpoint para eliminar orden - Pendiente de implementar',
      data: null,
      tipo_mensaje: 'Advertencia',
      estado_respuesta: 501,
    };
  }

  @Get('borradores')
  @ApiOperation({
    summary: 'Listar borradores de órdenes',
    description: 'Obtiene una lista paginada de borradores de órdenes',
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
    description: 'Límite de órdenes por página (por defecto: 20, máximo: 100)',
    example: 20,
  })
  @ApiResponse({
    status: 200,
    description: 'Borradores obtenidos exitosamente',
  })
  async listarBorradores(
    @Query('pagina', new DefaultValuePipe(1), ParseIntPipe) pagina: number = 1,
    @Query('limite', new DefaultValuePipe(20), ParseIntPipe) limite: number = 20,
  ) {
    return await this.gestionAvanzadaOrdenesCasoUso.listarBorradores(pagina, limite);
  }

  @Get('abandonadas')
  @ApiOperation({
    summary: 'Listar órdenes abandonadas',
    description: 'Obtiene una lista paginada de órdenes abandonadas con filtros por fecha',
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
    description: 'Límite de órdenes por página (por defecto: 20, máximo: 100)',
    example: 20,
  })
  @ApiQuery({
    name: 'fechaDesde',
    required: false,
    type: String,
    description: 'Fecha desde para filtrar (formato: YYYY-MM-DD)',
    example: '2024-01-01',
  })
  @ApiQuery({
    name: 'fechaHasta',
    required: false,
    type: String,
    description: 'Fecha hasta para filtrar (formato: YYYY-MM-DD)',
    example: '2024-12-31',
  })
  @ApiResponse({
    status: 200,
    description: 'Órdenes abandonadas obtenidas exitosamente',
  })
  async listarAbandonadas(
    @Query('pagina', new DefaultValuePipe(1), ParseIntPipe) pagina: number = 1,
    @Query('limite', new DefaultValuePipe(20), ParseIntPipe) limite: number = 20,
    @Query('fechaDesde') fechaDesde?: string,
    @Query('fechaHasta') fechaHasta?: string,
  ) {
    const fechaDesdeDate = fechaDesde ? new Date(fechaDesde) : undefined;
    const fechaHastaDate = fechaHasta ? new Date(fechaHasta) : undefined;

    return await this.gestionAvanzadaOrdenesCasoUso.listarAbandonadas(
      fechaDesdeDate,
      fechaHastaDate,
      pagina,
      limite,
    );
  }

  @Get('archivadas')
  @ApiOperation({
    summary: 'Listar órdenes archivadas',
    description: 'Obtiene una lista paginada de órdenes archivadas',
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
    description: 'Límite de órdenes por página (por defecto: 20, máximo: 100)',
    example: 20,
  })
  @ApiResponse({
    status: 200,
    description: 'Órdenes archivadas obtenidas exitosamente',
  })
  async listarArchivadas(
    @Query('pagina', new DefaultValuePipe(1), ParseIntPipe) pagina: number = 1,
    @Query('limite', new DefaultValuePipe(20), ParseIntPipe) limite: number = 20,
  ) {
    return await this.gestionAvanzadaOrdenesCasoUso.listarArchivadas(pagina, limite);
  }

  @Post('exportar/csv')
  @ApiOperation({
    summary: 'Exportar órdenes a CSV',
    description: 'Exporta órdenes a formato CSV con filtros aplicables',
  })
  @ApiResponse({
    status: 200,
    description: 'Órdenes exportadas exitosamente',
    content: {
      'text/csv': {
        schema: {
          type: 'string',
          example: 'csv file content'
        }
      }
    }
  })
  async exportarOrdenesCsv(@Body() exportarDto: ExportarOrdenesCsvDto) {
    const resultado = await this.gestionAvanzadaOrdenesCasoUso.exportarOrdenesCsv(exportarDto);
    
    // Configurar headers para descarga
    // Nota: En NestJS, para descargar archivos se debe usar el decorador @Res() y manejar la respuesta manualmente
    // Este endpoint retornaría el contenido CSV como string, el frontend debería manejarlo como descarga
    
    return {
      mensaje: 'Órdenes exportadas exitosamente',
      data: resultado,
      tipo_mensaje: 'Exito',
      estado_respuesta: 200,
    };
  }

  @Put(':id/marcar-pagado')
  @ApiOperation({
    summary: 'Marcar orden como pagada',
    description: 'Marca una orden como pagada actualizando su estado de pago',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la orden a marcar como pagada',
    example: 'ord-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Orden marcada como pagada exitosamente',
  })
  async marcarComoPagada(@Param('id') id: string) {
    return await this.gestionAvanzadaOrdenesCasoUso.marcarComoPagada(id);
  }

  @Post(':id/duplicar')
  @ApiOperation({
    summary: 'Duplicar orden',
    description: 'Crea una copia de una orden existente',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la orden a duplicar',
    example: 'ord-123',
  })
  @ApiResponse({
    status: 201,
    description: 'Orden duplicada exitosamente',
  })
  async duplicarOrden(@Param('id') id: string) {
    // TODO: Obtener el ID del usuario autenticado del token JWT
    const creadorId = 'user-autenticado'; // Placeholder
    
    return await this.gestionAvanzadaOrdenesCasoUso.duplicarOrden(id, creadorId);
  }

  @Post(':id/reposicion')
  @ApiOperation({
    summary: 'Crear reposición de orden',
    description: 'Crea una reposición (reemplazo) de una orden existente',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la orden original',
    example: 'ord-123',
  })
  @ApiResponse({
    status: 201,
    description: 'Reposición de orden creada exitosamente',
  })
  async crearReposicion(@Param('id') id: string) {
    // TODO: Obtener el ID del usuario autenticado del token JWT
    const creadorId = 'user-autenticado'; // Placeholder
    
    return await this.gestionAvanzadaOrdenesCasoUso.crearReposicion(id, creadorId);
  }

  @Put(':id/archivar')
  @ApiOperation({
    summary: 'Archivar orden',
    description: 'Archiva una orden existente',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la orden a archivar',
    example: 'ord-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Orden archivada exitosamente',
  })
  async archivarOrden(@Param('id') id: string) {
    return await this.gestionAvanzadaOrdenesCasoUso.archivarOrden(id);
  }

  @Put(':id/desarchivar')
  @ApiOperation({
    summary: 'Desarchivar orden',
    description: 'Desarchiva una orden existente',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la orden a desarchivar',
    example: 'ord-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Orden desarchivada exitosamente',
  })
  async desarchivarOrden(@Param('id') id: string) {
    return await this.gestionAvanzadaOrdenesCasoUso.desarchivarOrden(id);
  }

  @Put(':id/cancelar')
  @ApiOperation({
    summary: 'Cancelar orden con motivo',
    description: 'Cancela una orden existente especificando el motivo',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la orden a cancelar',
    example: 'ord-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Orden cancelada exitosamente',
  })
  async cancelarOrden(@Param('id') id: string, @Body() body: { motivo: string }) {
    return await this.gestionAvanzadaOrdenesCasoUso.cancelarOrden(id, body.motivo);
  }

  @Put(':id/notas-internas')
  @ApiOperation({
    summary: 'Agregar notas internas',
    description: 'Agrega notas internas a una orden existente',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la orden a actualizar',
    example: 'ord-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Notas internas agregadas exitosamente',
  })
  async agregarNotasInternas(@Param('id') id: string, @Body() body: { notas: string }) {
    return await this.gestionAvanzadaOrdenesCasoUso.agregarNotasInternas(id, body.notas);
  }

  @Put(':id/datos-cliente')
  @ApiOperation({
    summary: 'Actualizar datos del cliente en la orden',
    description: 'Actualiza los datos del cliente en una orden existente',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la orden a actualizar',
    example: 'ord-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Datos del cliente actualizados exitosamente',
  })
  async actualizarDatosCliente(@Param('id') id: string, @Body() datosCliente: ActualizarDatosClienteDto) {
    return await this.gestionAvanzadaOrdenesCasoUso.actualizarDatosCliente(id, datosCliente);
  }

  @Put(':id/datos-envio')
  @ApiOperation({
    summary: 'Actualizar datos de envío en la orden',
    description: 'Actualiza los datos de envío en una orden existente',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la orden a actualizar',
    example: 'ord-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Datos de envío actualizados exitosamente',
  })
  async actualizarDatosEnvio(@Param('id') id: string, @Body() datosEnvio: ActualizarDatosEnvioDto) {
    return await this.gestionAvanzadaOrdenesCasoUso.actualizarDatosEnvio(id, datosEnvio);
  }

  @Put(':id/datos-facturacion')
  @ApiOperation({
    summary: 'Actualizar datos de facturación en la orden',
    description: 'Actualiza los datos de facturación en una orden existente',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la orden a actualizar',
    example: 'ord-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Datos de facturación actualizados exitosamente',
  })
  async actualizarDatosFacturacion(@Param('id') id: string, @Body() datosFacturacion: ActualizarDatosFacturacionDto) {
    return await this.gestionAvanzadaOrdenesCasoUso.actualizarDatosFacturacion(id, datosFacturacion);
  }

}