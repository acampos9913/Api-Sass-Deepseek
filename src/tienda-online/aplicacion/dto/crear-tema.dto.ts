import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsObject, ValidateNested, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO para la configuración de colores del tema
 */
export class ConfiguracionColoresDto {
  @ApiProperty({
    description: 'Color primario del tema (hex, rgb, o nombre)',
    example: '#007bff',
  })
  @IsString({ message: 'El color primario debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El color primario es requerido' })
  primario: string;

  @ApiProperty({
    description: 'Color secundario del tema (hex, rgb, o nombre)',
    example: '#6c757d',
  })
  @IsString({ message: 'El color secundario debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El color secundario es requerido' })
  secundario: string;

  @ApiProperty({
    description: 'Color para texto principal',
    example: '#212529',
  })
  @IsString({ message: 'El color de texto debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El color de texto es requerido' })
  texto: string;

  @ApiProperty({
    description: 'Color de fondo principal',
    example: '#ffffff',
  })
  @IsString({ message: 'El color de fondo debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El color de fondo es requerido' })
  fondo: string;

  @ApiPropertyOptional({
    description: 'Color de éxito',
    example: '#28a745',
  })
  @IsOptional()
  @IsString({ message: 'El color de éxito debe ser una cadena de texto' })
  exito?: string;

  @ApiPropertyOptional({
    description: 'Color de advertencia',
    example: '#ffc107',
  })
  @IsOptional()
  @IsString({ message: 'El color de advertencia debe ser una cadena de texto' })
  advertencia?: string;

  @ApiPropertyOptional({
    description: 'Color de error',
    example: '#dc3545',
  })
  @IsOptional()
  @IsString({ message: 'El color de error debe ser una cadena de texto' })
  error?: string;

  @ApiPropertyOptional({
    description: 'Color de información',
    example: '#17a2b8',
  })
  @IsOptional()
  @IsString({ message: 'El color de información debe ser una cadena de texto' })
  informacion?: string;
}

/**
 * DTO para la configuración de fuentes del tema
 */
export class ConfiguracionFuentesDto {
  @ApiProperty({
    description: 'Fuente principal del tema',
    example: 'Arial, sans-serif',
  })
  @IsString({ message: 'La fuente principal debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La fuente principal es requerida' })
  principal: string;

  @ApiProperty({
    description: 'Fuente secundaria del tema',
    example: 'Georgia, serif',
  })
  @IsString({ message: 'La fuente secundaria debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La fuente secundaria es requerida' })
  secundaria: string;

  @ApiPropertyOptional({
    description: 'Fuente para encabezados',
    example: 'Roboto, sans-serif',
  })
  @IsOptional()
  @IsString({ message: 'La fuente de encabezados debe ser una cadena de texto' })
  encabezados?: string;

  @ApiPropertyOptional({
    description: 'Fuente para código',
    example: 'Monaco, Consolas, monospace',
  })
  @IsOptional()
  @IsString({ message: 'La fuente de código debe ser una cadena de texto' })
  codigo?: string;
}

/**
 * DTO para la configuración de estilos del tema
 */
export class ConfiguracionEstilosDto {
  @ApiPropertyOptional({
    description: 'Border radius para elementos (en px)',
    example: '4px',
  })
  @IsOptional()
  @IsString({ message: 'El border radius debe ser una cadena de texto' })
  borderRadius?: string;

  @ApiPropertyOptional({
    description: 'Sombra para elementos',
    example: '0 2px 4px rgba(0,0,0,0.1)',
  })
  @IsOptional()
  @IsString({ message: 'La sombra debe ser una cadena de texto' })
  sombra?: string;

  @ApiPropertyOptional({
    description: 'Espaciado base (en px)',
    example: '16px',
  })
  @IsOptional()
  @IsString({ message: 'El espaciado debe ser una cadena de texto' })
  espaciado?: string;

