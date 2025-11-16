import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpStatus, Inject, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { ServicioCreditosTienda } from '../../aplicacion/servicios/servicio-creditos-tienda';
import { CrearRecargaCreditoDto } from '../../aplicacion/dto/crear-recarga-credito.dto';
import { RespuestaEstandar } from '../dto/respuesta-estandar.dto';
import { TipoServicioCredito } from '../../dominio/entidades/recarga-credito.entity';
import { StripeService } from '../../infraestructura/servicios/stripe.service';

@ApiTags('Créditos')
@ApiBearerAuth()
@Controller('api/v1/creditos')
export class ControladorCreditos {
  constructor(
    private readonly servicioCreditosTienda: ServicioCreditosTienda,
    @Inject(StripeService) private readonly stripeService: StripeService,
  ) {}

  /**
   * Obtiene el balance de créditos de una tienda
   */
  @Get('tienda/:tiendaId')
  @ApiOperation({
    summary: 'Obtener balance de créditos de tienda',
    description: 'Retorna el balance actual de créditos disponibles y usados para una tienda específica'
  })
  @ApiParam({
    name: 'tiendaId',
    description: 'ID de la tienda',
    type: String
  })
  @ApiResponse({
    status: 200,
    description: 'Balance de créditos obtenido exitosamente',
    type: RespuestaEstandar
  })
  @ApiResponse({
    status: 404,
    description: 'Tienda no encontrada',
    type: RespuestaEstandar
  })
  async obtenerBalanceCreditoTienda(@Param('tiendaId') tiendaId: string): Promise<RespuestaEstandar> {
    try {
      const balance = await this.servicioCreditosTienda.obtenerBalance(tiendaId);
      
      return {
        mensaje: 'Balance de créditos obtenido exitosamente',
        data: balance,
        tipo_mensaje: 'Exito',
        estado_respuesta: HttpStatus.OK
      };
    } catch (error) {
      return {
        mensaje: error.message,
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: HttpStatus.NOT_FOUND
      };
    }
  }

  /**
   * Inicia una recarga de créditos creando una sesión de pago con Stripe
   */
  @Post('recarga/iniciar')
  @ApiOperation({
    summary: 'Iniciar recarga de créditos',
    description: 'Crea una sesión de pago con Stripe para recargar créditos'
  })
  @ApiResponse({
    status: 201,
    description: 'Sesión de pago creada exitosamente',
    type: RespuestaEstandar
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de recarga inválidos',
    type: RespuestaEstandar
  })
  async iniciarRecargaCredito(@Body() crearRecargaCreditoDto: CrearRecargaCreditoDto): Promise<RespuestaEstandar> {
    try {
      // Crear sesión de pago con Stripe
      const sesionPago = await this.stripeService.crearSesionPagoRecarga(
        crearRecargaCreditoDto.tiendaId,
        crearRecargaCreditoDto.montoDolares,
        `Recarga de ${crearRecargaCreditoDto.montoDolares * 100} créditos`,
        { tienda_id: crearRecargaCreditoDto.tiendaId }
      );

      // Crear recarga en estado PENDIENTE con el ID de la sesión de Stripe
      const recargaCreada = await this.servicioCreditosTienda.crearRecargaCredito(
        crearRecargaCreditoDto.tiendaId,
        crearRecargaCreditoDto.montoDolares,
        sesionPago.id
      );
      
      return {
        mensaje: 'Sesión de pago creada exitosamente',
        data: {
          recarga: recargaCreada,
          sesion_pago: sesionPago
        },
        tipo_mensaje: 'Exito',
        estado_respuesta: HttpStatus.CREATED
      };
    } catch (error) {
      return {
        mensaje: error.message,
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: HttpStatus.BAD_REQUEST
      };
    }
  }

  /**
   * Crea una recarga de créditos directamente (para uso interno)
   */
  @Post('recarga')
  @ApiOperation({
    summary: 'Crear recarga de créditos (interno)',
    description: 'Crea una recarga de créditos directamente, para uso interno o testing'
  })
  @ApiResponse({
    status: 201,
    description: 'Recarga de créditos creada exitosamente',
    type: RespuestaEstandar
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de recarga inválidos',
    type: RespuestaEstandar
  })
  async crearRecargaCredito(@Body() crearRecargaCreditoDto: CrearRecargaCreditoDto): Promise<RespuestaEstandar> {
    try {
      const recargaCreada = await this.servicioCreditosTienda.crearRecargaCredito(
        crearRecargaCreditoDto.tiendaId,
        crearRecargaCreditoDto.montoDolares,
        crearRecargaCreditoDto.idPagoStripe
      );
      
      return {
        mensaje: 'Recarga de créditos creada exitosamente',
        data: recargaCreada,
        tipo_mensaje: 'Exito',
        estado_respuesta: HttpStatus.CREATED
      };
    } catch (error) {
      return {
        mensaje: error.message,
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: HttpStatus.BAD_REQUEST
      };
    }
  }

