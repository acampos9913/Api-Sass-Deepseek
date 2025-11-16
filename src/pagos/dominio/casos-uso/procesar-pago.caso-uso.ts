import { Injectable, Inject } from '@nestjs/common';
import { Pago, TipoMetodoPago, EstadoPago, MetodoPago, DatosPago } from '../entidades/pago.entity';
import type { RepositorioPago } from '../interfaces/repositorio-pago.interface';
import type { RepositorioOrden } from '../../../ordenes/dominio/interfaces/repositorio-orden.interface';

/**
 * Parámetros para procesar un pago
 */
export interface ParametrosProcesarPago {
  ordenId: string;
  monto: number;
  moneda: string;
  metodoPago: MetodoPago;
  referenciaExterna?: string;
}

/**
 * Caso de uso para procesar pagos
 * Sigue los principios de la arquitectura limpia
 */
@Injectable()
export class ProcesarPagoCasoUso {
  constructor(
    @Inject('RepositorioPago')
    private readonly repositorioPago: RepositorioPago,
    @Inject('RepositorioOrden')
    private readonly repositorioOrden: RepositorioOrden,
  ) {}

  /**
   * Ejecuta el caso de uso para procesar un pago
   * @param parametros Parámetros para procesar el pago
   * @returns El pago procesado
   */
  async ejecutar(parametros: ParametrosProcesarPago): Promise<Pago> {
    // Validar parámetros básicos
    this.validarParametrosBasicos(parametros);

    // Verificar que la orden existe
    await this.verificarOrden(parametros.ordenId);

    // Verificar que no exista un pago completado para esta orden
    await this.verificarPagoExistente(parametros.ordenId);

    // Generar ID único para el pago
    const id = this.generarIdUnico();

    // Crear datos de pago iniciales según el método
    const datosPago = this.crearDatosPagoIniciales(parametros.metodoPago.tipo);

    // Crear entidad de pago
    const pago = new Pago(
      id,
      parametros.ordenId,
      parametros.monto,
      parametros.moneda,
      parametros.metodoPago,
      EstadoPago.PENDIENTE,
      parametros.referenciaExterna || null,
      datosPago,
      new Date(),
      new Date(),
    );

    // Validar el pago
    pago.validar();

    // Guardar pago en estado pendiente
    await this.repositorioPago.crear({
      id: pago.getId(),
      ordenId: pago.getOrdenId(),
      monto: pago.getMonto(),
      moneda: pago.getMoneda(),
      metodoPago: pago.getMetodoPago(),
      estado: pago.getEstado(),
      referenciaExterna: pago.getReferenciaExterna(),
      datosPago: pago.getDatosPago(),
      fechaCreacion: pago.getFechaCreacion(),
      fechaActualizacion: pago.getFechaActualizacion(),
    });

    try {
      // Procesar el pago
      await pago.procesar();

      // Actualizar pago en el repositorio
      await this.repositorioPago.actualizarEstado(
        pago.getId(),
        pago.getEstado(),
        pago.getDatosPago(),
        pago.getFechaActualizacion(),
      );

      return pago;
    } catch (error) {
      // Actualizar pago con estado fallido
      await this.repositorioPago.actualizarEstado(
        pago.getId(),
        EstadoPago.FALLIDO,
        pago.getDatosPago(),
        new Date(),
      );

      throw new Error(`Error al procesar pago: ${error.message}`);
    }
  }

  /**
   * Valida los parámetros básicos para procesar un pago
   */
  private validarParametrosBasicos(parametros: ParametrosProcesarPago): void {
    if (!parametros.ordenId) {
      throw new Error('El ID de la orden es requerido');
    }

    if (!parametros.monto || parametros.monto <= 0) {
      throw new Error('El monto del pago debe ser mayor a 0');
    }

    if (!parametros.moneda) {
      throw new Error('La moneda del pago es requerida');
    }

    if (!parametros.metodoPago) {
      throw new Error('El método de pago es requerido');
    }

    if (!parametros.metodoPago.tipo) {
      throw new Error('El tipo de método de pago es requerido');
    }
  }

  /**
   * Verifica que la orden exista
   */
  private async verificarOrden(ordenId: string): Promise<void> {
    const orden = await this.repositorioOrden.buscarPorId(ordenId);
    if (!orden) {
      throw new Error(`La orden con ID ${ordenId} no existe`);
    }
  }

  /**
   * Verifica que no exista un pago completado para esta orden
   */
  private async verificarPagoExistente(ordenId: string): Promise<void> {
    const pagos = await this.repositorioPago.buscarPorOrdenId(ordenId);
    const pagoCompletado = pagos.find(pago => pago.estado === EstadoPago.COMPLETADO);

    if (pagoCompletado) {
      throw new Error('Ya existe un pago completado para esta orden');
    }
  }

  /**
   * Genera un ID único para el pago
   */
  private generarIdUnico(): string {
    return `pago_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Crea datos de pago iniciales según el tipo de método
   */
  private crearDatosPagoIniciales(tipoMetodo: TipoMetodoPago): DatosPago {
    switch (tipoMetodo) {
      case TipoMetodoPago.TARJETA_CREDITO:
        return {
          idTransaccion: '',
          codigoAutorizacion: '',
          procesadorPago: '',
          fechaProcesamiento: new Date(),
        };
      case TipoMetodoPago.PAYPAL:
        return {
          idTransaccionPayPal: '',
          estadoPayPal: '',
          fechaProcesamiento: new Date(),
        };
      case TipoMetodoPago.TRANSFERENCIA:
        return {
          numeroReferencia: '',
          fechaTransferencia: new Date(),
          fechaProcesamiento: new Date(),
        };
      case TipoMetodoPago.EFECTIVO:
        return {
          fechaPago: new Date(),
          comprobante: '',
          fechaProcesamiento: new Date(),
        };
      default:
        throw new Error(`Tipo de método de pago no soportado: ${tipoMetodo}`);
    }
  }
}