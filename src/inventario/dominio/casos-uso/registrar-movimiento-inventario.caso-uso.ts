import { Inject, Injectable } from '@nestjs/common';
import { MovimientoInventario } from '../entidades/movimiento-inventario.entity';
import { TipoMovimientoInventario } from '../enums/tipo-movimiento-inventario.enum';
import type { RepositorioMovimientoInventario } from '../interfaces/repositorio-movimiento-inventario.interface';
import { ExcepcionDominio } from '../../../comun/excepciones/excepcion-dominio';

/**
 * Caso de uso para registrar un movimiento de inventario
 * Contiene la lógica de negocio específica para el registro de movimientos de inventario
 */
@Injectable()
export class RegistrarMovimientoInventarioCasoUso {
  constructor(
    @Inject('RepositorioMovimientoInventario')
    private readonly repositorioMovimientoInventario: RepositorioMovimientoInventario,
  ) {}

  /**
   * Ejecuta el caso de uso para registrar un movimiento de inventario
   * @param datosMovimiento Datos del movimiento a registrar
   * @param usuarioId ID del usuario que realiza el movimiento
   * @returns El movimiento de inventario registrado
   */
  async ejecutar(
    datosMovimiento: {
      productoId: string;
      varianteId: string | null;
      tipo: TipoMovimientoInventario;
      cantidad: number;
      motivo: string;
    },
    usuarioId: string | null = null,
  ): Promise<MovimientoInventario> {
    // Validar parámetros básicos
    if (datosMovimiento.cantidad <= 0) {
      throw ExcepcionDominio.Respuesta400(
        'La cantidad debe ser mayor a cero',
        'Inventario.CantidadInvalida'
      );
    }

    if (!datosMovimiento.motivo || datosMovimiento.motivo.trim().length === 0) {
      throw ExcepcionDominio.Respuesta400(
        'El motivo es obligatorio',
        'Inventario.MotivoRequerido'
      );
    }

    // Obtener stock actual
    let stockAnterior: number;
    let stockActual: number;

    if (datosMovimiento.varianteId) {
      stockAnterior = await this.repositorioMovimientoInventario.obtenerStockVariante(
        datosMovimiento.varianteId,
      );
    } else {
      stockAnterior = await this.repositorioMovimientoInventario.obtenerStockProducto(
        datosMovimiento.productoId,
      );
    }

    // Calcular nuevo stock según el tipo de movimiento
    stockActual = this.calcularNuevoStock(
      stockAnterior,
      datosMovimiento.cantidad,
      datosMovimiento.tipo,
    );

    // Validar que no haya stock negativo
    if (stockActual < 0) {
      throw ExcepcionDominio.Respuesta400(
        'No hay suficiente stock para realizar esta operación',
        'Inventario.StockInsuficiente'
      );
    }

    // Crear la entidad de movimiento de inventario
    const fechaActual = new Date();
    const movimiento = new MovimientoInventario(
      this.generarIdUnico(),
      datosMovimiento.productoId,
      datosMovimiento.varianteId,
      datosMovimiento.tipo,
      datosMovimiento.cantidad,
      stockAnterior,
      stockActual,
      datosMovimiento.motivo.trim(),
      fechaActual,
      usuarioId,
    );

    // Validar la entidad
    if (!movimiento.validar()) {
      throw ExcepcionDominio.Respuesta400(
        'El movimiento de inventario no es válido',
        'Inventario.MovimientoInvalido'
      );
    }

    // Persistir el movimiento
    await this.repositorioMovimientoInventario.crear({
      id: movimiento.id,
      productoId: movimiento.productoId,
      varianteId: movimiento.varianteId,
      tipo: movimiento.tipo,
      cantidad: movimiento.cantidad,
      stockAnterior: movimiento.stockAnterior,
      stockActual: movimiento.stockActual,
      motivo: movimiento.motivo,
      fechaCreacion: movimiento.fechaCreacion,
      usuarioId: movimiento.usuarioId,
    });

    return movimiento;
  }

  /**
   * Calcula el nuevo stock basado en el tipo de movimiento
   */
  private calcularNuevoStock(
    stockAnterior: number,
    cantidad: number,
    tipo: TipoMovimientoInventario,
  ): number {
    switch (tipo) {
      case TipoMovimientoInventario.ENTRADA:
      case TipoMovimientoInventario.DEVOLUCION:
        return stockAnterior + cantidad;
      
      case TipoMovimientoInventario.SALIDA:
      case TipoMovimientoInventario.VENTA:
        return stockAnterior - cantidad;
      
      case TipoMovimientoInventario.AJUSTE:
        // Para ajustes, la cantidad representa el nuevo stock
        return cantidad;
      
      default:
        throw ExcepcionDominio.Respuesta400(
          `Tipo de movimiento no soportado: ${tipo}`,
          'Inventario.TipoMovimientoNoSoportado'
        );
    }
  }

  /**
   * Genera un ID único para el movimiento de inventario
   */
  private generarIdUnico(): string {
    return `movimiento_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}