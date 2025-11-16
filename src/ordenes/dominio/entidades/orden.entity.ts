import { EstadoOrden, EstadoPago, MetodoPago } from '../enums/estado-orden.enum';

/**
 * Datos del cliente al momento de la orden (snapshot)
 */
export interface DatosClienteSnapshot {
  id: string;
  email: string;
  nombreCompleto: string;
  telefono?: string;
}

/**
 * Datos de envío al momento de la orden (snapshot)
 */
export interface DatosEnvioSnapshot {
  direccion: string;
  ciudad: string;
  provincia: string;
  codigoPostal: string;
  pais: string;
}

/**
 * Datos de facturación al momento de la orden (snapshot)
 */
export interface DatosFacturacionSnapshot {
  direccion: string;
  ciudad: string;
  provincia: string;
  codigoPostal: string;
  pais: string;
  ruc?: string;
  razonSocial?: string;
}

/**
 * Entidad de Orden que representa una orden de compra en el sistema
 * Sigue los principios de Domain-Driven Design y Arquitectura Limpia
 */
export class Orden {
  constructor(
    public readonly id: string,
    public readonly numeroOrden: string,
    public readonly clienteId: string,
    public readonly estado: EstadoOrden,
    public readonly subtotal: number,
    public readonly impuestos: number,
    public readonly total: number,
    public readonly metodoPago: MetodoPago | null,
    public readonly estadoPago: EstadoPago,
    public readonly metodoEnvio: string | null,
    public readonly costoEnvio: number,
    public readonly direccionEnvioId: string | null,
    public readonly notas: string | null,
    public readonly notasInternas: string | null,
    public readonly fechaCreacion: Date,
    public readonly fechaActualizacion: Date,
    public readonly fechaPago: Date | null,
    public readonly fechaEnvio: Date | null,
    public readonly fechaEntrega: Date | null,
    public readonly fechaAbandono: Date | null,
    public readonly esBorrador: boolean,
    public readonly archivada: boolean,
    public readonly motivoCancelacion: string | null,
    public readonly datosCliente: DatosClienteSnapshot | null,
    public readonly datosEnvio: DatosEnvioSnapshot | null,
    public readonly datosFacturacion: DatosFacturacionSnapshot | null,
    public readonly creadorId: string,
    public readonly ordenOriginalId: string | null,
  ) {}

  /**
   * Verifica si la orden puede ser procesada
   */
  puedeProcesar(): boolean {
    return this.estado === EstadoOrden.PENDIENTE && this.estadoPago === EstadoPago.PAGADO;
  }

  /**
   * Verifica si la orden puede ser enviada
   */
  puedeEnviar(): boolean {
    return this.estado === EstadoOrden.CONFIRMADA || this.estado === EstadoOrden.PROCESANDO;
  }

  /**
   * Verifica si la orden puede ser cancelada
   */
  puedeCancelar(): boolean {
    return [
      EstadoOrden.PENDIENTE,
      EstadoOrden.CONFIRMADA,
      EstadoOrden.PROCESANDO,
    ].includes(this.estado);
  }

  /**
   * Verifica si la orden puede ser reembolsada
   */
  puedeReembolsar(): boolean {
    return this.estadoPago === EstadoPago.PAGADO && 
           [EstadoOrden.ENVIADA, EstadoOrden.ENTREGADA].includes(this.estado);
  }

  /**
   * Calcula el total de la orden incluyendo impuestos y envío
   */
  calcularTotal(): number {
    return this.subtotal + this.impuestos + this.costoEnvio;
  }

  /**
   * Actualiza el estado de la orden
   */
  actualizarEstado(nuevoEstado: EstadoOrden): Orden {
    return new Orden(
      this.id,
      this.numeroOrden,
      this.clienteId,
      nuevoEstado,
      this.subtotal,
      this.impuestos,
      this.total,
      this.metodoPago,
      this.estadoPago,
      this.metodoEnvio,
      this.costoEnvio,
      this.direccionEnvioId,
      this.notas,
      this.notasInternas,
      this.fechaCreacion,
      new Date(),
      this.fechaPago,
      this.fechaEnvio,
      this.fechaEntrega,
      this.fechaAbandono,
      this.esBorrador,
      this.archivada,
      this.motivoCancelacion,
      this.datosCliente,
      this.datosEnvio,
      this.datosFacturacion,
      this.creadorId,
      this.ordenOriginalId,
    );
  }

