import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ProductoLectura } from '../esquemas/producto.esquema';
import { RepositorioLecturaProducto } from '../interfaces/repositorio-lectura-producto.interface';
import { Producto } from '../../productos/dominio/entidades/producto.entity';
import { ExcepcionDominio } from '../../comun/excepciones/excepcion-dominio';

/**
 * Repositorio de MongoDB para Productos - Optimizado para lecturas
 * Implementa la interfaz específica para operaciones de lectura
 */
@Injectable()
export class MongodbRepositorioProducto implements RepositorioLecturaProducto {
  constructor(
    @InjectModel(ProductoLectura.name) 
    private readonly modeloProducto: Model<ProductoLectura>,
  ) {}

  /**
   * Encuentra productos por tienda con paginación y filtros
   */
  async encontrarPorTienda(
    tiendaId: string, 
    pagina: number = 1, 
    limite: number = 50,
    filtros?: any
  ): Promise<{ productos: Producto[]; total: number }> {
    try {
      const skip = (pagina - 1) * limite;
      
      // Construir query base
      const query: any = { 
        tienda_id: tiendaId,
        estado: 'ACTIVO'
      };

      // Aplicar filtros
      if (filtros) {
        if (filtros.visible_tienda_online !== undefined) {
          query.visible_tienda_online = filtros.visible_tienda_online;
        }
        if (filtros.visible_point_of_sale !== undefined) {
          query.visible_point_of_sale = filtros.visible_point_of_sale;
        }
        if (filtros.categoria_id) {
          query['categorias.id'] = filtros.categoria_id;
        }
        if (filtros.coleccion_id) {
          query['colecciones.id'] = filtros.coleccion_id;
        }
        if (filtros.precio_min !== undefined || filtros.precio_max !== undefined) {
          query.precio = {};
          if (filtros.precio_min !== undefined) query.precio.$gte = filtros.precio_min;
          if (filtros.precio_max !== undefined) query.precio.$lte = filtros.precio_max;
        }
        if (filtros.tags && filtros.tags.length > 0) {
          query.tags = { $in: filtros.tags };
        }
        if (filtros.busqueda) {
          query['datos_busqueda.titulo_minusculas'] = { 
            $regex: filtros.busqueda.toLowerCase(), 
            $options: 'i' 
          };
        }
      }

      const [productos, total] = await Promise.all([
        this.modeloProducto
          .find(query)
          .select('-datos_busqueda') // Excluir campos internos
          .sort({ fecha_publicacion: -1, fecha_creacion: -1 })
          .skip(skip)
          .limit(limite)
          .exec(),
        this.modeloProducto.countDocuments(query)
      ]);

      // Convertir a entidades de dominio
      const productosDominio = productos.map(producto => 
        this.mapearAModeloDominio(producto)
      );

      return {
        productos: productosDominio,
        total
      };
    } catch (error) {
      throw ExcepcionDominio.Respuesta500(
        'Error al buscar productos en MongoDB: ' + error.message,
        'MongoDB.ErrorBusqueda'
      );
    }
  }

  /**
   * Encuentra producto por ID y tienda
   */
  async encontrarPorId(id: string, tiendaId: string): Promise<Producto | null> {
    try {
      const producto = await this.modeloProducto
        .findOne({ id, tienda_id: tiendaId, estado: 'ACTIVO' })
        .select('-datos_busqueda')
        .exec();

      return producto ? this.mapearAModeloDominio(producto) : null;
    } catch (error) {
      throw ExcepcionDominio.Respuesta500(
        'Error al buscar producto por ID en MongoDB: ' + error.message,
        'MongoDB.ErrorBusquedaPorId'
      );
    }
  }

  /**
   * Encuentra producto por slug y tienda
   */
  async encontrarPorSlug(slug: string, tiendaId: string): Promise<Producto | null> {
    try {
      const producto = await this.modeloProducto
        .findOne({ slug, tienda_id: tiendaId, estado: 'ACTIVO' })
        .select('-datos_busqueda')
        .exec();

      return producto ? this.mapearAModeloDominio(producto) : null;
    } catch (error) {
      throw ExcepcionDominio.Respuesta500(
        'Error al buscar producto por slug en MongoDB: ' + error.message,
        'MongoDB.ErrorBusquedaPorSlug'
      );
    }
  }

