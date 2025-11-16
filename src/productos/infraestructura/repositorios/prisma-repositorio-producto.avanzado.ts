import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { RepositorioProducto } from '../../dominio/interfaces/repositorio-producto.interface';
import { Producto } from '../../dominio/entidades/producto.entity';

/**
 * Repositorio avanzado de productos con Prisma
 * Implementa todas las funcionalidades avanzadas tipo Shopify
 * Incluye exportación/importación CSV, filtros avanzados, duplicación, etc.
 */
@Injectable()
export class PrismaRepositorioProductoAvanzado implements RepositorioProducto {
  constructor(private readonly prisma: PrismaService) {}

  async buscarPorId(id: string): Promise<Producto | null> {
    const productoPrisma = await this.prisma.producto.findUnique({
      where: { id },
      include: {
        categorias: {
          include: {
            categoria: true,
          },
        },
        variantes: true,
        imagenes: {
          orderBy: {
            orden: 'asc',
          },
        },
      },
    });

    if (!productoPrisma) {
      return null;
    }

    return this.aEntidad(productoPrisma);
  }

  async buscarPorSku(sku: string): Promise<Producto | null> {
    const productoPrisma = await this.prisma.producto.findUnique({
      where: { sku },
      include: {
        categorias: {
          include: {
            categoria: true,
          },
        },
        variantes: true,
        imagenes: {
          orderBy: {
            orden: 'asc',
          },
        },
      },
    });

    if (!productoPrisma) {
      return null;
    }

    return this.aEntidad(productoPrisma);
  }

  async buscarPorSlug(slug: string): Promise<Producto | null> {
    const productoPrisma = await this.prisma.producto.findUnique({
      where: { slug },
      include: {
        categorias: {
          include: {
            categoria: true,
          },
        },
        variantes: true,
        imagenes: {
          orderBy: {
            orden: 'asc',
          },
        },
      },
    });

    if (!productoPrisma) {
      return null;
    }

    return this.aEntidad(productoPrisma);
  }

  async guardar(producto: Producto): Promise<Producto> {
    const productoPrisma = await this.prisma.producto.create({
      data: {
        id: producto.id,
        titulo: producto.titulo,
        descripcion: producto.descripcion,
        precio: producto.precio,
        precio_comparacion: producto.precioComparacion,
        sku: producto.sku,
        codigo_barras: producto.codigoBarras,
        peso: producto.peso,
        ancho: producto.ancho,
        alto: producto.alto,
        profundidad: producto.profundidad,
        visible: producto.visible,
        fecha_creacion: producto.fechaCreacion,
        fecha_actualizacion: producto.fechaActualizacion,
        tienda_id: producto.tiendaId,
        creador_id: producto.creadorId,
        proveedor: producto.proveedor,
        estado: producto.estado,
        visible_tienda_online: producto.visibleTiendaOnline,
        visible_point_of_sale: producto.visiblePointOfSale,
        tipo_producto: producto.tipoProducto,
        requiere_envio: producto.requiereEnvio,
        inventario_gestionado: producto.inventarioGestionado,
        cantidad_inventario: producto.cantidadInventario,
        permite_backorder: producto.permiteBackorder,
        tags: producto.tags,
        metatitulo: producto.metatitulo,
        metadescripcion: producto.metadescripcion,
        slug: producto.slug,
        fecha_publicacion: producto.fechaPublicacion,
        fecha_archivado: producto.fechaArchivado,
        fecha_eliminado: producto.fechaEliminado,
      },
      include: {
        categorias: {
          include: {
            categoria: true,
          },
        },
        variantes: true,
        imagenes: {
          orderBy: {
            orden: 'asc',
          },
        },
      },
    });

    return this.aEntidad(productoPrisma);
  }

