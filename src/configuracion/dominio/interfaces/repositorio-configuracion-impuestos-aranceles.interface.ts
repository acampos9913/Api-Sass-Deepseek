import { ConfiguracionImpuestosAranceles } from '../entidades/configuracion-impuestos-aranceles.entity';
import { 
  ServicioFiscal, 
  TipoImpuesto,
  CriteriosBusquedaImpuestosArancelesDto 
} from '../../aplicacion/dto/configuracion-impuestos-aranceles.dto';

export interface RepositorioConfiguracionImpuestosAranceles {
  // Operaciones básicas CRUD
  buscarPorTiendaId(tiendaId: string): Promise<ConfiguracionImpuestosAranceles | null>;
  guardar(configuracion: ConfiguracionImpuestosAranceles): Promise<void>;
  actualizar(configuracion: ConfiguracionImpuestosAranceles): Promise<void>;
  eliminarPorTiendaId(tiendaId: string): Promise<void>;
  existePorTiendaId(tiendaId: string): Promise<boolean>;

  // Búsquedas específicas por criterios
  buscarPorServicioFiscal(servicioFiscal: ServicioFiscal): Promise<ConfiguracionImpuestosAranceles[]>;
  buscarPorTipoImpuesto(tipoImpuesto: TipoImpuesto): Promise<ConfiguracionImpuestosAranceles[]>;
  buscarPorPais(pais: string): Promise<ConfiguracionImpuestosAranceles[]>;
  buscarConArancelCheckoutActivo(): Promise<ConfiguracionImpuestosAranceles[]>;
  buscarConDdpDisponible(): Promise<ConfiguracionImpuestosAranceles[]>;
  buscarConIvaDigitalesActivo(): Promise<ConfiguracionImpuestosAranceles[]>;
  buscarPorCriterios(criterios: CriteriosBusquedaImpuestosArancelesDto): Promise<ConfiguracionImpuestosAranceles[]>;

  // Operaciones específicas de actualización
  actualizarServicioFiscal(tiendaId: string, servicioFiscal: ServicioFiscal): Promise<void>;
  actualizarTasaEstandar(tiendaId: string, tasaEstandar: number): Promise<void>;
  actualizarIncluirEnPrecio(tiendaId: string, incluir: boolean): Promise<void>;
  actualizarArancelCheckout(tiendaId: string, activo: boolean): Promise<void>;
  actualizarDdpDisponible(tiendaId: string, disponible: boolean): Promise<void>;
  actualizarImpuestoEnvios(tiendaId: string, activo: boolean): Promise<void>;
  actualizarIvaDigitales(tiendaId: string, activo: boolean): Promise<void>;

  // Operaciones de regiones fiscales
  agregarRegionFiscal(tiendaId: string, region: any): Promise<void>;
  actualizarRegionFiscal(tiendaId: string, pais: string, estadoRegion: string, nuevaRegion: any): Promise<void>;
  removerRegionFiscal(tiendaId: string, pais: string, estadoRegion: string): Promise<void>;

  // Operaciones de tasas reducidas
  agregarTasaReducida(tiendaId: string, tasa: any): Promise<void>;
  actualizarTasaReducida(tiendaId: string, descripcion: string, nuevaTasa: any): Promise<void>;
  removerTasaReducida(tiendaId: string, descripcion: string): Promise<void>;

  // Operaciones de tarifas de arancel
  agregarTarifaArancel(tiendaId: string, tarifa: any): Promise<void>;
  actualizarTarifaArancel(tiendaId: string, index: number, nuevaTarifa: any): Promise<void>;
  removerTarifaArancel(tiendaId: string, index: number): Promise<void>;

  // Operaciones de códigos aduaneros
  agregarCodigoAduanero(tiendaId: string, codigo: any): Promise<void>;
  actualizarCodigoAduanero(tiendaId: string, codigoSa: string, nuevoCodigo: any): Promise<void>;
  removerCodigoAduanero(tiendaId: string, codigoSa: string): Promise<void>;

  // Validaciones y verificaciones
  validarRegionFiscalExistente(tiendaId: string, pais: string, estadoRegion: string): Promise<boolean>;
  validarCodigoSaExistente(tiendaId: string, codigoSa: string): Promise<boolean>;
  validarTasaReducidaExistente(tiendaId: string, descripcion: string): Promise<boolean>;

