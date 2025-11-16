import { Injectable } from '@nestjs/common';
import { ServicioRespuestaEstandar } from '../../../comun/aplicacion/servicios/servicio-respuesta-estandar';
import { ExcepcionDominio } from '../../../comun/excepciones/excepcion-dominio';
import type { RepositorioConfiguracionEnvioEntrega } from '../interfaces/repositorio-configuracion-envio-entrega.interface';
import { ConfiguracionEnvioEntrega } from '../entidades/configuracion-envio-entrega.entity';
import {
  ConfiguracionEnvioEntregaDto,
  ActualizarConfiguracionEnvioEntregaDto,
  PerfilEnvioDto,
  MetodoEntregaDto,
  EmbalajeDto,
  ProveedorTransporteDto,
  PlantillaDocumentacionDto,
  TipoEntregaEnum,
  CrearPerfilEnvioDto,
  ActualizarPerfilEnvioDto
} from '../../aplicacion/dto/configuracion-envio-entrega.dto';

/**
 * Caso de uso para gestión de configuración de envío y entrega
 * Implementa todas las operaciones de negocio relacionadas con envíos
 */
@Injectable()
export class GestionEnvioEntregaCasoUso {
  constructor(
    private readonly repositorioEnvioEntrega: RepositorioConfiguracionEnvioEntrega
  ) {}

  /**
   * Obtener configuración completa de envío y entrega
   */
  async obtenerConfiguracion(tiendaId: string) {
    try {
      const configuracion = await this.repositorioEnvioEntrega.encontrarPorTiendaId(tiendaId);

      if (!configuracion) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de envío y entrega no encontrada',
          'EnvioEntrega.ConfiguracionNoEncontrada'
        );
      }

