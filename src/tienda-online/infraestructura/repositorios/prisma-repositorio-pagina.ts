import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { Pagina } from '../../dominio/entidades/pagina.entity';
import { RepositorioPagina, OpcionesListadoPaginas, OpcionesListadoPublicas, ListadoPaginas, EstadisticasPaginas } from '../../dominio/interfaces/repositorio-pagina.interface';
import { ExcepcionDominio } from '../../../comun/excepciones/excepcion-dominio';

/**
 * Implementación del Repositorio de Páginas usando Prisma
 * Sigue el principio de inversión de dependencias (DIP)
 */
@Injectable()
export class PrismaRepositorioPagina implements RepositorioPagina {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Guarda una nueva página en el repositorio
   */
  async guardar(pagina: Pagina): Promise<Pagina> {
    try {
      const datosPagina = this.mapearPaginaADatos(pagina);
      
      const paginaGuardada = await this.prisma.pagina.create({
        data: datosPagina,
      });

      return this.mapearDatosAPagina(paginaGuardada);
    } catch (error) {
      if (error.code === 'P2002') {
        // Violación de unicidad (slug)
        throw ExcepcionDominio.duplicado('Ya existe una página con este slug', 'Pagina.SlugDuplicado');
      }
      throw ExcepcionDominio.Respuesta500(`Error al guardar la página: ${error.message}`, 'Pagina.ErrorGuardar');
    }
  }

  /**
   * Busca una página por su ID
   */
  async buscarPorId(id: string): Promise<Pagina | null> {
    try {
      const pagina = await this.prisma.pagina.findUnique({
        where: { id },
      });

      return pagina ? this.mapearDatosAPagina(pagina) : null;
    } catch (error) {
      throw ExcepcionDominio.Respuesta500(`Error al buscar página por ID: ${error.message}`, 'Pagina.ErrorBuscarPorId');
    }
  }

  /**
   * Busca una página por su slug
   */
  async buscarPorSlug(slug: string): Promise<Pagina | null> {
    try {
      const pagina = await this.prisma.pagina.findUnique({
        where: { slug },
      });

      return pagina ? this.mapearDatosAPagina(pagina) : null;
    } catch (error) {
      throw ExcepcionDominio.Respuesta500(`Error al buscar página por slug: ${error.message}`, 'Pagina.ErrorBuscarPorSlug');
    }
  }

  /**
   * Lista todas las páginas con opciones de paginación y filtrado
   */
  async listar(opciones: OpcionesListadoPaginas = {}): Promise<ListadoPaginas> {
    try {
      const {
        pagina = 1,
        limite = 10,
        ordenarPor = 'fecha_creacion',
        orden = 'DESC',
        buscar,
        visible,
        autorId,
        tiendaId,
        fechaDesde,
        fechaHasta,
      } = opciones;

      const skip = (pagina - 1) * limite;

      // Construir filtros
      const where: any = {};

      if (buscar) {
        where.OR = [
          { titulo: { contains: buscar, mode: 'insensitive' } },
          { contenido: { contains: buscar, mode: 'insensitive' } },
        ];
      }

      if (visible !== undefined) {
        where.visible = visible;
      }

      if (autorId) {
        where.autorId = autorId;
      }

      if (tiendaId) {
        where.tiendaId = tiendaId;
      }

      if (fechaDesde || fechaHasta) {
        where.fecha_creacion = {};
        if (fechaDesde) {
          where.fecha_creacion.gte = fechaDesde;
        }
        if (fechaHasta) {
          where.fecha_creacion.lte = fechaHasta;
        }
      }

      // Ejecutar consulta
      const [paginas, totalElementos] = await Promise.all([
        this.prisma.pagina.findMany({
          where,
          skip,
          take: limite,
          orderBy: { [ordenarPor]: orden },
        }),
        this.prisma.pagina.count({ where }),
      ]);

      const totalPaginas = Math.ceil(totalElementos / limite);
      const tieneSiguiente = pagina < totalPaginas;
      const tieneAnterior = pagina > 1;

      return {
        paginas: paginas.map(pagina => this.mapearDatosAPagina(pagina)),
        paginacion: {
          totalElementos,
          totalPaginas,
          paginaActual: pagina,
          limite,
          tieneSiguiente,
          tieneAnterior,
        },
      };
    } catch (error) {
      throw ExcepcionDominio.Respuesta500(`Error al listar páginas: ${error.message}`, 'Pagina.ErrorListar');
    }
  }

  /**
   * Lista páginas por tienda
   */
  async listarPorTienda(tiendaId: string, opciones: OpcionesListadoPaginas = {}): Promise<ListadoPaginas> {
    return this.listar({
      ...opciones,
      tiendaId,
    });
  }

