import type {
  ClaveAccesoUsuario,
  DispositivoUsuario,
  MetodoAutenticacionUsuario
} from '../entidades/entidades-seguridad';

/**
 * Interfaz para el repositorio de seguridad del perfil de usuario
 * Define las operaciones relacionadas con la gestión de seguridad del usuario
 */
export interface RepositorioSeguridad {
  /**
   * Obtiene el estado completo de seguridad de un usuario
   * @param usuarioId - ID del usuario
   * @returns Promise con el estado de seguridad
   */
  obtenerEstadoSeguridad(usuarioId: string): Promise<{
    clavesAcceso: ClaveAccesoUsuario[];
    dispositivos: DispositivoUsuario[];
    metodosAutenticacion: MetodoAutenticacionUsuario[];
    autenticacion2Pasos: boolean;
    correoSecundario?: string;
  }>;

  /**
   * Crea una nueva clave de acceso para el usuario
   * @param usuarioId - ID del usuario
   * @param claveAcceso - Datos de la clave de acceso
   * @returns Promise con la clave de acceso creada
   */
  crearClaveAcceso(usuarioId: string, claveAcceso: Omit<ClaveAccesoUsuario, 'id'>): Promise<ClaveAccesoUsuario>;

  /**
   * Cambia la contraseña del usuario
   * @param usuarioId - ID del usuario
   * @param nuevaContrasenaHash - Hash de la nueva contraseña
   * @returns Promise con el resultado de la operación
   */
  cambiarContrasena(usuarioId: string, nuevaContrasenaHash: string): Promise<boolean>;

  /**
   * Agrega o actualiza el correo electrónico secundario
   * @param usuarioId - ID del usuario
   * @param correoSecundario - Correo electrónico secundario
   * @returns Promise con el resultado de la operación
   */
  agregarCorreoSecundario(usuarioId: string, correoSecundario: string): Promise<boolean>;

  /**
   * Activa o desactiva la autenticación en dos pasos
   * @param usuarioId - ID del usuario
   * @param activar - Estado a establecer
   * @returns Promise con el resultado de la operación
   */
  activarDesactivar2FA(usuarioId: string, activar: boolean): Promise<boolean>;

  /**
   * Agrega un método de autenticación al usuario
   * @param usuarioId - ID del usuario
   * @param metodo - Datos del método de autenticación
   * @returns Promise con el método agregado
   */
  agregarMetodoAutenticacion(usuarioId: string, metodo: Omit<MetodoAutenticacionUsuario, 'id'>): Promise<MetodoAutenticacionUsuario>;

  /**
   * Cierra sesión en un dispositivo específico
   * @param usuarioId - ID del usuario
   * @param dispositivoId - ID del dispositivo
   * @returns Promise con el resultado de la operación
   */
  cerrarSesionDispositivo(usuarioId: string, dispositivoId: string): Promise<boolean>;

  /**
   * Verifica si el usuario existe
   * @param usuarioId - ID del usuario
   * @returns Promise con el resultado de la verificación
   */
  existeUsuario(usuarioId: string): Promise<boolean>;

  /**
   * Obtiene el hash de la contraseña actual del usuario
   * @param usuarioId - ID del usuario
   * @returns Promise con el hash de la contraseña
   */
  obtenerContrasenaActual(usuarioId: string): Promise<string>;

  /**
   * Registra un intento de cambio de contraseña en el historial
   * @param usuarioId - ID del usuario
   * @param contrasenaHash - Hash de la nueva contraseña
   * @returns Promise con el resultado de la operación
   */
  registrarCambioContrasena(usuarioId: string, contrasenaHash: string): Promise<boolean>;

  /**
   * Registra un intento de inicio de sesión
   * @param usuarioId - ID del usuario
   * @param exito - Indica si el intento fue exitoso
   * @param dispositivo - Información del dispositivo
   * @returns Promise con el resultado de la operación
   */
  registrarIntentoInicioSesion(usuarioId: string, exito: boolean, dispositivo: {
    navegador: string;
    sistemaOperativo: string;
  }): Promise<boolean>;
}