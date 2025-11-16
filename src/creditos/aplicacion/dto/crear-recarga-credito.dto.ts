import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Min, IsPositive } from 'class-validator';

/**
 * DTO para crear una recarga de créditos
 * Valida y documenta los datos necesarios para recargar créditos en una tienda
 */
export class CrearRecargaCreditoDto {
  @ApiProperty({
    description: 'ID de la tienda que recarga créditos',
    example: 'tienda_123456789',
  })
  @IsNotEmpty({ message: 'El ID de la tienda es requerido' })
  @IsString({ message: 'El ID de la tienda debe ser una cadena de texto' })
  tiendaId: string;

  @ApiProperty({
    description: 'Monto en dólares a recargar (mínimo 5 USD)',
    example: 10,
    minimum: 5,
  })
  @IsNotEmpty({ message: 'El monto es requerido' })
  @IsNumber({}, { message: 'El monto debe ser un número' })
  @Min(5, { message: 'El monto mínimo es 5 USD' })
  @IsPositive({ message: 'El monto debe ser positivo' })
  montoDolares: number;

  @ApiProperty({
    description: 'ID del pago en Stripe',
    example: 'pi_1A2b3C4d5e6f7G8h9i0jKLMN',
  })
  @IsNotEmpty({ message: 'El ID del pago de Stripe es requerido' })
  @IsString({ message: 'El ID del pago de Stripe debe ser una cadena de texto' })
  idPagoStripe: string;
}

/**
 * DTO para la respuesta de creación de recarga de créditos
 */
export class CrearRecargaCreditoRespuestaDto {
  @ApiProperty({
    description: 'Mensaje descriptivo del resultado de la operación',
    example: 'Recarga de créditos creada exitosamente',
  })
  mensaje: string;

  @ApiProperty({
    description: 'Datos de la recarga creada',
    type: Object,
    example: {
      id: 'recarga_1702500000000_abc123def',
      tienda_id: 'tienda_123456789',
      monto_dolares: 10,
      creditos_agregados: 1000,
      estado: 'PENDIENTE',
      fecha_recarga: '2024-01-15T10:30:00.000Z',
      tasa_conversion: '1 USD = 100 créditos'
    },
  })
  data: any;

  @ApiProperty({
    description: 'Tipo de mensaje para el cliente',
    enum: ['Exito', 'ErrorCliente', 'ErrorServidor', 'Advertencia'],
    example: 'Exito',
  })
  tipo_mensaje: string;

  @ApiProperty({
    description: 'Estado interno de la respuesta',
    example: 201,
  })
  estado_respuesta: number;
}

/**
 * DTO para usar créditos
 */
export class UsarCreditosDto {
  @ApiProperty({
    description: 'Cantidad de créditos a usar',
    example: 50,
    minimum: 1,
  })
  @IsNotEmpty({ message: 'La cantidad de créditos es requerida' })
  @IsNumber({}, { message: 'La cantidad de créditos debe ser un número' })
  @Min(1, { message: 'La cantidad mínima de créditos es 1' })
  @IsPositive({ message: 'La cantidad de créditos debe ser positiva' })
  cantidad_creditos: number;

  @ApiProperty({
    description: 'Tipo de servicio que utiliza los créditos',
    enum: ['IA', 'API', 'WEBHOOK', 'REDES_SOCIALES', 'OTRO'],
    example: 'IA',
  })
  @IsNotEmpty({ message: 'El tipo de servicio es requerido' })
  @IsString({ message: 'El tipo de servicio debe ser una cadena de texto' })
  tipo_servicio: string;

  @ApiProperty({
    description: 'Descripción del servicio que utiliza los créditos',
    example: 'Generación de descripción de producto con IA',
  })
  @IsNotEmpty({ message: 'La descripción del servicio es requerida' })
  @IsString({ message: 'La descripción del servicio debe ser una cadena de texto' })
  descripcion_servicio: string;

  @ApiProperty({
    description: 'ID de referencia opcional (ej: ID del producto, orden, etc.)',
    example: 'prod_123456789',
    required: false,
  })
  id_referencia?: string;

  @ApiProperty({
    description: 'Metadatos adicionales del uso',
    example: { producto_id: 'prod_123', modelo_ia: 'gpt-4' },
    required: false,
  })
  metadata?: Record<string, any>;
}

/**
 * DTO para la respuesta de uso de créditos
 */
export class UsarCreditosRespuestaDto {
  @ApiProperty({
    description: 'Mensaje descriptivo del resultado de la operación',
    example: 'Créditos usados exitosamente',
  })
  mensaje: string;

  @ApiProperty({
    description: 'Datos del uso registrado',
    type: Object,
    example: {
      id: 'cred_uso_1702500000000_abc123def',
      tienda_id: 'tienda_123456789',
      cantidad_creditos: 50,
      tipo_servicio: 'IA',
      descripcion_servicio: 'Generación de descripción de producto con IA',
      fecha_uso: '2024-01-15T10:30:00.000Z',
      hora_uso: '05:30:00',
      creditos_disponibles_restantes: 950
    },
  })
  data: any;

  @ApiProperty({
    description: 'Tipo de mensaje para el cliente',
    enum: ['Exito', 'ErrorCliente', 'ErrorServidor', 'Advertencia'],
    example: 'Exito',
  })
  tipo_mensaje: string;

  @ApiProperty({
    description: 'Estado interno de la respuesta',
    example: 200,
  })
  estado_respuesta: number;
}

/**
 * DTO para obtener el balance de créditos
 */
export class ObtenerBalanceCreditoRespuestaDto {
  @ApiProperty({
    description: 'Mensaje descriptivo del resultado de la operación',
    example: 'Balance obtenido exitosamente',
  })
  mensaje: string;

  @ApiProperty({
    description: 'Datos del balance de créditos',
    type: Object,
    example: {
      creditos_disponibles: 950,
      creditos_usados: 50,
      balance_total: 1000,
      tasa_conversion: '1 USD = 100 créditos',
      valor_dolar_disponible: 9.5,
      valor_dolar_usado: 0.5
    },
  })
  data: any;

  @ApiProperty({
    description: 'Tipo de mensaje para el cliente',
    enum: ['Exito', 'ErrorCliente', 'ErrorServidor', 'Advertencia'],
    example: 'Exito',
  })
  tipo_mensaje: string;

  @ApiProperty({
    description: 'Estado interno de la respuesta',
    example: 200,
  })
  estado_respuesta: number;
}