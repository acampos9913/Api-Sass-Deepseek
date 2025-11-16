import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class PrivilegioRolDto {
  @ApiProperty({ description: 'Nombre del privilegio', example: 'gestionar_usuarios' })
  @IsNotEmpty({ message: 'El nombre del privilegio es requerido' })
  @IsString({ message: 'El nombre del privilegio debe ser una cadena de texto' })
  nombre: string;

  @ApiProperty({ description: 'Descripción del privilegio', example: 'Permite gestionar usuarios del sistema' })
  @IsNotEmpty({ message: 'La descripción del privilegio es requerida' })
  @IsString({ message: 'La descripción del privilegio debe ser una cadena de texto' })
  descripcion: string;

  @ApiProperty({ description: 'Si el privilegio está habilitado', example: true })
  @IsBoolean({ message: 'El estado del privilegio debe ser un booleano' })
  habilitado: boolean;
}

export class LimitacionRolDto {
  @ApiProperty({ description: 'Nombre de la limitación', example: 'acceso_datos_financieros' })
  @IsNotEmpty({ message: 'El nombre de la limitación es requerido' })
  @IsString({ message: 'El nombre de la limitación debe ser una cadena de texto' })
  nombre: string;

  @ApiProperty({ description: 'Descripción de la limitación', example: 'No puede acceder a información financiera' })
  @IsNotEmpty({ message: 'La descripción de la limitación es requerida' })
  @IsString({ message: 'La descripción de la limitación debe ser una cadena de texto' })
  descripcion: string;

  @ApiProperty({ description: 'Si la limitación está activa', example: true })
  @IsBoolean({ message: 'El estado de la limitación debe ser un booleano' })
  activa: boolean;
}

export class CrearRolDto {
  @ApiProperty({ description: 'Nombre del rol', example: 'Administrador' })
  @IsNotEmpty({ message: 'El nombre del rol es requerido' })
  @IsString({ message: 'El nombre del rol debe ser una cadena de texto' })
  nombre: string;

  @ApiProperty({ description: 'Descripción del rol', example: 'Rol con permisos completos del sistema' })
  @IsNotEmpty({ message: 'La descripción del rol es requerida' })
  @IsString({ message: 'La descripción del rol debe ser una cadena de texto' })
  descripcion: string;

  @ApiProperty({ description: 'Si el rol es gestionado por Shopify', example: false })
  @IsBoolean({ message: 'El indicador de gestión por Shopify debe ser un booleano' })
  esShopifyGestionado: boolean;

  @ApiPropertyOptional({ description: 'Privilegios del rol', type: [PrivilegioRolDto] })
  @IsOptional()
  @IsArray({ message: 'Los privilegios deben ser un array' })
  @ValidateNested({ each: true })
  @Type(() => PrivilegioRolDto)
  privilegios?: PrivilegioRolDto[];

  @ApiPropertyOptional({ description: 'Limitaciones del rol', type: [LimitacionRolDto] })
  @IsOptional()
  @IsArray({ message: 'Las limitaciones deben ser un array' })
  @ValidateNested({ each: true })
  @Type(() => LimitacionRolDto)
  limitaciones?: LimitacionRolDto[];
}

export class ActualizarRolDto {
  @ApiPropertyOptional({ description: 'Nombre del rol', example: 'Administrador' })
  @IsOptional()
  @IsString({ message: 'El nombre del rol debe ser una cadena de texto' })
  nombre?: string;

  @ApiPropertyOptional({ description: 'Descripción del rol', example: 'Rol con permisos completos del sistema' })
  @IsOptional()
  @IsString({ message: 'La descripción del rol debe ser una cadena de texto' })
  descripcion?: string;

  @ApiPropertyOptional({ description: 'Privilegios del rol', type: [PrivilegioRolDto] })
  @IsOptional()
  @IsArray({ message: 'Los privilegios deben ser un array' })
  @ValidateNested({ each: true })
  @Type(() => PrivilegioRolDto)
  privilegios?: PrivilegioRolDto[];

  @ApiPropertyOptional({ description: 'Limitaciones del rol', type: [LimitacionRolDto] })
  @IsOptional()
  @IsArray({ message: 'Las limitaciones deben ser un array' })
  @ValidateNested({ each: true })
  @Type(() => LimitacionRolDto)
  limitaciones?: LimitacionRolDto[];
}

export class AsignarRolUsuarioDto {
  @ApiProperty({ description: 'ID del usuario', example: 'user-123' })
  @IsNotEmpty({ message: 'El ID del usuario es requerido' })
  @IsString({ message: 'El ID del usuario debe ser una cadena de texto' })
  usuarioId: string;

  @ApiProperty({ description: 'ID del rol', example: 'rol-123' })
  @IsNotEmpty({ message: 'El ID del rol es requerido' })
  @IsString({ message: 'El ID del rol debe ser una cadena de texto' })
  rolId: string;
}

export class CrearCodigoColaboradorDto {
  @ApiProperty({ description: 'Código de colaborador', example: '2831' })
  @IsNotEmpty({ message: 'El código de colaborador es requerido' })
  @IsString({ message: 'El código de colaborador debe ser una cadena de texto' })
  @IsString({ message: 'El código de colaborador debe tener entre 4 y 6 caracteres' })
  codigo: string;

  @ApiProperty({ description: 'Fecha de expiración', example: '2025-12-31T23:59:59Z' })
  @IsNotEmpty({ message: 'La fecha de expiración es requerida' })
  @IsString({ message: 'La fecha de expiración debe ser una cadena de texto en formato ISO' })
  fechaExpiracion: string;
}

export class SolicitudColaboradorDto {
  @ApiProperty({ description: 'Código de colaborador', example: '2831' })
  @IsNotEmpty({ message: 'El código de colaborador es requerido' })
  @IsString({ message: 'El código de colaborador debe ser una cadena de texto' })
  codigo: string;

  @ApiProperty({ description: 'Email del colaborador', example: 'colaborador@ejemplo.com' })
  @IsNotEmpty({ message: 'El email del colaborador es requerido' })
  @IsString({ message: 'El email del colaborador debe ser una cadena de texto' })
  email: string;

  @ApiProperty({ description: 'Rol solicitado', example: 'Desarrollador de aplicaciones' })
  @IsNotEmpty({ message: 'El rol solicitado es requerido' })
  @IsString({ message: 'El rol solicitado debe ser una cadena de texto' })
  rolSolicitado: string;
}