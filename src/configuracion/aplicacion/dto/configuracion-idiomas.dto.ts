import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEnum, IsBoolean, IsArray, IsOptional, IsDate, IsNumber, Min, Max, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO para crear configuración de idiomas
 */
export class ConfiguracionIdiomasDto {
  @ApiProperty({
    description: 'Código del idioma según ISO 639-1',
    example: 'es',
    enum: ['es', 'en', 'fr', 'am', 'af', 'sq', 'ar', 'hy', 'as', 'az', 'eu', 'be', 'bn', 'bs', 'bg', 'ca', 'zh', 'hr', 'cs', 'da', 'nl', 'eo', 'et', 'fi', 'gl', 'ka', 'de', 'el', 'gu', 'ht', 'he', 'hi', 'hu', 'is', 'id', 'ga', 'it', 'ja', 'kn', 'kk', 'km', 'ko', 'lv', 'lt', 'mk', 'ms', 'ml', 'mt', 'mr', 'mn', 'ne', 'no', 'fa', 'pl', 'pt', 'pa', 'ro', 'ru', 'sr', 'sk', 'sl', 'so', 'st', 'sw', 'sv', 'tl', 'ta', 'te', 'th', 'tr', 'uk', 'ur', 'uz', 'vi', 'cy', 'xh', 'yi', 'zu']
  })
  @IsNotEmpty({ message: 'El código del idioma es requerido' })
  @IsString({ message: 'El código del idioma debe ser una cadena de texto' })
  codigo_idioma: string;

  @ApiProperty({
    description: 'Nombre del idioma',
    example: 'Español'
  })
  @IsNotEmpty({ message: 'El nombre del idioma es requerido' })
  @IsString({ message: 'El nombre del idioma debe ser una cadena de texto' })
  nombre_idioma: string;

  @ApiProperty({
    description: 'Estado del idioma',
    example: 'publicado',
    enum: ['publicado', 'no_publicado']
  })
  @IsNotEmpty({ message: 'El estado del idioma es requerido' })
  @IsEnum(['publicado', 'no_publicado'], { message: 'El estado debe ser "publicado" o "no_publicado"' })
  estado: string;

  @ApiProperty({
    description: 'Indica si es el idioma predeterminado de la tienda',
    example: true
  })
  @IsBoolean({ message: 'El campo predeterminado debe ser un booleano' })
  predeterminado: boolean;

  @ApiProperty({
    description: 'Dominios asociados al idioma',
    type: [String],
    example: ['mi-tienda.com']
  })
  @IsArray({ message: 'Los dominios deben ser un array' })
  @IsString({ each: true, message: 'Cada dominio debe ser una cadena de texto' })
  @IsOptional()
  dominios_asociados?: string[];

  @ApiProperty({
    description: 'Estado de la traducción',
    example: 'sin_traducir',
    enum: ['sin_traducir', 'en_progreso', 'traducido']
  })
  @IsNotEmpty({ message: 'El estado de traducción es requerido' })
  @IsEnum(['sin_traducir', 'en_progreso', 'traducido'], { message: 'El estado de traducción debe ser válido' })
  estado_traduccion: string;

  @ApiProperty({
    description: 'Porcentaje de traducción completado (0-100)',
    example: 75,
    minimum: 0,
    maximum: 100
  })
  @IsNumber({}, { message: 'El porcentaje de traducción debe ser un número' })
  @Min(0, { message: 'El porcentaje de traducción no puede ser menor a 0' })
  @Max(100, { message: 'El porcentaje de traducción no puede ser mayor a 100' })
  porcentaje_traduccion: number;
}

/**
 * DTO para actualizar configuración de idiomas
 */
export class ActualizarConfiguracionIdiomasDto {
  @ApiProperty({
    description: 'Código del idioma según ISO 639-1',
    example: 'es',
    enum: ['es', 'en', 'fr', 'am', 'af', 'sq', 'ar', 'hy', 'as', 'az', 'eu', 'be', 'bn', 'bs', 'bg', 'ca', 'zh', 'hr', 'cs', 'da', 'nl', 'eo', 'et', 'fi', 'gl', 'ga', 'de', 'el', 'gu', 'ht', 'he', 'hi', 'hu', 'is', 'id', 'it', 'ja', 'kn', 'kk', 'km', 'ko', 'lv', 'lt', 'mk', 'ms', 'ml', 'mt', 'mr', 'mn', 'ne', 'no', 'fa', 'pl', 'pt', 'pa', 'ro', 'ru', 'sr', 'sk', 'sl', 'so', 'st', 'sw', 'sv', 'tl', 'ta', 'te', 'th', 'tr', 'uk', 'ur', 'uz', 'vi', 'cy', 'xh', 'yi', 'zu'],
    required: false
  })
  @IsOptional()
  @IsString({ message: 'El código del idioma debe ser una cadena de texto' })
  codigo_idioma?: string;

  @ApiProperty({
    description: 'Nombre del idioma',
    example: 'Español',
    required: false
  })
  @IsOptional()
  @IsString({ message: 'El nombre del idioma debe ser una cadena de texto' })
  nombre_idioma?: string;

  @ApiProperty({
    description: 'Estado del idioma',
    example: 'publicado',
    enum: ['publicado', 'no_publicado'],
    required: false
  })
  @IsOptional()
  @IsEnum(['publicado', 'no_publicado'], { message: 'El estado debe ser "publicado" o "no_publicado"' })
  estado?: string;

  @ApiProperty({
    description: 'Indica si es el idioma predeterminado de la tienda',
    example: true,
    required: false
  })
  @IsOptional()
  @IsBoolean({ message: 'El campo predeterminado debe ser un booleano' })
  predeterminado?: boolean;

