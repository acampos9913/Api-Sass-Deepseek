import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsDate, IsEnum, IsNotEmpty, IsOptional, IsString, IsUrl, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Enum para el tipo de dominio
 */
export enum TipoDominioEnum {
  PRINCIPAL = 'principal',
  SECUNDARIO = 'secundario',
  SUBDOMINIO = 'subdominio',
}

/**
 * Enum para el estado de conexión del dominio
 */
export enum EstadoConexionDominioEnum {
  CONECTADO = 'conectado',
  VERIFICANDO = 'verificando',
  DESCONECTADO = 'desconectado',
}

/**
 * Enum para la fuente del dominio
 */
export enum FuenteDominioEnum {
  COMPRADO_EN_SHOPIFY = 'comprado en Shopify',
  EXTERNO = 'externo',
  MYSHOPIFY = 'MyShopify',
}

/**
 * DTO para el historial de cambios del dominio
 */
export class HistorialCambioDominioDto {
  @ApiProperty({ description: 'Fecha del cambio', example: '2024-01-15T10:30:00Z' })
  @IsNotEmpty({ message: 'La fecha del cambio es requerida' })
  @IsDate({ message: 'La fecha debe ser una fecha válida' })
  @Type(() => Date)
  fecha: Date;

  @ApiProperty({ description: 'Tipo de cambio realizado', example: 'conexión' })
  @IsNotEmpty({ message: 'El tipo de cambio es requerido' })
  @IsString({ message: 'El tipo de cambio debe ser una cadena de texto' })
  tipo_cambio: string;

  @ApiProperty({ description: 'Responsable del cambio', example: 'usuario@tienda.com' })
  @IsNotEmpty({ message: 'El responsable es requerido' })
  @IsString({ message: 'El responsable debe ser una cadena de texto' })
  responsable: string;

  @ApiProperty({ description: 'Detalles del cambio', example: 'Dominio conectado exitosamente' })
  @IsOptional()
  @IsString({ message: 'Los detalles deben ser una cadena de texto' })
  detalles?: string;
}

/**
 * DTO para crear un dominio
 */
export class CrearDominioDto {
  @ApiProperty({ description: 'Nombre del dominio', example: 'mi-tienda.com' })
  @IsNotEmpty({ message: 'El nombre del dominio es requerido' })
  @IsString({ message: 'El nombre del dominio debe ser una cadena de texto' })
  @IsUrl({ require_tld: true, require_protocol: false }, { message: 'El dominio debe tener un formato válido' })
  nombre_dominio: string;

  @ApiProperty({ 
    description: 'Tipo de dominio', 
    enum: TipoDominioEnum,
    example: TipoDominioEnum.PRINCIPAL 
  })
  @IsNotEmpty({ message: 'El tipo de dominio es requerido' })
  @IsEnum(TipoDominioEnum, { message: 'El tipo de dominio debe ser "principal", "secundario" o "subdominio"' })
  tipo_dominio: TipoDominioEnum;

  @ApiProperty({ 
    description: 'Estado de conexión', 
    enum: EstadoConexionDominioEnum,
    example: EstadoConexionDominioEnum.CONECTADO 
  })
  @IsNotEmpty({ message: 'El estado de conexión es requerido' })
  @IsEnum(EstadoConexionDominioEnum, { message: 'El estado de conexión debe ser "conectado", "verificando" o "desconectado"' })
  estado: EstadoConexionDominioEnum;

  @ApiProperty({ 
    description: 'Fuente del dominio', 
    enum: FuenteDominioEnum,
    example: FuenteDominioEnum.COMPRADO_EN_SHOPIFY 
  })
  @IsNotEmpty({ message: 'La fuente del dominio es requerida' })
  @IsEnum(FuenteDominioEnum, { message: 'La fuente del dominio debe ser "comprado en Shopify", "externo" o "MyShopify"' })
  fuente: FuenteDominioEnum;

  @ApiProperty({ description: 'Fecha de conexión', example: '2024-01-15T10:30:00Z', required: false })
  @IsOptional()
  @IsDate({ message: 'La fecha de conexión debe ser una fecha válida' })
  @Type(() => Date)
  fecha_conexion?: Date;

  @ApiProperty({ description: 'Redireccionamiento activo', example: true, required: false })
  @IsOptional()
  @IsBoolean({ message: 'El redireccionamiento activo debe ser un booleano' })
  redireccionamiento?: boolean;

