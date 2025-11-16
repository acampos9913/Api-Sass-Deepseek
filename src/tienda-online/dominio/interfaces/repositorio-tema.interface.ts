import { Tema } from '../entidades/tema.entity';

/**
 * Interfaz del Repositorio de Temas
 * Define las operaciones de persistencia para la entidad Tema
 * Sigue el principio de inversión de dependencias (DIP)
 */
export interface RepositorioTema {
  /**
   * Guarda un nuevo tema en el repositorio
   * @param tema - La entidad Tema a guardar
   * @returns Promise con el tema guardado
   */
  guardar(tema: Tema): Promise<Tema>;

  /**
   * Busca un tema por su ID
   * @param id - ID del tema
   * @returns Promise con el tema encontrado o null si no existe
   */
  buscarPorId(id: string): Promise<Tema | null>;

  /**
   * Lista todos los temas con opciones de paginación y filtrado
   * @param opciones - Opciones de paginación y filtrado
   * @returns Promise con el listado de temas y metadatos de paginación
   */
  listar(opciones?: OpcionesListadoTemas): Promise<ListadoTemas>;

  /**
   * Lista temas por tienda con opciones de paginación y filtrado
   * @param tiendaId - ID de la tienda
   * @param opciones - Opciones de paginación y filtrado
   * @returns Promise con el listado de temas y metadatos de paginación
   */
  listarPorTienda(tiendaId: string, opciones?: OpcionesListadoTemas): Promise<ListadoTemas>;

  /**
   * Lista temas por creador con opciones de paginación y filtrado
   * @param creadorId - ID del creador
   * @param opciones - Opciones de paginación y filtrado
   * @returns Promise con el listado de temas y metadatos de paginación
   */
  listarPorCreador(creadorId: string, opciones?: OpcionesListadoTemas): Promise<ListadoTemas>;

  /**
   * Obtiene el tema activo de una tienda
   * @param tiendaId - ID de la tienda
   * @returns Promise con el tema activo o null si no existe
   */
  obtenerTemaActivo(tiendaId: string): Promise<Tema | null>;

  /**
   * Obtiene el tema predeterminado de una tienda
   * @param tiendaId - ID de la tienda
   * @returns Promise con el tema predeterminado o null si no existe
   */
  obtenerTemaPredeterminado(tiendaId: string): Promise<Tema | null>;

  /**
   * Verifica si existe un tema activo para una tienda
   * @param tiendaId - ID de la tienda
   * @returns Promise con booleano indicando si existe
   */
  existeTemaActivo(tiendaId: string): Promise<boolean>;

  /**
   * Verifica si existe un tema predeterminado para una tienda
   * @param tiendaId - ID de la tienda
   * @returns Promise con booleano indicando si existe
   */
  existeTemaPredeterminado(tiendaId: string): Promise<boolean>;

  /**
   * Elimina un tema por su ID
   * @param id - ID del tema a eliminar
   * @returns Promise que se resuelve cuando la eliminación es exitosa
   */
  eliminar(id: string): Promise<void>;

  /**
   * Obtiene estadísticas de temas por tienda
   * @param tiendaId - ID de la tienda
   * @returns Promise con las estadísticas de temas
   */
  obtenerEstadisticasPorTienda(tiendaId: string): Promise<EstadisticasTemas>;

  /**
   * Desactiva todos los temas de una tienda (excepto el especificado)
   * @param tiendaId - ID de la tienda
   * @param excluirId - ID del tema a excluir de la desactivación
   * @returns Promise que se resuelve cuando la operación es exitosa
   */
  desactivarTodosLosTemas(tiendaId: string, excluirId?: string): Promise<void>;

  /**
   * Quita el estado predeterminado de todos los temas de una tienda (excepto el especificado)
   * @param tiendaId - ID de la tienda
   * @param excluirId - ID del tema a excluir
   * @returns Promise que se resuelve cuando la operación es exitosa
   */
  quitarPredeterminadoDeTodosLosTemas(tiendaId: string, excluirId?: string): Promise<void>;
}

/**
 * Opciones para el listado de temas
 */
export interface OpcionesListadoTemas {
  pagina?: number;
  limite?: number;
  ordenarPor?: 'fecha_creacion' | 'fecha_actualizacion' | 'nombre';
  orden?: 'ASC' | 'DESC';
  buscar?: string;
  activo?: boolean;
  esPredeterminado?: boolean;
  creadorId?: string;
  tiendaId?: string;
  fechaDesde?: Date;
  fechaHasta?: Date;
}

/**
 * Estructura del listado de temas con metadatos de paginación
 */
export interface ListadoTemas {
  temas: Tema[];
  paginacion: {
    totalElementos: number;
    totalPaginas: number;
    paginaActual: number;
    limite: number;
    tieneSiguiente: boolean;
    tieneAnterior: boolean;
  };
}

/**
 * Estadísticas de temas por tienda
 */
export interface EstadisticasTemas {
  totalTemas: number;
  temasActivos: number;
  temasInactivos: number;
  temasPredeterminados: number;
  temasRecientes: number; // Últimos 7 días
  creadorMasActivo?: {
    creadorId: string;
    totalTemas: number;
  };
  configuracionesPopulares?: {
    configuracion: string;
    cantidad: number;
  }[];
}