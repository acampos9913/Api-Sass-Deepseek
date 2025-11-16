import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEnum, IsBoolean, IsDate, IsArray, IsOptional, IsEmail, IsUrl, ValidateNested, IsNumber, Min, Max, ArrayNotEmpty, ArrayUnique } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Enums para la configuración de aplicaciones y canales de venta
 */

export enum TipoAppEnum {
  TIENDA_ONLINE = 'tienda_online',
  FLUJO_TRABAJO = 'flujo_trabajo',
  LANDING_PAGE = 'landing_page',
  PUNTO_VENTA = 'punto_venta',
  MARKETING = 'marketing',
  ANALYTICS = 'analytics',
  INVENTARIO = 'inventario',
  ENVIO = 'envio',
  PAGOS = 'pagos',
  CLIENTES = 'clientes',
  OTRO = 'otro',
}

export enum TipoCanalEnum {
  TIENDA_ONLINE = 'tienda_online',
  POS = 'pos',
  APP_EXTERNA = 'app_externa',
  MARKETPLACE = 'marketplace',
  REDES_SOCIALES = 'redes_sociales',
  WHATSAPP = 'whatsapp',
  FACEBOOK = 'facebook',
  INSTAGRAM = 'instagram',
  TIKTOK = 'tiktok',
  GOOGLE_SHOPPING = 'google_shopping',
  AMAZON = 'amazon',
  MERCADO_LIBRE = 'mercado_libre',
  OTRO = 'otro',
}

export enum EstadoAppEnum {
  EN_DESARROLLO = 'en_desarrollo',
  PUBLICADA = 'publicada',
  ARCHIVADA = 'archivada',
  SUSPENDIDA = 'suspendida',
}

export enum EstadoRevisionEnum {
  PENDIENTE = 'pendiente',
  APROBADO = 'aprobado',
  RECHAZADO = 'rechazado',
}

export enum EstadoCanalEnum {
  ACTIVO = 'activo',
  INACTIVO = 'inactivo',
  EN_PRUEBAS = 'en_pruebas',
  SUSPENDIDO = 'suspendido',
}

/**
 * DTOs para aplicaciones instaladas
 */

export class AppInstaladaDto {
  @ApiProperty({ description: 'ID único de la aplicación instalada', example: 'app-123' })
  @IsNotEmpty({ message: 'El ID de la aplicación es requerido' })
  @IsString({ message: 'El ID de la aplicación debe ser una cadena de texto' })
  id: string;

  @ApiProperty({ description: 'Nombre de la aplicación', example: 'Shopify Analytics Pro' })
  @IsNotEmpty({ message: 'El nombre de la aplicación es requerido' })
  @IsString({ message: 'El nombre de la aplicación debe ser una cadena de texto' })
  nombre_app: string;

  @ApiProperty({ enum: TipoAppEnum, description: 'Tipo de aplicación', example: 'analytics' })
  @IsNotEmpty({ message: 'El tipo de aplicación es requerido' })
  @IsEnum(TipoAppEnum, { message: 'El tipo de aplicación debe ser un valor válido' })
  tipo_app: TipoAppEnum;

  @ApiProperty({ description: 'Estado de instalación', example: true })
  @IsBoolean({ message: 'El estado de instalación debe ser un valor booleano' })
  instalada: boolean;

  @ApiProperty({ description: 'Fecha de instalación', example: '2024-01-15T00:00:00.000Z' })
  @IsDate({ message: 'La fecha de instalación debe ser una fecha válida' })
  @Type(() => Date)
  fecha_instalacion: Date;

  @ApiProperty({ description: 'Versión de la aplicación', example: '1.2.3' })
  @IsOptional()
  @IsString({ message: 'La versión de la aplicación debe ser una cadena de texto' })
  version_app?: string;

  @ApiProperty({ 
    description: 'Permisos concedidos', 
    example: ['read_products', 'write_orders'],
    type: [String]
  })
  @IsArray({ message: 'Los permisos deben ser un array' })
  @IsString({ each: true, message: 'Cada permiso debe ser una cadena de texto' })
  permisos: string[];

