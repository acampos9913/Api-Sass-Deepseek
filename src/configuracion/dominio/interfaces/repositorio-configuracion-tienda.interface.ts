import { ConfiguracionTienda, Moneda, ConfiguracionImpuestos, DireccionTienda, ContactoTienda, ConfiguracionEnvio, ConfiguracionPagos, ConfiguracionGeneral, ConfiguracionFacturacion } from '../entidades/configuracion-tienda.entity';

/**
 * Interfaz del repositorio de configuración de tienda que define las operaciones de persistencia
 * Sigue el principio de inversión de dependencias de la Arquitectura Limpia
 */
export interface RepositorioConfiguracionTienda {
  /**
   * Crea una nueva configuración de tienda en el sistema
   */
  crear(configuracion: {
    id: string;
    nombreTienda: string;
    descripcionTienda: string | null;
    moneda: Moneda;
    impuestos: ConfiguracionImpuestos;
    direccion: DireccionTienda;
    contacto: ContactoTienda;
    configuracionEnvio: ConfiguracionEnvio;
    configuracionPagos: ConfiguracionPagos;
    configuracionGeneral: ConfiguracionGeneral;
    configuracionFacturacion: ConfiguracionFacturacion;
    fechaCreacion: Date;
    fechaActualizacion: Date;
  }): Promise<void>;

  /**
   * Busca la configuración de tienda por su ID único
   */
  buscarPorId(id: string): Promise<{
    id: string;
    nombreTienda: string;
    descripcionTienda: string | null;
    moneda: Moneda;
    impuestos: ConfiguracionImpuestos;
    direccion: DireccionTienda;
    contacto: ContactoTienda;
    configuracionEnvio: ConfiguracionEnvio;
    configuracionPagos: ConfiguracionPagos;
    configuracionGeneral: ConfiguracionGeneral;
    configuracionFacturacion: ConfiguracionFacturacion;
    fechaCreacion: Date;
    fechaActualizacion: Date;
  } | null>;

  /**
   * Obtiene la configuración activa de la tienda
   */
  obtenerConfiguracionActiva(): Promise<{
    id: string;
    nombreTienda: string;
    descripcionTienda: string | null;
    moneda: Moneda;
    impuestos: ConfiguracionImpuestos;
    direccion: DireccionTienda;
    contacto: ContactoTienda;
    configuracionEnvio: ConfiguracionEnvio;
    configuracionPagos: ConfiguracionPagos;
    configuracionGeneral: ConfiguracionGeneral;
    configuracionFacturacion: ConfiguracionFacturacion;
    fechaCreacion: Date;
    fechaActualizacion: Date;
  } | null>;

  /**
   * Actualiza la información de configuración de tienda existente
   */
  actualizar(
    id: string,
    datos: {
      nombreTienda?: string;
      descripcionTienda?: string | null;
      moneda?: Moneda;
      impuestos?: ConfiguracionImpuestos;
      direccion?: DireccionTienda;
      contacto?: ContactoTienda;
      configuracionEnvio?: ConfiguracionEnvio;
      configuracionPagos?: ConfiguracionPagos;
      configuracionGeneral?: ConfiguracionGeneral;
      configuracionFacturacion?: ConfiguracionFacturacion;
      fechaActualizacion: Date;
    },
  ): Promise<void>;

  /**
   * Elimina una configuración de tienda del sistema
   */
  eliminar(id: string): Promise<void>;

  /**
   * Activa una configuración específica como la configuración activa de la tienda
   */
  activarConfiguracion(id: string): Promise<void>;

  /**
   * Obtiene el historial de configuraciones de la tienda
   */
  obtenerHistorial(filtros: {
    pagina: number;
    limite: number;
  }): Promise<{
    configuraciones: Array<{
      id: string;
      nombreTienda: string;
      fechaCreacion: Date;
      fechaActualizacion: Date;
      activa: boolean;
    }>;
    total: number;
  }>;

  /**
   * Verifica si existe una configuración con el mismo nombre
   */
  existeNombre(nombre: string, idExcluir?: string): Promise<boolean>;

  /**
   * Obtiene estadísticas de configuraciones
   */
  obtenerEstadisticas(): Promise<{
    totalConfiguraciones: number;
    configuracionActiva: string | null;
    ultimaActualizacion: Date | null;
  }>;

  /**
   * Restaura una configuración anterior como la configuración activa
   */
  restaurarConfiguracion(id: string): Promise<void>;

  /**
   * Obtiene la configuración por defecto del sistema
   */
  obtenerConfiguracionPorDefecto(): Promise<{
    nombreTienda: string;
    moneda: Moneda;
    impuestos: ConfiguracionImpuestos;
    direccion: DireccionTienda;
    contacto: ContactoTienda;
    configuracionEnvio: ConfiguracionEnvio;
    configuracionPagos: ConfiguracionPagos;
    configuracionGeneral: ConfiguracionGeneral;
    configuracionFacturacion: ConfiguracionFacturacion;
  }>;
}