  /**
   * Confirma una recarga de créditos (webhook de Stripe)
   */
  @Put('recarga/confirmar/:idPagoStripe')
  @ApiOperation({
    summary: 'Confirmar recarga de créditos',
    description: 'Confirma una recarga de créditos después del pago exitoso con Stripe'
  })
  @ApiParam({
    name: 'idPagoStripe',
    description: 'ID del pago de Stripe',
    type: String
  })
  @ApiResponse({
    status: 200,
    description: 'Recarga confirmada exitosamente',
    type: RespuestaEstandar
  })
  @ApiResponse({
    status: 404,
    description: 'Recarga no encontrada',
    type: RespuestaEstandar
  })
  async confirmarRecargaCredito(@Param('idPagoStripe') idPagoStripe: string): Promise<RespuestaEstandar> {
    try {
      const recargaConfirmada = await this.servicioCreditosTienda.procesarRecargaCompletada(idPagoStripe);
      
      return {
        mensaje: 'Recarga de créditos confirmada exitosamente',
        data: recargaConfirmada,
        tipo_mensaje: 'Exito',
        estado_respuesta: HttpStatus.OK
      };
    } catch (error) {
      return {
        mensaje: error.message,
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: HttpStatus.NOT_FOUND
      };
    }
  }

  /**
   * Obtiene el historial de recargas de una tienda
   */
  @Get('tienda/:tiendaId/recargas')
  @ApiOperation({
    summary: 'Obtener historial de recargas',
    description: 'Retorna el historial completo de recargas de créditos para una tienda'
  })
  @ApiParam({
    name: 'tiendaId',
    description: 'ID de la tienda',
    type: String
  })
  @ApiResponse({
    status: 200,
    description: 'Historial de recargas obtenido exitosamente',
    type: RespuestaEstandar
  })
  async obtenerHistorialRecargas(
    @Param('tiendaId') tiendaId: string
  ): Promise<RespuestaEstandar> {
    try {
      const historial = await this.servicioCreditosTienda.obtenerRecargas(tiendaId);
      
      return {
        mensaje: 'Historial de recargas obtenido exitosamente',
        data: historial,
        tipo_mensaje: 'Exito',
        estado_respuesta: HttpStatus.OK
      };
    } catch (error) {
      return {
        mensaje: error.message,
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: HttpStatus.BAD_REQUEST
      };
    }
  }

  /**
   * Obtiene el historial de uso de créditos de una tienda
   */
  @Get('tienda/:tiendaId/usos')
  @ApiOperation({
    summary: 'Obtener historial de uso de créditos',
    description: 'Retorna el historial completo de uso de créditos para una tienda'
  })
  @ApiParam({
    name: 'tiendaId',
    description: 'ID de la tienda',
    type: String
  })
  @ApiQuery({
    name: 'tipoServicio',
    description: 'Filtrar por tipo de servicio',
    required: false,
    enum: TipoServicioCredito
  })
  @ApiResponse({
    status: 200,
    description: 'Historial de usos obtenido exitosamente',
    type: RespuestaEstandar
  })
  async obtenerHistorialUsos(
    @Param('tiendaId') tiendaId: string,
    @Query('tipoServicio') tipoServicio?: TipoServicioCredito
  ): Promise<RespuestaEstandar> {
    try {
      let historial;
      if (tipoServicio) {
        historial = await this.servicioCreditosTienda.obtenerUsosPorTipoServicio(tiendaId, tipoServicio);
      } else {
        historial = await this.servicioCreditosTienda.obtenerUsos(tiendaId);
      }
      
      return {
        mensaje: 'Historial de usos obtenido exitosamente',
        data: historial,
        tipo_mensaje: 'Exito',
        estado_respuesta: HttpStatus.OK
      };
    } catch (error) {
      return {
        mensaje: error.message,
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: HttpStatus.BAD_REQUEST
      };
    }
  }

  /**
   * Obtiene el resumen mensual de créditos
   */
  @Get('tienda/:tiendaId/resumen-mensual')
  @ApiOperation({
    summary: 'Obtener resumen mensual de créditos',
    description: 'Retorna el resumen mensual de créditos agregados, usados y balance actual'
  })
  @ApiParam({
    name: 'tiendaId',
    description: 'ID de la tienda',
    type: String
  })
  @ApiQuery({
    name: 'año',
    description: 'Año para el resumen',
    required: true,
    type: Number
  })
  @ApiQuery({
    name: 'mes',
    description: 'Mes para el resumen (1-12)',
    required: true,
    type: Number
  })
  @ApiResponse({
    status: 200,
    description: 'Resumen mensual obtenido exitosamente',
    type: RespuestaEstandar
  })
  async obtenerResumenMensual(
    @Param('tiendaId') tiendaId: string,
    @Query('año') año: number,
    @Query('mes') mes: number
  ): Promise<RespuestaEstandar> {
    try {
      const resumen = await this.servicioCreditosTienda.obtenerResumenMensual(tiendaId, año, mes);
      
      return {
        mensaje: 'Resumen mensual obtenido exitosamente',
        data: resumen,
        tipo_mensaje: 'Exito',
        estado_respuesta: HttpStatus.OK
      };
    } catch (error) {
      return {
        mensaje: error.message,
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: HttpStatus.BAD_REQUEST
      };
    }
  }

