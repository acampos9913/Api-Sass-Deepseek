import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsBoolean, IsEnum, IsArray, ValidateNested, IsNumber, Min, Max, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Enums para Configuración General
 */
export enum SistemaUnidadesEnum {
  METRICO = 'metrico',
  IMPERIAL = 'imperial'
}

export enum UnidadPesoEnum {
  KILOGRAMOS = 'kilogramos',
  GRAMOS = 'gramos',
  LIBRAS = 'libras',
  ONZAS = 'onzas'
}

export enum ProcesamientoPedidosEnum {
  TODAS = 'todas',
  SOLO_TARJETAS_REGALO = 'solo_tarjetas_regalo',
  NINGUNA = 'ninguna'
}

/**
 * DTO para Dirección de Facturación
 */
export class DireccionFacturacionDto {
  @ApiProperty({ description: 'Calle de la dirección' })
  @IsNotEmpty({ message: 'La calle es requerida' })
  @IsString({ message: 'La calle debe ser una cadena de texto' })
  calle: string;

  @ApiProperty({ description: 'Ciudad' })
  @IsNotEmpty({ message: 'La ciudad es requerida' })
  @IsString({ message: 'La ciudad debe ser una cadena de texto' })
  ciudad: string;

  @ApiProperty({ description: 'Provincia/Región' })
  @IsNotEmpty({ message: 'La provincia es requerida' })
  @IsString({ message: 'La provincia debe ser una cadena de texto' })
  provincia: string;

  @ApiProperty({ description: 'País' })
  @IsNotEmpty({ message: 'El país es requerido' })
  @IsString({ message: 'El país debe ser una cadena de texto' })
  pais: string;

  @ApiProperty({ description: 'Código postal' })
  @IsNotEmpty({ message: 'El código postal es requerido' })
  @IsString({ message: 'El código postal debe ser una cadena de texto' })
  codigo_postal: string;
}

/**
 * DTO para Moneda
 */
export class MonedaDto {
  @ApiProperty({ description: 'Código de la moneda (ej. PEN, USD, EUR)' })
  @IsNotEmpty({ message: 'El código de moneda es requerido' })
  @IsString({ message: 'El código de moneda debe ser una cadena de texto' })
  codigo: string;

  @ApiProperty({ description: 'Símbolo de la moneda (ej. S/, $, €)' })
  @IsNotEmpty({ message: 'El símbolo de moneda es requerido' })
  @IsString({ message: 'El símbolo de moneda debe ser una cadena de texto' })
  simbolo: string;

  @ApiProperty({ description: 'Nombre de la moneda' })
  @IsNotEmpty({ message: 'El nombre de la moneda es requerido' })
  @IsString({ message: 'El nombre de la moneda debe ser una cadena de texto' })
  nombre: string;
}

/**
 * DTO para Configuración de Pedidos
 */
export class ConfiguracionPedidosDto {
  @ApiProperty({ 
    description: 'Prefijo para números de pedido',
    example: 'PED'
  })
  @IsOptional()
  @IsString({ message: 'El prefijo debe ser una cadena de texto' })
  prefijo?: string;

  @ApiProperty({ 
    description: 'Sufijo para números de pedido',
    example: 'SHOP'
  })
  @IsOptional()
  @IsString({ message: 'El sufijo debe ser una cadena de texto' })
  sufijo?: string;

  @ApiProperty({
    description: 'Procesamiento automático de líneas del pedido',
    enum: ProcesamientoPedidosEnum,
    default: ProcesamientoPedidosEnum.TODAS
  })
  @IsEnum(ProcesamientoPedidosEnum, { message: 'El tipo de procesamiento debe ser válido' })
  procesamiento_automatico: ProcesamientoPedidosEnum;

  @ApiProperty({
    description: 'Archivado automático de pedidos',
    default: false
  })
  @IsBoolean({ message: 'El archivado automático debe ser un valor booleano' })
  archivado_automatico: boolean;
}

/**
 * DTO para Recursos de Tienda
 */
export class RecursosTiendaDto {
  @ApiPropertyOptional({ description: 'Metacampos personalizados' })
  @IsOptional()
  @IsObject({ message: 'Los metacampos deben ser un objeto' })
  metacampos?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Configuración de branding' })
  @IsOptional()
  @IsObject({ message: 'La configuración de branding debe ser un objeto' })
  branding?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Registro de actividad' })
  @IsOptional()
  @IsObject({ message: 'El registro de actividad debe ser un objeto' })
  registro_actividad?: Record<string, any>;
}

/**
 * DTO principal para Configuración General
 */
export class ConfiguracionGeneralDto {
  @ApiProperty({ description: 'Nombre de la tienda' })
  @IsNotEmpty({ message: 'El nombre de la tienda es requerido' })
  @IsString({ message: 'El nombre de la tienda debe ser una cadena de texto' })
  nombre_tienda: string;

  @ApiProperty({ description: 'Correo electrónico de la tienda' })
  @IsNotEmpty({ message: 'El correo electrónico es requerido' })
  @IsString({ message: 'El correo electrónico debe ser una cadena de texto' })
  email: string;

  @ApiProperty({ description: 'Teléfono de la tienda' })
  @IsOptional()
  @IsString({ message: 'El teléfono debe ser una cadena de texto' })
  telefono?: string;

  @ApiProperty({ description: 'Dirección de facturación' })
  @ValidateNested()
  @Type(() => DireccionFacturacionDto)
  direccion_facturacion: DireccionFacturacionDto;

  @ApiProperty({ description: 'Configuración de moneda' })
  @ValidateNested()
  @Type(() => MonedaDto)
  moneda: MonedaDto;