  @ApiProperty({ description: 'Estado de compra', example: true, required: false })
  @IsOptional()
  @IsBoolean({ message: 'El estado de compra debe ser un booleano' })
  comprado?: boolean;

  @ApiProperty({ description: 'Subdominio asociado', example: 'tienda', required: false })
  @IsOptional()
  @IsString({ message: 'El subdominio debe ser una cadena de texto' })
  subdominio?: string;

  @ApiProperty({ description: 'Certificado SSL activo', example: true, required: false })
  @IsOptional()
  @IsBoolean({ message: 'El certificado SSL debe ser un booleano' })
  ssl_activo?: boolean;

  @ApiProperty({ description: 'Estado de seguridad HTTPS', example: true, required: false })
  @IsOptional()
  @IsBoolean({ message: 'El estado de seguridad HTTPS debe ser un booleano' })
  https?: boolean;
}

/**
 * DTO para actualizar un dominio
 */
export class ActualizarDominioDto {
  @ApiProperty({ description: 'Nombre del dominio', required: false })
  @IsOptional()
  @IsString({ message: 'El nombre del dominio debe ser una cadena de texto' })
  @IsUrl({ require_tld: true, require_protocol: false }, { message: 'El dominio debe tener un formato válido' })
  nombre_dominio?: string;

  @ApiProperty({ 
    description: 'Tipo de dominio', 
    enum: TipoDominioEnum,
    required: false 
  })
  @IsOptional()
  @IsEnum(TipoDominioEnum, { message: 'El tipo de dominio debe ser "principal", "secundario" o "subdominio"' })
  tipo_dominio?: TipoDominioEnum;

  @ApiProperty({ 
    description: 'Estado de conexión', 
    enum: EstadoConexionDominioEnum,
    required: false 
  })
  @IsOptional()
  @IsEnum(EstadoConexionDominioEnum, { message: 'El estado de conexión debe ser "conectado", "verificando" o "desconectado"' })
  estado?: EstadoConexionDominioEnum;

  @ApiProperty({ 
    description: 'Fuente del dominio', 
    enum: FuenteDominioEnum,
    required: false 
  })
  @IsOptional()
  @IsEnum(FuenteDominioEnum, { message: 'La fuente del dominio debe ser "comprado en Shopify", "externo" o "MyShopify"' })
  fuente?: FuenteDominioEnum;

  @ApiProperty({ description: 'Fecha de conexión', required: false })
  @IsOptional()
  @IsDate({ message: 'La fecha de conexión debe ser una fecha válida' })
  @Type(() => Date)
  fecha_conexion?: Date;

  @ApiProperty({ description: 'Redireccionamiento activo', required: false })
  @IsOptional()
  @IsBoolean({ message: 'El redireccionamiento activo debe ser un booleano' })
  redireccionamiento?: boolean;

  @ApiProperty({ description: 'Estado de compra', required: false })
  @IsOptional()
  @IsBoolean({ message: 'El estado de compra debe ser un booleano' })
  comprado?: boolean;

  @ApiProperty({ description: 'Subdominio asociado', required: false })
  @IsOptional()
  @IsString({ message: 'El subdominio debe ser una cadena de texto' })
  subdominio?: string;

  @ApiProperty({ description: 'Certificado SSL activo', required: false })
  @IsOptional()
  @IsBoolean({ message: 'El certificado SSL debe ser un booleano' })
  ssl_activo?: boolean;

  @ApiProperty({ description: 'Estado de seguridad HTTPS', required: false })
  @IsOptional()
  @IsBoolean({ message: 'El estado de seguridad HTTPS debe ser un booleano' })
  https?: boolean;

  @ApiProperty({ description: 'Historial de cambios', type: [HistorialCambioDominioDto], required: false })
  @IsOptional()
  @IsArray({ message: 'El historial debe ser un array' })
  @ValidateNested({ each: true })
  @Type(() => HistorialCambioDominioDto)
  historial?: HistorialCambioDominioDto[];
}

/**
 * DTO principal para la configuración de dominios
 */
export class ConfiguracionDominiosDto {
  @ApiProperty({ description: 'Lista de dominios configurados', type: [CrearDominioDto] })
  @IsNotEmpty({ message: 'La lista de dominios es requerida' })
  @IsArray({ message: 'Los dominios deben ser un array' })
  @ValidateNested({ each: true })
  @Type(() => CrearDominioDto)
  dominios: CrearDominioDto[];