  async actualizar(producto: Producto): Promise<Producto> {
    const productoPrisma = await this.prisma.producto.update({
      where: { id: producto.id },
      data: {
        titulo: producto.titulo,
        descripcion: producto.descripcion,
        precio: producto.precio,
        precio_comparacion: producto.precioComparacion,
        sku: producto.sku,
        codigo_barras: producto.codigoBarras,
        peso: producto.peso,
        ancho: producto.ancho,
        alto: producto.alto,
        profundidad: producto.profundidad,
        visible: producto.visible,
        fecha_actualizacion: producto.fechaActualizacion,
        proveedor: producto.proveedor,
        estado: producto.estado,
        visible_tienda_online: producto.visibleTiendaOnline,
        visible_point_of_sale: producto.visiblePointOfSale,
        tipo_producto: producto.tipoProducto,
        requiere_envio: producto.requiereEnvio,
        inventario_gestionado: producto.inventarioGestionado,
        cantidad_inventario: producto.cantidadInventario,
        permite_backorder: producto.permiteBackorder,
        tags: producto.tags,
        metatitulo: producto.metatitulo,
        metadescripcion: producto.metadescripcion,
        slug: producto.slug,
        fecha_publicacion: producto.fechaPublicacion,
        fecha_archivado: producto.fechaArchivado,
        fecha_eliminado: producto.fechaEliminado,
      },
      include: {
        categorias: {
          include: {
            categoria: true,
          },
        },
        variantes: true,
        imagenes: {
          orderBy: {
            orden: 'asc',
          },
        },
      },
    });

    return this.aEntidad(productoPrisma);
  }

  async eliminar(id: string): Promise<void> {
    await this.prisma.producto.update({
      where: { id },
      data: {
        estado: 'ELIMINADO',
        fecha_eliminado: new Date(),
        fecha_actualizacion: new Date(),
      },
    });
  }

  async archivar(id: string): Promise<Producto> {
    const productoPrisma = await this.prisma.producto.update({
      where: { id },
      data: {
        estado: 'ARCHIVADO',
        fecha_archivado: new Date(),
        fecha_actualizacion: new Date(),
      },
      include: {
        categorias: {
          include: {
            categoria: true,
          },
        },
        variantes: true,
        imagenes: {
          orderBy: {
            orden: 'asc',
          },
        },
      },
    });

    return this.aEntidad(productoPrisma);
  }

  async desarchivar(id: string): Promise<Producto> {
    const productoPrisma = await this.prisma.producto.update({
      where: { id },
      data: {
        estado: 'ACTIVO',
        fecha_archivado: null,
        fecha_actualizacion: new Date(),
      },
      include: {
        categorias: {
          include: {
            categoria: true,
          },
        },
        variantes: true,
        imagenes: {
          orderBy: {
            orden: 'asc',
          },
        },
      },
    });

    return this.aEntidad(productoPrisma);
  }

  async duplicar(id: string): Promise<Producto> {
    const productoOriginal = await this.buscarPorId(id);
    if (!productoOriginal) {
      throw new Error('Producto no encontrado');
    }

    const productoDuplicado = productoOriginal.duplicar();
    return this.guardar(productoDuplicado);
  }

