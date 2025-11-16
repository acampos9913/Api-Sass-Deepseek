import { Producto } from '../entidades/producto.entity';

/**
 * Interfaz para repositorios de lectura optimizada de productos
 * Abstrayendo la implementación específica de base de datos (MongoDB, Redis, etc.)
 */
export interface RepositorioLecturaProducto {
  /**
   * Encuentra productos por tienda con filtros y paginación
   */
  encontrarPorTienda(
    tiendaId: string,
    pagina: number,
    limite: number,
    filtros?: any,
  ): Promise<{ productos: Producto[]; total: number }>;

  /**
   * Busca productos por texto usando búsqueda optimizada
   */
  buscar(
    texto: string,
    tiendaId: string,
    pagina: number,
    limite: number,
  ): Promise<{ productos: Producto[]; total: number }>;

  /**
   * Encuentra productos más vendidos
   */
  encontrarMasVendidos(tiendaId: string, limite: number): Promise<Producto[]>;

  /**
   * Encuentra productos mejor calificados
   */
  encontrarMejorCalificados(tiendaId: string, limite: number): Promise<Producto[]>;

  /**
   * Encuentra producto por slug
   */
  encontrarPorSlug(slug: string, tiendaId: string): Promise<Producto | null>;

  /**
   * Encuentra producto por ID
   */
  encontrarPorId(id: string, tiendaId: string): Promise<Producto | null>;
}