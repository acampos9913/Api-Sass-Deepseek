import { Producto } from '../entidades/producto.entity';

/**
 * Interfaz que define el contrato para el repositorio de productos
 * Sigue el principio de inversión de dependencias (DIP)
 * Incluye todas las funcionalidades avanzadas tipo Shopify
 */
export interface RepositorioProducto {
  /**
   * Busca un producto por su ID
   * @param id - ID del producto a buscar
   * @returns Promise con el producto encontrado o null
   */
  buscarPorId(id: string): Promise<Producto | null>;

  /**
   * Busca productos por su SKU
   * @param sku - SKU del producto a buscar
   * @returns Promise con el producto encontrado o null
   */
  buscarPorSku(sku: string): Promise<Producto | null>;

  /**
   * Busca productos por su slug
   * @param slug - Slug del producto a buscar
   * @returns Promise con el producto encontrado o null
   */
  buscarPorSlug(slug: string): Promise<Producto | null>;

  /**
   * Guarda un nuevo producto en el repositorio
   * @param producto - Producto a guardar
   * @returns Promise con el producto guardado
   */
  guardar(producto: Producto): Promise<Producto>;

  /**
   * Actualiza un producto existente
   * @param producto - Producto a actualizar
   * @returns Promise con el producto actualizado
   */
  actualizar(producto: Producto): Promise<Producto>;

  /**
   * Elimina un producto por su ID (eliminación lógica)
   * @param id - ID del producto a eliminar
   * @returns Promise que se resuelve cuando se completa la eliminación
   */
  eliminar(id: string): Promise<void>;

  /**
   * Archiva un producto por su ID
   * @param id - ID del producto a archivar
   * @returns Promise con el producto archivado
   */
  archivar(id: string): Promise<Producto>;

  /**
   * Desarchiva un producto por su ID
   * @param id - ID del producto a desarchivar
   * @returns Promise con el producto desarchivado
   */
  desarchivar(id: string): Promise<Producto>;

  /**
   * Duplica un producto existente
   * @param id - ID del producto a duplicar
   * @returns Promise con el nuevo producto duplicado
   */
  duplicar(id: string): Promise<Producto>;

  /**
   * Lista todos los productos con paginación y filtros avanzados
   * @param pagina - Número de página (comenzando en 1)
   * @param limite - Límite de productos por página
   * @param filtros - Filtros opcionales para la búsqueda
   * @returns Promise con la lista de productos y metadatos de paginación
   */
  listar(
    pagina: number,
    limite: number,
    filtros?: {
      titulo?: string;
      visible?: boolean;
      categoriaId?: string;
      tiendaId?: string;
      estado?: 'ACTIVO' | 'ARCHIVADO' | 'ELIMINADO';
      proveedor?: string;
      tipoProducto?: 'FISICO' | 'DIGITAL' | 'SERVICIO';
      visibleTiendaOnline?: boolean;
      visiblePointOfSale?: boolean;
      tags?: string[];
      fechaDesde?: Date;
      fechaHasta?: Date;
      inventarioBajo?: boolean;
      conDescuento?: boolean;
    },
  ): Promise<{ productos: Producto[]; total: number }>;

  /**
   * Busca productos por título (búsqueda parcial)
   * @param titulo - Título o parte del título a buscar
   * @param pagina - Número de página (comenzando en 1)
   * @param limite - Límite de productos por página
   * @returns Promise con la lista de productos y metadatos de paginación
   */
  buscarPorTitulo(
    titulo: string,
    pagina: number,
    limite: number,
  ): Promise<{ productos: Producto[]; total: number }>;

  /**
   * Obtiene productos por categoría
   * @param categoriaId - ID de la categoría
   * @param pagina - Número de página (comenzando en 1)
   * @param limite - Límite de productos por página
   * @returns Promise con la lista de productos y metadatos de paginación
   */
  listarPorCategoria(
    categoriaId: string,
    pagina: number,
    limite: number,
  ): Promise<{ productos: Producto[]; total: number }>;

  /**
   * Obtiene productos por colección
   * @param coleccionId - ID de la colección
   * @param pagina - Número de página (comenzando en 1)
   * @param limite - Límite de productos por página
   * @returns Promise con la lista de productos y metadatos de paginación
   */
  listarPorColeccion(
    coleccionId: string,
    pagina: number,
    limite: number,
  ): Promise<{ productos: Producto[]; total: number }>;

