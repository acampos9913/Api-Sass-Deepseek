import { Inject, Injectable } from '@nestjs/common';
import { EstadoMercado } from '../enums/estado-mercado.enum';
import type { RepositorioMercado } from '../interfaces/repositorio-mercado.interface';

/**
 * Parámetros para listar mercados
 */
export interface ParametrosListarMercados {
  pagina: number;
  limite: number;
  activo?: boolean;
  estado?: EstadoMercado;
  tiendaId?: string;
  busqueda?: string;
}

/**
 * Resultado de la lista de mercados
 */
export interface ResultadoListarMercados {
  elementos: Array<{
    id: string;
    nombre: string;
    codigo: string;
    moneda: string;
    idioma: string;
    zonaHoraria: string;
    estado: EstadoMercado;
    activo: boolean;
    fechaCreacion: Date;
    fechaActualizacion: Date;
    tiendaId: string | null;
    configuracion: Record<string, any> | null;
  }>;
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
 * Caso de uso para listar mercados con paginación y filtros
 * Contiene la lógica de negocio específica para la consulta de mercados
 */
@Injectable()
export class ListarMercadosCasoUso {
  constructor(
    @Inject('RepositorioMercado')
    private readonly repositorioMercado: RepositorioMercado,
  ) {}

  /**
   * Ejecuta el caso de uso para listar mercados
   * @param parametros Parámetros de filtrado y paginación
   * @returns Lista paginada de mercados
   */
  async ejecutar(parametros: ParametrosListarMercados): Promise<ResultadoListarMercados> {
    // Validar parámetros de paginación
    this.validarParametrosPaginacion(parametros.pagina, parametros.limite);

    // Validar parámetros de filtrado
    this.validarParametrosFiltrado(parametros);

    // Obtener mercados del repositorio
    const resultado = await this.repositorioMercado.listar({
      pagina: parametros.pagina,
      limite: parametros.limite,
      activo: parametros.activo,
      estado: parametros.estado,
      tiendaId: parametros.tiendaId,
      busqueda: parametros.busqueda,
    });

    // Calcular información de paginación
    const totalPaginas = Math.ceil(resultado.total / parametros.limite);
    const tieneSiguiente = parametros.pagina < totalPaginas;
    const tieneAnterior = parametros.pagina > 1;

    return {
      elementos: resultado.mercados,
      paginacion: {
        totalElementos: resultado.total,
        totalPaginas,
        paginaActual: parametros.pagina,
        limite: parametros.limite,
        tieneSiguiente,
        tieneAnterior,
      },
    };
  }

  /**
   * Valida los parámetros de paginación
   */
  private validarParametrosPaginacion(pagina: number, limite: number): void {
    if (pagina < 1) {
      throw new Error('El número de página debe ser mayor o igual a 1');
    }

    if (limite < 1) {
      throw new Error('El límite por página debe ser mayor o igual a 1');
    }

    if (limite > 100) {
      throw new Error('El límite por página no puede ser mayor a 100');
    }
  }

  /**
   * Valida los parámetros de filtrado
   */
  private validarParametrosFiltrado(parametros: ParametrosListarMercados): void {
    // Validar que la búsqueda no sea demasiado larga
    if (parametros.busqueda && parametros.busqueda.length > 100) {
      throw new Error('El término de búsqueda no puede tener más de 100 caracteres');
    }

    // Validar que el estado sea válido si se proporciona
    if (parametros.estado && !Object.values(EstadoMercado).includes(parametros.estado)) {
      throw new Error('El estado del mercado no es válido');
    }

    // Validar que la tiendaId sea un UUID si se proporciona
    if (parametros.tiendaId && !this.validarUUID(parametros.tiendaId)) {
      throw new Error('El ID de la tienda debe ser un UUID válido');
    }
  }

  /**
   * Valida si un string es un UUID válido
   */
  private validarUUID(uuid: string): boolean {
    const regexUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return regexUUID.test(uuid);
  }

  /**
   * Obtiene estadísticas de mercados
   */
  async obtenerEstadisticas(tiendaId?: string): Promise<{
    totalMercados: number;
    mercadosActivos: number;
    mercadosInactivos: number;
    mercadosPorEstado: Record<EstadoMercado, number>;
    mercadosPorMoneda: Record<string, number>;
    mercadosPorIdioma: Record<string, number>;
  }> {
    return await this.repositorioMercado.obtenerEstadisticas(tiendaId);
  }

  /**
   * Lista mercados por tienda específica
   */
  async listarPorTienda(tiendaId: string): Promise<Array<{
    id: string;
    nombre: string;
    codigo: string;
    moneda: string;
    idioma: string;
    estado: EstadoMercado;
    activo: boolean;
  }>> {
    // Validar que la tiendaId sea un UUID
    if (!this.validarUUID(tiendaId)) {
      throw new Error('El ID de la tienda debe ser un UUID válido');
    }

    return await this.repositorioMercado.listarPorTienda(tiendaId);
  }

  /**
   * Obtiene el mercado predeterminado para una tienda
   */
  async obtenerPredeterminado(tiendaId: string): Promise<{
    id: string;
    nombre: string;
    codigo: string;
    moneda: string;
    idioma: string;
    zonaHoraria: string;
    estado: EstadoMercado;
    activo: boolean;
    fechaCreacion: Date;
    fechaActualizacion: Date;
    tiendaId: string | null;
    configuracion: Record<string, any> | null;
  } | null> {
    // Validar que la tiendaId sea un UUID
    if (!this.validarUUID(tiendaId)) {
      throw new Error('El ID de la tienda debe ser un UUID válido');
    }

    return await this.repositorioMercado.obtenerPredeterminado(tiendaId);
  }
}