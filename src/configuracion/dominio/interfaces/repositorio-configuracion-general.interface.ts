import type { ConfiguracionGeneral } from '../entidades/configuracion-general.entity';
import type {
  ConfiguracionGeneralDto,
  ActualizarConfiguracionGeneralDto,
  DireccionFacturacionDto,
  MonedaDto,
  ConfiguracionPedidosDto,
  RecursosTiendaDto,
  SistemaUnidadesEnum,
  UnidadPesoEnum,
  ProcesamientoPedidosEnum
} from '../../aplicacion/dto/configuracion-general.dto';

/**
 * Interfaz para el repositorio de configuración general
 * Define los contratos para las operaciones de persistencia
 */
export interface RepositorioConfiguracionGeneral {
  /**
   * Guardar una nueva configuración general
   */
  guardar(configuracion: ConfiguracionGeneral): Promise<ConfiguracionGeneral>;

  /**
   * Buscar configuración general por ID
   */
  buscarPorId(id: string): Promise<ConfiguracionGeneral | null>;

  /**
   * Buscar configuración general por ID de tienda
   */
  buscarPorTiendaId(tiendaId: string): Promise<ConfiguracionGeneral | null>;

  /**
   * Verificar si existe configuración general para una tienda
   */
  existePorTiendaId(tiendaId: string): Promise<boolean>;

  /**
   * Actualizar una configuración general existente
   */
  actualizar(id: string, datos: ActualizarConfiguracionGeneralDto): Promise<ConfiguracionGeneral>;

  /**
   * Eliminar una configuración general
   */
  eliminar(id: string): Promise<void>;

  /**
   * Eliminar configuración general por ID de tienda
   */
  eliminarPorTiendaId(tiendaId: string): Promise<void>;

  /**
   * Operaciones específicas de actualización
   */

  /**
   * Actualizar dirección de facturación
   */
  actualizarDireccionFacturacion(id: string, direccion: DireccionFacturacionDto): Promise<ConfiguracionGeneral>;

  /**
   * Actualizar moneda
   */
  actualizarMoneda(id: string, moneda: MonedaDto): Promise<ConfiguracionGeneral>;

  /**
   * Actualizar configuración de pedidos
   */
  actualizarConfiguracionPedidos(id: string, configuracion: ConfiguracionPedidosDto): Promise<ConfiguracionGeneral>;

  /**
   * Actualizar recursos de tienda
   */
  actualizarRecursosTienda(id: string, recursos: RecursosTiendaDto): Promise<ConfiguracionGeneral>;

  /**
   * Actualizar nombre de la tienda
   */
  actualizarNombreTienda(id: string, nombreTienda: string): Promise<ConfiguracionGeneral>;

  /**
   * Actualizar email de la tienda
   */
  actualizarEmail(id: string, email: string): Promise<ConfiguracionGeneral>;

  /**
   * Actualizar teléfono de la tienda
   */
  actualizarTelefono(id: string, telefono: string | null): Promise<ConfiguracionGeneral>;

  /**
   * Actualizar región de copia de seguridad
   */
  actualizarRegionCopiaSeguridad(id: string, region: string): Promise<ConfiguracionGeneral>;

  /**
   * Actualizar sistema de unidades
   */
  actualizarSistemaUnidades(id: string, sistemaUnidades: SistemaUnidadesEnum): Promise<ConfiguracionGeneral>;

  /**
   * Actualizar unidad de peso
   */
  actualizarUnidadPeso(id: string, unidadPeso: UnidadPesoEnum): Promise<ConfiguracionGeneral>;

  /**
   * Actualizar zona horaria
   */
  actualizarZonaHoraria(id: string, zonaHoraria: string): Promise<ConfiguracionGeneral>;

  /**
   * Operaciones de búsqueda y listado
   */

  /**
   * Listar configuraciones generales por sistema de unidades
   */
  listarPorSistemaUnidades(sistemaUnidades: SistemaUnidadesEnum): Promise<ConfiguracionGeneral[]>;

