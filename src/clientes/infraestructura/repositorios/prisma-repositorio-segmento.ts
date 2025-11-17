/**
 * Implementación del repositorio de Segmentos usando Prisma
 * Sigue los principios de Arquitectura Limpia - implementa la interfaz del Dominio
 */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { RepositorioSegmento } from '../../dominio/interfaces/repositorio-segmento.interface';
import { Segmento, ReglasSegmento } from '../../dominio/entidades/segmento.entity';
import { Cliente } from '../../dominio/entidades/cliente.entity';
import {
  BuscarSegmentosCriterios,
  OpcionesPaginacion,
  EstadisticasSegmentos,
  BusquedaAvanzadaSegmentos,
  HistorialSegmento,
  ResultadoValidacionReglas,
  PlantillaSegmento
} from '../../dominio/interfaces/repositorio-segmento.interface';
import { ExcepcionDominio } from '../../../comun/excepciones/excepcion-dominio';
import { ServicioRespuestaEstandar } from '../../../comun/aplicacion/servicios/servicio-respuesta-estandar';

@Injectable()
export class PrismaRepositorioSegmento implements RepositorioSegmento {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Guarda un nuevo segmento
   */
  async guardar(segmento: Segmento): Promise<Segmento> {
    try {
      const segmentoGuardado = await this.prisma.segmentoCliente.create({
        data: {
          id: segmento.id,
          nombre: segmento.nombre,
          descripcion: segmento.descripcion,
          tipo: segmento.tipo as any,
          activo: segmento.estado === 'ACTIVO',
          reglas: segmento.reglas as any, // Prisma maneja JSON
          creador_id: segmento.creadorId,
          fecha_creacion: segmento.fechaCreacion,
          fecha_actualizacion: segmento.fechaActualizacion,
          tienda_id: segmento.tiendaId,
        },
      });

      return this.mapearPrismaASegmento(segmentoGuardado);
    } catch (error) {
      throw ExcepcionDominio.Respuesta400(
        'Error al guardar el segmento',
        'Segmento.ErrorGuardar'
      );
    }
  }

  /**
   * Actualiza un segmento existente
   */
  async actualizar(segmento: Segmento): Promise<Segmento> {
    try {
      const segmentoActualizado = await this.prisma.segmentoCliente.update({
        where: {
          id: segmento.id
        },
        data: {
          nombre: segmento.nombre,
          descripcion: segmento.descripcion,
          activo: segmento.estado === 'ACTIVO',
          reglas: segmento.reglas as any,
          fecha_actualizacion: segmento.fechaActualizacion,
        },
      });

      return this.mapearPrismaASegmento(segmentoActualizado);
    } catch (error) {
      throw ExcepcionDominio.Respuesta400(
        'Error al actualizar el segmento',
        'Segmento.ErrorActualizar'
      );
    }
  }

  /**
   * Encuentra un segmento por su ID
   */
  async encontrarPorId(id: string, tiendaId: string): Promise<Segmento | null> {
    try {
      const segmento = await this.prisma.segmentoCliente.findUnique({
        where: {
          id: id
        },
      });

      return segmento ? this.mapearPrismaASegmento(segmento) : null;
    } catch (error) {
      throw ExcepcionDominio.Respuesta400(
        'Error al buscar el segmento',
        'Segmento.ErrorBuscar'
      );
    }
  }