  async listar(
    pagina: number,
    limite: number,
    filtros?: {
      titulo?: string;
      visible?: boolean;
      categoriaId?: string;
      tiendaId?: string;
      estado?: 'ACTIVO' | 'ARCHIVADO' | 'ELIMINADO';
      proveedor?: string;
      tipoProducto?: 'FISICO' | 'DIGITAL' | 'SERVICIO';
      visibleTiendaOnline?: boolean;
      visiblePointOfSale?: boolean;
      tags?: string[];
      fechaDesde?: Date;
      fechaHasta?: Date;
      inventarioBajo?: boolean;
      conDescuento?: boolean;
    },
  ): Promise<{ productos: Producto[]; total: number }> {
    const skip = (pagina - 1) * limite;
    
    const where: any = {};

    if (filtros?.tiendaId) {
      where.tienda_id = filtros.tiendaId;
    }

    if (filtros?.estado) {
      where.estado = filtros.estado;
    } else {
      where.estado = { not: 'ELIMINADO' };
    }

    if (filtros?.titulo) {
      where.titulo = {
        contains: filtros.titulo,
        mode: 'insensitive',
      };
    }

    if (filtros?.visible !== undefined) {
      where.visible = filtros.visible;
    }

    if (filtros?.proveedor) {
      where.proveedor = {
        contains: filtros.proveedor,
        mode: 'insensitive',
      };
    }

    if (filtros?.tipoProducto) {
      where.tipo_producto = filtros.tipoProducto;
    }

    if (filtros?.visibleTiendaOnline !== undefined) {
      where.visible_tienda_online = filtros.visibleTiendaOnline;
    }

    if (filtros?.visiblePointOfSale !== undefined) {
      where.visible_point_of_sale = filtros.visiblePointOfSale;
    }

    if (filtros?.tags && filtros.tags.length > 0) {
      where.tags = {
        hasSome: filtros.tags,
      };
    }

    if (filtros?.fechaDesde || filtros?.fechaHasta) {
      where.fecha_creacion = {};
      if (filtros.fechaDesde) {
        where.fecha_creacion.gte = filtros.fechaDesde;
      }
      if (filtros.fechaHasta) {
        where.fecha_creacion.lte = filtros.fechaHasta;
      }
    }

    if (filtros?.inventarioBajo) {
      where.cantidad_inventario = {
        lte: 10, // Umbral de inventario bajo
      };
    }

    if (filtros?.conDescuento) {
      where.precio_comparacion = {
        not: null,
        gt: this.prisma.producto.fields.precio,
      } as any;
    }

    // Filtrar por categoría si se especifica
    if (filtros?.categoriaId) {
      where.categorias = {
        some: {
          categoria_id: filtros.categoriaId,
        },
      };
    }

    const [productosPrisma, total] = await Promise.all([
      this.prisma.producto.findMany({
        where,
        skip,
        take: limite,
        orderBy: {
          fecha_creacion: 'desc',
        },
        include: {
          categorias: {
            include: {
              categoria: true,
            },
          },
          variantes: true,
          imagenes: {
            orderBy: {
              orden: 'asc',
            },
          },
        },
      }),
      this.prisma.producto.count({ where }),
    ]);

    const productos = productosPrisma.map(productoPrisma => 
      this.aEntidad(productoPrisma)
    );

    return { productos, total };
  }

  async buscarPorTitulo(
    titulo: string,
    pagina: number,
    limite: number,
  ): Promise<{ productos: Producto[]; total: number }> {
    const skip = (pagina - 1) * limite;

    const where: any = {
      titulo: {
        contains: titulo,
        mode: 'insensitive',
      },
      estado: { not: 'ELIMINADO' },
    };

    const [productosPrisma, total] = await Promise.all([
      this.prisma.producto.findMany({
        where,
        skip,
        take: limite,
        orderBy: {
          fecha_creacion: 'desc',
        },
        include: {
          categorias: {
            include: {
              categoria: true,
            },
          },
          variantes: true,
          imagenes: {
            orderBy: {
              orden: 'asc',
            },
          },
        },
      }),
      this.prisma.producto.count({ where }),
    ]);

    const productos = productosPrisma.map(productoPrisma => 
      this.aEntidad(productoPrisma)
    );

    return { productos, total };
  }

  async listarPorCategoria(
    categoriaId: string,
    pagina: number,
    limite: number,
  ): Promise<{ productos: Producto[]; total: number }> {
    const skip = (pagina - 1) * limite;

    const where: any = {
      categorias: {
        some: {
          categoria_id: categoriaId,
        },
      },
      estado: { not: 'ELIMINADO' },
    };

    const [productosPrisma, total] = await Promise.all([
      this.prisma.producto.findMany({
        where,
        skip,
        take: limite,
        orderBy: {
          fecha_creacion: 'desc',
        },
        include: {
          categorias: {
            include: {
              categoria: true,
            },
          },
          variantes: true,
          imagenes: {
            orderBy: {
              orden: 'asc',
            },
          },
        },
      }),
      this.prisma.producto.count({ where }),
    ]);

    const productos = productosPrisma.map(productoPrisma => 
      this.aEntidad(productoPrisma)
    );

    return { productos, total };
  }

