import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsPhoneNumber,
  IsBoolean,
  IsOptional,
  IsArray,
  ValidateNested,
  IsObject,
  IsPostalCode,
  IsEnum,
  IsDate,
  IsNumber,
  Min,
  IsNotEmpty,
  Matches,
  MaxLength,
  IsDateString
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO para la dirección fiscal
 */
export class DireccionFiscalDto {
  @ApiProperty({
    description: 'Calle de la dirección fiscal',
    example: 'Av. Principal 123',
  })
  @IsString({ message: 'La calle debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La calle es requerida' })
  calle: string;

  @ApiProperty({
    description: 'Ciudad de la dirección fiscal',
    example: 'Lima',
  })
  @IsString({ message: 'La ciudad debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La ciudad es requerida' })
  ciudad: string;

  @ApiProperty({
    description: 'Región de la dirección fiscal',
    example: 'Lima',
  })
  @IsString({ message: 'La región debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La región es requerida' })
  region: string;

  @ApiProperty({
    description: 'País de la dirección fiscal',
    example: 'Perú',
  })
  @IsString({ message: 'El país debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El país es requerido' })
  pais: string;

  @ApiProperty({
    description: 'Código postal de la dirección fiscal',
    example: '15001',
  })
  @IsString({ message: 'El código postal debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El código postal es requerido' })
  codigo_postal: string;
}

/**
 * Enums para tipos de métodos de pago
 */
export enum TipoMetodoPago {
  TARJETA_CREDITO = 'tarjeta de crédito',
  CUENTA_BANCARIA = 'cuenta bancaria',
  PAYPAL = 'PayPal',
  TRANSFERENCIA = 'transferencia',
  EFECTIVO = 'efectivo'
}

/**
 * Enums para ciclos de facturación
 */
export enum CicloFacturacion {
  MENSUAL = 'mensual',
  ANUAL = 'anual'
}

/**
 * Enums para estados de factura
 */
export enum EstadoFactura {
  PENDIENTE = 'pendiente',
  PAGADA = 'pagada',
  VENCIDA = 'vencida'
}

/**
 * Enums para frecuencia de recordatorios
 */
export enum FrecuenciaRecordatorio {
  DIARIA = 'diaria',
  SEMANAL = 'semanal',
  ANTES_VENCIMIENTO = 'antes de vencimiento'
}

/**
 * DTO para datos de método de pago (estructura flexible por tipo)
 */
export class DatosMetodoPagoDto {
  @ApiPropertyOptional({
    description: 'Número de tarjeta enmascarado (últimos 4 dígitos)',
    example: '**** **** **** 1234',
  })
  @IsOptional()
  @IsString({ message: 'El número de tarjeta debe ser una cadena de texto' })
  @Matches(/^\*{12}\d{4}$/, { message: 'Formato de tarjeta enmascarado inválido' })
  numero_tarjeta_enmascarado?: string;

  @ApiPropertyOptional({
    description: 'Banco emisor de la tarjeta',
    example: 'Banco de Crédito',
  })
  @IsOptional()
  @IsString({ message: 'El banco emisor debe ser una cadena de texto' })
  banco_emisor?: string;

  @ApiPropertyOptional({
    description: 'Fecha de expiración (MM/YY)',
    example: '12/25',
  })
  @IsOptional()
  @IsString({ message: 'La fecha de expiración debe ser una cadena de texto' })
  @Matches(/^(0[1-9]|1[0-2])\/\d{2}$/, { message: 'Formato de fecha inválido (MM/YY)' })
  fecha_expiracion?: string;

  @ApiPropertyOptional({
    description: 'Número de cuenta bancaria enmascarado',
    example: '**** **** **** 5678',
  })
  @IsOptional()
  @IsString({ message: 'El número de cuenta debe ser una cadena de texto' })
  numero_cuenta_enmascarado?: string;

  @ApiPropertyOptional({
    description: 'Email asociado a PayPal',
    example: 'usuario@paypal.com',
  })
  @IsOptional()
  @IsEmail({}, { message: 'El email de PayPal debe tener formato válido' })
  email_paypal?: string;
}

/**
 * DTO para método de pago
 */
export class MetodoPagoDto {
  @ApiProperty({
    description: 'Tipo de método de pago',
    enum: TipoMetodoPago,
    example: TipoMetodoPago.TARJETA_CREDITO,
  })
  @IsEnum(TipoMetodoPago, { message: 'Tipo de método de pago no válido' })
  tipo_metodo: TipoMetodoPago;

  @ApiProperty({
    description: 'Datos asociados al método de pago',
    type: DatosMetodoPagoDto,
  })
  @ValidateNested()
  @Type(() => DatosMetodoPagoDto)
  datos_metodo: DatosMetodoPagoDto;

  @ApiProperty({
    description: 'Estado activo del método de pago',
    example: true,
  })
  @IsBoolean({ message: 'El estado activo debe ser un valor booleano' })
  estado_activo: boolean;

  @ApiProperty({
    description: 'Fecha de registro del método de pago',
    example: '2024-01-01T10:30:00.000Z',
  })
  @IsDateString({}, { message: 'La fecha de registro debe ser una fecha válida' })
  fecha_registro: string;
}

