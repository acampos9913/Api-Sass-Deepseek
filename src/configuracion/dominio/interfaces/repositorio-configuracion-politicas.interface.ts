import { ConfiguracionPoliticas } from '../entidades/configuracion-politicas.entity';

/**
 * Interfaz del repositorio para la configuración de políticas
 * Define los contratos que deben cumplir las implementaciones de repositorio
 */
export interface RepositorioConfiguracionPoliticas {
  /**
   * Buscar configuración de políticas por ID
   */
  buscarPorId(id: string): Promise<ConfiguracionPoliticas | null>;

  /**
   * Buscar configuración de políticas por ID de tienda
   */
  buscarPorTiendaId(tiendaId: string): Promise<ConfiguracionPoliticas | null>;

  /**
   * Guardar una nueva configuración de políticas
   */
  guardar(configuracion: ConfiguracionPoliticas): Promise<ConfiguracionPoliticas>;

  /**
   * Actualizar una configuración de políticas existente
   */
  actualizar(configuracion: ConfiguracionPoliticas): Promise<ConfiguracionPoliticas>;

  /**
   * Eliminar configuración de políticas por ID
   */
  eliminar(id: string): Promise<void>;

  /**
   * Verificar si existe configuración de políticas para una tienda
   */
  existePorTiendaId(tiendaId: string): Promise<boolean>;

  /**
   * Buscar todas las configuraciones de políticas (para administración)
   */
  buscarTodas(): Promise<ConfiguracionPoliticas[]>;

  /**
   * Buscar configuraciones de políticas por estado de reglas de devolución
   */
  buscarPorEstadoReglasDevolucion(estado: string): Promise<ConfiguracionPoliticas[]>;

  /**
   * Buscar configuraciones de políticas que contengan un producto en venta final
   */
  buscarPorProductoVentaFinal(productoId: string): Promise<ConfiguracionPoliticas[]>;

  /**
   * Contar el total de configuraciones de políticas
   */
  contarTotal(): Promise<number>;

  /**
   * Buscar configuraciones de políticas con paginación
   */
  buscarConPaginacion(
    pagina: number,
    limite: number,
    tiendaId?: string
  ): Promise<{
    configuraciones: ConfiguracionPoliticas[];
    total: number;
    paginas: number;
  }>;
}