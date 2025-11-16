import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsUrl,
  IsNumber,
  Min,
  Max,
  IsBoolean,
  IsOptional,
  IsArray,
  ArrayNotEmpty,
  ValidateNested,
  IsObject,
  IsPostalCode,
  IsPhoneNumber,
  MaxLength,
  Matches,
  IsIn
} from 'class-validator';
import { Type } from 'class-transformer';
import { ConfiguracionFacturacionDto } from './configuracion-facturacion.dto';

/**
 * DTO para la moneda de la tienda
 */
export class MonedaDto {
  @ApiProperty({
    description: 'Código de moneda ISO 4217 (ej: USD, EUR, PEN)',
    example: 'USD',
  })
  @IsString({ message: 'El código de moneda debe ser una cadena de texto' })
  codigo: string;

  @ApiProperty({
    description: 'Símbolo de la moneda (ej: $, €, S/)',
    example: '$',
  })
  @IsString({ message: 'El símbolo de moneda debe ser una cadena de texto' })
  simbolo: string;

  @ApiPropertyOptional({
    description: 'Número de decimales para la moneda (por defecto: 2)',
    minimum: 0,
    maximum: 4,
    example: 2,
  })
  @IsNumber({}, { message: 'Los decimales deben ser un número' })
  @Min(0, { message: 'Los decimales no pueden ser negativos' })
  @Max(4, { message: 'Los decimales no pueden ser mayores a 4' })
  @IsOptional()
  decimales?: number = 2;
}

/**
 * DTO para la configuración de impuestos
 */
export class ConfiguracionImpuestosDto {
  @ApiProperty({
    description: 'Porcentaje de impuesto de venta (0-100)',
    minimum: 0,
    maximum: 100,
    example: 18,
  })
  @IsNumber({}, { message: 'El impuesto de venta debe ser un número' })
  @Min(0, { message: 'El impuesto de venta no puede ser negativo' })
  @Max(100, { message: 'El impuesto de venta no puede ser mayor a 100' })
  impuestoVenta: number;

  @ApiProperty({
    description: 'Indica si los impuestos están incluidos en los precios mostrados',
    example: false,
  })
  @IsBoolean({ message: 'incluirImpuestosEnPrecios debe ser un valor booleano' })
  incluirImpuestosEnPrecios: boolean;

  @ApiPropertyOptional({
    description: 'País para la aplicación de impuestos',
    example: 'Perú',
  })
  @IsString({ message: 'El país debe ser una cadena de texto' })
  @IsOptional()
  pais?: string;

  @ApiPropertyOptional({
    description: 'Estado/Provincia para la aplicación de impuestos',
    example: 'Lima',
  })
  @IsString({ message: 'El estado debe ser una cadena de texto' })
  @IsOptional()
  estado?: string;
}

/**
 * DTO para la dirección de la tienda
 */
export class DireccionTiendaDto {
  @ApiProperty({
    description: 'Calle y número de la dirección',
    example: 'Av. Principal 123',
  })
  @IsString({ message: 'La calle debe ser una cadena de texto' })
  calle: string;

  @ApiProperty({
    description: 'Ciudad de la dirección',
    example: 'Lima',
  })
  @IsString({ message: 'La ciudad debe ser una cadena de texto' })
  ciudad: string;

  @ApiPropertyOptional({
    description: 'Estado/Provincia de la dirección',
    example: 'Lima',
  })
  @IsString({ message: 'El estado debe ser una cadena de texto' })
  @IsOptional()
  estado?: string;

  @ApiProperty({
    description: 'Código postal de la dirección',
    example: '15001',
  })
  @IsString({ message: 'El código postal debe ser una cadena de texto' })
  codigoPostal: string;

  @ApiProperty({
    description: 'País de la dirección',
    example: 'Perú',
  })
  @IsString({ message: 'El país debe ser una cadena de texto' })
  pais: string;
}

/**
 * DTO para la información de contacto
 */
export class ContactoTiendaDto {
  @ApiProperty({
    description: 'Email de contacto de la tienda',
    example: 'contacto@mitienda.com',
  })
  @IsEmail({}, { message: 'El email debe tener un formato válido' })
  email: string;

