import { Injectable } from '@nestjs/common';
import { Producto } from '../entidades/producto.entity';
import type { RepositorioLecturaProducto } from '../interfaces/repositorio-lectura-producto.interface';
import { ExcepcionDominio } from '../../../comun/excepciones/excepcion-dominio';
import { ServicioRespuestaEstandar, RespuestaEstandar } from '../../../comun/aplicacion/servicios/servicio-respuesta-estandar';

/**
 * Filtros optimizados para lecturas
 */
export interface FiltrosProductosLectura {
  visible_tienda_online?: boolean;
  visible_point_of_sale?: boolean;
  categoria_id?: string;
  coleccion_id?: string;
  precio_min?: number;
  precio_max?: number;
  tags?: string[];
  busqueda?: string;
  estado?: string;
}

/**
 * Opciones de listado optimizadas para lecturas
 */
export interface OpcionesListadoLectura {
  pagina: number;
  limite: number;
  ordenarPor?: 'titulo' | 'precio' | 'fecha_publicacion' | 'total_ventas' | 'promedio_calificacion';
  orden?: 'asc' | 'desc';
}

/**
 * Resultado del listado con paginación para lecturas
 */
export interface ResultadoListadoProductosLectura {
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
 * Caso de uso para listar productos optimizado para lecturas
 * Implementa arquitectura híbrida CQRS con abstracción de base de datos
 */
@Injectable()
export class ListarProductosLecturaCasoUso {
  constructor(
    private readonly repositorioLecturaProducto: RepositorioLecturaProducto
  ) {}

  /**
   * Ejecuta el caso de uso de listado de productos optimizado para lecturas
   */
  async ejecutar(
    tiendaId: string,
    opciones: OpcionesListadoLectura,
    filtros?: FiltrosProductosLectura,
  ): Promise<RespuestaEstandar> {
    // Validar opciones de paginación
    this.validarOpciones(opciones);

    // Aplicar filtros por defecto para lecturas optimizadas
    const filtrosAplicados = this.aplicarFiltrosPorDefecto(filtros);

    // Obtener productos del repositorio de lectura optimizada
    const { productos, total } = await this.repositorioLecturaProducto.encontrarPorTienda(
      tiendaId,
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
      'Productos obtenidos exitosamente (Lectura optimizada)',
      resultado,
      'Producto.ListaObtenidaExitosamente'
    );
  }

  /**
   * Busca productos por texto usando búsqueda optimizada
   */
  async buscarPorTexto(
    tiendaId: string,
    texto: string,
    opciones: OpcionesListadoLectura,
  ): Promise<RespuestaEstandar> {
    this.validarOpciones(opciones);

    if (!texto || texto.trim().length < 2) {
      throw ExcepcionDominio.Respuesta400(
        'El término de búsqueda debe tener al menos 2 caracteres',
        'Producto.BusquedaInvalida'
      );
    }

    const { productos, total } = await this.repositorioLecturaProducto.buscar(
      texto.trim(),
      tiendaId,
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
      'Búsqueda completada exitosamente (Lectura optimizada)',
      resultado,
      'Producto.BusquedaCompletadaExitosamente'
    );
  }

  /**
   * Obtiene productos más vendidos desde repositorio optimizado
   */
  async obtenerMasVendidos(
    tiendaId: string,
    limite: number = 10,
  ): Promise<RespuestaEstandar> {
    if (limite < 1 || limite > 50) {
      throw ExcepcionDominio.Respuesta400(
        'El límite debe estar entre 1 y 50',
        'Producto.LimiteInvalido'
      );
    }

    const productos = await this.repositorioLecturaProducto.encontrarMasVendidos(tiendaId, limite);
    
    return ServicioRespuestaEstandar.Respuesta200(
      'Productos más vendidos obtenidos exitosamente',
      productos,
      'Producto.MasVendidosObtenidosExitosamente'
    );
  }

