import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsDateString, IsObject, IsOptional, IsNumber, Min, Max, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { TipoReporte, GranularidadTiempo } from '../../dominio/entidades/reporte.entity';

/**
 * DTO para la generación de reportes
 * Define la estructura de entrada para la creación de reportes
 */
export class GenerarReporteDto {
  @ApiProperty({
    description: 'Tipo de reporte a generar',
    enum: TipoReporte,
    example: TipoReporte.VENTAS_POR_PERIODO,
  })
  @IsEnum(TipoReporte, {
    message: 'El tipo de reporte debe ser uno de: VENTAS_POR_PERIODO, PRODUCTOS_MAS_VENDIDOS, CLIENTES_MAS_ACTIVOS, DESCUENTOS_UTILIZADOS, INVENTARIO_NIVELES',
  })
  tipo: TipoReporte;

  @ApiProperty({
    description: 'Fecha de inicio para el reporte (formato ISO 8601)',
    example: '2024-01-01T00:00:00.000Z',
  })
  @IsDateString({}, { message: 'La fecha de inicio debe ser una fecha válida en formato ISO' })
  fechaInicio: string;

  @ApiProperty({
    description: 'Fecha de fin para el reporte (formato ISO 8601)',
    example: '2024-12-31T23:59:59.999Z',
  })
  @IsDateString({}, { message: 'La fecha de fin debe ser una fecha válida en formato ISO' })
  fechaFin: string;

  @ApiPropertyOptional({
    description: 'Parámetros adicionales para el reporte',
    type: Object,
    example: {
      granularidad: GranularidadTiempo.MENSUAL,
      limite: 10,
      nivelAlerta: 20,
      categoriaId: 'categoria_123',
      vendedorId: 'vendedor_456',
    },
  })
  @IsObject({ message: 'Los parámetros deben ser un objeto' })
  @IsOptional()
  parametros?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Granularidad de tiempo para reportes de ventas por período',
    enum: GranularidadTiempo,
    example: GranularidadTiempo.MENSUAL,
  })
  @IsEnum(GranularidadTiempo, {
    message: 'La granularidad debe ser uno de: DIARIO, SEMANAL, MENSUAL, TRIMESTRAL, ANUAL',
  })
  @IsOptional()
  granularidad?: GranularidadTiempo;

  @ApiPropertyOptional({
    description: 'Límite de elementos para reportes de listados (1-100)',
    minimum: 1,
    maximum: 100,
    example: 10,
  })
  @IsNumber({}, { message: 'El límite debe ser un número' })
  @Min(1, { message: 'El límite mínimo es 1' })
  @Max(100, { message: 'El límite máximo es 100' })
  @IsOptional()
  @Type(() => Number)
  limite?: number;

  @ApiPropertyOptional({
    description: 'Nivel de alerta para reportes de inventario (0-100)',
    minimum: 0,
    maximum: 100,
    example: 20,
  })
  @IsNumber({}, { message: 'El nivel de alerta debe ser un número' })
  @Min(0, { message: 'El nivel de alerta mínimo es 0' })
  @Max(100, { message: 'El nivel de alerta máximo es 100' })
  @IsOptional()
  @Type(() => Number)
  nivelAlerta?: number;

  @ApiPropertyOptional({
    description: 'ID de categoría para filtrar reportes',
    example: 'categoria_123456789',
  })
  @IsString({ message: 'El ID de categoría debe ser una cadena de texto' })
  @IsOptional()
  categoriaId?: string;

  @ApiPropertyOptional({
    description: 'ID de vendedor para filtrar reportes',
    example: 'vendedor_123456789',
  })
  @IsString({ message: 'El ID de vendedor debe ser una cadena de texto' })
  @IsOptional()
  vendedorId?: string;
}

/**
 * DTO para la respuesta de generación de reportes
 */
export class ReporteGeneradoDto {
  @ApiProperty({
    description: 'ID único del reporte generado',
    example: 'reporte_123456789',
  })
  id: string;

  @ApiProperty({
    description: 'Tipo de reporte generado',
    enum: TipoReporte,
    example: TipoReporte.VENTAS_POR_PERIODO,
  })
  tipo: TipoReporte;

  @ApiProperty({
    description: 'Fecha y hora de generación del reporte',
    example: '2024-01-01T10:30:00.000Z',
  })
  fechaGeneracion: Date;

  @ApiProperty({
    description: 'Fecha de inicio del período del reporte',
    example: '2024-01-01T00:00:00.000Z',
  })
  fechaInicio: Date;

  @ApiProperty({
    description: 'Fecha de fin del período del reporte',
    example: '2024-12-31T23:59:59.999Z',
  })
  fechaFin: Date;

  @ApiProperty({
    description: 'Estado actual del reporte',
    enum: ['PENDIENTE', 'PROCESANDO', 'COMPLETADO', 'ERROR'],
    example: 'COMPLETADO',
  })
  estado: string;

  @ApiProperty({
    description: 'Datos del reporte generado',
    type: Object,
    example: {
      ventas: [
        {
          fecha: '2024-01-01',
          total: 1500,
          cantidadOrdenes: 15,
          promedioOrden: 100,
        },
      ],
    },
  })
  datos: Record<string, any>;

