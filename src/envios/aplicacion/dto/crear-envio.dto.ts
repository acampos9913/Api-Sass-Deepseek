/**
 * DTO para Crear Envío
 * Define la estructura de datos para la creación de envíos
 * Sigue los principios de la Arquitectura Limpia
 */
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsEnum,
  IsOptional,
  IsEmail,
  Min,
  Max,
  ValidateNested,
  IsBoolean,
  MaxLength
} from 'class-validator';
import { TipoMetodoEnvio } from '../../dominio/entidades/envio.entity';

export class CrearEnvioDto {
  @ApiProperty({
    description: 'ID de la orden asociada al envío',
    example: 'orden_123456',
  })
  @IsString()
  @IsNotEmpty()
  ordenId: string;

  @ApiProperty({
    description: 'Dirección de envío del destinatario',
    type: () => DireccionEnvioDto,
  })
  @ValidateNested()
  @Type(() => DireccionEnvioDto)
  direccionEnvio: DireccionEnvioDto;

  @ApiProperty({
    description: 'Método de envío seleccionado',
    type: () => MetodoEnvioDto,
  })
  @ValidateNested()
  @Type(() => MetodoEnvioDto)
  metodoEnvio: MetodoEnvioDto;

  @ApiProperty({
    description: 'Detalles específicos del envío',
    type: () => DetallesEnvioDto,
  })
  @ValidateNested()
  @Type(() => DetallesEnvioDto)
  detalles: DetallesEnvioDto;
}

export class DireccionEnvioDto {
  @ApiProperty({
    description: 'Nombre completo del destinatario',
    example: 'Juan Pérez García',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  nombreCompleto: string;

  @ApiProperty({
    description: 'Calle y número de la dirección',
    example: 'Av. Principal 123',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  calle: string;

  @ApiProperty({
    description: 'Ciudad de destino',
    example: 'Lima',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  ciudad: string;

  @ApiPropertyOptional({
    description: 'Estado o provincia (opcional)',
    example: 'Lima',
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  estado?: string;

  @ApiProperty({
    description: 'Código postal',
    example: '15001',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  codigoPostal: string;

  @ApiProperty({
    description: 'País de destino',
    example: 'Perú',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  pais: string;

  @ApiPropertyOptional({
    description: 'Teléfono de contacto del destinatario',
    example: '+51987654321',
  })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  telefono?: string;

  @ApiPropertyOptional({
    description: 'Email del destinatario',
    example: 'juan.perez@example.com',
  })
  @IsEmail()
  @IsOptional()
  @MaxLength(100)
  email?: string;

  @ApiPropertyOptional({
    description: 'Instrucciones especiales para la entrega',
    example: 'Dejar en recepción',
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  instruccionesEspeciales?: string;
}

export class MetodoEnvioDto {
  @ApiProperty({
    description: 'Tipo de método de envío',
    enum: TipoMetodoEnvio,
    example: TipoMetodoEnvio.ESTANDAR,
  })
  @IsEnum(TipoMetodoEnvio)
  tipo: TipoMetodoEnvio;

  @ApiProperty({
    description: 'Tiempo estimado de entrega en días',
    example: 5,
    minimum: 1,
    maximum: 90,
  })
  @IsNumber()
  @IsPositive()
  @Min(1)
  @Max(90)
  tiempoEstimadoDias: number;

  @ApiPropertyOptional({
    description: 'Descripción del método de envío',
    example: 'Envío estándar con seguimiento',
  })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  descripcion?: string;

  @ApiPropertyOptional({
    description: 'Restricciones del método de envío',
    example: ['No disponible los domingos', 'Excluye productos frágiles'],
    type: [String],
  })
  @IsString({ each: true })
  @IsOptional()
  restricciones?: string[];
}

export class DetallesEnvioDto {
  @ApiProperty({
    description: 'Peso total del paquete en kilogramos',
    example: 2.5,
    minimum: 0,
    maximum: 1000,
  })
  @IsNumber()
  @IsPositive()
  @Min(0)
  @Max(1000)
  pesoTotal: number;

  @ApiProperty({
    description: 'Dimensiones del paquete',
    type: () => DimensionesDto,
  })
  @ValidateNested()
  @Type(() => DimensionesDto)
  dimensiones: DimensionesDto;

  @ApiProperty({
    description: 'Indica si el paquete es frágil',
    example: false,
  })
  @IsBoolean()
  esFragil: boolean;

  @ApiProperty({
    description: 'Indica si se requiere firma al entregar',
    example: true,
  })
  @IsBoolean()
  requiereFirma: boolean;

  @ApiProperty({
    description: 'Indica si es un regalo',
    example: false,
  })
  @IsBoolean()
  esRegalo: boolean;

  @ApiProperty({
    description: 'Valor asegurado del paquete',
    example: 150.00,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  valorAsegurado: number;

  @ApiPropertyOptional({
    description: 'Notas adicionales sobre el envío',
    example: 'Manejar con cuidado, contiene vidrio',
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  notas?: string;
}

export class DimensionesDto {
  @ApiProperty({
    description: 'Altura del paquete en centímetros',
    example: 30,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  alto: number;

  @ApiProperty({
    description: 'Ancho del paquete en centímetros',
    example: 20,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  ancho: number;

  @ApiProperty({
    description: 'Largo del paquete en centímetros',
    example: 15,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  largo: number;
}
