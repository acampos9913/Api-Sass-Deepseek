import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ParametrosRutaTiendaDto {
  @ApiProperty({ description: 'ID de la tienda', example: 'tienda-123' })
  @IsNotEmpty({ message: 'El ID de la tienda es requerido' })
  @IsString({ message: 'El ID de la tienda debe ser una cadena de texto' })
  tiendaId: string;
}