  /**
   * Encuentra segmentos por múltiples criterios
   */
  async encontrarPorCriterios(criterios: BuscarSegmentosCriterios): Promise<Segmento[]> {
    try {
      const where: any = {
        tienda_id: criterios.tiendaId,
      };

      // Aplicar filtros
      if (criterios.nombre) {
        where.nombre = { contains: criterios.nombre, mode: 'insensitive' };
      }

      if (criterios.tipo) {
        where.tipo = criterios.tipo;
      }

      if (criterios.estado) {
        where.estado = criterios.estado;
      }

      if (criterios.creadorId) {
        where.creadorId = criterios.creadorId;
      }

      if (criterios.etiquetas && criterios.etiquetas.length > 0) {
        where.etiquetas = { hasSome: criterios.etiquetas };
      }

      if (criterios.esPublico !== undefined) {
        where.esPublico = criterios.esPublico;
      }

      if (criterios.puedeCombinar !== undefined) {
        where.puedeCombinar = criterios.puedeCombinar;
      }

      if (criterios.plantillaId) {
        where.plantillaId = criterios.plantillaId;
      }

      // Filtros de fecha
      if (criterios.fechaCreacionDesde || criterios.fechaCreacionHasta) {
        where.fechaCreacion = {};
        if (criterios.fechaCreacionDesde) {
          where.fechaCreacion.gte = criterios.fechaCreacionDesde;
        }
        if (criterios.fechaCreacionHasta) {
          where.fechaCreacion.lte = criterios.fechaCreacionHasta;
        }
      }

      if (criterios.fechaActualizacionDesde || criterios.fechaActualizacionHasta) {
        where.fechaActualizacion = {};
        if (criterios.fechaActualizacionDesde) {
          where.fechaActualizacion.gte = criterios.fechaActualizacionDesde;
        }
        if (criterios.fechaActualizacionHasta) {
          where.fechaActualizacion.lte = criterios.fechaActualizacionHasta;
        }
      }

      const segmentos = await this.prisma.segmentoCliente.findMany({
        where,
        orderBy: this.obtenerOrdenamiento(criterios.ordenarPor, criterios.orden),
        skip: criterios.pagina && criterios.limite ? (criterios.pagina - 1) * criterios.limite : undefined,
        take: criterios.limite,
      });

      return segmentos.map(segmento => this.mapearPrismaASegmento(segmento));
    } catch (error) {
      throw ExcepcionDominio.Respuesta400(
        'Error al buscar segmentos',
        'Segmento.ErrorBuscar'
      );
    }
  }

  /**
   * Encuentra todos los segmentos de una tienda
   */
  async encontrarTodosPorTienda(tiendaId: string): Promise<Segmento[]> {
    return this.encontrarPorCriterios({ tiendaId });
  }

  /**
   * Encuentra segmentos activos por tienda
   */
  async encontrarActivosPorTienda(tiendaId: string): Promise<Segmento[]> {
    return this.encontrarPorCriterios({ 
      tiendaId, 
      estado: 'ACTIVO' 
    });
  }

  /**
   * Encuentra segmentos por nombre (búsqueda parcial)
   */
  async encontrarPorNombre(nombre: string, tiendaId: string): Promise<Segmento[]> {
    return this.encontrarPorCriterios({ 
      tiendaId, 
      nombre 
    });
  }

  /**
   * Encuentra segmentos por tipo
   */
  async encontrarPorTipo(tipo: string, tiendaId: string): Promise<Segmento[]> {
    return this.encontrarPorCriterios({ 
      tiendaId, 
      tipo 
    });
  }

  /**
   * Encuentra segmentos por estado
   */
  async encontrarPorEstado(estado: string, tiendaId: string): Promise<Segmento[]> {
    return this.encontrarPorCriterios({ 
      tiendaId, 
      estado 
    });
  }

  /**
   * Encuentra segmentos por etiquetas
   */
  async encontrarPorEtiquetas(etiquetas: string[], tiendaId: string): Promise<Segmento[]> {
    return this.encontrarPorCriterios({ 
      tiendaId, 
      etiquetas 
    });
  }

  /**
   * Elimina un segmento
   */
  async eliminar(id: string, tiendaId: string): Promise<boolean> {
    try {
      await this.prisma.segmentoCliente.delete({
        where: {
          id: id
        },
      });
      return true;
    } catch (error) {
      // Si el segmento no existe, no es un error
      if (error.code === 'P2025') {
        return false;
      }
      throw ExcepcionDominio.Respuesta400(
        'Error al eliminar el segmento',
        'Segmento.ErrorEliminar'
      );
    }
  }

  /**
   * Duplica un segmento existente
   */
  async duplicar(segmentoOriginal: Segmento, nuevoId: string, nuevoNombre?: string): Promise<Segmento> {
    const segmentoDuplicado = segmentoOriginal.duplicar(nuevoId, nuevoNombre);
    return this.guardar(segmentoDuplicado);
  }

