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
  UseGuards,
  Request,
  HttpStatus,
  ParseIntPipe,
  DefaultValuePipe
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth, 
  ApiQuery,
  ApiParam 
} from '@nestjs/swagger';
import { CasosUsoPlan } from '../../aplicacion/casos-uso/casos-uso-plan';
import { 
  ObtenerPlanActualDto,
  CambiarPlanDto,
  CancelarPlanDto,
  ObtenerHistorialPlanesDto,
  CrearPlanDto,
  ActualizarPlanDto,
  PlanActualRespuestaDto,
  HistorialPlanesRespuestaDto,
  ValidacionPagosPendientesRespuestaDto
} from '../../aplicacion/dto/plan.dto';
import { Plan, SuscripcionPlan } from '../../dominio/entidades/plan.entity';

/**
 * Controlador para la gestión de planes de suscripción
 * Proporciona endpoints para gestionar planes, suscripciones, cambios y cancelaciones
 */
@ApiTags('Planes')
@ApiBearerAuth()
@Controller('planes')
@UsePipes(new ValidationPipe({ transform: true }))
export class ControladorPlan {
  constructor(private readonly casosUsoPlan: CasosUsoPlan) {}

  /**
   * Obtiene la información completa del plan actual de la tienda
   */
  @Get('actual')
  @ApiOperation({ 
    summary: 'Obtener plan actual',
    description: 'Devuelve información completa del plan actual, estado de facturación, fecha de renovación, método de pago, resumen de beneficios y historial de cambios.'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Plan actual obtenido exitosamente',
    type: PlanActualRespuestaDto
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No se encontró una suscripción activa para esta tienda'
  })
  async obtenerPlanActual(@Request() req): Promise<PlanActualRespuestaDto> {
    // En un escenario real, obtendríamos el tiendaId del token JWT
    const tiendaId = req.user?.tiendaId || 'tienda-ejemplo'; // Temporal para desarrollo
    
    return await this.casosUsoPlan.obtenerPlanActual(tiendaId);
  }

  /**
   * Cambia el plan de la tienda
   */
  @Post('cambiar')
  @ApiOperation({ 
    summary: 'Cambiar plan',
    description: 'Cambia el tipo de plan y actualiza la fecha de renovación y el método de pago.'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Plan cambiado exitosamente',
    type: Object
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos de cambio de plan inválidos'
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No se encontró la suscripción o el plan solicitado'
  })
  async cambiarPlan(
    @Request() req,
    @Body() cambiarPlanDto: CambiarPlanDto
  ): Promise<SuscripcionPlan> {
    const tiendaId = req.user?.tiendaId || 'tienda-ejemplo';
    const usuarioId = req.user?.id;

    return await this.casosUsoPlan.cambiarPlan(tiendaId, cambiarPlanDto, usuarioId);
  }

  /**
   * Cancela el plan de la tienda
   */
  @Post('cancelar')
  @ApiOperation({ 
    summary: 'Cancelar plan',
    description: 'Suspende o elimina el plan actual, devuelve advertencia si hay pagos sin procesar.'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Plan cancelado exitosamente',
    type: Object
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Confirmaciones de cancelación no válidas'
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'No se puede cancelar el plan mientras tenga pagos pendientes'
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No se encontró una suscripción activa para esta tienda'
  })
  async cancelarPlan(
    @Request() req,
    @Body() cancelarPlanDto: CancelarPlanDto
  ): Promise<SuscripcionPlan> {
    const tiendaId = req.user?.tiendaId || 'tienda-ejemplo';

    return await this.casosUsoPlan.cancelarPlan(tiendaId, cancelarPlanDto);
  }

  /**
   * Obtiene el historial de planes de la tienda
   */
  @Get('historial')
  @ApiOperation({ 
    summary: 'Obtener historial de planes',
    description: 'Devuelve el historial de planes, con fechas de cambio y tipo de plan.'
  })
  @ApiQuery({
    name: 'pagina',
    required: false,
    type: Number,
    description: 'Número de página para paginación'
  })
  @ApiQuery({
    name: 'limite',
    required: false,
    type: Number,
    description: 'Límite de elementos por página'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Historial de planes obtenido exitosamente',
    type: HistorialPlanesRespuestaDto
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No se encontró una suscripción para esta tienda'
  })
  async obtenerHistorialPlanes(
    @Request() req,
    @Query('pagina', new DefaultValuePipe(1), ParseIntPipe) pagina: number,
    @Query('limite', new DefaultValuePipe(10), ParseIntPipe) limite: number
  ): Promise<HistorialPlanesRespuestaDto> {
    const tiendaId = req.user?.tiendaId || 'tienda-ejemplo';

    return await this.casosUsoPlan.obtenerHistorialPlanes(tiendaId, pagina, limite);
  }

