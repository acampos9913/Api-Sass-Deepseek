import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

/**
 * DTO para solicitar la recuperación de contraseña
 * Sigue las convenciones de nomenclatura en español
 */
export class SolicitarRecuperacionContrasenaDto {
  @ApiProperty({
    description: 'Correo electrónico del administrador',
    example: 'admin@tiendanube.com',
  })
  @IsEmail({}, { message: 'El correo electrónico debe tener un formato válido' })
  @IsNotEmpty({ message: 'El correo electrónico es requerido' })
  email: string;
}