import { TipoMetodoPago, EstadoPago, MetodoPago, DatosPago } from '../entidades/pago.entity';

/**
 * Interfaz del repositorio de pago que define las operaciones de persistencia
 * Sigue el principio de inversión de dependencias de la Arquitectura Limpia
 */
export interface RepositorioPago {
  /**
   * Crea un nuevo pago en el sistema
   */
  crear(pago: {
    id: string;
    ordenId: string;
    monto: number;
    moneda: string;
    metodoPago: MetodoPago;
    estado: EstadoPago;
    referenciaExterna: string | null;
    datosPago: DatosPago;
    fechaCreacion: Date;
    fechaActualizacion: Date;
  }): Promise<void>;

  /**
   * Busca un pago por su ID único
   */
  buscarPorId(id: string): Promise<{
    id: string;
    ordenId: string;
    monto: number;
    moneda: string;
    metodoPago: MetodoPago;
    estado: EstadoPago;
    referenciaExterna: string | null;
    datosPago: DatosPago;
    fechaCreacion: Date;
    fechaActualizacion: Date;
  } | null>;

  /**
   * Busca pagos por ID de orden
   */
  buscarPorOrdenId(ordenId: string): Promise<Array<{
    id: string;
    monto: number;
    moneda: string;
    metodoPago: MetodoPago;
    estado: EstadoPago;
    fechaCreacion: Date;
    fechaActualizacion: Date;
  }>>;

  /**
   * Lista todos los pagos con paginación y filtros
   */
  listar(filtros: {
    pagina: number;
    limite: number;
    estado?: EstadoPago;
    metodoPago?: TipoMetodoPago;
    fechaInicio?: Date;
    fechaFin?: Date;
    ordenId?: string;
  }): Promise<{
    pagos: Array<{
      id: string;
      ordenId: string;
      monto: number;
      moneda: string;
      metodoPago: MetodoPago;
      estado: EstadoPago;
      fechaCreacion: Date;
      fechaActualizacion: Date;
    }>;
    total: number;
  }>;

  /**
   * Actualiza el estado de un pago existente
   */
  actualizarEstado(
    id: string,
    estado: EstadoPago,
    datosPago?: DatosPago,
    fechaActualizacion?: Date,
  ): Promise<void>;

  /**
   * Actualiza los datos de pago de un pago existente
   */
  actualizarDatosPago(
    id: string,
    datosPago: DatosPago,
    fechaActualizacion?: Date,
  ): Promise<void>;

  /**
   * Elimina un pago del sistema
   */
  eliminar(id: string): Promise<void>;

  /**
   * Obtiene estadísticas de pagos
   */
  obtenerEstadisticas(): Promise<{
    totalPagos: number;
    pagosPorEstado: Record<EstadoPago, number>;
    pagosPorMetodo: Record<TipoMetodoPago, number>;
    totalRecaudado: number;
    pagosUltimaSemana: number;
  }>;

  /**
   * Busca pagos por referencia externa
   */
  buscarPorReferenciaExterna(referenciaExterna: string): Promise<{
    id: string;
    ordenId: string;
    monto: number;
    estado: EstadoPago;
    fechaCreacion: Date;
  } | null>;

  /**
   * Obtiene el último pago de una orden específica
   */
  obtenerUltimoPagoPorOrden(ordenId: string): Promise<{
    id: string;
    monto: number;
    estado: EstadoPago;
    fechaCreacion: Date;
  } | null>;

  /**
   * Obtiene pagos fallidos recientes
   */
  obtenerPagosFallidosRecientes(dias: number): Promise<Array<{
    id: string;
    ordenId: string;
    monto: number;
    metodoPago: MetodoPago;
    fechaCreacion: Date;
    datosPago: DatosPago;
  }>>;

  /**
   * Obtiene pagos pendientes de procesamiento
   */
  obtenerPagosPendientes(): Promise<Array<{
    id: string;
    ordenId: string;
    monto: number;
    metodoPago: MetodoPago;
    fechaCreacion: Date;
  }>>;

  /**
   * Verifica si existe un pago para una orden específica
   */
  existePagoParaOrden(ordenId: string): Promise<boolean>;

  /**
   * Obtiene el total recaudado en un período específico
   */
  obtenerTotalRecaudado(fechaInicio: Date, fechaFin: Date): Promise<number>;

  /**
   * Obtiene pagos por rango de fechas
   */
  obtenerPagosPorRango(fechaInicio: Date, fechaFin: Date): Promise<Array<{
    id: string;
    ordenId: string;
    monto: number;
    estado: EstadoPago;
    metodoPago: MetodoPago;
    fechaCreacion: Date;
  }>>;
}