import { Injectable } from '@nestjs/common';
import { ConfiguracionIdiomas } from '../entidades/configuracion-idiomas.entity';
import type { RepositorioConfiguracionIdiomas } from '../interfaces/repositorio-configuracion-idiomas.interface';
import { ServicioRespuestaEstandar, type RespuestaEstandar } from '../../../comun/aplicacion/servicios/servicio-respuesta-estandar';
import { ExcepcionDominio } from '../../../comun/excepciones/excepcion-dominio';
import {
  ConfiguracionIdiomasDto,
  ActualizarConfiguracionIdiomasDto,
  AsignarIdiomaDominioDto,
  ExportarIdiomasDto,
  ImportarIdiomasDto,
  EstadoIdiomaEnum,
  EstadoTraduccionEnum,
  ConfiguracionIdiomasRespuestaDto
} from '../../aplicacion/dto/configuracion-idiomas.dto';

/**
 * Caso de uso para la gestión de configuración de idiomas
 * Implementa todas las operaciones de negocio para gestión multilingüe
 */
@Injectable()
export class GestionIdiomasCasoUso {
  constructor(
    private readonly repositorioIdiomas: RepositorioConfiguracionIdiomas,
  ) {}

  /**
   * Crear una nueva configuración de idiomas
   */
  async crear(
    tiendaId: string,
    datos: ConfiguracionIdiomasDto
  ): Promise<RespuestaEstandar<ConfiguracionIdiomasRespuestaDto>> {
    try {
      // Validar que no exista un idioma con el mismo código en la tienda
      const existe = await this.repositorioIdiomas.existePorCodigo(tiendaId, datos.codigo_idioma);
      if (existe) {
        throw ExcepcionDominio.Respuesta400(
          `Ya existe un idioma con el código "${datos.codigo_idioma}" en esta tienda`,
          'Idiomas.CodigoDuplicado'
        );
      }

      // Validar restricción de idioma predeterminado único
      if (datos.predeterminado) {
        const puedeEstablecer = await this.repositorioIdiomas.puedeEstablecerComoPredeterminado('');
        if (!puedeEstablecer) {
          throw ExcepcionDominio.Respuesta400(
            'Ya existe un idioma predeterminado en esta tienda',
            'Idiomas.PredeterminadoYaExiste'
          );
        }
      }

      // Crear la entidad de dominio
      const id = this.generarIdUnico();
      const configuracion = ConfiguracionIdiomas.crear(
        id,
        tiendaId,
        datos.codigo_idioma,
        datos.nombre_idioma,
        datos.estado as EstadoIdiomaEnum,
        datos.predeterminado,
        datos.dominios_asociados || [],
        datos.estado_traduccion as EstadoTraduccionEnum,
        datos.porcentaje_traduccion
      );

      // Guardar en el repositorio
      const configuracionGuardada = await this.repositorioIdiomas.guardar(configuracion);

      // Si es predeterminado, asegurarse de que sea el único predeterminado
      if (datos.predeterminado) {
        await this.repositorioIdiomas.establecerPredeterminadoMasivo(id, tiendaId);
      }

      return ServicioRespuestaEstandar.Respuesta201(
        'Configuración de idiomas creada exitosamente',
        this.aDtoRespuesta(configuracionGuardada),
        'Idiomas.CreadoExitosamente'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al crear la configuración de idiomas',
        'Idiomas.ErrorCreacion'
      );
    }
  }

  /**
   * Obtener configuración de idiomas por ID
   */
  async obtenerPorId(
    id: string
  ): Promise<RespuestaEstandar<ConfiguracionIdiomasRespuestaDto>> {
    try {
      const configuracion = await this.repositorioIdiomas.buscarPorId(id);
      
      if (!configuracion) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de idiomas no encontrada',
          'Idiomas.NoEncontrado'
        );
      }

