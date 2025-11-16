import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { 
  IsString, 
  IsNotEmpty, 
  IsNumber, 
  IsOptional, 
  IsBoolean, 
  Min, 
  MaxLength,
  IsPositive,
  IsArray,
  ValidateIf
} from 'class-validator';

/**
 * DTO para la actualización de productos
 * Incluye validaciones exhaustivas para el frontend
 */
export class ActualizarProductoDto {
  @ApiPropertyOptional({
    description: 'Título del producto',
    example: 'Camiseta de algodón orgánico actualizada',
    maxLength: 255,
  })
  @IsString({ message: 'El título debe ser una cadena de texto' })
  @IsOptional()
  @MaxLength(255, { message: 'El título no puede exceder los 255 caracteres' })
  titulo?: string;

  @ApiPropertyOptional({
    description: 'Descripción detallada del producto',
    example: 'Camiseta 100% algodón orgánico, disponible en múltiples colores y tallas - versión mejorada',
    maxLength: 2000,
  })
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  @IsOptional()
  @MaxLength(2000, { message: 'La descripción no puede exceder los 2000 caracteres' })
  descripcion?: string;

  @ApiPropertyOptional({
    description: 'Precio de venta del producto',
    example: 34.99,
    minimum: 0.01,
  })
  @IsNumber({}, { message: 'El precio debe ser un número' })
  @IsOptional()
  @IsPositive({ message: 'El precio debe ser mayor a cero' })
  @Min(0.01, { message: 'El precio debe ser mayor a cero' })
  precio?: number;

  @ApiPropertyOptional({
    description: 'Precio de comparación (precio original)',
    example: 44.99,
    minimum: 0.01,
  })
  @IsNumber({}, { message: 'El precio de comparación debe ser un número' })
  @IsOptional()
  @IsPositive({ message: 'El precio de comparación debe ser mayor a cero' })
  @Min(0.01, { message: 'El precio de comparación debe ser mayor a cero' })
  precioComparacion?: number;

  @ApiPropertyOptional({
    description: 'SKU único del producto',
    example: 'CAM-ALG-BLK-M-UPDATED',
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
    example: 160,
    minimum: 0,
  })
  @IsNumber({}, { message: 'El peso debe ser un número' })
  @IsOptional()
  @Min(0, { message: 'El peso no puede ser negativo' })
  peso?: number;

  @ApiPropertyOptional({
    description: 'Ancho del producto en centímetros',
    example: 21,
    minimum: 0,
  })
  @IsNumber({}, { message: 'El ancho debe ser un número' })
  @IsOptional()
  @Min(0, { message: 'El ancho no puede ser negativo' })
  ancho?: number;

  @ApiPropertyOptional({
    description: 'Alto del producto en centímetros',
    example: 31,
    minimum: 0,
  })
  @IsNumber({}, { message: 'El alto debe ser un número' })
  @IsOptional()
  @Min(0, { message: 'El alto no puede ser negativo' })
  alto?: number;

  @ApiPropertyOptional({
    description: 'Profundidad del producto en centímetros',
    example: 3,
    minimum: 0,
  })
  @IsNumber({}, { message: 'La profundidad debe ser un número' })
  @IsOptional()
  @Min(0, { message: 'La profundidad no puede ser negativa' })
  profundidad?: number;

