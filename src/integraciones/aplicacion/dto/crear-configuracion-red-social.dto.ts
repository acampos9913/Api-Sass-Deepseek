import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, IsOptional, IsObject, IsBoolean, IsDate, MinLength, ValidateIf, Validate } from 'class-validator';
import { Type } from 'class-transformer';
import { nanoid } from 'nanoid';
import { TipoRedSocial } from '../../dominio/enums/tipo-red-social.enum';
import { ConfiguracionRedSocial } from '../../dominio/entidades/configuracion-red-social.entity';

/**
 * DTO para crear una configuración de integración con red social
 * Valida y documenta los datos necesarios para conectar una tienda con una red social
 */
export class CrearConfiguracionRedSocialDto {
  @ApiProperty({
    description: 'ID de la tienda que se va a conectar con la red social',
    example: 'tienda_123456789',
  })
  @IsNotEmpty({ message: 'El ID de la tienda es requerido' })
  @IsString({ message: 'El ID de la tienda debe ser una cadena de texto' })
  tienda_id: string;

  @ApiProperty({
    description: 'Tipo de red social a la que se va a conectar',
    enum: TipoRedSocial,
    example: TipoRedSocial.FACEBOOK,
  })
  @IsNotEmpty({ message: 'El tipo de red social es requerido' })
  @IsEnum(TipoRedSocial, { message: 'El tipo de red social debe ser uno de los valores permitidos' })
  tipo_red_social: TipoRedSocial;

  @ApiProperty({
    description: 'Nombre de la cuenta en la red social',
    example: 'Mi Tienda Online',
    minLength: 3,
  })
  @IsNotEmpty({ message: 'El nombre de la cuenta es requerido' })
  @IsString({ message: 'El nombre de la cuenta debe ser una cadena de texto' })
  @MinLength(3, { message: 'El nombre de la cuenta debe tener al menos 3 caracteres' })
  nombre_cuenta: string;

  @ApiProperty({
    description: 'Token de acceso proporcionado por la red social',
    example: 'EAABwzLixnjYBO...',
    minLength: 10,
  })
  @IsNotEmpty({ message: 'El token de acceso es requerido' })
  @IsString({ message: 'El token de acceso debe ser una cadena de texto' })
  @MinLength(10, { message: 'El token de acceso parece ser inválido' })
  token_acceso: string;

  @ApiPropertyOptional({
    description: 'Token de renovación para obtener nuevos tokens de acceso',
    example: 'EAABwzLixnjYBO...',
  })
  @IsOptional()
  @IsString({ message: 'El token de renovación debe ser una cadena de texto' })
  token_renovacion?: string;

  @ApiPropertyOptional({
    description: 'Fecha de expiración del token de acceso',
    example: '2024-12-31T23:59:59.999Z',
  })
  @IsOptional()
  @IsDate({ message: 'La fecha de expiración debe ser una fecha válida' })
  @Type(() => Date)
  @ValidateIf(o => o.fecha_expiracion_token !== undefined)
  fecha_expiracion_token?: Date;

  @ApiPropertyOptional({
    description: 'Configuración adicional específica de la red social',
    example: {
      pagina_id: '123456789',
      permisos: ['pages_manage_posts', 'pages_read_engagement'],
      api_version: 'v19.0',
      catalog_id: '123456789012345', // Para WhatsApp Business
    },
  })
  @IsOptional()
  @IsObject({ message: 'La configuración adicional debe ser un objeto' })
  @Validate((object: CrearConfiguracionRedSocialDto) => {
    if (object.tipo_red_social === TipoRedSocial.WHATSAPP) {
      if (!object.configuracion_adicional?.catalog_id) {
        throw new Error('Para WhatsApp Business se requiere el catalog_id en la configuración adicional');
      }
    }
    return true;
  }, {
    message: 'Para WhatsApp Business se requiere el catalog_id en la configuración adicional'
  })
  configuracion_adicional?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Indica si la configuración está activa',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'El estado activo debe ser un valor booleano' })
  activa?: boolean;

  /**
   * Convierte el DTO a una entidad de dominio ConfiguracionRedSocial
   * @param tiendaId - ID de la tienda (si no se proporciona en el DTO)
   * @returns Instancia de ConfiguracionRedSocial
   */
  aEntidadDominio(tiendaId?: string): ConfiguracionRedSocial {
    const id = `config_rs_${Date.now()}_${nanoid(10)}`;
    const tiendaIdFinal = tiendaId || this.tienda_id;
    
    return ConfiguracionRedSocial.crear({
      id,
      tienda_id: tiendaIdFinal,
      tipo_red_social: this.tipo_red_social,
      nombre_cuenta: this.nombre_cuenta,
      token_acceso: this.token_acceso,
      token_renovacion: this.token_renovacion,
      fecha_expiracion_token: this.fecha_expiracion_token,
      configuracion_adicional: this.configuracion_adicional || {},
      activa: this.activa !== undefined ? this.activa : true,
    });
  }
}

/**
 * DTO para la respuesta de creación de configuración de red social
 */
export class CrearConfiguracionRedSocialRespuestaDto {
  @ApiProperty({
    description: 'Mensaje descriptivo del resultado de la operación',
    example: 'Configuración de FACEBOOK creada exitosamente',
  })
  mensaje: string;

