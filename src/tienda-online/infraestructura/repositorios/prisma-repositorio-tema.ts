import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { Tema } from '../../dominio/entidades/tema.entity';
import { RepositorioTema, OpcionesListadoTemas, ListadoTemas, EstadisticasTemas } from '../../dominio/interfaces/repositorio-tema.interface';
import { ExcepcionDominio } from '../../../comun/excepciones/excepcion-dominio';

/**
 * Implementación del Repositorio de Temas usando Prisma
 * Sigue el principio de inversión de dependencias (DIP)
 */
@Injectable()
export class PrismaRepositorioTema implements RepositorioTema {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Guarda un nuevo tema en el repositorio
   */
  async guardar(tema: Tema): Promise<Tema> {
    try {
      const datosTema = this.mapearTemaADatos(tema);
      
      const temaGuardado = await this.prisma.tema.create({
        data: datosTema,
      });

      return this.mapearDatosATema(temaGuardado);
    } catch (error) {
      throw ExcepcionDominio.Respuesta500(`Error al guardar el tema: ${error.message}`, 'Tema.ErrorGuardar');
    }
  }

  /**
   * Busca un tema por su ID
   */
  async buscarPorId(id: string): Promise<Tema | null> {
    try {
      const tema = await this.prisma.tema.findUnique({
        where: { id },
      });

      return tema ? this.mapearDatosATema(tema) : null;
    } catch (error) {
      throw ExcepcionDominio.Respuesta500(`Error al buscar tema por ID: ${error.message}`, 'Tema.ErrorBuscarPorId');
    }
  }