  /**
   * Obtiene el uso diario de créditos por mes
   */
  @Get('tienda/:tiendaId/uso-diario')
  @ApiOperation({
    summary: 'Obtener uso diario de créditos por mes',
    description: 'Retorna el uso diario de créditos desglosado por día y tipo de servicio para un mes específico'
  })
  @ApiParam({
    name: 'tiendaId',
    description: 'ID de la tienda',
    type: String
  })
  @ApiQuery({
    name: 'año',
    description: 'Año para el reporte',
    required: true,
    type: Number
  })
  @ApiQuery({
    name: 'mes',
    description: 'Mes para el reporte (1-12)',
    required: true,
    type: Number
  })
  @ApiResponse({
    status: 200,
    description: 'Uso diario obtenido exitosamente',
    type: RespuestaEstandar
  })
  async obtenerUsoDiarioPorMes(
    @Param('tiendaId') tiendaId: string,
    @Query('año') año: number,
    @Query('mes') mes: number
  ): Promise<RespuestaEstandar> {
    try {
      const usoDiario = await this.servicioCreditosTienda.obtenerUsoDiarioPorMes(tiendaId, año, mes);
      
      return {
        mensaje: 'Uso diario obtenido exitosamente',
        data: usoDiario,
        tipo_mensaje: 'Exito',
        estado_respuesta: HttpStatus.OK
      };
    } catch (error) {
      return {
        mensaje: error.message,
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: HttpStatus.BAD_REQUEST
      };
    }
  }

  /**
   * Registra el uso de créditos (para otros servicios)
   */
  @Post('uso')
  @ApiOperation({
    summary: 'Registrar uso de créditos',
    description: 'Registra el consumo de créditos por un servicio específico'
  })
  @ApiResponse({
    status: 201,
    description: 'Uso de créditos registrado exitosamente',
    type: RespuestaEstandar
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de uso inválidos o créditos insuficientes',
    type: RespuestaEstandar
  })
  async registrarUsoCredito(
    @Body() datosUso: {
      tiendaId: string;
      cantidadCreditos: number;
      tipoServicio: TipoServicioCredito;
      descripcionServicio: string;
      idReferencia?: string;
      metadata?: Record<string, any>;
    }
  ): Promise<RespuestaEstandar> {
    try {
      const usoRegistrado = await this.servicioCreditosTienda.usarCreditos(
        datosUso.tiendaId,
        datosUso.cantidadCreditos,
        datosUso.tipoServicio,
        datosUso.descripcionServicio,
        datosUso.idReferencia,
        datosUso.metadata
      );
      
      return {
        mensaje: 'Uso de créditos registrado exitosamente',
        data: usoRegistrado,
        tipo_mensaje: 'Exito',
        estado_respuesta: HttpStatus.CREATED
      };
    } catch (error) {
      return {
        mensaje: error.message,
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: HttpStatus.BAD_REQUEST
      };
    }
  }

  /**
   * Verifica si una tienda tiene créditos suficientes
   */
  @Get('tienda/:tiendaId/verificar-suficientes/:cantidad')
  @ApiOperation({
    summary: 'Verificar créditos suficientes',
    description: 'Verifica si una tienda tiene créditos suficientes para una operación específica'
  })
  @ApiParam({
    name: 'tiendaId',
    description: 'ID de la tienda',
    type: String
  })
  @ApiParam({
    name: 'cantidad',
    description: 'Cantidad de créditos requeridos',
    type: Number
  })
  @ApiResponse({
    status: 200,
    description: 'Verificación completada exitosamente',
    type: RespuestaEstandar
  })
  async verificarCreditosSuficientes(
    @Param('tiendaId') tiendaId: string,
    @Param('cantidad') cantidad: number
  ): Promise<RespuestaEstandar> {
    try {
      const tieneSuficientes = await this.servicioCreditosTienda.verificarCreditosSuficientes(tiendaId, cantidad);
      
      return {
        mensaje: tieneSuficientes ? 'Créditos suficientes disponibles' : 'Créditos insuficientes',
        data: { tiene_suficientes: tieneSuficientes },
        tipo_mensaje: 'Exito',
        estado_respuesta: HttpStatus.OK
      };
    } catch (error) {
      return {
        mensaje: error.message,
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: HttpStatus.BAD_REQUEST
      };
    }
  }

