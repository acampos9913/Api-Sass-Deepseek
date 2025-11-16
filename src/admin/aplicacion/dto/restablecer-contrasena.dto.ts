import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength, Matches } from 'class-validator';

/**
 * DTO para restablecer la contraseña
 * Sigue las convenciones de nomenclatura en español
 */
export class RestablecerContrasenaDto {
  @ApiProperty({
    description: 'Token de recuperación de contraseña',
    example: 'abc123def456',
  })
  @IsNotEmpty({ message: 'El token de recuperación es requerido' })
  @IsString({ message: 'El token debe ser una cadena de texto' })
  token: string;

  @ApiProperty({
    description: 'Nueva contraseña (mínimo 8 caracteres, al menos una mayúscula, una minúscula, un número y un carácter especial)',
    example: 'NuevaContrasena123!',
  })
  @IsNotEmpty({ message: 'La nueva contraseña es requerida' })
  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    {
      message:
        'La contraseña debe contener al menos una letra mayúscula, una minúscula, un número y un carácter especial',
    },
  )
  nuevaContrasena: string;

  @ApiProperty({
    description: 'Confirmación de la nueva contraseña',
    example: 'NuevaContrasena123!',
  })
  @IsNotEmpty({ message: 'La confirmación de contraseña es requerida' })
  @IsString({ message: 'La confirmación debe ser una cadena de texto' })
  confirmacionContrasena: string;
}