      return ServicioRespuestaEstandar.Respuesta200(
        'Configuración de idiomas obtenida exitosamente',
        this.aDtoRespuesta(configuracion),
        'Idiomas.ObtenidoExitosamente'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al obtener la configuración de idiomas',
        'Idiomas.ErrorObtencion'
      );
    }
  }

  /**
   * Listar todas las configuraciones de idiomas de una tienda
   */
  async listarPorTienda(
    tiendaId: string
  ): Promise<RespuestaEstandar<ConfiguracionIdiomasRespuestaDto[]>> {
    try {
      const configuraciones = await this.repositorioIdiomas.listarPorTienda(tiendaId);
      
      const dtos = configuraciones.map(config => this.aDtoRespuesta(config));

      return ServicioRespuestaEstandar.Respuesta200(
        'Configuraciones de idiomas obtenidas exitosamente',
        dtos,
        'Idiomas.ListadoExitoso'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al listar las configuraciones de idiomas',
        'Idiomas.ErrorListado'
      );
    }
  }

  /**
   * Listar configuraciones de idiomas por estado
   */
  async listarPorEstado(
    tiendaId: string,
    estado: EstadoIdiomaEnum
  ): Promise<RespuestaEstandar<ConfiguracionIdiomasRespuestaDto[]>> {
    try {
      const configuraciones = await this.repositorioIdiomas.listarPorEstado(tiendaId, estado);
      
      const dtos = configuraciones.map(config => this.aDtoRespuesta(config));

      return ServicioRespuestaEstandar.Respuesta200(
        `Configuraciones de idiomas ${estado} obtenidas exitosamente`,
        dtos,
        'Idiomas.ListadoPorEstadoExitoso'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al listar las configuraciones de idiomas por estado',
        'Idiomas.ErrorListadoPorEstado'
      );
    }
  }

  /**
   * Actualizar configuración de idiomas
   */
  async actualizar(
    id: string,
    datos: ActualizarConfiguracionIdiomasDto
  ): Promise<RespuestaEstandar<ConfiguracionIdiomasRespuestaDto>> {
    try {
      // Verificar que existe
      const configuracionExistente = await this.repositorioIdiomas.buscarPorId(id);
      if (!configuracionExistente) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de idiomas no encontrada',
          'Idiomas.NoEncontrado'
        );
      }

      // Validar código duplicado si se está actualizando
      if (datos.codigo_idioma && datos.codigo_idioma !== configuracionExistente.codigoIdioma) {
        const existe = await this.repositorioIdiomas.existePorCodigo(
          configuracionExistente.tiendaId,
          datos.codigo_idioma
        );
        if (existe) {
          throw ExcepcionDominio.Respuesta400(
            `Ya existe un idioma con el código "${datos.codigo_idioma}" en esta tienda`,
            'Idiomas.CodigoDuplicado'
          );
        }
      }

      // Validar restricción de idioma predeterminado único
      if (datos.predeterminado && !configuracionExistente.predeterminado) {
        const puedeEstablecer = await this.repositorioIdiomas.puedeEstablecerComoPredeterminado(id);
        if (!puedeEstablecer) {
          throw ExcepcionDominio.Respuesta400(
            'Ya existe un idioma predeterminado en esta tienda',
            'Idiomas.PredeterminadoYaExiste'
          );
        }
      }

      // Actualizar en el repositorio
      const configuracionActualizada = await this.repositorioIdiomas.actualizar(id, datos);

      // Si se estableció como predeterminado, asegurarse de que sea el único
      if (datos.predeterminado) {
        await this.repositorioIdiomas.establecerPredeterminadoMasivo(id, configuracionExistente.tiendaId);
      }

      return ServicioRespuestaEstandar.Respuesta200(
        'Configuración de idiomas actualizada exitosamente',
        this.aDtoRespuesta(configuracionActualizada),
        'Idiomas.ActualizadoExitosamente'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al actualizar la configuración de idiomas',
        'Idiomas.ErrorActualizacion'
      );
    }
  }

  /**
   * Eliminar configuración de idiomas
   */
  async eliminar(
    id: string
  ): Promise<RespuestaEstandar<null>> {
    try {
      // Verificar que existe
      const configuracionExistente = await this.repositorioIdiomas.buscarPorId(id);
      if (!configuracionExistente) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de idiomas no encontrada',
          'Idiomas.NoEncontrado'
        );
      }

      // Validar que puede ser eliminado
      const puedeEliminar = await this.repositorioIdiomas.puedeSerEliminado(id);
      if (!puedeEliminar) {
        throw ExcepcionDominio.Respuesta400(
          'No se puede eliminar esta configuración de idiomas. Puede ser porque es predeterminada o está asignada a dominios.',
          'Idiomas.NoSePuedeEliminar'
        );
      }

      // Eliminar del repositorio
      await this.repositorioIdiomas.eliminar(id);

      return ServicioRespuestaEstandar.Respuesta200(
        'Configuración de idiomas eliminada exitosamente',
        null,
        'Idiomas.EliminadoExitosamente'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al eliminar la configuración de idiomas',
        'Idiomas.ErrorEliminacion'
      );
    }
  }

  /**
   * Establecer idioma como predeterminado
   */
  async establecerComoPredeterminado(
    id: string
  ): Promise<RespuestaEstandar<ConfiguracionIdiomasRespuestaDto>> {
    try {
      // Verificar que existe
      const configuracionExistente = await this.repositorioIdiomas.buscarPorId(id);
      if (!configuracionExistente) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de idiomas no encontrada',
          'Idiomas.NoEncontrado'
        );
      }

      // Validar que puede establecerse como predeterminado
      const puedeEstablecer = await this.repositorioIdiomas.puedeEstablecerComoPredeterminado(id);
      if (!puedeEstablecer) {
        throw ExcepcionDominio.Respuesta400(
          'No se puede establecer este idioma como predeterminado',
          'Idiomas.NoSePuedeEstablecerPredeterminado'
        );
      }

      // Establecer como predeterminado
      const configuracionActualizada = await this.repositorioIdiomas.establecerComoPredeterminado(id);

      return ServicioRespuestaEstandar.Respuesta200(
        'Idioma establecido como predeterminado exitosamente',
        this.aDtoRespuesta(configuracionActualizada),
        'Idiomas.PredeterminadoEstablecido'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al establecer el idioma como predeterminado',
        'Idiomas.ErrorEstablecerPredeterminado'
      );
    }
  }

  /**
   * Publicar idioma
   */
  async publicar(
    id: string
  ): Promise<RespuestaEstandar<ConfiguracionIdiomasRespuestaDto>> {
    try {
      // Verificar que existe
      const configuracionExistente = await this.repositorioIdiomas.buscarPorId(id);
      if (!configuracionExistente) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de idiomas no encontrada',
          'Idiomas.NoEncontrado'
        );
      }

      // Publicar el idioma
      const configuracionActualizada = await this.repositorioIdiomas.publicar(id);

      return ServicioRespuestaEstandar.Respuesta200(
        'Idioma publicado exitosamente',
        this.aDtoRespuesta(configuracionActualizada),
        'Idiomas.PublicadoExitosamente'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al publicar el idioma',
        'Idiomas.ErrorPublicacion'
      );
    }
  }

  /**
   * Despublicar idioma
   */
  async despublicar(
    id: string
  ): Promise<RespuestaEstandar<ConfiguracionIdiomasRespuestaDto>> {
    try {
      // Verificar que existe
      const configuracionExistente = await this.repositorioIdiomas.buscarPorId(id);
      if (!configuracionExistente) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de idiomas no encontrada',
          'Idiomas.NoEncontrado'
        );
      }

      // Validar que puede ser despublicado
      const puedeDespublicar = await this.repositorioIdiomas.puedeSerDespublicado(id);
      if (!puedeDespublicar) {
        throw ExcepcionDominio.Respuesta400(
          'No se puede despublicar este idioma. Puede ser el único idioma publicado.',
          'Idiomas.NoSePuedeDespublicar'
        );
      }

      // Despublicar el idioma
      const configuracionActualizada = await this.repositorioIdiomas.despublicar(id);

      return ServicioRespuestaEstandar.Respuesta200(
        'Idioma despublicado exitosamente',
        this.aDtoRespuesta(configuracionActualizada),
        'Idiomas.DespublicadoExitosamente'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al despublicar el idioma',
        'Idiomas.ErrorDespublicacion'
      );
    }
  }

  /**
   * Asignar idioma a dominio
   */
  async asignarADominio(
    id: string,
    asignacion: AsignarIdiomaDominioDto
  ): Promise<RespuestaEstandar<ConfiguracionIdiomasRespuestaDto>> {
    try {
      // Verificar que existe
      const configuracionExistente = await this.repositorioIdiomas.buscarPorId(id);
      if (!configuracionExistente) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de idiomas no encontrada',
          'Idiomas.NoEncontrado'
        );
      }

      // Asignar al dominio
      const configuracionActualizada = await this.repositorioIdiomas.asignarADominio(id, asignacion);

      return ServicioRespuestaEstandar.Respuesta200(
        'Idioma asignado al dominio exitosamente',
        this.aDtoRespuesta(configuracionActualizada),
        'Idiomas.AsignadoADominioExitosamente'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al asignar el idioma al dominio',
        'Idiomas.ErrorAsignacionDominio'
      );
    }
  }

  /**
   * Desasignar idioma de dominio
   */
  async desasignarDeDominio(
    id: string,
    dominio: string
  ): Promise<RespuestaEstandar<ConfiguracionIdiomasRespuestaDto>> {
    try {
      // Verificar que existe
      const configuracionExistente = await this.repositorioIdiomas.buscarPorId(id);
      if (!configuracionExistente) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de idiomas no encontrada',
          'Idiomas.NoEncontrado'
        );
      }

      // Desasignar del dominio
      const configuracionActualizada = await this.repositorioIdiomas.desasignarDeDominio(id, dominio);

      return ServicioRespuestaEstandar.Respuesta200(
        'Idioma desasignado del dominio exitosamente',
        this.aDtoRespuesta(configuracionActualizada),
        'Idiomas.DesasignadoDeDominioExitosamente'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al desasignar el idioma del dominio',
        'Idiomas.ErrorDesasignacionDominio'
      );
    }
  }

  /**
   * Actualizar progreso de traducción
   */
  async actualizarProgresoTraduccion(
    id: string,
    porcentaje: number,
    estado?: EstadoTraduccionEnum
  ): Promise<RespuestaEstandar<ConfiguracionIdiomasRespuestaDto>> {
    try {
      // Verificar que existe
      const configuracionExistente = await this.repositorioIdiomas.buscarPorId(id);
      if (!configuracionExistente) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de idiomas no encontrada',
          'Idiomas.NoEncontrado'
        );
      }

      // Actualizar progreso
      const configuracionActualizada = await this.repositorioIdiomas.actualizarProgresoTraduccion(
        id,
        porcentaje,
        estado
      );

      return ServicioRespuestaEstandar.Respuesta200(
        'Progreso de traducción actualizado exitosamente',
        this.aDtoRespuesta(configuracionActualizada),
        'Idiomas.ProgresoTraduccionActualizado'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al actualizar el progreso de traducción',
        'Idiomas.ErrorActualizacionProgreso'
      );
    }
  }

  /**
   * Marcar como completamente traducido
   */
  async marcarComoTraducido(
    id: string
  ): Promise<RespuestaEstandar<ConfiguracionIdiomasRespuestaDto>> {
    try {
      // Verificar que existe
      const configuracionExistente = await this.repositorioIdiomas.buscarPorId(id);
      if (!configuracionExistente) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de idiomas no encontrada',
          'Idiomas.NoEncontrado'
        );
      }

      // Marcar como traducido
      const configuracionActualizada = await this.repositorioIdiomas.marcarComoTraducido(id);

      return ServicioRespuestaEstandar.Respuesta200(
        'Idioma marcado como completamente traducido exitosamente',
        this.aDtoRespuesta(configuracionActualizada),
        'Idiomas.MarcadoComoTraducido'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al marcar el idioma como traducido',
        'Idiomas.ErrorMarcarTraducido'
      );
    }
  }

  /**
   * Exportar configuración de idiomas
   */
  async exportar(
    datos: ExportarIdiomasDto,
    tiendaId: string
  ): Promise<RespuestaEstandar<string>> {
    try {
      const contenidoExportado = await this.repositorioIdiomas.exportar(datos, tiendaId);

      return ServicioRespuestaEstandar.Respuesta200(
        'Configuración de idiomas exportada exitosamente',
        contenidoExportado,
        'Idiomas.ExportadoExitosamente'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al exportar la configuración de idiomas',
        'Idiomas.ErrorExportacion'
      );
    }
  }

  /**
   * Importar configuración de idiomas
   */
  async importar(
    datos: ImportarIdiomasDto,
    tiendaId: string
  ): Promise<RespuestaEstandar<ConfiguracionIdiomasRespuestaDto[]>> {
    try {
      const configuracionesImportadas = await this.repositorioIdiomas.importar(datos, tiendaId);

      const dtos = configuracionesImportadas.map(config => this.aDtoRespuesta(config));

      return ServicioRespuestaEstandar.Respuesta201(
        'Configuración de idiomas importada exitosamente',
        dtos,
        'Idiomas.ImportadoExitosamente'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al importar la configuración de idiomas',
        'Idiomas.ErrorImportacion'
      );
    }
  }

  /**
   * Obtener estadísticas de idiomas
   */
  async obtenerEstadisticas(
    tiendaId: string
  ): Promise<RespuestaEstandar<any>> {
    try {
      const estadisticas = await this.repositorioIdiomas.obtenerEstadisticas(tiendaId);

      return ServicioRespuestaEstandar.Respuesta200(
        'Estadísticas de idiomas obtenidas exitosamente',
        estadisticas,
        'Idiomas.EstadisticasObtenidas'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al obtener las estadísticas de idiomas',
        'Idiomas.ErrorObtencionEstadisticas'
      );
    }
  }

  /**
   * Buscar idiomas por término
   */
  async buscar(
    tiendaId: string,
    termino: string
  ): Promise<RespuestaEstandar<ConfiguracionIdiomasRespuestaDto[]>> {
    try {
      const configuraciones = await this.repositorioIdiomas.buscar(tiendaId, termino);
      
      const dtos = configuraciones.map(config => this.aDtoRespuesta(config));

      return ServicioRespuestaEstandar.Respuesta200(
        'Búsqueda de idiomas completada exitosamente',
        dtos,
        'Idiomas.BusquedaExitosa'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al buscar idiomas',
        'Idiomas.ErrorBusqueda'
      );
    }
  }

  /**
   * Obtener idiomas que necesitan atención
   */
  async obtenerQueNecesitanAtencion(
    tiendaId: string
  ): Promise<RespuestaEstandar<ConfiguracionIdiomasRespuestaDto[]>> {
    try {
      const configuraciones = await this.repositorioIdiomas.obtenerQueNecesitanAtencion(tiendaId);
      
      const dtos = configuraciones.map(config => this.aDtoRespuesta(config));

      return ServicioRespuestaEstandar.Respuesta200(
        'Idiomas que necesitan atención obtenidos exitosamente',
        dtos,
        'Idiomas.AtencionNecesariaObtenida'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al obtener idiomas que necesitan atención',
        'Idiomas.ErrorObtencionAtencion'
      );
    }
  }

  /**
   * Métodos auxiliares
   */

  /**
   * Generar ID único para la configuración
   */
  private generarIdUnico(): string {
    return `idioma_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Convertir entidad a DTO de respuesta
   */
  private aDtoRespuesta(configuracion: ConfiguracionIdiomas): ConfiguracionIdiomasRespuestaDto {
    return {
      id: configuracion.id,
      tienda_id: configuracion.tiendaId,
      codigo_idioma: configuracion.codigoIdioma,
      nombre_idioma: configuracion.nombreIdioma,
      estado: configuracion.estado,
      predeterminado: configuracion.predeterminado,
      dominios_asociados: configuracion.dominiosAsociados,
      estado_traduccion: configuracion.estadoTraduccion,
      porcentaje_traduccion: configuracion.porcentajeTraduccion,
      fecha_creacion: configuracion.fechaCreacion,
      fecha_actualizacion: configuracion.fechaActualizacion,
    };
  }
}