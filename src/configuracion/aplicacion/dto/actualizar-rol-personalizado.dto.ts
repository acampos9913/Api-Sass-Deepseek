/**
 * DTO para actualizar un rol personalizado
 */
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsArray, MinLength, MaxLength } from 'class-validator';

export class ActualizarRolPersonalizadoDto {
  @ApiProperty({
    description: 'Nombre del rol personalizado',
    example: 'Supervisor Senior',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'El nombre del rol debe ser una cadena de texto' })
  @MinLength(2, { message: 'El nombre del rol debe tener al menos 2 caracteres' })
  @MaxLength(50, { message: 'El nombre del rol no puede exceder los 50 caracteres' })
  nombre?: string;

  @ApiProperty({
    description: 'Descripción del rol personalizado',
    example: 'Rol para supervisores senior con acceso completo a reportes y gestión de equipos',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'La descripción del rol debe ser una cadena de texto' })
  @MinLength(10, { message: 'La descripción del rol debe tener al menos 10 caracteres' })
  @MaxLength(500, { message: 'La descripción del rol no puede exceder los 500 caracteres' })
  descripcion?: string;

  @ApiProperty({
    description: 'Lista de permisos del rol',
    example: ['ver_reportes', 'gestionar_empleados', 'aprobar_solicitudes', 'ver_analiticas'],
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray({ message: 'Los permisos deben ser un array de strings' })
  @IsString({ each: true, message: 'Cada permiso debe ser una cadena de texto' })
  permisos?: string[];

  @ApiProperty({
    description: 'Lista de restricciones del rol',
    example: ['sin_acceso_financiero'],
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray({ message: 'Las restricciones deben ser un array de strings' })
  @IsString({ each: true, message: 'Cada restricción debe ser una cadena de texto' })
  restricciones?: string[];
}