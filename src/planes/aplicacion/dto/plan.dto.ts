import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { 
  IsString, 
  IsNumber, 
  IsEnum, 
  IsOptional, 
  IsBoolean, 
  IsDate, 
  IsArray, 
  ValidateNested, 
  Min, 
  Max, 
  IsPositive,
  IsNotEmpty,
  IsDateString
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO para obtener información del plan actual
 */
export class ObtenerPlanActualDto {
  // No recibe parámetros, solo valida permisos
}

/**
 * DTO para cambiar de plan
 */
export class CambiarPlanDto {
  @ApiProperty({
    description: 'Tipo de plan al que se desea cambiar',
    example: 'Shopify',
    enum: ['Básico', 'Shopify', 'Avanzado', 'Empresarial']
  })
  @IsString()
  @IsNotEmpty()
  @IsEnum(['Básico', 'Shopify', 'Avanzado', 'Empresarial'], {
    message: 'tipoPlan debe ser uno de: Básico, Shopify, Avanzado, Empresarial'
  })
  tipoPlan: string;

  @ApiProperty({
    description: 'Fecha de renovación del plan',
    example: '2024-12-31T23:59:59.999Z'
  })
  @IsDateString()
  @IsNotEmpty()
  fechaRenovacion: string;

  @ApiProperty({
    description: 'ID del método de pago asociado',
    example: 'pm_1ABCdefGHIjklMNOpqrstuvw'
  })
  @IsString()
  @IsNotEmpty()
  metodoPagoAsociado: string;
}

/**
 * DTO para cancelar un plan
 */
export class CancelarPlanDto {
  @ApiProperty({
    description: 'Confirmación de cancelación',
    example: true
  })
  @IsBoolean()
  @IsNotEmpty()
  confirmarCancelacion: boolean;

  @ApiProperty({
    description: 'Aceptación de condiciones de cancelación',
    example: true
  })
  @IsBoolean()
  @IsNotEmpty()
  condicionesCancelacionAceptadas: boolean;
}

/**
 * DTO para obtener el historial de planes
 */
export class ObtenerHistorialPlanesDto {
  // No recibe parámetros, solo valida permisos
}

/**
 * DTO para crear un nuevo plan
 */
export class CrearPlanDto {
  @ApiProperty({
    description: 'Nombre del plan',
    example: 'Plan Básico'
  })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({
    description: 'Código único del plan',
    example: 'basico'
  })
  @IsString()
  @IsNotEmpty()
  codigo: string;

  @ApiPropertyOptional({
    description: 'Descripción del plan',
    example: 'Plan ideal para pequeñas empresas'
  })
  @IsString()
  @IsOptional()
  descripcion?: string;

  @ApiProperty({
    description: 'Precio mensual del plan',
    example: 29.99
  })
  @IsNumber()
  @IsPositive()
  precioMensual: number;

  @ApiPropertyOptional({
    description: 'Precio anual del plan (si aplica)',
    example: 299.99
  })
  @IsNumber()
  @IsPositive()
  @IsOptional()
  precioAnual?: number;

  @ApiProperty({
    description: 'Moneda del plan',
    example: 'USD'
  })
  @IsString()
  @IsNotEmpty()
  moneda: string;

  @ApiProperty({
    description: 'Características del plan',
    example: {
      productosMaximos: 100,
      ordenesMaximasMensuales: 1000,
      almacenamientoGb: 5,
      soportePrioritario: false,
      reportesAvanzados: false,
      integracionesApi: true,
      personalizacionTema: true,
      dominioPersonalizado: false,
      eliminacionMarcaAgua: false,
      accesoApi: true
    }
  })
  @IsNotEmpty()
  caracteristicas: Record<string, any>;

  @ApiProperty({
    description: 'Límites del plan',
    example: {
      productos: 100,
      ordenesMensuales: 1000,
      almacenamiento: 5,
      usuarios: 3,
      integraciones: 5
    }
  })
  @IsNotEmpty()
  limites: Record<string, number>;
}

/**
 * DTO para actualizar un plan existente
 */
export class ActualizarPlanDto {
  @ApiPropertyOptional({
    description: 'Nombre del plan',
    example: 'Plan Básico Mejorado'
  })
  @IsString()
  @IsOptional()
  nombre?: string;

  @ApiPropertyOptional({
    description: 'Descripción del plan',
    example: 'Plan ideal para pequeñas empresas con nuevas características'
  })
  @IsString()
  @IsOptional()
  descripcion?: string;

  @ApiPropertyOptional({
    description: 'Precio mensual del plan',
    example: 39.99
  })
  @IsNumber()
  @IsPositive()
  @IsOptional()
  precioMensual?: number;

  @ApiPropertyOptional({
    description: 'Precio anual del plan (si aplica)',
    example: 399.99
  })
  @IsNumber()
  @IsPositive()
  @IsOptional()
  precioAnual?: number;

  @ApiPropertyOptional({
    description: 'Moneda del plan',
    example: 'USD'
  })
  @IsString()
  @IsOptional()
  moneda?: string;

  @ApiPropertyOptional({
    description: 'Estado del plan',
    example: 'ACTIVO',
    enum: ['ACTIVO', 'INACTIVO', 'ARCHIVADO']
  })
  @IsString()
  @IsEnum(['ACTIVO', 'INACTIVO', 'ARCHIVADO'])
  @IsOptional()
  estado?: string;

  @ApiPropertyOptional({
    description: 'Características del plan',
    example: {
      productosMaximos: 150,
      ordenesMaximasMensuales: 1500,
      almacenamientoGb: 10,
      soportePrioritario: true,
      reportesAvanzados: false,
      integracionesApi: true,
      personalizacionTema: true,
      dominioPersonalizado: false,
      eliminacionMarcaAgua: false,
      accesoApi: true
    }
  })
  @IsOptional()
  caracteristicas?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Límites del plan',
    example: {
      productos: 150,
      ordenesMensuales: 1500,
      almacenamiento: 10,
      usuarios: 5,
      integraciones: 10
    }
  })
  @IsOptional()
  limites?: Record<string, number>;
}

