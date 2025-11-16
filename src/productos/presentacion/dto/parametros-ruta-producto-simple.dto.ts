import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para validar parámetros de ruta simples (solo ID del producto)
 * Sigue los principios de validación en la capa de presentación
 */
export class ParametrosRutaProductoSimpleDto {
  @ApiProperty({
    description: 'ID del producto',
    example: 'prod-123',
    required: true,
  })
  @IsNotEmpty({ message: 'El ID del producto es requerido' })
  @IsString({ message: 'El ID del producto debe ser una cadena de texto' })
  @MinLength(1, { message: 'El ID del producto no puede estar vacío' })
  id: string;
}

/**
 * DTO para validar parámetros de ruta con ID de tienda
 */
export class ParametrosRutaProductoConTiendaDto {
  @ApiProperty({
    description: 'ID de la tienda',
    example: 'tienda-123',
    required: true,
  })
  @IsNotEmpty({ message: 'El ID de la tienda es requerido' })
  @IsString({ message: 'El ID de la tienda debe ser una cadena de texto' })
  tiendaId: string;

  @ApiProperty({
    description: 'ID del producto',
    example: 'prod-123',
    required: true,
  })
  @IsNotEmpty({ message: 'El ID del producto es requerido' })
  @IsString({ message: 'El ID del producto debe ser una cadena de texto' })
  @MinLength(1, { message: 'El ID del producto no puede estar vacío' })
  id: string;
}