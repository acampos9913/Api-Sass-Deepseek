import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { 
  IsEnum, 
  IsString, 
  IsBoolean, 
  IsNumber, 
  IsArray, 
  IsOptional, 
  IsNotEmpty, 
  Min, 
  Max, 
  ValidateNested,
  ArrayNotEmpty,
  IsDateString
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Enumeración para tipos de proveedores de pago
 */
export enum TipoProveedorPago {
  SHOPIFY_PAYMENTS = 'shopify_payments',
  PROVEEDOR_EXTERNO = 'proveedor_externo',
  PAYPAL = 'paypal',
  MANUAL = 'manual',
  OTRO = 'otro'
}

/**
 * Enumeración para métodos de pago admitidos
 */
export enum MetodoPago {
  TARJETA_CREDITO = 'tarjeta_credito',
  TARJETA_DEBITO = 'tarjeta_debito',
  PAYPAL = 'paypal',
  APPLE_PAY = 'apple_pay',
  GOOGLE_PAY = 'google_pay',
  TRANSFERENCIA_BANCARIA = 'transferencia_bancaria',
  EFECTIVO = 'efectivo',
  PAGO_MOVIL = 'pago_movil',
  CRIPTOMONEDAS = 'criptomonedas'
}

/**
 * Enumeración para modos de captura de pagos
 */
export enum ModoCapturaPago {
  AUTOMATICO_CHECKOUT = 'automatico_checkout',
  AUTOMATICO_PREPARACION = 'automatico_preparacion',
  MANUAL = 'manual'
}

/**
 * Enumeración para caducidad de tarjetas de regalo
 */
export enum CaducidadGiftcard {
  NUNCA = 'nunca',
  FECHA_DEFINIDA = 'fecha_definida'
}

/**
 * DTO para configuración de proveedor de pago
 */
export class ProveedorPagoDto {
  @ApiProperty({
    description: 'Nombre del proveedor de pago',
    example: 'Stripe',
    enum: TipoProveedorPago
  })
  @IsEnum(TipoProveedorPago, { message: 'El tipo de proveedor debe ser válido' })
  @IsNotEmpty({ message: 'El tipo de proveedor es requerido' })
  tipo_proveedor: TipoProveedorPago;

  @ApiProperty({
    description: 'Nombre del proveedor',
    example: 'Stripe Payments'
  })
  @IsString({ message: 'El nombre del proveedor debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre del proveedor es requerido' })
  nombre_proveedor: string;

  @ApiProperty({
    description: 'Comisión por transacción (porcentaje)',
    example: 2.9,
    minimum: 0,
    maximum: 100
  })
  @IsNumber({}, { message: 'La comisión debe ser un número' })
  @Min(0, { message: 'La comisión no puede ser negativa' })
  @Max(100, { message: 'La comisión no puede ser mayor al 100%' })
  comision_transaccion: number;

  @ApiProperty({
    description: 'Estado de activación del proveedor',
    example: true
  })
  @IsBoolean({ message: 'El estado activo debe ser un valor booleano' })
  activo: boolean;

  @ApiPropertyOptional({
    description: 'Configuración adicional del proveedor',
    example: { api_key: 'sk_test_...', webhook_secret: 'whsec_...' }
  })
  @IsOptional()
  configuracion_adicional?: Record<string, any>;
}

/**
 * DTO para método de pago
 */
export class MetodoPagoDto {
  @ApiProperty({
    description: 'Tipo de método de pago',
    example: MetodoPago.TARJETA_CREDITO,
    enum: MetodoPago
  })
  @IsEnum(MetodoPago, { message: 'El método de pago debe ser válido' })
  @IsNotEmpty({ message: 'El método de pago es requerido' })
  metodo: MetodoPago;

  @ApiProperty({
    description: 'Estado de activación del método',
    example: true
  })
  @IsBoolean({ message: 'El estado activo debe ser un valor booleano' })
  activo: boolean;

  @ApiPropertyOptional({
    description: 'Configuración específica del método',
    example: { procesador: 'stripe', monedas_aceptadas: ['USD', 'EUR'] }
  })
  @IsOptional()
  configuracion?: Record<string, any>;
}

/**
 * DTO para método de pago manual
 */
export class MetodoPagoManualDto {
  @ApiProperty({
    description: 'Nombre del método de pago manual',
    example: 'Transferencia Bancaria'
  })
  @IsString({ message: 'El nombre del método debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre del método es requerido' })
  nombre_metodo: string;

  @ApiProperty({
    description: 'Instrucciones para el cliente',
    example: 'Realice la transferencia a la cuenta XXXX-XXXX-XXXX'
  })
  @IsString({ message: 'Las instrucciones deben ser una cadena de texto' })
  @IsNotEmpty({ message: 'Las instrucciones son requeridas' })
  instrucciones: string;

  @ApiProperty({
    description: 'Estado de activación del método',
    example: true
  })
  @IsBoolean({ message: 'El estado activo debe ser un valor booleano' })
  activo: boolean;

  @ApiPropertyOptional({
    description: 'Tiempo de procesamiento estimado (en días)',
    example: 2,
    minimum: 0
  })
  @IsOptional()
  @IsNumber({}, { message: 'El tiempo de procesamiento debe ser un número' })
  @Min(0, { message: 'El tiempo de procesamiento no puede ser negativo' })
  tiempo_procesamiento?: number;
}

/**
 * DTO para configuración de tarjetas de regalo
 */
export class ConfiguracionGiftcardDto {
  @ApiProperty({
    description: 'Estado de activación de tarjetas de regalo',
    example: true
  })
  @IsBoolean({ message: 'El estado activo debe ser un valor booleano' })
  activo: boolean;

  @ApiProperty({
    description: 'Tipo de caducidad de las tarjetas de regalo',
    example: CaducidadGiftcard.NUNCA,
    enum: CaducidadGiftcard
  })
  @IsEnum(CaducidadGiftcard, { message: 'El tipo de caducidad debe ser válido' })
  @IsNotEmpty({ message: 'El tipo de caducidad es requerido' })
  caducidad: CaducidadGiftcard;

  @ApiPropertyOptional({
    description: 'Fecha de expiración (si aplica)',
    example: '2025-12-31'
  })
  @IsOptional()
  @IsDateString({}, { message: 'La fecha de expiración debe ser una fecha válida' })
  fecha_expiracion?: string;

  @ApiPropertyOptional({
    description: 'Monto mínimo para tarjetas de regalo',
    example: 10,
    minimum: 0
  })
  @IsOptional()
  @IsNumber({}, { message: 'El monto mínimo debe ser un número' })
  @Min(0, { message: 'El monto mínimo no puede ser negativo' })
  monto_minimo?: number;

  @ApiPropertyOptional({
    description: 'Monto máximo para tarjetas de regalo',
    example: 1000,
    minimum: 0
  })
  @IsOptional()
  @IsNumber({}, { message: 'El monto máximo debe ser un número' })
  @Min(0, { message: 'El monto máximo no puede ser negativo' })
  monto_maximo?: number;
}

/**
 * DTO para personalización de pagos
 */
export class PersonalizacionPagosDto {
  @ApiPropertyOptional({
    description: 'Texto personalizado para botones de pago',
    example: 'Pagar ahora'
  })
  @IsOptional()
  @IsString({ message: 'El texto del botón debe ser una cadena de texto' })
  texto_boton?: string;

  @ApiPropertyOptional({
    description: 'Color personalizado para elementos de pago',
    example: '#007bff'
  })
  @IsOptional()
  @IsString({ message: 'El color debe ser una cadena de texto' })
  color_primario?: string;

  @ApiPropertyOptional({
    description: 'Mostrar términos y condiciones',
    example: true
  })
  @IsOptional()
  @IsBoolean({ message: 'Mostrar términos debe ser un valor booleano' })
  mostrar_terminos?: boolean;

  @ApiPropertyOptional({
    description: 'Texto personalizado para términos y condiciones',
    example: 'Al realizar el pago aceptas nuestros términos y condiciones'
  })
  @IsOptional()
  @IsString({ message: 'El texto de términos debe ser una cadena de texto' })
  texto_terminos?: string;
}

/**
 * DTO para crear configuración de pagos
 */
export class CrearConfiguracionPagosDto {
  @ApiProperty({
    description: 'ID de la tienda',
    example: 'tienda-123'
  })
  @IsString({ message: 'El ID de la tienda debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El ID de la tienda es requerido' })
  tiendaId: string;

  @ApiProperty({
    description: 'Modo de captura de pagos',
    example: ModoCapturaPago.AUTOMATICO_CHECKOUT,
    enum: ModoCapturaPago
  })
  @IsEnum(ModoCapturaPago, { message: 'El modo de captura debe ser válido' })
  @IsNotEmpty({ message: 'El modo de captura es requerido' })
  modo_captura: ModoCapturaPago;

  @ApiProperty({
    description: 'Proveedores de pago configurados',
    type: [ProveedorPagoDto]
  })
  @IsArray({ message: 'Los proveedores de pago deben ser un array' })
  @ArrayNotEmpty({ message: 'Debe haber al menos un proveedor de pago' })
  @ValidateNested({ each: true })
  @Type(() => ProveedorPagoDto)
  proveedores_pago: ProveedorPagoDto[];

  @ApiProperty({
    description: 'Métodos de pago admitidos',
    type: [MetodoPagoDto]
  })
  @IsArray({ message: 'Los métodos de pago deben ser un array' })
  @ArrayNotEmpty({ message: 'Debe haber al menos un método de pago' })
  @ValidateNested({ each: true })
  @Type(() => MetodoPagoDto)
  metodos_pago: MetodoPagoDto[];

  @ApiProperty({
    description: 'Métodos de pago manuales',
    type: [MetodoPagoManualDto]
  })
  @IsArray({ message: 'Los métodos de pago manuales deben ser un array' })
  @ValidateNested({ each: true })
  @Type(() => MetodoPagoManualDto)
  metodos_pago_manuales: MetodoPagoManualDto[];

  @ApiProperty({
    description: 'Configuración de tarjetas de regalo',
    type: ConfiguracionGiftcardDto
  })
  @ValidateNested()
  @Type(() => ConfiguracionGiftcardDto)
  configuracion_giftcard: ConfiguracionGiftcardDto;

  @ApiPropertyOptional({
    description: 'Personalización de la experiencia de pago',
    type: PersonalizacionPagosDto
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => PersonalizacionPagosDto)
  personalizacion?: PersonalizacionPagosDto;

  @ApiPropertyOptional({
    description: 'Configuración adicional',
    example: { reintentos: 3, tiempo_expiracion: 30 }
  })
  @IsOptional()
  configuracion_adicional?: Record<string, any>;
}

/**
 * DTO para actualizar configuración de pagos
 */
export class ActualizarConfiguracionPagosDto {
  @ApiPropertyOptional({
    description: 'Modo de captura de pagos',
    example: ModoCapturaPago.AUTOMATICO_CHECKOUT,
    enum: ModoCapturaPago
  })
  @IsOptional()
  @IsEnum(ModoCapturaPago, { message: 'El modo de captura debe ser válido' })
  modo_captura?: ModoCapturaPago;

  @ApiPropertyOptional({
    description: 'Proveedores de pago configurados',
    type: [ProveedorPagoDto]
  })
  @IsOptional()
  @IsArray({ message: 'Los proveedores de pago deben ser un array' })
  @ValidateNested({ each: true })
  @Type(() => ProveedorPagoDto)
  proveedores_pago?: ProveedorPagoDto[];

  @ApiPropertyOptional({
    description: 'Métodos de pago admitidos',
    type: [MetodoPagoDto]
  })
  @IsOptional()
  @IsArray({ message: 'Los métodos de pago deben ser un array' })
  @ValidateNested({ each: true })
  @Type(() => MetodoPagoDto)
  metodos_pago?: MetodoPagoDto[];

  @ApiPropertyOptional({
    description: 'Métodos de pago manuales',
    type: [MetodoPagoManualDto]
  })
  @IsOptional()
  @IsArray({ message: 'Los métodos de pago manuales deben ser un array' })
  @ValidateNested({ each: true })
  @Type(() => MetodoPagoManualDto)
  metodos_pago_manuales?: MetodoPagoManualDto[];

  @ApiPropertyOptional({
    description: 'Configuración de tarjetas de regalo',
    type: ConfiguracionGiftcardDto
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ConfiguracionGiftcardDto)
  configuracion_giftcard?: ConfiguracionGiftcardDto;

  @ApiPropertyOptional({
    description: 'Personalización de la experiencia de pago',
    type: PersonalizacionPagosDto
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => PersonalizacionPagosDto)
  personalizacion?: PersonalizacionPagosDto;

  @ApiPropertyOptional({
    description: 'Configuración adicional',
    example: { reintentos: 3, tiempo_expiracion: 30 }
  })
  @IsOptional()
  configuracion_adicional?: Record<string, any>;
}

/**
 * DTO para respuesta de configuración de pagos
 */
export class RespuestaConfiguracionPagosDto {
  @ApiProperty({
    description: 'ID de la configuración',
    example: 'config-pagos-123'
  })
  id: string;

  @ApiProperty({
    description: 'ID de la tienda',
    example: 'tienda-123'
  })
  tiendaId: string;

  @ApiProperty({
    description: 'Modo de captura de pagos',
    example: ModoCapturaPago.AUTOMATICO_CHECKOUT,
    enum: ModoCapturaPago
  })
  modo_captura: ModoCapturaPago;

  @ApiProperty({
    description: 'Proveedores de pago configurados',
    type: [ProveedorPagoDto]
  })
  proveedores_pago: ProveedorPagoDto[];

  @ApiProperty({
    description: 'Métodos de pago admitidos',
    type: [MetodoPagoDto]
  })
  metodos_pago: MetodoPagoDto[];

  @ApiProperty({
    description: 'Métodos de pago manuales',
    type: [MetodoPagoManualDto]
  })
  metodos_pago_manuales: MetodoPagoManualDto[];

  @ApiProperty({
    description: 'Configuración de tarjetas de regalo',
    type: ConfiguracionGiftcardDto
  })
  configuracion_giftcard: ConfiguracionGiftcardDto;

  @ApiPropertyOptional({
    description: 'Personalización de la experiencia de pago',
    type: PersonalizacionPagosDto
  })
  personalizacion?: PersonalizacionPagosDto;

  @ApiPropertyOptional({
    description: 'Configuración adicional',
    example: { reintentos: 3, tiempo_expiracion: 30 }
  })
  configuracion_adicional?: Record<string, any>;

  @ApiProperty({
    description: 'Fecha de creación',
    example: '2024-01-01T00:00:00.000Z'
  })
  fecha_creacion: Date;

  @ApiProperty({
    description: 'Fecha de última actualización',
    example: '2024-01-01T00:00:00.000Z'
  })
  fecha_actualizacion: Date;
}

/**
 * DTO para criterios de búsqueda de configuraciones de pagos
 */
export class CriteriosBusquedaPagosDto {
  @ApiPropertyOptional({
    description: 'Modo de captura específico',
    enum: ModoCapturaPago
  })
  @IsOptional()
  @IsEnum(ModoCapturaPago, { message: 'El modo de captura debe ser válido' })
  modo_captura?: ModoCapturaPago;

  @ApiPropertyOptional({
    description: 'Tipo de proveedor específico',
    enum: TipoProveedorPago
  })
  @IsOptional()
  @IsEnum(TipoProveedorPago, { message: 'El tipo de proveedor debe ser válido' })
  tipo_proveedor?: TipoProveedorPago;

  @ApiPropertyOptional({
    description: 'Método de pago específico',
    enum: MetodoPago
  })
  @IsOptional()
  @IsEnum(MetodoPago, { message: 'El método de pago debe ser válido' })
  metodo_pago?: MetodoPago;

  @ApiPropertyOptional({
    description: 'Buscar configuraciones con giftcards activas',
    example: true
  })
  @IsOptional()
  @IsBoolean({ message: 'El filtro de giftcards debe ser un valor booleano' })
  giftcards_activas?: boolean;

  @ApiPropertyOptional({
    description: 'Buscar configuraciones con métodos manuales activos',
    example: true
  })
  @IsOptional()
  @IsBoolean({ message: 'El filtro de métodos manuales debe ser un valor booleano' })
  metodos_manuales_activos?: boolean;
}