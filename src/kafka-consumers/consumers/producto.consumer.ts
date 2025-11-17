import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { KafkaService } from '../../comun/infraestructura/servicios/kafka.service';
import { LoggingService } from '../../logging/logging.service';
import { ProductoLectura } from '../../mongodb/esquemas/producto.esquema';
import { ProductoCreadoEvento, ProductoActualizadoEvento, ProductoEliminadoEvento } from '../../productos/dominio/eventos/producto-creado.evento';

/**
 * Consumidor de eventos de productos para sincronizar PostgreSQL → MongoDB
 */
@Injectable()
export class ProductoConsumer implements OnModuleInit {
  constructor(
    @InjectModel('ProductoLectura') private readonly productoModel: Model<ProductoLectura>,
    private readonly kafkaService: KafkaService,
    private readonly loggingService: LoggingService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.suscribirAEventos();
  }

  /**
   * Suscribe el consumidor a los eventos de productos
   */
  private async suscribirAEventos(): Promise<void> {
    // Suscribir handler para el topic de productos
    this.kafkaService.suscribir('productos', this.manejarEventoProducto.bind(this));

    // Iniciar el consumidor
    await this.kafkaService.iniciar();

    this.loggingService.log('Consumidor de productos suscrito a eventos', {
      modulo: 'ProductoConsumer',
      topic: 'productos'
    });
  }

  /**
   * Maneja todos los eventos de productos y los despacha al método correspondiente
   */
  private async manejarEventoProducto(evento: any): Promise<void> {
    try {
      switch (evento.tipoEvento) {
        case 'ProductoCreado':
          await this.manejarProductoCreado(evento);
          break;
        case 'ProductoActualizado':
          await this.manejarProductoActualizado(evento);
          break;
        case 'ProductoEliminado':
          await this.manejarProductoEliminado(evento);
          break;
        default:
          this.loggingService.warn(`Tipo de evento no reconocido: ${evento.tipoEvento}`, {
            modulo: 'ProductoConsumer',
            tipoEvento: evento.tipoEvento,
            idProducto: evento.idProducto
          });
      }
    } catch (error) {
      this.loggingService.error(`Error al manejar evento ${evento.tipoEvento}`, error.stack, {
        modulo: 'ProductoConsumer',
        tipoEvento: evento.tipoEvento,
        idProducto: evento.idProducto,
        tiendaId: evento.tiendaId
      });
      throw error;
    }
  }

  /**
   * Maneja el evento de producto creado
   */
  private async manejarProductoCreado(evento: ProductoCreadoEvento): Promise<void> {
    try {
      const productoData = this.mapearEventoAModeloMongoDB(evento);
      
      await this.productoModel.create(productoData);

      this.loggingService.logEventoNegocio(
        'producto_sincronizado_mongodb',
        'ProductoCreado',
        evento.idProducto,
        'sincronizacion_exitosa',
        { tiendaId: evento.tiendaId },
        { modulo: 'ProductoConsumer' }
      );
    } catch (error) {
      this.loggingService.error('Error al manejar ProductoCreado', error.stack, {
        modulo: 'ProductoConsumer',
        evento: evento.idProducto,
        tiendaId: evento.tiendaId
      });
      throw error;
    }
  }

  /**
   * Maneja el evento de producto actualizado
   */
  private async manejarProductoActualizado(evento: ProductoActualizadoEvento): Promise<void> {
    try {
      const productoData = this.mapearEventoAModeloMongoDB(evento);
      
      await this.productoModel.findOneAndUpdate(
        { id: evento.idProducto, tienda_id: evento.tiendaId },
        productoData,
        { upsert: true, new: true }
      );

      this.loggingService.logEventoNegocio(
        'producto_actualizado_mongodb',
        'ProductoActualizado',
        evento.idProducto,
        'actualizacion_exitosa',
        { tiendaId: evento.tiendaId },
        { modulo: 'ProductoConsumer' }
      );
    } catch (error) {
      this.loggingService.error('Error al manejar ProductoActualizado', error.stack, {
        modulo: 'ProductoConsumer',
        evento: evento.idProducto,
        tiendaId: evento.tiendaId
      });
      throw error;
    }
  }

  /**
   * Maneja el evento de producto eliminado
   */
  private async manejarProductoEliminado(evento: ProductoEliminadoEvento): Promise<void> {
    try {
      await this.productoModel.findOneAndUpdate(
        { id: evento.idProducto, tienda_id: evento.tiendaId },
        {
          estado: 'ELIMINADO',
          fecha_eliminado: new Date(),
          ultima_sincronizacion: new Date(),
          version_sincronizacion: evento.version
        }
      );

      this.loggingService.logEventoNegocio(
        'producto_eliminado_mongodb',
        'ProductoEliminado',
        evento.idProducto,
        'eliminacion_exitosa',
        { tiendaId: evento.tiendaId },
        { modulo: 'ProductoConsumer' }
      );
    } catch (error) {
      this.loggingService.error('Error al manejar ProductoEliminado', error.stack, {
        modulo: 'ProductoConsumer',
        evento: evento.idProducto,
        tiendaId: evento.tiendaId
      });
      throw error;
    }
  }

  /**
   * Mapea los datos del evento al modelo de MongoDB
   */
  private mapearEventoAModeloMongoDB(evento: any): any {
    return {
      id: evento.idProducto,
      titulo: evento.titulo,
      descripcion: evento.descripcion,
      precio: evento.precio,
      precio_comparacion: evento.precioComparacion,
      sku: evento.sku,
      codigo_barras: evento.codigoBarras,
      peso: evento.peso,
      ancho: evento.ancho,
      alto: evento.alto,
      profundidad: evento.profundidad,
      visible: evento.visible,
      tienda_id: evento.tiendaId,
      creador_id: evento.creadorId,
      proveedor: evento.proveedor,
      estado: evento.estado,
      visible_tienda_online: evento.visibleTiendaOnline,
      visible_point_of_sale: evento.visiblePointOfSale,
      tipo_producto: evento.tipoProducto,
      requiere_envio: evento.requiereEnvio,
      inventario_gestionado: evento.inventarioGestionado,
      cantidad_inventario: evento.cantidadInventario,
      permite_backorder: evento.permiteBackorder,
      tags: evento.tags || [],
      metatitulo: evento.metatitulo,
      metadescripcion: evento.metadescripcion,
      slug: evento.slug,
      fecha_publicacion: evento.fechaPublicacion ? new Date(evento.fechaPublicacion) : undefined,
      fecha_archivado: evento.fechaArchivado ? new Date(evento.fechaArchivado) : undefined,
      variantes: evento.variantes || [],
      imagenes: evento.imagenes || [],
      categorias: evento.categorias || [],
      colecciones: evento.colecciones || [],
      datos_busqueda: {
        titulo_minusculas: evento.titulo?.toLowerCase() || '',
        tags_minusculas: evento.tags?.map((tag: string) => tag.toLowerCase()) || [],
        categorias_minusculas: evento.categorias?.map((cat: any) => cat.nombre?.toLowerCase()) || [],
      },
      total_ventas: evento.totalVentas || 0,
      cantidad_vendida: evento.cantidadVendida || 0,
      promedio_calificacion: evento.promedioCalificacion || 0,
      total_calificaciones: evento.totalCalificaciones || 0,
      vistas: evento.vistas || 0,
      ultima_sincronizacion: new Date(),
      version_sincronizacion: evento.version || 1,
    };
  }
}