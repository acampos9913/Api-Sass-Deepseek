/**
 * Interfaz del repositorio de cliente que define las operaciones de persistencia
 * Sigue el principio de inversión de dependencias de la Arquitectura Limpia
 */
export interface RepositorioCliente {
  /**
   * Crea un nuevo cliente en el sistema
   */
  crear(cliente: {
    id: string;
    email: string;
    nombreCompleto: string;
    telefono: string | null;
    activo: boolean;
    fechaCreacion: Date;
    fechaActualizacion: Date;
    creadorId: string;
    totalGastado: number;
    totalOrdenes: number;
    fechaUltimaOrden: Date | null;
    tags: string[];
    notas: string | null;
    aceptaMarketing: boolean;
    fuenteCliente: string;
  }): Promise<void>;

  /**
   * Busca un cliente por su ID único
   */
  buscarPorId(id: string): Promise<{
    id: string;
    email: string;
    nombreCompleto: string;
    telefono: string | null;
    activo: boolean;
    fechaCreacion: Date;
    fechaActualizacion: Date;
    creadorId: string;
    totalGastado: number;
    totalOrdenes: number;
    fechaUltimaOrden: Date | null;
    tags: string[];
    notas: string | null;
    aceptaMarketing: boolean;
    fuenteCliente: string;
  } | null>;

  /**
   * Busca un cliente por su email
   */
  buscarPorEmail(email: string): Promise<{
    id: string;
    email: string;
    nombreCompleto: string;
    telefono: string | null;
    activo: boolean;
    fechaCreacion: Date;
    fechaActualizacion: Date;
    creadorId: string;
    totalGastado: number;
    totalOrdenes: number;
    fechaUltimaOrden: Date | null;
    tags: string[];
    notas: string | null;
    aceptaMarketing: boolean;
    fuenteCliente: string;
  } | null>;

  /**
   * Lista todos los clientes con paginación y filtros avanzados
   */
  listar(filtros: {
    pagina: number;
    limite: number;
    activo?: boolean;
    busqueda?: string;
    tags?: string[];
    fuenteCliente?: string;
    aceptaMarketing?: boolean;
    totalGastadoMinimo?: number;
    totalGastadoMaximo?: number;
    totalOrdenesMinimo?: number;
    totalOrdenesMaximo?: number;
    fechaCreacionDesde?: Date;
    fechaCreacionHasta?: Date;
    fechaUltimaOrdenDesde?: Date;
    fechaUltimaOrdenHasta?: Date;
    ordenarPor?: string;
    orden?: 'asc' | 'desc';
  }): Promise<{
    clientes: Array<{
      id: string;
      email: string;
      nombreCompleto: string;
      telefono: string | null;
      activo: boolean;
      fechaCreacion: Date;
      fechaActualizacion: Date;
      creadorId: string;
      totalGastado: number;
      totalOrdenes: number;
      fechaUltimaOrden: Date | null;
      tags: string[];
      notas: string | null;
      aceptaMarketing: boolean;
      fuenteCliente: string;
    }>;
    total: number;
  }>;

  /**
   * Actualiza la información de un cliente existente
   */
  actualizar(
    id: string,
    datos: {
      nombreCompleto?: string;
      telefono?: string | null;
      activo?: boolean;
      fechaActualizacion: Date;
      totalGastado?: number;
      totalOrdenes?: number;
      fechaUltimaOrden?: Date | null;
      tags?: string[];
      notas?: string | null;
      aceptaMarketing?: boolean;
      fuenteCliente?: string;
    },
  ): Promise<void>;

  /**
   * Elimina un cliente del sistema
   */
  eliminar(id: string): Promise<void>;

  /**
   * Obtiene estadísticas avanzadas de clientes
   */
  obtenerEstadisticas(): Promise<{
    totalClientes: number;
    clientesActivos: number;
    clientesInactivos: number;
    clientesNuevosHoy: number;
    totalGastado: number;
    promedioGastoPorCliente: number;
    clientesConOrdenes: number;
    clientesSinOrdenes: number;
    clientesFrecuentes: number;
    clientesValiosos: number;
    aceptanMarketing: number;
  }>;

  /**
   * Exporta clientes a CSV con filtros avanzados
   */
  exportarCSV(filtros?: {
    activo?: boolean;
    tags?: string[];
    fuenteCliente?: string;
    aceptaMarketing?: boolean;
    totalGastadoMinimo?: number;
    totalGastadoMaximo?: number;
    totalOrdenesMinimo?: number;
    totalOrdenesMaximo?: number;
    fechaCreacionDesde?: Date;
    fechaCreacionHasta?: Date;
  }): Promise<string>;

  /**
   * Importa clientes desde CSV
   */
  importarCSV(csvData: string, creadorId: string): Promise<{
    exitosos: number;
    fallidos: number;
    errores: Array<{ linea: number; error: string }>;
  }>;

  /**
   * Obtiene segmentos de clientes
   */
  obtenerSegmentos(): Promise<Array<{
    id: string;
    nombre: string;
    descripcion: string;
    tipo: string;
    reglas: any;
    activo: boolean;
    fechaCreacion: Date;
    fechaActualizacion: Date;
    tiendaId: string | null;
    creadorId: string;
  }>>;

  /**
   * Aplica segmentos automáticos a clientes
   */
  aplicarSegmentosAutomaticos(): Promise<{
    clientesActualizados: number;
    segmentosAplicados: number;
  }>;
}