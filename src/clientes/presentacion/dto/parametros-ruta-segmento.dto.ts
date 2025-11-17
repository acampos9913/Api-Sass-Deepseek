/**
 * DTO para validar parámetros de ruta en endpoints de segmentos
 * Implementa validación estricta de parámetros requeridos en la URL
 */
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength, Matches } from 'class-validator';

export class ParametrosRutaSegmentoDto {
  @ApiProperty({
    description: 'ID de la tienda',
    example: 'tienda-123',
    required: true
  })
  @IsNotEmpty({ message: 'El ID de la tienda es requerido' })
  @IsString({ message: 'El ID de la tienda debe ser una cadena de texto' })
  @MinLength(1, { message: 'El ID de la tienda no puede estar vacío' })
  @Matches(/^[a-zA-Z0-9-_]+$/, {
    message: 'El ID de la tienda solo puede contener letras, números, guiones y guiones bajos'
  })
  tiendaId: string;

  @ApiProperty({
    description: 'ID del segmento',
    example: 'seg_abc123',
    required: true
  })
  @IsNotEmpty({ message: 'El ID del segmento es requerido' })
  @IsString({ message: 'El ID del segmento debe ser una cadena de texto' })
  @MinLength(1, { message: 'El ID del segmento no puede estar vacío' })
  @Matches(/^seg_[a-zA-Z0-9]+$/, {
    message: 'El ID del segmento debe comenzar con "seg_" seguido de letras y números'
  })
  segmentoId: string;

  @ApiProperty({
    description: 'ID del cliente',
    example: 'cliente-123',
    required: false
  })
  @IsNotEmpty({ message: 'El ID del cliente es requerido' })
  @IsString({ message: 'El ID del cliente debe ser una cadena de texto' })
  @MinLength(1, { message: 'El ID del cliente no puede estar vacío' })
  @Matches(/^[a-zA-Z0-9-_]+$/, {
    message: 'El ID del cliente solo puede contener letras, números, guiones y guiones bajos'
  })
  clienteId?: string;
}