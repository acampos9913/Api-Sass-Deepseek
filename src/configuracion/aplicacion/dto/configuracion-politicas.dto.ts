import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEnum, IsBoolean, IsArray, IsOptional, IsNumber, Min, Max, ValidateNested, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO para reglas de devolución
 */
export class ReglaDevolucionDto {
  @ApiProperty({
    description: 'Tipo de regla de devolución',
    example: 'plazo_dias',
    enum: ['plazo_dias', 'condicion_producto', 'cargo_devolucion', 'envio_devolucion', 'venta_final']
  })
  @IsNotEmpty({ message: 'El tipo de regla es requerido' })
  @IsEnum(['plazo_dias', 'condicion_producto', 'cargo_devolucion', 'envio_devolucion', 'venta_final'], { 
    message: 'El tipo de regla debe ser válido' 
  })
  tipo: string;

  @ApiProperty({
    description: 'Condición de la regla',
    example: 'producto_no_usado'
  })
  @IsNotEmpty({ message: 'La condición de la regla es requerida' })
  @IsString({ message: 'La condición debe ser una cadena de texto' })
  condicion: string;

  @ApiProperty({
    description: 'Valor de la regla (número, porcentaje, etc.)',
    example: 30
  })
  @IsOptional()
  @IsNumber({}, { message: 'El valor de la regla debe ser un número' })
  valor?: number;

  @ApiProperty({
    description: 'Descripción de la regla',
    example: 'Productos deben estar en su estado original'
  })
  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  descripcion?: string;

  @ApiProperty({
    description: 'Indica si la regla está activa',
    example: true
  })
  @IsBoolean({ message: 'El campo activo debe ser un booleano' })
  activo: boolean;
}

/**
 * DTO para política de privacidad
 */
export class PoliticaPrivacidadDto {
  @ApiProperty({
    description: 'Título de la política de privacidad',
    example: 'Política de Privacidad'
  })
  @IsNotEmpty({ message: 'El título de la política de privacidad es requerido' })
  @IsString({ message: 'El título debe ser una cadena de texto' })
  titulo: string;

  @ApiProperty({
    description: 'Contenido de la política de privacidad',
    example: 'Esta es nuestra política de privacidad...'
  })
  @IsNotEmpty({ message: 'El contenido de la política de privacidad es requerido' })
  @IsString({ message: 'El contenido debe ser una cadena de texto' })
  contenido: string;

  @ApiProperty({
    description: 'Fecha de última actualización',
    example: '2024-01-01'
  })
  @IsNotEmpty({ message: 'La fecha de actualización es requerida' })
  @IsString({ message: 'La fecha debe ser una cadena de texto' })
  fecha_actualizacion: string;

  @ApiProperty({
    description: 'Indica si la política está activa',
    example: true
  })
  @IsBoolean({ message: 'El campo activa debe ser un booleano' })
  activa: boolean;
}

/**
 * DTO para términos de servicio
 */
export class TerminosServicioDto {
  @ApiProperty({
    description: 'Título de los términos de servicio',
    example: 'Términos de Servicio'
  })
  @IsNotEmpty({ message: 'El título de los términos de servicio es requerido' })
  @IsString({ message: 'El título debe ser una cadena de texto' })
  titulo: string;

  @ApiProperty({
    description: 'Contenido de los términos de servicio',
    example: 'Estos son nuestros términos de servicio...'
  })
  @IsNotEmpty({ message: 'El contenido de los términos de servicio es requerido' })
  @IsString({ message: 'El contenido debe ser una cadena de texto' })
  contenido: string;

  @ApiProperty({
    description: 'Fecha de última actualización',
    example: '2024-01-01'
  })
  @IsNotEmpty({ message: 'La fecha de actualización es requerida' })
  @IsString({ message: 'La fecha debe ser una cadena de texto' })
  fecha_actualizacion: string;

  @ApiProperty({
    description: 'Indica si los términos están activos',
    example: true
  })
  @IsBoolean({ message: 'El campo activo debe ser un booleano' })
  activo: boolean;
}

/**
 * DTO para política de envíos
 */
