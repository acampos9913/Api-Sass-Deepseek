import { Controller, Get, Query } from '@nestjs/common';
import { ServicioMetricas } from '../../aplicacion/servicios/servicio-metricas';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ServicioRespuestaEstandar } from 'src/comun/aplicacion/servicios/servicio-respuesta-estandar';
import { ServicioMonitoreo } from 'src/monitoreo/aplicacion/servicios/servicio-monitoreo';

@ApiTags('Monitoreo')
@Controller('monitoreo')
export class MonitoreoController {
  constructor(
    private readonly servicioMetricas: ServicioMetricas,
    private readonly servicioMonitoreo: ServicioMonitoreo,
  ) {}

  @Get('metricas')
  @ApiOperation({ summary: 'Obtener métricas del sistema' })
  @ApiResponse({
    status: 200,
    description: 'Métricas obtenidas exitosamente'
  })
  async obtenerMetricas() {
    const metricas = await this.servicioMetricas.obtenerMetricasSistema();
    return ServicioRespuestaEstandar.Respuesta200(
      'Métricas del sistema obtenidas exitosamente',
      metricas,
      'Monitoreo.MetricasObtenidas'
    );
  }

  @Get('estado')
  @ApiOperation({ summary: 'Obtener estado de salud del sistema' })
  @ApiResponse({
    status: 200,
    description: 'Estado de salud obtenido exitosamente'
  })
  async obtenerEstadoSalud() {
    const estado = await this.servicioMonitoreo.verificarEstadoSalud();
    return ServicioRespuestaEstandar.Respuesta200(
      'Estado de salud del sistema obtenido exitosamente',
      estado,
      'Monitoreo.EstadoSaludObtenido'
    );
  }

  @Get('rendimiento')
  @ApiOperation({ summary: 'Obtener métricas de rendimiento' })
  @ApiResponse({
    status: 200,
    description: 'Métricas de rendimiento obtenidas exitosamente'
  })
  async obtenerMetricasRendimiento(
    @Query('desde') desde: string,
    @Query('hasta') hasta: string,
  ) {
    const metricas = await this.servicioMetricas.obtenerMetricasRendimiento(
      desde ? new Date(desde) : undefined,
      hasta ? new Date(hasta) : undefined,
    );
    return ServicioRespuestaEstandar.Respuesta200(
      'Métricas de rendimiento obtenidas exitosamente',
      metricas,
      'Monitoreo.RendimientoObtenido'
    );
  }

  @Get('estadisticas-uso')
  @ApiOperation({ summary: 'Obtener estadísticas de uso de la API' })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas de uso obtenidas exitosamente'
  })
  async obtenerEstadisticasUso(
    @Query('periodo') periodo: string = '7d',
  ) {
    const estadisticas = await this.servicioMetricas.obtenerEstadisticasUso(periodo);
    return ServicioRespuestaEstandar.Respuesta200(
      'Estadísticas de uso obtenidas exitosamente',
      estadisticas,
      'Monitoreo.EstadisticasUsoObtenidas'
    );
  }
}