import { Inject, Injectable } from '@nestjs/common';
import { Orden } from '../entidades/orden.entity';
import type { RepositorioOrden, FiltrosOrdenes } from '../interfaces/repositorio-orden.interface';
import { ExcepcionDominio } from '../../../comun/excepciones/excepcion-dominio';

/**
 * Opciones de paginación y ordenamiento para órdenes
 */
export interface OpcionesListadoOrdenes {
  pagina: number;
  limite: number;
  ordenarPor?: 'fechaCreacion' | 'fechaActualizacion' | 'total' | 'numeroOrden';
  orden?: 'asc' | 'desc';
}

/**
 * Resultado del listado con paginación
 */
export interface ResultadoListadoOrdenes {
  ordenes: Orden[];
  paginacion: {
    totalElementos: number;
    totalPaginas: number;
    paginaActual: number;
    limite: number;
    tieneSiguiente: boolean;
    tieneAnterior: boolean;
  };
}

/**
 * Estadísticas de órdenes para el dashboard
 */
export interface EstadisticasOrdenes {
  totalOrdenes: number;
  totalVentas: number;
  ordenesPorEstado: Record<string, number>;
  ventasPorPeriodo?: Array<{
    periodo: string;
    totalVentas: number;
    cantidadOrdenes: number;
  }>;
}

/**
 * Caso de uso para listar órdenes con filtros y paginación
 * Optimizado para el frontend con múltiples opciones de filtrado
 */
@Injectable()
export class ListarOrdenesCasoUso {
  constructor(
    @Inject('RepositorioOrden')
    private readonly repositorioOrden: RepositorioOrden,
  ) {}

  /**
   * Ejecuta el caso de uso de listado de órdenes
   * @param opciones - Opciones de paginación y ordenamiento
   * @param filtros - Filtros opcionales para el listado
   * @returns Promise con el resultado del listado y paginación
   */
  async ejecutar(
    opciones: OpcionesListadoOrdenes,
    filtros?: FiltrosOrdenes,
  ): Promise<ResultadoListadoOrdenes> {
    // Validar opciones de paginación
    this.validarOpciones(opciones);

    // Aplicar filtros por defecto si no se especifican
    const filtrosAplicados = this.aplicarFiltrosPorDefecto(filtros);

    // Obtener órdenes del repositorio
    const { ordenes, total } = await this.repositorioOrden.listar(
      opciones.pagina,
      opciones.limite,
      filtrosAplicados,
    );

    // Calcular metadatos de paginación
    const paginacion = this.calcularPaginacion(
      total,
      opciones.pagina,
      opciones.limite,
    );

    return {
      ordenes,
      paginacion,
    };
  }

  /**
   * Lista órdenes por cliente
   * @param clienteId - ID del cliente
   * @param opciones - Opciones de paginación
   * @returns Promise con el resultado del listado y paginación
   */
  async listarPorCliente(
    clienteId: string,
    opciones: OpcionesListadoOrdenes,
  ): Promise<ResultadoListadoOrdenes> {
    this.validarOpciones(opciones);

    if (!clienteId) {
      throw ExcepcionDominio.Respuesta400(
        'El ID del cliente es requerido',
        'Orden.ClienteIdRequerido'
      );
    }

    const { ordenes, total } = await this.repositorioOrden.listarPorCliente(
      clienteId,
      opciones.pagina,
      opciones.limite,
    );

    const paginacion = this.calcularPaginacion(
      total,
      opciones.pagina,
      opciones.limite,
    );

    return {
      ordenes,
      paginacion,
    };
  }

