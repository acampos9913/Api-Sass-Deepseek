import { ApiProperty } from '@nestjs/swagger';
import { 
  IsEnum, 
  IsArray, 
  IsBoolean, 
  IsNumber, 
  IsString, 
  IsOptional, 
  IsObject, 
  ValidateNested, 
  Min, 
  Max, 
  IsUrl,
  IsDate,
  IsNotEmpty
} from 'class-validator';
import { Type } from 'class-transformer';

export enum ServicioFiscal {
  SHOPIFY_TAX = 'Shopify Tax',
  MANUAL = 'Manual',
  BASIC_TAX = 'Basic Tax'
}

export enum TipoImpuesto {
  IVA = 'IVA',
  GST = 'GST',
  PST = 'PST',
  HST = 'HST',
  SALES_TAX = 'Sales Tax',
  VAT = 'VAT',
  IGST = 'IGST',
  CGST = 'CGST',
  SGST = 'SGST'
}

export enum TipoArancel {
  FIJO = 'fijo',
  PORCENTAJE = 'porcentaje',
  CALCULADO = 'calculado'
}

export class RegionFiscalDto {
  @ApiProperty({ description: 'País de la región fiscal', example: 'Perú' })
  @IsNotEmpty({ message: 'El país es requerido' })
  @IsString({ message: 'El país debe ser una cadena de texto' })
  pais: string;

  @ApiProperty({ description: 'Estado/región de la región fiscal', example: 'Lima' })
  @IsNotEmpty({ message: 'El estado/región es requerido' })
  @IsString({ message: 'El estado/región debe ser una cadena de texto' })
  estado_region: string;

  @ApiProperty({ 
    description: 'Tipo de impuesto aplicado', 
    enum: TipoImpuesto,
    example: TipoImpuesto.IVA
  })
  @IsEnum(TipoImpuesto, { message: 'El tipo de impuesto debe ser válido' })
  tipo_impuesto: TipoImpuesto;

  @ApiProperty({ description: 'Indica si se recauda impuesto en esta región', example: true })
  @IsBoolean({ message: 'El estado de recaudación debe ser un booleano' })
  recauda: boolean;

  @ApiProperty({ description: 'Tasa de impuesto estándar para la región', example: 18 })
  @IsNumber({}, { message: 'La tasa estándar debe ser un número' })
  @Min(0, { message: 'La tasa estándar no puede ser menor a 0' })
  @Max(100, { message: 'La tasa estándar no puede ser mayor a 100' })
  tasa_estandar: number;
}

export class TasaReducidaDto {
  @ApiProperty({ description: 'Descripción de la tasa reducida', example: 'Productos de primera necesidad' })
  @IsNotEmpty({ message: 'La descripción es requerida' })
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  descripcion: string;

  @ApiProperty({ description: 'Porcentaje de la tasa reducida', example: 8 })
  @IsNumber({}, { message: 'El porcentaje debe ser un número' })
  @Min(0, { message: 'El porcentaje no puede ser menor a 0' })
  @Max(100, { message: 'El porcentaje no puede ser mayor a 100' })
  porcentaje: number;

  @ApiProperty({ 
    description: 'Categorías de productos que aplican a esta tasa', 
    example: ['alimentos', 'medicamentos'],
    required: false
  })
  @IsOptional()
  @IsArray({ message: 'Las categorías deben ser un array' })
  @IsString({ each: true, message: 'Cada categoría debe ser una cadena de texto' })
  categorias?: string[];
}

export class TarifaArancelDto {
  @ApiProperty({ 
    description: 'Tipo de tarifa de arancel', 
    enum: TipoArancel,
    example: TipoArancel.PORCENTAJE
  })
  @IsEnum(TipoArancel, { message: 'El tipo de tarifa debe ser válido' })
  tipo: TipoArancel;

  @ApiProperty({ description: 'Monto de la tarifa', example: 10 })
  @IsNumber({}, { message: 'El monto debe ser un número' })
  @Min(0, { message: 'El monto no puede ser menor a 0' })
  monto: number;

  @ApiProperty({ 
    description: 'Condiciones para aplicar la tarifa', 
    example: 'Aplica para productos con valor mayor a $100',
    required: false
  })
  @IsOptional()
  @IsString({ message: 'Las condiciones deben ser una cadena de texto' })
  condiciones?: string;

