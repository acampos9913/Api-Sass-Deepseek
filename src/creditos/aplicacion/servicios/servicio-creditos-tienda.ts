import { Injectable, Inject } from '@nestjs/common';
import { CreditoTienda } from '../../dominio/entidades/credito-tienda.entity';
import { RecargaCredito } from '../../dominio/entidades/recarga-credito.entity';
import { CreditoUsado } from '../../dominio/entidades/credito-usado.entity';
import { TipoServicioCredito } from '../../dominio/entidades/recarga-credito.entity';
import type { RepositorioCreditoTienda } from '../../dominio/interfaces/repositorio-credito-tienda.interface';

/**
 * Servicio que gestiona el sistema de créditos para tiendas
 * Controla recargas, consumos y reportes de créditos
 */
@Injectable()
export class ServicioCreditosTienda {
  constructor(
    @Inject('RepositorioCreditoTienda')
    private readonly repositorioCreditoTienda: RepositorioCreditoTienda,
  ) {}

  /**
   * Obtiene el balance actual de créditos de una tienda
   */
  async obtenerBalance(tiendaId: string): Promise<CreditoTienda> {
    let creditoTienda = await this.repositorioCreditoTienda.buscarCreditoTiendaPorId(tiendaId);
    
    if (!creditoTienda) {
      creditoTienda = await this.repositorioCreditoTienda.crearCreditoTiendaInicial(tiendaId);
    }

    return creditoTienda;
  }

  /**
   * Crea una recarga de créditos pendiente
   */
  async crearRecargaCredito(
    tiendaId: string,
    montoDolares: number,
    idPagoStripe: string,
  ): Promise<RecargaCredito> {
    // Validar monto mínimo
    if (montoDolares < 5) {
      throw new Error('El monto mínimo para recargar es 5 USD');
    }

    // Verificar que no exista una recarga pendiente con el mismo pago
    const recargaExistente = await this.repositorioCreditoTienda.buscarRecargaPorPagoStripe(idPagoStripe);
    if (recargaExistente) {
      throw new Error('Ya existe una recarga con este pago de Stripe');
    }

    const recarga = RecargaCredito.crear({
      tienda_id: tiendaId,
      monto_dolares: montoDolares,
      id_pago_stripe: idPagoStripe,
      estado: 'PENDIENTE',
    });

    return await this.repositorioCreditoTienda.guardarRecargaCredito(recarga);
  }

  /**
   * Procesa una recarga completada
   */
  async procesarRecargaCompletada(idPagoStripe: string): Promise<RecargaCredito> {
    const recarga = await this.repositorioCreditoTienda.buscarRecargaPorPagoStripe(idPagoStripe);
    
    if (!recarga) {
      throw new Error('Recarga no encontrada');
    }

    if (recarga.estado === 'COMPLETADO') {
      return recarga; // Ya está procesada
    }

    // Obtener o crear el balance de la tienda
    let creditoTienda = await this.repositorioCreditoTienda.buscarCreditoTiendaPorId(recarga.tienda_id);
    if (!creditoTienda) {
      creditoTienda = await this.repositorioCreditoTienda.crearCreditoTiendaInicial(recarga.tienda_id);
    }

    // Agregar créditos al balance
    creditoTienda.agregarCreditos(recarga.creditos_agregados);

    // Actualizar recarga y balance
    recarga.marcarCompletada();
    
    await this.repositorioCreditoTienda.guardarCreditoTienda(creditoTienda);
    return await this.repositorioCreditoTienda.actualizarEstadoRecarga(recarga.id, 'COMPLETADO');
  }

  /**
   * Marca una recarga como fallida
   */
  async marcarRecargaFallida(idPagoStripe: string): Promise<RecargaCredito> {
    const recarga = await this.repositorioCreditoTienda.buscarRecargaPorPagoStripe(idPagoStripe);
    
    if (!recarga) {
      throw new Error('Recarga no encontrada');
    }

    recarga.marcarFallida();
    return await this.repositorioCreditoTienda.actualizarEstadoRecarga(recarga.id, 'FALLIDO');
  }