  @ApiPropertyOptional({
    description: 'Indica si el producto está visible para los clientes',
    example: true,
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

  @ApiPropertyOptional({
    description: 'Estado del producto',
    example: 'ACTIVO',
    enum: ['ACTIVO', 'INACTIVO', 'ARCHIVADO'],
  })
  @IsString({ message: 'El estado debe ser una cadena de texto' })
  @IsOptional()
  @MaxLength(20, { message: 'El estado no puede exceder los 20 caracteres' })
  estado?: string;

  @ApiPropertyOptional({
    description: 'Indica si el producto es visible en la tienda online',
    example: true,
  })
  @IsBoolean({ message: 'El campo visibleTiendaOnline debe ser un booleano' })
  @IsOptional()
  visibleTiendaOnline?: boolean;

  @ApiPropertyOptional({
    description: 'Indica si el producto es visible en el punto de venta',
    example: true,
  })
  @IsBoolean({ message: 'El campo visiblePointOfSale debe ser un booleano' })
  @IsOptional()
  visiblePointOfSale?: boolean;

  @ApiPropertyOptional({
    description: 'Tipo de producto',
    example: 'FISICO',
    enum: ['FISICO', 'DIGITAL', 'SERVICIO'],
  })
  @IsString({ message: 'El tipo de producto debe ser una cadena de texto' })
  @IsOptional()
  @MaxLength(20, { message: 'El tipo de producto no puede exceder los 20 caracteres' })
  tipoProducto?: string;

  @ApiPropertyOptional({
    description: 'Indica si el producto requiere envío',
    example: true,
  })
  @IsBoolean({ message: 'El campo requiereEnvio debe ser un booleano' })
  @IsOptional()
  requiereEnvio?: boolean;

  @ApiPropertyOptional({
    description: 'Indica si el inventario es gestionado',
    example: true,
  })
  @IsBoolean({ message: 'El campo inventarioGestionado debe ser un booleano' })
  @IsOptional()
  inventarioGestionado?: boolean;

  @ApiPropertyOptional({
    description: 'Cantidad disponible en inventario',
    example: 50,
    minimum: 0,
  })
  @IsNumber({}, { message: 'La cantidad de inventario debe ser un número' })
  @IsOptional()
  @Min(0, { message: 'La cantidad de inventario no puede ser negativa' })
  cantidadInventario?: number;

  @ApiPropertyOptional({
    description: 'Indica si se permite backorder',
    example: false,
  })
  @IsBoolean({ message: 'El campo permiteBackorder debe ser un booleano' })
  @IsOptional()
  permiteBackorder?: boolean;

  @ApiPropertyOptional({
    description: 'Tags del producto para búsqueda y filtrado',
    example: ['nuevo', 'algodón', 'orgánico'],
    type: [String],
  })
  @IsString({ each: true, message: 'Cada tag debe ser un string' })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Metatítulo para SEO',
    example: 'Camiseta de algodón orgánico | Tienda Online',
    maxLength: 255,
  })
  @IsString({ message: 'El metatítulo debe ser una cadena de texto' })
  @IsOptional()
  @MaxLength(255, { message: 'El metatítulo no puede exceder los 255 caracteres' })
  metatitulo?: string;

  @ApiPropertyOptional({
    description: 'Metadescripción para SEO',
    example: 'Compra nuestra camiseta de algodón orgánico 100% natural. Disponible en múltiples colores y tallas.',
    maxLength: 500,
  })
  @IsString({ message: 'La metadescripción debe ser una cadena de texto' })
  @IsOptional()
  @MaxLength(500, { message: 'La metadescripción no puede exceder los 500 caracteres' })
  metadescripcion?: string;

  @ApiPropertyOptional({
    description: 'Slug del producto para URLs amigables',
    example: 'camiseta-algodon-organico-actualizada',
    maxLength: 255,
  })
  @IsString({ message: 'El slug debe ser una cadena de texto' })
  @IsOptional()
  @MaxLength(255, { message: 'El slug no puede exceder los 255 caracteres' })
  slug?: string;

  @ApiPropertyOptional({
    description: 'Fecha de publicación del producto',
    example: '2024-01-15T00:00:00.000Z',
  })
  @IsString({ message: 'La fecha de publicación debe ser una cadena de texto' })
  @IsOptional()
  fechaPublicacion?: string;

  @ApiPropertyOptional({
    description: 'Fecha de archivado del producto',
    example: '2024-12-31T00:00:00.000Z',
  })
  @IsString({ message: 'La fecha de archivado debe ser una cadena de texto' })
  @IsOptional()
  fechaArchivado?: string;

  @ApiPropertyOptional({
    description: 'Fecha de eliminación del producto',
    example: '2025-12-31T00:00:00.000Z',
  })
  @IsString({ message: 'La fecha de eliminación debe ser una cadena de texto' })
  @IsOptional()
  fechaEliminado?: string;

  /**
   * Valida que el precio de comparación sea mayor al precio de venta si ambos están presentes
   */
  @ValidateIf(o => o.precioComparacion && o.precio)
  @IsNumber({}, { message: 'El precio de comparación debe ser un número' })
  @Min(0.01, { message: 'El precio de comparación debe ser mayor a cero' })
  validarPrecioComparacion() {
    if (this.precioComparacion && this.precio && this.precioComparacion <= this.precio) {
      throw new Error('El precio de comparación debe ser mayor al precio de venta');
    }
    return true;
  }
}