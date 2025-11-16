import { Inject, Injectable } from '@nestjs/common';
import { MovimientoInventario } from '../entidades/movimiento-inventario.entity';
import { TipoMovimientoInventario } from '../enums/tipo-movimiento-inventario.enum';
import type { RepositorioMovimientoInventario } from '../interfaces/repositorio-movimiento-inventario.interface';
import { ExcepcionDominio } from '../../../comun/excepciones/excepcion-dominio';

/**
 * Caso de uso para listar movimientos de inventario con paginación y filtros
 * Contiene la lógica de negocio específica para la consulta de movimientos
 */
@Injectable()
export class ListarMovimientosInventarioCasoUso {
  constructor(
    @Inject('RepositorioMovimientoInventario')
    private readonly repositorioMovimientoInventario: RepositorioMovimientoInventario,
  ) {}

  /**
   * Ejecuta el caso de uso para listar movimientos de inventario
   * @param filtros Filtros y paginación para la consulta
   * @returns Lista de movimientos y información de paginación
   */
  async ejecutar(filtros: {
    pagina: number;
    limite: number;
    productoId?: string;
    varianteId?: string;
    tipo?: TipoMovimientoInventario;
    fechaDesde?: Date;
    fechaHasta?: Date;
  }): Promise<{
    movimientos: MovimientoInventario[];
    paginacion: {
      totalElementos: number;
      totalPaginas: number;
      paginaActual: number;
      limite: number;
      tieneSiguiente: boolean;
      tieneAnterior: boolean;
    };
  }> {
    // Validar parámetros de paginación
    if (filtros.pagina < 1) {
      throw ExcepcionDominio.Respuesta400(
        'La página debe ser mayor o igual a 1',
        'Inventario.PaginaInvalida'
      );
    }

    if (filtros.limite < 1 || filtros.limite > 100) {
      throw ExcepcionDominio.Respuesta400(
        'El límite debe estar entre 1 y 100',
        'Inventario.LimiteInvalido'
      );
    }

    // Validar fechas si se proporcionan
    if (filtros.fechaDesde && filtros.fechaHasta) {
      if (filtros.fechaDesde > filtros.fechaHasta) {
        throw ExcepcionDominio.Respuesta400(
          'La fecha desde no puede ser mayor que la fecha hasta',
          'Inventario.FechasInvalidas'
        );
      }
    }

    // Obtener movimientos del repositorio
    const resultado = await this.repositorioMovimientoInventario.listar(filtros);

    // Convertir los datos del repositorio a entidades de dominio
    const movimientos = resultado.movimientos.map(
      (movimientoData) =>
        new MovimientoInventario(
          movimientoData.id,
          movimientoData.productoId,
          movimientoData.varianteId,
          movimientoData.tipo,
          movimientoData.cantidad,
          movimientoData.stockAnterior,
          movimientoData.stockActual,
          movimientoData.motivo,
          movimientoData.fechaCreacion,
          movimientoData.usuarioId,
        ),
    );

    // Calcular información de paginación
    const totalPaginas = Math.ceil(resultado.total / filtros.limite);
    const tieneSiguiente = filtros.pagina < totalPaginas;
    const tieneAnterior = filtros.pagina > 1;

    return {
      movimientos,
      paginacion: {
        totalElementos: resultado.total,
        totalPaginas,
        paginaActual: filtros.pagina,
        limite: filtros.limite,
        tieneSiguiente,
        tieneAnterior,
      },
    };
  }

  /**
   * Ejecuta el caso de uso para obtener el historial de un producto
   * @param productoId ID del producto
   * @param pagina Número de página
   * @param limite Límite por página
   * @returns Historial de movimientos del producto
   */
  async obtenerHistorialProducto(
    productoId: string,
    pagina: number = 1,
    limite: number = 20,
  ): Promise<{
    movimientos: MovimientoInventario[];
    paginacion: {
      totalElementos: number;
      totalPaginas: number;
      paginaActual: number;
      limite: number;
      tieneSiguiente: boolean;
      tieneAnterior: boolean;
    };
  }> {
    if (!productoId) {
      throw ExcepcionDominio.Respuesta400(
        'El ID del producto es obligatorio',
        'Inventario.ProductoIdRequerido'
      );
    }

    const resultado = await this.repositorioMovimientoInventario.obtenerHistorialProducto(
      productoId,
      pagina,
      limite,
    );

    const movimientos = resultado.movimientos.map(
      (movimientoData) =>
        new MovimientoInventario(
          movimientoData.id,
          movimientoData.productoId,
          movimientoData.varianteId,
          movimientoData.tipo,
          movimientoData.cantidad,
          movimientoData.stockAnterior,
          movimientoData.stockActual,
          movimientoData.motivo,
          movimientoData.fechaCreacion,
          movimientoData.usuarioId,
        ),
    );

    const totalPaginas = Math.ceil(resultado.total / limite);
    const tieneSiguiente = pagina < totalPaginas;
    const tieneAnterior = pagina > 1;

    return {
      movimientos,
      paginacion: {
        totalElementos: resultado.total,
        totalPaginas,
        paginaActual: pagina,
        limite,
        tieneSiguiente,
        tieneAnterior,
      },
    };
  }

  /**
   * Ejecuta el caso de uso para obtener el historial de una variante
   * @param varianteId ID de la variante
   * @param pagina Número de página
   * @param limite Límite por página
   * @returns Historial de movimientos de la variante
   */
  async obtenerHistorialVariante(
    varianteId: string,
    pagina: number = 1,
    limite: number = 20,
  ): Promise<{
    movimientos: MovimientoInventario[];
    paginacion: {
      totalElementos: number;
      totalPaginas: number;
      paginaActual: number;
      limite: number;
      tieneSiguiente: boolean;
      tieneAnterior: boolean;
    };
  }> {
    if (!varianteId) {
      throw ExcepcionDominio.Respuesta400(
        'El ID de la variante es obligatorio',
        'Inventario.VarianteIdRequerido'
      );
    }

    const resultado = await this.repositorioMovimientoInventario.obtenerHistorialVariante(
      varianteId,
      pagina,
      limite,
    );

    const movimientos = resultado.movimientos.map(
      (movimientoData) =>
        new MovimientoInventario(
          movimientoData.id,
          movimientoData.productoId,
          movimientoData.varianteId,
          movimientoData.tipo,
          movimientoData.cantidad,
          movimientoData.stockAnterior,
          movimientoData.stockActual,
          movimientoData.motivo,
          movimientoData.fechaCreacion,
          movimientoData.usuarioId,
        ),
    );

    const totalPaginas = Math.ceil(resultado.total / limite);
    const tieneSiguiente = pagina < totalPaginas;
    const tieneAnterior = pagina > 1;

    return {
      movimientos,
      paginacion: {
        totalElementos: resultado.total,
        totalPaginas,
        paginaActual: pagina,
        limite,
        tieneSiguiente,
        tieneAnterior,
      },
    };
  }
}