import { Producto } from '../../productos/dominio/entidades/producto.entity';

/**
 * Interfaz específica para repositorios de lectura en MongoDB
 * Solo incluye operaciones de consulta optimizadas para lecturas
 */
export interface RepositorioLecturaProducto {
  /**
   * Encuentra productos por tienda con paginación y filtros
   */
  encontrarPorTienda(
    tiendaId: string, 
    pagina?: number, 
    limite?: number,
    filtros?: any
  ): Promise<{ productos: Producto[]; total: number }>;

  /**
   * Encuentra producto por ID y tienda
   */
  encontrarPorId(id: string, tiendaId: string): Promise<Producto | null>;

  /**
   * Encuentra producto por slug y tienda
   */
  encontrarPorSlug(slug: string, tiendaId: string): Promise<Producto | null>;

  /**
   * Buscar productos por texto
   */
  buscar(
    texto: string, 
    tiendaId: string, 
    pagina?: number, 
    limite?: number
  ): Promise<{ productos: Producto[]; total: number }>;

  /**
   * Obtener productos más vendidos
   */
  encontrarMasVendidos(tiendaId: string, limite?: number): Promise<Producto[]>;

  /**
   * Obtener productos mejor calificados
   */
  encontrarMejorCalificados(tiendaId: string, limite?: number): Promise<Producto[]>;
}