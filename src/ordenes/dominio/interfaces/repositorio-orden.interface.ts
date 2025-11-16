import { Orden } from '../entidades/orden.entity';
import { EstadoOrden, EstadoPago } from '../enums/estado-orden.enum';

/**
 * Filtros para listar órdenes
 */
export interface FiltrosOrdenes {
  estado?: EstadoOrden;
  estadoPago?: EstadoPago;
  clienteId?: string;
  fechaDesde?: Date;
  fechaHasta?: Date;
  numeroOrden?: string;
  esBorrador?: boolean;
  archivada?: boolean;
  fechaAbandonoDesde?: Date;
  fechaAbandonoHasta?: Date;
  incluirAbandonadas?: boolean;
  soloAbandonadas?: boolean;
  soloBorradores?: boolean;
  soloArchivadas?: boolean;
}

/**
 * Interfaz que define el contrato para el repositorio de órdenes
 * Sigue el principio de inversión de dependencias (DIP)
 */
export interface RepositorioOrden {
  /**
   * Busca una orden por su ID
   * @param id - ID de la orden a buscar
   * @returns Promise con la orden encontrada o null
   */
  buscarPorId(id: string): Promise<Orden | null>;

  /**
   * Busca una orden por su número de orden
   * @param numeroOrden - Número de orden a buscar
   * @returns Promise con la orden encontrada o null
   */
  buscarPorNumeroOrden(numeroOrden: string): Promise<Orden | null>;

  /**
   * Guarda una nueva orden en el repositorio
   * @param orden - Orden a guardar
   * @returns Promise con la orden guardada
   */
  guardar(orden: Orden): Promise<Orden>;

  /**
   * Actualiza una orden existente
   * @param orden - Orden a actualizar
   * @returns Promise con la orden actualizada
   */
  actualizar(orden: Orden): Promise<Orden>;

  /**
   * Elimina una orden por su ID
   * @param id - ID de la orden a eliminar
   * @returns Promise que se resuelve cuando se completa la eliminación
   */
  eliminar(id: string): Promise<void>;

  /**
   * Lista todas las órdenes con paginación y filtros
   * @param pagina - Número de página (comenzando en 1)
   * @param limite - Límite de órdenes por página
   * @param filtros - Filtros opcionales para la búsqueda
   * @returns Promise con la lista de órdenes y metadatos de paginación
   */
  listar(
    pagina: number,
    limite: number,
    filtros?: FiltrosOrdenes,
  ): Promise<{ ordenes: Orden[]; total: number }>;

  /**
   * Lista órdenes por cliente
   * @param clienteId - ID del cliente
   * @param pagina - Número de página (comenzando en 1)
   * @param limite - Límite de órdenes por página
   * @returns Promise con la lista de órdenes y metadatos de paginación
   */
  listarPorCliente(
    clienteId: string,
    pagina: number,
    limite: number,
  ): Promise<{ ordenes: Orden[]; total: number }>;

  /**
   * Obtiene estadísticas de órdenes
   * @param fechaDesde - Fecha desde para filtrar
   * @param fechaHasta - Fecha hasta para filtrar
   * @returns Promise con estadísticas de órdenes
   */
  obtenerEstadisticas(
    fechaDesde?: Date,
    fechaHasta?: Date,
  ): Promise<{
    totalOrdenes: number;
    totalVentas: number;
    ordenesPorEstado: Record<EstadoOrden, number>;
    ordenesAbandonadas: number;
    totalBorradores: number;
    totalArchivadas: number;
  }>;

  /**
   * Obtiene órdenes abandonadas
   * @param fechaDesde - Fecha desde para filtrar
   * @param fechaHasta - Fecha hasta para filtrar
   * @param pagina - Número de página
   * @param limite - Límite de órdenes por página
   * @returns Promise con lista de órdenes abandonadas y paginación
   */
  listarAbandonadas(
    fechaDesde?: Date,
    fechaHasta?: Date,
    pagina?: number,
    limite?: number,
  ): Promise<{ ordenes: Orden[]; total: number }>;

  /**
   * Obtiene borradores de órdenes
   * @param pagina - Número de página
   * @param limite - Límite de órdenes por página
   * @returns Promise con lista de borradores y paginación
   */
  listarBorradores(
    pagina?: number,
    limite?: number,
  ): Promise<{ ordenes: Orden[]; total: number }>;

  /**
   * Obtiene órdenes archivadas
   * @param pagina - Número de página
   * @param limite - Límite de órdenes por página
   * @returns Promise con lista de órdenes archivadas y paginación
   */
  listarArchivadas(
    pagina?: number,
    limite?: number,
  ): Promise<{ ordenes: Orden[]; total: number }>;

  /**
   * Duplica una orden existente
   * @param ordenId - ID de la orden a duplicar
   * @param creadorId - ID del usuario que duplica la orden
   * @returns Promise con la nueva orden duplicada
   */
  duplicarOrden(ordenId: string, creadorId: string): Promise<Orden>;

  /**
   * Crea una reposición de una orden
   * @param ordenId - ID de la orden original
   * @param creadorId - ID del usuario que crea la reposición
   * @returns Promise con la nueva orden de reposición
   */
  crearReposicion(ordenId: string, creadorId: string): Promise<Orden>;

  /**
   * Verifica si un número de orden ya existe
   * @param numeroOrden - Número de orden a verificar
   * @returns Promise con true si el número existe, false en caso contrario
   */
  existeNumeroOrden(numeroOrden: string): Promise<boolean>;
}