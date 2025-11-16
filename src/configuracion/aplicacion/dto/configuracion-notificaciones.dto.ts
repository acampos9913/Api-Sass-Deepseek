import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, IsUrl, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Enum para el estado de verificación del email del remitente
 */
export enum EstadoVerificacionEmailEnum {
  VERIFICADO = 'verificado',
  PENDIENTE = 'pendiente',
  FALLIDO = 'fallido',
}

/**
 * Enum para los tipos de eventos de notificación a clientes
 */
export enum TipoEventoClienteEnum {
  CONFIRMACION_PEDIDO = 'confirmacion_pedido',
  FACTURA = 'factura',
  ENVIO = 'envio',
  RETIRO = 'retiro',
  ENTREGA_LOCAL = 'entrega_local',
  REGALO = 'regalo',
  DEVOLUCION = 'devolucion',
  // ... otros 33+ tipos de eventos
}

/**
 * Enum para los tipos de eventos de notificación a empleados
 */
export enum TipoEventoEmpleadoEnum {
  NUEVO_PEDIDO = 'nuevo_pedido',
  DEVOLUCION = 'devolucion',
  ATRIBUCION_VENTAS = 'atribucion_ventas',
  PEDIDO_PRELIMINAR = 'pedido_preliminar',
}

/**
 * Enum para los formatos de webhook
 */
export enum FormatoWebhookEnum {
  JSON = 'JSON',
  XML = 'XML',
}

/**
 * Enum para las versiones de API de webhook
 */
export enum VersionApiWebhookEnum {
  UNSTABLE = 'unstable',
  V2026_01 = '2026-01',
  V2025_10 = '2025-10',
  V2025_07 = '2025-07',
  V2025_04 = '2025-04',
  V2025_01 = '2025-01',
}

/**
 * DTO para la configuración del email del remitente
 */
export class ConfiguracionEmailRemitenteDto {
  @ApiProperty({ description: 'Email del remitente', example: 'ventas@tienda.com' })
  @IsNotEmpty({ message: 'El email del remitente es requerido' })
  @IsEmail({}, { message: 'El email del remitente debe ser un email válido' })
  email_remitente: string;

  @ApiProperty({ description: 'Estado de verificación del email', enum: EstadoVerificacionEmailEnum })
  @IsNotEmpty({ message: 'El estado de verificación es requerido' })
  @IsEnum(EstadoVerificacionEmailEnum, { message: 'El estado de verificación debe ser válido' })
  estado_verificacion: EstadoVerificacionEmailEnum;

  @ApiProperty({ description: 'Autenticación DMARC activa', example: true })
  @IsNotEmpty({ message: 'El estado de autenticación DMARC es requerido' })
  @IsBoolean({ message: 'La autenticación DMARC debe ser un booleano' })
  dmarc_autenticado: boolean;
}

/**
 * DTO para la configuración de notificaciones a clientes
 */
export class NotificacionClienteDto {
  @ApiProperty({ description: 'Tipo de evento', enum: TipoEventoClienteEnum })
  @IsNotEmpty({ message: 'El tipo de evento es requerido' })
  @IsEnum(TipoEventoClienteEnum, { message: 'El tipo de evento debe ser válido' })
  tipo_evento: TipoEventoClienteEnum;

  @ApiProperty({ description: 'Estado habilitado/deshabilitado', example: true })
  @IsNotEmpty({ message: 'El estado es requerido' })
  @IsBoolean({ message: 'El estado debe ser un booleano' })
  habilitado: boolean;

  @ApiProperty({ description: 'Plantilla de correo personalizada', required: false })
  @IsOptional()
  @IsString({ message: 'La plantilla debe ser una cadena de texto' })
  plantilla_personalizada?: string;
}

/**
 * DTO para la configuración de notificaciones a empleados
 */
export class NotificacionEmpleadoDto {
  @ApiProperty({ description: 'Tipo de evento', enum: TipoEventoEmpleadoEnum })
  @IsNotEmpty({ message: 'El tipo de evento es requerido' })
  @IsEnum(TipoEventoEmpleadoEnum, { message: 'El tipo de evento debe ser válido' })
  tipo_evento: TipoEventoEmpleadoEnum;

  @ApiProperty({ description: 'Lista de destinatarios (emails)', type: [String] })
  @IsNotEmpty({ message: 'Los destinatarios son requeridos' })
  @IsArray({ message: 'Los destinatarios deben ser un array' })
  @IsEmail({}, { each: true, message: 'Cada destinatario debe ser un email válido' })
  destinatarios: string[];

  @ApiProperty({ description: 'Filtros por tipo de pedido', type: [String], required: false })
  @IsOptional()
  @IsArray({ message: 'Los filtros deben ser un array' })
  @IsString({ each: true, message: 'Cada filtro debe ser una cadena de texto' })
  filtros_pedido?: string[];
}