export class PoliticaEnvioDto {
  @ApiProperty({
    description: 'Título de la política de envíos',
    example: 'Política de Envíos'
  })
  @IsNotEmpty({ message: 'El título de la política de envíos es requerido' })
  @IsString({ message: 'El título debe ser una cadena de texto' })
  titulo: string;

  @ApiProperty({
    description: 'Contenido de la política de envíos',
    example: 'Esta es nuestra política de envíos...'
  })
  @IsNotEmpty({ message: 'El contenido de la política de envíos es requerido' })
  @IsString({ message: 'El contenido debe ser una cadena de texto' })
  contenido: string;

  @ApiProperty({
    description: 'Fecha de última actualización',
    example: '2024-01-01'
  })
  @IsNotEmpty({ message: 'La fecha de actualización es requerida' })
  @IsString({ message: 'La fecha debe ser una cadena de texto' })
  fecha_actualizacion: string;

  @ApiProperty({
    description: 'Indica si la política está activa',
    example: true
  })
  @IsBoolean({ message: 'El campo activa debe ser un booleano' })
  activa: boolean;
}

/**
 * DTO para información de contacto
 */
export class InformacionContactoDto {
  @ApiProperty({
    description: 'Email de contacto',
    example: 'contacto@tienda.com'
  })
  @IsNotEmpty({ message: 'El email de contacto es requerido' })
  @IsString({ message: 'El email debe ser una cadena de texto' })
  email: string;

  @ApiProperty({
    description: 'Teléfono de contacto',
    example: '+1234567890'
  })
  @IsOptional()
  @IsString({ message: 'El teléfono debe ser una cadena de texto' })
  telefono?: string;

  @ApiProperty({
    description: 'Dirección física',
    example: 'Calle Principal 123, Ciudad, País'
  })
  @IsOptional()
  @IsString({ message: 'La dirección debe ser una cadena de texto' })
  direccion?: string;

  @ApiProperty({
    description: 'Horario de atención',
    example: 'Lunes a Viernes 9:00-18:00'
  })
  @IsOptional()
  @IsString({ message: 'El horario debe ser una cadena de texto' })
  horario_atencion?: string;
}

/**
 * DTO principal para crear configuración de políticas
 */
export class ConfiguracionPoliticasDto {
  @ApiProperty({
    description: 'Estado de las reglas de devolución',
    example: 'desactivado',
    enum: ['activado', 'desactivado']
  })
  @IsNotEmpty({ message: 'El estado de las reglas de devolución es requerido' })
  @IsEnum(['activado', 'desactivado'], { message: 'El estado debe ser "activado" o "desactivado"' })
  estado_reglas_devolucion: string;

  @ApiProperty({
    description: 'Reglas de devolución',
    type: [ReglaDevolucionDto]
  })
  @IsArray({ message: 'Las reglas de devolución deben ser un array' })
  @ValidateNested({ each: true })
  @Type(() => ReglaDevolucionDto)
  reglas_devolucion: ReglaDevolucionDto[];

  @ApiProperty({
    description: 'Política de privacidad',
    type: PoliticaPrivacidadDto
  })
  @ValidateNested()
  @Type(() => PoliticaPrivacidadDto)
  politica_privacidad: PoliticaPrivacidadDto;

  @ApiProperty({
    description: 'Términos de servicio',
    type: TerminosServicioDto
  })
  @ValidateNested()
  @Type(() => TerminosServicioDto)
  terminos_servicio: TerminosServicioDto;

  @ApiProperty({
    description: 'Política de envíos',
    type: PoliticaEnvioDto
  })
  @ValidateNested()
  @Type(() => PoliticaEnvioDto)
  politica_envios: PoliticaEnvioDto;

  @ApiProperty({
    description: 'Información de contacto',
    type: InformacionContactoDto
  })
  @ValidateNested()
  @Type(() => InformacionContactoDto)
  informacion_contacto: InformacionContactoDto;

  @ApiProperty({
    description: 'Productos de venta final (IDs)',
    type: [String],
    example: ['prod-123', 'prod-456']
  })
  @IsArray({ message: 'Los productos de venta final deben ser un array' })
  @IsString({ each: true, message: 'Cada ID de producto debe ser una cadena de texto' })
  @IsOptional()
  productos_venta_final?: string[];
}

