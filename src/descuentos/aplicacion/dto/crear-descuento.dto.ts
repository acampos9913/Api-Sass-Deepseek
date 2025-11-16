import { ApiProperty } from '@nestjs/swagger';
import { TipoDescuento } from '../../dominio/enums/tipo-descuento.enum';
import { IsEnum, IsNumber, IsOptional, IsString, Min, Max, IsDateString, IsArray, IsObject, ValidateIf } from 'class-validator';

/**
 * DTO para crear un nuevo descuento o promoción
 * Contiene las validaciones de entrada para la creación de descuentos
 */
export class CrearDescuentoDto {
  @ApiProperty({
    description: 'Código único del descuento',
    example: 'VERANO2024',
    required: true,
  })
  @IsString({ message: 'El código debe ser una cadena de texto' })
  codigo: string;

  @ApiProperty({
    description: 'Tipo de descuento',
    enum: TipoDescuento,
    example: TipoDescuento.PORCENTAJE,
    required: true,
  })
  @IsEnum(TipoDescuento, {
    message: 'El tipo de descuento debe ser uno de: PORCENTAJE, MONTO_FIJO, ENVIO_GRATIS, SUBTOTAL_CARRITO, LLEVA_X_PAGA_Y, PROGRESIVO, CAMPAÑA_UTM, COMBO'
  })
  tipo: TipoDescuento;

  @ApiProperty({
    description: 'Valor del descuento (porcentaje o monto fijo)',
    example: 15,
    required: true,
  })
  @IsNumber({}, { message: 'El valor debe ser un número' })
  @Min(0, { message: 'El valor no puede ser negativo' })
  valor: number;

  @ApiProperty({
    description: 'Valor mínimo de compra para aplicar el descuento (opcional)',
    example: 100,
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsNumber({}, { message: 'El valor mínimo debe ser un número' })
  @Min(0, { message: 'El valor mínimo no puede ser negativo' })
  valorMinimo?: number | null;

  @ApiProperty({
    description: 'Límite máximo de usos del descuento (opcional)',
    example: 100,
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Los usos máximos deben ser un número' })
  @Min(1, { message: 'Los usos máximos deben ser al menos 1' })
  usosMaximos?: number | null;

  @ApiProperty({
    description: 'Fecha de inicio de validez del descuento (opcional)',
    example: '2024-01-01T00:00:00.000Z',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsDateString({}, { message: 'La fecha de inicio debe ser una fecha válida' })
  fechaInicio?: string | null;

  @ApiProperty({
    description: 'Fecha de fin de validez del descuento (opcional)',
    example: '2024-12-31T23:59:59.999Z',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsDateString({}, { message: 'La fecha de fin debe ser una fecha válida' })
  fechaFin?: string | null;

  // Nuevos campos para descuentos avanzados

  @ApiProperty({
    description: 'Configuración avanzada específica por tipo de descuento (opcional)',
    example: { niveles: [{ monto: 100, descuento: 10 }, { monto: 200, descuento: 15 }] },
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsObject({ message: 'La configuración avanzada debe ser un objeto' })
  configuracionAvanzada?: Record<string, any> | null;

  @ApiProperty({
    description: 'Reglas de validación complejas (opcional)',
    example: { validarStock: true, excluirProductosOferta: true },
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsObject({ message: 'Las reglas de validación deben ser un objeto' })
  reglasValidacion?: Record<string, any> | null;

  @ApiProperty({
    description: 'Restricciones adicionales (opcional)',
    example: { maximoPorCliente: 1, excluirCategorias: ['liquidacion'] },
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsObject({ message: 'Las restricciones deben ser un objeto' })
  restricciones?: Record<string, any> | null;

  @ApiProperty({
    description: 'Nombre de la campaña para UTM (opcional)',
    example: 'Campaña Verano 2024',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsString({ message: 'El nombre de la campaña debe ser una cadena de texto' })
  nombreCampana?: string | null;

  @ApiProperty({
    description: 'Parámetro UTM source (opcional)',
    example: 'google',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsString({ message: 'El UTM source debe ser una cadena de texto' })
  utmSource?: string | null;

  @ApiProperty({
    description: 'Parámetro UTM medium (opcional)',
    example: 'cpc',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsString({ message: 'El UTM medium debe ser una cadena de texto' })
  utmMedium?: string | null;

  @ApiProperty({
    description: 'Parámetro UTM campaign (opcional)',
    example: 'summer_sale',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsString({ message: 'El UTM campaign debe ser una cadena de texto' })
  utmCampaign?: string | null;

  @ApiProperty({
    description: 'Cantidad a llevar para descuento "Lleva X paga Y" (opcional)',
    example: 3,
    required: false,
    nullable: true,
  })
  @ValidateIf(o => o.tipo === TipoDescuento.LLEVA_X_PAGA_Y)
  @IsNumber({}, { message: 'La cantidad a llevar debe ser un número' })
  @Min(1, { message: 'La cantidad a llevar debe ser al menos 1' })
  cantidadLleva?: number | null;

  @ApiProperty({
    description: 'Cantidad a pagar para descuento "Lleva X paga Y" (opcional)',
    example: 2,
    required: false,
    nullable: true,
  })
  @ValidateIf(o => o.tipo === TipoDescuento.LLEVA_X_PAGA_Y)
  @IsNumber({}, { message: 'La cantidad a pagar debe ser un número' })
  @Min(1, { message: 'La cantidad a pagar debe ser al menos 1' })
  cantidadPaga?: number | null;

  @ApiProperty({
    description: 'IDs de productos a los que aplica el descuento (opcional)',
    example: ['prod_123', 'prod_456'],
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: 'Los productos aplicables deben ser un array' })
  @IsString({ each: true, message: 'Cada ID de producto debe ser una cadena de texto' })
  productosAplicables?: string[];

  @ApiProperty({
    description: 'IDs de colecciones a las que aplica el descuento (opcional)',
    example: ['col_123', 'col_456'],
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: 'Las colecciones aplicables deben ser un array' })
  @IsString({ each: true, message: 'Cada ID de colección debe ser una cadena de texto' })
  coleccionesAplicables?: string[];

  @ApiProperty({
    description: 'Paises donde aplica el descuento (opcional)',
    example: ['Perú', 'Chile', 'Argentina'],
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: 'Los países permitidos deben ser un array' })
  @IsString({ each: true, message: 'Cada país debe ser una cadena de texto' })
  paisesPermitidos?: string[];

  @ApiProperty({
    description: 'Segmentos de clientes permitidos (opcional)',
    example: ['segmento_vip', 'segmento_nuevos'],
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: 'Los segmentos permitidos deben ser un array' })
  @IsString({ each: true, message: 'Cada segmento debe ser una cadena de texto' })
  segmentosPermitidos?: string[];

  @ApiProperty({
    description: 'Requisitos mínimos específicos (opcional)',
    example: { cantidadMinimaItems: 2, categoriasRequeridas: ['electronica'] },
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsObject({ message: 'Los requisitos mínimos deben ser un objeto' })
  requisitosMinimos?: Record<string, any> | null;
}