  async listarPorColeccion(
    coleccionId: string,
    pagina: number,
    limite: number,
  ): Promise<{ productos: Producto[]; total: number }> {
    const skip = (pagina - 1) * limite;

    const where: any = {
      colecciones: {
        some: {
          coleccion_id: coleccionId,
        },
      },
      estado: { not: 'ELIMINADO' },
    };

    const [productosPrisma, total] = await Promise.all([
      this.prisma.producto.findMany({
        where,
        skip,
        take: limite,
        orderBy: {
          fecha_creacion: 'desc',
        },
        include: {
          categorias: {
            include: {
              categoria: true,
            },
          },
          variantes: true,
          imagenes: {
            orderBy: {
              orden: 'asc',
            },
          },
        },
      }),
      this.prisma.producto.count({ where }),
    ]);

    const productos = productosPrisma.map(productoPrisma => 
      this.aEntidad(productoPrisma)
    );

    return { productos, total };
  }

  async listarPorProveedor(
    proveedor: string,
    pagina: number,
    limite: number,
  ): Promise<{ productos: Producto[]; total: number }> {
    const skip = (pagina - 1) * limite;

    const where: any = {
      proveedor: {
        contains: proveedor,
        mode: 'insensitive',
      },
      estado: { not: 'ELIMINADO' },
    };

    const [productosPrisma, total] = await Promise.all([
      this.prisma.producto.findMany({
        where,
        skip,
        take: limite,
        orderBy: {
          fecha_creacion: 'desc',
        },
        include: {
          categorias: {
            include: {
              categoria: true,
            },
          },
          variantes: true,
          imagenes: {
            orderBy: {
              orden: 'asc',
            },
          },
        },
      }),
      this.prisma.producto.count({ where }),
    ]);

    const productos = productosPrisma.map(productoPrisma => 
      this.aEntidad(productoPrisma)
    );

    return { productos, total };
  }

  async listarPorTags(
    tags: string[],
    pagina: number,
    limite: number,
  ): Promise<{ productos: Producto[]; total: number }> {
    const skip = (pagina - 1) * limite;

    const where: any = {
      tags: {
        hasSome: tags,
      },
      estado: { not: 'ELIMINADO' },
    };

    const [productosPrisma, total] = await Promise.all([
      this.prisma.producto.findMany({
        where,
        skip,
        take: limite,
        orderBy: {
          fecha_creacion: 'desc',
        },
        include: {
          categorias: {
            include: {
              categoria: true,
            },
          },
          variantes: true,
          imagenes: {
            orderBy: {
              orden: 'asc',
            },
          },
        },
      }),
      this.prisma.producto.count({ where }),
    ]);

    const productos = productosPrisma.map(productoPrisma => 
      this.aEntidad(productoPrisma)
    );

    return { productos, total };
  }

  async listarConInventarioBajo(
    umbral: number,
    pagina: number,
    limite: number,
  ): Promise<{ productos: Producto[]; total: number }> {
    const skip = (pagina - 1) * limite;

    const where: any = {
      inventario_gestionado: true,
      cantidad_inventario: {
        lte: umbral,
      },
      estado: { not: 'ELIMINADO' },
    };

    const [productosPrisma, total] = await Promise.all([
      this.prisma.producto.findMany({
        where,
        skip,
        take: limite,
        orderBy: {
          cantidad_inventario: 'asc',
        },
        include: {
          categorias: {
            include: {
              categoria: true,
            },
          },
          variantes: true,
          imagenes: {
            orderBy: {
              orden: 'asc',
            },
          },
        },
      }),
      this.prisma.producto.count({ where }),
    ]);

    const productos = productosPrisma.map(productoPrisma => 
      this.aEntidad(productoPrisma)
    );

    return { productos, total };
  }

  async listarArchivados(
    pagina: number,
    limite: number,
  ): Promise<{ productos: Producto[]; total: number }> {
    return this.listar(pagina, limite, { estado: 'ARCHIVADO' });
  }

