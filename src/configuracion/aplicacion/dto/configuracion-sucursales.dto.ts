import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsEmail, IsEnum, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Enum para el estado de la sucursal
 */
export enum EstadoSucursalEnum {
  ACTIVA = 'activa',
  INACTIVA = 'inactiva',
}

/**
 * Enum para el tipo de suscripción POS
 */
export enum TipoSuscripcionPosEnum {
  POS_PRO = 'POS Pro',
  POS_LITE = 'POS Lite',
}

/**
 * DTO para la dirección de la sucursal
 */
export class DireccionSucursalDto {
  @ApiProperty({ description: 'Calle de la dirección', example: 'Av. Principal 123' })
  @IsNotEmpty({ message: 'La calle es requerida' })
  @IsString({ message: 'La calle debe ser una cadena de texto' })
  calle: string;

  @ApiProperty({ description: 'Ciudad de la dirección', example: 'Lima' })
  @IsNotEmpty({ message: 'La ciudad es requerida' })
  @IsString({ message: 'La ciudad debe ser una cadena de texto' })
  ciudad: string;

  @ApiProperty({ description: 'Región de la dirección', example: 'Lima' })
  @IsNotEmpty({ message: 'La región es requerida' })
  @IsString({ message: 'La región debe ser una cadena de texto' })
  region: string;

  @ApiProperty({ description: 'País de la dirección', example: 'Perú' })
  @IsNotEmpty({ message: 'El país es requerida' })
  @IsString({ message: 'El país debe ser una cadena de texto' })
  pais: string;

  @ApiProperty({ description: 'Código postal de la dirección', example: '15001' })
  @IsNotEmpty({ message: 'El código postal es requerido' })
  @IsString({ message: 'El código postal debe ser una cadena de texto' })
  codigo_postal: string;
}

/**
 * DTO para el horario de apertura
 */
export class HorarioAperturaDto {
  @ApiProperty({ description: 'Horario de lunes a viernes', example: '9:00-18:00' })
  @IsNotEmpty({ message: 'El horario de lunes a viernes es requerido' })
  @IsString({ message: 'El horario debe ser una cadena de texto' })
  lunes_viernes: string;

  @ApiProperty({ description: 'Horario de sábado', example: '9:00-13:00', required: false })
  @IsOptional()
  @IsString({ message: 'El horario de sábado debe ser una cadena de texto' })
  sabado?: string;

  @ApiProperty({ description: 'Horario de domingo', example: 'Cerrado', required: false })
  @IsOptional()
  @IsString({ message: 'El horario de domingo debe ser una cadena de texto' })
  domingo?: string;
}

/**
 * DTO para la asignación de productos e inventario
 */
export class ProductoAsignadoDto {
  @ApiProperty({ description: 'ID del producto', example: 'prod-123' })
  @IsNotEmpty({ message: 'El ID del producto es requerido' })
  @IsString({ message: 'El ID del producto debe ser una cadena de texto' })
  producto_id: string;

  @ApiProperty({ description: 'Cantidad de inventario', example: 100 })
  @IsNotEmpty({ message: 'La cantidad de inventario es requerida' })
  @IsNumber({}, { message: 'La cantidad debe ser un número' })
  @Min(0, { message: 'La cantidad no puede ser negativa' })
  cantidad: number;
}

/**
 * DTO principal para la configuración de sucursales
 */
export class ConfiguracionSucursalesDto {
  @ApiProperty({ description: 'Nombre de la sucursal', example: 'Sucursal Principal' })
  @IsNotEmpty({ message: 'El nombre de la sucursal es requerido' })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  nombre_sucursal: string;

  @ApiProperty({ description: 'Dirección de la sucursal' })
  @IsNotEmpty({ message: 'La dirección es requerida' })
  @IsObject({ message: 'La dirección debe ser un objeto' })
  @ValidateNested()
  @Type(() => DireccionSucursalDto)
  direccion: DireccionSucursalDto;

  @ApiProperty({ 
    description: 'Estado de la sucursal', 
    enum: EstadoSucursalEnum,
    example: EstadoSucursalEnum.ACTIVA 
  })
  @IsNotEmpty({ message: 'El estado es requerido' })
  @IsEnum(EstadoSucursalEnum, { message: 'El estado debe ser "activa" o "inactiva"' })
  estado: EstadoSucursalEnum;

  @ApiProperty({ 
    description: 'Tipo de suscripción POS', 
    enum: TipoSuscripcionPosEnum,
    required: false 
  })
  @IsOptional()
  @IsEnum(TipoSuscripcionPosEnum, { message: 'El tipo de suscripción POS debe ser "POS Pro" o "POS Lite"' })
  suscripcion_pos?: TipoSuscripcionPosEnum;

  @ApiProperty({ description: 'Capacidad/stock asignado', example: 1000, required: false })
  @IsOptional()
  @IsNumber({}, { message: 'La capacidad debe ser un número' })
  @Min(0, { message: 'La capacidad no puede ser negativa' })
  capacidad_stock?: number;

