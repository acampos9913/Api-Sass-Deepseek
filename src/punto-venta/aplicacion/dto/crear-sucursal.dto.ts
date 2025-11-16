import { IsNotEmpty, IsString, IsOptional, IsEmail, MaxLength, MinLength, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO para la creación de sucursales
 * Define la estructura y validaciones de los datos de entrada
 */
export class CrearSucursalDto {
  @ApiProperty({
    description: 'Nombre de la sucursal',
    example: 'Sucursal Central',
    maxLength: 100,
  })
  @IsNotEmpty({ message: 'El nombre de la sucursal es requerido' })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  nombre: string;

  @ApiProperty({
    description: 'Dirección completa de la sucursal',
    example: 'Av. Principal 123',
    maxLength: 200,
  })
  @IsNotEmpty({ message: 'La dirección es requerida' })
  @IsString({ message: 'La dirección debe ser una cadena de texto' })
  @MaxLength(200, { message: 'La dirección no puede exceder 200 caracteres' })
  @MinLength(5, { message: 'La dirección debe tener al menos 5 caracteres' })
  direccion: string;

  @ApiProperty({
    description: 'Ciudad donde se ubica la sucursal',
    example: 'Lima',
    maxLength: 50,
  })
  @IsNotEmpty({ message: 'La ciudad es requerida' })
  @IsString({ message: 'La ciudad debe ser una cadena de texto' })
  @MaxLength(50, { message: 'La ciudad no puede exceder 50 caracteres' })
  @MinLength(2, { message: 'La ciudad debe tener al menos 2 caracteres' })
  ciudad: string;

  @ApiProperty({
    description: 'Provincia donde se ubica la sucursal',
    example: 'Lima',
    maxLength: 50,
  })
  @IsNotEmpty({ message: 'La provincia es requerida' })
  @IsString({ message: 'La provincia debe ser una cadena de texto' })
  @MaxLength(50, { message: 'La provincia no puede exceder 50 caracteres' })
  @MinLength(2, { message: 'La provincia debe tener al menos 2 caracteres' })
  provincia: string;

  @ApiProperty({
    description: 'Código postal de la sucursal',
    example: '15001',
    maxLength: 10,
  })
  @IsNotEmpty({ message: 'El código postal es requerido' })
  @IsString({ message: 'El código postal debe ser una cadena de texto' })
  @MaxLength(10, { message: 'El código postal no puede exceder 10 caracteres' })
  @MinLength(3, { message: 'El código postal debe tener al menos 3 caracteres' })
  @Matches(/^[0-9a-zA-Z\s\-]+$/, { message: 'El código postal solo puede contener números, letras, espacios y guiones' })
  codigo_postal: string;

  @ApiProperty({
    description: 'País donde se ubica la sucursal',
    example: 'Perú',
    maxLength: 50,
    default: 'Perú',
  })
  @IsNotEmpty({ message: 'El país es requerido' })
  @IsString({ message: 'El país debe ser una cadena de texto' })
  @MaxLength(50, { message: 'El país no puede exceder 50 caracteres' })
  @MinLength(2, { message: 'El país debe tener al menos 2 caracteres' })
  pais: string = 'Perú';

  @ApiPropertyOptional({
    description: 'Teléfono de contacto de la sucursal',
    example: '+51 123456789',
    maxLength: 20,
  })
  @IsOptional()
  @IsString({ message: 'El teléfono debe ser una cadena de texto' })
  @MaxLength(20, { message: 'El teléfono no puede exceder 20 caracteres' })
  @Matches(/^[\+]?[0-9\s\-\(\)]+$/, { message: 'El formato del teléfono no es válido' })
  telefono?: string;

  @ApiPropertyOptional({
    description: 'Email de contacto de la sucursal',
    example: 'sucursal@tienda.com',
    maxLength: 100,
  })
  @IsOptional()
  @IsEmail({}, { message: 'El formato del email no es válido' })
  @MaxLength(100, { message: 'El email no puede exceder 100 caracteres' })
  email?: string;

  @ApiProperty({
    description: 'ID de la tienda a la que pertenece la sucursal',
    example: 'tienda_123456789',
  })
  @IsNotEmpty({ message: 'El ID de la tienda es requerido' })
  @IsString({ message: 'El ID de la tienda debe ser una cadena de texto' })
  tienda_id: string;
}

/**
 * DTO para la respuesta de creación de sucursal
 */
export class CrearSucursalRespuestaDto {
  @ApiProperty({
    description: 'Mensaje descriptivo de la operación',
    example: 'Sucursal creada exitosamente',
  })
  mensaje: string;

  @ApiProperty({
    description: 'Datos de la sucursal creada',
    type: () => SucursalRespuestaDto,
  })
  data: SucursalRespuestaDto | null;

  @ApiProperty({
    description: 'Tipo de mensaje',
    enum: ['Exito', 'ErrorCliente', 'ErrorServidor'],
    example: 'Exito',
  })
  tipo_mensaje: 'Exito' | 'ErrorCliente' | 'ErrorServidor';

  @ApiProperty({
    description: 'Código de estado de la respuesta',
    example: 201,
  })
  estado_respuesta: number;
}

/**
 * DTO para la respuesta de sucursal
 */
export class SucursalRespuestaDto {
  @ApiProperty({
    description: 'ID único de la sucursal',
    example: 'suc_123456789',
  })
  id: string;

  @ApiProperty({
    description: 'Nombre de la sucursal',
    example: 'Sucursal Central',
  })
  nombre: string;

  @ApiProperty({
    description: 'Dirección completa de la sucursal',
    example: 'Av. Principal 123',
  })
  direccion: string;

  @ApiProperty({
    description: 'Ciudad donde se ubica la sucursal',
    example: 'Lima',
  })
  ciudad: string;

  @ApiProperty({
    description: 'Provincia donde se ubica la sucursal',
    example: 'Lima',
  })
  provincia: string;

  @ApiProperty({
    description: 'Código postal de la sucursal',
    example: '15001',
  })
  codigo_postal: string;

  @ApiProperty({
    description: 'País donde se ubica la sucursal',
    example: 'Perú',
  })
  pais: string;

  @ApiPropertyOptional({
    description: 'Teléfono de contacto de la sucursal',
    example: '+51 123456789',
  })
  telefono?: string;

  @ApiPropertyOptional({
    description: 'Email de contacto de la sucursal',
    example: 'sucursal@tienda.com',
  })
  email?: string;

  @ApiProperty({
    description: 'Indica si la sucursal está activa',
    example: true,
  })
  activo: boolean;

  @ApiProperty({
    description: 'Fecha de creación de la sucursal',
    example: '2023-11-13T20:53:47.825Z',
  })
  fecha_creacion: Date;

  @ApiProperty({
    description: 'Fecha de última actualización de la sucursal',
    example: '2023-11-13T20:53:47.825Z',
  })
  fecha_actualizacion: Date;

  @ApiProperty({
    description: 'ID de la tienda a la que pertenece la sucursal',
    example: 'tienda_123456789',
  })
  tienda_id: string;

  @ApiProperty({
    description: 'Cantidad de cajas en la sucursal',
    example: 3,
  })
  cantidad_cajas: number;

  @ApiProperty({
    description: 'Cantidad de usuarios asignados a la sucursal',
    example: 5,
  })
  cantidad_usuarios: number;
}

/**
 * DTO para la lista de sucursales
 */
export class ListaSucursalesRespuestaDto {
  @ApiProperty({
    description: 'Mensaje descriptivo de la operación',
    example: 'Lista de sucursales obtenida exitosamente',
  })
  mensaje: string;

  @ApiProperty({
    description: 'Datos de la lista de sucursales',
    type: () => ListaSucursalesDataDto,
  })
  data: ListaSucursalesDataDto;

  @ApiProperty({
    description: 'Tipo de mensaje',
    enum: ['Exito', 'ErrorCliente', 'ErrorServidor'],
    example: 'Exito',
  })
  tipo_mensaje: 'Exito' | 'ErrorCliente' | 'ErrorServidor';

  @ApiProperty({
    description: 'Código de estado de la respuesta',
    example: 200,
  })
  estado_respuesta: number;
}

/**
 * DTO para los datos de la lista de sucursales
 */
export class ListaSucursalesDataDto {
  @ApiProperty({
    description: 'Lista de sucursales',
    type: [SucursalRespuestaDto],
  })
  elementos: SucursalRespuestaDto[];

  @ApiProperty({
    description: 'Información de paginación',
    type: () => PaginacionDto,
  })
  paginacion: PaginacionDto;
}

/**
 * DTO para la paginación
 */
export class PaginacionDto {
  @ApiProperty({
    description: 'Total de elementos',
    example: 100,
  })
  total_elementos: number;

  @ApiProperty({
    description: 'Total de páginas',
    example: 10,
  })
  total_paginas: number;

  @ApiProperty({
    description: 'Página actual',
    example: 1,
  })
  pagina_actual: number;

  @ApiProperty({
    description: 'Límite de elementos por página',
    example: 10,
  })
  limite: number;
}

/**
 * DTO para filtros de búsqueda de sucursales
 */
export class FiltrosSucursalDto {
  @ApiPropertyOptional({
    description: 'ID de la tienda para filtrar',
    example: 'tienda_123456789',
  })
  @IsOptional()
  @IsString()
  tienda_id?: string;

  @ApiPropertyOptional({
    description: 'Ciudad para filtrar',
    example: 'Lima',
  })
  @IsOptional()
  @IsString()
  ciudad?: string;

  @ApiPropertyOptional({
    description: 'Provincia para filtrar',
    example: 'Lima',
  })
  @IsOptional()
  @IsString()
  provincia?: string;

  @ApiPropertyOptional({
    description: 'Estado activo/inactivo para filtrar',
    example: true,
  })
  @IsOptional()
  activo?: boolean;

  @ApiPropertyOptional({
    description: 'Filtrar por sucursales con cajas abiertas',
    example: true,
  })
  @IsOptional()
  tiene_cajas_abiertas?: boolean;

  @ApiPropertyOptional({
    description: 'Fecha de creación desde',
    example: '2023-01-01T00:00:00.000Z',
  })
  @IsOptional()
  fecha_creacion_desde?: Date;

  @ApiPropertyOptional({
    description: 'Fecha de creación hasta',
    example: '2023-12-31T23:59:59.999Z',
  })
  @IsOptional()
  fecha_creacion_hasta?: Date;

  @ApiPropertyOptional({
    description: 'Página actual para paginación',
    example: 1,
    default: 1,
  })
  @IsOptional()
  pagina?: number = 1;

  @ApiPropertyOptional({
    description: 'Límite de elementos por página',
    example: 10,
    default: 10,
  })
  @IsOptional()
  limite?: number = 10;
}