  /**
   * Obtiene productos mejor calificados desde repositorio optimizado
   */
  async obtenerMejorCalificados(
    tiendaId: string,
    limite: number = 10,
  ): Promise<RespuestaEstandar> {
    if (limite < 1 || limite > 50) {
      throw ExcepcionDominio.Respuesta400(
        'El límite debe estar entre 1 y 50',
        'Producto.LimiteInvalido'
      );
    }

    const productos = await this.repositorioLecturaProducto.encontrarMejorCalificados(tiendaId, limite);
    
    return ServicioRespuestaEstandar.Respuesta200(
      'Productos mejor calificados obtenidos exitosamente',
      productos,
      'Producto.MejorCalificadosObtenidosExitosamente'
    );
  }

  /**
   * Encuentra producto por slug desde repositorio optimizado
   */
  async encontrarPorSlug(tiendaId: string, slug: string): Promise<RespuestaEstandar> {
    const producto = await this.repositorioLecturaProducto.encontrarPorSlug(slug, tiendaId);
    
    if (!producto) {
      throw ExcepcionDominio.Respuesta404(
        'Producto no encontrado',
        'Producto.NoEncontrado'
      );
    }

    const productoDto = this.aDto(producto);
    return ServicioRespuestaEstandar.Respuesta200(
      'Producto obtenido exitosamente (Lectura optimizada)',
      productoDto,
      'Producto.ObtenidoExitosamente'
    );
  }

  /**
   * Encuentra producto por ID desde repositorio optimizado
   */
  async encontrarPorId(tiendaId: string, id: string): Promise<RespuestaEstandar> {
    const producto = await this.repositorioLecturaProducto.encontrarPorId(id, tiendaId);
    
    if (!producto) {
      throw ExcepcionDominio.Respuesta404(
        'Producto no encontrado',
        'Producto.NoEncontrado'
      );
    }

    const productoDto = this.aDto(producto);
    return ServicioRespuestaEstandar.Respuesta200(
      'Producto obtenido exitosamente (Lectura optimizada)',
      productoDto,
      'Producto.ObtenidoExitosamente'
    );
  }

  /**
   * Valida las opciones de paginación
   */
  private validarOpciones(opciones: OpcionesListadoLectura): void {
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
   * Aplica filtros por defecto optimizados para lecturas
   */
  private aplicarFiltrosPorDefecto(filtros?: FiltrosProductosLectura): FiltrosProductosLectura {
    return {
      estado: 'ACTIVO', // Por defecto solo productos activos
      visible_tienda_online: true, // Por defecto visibles en tienda online
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

  /**
   * Convierte una entidad de Producto a un DTO para la respuesta
   */
  private aDto(producto: Producto): any {
    return {
      id: producto.id,
      titulo: producto.titulo,
      descripcion: producto.descripcion,
      precio: producto.precio,
      precioComparacion: producto.precioComparacion,
      sku: producto.sku,
      codigoBarras: producto.codigoBarras,
      peso: producto.peso,
      ancho: producto.ancho,
      alto: producto.alto,
      profundidad: producto.profundidad,
      visible: producto.visible,
      fechaCreacion: producto.fechaCreacion,
      fechaActualizacion: producto.fechaActualizacion,
      creadorId: producto.creadorId,
      tiendaId: producto.tiendaId,
      proveedor: producto.proveedor,
      estado: producto.estado,
      visibleTiendaOnline: producto.visibleTiendaOnline,
      visiblePointOfSale: producto.visiblePointOfSale,
      tipoProducto: producto.tipoProducto,
      requiereEnvio: producto.requiereEnvio,
      inventarioGestionado: producto.inventarioGestionado,
      cantidadInventario: producto.cantidadInventario,
      permiteBackorder: producto.permiteBackorder,
      tags: producto.tags,
      metatitulo: producto.metatitulo,
      metadescripcion: producto.metadescripcion,
      slug: producto.slug,
      fechaPublicacion: producto.fechaPublicacion,
      fechaArchivado: producto.fechaArchivado,
      fechaEliminado: producto.fechaEliminado,
      tieneDescuento: producto.tieneDescuento(),
      porcentajeDescuento: producto.obtenerPorcentajeDescuento(),
      estaDisponible: producto.estaDisponible(),
      estaPublicado: producto.estaPublicado(),
    };
  }
}