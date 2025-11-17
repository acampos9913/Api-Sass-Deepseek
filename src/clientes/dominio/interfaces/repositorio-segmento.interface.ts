/**
 * Interfaz del repositorio de Segmentos
 * Define las operaciones CRUD y específicas de segmentación
 * Sigue los principios de Arquitectura Limpia - la capa de Dominio no conoce la implementación
 */
import { Segmento, ReglasSegmento } from '../entidades/segmento.entity';
import { Cliente } from '../entidades/cliente.entity';

export interface RepositorioSegmento {
  /**
   * Guarda un nuevo segmento
   */
  guardar(segmento: Segmento): Promise<Segmento>;

  /**
   * Actualiza un segmento existente
   */
  actualizar(segmento: Segmento): Promise<Segmento>;

  /**
   * Encuentra un segmento por su ID
   */
  encontrarPorId(id: string, tiendaId: string): Promise<Segmento | null>;

  /**
   * Encuentra segmentos por múltiples criterios
   */
  encontrarPorCriterios(criterios: BuscarSegmentosCriterios): Promise<Segmento[]>;

  /**
   * Encuentra todos los segmentos de una tienda
   */
  encontrarTodosPorTienda(tiendaId: string): Promise<Segmento[]>;

  /**
   * Encuentra segmentos activos por tienda
   */
  encontrarActivosPorTienda(tiendaId: string): Promise<Segmento[]>;

  /**
   * Encuentra segmentos por nombre (búsqueda parcial)
   */
  encontrarPorNombre(nombre: string, tiendaId: string): Promise<Segmento[]>;

  /**
   * Encuentra segmentos por tipo
   */
  encontrarPorTipo(tipo: string, tiendaId: string): Promise<Segmento[]>;

  /**
   * Encuentra segmentos por estado
   */
  encontrarPorEstado(estado: string, tiendaId: string): Promise<Segmento[]>;

  /**
   * Encuentra segmentos por etiquetas
   */
  encontrarPorEtiquetas(etiquetas: string[], tiendaId: string): Promise<Segmento[]>;

  /**
   * Elimina un segmento
   */
  eliminar(id: string, tiendaId: string): Promise<boolean>;

  /**
   * Duplica un segmento existente
   */
  duplicar(segmentoOriginal: Segmento, nuevoId: string, nuevoNombre?: string): Promise<Segmento>;

  /**
   * Cuenta el total de segmentos por tienda
   */
  contarPorTienda(tiendaId: string): Promise<number>;

  /**
   * Obtiene estadísticas de segmentos por tienda
   */
  obtenerEstadisticasPorTienda(tiendaId: string): Promise<EstadisticasSegmentos>;

  /**
   * Verifica si un nombre de segmento ya existe en la tienda
   */
  existeNombre(nombre: string, tiendaId: string, excluirId?: string): Promise<boolean>;

  /**
   * Obtiene los clientes que pertenecen a un segmento específico
   */
  obtenerClientesPorSegmento(segmentoId: string, tiendaId: string, opciones?: OpcionesPaginacion): Promise<Cliente[]>;

  /**
   * Cuenta los clientes en un segmento
   */
  contarClientesPorSegmento(segmentoId: string, tiendaId: string): Promise<number>;

  /**
   * Actualiza las estadísticas de un segmento (cantidad de clientes, porcentaje, etc.)
   */
  actualizarEstadisticasSegmento(segmentoId: string, tiendaId: string): Promise<Segmento>;

  /**
   * Ejecuta las reglas de un segmento y obtiene los clientes que las cumplen
   */
  ejecutarReglasSegmento(reglas: ReglasSegmento, tiendaId: string, opciones?: OpcionesPaginacion): Promise<Cliente[]>;

  /**
   * Cuenta los clientes que cumplen con las reglas de segmentación
   */
  contarClientesPorReglas(reglas: ReglasSegmento, tiendaId: string): Promise<number>;

  /**
   * Obtiene segmentos que pueden ser usados en campañas de marketing
   */
  encontrarSegmentosParaCampanas(tiendaId: string): Promise<Segmento[]>;

  /**
   * Obtiene segmentos predefinidos del sistema
   */
  encontrarSegmentosPredefinidos(tiendaId: string): Promise<Segmento[]>;

  /**
   * Obtiene segmentos creados por un usuario específico
   */
  encontrarSegmentosPorCreador(creadorId: string, tiendaId: string): Promise<Segmento[]>;

