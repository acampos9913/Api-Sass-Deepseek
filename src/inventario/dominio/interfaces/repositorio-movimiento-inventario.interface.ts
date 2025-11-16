import { TipoMovimientoInventario } from '../enums/tipo-movimiento-inventario.enum';

/**
 * Interfaz del repositorio de movimiento de inventario que define las operaciones de persistencia
 * Sigue el principio de inversión de dependencias de la Arquitectura Limpia
 */
export interface RepositorioMovimientoInventario {
  /**
   * Crea un nuevo movimiento de inventario en el sistema
   */
  crear(movimiento: {
    id: string;
    productoId: string;
    varianteId: string | null;
    tipo: TipoMovimientoInventario;
    cantidad: number;
    stockAnterior: number;
    stockActual: number;
    motivo: string;
    fechaCreacion: Date;
    usuarioId: string | null;
  }): Promise<void>;

  /**
   * Busca un movimiento de inventario por su ID único
   */
  buscarPorId(id: string): Promise<{
    id: string;
    productoId: string;
    varianteId: string | null;
    tipo: TipoMovimientoInventario;
    cantidad: number;
    stockAnterior: number;
    stockActual: number;
    motivo: string;
    fechaCreacion: Date;
    usuarioId: string | null;
  } | null>;

  /**
   * Lista todos los movimientos de inventario con paginación y filtros
   */
  listar(filtros: {
    pagina: number;
    limite: number;
    productoId?: string;
    varianteId?: string;
    tipo?: TipoMovimientoInventario;
    fechaDesde?: Date;
    fechaHasta?: Date;
  }): Promise<{
    movimientos: Array<{
      id: string;
      productoId: string;
      varianteId: string | null;
      tipo: TipoMovimientoInventario;
      cantidad: number;
      stockAnterior: number;
      stockActual: number;
      motivo: string;
      fechaCreacion: Date;
      usuarioId: string | null;
    }>;
    total: number;
  }>;

  /**
   * Obtiene el historial de movimientos para un producto específico
   */
  obtenerHistorialProducto(
    productoId: string,
    pagina: number,
    limite: number,
  ): Promise<{
    movimientos: Array<{
      id: string;
      productoId: string;
      varianteId: string | null;
      tipo: TipoMovimientoInventario;
      cantidad: number;
      stockAnterior: number;
      stockActual: number;
      motivo: string;
      fechaCreacion: Date;
      usuarioId: string | null;
    }>;
    total: number;
  }>;

  /**
   * Obtiene el historial de movimientos para una variante específica
   */
  obtenerHistorialVariante(
    varianteId: string,
    pagina: number,
    limite: number,
  ): Promise<{
    movimientos: Array<{
      id: string;
      productoId: string;
      varianteId: string | null;
      tipo: TipoMovimientoInventario;
      cantidad: number;
      stockAnterior: number;
      stockActual: number;
      motivo: string;
      fechaCreacion: Date;
      usuarioId: string | null;
    }>;
    total: number;
  }>;

  /**
   * Obtiene estadísticas de inventario
   */
  obtenerEstadisticas(filtros?: {
    fechaDesde?: Date;
    fechaHasta?: Date;
    productoId?: string;
  }): Promise<{
    totalMovimientos: number;
    totalEntradas: number;
    totalSalidas: number;
    totalAjustes: number;
    valorTotalEntradas: number;
    valorTotalSalidas: number;
  }>;

  /**
   * Obtiene el stock actual de un producto
   */
  obtenerStockProducto(productoId: string): Promise<number>;

  /**
   * Obtiene el stock actual de una variante
   */
  obtenerStockVariante(varianteId: string): Promise<number>;

  /**
   * Verifica si hay suficiente stock para una venta
   */
  verificarStockSuficiente(
    varianteId: string,
    cantidadRequerida: number,
  ): Promise<boolean>;

  /**
   * Obtiene productos con stock bajo (para alertas)
   */
  obtenerProductosStockBajo(limiteMinimo: number): Promise<
    Array<{
      productoId: string;
      varianteId: string | null;
      stockActual: number;
      tituloProducto: string;
      tituloVariante?: string;
    }>
  >;
}