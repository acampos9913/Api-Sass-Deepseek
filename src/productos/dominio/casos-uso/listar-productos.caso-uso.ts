import { Inject, Injectable } from '@nestjs/common';
import { Producto } from '../entidades/producto.entity';
import type { RepositorioProducto } from '../interfaces/repositorio-producto.interface';
import { ExcepcionDominio } from '../../../comun/excepciones/excepcion-dominio';
import { ServicioRespuestaEstandar, RespuestaEstandar } from '../../../comun/aplicacion/servicios/servicio-respuesta-estandar';

/**
 * Filtros para listar productos
 */
export interface FiltrosProductos {
  titulo?: string;
  visible?: boolean;
  categoriaId?: string;
  sku?: string;
  conStock?: boolean;
  precioMin?: number;
  precioMax?: number;
}

/**
 * Opciones de paginación y ordenamiento
 */
export interface OpcionesListado {
  pagina: number;
  limite: number;
  ordenarPor?: 'titulo' | 'precio' | 'fechaCreacion' | 'fechaActualizacion';
  orden?: 'asc' | 'desc';
}

/**
 * Resultado del listado con paginación
 */
export interface ResultadoListadoProductos {
  productos: Producto[];
  paginacion: {
    totalElementos: number;
    totalPaginas: number;
    paginaActual: number;
    limite: number;
    tieneSiguiente: boolean;
    tieneAnterior: boolean;
  };
}

/**
 * Caso de uso para listar productos con filtros y paginación
 * Optimizado para el frontend con múltiples opciones de filtrado
 */
@Injectable()
export class ListarProductosCasoUso {
  constructor(
    @Inject('RepositorioProducto')
    private readonly repositorioProducto: RepositorioProducto,
  ) {}

  /**
   * Ejecuta el caso de uso de listado de productos
   * @param opciones - Opciones de paginación y ordenamiento
   * @param filtros - Filtros opcionales para el listado
   * @returns Promise con la respuesta estándar
   */
  async ejecutar(
    opciones: OpcionesListado,
    filtros?: FiltrosProductos,
  ): Promise<RespuestaEstandar> {
    // Validar opciones de paginación
    this.validarOpciones(opciones);

    // Aplicar filtros por defecto si no se especifican
    const filtrosAplicados = this.aplicarFiltrosPorDefecto(filtros);

    // Obtener productos del repositorio
    const { productos, total } = await this.repositorioProducto.listar(
      opciones.pagina,
      opciones.limite,
      filtrosAplicados,
    );

    // Calcular metadatos de paginación
    const paginacion = this.calcularPaginacion(
      total,
      opciones.pagina,
      opciones.limite,
    );

    const resultado = {
      productos,
      paginacion,
    };

    return ServicioRespuestaEstandar.Respuesta200(
      'Productos obtenidos exitosamente',
      resultado,
      'Producto.ListaObtenidaExitosamente'
    );
  }

  /**
   * Busca productos por título con paginación
   * @param titulo - Título o parte del título a buscar
   * @param opciones - Opciones de paginación
   * @returns Promise con la respuesta estándar
   */
  async buscarPorTitulo(
    titulo: string,
    opciones: OpcionesListado,
  ): Promise<RespuestaEstandar> {
    this.validarOpciones(opciones);

    if (!titulo || titulo.trim().length < 2) {
      throw ExcepcionDominio.Respuesta400(
        'El término de búsqueda debe tener al menos 2 caracteres',
        'Producto.BusquedaInvalida'
      );
    }

    const { productos, total } = await this.repositorioProducto.buscarPorTitulo(
      titulo.trim(),
      opciones.pagina,
      opciones.limite,
    );

    const paginacion = this.calcularPaginacion(
      total,
      opciones.pagina,
      opciones.limite,
    );

    const resultado = {
      productos,
      paginacion,
    };

    return ServicioRespuestaEstandar.Respuesta200(
      'Búsqueda completada exitosamente',
      resultado,
      'Producto.BusquedaCompletadaExitosamente'
    );
  }

  /**
   * Lista productos por categoría
   * @param categoriaId - ID de la categoría
   * @param opciones - Opciones de paginación
   * @returns Promise con la respuesta estándar
   */
  async listarPorCategoria(
    categoriaId: string,
    opciones: OpcionesListado,
  ): Promise<RespuestaEstandar> {
    this.validarOpciones(opciones);

    if (!categoriaId) {
      throw ExcepcionDominio.Respuesta400(
        'El ID de categoría es requerido',
        'Producto.CategoriaRequerida'
      );
    }

    const { productos, total } = await this.repositorioProducto.listarPorCategoria(
      categoriaId,
      opciones.pagina,
      opciones.limite,
    );

    const paginacion = this.calcularPaginacion(
      total,
      opciones.pagina,
      opciones.limite,
    );

    const resultado = {
      productos,
      paginacion,
    };

    return ServicioRespuestaEstandar.Respuesta200(
      'Productos por categoría obtenidos exitosamente',
      resultado,
      'Producto.PorCategoriaObtenidosExitosamente'
    );
  }

  /**
   * Valida las opciones de paginación
   */
  private validarOpciones(opciones: OpcionesListado): void {
    if (opciones.pagina < 1) {
      throw ExcepcionDominio.Respuesta400(
        'La página debe ser mayor o igual a 1',
        'Producto.PaginaInvalida'
      );
    }

    if (opciones.limite < 1 || opciones.limite > 100) {
      throw ExcepcionDominio.Respuesta400(
        'El límite debe estar entre 1 y 100',
        'Producto.LimiteInvalido'
      );
    }
  }

  /**
   * Aplica filtros por defecto si no se especifican
   */
  private aplicarFiltrosPorDefecto(filtros?: FiltrosProductos): FiltrosProductos {
    return {
      visible: true, // Por defecto solo productos visibles
      ...filtros,
    };
  }

  /**
   * Calcula los metadatos de paginación
   */
  private calcularPaginacion(
    total: number,
    pagina: number,
    limite: number,
  ) {
    const totalPaginas = Math.ceil(total / limite);
    const tieneSiguiente = pagina < totalPaginas;
    const tieneAnterior = pagina > 1;

    return {
      totalElementos: total,
      totalPaginas,
      paginaActual: pagina,
      limite,
      tieneSiguiente,
      tieneAnterior,
    };
  }
}