  /**
   * Lista todos los temas con opciones de paginación y filtrado
   */
  async listar(opciones: OpcionesListadoTemas = {}): Promise<ListadoTemas> {
    try {
      const {
        pagina = 1,
        limite = 10,
        ordenarPor = 'fecha_creacion',
        orden = 'DESC',
        buscar,
        activo,
        esPredeterminado,
        creadorId,
        tiendaId,
        fechaDesde,
        fechaHasta,
      } = opciones;

      const skip = (pagina - 1) * limite;

      // Construir filtros
      const where: any = {};

      if (buscar) {
        where.OR = [
          { nombre: { contains: buscar, mode: 'insensitive' } },
          { descripcion: { contains: buscar, mode: 'insensitive' } },
        ];
      }

      if (activo !== undefined) {
        where.activo = activo;
      }

      if (esPredeterminado !== undefined) {
        where.es_predeterminado = esPredeterminado;
      }

      if (creadorId) {
        where.creadorId = creadorId;
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
      const [temas, totalElementos] = await Promise.all([
        this.prisma.tema.findMany({
          where,
          skip,
          take: limite,
          orderBy: { [ordenarPor]: orden },
        }),
        this.prisma.tema.count({ where }),
      ]);

      const totalPaginas = Math.ceil(totalElementos / limite);
      const tieneSiguiente = pagina < totalPaginas;
      const tieneAnterior = pagina > 1;

      return {
        temas: temas.map(tema => this.mapearDatosATema(tema)),
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
      throw ExcepcionDominio.Respuesta500(`Error al listar temas: ${error.message}`, 'Tema.ErrorListar');
    }
  }

  /**
   * Lista temas por tienda
   */
  async listarPorTienda(tiendaId: string, opciones: OpcionesListadoTemas = {}): Promise<ListadoTemas> {
    return this.listar({
      ...opciones,
      tiendaId,
    });
  }

  /**
   * Lista temas por creador
   */
  async listarPorCreador(creadorId: string, opciones: OpcionesListadoTemas = {}): Promise<ListadoTemas> {
    return this.listar({
      ...opciones,
      creadorId,
    });
  }

  /**
   * Obtiene el tema activo de una tienda
   */
  async obtenerTemaActivo(tiendaId: string): Promise<Tema | null> {
    try {
      const tema = await this.prisma.tema.findFirst({
        where: {
          tiendaId,
          activo: true,
        },
      });

      return tema ? this.mapearDatosATema(tema) : null;
    } catch (error) {
      throw ExcepcionDominio.Respuesta500(`Error al obtener tema activo: ${error.message}`, 'Tema.ErrorObtenerActivo');
    }
  }

  /**
   * Obtiene el tema predeterminado de una tienda
   */
  async obtenerTemaPredeterminado(tiendaId: string): Promise<Tema | null> {
    try {
      const tema = await this.prisma.tema.findFirst({
        where: {
          tiendaId,
          es_predeterminado: true,
        },
      });

      return tema ? this.mapearDatosATema(tema) : null;
    } catch (error) {
      throw ExcepcionDominio.Respuesta500(`Error al obtener tema predeterminado: ${error.message}`, 'Tema.ErrorObtenerPredeterminado');
    }
  }

  /**
   * Verifica si existe un tema activo para una tienda
   */
  async existeTemaActivo(tiendaId: string): Promise<boolean> {
    try {
      const count = await this.prisma.tema.count({
        where: {
          tiendaId,
          activo: true,
        },
      });
      return count > 0;
    } catch (error) {
      throw ExcepcionDominio.Respuesta500(`Error al verificar existencia de tema activo: ${error.message}`, 'Tema.ErrorVerificarActivo');
    }
  }

  /**
   * Verifica si existe un tema predeterminado para una tienda
   */
  async existeTemaPredeterminado(tiendaId: string): Promise<boolean> {
    try {
      const count = await this.prisma.tema.count({
        where: {
          tiendaId,
          es_predeterminado: true,
        },
      });
      return count > 0;
    } catch (error) {
      throw ExcepcionDominio.Respuesta500(`Error al verificar existencia de tema predeterminado: ${error.message}`, 'Tema.ErrorVerificarPredeterminado');
    }
  }

  /**
   * Elimina un tema por su ID
   */
  async eliminar(id: string): Promise<void> {
    try {
      await this.prisma.tema.delete({
        where: { id },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw ExcepcionDominio.Respuesta404('El tema no existe', 'Tema.NoEncontrado');
      }
      throw ExcepcionDominio.Respuesta500(`Error al eliminar tema: ${error.message}`, 'Tema.ErrorEliminar');
    }
  }

  /**
   * Obtiene estadísticas de temas por tienda
   */
  async obtenerEstadisticasPorTienda(tiendaId: string): Promise<EstadisticasTemas> {
    try {
      const [totalTemas, temasActivos, temasInactivos, temasPredeterminados, temasRecientes, creadorMasActivo] = await Promise.all([
        // Total de temas
        this.prisma.tema.count({
          where: { tiendaId },
        }),

        // Temas activos
        this.prisma.tema.count({
          where: { tiendaId, activo: true },
        }),

        // Temas inactivos
        this.prisma.tema.count({
          where: { tiendaId, activo: false },
        }),

        // Temas predeterminados
        this.prisma.tema.count({
          where: { tiendaId, es_predeterminado: true },
        }),

        // Temas recientes (últimos 7 días)
        this.prisma.tema.count({
          where: {
            tiendaId,
            fecha_creacion: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            },
          },
        }),

        // Creador más activo
        this.prisma.tema.groupBy({
          by: ['creadorId'],
          where: { tiendaId },
          _count: {
            creadorId: true,
          },
          orderBy: {
            _count: {
              creadorId: 'desc',
            },
          },
          take: 1,
        }),
      ]);

      const estadisticas: EstadisticasTemas = {
        totalTemas,
        temasActivos,
        temasInactivos,
        temasPredeterminados,
        temasRecientes,
      };

      // Agregar creador más activo si existe
      if (creadorMasActivo.length > 0) {
        estadisticas.creadorMasActivo = {
          creadorId: creadorMasActivo[0].creadorId,
          totalTemas: creadorMasActivo[0]._count.creadorId,
        };
      }

      return estadisticas;
    } catch (error) {
      throw ExcepcionDominio.Respuesta500(`Error al obtener estadísticas: ${error.message}`, 'Tema.ErrorEstadisticas');
    }
  }

  /**
   * Desactiva todos los temas de una tienda (excepto el especificado)
   */
  async desactivarTodosLosTemas(tiendaId: string, excluirId?: string): Promise<void> {
    try {
      const where: any = {
        tiendaId,
        activo: true,
      };

      if (excluirId) {
        where.NOT = { id: excluirId };
      }

      await this.prisma.tema.updateMany({
        where,
        data: {
          activo: false,
          fecha_actualizacion: new Date(),
        },
      });
    } catch (error) {
      throw ExcepcionDominio.Respuesta500(`Error al desactivar temas: ${error.message}`, 'Tema.ErrorDesactivar');
    }
  }

  /**
   * Quita el estado predeterminado de todos los temas de una tienda (excepto el especificado)
   */
  async quitarPredeterminadoDeTodosLosTemas(tiendaId: string, excluirId?: string): Promise<void> {
    try {
      const where: any = {
        tiendaId,
        es_predeterminado: true,
      };

      if (excluirId) {
        where.NOT = { id: excluirId };
      }

      await this.prisma.tema.updateMany({
        where,
        data: {
          es_predeterminado: false,
          fecha_actualizacion: new Date(),
        },
      });
    } catch (error) {
      throw ExcepcionDominio.Respuesta500(`Error al quitar predeterminado de temas: ${error.message}`, 'Tema.ErrorQuitarPredeterminado');
    }
  }

  /**
   * Mapea la entidad Tema a datos de Prisma
   */
  private mapearTemaADatos(tema: Tema): any {
    return {
      id: tema.id,
      nombre: tema.nombre,
      descripcion: tema.descripcion,
      activo: tema.activo,
      es_predeterminado: tema.esPredeterminado,
      configuracion: tema.configuracion,
      fecha_creacion: tema.fechaCreacion,
      fecha_actualizacion: tema.fechaActualizacion,
      tiendaId: tema.tiendaId,
      creadorId: tema.creadorId,
    };
  }

  /**
   * Mapea datos de Prisma a la entidad Tema
   */
  private mapearDatosATema(datos: any): Tema {
    return Tema.reconstruir(
      datos.id,
      datos.nombre,
      datos.descripcion,
      datos.activo,
      datos.es_predeterminado,
      datos.configuracion,
      datos.fecha_creacion,
      datos.fecha_actualizacion,
      datos.tiendaId,
      datos.creadorId,
    );
  }
}