  /**
   * Lista páginas por autor
   */
  async listarPorAutor(autorId: string, opciones: OpcionesListadoPaginas = {}): Promise<ListadoPaginas> {
    return this.listar({
      ...opciones,
      autorId,
    });
  }

  /**
   * Lista páginas públicas (visibles)
   */
  async listarPublicas(opciones: OpcionesListadoPublicas = {}): Promise<ListadoPaginas> {
    return this.listar({
      ...opciones,
      visible: true,
    });
  }

  /**
   * Lista páginas públicas por tienda
   */
  async listarPublicasPorTienda(tiendaId: string, opciones: OpcionesListadoPublicas = {}): Promise<ListadoPaginas> {
    return this.listar({
      ...opciones,
      tiendaId,
      visible: true,
    });
  }

  /**
   * Verifica si existe una página con un slug específico
   */
  async existeConSlug(slug: string, excluirId?: string): Promise<boolean> {
    try {
      const where: any = { slug };
      
      if (excluirId) {
        where.NOT = { id: excluirId };
      }

      const count = await this.prisma.pagina.count({ where });
      return count > 0;
    } catch (error) {
      throw ExcepcionDominio.Respuesta500(`Error al verificar existencia de slug: ${error.message}`, 'Pagina.ErrorVerificarSlug');
    }
  }

  /**
   * Elimina una página por su ID
   */
  async eliminar(id: string): Promise<void> {
    try {
      await this.prisma.pagina.delete({
        where: { id },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw ExcepcionDominio.Respuesta404('La página no existe', 'Pagina.NoEncontrada');
      }
      throw ExcepcionDominio.Respuesta500(`Error al eliminar página: ${error.message}`, 'Pagina.ErrorEliminar');
    }
  }

  /**
   * Obtiene estadísticas de páginas por tienda
   */
  async obtenerEstadisticasPorTienda(tiendaId: string): Promise<EstadisticasPaginas> {
    try {
      const [totalPaginas, paginasPublicas, paginasOcultas, paginasRecientes, autorMasActivo] = await Promise.all([
        // Total de páginas
        this.prisma.pagina.count({
          where: { tiendaId },
        }),

        // Páginas públicas
        this.prisma.pagina.count({
          where: { tiendaId, visible: true },
        }),

        // Páginas ocultas
        this.prisma.pagina.count({
          where: { tiendaId, visible: false },
        }),

        // Páginas recientes (últimos 7 días)
        this.prisma.pagina.count({
          where: {
            tiendaId,
            fecha_creacion: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            },
          },
        }),

        // Autor más activo
        this.prisma.pagina.groupBy({
          by: ['autorId'],
          where: { tiendaId },
          _count: {
            autorId: true,
          },
          orderBy: {
            _count: {
              autorId: 'desc',
            },
          },
          take: 1,
        }),
      ]);

      const estadisticas: EstadisticasPaginas = {
        totalPaginas,
        paginasPublicas,
        paginasOcultas,
        paginasRecientes,
      };

      // Agregar autor más activo si existe
      if (autorMasActivo.length > 0) {
        estadisticas.autorMasActivo = {
          autorId: autorMasActivo[0].autorId,
          totalPaginas: autorMasActivo[0]._count.autorId,
        };
      }

      return estadisticas;
    } catch (error) {
      throw ExcepcionDominio.Respuesta500(`Error al obtener estadísticas: ${error.message}`, 'Pagina.ErrorEstadisticas');
    }
  }

  /**
   * Mapea la entidad Pagina a datos de Prisma
   */
  private mapearPaginaADatos(pagina: Pagina): any {
    return {
      id: pagina.id,
      titulo: pagina.titulo,
      contenido: pagina.contenido,
      slug: pagina.slug,
      meta_titulo: pagina.metaTitulo,
      meta_descripcion: pagina.metaDescripcion,
      visible: pagina.visible,
      fecha_creacion: pagina.fechaCreacion,
      fecha_actualizacion: pagina.fechaActualizacion,
      fecha_publicacion: pagina.fechaPublicacion,
      autorId: pagina.autorId,
      tiendaId: pagina.tiendaId,
    };
  }

  /**
   * Mapea datos de Prisma a la entidad Pagina
   */
  private mapearDatosAPagina(datos: any): Pagina {
    return Pagina.reconstruir(
      datos.id,
      datos.titulo,
      datos.contenido,
      datos.slug,
      datos.meta_titulo,
      datos.meta_descripcion,
      datos.visible,
      datos.fecha_creacion,
      datos.fecha_actualizacion,
      datos.fecha_publicacion,
      datos.autorId,
      datos.tiendaId,
    );
  }
}