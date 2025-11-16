import { Pagina } from '../entidades/pagina.entity';

/**
 * Interfaz del Repositorio de Páginas
 * Define las operaciones de persistencia para la entidad Pagina
 * Sigue el principio de inversión de dependencias (DIP)
 */
export interface RepositorioPagina {
  /**
   * Guarda una nueva página en el repositorio
   * @param pagina - La entidad Pagina a guardar
   * @returns Promise con la página guardada
   */
  guardar(pagina: Pagina): Promise<Pagina>;

  /**
   * Busca una página por su ID
   * @param id - ID de la página
   * @returns Promise con la página encontrada o null si no existe
   */
  buscarPorId(id: string): Promise<Pagina | null>;

  /**
   * Busca una página por su slug
   * @param slug - Slug único de la página
   * @returns Promise con la página encontrada o null si no existe
   */
  buscarPorSlug(slug: string): Promise<Pagina | null>;

  /**
   * Lista todas las páginas con opciones de paginación y filtrado
   * @param opciones - Opciones de paginación y filtrado
   * @returns Promise con el listado de páginas y metadatos de paginación
   */
  listar(opciones?: OpcionesListadoPaginas): Promise<ListadoPaginas>;

  /**
   * Lista páginas por tienda con opciones de paginación y filtrado
   * @param tiendaId - ID de la tienda
   * @param opciones - Opciones de paginación y filtrado
   * @returns Promise con el listado de páginas y metadatos de paginación
   */
  listarPorTienda(tiendaId: string, opciones?: OpcionesListadoPaginas): Promise<ListadoPaginas>;

  /**
   * Lista páginas por autor con opciones de paginación y filtrado
   * @param autorId - ID del autor
   * @param opciones - Opciones de paginación y filtrado
   * @returns Promise con el listado de páginas y metadatos de paginación
   */
  listarPorAutor(autorId: string, opciones?: OpcionesListadoPaginas): Promise<ListadoPaginas>;

  /**
   * Lista páginas públicas (visibles) con opciones de paginación
   * @param opciones - Opciones de paginación
   * @returns Promise con el listado de páginas públicas y metadatos de paginación
   */
  listarPublicas(opciones?: OpcionesListadoPublicas): Promise<ListadoPaginas>;

  /**
   * Lista páginas públicas por tienda
   * @param tiendaId - ID de la tienda
   * @param opciones - Opciones de paginación
   * @returns Promise con el listado de páginas públicas y metadatos de paginación
   */
  listarPublicasPorTienda(tiendaId: string, opciones?: OpcionesListadoPublicas): Promise<ListadoPaginas>;

  /**
   * Verifica si existe una página con un slug específico
   * @param slug - Slug a verificar
   * @param excluirId - ID de página a excluir (para actualizaciones)
   * @returns Promise con booleano indicando si existe
   */
  existeConSlug(slug: string, excluirId?: string): Promise<boolean>;

  /**
   * Elimina una página por su ID
   * @param id - ID de la página a eliminar
   * @returns Promise que se resuelve cuando la eliminación es exitosa
   */
  eliminar(id: string): Promise<void>;

  /**
   * Obtiene estadísticas de páginas por tienda
   * @param tiendaId - ID de la tienda
   * @returns Promise con las estadísticas de páginas
   */
  obtenerEstadisticasPorTienda(tiendaId: string): Promise<EstadisticasPaginas>;
}

/**
 * Opciones para el listado de páginas
 */
export interface OpcionesListadoPaginas {
  pagina?: number;
  limite?: number;
  ordenarPor?: 'fecha_creacion' | 'fecha_actualizacion' | 'titulo' | 'fecha_publicacion';
  orden?: 'ASC' | 'DESC';
  buscar?: string;
  visible?: boolean;
  autorId?: string;
  tiendaId?: string;
  fechaDesde?: Date;
  fechaHasta?: Date;
}

/**
 * Opciones para el listado de páginas públicas
 */
export interface OpcionesListadoPublicas {
  pagina?: number;
  limite?: number;
  ordenarPor?: 'fecha_creacion' | 'fecha_actualizacion' | 'titulo' | 'fecha_publicacion';
  orden?: 'ASC' | 'DESC';
  buscar?: string;
  tiendaId?: string;
}

/**
 * Estructura del listado de páginas con metadatos de paginación
 */
export interface ListadoPaginas {
  paginas: Pagina[];
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
 * Estadísticas de páginas por tienda
 */
export interface EstadisticasPaginas {
  totalPaginas: number;
  paginasPublicas: number;
  paginasOcultas: number;
  paginasRecientes: number; // Últimos 7 días
  autorMasActivo?: {
    autorId: string;
    totalPaginas: number;
  };
}