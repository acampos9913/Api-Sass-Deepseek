import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsBoolean, IsArray, IsString, IsOptional, IsUrl, ValidateNested, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { TipoMetodoAutenticacion } from '../../dominio/enums/tipo-metodo-autenticacion.enum';

export class ReglaDevolucionDto {
  @ApiProperty({ description: 'Condición de la regla de devolución', example: 'Producto en buen estado' })
  @IsString()
  condicion: string;

  @ApiProperty({ description: 'Límite de días para devolución', example: 30 })
  @IsNumber()
  @Min(0)
  limite: number;

  @ApiProperty({ description: 'Si la regla es aplicable', example: true })
  @IsBoolean()
  aplicable: boolean;
}

export class MetodoAutenticacionDto {
  @ApiProperty({ enum: TipoMetodoAutenticacion, description: 'Tipo de método de autenticación' })
  @IsEnum(TipoMetodoAutenticacion)
  tipo: TipoMetodoAutenticacion;

  @ApiProperty({ description: 'Si el método está habilitado', example: true })
  @IsBoolean()
  habilitado: boolean;

  @ApiProperty({ description: 'Configuración específica del método', type: Object })
  @IsOptional()
  configuracion?: any;
}

export class ConfiguracionUsuariosDto {
  @ApiProperty({ enum: ['recomendado', 'clasico'], description: 'Modo de cuentas' })
  @IsEnum(['recomendado', 'clasico'])
  modoCuentas: 'recomendado' | 'clasico';

  @ApiProperty({ enum: ['codigo_unico', 'contrasena'], description: 'Método de autenticación' })
  @IsEnum(['codigo_unico', 'contrasena'])
  metodoAutenticacion: 'codigo_unico' | 'contrasena';

  @ApiProperty({ description: 'Mostrar enlaces de inicio de sesión', example: true })
  @IsBoolean()
  mostrarEnlacesInicioSesion: boolean;

  @ApiProperty({ description: 'Apps conectadas', type: [String], example: ['app1', 'app2'] })
  @IsArray()
  @IsString({ each: true })
  appsConectadas: string[];

  @ApiProperty({ description: 'Personalización activa', example: false })
  @IsBoolean()
  personalizacionActiva: boolean;

  @ApiProperty({ description: 'Crédito en tienda', example: false })
  @IsBoolean()
  creditoTienda: boolean;

  @ApiProperty({ description: 'Devolución autoservicio', example: false })
  @IsBoolean()
  devolucionAutoservicio: boolean;