  @ApiProperty({ 
    description: 'Países de destino que aplican esta tarifa', 
    example: ['Estados Unidos', 'Canadá'],
    required: false
  })
  @IsOptional()
  @IsArray({ message: 'Los países deben ser un array' })
  @IsString({ each: true, message: 'Cada país debe ser una cadena de texto' })
  paises_destino?: string[];
}

export class CodigoAduaneroDto {
  @ApiProperty({ description: 'País de origen del producto', example: 'China' })
  @IsNotEmpty({ message: 'El país de origen es requerido' })
  @IsString({ message: 'El país de origen debe ser una cadena de texto' })
  pais_origen: string;

  @ApiProperty({ description: 'Código SA (Sistema Armonizado)', example: '8471.30.00.00' })
  @IsNotEmpty({ message: 'El código SA es requerido' })
  @IsString({ message: 'El código SA debe ser una cadena de texto' })
  codigo_sa: string;

  @ApiProperty({ description: 'Descripción del producto según código SA', example: 'Computadoras portátiles' })
  @IsNotEmpty({ message: 'La descripción es requerida' })
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  descripcion: string;

  @ApiProperty({ 
    description: 'ID de la variante del producto', 
    example: 'variante-123',
    required: false
  })
  @IsOptional()
  @IsString({ message: 'El ID de variante debe ser una cadena de texto' })
  variante_id?: string;
}

export class CrearConfiguracionImpuestosArancelesDto {
  @ApiProperty({ 
    description: 'ID de la tienda', 
    example: 'tienda-123'
  })
  @IsNotEmpty({ message: 'El ID de la tienda es requerido' })
  @IsString({ message: 'El ID de la tienda debe ser una cadena de texto' })
  tiendaId: string;

  @ApiProperty({ 
    description: 'Servicio fiscal activo', 
    enum: ServicioFiscal,
    example: ServicioFiscal.SHOPIFY_TAX
  })
  @IsEnum(ServicioFiscal, { message: 'El servicio fiscal debe ser válido' })
  servicio_fiscal: ServicioFiscal;

  @ApiProperty({ 
    description: 'Regiones fiscales configuradas', 
    type: [RegionFiscalDto]
  })
  @IsArray({ message: 'Las regiones fiscales deben ser un array' })
  @ValidateNested({ each: true })
  @Type(() => RegionFiscalDto)
  regiones_fiscales: RegionFiscalDto[];

  @ApiProperty({ 
    description: 'Tasa de impuesto estándar global', 
    example: 18
  })
  @IsNumber({}, { message: 'La tasa estándar debe ser un número' })
  @Min(0, { message: 'La tasa estándar no puede ser menor a 0' })
  @Max(100, { message: 'La tasa estándar no puede ser mayor a 100' })
  tasa_estandar: number;

  @ApiProperty({ 
    description: 'Tasas reducidas/exentas', 
    type: [TasaReducidaDto],
    required: false
  })
  @IsOptional()
  @IsArray({ message: 'Las tasas reducidas deben ser un array' })
  @ValidateNested({ each: true })
  @Type(() => TasaReducidaDto)
  tasas_reducidas?: TasaReducidaDto[];

  @ApiProperty({ 
    description: 'Indica si el impuesto está incluido en el precio', 
    example: false
  })
  @IsBoolean({ message: 'El campo impuesto_en_precio debe ser un booleano' })
  impuesto_en_precio: boolean;

  @ApiProperty({ 
    description: 'Indica si se cobra arancel en el checkout', 
    example: true
  })
  @IsBoolean({ message: 'El campo arancel_checkout debe ser un booleano' })
  arancel_checkout: boolean;

  @ApiProperty({ 
    description: 'Tarifas de arancel configuradas', 
    type: [TarifaArancelDto],
    required: false
  })
  @IsOptional()
  @IsArray({ message: 'Las tarifas de arancel deben ser un array' })
  @ValidateNested({ each: true })
  @Type(() => TarifaArancelDto)
  tarifas_arancel?: TarifaArancelDto[];

  @ApiProperty({ 
    description: 'Indica si DDP está disponible', 
    example: false
  })
  @IsBoolean({ message: 'El campo ddp_disponible debe ser un booleano' })
  ddp_disponible: boolean;

  @ApiProperty({ 
    description: 'Códigos aduaneros por variante', 
    type: [CodigoAduaneroDto],
    required: false
  })
  @IsOptional()
  @IsArray({ message: 'Los códigos aduaneros deben ser un array' })
  @ValidateNested({ each: true })
  @Type(() => CodigoAduaneroDto)
  codigos_aduaneros?: CodigoAduaneroDto[];

