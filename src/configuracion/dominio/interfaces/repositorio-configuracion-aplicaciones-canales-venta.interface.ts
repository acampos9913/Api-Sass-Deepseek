import { ConfiguracionAplicacionesCanalesVenta } from '../entidades/configuracion-aplicaciones-canales-venta.entity';
import { 
  ConfiguracionAplicacionesCanalesVentaDto, 
  ActualizarConfiguracionAplicacionesCanalesVentaDto,
  CrearAppInstaladaDto,
  ActualizarAppInstaladaDto,
  CrearCanalVentaDto,
  ActualizarCanalVentaDto,
  CrearAppDesarrolloDto,
  ActualizarAppDesarrolloDto,
  CrearAppDesinstaladaDto,
  TipoAppEnum,
  TipoCanalEnum,
  EstadoAppEnum
} from '../../aplicacion/dto/configuracion-aplicaciones-canales-venta.dto';

/**
 * Interfaz para el repositorio de configuración de aplicaciones y canales de venta
 * Define los métodos que debe implementar el repositorio de infraestructura
 */
export interface RepositorioConfiguracionAplicacionesCanalesVenta {
  /**
   * Encuentra la configuración de aplicaciones y canales de venta por ID de tienda
   */
  encontrarPorTiendaId(tiendaId: string): Promise<ConfiguracionAplicacionesCanalesVenta | null>;

  /**
   * Crea una nueva configuración de aplicaciones y canales de venta
   */
  crear(configuracion: ConfiguracionAplicacionesCanalesVenta): Promise<ConfiguracionAplicacionesCanalesVenta>;

  /**
   * Actualiza una configuración existente de aplicaciones y canales de venta
   */
  actualizar(configuracion: ConfiguracionAplicacionesCanalesVenta): Promise<ConfiguracionAplicacionesCanalesVenta>;

  /**
   * Elimina la configuración de aplicaciones y canales de venta por ID de tienda
   */
  eliminarPorTiendaId(tiendaId: string): Promise<void>;

  /**
   * Métodos específicos para aplicaciones instaladas
   */

  agregarAppInstalada(tiendaId: string, dto: CrearAppInstaladaDto): Promise<ConfiguracionAplicacionesCanalesVenta>;
  
  actualizarAppInstalada(tiendaId: string, appId: string, dto: ActualizarAppInstaladaDto): Promise<ConfiguracionAplicacionesCanalesVenta>;
  
  eliminarAppInstalada(tiendaId: string, appId: string): Promise<ConfiguracionAplicacionesCanalesVenta>;

  obtenerAppInstaladaPorId(tiendaId: string, appId: string): Promise<any | null>;

  obtenerAppsInstaladasPorTipo(tiendaId: string, tipo: TipoAppEnum): Promise<any[]>;

  /**
   * Métodos específicos para canales de venta
   */

  agregarCanalVenta(tiendaId: string, dto: CrearCanalVentaDto): Promise<ConfiguracionAplicacionesCanalesVenta>;
  
  actualizarCanalVenta(tiendaId: string, canalId: string, dto: ActualizarCanalVentaDto): Promise<ConfiguracionAplicacionesCanalesVenta>;
  
  eliminarCanalVenta(tiendaId: string, canalId: string): Promise<ConfiguracionAplicacionesCanalesVenta>;

  obtenerCanalVentaPorId(tiendaId: string, canalId: string): Promise<any | null>;

  obtenerCanalesVentaPorTipo(tiendaId: string, tipo: TipoCanalEnum): Promise<any[]>;

  obtenerCanalesVentaActivos(tiendaId: string): Promise<any[]>;

  /**
   * Métodos específicos para aplicaciones en desarrollo
   */

  agregarAppDesarrollo(tiendaId: string, dto: CrearAppDesarrolloDto): Promise<ConfiguracionAplicacionesCanalesVenta>;
  
  actualizarAppDesarrollo(tiendaId: string, appId: string, dto: ActualizarAppDesarrolloDto): Promise<ConfiguracionAplicacionesCanalesVenta>;
  
  eliminarAppDesarrollo(tiendaId: string, appId: string): Promise<ConfiguracionAplicacionesCanalesVenta>;

  obtenerAppDesarrolloPorId(tiendaId: string, appId: string): Promise<any | null>;

  obtenerAppsDesarrolloPorEstado(tiendaId: string, estado: EstadoAppEnum): Promise<any[]>;

  /**
   * Métodos específicos para aplicaciones desinstaladas
   */

  agregarAppDesinstalada(tiendaId: string, dto: CrearAppDesinstaladaDto): Promise<ConfiguracionAplicacionesCanalesVenta>;
  
  eliminarAppDesinstalada(tiendaId: string, appId: string): Promise<ConfiguracionAplicacionesCanalesVenta>;

  /**
   * Métodos de consulta y estadísticas
   */

  contarAppsInstaladas(tiendaId: string): Promise<number>;

  contarCanalesVentaActivos(tiendaId: string): Promise<number>;

  contarAppsEnDesarrollo(tiendaId: string): Promise<number>;

  /**
   * Verifica si existe configuración para una tienda
   */
  existePorTiendaId(tiendaId: string): Promise<boolean>;
}