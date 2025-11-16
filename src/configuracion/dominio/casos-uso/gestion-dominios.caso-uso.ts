import { Injectable, Inject } from '@nestjs/common';
import { ServicioRespuestaEstandar } from '../../../comun/aplicacion/servicios/servicio-respuesta-estandar';
import { ExcepcionDominio } from '../../../comun/excepciones/excepcion-dominio';
import { ConfiguracionDominios } from '../entidades/configuracion-dominios.entity';
import type { RepositorioConfiguracionDominios } from '../interfaces/repositorio-configuracion-dominios.interface';
import {
  ConfiguracionDominiosDto,
  CrearDominioDto,
  ActualizarDominioDto,
  DominioDto,
  TipoDominioEnum,
  EstadoConexionDominioEnum,
  ConfiguracionDominiosRespuestaDto
} from '../../aplicacion/dto/configuracion-dominios.dto';

/**
 * Caso de uso para la gestión de configuración de dominios
 * Implementa todas las operaciones de negocio relacionadas con dominios
 */
@Injectable()
export class GestionDominiosCasoUso {
  constructor(
    @Inject('RepositorioConfiguracionDominios')
    private readonly repositorioConfiguracionDominios: RepositorioConfiguracionDominios,
  ) {}

  /**
   * Obtener configuración de dominios por ID de tienda
   */
  async obtenerPorTiendaId(tiendaId: string) {
    try {
      const configuracion = await this.repositorioConfiguracionDominios.encontrarPorTiendaId(tiendaId);

      if (!configuracion) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de dominios no encontrada',
          'Dominios.ConfiguracionNoEncontrada'
        );
      }

      const respuestaDto = this.aConfiguracionDominiosDto(configuracion);

