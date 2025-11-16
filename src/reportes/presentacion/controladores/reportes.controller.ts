import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
// Guards y decorators de autenticación (implementados en otros módulos)
// import { JwtAuthGuard } from '../../../autenticacion/presentacion/guards/jwt-auth.guard';
// import { RolesGuard } from '../../../autenticacion/presentacion/guards/roles.guard';
// import { Roles } from '../../../autenticacion/presentacion/decorators/roles.decorator';
// import { RolUsuario } from '../../../autenticacion/dominio/enums/rol-usuario.enum';
import { GenerarReporteDto, ListarReportesDto, ReporteGeneradoDto, EstadisticasReportesDto } from '../../aplicacion/dto/generar-reporte.dto';
import { GenerarReporteCasoUso, ParametrosGenerarReporte } from '../../dominio/casos-uso/generar-reporte.caso-uso';
import type { RepositorioReporte } from '../../dominio/interfaces/repositorio-reporte.interface';
import { Reporte, TipoReporte, EstadoReporte } from '../../dominio/entidades/reporte.entity';

/**
 * Controlador para la gestión de reportes y analíticas
 * Proporciona endpoints para generación y consulta de reportes
 */
@ApiTags('Reportes')
@ApiBearerAuth()
@Controller('api/v1/reportes')
// @UseGuards(JwtAuthGuard, RolesGuard)
export class ReportesController {
  constructor(
    private readonly generarReporteCasoUso: GenerarReporteCasoUso,
    @Inject('RepositorioReporte')
    private readonly repositorioReporte: RepositorioReporte,
  ) {}