  /**
   * Listar configuraciones generales por moneda
   */
  listarPorMoneda(codigoMoneda: string): Promise<ConfiguracionGeneral[]>;

  /**
   * Listar configuraciones generales por zona horaria
   */
  listarPorZonaHoraria(zonaHoraria: string): Promise<ConfiguracionGeneral[]>;

  /**
   * Buscar configuraciones generales por término (nombre, email, etc.)
   */
  buscar(termino: string): Promise<ConfiguracionGeneral[]>;

  /**
   * Obtener estadísticas de configuraciones generales
   */
  obtenerEstadisticas(): Promise<{
    total: number;
    por_sistema_unidades: Record<SistemaUnidadesEnum, number>;
    por_unidad_peso: Record<UnidadPesoEnum, number>;
    por_moneda: Record<string, number>;
    por_zona_horaria: Record<string, number>;
  }>;

  /**
   * Validaciones de negocio
   */

  /**
   * Verificar si el nombre de la tienda está disponible
   */
  verificarNombreTiendaDisponible(nombreTienda: string, tiendaId?: string): Promise<boolean>;

  /**
   * Verificar si el email está disponible
   */
  verificarEmailDisponible(email: string, tiendaId?: string): Promise<boolean>;

  /**
   * Verificar si el teléfono está disponible
   */
  verificarTelefonoDisponible(telefono: string, tiendaId?: string): Promise<boolean>;

  /**
   * Operaciones de migración y mantenimiento
   */

  /**
   * Migrar sistema de unidades para múltiples configuraciones
   */
  migrarSistemaUnidades(
    ids: string[],
    sistemaUnidades: SistemaUnidadesEnum,
    unidadPeso: UnidadPesoEnum
  ): Promise<ConfiguracionGeneral[]>;

  /**
   * Migrar moneda para múltiples configuraciones
   */
  migrarMoneda(ids: string[], moneda: MonedaDto): Promise<ConfiguracionGeneral[]>;

  /**
   * Actualizar múltiples configuraciones
   */
  actualizarMultiple(ids: string[], datos: Partial<ActualizarConfiguracionGeneralDto>): Promise<ConfiguracionGeneral[]>;

  /**
   * Eliminar múltiples configuraciones
   */
  eliminarMultiple(ids: string[]): Promise<void>;

  /**
   * Operaciones de backup y restauración
   */

  /**
   * Crear backup de configuración general
   */
  crearBackup(id: string): Promise<string>;

  /**
   * Restaurar configuración general desde backup
   */
  restaurarDesdeBackup(id: string, backupData: string): Promise<ConfiguracionGeneral>;

  /**
   * Operaciones de auditoría
   */

  /**
   * Obtener historial de cambios de una configuración
   */
  obtenerHistorialCambios(id: string): Promise<Array<{
    fecha: Date;
    campo: string;
    valor_anterior: any;
    valor_nuevo: any;
    usuario_id?: string;
  }>>;

  /**
   * Registrar cambio en la configuración
   */
  registrarCambio(
    id: string,
    campo: string,
    valorAnterior: any,
    valorNuevo: any,
    usuarioId?: string
  ): Promise<void>;

  /**
   * Operaciones de validación de datos
   */

  /**
   * Validar formato de dirección
   */
  validarFormatoDireccion(direccion: DireccionFacturacionDto): Promise<boolean>;

  /**
   * Validar formato de moneda
   */
  validarFormatoMoneda(moneda: MonedaDto): Promise<boolean>;

  /**
   * Validar zona horaria
   */
  validarZonaHoraria(zonaHoraria: string): Promise<boolean>;

  /**
   * Operaciones de sincronización
   */

  /**
   * Sincronizar con configuración de tienda principal
   */
  sincronizarConTiendaPrincipal(id: string, tiendaId: string): Promise<ConfiguracionGeneral>;

  /**
   * Obtener diferencias con configuración de tienda principal
   */
  obtenerDiferenciasConTiendaPrincipal(id: string, tiendaId: string): Promise<{
    campos_diferentes: string[];
    valores_actuales: Record<string, any>;
    valores_principales: Record<string, any>;
  }>;
}