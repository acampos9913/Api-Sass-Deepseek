import { Coleccion } from '../entidades/coleccion.entity';

/**
 * Interfaz que define el contrato para el repositorio de colecciones
 * Sigue el principio de inversión de dependencias (DIP)
 * Incluye todas las funcionalidades avanzadas tipo Shopify
 */
export interface RepositorioColeccion {
  /**
   * Busca una colección por su ID
   * @param id - ID de la colección a buscar
   * @returns Promise con la colección encontrada o null
   */
  buscarPorId(id: string): Promise<Coleccion | null>;

  /**
   * Busca una colección por su slug
   * @param slug - Slug de la colección a buscar
   * @returns Promise con la colección encontrada o null
   */
  buscarPorSlug(slug: string): Promise<Coleccion | null>;

  /**
   * Guarda una nueva colección en el repositorio
   * @param coleccion - Colección a guardar
   * @returns Promise con la colección guardada
   */
  guardar(coleccion: Coleccion): Promise<Coleccion>;

  /**
   * Actualiza una colección existente
   * @param coleccion - Colección a actualizar
   * @returns Promise con la colección actualizada
   */
  actualizar(coleccion: Coleccion): Promise<Coleccion>;

  /**
   * Elimina una colección por su ID (eliminación lógica)
   * @param id - ID de la colección a eliminar
   * @returns Promise que se resuelve cuando se completa la eliminación
   */
  eliminar(id: string): Promise<void>;

  /**
   * Archiva una colección por su ID
   * @param id - ID de la colección a archivar
   * @returns Promise con la colección archivada
   */
  archivar(id: string): Promise<Coleccion>;

  /**
   * Desarchiva una colección por su ID
   * @param id - ID de la colección a desarchivar
   * @returns Promise con la colección desarchivada
   */
  desarchivar(id: string): Promise<Coleccion>;

  /**
   * Duplica una colección existente
   * @param id - ID de la colección a duplicar
   * @returns Promise con la nueva colección duplicada
   */
  duplicar(id: string): Promise<Coleccion>;

  /**
   * Lista todas las colecciones con paginación y filtros avanzados
   * @param pagina - Número de página (comenzando en 1)
   * @param limite - Límite de colecciones por página
   * @param filtros - Filtros opcionales para la búsqueda
   * @returns Promise con la lista de colecciones y metadatos de paginación
   */
  listar(
    pagina: number,
    limite: number,
    filtros?: {
      nombre?: string;
      tiendaId?: string;
      estado?: 'ACTIVA' | 'ARCHIVADA' | 'ELIMINADA';
      tipo?: 'MANUAL' | 'AUTOMATICA';
      visibleTiendaOnline?: boolean;
      visiblePointOfSale?: boolean;
      fechaDesde?: Date;
      fechaHasta?: Date;
    },
  ): Promise<{ colecciones: Coleccion[]; total: number }>;

  /**
   * Busca colecciones por nombre (búsqueda parcial)
   * @param nombre - Nombre o parte del nombre a buscar
   * @param pagina - Número de página (comenzando en 1)
   * @param limite - Límite de colecciones por página
   * @returns Promise con la lista de colecciones y metadatos de paginación
   */
  buscarPorNombre(
    nombre: string,
    pagina: number,
    limite: number,
  ): Promise<{ colecciones: Coleccion[]; total: number }>;

  /**
   * Lista colecciones por tipo
   * @param tipo - Tipo de colección (MANUAL o AUTOMATICA)
   * @param pagina - Número de página (comenzando en 1)
   * @param limite - Límite de colecciones por página
   * @returns Promise con la lista de colecciones y metadatos de paginación
   */
  listarPorTipo(
    tipo: 'MANUAL' | 'AUTOMATICA',
    pagina: number,
    limite: number,
  ): Promise<{ colecciones: Coleccion[]; total: number }>;

  /**
   * Lista colecciones archivadas
   * @param pagina - Número de página (comenzando en 1)
   * @param limite - Límite de colecciones por página
   * @returns Promise con la lista de colecciones y metadatos de paginación
   */
  listarArchivadas(
    pagina: number,
    limite: number,
  ): Promise<{ colecciones: Coleccion[]; total: number }>;

