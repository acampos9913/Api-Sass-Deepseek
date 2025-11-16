import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { 
  IsEnum, 
  IsString, 
  IsBoolean, 
  IsNumber, 
  IsArray, 
  IsOptional, 
  IsNotEmpty, 
  Min, 
  Max,
  ValidateNested,
  IsObject,
  IsDateString,
  ArrayNotEmpty
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Enumeración para tipos de plan disponibles
 */
export enum TipoPlan {
  STARTER = 'starter',
  GROW = 'grow',
  PRO = 'pro',
  ENTERPRISE = 'enterprise'
}

/**
 * Enumeración para ciclos de facturación
 */
export enum CicloFacturacion {
  MENSUAL = 'mensual',
  ANUAL = 'anual'
}

/**
 * Enumeración para estados de suscripción
 */
export enum EstadoSuscripcion {
  ACTIVA = 'activa',
  PENDIENTE = 'pendiente',
  CANCELADA = 'cancelada',
  SUSPENDIDA = 'suspendida'
}

/**
 * DTO para información del plan actual
 */
export class InformacionPlanDto {
  @ApiProperty({
    description: 'Tipo de plan contratado',
    example: TipoPlan.GROW,
    enum: TipoPlan
  })
  @IsEnum(TipoPlan, { message: 'El tipo de plan debe ser válido' })
  @IsNotEmpty({ message: 'El tipo de plan es requerido' })
  tipo_plan: TipoPlan;

  @ApiProperty({
    description: 'Nombre del plan',
    example: 'Grow'
  })
  @IsString({ message: 'El nombre del plan debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre del plan es requerido' })
  nombre_plan: string;

  @ApiProperty({
    description: 'Precio mensual del plan',
    example: 79.99,
    minimum: 0
  })
  @IsNumber({}, { message: 'El precio mensual debe ser un número' })
  @Min(0, { message: 'El precio mensual no puede ser negativo' })
  precio_mensual: number;

  @ApiProperty({
    description: 'Fecha del próximo cobro',
    example: '2024-12-01'
  })
  @IsDateString({}, { message: 'La fecha del próximo cobro debe ser una fecha válida' })
  fecha_proximo_cobro: string;

  @ApiProperty({
    description: 'Cantidad de empleados permitidos',
    example: 5,
    minimum: 1
  })
  @IsNumber({}, { message: 'La cantidad de empleados debe ser un número' })
  @Min(1, { message: 'La cantidad de empleados debe ser al menos 1' })
  empleados_permitidos: number;

  @ApiProperty({
    description: 'Cantidad de tiendas online locales por mercado',
    example: 3,
    minimum: 1
  })
  @IsNumber({}, { message: 'La cantidad de tiendas locales debe ser un número' })
  @Min(1, { message: 'La cantidad de tiendas locales debe ser al menos 1' })
  tiendas_locales_por_mercado: number;

  @ApiProperty({
    description: 'Porcentaje de descuento en envíos',
    example: 20,
    minimum: 0,
    maximum: 100
  })
  @IsNumber({}, { message: 'El descuento en envíos debe ser un número' })
  @Min(0, { message: 'El descuento en envíos no puede ser negativo' })
  @Max(100, { message: 'El descuento en envíos no puede ser mayor al 100%' })
  descuento_envios: number;

  @ApiProperty({
    description: 'Ciclo de facturación actual',
    example: CicloFacturacion.MENSUAL,
    enum: CicloFacturacion
  })
  @IsEnum(CicloFacturacion, { message: 'El ciclo de facturación debe ser válido' })
  @IsNotEmpty({ message: 'El ciclo de facturación es requerido' })
  ciclo_facturacion: CicloFacturacion;

  @ApiPropertyOptional({
    description: 'Ahorro al cambiar a facturación anual',
    example: 159.99
  })
  @IsOptional()
  @IsNumber({}, { message: 'El ahorro anual debe ser un número' })
  @Min(0, { message: 'El ahorro anual no puede ser negativo' })
  ahorro_anual?: number;
}

/**
 * DTO para suscripción adicional
 */
export class SuscripcionAdicionalDto {
  @ApiProperty({
    description: 'Nombre de la suscripción adicional',
    example: 'POS Pro'
  })
  @IsString({ message: 'El nombre de la suscripción debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre de la suscripción es requerido' })
  nombre: string;

  @ApiProperty({
    description: 'Precio de la suscripción adicional',
    example: 49.99,
    minimum: 0
  })
  @IsNumber({}, { message: 'El precio de la suscripción debe ser un número' })
  @Min(0, { message: 'El precio de la suscripción no puede ser negativo' })
  precio: number;

  @ApiProperty({
    description: 'Fecha del próximo cobro de la suscripción',
    example: '2024-12-01'
  })
  @IsDateString({}, { message: 'La fecha del próximo cobro debe ser una fecha válida' })
  fecha_proximo_cobro: string;

  @ApiProperty({
    description: 'Estado de la suscripción adicional',
    example: EstadoSuscripcion.ACTIVA,
    enum: EstadoSuscripcion
  })
  @IsEnum(EstadoSuscripcion, { message: 'El estado de la suscripción debe ser válido' })
  @IsNotEmpty({ message: 'El estado de la suscripción es requerido' })
  estado: EstadoSuscripcion;

  @ApiPropertyOptional({
    description: 'Descripción de la suscripción adicional',
    example: 'Sistema de punto de venta avanzado'
  })
  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  descripcion?: string;
}

/**
 * DTO para beneficios del plan
 */
export class BeneficiosPlanDto {
  @ApiProperty({
    description: 'Lista de funciones incluidas en el plan',
    example: ['Gestión de productos ilimitada', 'Soporte 24/7', 'Reportes avanzados']
  })
  @IsArray({ message: 'Las funciones deben ser un array' })
  @ArrayNotEmpty({ message: 'Debe haber al menos una función incluida' })
  @IsString({ each: true, message: 'Cada función debe ser una cadena de texto' })
  funciones_incluidas: string[];

  @ApiPropertyOptional({
    description: 'Límites de almacenamiento',
    example: { productos: 10000, imagenes: '50GB', backup: '1TB' }
  })
  @IsOptional()
  @IsObject({ message: 'Los límites de almacenamiento deben ser un objeto' })
  limites_almacenamiento?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Integraciones disponibles',
    example: ['Facebook', 'Instagram', 'TikTok', 'WhatsApp']
  })
  @IsOptional()
  @IsArray({ message: 'Las integraciones deben ser un array' })
  @IsString({ each: true, message: 'Cada integración debe ser una cadena de texto' })
  integraciones_disponibles?: string[];

  @ApiPropertyOptional({
    description: 'Soporte incluido',
    example: { tipo: 'prioritario', horario: '24/7', canales: ['chat', 'email', 'telefono'] }
  })
  @IsOptional()
  @IsObject({ message: 'El soporte debe ser un objeto' })
  soporte?: Record<string, any>;
}