/**
 * DTO para la configuración de webhooks
 */
export class ConfiguracionWebhookDto {
  @ApiProperty({ description: 'Tipo de evento del webhook', example: 'cliente.creado' })
  @IsNotEmpty({ message: 'El tipo de evento es requerido' })
  @IsString({ message: 'El tipo de evento debe ser una cadena de texto' })
  tipo_evento: string;

  @ApiProperty({ description: 'Formato del webhook', enum: FormatoWebhookEnum })
  @IsNotEmpty({ message: 'El formato es requerido' })
  @IsEnum(FormatoWebhookEnum, { message: 'El formato debe ser JSON o XML' })
  formato: FormatoWebhookEnum;

  @ApiProperty({ description: 'URL destino del webhook', example: 'https://api.mitienda.com/webhooks' })
  @IsNotEmpty({ message: 'La URL destino es requerida' })
  @IsUrl({}, { message: 'La URL destino debe ser una URL válida' })
  @IsString({ message: 'La URL destino debe ser una cadena de texto' })
  url: string;

  @ApiProperty({ description: 'Versión de API', enum: VersionApiWebhookEnum })
  @IsNotEmpty({ message: 'La versión de API es requerida' })
  @IsEnum(VersionApiWebhookEnum, { message: 'La versión de API debe ser válida' })
  version_api: VersionApiWebhookEnum;

  @ApiProperty({ description: 'Estado activo/inactivo', example: true })
  @IsNotEmpty({ message: 'El estado es requerido' })
  @IsBoolean({ message: 'El estado debe ser un booleano' })
  activo: boolean;
}

/**
 * DTO principal para la configuración de notificaciones
 */
export class ConfiguracionNotificacionesDto {
  @ApiProperty({ description: 'Configuración del email del remitente' })
  @IsNotEmpty({ message: 'La configuración del email del remitente es requerida' })
  @ValidateNested()
  @Type(() => ConfiguracionEmailRemitenteDto)
  email_remitente: ConfiguracionEmailRemitenteDto;

  @ApiProperty({ description: 'Lista de notificaciones a clientes', type: [NotificacionClienteDto] })
  @IsNotEmpty({ message: 'Las notificaciones a clientes son requeridas' })
  @IsArray({ message: 'Las notificaciones a clientes deben ser un array' })
  @ValidateNested({ each: true })
  @Type(() => NotificacionClienteDto)
  notificaciones_clientes: NotificacionClienteDto[];

  @ApiProperty({ description: 'Lista de notificaciones a empleados', type: [NotificacionEmpleadoDto] })
  @IsNotEmpty({ message: 'Las notificaciones a empleados son requeridas' })
  @IsArray({ message: 'Las notificaciones a empleados deben ser un array' })
  @ValidateNested({ each: true })
  @Type(() => NotificacionEmpleadoDto)
  notificaciones_empleados: NotificacionEmpleadoDto[];

  @ApiProperty({ description: 'Lista de webhooks', type: [ConfiguracionWebhookDto] })
  @IsNotEmpty({ message: 'Los webhooks son requeridos' })
  @IsArray({ message: 'Los webhooks deben ser un array' })
  @ValidateNested({ each: true })
  @Type(() => ConfiguracionWebhookDto)
  webhooks: ConfiguracionWebhookDto[];
}

/**
 * DTO para actualizar la configuración de notificaciones
 */
export class ActualizarConfiguracionNotificacionesDto {
  @ApiProperty({ description: 'Configuración del email del remitente', required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => ConfiguracionEmailRemitenteDto)
  email_remitente?: ConfiguracionEmailRemitenteDto;

  @ApiProperty({ description: 'Lista de notificaciones a clientes', type: [NotificacionClienteDto], required: false })
  @IsOptional()
  @IsArray({ message: 'Las notificaciones a clientes deben ser un array' })
  @ValidateNested({ each: true })
  @Type(() => NotificacionClienteDto)
  notificaciones_clientes?: NotificacionClienteDto[];

  @ApiProperty({ description: 'Lista de notificaciones a empleados', type: [NotificacionEmpleadoDto], required: false })
  @IsOptional()
  @IsArray({ message: 'Las notificaciones a empleados deben ser un array' })
  @ValidateNested({ each: true })
  @Type(() => NotificacionEmpleadoDto)
  notificaciones_empleados?: NotificacionEmpleadoDto[];

  @ApiProperty({ description: 'Lista de webhooks', type: [ConfiguracionWebhookDto], required: false })
  @IsOptional()
  @IsArray({ message: 'Los webhooks deben ser un array' })
  @ValidateNested({ each: true })
  @Type(() => ConfiguracionWebhookDto)
  webhooks?: ConfiguracionWebhookDto[];
}