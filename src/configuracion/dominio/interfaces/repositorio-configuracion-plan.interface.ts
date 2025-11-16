import { ConfiguracionPlan } from '../entidades/configuracion-plan.entity';
import { 
  CrearConfiguracionPlanDto,
  ActualizarConfiguracionPlanDto,
  CambiarPlanDto,
  AgregarSuscripcionDto,
  TipoPlan,
  CicloFacturacion,
  EstadoSuscripcion,
  CriteriosBusquedaPlanDto
} from '../../aplicacion/dto/configuracion-plan.dto';

/**
 * Interfaz para el repositorio de configuración de plan
 * Define las operaciones de persistencia siguiendo el patrón Repository
 */
export interface RepositorioConfiguracionPlan {
  // Operaciones básicas CRUD
  buscarPorTiendaId(tiendaId: string): Promise<ConfiguracionPlan | null>;
  buscarPorId(id: string): Promise<ConfiguracionPlan | null>;
  guardar(configuracion: ConfiguracionPlan): Promise<void>;
  actualizar(configuracion: ConfiguracionPlan): Promise<void>;
  eliminarPorTiendaId(tiendaId: string): Promise<void>;
  eliminarPorId(id: string): Promise<void>;
  existePorTiendaId(tiendaId: string): Promise<boolean>;

  // Búsquedas específicas
  buscarPorTipoPlan(tipoPlan: TipoPlan): Promise<ConfiguracionPlan[]>;
  buscarPorCicloFacturacion(cicloFacturacion: CicloFacturacion): Promise<ConfiguracionPlan[]>;
  buscarConSuscripcionesActivas(): Promise<ConfiguracionPlan[]>;
  buscarConFacturacionAnual(): Promise<ConfiguracionPlan[]>;
  buscarPorCriterios(criterios: CriteriosBusquedaPlanDto): Promise<ConfiguracionPlan[]>;

  // Operaciones específicas de actualización
  actualizarInformacionPlan(tiendaId: string, informacionPlan: any): Promise<void>;
  actualizarBeneficiosPlan(tiendaId: string, beneficiosPlan: any): Promise<void>;
  actualizarConfiguracionAdicional(tiendaId: string, configuracionAdicional: Record<string, any>): Promise<void>;

  // Operaciones de gestión de plan
  cambiarPlan(tiendaId: string, datosCambio: CambiarPlanDto): Promise<void>;
  cambiarCicloFacturacion(tiendaId: string, nuevoCiclo: CicloFacturacion): Promise<void>;
  cancelarPlan(tiendaId: string): Promise<void>;
  reactivarPlan(tiendaId: string): Promise<void>;

  // Operaciones de suscripciones adicionales
  agregarSuscripcionAdicional(tiendaId: string, suscripcion: AgregarSuscripcionDto): Promise<void>;
  actualizarSuscripcionAdicional(tiendaId: string, nombreSuscripcion: string, nuevaSuscripcion: any): Promise<void>;
  removerSuscripcionAdicional(tiendaId: string, nombreSuscripcion: string): Promise<void>;
  activarSuscripcionAdicional(tiendaId: string, nombreSuscripcion: string): Promise<void>;
  desactivarSuscripcionAdicional(tiendaId: string, nombreSuscripcion: string): Promise<void>;
  cambiarEstadoSuscripcion(tiendaId: string, nombreSuscripcion: string, nuevoEstado: EstadoSuscripcion): Promise<void>;

  // Validaciones y verificaciones
  validarPlanExistente(tiendaId: string): Promise<boolean>;
  validarSuscripcionExistente(tiendaId: string, nombreSuscripcion: string): Promise<boolean>;
  validarCompatibilidadPlan(tiendaId: string, nuevoPlan: TipoPlan): Promise<boolean>;
  validarLimitesPlan(tiendaId: string, tipoPlan: TipoPlan): Promise<boolean>;
  validarPeriodoPrueba(tiendaId: string): Promise<boolean>;

  // Estadísticas y reportes
  obtenerEstadisticas(): Promise<{
    totalConfiguraciones: number;
    starter: number;
    grow: number;
    pro: number;
    enterprise: number;
    mensual: number;
    anual: number;
    conSuscripcionesActivas: number;
    enPeriodoPrueba: number;
    ingresosMensualesEstimados: number;
  }>;
  obtenerEstadisticasPorTipoPlan(): Promise<Array<{
    tipoPlan: TipoPlan;
    totalConfiguraciones: number;
    porcentajeTotal: number;
    ingresosPromedio: number;
  }>>;
  obtenerEstadisticasPorCicloFacturacion(): Promise<Array<{
    cicloFacturacion: CicloFacturacion;
    totalConfiguraciones: number;
    porcentajeTotal: number;
  }>>;
  obtenerMetricasUso(tiendaId: string): Promise<{
    empleadosActivos: number;
    tiendasActivas: number;
    productosTotales: number;
    ordenesEsteMes: number;
    usoAlmacenamiento: number;
    limiteAlmacenamiento: number;
  }>;

