import { TipoDescuento } from '../enums/tipo-descuento.enum';

/**
 * Interfaz del repositorio de descuento que define las operaciones de persistencia
 * Sigue el principio de inversión de dependencias de la Arquitectura Limpia
 */
export interface RepositorioDescuento {
  /**
   * Crea un nuevo descuento en el sistema
   */
  crear(descuento: {
    id: string;
    codigo: string;
    tipo: TipoDescuento;
    valor: number;
    valorMinimo: number | null;
    usosMaximos: number | null;
    usosActuales: number;
    fechaInicio: Date | null;
    fechaFin: Date | null;
    activo: boolean;
    fechaCreacion: Date;
    fechaActualizacion: Date;
    // Nuevos campos para descuentos avanzados
    configuracionAvanzada?: Record<string, any> | null;
    reglasValidacion?: Record<string, any> | null;
    restricciones?: Record<string, any> | null;
    nombreCampana?: string | null;
    utmSource?: string | null;
    utmMedium?: string | null;
    utmCampaign?: string | null;
    cantidadLleva?: number | null;
    cantidadPaga?: number | null;
    productosAplicables?: string[];
    coleccionesAplicables?: string[];
    paisesPermitidos?: string[];
    segmentosPermitidos?: string[];
    requisitosMinimos?: Record<string, any> | null;
  }): Promise<void>;

  /**
   * Busca un descuento por su ID único
   */
  buscarPorId(id: string): Promise<{
    id: string;
    codigo: string;
    tipo: TipoDescuento;
    valor: number;
    valorMinimo: number | null;
    usosMaximos: number | null;
    usosActuales: number;
    fechaInicio: Date | null;
    fechaFin: Date | null;
    activo: boolean;
    fechaCreacion: Date;
    fechaActualizacion: Date;
    // Nuevos campos para descuentos avanzados
    configuracionAvanzada: Record<string, any> | null;
    reglasValidacion: Record<string, any> | null;
    restricciones: Record<string, any> | null;
    nombreCampana: string | null;
    utmSource: string | null;
    utmMedium: string | null;
    utmCampaign: string | null;
    cantidadLleva: number | null;
    cantidadPaga: number | null;
    productosAplicables: string[];
    coleccionesAplicables: string[];
    paisesPermitidos: string[];
    segmentosPermitidos: string[];
    requisitosMinimos: Record<string, any> | null;
  } | null>;

  /**
   * Busca un descuento por su código
   */
  buscarPorCodigo(codigo: string): Promise<{
    id: string;
    codigo: string;
    tipo: TipoDescuento;
    valor: number;
    valorMinimo: number | null;
    usosMaximos: number | null;
    usosActuales: number;
    fechaInicio: Date | null;
    fechaFin: Date | null;
    activo: boolean;
    fechaCreacion: Date;
    fechaActualizacion: Date;
  } | null>;

  /**
   * Lista todos los descuentos con paginación y filtros
   */
  listar(filtros: {
    pagina: number;
    limite: number;
    activo?: boolean;
    tipo?: TipoDescuento;
    busqueda?: string;
  }): Promise<{
    descuentos: Array<{
      id: string;
      codigo: string;
      tipo: TipoDescuento;
      valor: number;
      valorMinimo: number | null;
      usosMaximos: number | null;
      usosActuales: number;
      fechaInicio: Date | null;
      fechaFin: Date | null;
      activo: boolean;
      fechaCreacion: Date;
      fechaActualizacion: Date;
    }>;
    total: number;
  }>;

  /**
   * Actualiza la información de un descuento existente
   */
  actualizar(
    id: string,
    datos: {
      codigo?: string;
      tipo?: TipoDescuento;
      valor?: number;
      valorMinimo?: number | null;
      usosMaximos?: number | null;
      usosActuales?: number;
      fechaInicio?: Date | null;
      fechaFin?: Date | null;
      activo?: boolean;
      fechaActualizacion: Date;
    },
  ): Promise<void>;

  /**
   * Elimina un descuento del sistema
   */
  eliminar(id: string): Promise<void>;

  /**
   * Incrementa el contador de usos de un descuento
   */
  incrementarUsos(id: string): Promise<void>;

  /**
   * Obtiene estadísticas de descuentos
   */
  obtenerEstadisticas(): Promise<{
    totalDescuentos: number;
    descuentosActivos: number;
    descuentosInactivos: number;
    descuentosPorTipo: Record<TipoDescuento, number>;
    totalUsos: number;
  }>;

  /**
   * Verifica si un código de descuento ya existe
   */
  existeCodigo(codigo: string, idExcluir?: string): Promise<boolean>;

  /**
   * Obtiene descuentos que están próximos a expirar
   */
  obtenerProximosAExpirar(dias: number): Promise<
    Array<{
      id: string;
      codigo: string;
      tipo: TipoDescuento;
      fechaFin: Date;
      activo: boolean;
    }>
  >;

  /**
   * Obtiene descuentos con pocos usos restantes
   */
  obtenerConPocosUsosRestantes(porcentaje: number): Promise<
    Array<{
      id: string;
      codigo: string;
      tipo: TipoDescuento;
      usosActuales: number;
      usosMaximos: number;
      activo: boolean;
    }>
  >;
}