  /**
   * Busca segmentos con filtros avanzados
   */
  buscarAvanzado(criterios: BusquedaAvanzadaSegmentos): Promise<Segmento[]>;

  /**
   * Exporta segmentos a formato CSV
   */
  exportarSegmentos(criterios: BuscarSegmentosCriterios): Promise<string>;

  /**
   * Obtiene el historial de cambios de un segmento
   */
  obtenerHistorialSegmento(segmentoId: string, tiendaId: string): Promise<HistorialSegmento[]>;

  /**
   * Obtiene segmentos similares basados en reglas o nombre
   */
  encontrarSegmentosSimilares(segmento: Segmento, tiendaId: string): Promise<Segmento[]>;

  /**
   * Actualiza la última actividad de un segmento
   */
  actualizarUltimaActividad(segmentoId: string, tiendaId: string): Promise<Segmento>;

  /**
   * Obtiene segmentos que necesitan actualización de estadísticas
   */
  encontrarSegmentosParaActualizarEstadisticas(tiendaId: string): Promise<Segmento[]>;

  /**
   * Valida si las reglas de segmentación son ejecutables
   */
  validarReglasEjecutables(reglas: ReglasSegmento, tiendaId: string): Promise<boolean>;
}

/**
 * Criterios para buscar segmentos
 */
export interface BuscarSegmentosCriterios {
  tiendaId: string;
  nombre?: string;
  tipo?: string;
  estado?: string;
  creadorId?: string;
  etiquetas?: string[];
  fechaCreacionDesde?: Date;
  fechaCreacionHasta?: Date;
  fechaActualizacionDesde?: Date;
  fechaActualizacionHasta?: Date;
  esPublico?: boolean;
  puedeCombinar?: boolean;
  plantillaId?: string;
  ordenarPor?: string;
  orden?: 'ASC' | 'DESC';
  pagina?: number;
  limite?: number;
}

/**
 * Opciones de paginación para consultas
 */
export interface OpcionesPaginacion {
  pagina?: number;
  limite?: number;
  ordenarPor?: string;
  orden?: 'ASC' | 'DESC';
}

/**
 * Estadísticas de segmentos
 */
export interface EstadisticasSegmentos {
  totalSegmentos: number;
  segmentosActivos: number;
  segmentosInactivos: number;
  segmentosBorrador: number;
  segmentosAutomaticos: number;
  segmentosManuales: number;
  segmentosPredefinidos: number;
  promedioClientesPorSegmento: number;
  segmentoMasGrande: {
    id: string;
    nombre: string;
    cantidadClientes: number;
  };
  segmentoMasReciente: {
    id: string;
    nombre: string;
    fechaCreacion: Date;
  };
}

/**
 * Criterios de búsqueda avanzada para segmentos
 */
export interface BusquedaAvanzadaSegmentos {
  tiendaId: string;
  consulta?: string;
  campos?: string[];
  tipos?: string[];
  estados?: string[];
  fechas?: {
    campo: 'fechaCreacion' | 'fechaActualizacion' | 'ultimaActividad';
    desde?: Date;
    hasta?: Date;
  };
  rangos?: {
    campo: 'cantidadClientes' | 'porcentajeClientes';
    min?: number;
    max?: number;
  };
  logica?: 'Y' | 'O';
  ordenamiento?: {
    campo: string;
    direccion: 'ASC' | 'DESC';
  }[];
  paginacion?: OpcionesPaginacion;
}

/**
 * Entrada de historial de cambios de segmento
 */
export interface HistorialSegmento {
  id: string;
  segmentoId: string;
  accion: string;
  detalles: any;
  usuarioId: string;
  fecha: Date;
  ip?: string;
  userAgent?: string;
}

/**
 * Resultado de validación de reglas
 */
export interface ResultadoValidacionReglas {
  valido: boolean;
  errores?: string[];
  advertencias?: string[];
  clientesAfectados?: number;
  tiempoEjecucionEstimado?: number;
}

/**
 * Plantilla de segmento para creación rápida
 */
export interface PlantillaSegmento {
  id: string;
  nombre: string;
  descripcion: string;
  reglas: ReglasSegmento;
  tipo: 'PREDEFINIDO' | 'PERSONALIZADO';
  categoria: string;
  etiquetas: string[];
  esRecomendado: boolean;
}