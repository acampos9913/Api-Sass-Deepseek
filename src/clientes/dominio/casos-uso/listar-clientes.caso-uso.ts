import { Inject, Injectable } from '@nestjs/common';
import { Cliente } from '../entidades/cliente.entity';
import type { RepositorioCliente } from '../interfaces/repositorio-cliente.interface';
import { ExcepcionDominio } from '../../../comun/excepciones/excepcion-dominio';

/**
 * Caso de uso para listar clientes con paginación y filtros avanzados
 * Contiene la lógica de negocio específica para la consulta de clientes
 */
@Injectable()
export class ListarClientesCasoUso {
  constructor(
    @Inject('RepositorioCliente')
    private readonly repositorioCliente: RepositorioCliente,
  ) {}

  /**
   * Ejecuta el caso de uso para listar clientes
   * @param filtros Filtros y paginación para la consulta
   * @returns Lista de clientes y información de paginación
   */
  async ejecutar(filtros: {
    pagina: number;
    limite: number;
    activo?: boolean;
    busqueda?: string;
    tags?: string[];
    fuenteCliente?: string;
    aceptaMarketing?: boolean;
    totalGastadoMinimo?: number;
    totalGastadoMaximo?: number;
    totalOrdenesMinimo?: number;
    totalOrdenesMaximo?: number;
    fechaCreacionDesde?: Date;
    fechaCreacionHasta?: Date;
    fechaUltimaOrdenDesde?: Date;
    fechaUltimaOrdenHasta?: Date;
    ordenarPor?: string;
    orden?: 'asc' | 'desc';
  }): Promise<{
    clientes: Cliente[];
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
        'Cliente.PaginaInvalida'
      );
    }

    if (filtros.limite < 1 || filtros.limite > 100) {
      throw ExcepcionDominio.Respuesta400(
        'El límite debe estar entre 1 y 100',
        'Cliente.LimiteInvalido'
      );
    }

    // Validar rangos de fechas
    if (filtros.fechaCreacionDesde && filtros.fechaCreacionHasta) {
      if (filtros.fechaCreacionDesde > filtros.fechaCreacionHasta) {
        throw ExcepcionDominio.Respuesta400(
          'La fecha de inicio no puede ser mayor a la fecha de fin',
          'Cliente.RangoFechasInvalido'
        );
      }
    }

    if (filtros.fechaUltimaOrdenDesde && filtros.fechaUltimaOrdenHasta) {
      if (filtros.fechaUltimaOrdenDesde > filtros.fechaUltimaOrdenHasta) {
        throw ExcepcionDominio.Respuesta400(
          'La fecha de inicio de última orden no puede ser mayor a la fecha de fin',
          'Cliente.RangoFechasUltimaOrdenInvalido'
        );
      }
    }

    // Validar rangos de montos
    if (filtros.totalGastadoMinimo && filtros.totalGastadoMaximo) {
      if (filtros.totalGastadoMinimo > filtros.totalGastadoMaximo) {
        throw ExcepcionDominio.Respuesta400(
          'El monto mínimo no puede ser mayor al monto máximo',
          'Cliente.RangoMontosInvalido'
        );
      }
    }

    if (filtros.totalOrdenesMinimo && filtros.totalOrdenesMaximo) {
      if (filtros.totalOrdenesMinimo > filtros.totalOrdenesMaximo) {
        throw ExcepcionDominio.Respuesta400(
          'El número mínimo de órdenes no puede ser mayor al máximo',
          'Cliente.RangoOrdenesInvalido'
        );
      }
    }

    // Obtener clientes del repositorio
    const resultado = await this.repositorioCliente.listar(filtros);

    // Convertir los datos del repositorio a entidades de dominio
    const clientes = resultado.clientes.map(
      (clienteData) =>
        new Cliente(
          clienteData.id,
          clienteData.email,
          clienteData.nombreCompleto,
          clienteData.telefono,
          clienteData.activo,
          clienteData.fechaCreacion,
          clienteData.fechaActualizacion,
          clienteData.creadorId,
          clienteData.totalGastado,
          clienteData.totalOrdenes,
          clienteData.fechaUltimaOrden,
          clienteData.tags,
          clienteData.notas,
          clienteData.aceptaMarketing,
          clienteData.fuenteCliente,
        ),
    );

    // Calcular información de paginación
    const totalPaginas = Math.ceil(resultado.total / filtros.limite);
    const tieneSiguiente = filtros.pagina < totalPaginas;
    const tieneAnterior = filtros.pagina > 1;

    return {
      clientes,
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