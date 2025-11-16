/**
 * DTO para actualizar la configuración de seguridad
 */
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsBoolean, IsNumber, IsArray, IsString, Min, Max, IsNotEmpty } from 'class-validator';

class PoliticasUsuariosDto {
  @ApiProperty({
    description: 'Si la autenticación en dos pasos es obligatoria',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'La autenticación en dos pasos debe ser un valor booleano' })
  autenticacionDosPasosObligatoria?: boolean;

  @ApiProperty({
    description: 'Longitud mínima de contraseña',
    example: 8,
    minimum: 6,
    maximum: 20,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'La longitud mínima de contraseña debe ser un número' })
  @Min(6, { message: 'La longitud mínima de contraseña debe ser al menos 6' })
  @Max(20, { message: 'La longitud mínima de contraseña no puede exceder 20' })
  longitudMinimaContrasena?: number;

  @ApiProperty({
    description: 'Días hasta que expire la contraseña',
    example: 90,
    minimum: 30,
    maximum: 365,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Los días de expiración de contraseña deben ser un número' })
  @Min(30, { message: 'Los días de expiración de contraseña deben ser al menos 30' })
  @Max(365, { message: 'Los días de expiración de contraseña no pueden exceder 365' })
  expiracionContrasenaDias?: number;

  @ApiProperty({
    description: 'Máximo de intentos de inicio de sesión fallidos',
    example: 5,
    minimum: 3,
    maximum: 10,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'El máximo de intentos de inicio de sesión debe ser un número' })
  @Min(3, { message: 'El máximo de intentos de inicio de sesión debe ser al menos 3' })
  @Max(10, { message: 'El máximo de intentos de inicio de sesión no puede exceder 10' })
  maximoIntentosInicioSesion?: number;

  @ApiProperty({
    description: 'Minutos de bloqueo temporal tras intentos fallidos',
    example: 30,
    minimum: 5,
    maximum: 1440,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Los minutos de bloqueo temporal deben ser un número' })
  @Min(5, { message: 'Los minutos de bloqueo temporal deben ser al menos 5' })
  @Max(1440, { message: 'Los minutos de bloqueo temporal no pueden exceder 1440 (24 horas)' })
  bloqueoTemporalMinutos?: number;

  @ApiProperty({
    description: 'Si se requiere verificación de email',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'La verificación de email debe ser un valor booleano' })
  requiereVerificacionEmail?: boolean;

  @ApiProperty({
    description: 'Políticas de contraseña requeridas',
    example: ['minimo_8_caracteres', 'mezcla_mayusculas_minusculas', 'incluir_numeros'],
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray({ message: 'Las políticas de contraseña deben ser un array de strings' })
  @IsString({ each: true, message: 'Cada política de contraseña debe ser una cadena de texto' })
  politicasContrasena?: string[];
}

class RegistroActividadDto {
  @ApiProperty({
    description: 'Si el registro de actividad está habilitado',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'El estado del registro de actividad debe ser un valor booleano' })
  habilitado?: boolean;

  @ApiProperty({
    description: 'Días de retención de registros',
    example: 365,
    minimum: 30,
    maximum: 1095,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Los días de retención deben ser un número' })
  @Min(30, { message: 'Los días de retención deben ser al menos 30' })
  @Max(1095, { message: 'Los días de retención no pueden exceder 1095 (3 años)' })
  retencionDias?: number;

  @ApiProperty({
    description: 'Eventos que se registran',
    example: ['login', 'logout', 'cambio_contrasena', 'creacion_usuario'],
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray({ message: 'Los eventos registrados deben ser un array de strings' })
  @IsString({ each: true, message: 'Cada evento debe ser una cadena de texto' })
  eventosRegistrados?: string[];
}

class DispositivosConectadosDto {
  @ApiProperty({
    description: 'Máximo de dispositivos por usuario',
    example: 5,
    minimum: 1,
    maximum: 10,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'El máximo de dispositivos por usuario debe ser un número' })
  @Min(1, { message: 'El máximo de dispositivos por usuario debe ser al menos 1' })
  @Max(10, { message: 'El máximo de dispositivos por usuario no puede exceder 10' })
  maximoDispositivosPorUsuario?: number;

  @ApiProperty({
    description: 'Si se permiten sesiones concurrentes',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Las sesiones concurrentes deben ser un valor booleano' })
  sesionesConcurrentes?: boolean;

  @ApiProperty({
    description: 'Si se envían notificaciones por nuevo dispositivo',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Las notificaciones de nuevo dispositivo deben ser un valor booleano' })
  notificacionesNuevoDispositivo?: boolean;
}

class ColaboradoresDto {
  @ApiProperty({
    description: 'Código de colaborador',
    example: 'ABC123',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'El código de colaborador debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El código de colaborador no puede estar vacío' })
  codigoColaborador?: string;

  @ApiProperty({
    description: 'Número de solicitudes pendientes',
    example: 0,
    minimum: 0,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Las solicitudes pendientes deben ser un número' })
  @Min(0, { message: 'Las solicitudes pendientes no pueden ser negativas' })
  solicitudesPendientes?: number;

  @ApiProperty({
    description: 'Máximo de colaboradores permitidos',
    example: 10,
    minimum: 1,
    maximum: 50,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'El máximo de colaboradores debe ser un número' })
  @Min(1, { message: 'El máximo de colaboradores debe ser al menos 1' })
  @Max(50, { message: 'El máximo de colaboradores no puede exceder 50' })
  maximoColaboradores?: number;
}

class ConfiguracionSeguridadDto {
  @ApiProperty({
    description: 'Configuración de registro de actividad',
    required: false,
  })
  @IsOptional()
  registroActividad?: RegistroActividadDto;

  @ApiProperty({
    description: 'Configuración de dispositivos conectados',
    required: false,
  })
  @IsOptional()
  dispositivosConectados?: DispositivosConectadosDto;

  @ApiProperty({
    description: 'Configuración de colaboradores',
    required: false,
  })
  @IsOptional()
  colaboradores?: ColaboradoresDto;
}

export class ActualizarConfiguracionSeguridadDto {
  @ApiProperty({
    description: 'Configuración de políticas de usuarios',
    required: false,
  })
  @IsOptional()
  politicasUsuarios?: PoliticasUsuariosDto;

  @ApiProperty({
    description: 'Configuración de seguridad general',
    required: false,
  })
  @IsOptional()
  configuracionSeguridad?: ConfiguracionSeguridadDto;
}