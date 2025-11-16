import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString, IsUrl, IsArray, ValidateIf, ArrayNotEmpty } from 'class-validator';

export enum ModoCuentas {
  RECOMENDADO = 'recomendado',
  CLASICO = 'clásico',
}

export enum MetodoAutenticacion {
  CODIGO_UNICO_USO = 'código de un solo uso',
  CONTRASENA = 'contraseña',
}

export class ReglaDevolucionDto {
  @ApiProperty({ description: 'Condición para aplicar la regla de devolución' })
  @IsString()
  @IsNotEmpty()
  condicion: string;

  @ApiProperty({ description: 'Límite de tiempo para devolución en días' })
  @IsNotEmpty()
  limite_dias: number;

  @ApiProperty({ description: 'Productos excluidos de la devolución' })
  @IsArray()
  @IsOptional()
  productos_excluidos?: string[];

  @ApiProperty({ description: 'Condiciones adicionales' })
  @IsOptional()
  condiciones_adicionales?: Record<string, any>;
}

export class ConfiguracionCuentasClienteDto {
  @ApiProperty({ 
    description: 'Modo de cuentas de cliente',
    enum: ModoCuentas,
    example: ModoCuentas.RECOMENDADO
  })
  @IsEnum(ModoCuentas)
  @IsNotEmpty()
  modo_cuentas: ModoCuentas;

  @ApiProperty({ 
    description: 'Método de autenticación',
    enum: MetodoAutenticacion,
    example: MetodoAutenticacion.CODIGO_UNICO_USO
  })
  @IsEnum(MetodoAutenticacion)
  @IsNotEmpty()
  metodo_autenticacion: MetodoAutenticacion;

  @ApiProperty({ 
    description: 'Mostrar enlaces de inicio de sesión',
    default: true
  })
  @IsBoolean()
  @IsOptional()
  mostrar_enlaces_inicio?: boolean;

  @ApiProperty({ 
    description: 'Apps conectadas a la cuenta',
    type: [String],
    example: ['app-123', 'app-456']
  })
  @IsArray()
  @IsOptional()
  apps_conectadas?: string[];

  @ApiProperty({ 
    description: 'Personalización activa para cuentas',
    default: false
  })
  @IsBoolean()
  @IsOptional()
  personalizacion?: boolean;

  @ApiProperty({ 
    description: 'Función de crédito en tienda activa',
    default: false
  })
  @IsBoolean()
  @IsOptional()
  credito_tienda?: boolean;

  @ApiProperty({ 
    description: 'Permitir devoluciones autoservicio',
    default: false
  })
  @IsBoolean()
  @IsOptional()
  devolucion_autoservicio?: boolean;

  @ApiProperty({ 
    description: 'Reglas de devolución asociadas',
    type: [ReglaDevolucionDto],
    example: [{
      condicion: 'Productos no personalizados',
      limite_dias: 30,
      productos_excluidos: ['prod-123'],
      condiciones_adicionales: { requiere_embalaje_original: true }
    }]
  })
  @IsArray()
  @IsOptional()
  reglas_devolucion?: ReglaDevolucionDto[];

  @ApiProperty({ 
    description: 'URL de inicio de sesión/gestión de cuenta',
    example: 'https://mitienda.com/cuenta'
  })
  @IsUrl({ protocols: ['https'] })
  @IsOptional()
  url_cuenta?: string;

  @ApiProperty({ 
    description: 'Dominio personalizado para cuentas',
    example: 'cuentas.mitienda.com'
  })
  @IsString()
  @IsOptional()
  dominio?: string;

  @ValidateIf(o => o.modo_cuentas === ModoCuentas.RECOMENDADO)
  @IsEnum(MetodoAutenticacion, { 
    message: 'En modo recomendado solo se permite código de un solo uso' 
  })
  validarMetodoAutenticacionRecomendado() {
    return this.modo_cuentas === ModoCuentas.RECOMENDADO 
      ? this.metodo_autenticacion === MetodoAutenticacion.CODIGO_UNICO_USO
      : true;
  }
}

export class ActualizarConfiguracionCuentasClienteDto extends ConfiguracionCuentasClienteDto {
  @ApiProperty({ 
    description: 'ID de la tienda',
    example: 'tienda-123'
  })
  @IsString()
  @IsNotEmpty()
  tienda_id: string;
}

export class CrearConfiguracionCuentasClienteDto extends ConfiguracionCuentasClienteDto {
  @ApiProperty({ 
    description: 'ID de la tienda',
    example: 'tienda-123'
  })
  @IsString()
  @IsNotEmpty()
  tienda_id: string;
}