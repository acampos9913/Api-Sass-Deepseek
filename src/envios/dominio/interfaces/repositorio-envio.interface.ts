/**
 * Interfaz de Repositorio para Envíos
 * Define las operaciones de persistencia para la entidad Envio
 * Sigue los principios de la Arquitectura Limpia
 */
import { Envio, EstadoEnvio, TipoMetodoEnvio } from '../entidades/envio.entity';

export interface RepositorioEnvio {
  /**
   * Guarda un nuevo envío en la base de datos
   * @param envio - La entidad Envio a guardar
   * @returns Promise<Envio> - El envío guardado
   */
  guardar(envio: Envio): Promise<Envio>;

  /**
   * Busca un envío por su ID
   * @param id - El ID del envío
   * @returns Promise<Envio | null> - El envío encontrado o null
   */
  buscarPorId(id: string): Promise<Envio | null>;

  /**
   * Busca envíos por el ID de la orden
   * @param ordenId - El ID de la orden
   * @returns Promise<Envio[]> - Lista de envíos de la orden
   */
  buscarPorOrdenId(ordenId: string): Promise<Envio[]>;

  /**
   * Busca envíos por número de tracking
   * @param trackingNumber - El número de tracking
   * @returns Promise<Envio | null> - El envío encontrado o null
   */
  buscarPorTrackingNumber(trackingNumber: string): Promise<Envio | null>;

  /**
   * Lista todos los envíos con paginación
   * @param pagina - Número de página (por defecto 1)
   * @param limite - Límite de elementos por página (por defecto 10)
   * @returns Promise<{envios: Envio[], total: number}> - Lista paginada de envíos y total
   */
  listar(
    pagina?: number,
    limite?: number,
  ): Promise<{ envios: Envio[]; total: number }>;

  /**
   * Lista envíos por estado con paginación
   * @param estado - Estado del envío a filtrar
   * @param pagina - Número de página (por defecto 1)
   * @param limite - Límite de elementos por página (por defecto 10)
   * @returns Promise<{envios: Envio[], total: number}> - Lista paginada de envíos y total
   */
  listarPorEstado(
    estado: EstadoEnvio,
    pagina?: number,
    limite?: number,
  ): Promise<{ envios: Envio[]; total: number }>;

  /**
   * Lista envíos por método de envío con paginación
   * @param metodoEnvio - Tipo de método de envío
   * @param pagina - Número de página (por defecto 1)
   * @param limite - Límite de elementos por página (por defecto 10)
   * @returns Promise<{envios: Envio[], total: number}> - Lista paginada de envíos y total
   */
  listarPorMetodoEnvio(
    metodoEnvio: TipoMetodoEnvio,
    pagina?: number,
    limite?: number,
  ): Promise<{ envios: Envio[]; total: number }>;

  /**
   * Actualiza un envío existente
   * @param envio - La entidad Envio actualizada
   * @returns Promise<Envio> - El envío actualizado
   */
  actualizar(envio: Envio): Promise<Envio>;

  /**
   * Elimina un envío por su ID
   * @param id - El ID del envío a eliminar
   * @returns Promise<void>
   */
  eliminar(id: string): Promise<void>;

  /**
   * Obtiene estadísticas de envíos
   * @returns Promise<EstadisticasEnvios> - Estadísticas de envíos
   */
  obtenerEstadisticas(): Promise<EstadisticasEnvios>;

  /**
   * Busca envíos que están atrasados
   * @returns Promise<Envio[]> - Lista de envíos atrasados
   */
  buscarEnviosAtrasados(): Promise<Envio[]>;

  /**
   * Busca envíos por rango de fechas
   * @param fechaInicio - Fecha de inicio del rango
   * @param fechaFin - Fecha de fin del rango
   * @param pagina - Número de página (por defecto 1)
   * @param limite - Límite de elementos por página (por defecto 10)
   * @returns Promise<{envios: Envio[], total: number}> - Lista paginada de envíos y total
   */
  buscarPorRangoFechas(
    fechaInicio: Date,
    fechaFin: Date,
    pagina?: number,
    limite?: number,
  ): Promise<{ envios: Envio[]; total: number }>;

  /**
   * Busca envíos por país de destino
   * @param pais - País de destino
   * @param pagina - Número de página (por defecto 1)
   * @param limite - Límite de elementos por página (por defecto 10)
   * @returns Promise<{envios: Envio[], total: number}> - Lista paginada de envíos y total
   */
  buscarPorPais(
    pais: string,
    pagina?: number,
    limite?: number,
  ): Promise<{ envios: Envio[]; total: number }>;

  /**
   * Busca envíos por ciudad de destino
   * @param ciudad - Ciudad de destino
   * @param pagina - Número de página (por defecto 1)
   * @param limite - Límite de elementos por página (por defecto 10)
   * @returns Promise<{envios: Envio[], total: number}> - Lista paginada de envíos y total
   */
  buscarPorCiudad(
    ciudad: string,
    pagina?: number,
    limite?: number,
  ): Promise<{ envios: Envio[]; total: number }>;

  /**
   * Verifica si existe un envío para una orden específica
   * @param ordenId - El ID de la orden
   * @returns Promise<boolean> - True si existe un envío para la orden
   */
  existeEnvioParaOrden(ordenId: string): Promise<boolean>;

  /**
   * Obtiene el costo total de envíos en un período
   * @param fechaInicio - Fecha de inicio del período
   * @param fechaFin - Fecha de fin del período
   * @returns Promise<number> - Costo total de envíos
   */
  obtenerCostoTotalEnPeriodo(fechaInicio: Date, fechaFin: Date): Promise<number>;

  /**
   * Obtiene los métodos de envío más utilizados
   * @param limite - Límite de resultados (por defecto 5)
   * @returns Promise<MetodoEnvioMasUtilizado[]> - Métodos de envío más utilizados
   */
  obtenerMetodosEnvioMasUtilizados(limite?: number): Promise<MetodoEnvioMasUtilizado[]>;
}

/**
 * Interfaz para las estadísticas de envíos
 */
export interface EstadisticasEnvios {
  totalEnvios: number;
  enviosPendientes: number;
  enviosProcesando: number;
  enviosEnviados: number;
  enviosEnTransito: number;
  enviosEntregados: number;
  enviosCancelados: number;
  enviosAtrasados: number;
  costoTotalEnvios: number;
  promedioTiempoEntrega: number; // en días
  metodosEnvioMasUtilizados: MetodoEnvioMasUtilizado[];
}

/**
 * Interfaz para los métodos de envío más utilizados
 */
export interface MetodoEnvioMasUtilizado {
  metodoEnvio: TipoMetodoEnvio;
  cantidad: number;
  porcentaje: number;
}