  /**
   * Actualiza el estado de pago de la orden
   */
  actualizarEstadoPago(nuevoEstadoPago: EstadoPago, fechaPago?: Date): Orden {
    return new Orden(
      this.id,
      this.numeroOrden,
      this.clienteId,
      this.estado,
      this.subtotal,
      this.impuestos,
      this.total,
      this.metodoPago,
      nuevoEstadoPago,
      this.metodoEnvio,
      this.costoEnvio,
      this.direccionEnvioId,
      this.notas,
      this.notasInternas,
      this.fechaCreacion,
      new Date(),
      fechaPago || this.fechaPago,
      this.fechaEnvio,
      this.fechaEntrega,
      this.fechaAbandono,
      this.esBorrador,
      this.archivada,
      this.motivoCancelacion,
      this.datosCliente,
      this.datosEnvio,
      this.datosFacturacion,
      this.creadorId,
      this.ordenOriginalId,
    );
  }

  /**
   * Marca la orden como enviada
   */
  marcarComoEnviada(fechaEnvio: Date): Orden {
    return new Orden(
      this.id,
      this.numeroOrden,
      this.clienteId,
      EstadoOrden.ENVIADA,
      this.subtotal,
      this.impuestos,
      this.total,
      this.metodoPago,
      this.estadoPago,
      this.metodoEnvio,
      this.costoEnvio,
      this.direccionEnvioId,
      this.notas,
      this.notasInternas,
      this.fechaCreacion,
      new Date(),
      this.fechaPago,
      fechaEnvio,
      this.fechaEntrega,
      this.fechaAbandono,
      this.esBorrador,
      this.archivada,
      this.motivoCancelacion,
      this.datosCliente,
      this.datosEnvio,
      this.datosFacturacion,
      this.creadorId,
      this.ordenOriginalId,
    );
  }

  /**
   * Marca la orden como entregada
   */
  marcarComoEntregada(fechaEntrega: Date): Orden {
    return new Orden(
      this.id,
      this.numeroOrden,
      this.clienteId,
      EstadoOrden.ENTREGADA,
      this.subtotal,
      this.impuestos,
      this.total,
      this.metodoPago,
      this.estadoPago,
      this.metodoEnvio,
      this.costoEnvio,
      this.direccionEnvioId,
      this.notas,
      this.notasInternas,
      this.fechaCreacion,
      new Date(),
      this.fechaPago,
      this.fechaEnvio,
      fechaEntrega,
      this.fechaAbandono,
      this.esBorrador,
      this.archivada,
      this.motivoCancelacion,
      this.datosCliente,
      this.datosEnvio,
      this.datosFacturacion,
      this.creadorId,
      this.ordenOriginalId,
    );
  }

  /**
   * Cancela la orden
   */
  cancelar(motivo?: string): Orden {
    return new Orden(
      this.id,
      this.numeroOrden,
      this.clienteId,
      EstadoOrden.CANCELADA,
      this.subtotal,
      this.impuestos,
      this.total,
      this.metodoPago,
      EstadoPago.CANCELADO,
      this.metodoEnvio,
      this.costoEnvio,
      this.direccionEnvioId,
      this.notas,
      this.notasInternas,
      this.fechaCreacion,
      new Date(),
      this.fechaPago,
      this.fechaEnvio,
      this.fechaEntrega,
      this.fechaAbandono,
      this.esBorrador,
      this.archivada,
      motivo || this.motivoCancelacion,
      this.datosCliente,
      this.datosEnvio,
      this.datosFacturacion,
      this.creadorId,
      this.ordenOriginalId,
    );
  }

  /**
   * Marca la orden como pagada
   */
  marcarComoPagada(fechaPago: Date): Orden {
    return new Orden(
      this.id,
      this.numeroOrden,
      this.clienteId,
      this.estado,
      this.subtotal,
      this.impuestos,
      this.total,
      this.metodoPago,
      EstadoPago.PAGADO,
      this.metodoEnvio,
      this.costoEnvio,
      this.direccionEnvioId,
      this.notas,
      this.notasInternas,
      this.fechaCreacion,
      new Date(),
      fechaPago,
      this.fechaEnvio,
      this.fechaEntrega,
      this.fechaAbandono,
      this.esBorrador,
      this.archivada,
      this.motivoCancelacion,
      this.datosCliente,
      this.datosEnvio,
      this.datosFacturacion,
      this.creadorId,
      this.ordenOriginalId,
    );
  }

