import type { ConfiguracionIdiomas } from '../entidades/configuracion-idiomas.entity';
import type {
  ConfiguracionIdiomasDto,
  ActualizarConfiguracionIdiomasDto,
  AsignarIdiomaDominioDto,
  ExportarIdiomasDto,
  ImportarIdiomasDto,
  EstadoIdiomaEnum,
  EstadoTraduccionEnum
} from '../../aplicacion/dto/configuracion-idiomas.dto';

/**
 * Interfaz para el repositorio de configuración de idiomas
 * Define los contratos para las operaciones de persistencia
 */
export interface RepositorioConfiguracionIdiomas {
  /**
   * Guardar una nueva configuración de idiomas
   */
  guardar(configuracion: ConfiguracionIdiomas): Promise<ConfiguracionIdiomas>;

  /**
   * Buscar configuración de idiomas por ID
   */
  buscarPorId(id: string): Promise<ConfiguracionIdiomas | null>;

  /**
   * Buscar configuración de idiomas por ID de tienda y código de idioma
   */
  buscarPorTiendaYCodigo(tiendaId: string, codigoIdioma: string): Promise<ConfiguracionIdiomas | null>;

  /**
   * Listar todas las configuraciones de idiomas de una tienda
   */
  listarPorTienda(tiendaId: string): Promise<ConfiguracionIdiomas[]>;

  /**
   * Listar configuraciones de idiomas por estado
   */
  listarPorEstado(tiendaId: string, estado: EstadoIdiomaEnum): Promise<ConfiguracionIdiomas[]>;

  /**
   * Listar configuraciones de idiomas por estado de traducción
   */
  listarPorEstadoTraduccion(tiendaId: string, estadoTraduccion: EstadoTraduccionEnum): Promise<ConfiguracionIdiomas[]>;

  /**
   * Obtener el idioma predeterminado de una tienda
   */
  obtenerPredeterminado(tiendaId: string): Promise<ConfiguracionIdiomas | null>;

  /**
   * Verificar si existe un idioma con el código específico en la tienda
   */
  existePorCodigo(tiendaId: string, codigoIdioma: string): Promise<boolean>;

  /**
   * Contar idiomas por estado en una tienda
   */
  contarPorEstado(tiendaId: string, estado: EstadoIdiomaEnum): Promise<number>;

  /**
   * Contar idiomas por estado de traducción en una tienda
   */
  contarPorEstadoTraduccion(tiendaId: string, estadoTraduccion: EstadoTraduccionEnum): Promise<number>;

  /**
   * Actualizar una configuración de idiomas existente
   */
  actualizar(id: string, datos: ActualizarConfiguracionIdiomasDto): Promise<ConfiguracionIdiomas>;

  /**
   * Eliminar una configuración de idiomas
   */
  eliminar(id: string): Promise<void>;

  /**
   * Asignar idioma a dominio
   */
  asignarADominio(id: string, asignacion: AsignarIdiomaDominioDto): Promise<ConfiguracionIdiomas>;

  /**
   * Desasignar idioma de dominio
   */
  desasignarDeDominio(id: string, dominio: string): Promise<ConfiguracionIdiomas>;

  /**
   * Obtener idiomas asignados a un dominio específico
   */
  listarPorDominio(dominio: string): Promise<ConfiguracionIdiomas[]>;

  /**
   * Obtener el idioma predeterminado de un dominio
   */
  obtenerPredeterminadoPorDominio(dominio: string): Promise<ConfiguracionIdiomas | null>;

  /**
   * Establecer idioma como predeterminado de la tienda
   */
  establecerComoPredeterminado(id: string): Promise<ConfiguracionIdiomas>;

  /**
   * Quitar idioma como predeterminado de la tienda
   */
  quitarComoPredeterminado(id: string): Promise<ConfiguracionIdiomas>;

  /**
   * Publicar idioma
   */
  publicar(id: string): Promise<ConfiguracionIdiomas>;

  /**
   * Despublicar idioma
   */
  despublicar(id: string): Promise<ConfiguracionIdiomas>;

  /**
   * Actualizar progreso de traducción
   */
  actualizarProgresoTraduccion(id: string, porcentaje: number, estado?: EstadoTraduccionEnum): Promise<ConfiguracionIdiomas>;

  /**
   * Marcar como completamente traducido
   */
  marcarComoTraducido(id: string): Promise<ConfiguracionIdiomas>;

  /**
   * Operaciones de importación/exportación
   */

  /**
   * Exportar configuración de idiomas
   */
  exportar(datos: ExportarIdiomasDto, tiendaId: string): Promise<string>;

  /**
   * Importar configuración de idiomas
   */
  importar(datos: ImportarIdiomasDto, tiendaId: string): Promise<ConfiguracionIdiomas[]>;

  /**
   * Validaciones de negocio
   */

  /**
   * Verificar si puede establecer como predeterminado
   */
  puedeEstablecerComoPredeterminado(id: string): Promise<boolean>;

  /**
   * Verificar si puede ser eliminado
   */
  puedeSerEliminado(id: string): Promise<boolean>;

  /**
   * Verificar si puede ser despublicado
   */
  puedeSerDespublicado(id: string): Promise<boolean>;

  /**
   * Obtener estadísticas de idiomas
   */
  obtenerEstadisticas(tiendaId: string): Promise<{
    total: number;
    publicados: number;
    no_publicados: number;
    predeterminados: number;
    sin_traducir: number;
    en_progreso: number;
    traducidos: number;
    porcentaje_traduccion_promedio: number;
  }>;

  /**
   * Buscar idiomas por nombre o código (búsqueda)
   */
  buscar(tiendaId: string, termino: string): Promise<ConfiguracionIdiomas[]>;

  /**
   * Obtener idiomas con bajo progreso de traducción
   */
  obtenerConBajoProgreso(tiendaId: string, porcentajeMinimo: number): Promise<ConfiguracionIdiomas[]>;

  /**
   * Obtener idiomas que necesitan atención (sin traducir o bajo progreso)
   */
  obtenerQueNecesitanAtencion(tiendaId: string): Promise<ConfiguracionIdiomas[]>;

  /**
   * Transacciones y operaciones batch
   */

  /**
   * Actualizar múltiples idiomas
   */
  actualizarMultiple(ids: string[], datos: Partial<ActualizarConfiguracionIdiomasDto>): Promise<ConfiguracionIdiomas[]>;

  /**
   * Eliminar múltiples idiomas
   */
  eliminarMultiple(ids: string[]): Promise<void>;

  /**
   * Establecer predeterminado masivamente (solo uno puede ser predeterminado)
   */
  establecerPredeterminadoMasivo(idPredeterminado: string, tiendaId: string): Promise<ConfiguracionIdiomas[]>;
}