/**
 * DTO para factura en el historial
 */
export class FacturaHistorialDto {
  @ApiProperty({
    description: 'Número único de factura',
    example: 'FAC-2024-001',
  })
  @IsString({ message: 'El número de factura debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El número de factura es requerido' })
  nro_factura: string;

  @ApiProperty({
    description: 'Fecha de la factura',
    example: '2024-01-01T10:30:00.000Z',
  })
  @IsDateString({}, { message: 'La fecha de factura debe ser una fecha válida' })
  fecha: string;

  @ApiProperty({
    description: 'Monto de la factura',
    example: 100.50,
    minimum: 0,
  })
  @IsNumber({}, { message: 'El monto debe ser un número' })
  @Min(0, { message: 'El monto debe ser positivo' })
  monto: number;

  @ApiProperty({
    description: 'Estado de la factura',
    enum: EstadoFactura,
    example: EstadoFactura.PENDIENTE,
  })
  @IsEnum(EstadoFactura, { message: 'Estado de factura no válido' })
  estado: EstadoFactura;
}

/**
 * DTO para notificaciones de pago
 */
export class NotificacionPagoDto {
  @ApiProperty({
    description: 'Email destinatario para notificaciones',
    example: 'facturacion@empresa.com',
  })
  @IsEmail({}, { message: 'El email destinatario debe tener formato válido' })
  email_destinatario: string;

  @ApiProperty({
    description: 'Frecuencia de recordatorio',
    enum: FrecuenciaRecordatorio,
    example: FrecuenciaRecordatorio.SEMANAL,
  })
  @IsEnum(FrecuenciaRecordatorio, { message: 'Frecuencia de recordatorio no válida' })
  frecuencia: FrecuenciaRecordatorio;

  @ApiProperty({
    description: 'Estado de envío de notificaciones',
    example: true,
  })
  @IsBoolean({ message: 'El estado de envío debe ser un valor booleano' })
  estado_envio: boolean;
}

/**
 * DTO principal para configuración de facturación
 */
export class ConfiguracionFacturacionDto {
  @ApiProperty({
    description: 'Nombre legal de la empresa',
    example: 'Mi Empresa SAC',
    maxLength: 100,
  })
  @IsString({ message: 'El nombre legal debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre legal es requerido' })
  @MaxLength(100, { message: 'El nombre legal no puede exceder 100 caracteres' })
  nombre_empresa: string;

  @ApiProperty({
    description: 'Dirección fiscal completa',
    type: DireccionFiscalDto,
  })
  @ValidateNested()
  @Type(() => DireccionFiscalDto)
  direccion_fiscal: DireccionFiscalDto;

  @ApiProperty({
    description: 'Email de facturación',
    example: 'facturacion@empresa.com',
  })
  @IsEmail({}, { message: 'El email de facturación debe tener formato válido' })
  email_facturacion: string;

  @ApiPropertyOptional({
    description: 'Teléfono de contacto (formato numérico)',
    example: '51987654321',
  })
  @IsOptional()
  @IsString({ message: 'El teléfono debe ser una cadena de texto' })
  @Matches(/^[0-9]*$/, { message: 'El teléfono solo puede contener números' })
  @MaxLength(15, { message: 'El teléfono no puede exceder 15 caracteres' })
  telefono_contacto?: string;

  @ApiPropertyOptional({
    description: 'Identificación fiscal/tributaria',
    example: '20123456789',
  })
  @IsOptional()
  @IsString({ message: 'El ID fiscal debe ser una cadena de texto' })
  @MaxLength(20, { message: 'El ID fiscal no puede exceder 20 caracteres' })
  id_fiscal?: string;

  @ApiProperty({
    description: 'Métodos de pago registrados',
    type: [MetodoPagoDto],
  })
  @IsArray({ message: 'Los métodos de pago deben ser un array' })
  @ValidateNested({ each: true })
  @Type(() => MetodoPagoDto)
  metodos_pago: MetodoPagoDto[];

  @ApiProperty({
    description: 'Ciclo activo de facturación',
    enum: CicloFacturacion,
    example: CicloFacturacion.MENSUAL,
  })
  @IsEnum(CicloFacturacion, { message: 'Ciclo de facturación no válido' })
  ciclo_facturacion: CicloFacturacion;

  @ApiProperty({
    description: 'Fecha de próxima factura',
    example: '2024-02-01T00:00:00.000Z',
  })
  @IsDateString({}, { message: 'La fecha de próxima factura debe ser una fecha válida' })
  fecha_proxima: string;

  @ApiProperty({
    description: 'Historial de facturas',
    type: [FacturaHistorialDto],
  })
  @IsArray({ message: 'El historial de facturas debe ser un array' })
  @ValidateNested({ each: true })
  @Type(() => FacturaHistorialDto)
  historial_facturas: FacturaHistorialDto[];

  @ApiProperty({
    description: 'Configuración de notificaciones de pago',
    type: NotificacionPagoDto,
  })
  @ValidateNested()
  @Type(() => NotificacionPagoDto)
  notificaciones: NotificacionPagoDto;
}