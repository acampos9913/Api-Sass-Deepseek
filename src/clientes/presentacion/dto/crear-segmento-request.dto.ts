/**
 * DTO para la creación de segmentos desde la API
 * Valida y tipa los datos de entrada para crear un nuevo segmento
 */
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { 
  IsNotEmpty, 
  IsString, 
  IsEnum, 
  IsOptional, 
  IsArray, 
  IsBoolean, 
  MinLength, 
  MaxLength,
  ValidateNested,
  IsObject
} from 'class-validator';
import { Type } from 'class-transformer';

export enum TipoSegmentoEnum {
  MANUAL = 'MANUAL',
  AUTOMATICO = 'AUTOMATICO',
  PREDEFINIDO = 'PREDEFINIDO'
}

export enum EstadoSegmentoEnum {
  ACTIVO = 'ACTIVO',
  INACTIVO = 'INACTIVO',
  BORRADOR = 'BORRADOR'
}

export enum OperadorCondicionEnum {
  IGUAL = 'IGUAL',
  DIFERENTE = 'DIFERENTE',
  MAYOR_QUE = 'MAYOR_QUE',
  MENOR_QUE = 'MENOR_QUE',
  MAYOR_O_IGUAL_QUE = 'MAYOR_O_IGUAL_QUE',
  MENOR_O_IGUAL_QUE = 'MENOR_O_IGUAL_QUE',
  CONTIENE = 'CONTIENE',
  NO_CONTINE = 'NO_CONTINE',
  EMPIEZA_CON = 'EMPIEZA_CON',
  TERMINA_CON = 'TERMINA_CON'
}

export class CondicionSegmentoDto {
  @ApiProperty({
    description: 'Campo sobre el que se aplica la condición',
    example: 'total_gastado',
    enum: ['total_gastado', 'cantidad_pedidos', 'fecha_ultima_compra', 'region', 'etiquetas']
  })
  @IsNotEmpty({ message: 'El campo de la condición es requerido' })
  @IsString({ message: 'El campo debe ser una cadena de texto' })
  campo: string;

  @ApiProperty({
    description: 'Operador de comparación',
    example: 'MAYOR_QUE',
    enum: OperadorCondicionEnum
  })
  @IsNotEmpty({ message: 'El operador de la condición es requerido' })
  @IsEnum(OperadorCondicionEnum, { message: 'Operador de condición inválido' })
  operador: OperadorCondicionEnum;

  @ApiProperty({
    description: 'Valor de comparación para la condición',
    example: 1000
  })
  @IsNotEmpty({ message: 'El valor de la condición es requerido' })
  valor: any;
}

export class ReglasSegmentoDto {
  @ApiProperty({
    description: 'Lógica de combinación de condiciones',
    example: 'Y',
    enum: ['Y', 'O']
  })
  @IsNotEmpty({ message: 'La lógica de combinación es requerida' })
  @IsString({ message: 'La lógica debe ser una cadena de texto' })
  logica: string;

  @ApiProperty({
    description: 'Lista de condiciones del segmento',
    type: [CondicionSegmentoDto],
    example: [
      {
        campo: 'total_gastado',
        operador: 'MAYOR_QUE',
        valor: 1000
      },
      {
        campo: 'cantidad_pedidos',
        operador: 'MAYOR_O_IGUAL_QUE',
        valor: 5
      }
    ]
  })
  @IsArray({ message: 'Las condiciones deben ser un array' })
  @ValidateNested({ each: true })
  @Type(() => CondicionSegmentoDto)
  condiciones: CondicionSegmentoDto[];
}

export class CrearSegmentoRequestDto {
  @ApiProperty({
    description: 'Nombre del segmento',
    example: 'Clientes VIP',
    maxLength: 100
  })
  @IsNotEmpty({ message: 'El nombre del segmento es requerido' })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'El nombre no puede exceder los 100 caracteres' })
  nombre: string;

  @ApiPropertyOptional({
    description: 'Descripción detallada del segmento',
    example: 'Segmento para clientes con alto valor y frecuencia de compra',
    maxLength: 500
  })
  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  @MaxLength(500, { message: 'La descripción no puede exceder los 500 caracteres' })
  descripcion?: string;

  @ApiProperty({
    description: 'Tipo de segmento',
    example: 'AUTOMATICO',
    enum: TipoSegmentoEnum
  })
  @IsNotEmpty({ message: 'El tipo de segmento es requerido' })
  @IsEnum(TipoSegmentoEnum, { message: 'Tipo de segmento inválido' })
  tipo: TipoSegmentoEnum;

  @ApiPropertyOptional({
    description: 'Estado del segmento',
    example: 'ACTIVO',
    enum: EstadoSegmentoEnum,
    default: EstadoSegmentoEnum.BORRADOR
  })
  @IsOptional()
  @IsEnum(EstadoSegmentoEnum, { message: 'Estado de segmento inválido' })
  estado?: EstadoSegmentoEnum;

  @ApiPropertyOptional({
    description: 'Reglas de segmentación para segmentos automáticos',
    type: ReglasSegmentoDto
  })
  @IsOptional()
  @IsObject({ message: 'Las reglas deben ser un objeto' })
  @ValidateNested()
  @Type(() => ReglasSegmentoDto)
  reglas?: ReglasSegmentoDto;

  @ApiPropertyOptional({
    description: 'Etiquetas para categorizar el segmento',
    example: ['VIP', 'AltoValor', 'Frecuente'],
    type: [String]
  })
  @IsOptional()
  @IsArray({ message: 'Las etiquetas deben ser un array' })
  @IsString({ each: true, message: 'Cada etiqueta debe ser una cadena de texto' })
  etiquetas?: string[];

  @ApiPropertyOptional({
    description: 'Indica si el segmento es público para otros usuarios',
    example: true,
    default: false
  })
  @IsOptional()
  @IsBoolean({ message: 'El campo esPublico debe ser booleano' })
  esPublico?: boolean;

  @ApiPropertyOptional({
    description: 'Indica si el segmento puede combinarse con otros',
    example: true,
    default: true
  })
  @IsOptional()
  @IsBoolean({ message: 'El campo puedeCombinar debe ser booleano' })
  puedeCombinar?: boolean;

  @ApiPropertyOptional({
    description: 'Indica si el segmento puede usarse en campañas de marketing',
    example: true,
    default: true
  })
  @IsOptional()
  @IsBoolean({ message: 'El campo puedeUsarEnCampanas debe ser booleano' })
  puedeUsarEnCampanas?: boolean;

  @ApiPropertyOptional({
    description: 'Descripción resumida para mostrar en listados',
    example: 'Segmento automático: Clientes VIP',
    maxLength: 200
  })
  @IsOptional()
  @IsString({ message: 'La descripción resumida debe ser una cadena de texto' })
  @MaxLength(200, { message: 'La descripción resumida no puede exceder los 200 caracteres' })
  descripcionResumida?: string;
}