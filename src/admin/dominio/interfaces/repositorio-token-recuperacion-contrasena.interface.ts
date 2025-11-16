/**
 * Interfaz para el repositorio de tokens de recuperación de contraseña
 * Define las operaciones de persistencia para tokens de recuperación
 */
export interface RepositorioTokenRecuperacionContrasena {
  /**
   * Crea un nuevo token de recuperación de contraseña
   * @param token - Token a crear
   * @returns Promise con el token creado
   */
  crear(token: {
    id: string;
    usuarioId: string;
    token: string;
    codigo: string;
    expiracion: Date;
    utilizado: boolean;
  }): Promise<any>;

  /**
   * Encuentra un token por su valor
   * @param token - Valor del token
   * @returns Promise con el token encontrado o null
   */
  encontrarPorToken(token: string): Promise<any>;

  /**
   * Encuentra tokens activos por usuario
   * @param usuarioId - ID del usuario
   * @returns Promise con los tokens encontrados
   */
  encontrarActivosPorUsuario(usuarioId: string): Promise<any[]>;

  /**
   * Marca un token como utilizado
   * @param tokenId - ID del token
   * @returns Promise con el token actualizado
   */
  marcarComoUtilizado(tokenId: string): Promise<any>;

  /**
   * Elimina tokens expirados por usuario
   * @param usuarioId - ID del usuario
   * @returns Promise con el número de tokens eliminados
   */
  eliminarExpiradosPorUsuario(usuarioId: string): Promise<number>;

  /**
   * Elimina un token específico
   * @param tokenId - ID del token
   * @returns Promise con el token eliminado
   */
  eliminar(tokenId: string): Promise<any>;
}