/**
 * DTO para actualizar configuración de políticas
 */
export class ActualizarConfiguracionPoliticasDto {
  @ApiProperty({
    description: 'Estado de las reglas de devolución',
    example: 'activado',
    enum: ['activado', 'desactivado'],
    required: false
  })
  @IsOptional()
  @IsEnum(['activado', 'desactivado'], { message: 'El estado debe ser "activado" o "desactivado"' })
  estado_reglas_devolucion?: string;

  @ApiProperty({
    description: 'Reglas de devolución',
    type: [ReglaDevolucionDto],
    required: false
  })
  @IsOptional()
  @IsArray({ message: 'Las reglas de devolución deben ser un array' })
  @ValidateNested({ each: true })
  @Type(() => ReglaDevolucionDto)
  reglas_devolucion?: ReglaDevolucionDto[];

  @ApiProperty({
    description: 'Política de privacidad',
    type: PoliticaPrivacidadDto,
    required: false
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => PoliticaPrivacidadDto)
  politica_privacidad?: PoliticaPrivacidadDto;

  @ApiProperty({
    description: 'Términos de servicio',
    type: TerminosServicioDto,
    required: false
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => TerminosServicioDto)
  terminos_servicio?: TerminosServicioDto;

  @ApiProperty({
    description: 'Política de envíos',
    type: PoliticaEnvioDto,
    required: false
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => PoliticaEnvioDto)
  politica_envios?: PoliticaEnvioDto;

  @ApiProperty({
    description: 'Información de contacto',
    type: InformacionContactoDto,
    required: false
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => InformacionContactoDto)
  informacion_contacto?: InformacionContactoDto;

  @ApiProperty({
    description: 'Productos de venta final (IDs)',
    type: [String],
    example: ['prod-123', 'prod-456'],
    required: false
  })
  @IsOptional()
  @IsArray({ message: 'Los productos de venta final deben ser un array' })
  @IsString({ each: true, message: 'Cada ID de producto debe ser una cadena de texto' })
  productos_venta_final?: string[];
}

/**
 * DTO para respuesta de configuración de políticas
 */
export class ConfiguracionPoliticasRespuestaDto {
  @ApiProperty({ description: 'ID de la configuración' })
  id: string;

  @ApiProperty({ description: 'ID de la tienda' })
  tienda_id: string;

  @ApiProperty({ description: 'Estado de las reglas de devolución' })
  estado_reglas_devolucion: string;

  @ApiProperty({ description: 'Reglas de devolución', type: [ReglaDevolucionDto] })
  reglas_devolucion: ReglaDevolucionDto[];

  @ApiProperty({ description: 'Política de privacidad', type: PoliticaPrivacidadDto })
  politica_privacidad: PoliticaPrivacidadDto;

  @ApiProperty({ description: 'Términos de servicio', type: TerminosServicioDto })
  terminos_servicio: TerminosServicioDto;

  @ApiProperty({ description: 'Política de envíos', type: PoliticaEnvioDto })
  politica_envios: PoliticaEnvioDto;

  @ApiProperty({ description: 'Información de contacto', type: InformacionContactoDto })
  informacion_contacto: InformacionContactoDto;

  @ApiProperty({ description: 'Productos de venta final', type: [String] })
  productos_venta_final: string[];

  @ApiProperty({ description: 'Fecha de creación' })
  fecha_creacion: Date;

  @ApiProperty({ description: 'Fecha de actualización' })
  fecha_actualizacion: Date;
}

/**
 * Enum para estados de reglas de devolución
 */
export enum EstadoReglasDevolucionEnum {
  ACTIVADO = 'activado',
  DESACTIVADO = 'desactivado'
}

/**
 * Enum para tipos de reglas de devolución
 */
export enum TipoReglaDevolucionEnum {
  PLAZO_DIAS = 'plazo_dias',
  CONDICION_PRODUCTO = 'condicion_producto',
  CARGO_DEVOLUCION = 'cargo_devolucion',
  ENVIO_DEVOLUCION = 'envio_devolucion',
  VENTA_FINAL = 'venta_final'
}