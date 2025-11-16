import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { ConfiguracionPlan } from '../../dominio/entidades/configuracion-plan.entity';
import type { RepositorioConfiguracionPlan } from '../../dominio/interfaces/repositorio-configuracion-plan.interface';
import { 
  TipoPlan,
  CicloFacturacion,
  EstadoSuscripcion,
  CambiarPlanDto,
  AgregarSuscripcionDto,
  CriteriosBusquedaPlanDto
} from '../../aplicacion/dto/configuracion-plan.dto';
import { ExcepcionDominio } from '../../../comun/excepciones/excepcion-dominio';

/**
 * Implementación del repositorio de configuración de plan usando Prisma
 * Maneja la persistencia en PostgreSQL para operaciones de escritura
 */
@Injectable()
export class PrismaRepositorioConfiguracionPlan implements RepositorioConfiguracionPlan {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Busca configuración de plan por ID de tienda
   */
  async buscarPorTiendaId(tiendaId: string): Promise<ConfiguracionPlan | null> {
    try {
      const configuracionDB = await this.prisma.configuracionPlan.findUnique({
        where: { tiendaId },
        include: {
          suscripcionesAdicionales: true,
        },
      });

      if (!configuracionDB) {
        return null;
      }

      return this.aEntidad(configuracionDB);
    } catch (error) {
      throw ExcepcionDominio.Respuesta500(
        'Error al buscar configuración de plan por tienda',
        'ConfiguracionPlan.ErrorBusqueda'
      );
    }
  }

  /**
   * Busca configuración de plan por ID
   */
  async buscarPorId(id: string): Promise<ConfiguracionPlan | null> {
    try {
      const configuracionDB = await this.prisma.configuracionPlan.findUnique({
        where: { id },
        include: {
          suscripcionesAdicionales: true,
        },
      });

      if (!configuracionDB) {
        return null;
      }

      return this.aEntidad(configuracionDB);
    } catch (error) {
      throw ExcepcionDominio.Respuesta500(
        'Error al buscar configuración de plan por ID',
        'ConfiguracionPlan.ErrorBusqueda'
      );
    }
  }

  /**
   * Verifica si existe configuración para una tienda
   */
  async existePorTiendaId(tiendaId: string): Promise<boolean> {
    try {
      const count = await this.prisma.configuracionPlan.count({
        where: { tiendaId },
      });
      return count > 0;
    } catch (error) {
      throw ExcepcionDominio.Respuesta500(
        'Error al verificar existencia de configuración de plan',
        'ConfiguracionPlan.ErrorVerificacion'
      );
    }
  }

