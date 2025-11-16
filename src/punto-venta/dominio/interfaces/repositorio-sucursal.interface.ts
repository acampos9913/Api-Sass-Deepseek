import { Sucursal } from '../entidades/sucursal.entity';

/**
 * Interfaz para el repositorio de Sucursal
 * Define las operaciones de persistencia para entidades Sucursal
 */
export interface RepositorioSucursal {
  /**
   * Guarda una nueva sucursal
   * @param sucursal - Entidad de sucursal a guardar
   * @returns Promise con la sucursal guardada
   */
  guardar(sucursal: Sucursal): Promise<Sucursal>;

  /**
   * Busca una sucursal por su ID
   * @param id - ID de la sucursal
   * @returns Promise con la sucursal encontrada o null
   */
  buscarPorId(id: string): Promise<Sucursal | null>;

  /**
   * Busca sucursales por ID de tienda
   * @param tienda_id - ID de la tienda
   * @returns Promise con array de sucursales
   */
  buscarPorTienda(tienda_id: string): Promise<Sucursal[]>;

  /**
   * Busca sucursales activas por ID de tienda
   * @param tienda_id - ID de la tienda
   * @returns Promise con array de sucursales activas
   */
  buscarActivasPorTienda(tienda_id: string): Promise<Sucursal[]>;

  /**
   * Actualiza una sucursal existente
   * @param sucursal - Entidad de sucursal con datos actualizados
   * @returns Promise con la sucursal actualizada
   */
  actualizar(sucursal: Sucursal): Promise<Sucursal>;

  /**
   * Elimina una sucursal por su ID
   * @param id - ID de la sucursal a eliminar
   * @returns Promise con el resultado de la operación
   */
  eliminar(id: string): Promise<void>;

  /**
   * Busca sucursales por ciudad
   * @param ciudad - Nombre de la ciudad
   * @returns Promise con array de sucursales en la ciudad
   */
  buscarPorCiudad(ciudad: string): Promise<Sucursal[]>;

  /**
   * Busca sucursales por provincia
   * @param provincia - Nombre de la provincia
   * @returns Promise con array de sucursales en la provincia
   */
  buscarPorProvincia(provincia: string): Promise<Sucursal[]>;

  /**
   * Verifica si existe una sucursal con el mismo nombre en la misma tienda
   * @param nombre - Nombre de la sucursal
   * @param tienda_id - ID de la tienda
   * @returns Promise con boolean indicando si existe
   */
  existeConNombre(nombre: string, tienda_id: string): Promise<boolean>;

  /**
   * Obtiene estadísticas de sucursales por tienda
   * @param tienda_id - ID de la tienda
   * @returns Promise con estadísticas de sucursales
   */
  obtenerEstadisticasPorTienda(tienda_id: string): Promise<{
    total_sucursales: number;
    sucursales_activas: number;
    sucursales_inactivas: number;
    sucursales_con_cajas_abiertas: number;
  }>;

  /**
   * Busca sucursales con cajas abiertas por tienda
   * @param tienda_id - ID de la tienda
   * @returns Promise con array de sucursales con cajas abiertas
   */
  buscarConCajasAbiertasPorTienda(tienda_id: string): Promise<Sucursal[]>;

  /**
   * Asigna un usuario a una sucursal
   * @param usuario_id - ID del usuario
   * @param sucursal_id - ID de la sucursal
   * @returns Promise con el resultado de la asignación
   */
  asignarUsuario(usuario_id: string, sucursal_id: string): Promise<void>;

  /**
   * Desasigna un usuario de una sucursal
   * @param usuario_id - ID del usuario
   * @param sucursal_id - ID de la sucursal
   * @returns Promise con el resultado de la desasignación
   */
  desasignarUsuario(usuario_id: string, sucursal_id: string): Promise<void>;

  /**
   * Obtiene las sucursales asignadas a un usuario
   * @param usuario_id - ID del usuario
   * @returns Promise con array de sucursales asignadas
   */
  obtenerSucursalesPorUsuario(usuario_id: string): Promise<Sucursal[]>;

  /**
   * Busca sucursales con filtros avanzados
   * @param filtros - Objeto con filtros de búsqueda
   * @returns Promise con array de sucursales que cumplen los filtros
   */
  buscarConFiltros(filtros: {
    tienda_id?: string;
    ciudad?: string;
    provincia?: string;
    activo?: boolean;
    tiene_cajas_abiertas?: boolean;
    fecha_creacion_desde?: Date;
    fecha_creacion_hasta?: Date;
  }): Promise<Sucursal[]>;
}