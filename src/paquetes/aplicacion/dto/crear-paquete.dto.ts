import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsBoolean, IsArray, IsOptional, Min, ValidateNested, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO para crear un item de paquete
 */
export class CrearItemPaqueteDto {
  @ApiProperty({
    description: 'ID del producto',
    example: 'prod_123456789',
  })
  @IsString()
  @IsNotEmpty()
  productoId: string;

  @ApiPropertyOptional({
    description: 'ID de la variante del producto (opcional)',
    example: 'var_123456789',
  })
  @IsString()
  @IsOptional()
  varianteId?: string | null;

  @ApiProperty({
    description: 'Cantidad del producto en el paquete',
    example: 2,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  cantidad: number;

  @ApiPropertyOptional({
    description: 'Precio unitario del producto en el paquete (opcional)',
    example: 25.50,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  precioUnitario?: number | null;
}

/**
 * DTO para crear un paquete de productos
 */
export class CrearPaqueteDto {
  @ApiProperty({
    description: 'Nombre del paquete',
    example: 'Paquete Básico de Maquillaje',
  })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiPropertyOptional({
    description: 'Descripción del paquete',
    example: 'Incluye base, rubor y máscara de pestañas',
  })
  @IsString()
  @IsOptional()
  descripcion?: string | null;

  @ApiProperty({
    description: 'Precio del paquete',
    example: 89.99,
    minimum: 0.01,
  })
  @IsNumber()
  @Min(0.01)
  precio: number;

  @ApiPropertyOptional({
    description: 'Precio de comparación (precio regular sin descuento)',
    example: 120.50,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  precioComparacion?: number | null;

  @ApiPropertyOptional({
    description: 'SKU único del paquete',
    example: 'PKG-MAQUILLAJE-BASICO',
  })
  @IsString()
  @IsOptional()
  sku?: string | null;

  @ApiPropertyOptional({
    description: 'Estado activo/inactivo del paquete',
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  activo?: boolean;

  @ApiPropertyOptional({
    description: 'ID de la tienda (para multi-tenant)',
    example: 'tienda_123456789',
  })
  @IsString()
  @IsOptional()
  tiendaId?: string | null;

  @ApiProperty({
    description: 'Items que componen el paquete',
    type: [CrearItemPaqueteDto],
    example: [
      {
        productoId: 'prod_123456789',
        varianteId: 'var_123456789',
        cantidad: 1,
        precioUnitario: 45.50,
      },
      {
        productoId: 'prod_987654321',
        cantidad: 2,
        precioUnitario: 22.25,
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CrearItemPaqueteDto)
  items: CrearItemPaqueteDto[];
}