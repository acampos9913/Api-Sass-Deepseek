import { ApiProperty } from '@nestjs/swagger';
import { TipoMovimientoInventario } from '../../dominio/enums/tipo-movimiento-inventario.enum';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

/**
 * DTO para registrar un movimiento de inventario
 * Contiene las validaciones de entrada para el registro de movimientos
 */
export class RegistrarMovimientoInventarioDto {
  @ApiProperty({
    description: 'ID del producto',
    example: 'prod_123456789',
    required: true,
  })
  @IsNotEmpty({ message: 'El ID del producto es obligatorio' })
  @IsString({ message: 'El ID del producto debe ser una cadena de texto' })
  productoId: string;

  @ApiProperty({
    description: 'ID de la variante (opcional, si es movimiento de variante específica)',
    example: 'var_123456789',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsString({ message: 'El ID de la variante debe ser una cadena de texto' })
  varianteId?: string | null;

  @ApiProperty({
    description: 'Tipo de movimiento de inventario',
    enum: TipoMovimientoInventario,
    example: TipoMovimientoInventario.ENTRADA,
    required: true,
  })
  @IsNotEmpty({ message: 'El tipo de movimiento es obligatorio' })
  @IsEnum(TipoMovimientoInventario, { 
    message: 'El tipo de movimiento debe ser uno de: ENTRADA, SALIDA, AJUSTE, VENTA, DEVOLUCION' 
  })
  tipo: TipoMovimientoInventario;

  @ApiProperty({
    description: 'Cantidad del movimiento (debe ser mayor a 0)',
    example: 10,
    required: true,
  })
  @IsNotEmpty({ message: 'La cantidad es obligatoria' })
  @IsNumber({}, { message: 'La cantidad debe ser un número' })
  @Min(1, { message: 'La cantidad debe ser mayor a 0' })
  cantidad: number;

  @ApiProperty({
    description: 'Motivo del movimiento',
    example: 'Compra de proveedor',
    required: true,
  })
  @IsNotEmpty({ message: 'El motivo es obligatorio' })
  @IsString({ message: 'El motivo debe ser una cadena de texto' })
  motivo: string;
}