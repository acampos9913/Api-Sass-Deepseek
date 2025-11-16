import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { RepositorioColeccion } from '../../dominio/interfaces/repositorio-coleccion.interface';
import { Coleccion } from '../../dominio/entidades/coleccion.entity';

/**
 * Repositorio de colecciones con Prisma
 * Implementa todas las funcionalidades avanzadas tipo Shopify
 * Incluye gestión de colecciones manuales y automáticas, exportación/importación CSV, etc.
 */
@Injectable()
export class PrismaRepositorioColeccion implements RepositorioColeccion {
  constructor(private readonly prisma: PrismaService) {}

  async buscarPorId(id: string): Promise<Coleccion | null> {
    const coleccionPrisma = await this.prisma.coleccion.findUnique({
      where: { id },
      include: {
        productos: {
          include: {
            producto: {
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
            },
          },
          orderBy: {
            orden: 'asc',
          },
        },
      },
    });

    if (!coleccionPrisma) {
      return null;
    }

    return this.aEntidad(coleccionPrisma);
  }

  async buscarPorSlug(slug: string): Promise<Coleccion | null> {
    const coleccionPrisma = await this.prisma.coleccion.findUnique({
      where: { slug },
      include: {
        productos: {
          include: {
            producto: {
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
            },
          },
          orderBy: {
            orden: 'asc',
          },
        },
      },
    });

    if (!coleccionPrisma) {
      return null;
    }

    return this.aEntidad(coleccionPrisma);
  }

  async guardar(coleccion: Coleccion): Promise<Coleccion> {
    const coleccionPrisma = await this.prisma.coleccion.create({
      data: {
        id: coleccion.id,
        nombre: coleccion.nombre,
        descripcion: coleccion.descripcion,
        slug: coleccion.slug,
        imagen_url: coleccion.imagenUrl,
        estado: coleccion.estado,
        tipo: coleccion.tipo,
        reglas: coleccion.reglas,
        visible_tienda_online: coleccion.visibleTiendaOnline,
        visible_point_of_sale: coleccion.visiblePointOfSale,
        fecha_creacion: coleccion.fechaCreacion,
        fecha_actualizacion: coleccion.fechaActualizacion,
        tienda_id: coleccion.tiendaId,
        creador_id: coleccion.creadorId,
      },
      include: {
        productos: {
          include: {
            producto: {
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
            },
          },
          orderBy: {
            orden: 'asc',
          },
        },
      },
    });

    return this.aEntidad(coleccionPrisma);
  }

  async actualizar(coleccion: Coleccion): Promise<Coleccion> {
    const coleccionPrisma = await this.prisma.coleccion.update({
      where: { id: coleccion.id },
      data: {
        nombre: coleccion.nombre,
        descripcion: coleccion.descripcion,
        slug: coleccion.slug,
        imagen_url: coleccion.imagenUrl,
        estado: coleccion.estado,
        tipo: coleccion.tipo,
        reglas: coleccion.reglas,
        visible_tienda_online: coleccion.visibleTiendaOnline,
        visible_point_of_sale: coleccion.visiblePointOfSale,
        fecha_actualizacion: coleccion.fechaActualizacion,
      },
      include: {
        productos: {
          include: {
            producto: {
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
            },
          },
          orderBy: {
            orden: 'asc',
          },
        },
      },
    });

    return this.aEntidad(coleccionPrisma);
  }

  async eliminar(id: string): Promise<void> {
    await this.prisma.coleccion.update({
      where: { id },
      data: {
        estado: 'ELIMINADA',
        fecha_actualizacion: new Date(),
      },
    });
  }

  async archivar(id: string): Promise<Coleccion> {
    const coleccionPrisma = await this.prisma.coleccion.update({
      where: { id },
      data: {
        estado: 'ARCHIVADA',
        fecha_actualizacion: new Date(),
      },
      include: {
        productos: {
          include: {
            producto: {
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
            },
          },
          orderBy: {
            orden: 'asc',
          },
        },
      },
    });

    return this.aEntidad(coleccionPrisma);
  }

  async desarchivar(id: string): Promise<Coleccion> {
    const coleccionPrisma = await this.prisma.coleccion.update({
      where: { id },
      data: {
        estado: 'ACTIVA',
        fecha_actualizacion: new Date(),
      },
      include: {
        productos: {
          include: {
            producto: {
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
            },
          },
          orderBy: {
            orden: 'asc',
          },
        },
      },
    });

    return this.aEntidad(coleccionPrisma);
  }