  @ApiProperty({ description: 'Lista de productos asignados', type: [ProductoAsignadoDto], required: false })
  @IsOptional()
  @IsArray({ message: 'Los productos asignados deben ser un array' })
  @ValidateNested({ each: true })
  @Type(() => ProductoAsignadoDto)
  productos_asignados?: ProductoAsignadoDto[];

  @ApiProperty({ description: 'Estado de ventas en persona', example: true, required: false })
  @IsOptional()
  @IsBoolean({ message: 'El estado de ventas en persona debe ser un booleano' })
  ventas_persona_estado?: boolean;

  @ApiProperty({ description: 'Métodos de pago disponibles', type: [String], required: false })
  @IsOptional()
  @IsArray({ message: 'Los métodos de pago deben ser un array' })
  @IsString({ each: true, message: 'Cada método de pago debe ser una cadena de texto' })
  metodos_pago_local?: string[];

  @ApiProperty({ description: 'Responsable de sucursal', example: 'juan.perez@tienda.com', required: false })
  @IsOptional()
  @IsEmail({}, { message: 'El responsable debe ser un email válido' })
  responsable?: string;

  @ApiProperty({ description: 'Horario de apertura', required: false })
  @IsOptional()
  @IsObject({ message: 'El horario debe ser un objeto' })
  @ValidateNested()
  @Type(() => HorarioAperturaDto)
  horario?: HorarioAperturaDto;

  @ApiProperty({ description: 'Teléfono de contacto', example: '+51 987654321', required: false })
  @IsOptional()
  @IsString({ message: 'El teléfono debe ser una cadena de texto' })
  telefono?: string;

  @ApiProperty({ description: 'Email de contacto', example: 'contacto@sucursal.com', required: false })
  @IsOptional()
  @IsEmail({}, { message: 'El email de contacto debe ser un email válido' })
  email?: string;
}

/**
 * DTO para actualizar la configuración de sucursales
 */
export class ActualizarConfiguracionSucursalesDto {
  @ApiProperty({ description: 'Nombre de la sucursal', required: false })
  @IsOptional()
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  nombre_sucursal?: string;

  @ApiProperty({ description: 'Dirección de la sucursal', required: false })
  @IsOptional()
  @IsObject({ message: 'La dirección debe ser un objeto' })
  @ValidateNested()
  @Type(() => DireccionSucursalDto)
  direccion?: DireccionSucursalDto;

  @ApiProperty({ 
    description: 'Estado de la sucursal', 
    enum: EstadoSucursalEnum,
    required: false 
  })
  @IsOptional()
  @IsEnum(EstadoSucursalEnum, { message: 'El estado debe ser "activa" o "inactiva"' })
  estado?: EstadoSucursalEnum;

  @ApiProperty({ 
    description: 'Tipo de suscripción POS', 
    enum: TipoSuscripcionPosEnum,
    required: false 
  })
  @IsOptional()
  @IsEnum(TipoSuscripcionPosEnum, { message: 'El tipo de suscripción POS debe ser "POS Pro" o "POS Lite"' })
  suscripcion_pos?: TipoSuscripcionPosEnum;

  @ApiProperty({ description: 'Capacidad/stock asignado', required: false })
  @IsOptional()
  @IsNumber({}, { message: 'La capacidad debe ser un número' })
  @Min(0, { message: 'La capacidad no puede ser negativa' })
  capacidad_stock?: number;

  @ApiProperty({ description: 'Lista de productos asignados', type: [ProductoAsignadoDto], required: false })
  @IsOptional()
  @IsArray({ message: 'Los productos asignados deben ser un array' })
  @ValidateNested({ each: true })
  @Type(() => ProductoAsignadoDto)
  productos_asignados?: ProductoAsignadoDto[];

  @ApiProperty({ description: 'Estado de ventas en persona', required: false })
  @IsOptional()
  @IsBoolean({ message: 'El estado de ventas en persona debe ser un booleano' })
  ventas_persona_estado?: boolean;

  @ApiProperty({ description: 'Métodos de pago disponibles', type: [String], required: false })
  @IsOptional()
  @IsArray({ message: 'Los métodos de pago deben ser un array' })
  @IsString({ each: true, message: 'Cada método de pago debe ser una cadena de texto' })
  metodos_pago_local?: string[];

  @ApiProperty({ description: 'Responsable de sucursal', required: false })
  @IsOptional()
  @IsEmail({}, { message: 'El responsable debe ser un email válido' })
  responsable?: string;

  @ApiProperty({ description: 'Horario de apertura', required: false })
  @IsOptional()
  @IsObject({ message: 'El horario debe ser un objeto' })
  @ValidateNested()
  @Type(() => HorarioAperturaDto)
  horario?: HorarioAperturaDto;

  @ApiProperty({ description: 'Teléfono de contacto', required: false })
  @IsOptional()
  @IsString({ message: 'El teléfono debe ser una cadena de texto' })
  telefono?: string;

  @ApiProperty({ description: 'Email de contacto', required: false })
  @IsOptional()
  @IsEmail({}, { message: 'El email de contacto debe ser un email válido' })
  email?: string;
}