import { Usuario } from '../entidades/usuario.entity';

/**
 * Interfaz que define el contrato para el repositorio de usuarios
 * Sigue el principio de inversión de dependencias (DIP)
 */
export interface RepositorioUsuario {
  /**
   * Busca un usuario por su ID
   * @param id - ID del usuario a buscar
   * @returns Promise con el usuario encontrado o null
   */
  buscarPorId(id: string): Promise<Usuario | null>;

  /**
   * Busca un usuario por su email
   * @param email - Email del usuario a buscar
   * @returns Promise con el usuario encontrado o null
   */
  buscarPorEmail(email: string): Promise<Usuario | null>;

  /**
   * Guarda un nuevo usuario en el repositorio
   * @param usuario - Usuario a guardar
   * @returns Promise con el usuario guardado
   */
  guardar(usuario: Usuario): Promise<Usuario>;

  /**
   * Actualiza un usuario existente
   * @param usuario - Usuario a actualizar
   * @returns Promise con el usuario actualizado
   */
  actualizar(usuario: Usuario): Promise<Usuario>;

  /**
   * Elimina un usuario por su ID
   * @param id - ID del usuario a eliminar
   * @returns Promise que se resuelve cuando se completa la eliminación
   */
  eliminar(id: string): Promise<void>;

  /**
   * Lista todos los usuarios con paginación
   * @param pagina - Número de página (comenzando en 1)
   * @param limite - Límite de usuarios por página
   * @returns Promise con la lista de usuarios y metadatos de paginación
   */
  listar(
    pagina: number,
    limite: number,
  ): Promise<{ usuarios: Usuario[]; total: number }>;
}