  /**
   * Obtiene el top de servicios que más créditos consumen
   */
  @Get('tienda/:tiendaId/top-servicios')
  @ApiOperation({
    summary: 'Obtener top servicios de consumo',
    description: 'Retorna el top de servicios que más créditos consumen para una tienda'
  })
  @ApiParam({
    name: 'tiendaId',
    description: 'ID de la tienda',
    type: String
  })
  @ApiQuery({
    name: 'limite',
    description: 'Límite de servicios a retornar',
    required: false,
    type: Number
  })
  @ApiResponse({
    status: 200,
    description: 'Top servicios obtenido exitosamente',
    type: RespuestaEstandar
  })
  async obtenerTopServiciosConsumo(
    @Param('tiendaId') tiendaId: string,
    @Query('limite') limite: number = 5
  ): Promise<RespuestaEstandar> {
    try {
      const topServicios = await this.servicioCreditosTienda.obtenerTopServiciosConsumo(tiendaId, limite);
      
      return {
        mensaje: 'Top servicios obtenido exitosamente',
        data: topServicios,
        tipo_mensaje: 'Exito',
        estado_respuesta: HttpStatus.OK
      };
    } catch (error) {
      return {
        mensaje: error.message,
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: HttpStatus.BAD_REQUEST
      };
    }
  }

  /**
   * Obtiene el historial completo (recargas + usos) de una tienda
   */
  @Get('tienda/:tiendaId/historial-completo')
  @ApiOperation({
    summary: 'Obtener historial completo de créditos',
    description: 'Retorna el historial completo combinado de recargas y usos de créditos para una tienda'
  })
  @ApiParam({
    name: 'tiendaId',
    description: 'ID de la tienda',
    type: String
  })
  @ApiQuery({
    name: 'pagina',
    description: 'Número de página para paginación',
    required: false,
    type: Number
  })
  @ApiQuery({
    name: 'limite',
    description: 'Límite de elementos por página',
    required: false,
    type: Number
  })
  @ApiResponse({
    status: 200,
    description: 'Historial completo obtenido exitosamente',
    type: RespuestaEstandar
  })
  async obtenerHistorialCompleto(
    @Param('tiendaId') tiendaId: string,
    @Query('limite') limite: number = 20,
    @Query('pagina') pagina: number = 1
  ): Promise<RespuestaEstandar> {
    try {
      const historialCompleto = await this.servicioCreditosTienda.obtenerHistorialCompleto(tiendaId, limite, pagina);
      
      return {
        mensaje: 'Historial completo obtenido exitosamente',
        data: historialCompleto,
        tipo_mensaje: 'Exito',
        estado_respuesta: HttpStatus.OK
      };
    } catch (error) {
      return {
        mensaje: error.message,
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: HttpStatus.BAD_REQUEST
      };
    }
  }

  /**
   * Webhook para procesar pagos de Stripe
   */
  @Post('webhook/stripe')
  @ApiOperation({
    summary: 'Webhook de Stripe para pagos',
    description: 'Endpoint para recibir webhooks de Stripe y procesar confirmaciones de pago'
  })
  @ApiResponse({
    status: 200,
    description: 'Webhook procesado exitosamente',
    type: RespuestaEstandar
  })
  async procesarWebhookStripe(
    @Headers('stripe-signature') signature: string,
    @Body() payload: any
  ): Promise<RespuestaEstandar> {
    try {
      // En desarrollo, permitir procesar sin firma para testing
      if (process.env.NODE_ENV === 'production' && !signature) {
        throw new Error('Firma de Stripe no proporcionada');
      }

      // Convertir el payload a Buffer para Stripe
      const payloadBuffer = Buffer.from(JSON.stringify(payload));

      // Procesar el webhook de Stripe
      const evento = await this.stripeService.procesarWebhook(
        payloadBuffer,
        signature || 'development-signature'
      );

      // Si es un pago exitoso, confirmar la recarga
      if (evento.tipo === 'checkout.session.completed' || evento.tipo === 'payment_intent.succeeded') {
        const idPagoStripe = evento.id_sesion || evento.id_pago;
        
        if (idPagoStripe) {
          await this.servicioCreditosTienda.procesarRecargaCompletada(idPagoStripe);
        }
      }

      return {
        mensaje: 'Webhook procesado exitosamente',
        data: evento,
        tipo_mensaje: 'Exito',
        estado_respuesta: HttpStatus.OK
      };
    } catch (error) {
      return {
        mensaje: error.message,
        data: null,
        tipo_mensaje: 'ErrorServidor',
        estado_respuesta: HttpStatus.INTERNAL_SERVER_ERROR
      };
    }
  }
}