  /**
   * Lista colecciones activas y visibles
   * @param pagina - Número de página (comenzando en 1)
   * @param limite - Límite de colecciones por página
   * @returns Promise con la lista de colecciones y metadatos de paginación
   */
  listarActivas(
    pagina: number,
    limite: number,
  ): Promise<{ colecciones: Coleccion[]; total: number }>;

  /**
   * Agrega un producto a una colección manual
   * @param coleccionId - ID de la colección
   * @param productoId - ID del producto
   * @param orden - Orden dentro de la colección (opcional)
   * @returns Promise que se resuelve cuando se completa la operación
   */
  agregarProducto(
    coleccionId: string,
    productoId: string,
    orden?: number,
  ): Promise<void>;

  /**
   * Elimina un producto de una colección manual
   * @param coleccionId - ID de la colección
   * @param productoId - ID del producto
   * @returns Promise que se resuelve cuando se completa la operación
   */
  eliminarProducto(coleccionId: string, productoId: string): Promise<void>;

  /**
   * Actualiza el orden de los productos en una colección manual
   * @param coleccionId - ID de la colección
   * @param productosOrden - Array con IDs de productos y su orden
   * @returns Promise que se resuelve cuando se completa la operación
   */
  actualizarOrdenProductos(
    coleccionId: string,
    productosOrden: Array<{ productoId: string; orden: number }>,
  ): Promise<void>;

  /**
   * Obtiene los productos de una colección con paginación
   * @param coleccionId - ID de la colección
   * @param pagina - Número de página (comenzando en 1)
   * @param limite - Límite de productos por página
   * @returns Promise con la lista de productos y metadatos de paginación
   */
  obtenerProductos(
    coleccionId: string,
    pagina: number,
    limite: number,
  ): Promise<{ productos: any[]; total: number }>;

  /**
   * Exporta colecciones a CSV
   * @param filtros - Filtros para la exportación
   * @returns Promise con el contenido CSV
   */
  exportarCSV(filtros?: {
    tiendaId?: string;
    estado?: 'ACTIVA' | 'ARCHIVADA' | 'ELIMINADA';
    tipo?: 'MANUAL' | 'AUTOMATICA';
    fechaDesde?: Date;
    fechaHasta?: Date;
  }): Promise<string>;

  /**
   * Importa colecciones desde CSV
   * @param csvData - Datos CSV
   * @param tiendaId - ID de la tienda
   * @param creadorId - ID del usuario creador
   * @returns Promise con el resultado de la importación
   */
  importarCSV(
    csvData: string,
    tiendaId: string,
    creadorId: string,
  ): Promise<{ exitosos: number; fallidos: number; errores: string[] }>;

  /**
   * Actualiza la visibilidad por canal de una colección
   * @param id - ID de la colección
   * @param tiendaOnline - Visibilidad en tienda online
   * @param pointOfSale - Visibilidad en point of sale
   * @returns Promise con la colección actualizada
   */
  actualizarVisibilidadCanales(
    id: string,
    tiendaOnline: boolean,
    pointOfSale: boolean,
  ): Promise<Coleccion>;

  /**
   * Verifica si un slug ya existe en el sistema
   * @param slug - Slug a verificar
   * @param idExcluir - ID de la colección a excluir (para actualizaciones)
   * @returns Promise con true si el slug existe, false en caso contrario
   */
  existeSlug(slug: string, idExcluir?: string): Promise<boolean>;

  /**
   * Genera estadísticas de colecciones
   * @param tiendaId - ID de la tienda
   * @returns Promise con las estadísticas
   */
  obtenerEstadisticas(tiendaId: string): Promise<{
    total: number;
    activas: number;
    archivadas: number;
    manuales: number;
    automaticas: number;
    conProductos: number;
    promedioProductos: number;
  }>;

  /**
   * Ejecuta las reglas de una colección automática para actualizar sus productos
   * @param coleccionId - ID de la colección automática
   * @returns Promise con el resultado de la ejecución
   */
  ejecutarReglasAutomaticas(coleccionId: string): Promise<{
    productosAgregados: number;
    productosEliminados: number;
    totalProductos: number;
  }>;
}