  @ApiPropertyOptional({
    description: 'Teléfono de contacto de la tienda',
    example: '+51 123 456 789',
  })
  @IsString({ message: 'El teléfono debe ser una cadena de texto' })
  @IsOptional()
  telefono?: string;

  @ApiPropertyOptional({
    description: 'Sitio web de la tienda',
    example: 'https://mitienda.com',
  })
  @IsUrl({}, { message: 'El sitio web debe tener un formato URL válido' })
  @IsOptional()
  sitioWeb?: string;
}

/**
 * DTO para la configuración de envíos
 */
export class ConfiguracionEnvioDto {
  @ApiProperty({
    description: 'Monto mínimo para envío gratis',
    minimum: 0,
    example: 100,
  })
  @IsNumber({}, { message: 'El costo mínimo para envío gratis debe ser un número' })
  @Min(0, { message: 'El costo mínimo para envío gratis no puede ser negativo' })
  costoEnvioGratisMinimo: number;

  @ApiProperty({
    description: 'Tiempo de procesamiento en días',
    minimum: 0,
    maximum: 30,
    example: 2,
  })
  @IsNumber({}, { message: 'El tiempo de procesamiento debe ser un número' })
  @Min(0, { message: 'El tiempo de procesamiento no puede ser negativo' })
  @Max(30, { message: 'El tiempo de procesamiento no puede exceder 30 días' })
  tiempoProcesamientoDias: number;

  @ApiPropertyOptional({
    description: 'Políticas de envío de la tienda',
    example: 'Envío estándar en 3-5 días hábiles',
  })
  @IsString({ message: 'Las políticas de envío deben ser una cadena de texto' })
  @IsOptional()
  politicasEnvio?: string;
}

/**
 * DTO para la configuración de pagos
 */
export class ConfiguracionPagosDto {
  @ApiProperty({
    description: 'Métodos de pago aceptados',
    type: [String],
    example: ['TARJETA_CREDITO', 'PAYPAL'],
  })
  @IsArray({ message: 'Los métodos de pago aceptados deben ser un array' })
  @ArrayNotEmpty({ message: 'Debe haber al menos un método de pago aceptado' })
  @IsString({ each: true, message: 'Cada método de pago debe ser una cadena de texto' })
  metodosPagoAceptados: string[];

  @ApiProperty({
    description: 'Moneda por defecto para los pagos',
    example: 'USD',
  })
  @IsString({ message: 'La moneda por defecto debe ser una cadena de texto' })
  monedaPorDefecto: string;
}

/**
 * DTO para la configuración general de la tienda
 * Incluye todos los campos de la sección "Configuración > General"
 */
export class ConfiguracionGeneralDto {
  @ApiProperty({
    description: 'Nombre de la tienda (requerido, máximo 100 caracteres)',
    example: 'Mi Tienda Online',
    maxLength: 100,
  })
  @IsString({ message: 'El nombre de la tienda debe ser una cadena de texto' })
  @MaxLength(100, { message: 'El nombre de la tienda no puede exceder 100 caracteres' })
  nombreTienda: string;

  @ApiProperty({
    description: 'Correo electrónico de contacto (requerido, formato válido)',
    example: 'contacto@mitienda.com',
  })
  @IsEmail({}, { message: 'El correo de contacto debe tener un formato válido' })
  correoContacto: string;

  @ApiPropertyOptional({
    description: 'Teléfono de contacto (opcional, solo números)',
    example: '51987654321',
  })
  @IsOptional()
  @IsString({ message: 'El teléfono debe ser una cadena de texto' })
  @Matches(/^[0-9]*$/, { message: 'El teléfono solo puede contener números' })
  telefonoContacto?: string;

  @ApiProperty({
    description: 'Dirección de facturación (requerido, máximo 200 caracteres)',
    example: 'Av. Principal 123, Lima, Perú',
    maxLength: 200,
  })
  @IsString({ message: 'La dirección de facturación debe ser una cadena de texto' })
  @MaxLength(200, { message: 'La dirección de facturación no puede exceder 200 caracteres' })
  direccionFacturacion: string;