  @ApiProperty({ description: 'Token de acceso de la aplicación', example: 'token-secreto-123' })
  @IsOptional()
  @IsString({ message: 'El token de acceso debe ser una cadena de texto' })
  token_acceso?: string;

  @ApiProperty({ description: 'URL de configuración de la aplicación', example: 'https://app.example.com/config' })
  @IsOptional()
  @IsUrl({}, { message: 'La URL de configuración debe ser una URL válida' })
  url_configuracion?: string;

  @ApiProperty({ description: 'Fecha de última actualización', example: '2024-01-20T00:00:00.000Z' })
  @IsOptional()
  @IsDate({ message: 'La fecha de última actualización debe ser una fecha válida' })
  @Type(() => Date)
  fecha_actualizacion?: Date;
}

export class CrearAppInstaladaDto {
  @ApiProperty({ description: 'Nombre de la aplicación', example: 'Shopify Analytics Pro' })
  @IsNotEmpty({ message: 'El nombre de la aplicación es requerido' })
  @IsString({ message: 'El nombre de la aplicación debe ser una cadena de texto' })
  nombre_app: string;

  @ApiProperty({ enum: TipoAppEnum, description: 'Tipo de aplicación', example: 'analytics' })
  @IsNotEmpty({ message: 'El tipo de aplicación es requerido' })
  @IsEnum(TipoAppEnum, { message: 'El tipo de aplicación debe ser un valor válido' })
  tipo_app: TipoAppEnum;

  @ApiProperty({ description: 'Versión de la aplicación', example: '1.2.3' })
  @IsOptional()
  @IsString({ message: 'La versión de la aplicación debe ser una cadena de texto' })
  version_app?: string;

  @ApiProperty({ 
    description: 'Permisos concedidos', 
    example: ['read_products', 'write_orders'],
    type: [String]
  })
  @IsArray({ message: 'Los permisos deben ser un array' })
  @IsString({ each: true, message: 'Cada permiso debe ser una cadena de texto' })
  @ArrayNotEmpty({ message: 'Debe proporcionar al menos un permiso' })
  permisos: string[];

  @ApiProperty({ description: 'Token de acceso de la aplicación', example: 'token-secreto-123' })
  @IsOptional()
  @IsString({ message: 'El token de acceso debe ser una cadena de texto' })
  token_acceso?: string;

  @ApiProperty({ description: 'URL de configuración de la aplicación', example: 'https://app.example.com/config' })
  @IsOptional()
  @IsUrl({}, { message: 'La URL de configuración debe ser una URL válida' })
  url_configuracion?: string;
}

export class ActualizarAppInstaladaDto {
  @ApiProperty({ description: 'Nombre de la aplicación', example: 'Shopify Analytics Pro' })
  @IsOptional()
  @IsString({ message: 'El nombre de la aplicación debe ser una cadena de texto' })
  nombre_app?: string;

  @ApiProperty({ enum: TipoAppEnum, description: 'Tipo de aplicación', example: 'analytics' })
  @IsOptional()
  @IsEnum(TipoAppEnum, { message: 'El tipo de aplicación debe ser un valor válido' })
  tipo_app?: TipoAppEnum;

  @ApiProperty({ description: 'Estado de instalación', example: true })
  @IsOptional()
  @IsBoolean({ message: 'El estado de instalación debe ser un valor booleano' })
  instalada?: boolean;

  @ApiProperty({ description: 'Versión de la aplicación', example: '1.2.3' })
  @IsOptional()
  @IsString({ message: 'La versión de la aplicación debe ser una cadena de texto' })
  version_app?: string;

  @ApiProperty({ 
    description: 'Permisos concedidos', 
    example: ['read_products', 'write_orders'],
    type: [String]
  })
  @IsOptional()
  @IsArray({ message: 'Los permisos deben ser un array' })
  @IsString({ each: true, message: 'Cada permiso debe ser una cadena de texto' })
  permisos?: string[];