  /**
   * Cuenta el total de segmentos por tienda
   */
  async contarPorTienda(tiendaId: string): Promise<number> {
    try {
      return await this.prisma.segmentoCliente.count({
        where: { tienda_id: tiendaId },
      });
    } catch (error) {
      throw ExcepcionDominio.Respuesta400(
        'Error al contar segmentos',
        'Segmento.ErrorContar'
      );
    }
  }

  /**
   * Obtiene estadísticas de segmentos por tienda
   */
  async obtenerEstadisticasPorTienda(tiendaId: string): Promise<EstadisticasSegmentos> {
    try {
      const [
        totalSegmentos,
        segmentosActivos,
        segmentosInactivos,
        segmentosAutomaticos,
        segmentosManuales,
        segmentoMasReciente
      ] = await Promise.all([
        this.prisma.segmentoCliente.count({ where: { tienda_id: tiendaId } }),
        this.prisma.segmentoCliente.count({ where: { tienda_id: tiendaId, activo: true } }),
        this.prisma.segmentoCliente.count({ where: { tienda_id: tiendaId, activo: false } }),
        this.prisma.segmentoCliente.count({ where: { tienda_id: tiendaId, tipo: 'AUTOMATICO' } }),
        this.prisma.segmentoCliente.count({ where: { tienda_id: tiendaId, tipo: 'MANUAL' } }),
        this.prisma.segmentoCliente.findFirst({
          where: { tienda_id: tiendaId },
          orderBy: { fecha_creacion: 'desc' },
          select: { id: true, nombre: true, fecha_creacion: true }
        })
      ]);

      const promedioClientesPorSegmento = 0; // TODO: Implementar cálculo real cuando exista la relación con clientes

      return {
        totalSegmentos,
        segmentosActivos,
        segmentosInactivos,
        segmentosBorrador: 0, // TODO: Implementar cuando exista el campo
        segmentosAutomaticos,
        segmentosManuales,
        segmentosPredefinidos: 0, // TODO: Implementar cuando exista el tipo PREDEFINIDO
        promedioClientesPorSegmento,
        segmentoMasGrande: { id: '', nombre: '', cantidadClientes: 0 }, // TODO: Implementar cálculo real
        segmentoMasReciente: segmentoMasReciente ? {
          id: segmentoMasReciente.id,
          nombre: segmentoMasReciente.nombre,
          fechaCreacion: segmentoMasReciente.fecha_creacion
        } : { id: '', nombre: '', fechaCreacion: new Date() }
      };
    } catch (error) {
      throw ExcepcionDominio.Respuesta400(
        'Error al obtener estadísticas de segmentos',
        'Segmento.ErrorEstadisticas'
      );
    }
  }

  /**
   * Verifica si un nombre de segmento ya existe en la tienda
   */
  async existeNombre(nombre: string, tiendaId: string, excluirId?: string): Promise<boolean> {
    try {
      const where: any = {
        nombre: { equals: nombre, mode: 'insensitive' },
        tienda_id: tiendaId,
      };

      if (excluirId) {
        where.NOT = { id: excluirId };
      }

      const count = await this.prisma.segmentoCliente.count({ where });
      return count > 0;
    } catch (error) {
      throw ExcepcionDominio.Respuesta400(
        'Error al verificar nombre de segmento',
        'Segmento.ErrorVerificarNombre'
      );
    }
  }

  /**
   * Obtiene los clientes que pertenecen a un segmento específico
   */
  async obtenerClientesPorSegmento(
    segmentoId: string, 
    tiendaId: string, 
    opciones?: OpcionesPaginacion
  ): Promise<Cliente[]> {
    try {
      // Primero obtenemos el segmento para ejecutar sus reglas
      const segmento = await this.encontrarPorId(segmentoId, tiendaId);
      if (!segmento) {
        throw ExcepcionDominio.Respuesta404(
          'Segmento no encontrado',
          'Segmento.NoEncontrado'
        );
      }

      return this.ejecutarReglasSegmento(segmento.reglas, tiendaId, opciones);
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta400(
        'Error al obtener clientes del segmento',
        'Segmento.ErrorObtenerClientes'
      );
    }
  }