  @ApiProperty({ type: [ReglaDevolucionDto], description: 'Reglas de devolución' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReglaDevolucionDto)
  reglasDevolucion: ReglaDevolucionDto[];

  @ApiProperty({ description: 'URL de la cuenta', example: 'https://tienda.com/cuenta' })
  @IsUrl()
  @IsOptional()
  urlCuenta?: string;

  @ApiProperty({ description: 'Dominio personalizado', example: 'mi-tienda.com', required: false })
  @IsString()
  @IsOptional()
  dominioPersonalizado?: string;

  @ApiProperty({ type: [MetodoAutenticacionDto], description: 'Métodos de autenticación' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MetodoAutenticacionDto)
  metodosAutenticacion: MetodoAutenticacionDto[];
}

export class ActualizarConfiguracionUsuariosDto {
  @ApiProperty({ enum: ['recomendado', 'clasico'], description: 'Modo de cuentas', required: false })
  @IsEnum(['recomendado', 'clasico'])
  @IsOptional()
  modoCuentas?: 'recomendado' | 'clasico';

  @ApiProperty({ enum: ['codigo_unico', 'contrasena'], description: 'Método de autenticación', required: false })
  @IsEnum(['codigo_unico', 'contrasena'])
  @IsOptional()
  metodoAutenticacion?: 'codigo_unico' | 'contrasena';

  @ApiProperty({ description: 'Mostrar enlaces de inicio de sesión', example: true, required: false })
  @IsBoolean()
  @IsOptional()
  mostrarEnlacesInicioSesion?: boolean;

  @ApiProperty({ description: 'Apps conectadas', type: [String], example: ['app1', 'app2'], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  appsConectadas?: string[];

  @ApiProperty({ description: 'Personalización activa', example: false, required: false })
  @IsBoolean()
  @IsOptional()
  personalizacionActiva?: boolean;

  @ApiProperty({ description: 'Crédito en tienda', example: false, required: false })
  @IsBoolean()
  @IsOptional()
  creditoTienda?: boolean;

  @ApiProperty({ description: 'Devolución autoservicio', example: false, required: false })
  @IsBoolean()
  @IsOptional()
  devolucionAutoservicio?: boolean;

  @ApiProperty({ type: [ReglaDevolucionDto], description: 'Reglas de devolución', required: false })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReglaDevolucionDto)
  @IsOptional()
  reglasDevolucion?: ReglaDevolucionDto[];

  @ApiProperty({ description: 'URL de la cuenta', example: 'https://tienda.com/cuenta', required: false })
  @IsUrl()
  @IsOptional()
  urlCuenta?: string;

  @ApiProperty({ description: 'Dominio personalizado', example: 'mi-tienda.com', required: false })
  @IsString()
  @IsOptional()
  dominioPersonalizado?: string;

  @ApiProperty({ type: [MetodoAutenticacionDto], description: 'Métodos de autenticación', required: false })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MetodoAutenticacionDto)
  @IsOptional()
  metodosAutenticacion?: MetodoAutenticacionDto[];
}

export class AgregarAppConectadaDto {
  @ApiProperty({ description: 'ID de la app a conectar', example: 'app-123' })
  @IsString()
  appId: string;
}

export class AgregarReglaDevolucionDto {
  @ApiProperty({ description: 'Condición de la regla', example: 'Producto en buen estado' })
  @IsString()
  condicion: string;

  @ApiProperty({ description: 'Límite de días para devolución', example: 30 })
  @IsNumber()
  @Min(0)
  limite: number;

  @ApiProperty({ description: 'Si la regla es aplicable', example: true })
  @IsBoolean()
  aplicable: boolean;
}

export class ActualizarReglaDevolucionDto {
  @ApiProperty({ description: 'Condición de la regla', example: 'Producto en buen estado', required: false })
  @IsString()
  @IsOptional()
  condicion?: string;

  @ApiProperty({ description: 'Límite de días para devolución', example: 30, required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  limite?: number;

  @ApiProperty({ description: 'Si la regla es aplicable', example: true, required: false })
  @IsBoolean()
  @IsOptional()
  aplicable?: boolean;
}

export class AgregarMetodoAutenticacionDto {
  @ApiProperty({ enum: TipoMetodoAutenticacion, description: 'Tipo de método de autenticación' })
  @IsEnum(TipoMetodoAutenticacion)
  tipo: TipoMetodoAutenticacion;

  @ApiProperty({ description: 'Si el método está habilitado', example: true })
  @IsBoolean()
  habilitado: boolean;

  @ApiProperty({ description: 'Configuración específica del método', type: Object })
  @IsOptional()
  configuracion?: any;
}

export class ActualizarMetodoAutenticacionDto {
  @ApiProperty({ description: 'Si el método está habilitado', example: true, required: false })
  @IsBoolean()
  @IsOptional()
  habilitado?: boolean;

  @ApiProperty({ description: 'Configuración específica del método', type: Object, required: false })
  @IsOptional()
  configuracion?: any;
}

export class ReglaCreditoDto {
  @ApiProperty({ description: 'Condición de la regla de crédito', example: 'Cliente frecuente' })
  @IsString()
  condicion: string;

  @ApiProperty({ description: 'Monto máximo de crédito', example: 1000 })
  @IsNumber()
  @Min(0)
  montoMaximo: number;

  @ApiProperty({ description: 'Si la regla es aplicable', example: true })
  @IsBoolean()
  aplicable: boolean;
}

export class AgregarReglaCreditoDto {
  @ApiProperty({ description: 'Condición de la regla', example: 'Cliente frecuente' })
  @IsString()
  condicion: string;

  @ApiProperty({ description: 'Monto máximo de crédito', example: 1000 })
  @IsNumber()
  @Min(0)
  montoMaximo: number;

  @ApiProperty({ description: 'Si la regla es aplicable', example: true })
  @IsBoolean()
  aplicable: boolean;
}

export class ActualizarReglaCreditoDto {
  @ApiProperty({ description: 'Condición de la regla', example: 'Cliente frecuente', required: false })
  @IsString()
  @IsOptional()
  condicion?: string;

  @ApiProperty({ description: 'Monto máximo de crédito', example: 1000, required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  montoMaximo?: number;

  @ApiProperty({ description: 'Si la regla es aplicable', example: true, required: false })
  @IsBoolean()
  @IsOptional()
  aplicable?: boolean;
}