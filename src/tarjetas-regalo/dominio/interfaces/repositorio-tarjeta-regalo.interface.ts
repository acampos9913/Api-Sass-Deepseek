import { TarjetaRegalo, TransaccionTarjetaRegalo } from '../entidades/tarjeta-regalo.entity';

/**
 * Interfaz para el repositorio de tarjetas de regalo
 * Define las operaciones de persistencia para tarjetas de regalo
 */
export interface RepositorioTarjetaRegalo {
  /**
   * Guarda una nueva tarjeta de regalo
   */
  guardar(tarjetaRegalo: TarjetaRegalo): Promise<TarjetaRegalo>;

  /**
   * Busca una tarjeta de regalo por su ID
   */
  buscarPorId(id: string): Promise<TarjetaRegalo | null>;

  /**
   * Busca una tarjeta de regalo por su código
   */
  buscarPorCodigo(codigo: string): Promise<TarjetaRegalo | null>;

  /**
   * Lista todas las tarjetas de regalo con opciones de filtrado y paginación
   */
  listar(filtros?: FiltrosTarjetaRegalo, paginacion?: Paginacion): Promise<TarjetaRegalo[]>;

  /**
   * Cuenta el total de tarjetas de regalo que coinciden con los filtros
   */
  contar(filtros?: FiltrosTarjetaRegalo): Promise<number>;

  /**
   * Elimina una tarjeta de regalo por su ID
   */
  eliminar(id: string): Promise<void>;

  /**
   * Actualiza una tarjeta de regalo existente
   */
  actualizar(tarjetaRegalo: TarjetaRegalo): Promise<TarjetaRegalo>;

  /**
   * Exporta tarjetas de regalo a formato CSV
   */
  exportarCSV(filtros?: FiltrosTarjetaRegalo): Promise<string>;

  /**
   * Importa tarjetas de regalo desde un archivo CSV
   */
  importarCSV(csvData: string, tiendaId?: string, usuarioId?: string): Promise<TarjetaRegalo[]>;

  /**
   * Genera un código único para una nueva tarjeta de regalo
   */
  generarCodigoUnico(): Promise<string>;

  /**
   * Registra una transacción en una tarjeta de regalo
   */
  registrarTransaccion(transaccion: TransaccionTarjetaRegalo): Promise<void>;

  /**
   * Obtiene el historial de transacciones de una tarjeta de regalo
   */
  obtenerHistorialTransacciones(tarjetaRegaloId: string): Promise<TransaccionTarjetaRegalo[]>;
}

/**
 * Filtros para la búsqueda de tarjetas de regalo
 */
export interface FiltrosTarjetaRegalo {
  tiendaId?: string;
  estado?: string;
  codigo?: string;
  fechaDesde?: Date;
  fechaHasta?: Date;
  fechaExpiracionDesde?: Date;
  fechaExpiracionHasta?: Date;
  creadorId?: string;
  usuarioId?: string;
}

/**
 * Opciones de paginación
 */
export interface Paginacion {
  pagina: number;
  limite: number;
}

/**
 * DTO para crear una tarjeta de regalo desde CSV
 */
export interface TarjetaRegaloCSVDTO {
  codigo: string;
  montoInicial: number;
  fechaExpiracion?: Date;
  notas?: string;
}

/**
 * Resultado de la validación de CSV
 */
export interface ValidacionCSVResultado {
  esValido: boolean;
  errores: string[];
  datos: TarjetaRegaloCSVDTO[];
}