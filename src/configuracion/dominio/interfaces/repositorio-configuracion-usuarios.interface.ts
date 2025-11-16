import { TipoMetodoAutenticacion } from '../enums/tipo-metodo-autenticacion.enum';

/**
 * Interfaz para el repositorio de configuración de usuarios
 */
export interface RepositorioConfiguracionUsuarios {
  /**
   * Obtiene la configuración de usuarios para una tienda
   */
  obtenerConfiguracion(tiendaId: string): Promise<{
    modoCuentas: 'recomendado' | 'clasico';
    metodoAutenticacion: 'codigo_unico' | 'contrasena';
    mostrarEnlacesInicioSesion: boolean;
    appsConectadas: string[];
    personalizacionActiva: boolean;
    creditoTienda: boolean;
    devolucionAutoservicio: boolean;
    reglasDevolucion: Array<{
      condicion: string;
      limite: number;
      aplicable: boolean;
    }>;
    urlCuenta: string;
    dominioPersonalizado?: string;
    metodosAutenticacion?: Array<{
      tipo: TipoMetodoAutenticacion;
      habilitado: boolean;
      configuracion?: any;
    }>;
  }>;

  /**
   * Actualiza la configuración de usuarios
   */
  actualizarConfiguracion(
    tiendaId: string,
    datos: {
      modoCuentas?: 'recomendado' | 'clasico';
      metodoAutenticacion?: 'codigo_unico' | 'contrasena';
      mostrarEnlacesInicioSesion?: boolean;
      appsConectadas?: string[];
      personalizacionActiva?: boolean;
      creditoTienda?: boolean;
      devolucionAutoservicio?: boolean;
      reglasDevolucion?: Array<{
        condicion: string;
        limite: number;
        aplicable: boolean;
      }>;
      urlCuenta?: string;
      dominioPersonalizado?: string;
      metodosAutenticacion?: Array<{
        tipo: TipoMetodoAutenticacion;
        habilitado: boolean;
        configuracion?: any;
      }>;
    },
  ): Promise<void>;

  /**
   * Agrega una app conectada
   */
  agregarAppConectada(tiendaId: string, appId: string): Promise<void>;

  /**
   * Elimina una app conectada
   */
  eliminarAppConectada(tiendaId: string, appId: string): Promise<void>;

  /**
   * Verifica si una app está conectada
   */
  existeAppConectada(tiendaId: string, appId: string): Promise<boolean>;

  /**
   * Obtiene todas las apps conectadas
   */
  obtenerAppsConectadas(tiendaId: string): Promise<string[]>;

  /**
   * Agrega una regla de devolución
   */
  agregarReglaDevolucion(
    tiendaId: string,
    regla: {
      condicion: string;
      limite: number;
      aplicable: boolean;
    },
  ): Promise<void>;

  /**
   * Actualiza una regla de devolución
   */
  actualizarReglaDevolucion(
    tiendaId: string,
    reglaId: string,
    datos: {
      condicion?: string;
      limite?: number;
      aplicable?: boolean;
    },
  ): Promise<void>;

  /**
   * Elimina una regla de devolución
   */
  eliminarReglaDevolucion(tiendaId: string, reglaId: string): Promise<void>;

  /**
   * Obtiene todas las reglas de devolución
   */
  obtenerReglasDevolucion(tiendaId: string): Promise<Array<{
    id: string;
    condicion: string;
    limite: number;
    aplicable: boolean;
  }>>;

  /**
   * Verifica si una regla de devolución existe
   */
  existeReglaDevolucion(tiendaId: string, condicion: string): Promise<boolean>;

  /**
   * Obtiene la configuración de autenticación
   */
  obtenerConfiguracionAutenticacion(tiendaId: string): Promise<{
    modoCuentas: 'recomendado' | 'clasico';
    metodoAutenticacion: 'codigo_unico' | 'contrasena';
    mostrarEnlacesInicioSesion: boolean;
    metodosAutenticacion: Array<{
      tipo: TipoMetodoAutenticacion;
      habilitado: boolean;
      configuracion?: any;
    }>;
  }>;