  @ApiProperty({ 
    description: 'Indica si los impuestos se incluyen en el precio del producto', 
    example: true
  })
  @IsBoolean({ message: 'El campo incluir_en_precio debe ser un booleano' })
  incluir_en_precio: boolean;

  @ApiProperty({ 
    description: 'Indica si se cobra impuesto sobre envíos', 
    example: true
  })
  @IsBoolean({ message: 'El campo impuesto_envios debe ser un booleano' })
  impuesto_envios: boolean;

  @ApiProperty({ 
    description: 'Indica si se cobra IVA para contenidos digitales', 
    example: false
  })
  @IsBoolean({ message: 'El campo iva_digitales debe ser un booleano' })
  iva_digitales: boolean;
}

export class ActualizarConfiguracionImpuestosArancelesDto {
  @ApiProperty({ 
    description: 'Servicio fiscal activo', 
    enum: ServicioFiscal,
    example: ServicioFiscal.MANUAL,
    required: false
  })
  @IsOptional()
  @IsEnum(ServicioFiscal, { message: 'El servicio fiscal debe ser válido' })
  servicio_fiscal?: ServicioFiscal;

  @ApiProperty({ 
    description: 'Regiones fiscales configuradas', 
    type: [RegionFiscalDto],
    required: false
  })
  @IsOptional()
  @IsArray({ message: 'Las regiones fiscales deben ser un array' })
  @ValidateNested({ each: true })
  @Type(() => RegionFiscalDto)
  regiones_fiscales?: RegionFiscalDto[];

  @ApiProperty({ 
    description: 'Tasa de impuesto estándar global', 
    example: 19,
    required: false
  })
  @IsOptional()
  @IsNumber({}, { message: 'La tasa estándar debe ser un número' })
  @Min(0, { message: 'La tasa estándar no puede ser menor a 0' })
  @Max(100, { message: 'La tasa estándar no puede ser mayor a 100' })
  tasa_estandar?: number;

  @ApiProperty({ 
    description: 'Tasas reducidas/exentas', 
    type: [TasaReducidaDto],
    required: false
  })
  @IsOptional()
  @IsArray({ message: 'Las tasas reducidas deben ser un array' })
  @ValidateNested({ each: true })
  @Type(() => TasaReducidaDto)
  tasas_reducidas?: TasaReducidaDto[];

  @ApiProperty({ 
    description: 'Indica si el impuesto está incluido en el precio', 
    example: true,
    required: false
  })
  @IsOptional()
  @IsBoolean({ message: 'El campo impuesto_en_precio debe ser un booleano' })
  impuesto_en_precio?: boolean;

  @ApiProperty({ 
    description: 'Indica si se cobra arancel en el checkout', 
    example: false,
    required: false
  })
  @IsOptional()
  @IsBoolean({ message: 'El campo arancel_checkout debe ser un booleano' })
  arancel_checkout?: boolean;

  @ApiProperty({ 
    description: 'Tarifas de arancel configuradas', 
    type: [TarifaArancelDto],
    required: false
  })
  @IsOptional()
  @IsArray({ message: 'Las tarifas de arancel deben ser un array' })
  @ValidateNested({ each: true })
  @Type(() => TarifaArancelDto)
  tarifas_arancel?: TarifaArancelDto[];

  @ApiProperty({ 
    description: 'Indica si DDP está disponible', 
    example: true,
    required: false
  })
  @IsOptional()
  @IsBoolean({ message: 'El campo ddp_disponible debe ser un booleano' })
  ddp_disponible?: boolean;

  @ApiProperty({ 
    description: 'Códigos aduaneros por variante', 
    type: [CodigoAduaneroDto],
    required: false
  })
  @IsOptional()
  @IsArray({ message: 'Los códigos aduaneros deben ser un array' })
  @ValidateNested({ each: true })
  @Type(() => CodigoAduaneroDto)
  codigos_aduaneros?: CodigoAduaneroDto[];

  @ApiProperty({ 
    description: 'Indica si los impuestos se incluyen en el precio del producto', 
    example: false,
    required: false
  })
  @IsOptional()
  @IsBoolean({ message: 'El campo incluir_en_precio debe ser un booleano' })
  incluir_en_precio?: boolean;

  @ApiProperty({ 
    description: 'Indica si se cobra impuesto sobre envíos', 
    example: false,
    required: false
  })
  @IsOptional()
  @IsBoolean({ message: 'El campo impuesto_envios debe ser un booleano' })
  impuesto_envios?: boolean;

