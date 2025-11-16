/**
 * Caso de Uso para Listar Envíos
 * Contiene la lógica de negocio para listar y filtrar envíos
 * Sigue los principios de la Arquitectura Limpia
 */
import { Inject, Injectable } from '@nestjs/common';
import { Envio, EstadoEnvio, TipoMetodoEnvio } from '../entidades/envio.entity';
import type { RepositorioEnvio } from '../interfaces/repositorio-envio.interface';
import { ServicioRespuestaEstandar } from '../../../comun/aplicacion/servicios/servicio-respuesta-estandar';
import { ExcepcionDominio } from '../../../comun/excepciones/excepcion-dominio';
import type { RespuestaEstandar } from '../../../comun/aplicacion/servicios/servicio-respuesta-estandar';

@Injectable()
export class ListarEnviosCasoUso {
  constructor(
    @Inject('RepositorioEnvio')
    private readonly repositorioEnvio: RepositorioEnvio,
  ) {}

  /**
   * Ejecuta el caso de uso para listar envíos con filtros opcionales
   * @param filtros - Filtros opcionales para la búsqueda
   * @returns Promise<{envios: Envio[], paginacion: Paginacion}> - Lista de envíos y datos de paginación
   */
  async ejecutar(filtros?: FiltrosListarEnvios): Promise<RespuestaEstandar> {
    // Validar y normalizar filtros
    const filtrosNormalizados = this.normalizarFiltros(filtros);

    // Aplicar filtros según los parámetros proporcionados
    let resultado: { envios: Envio[]; total: number };

    if (filtrosNormalizados.estado) {
      resultado = await this.repositorioEnvio.listarPorEstado(
        filtrosNormalizados.estado,
        filtrosNormalizados.pagina!,
        filtrosNormalizados.limite!,
      );
    } else if (filtrosNormalizados.metodoEnvio) {
      resultado = await this.repositorioEnvio.listarPorMetodoEnvio(
        filtrosNormalizados.metodoEnvio,
        filtrosNormalizados.pagina!,
        filtrosNormalizados.limite!,
      );
    } else if (filtrosNormalizados.fechaInicio && filtrosNormalizados.fechaFin) {
      resultado = await this.repositorioEnvio.buscarPorRangoFechas(
        filtrosNormalizados.fechaInicio,
        filtrosNormalizados.fechaFin,
        filtrosNormalizados.pagina!,
        filtrosNormalizados.limite!,
      );
    } else if (filtrosNormalizados.pais) {
      resultado = await this.repositorioEnvio.buscarPorPais(
        filtrosNormalizados.pais,
        filtrosNormalizados.pagina!,
        filtrosNormalizados.limite!,
      );
    } else if (filtrosNormalizados.ciudad) {
      resultado = await this.repositorioEnvio.buscarPorCiudad(
        filtrosNormalizados.ciudad,
        filtrosNormalizados.pagina!,
        filtrosNormalizados.limite!,
      );
    } else {
      resultado = await this.repositorioEnvio.listar(
        filtrosNormalizados.pagina!,
        filtrosNormalizados.limite!,
      );
    }

    // Calcular datos de paginación
    const paginacion = this.calcularPaginacion(
      resultado.total,
      filtrosNormalizados.pagina,
      filtrosNormalizados.limite,
    );

    return ServicioRespuestaEstandar.Respuesta200(
      'Lista de envíos obtenida exitosamente',
      {
        elementos: resultado.envios,
        paginacion,
      },
      'Envio.ListaObtenidaExitosamente'
    );
  }

  /**
   * Lista envíos por ID de orden
   * @param ordenId - ID de la orden
   * @returns Promise<Envio[]> - Lista de envíos de la orden
   */
  async listarPorOrdenId(ordenId: string): Promise<RespuestaEstandar> {
    if (!ordenId) {
      throw ExcepcionDominio.Respuesta400(
        'El ID de la orden es requerido',
        'Envio.OrdenIdRequerido'
      );
    }

    const envios = await this.repositorioEnvio.buscarPorOrdenId(ordenId);
    
    return ServicioRespuestaEstandar.Respuesta200(
      'Envíos de la orden obtenidos exitosamente',
      envios,
      'Envio.PorOrdenObtenidosExitosamente'
    );
  }

