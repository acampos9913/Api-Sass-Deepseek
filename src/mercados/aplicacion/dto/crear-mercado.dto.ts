import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsBoolean, IsObject, Matches, Length } from 'class-validator';
import { EstadoMercado } from '../../dominio/enums/estado-mercado.enum';

/**
 * DTO para crear un nuevo mercado
 * Contiene las validaciones de entrada para la creación de mercados
 */
export class CrearMercadoDto {
  @ApiProperty({
    description: 'Nombre del mercado',
    example: 'Mercado Perú',
    maxLength: 100,
  })
  @IsNotEmpty({ message: 'El nombre del mercado es requerido' })
  @IsString({ message: 'El nombre del mercado debe ser una cadena de texto' })
  @Length(2, 100, { message: 'El nombre del mercado debe tener entre 2 y 100 caracteres' })
  nombre: string;

  @ApiProperty({
    description: 'Código único del mercado (2-8 letras mayúsculas)',
    example: 'PE',
    pattern: '^[A-Z]{2,8}$',
  })
  @IsNotEmpty({ message: 'El código del mercado es requerido' })
  @IsString({ message: 'El código del mercado debe ser una cadena de texto' })
  @Matches(/^[A-Z]{2,8}$/, {
    message: 'El código del mercado debe contener entre 2 y 8 letras mayúsculas',
  })
  codigo: string;

  @ApiProperty({
    description: 'Moneda del mercado',
    example: 'PEN',
    enum: ['PEN', 'USD', 'EUR', 'BRL', 'ARS', 'CLP', 'COP', 'MXN'],
  })
  @IsNotEmpty({ message: 'La moneda del mercado es requerida' })
  @IsString({ message: 'La moneda del mercado debe ser una cadena de texto' })
  @Matches(/^(PEN|USD|EUR|BRL|ARS|CLP|COP|MXN)$/, {
    message: 'La moneda debe ser una de las siguientes: PEN, USD, EUR, BRL, ARS, CLP, COP, MXN',
  })
  moneda: string;

  @ApiProperty({
    description: 'Idioma del mercado',
    example: 'es',
    enum: ['es', 'en', 'pt', 'fr', 'de'],
  })
  @IsNotEmpty({ message: 'El idioma del mercado es requerido' })
  @IsString({ message: 'El idioma del mercado debe ser una cadena de texto' })
  @Matches(/^(es|en|pt|fr|de)$/, {
    message: 'El idioma debe ser uno de los siguientes: es, en, pt, fr, de',
  })
  idioma: string;

  @ApiProperty({
    description: 'Zona horaria del mercado',
    example: 'America/Lima',
    enum: [
      'America/Lima',
      'America/New_York',
      'America/Los_Angeles',
      'Europe/Madrid',
      'Europe/London',
      'America/Sao_Paulo',
      'America/Argentina/Buenos_Aires',
    ],
  })
  @IsNotEmpty({ message: 'La zona horaria del mercado es requerida' })
  @IsString({ message: 'La zona horaria del mercado debe ser una cadena de texto' })
  @Matches(
    /^(America\/Lima|America\/New_York|America\/Los_Angeles|Europe\/Madrid|Europe\/London|America\/Sao_Paulo|America\/Argentina\/Buenos_Aires)$/,
    {
      message: 'La zona horaria debe ser una de las zonas horarias válidas',
    },
  )
  zonaHoraria: string;

  @ApiPropertyOptional({
    description: 'Estado del mercado',
    enum: EstadoMercado,
    example: EstadoMercado.EN_CONFIGURACION,
  })
  @IsOptional()
  @IsEnum(EstadoMercado, { message: 'El estado del mercado debe ser un valor válido' })
  estado?: EstadoMercado;

  @ApiPropertyOptional({
    description: 'Indica si el mercado está activo',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'El campo activo debe ser un valor booleano' })
  activo?: boolean;

  @ApiPropertyOptional({
    description: 'ID de la tienda a la que pertenece el mercado',
    example: 'tienda_123456789',
    nullable: true,
  })
  @IsOptional()
  @IsString({ message: 'El ID de la tienda debe ser una cadena de texto' })
  tiendaId?: string | null;

  @ApiPropertyOptional({
    description: 'Configuración adicional del mercado en formato JSON',
    example: {
      impuestos: {
        iva: 18,
        igv: 18,
      },
      envio: {
        costoEstandar: 15,
        diasEntrega: 3,
      },
      pagos: {
        tarjetasAceptadas: ['VISA', 'MASTERCARD'],
        monedaLocal: 'PEN',
      },
    },
  })
  @IsOptional()
  @IsObject({ message: 'La configuración debe ser un objeto válido' })
  configuracion?: Record<string, any>;

  /**
   * Valida el DTO según reglas de negocio específicas
   */
  validar(): { esValido: boolean; errores: string[] } {
    const errores: string[] = [];

    // Validaciones adicionales de negocio
    if (this.codigo && this.codigo.length < 2) {
      errores.push('El código del mercado debe tener al menos 2 caracteres');
    }

    if (this.codigo && this.codigo.length > 8) {
      errores.push('El código del mercado no puede tener más de 8 caracteres');
    }

    // Validar que la configuración sea un objeto si se proporciona
    if (this.configuracion && typeof this.configuracion !== 'object') {
      errores.push('La configuración debe ser un objeto válido');
    }

    // Validar que la tiendaId sea un UUID si se proporciona
    if (this.tiendaId && !this.validarUUID(this.tiendaId)) {
      errores.push('El ID de la tienda debe ser un UUID válido');
    }

    return {
      esValido: errores.length === 0,
      errores,
    };
  }

  /**
   * Valida si un string es un UUID válido
   */
  private validarUUID(uuid: string): boolean {
    const regexUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return regexUUID.test(uuid);
  }

  /**
   * Convierte el DTO a un objeto plano para la creación
   */
  aObjetoCreacion(): {
    nombre: string;
    codigo: string;
    moneda: string;
    idioma: string;
    zonaHoraria: string;
    estado: EstadoMercado;
    activo: boolean;
    tiendaId: string | null;
    configuracion?: Record<string, any>;
  } {
    return {
      nombre: this.nombre,
      codigo: this.codigo,
      moneda: this.moneda,
      idioma: this.idioma,
      zonaHoraria: this.zonaHoraria,
      estado: this.estado || EstadoMercado.EN_CONFIGURACION,
      activo: this.activo ?? true,
      tiendaId: this.tiendaId || null,
      ...(this.configuracion && { configuracion: this.configuracion }),
    };
  }
}