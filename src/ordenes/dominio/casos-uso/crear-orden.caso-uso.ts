import { Inject, Injectable } from '@nestjs/common';
import { Orden } from '../entidades/orden.entity';
import { EstadoOrden, EstadoPago, MetodoPago } from '../enums/estado-orden.enum';
import type { RepositorioOrden } from '../interfaces/repositorio-orden.interface';
import { ExcepcionDominio } from '../../../comun/excepciones/excepcion-dominio';

/**
 * Item de la orden
 */
export interface ItemOrdenDto {
  varianteId: string;
  cantidad: number;
  precioUnitario: number;
}

/**
 * DTO para la creación de órdenes
 */
export interface CrearOrdenDto {
  clienteId: string;
  subtotal: number;
  impuestos: number;
  total: number;
  metodoPago?: MetodoPago;
  metodoEnvio?: string;
  costoEnvio: number;
  direccionEnvioId?: string;
  notas?: string;
  items: ItemOrdenDto[];
  creadorId: string;
}

/**
 * Caso de uso para crear una nueva orden
 * Incluye validaciones de negocio y lógica específica
 */
@Injectable()
export class CrearOrdenCasoUso {
  constructor(
    @Inject('RepositorioOrden')
    private readonly repositorioOrden: RepositorioOrden,
  ) {}

  /**
   * Ejecuta el caso de uso de creación de orden
   * @param datos - Datos de la orden a crear
   * @returns Promise con la orden creada
   * @throws Error si hay problemas de validación
   */
  async ejecutar(datos: CrearOrdenDto): Promise<Orden> {
    // Validar datos básicos
    this.validarDatosOrden(datos);

    // Generar número de orden único
    const numeroOrden = await this.generarNumeroOrdenUnico();

    // Crear la entidad de orden
    const orden = new Orden(
      this.generarId(),
      numeroOrden,
      datos.clienteId,
      EstadoOrden.PENDIENTE,
      datos.subtotal,
      datos.impuestos,
      datos.total,
      datos.metodoPago || null,
      EstadoPago.PENDIENTE,
      datos.metodoEnvio || null,
      datos.costoEnvio,
      datos.direccionEnvioId || null,
      datos.notas || null,
      null, // notasInternas
      new Date(),
      new Date(),
      null, // fechaPago
      null, // fechaEnvio
      null, // fechaEntrega
      null, // fechaAbandono
      false, // esBorrador
      false, // archivada
      null, // motivoCancelacion
      null, // datosCliente
      null, // datosEnvio
      null, // datosFacturacion
      datos.creadorId,
      null, // ordenOriginalId
    );

    // Validar que el total calculado coincida
    this.validarTotalOrden(orden, datos.items);

    // Guardar la orden en el repositorio
    return await this.repositorioOrden.guardar(orden);
  }

  /**
   * Valida los datos básicos de la orden
   */
  private validarDatosOrden(datos: CrearOrdenDto): void {
    if (datos.subtotal <= 0) {
      throw ExcepcionDominio.Respuesta400(
        'El subtotal debe ser mayor a cero',
        'Orden.SubtotalInvalido'
      );
    }

    if (datos.impuestos < 0) {
      throw ExcepcionDominio.Respuesta400(
        'Los impuestos no pueden ser negativos',
        'Orden.ImpuestosInvalidos'
      );
    }

    if (datos.total <= 0) {
      throw ExcepcionDominio.Respuesta400(
        'El total debe ser mayor a cero',
        'Orden.TotalInvalido'
      );
    }

    if (datos.costoEnvio < 0) {
      throw ExcepcionDominio.Respuesta400(
        'El costo de envío no puede ser negativo',
        'Orden.CostoEnvioInvalido'
      );
    }

    if (!datos.items || datos.items.length === 0) {
      throw ExcepcionDominio.Respuesta400(
        'La orden debe tener al menos un item',
        'Orden.ItemsRequeridos'
      );
    }

    // Validar items
    for (const item of datos.items) {
      if (item.cantidad <= 0) {
        throw ExcepcionDominio.Respuesta400(
          'La cantidad de cada item debe ser mayor a cero',
          'Orden.CantidadItemInvalida'
        );
      }

      if (item.precioUnitario <= 0) {
        throw ExcepcionDominio.Respuesta400(
          'El precio unitario de cada item debe ser mayor a cero',
          'Orden.PrecioUnitarioInvalido'
        );
      }
    }

    // Validar que el cliente existe (en un sistema real verificaríamos en el repositorio de clientes)
    if (!datos.clienteId) {
      throw ExcepcionDominio.Respuesta400(
        'El ID del cliente es requerido',
        'Orden.ClienteIdRequerido'
      );
    }
  }

  /**
   * Valida que el total de la orden coincida con la suma de items
   */
  private validarTotalOrden(orden: Orden, items: ItemOrdenDto[]): void {
    const subtotalCalculado = items.reduce((total, item) => {
      return total + (item.precioUnitario * item.cantidad);
    }, 0);

    const totalCalculado = subtotalCalculado + orden.impuestos + orden.costoEnvio;

    // Permitir pequeñas diferencias por redondeo
    if (Math.abs(totalCalculado - orden.total) > 0.01) {
      throw ExcepcionDominio.Respuesta400(
        `El total calculado (${totalCalculado}) no coincide con el total proporcionado (${orden.total})`,
        'Orden.TotalCalculadoIncorrecto'
      );
    }

    if (Math.abs(subtotalCalculado - orden.subtotal) > 0.01) {
      throw ExcepcionDominio.Respuesta400(
        `El subtotal calculado (${subtotalCalculado}) no coincide con el subtotal proporcionado (${orden.subtotal})`,
        'Orden.SubtotalCalculadoIncorrecto'
      );
    }
  }

  /**
   * Genera un número de orden único
   */
  private async generarNumeroOrdenUnico(): Promise<string> {
    let numeroOrden: string;
    let intentos = 0;
    const maxIntentos = 10;

    do {
      numeroOrden = this.generarNumeroOrden();
      intentos++;

      if (intentos > maxIntentos) {
        throw ExcepcionDominio.Respuesta400(
          'No se pudo generar un número de orden único después de varios intentos',
          'Orden.NumeroOrdenDuplicado'
        );
      }
    } while (await this.repositorioOrden.existeNumeroOrden(numeroOrden));

    return numeroOrden;
  }

  /**
   * Genera un número de orden con formato
   */
  private generarNumeroOrden(): string {
    const fecha = new Date();
    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();

    return `ORD-${año}${mes}${dia}-${timestamp}-${random}`;
  }

  /**
   * Genera un ID único para la orden
   */
  private generarId(): string {
    return `ord_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}