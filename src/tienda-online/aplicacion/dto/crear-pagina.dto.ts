import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsBoolean, MaxLength, Matches } from 'class-validator';

/**
 * DTO para crear una nueva página
 * Sigue las convenciones de nomenclatura en español y validaciones estrictas
 */
export class CrearPaginaDto {
  @ApiProperty({
    description: 'Título de la página',
    example: 'Sobre Nosotros',
    maxLength: 255,
  })
  @IsString({ message: 'El título debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El título es requerido' })
  @MaxLength(255, { message: 'El título no puede exceder los 255 caracteres' })
  titulo: string;

  @ApiPropertyOptional({
    description: 'Contenido de la página en formato HTML o Markdown',
    example: '<h1>Bienvenidos a nuestra tienda</h1><p>Somos una empresa dedicada...</p>',
    nullable: true,
  })
  @IsOptional()
  @IsString({ message: 'El contenido debe ser una cadena de texto' })
  contenido?: string | null;

  @ApiProperty({
    description: 'Slug único para la URL de la página (solo letras minúsculas, números y guiones)',
    example: 'sobre-nosotros',
    pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$',
  })
  @IsString({ message: 'El slug debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El slug es requerido' })
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'El slug debe contener solo caracteres alfanuméricos en minúscula y guiones',
  })
  @MaxLength(100, { message: 'El slug no puede exceder los 100 caracteres' })
  slug: string;

  @ApiPropertyOptional({
    description: 'Meta título para SEO',
    example: 'Sobre Nosotros - Nuestra Empresa',
    maxLength: 60,
    nullable: true,
  })
  @IsOptional()
  @IsString({ message: 'El meta título debe ser una cadena de texto' })
  @MaxLength(60, { message: 'El meta título no puede exceder los 60 caracteres' })
  metaTitulo?: string | null;

  @ApiPropertyOptional({
    description: 'Meta descripción para SEO',
    example: 'Conoce más sobre nuestra empresa y nuestra misión',
    maxLength: 160,
    nullable: true,
  })
  @IsOptional()
  @IsString({ message: 'La meta descripción debe ser una cadena de texto' })
  @MaxLength(160, { message: 'La meta descripción no puede exceder los 160 caracteres' })
  metaDescripcion?: string | null;

  @ApiPropertyOptional({
    description: 'Indica si la página está visible públicamente',
    example: true,
    default: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'El campo visible debe ser un valor booleano' })
  visible?: boolean;

  @ApiPropertyOptional({
    description: 'ID de la tienda a la que pertenece la página (para multi-tenant)',
    example: 'tienda_12345',
    nullable: true,
  })
  @IsOptional()
  @IsString({ message: 'El ID de la tienda debe ser una cadena de texto' })
  tiendaId?: string | null;

  /**
   * Convierte el DTO a un objeto plano para la creación
   */
  aObjetoCreacion(autorId: string): {
    titulo: string;
    contenido: string | null;
    slug: string;
    metaTitulo: string | null;
    metaDescripcion: string | null;
    visible: boolean;
    autorId: string;
    tiendaId: string | null;
  } {
    return {
      titulo: this.titulo,
      contenido: this.contenido || null,
      slug: this.slug,
      metaTitulo: this.metaTitulo || null,
      metaDescripcion: this.metaDescripcion || null,
      visible: this.visible ?? false,
      autorId,
      tiendaId: this.tiendaId || null,
    };
  }
}