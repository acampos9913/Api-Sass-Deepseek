import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { 
  IsEnum, 
  IsString, 
  IsBoolean, 
  IsNumber, 
  IsArray, 
  IsOptional, 
  IsNotEmpty, 
  Min, 
  Max,
  ValidateNested,
  IsObject,
  IsEmail
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Enumeración para tipos de contacto permitidos en checkout
 */
export enum TipoContactoPermitido {
  TELEFONO_O_CORREO = 'telefono_o_correo',
  CORREO_ELECTRONICO = 'correo_electronico'
}

/**
 * Enumeración para requerimientos de nombre del cliente
 */
export enum RequerimientoNombre {
  SOLO_APELLIDO = 'solo_apellido',
  NOMBRE_Y_APELLIDO = 'nombre_y_apellido'
}

/**
 * Enumeración para requerimientos de campos opcionales/obligatorios
 */
export enum RequerimientoCampo {
  NO_INCLUIR = 'no_incluir',
  OPCIONAL = 'opcional',
  OBLIGATORIO = 'obligatorio'
}

/**
 * Enumeración para idiomas de pantalla de pago
 */
export enum IdiomaPantallaPago {
  ES = 'es',
  EN = 'en',
  FR = 'fr',
  DE = 'de',
  IT = 'it',
  PT = 'pt',
  JA = 'ja',
  ZH = 'zh',
  RU = 'ru'
}

/**
 * DTO para configuración de información de contacto
 */
export class ConfiguracionContactoDto {
  @ApiProperty({
    description: 'Tipo de contacto permitido en checkout',
    example: TipoContactoPermitido.TELEFONO_O_CORREO,
    enum: TipoContactoPermitido
  })
  @IsEnum(TipoContactoPermitido, { message: 'El tipo de contacto debe ser válido' })
  @IsNotEmpty({ message: 'El tipo de contacto es requerido' })
  tipo_contacto: TipoContactoPermitido;

  @ApiProperty({
    description: 'Requerir inicio de sesión para checkout',
    example: false
  })
  @IsBoolean({ message: 'El requerimiento de login debe ser un valor booleano' })
  requiere_login: boolean;

  @ApiProperty({
    description: 'Mostrar enlace de seguimiento con Shop',
    example: true
  })
  @IsBoolean({ message: 'Mostrar enlace Shop debe ser un valor booleano' })
  mostrar_enlace_shop: boolean;
}

/**
 * DTO para configuración de información del cliente
 */
export class ConfiguracionInformacionClienteDto {
  @ApiProperty({
    description: 'Requerimiento de nombre del cliente',
    example: RequerimientoNombre.NOMBRE_Y_APELLIDO,
    enum: RequerimientoNombre
  })
  @IsEnum(RequerimientoNombre, { message: 'El requerimiento de nombre debe ser válido' })
  @IsNotEmpty({ message: 'El requerimiento de nombre es requerido' })
  nombre_requerido: RequerimientoNombre;

  @ApiProperty({
    description: 'Inclusión de campo empresa',
    example: RequerimientoCampo.OPCIONAL,
    enum: RequerimientoCampo
  })
  @IsEnum(RequerimientoCampo, { message: 'El requerimiento de empresa debe ser válido' })
  @IsNotEmpty({ message: 'El requerimiento de empresa es requerido' })
  empresa_incluir: RequerimientoCampo;

  @ApiProperty({
    description: 'Inclusión de línea de dirección 2',
    example: RequerimientoCampo.OPCIONAL,
    enum: RequerimientoCampo
  })
  @IsEnum(RequerimientoCampo, { message: 'El requerimiento de dirección 2 debe ser válido' })
  @IsNotEmpty({ message: 'El requerimiento de dirección 2 es requerido' })
  linea_direccion_2: RequerimientoCampo;

  @ApiProperty({
    description: 'Inclusión de teléfono en envío',
    example: RequerimientoCampo.OBLIGATORIO,
    enum: RequerimientoCampo
  })
  @IsEnum(RequerimientoCampo, { message: 'El requerimiento de teléfono debe ser válido' })
  @IsNotEmpty({ message: 'El requerimiento de teléfono es requerido' })
  telefono_envio: RequerimientoCampo;
}

/**
 * DTO para configuración de opciones de marketing
 */
export class ConfiguracionMarketingDto {
  @ApiProperty({
    description: 'Consentimiento para marketing por email',
    example: true
  })
  @IsBoolean({ message: 'El consentimiento de email marketing debe ser un valor booleano' })
  email_marketing: boolean;

  @ApiProperty({
    description: 'Consentimiento para marketing por SMS',
    example: false
  })
  @IsBoolean({ message: 'El consentimiento de SMS marketing debe ser un valor booleano' })
  sms_marketing: boolean;
}

/**
 * DTO para configuración de propinas
 */
export class ConfiguracionPropinasDto {
  @ApiProperty({
    description: 'Habilitar opciones de propina',
    example: true
  })
  @IsBoolean({ message: 'La habilitación de propinas debe ser un valor booleano' })
  propinas_habilitadas: boolean;

  @ApiPropertyOptional({
    description: 'Monto personalizado para propina',
    example: 0,
    minimum: 0
  })
  @IsOptional()
  @IsNumber({}, { message: 'El monto personalizado debe ser un número' })
  @Min(0, { message: 'El monto personalizado no puede ser negativo' })
  monto_personalizado?: number;

  @ApiPropertyOptional({
    description: 'Opciones predefinidas de propina (porcentajes)',
    example: [10, 15, 20],
    type: [Number]
  })
  @IsOptional()
  @IsArray({ message: 'Las opciones de propina deben ser un array' })
  @IsNumber({}, { each: true, message: 'Cada opción de propina debe ser un número' })
  @Min(0, { each: true, message: 'Las opciones de propina no pueden ser negativas' })
  opciones_predefinidas?: number[];
}

/**
 * DTO para configuración de idioma y personalización
 */
export class ConfiguracionIdiomaPersonalizacionDto {
  @ApiProperty({
    description: 'Idioma de la pantalla de pago',
    example: IdiomaPantallaPago.ES,
    enum: IdiomaPantallaPago
  })
  @IsEnum(IdiomaPantallaPago, { message: 'El idioma debe ser válido' })
  @IsNotEmpty({ message: 'El idioma es requerido' })
  idioma_checkout: IdiomaPantallaPago;

  @ApiPropertyOptional({
    description: 'Contenido personalizado para checkout',
    example: {
      titulo_checkout: 'Finalizar compra',
      texto_boton_pago: 'Pagar ahora',
      mensaje_confirmacion: '¡Gracias por tu compra!'
    }
  })
  @IsOptional()
  @IsObject({ message: 'El contenido personalizado debe ser un objeto' })
  contenido_personalizado?: Record<string, any>;
}

/**
 * DTO para configuración de reglas avanzadas
 */
export class ConfiguracionReglasAvanzadasDto {
  @ApiPropertyOptional({
    description: 'Límite de productos agregados al carrito',
    example: 100,
    minimum: 1
  })
  @IsOptional()
  @IsNumber({}, { message: 'El límite de agregado al carrito debe ser un número' })
  @Min(1, { message: 'El límite de agregado al carrito debe ser al menos 1' })
  limite_agregado_carrito?: number;

  @ApiPropertyOptional({
    description: 'Reglas automáticas de pago',
    example: [
      {
        condicion: 'monto_total > 1000',
        accion: 'requerir_autenticacion'
      }
    ]
  })
  @IsOptional()
  @IsArray({ message: 'Las reglas de pago deben ser un array' })
  reglas_pago?: Array<{
    condicion: string;
    accion: string;
  }>;

  @ApiPropertyOptional({
    description: 'Verificaciones automáticas (edad mínima, etc.)',
    example: [
      {
        tipo: 'edad_minima',
        valor: 18,
        mensaje: 'Debes ser mayor de edad para realizar esta compra'
      }
    ]
  })
  @IsOptional()
  @IsArray({ message: 'Las verificaciones deben ser un array' })
  verificaciones?: Array<{
    tipo: string;
    valor: any;
    mensaje: string;
  }>;
}

/**
 * DTO para crear configuración de pantalla de pago
 */
export class CrearConfiguracionPantallaPagoDto {
  @ApiProperty({
    description: 'ID de la tienda',
    example: 'tienda-123'
  })
  @IsString({ message: 'El ID de la tienda debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El ID de la tienda es requerido' })
  tiendaId: string;

  @ApiProperty({
    description: 'Configuración de información de contacto',
    type: ConfiguracionContactoDto
  })
  @ValidateNested()
  @Type(() => ConfiguracionContactoDto)
  configuracion_contacto: ConfiguracionContactoDto;

  @ApiProperty({
    description: 'Configuración de información del cliente',
    type: ConfiguracionInformacionClienteDto
  })
  @ValidateNested()
  @Type(() => ConfiguracionInformacionClienteDto)
  configuracion_informacion_cliente: ConfiguracionInformacionClienteDto;

  @ApiProperty({
    description: 'Configuración de opciones de marketing',
    type: ConfiguracionMarketingDto
  })
  @ValidateNested()
  @Type(() => ConfiguracionMarketingDto)
  configuracion_marketing: ConfiguracionMarketingDto;

  @ApiProperty({
    description: 'Configuración de propinas',
    type: ConfiguracionPropinasDto
  })
  @ValidateNested()
  @Type(() => ConfiguracionPropinasDto)
  configuracion_propinas: ConfiguracionPropinasDto;

  @ApiProperty({
    description: 'Configuración de idioma y personalización',
    type: ConfiguracionIdiomaPersonalizacionDto
  })
  @ValidateNested()
  @Type(() => ConfiguracionIdiomaPersonalizacionDto)
  configuracion_idioma_personalizacion: ConfiguracionIdiomaPersonalizacionDto;

  @ApiPropertyOptional({
    description: 'Configuración de reglas avanzadas',
    type: ConfiguracionReglasAvanzadasDto
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ConfiguracionReglasAvanzadasDto)
  configuracion_reglas_avanzadas?: ConfiguracionReglasAvanzadasDto;

  @ApiPropertyOptional({
    description: 'Configuración adicional personalizada',
    example: { tema_colores: 'azul', mostrar_logo: true }
  })
  @IsOptional()
  configuracion_adicional?: Record<string, any>;
}

/**
 * DTO para actualizar configuración de pantalla de pago
 */
export class ActualizarConfiguracionPantallaPagoDto {
  @ApiPropertyOptional({
    description: 'Configuración de información de contacto',
    type: ConfiguracionContactoDto
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ConfiguracionContactoDto)
  configuracion_contacto?: ConfiguracionContactoDto;

  @ApiPropertyOptional({
    description: 'Configuración de información del cliente',
    type: ConfiguracionInformacionClienteDto
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ConfiguracionInformacionClienteDto)
  configuracion_informacion_cliente?: ConfiguracionInformacionClienteDto;

  @ApiPropertyOptional({
    description: 'Configuración de opciones de marketing',
    type: ConfiguracionMarketingDto
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ConfiguracionMarketingDto)
  configuracion_marketing?: ConfiguracionMarketingDto;

  @ApiPropertyOptional({
    description: 'Configuración de propinas',
    type: ConfiguracionPropinasDto
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ConfiguracionPropinasDto)
  configuracion_propinas?: ConfiguracionPropinasDto;

  @ApiPropertyOptional({
    description: 'Configuración de idioma y personalización',
    type: ConfiguracionIdiomaPersonalizacionDto
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ConfiguracionIdiomaPersonalizacionDto)
  configuracion_idioma_personalizacion?: ConfiguracionIdiomaPersonalizacionDto;

  @ApiPropertyOptional({
    description: 'Configuración de reglas avanzadas',
    type: ConfiguracionReglasAvanzadasDto
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ConfiguracionReglasAvanzadasDto)
  configuracion_reglas_avanzadas?: ConfiguracionReglasAvanzadasDto;

  @ApiPropertyOptional({
    description: 'Configuración adicional personalizada',
    example: { tema_colores: 'azul', mostrar_logo: true }
  })
  @IsOptional()
  configuracion_adicional?: Record<string, any>;
}

/**
 * DTO para respuesta de configuración de pantalla de pago
 */
export class RespuestaConfiguracionPantallaPagoDto {
  @ApiProperty({
    description: 'ID de la configuración',
    example: 'config-pantalla-pago-123'
  })
  id: string;

  @ApiProperty({
    description: 'ID de la tienda',
    example: 'tienda-123'
  })
  tiendaId: string;

  @ApiProperty({
    description: 'Configuración de información de contacto',
    type: ConfiguracionContactoDto
  })
  configuracion_contacto: ConfiguracionContactoDto;

  @ApiProperty({
    description: 'Configuración de información del cliente',
    type: ConfiguracionInformacionClienteDto
  })
  configuracion_informacion_cliente: ConfiguracionInformacionClienteDto;

  @ApiProperty({
    description: 'Configuración de opciones de marketing',
    type: ConfiguracionMarketingDto
  })
  configuracion_marketing: ConfiguracionMarketingDto;

  @ApiProperty({
    description: 'Configuración de propinas',
    type: ConfiguracionPropinasDto
  })
  configuracion_propinas: ConfiguracionPropinasDto;

  @ApiProperty({
    description: 'Configuración de idioma y personalización',
    type: ConfiguracionIdiomaPersonalizacionDto
  })
  configuracion_idioma_personalizacion: ConfiguracionIdiomaPersonalizacionDto;

  @ApiPropertyOptional({
    description: 'Configuración de reglas avanzadas',
    type: ConfiguracionReglasAvanzadasDto
  })
  configuracion_reglas_avanzadas?: ConfiguracionReglasAvanzadasDto;

  @ApiPropertyOptional({
    description: 'Configuración adicional personalizada',
    example: { tema_colores: 'azul', mostrar_logo: true }
  })
  configuracion_adicional?: Record<string, any>;

  @ApiProperty({
    description: 'Fecha de creación',
    example: '2024-01-01T00:00:00.000Z'
  })
  fecha_creacion: Date;

  @ApiProperty({
    description: 'Fecha de última actualización',
    example: '2024-01-01T00:00:00.000Z'
  })
  fecha_actualizacion: Date;
}

/**
 * DTO para criterios de búsqueda de configuraciones de pantalla de pago
 */
export class CriteriosBusquedaPantallaPagoDto {
  @ApiPropertyOptional({
    description: 'Buscar por tipo de contacto específico',
    enum: TipoContactoPermitido
  })
  @IsOptional()
  @IsEnum(TipoContactoPermitido, { message: 'El tipo de contacto debe ser válido' })
  tipo_contacto?: TipoContactoPermitido;

  @ApiPropertyOptional({
    description: 'Buscar configuraciones que requieran login',
    example: true
  })
  @IsOptional()
  @IsBoolean({ message: 'El filtro de login debe ser un valor booleano' })
  requiere_login?: boolean;

  @ApiPropertyOptional({
    description: 'Buscar configuraciones con propinas habilitadas',
    example: true
  })
  @IsOptional()
  @IsBoolean({ message: 'El filtro de propinas debe ser un valor booleano' })
  propinas_habilitadas?: boolean;

  @ApiPropertyOptional({
    description: 'Buscar por idioma específico',
    enum: IdiomaPantallaPago
  })
  @IsOptional()
  @IsEnum(IdiomaPantallaPago, { message: 'El idioma debe ser válido' })
  idioma_checkout?: IdiomaPantallaPago;

  @ApiPropertyOptional({
    description: 'Buscar configuraciones con marketing por email habilitado',
    example: true
  })
  @IsOptional()
  @IsBoolean({ message: 'El filtro de email marketing debe ser un valor booleano' })
  email_marketing?: boolean;
}