  async listarPublicados(
    pagina: number,
    limite: number,
  ): Promise<{ productos: Producto[]; total: number }> {
    const where: any = {
      estado: 'ACTIVO',
      visible: true,
      fecha_publicacion: {
        lte: new Date(),
      },
    };

    const skip = (pagina - 1) * limite;

    const [productosPrisma, total] = await Promise.all([
      this.prisma.producto.findMany({
        where,
        skip,
        take: limite,
        orderBy: {
          fecha_publicacion: 'desc',
        },
        include: {
          categorias: {
            include: {
              categoria: true,
            },
          },
          variantes: true,
          imagenes: {
            orderBy: {
              orden: 'asc',
            },
          },
        },
      }),
      this.prisma.producto.count({ where }),
    ]);

    const productos = productosPrisma.map(productoPrisma => 
      this.aEntidad(productoPrisma)
    );

    return { productos, total };
  }

  async exportarCSV(filtros?: {
    tiendaId?: string;
    estado?: 'ACTIVO' | 'ARCHIVADO' | 'ELIMINADO';
    fechaDesde?: Date;
    fechaHasta?: Date;
    categoriaId?: string;
    proveedor?: string;
  }): Promise<string> {
    const where: any = {};

    if (filtros?.tiendaId) {
      where.tienda_id = filtros.tiendaId;
    }

    if (filtros?.estado) {
      where.estado = filtros.estado;
    }

    if (filtros?.fechaDesde || filtros?.fechaHasta) {
      where.fecha_creacion = {};
      if (filtros.fechaDesde) {
        where.fecha_creacion.gte = filtros.fechaDesde;
      }
      if (filtros.fechaHasta) {
        where.fecha_creacion.lte = filtros.fechaHasta;
      }
    }

    if (filtros?.proveedor) {
      where.proveedor = {
        contains: filtros.proveedor,
        mode: 'insensitive',
      };
    }

    if (filtros?.categoriaId) {
      where.categorias = {
        some: {
          categoria_id: filtros.categoriaId,
        },
      };
    }

    const productos = await this.prisma.producto.findMany({
      where,
      include: {
        categorias: {
          include: {
            categoria: true,
          },
        },
        variantes: true,
      },
    });

    // Encabezados del CSV
    const encabezados = [
      'ID',
      'Título',
      'Descripción',
      'Precio',
      'Precio Comparación',
      'SKU',
      'Código Barras',
      'Proveedor',
      'Estado',
      'Tipo Producto',
      'Inventario Gestionado',
      'Cantidad Inventario',
      'Permite Backorder',
      'Visible Tienda Online',
      'Visible Point of Sale',
      'Tags',
      'Meta Título',
      'Meta Descripción',
      'Slug',
      'Fecha Creación',
      'Fecha Publicación',
    ];

    // Datos del CSV
    const filas = productos.map(producto => [
      producto.id,
      `"${producto.titulo.replace(/"/g, '""')}"`,
      `"${(producto.descripcion || '').replace(/"/g, '""')}"`,
      producto.precio.toString(),
      producto.precio_comparacion?.toString() || '',
      producto.sku || '',
      producto.codigo_barras || '',
      producto.proveedor || '',
      producto.estado,
      producto.tipo_producto,
      producto.inventario_gestionado.toString(),
      producto.cantidad_inventario.toString(),
      producto.permite_backorder.toString(),
      producto.visible_tienda_online.toString(),
      producto.visible_point_of_sale.toString(),
      `"${producto.tags.join(', ')}"`,
      `"${(producto.metatitulo || '').replace(/"/g, '""')}"`,
      `"${(producto.metadescripcion || '').replace(/"/g, '""')}"`,
      producto.slug || '',
      producto.fecha_creacion.toISOString(),
      producto.fecha_publicacion?.toISOString() || '',
    ]);

    const contenidoCSV = [encabezados.join(',')]
      .concat(filas.map(fila => fila.join(',')))
      .join('\n');

    return contenidoCSV;
  }

