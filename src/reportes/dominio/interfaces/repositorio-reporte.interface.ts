import { TipoReporte, EstadoReporte, ParametrosReporte, DatosReporte } from '../entidades/reporte.entity';

/**
 * Interfaz del repositorio de reporte que define las operaciones de persistencia
 * Sigue el principio de inversión de dependencias de la Arquitectura Limpia
 */
export interface RepositorioReporte {
  /**
   * Crea un nuevo reporte en el sistema
   */
  crear(reporte: {
    id: string;
    tipo: TipoReporte;
    datos: DatosReporte;
    parametros: ParametrosReporte;
    fechaGeneracion: Date;
    fechaInicio: Date;
    fechaFin: Date;
    estado: EstadoReporte;
    metricas?: Record<string, any>;
  }): Promise<void>;

  /**
   * Busca un reporte por su ID único
   */
  buscarPorId(id: string): Promise<{
    id: string;
    tipo: TipoReporte;
    datos: DatosReporte;
    parametros: ParametrosReporte;
    fechaGeneracion: Date;
    fechaInicio: Date;
    fechaFin: Date;
    estado: EstadoReporte;
    metricas?: Record<string, any>;
  } | null>;

  /**
   * Lista todos los reportes con paginación y filtros
   */
  listar(filtros: {
    pagina: number;
    limite: number;
    tipo?: TipoReporte;
    estado?: EstadoReporte;
    fechaInicio?: Date;
    fechaFin?: Date;
  }): Promise<{
    reportes: Array<{
      id: string;
      tipo: TipoReporte;
      parametros: ParametrosReporte;
      fechaGeneracion: Date;
      fechaInicio: Date;
      fechaFin: Date;
      estado: EstadoReporte;
      metricas?: Record<string, any>;
    }>;
    total: number;
  }>;

  /**
   * Actualiza el estado de un reporte existente
   */
  actualizarEstado(
    id: string,
    estado: EstadoReporte,
    datos?: DatosReporte,
    metricas?: Record<string, any>,
  ): Promise<void>;

  /**
   * Elimina un reporte del sistema
   */
  eliminar(id: string): Promise<void>;

  /**
   * Obtiene estadísticas de reportes generados
   */
  obtenerEstadisticas(): Promise<{
    totalReportes: number;
    reportesPorTipo: Record<TipoReporte, number>;
    reportesPorEstado: Record<EstadoReporte, number>;
    reportesUltimaSemana: number;
  }>;

  /**
   * Busca reportes por tipo y rango de fechas
   */
  buscarPorTipoYRango(
    tipo: TipoReporte,
    fechaInicio: Date,
    fechaFin: Date,
  ): Promise<Array<{
    id: string;
    parametros: ParametrosReporte;
    fechaGeneracion: Date;
    estado: EstadoReporte;
  }>>;

  /**
   * Obtiene el último reporte generado de un tipo específico
   */
  obtenerUltimoReportePorTipo(tipo: TipoReporte): Promise<{
    id: string;
    fechaGeneracion: Date;
    parametros: ParametrosReporte;
    estado: EstadoReporte;
  } | null>;

  /**
   * Limpia reportes antiguos (más de 30 días)
   */
  limpiarReportesAntiguos(): Promise<number>;
}