  // Operaciones de estadísticas y reportes
  obtenerEstadisticas(): Promise<{
    totalConfiguraciones: number;
    shopifyTax: number;
    manual: number;
    basicTax: number;
    conArancelCheckout: number;
    conDdpDisponible: number;
    conIvaDigitales: number;
    regionesFiscalesPromedio: number;
  }>;

  obtenerEstadisticasPorPais(): Promise<Array<{
    pais: string;
    totalConfiguraciones: number;
    tasaPromedio: number;
  }>>;

  obtenerEstadisticasPorTipoImpuesto(): Promise<Array<{
    tipoImpuesto: TipoImpuesto;
    totalConfiguraciones: number;
    paises: string[];
  }>>;

  // Operaciones de backup y restauración
  realizarBackup(): Promise<any>;
  restaurarDesdeBackup(backup: any): Promise<void>;

  // Operaciones de sincronización
  sincronizarConSistemaExterno(tiendaId: string): Promise<void>;

  // Operaciones de validación e integridad
  validarIntegridad(tiendaId: string): Promise<boolean>;
  obtenerHistorialCambios(tiendaId: string): Promise<any[]>;

  // Operaciones de mantenimiento
  limpiarConfiguracionesObsoletas(): Promise<void>;
  migrarConfiguracion(tiendaId: string, versionAnterior: string, versionNueva: string): Promise<void>;

  // Operaciones de auditoría
  obtenerConfiguracionesConProblemas(): Promise<ConfiguracionImpuestosAranceles[]>;
  obtenerConfiguracionesSinRegionesFiscales(): Promise<ConfiguracionImpuestosAranceles[]>;
  obtenerConfiguracionesConTasasInconsistentes(): Promise<ConfiguracionImpuestosAranceles[]>;

  // Operaciones de búsqueda avanzada
  buscarConfiguracionesPorRangoTasa(min: number, max: number): Promise<ConfiguracionImpuestosAranceles[]>;
  buscarConfiguracionesConTasasReducidas(): Promise<ConfiguracionImpuestosAranceles[]>;
  buscarConfiguracionesConCodigosAduaneros(): Promise<ConfiguracionImpuestosAranceles[]>;
  buscarConfiguracionesConTarifasArancel(): Promise<ConfiguracionImpuestosAranceles[]>;

  // Operaciones de validación de negocio
  validarCompatibilidadServicioFiscal(tiendaId: string, servicioFiscal: ServicioFiscal): Promise<boolean>;
  validarCompatibilidadRegionFiscal(tiendaId: string, pais: string, estadoRegion: string): Promise<boolean>;
  validarCompatibilidadTasaReducida(tiendaId: string, porcentaje: number): Promise<boolean>;
  validarCompatibilidadCodigoAduanero(tiendaId: string, codigoSa: string): Promise<boolean>;

  // Operaciones de cálculo
  calcularImpuestoParaOrden(tiendaId: string, monto: number, pais: string, estadoRegion: string): Promise<number>;
  calcularArancelParaProducto(tiendaId: string, productoId: string, paisDestino: string): Promise<number>;
  obtenerTasasAplicables(tiendaId: string, pais: string, estadoRegion: string): Promise<{
    tasaEstandar: number;
    tasasReducidas: Array<{ descripcion: string; porcentaje: number }>;
  }>;

  // Operaciones de exportación e importación
  exportarConfiguracion(tiendaId: string): Promise<any>;
  importarConfiguracion(tiendaId: string, datos: any): Promise<void>;

  // Operaciones de optimización
  optimizarConsultasFiscales(): Promise<void>;
  reindexarConfiguraciones(): Promise<void>;

  // Operaciones de monitoreo
  obtenerMetricasRendimiento(): Promise<{
    consultasPorSegundo: number;
    tiempoRespuestaPromedio: number;
    configuracionesActivas: number;
    erroresRecientes: number;
  }>;

  // Operaciones de notificación
  notificarCambiosFiscales(tiendaId: string, cambios: any): Promise<void>;
  obtenerNotificacionesPendientes(tiendaId: string): Promise<any[]>;
}