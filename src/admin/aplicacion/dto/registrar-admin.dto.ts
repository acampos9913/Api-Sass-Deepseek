import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional, IsISO31661Alpha2 } from 'class-validator';

/**
 * DTO para registrar un nuevo administrador y crear una tienda
 * Sigue las convenciones de nomenclatura en español
 */
export class RegistrarAdminDto {
  @ApiProperty({
    description: 'Correo electrónico del administrador',
    example: 'nuevo@tiendanube.com',
  })
  @IsEmail({}, { message: 'El correo electrónico debe tener un formato válido' })
  @IsNotEmpty({ message: 'El correo electrónico es requerido' })
  email: string;

  @ApiProperty({
    description: 'Contraseña del administrador',
    example: 'ContrasenaSegura123!',
    minLength: 8,
  })
  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  contrasena: string;

  @ApiProperty({
    description: 'Confirmación de la contraseña del administrador',
    example: 'ContrasenaSegura123!',
    minLength: 8,
  })
  @IsString({ message: 'La confirmación de contraseña debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La confirmación de contraseña es requerida' })
  @MinLength(8, { message: 'La confirmación de contraseña debe tener al menos 8 caracteres' })
  confirmacionContrasena: string;

  @ApiProperty({
    description: 'Nombre del administrador',
    example: 'Juan',
  })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre es requerido' })
  nombre: string;

  @ApiProperty({
    description: 'Apellido del administrador',
    example: 'Pérez',
  })
  @IsString({ message: 'El apellido debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El apellido es requerido' })
  apellido: string;

  @ApiProperty({
    description: 'Nombre de la tienda',
    example: 'Mi Tienda Online',
  })
  @IsString({ message: 'El nombre de la tienda debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre de la tienda es requerido' })
  nombreTienda: string;

  @ApiProperty({
    description: 'Dominio de la tienda',
    example: 'mi-tienda',
  })
  @IsString({ message: 'El dominio debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El dominio es requerido' })
  dominio: string;

  @ApiProperty({
    description: 'País de la tienda (código ISO 3166-1 alpha-2)',
    example: 'PE',
    required: false,
  })
  @IsOptional()
  @IsISO31661Alpha2({ message: 'El país debe ser un código ISO 3166-1 alpha-2 válido' })
  pais?: string;

  @ApiProperty({
    description: 'Teléfono del administrador',
    example: '+51987654321',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'El teléfono debe ser una cadena de texto' })
  telefono?: string;

  @ApiProperty({
    description: 'Idioma preferido del administrador',
    example: 'es',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'El idioma debe ser una cadena de texto' })
  idioma?: string;

  @ApiProperty({
    description: 'Zona horaria del administrador',
    example: 'America/Lima',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'La zona horaria debe ser una cadena de texto' })
  zonaHoraria?: string;
}