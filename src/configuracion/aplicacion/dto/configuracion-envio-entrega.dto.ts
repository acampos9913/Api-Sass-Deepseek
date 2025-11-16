import { ApiProperty } from '@nestjs/swagger';
import { 
  IsArray, 
  IsBoolean, 
  IsEnum, 
  IsNotEmpty, 
  IsNumber, 
  IsObject, 
  IsOptional, 
  IsString, 
  ValidateNested,
  Min,
  Max,
  IsUrl
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Enums para configuración de envío y entrega
 */
export enum TipoEntregaEnum {
  ENVIO_NACIONAL = 'envio_nacional',
  ENVIO_INTERNACIONAL = 'envio_internacional',
  ENTREGA_LOCAL = 'entrega_local',
  RETIRO_EN_TIENDA = 'retiro_en_tienda'
}

export enum TipoTarifaEnum {
  FIJA = 'fija',
  CALCULADA = 'calculada',
  GRATUITA = 'gratuita'
}

export enum TipoEmbalajeEnum {
  CAJA = 'caja',
  SOBRE = 'sobre',
  PAQUETE = 'paquete',
  TUBO = 'tubo'
}

/**
 * DTO para zona de envío
 */
export class ZonaEnvioDto {
  @ApiProperty({ description: 'País de la zona de envío', example: 'Perú' })
  @IsNotEmpty({ message: 'El país es requerido' })
  @IsString({ message: 'El país debe ser una cadena de texto' })
  pais: string;

  @ApiProperty({ description: 'Región de la zona de envío', example: 'Lima' })
  @IsOptional()
  @IsString({ message: 'La región debe ser una cadena de texto' })
  region?: string;

  @ApiProperty({ description: 'Códigos postales de la zona', example: ['15001', '15002'] })
  @IsArray({ message: 'Los códigos postales deben ser un array' })
  @IsString({ each: true, message: 'Cada código postal debe ser una cadena de texto' })
  codigos_postales: string[];
}

/**
 * DTO para tarifas de envío
 */
export class TarifaEnvioDto {
  @ApiProperty({ description: 'Tipo de tarifa', enum: TipoTarifaEnum, example: 'fija' })
  @IsNotEmpty({ message: 'El tipo de tarifa es requerido' })
  @IsEnum(TipoTarifaEnum, { message: 'El tipo de tarifa debe ser "fija", "calculada" o "gratuita"' })
  tipo: TipoTarifaEnum;

  @ApiProperty({ description: 'Monto de la tarifa (para tipo fija)', example: 15.50 })
  @IsOptional()
  @IsNumber({}, { message: 'El monto debe ser un número' })
  @Min(0, { message: 'El monto no puede ser negativo' })
  monto?: number;

  @ApiProperty({ description: 'Condiciones para tarifas calculadas', example: { peso_maximo: 5, precio_base: 10 } })
  @IsOptional()
  @IsObject({ message: 'Las condiciones deben ser un objeto' })
  condiciones?: Record<string, any>;
}

/**
 * DTO para perfil de envío
 */
export class PerfilEnvioDto {
  @ApiProperty({ description: 'ID del perfil', example: 'perfil-123' })
  @IsNotEmpty({ message: 'El ID del perfil es requerido' })
  @IsString({ message: 'El ID debe ser una cadena de texto' })
  id: string;

  @ApiProperty({ description: 'Nombre del perfil de envío', example: 'Envío Express' })
  @IsNotEmpty({ message: 'El nombre del perfil es requerido' })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  nombre_perfil: string;

  @ApiProperty({ description: 'Zonas de envío del perfil', type: [ZonaEnvioDto] })
  @IsArray({ message: 'Las zonas de envío deben ser un array' })
  @ValidateNested({ each: true })
  @Type(() => ZonaEnvioDto)
  zonas_envio: ZonaEnvioDto[];

  @ApiProperty({ description: 'Tarifas del perfil', type: [TarifaEnvioDto] })
  @IsArray({ message: 'Las tarifas deben ser un array' })
  @ValidateNested({ each: true })
  @Type(() => TarifaEnvioDto)
  tarifas: TarifaEnvioDto[];

  @ApiProperty({ description: 'IDs de productos aplicados', example: ['prod-123', 'prod-456'] })
  @IsArray({ message: 'Los productos aplicados deben ser un array' })
  @IsString({ each: true, message: 'Cada ID de producto debe ser una cadena de texto' })
  productos: string[];

  @ApiProperty({ description: 'Fecha de creación del perfil', example: '2024-01-01T00:00:00.000Z' })
  @IsNotEmpty({ message: 'La fecha de creación es requerida' })
  fecha_creacion: Date;

  @ApiProperty({ description: 'Fecha de actualización del perfil', example: '2024-01-01T00:00:00.000Z' })
  @IsNotEmpty({ message: 'La fecha de actualización es requerida' })
  fecha_actualizacion: Date;
}

/**
 * DTO para método de entrega
 */
export class MetodoEntregaDto {
  @ApiProperty({ description: 'ID del método de entrega', example: 'metodo-123' })
  @IsNotEmpty({ message: 'El ID del método es requerido' })
  @IsString({ message: 'El ID debe ser una cadena de texto' })
  id: string;

  @ApiProperty({ description: 'Tipo de entrega', enum: TipoEntregaEnum, example: 'envio_nacional' })
  @IsNotEmpty({ message: 'El tipo de entrega es requerido' })
  @IsEnum(TipoEntregaEnum, { message: 'El tipo de entrega debe ser válido' })
  tipo_entrega: TipoEntregaEnum;

  @ApiProperty({ description: 'Estado activo del método', example: true })
  @IsNotEmpty({ message: 'El estado activo es requerido' })
  @IsBoolean({ message: 'El estado activo debe ser un booleano' })
  activo: boolean;

  @ApiProperty({ description: 'Opciones de personalización', example: { nombre_personalizado: 'Envío Express' } })
  @IsOptional()
  @IsObject({ message: 'Las opciones de personalización deben ser un objeto' })
  personalizacion_entrega?: Record<string, any>;

  @ApiProperty({ description: 'Fecha de creación del método', example: '2024-01-01T00:00:00.000Z' })
  @IsNotEmpty({ message: 'La fecha de creación es requerida' })
  fecha_creacion: Date;

  @ApiProperty({ description: 'Fecha de actualización del método', example: '2024-01-01T00:00:00.000Z' })
  @IsNotEmpty({ message: 'La fecha de actualización es requerida' })
  fecha_actualizacion: Date;
}

/**
 * DTO para embalaje
 */
export class EmbalajeDto {
  @ApiProperty({ description: 'ID del embalaje', example: 'embalaje-123' })
  @IsNotEmpty({ message: 'El ID del embalaje es requerido' })
  @IsString({ message: 'El ID debe ser una cadena de texto' })
  id: string;

  @ApiProperty({ description: 'Tipo de embalaje', enum: TipoEmbalajeEnum, example: 'caja' })
  @IsNotEmpty({ message: 'El tipo de embalaje es requerido' })
  @IsEnum(TipoEmbalajeEnum, { message: 'El tipo de embalaje debe ser válido' })
  tipo_embalaje: TipoEmbalajeEnum;

  @ApiProperty({ description: 'Dimensiones del embalaje', example: { largo: 30, ancho: 20, alto: 10 } })
  @IsNotEmpty({ message: 'Las dimensiones son requeridas' })
  @IsObject({ message: 'Las dimensiones deben ser un objeto' })
  dimensiones: {
    largo: number;
    ancho: number;
    alto: number;
  };

  @ApiProperty({ description: 'Peso del embalaje en gramos', example: 500 })
  @IsNotEmpty({ message: 'El peso es requerido' })
  @IsNumber({}, { message: 'El peso debe ser un número' })
  @Min(0, { message: 'El peso no puede ser negativo' })
  peso: number;

  @ApiProperty({ description: 'Es embalaje predeterminado', example: true })
  @IsNotEmpty({ message: 'El estado predeterminado es requerido' })
  @IsBoolean({ message: 'El estado predeterminado debe ser un booleano' })
  es_predeterminado: boolean;

  @ApiProperty({ description: 'Fecha de creación del embalaje', example: '2024-01-01T00:00:00.000Z' })
  @IsNotEmpty({ message: 'La fecha de creación es requerida' })
  fecha_creacion: Date;

  @ApiProperty({ description: 'Fecha de actualización del embalaje', example: '2024-01-01T00:00:00.000Z' })
  @IsNotEmpty({ message: 'La fecha de actualización es requerida' })
  fecha_actualizacion: Date;
}

/**
 * DTO para proveedor de transporte externo
 */
export class ProveedorTransporteDto {
  @ApiProperty({ description: 'ID del proveedor', example: 'proveedor-123' })
  @IsNotEmpty({ message: 'El ID del proveedor es requerido' })
  @IsString({ message: 'El ID debe ser una cadena de texto' })
  id: string;

  @ApiProperty({ description: 'Nombre del proveedor de transporte', example: 'DHL Express' })
  @IsNotEmpty({ message: 'El nombre del proveedor es requerido' })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  proveedor_transporte: string;

  @ApiProperty({ description: 'Cuenta asociada al proveedor', example: 'cuenta-dhl-123' })
  @IsNotEmpty({ message: 'La cuenta asociada es requerida' })
  @IsString({ message: 'La cuenta asociada debe ser una cadena de texto' })
  cuenta_proveedor: string;

  @ApiProperty({ description: 'Estado activo de la conexión', example: true })
  @IsNotEmpty({ message: 'El estado activo es requerido' })
  @IsBoolean({ message: 'El estado activo debe ser un booleano' })
  activo: boolean;

  @ApiProperty({ description: 'URL de la API del proveedor', example: 'https://api.dhl.com/v1' })
  @IsOptional()
  @IsUrl({}, { message: 'La URL debe ser válida' })
  url_api?: string;

  @ApiProperty({ description: 'Clave API del proveedor' })
  @IsOptional()
  @IsString({ message: 'La clave API debe ser una cadena de texto' })
  api_key?: string;

  @ApiProperty({ description: 'Fecha de creación del proveedor', example: '2024-01-01T00:00:00.000Z' })
  @IsNotEmpty({ message: 'La fecha de creación es requerida' })
  fecha_creacion: Date;

  @ApiProperty({ description: 'Fecha de actualización del proveedor', example: '2024-01-01T00:00:00.000Z' })
  @IsNotEmpty({ message: 'La fecha de actualización es requerida' })
  fecha_actualizacion: Date;
}

/**
 * DTO para plantilla de documentación
 */
export class PlantillaDocumentacionDto {
  @ApiProperty({ description: 'ID de la plantilla', example: 'plantilla-123' })
  @IsNotEmpty({ message: 'El ID de la plantilla es requerido' })
  @IsString({ message: 'El ID debe ser una cadena de texto' })
  id: string;

  @ApiProperty({ description: 'Plantilla de nota de entrega (HTML)', example: '<p>Gracias por su compra</p>' })
  @IsOptional()
  @IsString({ message: 'La plantilla debe ser una cadena de texto' })
  nota_entrega_template?: string;

  @ApiProperty({ description: 'Nombre de tienda para etiquetas', example: 'Mi Tienda Online' })
  @IsOptional()
  @IsString({ message: 'El nombre de tienda debe ser una cadena de texto' })
  nombre_tienda_etiqueta?: string;

  @ApiProperty({ description: 'Fecha de creación de la plantilla', example: '2024-01-01T00:00:00.000Z' })
  @IsNotEmpty({ message: 'La fecha de creación es requerida' })
  fecha_creacion: Date;

  @ApiProperty({ description: 'Fecha de actualización de la plantilla', example: '2024-01-01T00:00:00.000Z' })
  @IsNotEmpty({ message: 'La fecha de actualización es requerida' })
  fecha_actualizacion: Date;
}

/**
 * DTO para crear un perfil de envío
 */
export class CrearPerfilEnvioDto {
  @ApiProperty({ description: 'Nombre del perfil de envío', example: 'Envío Express' })
  @IsNotEmpty({ message: 'El nombre del perfil es requerido' })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  nombre_perfil: string;

  @ApiProperty({ description: 'Zonas de envío del perfil', type: [ZonaEnvioDto] })
  @IsArray({ message: 'Las zonas de envío deben ser un array' })
  @ValidateNested({ each: true })
  @Type(() => ZonaEnvioDto)
  zonas_envio: ZonaEnvioDto[];

  @ApiProperty({ description: 'Tarifas del perfil', type: [TarifaEnvioDto] })
  @IsArray({ message: 'Las tarifas deben ser un array' })
  @ValidateNested({ each: true })
  @Type(() => TarifaEnvioDto)
  tarifas: TarifaEnvioDto[];

  @ApiProperty({ description: 'IDs de productos aplicados', example: ['prod-123', 'prod-456'] })
  @IsArray({ message: 'Los productos aplicados deben ser un array' })
  @IsString({ each: true, message: 'Cada ID de producto debe ser una cadena de texto' })
  productos: string[];
}

/**
 * DTO para actualizar un perfil de envío
 */
export class ActualizarPerfilEnvioDto {
  @ApiProperty({ description: 'Nombre del perfil de envío', example: 'Envío Express Actualizado' })
  @IsOptional()
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  nombre_perfil?: string;

  @ApiProperty({ description: 'Zonas de envío del perfil', type: [ZonaEnvioDto] })
  @IsOptional()
  @IsArray({ message: 'Las zonas de envío deben ser un array' })
  @ValidateNested({ each: true })
  @Type(() => ZonaEnvioDto)
  zonas_envio?: ZonaEnvioDto[];

  @ApiProperty({ description: 'Tarifas del perfil', type: [TarifaEnvioDto] })
  @IsOptional()
  @IsArray({ message: 'Las tarifas deben ser un array' })
  @ValidateNested({ each: true })
  @Type(() => TarifaEnvioDto)
  tarifas?: TarifaEnvioDto[];

  @ApiProperty({ description: 'IDs de productos aplicados', example: ['prod-123', 'prod-456'] })
  @IsOptional()
  @IsArray({ message: 'Los productos aplicados deben ser un array' })
  @IsString({ each: true, message: 'Cada ID de producto debe ser una cadena de texto' })
  productos?: string[];
}

/**
 * DTO principal para configuración de envío y entrega
 */
export class ConfiguracionEnvioEntregaDto {
  @ApiProperty({ description: 'Perfiles de envío configurados', type: [PerfilEnvioDto] })
  @IsArray({ message: 'Los perfiles de envío deben ser un array' })
  @ValidateNested({ each: true })
  @Type(() => PerfilEnvioDto)
  perfiles_envio: PerfilEnvioDto[];

  @ApiProperty({ description: 'Métodos de entrega disponibles', type: [MetodoEntregaDto] })
  @IsArray({ message: 'Los métodos de entrega deben ser un array' })
  @ValidateNested({ each: true })
  @Type(() => MetodoEntregaDto)
  metodos_entrega: MetodoEntregaDto[];

  @ApiProperty({ description: 'Configuraciones de embalaje', type: [EmbalajeDto] })
  @IsArray({ message: 'Los embalajes deben ser un array' })
  @ValidateNested({ each: true })
  @Type(() => EmbalajeDto)
  embalajes: EmbalajeDto[];

  @ApiProperty({ description: 'Proveedores de transporte externo', type: [ProveedorTransporteDto] })
  @IsArray({ message: 'Los proveedores de transporte deben ser un array' })
  @ValidateNested({ each: true })
  @Type(() => ProveedorTransporteDto)
  proveedores_transporte: ProveedorTransporteDto[];

  @ApiProperty({ description: 'Plantillas de documentación', type: [PlantillaDocumentacionDto] })
  @IsArray({ message: 'Las plantillas de documentación deben ser un array' })
  @ValidateNested({ each: true })
  @Type(() => PlantillaDocumentacionDto)
  plantillas_documentacion: PlantillaDocumentacionDto[];
}

/**
 * DTO para actualizar configuración de envío y entrega
 */
export class ActualizarConfiguracionEnvioEntregaDto {
  @ApiProperty({ description: 'Perfiles de envío configurados', type: [PerfilEnvioDto] })
  @IsOptional()
  @IsArray({ message: 'Los perfiles de envío deben ser un array' })
  @ValidateNested({ each: true })
  @Type(() => PerfilEnvioDto)
  perfiles_envio?: PerfilEnvioDto[];

  @ApiProperty({ description: 'Métodos de entrega disponibles', type: [MetodoEntregaDto] })
  @IsOptional()
  @IsArray({ message: 'Los métodos de entrega deben ser un array' })
  @ValidateNested({ each: true })
  @Type(() => MetodoEntregaDto)
  metodos_entrega?: MetodoEntregaDto[];

  @ApiProperty({ description: 'Configuraciones de embalaje', type: [EmbalajeDto] })
  @IsOptional()
  @IsArray({ message: 'Los embalajes deben ser un array' })
  @ValidateNested({ each: true })
  @Type(() => EmbalajeDto)
  embalajes?: EmbalajeDto[];

  @ApiProperty({ description: 'Proveedores de transporte externo', type: [ProveedorTransporteDto] })
  @IsOptional()
  @IsArray({ message: 'Los proveedores de transporte deben ser un array' })
  @ValidateNested({ each: true })
  @Type(() => ProveedorTransporteDto)
  proveedores_transporte?: ProveedorTransporteDto[];

  @ApiProperty({ description: 'Plantillas de documentación', type: [PlantillaDocumentacionDto] })
  @IsOptional()
  @IsArray({ message: 'Las plantillas de documentación deben ser un array' })
  @ValidateNested({ each: true })
  @Type(() => PlantillaDocumentacionDto)
  plantillas_documentacion?: PlantillaDocumentacionDto[];
}