  /**
   * Guarda una nueva configuración de plan
   */
  async guardar(configuracion: ConfiguracionPlan): Promise<void> {
    try {
      const datos = this.aDatosPrisma(configuracion);

      await this.prisma.configuracionPlan.create({
        data: {
          ...datos,
          suscripcionesAdicionales: {
            create: configuracion.getSuscripcionesAdicionales().map(suscripcion => ({
              nombre: suscripcion.nombre,
              precio: suscripcion.precio,
              fechaProximoCobro: suscripcion.fecha_proximo_cobro,
              estado: suscripcion.estado,
              descripcion: suscripcion.descripcion,
            })),
          },
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw ExcepcionDominio.Respuesta400(
          'Ya existe una configuración de plan para esta tienda',
          'ConfiguracionPlan.YaExiste'
        );
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al guardar configuración de plan',
        'ConfiguracionPlan.ErrorGuardado'
      );
    }
  }

  /**
   * Actualiza una configuración de plan existente
   */
  async actualizar(configuracion: ConfiguracionPlan): Promise<void> {
    try {
      const datos = this.aDatosPrisma(configuracion);

      await this.prisma.configuracionPlan.update({
        where: { id: configuracion.id },
        data: {
          ...datos,
          suscripcionesAdicionales: {
            deleteMany: {},
            create: configuracion.getSuscripcionesAdicionales().map(suscripcion => ({
              nombre: suscripcion.nombre,
              precio: suscripcion.precio,
              fechaProximoCobro: suscripcion.fecha_proximo_cobro,
              estado: suscripcion.estado,
              descripcion: suscripcion.descripcion,
            })),
          },
        },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de plan no encontrada',
          'ConfiguracionPlan.NoEncontrada'
        );
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al actualizar configuración de plan',
        'ConfiguracionPlan.ErrorActualizacion'
      );
    }
  }

  /**
   * Elimina configuración de plan por ID de tienda
   */
  async eliminarPorTiendaId(tiendaId: string): Promise<void> {
    try {
      await this.prisma.configuracionPlan.delete({
        where: { tiendaId },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de plan no encontrada',
          'ConfiguracionPlan.NoEncontrada'
        );
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al eliminar configuración de plan',
        'ConfiguracionPlan.ErrorEliminacion'
      );
    }
  }

  /**
   * Elimina configuración de plan por ID
   */
  async eliminarPorId(id: string): Promise<void> {
    try {
      await this.prisma.configuracionPlan.delete({
        where: { id },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de plan no encontrada',
          'ConfiguracionPlan.NoEncontrada'
        );
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al eliminar configuración de plan',
        'ConfiguracionPlan.ErrorEliminacion'
      );
    }
  }

  /**
   * Lista todas las configuraciones de plan con paginación
   */
  async listarTodos(pagina: number, limite: number): Promise<{ configuraciones: ConfiguracionPlan[]; total: number }> {
    try {
      const [configuracionesDB, total] = await Promise.all([
        this.prisma.configuracionPlan.findMany({
          skip: (pagina - 1) * limite,
          take: limite,
          include: {
            suscripcionesAdicionales: true,
          },
          orderBy: { fechaCreacion: 'desc' },
        }),
        this.prisma.configuracionPlan.count(),
      ]);

      const configuraciones = configuracionesDB.map(config => this.aEntidad(config));

      return { configuraciones, total };
    } catch (error) {
      throw ExcepcionDominio.Respuesta500(
        'Error al listar configuraciones de plan',
        'ConfiguracionPlan.ErrorListado'
      );
    }
  }

  /**
   * Busca configuraciones por tipo de plan
   */
  async buscarPorTipoPlan(tipoPlan: TipoPlan): Promise<ConfiguracionPlan[]> {
    try {
      const configuracionesDB = await this.prisma.configuracionPlan.findMany({
        where: { tipoPlan },
        include: {
          suscripcionesAdicionales: true,
        },
      });

      return configuracionesDB.map(config => this.aEntidad(config));
    } catch (error) {
      throw ExcepcionDominio.Respuesta500(
        'Error al buscar configuraciones por tipo de plan',
        'ConfiguracionPlan.ErrorBusquedaTipoPlan'
      );
    }
  }

  /**
   * Busca configuraciones por ciclo de facturación
   */
  async buscarPorCicloFacturacion(cicloFacturacion: CicloFacturacion): Promise<ConfiguracionPlan[]> {
    try {
      const configuracionesDB = await this.prisma.configuracionPlan.findMany({
        where: { cicloFacturacion },
        include: {
          suscripcionesAdicionales: true,
        },
      });

      return configuracionesDB.map(config => this.aEntidad(config));
    } catch (error) {
      throw ExcepcionDominio.Respuesta500(
        'Error al buscar configuraciones por ciclo de facturación',
        'ConfiguracionPlan.ErrorBusquedaCicloFacturacion'
      );
    }
  }

  /**
   * Busca configuraciones con suscripciones activas
   */
  async buscarConSuscripcionesActivas(): Promise<ConfiguracionPlan[]> {
    try {
      const configuracionesDB = await this.prisma.configuracionPlan.findMany({
        where: {
          suscripcionesAdicionales: {
            some: {
              estado: EstadoSuscripcion.ACTIVA,
            },
          },
        },
        include: {
          suscripcionesAdicionales: true,
        },
      });

      return configuracionesDB.map(config => this.aEntidad(config));
    } catch (error) {
      throw ExcepcionDominio.Respuesta500(
        'Error al buscar configuraciones con suscripciones activas',
        'ConfiguracionPlan.ErrorBusquedaSuscripcionesActivas'
      );
    }
  }

  /**
   * Busca configuraciones con facturación anual
   */
  async buscarConFacturacionAnual(): Promise<ConfiguracionPlan[]> {
    try {
      const configuracionesDB = await this.prisma.configuracionPlan.findMany({
        where: { cicloFacturacion: CicloFacturacion.ANUAL },
        include: {
          suscripcionesAdicionales: true,
        },
      });

      return configuracionesDB.map(config => this.aEntidad(config));
    } catch (error) {
      throw ExcepcionDominio.Respuesta500(
        'Error al buscar configuraciones con facturación anual',
        'ConfiguracionPlan.ErrorBusquedaFacturacionAnual'
      );
    }
  }

  /**
   * Busca configuraciones por criterios específicos
   */
  async buscarPorCriterios(criterios: CriteriosBusquedaPlanDto): Promise<ConfiguracionPlan[]> {
    try {
      const where: any = {};

      if (criterios.tipo_plan) {
        where.tipoPlan = criterios.tipo_plan;
      }

      if (criterios.ciclo_facturacion) {
        where.cicloFacturacion = criterios.ciclo_facturacion;
      }

      if (criterios.suscripciones_activas !== undefined) {
        where.suscripcionesAdicionales = {
          some: {
            estado: criterios.suscripciones_activas ? EstadoSuscripcion.ACTIVA : EstadoSuscripcion.CANCELADA,
          },
        };
      }

      if (criterios.facturacion_anual !== undefined) {
        where.cicloFacturacion = criterios.facturacion_anual ? CicloFacturacion.ANUAL : CicloFacturacion.MENSUAL;
      }

      if (criterios.rango_precio) {
        where.precioMensual = {
          gte: criterios.rango_precio.min,
          lte: criterios.rango_precio.max,
        };
      }

      const configuracionesDB = await this.prisma.configuracionPlan.findMany({
        where,
        include: {
          suscripcionesAdicionales: true,
        },
      });

      return configuracionesDB.map(config => this.aEntidad(config));
    } catch (error) {
      throw ExcepcionDominio.Respuesta500(
        'Error al buscar configuraciones por criterios',
        'ConfiguracionPlan.ErrorBusquedaCriterios'
      );
    }
  }

  /**
   * Cambia el plan de una tienda
   */
  async cambiarPlan(tiendaId: string, datosCambio: CambiarPlanDto): Promise<void> {
    try {
      const configuracion = await this.buscarPorTiendaId(tiendaId);
      if (!configuracion) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de plan no encontrada',
          'ConfiguracionPlan.NoEncontrada'
        );
      }

      configuracion.cambiarPlan(datosCambio);
      await this.actualizar(configuracion);
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al cambiar plan',
        'ConfiguracionPlan.ErrorCambioPlan'
      );
    }
  }

  /**
   * Cambia el ciclo de facturación
   */
  async cambiarCicloFacturacion(tiendaId: string, nuevoCiclo: CicloFacturacion): Promise<void> {
    try {
      const configuracion = await this.buscarPorTiendaId(tiendaId);
      if (!configuracion) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de plan no encontrada',
          'ConfiguracionPlan.NoEncontrada'
        );
      }

      configuracion.cambiarCicloFacturacion(nuevoCiclo);
      await this.actualizar(configuracion);
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al cambiar ciclo de facturación',
        'ConfiguracionPlan.ErrorCambioCicloFacturacion'
      );
    }
  }

  /**
   * Cancela el plan de una tienda
   */
  async cancelarPlan(tiendaId: string): Promise<void> {
    try {
      const configuracion = await this.buscarPorTiendaId(tiendaId);
      if (!configuracion) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de plan no encontrada',
          'ConfiguracionPlan.NoEncontrada'
        );
      }

      // Lógica de cancelación (podría cambiar el estado a cancelado)
      // Por ahora simplemente eliminamos la configuración
      await this.eliminarPorTiendaId(tiendaId);
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al cancelar plan',
        'ConfiguracionPlan.ErrorCancelacion'
      );
    }
  }

  /**
   * Reactiva un plan cancelado
   */
  async reactivarPlan(tiendaId: string): Promise<void> {
    try {
      // Lógica de reactivación
      // Por ahora simplemente verificamos que exista
      const configuracion = await this.buscarPorTiendaId(tiendaId);
      if (!configuracion) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de plan no encontrada',
          'ConfiguracionPlan.NoEncontrada'
        );
      }

      // Podríamos agregar lógica específica de reactivación aquí
      configuracion.fechaActualizacion = new Date();
      await this.actualizar(configuracion);
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al reactivar plan',
        'ConfiguracionPlan.ErrorReactivacion'
      );
    }
  }

  /**
   * Agrega una suscripción adicional
   */
  async agregarSuscripcionAdicional(tiendaId: string, suscripcion: AgregarSuscripcionDto): Promise<void> {
    try {
      const configuracion = await this.buscarPorTiendaId(tiendaId);
      if (!configuracion) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de plan no encontrada',
          'ConfiguracionPlan.NoEncontrada'
        );
      }

      configuracion.agregarSuscripcionAdicional(suscripcion);
      await this.actualizar(configuracion);
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al agregar suscripción adicional',
        'ConfiguracionPlan.ErrorAgregarSuscripcion'
      );
    }
  }

  /**
   * Actualiza una suscripción adicional
   */
  async actualizarSuscripcionAdicional(tiendaId: string, nombreSuscripcion: string, nuevaSuscripcion: any): Promise<void> {
    try {
      const configuracion = await this.buscarPorTiendaId(tiendaId);
      if (!configuracion) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de plan no encontrada',
          'ConfiguracionPlan.NoEncontrada'
        );
      }

      const suscripciones = configuracion.getSuscripcionesAdicionales();
      const indice = suscripciones.findIndex(s => s.nombre === nombreSuscripcion);
      
      if (indice === -1) {
        throw ExcepcionDominio.Respuesta404(
          `Suscripción '${nombreSuscripcion}' no encontrada`,
          'ConfiguracionPlan.SuscripcionNoEncontrada'
        );
      }

      suscripciones[indice] = { ...suscripciones[indice], ...nuevaSuscripcion };
      configuracion.actualizarSuscripcionesAdicionales(suscripciones);
      await this.actualizar(configuracion);
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al actualizar suscripción adicional',
        'ConfiguracionPlan.ErrorActualizarSuscripcion'
      );
    }
  }

  /**
   * Remueve una suscripción adicional
   */
  async removerSuscripcionAdicional(tiendaId: string, nombreSuscripcion: string): Promise<void> {
    try {
      const configuracion = await this.buscarPorTiendaId(tiendaId);
      if (!configuracion) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de plan no encontrada',
          'ConfiguracionPlan.NoEncontrada'
        );
      }

      configuracion.removerSuscripcionAdicional(nombreSuscripcion);
      await this.actualizar(configuracion);
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al remover suscripción adicional',
        'ConfiguracionPlan.ErrorRemoverSuscripcion'
      );
    }
  }

  /**
   * Activa una suscripción adicional
   */
  async activarSuscripcionAdicional(tiendaId: string, nombreSuscripcion: string): Promise<void> {
    try {
      await this.cambiarEstadoSuscripcion(tiendaId, nombreSuscripcion, EstadoSuscripcion.ACTIVA);
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al activar suscripción adicional',
        'ConfiguracionPlan.ErrorActivarSuscripcion'
      );
    }
  }

  /**
   * Desactiva una suscripción adicional
   */
  async desactivarSuscripcionAdicional(tiendaId: string, nombreSuscripcion: string): Promise<void> {
    try {
      await this.cambiarEstadoSuscripcion(tiendaId, nombreSuscripcion, EstadoSuscripcion.CANCELADA);
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al desactivar suscripción adicional',
        'ConfiguracionPlan.ErrorDesactivarSuscripcion'
      );
    }
  }

  /**
   * Cambia el estado de una suscripción adicional
   */
  async cambiarEstadoSuscripcion(tiendaId: string, nombreSuscripcion: string, nuevoEstado: EstadoSuscripcion): Promise<void> {
    try {
      const configuracion = await this.buscarPorTiendaId(tiendaId);
      if (!configuracion) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de plan no encontrada',
          'ConfiguracionPlan.NoEncontrada'
        );
      }

      configuracion.cambiarEstadoSuscripcion(nombreSuscripcion, nuevoEstado);
      await this.actualizar(configuracion);
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al cambiar estado de suscripción',
        'ConfiguracionPlan.ErrorCambioEstadoSuscripcion'
      );
    }
  }

  /**
   * Valida si existe un plan para la tienda
   */
  async validarPlanExistente(tiendaId: string): Promise<boolean> {
    return await this.existePorTiendaId(tiendaId);
  }

  /**
   * Valida si existe una suscripción
   */
  async validarSuscripcionExistente(tiendaId: string, nombreSuscripcion: string): Promise<boolean> {
    try {
      const configuracion = await this.buscarPorTiendaId(tiendaId);
      if (!configuracion) {
        return false;
      }

      const suscripciones = configuracion.getSuscripcionesAdicionales();
      return suscripciones.some(s => s.nombre === nombreSuscripcion);
    } catch (error) {
      throw ExcepcionDominio.Respuesta500(
        'Error al validar existencia de suscripción',
        'ConfiguracionPlan.ErrorValidacionSuscripcion'
      );
    }
  }

  /**
   * Valida compatibilidad de plan
   */
  async validarCompatibilidadPlan(tiendaId: string, nuevoPlan: TipoPlan): Promise<boolean> {
    try {
      const configuracion = await this.buscarPorTiendaId(tiendaId);
      if (!configuracion) {
        return false;
      }

      return configuracion.puedeCambiarAPlan(nuevoPlan);
    } catch (error) {
      throw ExcepcionDominio.Respuesta500(
        'Error al validar compatibilidad de plan',
        'ConfiguracionPlan.ErrorValidacionCompatibilidad'
      );
    }
  }

  /**
   * Valida límites del plan
   */
  async validarLimitesPlan(tiendaId: string, tipoPlan: TipoPlan): Promise<boolean> {
    try {
      // Implementar lógica de validación de límites
      // Por ahora retornamos true
      return true;
    } catch (error) {
      throw ExcepcionDominio.Respuesta500(
        'Error al validar límites de plan',
        'ConfiguracionPlan.ErrorValidacionLimites'
      );
    }
  }

  /**
   * Valida período de prueba
   */
  async validarPeriodoPrueba(tiendaId: string): Promise<boolean> {
    try {
      const configuracion = await this.buscarPorTiendaId(tiendaId);
      if (!configuracion) {
        return false;
      }

      return configuracion.estaEnPeriodoDePrueba();
    } catch (error) {
      throw ExcepcionDominio.Respuesta500(
        'Error al validar período de prueba',
        'ConfiguracionPlan.ErrorValidacionPeriodoPrueba'
      );
    }
  }

  /**
   * Obtiene estadísticas de uso
   */
  async obtenerEstadisticas(): Promise<any> {
    try {
      const [
        totalConfiguraciones,
        configuracionesPorTipo,
        configuracionesPorCiclo,
        configuracionesConSuscripciones
      ] = await Promise.all([
        this.prisma.configuracionPlan.count(),
        this.prisma.configuracionPlan.groupBy({
          by: ['tipoPlan'],
          _count: {
            id: true,
          },
        }),
        this.prisma.configuracionPlan.groupBy({
          by: ['cicloFacturacion'],
          _count: {
            id: true,
          },
        }),
        this.prisma.configuracionPlan.count({
          where: {
            suscripcionesAdicionales: {
              some: {
                estado: EstadoSuscripcion.ACTIVA,
              },
            },
          },
        }),
      ]);

      return {
        total_configuraciones: totalConfiguraciones,
        configuraciones_por_tipo: configuracionesPorTipo.map(item => ({
          tipo_plan: item.tipoPlan,
          cantidad: item._count.id,
        })),
        configuraciones_por_ciclo: configuracionesPorCiclo.map(item => ({
          ciclo_facturacion: item.cicloFacturacion,
          cantidad: item._count.id,
        })),
        con_suscripciones_activas: configuracionesConSuscripciones,
      };
    } catch (error) {
      throw ExcepcionDominio.Respuesta500(
        'Error al obtener estadísticas de plan',
        'ConfiguracionPlan.ErrorEstadisticas'
      );
    }
  }

  /**
   * Convierte datos de Prisma a entidad de dominio
   */
  private aEntidad(datos: any): ConfiguracionPlan {
    const informacionPlan = {
      tipo_plan: datos.tipoPlan,
      nombre_plan: datos.nombrePlan,
      precio_mensual: datos.precioMensual,
      fecha_proximo_cobro: datos.fechaProximoCobro,
      empleados_permitidos: datos.empleadosPermitidos,
      tiendas_locales_por_mercado: datos.tiendasLocalesPorMercado,
      descuento_envios: datos.descuentoEnvios,
      ciclo_facturacion: datos.cicloFacturacion,
      ahorro_anual: datos.ahorroAnual,
    };

    const suscripcionesAdicionales = datos.suscripcionesAdicionales.map((suscripcion: any) => ({
      nombre: suscripcion.nombre,
      precio: suscripcion.precio,
      fecha_proximo_cobro: suscripcion.fechaProximoCobro,
      estado: suscripcion.estado,
      descripcion: suscripcion.descripcion,
    }));

    const beneficiosPlan = {
      funciones_incluidas: datos.funcionesIncluidas,
      limites_almacenamiento: datos.limitesAlmacenamiento,
      integraciones_disponibles: datos.integracionesDisponibles,
      soporte: datos.soporte,
    };

    return ConfiguracionPlan.reconstruir(
      datos.id,
      datos.tiendaId,
      informacionPlan,
      suscripcionesAdicionales,
      beneficiosPlan,
      datos.configuracionAdicional,
      datos.fechaCreacion,
      datos.fechaActualizacion
    );
  }

  /**
   * Convierte entidad de dominio a datos de Prisma
   */
  private aDatosPrisma(configuracion: ConfiguracionPlan): any {
    const informacionPlan = configuracion.getInformacionPlan();
    
    return {
      id: configuracion.id,
      tiendaId: configuracion.tiendaId,
      tipoPlan: informacionPlan.tipo_plan,
      nombrePlan: informacionPlan.nombre_plan,
      precioMensual: informacionPlan.precio_mensual,
      fechaProximoCobro: informacionPlan.fecha_proximo_cobro,
      empleadosPermitidos: informacionPlan.empleados_permitidos,
      tiendasLocalesPorMercado: informacionPlan.tiendas_locales_por_mercado,
      descuentoEnvios: informacionPlan.descuento_envios,
      cicloFacturacion: informacionPlan.ciclo_facturacion,
      ahorroAnual: informacionPlan.ahorro_anual,
      funcionesIncluidas: configuracion.getBeneficiosPlan().funciones_incluidas,
      limitesAlmacenamiento: configuracion.getBeneficiosPlan().limites_almacenamiento,
      integracionesDisponibles: configuracion.getBeneficiosPlan().integraciones_disponibles,
      soporte: configuracion.getBeneficiosPlan().soporte,
      configuracionAdicional: configuracion.getConfiguracionAdicional(),
      fechaCreacion: configuracion.fechaCreacion,
      fechaActualizacion: configuracion.fechaActualizacion,
    };
  }

  // Implementación de métodos pendientes (simplificada por brevedad)
  async actualizarInformacionPlan(tiendaId: string, informacionPlan: any): Promise<void> {
    const configuracion = await this.buscarPorTiendaId(tiendaId);
    if (!configuracion) {
      throw ExcepcionDominio.Respuesta404(
        'Configuración de plan no encontrada',
        'ConfiguracionPlan.NoEncontrada'
      );
    }
    configuracion.actualizarInformacionPlan(informacionPlan);
    await this.actualizar(configuracion);
  }

  async actualizarBeneficiosPlan(tiendaId: string, beneficiosPlan: any): Promise<void> {
    const configuracion = await this.buscarPorTiendaId(tiendaId);
    if (!configuracion) {
      throw ExcepcionDominio.Respuesta404(
        'Configuración de plan no encontrada',
        'ConfiguracionPlan.NoEncontrada'
      );
    }
    configuracion.actualizarBeneficiosPlan(beneficiosPlan);
    await this.actualizar(configuracion);
  }

  async actualizarConfiguracionAdicional(tiendaId: string, configuracionAdicional: Record<string, any>): Promise<void> {
    const configuracion = await this.buscarPorTiendaId(tiendaId);
    if (!configuracion) {
      throw ExcepcionDominio.Respuesta404(
        'Configuración de plan no encontrada',
        'ConfiguracionPlan.NoEncontrada'
      );
    }
    configuracion.actualizarConfiguracionAdicional(configuracionAdicional);
    await this.actualizar(configuracion);
  }

  async obtenerEstadisticasPorTipoPlan(): Promise<any[]> {
    // Implementación simplificada
    return [];
  }

  async obtenerEstadisticasPorCicloFacturacion(): Promise<any[]> {
    // Implementación simplificada
    return [];
  }

  async obtenerMetricasUso(tiendaId: string): Promise<any> {
    // Implementación simplificada
    return {
      empleadosActivos: 0,
      tiendasActivas: 0,
      productosTotales: 0,
      ordenesEsteMes: 0,
      usoAlmacenamiento: 0,
      limiteAlmacenamiento: 0,
    };
  }

  async realizarBackup(): Promise<any> {
    // Implementación simplificada
    return {};
  }

  async restaurarDesdeBackup(backup: any): Promise<void> {
    // Implementación simplificada
  }

  async sincronizarConSistemaFacturacion(tiendaId: string): Promise<void> {
    // Implementación simplificada
  }

  async validarIntegridad(tiendaId: string): Promise<boolean> {
    return true;
  }

  async obtenerHistorialCambios(tiendaId: string): Promise<any[]> {
    return [];
  }

  async limpiarConfiguracionesObsoletas(): Promise<void> {
    // Implementación simplificada
  }

  async migrarPlan(tiendaId: string, versionAnterior: string, versionNueva: string): Promise<void> {
    // Implementación simplificada
  }

  async actualizarPreciosPorInflacion(porcentajeAumento: number): Promise<void> {
    // Implementación simplificada
  }

  async obtenerConfiguracionesConProblemas(): Promise<ConfiguracionPlan[]> {
    return [];
  }

  async obtenerConfiguracionesConLimitesExcedidos(): Promise<ConfiguracionPlan[]> {
    return [];
  }

  async obtenerConfiguracionesConSuscripcionesVencidas(): Promise<ConfiguracionPlan[]> {
    return [];
  }

  async obtenerConfiguracionesConFacturacionPendiente(): Promise<ConfiguracionPlan[]> {
    return [];
  }

  async buscarConfiguracionesPorRangoPrecio(min: number, max: number): Promise<ConfiguracionPlan[]> {
    return this.buscarPorCriterios({ rango_precio: { min, max } });
  }

  async buscarConfiguracionesConAltoUso(): Promise<ConfiguracionPlan[]> {
    return [];
  }

  async buscarConfiguracionesConBajoUso(): Promise<ConfiguracionPlan[]> {
    return [];
  }

  async buscarConfiguracionesParaUpgrade(): Promise<ConfiguracionPlan[]> {
    return [];
  }

  async validarCompatibilidadSuscripcion(tiendaId: string, tipoPlan: TipoPlan, nombreSuscripcion: string): Promise<boolean> {
    return true;
  }

  async validarCompatibilidadCicloFacturacion(tiendaId: string, cicloFacturacion: CicloFacturacion): Promise<boolean> {
    return true;
  }

  async validarCompatibilidadLimites(tiendaId: string, empleadosRequeridos: number, tiendasRequeridas: number): Promise<boolean> {
    return true;
  }

  async calcularCostoTotalMensual(tiendaId: string): Promise<number> {
    const configuracion = await this.buscarPorTiendaId(tiendaId);
    if (!configuracion) {
      throw ExcepcionDominio.Respuesta404(
        'Configuración de plan no encontrada',
        'ConfiguracionPlan.NoEncontrada'
      );
    }
    return configuracion.obtenerCostoTotalMensual();
  }

  async calcularAhorroAnual(tiendaId: string): Promise<number> {
    const configuracion = await this.buscarPorTiendaId(tiendaId);
    if (!configuracion) {
      throw ExcepcionDominio.Respuesta404(
        'Configuración de plan no encontrada',
        'ConfiguracionPlan.NoEncontrada'
      );
    }
    const informacionPlan = configuracion.getInformacionPlan();
    return informacionPlan.ahorro_anual || 0;
  }

  async calcularProyeccionCrecimiento(tiendaId: string, meses: number): Promise<any> {
    // Implementación simplificada
    return {
      costoProyectado: 0,
      limitesRecomendados: { empleados: 0, tiendas: 0 },
      planRecomendado: TipoPlan.STARTER,
    };
  }

  async obtenerRecomendacionesPlan(tiendaId: string): Promise<any[]> {
    return [];
  }

  async exportarConfiguracion(tiendaId: string): Promise<any> {
    const configuracion = await this.buscarPorTiendaId(tiendaId);
    if (!configuracion) {
      throw ExcepcionDominio.Respuesta404(
        'Configuración de plan no encontrada',
        'ConfiguracionPlan.NoEncontrada'
      );
    }
    return {
      id: configuracion.id,
      tiendaId: configuracion.tiendaId,
      informacionPlan: configuracion.getInformacionPlan(),
      suscripcionesAdicionales: configuracion.getSuscripcionesAdicionales(),
      beneficiosPlan: configuracion.getBeneficiosPlan(),
      configuracionAdicional: configuracion.getConfiguracionAdicional(),
      fechaCreacion: configuracion.fechaCreacion,
      fechaActualizacion: configuracion.fechaActualizacion,
    };
  }

  async importarConfiguracion(tiendaId: string, datos: any): Promise<void> {
    const configuracion = ConfiguracionPlan.reconstruir(
      datos.id,
      tiendaId,
      datos.informacionPlan,
      datos.suscripcionesAdicionales,
      datos.beneficiosPlan,
      datos.configuracionAdicional,
      datos.fechaCreacion,
      datos.fechaActualizacion
    );
    await this.guardar(configuracion);
  }

  async optimizarConsultasPlan(): Promise<void> {
    // Implementación simplificada
  }

  async reindexarConfiguraciones(): Promise<void> {
    // Implementación simplificada
  }

  async obtenerMetricasRendimiento(): Promise<any> {
    return {
      consultasPorSegundo: 0,
      tiempoRespuestaPromedio: 0,
      configuracionesActivas: 0,
      erroresRecientes: 0,
    };
  }

  async notificarCambiosPlan(tiendaId: string, cambios: any): Promise<void> {
    // Implementación simplificada
  }

  async obtenerNotificacionesPendientes(tiendaId: string): Promise<any[]> {
    return [];
  }

  async generarFactura(tiendaId: string, periodo: string): Promise<any> {
    return {};
  }

  async obtenerHistorialFacturacion(tiendaId: string): Promise<any[]> {
    return [];
  }

  async validarPagoPendiente(tiendaId: string): Promise<boolean> {
    return false;
  }

  async crearTicketSoporte(tiendaId: string, asunto: string, descripcion: string): Promise<void> {
    // Implementación simplificada
  }

  async obtenerTicketsSoporte(tiendaId: string): Promise<any[]> {
    return [];
  }

  async migrarDatosPlanAnterior(tiendaId: string, datosAnteriores: any): Promise<void> {
    // Implementación simplificada
  }

  async validarMigracionCompleta(tiendaId: string): Promise<boolean> {
    return true;
  }
}