  /**
   * Obtiene productos por proveedor
   * @param proveedor - Nombre del proveedor
   * @param pagina - Número de página (comenzando en 1)
   * @param limite - Límite de productos por página
   * @returns Promise con la lista de productos y metadatos de paginación
   */
  listarPorProveedor(
    proveedor: string,
    pagina: number,
    limite: number,
  ): Promise<{ productos: Producto[]; total: number }>;

  /**
   * Obtiene productos por tags
   * @param tags - Array de tags
   * @param pagina - Número de página (comenzando en 1)
   * @param limite - Límite de productos por página
   * @returns Promise con la lista de productos y metadatos de paginación
   */
  listarPorTags(
    tags: string[],
    pagina: number,
    limite: number,
  ): Promise<{ productos: Producto[]; total: number }>;

  /**
   * Lista productos con inventario bajo
   * @param umbral - Umbral de inventario bajo
   * @param pagina - Número de página (comenzando en 1)
   * @param limite - Límite de productos por página
   * @returns Promise con la lista de productos y metadatos de paginación
   */
  listarConInventarioBajo(
    umbral: number,
    pagina: number,
    limite: number,
  ): Promise<{ productos: Producto[]; total: number }>;

  /**
   * Lista productos archivados
   * @param pagina - Número de página (comenzando en 1)
   * @param limite - Límite de productos por página
   * @returns Promise con la lista de productos y metadatos de paginación
   */
  listarArchivados(
    pagina: number,
    limite: number,
  ): Promise<{ productos: Producto[]; total: number }>;

  /**
   * Lista productos publicados (visibles en tienda)
   * @param pagina - Número de página (comenzando en 1)
   * @param limite - Límite de productos por página
   * @returns Promise con la lista de productos y metadatos de paginación
   */
  listarPublicados(
    pagina: number,
    limite: number,
  ): Promise<{ productos: Producto[]; total: number }>;

  /**
   * Exporta productos a CSV
   * @param filtros - Filtros para la exportación
   * @returns Promise con el contenido CSV
   */
  exportarCSV(filtros?: {
    tiendaId?: string;
    estado?: 'ACTIVO' | 'ARCHIVADO' | 'ELIMINADO';
    fechaDesde?: Date;
    fechaHasta?: Date;
    categoriaId?: string;
    proveedor?: string;
  }): Promise<string>;

  /**
   * Importa productos desde CSV
   * @param csvData - Datos CSV
   * @param tiendaId - ID de la tienda
   * @param creadorId - ID del usuario creador
   * @returns Promise con el resultado de la importación
   */
  importarCSV(
    csvData: string,
    tiendaId: string,
    creadorId: string,
  ): Promise<{ exitosos: number; fallidos: number; errores: string[] }>;

  /**
   * Actualiza el inventario de un producto
   * @param id - ID del producto
   * @param cantidad - Nueva cantidad de inventario
   * @returns Promise con el producto actualizado
   */
  actualizarInventario(id: string, cantidad: number): Promise<Producto>;

  /**
   * Actualiza la visibilidad por canal de un producto
   * @param id - ID del producto
   * @param tiendaOnline - Visibilidad en tienda online
   * @param pointOfSale - Visibilidad en point of sale
   * @returns Promise con el producto actualizado
   */
  actualizarVisibilidadCanales(
    id: string,
    tiendaOnline: boolean,
    pointOfSale: boolean,
  ): Promise<Producto>;

  /**
   * Verifica si un SKU ya existe en el sistema
   * @param sku - SKU a verificar
   * @param idExcluir - ID del producto a excluir (para actualizaciones)
   * @returns Promise con true si el SKU existe, false en caso contrario
   */
  existeSku(sku: string, idExcluir?: string): Promise<boolean>;

  /**
   * Verifica si un slug ya existe en el sistema
   * @param slug - Slug a verificar
   * @param idExcluir - ID del producto a excluir (para actualizaciones)
   * @returns Promise con true si el slug existe, false en caso contrario
   */
  existeSlug(slug: string, idExcluir?: string): Promise<boolean>;

  /**
   * Genera estadísticas de productos
   * @param tiendaId - ID de la tienda
   * @returns Promise con las estadísticas
   */
  obtenerEstadisticas(tiendaId: string): Promise<{
    total: number;
    activos: number;
    archivados: number;
    conInventarioBajo: number;
    publicados: number;
    porTipo: { [tipo: string]: number };
  }>;
}