  @ApiProperty({ description: 'Token de acceso de la aplicación', example: 'token-secreto-123' })
  @IsOptional()
  @IsString({ message: 'El token de acceso debe ser una cadena de texto' })
  token_acceso?: string;

  @ApiProperty({ description: 'URL de configuración de la aplicación', example: 'https://app.example.com/config' })
  @IsOptional()
  @IsUrl({}, { message: 'La URL de configuración debe ser una URL válida' })
  url_configuracion?: string;
}

/**
 * DTOs para canales de venta
 */

export class CanalVentaDto {
  @ApiProperty({ description: 'ID único del canal de venta', example: 'canal-123' })
  @IsNotEmpty({ message: 'El ID del canal es requerido' })
  @IsString({ message: 'El ID del canal debe ser una cadena de texto' })
  id: string;

  @ApiProperty({ description: 'Nombre del canal', example: 'Tienda Online Principal' })
  @IsNotEmpty({ message: 'El nombre del canal es requerido' })
  @IsString({ message: 'El nombre del canal debe ser una cadena de texto' })
  nombre_canal: string;

  @ApiProperty({ description: 'URL del canal', example: 'https://tienda.example.com' })
  @IsOptional()
  @IsUrl({}, { message: 'La URL del canal debe ser una URL válida' })
  url_canal?: string;

  @ApiProperty({ description: 'Estado del canal', example: true })
  @IsBoolean({ message: 'El estado del canal debe ser un valor booleano' })
  activo: boolean;

  @ApiProperty({ enum: TipoCanalEnum, description: 'Tipo de canal', example: 'tienda_online' })
  @IsNotEmpty({ message: 'El tipo de canal es requerido' })
  @IsEnum(TipoCanalEnum, { message: 'El tipo de canal debe ser un valor válido' })
  tipo_canal: TipoCanalEnum;

  @ApiProperty({ description: 'Configuración específica del canal', example: { api_key: 'key-123' } })
  @IsOptional()
  configuracion?: any;

  @ApiProperty({ description: 'Fecha de creación del canal', example: '2024-01-15T00:00:00.000Z' })
  @IsDate({ message: 'La fecha de creación debe ser una fecha válida' })
  @Type(() => Date)
  fecha_creacion: Date;

  @ApiProperty({ description: 'Fecha de última actualización', example: '2024-01-20T00:00:00.000Z' })
  @IsOptional()
  @IsDate({ message: 'La fecha de última actualización debe ser una fecha válida' })
  @Type(() => Date)
  fecha_actualizacion?: Date;
}

export class CrearCanalVentaDto {
  @ApiProperty({ description: 'Nombre del canal', example: 'Tienda Online Principal' })
  @IsNotEmpty({ message: 'El nombre del canal es requerido' })
  @IsString({ message: 'El nombre del canal debe ser una cadena de texto' })
  nombre_canal: string;

  @ApiProperty({ description: 'URL del canal', example: 'https://tienda.example.com' })
  @IsOptional()
  @IsUrl({}, { message: 'La URL del canal debe ser una URL válida' })
  url_canal?: string;

  @ApiProperty({ enum: TipoCanalEnum, description: 'Tipo de canal', example: 'tienda_online' })
  @IsNotEmpty({ message: 'El tipo de canal es requerido' })
  @IsEnum(TipoCanalEnum, { message: 'El tipo de canal debe ser un valor válido' })
  tipo_canal: TipoCanalEnum;

  @ApiProperty({ description: 'Configuración específica del canal', example: { api_key: 'key-123' } })
  @IsOptional()
  configuracion?: any;
}

export class ActualizarCanalVentaDto {
  @ApiProperty({ description: 'Nombre del canal', example: 'Tienda Online Principal' })
  @IsOptional()
  @IsString({ message: 'El nombre del canal debe ser una cadena de texto' })
  nombre_canal?: string;

