import { Injectable } from '@nestjs/common';
import { ServicioRespuestaEstandar } from '../../../comun/aplicacion/servicios/servicio-respuesta-estandar';
import { ExcepcionDominio } from '../../../comun/excepciones/excepcion-dominio';
import { ConfiguracionCuentasCliente } from '../entidades/configuracion-cuentas-cliente.entity';
import type { RepositorioConfiguracionCuentasCliente } from '../interfaces/repositorio-configuracion-cuentas-cliente.interface';
import { 
  CrearConfiguracionCuentasClienteDto, 
  ActualizarConfiguracionCuentasClienteDto,
  ModoCuentas,
  MetodoAutenticacion,
  ReglaDevolucionDto
} from '../../aplicacion/dto/configuracion-cuentas-cliente.dto';

@Injectable()
export class GestionCuentasClienteCasoUso {
  constructor(
    private readonly repositorio: RepositorioConfiguracionCuentasCliente,
  ) {}

  /**
   * Crea una nueva configuración de cuentas de cliente
   */
  async crear(
    datos: CrearConfiguracionCuentasClienteDto,
  ): Promise<any> {
    try {
      // Verificar si ya existe configuración para esta tienda
      const existe = await this.repositorio.existePorTiendaId(datos.tienda_id);
      if (existe) {
        throw ExcepcionDominio.Respuesta400(
          'Ya existe una configuración de cuentas de cliente para esta tienda',
          'CuentasCliente.ConfiguracionExistente'
        );
      }

      // Validar apps conectadas si se proporcionan
      if (datos.apps_conectadas && datos.apps_conectadas.length > 0) {
        await this.validarAppsConectadas(datos.tienda_id, datos.apps_conectadas);
      }

      // Validar dominio si se proporciona
      if (datos.dominio) {
        await this.validarDominioExistente(datos.tienda_id, datos.dominio);
      }

      // Crear la entidad de dominio
      const configuracion = ConfiguracionCuentasCliente.crear(
        this.generarId(),
        datos.tienda_id,
        datos.modo_cuentas,
        datos.metodo_autenticacion,
        datos.mostrar_enlaces_inicio ?? true,
        datos.apps_conectadas ?? [],
        datos.personalizacion ?? false,
        datos.credito_tienda ?? false,
        datos.devolucion_autoservicio ?? false,
        datos.reglas_devolucion ?? [],
        datos.url_cuenta,
        datos.dominio
      );

      // Guardar en el repositorio
      await this.repositorio.guardar(configuracion);

      return ServicioRespuestaEstandar.Respuesta201(
        'Configuración de cuentas de cliente creada exitosamente',
        this.aDto(configuracion),
        'CuentasCliente.CreadaExitosamente'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        `Error al crear configuración de cuentas de cliente: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        'CuentasCliente.ErrorCreacion'
      );
    }
  }

  /**
   * Obtiene la configuración de cuentas de cliente por ID de tienda
   */
  async obtenerPorTiendaId(tiendaId: string): Promise<any> {
    try {
      const configuracion = await this.repositorio.buscarPorTiendaId(tiendaId);
      
      if (!configuracion) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de cuentas de cliente no encontrada',
          'CuentasCliente.NoEncontrada'
        );
      }

      return ServicioRespuestaEstandar.Respuesta200(
        'Configuración de cuentas de cliente obtenida exitosamente',
        this.aDto(configuracion),
        'CuentasCliente.ObtenidaExitosamente'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        `Error al obtener configuración de cuentas de cliente: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        'CuentasCliente.ErrorObtencion'
      );
    }
  }

  /**
   * Actualiza la configuración de cuentas de cliente
   */
  async actualizar(
    datos: ActualizarConfiguracionCuentasClienteDto,
  ): Promise<any> {
    try {
      // Obtener configuración existente
      const configuracionExistente = await this.repositorio.buscarPorTiendaId(datos.tienda_id);
      
      if (!configuracionExistente) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de cuentas de cliente no encontrada',
          'CuentasCliente.NoEncontrada'
        );
      }

      // Validar apps conectadas si se proporcionan
      if (datos.apps_conectadas && datos.apps_conectadas.length > 0) {
        await this.validarAppsConectadas(datos.tienda_id, datos.apps_conectadas);
      }

