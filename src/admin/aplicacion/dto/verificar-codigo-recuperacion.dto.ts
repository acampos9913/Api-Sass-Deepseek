import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

/**
 * DTO para verificar el código de recuperación de contraseña
 * Sigue las convenciones de nomenclatura en español
 */
export class VerificarCodigoRecuperacionDto {
  @ApiProperty({
    description: 'Token de recuperación de contraseña',
    example: 'abc123def456',
  })
  @IsNotEmpty({ message: 'El token de recuperación es requerido' })
  @IsString({ message: 'El token debe ser una cadena de texto' })
  token: string;

  @ApiProperty({
    description: 'Código de 6 dígitos enviado por correo electrónico',
    example: '123456',
  })
  @IsNotEmpty({ message: 'El código de verificación es requerido' })
  @IsString({ message: 'El código debe ser una cadena de texto' })
  @Length(6, 6, { message: 'El código debe tener exactamente 6 dígitos' })
  codigo: string;
}