/**
 * DTO para la actualización de segmentos desde la API
 * Valida y tipa los datos de entrada para actualizar un segmento existente
 */
import { ApiPropertyOptional } from '@nestjs/swagger';
import { 
  IsOptional, 
  IsString, 
  IsEnum, 
  IsArray, 
  IsBoolean, 
  MinLength, 
  MaxLength,
  ValidateNested,
  IsObject
} from 'class-validator';
import { Type } from 'class-transformer';
import { TipoSegmentoEnum, EstadoSegmentoEnum, ReglasSegmentoDto } from './crear-segmento-request.dto';

export class ActualizarSegmentoRequestDto {
  @ApiPropertyOptional({
    description: 'Nombre del segmento',
    example: 'Clientes VIP Actualizado',
    maxLength: 100
  })
  @IsOptional()
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'El nombre no puede exceder los 100 caracteres' })
  nombre?: string;

  @ApiPropertyOptional({
    description: 'Descripción detallada del segmento',
    example: 'Segmento actualizado para clientes con alto valor y frecuencia de compra',
    maxLength: 500
  })
  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  @MaxLength(500, { message: 'La descripción no puede exceder los 500 caracteres' })
  descripcion?: string;

  @ApiPropertyOptional({
    description: 'Tipo de segmento',
    example: 'AUTOMATICO',
    enum: TipoSegmentoEnum
  })
  @IsOptional()
  @IsEnum(TipoSegmentoEnum, { message: 'Tipo de segmento inválido' })
  tipo?: TipoSegmentoEnum;

  @ApiPropertyOptional({
    description: 'Estado del segmento',
    example: 'ACTIVO',
    enum: EstadoSegmentoEnum
  })
  @IsOptional()
  @IsEnum(EstadoSegmentoEnum, { message: 'Estado de segmento inválido' })
  estado?: EstadoSegmentoEnum;

  @ApiPropertyOptional({
    description: 'Reglas de segmentación para segmentos automáticos',
    type: ReglasSegmentoDto
  })
  @IsOptional()
  @IsObject({ message: 'Las reglas deben ser un objeto' })
  @ValidateNested()
  @Type(() => ReglasSegmentoDto)
  reglas?: ReglasSegmentoDto;

  @ApiPropertyOptional({
    description: 'Etiquetas para categorizar el segmento',
    example: ['VIP', 'AltoValor', 'Frecuente', 'Actualizado'],
    type: [String]
  })
  @IsOptional()
  @IsArray({ message: 'Las etiquetas deben ser un array' })
  @IsString({ each: true, message: 'Cada etiqueta debe ser una cadena de texto' })
  etiquetas?: string[];

  @ApiPropertyOptional({
    description: 'Indica si el segmento es público para otros usuarios',
    example: true
  })
  @IsOptional()
  @IsBoolean({ message: 'El campo esPublico debe ser booleano' })
  esPublico?: boolean;

  @ApiPropertyOptional({
    description: 'Indica si el segmento puede combinarse con otros',
    example: true
  })
  @IsOptional()
  @IsBoolean({ message: 'El campo puedeCombinar debe ser booleano' })
  puedeCombinar?: boolean;

  @ApiPropertyOptional({
    description: 'Indica si el segmento puede usarse en campañas de marketing',
    example: true
  })
  @IsOptional()
  @IsBoolean({ message: 'El campo puedeUsarEnCampanas debe ser booleano' })
  puedeUsarEnCampanas?: boolean;

  @ApiPropertyOptional({
    description: 'Descripción resumida para mostrar en listados',
    example: 'Segmento automático actualizado: Clientes VIP',
    maxLength: 200
  })
  @IsOptional()
  @IsString({ message: 'La descripción resumida debe ser una cadena de texto' })
  @MaxLength(200, { message: 'La descripción resumida no puede exceder los 200 caracteres' })
  descripcionResumida?: string;
}