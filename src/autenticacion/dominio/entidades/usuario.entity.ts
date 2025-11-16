import { RolUsuario } from '../enums/rol-usuario.enum';

/**
 * Entidad de Usuario que representa un usuario administrador del sistema
 * Sigue los principios de Domain-Driven Design y Arquitectura Limpia
 */
export class Usuario {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly contrasenaHash: string,
    public readonly nombreCompleto: string,
    public readonly rol: RolUsuario,
    public readonly activo: boolean,
    public readonly fechaCreacion: Date,
    public readonly fechaActualizacion: Date,
    public readonly ultimoAcceso?: Date,
  ) {}

  /**
   * Verifica si el usuario tiene permisos de administrador
   */
  esAdministrador(): boolean {
    return this.rol === RolUsuario.ADMIN || this.rol === RolUsuario.SUPER_ADMIN;
  }

  /**
   * Verifica si el usuario tiene permisos de edición
   */
  puedeEditar(): boolean {
    return this.esAdministrador() || this.rol === RolUsuario.EDITOR;
  }

  /**
   * Verifica si el usuario está activo y puede realizar operaciones
   */
  puedeOperar(): boolean {
    return this.activo;
  }

  /**
   * Actualiza la fecha de último acceso
   */
  actualizarUltimoAcceso(): Usuario {
    return new Usuario(
      this.id,
      this.email,
      this.contrasenaHash,
      this.nombreCompleto,
      this.rol,
      this.activo,
      this.fechaCreacion,
      new Date(),
      new Date(),
    );
  }
}