  /**
   * Cuenta los clientes en un segmento
   */
  async contarClientesPorSegmento(segmentoId: string, tiendaId: string): Promise<number> {
    try {
      const segmento = await this.encontrarPorId(segmentoId, tiendaId);
      if (!segmento) {
        throw ExcepcionDominio.Respuesta404(
          'Segmento no encontrado',
          'Segmento.NoEncontrado'
        );
      }

      return this.contarClientesPorReglas(segmento.reglas, tiendaId);
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta400(
        'Error al contar clientes del segmento',
        'Segmento.ErrorContarClientes'
      );
    }
  }

  /**
   * Actualiza las estadísticas de un segmento
   */
  async actualizarEstadisticasSegmento(segmentoId: string, tiendaId: string): Promise<Segmento> {
    try {
      const segmento = await this.encontrarPorId(segmentoId, tiendaId);
      if (!segmento) {
        throw ExcepcionDominio.Respuesta404(
          'Segmento no encontrado',
          'Segmento.NoEncontrado'
        );
      }

      const cantidadClientes = await this.contarClientesPorSegmento(segmentoId, tiendaId);
      
      // Contar total de clientes en la tienda para calcular porcentaje
      const totalClientesTienda = await this.prisma.cliente.count({
        where: { tienda_id: tiendaId }
      });
      
      const porcentajeClientes = totalClientesTienda > 0 
        ? (cantidadClientes / totalClientesTienda) * 100 
        : 0;

      const segmentoActualizado = segmento.actualizarEstadisticas(
        cantidadClientes,
        porcentajeClientes,
        new Date()
      );

      return this.actualizar(segmentoActualizado);
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta400(
        'Error al actualizar estadísticas del segmento',
        'Segmento.ErrorActualizarEstadisticas'
      );
    }
  }

  /**
   * Ejecuta las reglas de un segmento y obtiene los clientes que las cumplen
   */
  async ejecutarReglasSegmento(
    reglas: ReglasSegmento, 
    tiendaId: string, 
    opciones?: OpcionesPaginacion
  ): Promise<Cliente[]> {
    try {
      const where = this.construirWhereDesdeReglas(reglas, tiendaId);
      
      const clientes = await this.prisma.cliente.findMany({
        where,
        orderBy: this.obtenerOrdenamiento(opciones?.ordenarPor, opciones?.orden),
        skip: opciones?.pagina && opciones?.limite ? (opciones.pagina - 1) * opciones.limite : undefined,
        take: opciones?.limite,
      });

      // Mapear a entidad de dominio Cliente
      // Nota: Esto requeriría un mapeador similar al de segmentos
      return clientes as any[]; // Placeholder - se necesitaría implementar mapeo completo
    } catch (error) {
      throw ExcepcionDominio.Respuesta400(
        'Error al ejecutar reglas de segmento',
        'Segmento.ErrorEjecutarReglas'
      );
    }
  }

  /**
   * Cuenta los clientes que cumplen con las reglas de segmentación
   */
  async contarClientesPorReglas(reglas: ReglasSegmento, tiendaId: string): Promise<number> {
    try {
      const where = this.construirWhereDesdeReglas(reglas, tiendaId);
      return await this.prisma.cliente.count({ where });
    } catch (error) {
      throw ExcepcionDominio.Respuesta400(
        'Error al contar clientes por reglas',
        'Segmento.ErrorContarClientesReglas'
      );
    }
  }

  /**
   * Obtiene segmentos que pueden ser usados en campañas de marketing
   */
  async encontrarSegmentosParaCampanas(tiendaId: string): Promise<Segmento[]> {
    return this.encontrarPorCriterios({
      tiendaId,
      estado: 'ACTIVO',
      puedeCombinar: true,
    });
  }

  /**
   * Obtiene segmentos predefinidos del sistema
   */
  async encontrarSegmentosPredefinidos(tiendaId: string): Promise<Segmento[]> {
    return this.encontrarPorCriterios({
      tiendaId,
      tipo: 'PREDEFINIDO',
    });
  }

