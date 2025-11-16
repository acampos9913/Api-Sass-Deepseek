import { Caja, EstadoCaja } from '../entidades/caja.entity';

/**
 * Interfaz para el repositorio de Caja
 * Define las operaciones de persistencia para entidades Caja
 */
export interface RepositorioCaja {
  /**
   * Guarda una nueva caja
   * @param caja - Entidad de caja a guardar
   * @returns Promise con la caja guardada
   */
  guardar(caja: Caja): Promise<Caja>;

  /**
   * Busca una caja por su ID
   * @param id - ID de la caja
   * @returns Promise con la caja encontrada o null
   */
  buscarPorId(id: string): Promise<Caja | null>;

  /**
   * Busca cajas por ID de sucursal
   * @param sucursal_id - ID de la sucursal
   * @returns Promise con array de cajas
   */
  buscarPorSucursal(sucursal_id: string): Promise<Caja[]>;

  /**
   * Busca cajas por estado
   * @param estado - Estado de la caja
   * @returns Promise con array de cajas con el estado especificado
   */
  buscarPorEstado(estado: EstadoCaja): Promise<Caja[]>;

  /**
   * Busca cajas abiertas por sucursal
   * @param sucursal_id - ID de la sucursal
   * @returns Promise con array de cajas abiertas
   */
  buscarAbiertasPorSucursal(sucursal_id: string): Promise<Caja[]>;

  /**
   * Actualiza una caja existente
   * @param caja - Entidad de caja con datos actualizados
   * @returns Promise con la caja actualizada
   */
  actualizar(caja: Caja): Promise<Caja>;

  /**
   * Elimina una caja por su ID
   * @param id - ID de la caja a eliminar
   * @returns Promise con el resultado de la operación
   */
  eliminar(id: string): Promise<void>;

  /**
   * Abre una caja con saldo inicial
   * @param caja_id - ID de la caja
   * @param usuario_id - ID del usuario que abre la caja
   * @param saldo_inicial - Saldo inicial de la caja
   * @returns Promise con la caja actualizada
   */
  abrirCaja(caja_id: string, usuario_id: string, saldo_inicial: number): Promise<Caja>;

  /**
   * Cierra una caja
   * @param caja_id - ID de la caja
   * @param usuario_id - ID del usuario que cierra la caja
   * @returns Promise con la caja actualizada
   */
  cerrarCaja(caja_id: string, usuario_id: string): Promise<Caja>;

  /**
   * Suspende una caja temporalmente
   * @param caja_id - ID de la caja
   * @returns Promise con la caja actualizada
   */
  suspenderCaja(caja_id: string): Promise<Caja>;

  /**
   * Reanuda una caja suspendida
   * @param caja_id - ID de la caja
   * @returns Promise con la caja actualizada
   */
  reanudarCaja(caja_id: string): Promise<Caja>;

  /**
   * Registra una venta en la caja y actualiza el saldo
   * @param caja_id - ID de la caja
   * @param monto_venta - Monto de la venta
   * @returns Promise con la caja actualizada
   */
  registrarVenta(caja_id: string, monto_venta: number): Promise<Caja>;

  /**
   * Registra un retiro de efectivo de la caja
   * @param caja_id - ID de la caja
   * @param monto_retiro - Monto del retiro
   * @returns Promise con la caja actualizada
   */
  registrarRetiro(caja_id: string, monto_retiro: number): Promise<Caja>;

  /**
   * Verifica si existe una caja con el mismo nombre en la misma sucursal
   * @param nombre - Nombre de la caja
   * @param sucursal_id - ID de la sucursal
   * @returns Promise con boolean indicando si existe
   */
  existeConNombre(nombre: string, sucursal_id: string): Promise<boolean>;

  /**
   * Obtiene estadísticas de cajas por sucursal
   * @param sucursal_id - ID de la sucursal
   * @returns Promise con estadísticas de cajas
   */
  obtenerEstadisticasPorSucursal(sucursal_id: string): Promise<{
    total_cajas: number;
    cajas_abiertas: number;
    cajas_cerradas: number;
    cajas_suspendidas: number;
    total_ventas_dia: number;
    promedio_ventas_por_caja: number;
  }>;

  /**
   * Obtiene el historial de operaciones de una caja
   * @param caja_id - ID de la caja
   * @param fecha_desde - Fecha desde la que buscar
   * @param fecha_hasta - Fecha hasta la que buscar
   * @returns Promise con historial de operaciones
   */
  obtenerHistorialOperaciones(
    caja_id: string,
    fecha_desde?: Date,
    fecha_hasta?: Date
  ): Promise<{
    fecha: Date;
    tipo_operacion: string;
    monto: number;
    descripcion: string;
  }[]>;

  /**
   * Busca cajas con filtros avanzados
   * @param filtros - Objeto con filtros de búsqueda
   * @returns Promise con array de cajas que cumplen los filtros
   */
  buscarConFiltros(filtros: {
    sucursal_id?: string;
    estado?: EstadoCaja;
    usuario_apertura_id?: string;
    usuario_cierre_id?: string;
    fecha_apertura_desde?: Date;
    fecha_apertura_hasta?: Date;
    fecha_cierre_desde?: Date;
    fecha_cierre_hasta?: Date;
  }): Promise<Caja[]>;

  /**
   * Obtiene el reporte de cierre de caja
   * @param caja_id - ID de la caja
   * @returns Promise con reporte de cierre
   */
  obtenerReporteCierre(caja_id: string): Promise<{
    saldo_inicial: number;
    saldo_final: number;
    total_ventas: number;
    total_retiros: number;
    diferencia: number;
    cantidad_tickets: number;
    fecha_apertura: Date;
    fecha_cierre: Date;
  }>;
}