/**
 * DTO para crear configuración de plan
 */
export class CrearConfiguracionPlanDto {
  @ApiProperty({
    description: 'ID de la tienda',
    example: 'tienda-123'
  })
  @IsString({ message: 'El ID de la tienda debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El ID de la tienda es requerido' })
  tiendaId: string;

  @ApiProperty({
    description: 'Información del plan actual',
    type: InformacionPlanDto
  })
  @ValidateNested()
  @Type(() => InformacionPlanDto)
  informacion_plan: InformacionPlanDto;

  @ApiProperty({
    description: 'Suscripciones adicionales vinculadas',
    type: [SuscripcionAdicionalDto]
  })
  @IsArray({ message: 'Las suscripciones adicionales deben ser un array' })
  @ValidateNested({ each: true })
  @Type(() => SuscripcionAdicionalDto)
  suscripciones_adicionales: SuscripcionAdicionalDto[];

  @ApiProperty({
    description: 'Beneficios del plan actual',
    type: BeneficiosPlanDto
  })
  @ValidateNested()
  @Type(() => BeneficiosPlanDto)
  beneficios_plan: BeneficiosPlanDto;

  @ApiPropertyOptional({
    description: 'Configuración adicional del plan',
    example: { auto_renovacion: true, notificaciones_cambio: true }
  })
  @IsOptional()
  configuracion_adicional?: Record<string, any>;
}

/**
 * DTO para actualizar configuración de plan
 */
