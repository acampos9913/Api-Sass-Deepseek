import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para validar parámetros de ruta en endpoints de productos
 * Sigue los principios de validación en la capa de presentación
 */
export class ParametrosRutaProductoDto {
  @ApiProperty({
    description: 'ID de la tienda',
    example: 'tienda-123',
    required: true,
  })
  @IsNotEmpty({ message: 'El ID de la tienda es requerido' })
  @IsString({ message: 'El ID de la tienda debe ser una cadena de texto' })
  tiendaId: string;

  @ApiProperty({
    description: 'Slug del producto',
    example: 'camiseta-algodon-100',
    required: true,
  })
  @IsNotEmpty({ message: 'El slug del producto es requerido' })
  @IsString({ message: 'El slug debe ser una cadena de texto' })
  @MinLength(1, { message: 'El slug no puede estar vacío' })
  slug: string;
}

/**
 * DTO para validar parámetros de ruta que incluyen ID del producto
 */
export class ParametrosRutaProductoConIdDto {
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