  /**
   * Busca un envío por número de tracking
   * @param trackingNumber - Número de tracking
   * @returns Promise<Envio | null> - El envío encontrado o null
   */
  async buscarPorTrackingNumber(trackingNumber: string): Promise<RespuestaEstandar> {
    if (!trackingNumber) {
      throw ExcepcionDominio.Respuesta400(
        'El número de tracking es requerido',
        'Envio.TrackingNumberRequerido'
      );
    }

    if (trackingNumber.length < 5) {
      throw ExcepcionDominio.Respuesta400(
        'El número de tracking debe tener al menos 5 caracteres',
        'Envio.TrackingNumberInvalido'
      );
    }

    const envio = await this.repositorioEnvio.buscarPorTrackingNumber(trackingNumber);
    
    if (!envio) {
      throw ExcepcionDominio.Respuesta404(
        'Envío no encontrado',
        'Envio.NoEncontrado'
      );
    }

    return ServicioRespuestaEstandar.Respuesta200(
      'Envío encontrado exitosamente',
      envio,
      'Envio.EncontradoExitosamente'
    );
  }

  /**
   * Obtiene estadísticas de envíos
   * @returns Promise<EstadisticasEnvios> - Estadísticas de envíos
   */
  async obtenerEstadisticas(): Promise<RespuestaEstandar> {
    const estadisticas = await this.repositorioEnvio.obtenerEstadisticas();
    
    return ServicioRespuestaEstandar.Respuesta200(
      'Estadísticas de envíos obtenidas exitosamente',
      estadisticas,
      'Envio.EstadisticasObtenidasExitosamente'
    );
  }

  /**
   * Lista envíos atrasados
   * @returns Promise<Envio[]> - Lista de envíos atrasados
   */
  async listarEnviosAtrasados(): Promise<RespuestaEstandar> {
    const enviosAtrasados = await this.repositorioEnvio.buscarEnviosAtrasados();
    
    return ServicioRespuestaEstandar.Respuesta200(
      'Lista de envíos atrasados obtenida exitosamente',
      enviosAtrasados,
      'Envio.AtrasadosObtenidosExitosamente'
    );
  }

  /**
   * Obtiene los métodos de envío más utilizados
   * @param limite - Límite de resultados (por defecto 5)
   * @returns Promise<MetodoEnvioMasUtilizado[]> - Métodos de envío más utilizados
   */
  async obtenerMetodosEnvioMasUtilizados(limite?: number): Promise<RespuestaEstandar> {
    const metodos = await this.repositorioEnvio.obtenerMetodosEnvioMasUtilizados(limite);
    
    return ServicioRespuestaEstandar.Respuesta200(
      'Métodos de envío más utilizados obtenidos exitosamente',
      metodos,
      'Envio.MetodosMasUtilizadosObtenidosExitosamente'
    );
  }

