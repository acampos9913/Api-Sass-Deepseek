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
  ValidationPipe
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam, 
  ApiQuery, 
  ApiBody 
} from '@nestjs/swagger';
import { GestionPlanCasoUso } from '../../dominio/casos-uso/gestion-plan.caso-uso';
import { 
  CrearConfiguracionPlanDto,
  CambiarPlanDto,
  AgregarSuscripcionDto,
  CriteriosBusquedaPlanDto,
  TipoPlan,
  CicloFacturacion,
  RespuestaConfiguracionPlanDto
} from '../../aplicacion/dto/configuracion-plan.dto';
import type { RespuestaEstandar } from '../../../comun/aplicacion/servicios/servicio-respuesta-estandar';

/**
 * Controlador para la gestión de configuración de plan
 * Expone endpoints RESTful para operaciones CRUD y de negocio relacionadas con planes
 */
@ApiTags('Configuración - Plan')
@Controller('configuracion/plan')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class ControladorPlan {
  constructor(private readonly gestionPlanCasoUso: GestionPlanCasoUso) {}

  /**
   * Crea una nueva configuración de plan para una tienda
   */
  @Post()
  @ApiOperation({ 
    summary: 'Crear configuración de plan',
    description: 'Crea una nueva configuración de plan para una tienda específica'
  })
  @ApiBody({ type: CrearConfiguracionPlanDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Configuración de plan creada exitosamente',
    type: RespuestaConfiguracionPlanDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Error de validación en los datos de entrada'
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Error interno del servidor'
  })
  async crearConfiguracionPlan(
    @Body() datos: CrearConfiguracionPlanDto
  ): Promise<RespuestaEstandar> {
    return await this.gestionPlanCasoUso.crearConfiguracionPlan(datos);
  }

  /**
   * Obtiene la configuración de plan de una tienda
   */
  @Get(':tiendaId')
  @ApiOperation({ 
    summary: 'Obtener configuración de plan',
    description: 'Obtiene la configuración de plan actual de una tienda específica'
  })
  @ApiParam({ 
    name: 'tiendaId', 
    description: 'ID de la tienda',
    example: 'tienda-123'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Configuración de plan obtenida exitosamente',
    type: RespuestaConfiguracionPlanDto
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Configuración de plan no encontrada'
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Error interno del servidor'
  })
  async obtenerConfiguracionPlan(
    @Param('tiendaId') tiendaId: string
  ): Promise<RespuestaEstandar> {
    return await this.gestionPlanCasoUso.obtenerConfiguracionPlan(tiendaId);
  }

  /**
   * Actualiza la configuración de plan de una tienda
   */
  @Put(':tiendaId')
  @ApiOperation({ 
    summary: 'Actualizar configuración de plan',
    description: 'Actualiza la configuración de plan existente de una tienda'
  })
  @ApiParam({ 
    name: 'tiendaId', 
    description: 'ID de la tienda',
    example: 'tienda-123'
  })
  @ApiBody({ type: CrearConfiguracionPlanDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Configuración de plan actualizada exitosamente',
    type: RespuestaConfiguracionPlanDto
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Configuración de plan no encontrada'
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Error interno del servidor'
  })
  async actualizarConfiguracionPlan(
    @Param('tiendaId') tiendaId: string,
    @Body() datos: Partial<CrearConfiguracionPlanDto>
  ): Promise<RespuestaEstandar> {
    return await this.gestionPlanCasoUso.actualizarConfiguracionPlan(tiendaId, datos);
  }

  /**
   * Cambia el plan de una tienda
   */
  @Patch(':tiendaId/cambiar-plan')
  @ApiOperation({ 
    summary: 'Cambiar plan de tienda',
    description: 'Cambia el plan actual de una tienda a un nuevo plan'
  })
  @ApiParam({ 
    name: 'tiendaId', 
    description: 'ID de la tienda',
    example: 'tienda-123'
  })
  @ApiBody({ type: CambiarPlanDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Plan cambiado exitosamente',
    type: RespuestaConfiguracionPlanDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'El nuevo plan no es compatible con la configuración actual'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Configuración de plan no encontrada'
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Error interno del servidor'
  })
  async cambiarPlan(
    @Param('tiendaId') tiendaId: string,
    @Body() datosCambio: CambiarPlanDto
  ): Promise<RespuestaEstandar> {
    return await this.gestionPlanCasoUso.cambiarPlan(tiendaId, datosCambio);
  }

  /**
   * Cambia el ciclo de facturación
   */
  @Patch(':tiendaId/ciclo-facturacion')
  @ApiOperation({ 
    summary: 'Cambiar ciclo de facturación',
    description: 'Cambia el ciclo de facturación actual (mensual/anual)'
  })
  @ApiParam({ 
    name: 'tiendaId', 
    description: 'ID de la tienda',
    example: 'tienda-123'
  })
  @ApiBody({ 
    schema: {
      type: 'object',
      properties: {
        ciclo_facturacion: {
          type: 'string',
          enum: Object.values(CicloFacturacion),
          example: CicloFacturacion.ANUAL
        }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Ciclo de facturación cambiado exitosamente',
    type: RespuestaConfiguracionPlanDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'El ciclo de facturación no es compatible'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Configuración de plan no encontrada'
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Error interno del servidor'
  })
  async cambiarCicloFacturacion(
    @Param('tiendaId') tiendaId: string,
    @Body('ciclo_facturacion') nuevoCiclo: CicloFacturacion
  ): Promise<RespuestaEstandar> {
    return await this.gestionPlanCasoUso.cambiarCicloFacturacion(tiendaId, nuevoCiclo);
  }

  /**
   * Cancela el plan de una tienda
   */
  @Delete(':tiendaId')
  @ApiOperation({ 
    summary: 'Cancelar plan de tienda',
    description: 'Cancela el plan actual de una tienda'
  })
  @ApiParam({ 
    name: 'tiendaId', 
    description: 'ID de la tienda',
    example: 'tienda-123'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Plan cancelado exitosamente'
  })
  @ApiResponse({ 
    status: 400, 
    description: 'No se puede cancelar el plan mientras haya suscripciones activas'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Configuración de plan no encontrada'
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Error interno del servidor'
  })
  @HttpCode(HttpStatus.OK)
  async cancelarPlan(
    @Param('tiendaId') tiendaId: string
  ): Promise<RespuestaEstandar> {
    return await this.gestionPlanCasoUso.cancelarPlan(tiendaId);
  }

  /**
   * Reactiva un plan cancelado
   */
  @Patch(':tiendaId/reactivar')
  @ApiOperation({ 
    summary: 'Reactivar plan cancelado',
    description: 'Reactiva un plan previamente cancelado'
  })
  @ApiParam({ 
    name: 'tiendaId', 
    description: 'ID de la tienda',
    example: 'tienda-123'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Plan reactivado exitosamente',
    type: RespuestaConfiguracionPlanDto
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Configuración de plan no encontrada'
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Error interno del servidor'
  })
  async reactivarPlan(
    @Param('tiendaId') tiendaId: string
  ): Promise<RespuestaEstandar> {
    return await this.gestionPlanCasoUso.reactivarPlan(tiendaId);
  }

  /**
   * Agrega una suscripción adicional
   */
  @Post(':tiendaId/suscripciones')
  @ApiOperation({ 
    summary: 'Agregar suscripción adicional',
    description: 'Agrega una nueva suscripción adicional al plan actual'
  })
  @ApiParam({ 
    name: 'tiendaId', 
    description: 'ID de la tienda',
    example: 'tienda-123'
  })
  @ApiBody({ type: AgregarSuscripcionDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Suscripción adicional agregada exitosamente',
    type: RespuestaConfiguracionPlanDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'La suscripción no es compatible con el plan actual'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Configuración de plan no encontrada'
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Error interno del servidor'
  })
  async agregarSuscripcionAdicional(
    @Param('tiendaId') tiendaId: string,
    @Body() suscripcion: AgregarSuscripcionDto
  ): Promise<RespuestaEstandar> {
    return await this.gestionPlanCasoUso.agregarSuscripcionAdicional(tiendaId, suscripcion);
  }

  /**
   * Actualiza una suscripción adicional
   */
  @Put(':tiendaId/suscripciones/:nombreSuscripcion')
  @ApiOperation({ 
    summary: 'Actualizar suscripción adicional',
    description: 'Actualiza una suscripción adicional existente'
  })
  @ApiParam({ 
    name: 'tiendaId', 
    description: 'ID de la tienda',
    example: 'tienda-123'
  })
  @ApiParam({ 
    name: 'nombreSuscripcion', 
    description: 'Nombre de la suscripción adicional',
    example: 'POS Pro'
  })
  @ApiBody({ type: AgregarSuscripcionDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Suscripción adicional actualizada exitosamente',
    type: RespuestaConfiguracionPlanDto
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Configuración de plan o suscripción no encontrada'
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Error interno del servidor'
  })
  async actualizarSuscripcionAdicional(
    @Param('tiendaId') tiendaId: string,
    @Param('nombreSuscripcion') nombreSuscripcion: string,
    @Body() datosActualizacion: Partial<AgregarSuscripcionDto>
  ): Promise<RespuestaEstandar> {
    return await this.gestionPlanCasoUso.actualizarSuscripcionAdicional(
      tiendaId, 
      nombreSuscripcion, 
      datosActualizacion
    );
  }

  /**
   * Remueve una suscripción adicional
   */
  @Delete(':tiendaId/suscripciones/:nombreSuscripcion')
  @ApiOperation({ 
    summary: 'Remover suscripción adicional',
    description: 'Remueve una suscripción adicional del plan'
  })
  @ApiParam({ 
    name: 'tiendaId', 
    description: 'ID de la tienda',
    example: 'tienda-123'
  })
  @ApiParam({ 
    name: 'nombreSuscripcion', 
    description: 'Nombre de la suscripción adicional',
    example: 'POS Pro'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Suscripción adicional removida exitosamente',
    type: RespuestaConfiguracionPlanDto
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Configuración de plan o suscripción no encontrada'
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Error interno del servidor'
  })
  @HttpCode(HttpStatus.OK)
  async removerSuscripcionAdicional(
    @Param('tiendaId') tiendaId: string,
    @Param('nombreSuscripcion') nombreSuscripcion: string
  ): Promise<RespuestaEstandar> {
    return await this.gestionPlanCasoUso.removerSuscripcionAdicional(tiendaId, nombreSuscripcion);
  }

  /**
   * Activa una suscripción adicional
   */
  @Patch(':tiendaId/suscripciones/:nombreSuscripcion/activar')
  @ApiOperation({ 
    summary: 'Activar suscripción adicional',
    description: 'Activa una suscripción adicional previamente desactivada'
  })
  @ApiParam({ 
    name: 'tiendaId', 
    description: 'ID de la tienda',
    example: 'tienda-123'
  })
  @ApiParam({ 
    name: 'nombreSuscripcion', 
    description: 'Nombre de la suscripción adicional',
    example: 'POS Pro'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Suscripción adicional activada exitosamente',
    type: RespuestaConfiguracionPlanDto
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Configuración de plan o suscripción no encontrada'
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Error interno del servidor'
  })
  async activarSuscripcionAdicional(
    @Param('tiendaId') tiendaId: string,
    @Param('nombreSuscripcion') nombreSuscripcion: string
  ): Promise<RespuestaEstandar> {
    return await this.gestionPlanCasoUso.activarSuscripcionAdicional(tiendaId, nombreSuscripcion);
  }

  /**
   * Desactiva una suscripción adicional
   */
  @Patch(':tiendaId/suscripciones/:nombreSuscripcion/desactivar')
  @ApiOperation({ 
    summary: 'Desactivar suscripción adicional',
    description: 'Desactiva una suscripción adicional activa'
  })
  @ApiParam({ 
    name: 'tiendaId', 
    description: 'ID de la tienda',
    example: 'tienda-123'
  })
  @ApiParam({ 
    name: 'nombreSuscripcion', 
    description: 'Nombre de la suscripción adicional',
    example: 'POS Pro'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Suscripción adicional desactivada exitosamente',
    type: RespuestaConfiguracionPlanDto
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Configuración de plan o suscripción no encontrada'
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Error interno del servidor'
  })
  async desactivarSuscripcionAdicional(
    @Param('tiendaId') tiendaId: string,
    @Param('nombreSuscripcion') nombreSuscripcion: string
  ): Promise<RespuestaEstandar> {
    return await this.gestionPlanCasoUso.desactivarSuscripcionAdicional(tiendaId, nombreSuscripcion);
  }

  /**
   * Lista configuraciones de plan con paginación
   */
  @Get()
  @ApiOperation({ 
    summary: 'Listar configuraciones de plan',
    description: 'Lista todas las configuraciones de plan con paginación'
  })
  @ApiQuery({ 
    name: 'pagina', 
    description: 'Número de página',
    required: false,
    type: Number,
    example: 1
  })
  @ApiQuery({ 
    name: 'limite', 
    description: 'Límite de resultados por página',
    required: false,
    type: Number,
    example: 10
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Configuraciones de plan listadas exitosamente'
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Error interno del servidor'
  })
  async listarConfiguracionesPlan(
    @Query('pagina') pagina: number = 1,
    @Query('limite') limite: number = 10
  ): Promise<RespuestaEstandar> {
    return await this.gestionPlanCasoUso.listarConfiguracionesPlan(pagina, limite);
  }

  /**
   * Busca configuraciones por criterios específicos
   */
  @Post('buscar')
  @ApiOperation({ 
    summary: 'Buscar configuraciones por criterios',
    description: 'Busca configuraciones de plan que cumplan con los criterios especificados'
  })
  @ApiBody({ type: CriteriosBusquedaPlanDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Configuraciones de plan encontradas exitosamente'
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Error interno del servidor'
  })
  async buscarConfiguracionesPorCriterios(
    @Body() criterios: CriteriosBusquedaPlanDto
  ): Promise<RespuestaEstandar> {
    return await this.gestionPlanCasoUso.buscarConfiguracionesPorCriterios(criterios);
  }

  /**
   * Obtiene estadísticas de uso de planes
   */
  @Get('estadisticas/globales')
  @ApiOperation({ 
    summary: 'Obtener estadísticas globales de planes',
    description: 'Obtiene estadísticas globales sobre el uso de planes en el sistema'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Estadísticas de planes obtenidas exitosamente'
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Error interno del servidor'
  })
  async obtenerEstadisticasPlanes(): Promise<RespuestaEstandar> {
    return await this.gestionPlanCasoUso.obtenerEstadisticasPlanes();
  }

  /**
   * Calcula el costo total mensual de un plan
   */
  @Get(':tiendaId/costo-total')
  @ApiOperation({ 
    summary: 'Calcular costo total mensual',
    description: 'Calcula el costo total mensual del plan incluyendo suscripciones adicionales'
  })
  @ApiParam({ 
    name: 'tiendaId', 
    description: 'ID de la tienda',
    example: 'tienda-123'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Costo total mensual calculado exitosamente'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Configuración de plan no encontrada'
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Error interno del servidor'
  })
  async calcularCostoTotalMensual(
    @Param('tiendaId') tiendaId: string
  ): Promise<RespuestaEstandar> {
    return await this.gestionPlanCasoUso.calcularCostoTotalMensual(tiendaId);
  }

  /**
   * Calcula el ahorro anual de un plan
   */
  @Get(':tiendaId/ahorro-anual')
  @ApiOperation({ 
    summary: 'Calcular ahorro anual',
    description: 'Calcula el ahorro anual al cambiar a facturación anual'
  })
  @ApiParam({ 
    name: 'tiendaId', 
    description: 'ID de la tienda',
    example: 'tienda-123'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Ahorro anual calculado exitosamente'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Configuración de plan no encontrada'
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Error interno del servidor'
  })
  async calcularAhorroAnual(
    @Param('tiendaId') tiendaId: string
  ): Promise<RespuestaEstandar> {
    return await this.gestionPlanCasoUso.calcularAhorroAnual(tiendaId);
  }

  /**
   * Obtiene recomendaciones de plan para una tienda
   */
  @Get(':tiendaId/recomendaciones')
  @ApiOperation({ 
    summary: 'Obtener recomendaciones de plan',
    description: 'Obtiene recomendaciones de plan basadas en el uso actual de la tienda'
  })
  @ApiParam({ 
    name: 'tiendaId', 
    description: 'ID de la tienda',
    example: 'tienda-123'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Recomendaciones de plan obtenidas exitosamente'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Configuración de plan no encontrada'
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Error interno del servidor'
  })
  async obtenerRecomendacionesPlan(
    @Param('tiendaId') tiendaId: string
  ): Promise<RespuestaEstandar> {
    return await this.gestionPlanCasoUso.obtenerRecomendacionesPlan(tiendaId);
  }

  /**
   * Exporta la configuración de plan de una tienda
   */
  @Get(':tiendaId/exportar')
  @ApiOperation({ 
    summary: 'Exportar configuración de plan',
    description: 'Exporta la configuración completa de plan de una tienda'
  })
  @ApiParam({ 
    name: 'tiendaId', 
    description: 'ID de la tienda',
    example: 'tienda-123'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Configuración de plan exportada exitosamente'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Configuración de plan no encontrada'
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Error interno del servidor'
  })
  async exportarConfiguracionPlan(
    @Param('tiendaId') tiendaId: string
  ): Promise<RespuestaEstandar> {
    return await this.gestionPlanCasoUso.exportarConfiguracionPlan(tiendaId);
  }

  /**
   * Importa una configuración de plan para una tienda
   */
  @Post(':tiendaId/importar')
  @ApiOperation({ 
    summary: 'Importar configuración de plan',
    description: 'Importa una configuración de plan previamente exportada'
  })
  @ApiParam({ 
    name: 'tiendaId', 
    description: 'ID de la tienda',
    example: 'tienda-123'
  })
  @ApiBody({ 
    schema: {
      type: 'object',
      description: 'Datos de configuración de plan exportada'
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Configuración de plan importada exitosamente',
    type: RespuestaConfiguracionPlanDto
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Configuración de plan no encontrada'
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Error interno del servidor'
  })
  async importarConfiguracionPlan(
    @Param('tiendaId') tiendaId: string,
    @Body() datosImportacion: any
  ): Promise<RespuestaEstandar> {
    return await this.gestionPlanCasoUso.importarConfiguracionPlan(tiendaId, datosImportacion);
  }

  /**
   * Valida los límites del plan actual
   */
  @Get(':tiendaId/validar-limites')
  @ApiOperation({ 
    summary: 'Validar límites del plan',
    description: 'Valida si el uso actual de la tienda excede los límites del plan'
  })
  @ApiParam({ 
    name: 'tiendaId', 
    description: 'ID de la tienda',
    example: 'tienda-123'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Límites del plan validados exitosamente'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Configuración de plan no encontrada'
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Error interno del servidor'
  })
  async validarLimitesPlan(
    @Param('tiendaId') tiendaId: string
  ): Promise<RespuestaEstandar> {
    return await this.gestionPlanCasoUso.validarLimitesPlan(tiendaId);
  }
}