  @ApiProperty({ description: 'URL del canal', example: 'https://tienda.example.com' })
  @IsOptional()
  @IsUrl({}, { message: 'La URL del canal debe ser una URL válida' })
  url_canal?: string;

  @ApiProperty({ description: 'Estado del canal', example: true })
  @IsOptional()
  @IsBoolean({ message: 'El estado del canal debe ser un valor booleano' })
  activo?: boolean;

  @ApiProperty({ enum: TipoCanalEnum, description: 'Tipo de canal', example: 'tienda_online' })
  @IsOptional()
  @IsEnum(TipoCanalEnum, { message: 'El tipo de canal debe ser un valor válido' })
  tipo_canal?: TipoCanalEnum;

  @ApiProperty({ description: 'Configuración específica del canal', example: { api_key: 'key-123' } })
  @IsOptional()
  configuracion?: any;
}

/**
 * DTOs para apps en desarrollo
 */

export class AppDesarrolloDto {
  @ApiProperty({ description: 'ID único de la app en desarrollo', example: 'dev-app-123' })
  @IsNotEmpty({ message: 'El ID de la app en desarrollo es requerido' })
  @IsString({ message: 'El ID de la app en desarrollo debe ser una cadena de texto' })
  id: string;

  @ApiProperty({ description: 'Nombre de la app', example: 'Mi App Personalizada' })
  @IsNotEmpty({ message: 'El nombre de la app es requerido' })
  @IsString({ message: 'El nombre de la app debe ser una cadena de texto' })
  nombre_app: string;

  @ApiProperty({ enum: EstadoAppEnum, description: 'Estado de desarrollo', example: 'en_desarrollo' })
  @IsNotEmpty({ message: 'El estado de desarrollo es requerido' })
  @IsEnum(EstadoAppEnum, { message: 'El estado de desarrollo debe ser un valor válido' })
  estado: EstadoAppEnum;

  @ApiProperty({ description: 'Fecha de creación', example: '2024-01-15T00:00:00.000Z' })
  @IsDate({ message: 'La fecha de creación debe ser una fecha válida' })
  @Type(() => Date)
  fecha_creacion: Date;

  @ApiProperty({ description: 'Token de desarrollo', example: 'dev-token-secreto-123' })
  @IsNotEmpty({ message: 'El token de desarrollo es requerido' })
  @IsString({ message: 'El token de desarrollo debe ser una cadena de texto' })
  token_dev: string;

  @ApiProperty({ description: 'Usuario responsable', example: 'desarrollador@empresa.com' })
  @IsNotEmpty({ message: 'El usuario responsable es requerido' })
  @IsEmail({}, { message: 'El usuario responsable debe ser un email válido' })
  responsable: string;

  @ApiProperty({ 
    description: 'Ámbito/áreas de la app', 
    example: ['read_products', 'write_orders'],
    type: [String]
  })
  @IsArray({ message: 'Los ámbitos deben ser un array' })
  @IsString({ each: true, message: 'Cada ámbito debe ser una cadena de texto' })
  scopes: string[];

  @ApiProperty({ description: 'Versión de la app', example: '1.0.0' })
  @IsOptional()
  @IsString({ message: 'La versión de la app debe ser una cadena de texto' })
  version?: string;

  @ApiProperty({ description: 'Entorno de pruebas activo', example: true })
  @IsBoolean({ message: 'El entorno de pruebas debe ser un valor booleano' })
  sandbox: boolean;

  @ApiProperty({ description: 'Endpoint de desarrollo', example: 'https://dev-api.example.com' })
  @IsOptional()
  @IsUrl({}, { message: 'El endpoint de desarrollo debe ser una URL válida' })
  dev_endpoint?: string;

  @ApiProperty({ description: 'Webhooks para notificaciones de errores', example: 'https://webhook.example.com/errors' })
  @IsOptional()
  @IsUrl({}, { message: 'El webhook de errores debe ser una URL válida' })
  webhooks_errores?: string;