  @ApiProperty({
    description: 'Moneda predeterminada (requerido, opciones: USD, PEN, EUR, etc.)',
    example: 'USD',
    enum: ['USD', 'PEN', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'MXN', 'BRL'],
  })
  @IsString({ message: 'La moneda predeterminada debe ser una cadena de texto' })
  @IsIn(['USD', 'PEN', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'MXN', 'BRL'], {
    message: 'La moneda predeterminada debe ser una opción válida',
  })
  monedaPredeterminada: string;

  @ApiProperty({
    description: 'Región de respaldo (requerido, lista de países)',
    example: 'Perú',
    enum: [
      'Perú', 'Estados Unidos', 'México', 'Colombia', 'Chile', 'Argentina', 'Brasil',
      'España', 'Francia', 'Alemania', 'Reino Unido', 'Italia', 'Canadá', 'Australia'
    ],
  })
  @IsString({ message: 'La región de respaldo debe ser una cadena de texto' })
  @IsIn([
    'Perú', 'Estados Unidos', 'México', 'Colombia', 'Chile', 'Argentina', 'Brasil',
    'España', 'Francia', 'Alemania', 'Reino Unido', 'Italia', 'Canadá', 'Australia'
  ], { message: 'La región de respaldo debe ser un país válido' })
  regionRespaldo: string;

  @ApiProperty({
    description: 'Sistema de unidades (requerido, Métrico o Imperial)',
    example: 'Métrico',
    enum: ['Métrico', 'Imperial'],
  })
  @IsString({ message: 'El sistema de unidades debe ser una cadena de texto' })
  @IsIn(['Métrico', 'Imperial'], { message: 'El sistema de unidades debe ser "Métrico" o "Imperial"' })
  sistemaUnidades: string;

  @ApiProperty({
    description: 'Unidad de peso (requerido, opciones: kg, g, lb, oz)',
    example: 'kg',
    enum: ['kg', 'g', 'lb', 'oz'],
  })
  @IsString({ message: 'La unidad de peso debe ser una cadena de texto' })
  @IsIn(['kg', 'g', 'lb', 'oz'], { message: 'La unidad de peso debe ser una opción válida' })
  unidadPeso: string;

  @ApiProperty({
    description: 'Zona horaria (requerido, opciones de zonas horarias)',
    example: 'America/Lima',
    enum: [
      'America/Lima', 'America/New_York', 'America/Los_Angeles', 'America/Chicago',
      'America/Mexico_City', 'Europe/London', 'Europe/Paris', 'Europe/Madrid',
      'Asia/Tokyo', 'Australia/Sydney'
    ],
  })
  @IsString({ message: 'La zona horaria debe ser una cadena de texto' })
  @IsIn([
    'America/Lima', 'America/New_York', 'America/Los_Angeles', 'America/Chicago',
    'America/Mexico_City', 'Europe/London', 'Europe/Paris', 'Europe/Madrid',
    'Asia/Tokyo', 'Australia/Sydney'
  ], { message: 'La zona horaria debe ser una opción válida' })
  zonaHoraria: string;

  @ApiPropertyOptional({
    description: 'Prefijo para pedidos (opcional, máximo 5 caracteres)',
    example: 'ORD',
    maxLength: 5,
  })
  @IsOptional()
  @IsString({ message: 'El prefijo de pedido debe ser una cadena de texto' })
  @MaxLength(5, { message: 'El prefijo de pedido no puede exceder 5 caracteres' })
  prefijoPedido?: string;

  @ApiPropertyOptional({
    description: 'Sufijo para pedidos (opcional, máximo 5 caracteres)',
    example: 'TN',
    maxLength: 5,
  })
  @IsOptional()
  @IsString({ message: 'El sufijo de pedido debe ser una cadena de texto' })
  @MaxLength(5, { message: 'El sufijo de pedido no puede exceder 5 caracteres' })
  sufijoPedido?: string;