  /**
   * Valida si hay pagos pendientes para la suscripción actual
   */
  @Get('validar-pagos-pendientes')
  @ApiOperation({ 
    summary: 'Validar pagos pendientes',
    description: 'Verifica si hay pagos pendientes para la suscripción actual.'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Validación de pagos pendientes completada',
    type: ValidacionPagosPendientesRespuestaDto
  })
  async validarPagosPendientes(@Request() req): Promise<ValidacionPagosPendientesRespuestaDto> {
    const tiendaId = req.user?.tiendaId || 'tienda-ejemplo';
    
    // Obtener la suscripción para luego validar pagos
    const suscripcion = await this.casosUsoPlan['repositorioPlan'].obtenerSuscripcionPorTiendaId(tiendaId);
    if (!suscripcion) {
      return {
        hayPagosPendientes: false
      };
    }

    return await this.casosUsoPlan.validarPagosPendientes(suscripcion.id);
  }

  // Endpoints de administración (solo para usuarios con permisos de admin)

  /**
   * Obtiene todos los planes activos disponibles
   */
  @Get()
  @ApiOperation({ 
    summary: 'Obtener todos los planes activos',
    description: 'Devuelve todos los planes activos disponibles para suscripción.'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Planes obtenidos exitosamente',
    type: [Object]
  })
  async obtenerPlanesActivos(): Promise<Plan[]> {
    return await this.casosUsoPlan.obtenerPlanesActivos();
  }

  /**
   * Crea un nuevo plan
   */
  @Post()
  @ApiOperation({ 
    summary: 'Crear nuevo plan',
    description: 'Crea un nuevo plan de suscripción (solo administradores).'
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Plan creado exitosamente',
    type: Object
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Ya existe un plan con este código'
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos del plan inválidos'
  })
  async crearPlan(@Body() crearPlanDto: CrearPlanDto): Promise<Plan> {
    return await this.casosUsoPlan.crearPlan(crearPlanDto);
  }

  /**
   * Obtiene un plan específico por ID
   */
  @Get(':id')
  @ApiOperation({ 
    summary: 'Obtener plan por ID',
    description: 'Devuelve un plan específico por su ID.'
  })
  @ApiParam({
    name: 'id',
    description: 'ID del plan'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Plan obtenido exitosamente',
    type: Object
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Plan no encontrado'
  })
  async obtenerPlanPorId(@Param('id') id: string): Promise<Plan> {
    const plan = await this.casosUsoPlan['repositorioPlan'].obtenerPlanPorId(id);
    if (!plan) {
      throw new Error('Plan no encontrado');
    }
    return plan;
  }

  /**
   * Actualiza un plan existente
   */
  @Put(':id')
  @ApiOperation({ 
    summary: 'Actualizar plan',
    description: 'Actualiza un plan existente (solo administradores).'
  })
  @ApiParam({
    name: 'id',
    description: 'ID del plan a actualizar'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Plan actualizado exitosamente',
    type: Object
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Plan no encontrado'
  })
  async actualizarPlan(
    @Param('id') id: string,
    @Body() actualizarPlanDto: ActualizarPlanDto
  ): Promise<Plan> {
    return await this.casosUsoPlan.actualizarPlan(id, actualizarPlanDto);
  }

  /**
   * Obtiene el plan por código
   */
  @Get('codigo/:codigo')
  @ApiOperation({ 
    summary: 'Obtener plan por código',
    description: 'Devuelve un plan específico por su código único.'
  })
  @ApiParam({
    name: 'codigo',
    description: 'Código único del plan'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Plan obtenido exitosamente',
    type: Object
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Plan no encontrado'
  })
  async obtenerPlanPorCodigo(@Param('codigo') codigo: string): Promise<Plan> {
    const plan = await this.casosUsoPlan['repositorioPlan'].obtenerPlanPorCodigo(codigo);
    if (!plan) {
      throw new Error('Plan no encontrado');
    }
    return plan;
  }

  /**
   * Endpoint de salud del módulo de planes
   */
  @Get('health/check')
  @ApiOperation({ 
    summary: 'Health check',
    description: 'Verifica que el módulo de planes esté funcionando correctamente.'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Módulo de planes funcionando correctamente'
  })
  healthCheck(): { status: string; timestamp: string; module: string } {
    return {
      status: 'OK',
      timestamp: new Date().toISOString(),
      module: 'planes'
    };
  }
}