  @ApiProperty({ description: 'Variables de entorno', example: { API_KEY: 'key-123', DB_URL: 'postgresql://...' } })
  @IsOptional()
  env_vars?: any;

  @ApiProperty({ enum: EstadoRevisionEnum, description: 'Estado de revisión', example: 'pendiente' })
  @IsOptional()
  @IsEnum(EstadoRevisionEnum, { message: 'El estado de revisión debe ser un valor válido' })
  revision_estado?: EstadoRevisionEnum;

  @ApiProperty({ description: 'Notas de revisión', example: 'Se requiere ajustar los permisos de acceso' })
  @IsOptional()
  @IsString({ message: 'Las notas de revisión deben ser una cadena de texto' })
  notas_revision?: string;

  @ApiProperty({ description: 'Fecha de publicación', example: '2024-02-01T00:00:00.000Z' })
  @IsOptional()
  @IsDate({ message: 'La fecha de publicación debe ser una fecha válida' })
  @Type(() => Date)
  fecha_publicacion?: Date;

  @ApiProperty({ description: 'Fecha de última actualización', example: '2024-01-20T00:00:00.000Z' })
  @IsOptional()
  @IsDate({ message: 'La fecha de última actualización debe ser una fecha válida' })
  @Type(() => Date)
  fecha_actualizacion?: Date;
}

export class CrearAppDesarrolloDto {
  @ApiProperty({ description: 'Nombre de la app', example: 'Mi App Personalizada' })
  @IsNotEmpty({ message: 'El nombre de la app es requerido' })
  @IsString({ message: 'El nombre de la app debe ser una cadena de texto' })
  nombre_app: string;

  @ApiProperty({ enum: EstadoAppEnum, description: 'Estado de desarrollo', example: 'en_desarrollo' })
  @IsNotEmpty({ message: 'El estado de desarrollo es requerido' })
  @IsEnum(EstadoAppEnum, { message: 'El estado de desarrollo debe ser un valor válido' })
  estado: EstadoAppEnum;

  @ApiProperty({ description: 'Token de desarrollo', example: 'dev-token-secreto-123' })
  @IsNotEmpty({ message: 'El token de desarrollo es requerido' })
  @IsString({ message: 'El token de desarrollo debe ser una cadena de texto' })
  token_dev: string;

  @ApiProperty({ description: 'Usuario responsable', example: 'desarrollador@empresa.com' })
  @IsNotEmpty({ message: 'El usuario responsable es requerido' })
  @IsEmail({}, { message: 'El usuario responsable debe ser un email válido' })
  responsable: string;

  @ApiProperty({ 
    description: 'Ámbito/áreas de la app', 
    example: ['read_products', 'write_orders'],
    type: [String]
  })
  @IsArray({ message: 'Los ámbitos deben ser un array' })
  @IsString({ each: true, message: 'Cada ámbito debe ser una cadena de texto' })
  @ArrayNotEmpty({ message: 'Debe proporcionar al menos un ámbito' })
  scopes: string[];

  @ApiProperty({ description: 'Versión de la app', example: '1.0.0' })
  @IsOptional()
  @IsString({ message: 'La versión de la app debe ser una cadena de texto' })
  version?: string;

  @ApiProperty({ description: 'Entorno de pruebas activo', example: true })
  @IsBoolean({ message: 'El entorno de pruebas debe ser un valor booleano' })
  sandbox: boolean;

  @ApiProperty({ description: 'Endpoint de desarrollo', example: 'https://dev-api.example.com' })
  @IsOptional()
  @IsUrl({}, { message: 'El endpoint de desarrollo debe ser una URL válida' })
  dev_endpoint?: string;

  @ApiProperty({ description: 'Webhooks para notificaciones de errores', example: 'https://webhook.example.com/errors' })
  @IsOptional()
  @IsUrl({}, { message: 'El webhook de errores debe ser una URL válida' })
  webhooks_errores?: string;