  @ApiPropertyOptional({
    description: 'Tamaño de fuente base',
    example: '16px',
  })
  @IsOptional()
  @IsString({ message: 'El tamaño de fuente debe ser una cadena de texto' })
  fontSize?: string;

  @ApiPropertyOptional({
    description: 'Peso de fuente para texto normal',
    example: '400',
  })
  @IsOptional()
  @IsString({ message: 'El peso de fuente debe ser una cadena de texto' })
  fontWeight?: string;
}

/**
 * DTO para crear un nuevo tema
 * Sigue las convenciones de nomenclatura en español y validaciones estrictas
 */
export class CrearTemaDto {
  @ApiProperty({
    description: 'Nombre del tema',
    example: 'Tema Moderno',
    maxLength: 100,
  })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @MaxLength(100, { message: 'El nombre no puede exceder los 100 caracteres' })
  nombre: string;

  @ApiPropertyOptional({
    description: 'Descripción del tema',
    example: 'Un tema moderno con colores vibrantes y tipografía clara',
    nullable: true,
  })
  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  @MaxLength(500, { message: 'La descripción no puede exceder los 500 caracteres' })
  descripcion?: string | null;

  @ApiPropertyOptional({
    description: 'Indica si el tema está activo',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'El campo activo debe ser un valor booleano' })
  activo?: boolean;

  @ApiPropertyOptional({
    description: 'Indica si el tema es predeterminado',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'El campo esPredeterminado debe ser un valor booleano' })
  esPredeterminado?: boolean;

  @ApiProperty({
    description: 'Configuración de colores del tema',
    type: ConfiguracionColoresDto,
  })
  @IsObject({ message: 'La configuración de colores debe ser un objeto' })
  @ValidateNested()
  @Type(() => ConfiguracionColoresDto)
  colores: ConfiguracionColoresDto;

  @ApiProperty({
    description: 'Configuración de fuentes del tema',
    type: ConfiguracionFuentesDto,
  })
  @IsObject({ message: 'La configuración de fuentes debe ser un objeto' })
  @ValidateNested()
  @Type(() => ConfiguracionFuentesDto)
  fuentes: ConfiguracionFuentesDto;

  @ApiProperty({
    description: 'Configuración de estilos del tema',
    type: ConfiguracionEstilosDto,
  })
  @IsObject({ message: 'La configuración de estilos debe ser un objeto' })
  @ValidateNested()
  @Type(() => ConfiguracionEstilosDto)
  estilos: ConfiguracionEstilosDto;

  @ApiPropertyOptional({
    description: 'Configuración adicional del tema',
    example: {
      header: { altura: '60px' },
      footer: { backgroundColor: '#f8f9fa' },
      botones: { variantes: ['primario', 'secundario', 'texto'] },
    },
    nullable: true,
  })
  @IsOptional()
  @IsObject({ message: 'La configuración adicional debe ser un objeto' })
  adicional?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'ID de la tienda a la que pertenece el tema (para multi-tenant)',
    example: 'tienda_12345',
    nullable: true,
  })
  @IsOptional()
  @IsString({ message: 'El ID de la tienda debe ser una cadena de texto' })
  tiendaId?: string | null;

  /**
   * Convierte el DTO a un objeto plano para la creación
   */
  aObjetoCreacion(creadorId: string): {
    nombre: string;
    descripcion: string | null;
    activo: boolean;
    esPredeterminado: boolean;
    configuracion: Record<string, any>;
    creadorId: string;
    tiendaId: string | null;
  } {
    const configuracionCompleta = {
      colores: this.colores,
      fuentes: this.fuentes,
      estilos: this.estilos,
      ...(this.adicional && { adicional: this.adicional }),
    };

    return {
      nombre: this.nombre,
      descripcion: this.descripcion || null,
      activo: this.activo ?? false,
      esPredeterminado: this.esPredeterminado ?? false,
      configuracion: configuracionCompleta,
      creadorId,
      tiendaId: this.tiendaId || null,
    };
  }
}