  @ApiProperty({
    description: 'Métricas calculadas del reporte',
    type: Object,
    example: {
      totalVentas: 1500,
      totalOrdenes: 15,
      promedioVenta: 100,
      crecimiento: 15.5,
    },
  })
  metricas: Record<string, any>;

  @ApiProperty({
    description: 'Parámetros utilizados para generar el reporte',
    type: Object,
    example: {
      granularidad: 'MENSUAL',
      limite: 10,
    },
  })
  parametros: Record<string, any>;
}

/**
 * DTO para listar reportes con paginación
 */
export class ListarReportesDto {
  @ApiPropertyOptional({
    description: 'Número de página (por defecto: 1)',
    minimum: 1,
    example: 1,
  })
  @IsNumber({}, { message: 'La página debe ser un número' })
  @Min(1, { message: 'La página mínima es 1' })
  @IsOptional()
  @Type(() => Number)
  pagina?: number = 1;

  @ApiPropertyOptional({
    description: 'Límite de elementos por página (por defecto: 20, máximo: 100)',
    minimum: 1,
    maximum: 100,
    example: 20,
  })
  @IsNumber({}, { message: 'El límite debe ser un número' })
  @Min(1, { message: 'El límite mínimo es 1' })
  @Max(100, { message: 'El límite máximo es 100' })
  @IsOptional()
  @Type(() => Number)
  limite?: number = 20;

  @ApiPropertyOptional({
    description: 'Filtrar por tipo de reporte',
    enum: TipoReporte,
    example: TipoReporte.VENTAS_POR_PERIODO,
  })
  @IsEnum(TipoReporte, {
    message: 'El tipo de reporte debe ser uno de: VENTAS_POR_PERIODO, PRODUCTOS_MAS_VENDIDOS, CLIENTES_MAS_ACTIVOS, DESCUENTOS_UTILIZADOS, INVENTARIO_NIVELES',
  })
  @IsOptional()
  tipo?: TipoReporte;

  @ApiPropertyOptional({
    description: 'Filtrar por estado del reporte',
    enum: ['PENDIENTE', 'PROCESANDO', 'COMPLETADO', 'ERROR'],
    example: 'COMPLETADO',
  })
  @IsEnum(['PENDIENTE', 'PROCESANDO', 'COMPLETADO', 'ERROR'], {
    message: 'El estado debe ser uno de: PENDIENTE, PROCESANDO, COMPLETADO, ERROR',
  })
  @IsOptional()
  estado?: string;

  @ApiPropertyOptional({
    description: 'Fecha de inicio para filtrar reportes generados (formato ISO)',
    example: '2024-01-01T00:00:00.000Z',
  })
  @IsDateString({}, { message: 'La fecha de inicio debe ser una fecha válida en formato ISO' })
  @IsOptional()
  fechaInicio?: string;

  @ApiPropertyOptional({
    description: 'Fecha de fin para filtrar reportes generados (formato ISO)',
    example: '2024-12-31T23:59:59.999Z',
  })
  @IsDateString({}, { message: 'La fecha de fin debe ser una fecha válida en formato ISO' })
  @IsOptional()
  fechaFin?: string;
}

/**
 * DTO para la respuesta de listado de reportes
 */
export class ListaReportesDto {
  @ApiProperty({
    description: 'Lista de reportes',
    type: [ReporteGeneradoDto],
  })
  elementos: ReporteGeneradoDto[];

  @ApiProperty({
    description: 'Información de paginación',
    type: Object,
    example: {
      total_elementos: 50,
      total_paginas: 5,
      pagina_actual: 1,
      limite: 10,
      tiene_siguiente: true,
      tiene_anterior: false,
    },
  })
  paginacion: {
    total_elementos: number;
    total_paginas: number;
    pagina_actual: number;
    limite: number;
    tiene_siguiente: boolean;
    tiene_anterior: boolean;
  };
}

/**
 * DTO para estadísticas de reportes
 */
export class EstadisticasReportesDto {
  @ApiProperty({
    description: 'Total de reportes generados',
    example: 150,
  })
  totalReportes: number;

  @ApiProperty({
    description: 'Distribución de reportes por tipo',
    type: Object,
    example: {
      VENTAS_POR_PERIODO: 50,
      PRODUCTOS_MAS_VENDIDOS: 35,
      CLIENTES_MAS_ACTIVOS: 25,
      DESCUENTOS_UTILIZADOS: 20,
      INVENTARIO_NIVELES: 20,
    },
  })
  reportesPorTipo: Record<string, number>;

  @ApiProperty({
    description: 'Distribución de reportes por estado',
    type: Object,
    example: {
      COMPLETADO: 120,
      PENDIENTE: 15,
      PROCESANDO: 10,
      ERROR: 5,
    },
  })
  reportesPorEstado: Record<string, number>;

  @ApiProperty({
    description: 'Número de reportes generados en la última semana',
    example: 25,
  })
  reportesUltimaSemana: number;
}