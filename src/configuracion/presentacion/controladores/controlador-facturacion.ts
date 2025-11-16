import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
  Inject
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody
} from '@nestjs/swagger';
import { GestionFacturacionCasoUso } from '../../dominio/casos-uso/gestion-facturacion.caso-uso';
import {
  ConfiguracionFacturacionDto,
  MetodoPagoDto,
  FacturaHistorialDto,
  NotificacionPagoDto
} from '../../aplicacion/dto/configuracion-facturacion.dto';
import { RespuestaEstandarDto } from '../../../comun/dto/respuesta-estandar.dto';

/**
 * Controlador para Gestión de Configuración de Facturación
 * Expone endpoints RESTful para operaciones de facturación según reglas Ecommerce Sass
 */
@ApiTags('Configuración - Facturación')
@Controller('configuracion/facturacion')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class ControladorFacturacion {
  constructor(
    @Inject(GestionFacturacionCasoUso)
    private readonly gestionFacturacionCasoUso: GestionFacturacionCasoUso
  ) {}

  /**
   * Crear nueva configuración de facturación
   */
  @Post('tiendas/:tiendaId')
  @ApiOperation({
    summary: 'Crear configuración de facturación',
    description: 'Crea una nueva configuración de facturación para una tienda específica'
  })
  @ApiParam({
    name: 'tiendaId',
    description: 'ID de la tienda',
    example: 'tienda-123'
  })
  @ApiBody({
    type: ConfiguracionFacturacionDto,
    description: 'Datos de la configuración de facturación'
  })
  @ApiResponse({
    status: 201,
    description: 'Configuración de facturación creada exitosamente',
    type: RespuestaEstandarDto
  })
  @ApiResponse({
    status: 400,
    description: 'Error de validación en los datos proporcionados',
    type: RespuestaEstandarDto
  })
  @ApiResponse({
    status: 409,
    description: 'Ya existe una configuración de facturación para esta tienda',
    type: RespuestaEstandarDto
  })
  async crear(
    @Param('tiendaId') tiendaId: string,
    @Body() datos: ConfiguracionFacturacionDto
  ) {
    return await this.gestionFacturacionCasoUso.crear(tiendaId, datos);
  }

  /**
   * Obtener configuración de facturación por ID de tienda
   */
  @Get('tiendas/:tiendaId')
  @ApiOperation({
    summary: 'Obtener configuración de facturación',
    description: 'Obtiene la configuración de facturación de una tienda específica'
  })
  @ApiParam({
    name: 'tiendaId',
    description: 'ID de la tienda',
    example: 'tienda-123'
  })
  @ApiResponse({
    status: 200,
    description: 'Configuración de facturación obtenida exitosamente',
    type: RespuestaEstandarDto
  })
  @ApiResponse({
    status: 404,
    description: 'Configuración de facturación no encontrada',
    type: RespuestaEstandarDto
  })
  async obtenerPorTiendaId(@Param('tiendaId') tiendaId: string) {
    return await this.gestionFacturacionCasoUso.obtenerPorTiendaId(tiendaId);
  }

  /**
   * Actualizar configuración de facturación
   */
  @Put('tiendas/:tiendaId')
  @ApiOperation({
    summary: 'Actualizar configuración de facturación',
    description: 'Actualiza la configuración de facturación de una tienda específica'
  })
  @ApiParam({
    name: 'tiendaId',
    description: 'ID de la tienda',
    example: 'tienda-123'
  })
  @ApiBody({
    type: ConfiguracionFacturacionDto,
    description: 'Datos actualizados de la configuración de facturación'
  })
  @ApiResponse({
    status: 200,
    description: 'Configuración de facturación actualizada exitosamente',
    type: RespuestaEstandarDto
  })
  @ApiResponse({
    status: 400,
    description: 'Error de validación en los datos proporcionados',
    type: RespuestaEstandarDto
  })
  @ApiResponse({
    status: 404,
    description: 'Configuración de facturación no encontrada',
    type: RespuestaEstandarDto
  })
  async actualizar(
    @Param('tiendaId') tiendaId: string,
    @Body() datos: ConfiguracionFacturacionDto
  ) {
    return await this.gestionFacturacionCasoUso.actualizar(tiendaId, datos);
  }

  /**
   * Agregar método de pago
   */
  @Post('tiendas/:tiendaId/metodos-pago')
  @ApiOperation({
    summary: 'Agregar método de pago',
    description: 'Agrega un nuevo método de pago a la configuración de facturación'
  })
  @ApiParam({
    name: 'tiendaId',
    description: 'ID de la tienda',
    example: 'tienda-123'
  })
  @ApiBody({
    type: MetodoPagoDto,
    description: 'Datos del método de pago a agregar'
  })
  @ApiResponse({
    status: 200,
    description: 'Método de pago agregado exitosamente',
    type: RespuestaEstandarDto
  })
  @ApiResponse({
    status: 400,
    description: 'Error de validación en los datos del método de pago',
    type: RespuestaEstandarDto
  })
  @ApiResponse({
    status: 404,
    description: 'Configuración de facturación no encontrada',
    type: RespuestaEstandarDto
  })
  @ApiResponse({
    status: 409,
    description: 'Ya existe un método de pago activo del mismo tipo',
    type: RespuestaEstandarDto
  })
  async agregarMetodoPago(
    @Param('tiendaId') tiendaId: string,
    @Body() metodoPago: MetodoPagoDto
  ) {
    return await this.gestionFacturacionCasoUso.agregarMetodoPago(tiendaId, metodoPago);
  }

  /**
   * Desactivar método de pago
   */
  @Patch('tiendas/:tiendaId/metodos-pago/:tipoMetodo/desactivar')
  @ApiOperation({
    summary: 'Desactivar método de pago',
    description: 'Desactiva un método de pago específico en la configuración de facturación'
  })
  @ApiParam({
    name: 'tiendaId',
    description: 'ID de la tienda',
    example: 'tienda-123'
  })
  @ApiParam({
    name: 'tipoMetodo',
    description: 'Tipo de método de pago a desactivar',
    enum: ['tarjeta de crédito', 'cuenta bancaria', 'PayPal', 'transferencia', 'efectivo'],
    example: 'tarjeta de crédito'
  })
  @ApiResponse({
    status: 200,
    description: 'Método de pago desactivado exitosamente',
    type: RespuestaEstandarDto
  })
  @ApiResponse({
    status: 404,
    description: 'Configuración de facturación o método de pago no encontrado',
    type: RespuestaEstandarDto
  })
  async desactivarMetodoPago(
    @Param('tiendaId') tiendaId: string,
    @Param('tipoMetodo') tipoMetodo: string
  ) {
    return await this.gestionFacturacionCasoUso.desactivarMetodoPago(tiendaId, tipoMetodo);
  }

  /**
   * Agregar factura al historial
   */
  @Post('tiendas/:tiendaId/historial-facturas')
  @ApiOperation({
    summary: 'Agregar factura al historial',
    description: 'Agrega una nueva factura al historial de facturación'
  })
  @ApiParam({
    name: 'tiendaId',
    description: 'ID de la tienda',
    example: 'tienda-123'
  })
  @ApiBody({
    type: FacturaHistorialDto,
    description: 'Datos de la factura a agregar al historial'
  })
  @ApiResponse({
    status: 200,
    description: 'Factura agregada al historial exitosamente',
    type: RespuestaEstandarDto
  })
  @ApiResponse({
    status: 400,
    description: 'Error de validación en los datos de la factura',
    type: RespuestaEstandarDto
  })
  @ApiResponse({
    status: 404,
    description: 'Configuración de facturación no encontrada',
    type: RespuestaEstandarDto
  })
  @ApiResponse({
    status: 409,
    description: 'El número de factura ya existe en el historial',
    type: RespuestaEstandarDto
  })
  async agregarFacturaHistorial(
    @Param('tiendaId') tiendaId: string,
    @Body() factura: FacturaHistorialDto
  ) {
    return await this.gestionFacturacionCasoUso.agregarFacturaHistorial(tiendaId, factura);
  }

  /**
   * Actualizar notificaciones de pago
   */
  @Put('tiendas/:tiendaId/notificaciones')
  @ApiOperation({
    summary: 'Actualizar notificaciones de pago',
    description: 'Actualiza la configuración de notificaciones de pago'
  })
  @ApiParam({
    name: 'tiendaId',
    description: 'ID de la tienda',
    example: 'tienda-123'
  })
  @ApiBody({
    type: NotificacionPagoDto,
    description: 'Datos actualizados de las notificaciones de pago'
  })
  @ApiResponse({
    status: 200,
    description: 'Notificaciones de pago actualizadas exitosamente',
    type: RespuestaEstandarDto
  })
  @ApiResponse({
    status: 400,
    description: 'Error de validación en los datos de notificaciones',
    type: RespuestaEstandarDto
  })
  @ApiResponse({
    status: 404,
    description: 'Configuración de facturación no encontrada',
    type: RespuestaEstandarDto
  })
  async actualizarNotificaciones(
    @Param('tiendaId') tiendaId: string,
    @Body() notificaciones: NotificacionPagoDto
  ) {
    return await this.gestionFacturacionCasoUso.actualizarNotificaciones(tiendaId, notificaciones);
  }

  /**
   * Eliminar configuración de facturación
   */
  @Delete('tiendas/:tiendaId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Eliminar configuración de facturación',
    description: 'Elimina la configuración de facturación de una tienda específica'
  })
  @ApiParam({
    name: 'tiendaId',
    description: 'ID de la tienda',
    example: 'tienda-123'
  })
  @ApiResponse({
    status: 200,
    description: 'Configuración de facturación eliminada exitosamente',
    type: RespuestaEstandarDto
  })
  @ApiResponse({
    status: 404,
    description: 'Configuración de facturación no encontrada',
    type: RespuestaEstandarDto
  })
  async eliminar(@Param('tiendaId') tiendaId: string) {
    return await this.gestionFacturacionCasoUso.eliminar(tiendaId);
  }

  /**
   * Listar configuraciones de facturación (administración)
   */
  @Get('administracion')
  @ApiOperation({
    summary: 'Listar configuraciones de facturación',
    description: 'Lista todas las configuraciones de facturación (solo para administración)'
  })
  @ApiQuery({
    name: 'pagina',
    required: false,
    description: 'Número de página',
    example: 1
  })
  @ApiQuery({
    name: 'limite',
    required: false,
    description: 'Límite de resultados por página',
    example: 10
  })
  @ApiResponse({
    status: 200,
    description: 'Configuraciones de facturación listadas exitosamente',
    type: RespuestaEstandarDto
  })
  async listar(
    @Query('pagina') pagina: number = 1,
    @Query('limite') limite: number = 10
  ) {
    return await this.gestionFacturacionCasoUso.listar(pagina, limite);
  }

  /**
   * Obtener métodos de pago activos
   */
  @Get('tiendas/:tiendaId/metodos-pago/activos')
  @ApiOperation({
    summary: 'Obtener métodos de pago activos',
    description: 'Obtiene todos los métodos de pago activos para una tienda'
  })
  @ApiParam({
    name: 'tiendaId',
    description: 'ID de la tienda',
    example: 'tienda-123'
  })
  @ApiResponse({
    status: 200,
    description: 'Métodos de pago activos obtenidos exitosamente',
    type: RespuestaEstandarDto
  })
  @ApiResponse({
    status: 404,
    description: 'Configuración de facturación no encontrada',
    type: RespuestaEstandarDto
  })
  async obtenerMetodosPagoActivos(@Param('tiendaId') tiendaId: string) {
    const resultado = await this.gestionFacturacionCasoUso.obtenerPorTiendaId(tiendaId);
    
    if (resultado.data && typeof resultado.data === 'object' && resultado.data !== null) {
      const data = resultado.data as any;
      const metodosActivos = data.metodos_pago?.filter((metodo: any) => metodo.estado_activo) || [];
      return {
        ...resultado,
        data: {
          ...data,
          metodos_pago: metodosActivos
        }
      };
    }
    
    return resultado;
  }

  /**
   * Obtener historial de facturas filtrado por estado
   */
  @Get('tiendas/:tiendaId/historial-facturas')
  @ApiOperation({
    summary: 'Obtener historial de facturas',
    description: 'Obtiene el historial de facturas filtrado por estado (opcional)'
  })
  @ApiParam({
    name: 'tiendaId',
    description: 'ID de la tienda',
    example: 'tienda-123'
  })
  @ApiQuery({
    name: 'estado',
    required: false,
    description: 'Estado de factura para filtrar',
    enum: ['pendiente', 'pagada', 'vencida'],
    example: 'pendiente'
  })
  @ApiResponse({
    status: 200,
    description: 'Historial de facturas obtenido exitosamente',
    type: RespuestaEstandarDto
  })
  @ApiResponse({
    status: 404,
    description: 'Configuración de facturación no encontrada',
    type: RespuestaEstandarDto
  })
  async obtenerHistorialFacturas(
    @Param('tiendaId') tiendaId: string,
    @Query('estado') estado?: string
  ) {
    const resultado = await this.gestionFacturacionCasoUso.obtenerPorTiendaId(tiendaId);
    
    if (resultado.data && typeof resultado.data === 'object' && resultado.data !== null && estado) {
      const data = resultado.data as any;
      const historialFiltrado = data.historial_facturas?.filter(
        (factura: any) => factura.estado === estado
      ) || [];
      return {
        ...resultado,
        data: {
          ...data,
          historial_facturas: historialFiltrado
        }
      };
    }
    
    return resultado;
  }
}