  /**
   * Obtiene segmentos creados por un usuario específico
   */
  async encontrarSegmentosPorCreador(creadorId: string, tiendaId: string): Promise<Segmento[]> {
    return this.encontrarPorCriterios({
      tiendaId,
      creadorId,
    });
  }

  /**
   * Busca segmentos con filtros avanzados
   */
  async buscarAvanzado(criterios: BusquedaAvanzadaSegmentos): Promise<Segmento[]> {
    // Implementación simplificada - en producción sería más compleja
    return this.encontrarPorCriterios({
      tiendaId: criterios.tiendaId,
      nombre: criterios.consulta,
      etiquetas: criterios.campos?.includes('etiquetas') ? criterios.consulta?.split(' ') : undefined,
    });
  }

  /**
   * Exporta segmentos a formato CSV
   */
  async exportarSegmentos(criterios: BuscarSegmentosCriterios): Promise<string> {
    const segmentos = await this.encontrarPorCriterios(criterios);
    
    // Encabezados CSV
    let csv = 'ID,Nombre,Descripción,Tipo,Estado,Cantidad Clientes,Porcentaje,Fecha Creación\n';
    
    // Datos
    segmentos.forEach(segmento => {
      csv += `"${segmento.id}","${segmento.nombre}","${segmento.descripcion || ''}",` +
             `"${segmento.tipo}","${segmento.estado}",${segmento.cantidadClientes},` +
             `${segmento.porcentajeClientes},"${segmento.fechaCreacion.toISOString()}"\n`;
    });
    
    return csv;
  }

  /**
   * Obtiene el historial de cambios de un segmento
   */
  async obtenerHistorialSegmento(segmentoId: string, tiendaId: string): Promise<HistorialSegmento[]> {
    // En una implementación completa, esto consultaría una tabla de historial
    // Por ahora retornamos un array vacío como placeholder
    return [];
  }

  /**
   * Obtiene segmentos similares basados en reglas o nombre
   */
  async encontrarSegmentosSimilares(segmento: Segmento, tiendaId: string): Promise<Segmento[]> {
    // Buscar segmentos con nombres similares o reglas similares
    return this.encontrarPorCriterios({
      tiendaId,
      nombre: segmento.nombre,
    });
  }

  /**
   * Actualiza la última actividad de un segmento
   */
  async actualizarUltimaActividad(segmentoId: string, tiendaId: string): Promise<Segmento> {
    try {
      const segmentoActualizado = await this.prisma.segmentoCliente.update({
        where: {
          id: segmentoId
        },
        data: {
          fecha_actualizacion: new Date(),
        },
      });

      return this.mapearPrismaASegmento(segmentoActualizado);
    } catch (error) {
      throw ExcepcionDominio.Respuesta400(
        'Error al actualizar actividad del segmento',
        'Segmento.ErrorActualizarActividad'
      );
    }
  }

  /**
   * Obtiene segmentos que necesitan actualización de estadísticas
   */
  async encontrarSegmentosParaActualizarEstadisticas(tiendaId: string): Promise<Segmento[]> {
    // Segmentos que no han sido actualizados en las últimas 24 horas
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() - 1);

