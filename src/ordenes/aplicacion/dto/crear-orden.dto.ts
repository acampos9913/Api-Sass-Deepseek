import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { 
  IsString, 
  IsNotEmpty, 
  IsNumber, 
  IsOptional, 
  IsArray, 
  IsEnum,
  ValidateNested,
  ArrayMinSize,
  Min,
  MaxLength
} from 'class-validator';
import { Type } from 'class-transformer';
import { MetodoPago } from '../../dominio/enums/estado-orden.enum';

/**
 * DTO para un item de la orden
 */
export class ItemOrdenDto {
  @ApiProperty({
    description: 'ID de la variante del producto',
    example: 'var-123',
  })
  @IsString({ message: 'El ID de la variante debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El ID de la variante es obligatorio' })
  varianteId: string;

  @ApiProperty({
    description: 'Cantidad del producto',
    example: 2,
    minimum: 1,
  })
  @IsNumber({}, { message: 'La cantidad debe ser un número' })
  @Min(1, { message: 'La cantidad debe ser al menos 1' })
  cantidad: number;

  @ApiProperty({
    description: 'Precio unitario del producto',
    example: 29.99,
    minimum: 0.01,
  })
  @IsNumber({}, { message: 'El precio unitario debe ser un número' })
  @Min(0.01, { message: 'El precio unitario debe ser mayor a cero' })
  precioUnitario: number;
}

/**
 * DTO para la creación de órdenes
 * Incluye validaciones exhaustivas para el frontend
 */
export class CrearOrdenDto {
  @ApiProperty({
    description: 'ID del cliente que realiza la orden',
    example: 'cliente-123',
  })
  @IsString({ message: 'El ID del cliente debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El ID del cliente es obligatorio' })
  clienteId: string;

  @ApiProperty({
    description: 'Subtotal de la orden (suma de precios de items)',
    example: 59.98,
    minimum: 0.01,
  })
  @IsNumber({}, { message: 'El subtotal debe ser un número' })
  @Min(0.01, { message: 'El subtotal debe ser mayor a cero' })
  subtotal: number;

  @ApiProperty({
    description: 'Impuestos aplicados a la orden',
    example: 10.80,
    minimum: 0,
  })
  @IsNumber({}, { message: 'Los impuestos deben ser un número' })
  @Min(0, { message: 'Los impuestos no pueden ser negativos' })
  impuestos: number;

  @ApiProperty({
    description: 'Total de la orden (subtotal + impuestos + envío)',
    example: 70.78,
    minimum: 0.01,
  })
  @IsNumber({}, { message: 'El total debe ser un número' })
  @Min(0.01, { message: 'El total debe ser mayor a cero' })
  total: number;

  @ApiPropertyOptional({
    description: 'Método de pago seleccionado',
    enum: MetodoPago,
    example: MetodoPago.TARJETA_CREDITO,
  })
  @IsEnum(MetodoPago, { message: 'Método de pago no válido' })
  @IsOptional()
  metodoPago?: MetodoPago;

  @ApiPropertyOptional({
    description: 'Método de envío seleccionado',
    example: 'Envío estándar',
    maxLength: 100,
  })
  @IsString({ message: 'El método de envío debe ser una cadena de texto' })
  @IsOptional()
  @MaxLength(100, { message: 'El método de envío no puede exceder los 100 caracteres' })
  metodoEnvio?: string;

  @ApiProperty({
    description: 'Costo de envío',
    example: 5.00,
    minimum: 0,
  })
  @IsNumber({}, { message: 'El costo de envío debe ser un número' })
  @Min(0, { message: 'El costo de envío no puede ser negativo' })
  costoEnvio: number;

  @ApiPropertyOptional({
    description: 'ID de la dirección de envío',
    example: 'dir-123',
  })
  @IsString({ message: 'El ID de la dirección de envío debe ser una cadena de texto' })
  @IsOptional()
  direccionEnvioId?: string;

  @ApiPropertyOptional({
    description: 'Notas adicionales para la orden',
    example: 'Por favor, entregar después de las 5pm',
    maxLength: 500,
  })
  @IsString({ message: 'Las notas deben ser una cadena de texto' })
  @IsOptional()
  @MaxLength(500, { message: 'Las notas no pueden exceder los 500 caracteres' })
  notas?: string;

  @ApiProperty({
    description: 'Items de la orden',
    type: [ItemOrdenDto],
    example: [
      {
        varianteId: 'var-123',
        cantidad: 2,
        precioUnitario: 29.99,
      },
    ],
  })
  @IsArray({ message: 'Los items deben ser un array' })
  @ArrayMinSize(1, { message: 'La orden debe tener al menos un item' })
  @ValidateNested({ each: true })
  @Type(() => ItemOrdenDto)
  items: ItemOrdenDto[];
}