  /**
   * Buscar productos por texto
   */
  async buscar(
    texto: string, 
    tiendaId: string, 
    pagina: number = 1, 
    limite: number = 50
  ): Promise<{ productos: Producto[]; total: number }> {
    try {
      const skip = (pagina - 1) * limite;

      const query = {
        tienda_id: tiendaId,
        estado: 'ACTIVO',
        $text: { $search: texto.toLowerCase() }
      };

      const [productos, total] = await Promise.all([
        this.modeloProducto
          .find(query)
          .select('-datos_busqueda')
          .sort({ score: { $meta: 'textScore' } })
          .skip(skip)
          .limit(limite)
          .exec(),
        this.modeloProducto.countDocuments(query)
      ]);

      const productosDominio = productos.map(producto => 
        this.mapearAModeloDominio(producto)
      );

      return {
        productos: productosDominio,
        total
      };
    } catch (error) {
      throw ExcepcionDominio.Respuesta500(
        'Error en búsqueda de texto en MongoDB: ' + error.message,
        'MongoDB.ErrorBusquedaTexto'
      );
    }
  }

  /**
   * Obtener productos más vendidos
   */
  async encontrarMasVendidos(
    tiendaId: string, 
    limite: number = 10
  ): Promise<Producto[]> {
    try {
      const productos = await this.modeloProducto
        .find({ 
          tienda_id: tiendaId, 
          estado: 'ACTIVO',
          total_ventas: { $gt: 0 }
        })
        .select('-datos_busqueda')
        .sort({ total_ventas: -1 })
        .limit(limite)
        .exec();

      return productos.map(producto => this.mapearAModeloDominio(producto));
    } catch (error) {
      throw ExcepcionDominio.Respuesta500(
        'Error al buscar productos más vendidos en MongoDB: ' + error.message,
        'MongoDB.ErrorBusquedaMasVendidos'
      );
    }
  }

  /**
   * Obtener productos mejor calificados
   */
  async encontrarMejorCalificados(
    tiendaId: string, 
    limite: number = 10
  ): Promise<Producto[]> {
    try {
      const productos = await this.modeloProducto
        .find({ 
          tienda_id: tiendaId, 
          estado: 'ACTIVO',
          promedio_calificacion: { $gt: 0 }
        })
        .select('-datos_busqueda')
        .sort({ promedio_calificacion: -1 })
        .limit(limite)
        .exec();

      return productos.map(producto => this.mapearAModeloDominio(producto));
    } catch (error) {
      throw ExcepcionDominio.Respuesta500(
        'Error al buscar productos mejor calificados en MongoDB: ' + error.message,
        'MongoDB.ErrorBusquedaMejorCalificados'
      );
    }
  }


  /**
   * Mapear documento MongoDB a entidad de dominio
   */
  private mapearAModeloDominio(documento: ProductoLectura): Producto {
    return new Producto(
      documento.id,
      documento.titulo,
      documento.descripcion || null,
      Number(documento.precio),
      documento.precio_comparacion ? Number(documento.precio_comparacion) : null,
      documento.sku || null,
      documento.codigo_barras || null,
      documento.peso ? Number(documento.peso) : null,
      documento.ancho ? Number(documento.ancho) : null,
      documento.alto ? Number(documento.alto) : null,
      documento.profundidad ? Number(documento.profundidad) : null,
      documento.visible,
      documento['createdAt'] || new Date(),
      documento['updatedAt'] || new Date(),
      documento.creador_id,
      documento.tienda_id,
      documento.proveedor || null,
      documento.estado as 'ACTIVO' | 'ARCHIVADO' | 'ELIMINADO',
      documento.visible_tienda_online,
      documento.visible_point_of_sale,
      documento.tipo_producto as 'FISICO' | 'DIGITAL' | 'SERVICIO',
      documento.requiere_envio,
      documento.inventario_gestionado,
      documento.cantidad_inventario,
      documento.permite_backorder,
      documento.tags,
      documento.metatitulo || null,
      documento.metadescripcion || null,
      documento.slug || null,
      documento.fecha_publicacion || null,
      documento.fecha_archivado || null,
      documento.fecha_eliminado || null
    );
  }
}