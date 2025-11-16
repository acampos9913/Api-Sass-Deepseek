import { Injectable, Inject } from '@nestjs/common';
import type { RepositorioConfiguracionPlan } from '../interfaces/repositorio-configuracion-plan.interface';
import { ConfiguracionPlan } from '../entidades/configuracion-plan.entity';
import { 
  CrearConfiguracionPlanDto,
  CambiarPlanDto,
  AgregarSuscripcionDto,
  TipoPlan,
  CicloFacturacion,
  EstadoSuscripcion,
  CriteriosBusquedaPlanDto
} from '../../aplicacion/dto/configuracion-plan.dto';
import { ServicioRespuestaEstandar } from '../../../comun/aplicacion/servicios/servicio-respuesta-estandar';
import { ExcepcionDominio } from '../../../comun/excepciones/excepcion-dominio';
import type { RespuestaEstandar } from '../../../comun/aplicacion/servicios/servicio-respuesta-estandar';

/**
 * Caso de uso para la gestión de configuración de plan
 * Maneja toda la lógica de negocio relacionada con planes y suscripciones
 */
@Injectable()
export class GestionPlanCasoUso {
  constructor(
    @Inject('RepositorioConfiguracionPlan')
    private readonly repositorioConfiguracionPlan: RepositorioConfiguracionPlan,
  ) {}

  /**
   * Crea una nueva configuración de plan para una tienda
   */
  async crearConfiguracionPlan(datos: CrearConfiguracionPlanDto): Promise<RespuestaEstandar> {
    try {
      // Validar que no exista ya una configuración para esta tienda
      const existe = await this.repositorioConfiguracionPlan.existePorTiendaId(datos.tiendaId);
      if (existe) {
        throw ExcepcionDominio.Respuesta400(
          'Ya existe una configuración de plan para esta tienda',
          'ConfiguracionPlan.YaExiste'
        );
      }

      // Crear la configuración de plan
      const configuracion = ConfiguracionPlan.crear(
        datos.tiendaId,
        datos.informacion_plan,
        datos.suscripciones_adicionales,
        datos.beneficios_plan,
        datos.configuracion_adicional
      );

      // Guardar en el repositorio
      await this.repositorioConfiguracionPlan.guardar(configuracion);

      return ServicioRespuestaEstandar.Respuesta201(
        'Configuración de plan creada exitosamente',
        this.aDto(configuracion),
        'ConfiguracionPlan.CreadaExitosamente'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al crear configuración de plan',
        'ConfiguracionPlan.ErrorCreacion'
      );
    }
  }

  /**
   * Obtiene la configuración de plan de una tienda
   */
  async obtenerConfiguracionPlan(tiendaId: string): Promise<RespuestaEstandar> {
    try {
      const configuracion = await this.repositorioConfiguracionPlan.buscarPorTiendaId(tiendaId);
      
      if (!configuracion) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de plan no encontrada',
          'ConfiguracionPlan.NoEncontrada'
        );
      }