  @Post()
  // @Roles(RolUsuario.ADMIN, RolUsuario.EDITOR)
  @ApiOperation({
    summary: 'Generar un nuevo reporte',
    description: 'Genera un reporte de analíticas basado en los parámetros proporcionados',
  })
  @ApiResponse({
    status: 201,
    description: 'Reporte generado exitosamente',
    schema: {
      example: {
        mensaje: 'Reporte generado exitosamente',
        data: {
          id: 'reporte_123456789',
          tipo: 'VENTAS_POR_PERIODO',
          fechaGeneracion: '2024-01-01T10:30:00.000Z',
          fechaInicio: '2024-01-01T00:00:00.000Z',
          fechaFin: '2024-12-31T23:59:59.999Z',
          estado: 'COMPLETADO',
          datos: {
            ventas: [
              {
                fecha: '2024-01-01',
                total: 1500,
                cantidadOrdenes: 15,
                promedioOrden: 100,
              },
            ],
          },
          metricas: {
            totalVentas: 1500,
            totalOrdenes: 15,
            promedioVenta: 100,
            crecimiento: 15.5,
          },
          parametros: {
            granularidad: 'MENSUAL',
            limite: 10,
          },
        },
        tipo_mensaje: 'Exito',
        estado_respuesta: 201,
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Error en la generación del reporte',
    schema: {
      example: {
        mensaje: 'El rango de fechas no puede ser mayor a 1 año',
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: 400,
      },
    },
  })
  async generar(@Body() generarReporteDto: GenerarReporteDto) {
    try {
      const parametros: ParametrosGenerarReporte = {
        tipo: generarReporteDto.tipo,
        fechaInicio: new Date(generarReporteDto.fechaInicio),
        fechaFin: new Date(generarReporteDto.fechaFin),
        parametros: {
          granularidad: generarReporteDto.granularidad,
          limite: generarReporteDto.limite,
          nivelAlerta: generarReporteDto.nivelAlerta,
          categoriaId: generarReporteDto.categoriaId,
          vendedorId: generarReporteDto.vendedorId,
          ...generarReporteDto.parametros,
        },
      };

      const reporte = await this.generarReporteCasoUso.ejecutar(parametros);

      return {
        mensaje: 'Reporte generado exitosamente',
        data: this.aDto(reporte),
        tipo_mensaje: 'Exito',
        estado_respuesta: HttpStatus.CREATED,
      };
    } catch (error) {
      return {
        mensaje: error.message,
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: HttpStatus.BAD_REQUEST,
      };
    }
  }

  @Get()
  // @Roles(RolUsuario.ADMIN, RolUsuario.EDITOR, RolUsuario.VENDEDOR)
  @ApiOperation({
    summary: 'Listar reportes generados',
    description: 'Obtiene una lista paginada de reportes con filtros opcionales',
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
    description: 'Límite de elementos por página (por defecto: 20, máximo: 100)',
    example: 20,
  })
  @ApiQuery({
    name: 'tipo',
    required: false,
    enum: TipoReporte,
    description: 'Filtrar por tipo de reporte',
    example: TipoReporte.VENTAS_POR_PERIODO,
  })
  @ApiQuery({
    name: 'estado',
    required: false,
    enum: EstadoReporte,
    description: 'Filtrar por estado del reporte',
    example: EstadoReporte.COMPLETADO,
  })
  @ApiQuery({
    name: 'fechaInicio',
    required: false,
    type: String,
    description: 'Fecha de inicio para filtrar reportes generados (formato ISO)',
    example: '2024-01-01T00:00:00.000Z',
  })
  @ApiQuery({
    name: 'fechaFin',
    required: false,
    type: String,
    description: 'Fecha de fin para filtrar reportes generados (formato ISO)',
    example: '2024-12-31T23:59:59.999Z',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de reportes obtenida exitosamente',
    schema: {
      example: {
        mensaje: 'Lista de reportes obtenida exitosamente',
        data: {
          elementos: [
            {
              id: 'reporte_123456789',
              tipo: 'VENTAS_POR_PERIODO',
              fechaGeneracion: '2024-01-01T10:30:00.000Z',
              fechaInicio: '2024-01-01T00:00:00.000Z',
              fechaFin: '2024-12-31T23:59:59.999Z',
              estado: 'COMPLETADO',
              parametros: {
                granularidad: 'MENSUAL',
                limite: 10,
              },
            },
          ],
          paginacion: {
            total_elementos: 50,
            total_paginas: 5,
            pagina_actual: 1,
            limite: 10,
            tiene_siguiente: true,
            tiene_anterior: false,
          },
        },
        tipo_mensaje: 'Exito',
        estado_respuesta: 200,
      },
    },
  })
  async listar(
    @Query('pagina') pagina: number = 1,
    @Query('limite') limite: number = 20,
    @Query('tipo') tipo?: TipoReporte,
    @Query('estado') estado?: EstadoReporte,
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin') fechaFin?: string,
  ) {
    try {
      const resultado = await this.repositorioReporte.listar({
        pagina: Number(pagina),
        limite: Number(limite),
        tipo,
        estado,
        fechaInicio: fechaInicio ? new Date(fechaInicio) : undefined,
        fechaFin: fechaFin ? new Date(fechaFin) : undefined,
      });

      return {
        mensaje: 'Lista de reportes obtenida exitosamente',
        data: {
          elementos: resultado.reportes.map(reporte => ({
            id: reporte.id,
            tipo: reporte.tipo,
            fechaGeneracion: reporte.fechaGeneracion,
            fechaInicio: reporte.fechaInicio,
            fechaFin: reporte.fechaFin,
            estado: reporte.estado,
            parametros: reporte.parametros,
            metricas: reporte.metricas,
          })),
          paginacion: {
            total_elementos: resultado.total,
            total_paginas: Math.ceil(resultado.total / limite),
            pagina_actual: pagina,
            limite: limite,
            tiene_siguiente: pagina < Math.ceil(resultado.total / limite),
            tiene_anterior: pagina > 1,
          },
        },
        tipo_mensaje: 'Exito',
        estado_respuesta: HttpStatus.OK,
      };
    } catch (error) {
      return {
        mensaje: error.message,
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: HttpStatus.BAD_REQUEST,
      };
    }
  }

  @Get('estadisticas')
  // @Roles(RolUsuario.ADMIN, RolUsuario.EDITOR)
  @ApiOperation({
    summary: 'Obtener estadísticas de reportes',
    description: 'Obtiene estadísticas generales sobre los reportes generados en el sistema',
  })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas obtenidas exitosamente',
    schema: {
      example: {
        mensaje: 'Estadísticas de reportes obtenidas exitosamente',
        data: {
          totalReportes: 150,
          reportesPorTipo: {
            VENTAS_POR_PERIODO: 50,
            PRODUCTOS_MAS_VENDIDOS: 35,
            CLIENTES_MAS_ACTIVOS: 25,
            DESCUENTOS_UTILIZADOS: 20,
            INVENTARIO_NIVELES: 20,
          },
          reportesPorEstado: {
            COMPLETADO: 120,
            PENDIENTE: 15,
            PROCESANDO: 10,
            ERROR: 5,
          },
          reportesUltimaSemana: 25,
        },
        tipo_mensaje: 'Exito',
        estado_respuesta: 200,
      },
    },
  })
  async obtenerEstadisticas() {
    try {
      const estadisticas = await this.repositorioReporte.obtenerEstadisticas();

      return {
        mensaje: 'Estadísticas de reportes obtenidas exitosamente',
        data: estadisticas,
        tipo_mensaje: 'Exito',
        estado_respuesta: HttpStatus.OK,
      };
    } catch (error) {
      return {
        mensaje: error.message,
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: HttpStatus.BAD_REQUEST,
      };
    }
  }

