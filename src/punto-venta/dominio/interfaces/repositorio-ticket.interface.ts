import { Ticket } from '../entidades/ticket.entity';
import { MetodoPago, EstadoPago } from '../../../ordenes/dominio/enums/orden.enum';

/**
 * Interfaz para el repositorio de Ticket
 * Define las operaciones de persistencia para entidades Ticket
 */
export interface RepositorioTicket {
  /**
   * Guarda un nuevo ticket
   * @param ticket - Entidad de ticket a guardar
   * @returns Promise con el ticket guardado
   */
  guardar(ticket: Ticket): Promise<Ticket>;

  /**
   * Busca un ticket por su ID
   * @param id - ID del ticket
   * @returns Promise con el ticket encontrado o null
   */
  buscarPorId(id: string): Promise<Ticket | null>;

  /**
   * Busca un ticket por su número de ticket
   * @param numero_ticket - Número único del ticket
   * @returns Promise con el ticket encontrado o null
   */
  buscarPorNumero(numero_ticket: string): Promise<Ticket | null>;

  /**
   * Busca tickets por ID de caja
   * @param caja_id - ID de la caja
   * @returns Promise con array de tickets
   */
  buscarPorCaja(caja_id: string): Promise<Ticket[]>;

  /**
   * Busca tickets por ID de cliente
   * @param cliente_id - ID del cliente
   * @returns Promise con array de tickets
   */
  buscarPorCliente(cliente_id: string): Promise<Ticket[]>;

  /**
   * Busca tickets por ID de usuario (vendedor)
   * @param usuario_id - ID del usuario
   * @returns Promise con array de tickets
   */
  buscarPorUsuario(usuario_id: string): Promise<Ticket[]>;

  /**
   * Busca tickets por estado de pago
   * @param estado_pago - Estado de pago
   * @returns Promise con array de tickets con el estado especificado
   */
  buscarPorEstadoPago(estado_pago: EstadoPago): Promise<Ticket[]>;

  /**
   * Busca tickets por método de pago
   * @param metodo_pago - Método de pago
   * @returns Promise con array de tickets con el método especificado
   */
  buscarPorMetodoPago(metodo_pago: MetodoPago): Promise<Ticket[]>;

  /**
   * Actualiza un ticket existente
   * @param ticket - Entidad de ticket con datos actualizados
   * @returns Promise con el ticket actualizado
   */
  actualizar(ticket: Ticket): Promise<Ticket>;

  /**
   * Elimina un ticket por su ID
   * @param id - ID del ticket a eliminar
   * @returns Promise con el resultado de la operación
   */
  eliminar(id: string): Promise<void>;

  /**
   * Marca un ticket como pagado
   * @param ticket_id - ID del ticket
   * @returns Promise con el ticket actualizado
   */
  marcarComoPagado(ticket_id: string): Promise<Ticket>;

  /**
   * Marca un ticket como fallido
   * @param ticket_id - ID del ticket
   * @returns Promise con el ticket actualizado
   */
  marcarComoFallido(ticket_id: string): Promise<Ticket>;

  /**
   * Genera un número de ticket único
   * @param prefijo - Prefijo opcional para el número de ticket
   * @returns Promise con el número de ticket generado
   */
  generarNumeroTicket(prefijo?: string): Promise<string>;

  /**
   * Obtiene estadísticas de tickets por caja
   * @param caja_id - ID de la caja
   * @returns Promise con estadísticas de tickets
   */
  obtenerEstadisticasPorCaja(caja_id: string): Promise<{
    total_tickets: number;
    tickets_pagados: number;
    tickets_pendientes: number;
    tickets_fallidos: number;
    total_ventas: number;
    promedio_ticket: number;
  }>;

  /**
   * Obtiene estadísticas de tickets por día
   * @param caja_id - ID de la caja
   * @param fecha - Fecha específica (opcional, por defecto hoy)
   * @returns Promise con estadísticas del día
   */
  obtenerEstadisticasPorDia(caja_id: string, fecha?: Date): Promise<{
    fecha: Date;
    total_tickets: number;
    total_ventas: number;
    metodo_pago_estadisticas: { metodo: MetodoPago; cantidad: number; monto: number }[];
  }>;

  /**
   * Obtiene el historial de tickets de un cliente
   * @param cliente_id - ID del cliente
   * @param limite - Límite de resultados (opcional)
   * @returns Promise con array de tickets del cliente
   */
  obtenerHistorialCliente(cliente_id: string, limite?: number): Promise<Ticket[]>;

  /**
   * Busca tickets con filtros avanzados
   * @param filtros - Objeto con filtros de búsqueda
   * @returns Promise con array de tickets que cumplen los filtros
   */
  buscarConFiltros(filtros: {
    caja_id?: string;
    cliente_id?: string;
    usuario_id?: string;
    estado_pago?: EstadoPago;
    metodo_pago?: MetodoPago;
    fecha_desde?: Date;
    fecha_hasta?: Date;
    monto_minimo?: number;
    monto_maximo?: number;
  }): Promise<Ticket[]>;

  /**
   * Obtiene los tickets más recientes
   * @param caja_id - ID de la caja
   * @param limite - Límite de resultados
   * @returns Promise con array de tickets recientes
   */
  obtenerRecientes(caja_id: string, limite: number): Promise<Ticket[]>;

  /**
   * Obtiene el reporte de ventas por período
   * @param caja_id - ID de la caja
   * @param fecha_desde - Fecha desde
   * @param fecha_hasta - Fecha hasta
   * @returns Promise con reporte de ventas
   */
  obtenerReporteVentas(
    caja_id: string,
    fecha_desde: Date,
    fecha_hasta: Date
  ): Promise<{
    periodo: { desde: Date; hasta: Date };
    total_ventas: number;
    total_tickets: number;
    promedio_ticket: number;
    ventas_por_dia: { fecha: Date; total: number; tickets: number }[];
    ventas_por_metodo_pago: { metodo: MetodoPago; total: number; tickets: number }[];
  }>;

  /**
   * Obtiene los productos más vendidos
   * @param caja_id - ID de la caja
   * @param fecha_desde - Fecha desde
   * @param fecha_hasta - Fecha hasta
   * @param limite - Límite de resultados
   * @returns Promise con array de productos más vendidos
   */
  obtenerProductosMasVendidos(
    caja_id: string,
    fecha_desde: Date,
    fecha_hasta: Date,
    limite: number
  ): Promise<{ producto_id: string; cantidad_vendida: number; total_ventas: number }[]>;

  /**
   * Exporta tickets a formato CSV
   * @param filtros - Filtros para la exportación
   * @returns Promise con el contenido CSV
   */
  exportarCSV(filtros: {
    caja_id?: string;
    fecha_desde?: Date;
    fecha_hasta?: Date;
    estado_pago?: EstadoPago;
  }): Promise<string>;
}