  @ApiProperty({ 
    description: 'Indica si se cobra IVA para contenidos digitales', 
    example: true,
    required: false
  })
  @IsOptional()
  @IsBoolean({ message: 'El campo iva_digitales debe ser un booleano' })
  iva_digitales?: boolean;
}

export class RespuestaConfiguracionImpuestosArancelesDto {
  @ApiProperty({ description: 'ID de la configuración', example: 'config-123' })
  id: string;

  @ApiProperty({ description: 'ID de la tienda', example: 'tienda-123' })
  tiendaId: string;

  @ApiProperty({ 
    description: 'Servicio fiscal activo', 
    enum: ServicioFiscal,
    example: ServicioFiscal.SHOPIFY_TAX
  })
  servicio_fiscal: ServicioFiscal;

  @ApiProperty({ 
    description: 'Regiones fiscales configuradas', 
    type: [RegionFiscalDto]
  })
  regiones_fiscales: RegionFiscalDto[];

  @ApiProperty({ description: 'Tasa de impuesto estándar global', example: 18 })
  tasa_estandar: number;

  @ApiProperty({ 
    description: 'Tasas reducidas/exentas', 
    type: [TasaReducidaDto]
  })
  tasas_reducidas: TasaReducidaDto[];

  @ApiProperty({ description: 'Indica si el impuesto está incluido en el precio', example: false })
  impuesto_en_precio: boolean;

  @ApiProperty({ description: 'Indica si se cobra arancel en el checkout', example: true })
  arancel_checkout: boolean;

  @ApiProperty({ 
    description: 'Tarifas de arancel configuradas', 
    type: [TarifaArancelDto]
  })
  tarifas_arancel: TarifaArancelDto[];

  @ApiProperty({ description: 'Indica si DDP está disponible', example: false })
  ddp_disponible: boolean;

  @ApiProperty({ 
    description: 'Códigos aduaneros por variante', 
    type: [CodigoAduaneroDto]
  })
  codigos_aduaneros: CodigoAduaneroDto[];

  @ApiProperty({ description: 'Indica si los impuestos se incluyen en el precio del producto', example: true })
  incluir_en_precio: boolean;

  @ApiProperty({ description: 'Indica si se cobra impuesto sobre envíos', example: true })
  impuesto_envios: boolean;

  @ApiProperty({ description: 'Indica si se cobra IVA para contenidos digitales', example: false })
  iva_digitales: boolean;

  @ApiProperty({ description: 'Fecha de creación', example: '2024-01-15T10:30:00.000Z' })
  fecha_creacion: Date;

  @ApiProperty({ description: 'Fecha de última actualización', example: '2024-01-15T10:30:00.000Z' })
  fecha_actualizacion: Date;
}

export class CriteriosBusquedaImpuestosArancelesDto {
  @ApiProperty({ 
    description: 'Servicio fiscal', 
    enum: ServicioFiscal,
    required: false
  })
  @IsOptional()
  @IsEnum(ServicioFiscal, { message: 'El servicio fiscal debe ser válido' })
  servicio_fiscal?: ServicioFiscal;

  @ApiProperty({ 
    description: 'País específico para buscar regiones fiscales', 
    example: 'Perú',
    required: false
  })
  @IsOptional()
  @IsString({ message: 'El país debe ser una cadena de texto' })
  pais?: string;

  @ApiProperty({ 
    description: 'Tipo de impuesto específico', 
    enum: TipoImpuesto,
    required: false
  })
  @IsOptional()
  @IsEnum(TipoImpuesto, { message: 'El tipo de impuesto debe ser válido' })
  tipo_impuesto?: TipoImpuesto;

  @ApiProperty({ 
    description: 'Buscar configuraciones con arancel en checkout activo', 
    required: false
  })
  @IsOptional()
  @IsBoolean({ message: 'El campo arancel_checkout debe ser un booleano' })
  arancel_checkout?: boolean;

  @ApiProperty({ 
    description: 'Buscar configuraciones con DDP disponible', 
    required: false
  })
  @IsOptional()
  @IsBoolean({ message: 'El campo ddp_disponible debe ser un booleano' })
  ddp_disponible?: boolean;

  @ApiProperty({ 
    description: 'Buscar configuraciones con IVA para digitales activo', 
    required: false
  })
  @IsOptional()
  @IsBoolean({ message: 'El campo iva_digitales debe ser un booleano' })
  iva_digitales?: boolean;
}