      return ServicioRespuestaEstandar.Respuesta200(
        'Configuración de envío y entrega obtenida exitosamente',
        this.aDto(configuracion)
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al obtener configuración de envío y entrega',
        'EnvioEntrega.ErrorObtencion'
      );
    }
  }

  /**
   * Crear configuración de envío y entrega
   */
  async crearConfiguracion(tiendaId: string, datos: ConfiguracionEnvioEntregaDto) {
    try {
      // Verificar si ya existe configuración para esta tienda
      const existe = await this.repositorioEnvioEntrega.existePorTiendaId(tiendaId);
      
      if (existe) {
        throw ExcepcionDominio.Respuesta400(
          'Ya existe una configuración de envío y entrega para esta tienda',
          'EnvioEntrega.ConfiguracionExistente'
        );
      }

      const id = this.generarId();
      const configuracion = ConfiguracionEnvioEntrega.crear(
        id,
        tiendaId,
        datos.perfiles_envio,
        datos.metodos_entrega,
        datos.embalajes,
        datos.proveedores_transporte,
        datos.plantillas_documentacion
      );

      const configuracionGuardada = await this.repositorioEnvioEntrega.guardar(configuracion);

      return ServicioRespuestaEstandar.Respuesta201(
        'Configuración de envío y entrega creada exitosamente',
        this.aDto(configuracionGuardada)
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al crear configuración de envío y entrega',
        'EnvioEntrega.ErrorCreacion'
      );
    }
  }

  /**
   * Actualizar configuración de envío y entrega
   */
  async actualizarConfiguracion(tiendaId: string, datos: ActualizarConfiguracionEnvioEntregaDto) {
    try {
      const configuracionExistente = await this.repositorioEnvioEntrega.encontrarPorTiendaId(tiendaId);

      if (!configuracionExistente) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de envío y entrega no encontrada',
          'EnvioEntrega.ConfiguracionNoEncontrada'
        );
      }

      // Reconstruir entidad con datos existentes
      const configuracionActualizada = ConfiguracionEnvioEntrega.reconstruir(
        configuracionExistente.id,
        configuracionExistente.tiendaId,
        datos.perfiles_envio || configuracionExistente.perfilesEnvio,
        datos.metodos_entrega || configuracionExistente.metodosEntrega,
        datos.embalajes || configuracionExistente.embalajes,
        datos.proveedores_transporte || configuracionExistente.proveedoresTransporte,
        datos.plantillas_documentacion || configuracionExistente.plantillasDocumentacion,
        configuracionExistente.fechaCreacion,
        new Date()
      );

      const configuracionGuardada = await this.repositorioEnvioEntrega.actualizar(configuracionActualizada);

      return ServicioRespuestaEstandar.Respuesta200(
        'Configuración de envío y entrega actualizada exitosamente',
        this.aDto(configuracionGuardada)
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al actualizar configuración de envío y entrega',
        'EnvioEntrega.ErrorActualizacion'
      );
    }
  }

  /**
   * Eliminar configuración de envío y entrega
   */
  async eliminarConfiguracion(tiendaId: string) {
    try {
      const configuracion = await this.repositorioEnvioEntrega.encontrarPorTiendaId(tiendaId);

      if (!configuracion) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de envío y entrega no encontrada',
          'EnvioEntrega.ConfiguracionNoEncontrada'
        );
      }

      await this.repositorioEnvioEntrega.eliminarPorTiendaId(tiendaId);

      return ServicioRespuestaEstandar.Respuesta200(
        'Configuración de envío y entrega eliminada exitosamente',
        null
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al eliminar configuración de envío y entrega',
        'EnvioEntrega.ErrorEliminacion'
      );
    }
  }

  /**
   * Gestión de perfiles de envío
   */

  /**
   * Agregar perfil de envío
   */
  async agregarPerfilEnvio(tiendaId: string, datos: CrearPerfilEnvioDto) {
    try {
      const configuracion = await this.repositorioEnvioEntrega.encontrarPorTiendaId(tiendaId);

      if (!configuracion) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de envío y entrega no encontrada',
          'EnvioEntrega.ConfiguracionNoEncontrada'
        );
      }

      const perfil: PerfilEnvioDto = {
        id: this.generarId(),
        nombre_perfil: datos.nombre_perfil,
        zonas_envio: datos.zonas_envio,
        tarifas: datos.tarifas,
        productos: datos.productos,
        fecha_creacion: new Date(),
        fecha_actualizacion: new Date()
      };

      const configuracionActualizada = await this.repositorioEnvioEntrega.agregarPerfilEnvio(tiendaId, perfil);

      return ServicioRespuestaEstandar.Respuesta201(
        'Perfil de envío agregado exitosamente',
        this.aDto(configuracionActualizada)
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al agregar perfil de envío',
        'EnvioEntrega.ErrorAgregarPerfil'
      );
    }
  }

  /**
   * Actualizar perfil de envío
   */
  async actualizarPerfilEnvio(tiendaId: string, idPerfil: string, datos: ActualizarPerfilEnvioDto) {
    try {
      const configuracion = await this.repositorioEnvioEntrega.encontrarPorTiendaId(tiendaId);

      if (!configuracion) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de envío y entrega no encontrada',
          'EnvioEntrega.ConfiguracionNoEncontrada'
        );
      }

      const perfilExistente = await this.repositorioEnvioEntrega.encontrarPerfilEnvioPorId(tiendaId, idPerfil);

      if (!perfilExistente) {
        throw ExcepcionDominio.Respuesta404(
          'Perfil de envío no encontrado',
          'EnvioEntrega.PerfilNoEncontrado'
        );
      }

      const configuracionActualizada = await this.repositorioEnvioEntrega.actualizarPerfilEnvio(
        tiendaId,
        idPerfil,
        {
          ...datos,
          fecha_actualizacion: new Date()
        }
      );

      return ServicioRespuestaEstandar.Respuesta200(
        'Perfil de envío actualizado exitosamente',
        this.aDto(configuracionActualizada)
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al actualizar perfil de envío',
        'EnvioEntrega.ErrorActualizarPerfil'
      );
    }
  }

  /**
   * Eliminar perfil de envío
   */
  async eliminarPerfilEnvio(tiendaId: string, idPerfil: string) {
    try {
      const configuracion = await this.repositorioEnvioEntrega.encontrarPorTiendaId(tiendaId);

      if (!configuracion) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de envío y entrega no encontrada',
          'EnvioEntrega.ConfiguracionNoEncontrada'
        );
      }

      const perfilExistente = await this.repositorioEnvioEntrega.encontrarPerfilEnvioPorId(tiendaId, idPerfil);

      if (!perfilExistente) {
        throw ExcepcionDominio.Respuesta404(
          'Perfil de envío no encontrado',
          'EnvioEntrega.PerfilNoEncontrado'
        );
      }

      const configuracionActualizada = await this.repositorioEnvioEntrega.eliminarPerfilEnvio(tiendaId, idPerfil);

      return ServicioRespuestaEstandar.Respuesta200(
        'Perfil de envío eliminado exitosamente',
        this.aDto(configuracionActualizada)
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al eliminar perfil de envío',
        'EnvioEntrega.ErrorEliminarPerfil'
      );
    }
  }

  /**
   * Gestión de métodos de entrega
   */

  /**
   * Activar/desactivar método de entrega
   */
  async toggleMetodoEntrega(tiendaId: string, tipo: TipoEntregaEnum, activar: boolean) {
    try {
      const configuracion = await this.repositorioEnvioEntrega.encontrarPorTiendaId(tiendaId);

      if (!configuracion) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de envío y entrega no encontrada',
          'EnvioEntrega.ConfiguracionNoEncontrada'
        );
      }

      const configuracionActualizada = await this.repositorioEnvioEntrega.toggleMetodoEntrega(
        tiendaId,
        tipo,
        activar
      );

      const mensaje = activar 
        ? 'Método de entrega activado exitosamente'
        : 'Método de entrega desactivado exitosamente';

      return ServicioRespuestaEstandar.Respuesta200(
        mensaje,
        this.aDto(configuracionActualizada)
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al cambiar estado del método de entrega',
        'EnvioEntrega.ErrorToggleMetodo'
      );
    }
  }

  /**
   * Obtener métodos de entrega activos
   */
  async obtenerMetodosEntregaActivos(tiendaId: string) {
    try {
      const metodosActivos = await this.repositorioEnvioEntrega.obtenerMetodosEntregaActivos(tiendaId);

      return ServicioRespuestaEstandar.Respuesta200(
        'Métodos de entrega activos obtenidos exitosamente',
        metodosActivos
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al obtener métodos de entrega activos',
        'EnvioEntrega.ErrorObtencionMetodosActivos'
      );
    }
  }

  /**
   * Gestión de embalajes
   */

  /**
   * Establecer embalaje predeterminado
   */
  async establecerEmbalajePredeterminado(tiendaId: string, idEmbalaje: string) {
    try {
      const configuracion = await this.repositorioEnvioEntrega.encontrarPorTiendaId(tiendaId);

      if (!configuracion) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de envío y entrega no encontrada',
          'EnvioEntrega.ConfiguracionNoEncontrada'
        );
      }

      const configuracionActualizada = await this.repositorioEnvioEntrega.establecerEmbalajePredeterminado(
        tiendaId,
        idEmbalaje
      );

      return ServicioRespuestaEstandar.Respuesta200(
        'Embalaje predeterminado establecido exitosamente',
        this.aDto(configuracionActualizada)
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al establecer embalaje predeterminado',
        'EnvioEntrega.ErrorEstablecerEmbalaje'
      );
    }
  }

  /**
   * Obtener embalaje predeterminado
   */
  async obtenerEmbalajePredeterminado(tiendaId: string) {
    try {
      const embalajePredeterminado = await this.repositorioEnvioEntrega.obtenerEmbalajePredeterminado(tiendaId);

      if (!embalajePredeterminado) {
        throw ExcepcionDominio.Respuesta404(
          'No se encontró embalaje predeterminado',
          'EnvioEntrega.EmbalajePredeterminadoNoEncontrado'
        );
      }

      return ServicioRespuestaEstandar.Respuesta200(
        'Embalaje predeterminado obtenido exitosamente',
        embalajePredeterminado
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al obtener embalaje predeterminado',
        'EnvioEntrega.ErrorObtencionEmbalaje'
      );
    }
  }

  /**
   * Gestión de proveedores de transporte
   */

  /**
   * Activar/desactivar proveedor de transporte
   */
  async toggleProveedorTransporte(tiendaId: string, idProveedor: string, activar: boolean) {
    try {
      const configuracion = await this.repositorioEnvioEntrega.encontrarPorTiendaId(tiendaId);

      if (!configuracion) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de envío y entrega no encontrada',
          'EnvioEntrega.ConfiguracionNoEncontrada'
        );
      }

      const configuracionActualizada = await this.repositorioEnvioEntrega.toggleProveedorTransporte(
        tiendaId,
        idProveedor,
        activar
      );

      const mensaje = activar 
        ? 'Proveedor de transporte activado exitosamente'
        : 'Proveedor de transporte desactivado exitosamente';

      return ServicioRespuestaEstandar.Respuesta200(
        mensaje,
        this.aDto(configuracionActualizada)
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al cambiar estado del proveedor de transporte',
        'EnvioEntrega.ErrorToggleProveedor'
      );
    }
  }

  /**
   * Obtener proveedores de transporte activos
   */
  async obtenerProveedoresTransporteActivos(tiendaId: string) {
    try {
      const proveedoresActivos = await this.repositorioEnvioEntrega.obtenerProveedoresTransporteActivos(tiendaId);

      return ServicioRespuestaEstandar.Respuesta200(
        'Proveedores de transporte activos obtenidos exitosamente',
        proveedoresActivos
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al obtener proveedores de transporte activos',
        'EnvioEntrega.ErrorObtencionProveedores'
      );
    }
  }

  /**
   * Métodos auxiliares
   */

  /**
   * Convertir entidad a DTO
   */
  private aDto(configuracion: ConfiguracionEnvioEntrega): ConfiguracionEnvioEntregaDto {
    return {
      perfiles_envio: configuracion.perfilesEnvio,
      metodos_entrega: configuracion.metodosEntrega,
      embalajes: configuracion.embalajes,
      proveedores_transporte: configuracion.proveedoresTransporte,
      plantillas_documentacion: configuracion.plantillasDocumentacion
    };
  }

  /**
   * Generar ID único
   */
  private generarId(): string {
    return `envio-entrega-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}