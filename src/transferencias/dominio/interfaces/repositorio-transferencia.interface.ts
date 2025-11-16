import { TransferenciaProducto, ItemTransferencia } from '../entidades/transferencia-producto.entity';

/**
 * Interfaz para el repositorio de transferencias de productos
 * Define las operaciones de persistencia para transferencias
 */
export interface RepositorioTransferencia {
  /**
   * Guarda una nueva transferencia de productos
   */
  guardar(transferencia: TransferenciaProducto): Promise<TransferenciaProducto>;

  /**
   * Busca una transferencia por su ID
   */
  buscarPorId(id: string): Promise<TransferenciaProducto | null>;

  /**
   * Busca una transferencia por su número de transferencia
   */
  buscarPorNumeroTransferencia(numeroTransferencia: string): Promise<TransferenciaProducto | null>;

  /**
   * Lista todas las transferencias con opciones de filtrado y paginación
   */
  listar(filtros?: FiltrosTransferencia, paginacion?: Paginacion): Promise<TransferenciaProducto[]>;

  /**
   * Cuenta el total de transferencias que coinciden con los filtros
   */
  contar(filtros?: FiltrosTransferencia): Promise<number>;

  /**
   * Elimina una transferencia por su ID
   */
  eliminar(id: string): Promise<void>;

  /**
   * Actualiza una transferencia existente
   */
  actualizar(transferencia: TransferenciaProducto): Promise<TransferenciaProducto>;

  /**
   * Exporta transferencias a formato CSV
   */
  exportarCSV(filtros?: FiltrosTransferencia): Promise<string>;

  /**
   * Importa transferencias desde un archivo CSV
   */
  importarCSV(csvData: string, tiendaId?: string, usuarioId?: string): Promise<TransferenciaProducto[]>;

  /**
   * Obtiene el siguiente número de transferencia disponible
   */
  obtenerSiguienteNumeroTransferencia(): Promise<string>;
}

/**
 * Filtros para la búsqueda de transferencias
 */
export interface FiltrosTransferencia {
  tiendaId?: string;
  ubicacionOrigen?: string;
  ubicacionDestino?: string;
  estado?: string;
  fechaDesde?: Date;
  fechaHasta?: Date;
  numeroTransferencia?: string;
  creadorId?: string;
  usuarioId?: string;
}

/**
 * DTO para crear una transferencia desde CSV
 */
export interface TransferenciaCSVDTO {
  numeroTransferencia: string;
  ubicacionOrigen: string;
  ubicacionDestino: string;
  fechaEsperada?: Date;
  notas?: string;
  items: ItemTransferenciaCSVDTO[];
}

/**
 * Opciones de paginación
 */
export interface Paginacion {
  pagina: number;
  limite: number;
}

/**
 * DTO para crear un item de transferencia desde CSV
 */
export interface ItemTransferenciaCSVDTO {
  productoId: string;
  cantidadSolicitada: number;
  cantidadEnviada?: number;
  cantidadRecibida?: number;
}

/**
 * Resultado de la validación de CSV
 */
export interface ValidacionCSVResultado {
  esValido: boolean;
  errores: string[];
  datos: TransferenciaCSVDTO[];
}