  @ApiProperty({ description: 'Dominio principal actual', example: 'mi-tienda.com', required: false })
  @IsOptional()
  @IsString({ message: 'El dominio principal debe ser una cadena de texto' })
  dominio_principal?: string;

  @ApiProperty({ description: 'Configuración de redireccionamiento global', example: true, required: false })
  @IsOptional()
  @IsBoolean({ message: 'La configuración de redireccionamiento debe ser un booleano' })
  redireccionamiento_global?: boolean;
}

/**
 * DTO para actualizar la configuración de dominios
 */
export class ActualizarConfiguracionDominiosDto {
  @ApiProperty({ description: 'Lista de dominios configurados', type: [CrearDominioDto], required: false })
  @IsOptional()
  @IsArray({ message: 'Los dominios deben ser un array' })
  @ValidateNested({ each: true })
  @Type(() => CrearDominioDto)
  dominios?: CrearDominioDto[];

  @ApiProperty({ description: 'Dominio principal actual', required: false })
  @IsOptional()
  @IsString({ message: 'El dominio principal debe ser una cadena de texto' })
  dominio_principal?: string;

  @ApiProperty({ description: 'Configuración de redireccionamiento global', required: false })
  @IsOptional()
  @IsBoolean({ message: 'La configuración de redireccionamiento debe ser un booleano' })
  redireccionamiento_global?: boolean;
}

/**
 * DTO para respuesta de dominio individual
 */
export class DominioDto {
  @ApiProperty({ description: 'ID del dominio', example: 'dom-123' })
  id: string;

  @ApiProperty({ description: 'Nombre del dominio', example: 'mi-tienda.com' })
  nombre_dominio: string;

  @ApiProperty({ description: 'Tipo de dominio', enum: TipoDominioEnum })
  tipo_dominio: TipoDominioEnum;

  @ApiProperty({ description: 'Estado de conexión', enum: EstadoConexionDominioEnum })
  estado: EstadoConexionDominioEnum;

  @ApiProperty({ description: 'Fuente del dominio', enum: FuenteDominioEnum })
  fuente: FuenteDominioEnum;

  @ApiProperty({ description: 'Fecha de conexión', example: '2024-01-15T10:30:00Z' })
  fecha_conexion: Date;

  @ApiProperty({ description: 'Redireccionamiento activo', example: true })
  redireccionamiento: boolean;

  @ApiProperty({ description: 'Estado de compra', example: true })
  comprado: boolean;

  @ApiProperty({ description: 'Subdominio asociado', example: 'tienda', required: false })
  subdominio?: string;

  @ApiProperty({ description: 'Certificado SSL activo', example: true })
  ssl_activo: boolean;

  @ApiProperty({ description: 'Estado de seguridad HTTPS', example: true })
  https: boolean;

  @ApiProperty({ description: 'Historial de cambios', type: [HistorialCambioDominioDto] })
  historial: HistorialCambioDominioDto[];

  @ApiProperty({ description: 'Fecha de creación', example: '2024-01-15T10:30:00Z' })
  fecha_creacion: Date;

  @ApiProperty({ description: 'Fecha de actualización', example: '2024-01-15T10:30:00Z' })
  fecha_actualizacion: Date;
}

/**
 * DTO para respuesta de configuración de dominios
 */
export class ConfiguracionDominiosRespuestaDto {
  @ApiProperty({ description: 'ID de la configuración', example: 'config-dom-123' })
  id: string;

  @ApiProperty({ description: 'ID de la tienda', example: 'tienda-123' })
  tienda_id: string;

  @ApiProperty({ description: 'Lista de dominios configurados', type: [DominioDto] })
  dominios: DominioDto[];

  @ApiProperty({ description: 'Dominio principal actual', example: 'mi-tienda.com' })
  dominio_principal: string;

  @ApiProperty({ description: 'Configuración de redireccionamiento global', example: true })
  redireccionamiento_global: boolean;

  @ApiProperty({ description: 'Fecha de creación', example: '2024-01-15T10:30:00Z' })
  fecha_creacion: Date;

  @ApiProperty({ description: 'Fecha de actualización', example: '2024-01-15T10:30:00Z' })
  fecha_actualizacion: Date;
}