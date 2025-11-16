import { ConfiguracionEnvioEntrega } from '../entidades/configuracion-envio-entrega.entity';
import { 
  PerfilEnvioDto,
  MetodoEntregaDto,
  EmbalajeDto,
  ProveedorTransporteDto,
  PlantillaDocumentacionDto,
  TipoEntregaEnum 
} from '../../aplicacion/dto/configuracion-envio-entrega.dto';

/**
 * Interfaz del repositorio para Configuración de Envío y Entrega
 * Define los contratos para operaciones de persistencia siguiendo el patrón Repository
 */
export interface RepositorioConfiguracionEnvioEntrega {
  
  /**
   * Encontrar configuración de envío y entrega por ID de tienda
   * @param tiendaId ID de la tienda
   * @returns Promise<ConfiguracionEnvioEntrega | null>
   */
  encontrarPorTiendaId(tiendaId: string): Promise<ConfiguracionEnvioEntrega | null>;

  /**
   * Guardar configuración de envío y entrega
   * @param configuracion Configuración a guardar
   * @returns Promise<ConfiguracionEnvioEntrega>
   */
  guardar(configuracion: ConfiguracionEnvioEntrega): Promise<ConfiguracionEnvioEntrega>;

  /**
   * Actualizar configuración de envío y entrega
   * @param configuracion Configuración actualizada
   * @returns Promise<ConfiguracionEnvioEntrega>
   */
  actualizar(configuracion: ConfiguracionEnvioEntrega): Promise<ConfiguracionEnvioEntrega>;

  /**
   * Eliminar configuración de envío y entrega por ID de tienda
   * @param tiendaId ID de la tienda
   * @returns Promise<void>
   */
  eliminarPorTiendaId(tiendaId: string): Promise<void>;

  /**
   * Verificar existencia de configuración por ID de tienda
   * @param tiendaId ID de la tienda
   * @returns Promise<boolean>
   */
  existePorTiendaId(tiendaId: string): Promise<boolean>;

  /**
   * Operaciones específicas para perfiles de envío
   */

  /**
   * Agregar perfil de envío a la configuración
   * @param tiendaId ID de la tienda
   * @param perfil Perfil de envío a agregar
   * @returns Promise<ConfiguracionEnvioEntrega>
   */
  agregarPerfilEnvio(tiendaId: string, perfil: PerfilEnvioDto): Promise<ConfiguracionEnvioEntrega>;

  /**
   * Actualizar perfil de envío existente
   * @param tiendaId ID de la tienda
   * @param idPerfil ID del perfil a actualizar
   * @param perfilActualizado Datos actualizados del perfil
   * @returns Promise<ConfiguracionEnvioEntrega>
   */
  actualizarPerfilEnvio(
    tiendaId: string, 
    idPerfil: string, 
    perfilActualizado: Partial<PerfilEnvioDto>
  ): Promise<ConfiguracionEnvioEntrega>;

  /**
   * Eliminar perfil de envío
   * @param tiendaId ID de la tienda
   * @param idPerfil ID del perfil a eliminar
   * @returns Promise<ConfiguracionEnvioEntrega>
   */
  eliminarPerfilEnvio(tiendaId: string, idPerfil: string): Promise<ConfiguracionEnvioEntrega>;

  /**
   * Encontrar perfil de envío por ID
   * @param tiendaId ID de la tienda
   * @param idPerfil ID del perfil
   * @returns Promise<PerfilEnvioDto | null>
   */
  encontrarPerfilEnvioPorId(tiendaId: string, idPerfil: string): Promise<PerfilEnvioDto | null>;

  /**
   * Operaciones específicas para métodos de entrega
   */

  /**
   * Agregar método de entrega a la configuración
   * @param tiendaId ID de la tienda
   * @param metodo Método de entrega a agregar
   * @returns Promise<ConfiguracionEnvioEntrega>
   */
  agregarMetodoEntrega(tiendaId: string, metodo: MetodoEntregaDto): Promise<ConfiguracionEnvioEntrega>;

  /**
   * Actualizar método de entrega existente
   * @param tiendaId ID de la tienda
   * @param idMetodo ID del método a actualizar
   * @param metodoActualizado Datos actualizados del método
   * @returns Promise<ConfiguracionEnvioEntrega>
   */
  actualizarMetodoEntrega(
    tiendaId: string, 
    idMetodo: string, 
    metodoActualizado: Partial<MetodoEntregaDto>
  ): Promise<ConfiguracionEnvioEntrega>;

  /**
   * Activar/desactivar método de entrega
   * @param tiendaId ID de la tienda
   * @param tipo Tipo de método de entrega
   * @param activar Estado a establecer
   * @returns Promise<ConfiguracionEnvioEntrega>
   */
  toggleMetodoEntrega(
    tiendaId: string, 
    tipo: TipoEntregaEnum, 
    activar: boolean
  ): Promise<ConfiguracionEnvioEntrega>;

  /**
   * Obtener métodos de entrega activos
   * @param tiendaId ID de la tienda
   * @returns Promise<MetodoEntregaDto[]>
   */
  obtenerMetodosEntregaActivos(tiendaId: string): Promise<MetodoEntregaDto[]>;

  /**
   * Operaciones específicas para embalajes
   */

  /**
   * Agregar embalaje a la configuración
   * @param tiendaId ID de la tienda
   * @param embalaje Embalaje a agregar
   * @returns Promise<ConfiguracionEnvioEntrega>
   */
  agregarEmbalaje(tiendaId: string, embalaje: EmbalajeDto): Promise<ConfiguracionEnvioEntrega>;