  @ApiProperty({ description: 'Variables de entorno', example: { API_KEY: 'key-123', DB_URL: 'postgresql://...' } })
  @IsOptional()
  env_vars?: any;
}

export class ActualizarAppDesarrolloDto {
  @ApiProperty({ description: 'Nombre de la app', example: 'Mi App Personalizada' })
  @IsOptional()
  @IsString({ message: 'El nombre de la app debe ser una cadena de texto' })
  nombre_app?: string;

  @ApiProperty({ enum: EstadoAppEnum, description: 'Estado de desarrollo', example: 'en_desarrollo' })
  @IsOptional()
  @IsEnum(EstadoAppEnum, { message: 'El estado de desarrollo debe ser un valor válido' })
  estado?: EstadoAppEnum;

  @ApiProperty({ description: 'Token de desarrollo', example: 'dev-token-secreto-123' })
  @IsOptional()
  @IsString({ message: 'El token de desarrollo debe ser una cadena de texto' })
  token_dev?: string;

  @ApiProperty({ description: 'Usuario responsable', example: 'desarrollador@empresa.com' })
  @IsOptional()
  @IsEmail({}, { message: 'El usuario responsable debe ser un email válido' })
  responsable?: string;

  @ApiProperty({ 
    description: 'Ámbito/áreas de la app', 
    example: ['read_products', 'write_orders'],
    type: [String]
  })
  @IsOptional()
  @IsArray({ message: 'Los ámbitos deben ser un array' })
  @IsString({ each: true, message: 'Cada ámbito debe ser una cadena de texto' })
  scopes?: string[];

  @ApiProperty({ description: 'Versión de la app', example: '1.0.0' })
  @IsOptional()
  @IsString({ message: 'La versión de la app debe ser una cadena de texto' })
  version?: string;

  @ApiProperty({ description: 'Entorno de pruebas activo', example: true })
  @IsOptional()
  @IsBoolean({ message: 'El entorno de pruebas debe ser un valor booleano' })
  sandbox?: boolean;

  @ApiProperty({ description: 'Endpoint de desarrollo', example: 'https://dev-api.example.com' })
  @IsOptional()
  @IsUrl({}, { message: 'El endpoint de desarrollo debe ser una URL válida' })
  dev_endpoint?: string;

  @ApiProperty({ description: 'Webhooks para notificaciones de errores', example: 'https://webhook.example.com/errors' })
  @IsOptional()
  @IsUrl({}, { message: 'El webhook de errores debe ser una URL válida' })
  webhooks_errores?: string;

  @ApiProperty({ description: 'Variables de entorno', example: { API_KEY: 'key-123', DB_URL: 'postgresql://...' } })
  @IsOptional()
  env_vars?: any;

  @ApiProperty({ enum: EstadoRevisionEnum, description: 'Estado de revisión', example: 'pendiente' })
  @IsOptional()
  @IsEnum(EstadoRevisionEnum, { message: 'El estado de revisión debe ser un valor válido' })
  revision_estado?: EstadoRevisionEnum;

  @ApiProperty({ description: 'Notas de revisión', example: 'Se requiere ajustar los permisos de acceso' })
  @IsOptional()
  @IsString({ message: 'Las notas de revisión deben ser una cadena de texto' })
  notas_revision?: string;

  @ApiProperty({ description: 'Fecha de publicación', example: '2024-02-01T00:00:00.000Z' })
  @IsOptional()
  @IsDate({ message: 'La fecha de publicación debe ser una fecha válida' })
  @Type(() => Date)
  fecha_publicacion?: Date;
}

/**
 * DTOs para apps desinstaladas/inactivas
 */

export class AppDesinstaladaDto {
  @ApiProperty({ description: 'ID único de la app desinstalada', example: 'uninstalled-app-123' })
  @IsNotEmpty({ message: 'El ID de la app desinstalada es requerido' })
  @IsString({ message: 'El ID de la app desinstalada debe ser una cadena de texto' })
  id: string;

