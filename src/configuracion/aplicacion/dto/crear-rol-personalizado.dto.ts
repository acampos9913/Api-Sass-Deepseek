/**
 * DTO para crear un rol personalizado
 */
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsArray, IsOptional, MinLength, MaxLength } from 'class-validator';

export class CrearRolPersonalizadoDto {
  @ApiProperty({
    description: 'ID único del rol',
    example: 'rol-123456',
  })
  @IsNotEmpty({ message: 'El ID del rol es requerido' })
  @IsString({ message: 'El ID del rol debe ser una cadena de texto' })
  @MinLength(1, { message: 'El ID del rol no puede estar vacío' })
  id: string;

  @ApiProperty({
    description: 'Nombre del rol personalizado',
    example: 'Supervisor',
  })
  @IsNotEmpty({ message: 'El nombre del rol es requerido' })
  @IsString({ message: 'El nombre del rol debe ser una cadena de texto' })
  @MinLength(2, { message: 'El nombre del rol debe tener al menos 2 caracteres' })
  @MaxLength(50, { message: 'El nombre del rol no puede exceder los 50 caracteres' })
  nombre: string;

  @ApiProperty({
    description: 'Descripción del rol personalizado',
    example: 'Rol para supervisores con acceso a reportes y gestión de empleados',
  })
  @IsNotEmpty({ message: 'La descripción del rol es requerida' })
  @IsString({ message: 'La descripción del rol debe ser una cadena de texto' })
  @MinLength(10, { message: 'La descripción del rol debe tener al menos 10 caracteres' })
  @MaxLength(500, { message: 'La descripción del rol no puede exceder los 500 caracteres' })
  descripcion: string;

  @ApiProperty({
    description: 'Lista de permisos del rol',
    example: ['ver_reportes', 'gestionar_empleados', 'aprobar_solicitudes'],
    type: [String],
  })
  @IsNotEmpty({ message: 'Los permisos del rol son requeridos' })
  @IsArray({ message: 'Los permisos deben ser un array de strings' })
  @IsString({ each: true, message: 'Cada permiso debe ser una cadena de texto' })
  permisos: string[];

  @ApiProperty({
    description: 'Lista de restricciones del rol',
    example: ['sin_acceso_financiero', 'sin_gestion_usuarios'],
    type: [String],
  })
  @IsArray({ message: 'Las restricciones deben ser un array de strings' })
  @IsString({ each: true, message: 'Cada restricción debe ser una cadena de texto' })
  restricciones: string[];
}