  /**
   * Obtiene estadísticas de órdenes para el dashboard
   * @param fechaDesde - Fecha desde para filtrar
   * @param fechaHasta - Fecha hasta para filtrar
   * @returns Promise con las estadísticas de órdenes
   */
  async obtenerEstadisticas(
    fechaDesde?: Date,
    fechaHasta?: Date,
  ): Promise<EstadisticasOrdenes> {
    // Validar fechas si se proporcionan
    if (fechaDesde && fechaHasta && fechaDesde > fechaHasta) {
      throw ExcepcionDominio.Respuesta400(
        'La fecha desde no puede ser mayor a la fecha hasta',
        'Orden.RangoFechasInvalido'
      );
    }

    const estadisticas = await this.repositorioOrden.obtenerEstadisticas(
      fechaDesde,
      fechaHasta,
    );

    return {
      ...estadisticas,
      ventasPorPeriodo: await this.calcularVentasPorPeriodo(fechaDesde, fechaHasta),
    };
  }

  /**
   * Busca órdenes por número de orden
   * @param numeroOrden - Número de orden a buscar
   * @param opciones - Opciones de paginación
   * @returns Promise con el resultado del listado y paginación
   */
  async buscarPorNumeroOrden(
    numeroOrden: string,
    opciones: OpcionesListadoOrdenes,
  ): Promise<ResultadoListadoOrdenes> {
    this.validarOpciones(opciones);

    if (!numeroOrden || numeroOrden.trim().length < 3) {
      throw ExcepcionDominio.Respuesta400(
        'El número de orden debe tener al menos 3 caracteres',
        'Orden.NumeroOrdenInvalido'
      );
    }

    const orden = await this.repositorioOrden.buscarPorNumeroOrden(numeroOrden.trim());

    return {
      ordenes: orden ? [orden] : [],
      paginacion: {
        totalElementos: orden ? 1 : 0,
        totalPaginas: 1,
        paginaActual: 1,
        limite: opciones.limite,
        tieneSiguiente: false,
        tieneAnterior: false,
      },
    };
  }

  /**
   * Valida las opciones de paginación
   */
  private validarOpciones(opciones: OpcionesListadoOrdenes): void {
    if (opciones.pagina < 1) {
      throw ExcepcionDominio.Respuesta400(
        'La página debe ser mayor o igual a 1',
        'Orden.PaginaInvalida'
      );
    }

    if (opciones.limite < 1 || opciones.limite > 100) {
      throw ExcepcionDominio.Respuesta400(
        'El límite debe estar entre 1 y 100',
        'Orden.LimiteInvalido'
      );
    }
  }

  /**
   * Aplica filtros por defecto si no se especifican
   */
  private aplicarFiltrosPorDefecto(filtros?: FiltrosOrdenes): FiltrosOrdenes {
    // Por defecto, mostrar órdenes de los últimos 30 días
    const fechaPorDefecto = new Date();
    fechaPorDefecto.setDate(fechaPorDefecto.getDate() - 30);

    return {
      fechaDesde: fechaPorDefecto,
      ...filtros,
    };
  }

  /**
   * Calcula los metadatos de paginación
   */
  private calcularPaginacion(
    total: number,
    pagina: number,
    limite: number,
  ) {
    const totalPaginas = Math.ceil(total / limite);
    const tieneSiguiente = pagina < totalPaginas;
    const tieneAnterior = pagina > 1;

    return {
      totalElementos: total,
      totalPaginas,
      paginaActual: pagina,
      limite,
      tieneSiguiente,
      tieneAnterior,
    };
  }

  /**
   * Calcula las ventas por período (placeholder - en producción se implementaría con el repositorio)
   */
  private async calcularVentasPorPeriodo(
    fechaDesde?: Date,
    fechaHasta?: Date,
  ): Promise<Array<{ periodo: string; totalVentas: number; cantidadOrdenes: number }>> {
    // En una implementación real, esto consultaría la base de datos
    // Por ahora retornamos datos de ejemplo
    return [
      {
        periodo: '2024-01',
        totalVentas: 15000,
        cantidadOrdenes: 45,
      },
      {
        periodo: '2024-02',
        totalVentas: 18000,
        cantidadOrdenes: 52,
      },
      {
        periodo: '2024-03',
        totalVentas: 22000,
        cantidadOrdenes: 67,
      },
    ];
  }
}