  @ApiProperty({ description: 'Nombre de la app', example: 'App Descontinuada' })
  @IsNotEmpty({ message: 'El nombre de la app es requerido' })
  @IsString({ message: 'El nombre de la app debe ser una cadena de texto' })
  nombre_app: string;

  @ApiProperty({ description: 'Motivo de desinstalación', example: 'La app ya no es compatible' })
  @IsOptional()
  @IsString({ message: 'El motivo de desinstalación debe ser una cadena de texto' })
  motivo_desinstalacion?: string;

  @ApiProperty({ description: 'Fecha de desinstalación', example: '2024-01-15T00:00:00.000Z' })
  @IsDate({ message: 'La fecha de desinstalación debe ser una fecha válida' })
  @Type(() => Date)
  fecha_desinstalacion: Date;

  @ApiProperty({ description: 'Datos de la app antes de desinstalar', example: { permisos: ['read_products'], version: '1.0.0' } })
  @IsOptional()
  datos_anteriores?: any;

  @ApiProperty({ description: 'Fecha de última actualización', example: '2024-01-20T00:00:00.000Z' })
  @IsOptional()
  @IsDate({ message: 'La fecha de última actualización debe ser una fecha válida' })
  @Type(() => Date)
  fecha_actualizacion?: Date;
}

export class CrearAppDesinstaladaDto {
  @ApiProperty({ description: 'Nombre de la app', example: 'App Descontinuada' })
  @IsNotEmpty({ message: 'El nombre de la app es requerido' })
  @IsString({ message: 'El nombre de la app debe ser una cadena de texto' })
  nombre_app: string;

  @ApiProperty({ description: 'Motivo de desinstalación', example: 'La app ya no es compatible' })
  @IsOptional()
  @IsString({ message: 'El motivo de desinstalación debe ser una cadena de texto' })
  motivo_desinstalacion?: string;

  @ApiProperty({ description: 'Datos de la app antes de desinstalar', example: { permisos: ['read_products'], version: '1.0.0' } })
  @IsOptional()
  datos_anteriores?: any;
}

/**
 * DTO principal para la configuración completa de aplicaciones y canales de venta
 */

export class ConfiguracionAplicacionesCanalesVentaDto {
  @ApiProperty({ description: 'ID único de la configuración', example: 'config-apps-123' })
  @IsNotEmpty({ message: 'El ID de la configuración es requerido' })
  @IsString({ message: 'El ID de la configuración debe ser una cadena de texto' })
  id: string;

  @ApiProperty({ description: 'ID de la tienda', example: 'tienda-123' })
  @IsNotEmpty({ message: 'El ID de la tienda es requerido' })
  @IsString({ message: 'El ID de la tienda debe ser una cadena de texto' })
  tienda_id: string;

  @ApiProperty({ 
    description: 'Aplicaciones instaladas', 
    type: [AppInstaladaDto] 
  })
  @IsArray({ message: 'Las aplicaciones instaladas deben ser un array' })
  @ValidateNested({ each: true })
  @Type(() => AppInstaladaDto)
  apps_instaladas: AppInstaladaDto[];

  @ApiProperty({ 
    description: 'Canales de venta', 
    type: [CanalVentaDto] 
  })
  @IsArray({ message: 'Los canales de venta deben ser un array' })
  @ValidateNested({ each: true })
  @Type(() => CanalVentaDto)
  canales_venta: CanalVentaDto[];

  @ApiProperty({ 
    description: 'Apps en desarrollo', 
    type: [AppDesarrolloDto] 
  })
  @IsArray({ message: 'Las apps en desarrollo deben ser un array' })
  @ValidateNested({ each: true })
  @Type(() => AppDesarrolloDto)
  apps_desarrollo: AppDesarrolloDto[];

  @ApiProperty({ 
    description: 'Apps desinstaladas', 
    type: [AppDesinstaladaDto] 
  })
  @IsArray({ message: 'Las apps desinstaladas deben ser un array' })
  @ValidateNested({ each: true })
  @Type(() => AppDesinstaladaDto)
  apps_desinstaladas: AppDesinstaladaDto[];

