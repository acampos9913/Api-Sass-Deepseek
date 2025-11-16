import { IsNotEmpty, IsString, IsDate } from 'class-validator';

/**
 * Entidad de dominio para UsuarioSucursal
 * Representa la relación entre un usuario y una sucursal (asignación de empleados)
 */
export class UsuarioSucursal {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsNotEmpty()
  @IsString()
  usuario_id: string;

  @IsNotEmpty()
  @IsString()
  sucursal_id: string;

  @IsDate()
  fecha_creacion: Date;

  constructor(
    id: string,
    usuario_id: string,
    sucursal_id: string,
    fecha_creacion: Date
  ) {
    this.id = id;
    this.usuario_id = usuario_id;
    this.sucursal_id = sucursal_id;
    this.fecha_creacion = fecha_creacion;
  }

  /**
   * Valida que la asignación sea válida
   */
  esValida(): boolean {
    return !!(this.usuario_id && this.sucursal_id);
  }

  /**
   * Obtiene el tiempo que ha pasado desde la asignación
   */
  obtenerTiempoAsignacion(): number {
    const ahora = new Date();
    const diferencia = ahora.getTime() - this.fecha_creacion.getTime();
    return Math.floor(diferencia / (1000 * 60 * 60 * 24)); // Devuelve días
  }
}