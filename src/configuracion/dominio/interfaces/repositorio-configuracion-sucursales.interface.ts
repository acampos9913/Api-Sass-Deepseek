import { ConfiguracionSucursales } from '../entidades/configuracion-sucursales.entity';
import { ConfiguracionSucursalesDto, ActualizarConfiguracionSucursalesDto } from '../../aplicacion/dto/configuracion-sucursales.dto';

/**
 * Interfaz para el repositorio de configuración de sucursales
 */
export interface RepositorioConfiguracionSucursales {
  /**
   * Crea una nueva configuración de sucursales
   * @param configuracionSucursales Configuración de sucursales a crear
   * @returns Promise<ConfiguracionSucursales> Configuración creada
   */
  crear(configuracionSucursales: ConfiguracionSucursales): Promise<ConfiguracionSucursales>;

  /**
   * Encuentra una configuración de sucursales por ID
   * @param id ID de la configuración de sucursales
   * @param tiendaId ID de la tienda
   * @returns Promise<ConfiguracionSucursales | null> Configuración encontrada o null
   */
  encontrarPorId(id: string, tiendaId: string): Promise<ConfiguracionSucursales | null>;

  /**
   * Encuentra todas las configuraciones de sucursales de una tienda
   * @param tiendaId ID de la tienda
   * @returns Promise<ConfiguracionSucursales[]> Lista de configuraciones
   */
  encontrarTodasPorTienda(tiendaId: string): Promise<ConfiguracionSucursales[]>;

  /**
   * Encuentra configuraciones de sucursales por estado
   * @param tiendaId ID de la tienda
   * @param estado Estado de la sucursal
   * @returns Promise<ConfiguracionSucursales[]> Lista de configuraciones
   */
  encontrarPorEstado(tiendaId: string, estado: string): Promise<ConfiguracionSucursales[]>;

  /**
   * Actualiza una configuración de sucursales
   * @param id ID de la configuración de sucursales
   * @param tiendaId ID de la tienda
   * @param datos Datos a actualizar
   * @returns Promise<ConfiguracionSucursales> Configuración actualizada
   */
  actualizar(
    id: string, 
    tiendaId: string, 
    datos: ActualizarConfiguracionSucursalesDto
  ): Promise<ConfiguracionSucursales>;

  /**
   * Elimina una configuración de sucursales
   * @param id ID de la configuración de sucursales
   * @param tiendaId ID de la tienda
   * @returns Promise<boolean> True si se eliminó, false si no
   */
  eliminar(id: string, tiendaId: string): Promise<boolean>;

  /**
   * Activa una sucursal
   * @param id ID de la configuración de sucursales
   * @param tiendaId ID de la tienda
   * @returns Promise<ConfiguracionSucursales> Configuración actualizada
   */
  activar(id: string, tiendaId: string): Promise<ConfiguracionSucursales>;

  /**
   * Desactiva una sucursal
   * @param id ID de la configuración de sucursales
   * @param tiendaId ID de la tienda
   * @returns Promise<ConfiguracionSucursales> Configuración actualizada
   */
  desactivar(id: string, tiendaId: string): Promise<ConfiguracionSucursales>;

  /**
   * Verifica si existe una sucursal con el mismo nombre en la tienda
   * @param nombreSucursal Nombre de la sucursal
   * @param tiendaId ID de la tienda
   * @param excludeId ID a excluir (para actualizaciones)
   * @returns Promise<boolean> True si existe, false si no
   */
  existeConNombre(nombreSucursal: string, tiendaId: string, excludeId?: string): Promise<boolean>;

  /**
   * Verifica si existe una sucursal con la misma dirección en la tienda
   * @param direccion Dirección de la sucursal
   * @param tiendaId ID de la tienda
   * @param excludeId ID a excluir (para actualizaciones)
   * @returns Promise<boolean> True si existe, false si no
   */
  existeConDireccion(direccion: any, tiendaId: string, excludeId?: string): Promise<boolean>;

  /**
   * Cuenta el número de sucursales activas por tienda
   * @param tiendaId ID de la tienda
   * @returns Promise<number> Número de sucursales activas
   */
  contarSucursalesActivas(tiendaId: string): Promise<number>;

  /**
   * Encuentra sucursales por responsable
   * @param tiendaId ID de la tienda
   * @param responsable Email del responsable
   * @returns Promise<ConfiguracionSucursales[]> Lista de configuraciones
   */
  encontrarPorResponsable(tiendaId: string, responsable: string): Promise<ConfiguracionSucursales[]>;
}