      return ServicioRespuestaEstandar.Respuesta200(
        'Configuración de dominios obtenida exitosamente',
        respuestaDto,
        'Dominios.ConfiguracionObtenida'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al obtener configuración de dominios',
        'Dominios.ErrorObtencion'
      );
    }
  }

  /**
   * Crear configuración inicial de dominios
   */
  async crearConfiguracion(tiendaId: string, datos: ConfiguracionDominiosDto) {
    try {
      // Verificar si ya existe configuración para esta tienda
      const existe = await this.repositorioConfiguracionDominios.existePorTiendaId(tiendaId);

      if (existe) {
        throw ExcepcionDominio.Respuesta400(
          'Ya existe una configuración de dominios para esta tienda',
          'Dominios.ConfiguracionExistente'
        );
      }

      // Convertir CrearDominioDto[] a DominioDto[]
      const dominiosDto = datos.dominios.map(dominio => this.crearDominioDto(dominio));

      // Crear nueva configuración
      const configuracion = ConfiguracionDominios.crear(
        this.generarId(),
        tiendaId,
        dominiosDto,
        datos.dominio_principal,
        datos.redireccionamiento_global || false
      );

      // Guardar en repositorio
      const configuracionGuardada = await this.repositorioConfiguracionDominios.crear(configuracion);

      const respuestaDto = this.aConfiguracionDominiosDto(configuracionGuardada);

      return ServicioRespuestaEstandar.Respuesta201(
        'Configuración de dominios creada exitosamente',
        respuestaDto,
        'Dominios.ConfiguracionCreada'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al crear configuración de dominios',
        'Dominios.ErrorCreacion'
      );
    }
  }

  /**
   * Actualizar configuración de dominios
   */
  async actualizarConfiguracion(tiendaId: string, datos: Partial<ConfiguracionDominiosDto>) {
    try {
      // Obtener configuración existente
      const configuracion = await this.repositorioConfiguracionDominios.encontrarPorTiendaId(tiendaId);

      if (!configuracion) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de dominios no encontrada',
          'Dominios.ConfiguracionNoEncontrada'
        );
      }

      // Actualizar dominios si se proporcionan
      if (datos.dominios) {
        // Convertir CrearDominioDto[] a DominioDto[]
        const dominiosDto = datos.dominios.map(dominio => this.crearDominioDto(dominio));

        // Para simplificar, reemplazamos todos los dominios
        // En una implementación más avanzada, se podría hacer merge
        const configuracionActualizada = ConfiguracionDominios.reconstruir(
          configuracion.id,
          configuracion.tiendaId,
          dominiosDto,
          datos.dominio_principal || configuracion.dominioPrincipal,
          datos.redireccionamiento_global ?? configuracion.redireccionamientoGlobal,
          configuracion.fechaCreacion,
          new Date()
        );

        const configuracionGuardada = await this.repositorioConfiguracionDominios.actualizar(configuracionActualizada);
        const respuestaDto = this.aConfiguracionDominiosDto(configuracionGuardada);

        return ServicioRespuestaEstandar.Respuesta200(
          'Configuración de dominios actualizada exitosamente',
          respuestaDto,
          'Dominios.ConfiguracionActualizada'
        );
      }

      // Actualizar solo redireccionamiento global si se proporciona
      if (datos.redireccionamiento_global !== undefined) {
        configuracion.toggleRedireccionamientoGlobal(datos.redireccionamiento_global);
      }

      // Actualizar dominio principal si se proporciona
      if (datos.dominio_principal) {
        configuracion.establecerDominioPrincipal(datos.dominio_principal);
      }

      const configuracionGuardada = await this.repositorioConfiguracionDominios.actualizar(configuracion);
      const respuestaDto = this.aConfiguracionDominiosDto(configuracionGuardada);

      return ServicioRespuestaEstandar.Respuesta200(
        'Configuración de dominios actualizada exitosamente',
        respuestaDto,
        'Dominios.ConfiguracionActualizada'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al actualizar configuración de dominios',
        'Dominios.ErrorActualizacion'
      );
    }
  }

  /**
   * Agregar dominio a la configuración
   */
  async agregarDominio(tiendaId: string, dominio: CrearDominioDto) {
    try {
      const configuracion = await this.repositorioConfiguracionDominios.encontrarPorTiendaId(tiendaId);

      if (!configuracion) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de dominios no encontrada',
          'Dominios.ConfiguracionNoEncontrada'
        );
      }

      // Convertir CrearDominioDto a DominioDto
      const dominioDto: DominioDto = {
        id: this.generarId(),
        nombre_dominio: dominio.nombre_dominio,
        tipo_dominio: dominio.tipo_dominio,
        estado: dominio.estado,
        fuente: dominio.fuente,
        fecha_conexion: dominio.fecha_conexion || new Date(),
        redireccionamiento: dominio.redireccionamiento || false,
        comprado: dominio.comprado || false,
        subdominio: dominio.subdominio,
        ssl_activo: dominio.ssl_activo || false,
        https: dominio.https || false,
        historial: [],
        fecha_creacion: new Date(),
        fecha_actualizacion: new Date()
      };

      // Agregar dominio
      configuracion.agregarDominio(dominioDto);

      // Guardar cambios
      const configuracionActualizada = await this.repositorioConfiguracionDominios.actualizar(configuracion);

      const respuestaDto = this.aConfiguracionDominiosDto(configuracionActualizada);

      return ServicioRespuestaEstandar.Respuesta200(
        'Dominio agregado exitosamente',
        respuestaDto,
        'Dominios.DominioAgregado'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al agregar dominio',
        'Dominios.ErrorAgregarDominio'
      );
    }
  }

  /**
   * Actualizar dominio específico
   */
  async actualizarDominio(tiendaId: string, nombreDominio: string, dominioActualizado: ActualizarDominioDto) {
    try {
      const configuracion = await this.repositorioConfiguracionDominios.encontrarPorTiendaId(tiendaId);

      if (!configuracion) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de dominios no encontrada',
          'Dominios.ConfiguracionNoEncontrada'
        );
      }

      // Actualizar dominio
      configuracion.actualizarDominio(nombreDominio, dominioActualizado);

      // Guardar cambios
      const configuracionActualizada = await this.repositorioConfiguracionDominios.actualizar(configuracion);

      const respuestaDto = this.aConfiguracionDominiosDto(configuracionActualizada);

      return ServicioRespuestaEstandar.Respuesta200(
        'Dominio actualizado exitosamente',
        respuestaDto,
        'Dominios.DominioActualizado'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al actualizar dominio',
        'Dominios.ErrorActualizarDominio'
      );
    }
  }

  /**
   * Eliminar dominio
   */
  async eliminarDominio(tiendaId: string, nombreDominio: string) {
    try {
      const configuracion = await this.repositorioConfiguracionDominios.encontrarPorTiendaId(tiendaId);

      if (!configuracion) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de dominios no encontrada',
          'Dominios.ConfiguracionNoEncontrada'
        );
      }

      // Eliminar dominio
      configuracion.eliminarDominio(nombreDominio);

      // Guardar cambios
      const configuracionActualizada = await this.repositorioConfiguracionDominios.actualizar(configuracion);

      const respuestaDto = this.aConfiguracionDominiosDto(configuracionActualizada);

      return ServicioRespuestaEstandar.Respuesta200(
        'Dominio eliminado exitosamente',
        respuestaDto,
        'Dominios.DominioEliminado'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al eliminar dominio',
        'Dominios.ErrorEliminarDominio'
      );
    }
  }

  /**
   * Establecer dominio principal
   */
  async establecerDominioPrincipal(tiendaId: string, nombreDominio: string) {
    try {
      const configuracion = await this.repositorioConfiguracionDominios.encontrarPorTiendaId(tiendaId);

      if (!configuracion) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de dominios no encontrada',
          'Dominios.ConfiguracionNoEncontrada'
        );
      }

      // Establecer dominio principal
      configuracion.establecerDominioPrincipal(nombreDominio);

      // Guardar cambios
      const configuracionActualizada = await this.repositorioConfiguracionDominios.actualizar(configuracion);

      const respuestaDto = this.aConfiguracionDominiosDto(configuracionActualizada);

      return ServicioRespuestaEstandar.Respuesta200(
        'Dominio principal establecido exitosamente',
        respuestaDto,
        'Dominios.DominioPrincipalEstablecido'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al establecer dominio principal',
        'Dominios.ErrorEstablecerPrincipal'
      );
    }
  }

  /**
   * Activar/desactivar redireccionamiento global
   */
  async toggleRedireccionamientoGlobal(tiendaId: string, activar: boolean) {
    try {
      const configuracion = await this.repositorioConfiguracionDominios.encontrarPorTiendaId(tiendaId);

      if (!configuracion) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de dominios no encontrada',
          'Dominios.ConfiguracionNoEncontrada'
        );
      }

      // Activar/desactivar redireccionamiento
      configuracion.toggleRedireccionamientoGlobal(activar);

      // Guardar cambios
      const configuracionActualizada = await this.repositorioConfiguracionDominios.actualizar(configuracion);

      const respuestaDto = this.aConfiguracionDominiosDto(configuracionActualizada);

      const mensaje = activar
        ? 'Redireccionamiento global activado exitosamente'
        : 'Redireccionamiento global desactivado exitosamente';

      const tipoMensaje = activar
        ? 'Dominios.RedireccionamientoActivado'
        : 'Dominios.RedireccionamientoDesactivado';

      return ServicioRespuestaEstandar.Respuesta200(
        mensaje,
        respuestaDto,
        tipoMensaje
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al actualizar redireccionamiento global',
        'Dominios.ErrorRedireccionamiento'
      );
    }
  }

  /**
   * Obtener dominios por tipo
   */
  async obtenerDominiosPorTipo(tiendaId: string, tipo: TipoDominioEnum) {
    try {
      const dominios = await this.repositorioConfiguracionDominios.encontrarDominiosPorTipo(tiendaId, tipo);

      return ServicioRespuestaEstandar.Respuesta200(
        'Dominios obtenidos exitosamente',
        dominios,
        'Dominios.DominiosObtenidos'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al obtener dominios por tipo',
        'Dominios.ErrorObtenerPorTipo'
      );
    }
  }

  /**
   * Obtener dominios conectados
   */
  async obtenerDominiosConectados(tiendaId: string) {
    try {
      const dominios = await this.repositorioConfiguracionDominios.encontrarDominiosConectados(tiendaId);

      return ServicioRespuestaEstandar.Respuesta200(
        'Dominios conectados obtenidos exitosamente',
        dominios,
        'Dominios.DominiosConectadosObtenidos'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al obtener dominios conectados',
        'Dominios.ErrorObtenerConectados'
      );
    }
  }

  /**
   * Contar dominios por tienda
   */
  async contarDominios(tiendaId: string) {
    try {
      const total = await this.repositorioConfiguracionDominios.contarDominiosPorTienda(tiendaId);

      return ServicioRespuestaEstandar.Respuesta200(
        'Dominios contados exitosamente',
        { total },
        'Dominios.DominiosContados'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al contar dominios',
        'Dominios.ErrorContarDominios'
      );
    }
  }

  /**
   * Convertir entidad a DTO de respuesta
   */
  private aConfiguracionDominiosDto(configuracion: ConfiguracionDominios): ConfiguracionDominiosRespuestaDto {
    return {
      id: configuracion.id,
      tienda_id: configuracion.tiendaId,
      dominios: configuracion.dominios,
      dominio_principal: configuracion.dominioPrincipal || '',
      redireccionamiento_global: configuracion.redireccionamientoGlobal,
      fecha_creacion: configuracion.fechaCreacion,
      fecha_actualizacion: configuracion.fechaActualizacion
    };
  }

  /**
   * Convertir CrearDominioDto a DominioDto
   */
  private crearDominioDto(dominio: CrearDominioDto): DominioDto {
    return {
      id: this.generarId(),
      nombre_dominio: dominio.nombre_dominio,
      tipo_dominio: dominio.tipo_dominio,
      estado: dominio.estado,
      fuente: dominio.fuente,
      fecha_conexion: dominio.fecha_conexion || new Date(),
      redireccionamiento: dominio.redireccionamiento || false,
      comprado: dominio.comprado || false,
      subdominio: dominio.subdominio,
      ssl_activo: dominio.ssl_activo || false,
      https: dominio.https || false,
      historial: [],
      fecha_creacion: new Date(),
      fecha_actualizacion: new Date()
    };
  }

  /**
   * Generar ID único
   */
  private generarId(): string {
    return `config-dom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}