  /**
   * Actualiza la configuración de autenticación
   */
  actualizarConfiguracionAutenticacion(
    tiendaId: string,
    datos: {
      modoCuentas?: 'recomendado' | 'clasico';
      metodoAutenticacion?: 'codigo_unico' | 'contrasena';
      mostrarEnlacesInicioSesion?: boolean;
      metodosAutenticacion?: Array<{
        tipo: TipoMetodoAutenticacion;
        habilitado: boolean;
        configuracion?: any;
      }>;
    },
  ): Promise<void>;

  /**
   * Agrega un método de autenticación
   */
  agregarMetodoAutenticacion(
    tiendaId: string,
    metodo: {
      tipo: TipoMetodoAutenticacion;
      habilitado: boolean;
      configuracion?: any;
    },
  ): Promise<void>;

  /**
   * Actualiza un método de autenticación
   */
  actualizarMetodoAutenticacion(
    tiendaId: string,
    metodoId: string,
    datos: {
      habilitado?: boolean;
      configuracion?: any;
    },
  ): Promise<void>;

  /**
   * Elimina un método de autenticación
   */
  eliminarMetodoAutenticacion(tiendaId: string, metodoId: string): Promise<void>;

  /**
   * Obtiene todos los métodos de autenticación
   */
  obtenerMetodosAutenticacion(tiendaId: string): Promise<Array<{
    id: string;
    tipo: TipoMetodoAutenticacion;
    habilitado: boolean;
    configuracion?: any;
  }>>;

  /**
   * Verifica si un método de autenticación existe
   */
  existeMetodoAutenticacion(tiendaId: string, tipo: TipoMetodoAutenticacion): Promise<boolean>;

  /**
   * Obtiene la configuración de crédito en tienda
   */
  obtenerConfiguracionCredito(tiendaId: string): Promise<{
    creditoTienda: boolean;
    reglasCredito: Array<{
      condicion: string;
      montoMaximo: number;
      aplicable: boolean;
    }>;
  }>;

  /**
   * Actualiza la configuración de crédito en tienda
   */
  actualizarConfiguracionCredito(
    tiendaId: string,
    datos: {
      creditoTienda?: boolean;
      reglasCredito?: Array<{
        condicion: string;
        montoMaximo: number;
        aplicable: boolean;
      }>;
    },
  ): Promise<void>;

  /**
   * Agrega una regla de crédito
   */
  agregarReglaCredito(
    tiendaId: string,
    regla: {
      condicion: string;
      montoMaximo: number;
      aplicable: boolean;
    },
  ): Promise<void>;

  /**
   * Actualiza una regla de crédito
   */
  actualizarReglaCredito(
    tiendaId: string,
    reglaId: string,
    datos: {
      condicion?: string;
      montoMaximo?: number;
      aplicable?: boolean;
    },
  ): Promise<void>;

  /**
   * Elimina una regla de crédito
   */
  eliminarReglaCredito(tiendaId: string, reglaId: string): Promise<void>;

  /**
   * Obtiene todas las reglas de crédito
   */
  obtenerReglasCredito(tiendaId: string): Promise<Array<{
    id: string;
    condicion: string;
    montoMaximo: number;
    aplicable: boolean;
  }>>;

  /**
   * Verifica si una regla de crédito existe
   */
  existeReglaCredito(tiendaId: string, condicion: string): Promise<boolean>;

  /**
   * Obtiene la configuración de usuarios por defecto
   */
  obtenerConfiguracionPorDefecto(): {
    modoCuentas: 'recomendado';
    metodoAutenticacion: 'codigo_unico';
    mostrarEnlacesInicioSesion: true;
    appsConectadas: [];
    personalizacionActiva: false;
    creditoTienda: false;
    devolucionAutoservicio: false;
    reglasDevolucion: [];
    urlCuenta: '';
    metodosAutenticacion: Array<{
      tipo: TipoMetodoAutenticacion;
      habilitado: boolean;
      configuracion?: any;
    }>;
  };
}