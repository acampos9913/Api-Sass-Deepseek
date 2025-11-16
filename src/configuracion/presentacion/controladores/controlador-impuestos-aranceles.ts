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
  UsePipes, 
  ValidationPipe 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiQuery } from '@nestjs/swagger';
import { GestionImpuestosArancelesCasoUso } from '../../dominio/casos-uso/gestion-impuestos-aranceles.caso-uso';
import { 
  CrearConfiguracionImpuestosArancelesDto,
  ActualizarConfiguracionImpuestosArancelesDto,
  ServicioFiscal,
  TipoImpuesto,
  CriteriosBusquedaImpuestosArancelesDto,
  RespuestaConfiguracionImpuestosArancelesDto
} from '../../aplicacion/dto/configuracion-impuestos-aranceles.dto';
import { RespuestaEstandarDto } from '../../../comun/dto/respuesta-estandar.dto';
import { ParametrosRutaTiendaDto } from '../../../comun/dto/parametros-ruta-tienda.dto';

@ApiTags('Configuración - Impuestos y Aranceles')
@Controller('configuracion/impuestos-aranceles')
export class ControladorImpuestosAranceles {
  constructor(
    private readonly gestionImpuestosArancelesCasoUso: GestionImpuestosArancelesCasoUso
  ) {}

  @Get(':tiendaId')
  @ApiOperation({ 
    summary: 'Obtener configuración de impuestos y aranceles',
    description: 'Obtiene la configuración completa de impuestos y aranceles para una tienda específica'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Configuración obtenida exitosamente',
    type: RespuestaEstandarDto
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Configuración no encontrada para la tienda especificada'
  })
  async obtenerConfiguracion(
    @Param() parametros: ParametrosRutaTiendaDto
  ): Promise<RespuestaEstandarDto<RespuestaConfiguracionImpuestosArancelesDto>> {
    return await this.gestionImpuestosArancelesCasoUso.obtenerPorTiendaId(parametros.tiendaId);
  }

