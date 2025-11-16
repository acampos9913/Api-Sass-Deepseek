import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

/**
 * Esquema de Producto para MongoDB - Optimizado para lecturas
 * Desnormalizado para consultas rápidas
 */
@Schema({ collection: 'productos_lectura', timestamps: true })
export class ProductoLectura extends Document {
  @Prop({ required: true })
  declare id: string;

  @Prop({ required: true })
  titulo: string;

  @Prop()
  descripcion?: string;

  @Prop({ required: true, type: Number })
  precio: number;

  @Prop({ type: Number })
  precio_comparacion?: number;

  @Prop()
  sku?: string;

  @Prop()
  codigo_barras?: string;

  @Prop({ type: Number })
  peso?: number;

  @Prop({ type: Number })
  ancho?: number;

  @Prop({ type: Number })
  alto?: number;

  @Prop({ type: Number })
  profundidad?: number;

  @Prop({ default: true })
  visible: boolean;

  @Prop({ required: true })
  tienda_id: string;

  @Prop({ required: true })
  creador_id: string;

  @Prop()
  proveedor?: string;

  @Prop({ default: 'ACTIVO' })
  estado: string;

  @Prop({ default: true })
  visible_tienda_online: boolean;

  @Prop({ default: true })
  visible_point_of_sale: boolean;

  @Prop({ default: 'FISICO' })
  tipo_producto: string;

  @Prop({ default: true })
  requiere_envio: boolean;

  @Prop({ default: true })
  inventario_gestionado: boolean;

  @Prop({ default: 0 })
  cantidad_inventario: number;

  @Prop({ default: false })
  permite_backorder: boolean;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop()
  metatitulo?: string;

  @Prop()
  metadescripcion?: string;

  @Prop()
  slug?: string;

  @Prop()
  fecha_publicacion?: Date;

  @Prop()
  fecha_archivado?: Date;

  @Prop()
  fecha_eliminado?: Date;

  // Campos desnormalizados para optimización
  @Prop({ type: [Object], default: [] })
  variantes: Array<{
    id: string;
    titulo: string;
    precio: number;
    sku?: string;
    inventario: number;
    activo: boolean;
  }>;

  @Prop({ type: [Object], default: [] })
  imagenes: Array<{
    id: string;
    url: string;
    alt_text?: string;
    orden: number;
  }>;

  @Prop({ type: [Object], default: [] })
  categorias: Array<{
    id: string;
    nombre: string;
    slug: string;
  }>;

  @Prop({ type: [Object], default: [] })
  colecciones: Array<{
    id: string;
    nombre: string;
    slug: string;
  }>;

  // Campos para búsqueda y filtrado
  @Prop({ type: Object })
  datos_busqueda: {
    titulo_minusculas: string;
    tags_minusculas: string[];
    categorias_minusculas: string[];
  };

  // Estadísticas para consultas frecuentes
  @Prop({ default: 0 })
  total_ventas: number;

  @Prop({ default: 0 })
  cantidad_vendida: number;

  @Prop({ default: 0 })
  promedio_calificacion: number;

  @Prop({ default: 0 })
  total_calificaciones: number;

  @Prop({ default: 0 })
  vistas: number;

  // Metadata de sincronización
  @Prop({ required: true })
  ultima_sincronizacion: Date;

  @Prop({ required: true })
  version_sincronizacion: number;
}

export const ProductoEsquema = SchemaFactory.createForClass(ProductoLectura);

// Índices para optimización de consultas
ProductoEsquema.index({ tienda_id: 1, estado: 1 });
ProductoEsquema.index({ tienda_id: 1, visible_tienda_online: 1 });
ProductoEsquema.index({ tienda_id: 1, visible_point_of_sale: 1 });
ProductoEsquema.index({ tienda_id: 1, slug: 1 });
ProductoEsquema.index({ tienda_id: 1, 'categorias.id': 1 });
ProductoEsquema.index({ tienda_id: 1, 'colecciones.id': 1 });
ProductoEsquema.index({ tienda_id: 1, precio: 1 });
ProductoEsquema.index({ 'datos_busqueda.titulo_minusculas': 'text' });
ProductoEsquema.index({ 'datos_busqueda.tags_minusculas': 1 });
ProductoEsquema.index({ 'datos_busqueda.categorias_minusculas': 1 });
ProductoEsquema.index({ total_ventas: -1 });
ProductoEsquema.index({ promedio_calificacion: -1 });
ProductoEsquema.index({ vistas: -1 });
ProductoEsquema.index({ ultima_sincronizacion: -1 });