import { IsNotEmpty, IsString, IsBoolean, IsOptional, IsDate, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { Caja } from './caja.entity';
import { UsuarioSucursal } from './usuario-sucursal.entity';

/**
 * Entidad de dominio para Sucursal
 * Representa una ubicación física donde se opera el punto de venta
 */
export class Sucursal {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsNotEmpty()
  @IsString()
  nombre: string;

  @IsNotEmpty()
  @IsString()
  direccion: string;

  @IsNotEmpty()
  @IsString()
  ciudad: string;

  @IsNotEmpty()
  @IsString()
  provincia: string;

  @IsNotEmpty()
  @IsString()
  codigo_postal: string;

  @IsNotEmpty()
  @IsString()
  pais: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsBoolean()
  activo: boolean;

  @IsDate()
  fecha_creacion: Date;

  @IsDate()
  fecha_actualizacion: Date;

  @IsNotEmpty()
  @IsString()
  tienda_id: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Caja)
  cajas?: Caja[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UsuarioSucursal)
  usuarios_sucursal?: UsuarioSucursal[];

  constructor(
    id: string,
    nombre: string,
    direccion: string,
    ciudad: string,
    provincia: string,
    codigo_postal: string,
    pais: string,
    activo: boolean,
    fecha_creacion: Date,
    fecha_actualizacion: Date,
    tienda_id: string,
    telefono?: string,
    email?: string,
    cajas?: Caja[],
    usuarios_sucursal?: UsuarioSucursal[]
  ) {
    this.id = id;
    this.nombre = nombre;
    this.direccion = direccion;
    this.ciudad = ciudad;
    this.provincia = provincia;
    this.codigo_postal = codigo_postal;
    this.pais = pais;
    this.telefono = telefono;
    this.email = email;
    this.activo = activo;
    this.fecha_creacion = fecha_creacion;
    this.fecha_actualizacion = fecha_actualizacion;
    this.tienda_id = tienda_id;
    this.cajas = cajas;
    this.usuarios_sucursal = usuarios_sucursal;
  }

  /**
   * Activa la sucursal
   */
  activar(): void {
    this.activo = true;
    this.fecha_actualizacion = new Date();
  }

  /**
   * Desactiva la sucursal
   */
  desactivar(): void {
    this.activo = false;
    this.fecha_actualizacion = new Date();
  }

  /**
   * Valida si la sucursal está operativa
   */
  estaOperativa(): boolean {
    return this.activo && this.cajas?.some(caja => caja.estado === 'ABIERTA') || false;
  }

  /**
   * Obtiene las cajas activas de la sucursal
   */
  obtenerCajasActivas(): Caja[] {
    return this.cajas?.filter(caja => caja.estado === 'ABIERTA') || [];
  }

  /**
   * Valida la información básica de la sucursal
   */
  validarInformacion(): boolean {
    return !!(this.nombre && this.direccion && this.ciudad && this.provincia && this.codigo_postal && this.pais);
  }
}