  async importarCSV(
    csvData: string,
    tiendaId: string,
    creadorId: string,
  ): Promise<{ exitosos: number; fallidos: number; errores: string[] }> {
    const lineas = csvData.split('\n').filter(linea => linea.trim());
    const errores: string[] = [];
    let exitosos = 0;
    let fallidos = 0;

    // Saltar encabezado
    for (let i = 1; i < lineas.length; i++) {
      try {
        const campos = this.parsearLineaCSV(lineas[i]);
        
        // Validar campos obligatorios
        if (!campos[1]) { // Título
          throw new Error('El título es obligatorio');
        }

        if (!campos[3]) { // Precio
          throw new Error('El precio es obligatorio');
        }

        const productoData = {
          id: `prod-${Date.now()}-${i}`,
          titulo: campos[1],
          descripcion: campos[2] || null,
          precio: parseFloat(campos[3]),
          precio_comparacion: campos[4] ? parseFloat(campos[4]) : null,
          sku: campos[5] || null,
          codigo_barras: campos[6] || null,
          proveedor: campos[7] || null,
          estado: (campos[8] as 'ACTIVO' | 'ARCHIVADO' | 'ELIMINADO') || 'ACTIVO',
          tipo_producto: (campos[9] as 'FISICO' | 'DIGITAL' | 'SERVICIO') || 'FISICO',
          inventario_gestionado: campos[10] ? campos[10].toLowerCase() === 'true' : true,
          cantidad_inventario: campos[11] ? parseInt(campos[11]) : 0,
          permite_backorder: campos[12] ? campos[12].toLowerCase() === 'true' : false,
          visible_tienda_online: campos[13] ? campos[13].toLowerCase() === 'true' : true,
          visible_point_of_sale: campos[14] ? campos[14].toLowerCase() === 'true' : true,
          tags: campos[15] ? campos[15].split(',').map(tag => tag.trim()) : [],
          metatitulo: campos[16] || null,
          metadescripcion: campos[17] || null,
          slug: campos[18] || null,
          fecha_creacion: new Date(),
          fecha_actualizacion: new Date(),
          tienda_id: tiendaId,
          creador_id: creadorId,
          visible: true,
          peso: null,
          ancho: null,
          alto: null,
          profundidad: null,
          fecha_publicacion: campos[20] ? new Date(campos[20]) : null,
          fecha_archivado: null,
          fecha_eliminado: null,
        };

        await this.prisma.producto.create({
          data: productoData,
        });

        exitosos++;
      } catch (error) {
        fallidos++;
        const mensajeError = error instanceof Error ? error.message : 'Error desconocido';
        errores.push(`Línea ${i + 1}: ${mensajeError}`);
      }
    }

    return { exitosos, fallidos, errores };
  }

  async actualizarInventario(id: string, cantidad: number): Promise<Producto> {
    const productoPrisma = await this.prisma.producto.update({
      where: { id },
      data: {
        cantidad_inventario: cantidad,
        fecha_actualizacion: new Date(),
      },
      include: {
        categorias: {
          include: {
            categoria: true,
          },
        },
        variantes: true,
        imagenes: {
          orderBy: {
            orden: 'asc',
          },
        },
      },
    });

    return this.aEntidad(productoPrisma);
  }

  async actualizarVisibilidadCanales(
    id: string,
    tiendaOnline: boolean,
    pointOfSale: boolean,
  ): Promise<Producto> {
    const productoPrisma = await this.prisma.producto.update({
      where: { id },
      data: {
        visible_tienda_online: tiendaOnline,
        visible_point_of_sale: pointOfSale,
        fecha_actualizacion: new Date(),
      },
      include: {
        categorias: {
          include: {
            categoria: true,
          },
        },
        variantes: true,
        imagenes: {
          orderBy: {
            orden: 'asc',
          },
        },
      },
    });

    return this.aEntidad(productoPrisma);
  }

  async existeSku(sku: string, idExcluir?: string): Promise<boolean> {
    const where: any = {
      sku,
    };

    if (idExcluir) {
      where.id = { not: idExcluir };
    }

    const count = await this.prisma.producto.count({ where });
    return count > 0;
  }

  async existeSlug(slug: string, idExcluir?: string): Promise<boolean> {
    const where: any = {
      slug,
    };

    if (idExcluir) {
      where.id = { not: idExcluir };
    }

    const count = await this.prisma.producto.count({ where });
    return count > 0;
  }

