import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

/**
 * DTO para crear un nuevo cliente
 * Contiene las validaciones de entrada para la creación de clientes
 */
export class CrearClienteDto {
  @ApiProperty({
    description: 'Email del cliente',
    example: 'cliente@ejemplo.com',
    required: true,
  })
  @IsEmail({}, { message: 'El formato del email no es válido' })
  @IsNotEmpty({ message: 'El email es obligatorio' })
  email: string;

  @ApiProperty({
    description: 'Nombre completo del cliente',
    example: 'Juan Pérez García',
    required: true,
  })
  @IsNotEmpty({ message: 'El nombre completo es obligatorio' })
  @IsString({ message: 'El nombre completo debe ser una cadena de texto' })
  @MinLength(2, { message: 'El nombre completo debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'El nombre completo no puede exceder los 100 caracteres' })
  nombreCompleto: string;

  @ApiProperty({
    description: 'Número de teléfono del cliente (opcional)',
    example: '+51 987654321',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsString({ message: 'El teléfono debe ser una cadena de texto' })
  @Matches(/^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{1,9}$/, {
    message: 'El formato del teléfono no es válido',
  })
  telefono?: string | null;
}