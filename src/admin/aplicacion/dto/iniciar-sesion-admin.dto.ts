import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

/**
 * DTO para iniciar sesión en el panel de administración
 * Sigue las convenciones de nomenclatura en español
 */
export class IniciarSesionAdminDto {
  @ApiProperty({
    description: 'Correo electrónico del administrador',
    example: 'admin@tiendanube.com',
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
}