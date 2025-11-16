/**
 * Interfaz del repositorio de paquete que define las operaciones de persistencia
 * Sigue el principio de inversión de dependencias de la Arquitectura Limpia
 */
export interface RepositorioPaquete {
  /**
   * Crea un nuevo paquete en el sistema
   */
  crear(paquete: {
    id: string;
    nombre: string;
    descripcion: string | null;
    precio: number;
    precioComparacion: number | null;
    sku: string | null;
    activo: boolean;
    fechaCreacion: Date;
    fechaActualizacion: Date;
    tiendaId: string | null;
    creadorId: string;
    items: Array<{
      productoId: string;
      varianteId: string | null;
      cantidad: number;
      precioUnitario: number | null;
    }>;
  }): Promise<void>;

  /**
   * Busca un paquete por su ID único
   */
  buscarPorId(id: string): Promise<{
    id: string;
    nombre: string;
    descripcion: string | null;
    precio: number;
    precioComparacion: number | null;
    sku: string | null;
    activo: boolean;
    fechaCreacion: Date;
    fechaActualizacion: Date;
    tiendaId: string | null;
    creadorId: string;
    items: Array<{
      id: string;
      productoId: string;
      varianteId: string | null;
      cantidad: number;
      precioUnitario: number | null;
    }>;
  } | null>;

  /**
   * Busca un paquete por su SKU
   */
  buscarPorSku(sku: string): Promise<{
    id: string;
    nombre: string;
    descripcion: string | null;
    precio: number;
    precioComparacion: number | null;
    sku: string | null;
    activo: boolean;
    fechaCreacion: Date;
    fechaActualizacion: Date;
    tiendaId: string | null;
    creadorId: string;
    items: Array<{
      id: string;
      productoId: string;
      varianteId: string | null;
      cantidad: number;
      precioUnitario: number | null;
    }>;
  } | null>;

  /**
   * Lista todos los paquetes con paginación y filtros
   */
  listar(filtros: {
    pagina: number;
    limite: number;
    activo?: boolean;
    busqueda?: string;
    tiendaId?: string;
    ordenarPor?: string;
    orden?: 'asc' | 'desc';
  }): Promise<{
    paquetes: Array<{
      id: string;
      nombre: string;
      descripcion: string | null;
      precio: number;
      precioComparacion: number | null;
      sku: string | null;
      activo: boolean;
      fechaCreacion: Date;
      fechaActualizacion: Date;
      tiendaId: string | null;
      creadorId: string;
      items: Array<{
        id: string;
        productoId: string;
        varianteId: string | null;
        cantidad: number;
        precioUnitario: number | null;
      }>;
    }>;
    total: number;
  }>;

  /**
   * Actualiza la información de un paquete existente
   */
  actualizar(
    id: string,
    datos: {
      nombre?: string;
      descripcion?: string | null;
      precio?: number;
      precioComparacion?: number | null;
      activo?: boolean;
      fechaActualizacion: Date;
    },
  ): Promise<void>;

  /**
   * Elimina un paquete del sistema
   */
  eliminar(id: string): Promise<void>;

  /**
   * Agrega un item a un paquete
   */
  agregarItem(
    paqueteId: string,
    item: {
      id: string;
      productoId: string;
      varianteId: string | null;
      cantidad: number;
      precioUnitario: number | null;
    },
  ): Promise<void>;

  /**
   * Actualiza un item de un paquete
   */
  actualizarItem(
    paqueteId: string,
    itemId: string,
    datos: {
      cantidad?: number;
      precioUnitario?: number | null;
    },
  ): Promise<void>;

  /**
   * Elimina un item de un paquete
   */
  eliminarItem(paqueteId: string, itemId: string): Promise<void>;

  /**
   * Obtiene estadísticas de paquetes
   */
  obtenerEstadisticas(tiendaId?: string): Promise<{
    totalPaquetes: number;
    paquetesActivos: number;
    paquetesInactivos: number;
    paquetesNuevosHoy: number;
    promedioPrecio: number;
    paquetesConAhorro: number;
  }>;

  /**
   * Verifica la disponibilidad de inventario para un paquete
   */
  verificarDisponibilidad(paqueteId: string): Promise<{
    disponible: boolean;
    productosFaltantes: Array<{
      productoId: string;
      varianteId: string | null;
      cantidadRequerida: number;
      cantidadDisponible: number;
    }>;
  }>;

  /**
   * Obtiene paquetes que contienen un producto específico
   */
  buscarPorProducto(productoId: string, varianteId?: string): Promise<Array<{
    id: string;
    nombre: string;
    descripcion: string | null;
    precio: number;
    precioComparacion: number | null;
    sku: string | null;
    activo: boolean;
    fechaCreacion: Date;
    fechaActualizacion: Date;
    tiendaId: string | null;
    creadorId: string;
    cantidadEnPaquete: number;
  }>>;
}