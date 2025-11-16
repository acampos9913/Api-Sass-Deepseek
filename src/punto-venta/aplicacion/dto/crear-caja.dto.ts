import { IsNotEmpty, IsString, IsDecimal, IsOptional, MaxLength, MinLength, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO para la creación de cajas
 * Define la estructura y validaciones de los datos de entrada
 */
export class CrearCajaDto {
  @ApiProperty({
    description: 'ID de la sucursal a la que pertenece la caja',
    example: 'suc_123456789',
  })
  @IsNotEmpty({ message: 'El ID de la sucursal es requerido' })
  @IsString({ message: 'El ID de la sucursal debe ser una cadena de texto' })
  sucursal_id: string;

  @ApiProperty({
    description: 'Nombre de la caja',
    example: 'Caja Principal',
    maxLength: 50,
  })
  @IsNotEmpty({ message: 'El nombre de la caja es requerido' })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @MaxLength(50, { message: 'El nombre no puede exceder 50 caracteres' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  nombre: string;

  @ApiProperty({
    description: 'Saldo inicial de la caja',
    example: 1000.00,
    minimum: 0,
    maximum: 1000000,
  })
  @IsNotEmpty({ message: 'El saldo inicial es requerido' })
  @IsDecimal({ decimal_digits: '2' }, { message: 'El saldo inicial debe ser un número decimal válido' })
  @Min(0, { message: 'El saldo inicial no puede ser negativo' })
  @Max(1000000, { message: 'El saldo inicial no puede exceder 1,000,000' })
  saldo_inicial: number;
}

/**
 * DTO para abrir una caja
 */
export class AbrirCajaDto {
  @ApiProperty({
    description: 'ID del usuario que abre la caja',
    example: 'usuario_123456789',
  })
  @IsNotEmpty({ message: 'El ID del usuario es requerido' })
  @IsString({ message: 'El ID del usuario debe ser una cadena de texto' })
  usuario_id: string;

  @ApiProperty({
    description: 'Saldo inicial de la caja al abrir',
    example: 1000.00,
    minimum: 0,
    maximum: 1000000,
  })
  @IsNotEmpty({ message: 'El saldo inicial es requerido' })
  @IsDecimal({ decimal_digits: '2' }, { message: 'El saldo inicial debe ser un número decimal válido' })
  @Min(0, { message: 'El saldo inicial no puede ser negativo' })
  @Max(1000000, { message: 'El saldo inicial no puede exceder 1,000,000' })
  saldo_inicial: number;
}

/**
 * DTO para cerrar una caja
 */
export class CerrarCajaDto {
  @ApiProperty({
    description: 'ID del usuario que cierra la caja',
    example: 'usuario_123456789',
  })
  @IsNotEmpty({ message: 'El ID del usuario es requerido' })
  @IsString({ message: 'El ID del usuario debe ser una cadena de texto' })
  usuario_id: string;

  @ApiPropertyOptional({
    description: 'Notas u observaciones del cierre',
    example: 'Cierre normal del día',
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: 'Las notas deben ser una cadena de texto' })
  @MaxLength(500, { message: 'Las notas no pueden exceder 500 caracteres' })
  notas?: string;
}

/**
 * DTO para registrar una venta en caja
 */
export class RegistrarVentaDto {
  @ApiProperty({
    description: 'Monto de la venta',
    example: 150.50,
    minimum: 0.01,
  })
  @IsNotEmpty({ message: 'El monto de la venta es requerido' })
  @IsDecimal({ decimal_digits: '2' }, { message: 'El monto debe ser un número decimal válido' })
  @Min(0.01, { message: 'El monto de la venta debe ser mayor a 0' })
  monto_venta: number;

  @ApiPropertyOptional({
    description: 'Descripción de la venta',
    example: 'Venta de productos varios',
    maxLength: 200,
  })
  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  @MaxLength(200, { message: 'La descripción no puede exceder 200 caracteres' })
  descripcion?: string;
}

/**
 * DTO para registrar un retiro de caja
 */
export class RegistrarRetiroDto {
  @ApiProperty({
    description: 'Monto del retiro',
    example: 200.00,
    minimum: 0.01,
  })
  @IsNotEmpty({ message: 'El monto del retiro es requerido' })
  @IsDecimal({ decimal_digits: '2' }, { message: 'El monto debe ser un número decimal válido' })
  @Min(0.01, { message: 'El monto del retiro debe ser mayor a 0' })
  monto_retiro: number;

  @ApiPropertyOptional({
    description: 'Motivo del retiro',
    example: 'Retiro para cambio',
    maxLength: 200,
  })
  @IsOptional()
  @IsString({ message: 'El motivo debe ser una cadena de texto' })
  @MaxLength(200, { message: 'El motivo no puede exceder 200 caracteres' })
  motivo?: string;
}

/**
 * DTO para la respuesta de creación de caja
 */
export class CrearCajaRespuestaDto {
  @ApiProperty({
    description: 'Mensaje descriptivo de la operación',
    example: 'Caja creada exitosamente',
  })
  mensaje: string;

  @ApiProperty({
    description: 'Datos de la caja creada',
    type: () => CajaRespuestaDto,
  })
  data: CajaRespuestaDto | null;

  @ApiProperty({
    description: 'Tipo de mensaje',
    enum: ['Exito', 'ErrorCliente', 'ErrorServidor'],
    example: 'Exito',
  })
  tipo_mensaje: 'Exito' | 'ErrorCliente' | 'ErrorServidor';

  @ApiProperty({
    description: 'Código de estado de la respuesta',
    example: 201,
  })
  estado_respuesta: number;
}

/**
 * DTO para la respuesta de caja
 */
export class CajaRespuestaDto {
  @ApiProperty({
    description: 'ID único de la caja',
    example: 'caja_123456789',
  })
  id: string;

  @ApiProperty({
    description: 'ID de la sucursal a la que pertenece',
    example: 'suc_123456789',
  })
  sucursal_id: string;

  @ApiProperty({
    description: 'Nombre de la caja',
    example: 'Caja Principal',
  })
  nombre: string;

  @ApiProperty({
    description: 'Estado actual de la caja',
    enum: ['ABIERTA', 'CERRADA', 'SUSPENDIDA'],
    example: 'CERRADA',
  })
  estado: string;

  @ApiProperty({
    description: 'Saldo inicial de la caja',
    example: 1000.00,
  })
  saldo_inicial: number;

  @ApiProperty({
    description: 'Saldo actual de la caja',
    example: 1000.00,
  })
  saldo_actual: number;

  @ApiPropertyOptional({
    description: 'Fecha de apertura de la caja',
    example: '2023-11-13T21:11:28.877Z',
  })
  fecha_apertura?: Date;

  @ApiPropertyOptional({
    description: 'Fecha de cierre de la caja',
    example: '2023-11-13T21:11:28.877Z',
  })
  fecha_cierre?: Date;

  @ApiPropertyOptional({
    description: 'ID del usuario que abrió la caja',
    example: 'usuario_123456789',
  })
  usuario_apertura_id?: string;

  @ApiPropertyOptional({
    description: 'ID del usuario que cerró la caja',
    example: 'usuario_123456789',
  })
  usuario_cierre_id?: string;

  @ApiProperty({
    description: 'Fecha de creación de la caja',
    example: '2023-11-13T21:11:28.877Z',
  })
  fecha_creacion: Date;

  @ApiProperty({
    description: 'Fecha de última actualización de la caja',
    example: '2023-11-13T21:11:28.877Z',
  })
  fecha_actualizacion: Date;

  @ApiProperty({
    description: 'Cantidad de tickets procesados en la caja',
    example: 25,
  })
  cantidad_tickets: number;

  @ApiProperty({
    description: 'Total de ventas del día actual',
    example: 5000.75,
  })
  total_ventas_dia: number;

  @ApiProperty({
    description: 'Diferencia entre saldo actual y saldo esperado',
    example: 0.00,
  })
  diferencia: number;
}

/**
 * DTO para la lista de cajas
 */
export class ListaCajasRespuestaDto {
  @ApiProperty({
    description: 'Mensaje descriptivo de la operación',
    example: 'Lista de cajas obtenida exitosamente',
  })
  mensaje: string;

  @ApiProperty({
    description: 'Datos de la lista de cajas',
    type: () => ListaCajasDataDto,
  })
  data: ListaCajasDataDto;

  @ApiProperty({
    description: 'Tipo de mensaje',
    enum: ['Exito', 'ErrorCliente', 'ErrorServidor'],
    example: 'Exito',
  })
  tipo_mensaje: 'Exito' | 'ErrorCliente' | 'ErrorServidor';

  @ApiProperty({
    description: 'Código de estado de la respuesta',
    example: 200,
  })
  estado_respuesta: number;
}

/**
 * DTO para los datos de la lista de cajas
 */
export class ListaCajasDataDto {
  @ApiProperty({
    description: 'Lista de cajas',
    type: [CajaRespuestaDto],
  })
  elementos: CajaRespuestaDto[];

  @ApiProperty({
    description: 'Información de paginación',
    type: () => PaginacionDto,
  })
  paginacion: PaginacionDto;
}

/**
 * DTO para el reporte de cierre de caja
 */
export class ReporteCierreCajaDto {
  @ApiProperty({
    description: 'Saldo inicial de la caja',
    example: 1000.00,
  })
  saldo_inicial: number;

  @ApiProperty({
    description: 'Saldo final de la caja',
    example: 1500.75,
  })
  saldo_final: number;

  @ApiProperty({
    description: 'Total de ventas registradas',
    example: 500.75,
  })
  total_ventas: number;

  @ApiProperty({
    description: 'Total de retiros registrados',
    example: 0.00,
  })
  total_retiros: number;

  @ApiProperty({
    description: 'Diferencia entre saldo actual y saldo esperado',
    example: 0.00,
  })
  diferencia: number;

  @ApiProperty({
    description: 'Cantidad de tickets procesados',
    example: 15,
  })
  cantidad_tickets: number;

  @ApiProperty({
    description: 'Fecha de apertura de la caja',
    example: '2023-11-13T09:00:00.000Z',
  })
  fecha_apertura: Date;

  @ApiProperty({
    description: 'Fecha de cierre de la caja',
    example: '2023-11-13T21:00:00.000Z',
  })
  fecha_cierre: Date;
}

/**
 * DTO para filtros de búsqueda de cajas
 */
export class FiltrosCajaDto {
  @ApiPropertyOptional({
    description: 'ID de la sucursal para filtrar',
    example: 'suc_123456789',
  })
  @IsOptional()
  @IsString()
  sucursal_id?: string;

  @ApiPropertyOptional({
    description: 'Estado de la caja para filtrar',
    enum: ['ABIERTA', 'CERRADA', 'SUSPENDIDA'],
    example: 'ABIERTA',
  })
  @IsOptional()
  estado?: string;

  @ApiPropertyOptional({
    description: 'ID del usuario que abrió la caja',
    example: 'usuario_123456789',
  })
  @IsOptional()
  @IsString()
  usuario_apertura_id?: string;

  @ApiPropertyOptional({
    description: 'Fecha de apertura desde',
    example: '2023-01-01T00:00:00.000Z',
  })
  @IsOptional()
  fecha_apertura_desde?: Date;

  @ApiPropertyOptional({
    description: 'Fecha de apertura hasta',
    example: '2023-12-31T23:59:59.999Z',
  })
  @IsOptional()
  fecha_apertura_hasta?: Date;

  @ApiPropertyOptional({
    description: 'Página actual para paginación',
    example: 1,
    default: 1,
  })
  @IsOptional()
  pagina?: number = 1;

  @ApiPropertyOptional({
    description: 'Límite de elementos por página',
    example: 10,
    default: 10,
  })
  @IsOptional()
  limite?: number = 10;
}

/**
 * DTO para la paginación (reutilizado)
 */
export class PaginacionDto {
  @ApiProperty({
    description: 'Total de elementos',
    example: 100,
  })
  total_elementos: number;

  @ApiProperty({
    description: 'Total de páginas',
    example: 10,
  })
  total_paginas: number;

  @ApiProperty({
    description: 'Página actual',
    example: 1,
  })
  pagina_actual: number;

  @ApiProperty({
    description: 'Límite de elementos por página',
    example: 10,
  })
  limite: number;
}