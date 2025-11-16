import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { 
  IsString, 
  IsNotEmpty, 
  IsNumber, 
  IsOptional, 
  IsBoolean, 
  Min, 
  MaxLength,
  IsPositive 
} from 'class-validator';

/**
 * DTO para la creación de productos
 * Incluye validaciones exhaustivas para el frontend
 */
export class CrearProductoDto {
  @ApiProperty({
    description: 'Título del producto',
    example: 'Camiseta de algodón orgánico',
    maxLength: 255,
  })
  @IsString({ message: 'El título debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El título es obligatorio' })
  @MaxLength(255, { message: 'El título no puede exceder los 255 caracteres' })
  titulo: string;

  @ApiPropertyOptional({
    description: 'Descripción detallada del producto',
    example: 'Camiseta 100% algodón orgánico, disponible en múltiples colores y tallas',
    maxLength: 2000,
  })
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  @IsOptional()
  @MaxLength(2000, { message: 'La descripción no puede exceder los 2000 caracteres' })
  descripcion?: string;

  @ApiProperty({
    description: 'Precio de venta del producto',
    example: 29.99,
    minimum: 0.01,
  })
  @IsNumber({}, { message: 'El precio debe ser un número' })
  @IsPositive({ message: 'El precio debe ser mayor a cero' })
  @Min(0.01, { message: 'El precio debe ser mayor a cero' })
  precio: number;

  @ApiPropertyOptional({
    description: 'Precio de comparación (precio original)',
    example: 39.99,
    minimum: 0.01,
  })
  @IsNumber({}, { message: 'El precio de comparación debe ser un número' })
  @IsOptional()
  @IsPositive({ message: 'El precio de comparación debe ser mayor a cero' })
  @Min(0.01, { message: 'El precio de comparación debe ser mayor a cero' })
  precioComparacion?: number;

  @ApiPropertyOptional({
    description: 'SKU único del producto',
    example: 'CAM-ALG-BLK-M',
    maxLength: 100,
  })
  @IsString({ message: 'El SKU debe ser una cadena de texto' })
  @IsOptional()
  @MaxLength(100, { message: 'El SKU no puede exceder los 100 caracteres' })
  sku?: string;

  @ApiPropertyOptional({
    description: 'Código de barras del producto',
    example: '1234567890123',
    maxLength: 50,
  })
  @IsString({ message: 'El código de barras debe ser una cadena de texto' })
  @IsOptional()
  @MaxLength(50, { message: 'El código de barras no puede exceder los 50 caracteres' })
  codigoBarras?: string;

  @ApiPropertyOptional({
    description: 'Peso del producto en gramos',
    example: 150,
    minimum: 0,
  })
  @IsNumber({}, { message: 'El peso debe ser un número' })
  @IsOptional()
  @Min(0, { message: 'El peso no puede ser negativo' })
  peso?: number;

  @ApiPropertyOptional({
    description: 'Ancho del producto en centímetros',
    example: 20,
    minimum: 0,
  })
  @IsNumber({}, { message: 'El ancho debe ser un número' })
  @IsOptional()
  @Min(0, { message: 'El ancho no puede ser negativo' })
  ancho?: number;

  @ApiPropertyOptional({
    description: 'Alto del producto en centímetros',
    example: 30,
    minimum: 0,
  })
  @IsNumber({}, { message: 'El alto debe ser un número' })
  @IsOptional()
  @Min(0, { message: 'El alto no puede ser negativo' })
  alto?: number;

  @ApiPropertyOptional({
    description: 'Profundidad del producto en centímetros',
    example: 2,
    minimum: 0,
  })
  @IsNumber({}, { message: 'La profundidad debe ser un número' })
  @IsOptional()
  @Min(0, { message: 'La profundidad no puede ser negativa' })
  profundidad?: number;

  @ApiPropertyOptional({
    description: 'Indica si el producto está visible para los clientes',
    example: true,
    default: true,
  })
  @IsBoolean({ message: 'El campo visible debe ser un booleano' })
  @IsOptional()
  visible?: boolean;

  @ApiPropertyOptional({
    description: 'IDs de categorías a las que pertenece el producto',
    example: ['cat-123', 'cat-456'],
    type: [String],
  })
  @IsString({ each: true, message: 'Cada categoría debe ser un string' })
  @IsOptional()
  categoriasIds?: string[];
}