      // Validar dominio si se proporciona
      if (datos.dominio) {
        await this.validarDominioExistente(datos.tienda_id, datos.dominio);
      }

      // Aplicar cambios a la entidad
      this.aplicarCambios(configuracionExistente, datos);

      // Validar que la configuración sea válida después de los cambios
      if (!configuracionExistente.esValida()) {
        throw ExcepcionDominio.Respuesta400(
          'La configuración resultante no es válida',
          'CuentasCliente.ConfiguracionInvalida'
        );
      }

      // Actualizar en el repositorio
      await this.repositorio.actualizar(configuracionExistente);

      return ServicioRespuestaEstandar.Respuesta200(
        'Configuración de cuentas de cliente actualizada exitosamente',
        this.aDto(configuracionExistente),
        'CuentasCliente.ActualizadaExitosamente'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        `Error al actualizar configuración de cuentas de cliente: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        'CuentasCliente.ErrorActualizacion'
      );
    }
  }

  /**
   * Elimina la configuración de cuentas de cliente
   */
  async eliminar(tiendaId: string): Promise<any> {
    try {
      const configuracion = await this.repositorio.buscarPorTiendaId(tiendaId);
      
      if (!configuracion) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de cuentas de cliente no encontrada',
          'CuentasCliente.NoEncontrada'
        );
      }

      await this.repositorio.eliminarPorTiendaId(tiendaId);

      return ServicioRespuestaEstandar.Respuesta200(
        'Configuración de cuentas de cliente eliminada exitosamente',
        { mensaje: 'Configuración eliminada exitosamente' },
        'CuentasCliente.EliminadaExitosamente'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        `Error al eliminar configuración de cuentas de cliente: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        'CuentasCliente.ErrorEliminacion'
      );
    }
  }

  /**
   * Obtiene estadísticas de configuraciones
   */
  async obtenerEstadisticas(): Promise<any> {
    try {
      const estadisticas = await this.repositorio.obtenerEstadisticas();

      return ServicioRespuestaEstandar.Respuesta200(
        'Estadísticas de configuraciones obtenidas exitosamente',
        { estadisticas },
        'CuentasCliente.EstadisticasObtenidasExitosamente'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        `Error al obtener estadísticas de configuraciones: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        'CuentasCliente.ErrorEstadisticas'
      );
    }
  }

  /**
   * Busca configuraciones por criterios
   */
  async buscarPorCriterios(criterios: {
    modo_cuentas?: string;
    metodo_autenticacion?: string;
    credito_tienda?: boolean;
    devolucion_autoservicio?: boolean;
    personalizacion?: boolean;
  }): Promise<any> {
    try {
      const configuraciones = await this.repositorio.buscarPorCriterios(criterios);

      return ServicioRespuestaEstandar.Respuesta200(
        'Configuraciones encontradas exitosamente',
        { configuraciones: configuraciones.map(config => this.aDto(config)) },
        'CuentasCliente.ConfiguracionesEncontradasExitosamente'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        `Error al buscar configuraciones por criterios: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        'CuentasCliente.ErrorBusqueda'
      );
    }
  }

  /**
   * Valida la integridad de la configuración
   */
  async validarIntegridad(tiendaId: string): Promise<any> {
    try {
      const configuracion = await this.repositorio.buscarPorTiendaId(tiendaId);
      
      if (!configuracion) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de cuentas de cliente no encontrada',
          'CuentasCliente.NoEncontrada'
        );
      }

      const esValida = await this.repositorio.validarIntegridad(tiendaId);

      return ServicioRespuestaEstandar.Respuesta200(
        esValida
          ? 'La configuración es válida'
          : 'La configuración presenta problemas de integridad',
        { es_valida: esValida },
        esValida
          ? 'CuentasCliente.IntegridadValida'
          : 'CuentasCliente.IntegridadInvalida'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        `Error al validar integridad de la configuración: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        'CuentasCliente.ErrorValidacionIntegridad'
      );
    }
  }

  /**
   * Métodos auxiliares privados
   */

  private generarId(): string {
    return `cuentas-cliente-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private async validarAppsConectadas(tiendaId: string, apps: string[]): Promise<void> {
    for (const appId of apps) {
      const estaInstalada = await this.repositorio.validarAppInstalada(tiendaId, appId);
      if (!estaInstalada) {
        throw ExcepcionDominio.Respuesta400(
          `La app ${appId} no está instalada en la tienda`,
          'CuentasCliente.AppNoInstalada'
        );
      }
    }
  }

  private async validarDominioExistente(tiendaId: string, dominio: string): Promise<void> {
    const existeDominio = await this.repositorio.validarDominioExistente(tiendaId, dominio);
    if (!existeDominio) {
      throw ExcepcionDominio.Respuesta400(
        `El dominio ${dominio} no existe en la lista de dominios de la tienda`,
        'CuentasCliente.DominioNoExistente'
      );
    }
  }

  private aplicarCambios(
    configuracion: ConfiguracionCuentasCliente,
    datos: ActualizarConfiguracionCuentasClienteDto
  ): void {
    // Aplicar cambios individuales
    if (datos.modo_cuentas !== undefined) {
      configuracion.cambiarModoCuentas(datos.modo_cuentas);
    }

    if (datos.metodo_autenticacion !== undefined) {
      configuracion.cambiarMetodoAutenticacion(datos.metodo_autenticacion);
    }

    if (datos.mostrar_enlaces_inicio !== undefined) {
      configuracion.cambiarMostrarEnlacesInicio(datos.mostrar_enlaces_inicio);
    }

    if (datos.apps_conectadas !== undefined) {
      // Reemplazar todas las apps conectadas
      const appsActuales = configuracion.getAppsConectadas();
      const appsNuevas = datos.apps_conectadas;
      
      // Remover apps que ya no están
      appsActuales.forEach(appId => {
        if (!appsNuevas.includes(appId)) {
          configuracion.removerAppConectada(appId);
        }
      });
      
      // Agregar apps nuevas
      appsNuevas.forEach(appId => {
        if (!appsActuales.includes(appId)) {
          configuracion.agregarAppConectada(appId);
        }
      });
    }

    if (datos.personalizacion !== undefined) {
      configuracion.cambiarPersonalizacion(datos.personalizacion);
    }

    if (datos.credito_tienda !== undefined) {
      configuracion.cambiarCreditoTienda(datos.credito_tienda);
    }

    if (datos.devolucion_autoservicio !== undefined) {
      configuracion.cambiarDevolucionAutoservicio(datos.devolucion_autoservicio);
    }

    if (datos.reglas_devolucion !== undefined) {
      // Reemplazar todas las reglas de devolución
      const reglasActuales = configuracion.getReglasDevolucion();
      
      // Remover reglas existentes
      reglasActuales.forEach((_, index) => {
        configuracion.removerReglaDevolucion(index);
      });
      
      // Agregar nuevas reglas
      datos.reglas_devolucion.forEach(regla => {
        configuracion.agregarReglaDevolucion(regla);
      });
    }

    if (datos.url_cuenta !== undefined) {
      configuracion.cambiarUrlCuenta(datos.url_cuenta);
    }

    if (datos.dominio !== undefined) {
      configuracion.cambiarDominio(datos.dominio);
    }
  }

  private aDto(configuracion: ConfiguracionCuentasCliente): any {
    return {
      id: configuracion.id,
      tienda_id: configuracion.tiendaId,
      modo_cuentas: configuracion.getModoCuentas(),
      metodo_autenticacion: configuracion.getMetodoAutenticacion(),
      mostrar_enlaces_inicio: configuracion.getMostrarEnlacesInicio(),
      apps_conectadas: configuracion.getAppsConectadas(),
      personalizacion: configuracion.getPersonalizacion(),
      credito_tienda: configuracion.getCreditoTienda(),
      devolucion_autoservicio: configuracion.getDevolucionAutoservicio(),
      reglas_devolucion: configuracion.getReglasDevolucion(),
      url_cuenta: configuracion.getUrlCuenta(),
      dominio: configuracion.getDominio(),
      fecha_creacion: configuracion.fechaCreacion,
      fecha_actualizacion: configuracion.fechaActualizacion,
    };
  }
}