  /**
   * Actualizar embalaje existente
   * @param tiendaId ID de la tienda
   * @param idEmbalaje ID del embalaje a actualizar
   * @param embalajeActualizado Datos actualizados del embalaje
   * @returns Promise<ConfiguracionEnvioEntrega>
   */
  actualizarEmbalaje(
    tiendaId: string, 
    idEmbalaje: string, 
    embalajeActualizado: Partial<EmbalajeDto>
  ): Promise<ConfiguracionEnvioEntrega>;

  /**
   * Establecer embalaje predeterminado
   * @param tiendaId ID de la tienda
   * @param idEmbalaje ID del embalaje a establecer como predeterminado
   * @returns Promise<ConfiguracionEnvioEntrega>
   */
  establecerEmbalajePredeterminado(tiendaId: string, idEmbalaje: string): Promise<ConfiguracionEnvioEntrega>;

  /**
   * Obtener embalaje predeterminado
   * @param tiendaId ID de la tienda
   * @returns Promise<EmbalajeDto | null>
   */
  obtenerEmbalajePredeterminado(tiendaId: string): Promise<EmbalajeDto | null>;

  /**
   * Operaciones específicas para proveedores de transporte
   */

  /**
   * Agregar proveedor de transporte a la configuración
   * @param tiendaId ID de la tienda
   * @param proveedor Proveedor de transporte a agregar
   * @returns Promise<ConfiguracionEnvioEntrega>
   */
  agregarProveedorTransporte(tiendaId: string, proveedor: ProveedorTransporteDto): Promise<ConfiguracionEnvioEntrega>;

  /**
   * Actualizar proveedor de transporte existente
   * @param tiendaId ID de la tienda
   * @param idProveedor ID del proveedor a actualizar
   * @param proveedorActualizado Datos actualizados del proveedor
   * @returns Promise<ConfiguracionEnvioEntrega>
   */
  actualizarProveedorTransporte(
    tiendaId: string, 
    idProveedor: string, 
    proveedorActualizado: Partial<ProveedorTransporteDto>
  ): Promise<ConfiguracionEnvioEntrega>;

  /**
   * Activar/desactivar proveedor de transporte
   * @param tiendaId ID de la tienda
   * @param idProveedor ID del proveedor
   * @param activar Estado a establecer
   * @returns Promise<ConfiguracionEnvioEntrega>
   */
  toggleProveedorTransporte(
    tiendaId: string, 
    idProveedor: string, 
    activar: boolean
  ): Promise<ConfiguracionEnvioEntrega>;

  /**
   * Obtener proveedores de transporte activos
   * @param tiendaId ID de la tienda
   * @returns Promise<ProveedorTransporteDto[]>
   */
  obtenerProveedoresTransporteActivos(tiendaId: string): Promise<ProveedorTransporteDto[]>;

  /**
   * Operaciones específicas para plantillas de documentación
   */

  /**
   * Agregar plantilla de documentación a la configuración
   * @param tiendaId ID de la tienda
   * @param plantilla Plantilla de documentación a agregar
   * @returns Promise<ConfiguracionEnvioEntrega>
   */
  agregarPlantillaDocumentacion(tiendaId: string, plantilla: PlantillaDocumentacionDto): Promise<ConfiguracionEnvioEntrega>;

  /**
   * Actualizar plantilla de documentación existente
   * @param tiendaId ID de la tienda
   * @param idPlantilla ID de la plantilla a actualizar
   * @param plantillaActualizada Datos actualizados de la plantilla
   * @returns Promise<ConfiguracionEnvioEntrega>
   */
  actualizarPlantillaDocumentacion(
    tiendaId: string, 
    idPlantilla: string, 
    plantillaActualizada: Partial<PlantillaDocumentacionDto>
  ): Promise<ConfiguracionEnvioEntrega>;

  /**
   * Eliminar plantilla de documentación
   * @param tiendaId ID de la tienda
   * @param idPlantilla ID de la plantilla a eliminar
   * @returns Promise<ConfiguracionEnvioEntrega>
   */
  eliminarPlantillaDocumentacion(tiendaId: string, idPlantilla: string): Promise<ConfiguracionEnvioEntrega>;

  /**
   * Operaciones de consulta avanzada
   */

  /**
   * Verificar si existe perfil de envío con nombre específico
   * @param tiendaId ID de la tienda
   * @param nombrePerfil Nombre del perfil
   * @returns Promise<boolean>
   */
  existePerfilEnvioConNombre(tiendaId: string, nombrePerfil: string): Promise<boolean>;

  /**
   * Verificar si existe proveedor de transporte con nombre específico
   * @param tiendaId ID de la tienda
   * @param nombreProveedor Nombre del proveedor
   * @returns Promise<boolean>
   */
  existeProveedorTransporteConNombre(tiendaId: string, nombreProveedor: string): Promise<boolean>;

  /**
   * Verificar si existe embalaje predeterminado
   * @param tiendaId ID de la tienda
   * @returns Promise<boolean>
   */
  existeEmbalajePredeterminado(tiendaId: string): Promise<boolean>;

  /**
   * Obtener configuración completa de envío y entrega con todos los datos relacionados
   * @param tiendaId ID de la tienda
   * @returns Promise<ConfiguracionEnvioEntrega | null>
   */
  obtenerConfiguracionCompleta(tiendaId: string): Promise<ConfiguracionEnvioEntrega | null>;
}