  @ApiProperty({
    description: 'Dominios asociados al idioma',
    type: [String],
    example: ['mi-tienda.com'],
    required: false
  })
  @IsOptional()
  @IsArray({ message: 'Los dominios deben ser un array' })
  @IsString({ each: true, message: 'Cada dominio debe ser una cadena de texto' })
  dominios_asociados?: string[];

  @ApiProperty({
    description: 'Estado de la traducción',
    example: 'en_progreso',
    enum: ['sin_traducir', 'en_progreso', 'traducido'],
    required: false
  })
  @IsOptional()
  @IsEnum(['sin_traducir', 'en_progreso', 'traducido'], { message: 'El estado de traducción debe ser válido' })
  estado_traduccion?: string;

  @ApiProperty({
    description: 'Porcentaje de traducción completado (0-100)',
    example: 85,
    minimum: 0,
    maximum: 100,
    required: false
  })
  @IsOptional()
  @IsNumber({}, { message: 'El porcentaje de traducción debe ser un número' })
  @Min(0, { message: 'El porcentaje de traducción no puede ser menor a 0' })
  @Max(100, { message: 'El porcentaje de traducción no puede ser mayor a 100' })
  porcentaje_traduccion?: number;
}

/**
 * DTO para respuesta de configuración de idiomas
 */
export class ConfiguracionIdiomasRespuestaDto {
  @ApiProperty({ description: 'ID de la configuración' })
  id: string;

  @ApiProperty({ description: 'ID de la tienda' })
  tienda_id: string;

  @ApiProperty({ description: 'Código del idioma' })
  codigo_idioma: string;

  @ApiProperty({ description: 'Nombre del idioma' })
  nombre_idioma: string;

  @ApiProperty({ description: 'Estado del idioma' })
  estado: string;

  @ApiProperty({ description: 'Indica si es predeterminado' })
  predeterminado: boolean;

  @ApiProperty({ description: 'Dominios asociados', type: [String] })
  dominios_asociados: string[];

  @ApiProperty({ description: 'Estado de traducción' })
  estado_traduccion: string;

  @ApiProperty({ description: 'Porcentaje de traducción' })
  porcentaje_traduccion: number;

  @ApiProperty({ description: 'Fecha de creación' })
  fecha_creacion: Date;

  @ApiProperty({ description: 'Fecha de actualización' })
  fecha_actualizacion: Date;
}

/**
 * DTO para asignar idioma a dominio
 */
export class AsignarIdiomaDominioDto {
  @ApiProperty({
    description: 'Dominio al que asignar el idioma',
    example: 'mi-tienda.com'
  })
  @IsNotEmpty({ message: 'El dominio es requerido' })
  @IsString({ message: 'El dominio debe ser una cadena de texto' })
  dominio: string;

  @ApiProperty({
    description: 'Indica si es el idioma predeterminado del dominio',
    example: true
  })
  @IsBoolean({ message: 'El campo predeterminado_dominio debe ser un booleano' })
  predeterminado_dominio: boolean;
}

/**
 * DTO para exportar configuración de idiomas
 */
export class ExportarIdiomasDto {
  @ApiProperty({
    description: 'Formato de exportación',
    example: 'json',
    enum: ['json', 'csv']
  })
  @IsNotEmpty({ message: 'El formato de exportación es requerido' })
  @IsEnum(['json', 'csv'], { message: 'El formato debe ser "json" o "csv"' })
  formato: string;

  @ApiProperty({
    description: 'Incluir todos los idiomas o solo los publicados',
    example: 'todos',
    enum: ['todos', 'publicados']
  })
  @IsNotEmpty({ message: 'El filtro de idiomas es requerido' })
  @IsEnum(['todos', 'publicados'], { message: 'El filtro debe ser "todos" o "publicados"' })
  filtro: string;
}

/**
 * DTO para importar configuración de idiomas
 */
export class ImportarIdiomasDto {
  @ApiProperty({
    description: 'Formato del archivo a importar',
    example: 'json',
    enum: ['json', 'csv']
  })
  @IsNotEmpty({ message: 'El formato de importación es requerido' })
  @IsEnum(['json', 'csv'], { message: 'El formato debe ser "json" o "csv"' })
  formato: string;

  @ApiProperty({
    description: 'Contenido del archivo en base64',
    example: 'base64encodedcontent'
  })
  @IsNotEmpty({ message: 'El contenido del archivo es requerido' })
  @IsString({ message: 'El contenido debe ser una cadena de texto' })
  contenido: string;

  @ApiProperty({
    description: 'Estrategia para manejar conflictos',
    example: 'sobrescribir',
    enum: ['sobrescribir', 'omitir', 'fusionar']
  })
  @IsNotEmpty({ message: 'La estrategia de conflicto es requerida' })
  @IsEnum(['sobrescribir', 'omitir', 'fusionar'], { message: 'La estrategia debe ser válida' })
  estrategia_conflicto: string;
}

/**
 * Enum para estados de idioma
 */
export enum EstadoIdiomaEnum {
  PUBLICADO = 'publicado',
  NO_PUBLICADO = 'no_publicado'
}

/**
 * Enum para estados de traducción
 */
export enum EstadoTraduccionEnum {
  SIN_TRADUCIR = 'sin_traducir',
  EN_PROGRESO = 'en_progreso',
  TRADUCIDO = 'traducido'
}

/**
 * Enum para formatos de importación/exportación
 */
export enum FormatoArchivoEnum {
  JSON = 'json',
  CSV = 'csv'
}