  /**
   * Archiva la orden
   */
  archivar(): Orden {
    return new Orden(
      this.id,
      this.numeroOrden,
      this.clienteId,
      this.estado,
      this.subtotal,
      this.impuestos,
      this.total,
      this.metodoPago,
      this.estadoPago,
      this.metodoEnvio,
      this.costoEnvio,
      this.direccionEnvioId,
      this.notas,
      this.notasInternas,
      this.fechaCreacion,
      new Date(),
      this.fechaPago,
      this.fechaEnvio,
      this.fechaEntrega,
      this.fechaAbandono,
      this.esBorrador,
      true, // archivada
      this.motivoCancelacion,
      this.datosCliente,
      this.datosEnvio,
      this.datosFacturacion,
      this.creadorId,
      this.ordenOriginalId,
    );
  }

  /**
   * Desarchiva la orden
   */
  desarchivar(): Orden {
    return new Orden(
      this.id,
      this.numeroOrden,
      this.clienteId,
      this.estado,
      this.subtotal,
      this.impuestos,
      this.total,
      this.metodoPago,
      this.estadoPago,
      this.metodoEnvio,
      this.costoEnvio,
      this.direccionEnvioId,
      this.notas,
      this.notasInternas,
      this.fechaCreacion,
      new Date(),
      this.fechaPago,
      this.fechaEnvio,
      this.fechaEntrega,
      this.fechaAbandono,
      this.esBorrador,
      false, // archivada
      this.motivoCancelacion,
      this.datosCliente,
      this.datosEnvio,
      this.datosFacturacion,
      this.creadorId,
      this.ordenOriginalId,
    );
  }

  /**
   * Marca la orden como abandonada
   */
  marcarComoAbandonada(fechaAbandono: Date): Orden {
    return new Orden(
      this.id,
      this.numeroOrden,
      this.clienteId,
      this.estado,
      this.subtotal,
      this.impuestos,
      this.total,
      this.metodoPago,
      this.estadoPago,
      this.metodoEnvio,
      this.costoEnvio,
      this.direccionEnvioId,
      this.notas,
      this.notasInternas,
      this.fechaCreacion,
      new Date(),
      this.fechaPago,
      this.fechaEnvio,
      this.fechaEntrega,
      fechaAbandono,
      this.esBorrador,
      this.archivada,
      this.motivoCancelacion,
      this.datosCliente,
      this.datosEnvio,
      this.datosFacturacion,
      this.creadorId,
      this.ordenOriginalId,
    );
  }

  /**
   * Agrega notas internas a la orden
   */
  agregarNotasInternas(notas: string): Orden {
    return new Orden(
      this.id,
      this.numeroOrden,
      this.clienteId,
      this.estado,
      this.subtotal,
      this.impuestos,
      this.total,
      this.metodoPago,
      this.estadoPago,
      this.metodoEnvio,
      this.costoEnvio,
      this.direccionEnvioId,
      this.notas,
      notas,
      this.fechaCreacion,
      new Date(),
      this.fechaPago,
      this.fechaEnvio,
      this.fechaEntrega,
      this.fechaAbandono,
      this.esBorrador,
      this.archivada,
      this.motivoCancelacion,
      this.datosCliente,
      this.datosEnvio,
      this.datosFacturacion,
      this.creadorId,
      this.ordenOriginalId,
    );
  }

  /**
   * Verifica si la orden está abandonada
   */
  estaAbandonada(): boolean {
    return this.fechaAbandono !== null;
  }

  /**
   * Verifica si la orden es un borrador
   */
  esBorradorOrden(): boolean {
    return this.esBorrador;
  }

  /**
   * Verifica si la orden está archivada
   */
  estaArchivada(): boolean {
    return this.archivada;
  }

  /**
   * Verifica si la orden puede ser duplicada
   */
  puedeDuplicar(): boolean {
    return !this.esBorrador && this.estado !== EstadoOrden.CANCELADA;
  }

  /**
   * Verifica si la orden puede ser reemplazada
   */
  puedeReemplazar(): boolean {
    return [EstadoOrden.CANCELADA, EstadoOrden.REEMBOLSADA].includes(this.estado);
  }
}