  @ApiProperty({ description: 'Región de copia de seguridad' })
  @IsNotEmpty({ message: 'La región de copia de seguridad es requerida' })
  @IsString({ message: 'La región debe ser una cadena de texto' })
  region_copia_seguridad: string;

  @ApiProperty({ 
    description: 'Sistema de unidades',
    enum: SistemaUnidadesEnum,
    default: SistemaUnidadesEnum.METRICO
  })
  @IsEnum(SistemaUnidadesEnum, { message: 'El sistema de unidades debe ser válido' })
  sistema_unidades: SistemaUnidadesEnum;

  @ApiProperty({ 
    description: 'Unidad de peso',
    enum: UnidadPesoEnum,
    default: UnidadPesoEnum.KILOGRAMOS
  })
  @IsEnum(UnidadPesoEnum, { message: 'La unidad de peso debe ser válida' })
  unidad_peso: UnidadPesoEnum;

  @ApiProperty({ description: 'Zona horaria' })
  @IsNotEmpty({ message: 'La zona horaria es requerida' })
  @IsString({ message: 'La zona horaria debe ser una cadena de texto' })
  zona_horaria: string;

  @ApiProperty({ description: 'Configuración de pedidos' })
  @ValidateNested()
  @Type(() => ConfiguracionPedidosDto)
  configuracion_pedidos: ConfiguracionPedidosDto;

  @ApiPropertyOptional({ description: 'Recursos de la tienda' })
  @IsOptional()
  @ValidateNested()
  @Type(() => RecursosTiendaDto)
  recursos_tienda?: RecursosTiendaDto;
}

/**
 * DTO para actualizar Configuración General
 */
export class ActualizarConfiguracionGeneralDto {
  @ApiPropertyOptional({ description: 'Nombre de la tienda' })
  @IsOptional()
  @IsString({ message: 'El nombre de la tienda debe ser una cadena de texto' })
  nombre_tienda?: string;

  @ApiPropertyOptional({ description: 'Correo electrónico de la tienda' })
  @IsOptional()
  @IsString({ message: 'El correo electrónico debe ser una cadena de texto' })
  email?: string;

  @ApiPropertyOptional({ description: 'Teléfono de la tienda' })
  @IsOptional()
  @IsString({ message: 'El teléfono debe ser una cadena de texto' })
  telefono?: string;

  @ApiPropertyOptional({ description: 'Dirección de facturación' })
  @IsOptional()
  @ValidateNested()
  @Type(() => DireccionFacturacionDto)
  direccion_facturacion?: DireccionFacturacionDto;

  @ApiPropertyOptional({ description: 'Configuración de moneda' })
  @IsOptional()
  @ValidateNested()
  @Type(() => MonedaDto)
  moneda?: MonedaDto;

  @ApiPropertyOptional({ description: 'Región de copia de seguridad' })
  @IsOptional()
  @IsString({ message: 'La región debe ser una cadena de texto' })
  region_copia_seguridad?: string;

  @ApiPropertyOptional({ description: 'Sistema de unidades' })
  @IsOptional()
  @IsEnum(SistemaUnidadesEnum, { message: 'El sistema de unidades debe ser válido' })
  sistema_unidades?: SistemaUnidadesEnum;

  @ApiPropertyOptional({ description: 'Unidad de peso' })
  @IsOptional()
  @IsEnum(UnidadPesoEnum, { message: 'La unidad de peso debe ser válida' })
  unidad_peso?: UnidadPesoEnum;

  @ApiPropertyOptional({ description: 'Zona horaria' })
  @IsOptional()
  @IsString({ message: 'La zona horaria debe ser una cadena de texto' })
  zona_horaria?: string;

  @ApiPropertyOptional({ description: 'Configuración de pedidos' })
  @IsOptional()
  @ValidateNested()
  @Type(() => ConfiguracionPedidosDto)
  configuracion_pedidos?: ConfiguracionPedidosDto;

  @ApiPropertyOptional({ description: 'Recursos de la tienda' })
  @IsOptional()
  @ValidateNested()
  @Type(() => RecursosTiendaDto)
  recursos_tienda?: RecursosTiendaDto;
}

/**
 * DTO de respuesta para Configuración General
 */
export class ConfiguracionGeneralRespuestaDto {
  @ApiProperty({ description: 'ID de la configuración' })
  id: string;

  @ApiProperty({ description: 'ID de la tienda' })
  tienda_id: string;

  @ApiProperty({ description: 'Nombre de la tienda' })
  nombre_tienda: string;

  @ApiProperty({ description: 'Correo electrónico de la tienda' })
  email: string;

  @ApiPropertyOptional({ description: 'Teléfono de la tienda' })
  telefono?: string;

  @ApiProperty({ description: 'Dirección de facturación' })
  direccion_facturacion: DireccionFacturacionDto;

  @ApiProperty({ description: 'Configuración de moneda' })
  moneda: MonedaDto;

  @ApiProperty({ description: 'Región de copia de seguridad' })
  region_copia_seguridad: string;

  @ApiProperty({ description: 'Sistema de unidades' })
  sistema_unidades: SistemaUnidadesEnum;

  @ApiProperty({ description: 'Unidad de peso' })
  unidad_peso: UnidadPesoEnum;

  @ApiProperty({ description: 'Zona horaria' })
  zona_horaria: string;

  @ApiProperty({ description: 'Configuración de pedidos' })
  configuracion_pedidos: ConfiguracionPedidosDto;

  @ApiPropertyOptional({ description: 'Recursos de la tienda' })
  recursos_tienda?: RecursosTiendaDto;

  @ApiProperty({ description: 'Fecha de creación' })
  fecha_creacion: Date;

  @ApiProperty({ description: 'Fecha de actualización' })
  fecha_actualizacion: Date;
}