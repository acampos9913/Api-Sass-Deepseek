/**
 * DTO para agregar clientes a un segmento manualmente
 * Valida y tipa los datos de entrada para agregar un cliente a un segmento
 */
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString, ArrayMinSize } from 'class-validator';

export class AgregarClienteSegmentoDto {
  @ApiProperty({
    description: 'IDs de los clientes a agregar al segmento',
    example: ['cliente-123', 'cliente-456', 'cliente-789'],
    type: [String]
  })
  @IsArray({ message: 'Los IDs de clientes deben ser un array' })
  @ArrayMinSize(1, { message: 'Debe proporcionar al menos un ID de cliente' })
  @IsString({ each: true, message: 'Cada ID de cliente debe ser una cadena de texto' })
  @IsNotEmpty({ each: true, message: 'Cada ID de cliente no puede estar vacío' })
  clienteIds: string[];
}