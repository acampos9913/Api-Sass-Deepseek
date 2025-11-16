import { ConfiguracionCuentasCliente } from '../entidades/configuracion-cuentas-cliente.entity';

export interface RepositorioConfiguracionCuentasCliente {
  /**
   * Busca la configuración de cuentas de cliente por ID de tienda
   */
  buscarPorTiendaId(tiendaId: string): Promise<ConfiguracionCuentasCliente | null>;

  /**
   * Guarda una nueva configuración de cuentas de cliente
   */
  guardar(configuracion: ConfiguracionCuentasCliente): Promise<void>;

  /**
   * Actualiza una configuración existente de cuentas de cliente
   */
  actualizar(configuracion: ConfiguracionCuentasCliente): Promise<void>;

  /**
   * Elimina la configuración de cuentas de cliente por ID de tienda
   */
  eliminarPorTiendaId(tiendaId: string): Promise<void>;

  /**
   * Verifica si existe configuración para una tienda
   */
  existePorTiendaId(tiendaId: string): Promise<boolean>;

  /**
   * Busca configuración por modo de cuentas
   */
  buscarPorModoCuentas(modoCuentas: string): Promise<ConfiguracionCuentasCliente[]>;

  /**
   * Busca configuración por método de autenticación
   */
  buscarPorMetodoAutenticacion(metodoAutenticacion: string): Promise<ConfiguracionCuentasCliente[]>;

  /**
   * Busca configuraciones con crédito en tienda activo
   */
  buscarConCreditoTiendaActivo(): Promise<ConfiguracionCuentasCliente[]>;

  /**
   * Busca configuraciones con devolución autoservicio activa
   */
  buscarConDevolucionAutoservicioActiva(): Promise<ConfiguracionCuentasCliente[]>;

  /**
   * Actualiza solo el modo de cuentas
   */
  actualizarModoCuentas(tiendaId: string, modoCuentas: string): Promise<void>;

  /**
   * Actualiza solo el método de autenticación
   */
  actualizarMetodoAutenticacion(tiendaId: string, metodoAutenticacion: string): Promise<void>;

  /**
   * Actualiza la visibilidad de enlaces de inicio
   */
  actualizarMostrarEnlacesInicio(tiendaId: string, mostrar: boolean): Promise<void>;

  /**
   * Agrega una app conectada
   */
  agregarAppConectada(tiendaId: string, appId: string): Promise<void>;

  /**
   * Remueve una app conectada
   */
  removerAppConectada(tiendaId: string, appId: string): Promise<void>;

  /**
   * Actualiza la personalización
   */
  actualizarPersonalizacion(tiendaId: string, activa: boolean): Promise<void>;

  /**
   * Actualiza el crédito en tienda
   */
  actualizarCreditoTienda(tiendaId: string, activo: boolean): Promise<void>;

  /**
   * Actualiza la devolución autoservicio
   */
  actualizarDevolucionAutoservicio(tiendaId: string, activa: boolean): Promise<void>;

  /**
   * Agrega una regla de devolución
   */
  agregarReglaDevolucion(tiendaId: string, regla: any): Promise<void>;

  /**
   * Remueve una regla de devolución
   */
  removerReglaDevolucion(tiendaId: string, index: number): Promise<void>;

  /**
   * Actualiza la URL de cuenta
   */
  actualizarUrlCuenta(tiendaId: string, url: string): Promise<void>;

  /**
   * Actualiza el dominio
   */
  actualizarDominio(tiendaId: string, dominio: string): Promise<void>;

  /**
   * Valida si una app está instalada en la tienda
   */
  validarAppInstalada(tiendaId: string, appId: string): Promise<boolean>;

  /**
   * Valida si un dominio existe en la tienda
   */
  validarDominioExistente(tiendaId: string, dominio: string): Promise<boolean>;

  /**
   * Obtiene estadísticas de configuraciones
   */
  obtenerEstadisticas(): Promise<{
    totalConfiguraciones: number;
    modoRecomendado: number;
    modoClasico: number;
    codigoUnicoUso: number;
    contrasena: number;
    creditoTiendaActivo: number;
    devolucionAutoservicioActiva: number;
  }>;

  /**
   * Busca configuraciones por múltiples criterios
   */
  buscarPorCriterios(criterios: {
    modoCuentas?: string;
    metodoAutenticacion?: string;
    creditoTienda?: boolean;
    devolucionAutoservicio?: boolean;
    personalizacion?: boolean;
  }): Promise<ConfiguracionCuentasCliente[]>;

  /**
   * Realiza backup de configuraciones
   */
  realizarBackup(): Promise<any>;

  /**
   * Restaura configuraciones desde backup
   */
  restaurarDesdeBackup(backup: any): Promise<void>;

  /**
   * Sincroniza configuraciones con sistema externo
   */
  sincronizarConSistemaExterno(tiendaId: string): Promise<void>;

  /**
   * Valida la integridad de la configuración
   */
  validarIntegridad(tiendaId: string): Promise<boolean>;

  /**
   * Obtiene historial de cambios
   */
  obtenerHistorialCambios(tiendaId: string): Promise<any[]>;

  /**
   * Limpia configuraciones obsoletas
   */
  limpiarConfiguracionesObsoletas(): Promise<void>;

  /**
   * Migra configuración a nueva versión
   */
  migrarConfiguracion(tiendaId: string, versionAnterior: string, versionNueva: string): Promise<void>;
}