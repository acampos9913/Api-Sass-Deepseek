import { Inject, Injectable } from '@nestjs/common';
import { PaqueteProducto } from '../entidades/paquete-producto.entity';
import type { RepositorioPaquete } from '../interfaces/repositorio-paquete.interface';

/**
 * Caso de uso para listar paquetes con paginación y filtros
 * Contiene la lógica de negocio específica para la consulta de paquetes
 */
@Injectable()
export class ListarPaquetesCasoUso {
  constructor(
    @Inject('RepositorioPaquete')
    private readonly repositorioPaquete: RepositorioPaquete,
  ) {}

  /**
   * Ejecuta el caso de uso para listar paquetes
   * @param filtros Filtros y paginación para la consulta
   * @returns Lista de paquetes y información de paginación
   */
  async ejecutar(filtros: {
    pagina: number;
    limite: number;
    activo?: boolean;
    busqueda?: string;
    tiendaId?: string;
    ordenarPor?: string;
    orden?: 'asc' | 'desc';
  }): Promise<{
    paquetes: PaqueteProducto[];
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
      throw new Error('La página debe ser mayor o igual a 1');
    }

    if (filtros.limite < 1 || filtros.limite > 100) {
      throw new Error('El límite debe estar entre 1 y 100');
    }

    // Obtener paquetes del repositorio
    const resultado = await this.repositorioPaquete.listar(filtros);

    // Convertir los datos del repositorio a entidades de dominio
    const paquetes = resultado.paquetes.map(
      (paqueteData) =>
        new PaqueteProducto(
          paqueteData.id,
          paqueteData.nombre,
          paqueteData.descripcion,
          paqueteData.precio,
          paqueteData.precioComparacion,
          paqueteData.sku,
          paqueteData.activo,
          paqueteData.fechaCreacion,
          paqueteData.fechaActualizacion,
          paqueteData.tiendaId,
          paqueteData.creadorId,
          paqueteData.items.map(item => ({
            id: item.id,
            productoId: item.productoId,
            varianteId: item.varianteId,
            cantidad: item.cantidad,
            precioUnitario: item.precioUnitario || 0,
          })),
        ),
    );

    // Calcular información de paginación
    const totalPaginas = Math.ceil(resultado.total / filtros.limite);
    const tieneSiguiente = filtros.pagina < totalPaginas;
    const tieneAnterior = filtros.pagina > 1;

    return {
      paquetes,
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
}