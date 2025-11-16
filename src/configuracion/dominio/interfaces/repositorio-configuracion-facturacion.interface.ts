import { ConfiguracionFacturacion } from '../entidades/configuracion-facturacion.entity';

/**
 * Interfaz del Repositorio para Configuración de Facturación
 * Define el contrato que deben implementar los adaptadores de persistencia
 */
export interface RepositorioConfiguracionFacturacion {
  /**
   * Guarda una nueva configuración de facturación
   * @param configuracion Configuración de facturación a guardar
   * @returns Promise con la configuración guardada
   */
  guardar(configuracion: ConfiguracionFacturacion): Promise<ConfiguracionFacturacion>;

  /**
   * Actualiza una configuración de facturación existente
   * @param configuracion Configuración de facturación a actualizar
   * @returns Promise con la configuración actualizada
   */
  actualizar(configuracion: ConfiguracionFacturacion): Promise<ConfiguracionFacturacion>;

  /**
   * Busca la configuración de facturación por ID de tienda
   * @param tiendaId ID de la tienda
   * @returns Promise con la configuración encontrada o null si no existe
   */
  buscarPorTiendaId(tiendaId: string): Promise<ConfiguracionFacturacion | null>;

  /**
   * Busca la configuración de facturación por ID
   * @param id ID de la configuración
   * @returns Promise con la configuración encontrada o null si no existe
   */
  buscarPorId(id: string): Promise<ConfiguracionFacturacion | null>;

  /**
   * Elimina una configuración de facturación
   * @param id ID de la configuración a eliminar
   * @returns Promise que se resuelve cuando la eliminación es exitosa
   */
  eliminar(id: string): Promise<void>;

  /**
   * Verifica si existe una configuración de facturación para una tienda
   * @param tiendaId ID de la tienda
   * @returns Promise con booleano indicando si existe
   */
  existePorTiendaId(tiendaId: string): Promise<boolean>;

  /**
   * Lista todas las configuraciones de facturación (para administración)
   * @param pagina Número de página (opcional)
   * @param limite Límite de resultados por página (opcional)
   * @returns Promise con array de configuraciones
   */
  listarTodas(pagina?: number, limite?: number): Promise<ConfiguracionFacturacion[]>;

  /**
   * Cuenta el total de configuraciones de facturación
   * @returns Promise con el número total
   */
  contarTotal(): Promise<number>;

  /**
   * Busca configuraciones por criterios específicos
   * @param criterios Objeto con criterios de búsqueda
   * @param pagina Número de página (opcional)
   * @param limite Límite de resultados por página (opcional)
   * @returns Promise con array de configuraciones que cumplen los criterios
   */
  buscarPorCriterios(
    criterios: {
      tiendaId?: string;
      nombreEmpresa?: string;
      emailFacturacion?: string;
      idFiscal?: string;
    },
    pagina?: number,
    limite?: number
  ): Promise<ConfiguracionFacturacion[]>;
}