  @Get('tipos')
  // @Roles(RolUsuario.ADMIN, RolUsuario.EDITOR, RolUsuario.VENDEDOR)
  @ApiOperation({
    summary: 'Obtener tipos de reporte disponibles',
    description: 'Obtiene la lista de todos los tipos de reporte disponibles en el sistema',
  })
  @ApiResponse({
    status: 200,
    description: 'Tipos de reporte obtenidos exitosamente',
    schema: {
      example: {
        mensaje: 'Tipos de reporte obtenidos exitosamente',
        data: {
          tipos: [
            {
              valor: 'VENTAS_POR_PERIODO',
              descripcion: 'Reporte de ventas por período de tiempo',
              parametros: ['granularidad'],
            },
            {
              valor: 'PRODUCTOS_MAS_VENDIDOS',
              descripcion: 'Reporte de productos más vendidos',
              parametros: ['limite'],
            },
            {
              valor: 'CLIENTES_MAS_ACTIVOS',
              descripcion: 'Reporte de clientes más activos',
              parametros: ['limite'],
            },
            {
              valor: 'DESCUENTOS_UTILIZADOS',
              descripcion: 'Reporte de descuentos utilizados',
              parametros: [],
            },
            {
              valor: 'INVENTARIO_NIVELES',
              descripcion: 'Reporte de niveles de inventario',
              parametros: ['nivelAlerta'],
            },
          ],
        },
        tipo_mensaje: 'Exito',
        estado_respuesta: 200,
      },
    },
  })
  async obtenerTipos() {
    const tipos = [
      {
        valor: TipoReporte.VENTAS_POR_PERIODO,
        descripcion: 'Reporte de ventas por período de tiempo',
        parametros: ['granularidad'],
      },
      {
        valor: TipoReporte.PRODUCTOS_MAS_VENDIDOS,
        descripcion: 'Reporte de productos más vendidos',
        parametros: ['limite'],
      },
      {
        valor: TipoReporte.CLIENTES_MAS_ACTIVOS,
        descripcion: 'Reporte de clientes más activos',
        parametros: ['limite'],
      },
      {
        valor: TipoReporte.DESCUENTOS_UTILIZADOS,
        descripcion: 'Reporte de descuentos utilizados',
        parametros: [],
      },
      {
        valor: TipoReporte.INVENTARIO_NIVELES,
        descripcion: 'Reporte de niveles de inventario',
        parametros: ['nivelAlerta'],
      },
    ];

    return {
      mensaje: 'Tipos de reporte obtenidos exitosamente',
      data: { tipos },
      tipo_mensaje: 'Exito',
      estado_respuesta: HttpStatus.OK,
    };
  }

