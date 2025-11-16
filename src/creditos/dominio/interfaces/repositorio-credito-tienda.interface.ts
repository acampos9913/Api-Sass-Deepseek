import { CreditoTienda } from '../entidades/credito-tienda.entity';
import { RecargaCredito } from '../entidades/recarga-credito.entity';
import { CreditoUsado } from '../entidades/credito-usado.entity';
import { TipoServicioCredito } from '../entidades/recarga-credito.entity';

/**
 * Interfaz para el repositorio de Créditos de Tienda
 * Define las operaciones de persistencia para el sistema de créditos
 */
export interface RepositorioCreditoTienda {
  /**
   * Guarda o actualiza el balance de créditos de una tienda
   */
  guardarCreditoTienda(creditoTienda: CreditoTienda): Promise<CreditoTienda>;

  /**
   * Busca el balance de créditos por ID de tienda
   */
  buscarCreditoTiendaPorId(tiendaId: string): Promise<CreditoTienda | null>;

  /**
   * Crea un balance inicial de créditos para una tienda
   */
  crearCreditoTiendaInicial(tiendaId: string): Promise<CreditoTienda>;

  /**
   * Guarda una recarga de créditos
   */
  guardarRecargaCredito(recarga: RecargaCredito): Promise<RecargaCredito>;

  /**
   * Busca una recarga por ID
   */
  buscarRecargaPorId(id: string): Promise<RecargaCredito | null>;

  /**
   * Busca recargas por ID de tienda
   */
  buscarRecargasPorTienda(tiendaId: string): Promise<RecargaCredito[]>;

  /**
   * Busca recargas por ID de pago de Stripe
   */
  buscarRecargaPorPagoStripe(idPagoStripe: string): Promise<RecargaCredito | null>;

  /**
   * Actualiza el estado de una recarga
   */
  actualizarEstadoRecarga(id: string, estado: 'COMPLETADO' | 'PENDIENTE' | 'FALLIDO'): Promise<RecargaCredito>;

  /**
   * Registra el uso de créditos
   */
  registrarUsoCredito(creditoUsado: CreditoUsado): Promise<CreditoUsado>;

  /**
   * Busca usos de créditos por ID de tienda
   */
  buscarUsosPorTienda(tiendaId: string): Promise<CreditoUsado[]>;

  /**
   * Busca usos de créditos por tienda y rango de fechas
   */
  buscarUsosPorTiendaYRango(
    tiendaId: string, 
    fechaInicio: Date, 
    fechaFin: Date
  ): Promise<CreditoUsado[]>;

  /**
   * Busca usos de créditos por tienda y tipo de servicio
   */
  buscarUsosPorTiendaYTipoServicio(
    tiendaId: string, 
    tipoServicio: TipoServicioCredito
  ): Promise<CreditoUsado[]>;

  /**
   * Obtiene el resumen mensual de créditos por tienda
   */
  obtenerResumenMensual(
    tiendaId: string, 
    año: number, 
    mes: number
  ): Promise<{
    creditos_disponibles: number;
    creditos_usados: number;
    creditos_agregados: number;
    total_recargas: number;
    total_usos: number;
  }>;

  /**
   * Obtiene el uso diario de créditos por mes
   */
  obtenerUsoDiarioPorMes(
    tiendaId: string, 
    año: number, 
    mes: number
  ): Promise<Array<{
    fecha: string;
    creditos_usados: number;
    cantidad_operaciones: number;
    servicios: Array<{
      tipo_servicio: TipoServicioCredito;
      creditos_usados: number;
    }>;
  }>>;

  /**
   * Obtiene el historial completo de créditos (recargas y usos)
   */
  obtenerHistorialCompleto(
    tiendaId: string,
    limite?: number,
    pagina?: number
  ): Promise<{
    recargas: RecargaCredito[];
    usos: CreditoUsado[];
    total_recargas: number;
    total_usos: number;
  }>;

  /**
   * Verifica si una tienda tiene créditos suficientes
   */
  verificarCreditosSuficientes(tiendaId: string, cantidad: number): Promise<boolean>;

  /**
   * Obtiene el top de servicios que más créditos consumen
   */
  obtenerTopServiciosConsumo(
    tiendaId: string,
    limite?: number
  ): Promise<Array<{
    tipo_servicio: TipoServicioCredito;
    total_creditos: number;
    cantidad_operaciones: number;
  }>>;
}