/**
 * DTO para la respuesta del plan actual
 */
export class PlanActualRespuestaDto {
  @ApiProperty({
    description: 'Información del plan actual'
  })
  plan: any;

  @ApiProperty({
    description: 'Estado de facturación'
  })
  estadoFacturacion: string;

  @ApiProperty({
    description: 'Fecha de renovación'
  })
  fechaRenovacion: Date;

  @ApiProperty({
    description: 'Método de pago actual'
  })
  metodoPago: string;

  @ApiProperty({
    description: 'Resumen de beneficios del plan'
  })
  beneficios: string[];

  @ApiProperty({
    description: 'Historial de cambios recientes'
  })
  historialCambios: any[];
}

/**
 * DTO para la respuesta del historial de planes
 */
export class HistorialPlanesRespuestaDto {
  @ApiProperty({
    description: 'Lista de cambios de plan'
  })
  elementos: any[];

  @ApiProperty({
    description: 'Información de paginación'
  })
  paginacion: {
    total_elementos: number;
    total_paginas: number;
    pagina_actual: number;
    limite: number;
  };
}

/**
 * DTO para validar la existencia de pagos pendientes
 */
export class ValidarPagosPendientesDto {
  @ApiProperty({
    description: 'ID de la suscripción',
    example: 'sub_123456789'
  })
  @IsString()
  @IsNotEmpty()
  suscripcionId: string;
}

/**
 * DTO para la respuesta de validación de pagos pendientes
 */
export class ValidacionPagosPendientesRespuestaDto {
  @ApiProperty({
    description: 'Indica si hay pagos pendientes',
    example: false
  })
  hayPagosPendientes: boolean;

  @ApiPropertyOptional({
    description: 'Monto pendiente si hay pagos',
    example: 29.99
  })
  montoPendiente?: number;

  @ApiPropertyOptional({
    description: 'Fecha de vencimiento del pago pendiente',
    example: '2024-12-31T23:59:59.999Z'
  })
  fechaVencimiento?: string;

  @ApiPropertyOptional({
    description: 'Advertencia si hay pagos sin procesar',
    example: 'Tiene un pago pendiente de $29.99 que debe procesarse antes de cancelar'
  })
  advertencia?: string;
}