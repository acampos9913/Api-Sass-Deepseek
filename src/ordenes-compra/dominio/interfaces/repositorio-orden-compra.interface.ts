import { OrdenCompra, ItemOrdenCompra } from '../entidades/orden-compra.entity';

/**
 * Interfaz para el repositorio de órdenes de compra
 * Define las operaciones de persistencia para órdenes de compra
 */
export interface RepositorioOrdenCompra {
  /**
   * Guarda una nueva orden de compra
   */
  guardar(ordenCompra: OrdenCompra): Promise<OrdenCompra>;

  /**
   * Busca una orden de compra por su ID
   */
  buscarPorId(id: string): Promise<OrdenCompra | null>;

  /**
   * Busca una orden de compra por su número de orden
   */
  buscarPorNumeroOrden(numeroOrden: string): Promise<OrdenCompra | null>;

  /**
   * Lista todas las órdenes de compra con opciones de filtrado y paginación
   */
  listar(filtros?: FiltrosOrdenCompra, paginacion?: Paginacion): Promise<OrdenCompra[]>;

  /**
   * Cuenta el total de órdenes de compra que coinciden con los filtros
   */
  contar(filtros?: FiltrosOrdenCompra): Promise<number>;

  /**
   * Elimina una orden de compra por su ID
   */
  eliminar(id: string): Promise<void>;

  /**
   * Actualiza una orden de compra existente
   */
  actualizar(ordenCompra: OrdenCompra): Promise<OrdenCompra>;

  /**
   * Exporta órdenes de compra a formato CSV
   */
  exportarCSV(filtros?: FiltrosOrdenCompra): Promise<string>;

  /**
   * Importa órdenes de compra desde un archivo CSV
   */
  importarCSV(csvData: string, tiendaId?: string, usuarioId?: string): Promise<OrdenCompra[]>;

  /**
   * Obtiene el siguiente número de orden disponible
   */
  obtenerSiguienteNumeroOrden(): Promise<string>;
}

/**
 * Filtros para la búsqueda de órdenes de compra
 */
export interface FiltrosOrdenCompra {
  tiendaId?: string;
  proveedor?: string;
  estado?: string;
  fechaDesde?: Date;
  fechaHasta?: Date;
  numeroOrden?: string;
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
 * DTO para crear una orden de compra desde CSV
 */
export interface OrdenCompraCSVDTO {
  numeroOrden: string;
  proveedor: string;
  fechaEsperada?: Date;
  subtotal: number;
  impuestos: number;
  total: number;
  notas?: string;
  items: ItemOrdenCompraCSVDTO[];
}

/**
 * DTO para crear un item de orden de compra desde CSV
 */
export interface ItemOrdenCompraCSVDTO {
  productoId: string;
  cantidad: number;
  precioUnitario: number;
  total: number;
}

/**
 * Resultado de la validación de CSV
 */
export interface ValidacionCSVResultado {
  esValido: boolean;
  errores: string[];
  datos: OrdenCompraCSVDTO[];
}