  /**
   * Usa créditos para un servicio específico
   */
  async usarCreditos(
    tiendaId: string,
    cantidad: number,
    tipoServicio: TipoServicioCredito,
    descripcionServicio: string,
    idReferencia?: string,
    metadata?: Record<string, any>,
  ): Promise<CreditoUsado> {
    // Verificar créditos suficientes
    const tieneCreditos = await this.repositorioCreditoTienda.verificarCreditosSuficientes(tiendaId, cantidad);
    if (!tieneCreditos) {
      throw new Error('Créditos insuficientes');
    }

    // Obtener el balance actual
    const creditoTienda = await this.obtenerBalance(tiendaId);

    // Crear registro de uso
    const creditoUsado = CreditoUsado.crear({
      tienda_id: tiendaId,
      cantidad_creditos: cantidad,
      tipo_servicio: tipoServicio,
      descripcion_servicio: descripcionServicio,
      id_referencia: idReferencia,
      metadata: metadata || {},
    });

    // Consumir créditos y guardar registro
    creditoTienda.consumirCreditos(cantidad);
    
    await this.repositorioCreditoTienda.guardarCreditoTienda(creditoTienda);
    return await this.repositorioCreditoTienda.registrarUsoCredito(creditoUsado);
  }

  /**
   * Obtiene el resumen mensual de créditos
   */
  async obtenerResumenMensual(tiendaId: string, año: number, mes: number) {
    return await this.repositorioCreditoTienda.obtenerResumenMensual(tiendaId, año, mes);
  }

  /**
   * Obtiene el uso diario de créditos por mes
   */
  async obtenerUsoDiarioPorMes(tiendaId: string, año: number, mes: number) {
    return await this.repositorioCreditoTienda.obtenerUsoDiarioPorMes(tiendaId, año, mes);
  }

  /**
   * Obtiene el historial completo de créditos
   */
  async obtenerHistorialCompleto(tiendaId: string, limite?: number, pagina?: number) {
    return await this.repositorioCreditoTienda.obtenerHistorialCompleto(tiendaId, limite, pagina);
  }

  /**
   * Obtiene las recargas de una tienda
   */
  async obtenerRecargas(tiendaId: string): Promise<RecargaCredito[]> {
    return await this.repositorioCreditoTienda.buscarRecargasPorTienda(tiendaId);
  }

  /**
   * Obtiene los usos de créditos de una tienda
   */
  async obtenerUsos(tiendaId: string): Promise<CreditoUsado[]> {
    return await this.repositorioCreditoTienda.buscarUsosPorTienda(tiendaId);
  }

  /**
   * Obtiene los usos de créditos por tipo de servicio
   */
  async obtenerUsosPorTipoServicio(tiendaId: string, tipoServicio: TipoServicioCredito): Promise<CreditoUsado[]> {
    return await this.repositorioCreditoTienda.buscarUsosPorTiendaYTipoServicio(tiendaId, tipoServicio);
  }

  /**
   * Obtiene el top de servicios que más créditos consumen
   */
  async obtenerTopServiciosConsumo(tiendaId: string, limite?: number) {
    return await this.repositorioCreditoTienda.obtenerTopServiciosConsumo(tiendaId, limite);
  }

  /**
   * Verifica si hay créditos suficientes para una operación
   */
  async verificarCreditosSuficientes(tiendaId: string, cantidad: number): Promise<boolean> {
    return await this.repositorioCreditoTienda.verificarCreditosSuficientes(tiendaId, cantidad);
  }

  /**
   * Obtiene información detallada del balance con conversión a dólares
   */
  async obtenerInformacionBalanceDetallada(tiendaId: string) {
    const balance = await this.obtenerBalance(tiendaId);
    
    // Conversión: 1 USD = 100 créditos
    const valorDolarDisponible = balance.creditos_disponibles / 100;
    const valorDolarUsado = balance.creditos_usados / 100;
    const balanceTotal = balance.obtenerBalanceTotal();

    return {
      creditos_disponibles: balance.creditos_disponibles,
      creditos_usados: balance.creditos_usados,
      balance_total: balanceTotal,
      tasa_conversion: '1 USD = 100 créditos',
      valor_dolar_disponible: valorDolarDisponible,
      valor_dolar_usado: valorDolarUsado,
      fecha_actualizacion: balance.fecha_actualizacion,
    };
  }
}