  /**
   * Normaliza y valida los filtros de búsqueda
   * @param filtros - Filtros a normalizar
   * @returns FiltrosNormalizados - Filtros normalizados
   */
  private normalizarFiltros(filtros?: FiltrosListarEnvios): FiltrosNormalizados {
    const normalizados: FiltrosNormalizados = {
      pagina: 1,
      limite: 10,
    };

    if (filtros) {
      // Validar y normalizar página
      if (filtros.pagina !== undefined) {
        if (filtros.pagina < 1) {
          throw ExcepcionDominio.Respuesta400(
            'La página debe ser mayor o igual a 1',
            'Envio.PaginaInvalida'
          );
        }
        normalizados.pagina = filtros.pagina;
      }

      // Validar y normalizar límite
      if (filtros.limite !== undefined) {
        if (filtros.limite < 1 || filtros.limite > 100) {
          throw ExcepcionDominio.Respuesta400(
            'El límite debe estar entre 1 y 100',
            'Envio.LimiteInvalido'
          );
        }
        normalizados.limite = filtros.limite;
      }

      // Validar estado
      if (filtros.estado) {
        if (!Object.values(EstadoEnvio).includes(filtros.estado)) {
          throw ExcepcionDominio.Respuesta400(
            'Estado de envío no válido',
            'Envio.EstadoInvalido'
          );
        }
        normalizados.estado = filtros.estado;
      }

      // Validar método de envío
      if (filtros.metodoEnvio) {
        if (!Object.values(TipoMetodoEnvio).includes(filtros.metodoEnvio)) {
          throw ExcepcionDominio.Respuesta400(
            'Método de envío no válido',
            'Envio.MetodoEnvioInvalido'
          );
        }
        normalizados.metodoEnvio = filtros.metodoEnvio;
      }

      // Validar rango de fechas
      if (filtros.fechaInicio || filtros.fechaFin) {
        if (!filtros.fechaInicio || !filtros.fechaFin) {
          throw ExcepcionDominio.Respuesta400(
            'Ambas fechas (inicio y fin) son requeridas para el filtro por rango',
            'Envio.FechasRangoRequeridas'
          );
        }

        const fechaInicio = new Date(filtros.fechaInicio);
        const fechaFin = new Date(filtros.fechaFin);

        if (isNaN(fechaInicio.getTime())) {
          throw ExcepcionDominio.Respuesta400(
            'Fecha de inicio no válida',
            'Envio.FechaInicioInvalida'
          );
        }

        if (isNaN(fechaFin.getTime())) {
          throw ExcepcionDominio.Respuesta400(
            'Fecha de fin no válida',
            'Envio.FechaFinInvalida'
          );
        }

        if (fechaInicio > fechaFin) {
          throw ExcepcionDominio.Respuesta400(
            'La fecha de inicio no puede ser mayor que la fecha de fin',
            'Envio.RangoFechasInvalido'
          );
        }

        // Validar que el rango no sea mayor a 1 año
        const unAnioEnMs = 365 * 24 * 60 * 60 * 1000;
        if (fechaFin.getTime() - fechaInicio.getTime() > unAnioEnMs) {
          throw ExcepcionDominio.Respuesta400(
            'El rango de fechas no puede ser mayor a 1 año',
            'Envio.RangoFechasExcedido'
          );
        }

        normalizados.fechaInicio = fechaInicio;
        normalizados.fechaFin = fechaFin;
      }

      // Validar país
      if (filtros.pais) {
        if (filtros.pais.length > 100) {
          throw ExcepcionDominio.Respuesta400(
            'El país no puede exceder 100 caracteres',
            'Envio.PaisLongitudExcedida'
          );
        }
        normalizados.pais = filtros.pais;
      }

      // Validar ciudad
      if (filtros.ciudad) {
        if (filtros.ciudad.length > 100) {
          throw ExcepcionDominio.Respuesta400(
            'La ciudad no puede exceder 100 caracteres',
            'Envio.CiudadLongitudExcedida'
          );
        }
        normalizados.ciudad = filtros.ciudad;
      }
    }

    return normalizados;
  }

  /**
   * Calcula los datos de paginación
   * @param total - Total de elementos
   * @param pagina - Página actual
   * @param limite - Límite por página
   * @returns Paginacion - Datos de paginación
   */
  private calcularPaginacion(total: number, pagina: number, limite: number): Paginacion {
    const totalPaginas = Math.ceil(total / limite);
    const tienePaginaAnterior = pagina > 1;
    const tienePaginaSiguiente = pagina < totalPaginas;

    return {
      totalElementos: total,
      totalPaginas,
      paginaActual: pagina,
      limite,
      tienePaginaAnterior,
      tienePaginaSiguiente,
    };
  }
}

/**
 * Interfaz para los filtros de listar envíos
 */
export interface FiltrosListarEnvios {
  pagina?: number;
  limite?: number;
  estado?: EstadoEnvio;
  metodoEnvio?: TipoMetodoEnvio;
  fechaInicio?: Date;
  fechaFin?: Date;
  pais?: string;
  ciudad?: string;
}

/**
 * Interfaz para los filtros normalizados (con valores por defecto)
 */
interface FiltrosNormalizados {
  pagina: number;
  limite: number;
  estado?: EstadoEnvio;
  metodoEnvio?: TipoMetodoEnvio;
  fechaInicio?: Date;
  fechaFin?: Date;
  pais?: string;
  ciudad?: string;
}

/**
 * Interfaz para los datos de paginación
 */
export interface Paginacion {
  totalElementos: number;
  totalPaginas: number;
  paginaActual: number;
  limite: number;
  tienePaginaAnterior: boolean;
  tienePaginaSiguiente: boolean;
}

/**
 * Interfaz para las estadísticas de envíos
 */
export interface EstadisticasEnvios {
  totalEnvios: number;
  enviosPendientes: number;
  enviosProcesando: number;
  enviosEnviados: number;
  enviosEnTransito: number;
  enviosEntregados: number;
  enviosCancelados: number;
  enviosAtrasados: number;
  costoTotalEnvios: number;
  promedioTiempoEntrega: number;
  metodosEnvioMasUtilizados: MetodoEnvioMasUtilizado[];
}

/**
 * Interfaz para los métodos de envío más utilizados
 */
export interface MetodoEnvioMasUtilizado {
  metodoEnvio: TipoMetodoEnvio;
  cantidad: number;
  porcentaje: number;
}