    return this.encontrarPorCriterios({
      tiendaId,
      fechaActualizacionHasta: fechaLimite,
    });
  }

  /**
   * Valida si las reglas de segmentación son ejecutables
   */
  async validarReglasEjecutables(reglas: ReglasSegmento, tiendaId: string): Promise<boolean> {
    try {
      // Intentar contar clientes con las reglas
      await this.contarClientesPorReglas(reglas, tiendaId);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Métodos auxiliares privados
   */

  /**
   * Mapea un objeto Prisma a una entidad Segmento de dominio
   */
  private mapearPrismaASegmento(prismaSegmento: any): Segmento {
    return new Segmento(
      prismaSegmento.id,
      prismaSegmento.nombre,
      prismaSegmento.descripcion,
      prismaSegmento.tipo,
      prismaSegmento.activo ? 'ACTIVO' : 'INACTIVO',
      prismaSegmento.reglas as ReglasSegmento,
      0, // porcentajeClientes - calcular dinámicamente
      0, // cantidadClientes - calcular dinámicamente
      prismaSegmento.fecha_actualizacion, // ultimaActividad
      prismaSegmento.creador_id,
      prismaSegmento.fecha_creacion,
      prismaSegmento.fecha_actualizacion,
      prismaSegmento.tienda_id,
      null, // plantillaId - no existe en esquema
      [], // etiquetas - no existe en esquema
      false, // esPublico - no existe en esquema
      false, // puedeCombinar - no existe en esquema
    );
  }

  /**
   * Obtiene el ordenamiento para consultas Prisma
   */
  private obtenerOrdenamiento(ordenarPor?: string, orden?: 'ASC' | 'DESC') {
    const ordenamiento: any = {};
    
    if (ordenarPor) {
      ordenamiento[ordenarPor] = orden || 'ASC';
    } else {
      ordenamiento.fechaActualizacion = 'DESC';
    }
    
    return ordenamiento;
  }

  /**
   * Construye el objeto WHERE de Prisma desde las reglas de segmentación
   */
  private construirWhereDesdeReglas(reglas: ReglasSegmento, tiendaId: string): any {
    const where: any = { tiendaId };
    const condiciones: any[] = [];

    for (const condicion of reglas.condiciones) {
      const condicionWhere = this.construirCondicionWhere(condicion);
      if (condicionWhere) {
        condiciones.push(condicionWhere);
      }
    }

    if (condiciones.length > 0) {
      if (reglas.logica === 'Y') {
        where.AND = condiciones;
      } else {
        where.OR = condiciones;
      }
    }

    return where;
  }

  /**
   * Construye una condición individual WHERE
   */
  private construirCondicionWhere(condicion: any): any {
    const mapeoCampos: Record<string, string> = {
      'totalGastado': 'total_gastado',
      'totalOrdenes': 'total_ordenes',
      'fechaCreacion': 'fecha_creacion',
      'fechaUltimaOrden': 'fecha_ultima_orden',
      'fechaUltimaActividad': 'fecha_ultima_actividad',
      'aceptaMarketing': 'acepta_marketing',
      'aceptaSmsMarketing': 'acepta_sms_marketing',
      'activo': 'activo',
      'creditoTienda': 'credito_tienda',
      'grupoRfm': 'grupo_rfm',
      'fuenteCliente': 'fuente_cliente',
      'tags': 'tags',
    };

    const campo = mapeoCampos[condicion.campo];
    if (!campo) return null;

    const operador = condicion.operador;
    const valor = condicion.valor;

    switch (operador) {
      case 'IGUAL':
        return { [campo]: { equals: valor } };
      case 'MAYOR_QUE':
        return { [campo]: { gt: valor } };
      case 'MENOR_QUE':
        return { [campo]: { lt: valor } };
      case 'MAYOR_O_IGUAL':
        return { [campo]: { gte: valor } };
      case 'MENOR_O_IGUAL':
        return { [campo]: { lte: valor } };
      case 'DIFERENTE':
        return { [campo]: { not: valor } };
      case 'CONTENGA':
        return { [campo]: { contains: valor, mode: 'insensitive' } };
      case 'NO_CONTENGA':
        return { [campo]: { not: { contains: valor, mode: 'insensitive' } } };
      case 'COMIENCE_CON':
        return { [campo]: { startsWith: valor, mode: 'insensitive' } };
      case 'TERMINE_CON':
        return { [campo]: { endsWith: valor, mode: 'insensitive' } };
      case 'EN':
        return { [campo]: { in: Array.isArray(valor) ? valor : [valor] } };
      case 'NO_EN':
        return { [campo]: { notIn: Array.isArray(valor) ? valor : [valor] } };
      case 'ENTRE':
        return { 
          [campo]: { 
            gte: Array.isArray(valor) ? valor[0] : valor,
            lte: Array.isArray(valor) ? valor[1] : valor
          } 
        };
      default:
        return null;
    }
  }
}