export class ActualizarConfiguracionPlanDto {
  @ApiPropertyOptional({
    description: 'Información del plan actual',
    type: InformacionPlanDto
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => InformacionPlanDto)
  informacion_plan?: InformacionPlanDto;

  @ApiPropertyOptional({
    description: 'Suscripciones adicionales vinculadas',
    type: [SuscripcionAdicionalDto]
  })
  @IsOptional()
  @IsArray({ message: 'Las suscripciones adicionales deben ser un array' })
  @ValidateNested({ each: true })
  @Type(() => SuscripcionAdicionalDto)
  suscripciones_adicionales?: SuscripcionAdicionalDto[];

  @ApiPropertyOptional({
    description: 'Beneficios del plan actual',
    type: BeneficiosPlanDto
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => BeneficiosPlanDto)
  beneficios_plan?: BeneficiosPlanDto;

  @ApiPropertyOptional({
    description: 'Configuración adicional del plan',
    example: { auto_renovacion: true, notificaciones_cambio: true }
  })
  @IsOptional()
  configuracion_adicional?: Record<string, any>;
}

/**
 * DTO para cambiar de plan
 */
export class CambiarPlanDto {
  @ApiProperty({
    description: 'Nuevo tipo de plan',
    example: TipoPlan.PRO,
    enum: TipoPlan
  })
  @IsEnum(TipoPlan, { message: 'El tipo de plan debe ser válido' })
  @IsNotEmpty({ message: 'El tipo de plan es requerido' })
  nuevo_plan: TipoPlan;

  @ApiProperty({
    description: 'Ciclo de facturación deseado',
    example: CicloFacturacion.ANUAL,
    enum: CicloFacturacion
  })
  @IsEnum(CicloFacturacion, { message: 'El ciclo de facturación debe ser válido' })
  @IsNotEmpty({ message: 'El ciclo de facturación es requerido' })
  ciclo_facturacion: CicloFacturacion;

  @ApiPropertyOptional({
    description: 'Fecha efectiva del cambio (si es futura)',
    example: '2024-12-01'
  })
  @IsOptional()
  @IsDateString({}, { message: 'La fecha efectiva debe ser una fecha válida' })
  fecha_efectiva?: string;

  @ApiPropertyOptional({
    description: 'Confirmación del usuario',
    example: true
  })
  @IsOptional()
  @IsBoolean({ message: 'La confirmación debe ser un valor booleano' })
  confirmado?: boolean;
}

/**
 * DTO para agregar suscripción adicional
 */
export class AgregarSuscripcionDto {
  @ApiProperty({
    description: 'Nombre de la suscripción adicional',
    example: 'POS Pro'
  })
  @IsString({ message: 'El nombre de la suscripción debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre de la suscripción es requerido' })
  nombre: string;

  @ApiProperty({
    description: 'Precio de la suscripción adicional',
    example: 49.99,
    minimum: 0
  })
  @IsNumber({}, { message: 'El precio de la suscripción debe ser un número' })
  @Min(0, { message: 'El precio de la suscripción no puede ser negativo' })
  precio: number;

  @ApiPropertyOptional({
    description: 'Descripción de la suscripción adicional',
    example: 'Sistema de punto de venta avanzado'
  })
  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  descripcion?: string;
}

/**
 * DTO para respuesta de configuración de plan
 */
export class RespuestaConfiguracionPlanDto {
  @ApiProperty({
    description: 'ID de la configuración',
    example: 'config-plan-123'
  })
  id: string;

  @ApiProperty({
    description: 'ID de la tienda',
    example: 'tienda-123'
  })
  tiendaId: string;

  @ApiProperty({
    description: 'Información del plan actual',
    type: InformacionPlanDto
  })
  informacion_plan: InformacionPlanDto;

  @ApiProperty({
    description: 'Suscripciones adicionales vinculadas',
    type: [SuscripcionAdicionalDto]
  })
  suscripciones_adicionales: SuscripcionAdicionalDto[];

  @ApiProperty({
    description: 'Beneficios del plan actual',
    type: BeneficiosPlanDto
  })
  beneficios_plan: BeneficiosPlanDto;

  @ApiPropertyOptional({
    description: 'Configuración adicional del plan',
    example: { auto_renovacion: true, notificaciones_cambio: true }
  })
  configuracion_adicional?: Record<string, any>;

  @ApiProperty({
    description: 'Fecha de creación',
    example: '2024-01-01T00:00:00.000Z'
  })
  fecha_creacion: Date;

  @ApiProperty({
    description: 'Fecha de última actualización',
    example: '2024-01-01T00:00:00.000Z'
  })
  fecha_actualizacion: Date;
}

/**
 * DTO para criterios de búsqueda de configuraciones de plan
 */
export class CriteriosBusquedaPlanDto {
  @ApiPropertyOptional({
    description: 'Buscar por tipo de plan específico',
    enum: TipoPlan
  })
  @IsOptional()
  @IsEnum(TipoPlan, { message: 'El tipo de plan debe ser válido' })
  tipo_plan?: TipoPlan;

  @ApiPropertyOptional({
    description: 'Buscar por ciclo de facturación específico',
    enum: CicloFacturacion
  })
  @IsOptional()
  @IsEnum(CicloFacturacion, { message: 'El ciclo de facturación debe ser válido' })
  ciclo_facturacion?: CicloFacturacion;

  @ApiPropertyOptional({
    description: 'Buscar configuraciones con suscripciones adicionales activas',
    example: true
  })
  @IsOptional()
  @IsBoolean({ message: 'El filtro de suscripciones activas debe ser un valor booleano' })
  suscripciones_activas?: boolean;

  @ApiPropertyOptional({
    description: 'Buscar configuraciones con facturación anual',
    example: true
  })
  @IsOptional()
  @IsBoolean({ message: 'El filtro de facturación anual debe ser un valor booleano' })
  facturacion_anual?: boolean;

  @ApiPropertyOptional({
    description: 'Buscar por rango de precio mensual',
    example: { min: 50, max: 200 }
  })
  @IsOptional()
  @IsObject({ message: 'El rango de precio debe ser un objeto' })
  rango_precio?: { min: number; max: number };
}