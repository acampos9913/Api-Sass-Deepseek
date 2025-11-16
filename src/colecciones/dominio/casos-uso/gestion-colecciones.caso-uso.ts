import { Injectable, Inject } from '@nestjs/common';
import { Coleccion } from '../entidades/coleccion.entity';
import type { RepositorioColeccion } from '../interfaces/repositorio-coleccion.interface';

/**
 * Caso de uso para la gestión de colecciones
 * Implementa la lógica de negocio para operaciones con colecciones
 */
@Injectable()
export class GestionColeccionesCasoUso {
  constructor(
    @Inject('RepositorioColeccion')
    private readonly repositorioColeccion: RepositorioColeccion,
  ) {}

  async crearColeccion(datos: {
    nombre: string;
    descripcion?: string;
    slug?: string;
    imagenUrl?: string;
    tipo: 'MANUAL' | 'AUTOMATICA';
    reglas?: any;
    visibleTiendaOnline?: boolean;
    visiblePointOfSale?: boolean;
    tiendaId: string;
    creadorId: string;
  }): Promise<Coleccion> {
    // Validar que el slug sea único si se proporciona
    const slug = datos.slug || Coleccion.generarSlug(datos.nombre);
    if (await this.repositorioColeccion.existeSlug(slug)) {
      throw new Error('Ya existe una colección con ese slug');
    }

    const coleccion = new Coleccion(
      `col-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      datos.nombre,
      datos.descripcion || null,
      slug,
      datos.imagenUrl || null,
      'ACTIVA',
      datos.tipo,
      datos.reglas || null,
      datos.visibleTiendaOnline !== undefined ? datos.visibleTiendaOnline : true,
      datos.visiblePointOfSale !== undefined ? datos.visiblePointOfSale : true,
      new Date(),
      new Date(),
      datos.tiendaId,
      datos.creadorId,
    );

    return this.repositorioColeccion.guardar(coleccion);
  }

  async obtenerColeccionPorId(id: string): Promise<Coleccion> {
    const coleccion = await this.repositorioColeccion.buscarPorId(id);
    if (!coleccion) {
      throw new Error('Colección no encontrada');
    }
    return coleccion;
  }

  async obtenerColeccionPorSlug(slug: string): Promise<Coleccion> {
    const coleccion = await this.repositorioColeccion.buscarPorSlug(slug);
    if (!coleccion) {
      throw new Error('Colección no encontrada');
    }
    return coleccion;
  }

  async listarColecciones(
    pagina: number,
    limite: number,
    filtros?: {
      nombre?: string;
      tiendaId?: string;
      estado?: 'ACTIVA' | 'ARCHIVADA' | 'ELIMINADA';
      tipo?: 'MANUAL' | 'AUTOMATICA';
      visibleTiendaOnline?: boolean;
      visiblePointOfSale?: boolean;
      fechaDesde?: Date;
      fechaHasta?: Date;
    },
  ): Promise<{ colecciones: Coleccion[]; total: number }> {
    return this.repositorioColeccion.listar(pagina, limite, filtros);
  }

  async actualizarColeccion(
    id: string,
    datos: {
      nombre?: string;
      descripcion?: string;
      slug?: string;
      imagenUrl?: string;
      reglas?: any;
      visibleTiendaOnline?: boolean;
      visiblePointOfSale?: boolean;
    },
  ): Promise<Coleccion> {
    const coleccionExistente = await this.repositorioColeccion.buscarPorId(id);
    if (!coleccionExistente) {
      throw new Error('Colección no encontrada');
    }

    // Validar slug único si se está actualizando
    if (datos.slug && datos.slug !== coleccionExistente.slug) {
      if (await this.repositorioColeccion.existeSlug(datos.slug, id)) {
        throw new Error('Ya existe una colección con ese slug');
      }
    }

    // Crear una nueva colección con los datos actualizados
    const coleccionActualizada = new Coleccion(
      coleccionExistente.id,
      datos.nombre || coleccionExistente.nombre,
      datos.descripcion !== undefined ? datos.descripcion : coleccionExistente.descripcion,
      datos.slug || coleccionExistente.slug,
      datos.imagenUrl !== undefined ? datos.imagenUrl : coleccionExistente.imagenUrl,
      coleccionExistente.estado,
      coleccionExistente.tipo,
      datos.reglas !== undefined ? datos.reglas : coleccionExistente.reglas,
      datos.visibleTiendaOnline !== undefined ? datos.visibleTiendaOnline : coleccionExistente.visibleTiendaOnline,
      datos.visiblePointOfSale !== undefined ? datos.visiblePointOfSale : coleccionExistente.visiblePointOfSale,
      coleccionExistente.fechaCreacion,
      new Date(),
      coleccionExistente.tiendaId,
      coleccionExistente.creadorId,
    );

    return this.repositorioColeccion.actualizar(coleccionExistente);
  }

  async archivarColeccion(id: string): Promise<Coleccion> {
    const coleccion = await this.repositorioColeccion.buscarPorId(id);
    if (!coleccion) {
      throw new Error('Colección no encontrada');
    }

    return this.repositorioColeccion.archivar(id);
  }

  async desarchivarColeccion(id: string): Promise<Coleccion> {
    const coleccion = await this.repositorioColeccion.buscarPorId(id);
    if (!coleccion) {
      throw new Error('Colección no encontrada');
    }

    return this.repositorioColeccion.desarchivar(id);
  }

  async eliminarColeccion(id: string): Promise<void> {
    const coleccion = await this.repositorioColeccion.buscarPorId(id);
    if (!coleccion) {
      throw new Error('Colección no encontrada');
    }

    return this.repositorioColeccion.eliminar(id);
  }

  async duplicarColeccion(id: string): Promise<Coleccion> {
    const coleccion = await this.repositorioColeccion.buscarPorId(id);
    if (!coleccion) {
      throw new Error('Colección no encontrada');
    }

    return this.repositorioColeccion.duplicar(id);
  }

  async agregarProductoAColeccion(
    coleccionId: string,
    productoId: string,
    orden?: number,
  ): Promise<void> {
    return this.repositorioColeccion.agregarProducto(coleccionId, productoId, orden);
  }

  async eliminarProductoDeColeccion(
    coleccionId: string,
    productoId: string,
  ): Promise<void> {
    return this.repositorioColeccion.eliminarProducto(coleccionId, productoId);
  }

  async actualizarOrdenProductos(
    coleccionId: string,
    productosOrden: Array<{ productoId: string; orden: number }>,
  ): Promise<void> {
    return this.repositorioColeccion.actualizarOrdenProductos(coleccionId, productosOrden);
  }

  async obtenerProductosDeColeccion(
    coleccionId: string,
    pagina: number,
    limite: number,
  ): Promise<{ productos: any[]; total: number }> {
    return this.repositorioColeccion.obtenerProductos(coleccionId, pagina, limite);
  }

  async exportarColeccionesCSV(filtros?: {
    tiendaId?: string;
    estado?: 'ACTIVA' | 'ARCHIVADA' | 'ELIMINADA';
    tipo?: 'MANUAL' | 'AUTOMATICA';
    fechaDesde?: Date;
    fechaHasta?: Date;
  }): Promise<string> {
    return this.repositorioColeccion.exportarCSV(filtros);
  }

  async importarColeccionesCSV(
    csvData: string,
    tiendaId: string,
    creadorId: string,
  ): Promise<{ exitosos: number; fallidos: number; errores: string[] }> {
    return this.repositorioColeccion.importarCSV(csvData, tiendaId, creadorId);
  }

  async actualizarVisibilidadCanales(
    id: string,
    tiendaOnline: boolean,
    pointOfSale: boolean,
  ): Promise<Coleccion> {
    return this.repositorioColeccion.actualizarVisibilidadCanales(id, tiendaOnline, pointOfSale);
  }

  async obtenerEstadisticasColecciones(tiendaId: string): Promise<{
    total: number;
    activas: number;
    archivadas: number;
    manuales: number;
    automaticas: number;
    conProductos: number;
    promedioProductos: number;
  }> {
    return this.repositorioColeccion.obtenerEstadisticas(tiendaId);
  }

  async ejecutarReglasAutomaticas(coleccionId: string): Promise<{
    productosAgregados: number;
    productosEliminados: number;
    totalProductos: number;
  }> {
    return this.repositorioColeccion.ejecutarReglasAutomaticas(coleccionId);
  }
}