  @ApiProperty({ description: 'Fecha de creación', example: '2024-01-15T00:00:00.000Z' })
  @IsDate({ message: 'La fecha de creación debe ser una fecha válida' })
  @Type(() => Date)
  fecha_creacion: Date;

  @ApiProperty({ description: 'Fecha de última actualización', example: '2024-01-20T00:00:00.000Z' })
  @IsOptional()
  @IsDate({ message: 'La fecha de última actualización debe ser una fecha válida' })
  @Type(() => Date)
  fecha_actualizacion?: Date;
}

export class CrearConfiguracionAplicacionesCanalesVentaDto {
  @ApiProperty({ 
    description: 'Aplicaciones instaladas', 
    type: [CrearAppInstaladaDto] 
  })
  @IsOptional()
  @IsArray({ message: 'Las aplicaciones instaladas deben ser un array' })
  @ValidateNested({ each: true })
  @Type(() => CrearAppInstaladaDto)
  apps_instaladas?: CrearAppInstaladaDto[];

  @ApiProperty({ 
    description: 'Canales de venta', 
    type: [CrearCanalVentaDto] 
  })
  @IsOptional()
  @IsArray({ message: 'Los canales de venta deben ser un array' })
  @ValidateNested({ each: true })
  @Type(() => CrearCanalVentaDto)
  canales_venta?: CrearCanalVentaDto[];

  @ApiProperty({ 
    description: 'Apps en desarrollo', 
    type: [CrearAppDesarrolloDto] 
  })
  @IsOptional()
  @IsArray({ message: 'Las apps en desarrollo deben ser un array' })
  @ValidateNested({ each: true })
  @Type(() => CrearAppDesarrolloDto)
  apps_desarrollo?: CrearAppDesarrolloDto[];

  @ApiProperty({ 
    description: 'Apps desinstaladas', 
    type: [CrearAppDesinstaladaDto] 
  })
  @IsOptional()
  @IsArray({ message: 'Las apps desinstaladas deben ser un array' })
  @ValidateNested({ each: true })
  @Type(() => CrearAppDesinstaladaDto)
  apps_desinstaladas?: CrearAppDesinstaladaDto[];
}

export class ActualizarConfiguracionAplicacionesCanalesVentaDto {
  @ApiProperty({ 
    description: 'Aplicaciones instaladas', 
    type: [ActualizarAppInstaladaDto] 
  })
  @IsOptional()
  @IsArray({ message: 'Las aplicaciones instaladas deben ser un array' })
  @ValidateNested({ each: true })
  @Type(() => ActualizarAppInstaladaDto)
  apps_instaladas?: ActualizarAppInstaladaDto[];

  @ApiProperty({ 
    description: 'Canales de venta', 
    type: [ActualizarCanalVentaDto] 
  })
  @IsOptional()
  @IsArray({ message: 'Los canales de venta deben ser un array' })
  @ValidateNested({ each: true })
  @Type(() => ActualizarCanalVentaDto)
  canales_venta?: ActualizarCanalVentaDto[];

  @ApiProperty({ 
    description: 'Apps en desarrollo', 
    type: [ActualizarAppDesarrolloDto] 
  })
  @IsOptional()
  @IsArray({ message: 'Las apps en desarrollo deben ser un array' })
  @ValidateNested({ each: true })
  @Type(() => ActualizarAppDesarrolloDto)
  apps_desarrollo?: ActualizarAppDesarrolloDto[];

  @ApiProperty({ 
    description: 'Apps desinstaladas', 
    type: [CrearAppDesinstaladaDto] 
  })
  @IsOptional()
  @IsArray({ message: 'Las apps desinstaladas deben ser un array' })
  @ValidateNested({ each: true })
  @Type(() => CrearAppDesinstaladaDto)
  apps_desinstaladas?: CrearAppDesinstaladaDto[];
}