  @Post()
  @ApiOperation({ 
    summary: 'Crear configuración de impuestos y aranceles',
    description: 'Crea una nueva configuración de impuestos y aranceles para una tienda'
  })
  @ApiBody({ type: CrearConfiguracionImpuestosArancelesDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Configuración creada exitosamente',
    type: RespuestaEstandarDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Datos de entrada inválidos o configuración ya existe'
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async crearConfiguracion(
    @Body() datos: CrearConfiguracionImpuestosArancelesDto
  ): Promise<RespuestaEstandarDto<RespuestaConfiguracionImpuestosArancelesDto>> {
    return await this.gestionImpuestosArancelesCasoUso.crearConfiguracion(datos);
  }

  @Put(':tiendaId')
  @ApiOperation({ 
    summary: 'Actualizar configuración de impuestos y aranceles',
    description: 'Actualiza la configuración completa de impuestos y aranceles para una tienda'
  })
  @ApiBody({ type: ActualizarConfiguracionImpuestosArancelesDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Configuración actualizada exitosamente',
    type: RespuestaEstandarDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Datos de entrada inválidos'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Configuración no encontrada para la tienda especificada'
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async actualizarConfiguracion(
    @Param() parametros: ParametrosRutaTiendaDto,
    @Body() datos: ActualizarConfiguracionImpuestosArancelesDto
  ): Promise<RespuestaEstandarDto<RespuestaConfiguracionImpuestosArancelesDto>> {
    return await this.gestionImpuestosArancelesCasoUso.actualizarConfiguracion(parametros.tiendaId, datos);
  }

  @Delete(':tiendaId')
  @ApiOperation({ 
    summary: 'Eliminar configuración de impuestos y aranceles',
    description: 'Elimina la configuración de impuestos y aranceles para una tienda'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Configuración eliminada exitosamente',
    type: RespuestaEstandarDto
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Configuración no encontrada para la tienda especificada'
  })
  @HttpCode(200)
  async eliminarConfiguracion(
    @Param() parametros: ParametrosRutaTiendaDto
  ): Promise<RespuestaEstandarDto<null>> {
    return await this.gestionImpuestosArancelesCasoUso.eliminarConfiguracion(parametros.tiendaId);
  }

  @Get(':tiendaId/validar')
  @ApiOperation({ 
    summary: 'Validar configuración',
    description: 'Valida la integridad y consistencia de la configuración'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Configuración validada exitosamente',
    type: RespuestaEstandarDto
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Configuración no encontrada para la tienda especificada'
  })
  async validarConfiguracion(
    @Param() parametros: ParametrosRutaTiendaDto
  ): Promise<RespuestaEstandarDto<{ esValida: boolean }>> {
    return await this.gestionImpuestosArancelesCasoUso.validarIntegridad(parametros.tiendaId);
  }

  @Get(':tiendaId/calcular-impuesto')
  @ApiOperation({ 
    summary: 'Calcular impuesto',
    description: 'Calcula el impuesto para un monto y ubicación específicos'
  })
  @ApiQuery({ 
    name: 'monto', 
    type: Number, 
    required: true,
    description: 'Monto base para calcular el impuesto'
  })
  @ApiQuery({ 
    name: 'pais', 
    type: String, 
    required: true,
    description: 'País para el cálculo del impuesto'
  })
  @ApiQuery({ 
    name: 'estado_region', 
    type: String, 
    required: true,
    description: 'Estado/región para el cálculo del impuesto'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Impuesto calculado exitosamente',
    type: RespuestaEstandarDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Parámetros de cálculo inválidos'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Configuración no encontrada para la tienda especificada'
  })
  async calcularImpuesto(
    @Param() parametros: ParametrosRutaTiendaDto,
    @Query('monto') monto: number,
    @Query('pais') pais: string,
    @Query('estado_region') estadoRegion: string
  ): Promise<RespuestaEstandarDto<{ impuesto: number; monto: number; pais: string; estadoRegion: string }>> {
    return await this.gestionImpuestosArancelesCasoUso.calcularImpuesto(parametros.tiendaId, monto, pais, estadoRegion);
  }

  @Get(':tiendaId/tasas-aplicables')
  @ApiOperation({ 
    summary: 'Obtener tasas aplicables',
    description: 'Obtiene las tasas de impuesto aplicables para una ubicación específica'
  })
  @ApiQuery({ 
    name: 'pais', 
    type: String, 
    required: true,
    description: 'País para consultar las tasas'
  })
  @ApiQuery({ 
    name: 'estado_region', 
    type: String, 
    required: true,
    description: 'Estado/región para consultar las tasas'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Tasas obtenidas exitosamente',
    type: RespuestaEstandarDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Parámetros de consulta inválidos'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Configuración no encontrada para la tienda especificada'
  })
  async obtenerTasasAplicables(
    @Param() parametros: ParametrosRutaTiendaDto,
    @Query('pais') pais: string,
    @Query('estado_region') estadoRegion: string
  ): Promise<RespuestaEstandarDto<{ tasaEstandar: number; tasasReducidas: Array<{ descripcion: string; porcentaje: number }> }>> {
    return await this.gestionImpuestosArancelesCasoUso.obtenerTasasAplicables(parametros.tiendaId, pais, estadoRegion);
  }

  @Get('buscar/por-servicio-fiscal')
  @ApiOperation({ 
    summary: 'Buscar por servicio fiscal',
    description: 'Busca configuraciones por tipo de servicio fiscal'
  })
  @ApiQuery({ 
    name: 'servicio_fiscal', 
    enum: ServicioFiscal,
    required: true,
    description: 'Tipo de servicio fiscal a buscar'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Configuraciones encontradas exitosamente',
    type: RespuestaEstandarDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Servicio fiscal inválido'
  })
  async buscarPorServicioFiscal(
    @Query('servicio_fiscal') servicioFiscal: ServicioFiscal
  ): Promise<RespuestaEstandarDto<RespuestaConfiguracionImpuestosArancelesDto[]>> {
    const criterios: CriteriosBusquedaImpuestosArancelesDto = { servicio_fiscal: servicioFiscal };
    return await this.gestionImpuestosArancelesCasoUso.buscarPorCriterios(criterios);
  }

  @Get('buscar/por-tipo-impuesto')
  @ApiOperation({ 
    summary: 'Buscar por tipo de impuesto',
    description: 'Busca configuraciones por tipo de impuesto'
  })
  @ApiQuery({ 
    name: 'tipo_impuesto', 
    enum: TipoImpuesto,
    required: true,
    description: 'Tipo de impuesto a buscar'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Configuraciones encontradas exitosamente',
    type: RespuestaEstandarDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Tipo de impuesto inválido'
  })
  async buscarPorTipoImpuesto(
    @Query('tipo_impuesto') tipoImpuesto: TipoImpuesto
  ): Promise<RespuestaEstandarDto<RespuestaConfiguracionImpuestosArancelesDto[]>> {
    const criterios: CriteriosBusquedaImpuestosArancelesDto = { tipo_impuesto: tipoImpuesto };
    return await this.gestionImpuestosArancelesCasoUso.buscarPorCriterios(criterios);
  }

  @Get('buscar/por-pais')
  @ApiOperation({ 
    summary: 'Buscar por país',
    description: 'Busca configuraciones por país'
  })
  @ApiQuery({ 
    name: 'pais', 
    type: String, 
    required: true,
    description: 'País a buscar'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Configuraciones encontradas exitosamente',
    type: RespuestaEstandarDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'País inválido'
  })
  async buscarPorPais(
    @Query('pais') pais: string
  ): Promise<RespuestaEstandarDto<RespuestaConfiguracionImpuestosArancelesDto[]>> {
    const criterios: CriteriosBusquedaImpuestosArancelesDto = { pais };
    return await this.gestionImpuestosArancelesCasoUso.buscarPorCriterios(criterios);
  }

  @Get('buscar/por-criterios')
  @ApiOperation({ 
    summary: 'Buscar por criterios múltiples',
    description: 'Busca configuraciones por múltiples criterios'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Configuraciones encontradas exitosamente',
    type: RespuestaEstandarDto
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async buscarPorCriterios(
    @Query() criterios: CriteriosBusquedaImpuestosArancelesDto
  ): Promise<RespuestaEstandarDto<RespuestaConfiguracionImpuestosArancelesDto[]>> {
    return await this.gestionImpuestosArancelesCasoUso.buscarPorCriterios(criterios);
  }

  @Get('estadisticas/generales')
  @ApiOperation({ 
    summary: 'Obtener estadísticas generales',
    description: 'Obtiene estadísticas generales de las configuraciones de impuestos y aranceles'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Estadísticas obtenidas exitosamente',
    type: RespuestaEstandarDto
  })
  async obtenerEstadisticasGenerales(): Promise<RespuestaEstandarDto<{
    totalConfiguraciones: number;
    shopifyTax: number;
    manual: number;
    basicTax: number;
    conArancelCheckout: number;
    conDdpDisponible: number;
    conIvaDigitales: number;
    regionesFiscalesPromedio: number;
  }>> {
    return await this.gestionImpuestosArancelesCasoUso.obtenerEstadisticas();
  }

  @Post(':tiendaId/exportar')
  @ApiOperation({ 
    summary: 'Exportar configuración',
    description: 'Exporta la configuración completa en formato JSON'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Configuración exportada exitosamente',
    type: RespuestaEstandarDto
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Configuración no encontrada para la tienda especificada'
  })
  async exportarConfiguracion(
    @Param() parametros: ParametrosRutaTiendaDto
  ): Promise<RespuestaEstandarDto<any>> {
    return await this.gestionImpuestosArancelesCasoUso.exportarConfiguracion(parametros.tiendaId);
  }

  @Post(':tiendaId/importar')
  @ApiOperation({ 
    summary: 'Importar configuración',
    description: 'Importa una configuración desde un formato JSON'
  })
  @ApiBody({ 
    schema: {
      type: 'object',
      description: 'Datos de configuración en formato JSON'
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Configuración importada exitosamente',
    type: RespuestaEstandarDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Datos de importación inválidos'
  })
  async importarConfiguracion(
    @Param() parametros: ParametrosRutaTiendaDto,
    @Body() datos: any
  ): Promise<RespuestaEstandarDto<null>> {
    return await this.gestionImpuestosArancelesCasoUso.importarConfiguracion(parametros.tiendaId, datos);
  }

  @Get('configuraciones-con-problemas')
  @ApiOperation({ 
    summary: 'Obtener configuraciones con problemas',
    description: 'Obtiene las configuraciones que tienen problemas de integridad o consistencia'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Configuraciones con problemas obtenidas exitosamente',
    type: RespuestaEstandarDto
  })
  async obtenerConfiguracionesConProblemas(): Promise<RespuestaEstandarDto<RespuestaConfiguracionImpuestosArancelesDto[]>> {
    return await this.gestionImpuestosArancelesCasoUso.obtenerConfiguracionesConProblemas();
  }
}