  @ApiProperty({
    description: 'Datos de la configuración creada',
    type: Object,
    example: {
      id: 'config_rs_1702500000000_abc123def',
      tienda_id: 'tienda_123456789',
      tipo_red_social: 'FACEBOOK',
      nombre_cuenta: 'Mi Tienda Online',
      activa: true,
      fecha_creacion: '2024-01-15T10:30:00.000Z',
      fecha_actualizacion: '2024-01-15T10:30:00.000Z',
    },
  })
  data: any;

  @ApiProperty({
    description: 'Tipo de mensaje para el cliente',
    enum: ['Exito', 'ErrorCliente', 'ErrorServidor', 'Advertencia'],
    example: 'Exito',
  })
  tipo_mensaje: string;

  @ApiProperty({
    description: 'Estado interno de la respuesta',
    example: 201,
  })
  estado_respuesta: number;
}

/**
 * DTO para listar configuraciones de redes sociales
 */
export class ListaConfiguracionesRedSocialRespuestaDto {
  @ApiProperty({
    description: 'Mensaje descriptivo del resultado de la operación',
    example: 'Lista de configuraciones obtenida exitosamente',
  })
  mensaje: string;

  @ApiProperty({
    description: 'Datos de la lista de configuraciones con paginación',
    type: Object,
    example: {
      elementos: [
        {
          id: 'config_rs_1702500000000_abc123def',
          tienda_id: 'tienda_123456789',
          tipo_red_social: 'FACEBOOK',
          nombre_cuenta: 'Mi Tienda Online',
          activa: true,
          fecha_creacion: '2024-01-15T10:30:00.000Z',
          fecha_actualizacion: '2024-01-15T10:30:00.000Z',
        },
      ],
      paginacion: {
        total_elementos: 1,
        total_paginas: 1,
        pagina_actual: 1,
        limite: 10,
      },
    },
  })
  data: {
    elementos: any[];
    paginacion: {
      total_elementos: number;
      total_paginas: number;
      pagina_actual: number;
      limite: number;
    };
  };

  @ApiProperty({
    description: 'Tipo de mensaje para el cliente',
    enum: ['Exito', 'ErrorCliente', 'ErrorServidor', 'Advertencia'],
    example: 'Exito',
  })
  tipo_mensaje: string;

  @ApiProperty({
    description: 'Estado interno de la respuesta',
    example: 200,
  })
  estado_respuesta: number;
}

/**
 * DTO para filtros de búsqueda de configuraciones
 */
export class FiltrosConfiguracionRedSocialDto {
  @ApiPropertyOptional({
    description: 'ID de la tienda para filtrar',
    example: 'tienda_123456789',
  })
  @IsOptional()
  @IsString({ message: 'El ID de la tienda debe ser una cadena de texto' })
  tienda_id?: string;

  @ApiPropertyOptional({
    description: 'Tipo de red social para filtrar',
    enum: TipoRedSocial,
    example: TipoRedSocial.FACEBOOK,
  })
  @IsOptional()
  @IsEnum(TipoRedSocial, { message: 'El tipo de red social debe ser uno de los valores permitidos' })
  tipo_red_social?: TipoRedSocial;

  @ApiPropertyOptional({
    description: 'Estado de activación para filtrar',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'El estado activo debe ser un valor booleano' })
  activa?: boolean;

  @ApiPropertyOptional({
    description: 'Número de página para la paginación',
    example: 1,
    default: 1,
  })
  @IsOptional()
  pagina?: number;

  @ApiPropertyOptional({
    description: 'Límite de resultados por página',
    example: 10,
    default: 10,
  })
  @IsOptional()
  limite?: number;
}

/**
 * DTO para actualizar una configuración de red social
 */
export class ActualizarConfiguracionRedSocialDto {
  @ApiPropertyOptional({
    description: 'Nombre de la cuenta en la red social',
    example: 'Mi Tienda Online Actualizada',
    minLength: 3,
  })
  @IsOptional()
  @IsString({ message: 'El nombre de la cuenta debe ser una cadena de texto' })
  @MinLength(3, { message: 'El nombre de la cuenta debe tener al menos 3 caracteres' })
  nombre_cuenta?: string;

  @ApiPropertyOptional({
    description: 'Token de acceso actualizado',
    example: 'EAABwzLixnjYBO...nuevo',
    minLength: 10,
  })
  @IsOptional()
  @IsString({ message: 'El token de acceso debe ser una cadena de texto' })
  @MinLength(10, { message: 'El token de acceso parece ser inválido' })
  token_acceso?: string;

  @ApiPropertyOptional({
    description: 'Token de renovación actualizado',
    example: 'EAABwzLixnjYBO...nuevo',
  })
  @IsOptional()
  @IsString({ message: 'El token de renovación debe ser una cadena de texto' })
  token_renovacion?: string;

  @ApiPropertyOptional({
    description: 'Nueva fecha de expiración del token de acceso',
    example: '2024-12-31T23:59:59.999Z',
  })
  @IsOptional()
  @IsDate({ message: 'La fecha de expiración debe ser una fecha válida' })
  @Type(() => Date)
  @ValidateIf(o => o.fecha_expiracion_token !== undefined)
  fecha_expiracion_token?: Date;

  @ApiPropertyOptional({
    description: 'Configuración adicional actualizada',
    example: {
      pagina_id: '123456789',
      permisos: ['pages_manage_posts', 'pages_read_engagement', 'pages_manage_metadata'],
      api_version: 'v19.0',
    },
  })
  @IsOptional()
  @IsObject({ message: 'La configuración adicional debe ser un objeto' })
  configuracion_adicional?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Estado de activación de la configuración',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'El estado activo debe ser un valor booleano' })
  activa?: boolean;
}