  async duplicar(id: string): Promise<Coleccion> {
    const coleccionOriginal = await this.buscarPorId(id);
    if (!coleccionOriginal) {
      throw new Error('Colección no encontrada');
    }

    const coleccionDuplicada = coleccionOriginal.duplicar();
    return this.guardar(coleccionDuplicada);
  }

  async listar(
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
    const skip = (pagina - 1) * limite;
    
    const where: any = {};

    if (filtros?.tiendaId) {
      where.tienda_id = filtros.tiendaId;
    }

    if (filtros?.estado) {
      where.estado = filtros.estado;
    } else {
      where.estado = { not: 'ELIMINADA' };
    }

    if (filtros?.nombre) {
      where.nombre = {
        contains: filtros.nombre,
        mode: 'insensitive',
      };
    }

    if (filtros?.tipo) {
      where.tipo = filtros.tipo;
    }

    if (filtros?.visibleTiendaOnline !== undefined) {
      where.visible_tienda_online = filtros.visibleTiendaOnline;
    }

    if (filtros?.visiblePointOfSale !== undefined) {
      where.visible_point_of_sale = filtros.visiblePointOfSale;
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

    const [coleccionesPrisma, total] = await Promise.all([
      this.prisma.coleccion.findMany({
        where,
        skip,
        take: limite,
        orderBy: {
          fecha_creacion: 'desc',
        },
        include: {
          productos: {
            include: {
              producto: {
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
              },
            },
            orderBy: {
              orden: 'asc',
            },
          },
        },
      }),
      this.prisma.coleccion.count({ where }),
    ]);

    const colecciones = coleccionesPrisma.map(coleccionPrisma => 
      this.aEntidad(coleccionPrisma)
    );

    return { colecciones, total };
  }

  async buscarPorNombre(
    nombre: string,
    pagina: number,
    limite: number,
  ): Promise<{ colecciones: Coleccion[]; total: number }> {
    const skip = (pagina - 1) * limite;

    const where: any = {
      nombre: {
        contains: nombre,
        mode: 'insensitive',
      },
      estado: { not: 'ELIMINADA' },
    };

    const [coleccionesPrisma, total] = await Promise.all([
      this.prisma.coleccion.findMany({
        where,
        skip,
        take: limite,
        orderBy: {
          fecha_creacion: 'desc',
        },
        include: {
          productos: {
            include: {
              producto: {
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
              },
            },
            orderBy: {
              orden: 'asc',
            },
          },
        },
      }),
      this.prisma.coleccion.count({ where }),
    ]);

    const colecciones = coleccionesPrisma.map(coleccionPrisma => 
      this.aEntidad(coleccionPrisma)
    );

    return { colecciones, total };
  }

  async listarPorTipo(
    tipo: 'MANUAL' | 'AUTOMATICA',
    pagina: number,
    limite: number,
  ): Promise<{ colecciones: Coleccion[]; total: number }> {
    return this.listar(pagina, limite, { tipo });
  }

  async listarArchivadas(
    pagina: number,
    limite: number,
  ): Promise<{ colecciones: Coleccion[]; total: number }> {
    return this.listar(pagina, limite, { estado: 'ARCHIVADA' });
  }

  async listarActivas(
    pagina: number,
    limite: number,
  ): Promise<{ colecciones: Coleccion[]; total: number }> {
    return this.listar(pagina, limite, { estado: 'ACTIVA' });
  }

  async agregarProducto(
    coleccionId: string,
    productoId: string,
    orden?: number,
  ): Promise<void> {
    // Verificar que la colección es manual
    const coleccion = await this.prisma.coleccion.findUnique({
      where: { id: coleccionId },
    });

    if (!coleccion) {
      throw new Error('Colección no encontrada');
    }

    if (coleccion.tipo !== 'MANUAL') {
      throw new Error('Solo se pueden agregar productos a colecciones manuales');
    }

    // Obtener el máximo orden actual
    const maxOrden = await this.prisma.productoColeccion.aggregate({
      where: { coleccion_id: coleccionId },
      _max: { orden: true },
    });

    const nuevoOrden = orden !== undefined ? orden : (maxOrden._max.orden || 0) + 1;

    await this.prisma.productoColeccion.create({
      data: {
        producto_id: productoId,
        coleccion_id: coleccionId,
        orden: nuevoOrden,
        fecha_agregado: new Date(),
      },
    });
  }

  async eliminarProducto(coleccionId: string, productoId: string): Promise<void> {
    await this.prisma.productoColeccion.deleteMany({
      where: {
        coleccion_id: coleccionId,
        producto_id: productoId,
      },
    });
  }

  async actualizarOrdenProductos(
    coleccionId: string,
    productosOrden: Array<{ productoId: string; orden: number }>,
  ): Promise<void> {
    // Verificar que la colección es manual
    const coleccion = await this.prisma.coleccion.findUnique({
      where: { id: coleccionId },
    });

    if (!coleccion) {
      throw new Error('Colección no encontrada');
    }

    if (coleccion.tipo !== 'MANUAL') {
      throw new Error('Solo se puede actualizar el orden en colecciones manuales');
    }

    // Actualizar el orden de cada producto en una transacción
    await this.prisma.$transaction(
      productosOrden.map(({ productoId, orden }) =>
        this.prisma.productoColeccion.updateMany({
          where: {
            coleccion_id: coleccionId,
            producto_id: productoId,
          },
          data: { orden },
        })
      )
    );
  }

  async obtenerProductos(
    coleccionId: string,
    pagina: number,
    limite: number,
  ): Promise<{ productos: any[]; total: number }> {
    const skip = (pagina - 1) * limite;

    const [productosPrisma, total] = await Promise.all([
      this.prisma.productoColeccion.findMany({
        where: { coleccion_id: coleccionId },
        skip,
        take: limite,
        orderBy: { orden: 'asc' },
        include: {
          producto: {
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
          },
        },
      }),
      this.prisma.productoColeccion.count({
        where: { coleccion_id: coleccionId },
      }),
    ]);

    const productos = productosPrisma.map(pc => ({
      ...pc.producto,
      orden: pc.orden,
      fechaAgregado: pc.fecha_agregado,
    }));

    return { productos, total };
  }

  async exportarCSV(filtros?: {
    tiendaId?: string;
    estado?: 'ACTIVA' | 'ARCHIVADA' | 'ELIMINADA';
    tipo?: 'MANUAL' | 'AUTOMATICA';
    fechaDesde?: Date;
    fechaHasta?: Date;
  }): Promise<string> {
    const where: any = {};

    if (filtros?.tiendaId) {
      where.tienda_id = filtros.tiendaId;
    }

    if (filtros?.estado) {
      where.estado = filtros.estado;
    }

    if (filtros?.tipo) {
      where.tipo = filtros.tipo;
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

    const colecciones = await this.prisma.coleccion.findMany({
      where,
      include: {
        productos: {
          include: {
            producto: true,
          },
        },
      },
    });

    // Encabezados del CSV
    const encabezados = [
      'ID',
      'Nombre',
      'Descripción',
      'Slug',
      'Tipo',
      'Estado',
      'Visible Tienda Online',
      'Visible Point of Sale',
      'Número de Productos',
      'Fecha Creación',
      'Fecha Actualización',
    ];

    // Datos del CSV
    const filas = colecciones.map(coleccion => [
      coleccion.id,
      `"${coleccion.nombre.replace(/"/g, '""')}"`,
      `"${(coleccion.descripcion || '').replace(/"/g, '""')}"`,
      coleccion.slug,
      coleccion.tipo,
      coleccion.estado,
      coleccion.visible_tienda_online.toString(),
      coleccion.visible_point_of_sale.toString(),
      coleccion.productos.length.toString(),
      coleccion.fecha_creacion.toISOString(),
      coleccion.fecha_actualizacion.toISOString(),
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
        if (!campos[1]) { // Nombre
          throw new Error('El nombre es obligatorio');
        }

        const coleccionData: any = {
          id: `col-${Date.now()}-${i}`,
          nombre: campos[1],
          descripcion: campos[2] || null,
          slug: campos[3] || Coleccion.generarSlug(campos[1]),
          tipo: (campos[4] as 'MANUAL' | 'AUTOMATICA') || 'MANUAL',
          estado: (campos[5] as 'ACTIVA' | 'ARCHIVADA' | 'ELIMINADA') || 'ACTIVA',
          visible_tienda_online: campos[6] ? campos[6].toLowerCase() === 'true' : true,
          visible_point_of_sale: campos[7] ? campos[7].toLowerCase() === 'true' : true,
          fecha_creacion: new Date(),
          fecha_actualizacion: new Date(),
          tienda_id: tiendaId,
          creador_id: creadorId,
          imagen_url: null,
          reglas: null as any,
        };

        await this.prisma.coleccion.create({
          data: coleccionData as any,
        });

        exitosos++;
      } catch (error) {
        fallidos++;
        errores.push(`Línea ${i + 1}: ${error.message}`);
      }
    }

    return { exitosos, fallidos, errores };
  }

  async actualizarVisibilidadCanales(
    id: string,
    tiendaOnline: boolean,
    pointOfSale: boolean,
  ): Promise<Coleccion> {
    const coleccionPrisma = await this.prisma.coleccion.update({
      where: { id },
      data: {
        visible_tienda_online: tiendaOnline,
        visible_point_of_sale: pointOfSale,
        fecha_actualizacion: new Date(),
      },
      include: {
        productos: {
          include: {
            producto: {
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
            },
          },
          orderBy: {
            orden: 'asc',
          },
        },
      },
    });

    return this.aEntidad(coleccionPrisma);
  }

  async existeSlug(slug: string, idExcluir?: string): Promise<boolean> {
    const where: any = {
      slug,
    };

    if (idExcluir) {
      where.id = { not: idExcluir };
    }

    const count = await this.prisma.coleccion.count({ where });
    return count > 0;
  }

  async obtenerEstadisticas(tiendaId: string): Promise<{
    total: number;
    activas: number;
    archivadas: number;
    manuales: number;
    automaticas: number;
    conProductos: number;
    promedioProductos: number;
  }> {
    const [
      total,
      activas,
      archivadas,
      manuales,
      automaticas,
      conProductos,
      promedioProductos,
    ] = await Promise.all([
      this.prisma.coleccion.count({
        where: { tienda_id: tiendaId, estado: { not: 'ELIMINADA' } },
      }),
      this.prisma.coleccion.count({
        where: { tienda_id: tiendaId, estado: 'ACTIVA' },
      }),
      this.prisma.coleccion.count({
        where: { tienda_id: tiendaId, estado: 'ARCHIVADA' },
      }),
      this.prisma.coleccion.count({
        where: { tienda_id: tiendaId, tipo: 'MANUAL', estado: { not: 'ELIMINADA' } },
      }),
      this.prisma.coleccion.count({
        where: { tienda_id: tiendaId, tipo: 'AUTOMATICA', estado: { not: 'ELIMINADA' } },
      }),
      this.prisma.coleccion.count({
        where: {
          tienda_id: tiendaId,
          estado: { not: 'ELIMINADA' },
          productos: {
            some: {},
          },
        },
      }),
      this.prisma.productoColeccion.aggregate({
        where: {
          coleccion: {
            tienda_id: tiendaId,
            estado: { not: 'ELIMINADA' },
          },
        },
        _avg: {
          orden: true,
        },
      }),
    ]);

    return {
      total,
      activas,
      archivadas,
      manuales,
      automaticas,
      conProductos,
      promedioProductos: promedioProductos._avg.orden || 0,
    };
  }

  async ejecutarReglasAutomaticas(coleccionId: string): Promise<{
    productosAgregados: number;
    productosEliminados: number;
    totalProductos: number;
  }> {
    const coleccion = await this.prisma.coleccion.findUnique({
      where: { id: coleccionId },
      include: {
        productos: true,
      },
    });

    if (!coleccion) {
      throw new Error('Colección no encontrada');
    }

    if (coleccion.tipo !== 'AUTOMATICA') {
      throw new Error('Solo se pueden ejecutar reglas en colecciones automáticas');
    }

    if (!coleccion.reglas) {
      throw new Error('La colección automática no tiene reglas definidas');
    }

    // Aquí se implementaría la lógica para aplicar las reglas y actualizar los productos
    // Por ahora, retornamos un placeholder
    return {
      productosAgregados: 0,
      productosEliminados: 0,
      totalProductos: coleccion.productos.length,
    };
  }

  /**
   * Convierte un objeto Prisma a una entidad de dominio Coleccion
   */
  private aEntidad(coleccionPrisma: any): Coleccion {
    return new Coleccion(
      coleccionPrisma.id,
      coleccionPrisma.nombre,
      coleccionPrisma.descripcion,
      coleccionPrisma.slug,
      coleccionPrisma.imagen_url,
      coleccionPrisma.estado,
      coleccionPrisma.tipo,
      coleccionPrisma.reglas,
      coleccionPrisma.visible_tienda_online,
      coleccionPrisma.visible_point_of_sale,
      coleccionPrisma.fecha_creacion,
      coleccionPrisma.fecha_actualizacion,
      coleccionPrisma.tienda_id,
      coleccionPrisma.creador_id,
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