  // Operaciones de backup y restauración
  realizarBackup(): Promise<any>;
  restaurarDesdeBackup(backup: any): Promise<void>;

  // Operaciones de sincronización
  sincronizarConSistemaFacturacion(tiendaId: string): Promise<void>;
  validarIntegridad(tiendaId: string): Promise<boolean>;
  obtenerHistorialCambios(tiendaId: string): Promise<any[]>;

  // Operaciones de mantenimiento
  limpiarConfiguracionesObsoletas(): Promise<void>;
  migrarPlan(tiendaId: string, versionAnterior: string, versionNueva: string): Promise<void>;
  actualizarPreciosPorInflacion(porcentajeAumento: number): Promise<void>;

  // Operaciones de diagnóstico
  obtenerConfiguracionesConProblemas(): Promise<ConfiguracionPlan[]>;
  obtenerConfiguracionesConLimitesExcedidos(): Promise<ConfiguracionPlan[]>;
  obtenerConfiguracionesConSuscripcionesVencidas(): Promise<ConfiguracionPlan[]>;
  obtenerConfiguracionesConFacturacionPendiente(): Promise<ConfiguracionPlan[]>;

  // Operaciones de búsqueda avanzada
  buscarConfiguracionesPorRangoPrecio(min: number, max: number): Promise<ConfiguracionPlan[]>;
  buscarConfiguracionesConAltoUso(): Promise<ConfiguracionPlan[]>;
  buscarConfiguracionesConBajoUso(): Promise<ConfiguracionPlan[]>;
  buscarConfiguracionesParaUpgrade(): Promise<ConfiguracionPlan[]>;

  // Validaciones de compatibilidad
  validarCompatibilidadSuscripcion(tiendaId: string, tipoPlan: TipoPlan, nombreSuscripcion: string): Promise<boolean>;
  validarCompatibilidadCicloFacturacion(tiendaId: string, cicloFacturacion: CicloFacturacion): Promise<boolean>;
  validarCompatibilidadLimites(tiendaId: string, empleadosRequeridos: number, tiendasRequeridas: number): Promise<boolean>;

  // Operaciones de cálculo
  calcularCostoTotalMensual(tiendaId: string): Promise<number>;
  calcularAhorroAnual(tiendaId: string): Promise<number>;
  calcularProyeccionCrecimiento(tiendaId: string, meses: number): Promise<{
    costoProyectado: number;
    limitesRecomendados: { empleados: number; tiendas: number };
    planRecomendado: TipoPlan;
  }>;
  obtenerRecomendacionesPlan(tiendaId: string): Promise<Array<{
    tipoPlan: TipoPlan;
    razon: string;
    beneficio: string;
    costoMensual: number;
  }>>;

  // Operaciones de exportación/importación
  exportarConfiguracion(tiendaId: string): Promise<any>;
  importarConfiguracion(tiendaId: string, datos: any): Promise<void>;

  // Operaciones de optimización
  optimizarConsultasPlan(): Promise<void>;
  reindexarConfiguraciones(): Promise<void>;

  // Operaciones de métricas
  obtenerMetricasRendimiento(): Promise<{
    consultasPorSegundo: number;
    tiempoRespuestaPromedio: number;
    configuracionesActivas: number;
    erroresRecientes: number;
  }>;

  // Operaciones de notificación
  notificarCambiosPlan(tiendaId: string, cambios: any): Promise<void>;
  obtenerNotificacionesPendientes(tiendaId: string): Promise<any[]>;

  // Operaciones de facturación
  generarFactura(tiendaId: string, periodo: string): Promise<any>;
  obtenerHistorialFacturacion(tiendaId: string): Promise<any[]>;
  validarPagoPendiente(tiendaId: string): Promise<boolean>;

  // Operaciones de soporte
  crearTicketSoporte(tiendaId: string, asunto: string, descripcion: string): Promise<void>;
  obtenerTicketsSoporte(tiendaId: string): Promise<any[]>;

  // Operaciones de migración
  migrarDatosPlanAnterior(tiendaId: string, datosAnteriores: any): Promise<void>;
  validarMigracionCompleta(tiendaId: string): Promise<boolean>;
}