  @Get(':id')
  // @Roles(RolUsuario.ADMIN, RolUsuario.EDITOR, RolUsuario.VENDEDOR)
  @ApiOperation({
    summary: 'Obtener reporte por ID',
    description: 'Obtiene la información completa de un reporte específico',
  })
  @ApiResponse({
    status: 200,
    description: 'Reporte obtenido exitosamente',
    schema: {
      example: {
        mensaje: 'Reporte obtenido exitosamente',
        data: {
          id: 'reporte_123456789',
          tipo: 'VENTAS_POR_PERIODO',
          fechaGeneracion: '2024-01-01T10:30:00.000Z',
          fechaInicio: '2024-01-01T00:00:00.000Z',
          fechaFin: '2024-12-31T23:59:59.999Z',
          estado: 'COMPLETADO',
          datos: {
            ventas: [
              {
                fecha: '2024-01-01',
                total: 1500,
                cantidadOrdenes: 15,
                promedioOrden: 100,
              },
            ],
          },
          metricas: {
            totalVentas: 1500,
            totalOrdenes: 15,
            promedioVenta: 100,
            crecimiento: 15.5,
          },
          parametros: {
            granularidad: 'MENSUAL',
            limite: 10,
          },
        },
        tipo_mensaje: 'Exito',
        estado_respuesta: 200,
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Reporte no encontrado',
    schema: {
      example: {
        mensaje: 'Reporte no encontrado',
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: 404,
      },
    },
  })
  async obtenerPorId(@Param('id') id: string) {
    try {
      const reporte = await this.repositorioReporte.buscarPorId(id);

      if (!reporte) {
        return {
          mensaje: 'Reporte no encontrado',
          data: null,
          tipo_mensaje: 'ErrorCliente',
          estado_respuesta: HttpStatus.NOT_FOUND,
        };
      }

      return {
        mensaje: 'Reporte obtenido exitosamente',
        data: {
          id: reporte.id,
          tipo: reporte.tipo,
          fechaGeneracion: reporte.fechaGeneracion,
          fechaInicio: reporte.fechaInicio,
          fechaFin: reporte.fechaFin,
          estado: reporte.estado,
          datos: reporte.datos,
          metricas: reporte.metricas,
          parametros: reporte.parametros,
        },
        tipo_mensaje: 'Exito',
        estado_respuesta: HttpStatus.OK,
      };
    } catch (error) {
      return {
        mensaje: error.message,
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: HttpStatus.BAD_REQUEST,
      };
    }
  }

  @Delete(':id')
  // @Roles(RolUsuario.ADMIN, RolUsuario.EDITOR)
  @ApiOperation({
    summary: 'Eliminar reporte',
    description: 'Elimina permanentemente un reporte del sistema',
  })
  @ApiResponse({
    status: 200,
    description: 'Reporte eliminado exitosamente',
    schema: {
      example: {
        mensaje: 'Reporte eliminado exitosamente',
        data: null,
        tipo_mensaje: 'Exito',
        estado_respuesta: 200,
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Reporte no encontrado',
    schema: {
      example: {
        mensaje: 'Reporte no encontrado',
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: 404,
      },
    },
  })
  async eliminar(@Param('id') id: string) {
    try {
      await this.repositorioReporte.eliminar(id);

      return {
        mensaje: 'Reporte eliminado exitosamente',
        data: null,
        tipo_mensaje: 'Exito',
        estado_respuesta: HttpStatus.OK,
      };
    } catch (error) {
      return {
        mensaje: error.message,
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: HttpStatus.BAD_REQUEST,
      };
    }
  }

  @Post('limpiar/antiguos')
  // @Roles(RolUsuario.ADMIN)
  @ApiOperation({
    summary: 'Limpiar reportes antiguos',
    description: 'Elimina automáticamente reportes con más de 30 días de antigüedad',
  })
  @ApiResponse({
    status: 200,
    description: 'Reportes antiguos eliminados exitosamente',
    schema: {
      example: {
        mensaje: 'Se eliminaron 15 reportes antiguos',
        data: {
          reportesEliminados: 15,
        },
        tipo_mensaje: 'Exito',
        estado_respuesta: 200,
      },
    },
  })
  async limpiarReportesAntiguos() {
    try {
      const reportesEliminados = await this.repositorioReporte.limpiarReportesAntiguos();

      return {
        mensaje: `Se eliminaron ${reportesEliminados} reportes antiguos`,
        data: {
          reportesEliminados,
        },
        tipo_mensaje: 'Exito',
        estado_respuesta: HttpStatus.OK,
      };
    } catch (error) {
      return {
        mensaje: error.message,
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: HttpStatus.BAD_REQUEST,
      };
    }
  }

  /**
   * Convierte una entidad Reporte a un DTO para la respuesta
   */
  private aDto(reporte: Reporte): ReporteGeneradoDto {
    return {
      id: reporte.getId(),
      tipo: reporte.getTipo(),
      fechaGeneracion: reporte.getFechaGeneracion(),
      fechaInicio: reporte.getFechaInicio(),
      fechaFin: reporte.getFechaFin(),
      estado: reporte.getEstado(),
      datos: reporte.getDatos(),
      metricas: reporte.calcularMetricas(),
      parametros: reporte.getParametros(),
    };
  }
}