  @ApiProperty({
    description: 'Procesar pedido automáticamente (requerido, opciones específicas)',
    example: 'Sí - todos los artículos',
    enum: ['Sí - todos los artículos', 'Sí - solo tarjetas de regalo', 'No'],
  })
  @IsString({ message: 'La opción de procesar pedido automáticamente debe ser una cadena de texto' })
  @IsIn(['Sí - todos los artículos', 'Sí - solo tarjetas de regalo', 'No'], {
    message: 'La opción de procesar pedido automáticamente debe ser válida',
  })
  procesarPedidoAutomaticamente: string;

  @ApiPropertyOptional({
    description: 'Archivar pedido automáticamente (opcional)',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'Archivar pedido automáticamente debe ser un valor booleano' })
  archivarPedidoAutomaticamente?: boolean;

  @ApiProperty({
    description: 'Indica si la tienda está en modo mantenimiento',
    example: false,
  })
  @IsBoolean({ message: 'El modo mantenimiento debe ser un valor booleano' })
  mantenimiento: boolean;

  @ApiPropertyOptional({
    description: 'Mensaje de mantenimiento (requerido si mantenimiento es true)',
    example: 'Estamos en mantenimiento, volveremos pronto.',
  })
  @IsOptional()
  @IsString({ message: 'El mensaje de mantenimiento debe ser una cadena de texto' })
  mensajeMantenimiento?: string;

  @ApiPropertyOptional({
    description: 'Términos de servicio de la tienda',
    example: 'Términos de servicio de la tienda',
  })
  @IsOptional()
  @IsString({ message: 'Los términos de servicio deben ser una cadena de texto' })
  terminosServicio?: string;

  @ApiPropertyOptional({
    description: 'Política de privacidad de la tienda',
    example: 'Política de privacidad de la tienda',
  })
  @IsOptional()
  @IsString({ message: 'La política de privacidad debe ser una cadena de texto' })
  politicaPrivacidad?: string;
}

/**
 * DTO principal para crear configuración de tienda
 */
export class CrearConfiguracionTiendaDto {
  @ApiProperty({
    description: 'Nombre de la tienda',
    example: 'Mi Tienda Online',
  })
  @IsString({ message: 'El nombre de la tienda debe ser una cadena de texto' })
  nombreTienda: string;

  @ApiPropertyOptional({
    description: 'Descripción de la tienda',
    example: 'La mejor tienda online para tus compras',
  })
  @IsString({ message: 'La descripción de la tienda debe ser una cadena de texto' })
  @IsOptional()
  descripcionTienda?: string;

  @ApiProperty({ type: MonedaDto })
  @ValidateNested()
  @Type(() => MonedaDto)
  moneda: MonedaDto;

  @ApiProperty({ type: ConfiguracionImpuestosDto })
  @ValidateNested()
  @Type(() => ConfiguracionImpuestosDto)
  impuestos: ConfiguracionImpuestosDto;

  @ApiProperty({ type: DireccionTiendaDto })
  @ValidateNested()
  @Type(() => DireccionTiendaDto)
  direccion: DireccionTiendaDto;

  @ApiProperty({ type: ContactoTiendaDto })
  @ValidateNested()
  @Type(() => ContactoTiendaDto)
  contacto: ContactoTiendaDto;

  @ApiProperty({ type: ConfiguracionEnvioDto })
  @ValidateNested()
  @Type(() => ConfiguracionEnvioDto)
  configuracionEnvio: ConfiguracionEnvioDto;

  @ApiProperty({ type: ConfiguracionPagosDto })
  @ValidateNested()
  @Type(() => ConfiguracionPagosDto)
  configuracionPagos: ConfiguracionPagosDto;

  @ApiProperty({ type: ConfiguracionGeneralDto })
  @ValidateNested()
  @Type(() => ConfiguracionGeneralDto)
  configuracionGeneral: ConfiguracionGeneralDto;

  @ApiProperty({ type: ConfiguracionFacturacionDto })
  @ValidateNested()
  @Type(() => ConfiguracionFacturacionDto)
  configuracionFacturacion: ConfiguracionFacturacionDto;
}

/**
 * DTO para la respuesta de configuración de tienda
 */
