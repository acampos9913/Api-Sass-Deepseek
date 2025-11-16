import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para respuestas estándar de la API
 */
export class RespuestaEstandar<T = any> {
  @ApiProperty({
    description: 'Mensaje descriptivo de la respuesta',
    example: 'Operación completada exitosamente'
  })
  mensaje: string;

  @ApiProperty({
    description: 'Datos de la respuesta',
    example: null,
    nullable: true
  })
  data: T | null;

  @ApiProperty({
    description: 'Tipo de mensaje',
    enum: ['Exito', 'ErrorCliente', 'ErrorServidor', 'Advertencia'],
    example: 'Exito'
  })
  tipo_mensaje: 'Exito' | 'ErrorCliente' | 'ErrorServidor' | 'Advertencia';

  @ApiProperty({
    description: 'Código de estado HTTP de la respuesta',
    example: 200
  })
  estado_respuesta: number;
}