      return ServicioRespuestaEstandar.Respuesta200(
        'Configuración de plan obtenida exitosamente',
        this.aDto(configuracion),
        'ConfiguracionPlan.ObtenidaExitosamente'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al obtener configuración de plan',
        'ConfiguracionPlan.ErrorObtencion'
      );
    }
  }

  /**
   * Actualiza la configuración de plan de una tienda
   */
  async actualizarConfiguracionPlan(tiendaId: string, datos: Partial<CrearConfiguracionPlanDto>): Promise<RespuestaEstandar> {
    try {
      const configuracion = await this.repositorioConfiguracionPlan.buscarPorTiendaId(tiendaId);
      
      if (!configuracion) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de plan no encontrada',
          'ConfiguracionPlan.NoEncontrada'
        );
      }

      // Actualizar la configuración
      if (datos.informacion_plan) {
        configuracion.actualizarInformacionPlan(datos.informacion_plan);
      }

      if (datos.suscripciones_adicionales) {
        configuracion.actualizarSuscripcionesAdicionales(datos.suscripciones_adicionales);
      }

      if (datos.beneficios_plan) {
        configuracion.actualizarBeneficiosPlan(datos.beneficios_plan);
      }

      if (datos.configuracion_adicional) {
        configuracion.actualizarConfiguracionAdicional(datos.configuracion_adicional);
      }

      // Guardar los cambios
      await this.repositorioConfiguracionPlan.actualizar(configuracion);

      return ServicioRespuestaEstandar.Respuesta200(
        'Configuración de plan actualizada exitosamente',
        this.aDto(configuracion),
        'ConfiguracionPlan.ActualizadaExitosamente'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al actualizar configuración de plan',
        'ConfiguracionPlan.ErrorActualizacion'
      );
    }
  }

  /**
   * Cambia el plan de una tienda
   */
  async cambiarPlan(tiendaId: string, datosCambio: CambiarPlanDto): Promise<RespuestaEstandar> {
    try {
      // Validar compatibilidad del nuevo plan
      const esCompatible = await this.repositorioConfiguracionPlan.validarCompatibilidadPlan(
        tiendaId, 
        datosCambio.nuevo_plan
      );

      if (!esCompatible) {
        throw ExcepcionDominio.Respuesta400(
          'El nuevo plan no es compatible con la configuración actual',
          'ConfiguracionPlan.PlanIncompatible'
        );
      }

      // Cambiar el plan
      await this.repositorioConfiguracionPlan.cambiarPlan(tiendaId, datosCambio);

      // Obtener la configuración actualizada
      const configuracion = await this.repositorioConfiguracionPlan.buscarPorTiendaId(tiendaId);

      if (!configuracion) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de plan no encontrada después del cambio',
          'ConfiguracionPlan.NoEncontrada'
        );
      }

      return ServicioRespuestaEstandar.Respuesta200(
        'Plan cambiado exitosamente',
        this.aDto(configuracion),
        'ConfiguracionPlan.PlanCambiadoExitosamente'
      );
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
  async cambiarCicloFacturacion(tiendaId: string, nuevoCiclo: CicloFacturacion): Promise<RespuestaEstandar> {
    try {
      // Validar compatibilidad del ciclo de facturación
      const esCompatible = await this.repositorioConfiguracionPlan.validarCompatibilidadCicloFacturacion(
        tiendaId, 
        nuevoCiclo
      );

      if (!esCompatible) {
        throw ExcepcionDominio.Respuesta400(
          'El ciclo de facturación no es compatible con la configuración actual',
          'ConfiguracionPlan.CicloFacturacionIncompatible'
        );
      }

      // Cambiar el ciclo de facturación
      await this.repositorioConfiguracionPlan.cambiarCicloFacturacion(tiendaId, nuevoCiclo);

      // Obtener la configuración actualizada
      const configuracion = await this.repositorioConfiguracionPlan.buscarPorTiendaId(tiendaId);

      if (!configuracion) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de plan no encontrada después del cambio',
          'ConfiguracionPlan.NoEncontrada'
        );
      }

      return ServicioRespuestaEstandar.Respuesta200(
        'Ciclo de facturación cambiado exitosamente',
        this.aDto(configuracion),
        'ConfiguracionPlan.CicloFacturacionCambiadoExitosamente'
      );
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
  async cancelarPlan(tiendaId: string): Promise<RespuestaEstandar> {
    try {
      // Verificar si hay suscripciones activas que impidan la cancelación
      const configuracion = await this.repositorioConfiguracionPlan.buscarPorTiendaId(tiendaId);
      if (!configuracion) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de plan no encontrada',
          'ConfiguracionPlan.NoEncontrada'
        );
      }

      const suscripcionesActivas = configuracion.getSuscripcionesAdicionales().filter(
        s => s.estado === EstadoSuscripcion.ACTIVA
      );

      if (suscripcionesActivas.length > 0) {
        throw ExcepcionDominio.Respuesta400(
          'No se puede cancelar el plan mientras haya suscripciones activas',
          'ConfiguracionPlan.SuscripcionesActivasImpidenCancelacion'
        );
      }

      // Cancelar el plan
      await this.repositorioConfiguracionPlan.cancelarPlan(tiendaId);

      return ServicioRespuestaEstandar.Respuesta200(
        'Plan cancelado exitosamente',
        null,
        'ConfiguracionPlan.PlanCanceladoExitosamente'
      );
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
  async reactivarPlan(tiendaId: string): Promise<RespuestaEstandar> {
    try {
      await this.repositorioConfiguracionPlan.reactivarPlan(tiendaId);

      // Obtener la configuración reactivada
      const configuracion = await this.repositorioConfiguracionPlan.buscarPorTiendaId(tiendaId);

      if (!configuracion) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de plan no encontrada después de la reactivación',
          'ConfiguracionPlan.NoEncontrada'
        );
      }

      return ServicioRespuestaEstandar.Respuesta200(
        'Plan reactivado exitosamente',
        this.aDto(configuracion),
        'ConfiguracionPlan.PlanReactivadoExitosamente'
      );
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
  async agregarSuscripcionAdicional(tiendaId: string, suscripcion: AgregarSuscripcionDto): Promise<RespuestaEstandar> {
    try {
      // Validar compatibilidad de la suscripción con el plan actual
      const configuracion = await this.repositorioConfiguracionPlan.buscarPorTiendaId(tiendaId);
      if (!configuracion) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de plan no encontrada',
          'ConfiguracionPlan.NoEncontrada'
        );
      }

      const esCompatible = await this.repositorioConfiguracionPlan.validarCompatibilidadSuscripcion(
        tiendaId,
        configuracion.getInformacionPlan().tipo_plan,
        suscripcion.nombre
      );

      if (!esCompatible) {
        throw ExcepcionDominio.Respuesta400(
          'La suscripción no es compatible con el plan actual',
          'ConfiguracionPlan.SuscripcionIncompatible'
        );
      }

      // Agregar la suscripción
      await this.repositorioConfiguracionPlan.agregarSuscripcionAdicional(tiendaId, suscripcion);

      // Obtener la configuración actualizada
      const configuracionActualizada = await this.repositorioConfiguracionPlan.buscarPorTiendaId(tiendaId);

      if (!configuracionActualizada) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de plan no encontrada después de agregar suscripción',
          'ConfiguracionPlan.NoEncontrada'
        );
      }

      return ServicioRespuestaEstandar.Respuesta200(
        'Suscripción adicional agregada exitosamente',
        this.aDto(configuracionActualizada),
        'ConfiguracionPlan.SuscripcionAgregadaExitosamente'
      );
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
  async actualizarSuscripcionAdicional(
    tiendaId: string, 
    nombreSuscripcion: string, 
    datosActualizacion: Partial<AgregarSuscripcionDto>
  ): Promise<RespuestaEstandar> {
    try {
      await this.repositorioConfiguracionPlan.actualizarSuscripcionAdicional(
        tiendaId, 
        nombreSuscripcion, 
        datosActualizacion
      );

      // Obtener la configuración actualizada
      const configuracion = await this.repositorioConfiguracionPlan.buscarPorTiendaId(tiendaId);

      if (!configuracion) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de plan no encontrada después de actualizar suscripción',
          'ConfiguracionPlan.NoEncontrada'
        );
      }

      return ServicioRespuestaEstandar.Respuesta200(
        'Suscripción adicional actualizada exitosamente',
        this.aDto(configuracion),
        'ConfiguracionPlan.SuscripcionActualizadaExitosamente'
      );
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
  async removerSuscripcionAdicional(tiendaId: string, nombreSuscripcion: string): Promise<RespuestaEstandar> {
    try {
      await this.repositorioConfiguracionPlan.removerSuscripcionAdicional(tiendaId, nombreSuscripcion);

      // Obtener la configuración actualizada
      const configuracion = await this.repositorioConfiguracionPlan.buscarPorTiendaId(tiendaId);

      if (!configuracion) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de plan no encontrada después de remover suscripción',
          'ConfiguracionPlan.NoEncontrada'
        );
      }

      return ServicioRespuestaEstandar.Respuesta200(
        'Suscripción adicional removida exitosamente',
        this.aDto(configuracion),
        'ConfiguracionPlan.SuscripcionRemovidaExitosamente'
      );
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
  async activarSuscripcionAdicional(tiendaId: string, nombreSuscripcion: string): Promise<RespuestaEstandar> {
    try {
      await this.repositorioConfiguracionPlan.activarSuscripcionAdicional(tiendaId, nombreSuscripcion);

      // Obtener la configuración actualizada
      const configuracion = await this.repositorioConfiguracionPlan.buscarPorTiendaId(tiendaId);

      if (!configuracion) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de plan no encontrada después de activar suscripción',
          'ConfiguracionPlan.NoEncontrada'
        );
      }

      return ServicioRespuestaEstandar.Respuesta200(
        'Suscripción adicional activada exitosamente',
        this.aDto(configuracion),
        'ConfiguracionPlan.SuscripcionActivadaExitosamente'
      );
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
  async desactivarSuscripcionAdicional(tiendaId: string, nombreSuscripcion: string): Promise<RespuestaEstandar> {
    try {
      await this.repositorioConfiguracionPlan.desactivarSuscripcionAdicional(tiendaId, nombreSuscripcion);

      // Obtener la configuración actualizada
      const configuracion = await this.repositorioConfiguracionPlan.buscarPorTiendaId(tiendaId);

      if (!configuracion) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de plan no encontrada después de desactivar suscripción',
          'ConfiguracionPlan.NoEncontrada'
        );
      }

      return ServicioRespuestaEstandar.Respuesta200(
        'Suscripción adicional desactivada exitosamente',
        this.aDto(configuracion),
        'ConfiguracionPlan.SuscripcionDesactivadaExitosamente'
      );
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
   * Lista configuraciones de plan con paginación
   */
  async listarConfiguracionesPlan(pagina: number, limite: number): Promise<RespuestaEstandar> {
    try {
      const configuraciones = await this.repositorioConfiguracionPlan.buscarPorCriterios({});

      const datos = {
        configuraciones: configuraciones.map(config => this.aDto(config)),
        paginacion: {
          pagina,
          limite,
          total: configuraciones.length,
          totalPaginas: Math.ceil(configuraciones.length / limite),
        },
      };

      return ServicioRespuestaEstandar.Respuesta200(
        'Configuraciones de plan listadas exitosamente',
        datos,
        'ConfiguracionPlan.ListadasExitosamente'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al listar configuraciones de plan',
        'ConfiguracionPlan.ErrorListado'
      );
    }
  }

  /**
   * Busca configuraciones por criterios específicos
   */
  async buscarConfiguracionesPorCriterios(criterios: CriteriosBusquedaPlanDto): Promise<RespuestaEstandar> {
    try {
      const configuraciones = await this.repositorioConfiguracionPlan.buscarPorCriterios(criterios);

      return ServicioRespuestaEstandar.Respuesta200(
        'Configuraciones de plan encontradas exitosamente',
        configuraciones.map(config => this.aDto(config)),
        'ConfiguracionPlan.EncontradasExitosamente'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al buscar configuraciones por criterios',
        'ConfiguracionPlan.ErrorBusquedaCriterios'
      );
    }
  }

  /**
   * Obtiene estadísticas de uso de planes
   */
  async obtenerEstadisticasPlanes(): Promise<RespuestaEstandar> {
    try {
      const estadisticas = await this.repositorioConfiguracionPlan.obtenerEstadisticas();

      return ServicioRespuestaEstandar.Respuesta200(
        'Estadísticas de planes obtenidas exitosamente',
        estadisticas,
        'ConfiguracionPlan.EstadisticasObtenidasExitosamente'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al obtener estadísticas de planes',
        'ConfiguracionPlan.ErrorEstadisticas'
      );
    }
  }

  /**
   * Calcula el costo total mensual de un plan
   */
  async calcularCostoTotalMensual(tiendaId: string): Promise<RespuestaEstandar> {
    try {
      const costoTotal = await this.repositorioConfiguracionPlan.calcularCostoTotalMensual(tiendaId);

      return ServicioRespuestaEstandar.Respuesta200(
        'Costo total mensual calculado exitosamente',
        { costo_total: costoTotal },
        'ConfiguracionPlan.CostoCalculadoExitosamente'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al calcular costo total mensual',
        'ConfiguracionPlan.ErrorCalculoCosto'
      );
    }
  }

  /**
   * Calcula el ahorro anual de un plan
   */
  async calcularAhorroAnual(tiendaId: string): Promise<RespuestaEstandar> {
    try {
      const ahorroAnual = await this.repositorioConfiguracionPlan.calcularAhorroAnual(tiendaId);

      return ServicioRespuestaEstandar.Respuesta200(
        'Ahorro anual calculado exitosamente',
        { ahorro_anual: ahorroAnual },
        'ConfiguracionPlan.AhorroCalculadoExitosamente'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al calcular ahorro anual',
        'ConfiguracionPlan.ErrorCalculoAhorro'
      );
    }
  }

  /**
   * Obtiene recomendaciones de plan para una tienda
   */
  async obtenerRecomendacionesPlan(tiendaId: string): Promise<RespuestaEstandar> {
    try {
      const recomendaciones = await this.repositorioConfiguracionPlan.obtenerRecomendacionesPlan(tiendaId);

      return ServicioRespuestaEstandar.Respuesta200(
        'Recomendaciones de plan obtenidas exitosamente',
        recomendaciones,
        'ConfiguracionPlan.RecomendacionesObtenidasExitosamente'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al obtener recomendaciones de plan',
        'ConfiguracionPlan.ErrorRecomendaciones'
      );
    }
  }

  /**
   * Exporta la configuración de plan de una tienda
   */
  async exportarConfiguracionPlan(tiendaId: string): Promise<RespuestaEstandar> {
    try {
      const configuracionExportada = await this.repositorioConfiguracionPlan.exportarConfiguracion(tiendaId);

      return ServicioRespuestaEstandar.Respuesta200(
        'Configuración de plan exportada exitosamente',
        configuracionExportada,
        'ConfiguracionPlan.ExportadaExitosamente'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al exportar configuración de plan',
        'ConfiguracionPlan.ErrorExportacion'
      );
    }
  }

  /**
   * Importa una configuración de plan para una tienda
   */
  async importarConfiguracionPlan(tiendaId: string, datosImportacion: any): Promise<RespuestaEstandar> {
    try {
      await this.repositorioConfiguracionPlan.importarConfiguracion(tiendaId, datosImportacion);

      // Obtener la configuración importada
      const configuracion = await this.repositorioConfiguracionPlan.buscarPorTiendaId(tiendaId);

      if (!configuracion) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de plan no encontrada después de la importación',
          'ConfiguracionPlan.NoEncontrada'
        );
      }

      return ServicioRespuestaEstandar.Respuesta200(
        'Configuración de plan importada exitosamente',
        this.aDto(configuracion),
        'ConfiguracionPlan.ImportadaExitosamente'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al importar configuración de plan',
        'ConfiguracionPlan.ErrorImportacion'
      );
    }
  }

  /**
   * Valida los límites del plan actual
   */
  async validarLimitesPlan(tiendaId: string): Promise<RespuestaEstandar> {
    try {
      const configuracion = await this.repositorioConfiguracionPlan.buscarPorTiendaId(tiendaId);
      if (!configuracion) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de plan no encontrada',
          'ConfiguracionPlan.NoEncontrada'
        );
      }

      const metricas = await this.repositorioConfiguracionPlan.obtenerMetricasUso(tiendaId);
      const informacionPlan = configuracion.getInformacionPlan();

      const limites = {
        empleados: {
          actual: metricas.empleadosActivos,
          maximo: informacionPlan.empleados_permitidos,
          excedido: metricas.empleadosActivos > informacionPlan.empleados_permitidos,
        },
        tiendas: {
          actual: metricas.tiendasActivas,
          maximo: informacionPlan.tiendas_locales_por_mercado,
          excedido: metricas.tiendasActivas > informacionPlan.tiendas_locales_por_mercado,
        },
        almacenamiento: {
          actual: metricas.usoAlmacenamiento,
          maximo: metricas.limiteAlmacenamiento,
          excedido: metricas.usoAlmacenamiento > metricas.limiteAlmacenamiento,
        },
      };

      return ServicioRespuestaEstandar.Respuesta200(
        'Límites del plan validados exitosamente',
        limites,
        'ConfiguracionPlan.LimitesValidadosExitosamente'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al validar límites del plan',
        'ConfiguracionPlan.ErrorValidacionLimites'
      );
    }
  }

  /**
   * Convierte entidad de dominio a DTO
   */
  private aDto(configuracion: ConfiguracionPlan): any {
    return {
      id: configuracion.id,
      tienda_id: configuracion.tiendaId,
      informacion_plan: configuracion.getInformacionPlan(),
      suscripciones_adicionales: configuracion.getSuscripcionesAdicionales(),
      beneficios_plan: configuracion.getBeneficiosPlan(),
      configuracion_adicional: configuracion.getConfiguracionAdicional(),
      fecha_creacion: configuracion.fechaCreacion,
      fecha_actualizacion: configuracion.fechaActualizacion,
    };
  }
}