export class ConfiguracionTiendaResponseDto {
  @ApiProperty({
    description: 'ID único de la configuración',
    example: 'config_tienda_123456789',
  })
  id: string;

  @ApiProperty({
    description: 'Nombre de la tienda',
    example: 'Mi Tienda Online',
  })
  nombreTienda: string;

  @ApiPropertyOptional({
    description: 'Descripción de la tienda',
    example: 'La mejor tienda online para tus compras',
  })
  descripcionTienda?: string;

  @ApiProperty({ type: MonedaDto })
  moneda: MonedaDto;

  @ApiProperty({ type: ConfiguracionImpuestosDto })
  impuestos: ConfiguracionImpuestosDto;

  @ApiProperty({ type: DireccionTiendaDto })
  direccion: DireccionTiendaDto;

  @ApiProperty({ type: ContactoTiendaDto })
  contacto: ContactoTiendaDto;

  @ApiProperty({ type: ConfiguracionEnvioDto })
  configuracionEnvio: ConfiguracionEnvioDto;

  @ApiProperty({ type: ConfiguracionPagosDto })
  configuracionPagos: ConfiguracionPagosDto;

  @ApiProperty({ type: ConfiguracionGeneralDto })
  configuracionGeneral: ConfiguracionGeneralDto;

  @ApiProperty({ type: ConfiguracionFacturacionDto })
  configuracionFacturacion: ConfiguracionFacturacionDto;

  @ApiProperty({
    description: 'Fecha de creación de la configuración',
    example: '2024-01-01T10:30:00.000Z',
  })
  fechaCreacion: Date;

  @ApiProperty({
    description: 'Fecha de última actualización de la configuración',
    example: '2024-01-01T10:30:00.000Z',
  })
  fechaActualizacion: Date;

  @ApiProperty({
    description: 'Indica si esta es la configuración activa',
    example: true,
  })
  activa: boolean;
}

/**
 * DTO para listar configuraciones de tienda
 */
export class ListarConfiguracionesDto {
  @ApiPropertyOptional({
    description: 'Número de página (por defecto: 1)',
    minimum: 1,
    example: 1,
  })
  @IsNumber({}, { message: 'La página debe ser un número' })
  @Min(1, { message: 'La página mínima es 1' })
  @IsOptional()
  @Type(() => Number)
  pagina?: number = 1;

  @ApiPropertyOptional({
    description: 'Límite de elementos por página (por defecto: 20, máximo: 100)',
    minimum: 1,
    maximum: 100,
    example: 20,
  })
  @IsNumber({}, { message: 'El límite debe ser un número' })
  @Min(1, { message: 'El límite mínimo es 1' })
  @Max(100, { message: 'El límite máximo es 100' })
  @IsOptional()
  @Type(() => Number)
  limite?: number = 20;
}

/**
 * DTO para la respuesta de listado de configuraciones
 */
export class ListaConfiguracionesResponseDto {
  @ApiProperty({
    description: 'Lista de configuraciones',
    type: [ConfiguracionTiendaResponseDto],
  })
  elementos: ConfiguracionTiendaResponseDto[];

  @ApiProperty({
    description: 'Información de paginación',
    type: Object,
    example: {
      total_elementos: 50,
      total_paginas: 5,
      pagina_actual: 1,
      limite: 10,
      tiene_siguiente: true,
      tiene_anterior: false,
    },
  })
  paginacion: {
    total_elementos: number;
    total_paginas: number;
    pagina_actual: number;
    limite: number;
    tiene_siguiente: boolean;
    tiene_anterior: boolean;
  };
}

/**
 * DTO para estadísticas de configuraciones
 */
export class EstadisticasConfiguracionesResponseDto {
  @ApiProperty({
    description: 'Total de configuraciones creadas',
    example: 15,
  })
  totalConfiguraciones: number;

  @ApiProperty({
    description: 'Nombre de la configuración activa',
    example: 'Configuración Principal',
  })
  configuracionActiva: string;

  @ApiProperty({
    description: 'Fecha de última actualización',
    example: '2024-01-01T10:30:00.000Z',
  })
  ultimaActualizacion: Date;
}