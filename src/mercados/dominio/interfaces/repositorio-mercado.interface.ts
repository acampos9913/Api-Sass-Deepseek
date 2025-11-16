import { EstadoMercado } from '../enums/estado-mercado.enum';
import { Mercado } from '../entidades/mercado.entity';

/**
 * Interfaz del repositorio de mercado que define las operaciones de persistencia
 * Sigue el principio de inversión de dependencias de la Arquitectura Limpia
 */
export interface RepositorioMercado {
  /**
   * Crea un nuevo mercado en el sistema
   */
  crear(mercado: {
    id: string;
    nombre: string;
    codigo: string;
    moneda: string;
    idioma: string;
    zonaHoraria: string;
    estado: EstadoMercado;
    activo: boolean;
    fechaCreacion: Date;
    fechaActualizacion: Date;
    tiendaId: string | null;
    configuracion: Record<string, any> | null;
  }): Promise<void>;

  /**
   * Busca un mercado por su ID único
   */
  buscarPorId(id: string): Promise<{
    id: string;
    nombre: string;
    codigo: string;
    moneda: string;
    idioma: string;
    zonaHoraria: string;
    estado: EstadoMercado;
    activo: boolean;
    fechaCreacion: Date;
    fechaActualizacion: Date;
    tiendaId: string | null;
    configuracion: Record<string, any> | null;
  } | null>;

  /**
   * Busca un mercado por su código único
   */
  buscarPorCodigo(codigo: string): Promise<{
    id: string;
    nombre: string;
    codigo: string;
    moneda: string;
    idioma: string;
    zonaHoraria: string;
    estado: EstadoMercado;
    activo: boolean;
    fechaCreacion: Date;
    fechaActualizacion: Date;
    tiendaId: string | null;
    configuracion: Record<string, any> | null;
  } | null>;

  /**
   * Lista todos los mercados con paginación y filtros
   */
  listar(filtros: {
    pagina: number;
    limite: number;
    activo?: boolean;
    estado?: EstadoMercado;
    tiendaId?: string;
    busqueda?: string;
  }): Promise<{
    mercados: Array<{
      id: string;
      nombre: string;
      codigo: string;
      moneda: string;
      idioma: string;
      zonaHoraria: string;
      estado: EstadoMercado;
      activo: boolean;
      fechaCreacion: Date;
      fechaActualizacion: Date;
      tiendaId: string | null;
      configuracion: Record<string, any> | null;
    }>;
    total: number;
  }>;

  /**
   * Actualiza la información de un mercado existente
   */
  actualizar(
    id: string,
    datos: {
      nombre?: string;
      moneda?: string;
      idioma?: string;
      zonaHoraria?: string;
      estado?: EstadoMercado;
      activo?: boolean;
      configuracion?: Record<string, any>;
      fechaActualizacion: Date;
    },
  ): Promise<void>;

  /**
   * Elimina un mercado del sistema
   */
  eliminar(id: string): Promise<void>;

  /**
   * Verifica si existe un mercado con el código dado
   */
  existeCodigo(codigo: string, idExcluir?: string): Promise<boolean>;

  /**
   * Obtiene estadísticas de mercados
   */
  obtenerEstadisticas(tiendaId?: string): Promise<{
    totalMercados: number;
    mercadosActivos: number;
    mercadosInactivos: number;
    mercadosPorEstado: Record<EstadoMercado, number>;
    mercadosPorMoneda: Record<string, number>;
    mercadosPorIdioma: Record<string, number>;
  }>;

  /**
   * Lista mercados por tienda específica
   */
  listarPorTienda(tiendaId: string): Promise<Array<{
    id: string;
    nombre: string;
    codigo: string;
    moneda: string;
    idioma: string;
    estado: EstadoMercado;
    activo: boolean;
  }>>;

  /**
   * Obtiene el mercado predeterminado para una tienda
   */
  obtenerPredeterminado(tiendaId: string): Promise<{
    id: string;
    nombre: string;
    codigo: string;
    moneda: string;
    idioma: string;
    zonaHoraria: string;
    estado: EstadoMercado;
    activo: boolean;
    fechaCreacion: Date;
    fechaActualizacion: Date;
    tiendaId: string | null;
    configuracion: Record<string, any> | null;
  } | null>;

  /**
   * Establece un mercado como predeterminado para una tienda
   */
  establecerPredeterminado(tiendaId: string, mercadoId: string): Promise<void>;

  /**
   * Obtiene productos asociados a un mercado específico
   */
  obtenerProductosMercado(
    mercadoId: string,
    filtros?: {
      pagina?: number;
      limite?: number;
      disponible?: boolean;
    },
  ): Promise<{
    productos: Array<{
      id: string;
      productoId: string;
      mercadoId: string;
      precio: number | null;
      disponible: boolean;
      fechaCreacion: Date;
      fechaActualizacion: Date;
    }>;
    total: number;
  }>;

  /**
   * Sincroniza productos con un mercado
   */
  sincronizarProductosMercado(
    mercadoId: string,
    productos: Array<{
      productoId: string;
      precio?: number;
      disponible?: boolean;
    }>,
  ): Promise<{
    exitosos: number;
    fallidos: number;
    errores: Array<{ productoId: string; error: string }>;
  }>;
}