  async obtenerEstadisticas(tiendaId: string): Promise<{
    total: number;
    activos: number;
    archivados: number;
    conInventarioBajo: number;
    publicados: number;
    porTipo: { [tipo: string]: number };
  }> {
    const [
      total,
      activos,
      archivados,
      conInventarioBajo,
      publicados,
      porTipo,
    ] = await Promise.all([
      this.prisma.producto.count({
        where: { tienda_id: tiendaId, estado: { not: 'ELIMINADO' } },
      }),
      this.prisma.producto.count({
        where: { tienda_id: tiendaId, estado: 'ACTIVO' },
      }),
      this.prisma.producto.count({
        where: { tienda_id: tiendaId, estado: 'ARCHIVADO' },
      }),
      this.prisma.producto.count({
        where: {
          tienda_id: tiendaId,
          estado: 'ACTIVO',
          inventario_gestionado: true,
          cantidad_inventario: { lte: 10 },
        },
      }),
      this.prisma.producto.count({
        where: {
          tienda_id: tiendaId,
          estado: 'ACTIVO',
          visible: true,
          fecha_publicacion: { lte: new Date() },
        },
      }),
      this.prisma.producto.groupBy({
        by: ['tipo_producto'],
        where: { tienda_id: tiendaId, estado: { not: 'ELIMINADO' } },
        _count: {
          tipo_producto: true,
        },
      }),
    ]);

    const porTipoResultado: { [tipo: string]: number } = {};
    porTipo.forEach(grupo => {
      porTipoResultado[grupo.tipo_producto] = grupo._count.tipo_producto;
    });

    return {
      total,
      activos,
      archivados,
      conInventarioBajo,
      publicados,
      porTipo: porTipoResultado,
    };
  }

  /**
   * Convierte un objeto Prisma a una entidad de dominio Producto
   */
  private aEntidad(productoPrisma: any): Producto {
    return new Producto(
      productoPrisma.id,
      productoPrisma.titulo,
      productoPrisma.descripcion,
      Number(productoPrisma.precio),
      productoPrisma.precio_comparacion ? Number(productoPrisma.precio_comparacion) : null,
      productoPrisma.sku,
      productoPrisma.codigo_barras,
      productoPrisma.peso ? Number(productoPrisma.peso) : null,
      productoPrisma.ancho ? Number(productoPrisma.ancho) : null,
      productoPrisma.alto ? Number(productoPrisma.alto) : null,
      productoPrisma.profundidad ? Number(productoPrisma.profundidad) : null,
      productoPrisma.visible,
      productoPrisma.fecha_creacion,
      productoPrisma.fecha_actualizacion,
      productoPrisma.creador_id,
      productoPrisma.tienda_id,
      productoPrisma.proveedor,
      productoPrisma.estado,
      productoPrisma.visible_tienda_online,
      productoPrisma.visible_point_of_sale,
      productoPrisma.tipo_producto,
      productoPrisma.requiere_envio,
      productoPrisma.inventario_gestionado,
      productoPrisma.cantidad_inventario,
      productoPrisma.permite_backorder,
      productoPrisma.tags,
      productoPrisma.metatitulo,
      productoPrisma.metadescripcion,
      productoPrisma.slug,
      productoPrisma.fecha_publicacion,
      productoPrisma.fecha_archivado,
      productoPrisma.fecha_eliminado,
    );
  }

  /**
   * Parsea una línea CSV considerando campos entre comillas
   */
  private parsearLineaCSV(linea: string): string[] {
    const resultado: string[] = [];
    let campoActual = '';
    let entreComillas = false;

    for (let i = 0; i < linea.length; i++) {
      const caracter = linea[i];

      if (caracter === '"') {
        entreComillas = !entreComillas;
      } else if (caracter === ',' && !entreComillas) {
        resultado.push(campoActual);
        campoActual = '';
      } else {
        campoActual += caracter;
      }
    }

    // Añadir el último campo
    resultado.push(campoActual);

    return resultado.map(campo => campo.replace(/^"|"$/g, ''));
  }
}