import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { ExcepcionDominio } from '../../../comun/excepciones/excepcion-dominio';
import { RepositorioConfiguracionEnvioEntrega } from '../../dominio/interfaces/repositorio-configuracion-envio-entrega.interface';
import { ConfiguracionEnvioEntrega } from '../../dominio/entidades/configuracion-envio-entrega.entity';
import {
  PerfilEnvioDto,
  MetodoEntregaDto,
  EmbalajeDto,
  ProveedorTransporteDto,
  PlantillaDocumentacionDto,
  TipoEntregaEnum
} from '../../aplicacion/dto/configuracion-envio-entrega.dto';

/**
 * Implementación del repositorio de Configuración de Envío y Entrega usando Prisma
 * Maneja la persistencia de datos en PostgreSQL siguiendo el patrón Repository
 */
@Injectable()
export class PrismaRepositorioConfiguracionEnvioEntrega implements RepositorioConfiguracionEnvioEntrega {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Encontrar configuración por ID de tienda
   */
  async encontrarPorTiendaId(tiendaId: string): Promise<ConfiguracionEnvioEntrega | null> {
    try {
      const configuracionBD = await this.prisma.configuracion_envio_entrega.findUnique({
        where: { tienda_id: tiendaId }
      });

      if (!configuracionBD) {
        return null;
      }

      return ConfiguracionEnvioEntrega.reconstruir(
        configuracionBD.id,
        configuracionBD.tienda_id,
        configuracionBD.perfiles_envio as any,
        configuracionBD.metodos_entrega as any,
        configuracionBD.embalajes as any,
        configuracionBD.proveedores_transporte as any,
        configuracionBD.plantillas_documentacion as any,
        configuracionBD.fecha_creacion,
        configuracionBD.fecha_actualizacion
      );
    } catch (error) {
      throw ExcepcionDominio.Respuesta500(
        'Error al buscar configuración de envío y entrega',
        'EnvioEntrega.ErrorBusqueda'
      );
    }
  }

  /**
   * Guardar configuración
   */
  async guardar(configuracion: ConfiguracionEnvioEntrega): Promise<ConfiguracionEnvioEntrega> {
    try {
      const configuracionBD = await this.prisma.configuracion_envio_entrega.create({
        data: {
          id: configuracion.id,
          tienda_id: configuracion.tiendaId,
          perfiles_envio: configuracion.perfilesEnvio as any,
          metodos_entrega: configuracion.metodosEntrega as any,
          embalajes: configuracion.embalajes as any,
          proveedores_transporte: configuracion.proveedoresTransporte as any,
          plantillas_documentacion: configuracion.plantillasDocumentacion as any,
          fecha_creacion: configuracion.fechaCreacion,
          fecha_actualizacion: configuracion.fechaActualizacion
        }
      });

      return ConfiguracionEnvioEntrega.reconstruir(
        configuracionBD.id,
        configuracionBD.tienda_id,
        configuracionBD.perfiles_envio as any,
        configuracionBD.metodos_entrega as any,
        configuracionBD.embalajes as any,
        configuracionBD.proveedores_transporte as any,
        configuracionBD.plantillas_documentacion as any,
        configuracionBD.fecha_creacion,
        configuracionBD.fecha_actualizacion
      );
    } catch (error) {
      throw ExcepcionDominio.Respuesta500(
        'Error al guardar configuración de envío y entrega',
        'EnvioEntrega.ErrorGuardado'
      );
    }
  }

  /**
   * Actualizar configuración
   */
  async actualizar(configuracion: ConfiguracionEnvioEntrega): Promise<ConfiguracionEnvioEntrega> {
    try {
      const configuracionBD = await this.prisma.configuracion_envio_entrega.update({
        where: { id: configuracion.id },
        data: {
          perfiles_envio: configuracion.perfilesEnvio as any,
          metodos_entrega: configuracion.metodosEntrega as any,
          embalajes: configuracion.embalajes as any,
          proveedores_transporte: configuracion.proveedoresTransporte as any,
          plantillas_documentacion: configuracion.plantillasDocumentacion as any,
          fecha_actualizacion: new Date()
        }
      });

      return ConfiguracionEnvioEntrega.reconstruir(
        configuracionBD.id,
        configuracionBD.tienda_id,
        configuracionBD.perfiles_envio as any,
        configuracionBD.metodos_entrega as any,
        configuracionBD.embalajes as any,
        configuracionBD.proveedores_transporte as any,
        configuracionBD.plantillas_documentacion as any,
        configuracionBD.fecha_creacion,
        configuracionBD.fecha_actualizacion
      );
    } catch (error) {
      throw ExcepcionDominio.Respuesta500(
        'Error al actualizar configuración de envío y entrega',
        'EnvioEntrega.ErrorActualizacion'
      );
    }
  }

  /**
   * Eliminar configuración por ID de tienda
   */
  async eliminarPorTiendaId(tiendaId: string): Promise<void> {
    try {
      await this.prisma.configuracion_envio_entrega.delete({
        where: { tienda_id: tiendaId }
      });
    } catch (error) {
      throw ExcepcionDominio.Respuesta500(
        'Error al eliminar configuración de envío y entrega',
        'EnvioEntrega.ErrorEliminacion'
      );
    }
  }

  /**
   * Verificar existencia por ID de tienda
   */
  async existePorTiendaId(tiendaId: string): Promise<boolean> {
    try {
      const configuracion = await this.prisma.configuracion_envio_entrega.findUnique({
        where: { tienda_id: tiendaId },
        select: { id: true }
      });

      return !!configuracion;
    } catch (error) {
      throw ExcepcionDominio.Respuesta500(
        'Error al verificar existencia de configuración de envío y entrega',
        'EnvioEntrega.ErrorVerificacion'
      );
    }
  }

  /**
   * Operaciones específicas para perfiles de envío
   */

  /**
   * Agregar perfil de envío
   */
  async agregarPerfilEnvio(tiendaId: string, perfil: PerfilEnvioDto): Promise<ConfiguracionEnvioEntrega> {
    try {
      const configuracionBD = await this.prisma.configuracion_envio_entrega.findUnique({
        where: { tienda_id: tiendaId }
      });

      if (!configuracionBD) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de envío y entrega no encontrada',
          'EnvioEntrega.ConfiguracionNoEncontrada'
        );
      }

      const perfilesActuales = configuracionBD.perfiles_envio as any[];
      perfilesActuales.push(perfil);

      const configuracionActualizada = await this.prisma.configuracion_envio_entrega.update({
        where: { tienda_id: tiendaId },
        data: {
          perfiles_envio: perfilesActuales,
          fecha_actualizacion: new Date()
        }
      });

      return ConfiguracionEnvioEntrega.reconstruir(
        configuracionActualizada.id,
        configuracionActualizada.tienda_id,
        configuracionActualizada.perfiles_envio as any,
        configuracionActualizada.metodos_entrega as any,
        configuracionActualizada.embalajes as any,
        configuracionActualizada.proveedores_transporte as any,
        configuracionActualizada.plantillas_documentacion as any,
        configuracionActualizada.fecha_creacion,
        configuracionActualizada.fecha_actualizacion
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
  async actualizarPerfilEnvio(
    tiendaId: string, 
    idPerfil: string, 
    perfilActualizado: Partial<PerfilEnvioDto>
  ): Promise<ConfiguracionEnvioEntrega> {
    try {
      const configuracionBD = await this.prisma.configuracion_envio_entrega.findUnique({
        where: { tienda_id: tiendaId }
      });

      if (!configuracionBD) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de envío y entrega no encontrada',
          'EnvioEntrega.ConfiguracionNoEncontrada'
        );
      }

      const perfilesActuales = configuracionBD.perfiles_envio as PerfilEnvioDto[];
      const perfilIndex = perfilesActuales.findIndex(p => p.id === idPerfil);

      if (perfilIndex === -1) {
        throw ExcepcionDominio.Respuesta404(
          'Perfil de envío no encontrado',
          'EnvioEntrega.PerfilNoEncontrado'
        );
      }

      perfilesActuales[perfilIndex] = {
        ...perfilesActuales[perfilIndex],
        ...perfilActualizado
      };

      const configuracionActualizada = await this.prisma.configuracion_envio_entrega.update({
        where: { tienda_id: tiendaId },
        data: {
          perfiles_envio: perfilesActuales as any,
          fecha_actualizacion: new Date()
        }
      });

      return ConfiguracionEnvioEntrega.reconstruir(
        configuracionActualizada.id,
        configuracionActualizada.tienda_id,
        configuracionActualizada.perfiles_envio as any,
        configuracionActualizada.metodos_entrega as any,
        configuracionActualizada.embalajes as any,
        configuracionActualizada.proveedores_transporte as any,
        configuracionActualizada.plantillas_documentacion as any,
        configuracionActualizada.fecha_creacion,
        configuracionActualizada.fecha_actualizacion
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
  async eliminarPerfilEnvio(tiendaId: string, idPerfil: string): Promise<ConfiguracionEnvioEntrega> {
    try {
      const configuracionBD = await this.prisma.configuracion_envio_entrega.findUnique({
        where: { tienda_id: tiendaId }
      });

      if (!configuracionBD) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de envío y entrega no encontrada',
          'EnvioEntrega.ConfiguracionNoEncontrada'
        );
      }

      const perfilesActuales = configuracionBD.perfiles_envio as PerfilEnvioDto[];
      const perfilesFiltrados = perfilesActuales.filter(p => p.id !== idPerfil);

      if (perfilesActuales.length === perfilesFiltrados.length) {
        throw ExcepcionDominio.Respuesta404(
          'Perfil de envío no encontrado',
          'EnvioEntrega.PerfilNoEncontrado'
        );
      }

      const configuracionActualizada = await this.prisma.configuracion_envio_entrega.update({
        where: { tienda_id: tiendaId },
        data: {
          perfiles_envio: perfilesFiltrados as any,
          fecha_actualizacion: new Date()
        }
      });

      return ConfiguracionEnvioEntrega.reconstruir(
        configuracionActualizada.id,
        configuracionActualizada.tienda_id,
        configuracionActualizada.perfiles_envio as any,
        configuracionActualizada.metodos_entrega as any,
        configuracionActualizada.embalajes as any,
        configuracionActualizada.proveedores_transporte as any,
        configuracionActualizada.plantillas_documentacion as any,
        configuracionActualizada.fecha_creacion,
        configuracionActualizada.fecha_actualizacion
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
   * Encontrar perfil de envío por ID
   */
  async encontrarPerfilEnvioPorId(tiendaId: string, idPerfil: string): Promise<PerfilEnvioDto | null> {
    try {
      const configuracionBD = await this.prisma.configuracion_envio_entrega.findUnique({
        where: { tienda_id: tiendaId }
      });

      if (!configuracionBD) {
        return null;
      }

      const perfiles = configuracionBD.perfiles_envio as PerfilEnvioDto[];
      return perfiles.find(p => p.id === idPerfil) || null;
    } catch (error) {
      throw ExcepcionDominio.Respuesta500(
        'Error al buscar perfil de envío',
        'EnvioEntrega.ErrorBusquedaPerfil'
      );
    }
  }

  /**
   * Operaciones específicas para métodos de entrega
   */

  /**
   * Toggle método de entrega
   */
  async toggleMetodoEntrega(
    tiendaId: string, 
    tipo: TipoEntregaEnum, 
    activar: boolean
  ): Promise<ConfiguracionEnvioEntrega> {
    try {
      const configuracionBD = await this.prisma.configuracion_envio_entrega.findUnique({
        where: { tienda_id: tiendaId }
      });

      if (!configuracionBD) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de envío y entrega no encontrada',
          'EnvioEntrega.ConfiguracionNoEncontrada'
        );
      }

      const metodosActuales = configuracionBD.metodos_entrega as MetodoEntregaDto[];
      const metodoIndex = metodosActuales.findIndex(m => m.tipo_entrega === tipo);

      if (metodoIndex === -1) {
        throw ExcepcionDominio.Respuesta404(
          `Método de entrega tipo "${tipo}" no encontrado`,
          'EnvioEntrega.MetodoNoEncontrado'
        );
      }

      metodosActuales[metodoIndex].activo = activar;

      const configuracionActualizada = await this.prisma.configuracion_envio_entrega.update({
        where: { tienda_id: tiendaId },
        data: {
          metodos_entrega: metodosActuales as any,
          fecha_actualizacion: new Date()
        }
      });

      return ConfiguracionEnvioEntrega.reconstruir(
        configuracionActualizada.id,
        configuracionActualizada.tienda_id,
        configuracionActualizada.perfiles_envio as any,
        configuracionActualizada.metodos_entrega as any,
        configuracionActualizada.embalajes as any,
        configuracionActualizada.proveedores_transporte as any,
        configuracionActualizada.plantillas_documentacion as any,
        configuracionActualizada.fecha_creacion,
        configuracionActualizada.fecha_actualizacion
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
  async obtenerMetodosEntregaActivos(tiendaId: string): Promise<MetodoEntregaDto[]> {
    try {
      const configuracionBD = await this.prisma.configuracion_envio_entrega.findUnique({
        where: { tienda_id: tiendaId }
      });

      if (!configuracionBD) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de envío y entrega no encontrada',
          'EnvioEntrega.ConfiguracionNoEncontrada'
        );
      }

      const metodos = configuracionBD.metodos_entrega as MetodoEntregaDto[];
      return metodos.filter(metodo => metodo.activo);
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
   * Operaciones específicas para embalajes
   */

  /**
   * Establecer embalaje predeterminado
   */
  async establecerEmbalajePredeterminado(tiendaId: string, idEmbalaje: string): Promise<ConfiguracionEnvioEntrega> {
    try {
      const configuracionBD = await this.prisma.configuracion_envio_entrega.findUnique({
        where: { tienda_id: tiendaId }
      });

      if (!configuracionBD) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de envío y entrega no encontrada',
          'EnvioEntrega.ConfiguracionNoEncontrada'
        );
      }

      const embalajesActuales = configuracionBD.embalajes as EmbalajeDto[];
      
      // Quitar predeterminado actual
      embalajesActuales.forEach(embalaje => {
        embalaje.es_predeterminado = false;
      });

      // Establecer nuevo predeterminado
      const embalajeIndex = embalajesActuales.findIndex(e => e.id === idEmbalaje);
      
      if (embalajeIndex === -1) {
        throw ExcepcionDominio.Respuesta404(
          `Embalaje con ID "${idEmbalaje}" no encontrado`,
          'EnvioEntrega.EmbalajeNoEncontrado'
        );
      }

      embalajesActuales[embalajeIndex].es_predeterminado = true;

      const configuracionActualizada = await this.prisma.configuracion_envio_entrega.update({
        where: { tienda_id: tiendaId },
        data: {
          embalajes: embalajesActuales as any,
          fecha_actualizacion: new Date()
        }
      });

      return ConfiguracionEnvioEntrega.reconstruir(
        configuracionActualizada.id,
        configuracionActualizada.tienda_id,
        configuracionActualizada.perfiles_envio as any,
        configuracionActualizada.metodos_entrega as any,
        configuracionActualizada.embalajes as any,
        configuracionActualizada.proveedores_transporte as any,
        configuracionActualizada.plantillas_documentacion as any,
        configuracionActualizada.fecha_creacion,
        configuracionActualizada.fecha_actualizacion
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
  async obtenerEmbalajePredeterminado(tiendaId: string): Promise<EmbalajeDto | null> {
    try {
      const configuracionBD = await this.prisma.configuracion_envio_entrega.findUnique({
        where: { tienda_id: tiendaId }
      });

      if (!configuracionBD) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de envío y entrega no encontrada',
          'EnvioEntrega.ConfiguracionNoEncontrada'
        );
      }

      const embalajes = configuracionBD.embalajes as EmbalajeDto[];
      return embalajes.find(embalaje => embalaje.es_predeterminado) || null;
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
   * Operaciones específicas para proveedores de transporte
   */

  /**
   * Toggle proveedor de transporte
   */
  async toggleProveedorTransporte(
    tiendaId: string, 
    idProveedor: string, 
    activar: boolean
  ): Promise<ConfiguracionEnvioEntrega> {
    try {
      const configuracionBD = await this.prisma.configuracion_envio_entrega.findUnique({
        where: { tienda_id: tiendaId }
      });

      if (!configuracionBD) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de envío y entrega no encontrada',
          'EnvioEntrega.ConfiguracionNoEncontrada'
        );
      }

      const proveedoresActuales = configuracionBD.proveedores_transporte as ProveedorTransporteDto[];
      const proveedorIndex = proveedoresActuales.findIndex(p => p.id === idProveedor);

      if (proveedorIndex === -1) {
        throw ExcepcionDominio.Respuesta404(
          `Proveedor de transporte con ID "${idProveedor}" no encontrado`,
          'EnvioEntrega.ProveedorNoEncontrado'
        );
      }

      proveedoresActuales[proveedorIndex].activo = activar;

      const configuracionActualizada = await this.prisma.configuracion_envio_entrega.update({
        where: { tienda_id: tiendaId },
        data: {
          proveedores_transporte: proveedoresActuales as any,
          fecha_actualizacion: new Date()
        }
      });

      return ConfiguracionEnvioEntrega.reconstruir(
        configuracionActualizada.id,
        configuracionActualizada.tienda_id,
        configuracionActualizada.perfiles_envio as any,
        configuracionActualizada.metodos_entrega as any,
        configuracionActualizada.embalajes as any,
        configuracionActualizada.proveedores_transporte as any,
        configuracionActualizada.plantillas_documentacion as any,
        configuracionActualizada.fecha_creacion,
        configuracionActualizada.fecha_actualizacion
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
  async obtenerProveedoresTransporteActivos(tiendaId: string): Promise<ProveedorTransporteDto[]> {
    try {
      const configuracionBD = await this.prisma.configuracion_envio_entrega.findUnique({
        where: { tienda_id: tiendaId }
      });

      if (!configuracionBD) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de envío y entrega no encontrada',
          'EnvioEntrega.ConfiguracionNoEncontrada'
        );
      }

      const proveedores = configuracionBD.proveedores_transporte as ProveedorTransporteDto[];
      return proveedores.filter(proveedor => proveedor.activo);
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
   * Operaciones específicas para plantillas de documentación
   */

  /**
   * Agregar plantilla de documentación
   */
  async agregarPlantillaDocumentacion(
    tiendaId: string, 
    plantilla: PlantillaDocumentacionDto
  ): Promise<ConfiguracionEnvioEntrega> {
    try {
      const configuracionBD = await this.prisma.configuracion_envio_entrega.findUnique({
        where: { tienda_id: tiendaId }
      });

      if (!configuracionBD) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de envío y entrega no encontrada',
          'EnvioEntrega.ConfiguracionNoEncontrada'
        );
      }

      const plantillasActuales = configuracionBD.plantillas_documentacion as any[];
      plantillasActuales.push(plantilla);

      const configuracionActualizada = await this.prisma.configuracion_envio_entrega.update({
        where: { tienda_id: tiendaId },
        data: {
          plantillas_documentacion: plantillasActuales,
          fecha_actualizacion: new Date()
        }
      });

      return ConfiguracionEnvioEntrega.reconstruir(
        configuracionActualizada.id,
        configuracionActualizada.tienda_id,
        configuracionActualizada.perfiles_envio as any,
        configuracionActualizada.metodos_entrega as any,
        configuracionActualizada.embalajes as any,
        configuracionActualizada.proveedores_transporte as any,
        configuracionActualizada.plantillas_documentacion as any,
        configuracionActualizada.fecha_creacion,
        configuracionActualizada.fecha_actualizacion
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al agregar plantilla de documentación',
        'EnvioEntrega.ErrorAgregarPlantilla'
      );
    }
  }

  /**
   * Actualizar plantilla de documentación
   */
  async actualizarPlantillaDocumentacion(
    tiendaId: string, 
    idPlantilla: string, 
    plantillaActualizada: Partial<PlantillaDocumentacionDto>
  ): Promise<ConfiguracionEnvioEntrega> {
    try {
      const configuracionBD = await this.prisma.configuracion_envio_entrega.findUnique({
        where: { tienda_id: tiendaId }
      });

      if (!configuracionBD) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de envío y entrega no encontrada',
          'EnvioEntrega.ConfiguracionNoEncontrada'
        );
      }

      const plantillasActuales = configuracionBD.plantillas_documentacion as PlantillaDocumentacionDto[];
      const plantillaIndex = plantillasActuales.findIndex(p => p.id === idPlantilla);

      if (plantillaIndex === -1) {
        throw ExcepcionDominio.Respuesta404(
          'Plantilla de documentación no encontrada',
          'EnvioEntrega.PlantillaNoEncontrada'
        );
      }

      plantillasActuales[plantillaIndex] = {
        ...plantillasActuales[plantillaIndex],
        ...plantillaActualizada
      };

      const configuracionActualizada = await this.prisma.configuracion_envio_entrega.update({
        where: { tienda_id: tiendaId },
        data: {
          plantillas_documentacion: plantillasActuales as any,
          fecha_actualizacion: new Date()
        }
      });

      return ConfiguracionEnvioEntrega.reconstruir(
        configuracionActualizada.id,
        configuracionActualizada.tienda_id,
        configuracionActualizada.perfiles_envio as any,
        configuracionActualizada.metodos_entrega as any,
        configuracionActualizada.embalajes as any,
        configuracionActualizada.proveedores_transporte as any,
        configuracionActualizada.plantillas_documentacion as any,
        configuracionActualizada.fecha_creacion,
        configuracionActualizada.fecha_actualizacion
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al actualizar plantilla de documentación',
        'EnvioEntrega.ErrorActualizarPlantilla'
      );
    }
  }

  /**
   * Eliminar plantilla de documentación
   */
  async eliminarPlantillaDocumentacion(tiendaId: string, idPlantilla: string): Promise<ConfiguracionEnvioEntrega> {
    try {
      const configuracionBD = await this.prisma.configuracion_envio_entrega.findUnique({
        where: { tienda_id: tiendaId }
      });

      if (!configuracionBD) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de envío y entrega no encontrada',
          'EnvioEntrega.ConfiguracionNoEncontrada'
        );
      }

      const plantillasActuales = configuracionBD.plantillas_documentacion as PlantillaDocumentacionDto[];
      const plantillasFiltradas = plantillasActuales.filter(p => p.id !== idPlantilla);

      if (plantillasActuales.length === plantillasFiltradas.length) {
        throw ExcepcionDominio.Respuesta404(
          'Plantilla de documentación no encontrada',
          'EnvioEntrega.PlantillaNoEncontrada'
        );
      }

      const configuracionActualizada = await this.prisma.configuracion_envio_entrega.update({
        where: { tienda_id: tiendaId },
        data: {
          plantillas_documentacion: plantillasFiltradas as any,
          fecha_actualizacion: new Date()
        }
      });

      return ConfiguracionEnvioEntrega.reconstruir(
        configuracionActualizada.id,
        configuracionActualizada.tienda_id,
        configuracionActualizada.perfiles_envio as any,
        configuracionActualizada.metodos_entrega as any,
        configuracionActualizada.embalajes as any,
        configuracionActualizada.proveedores_transporte as any,
        configuracionActualizada.plantillas_documentacion as any,
        configuracionActualizada.fecha_creacion,
        configuracionActualizada.fecha_actualizacion
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al eliminar plantilla de documentación',
        'EnvioEntrega.ErrorEliminarPlantilla'
      );
    }
  }

  /**
   * Operaciones de consulta avanzada
   */

  /**
   * Verificar si existe perfil de envío con nombre específico
   */
  async existePerfilEnvioConNombre(tiendaId: string, nombrePerfil: string): Promise<boolean> {
    try {
      const configuracionBD = await this.prisma.configuracion_envio_entrega.findUnique({
        where: { tienda_id: tiendaId }
      });

      if (!configuracionBD) {
        return false;
      }

      const perfiles = configuracionBD.perfiles_envio as PerfilEnvioDto[];
      return perfiles.some(perfil => perfil.nombre_perfil === nombrePerfil);
    } catch (error) {
      throw ExcepcionDominio.Respuesta500(
        'Error al verificar existencia de perfil de envío',
        'EnvioEntrega.ErrorVerificacionPerfil'
      );
    }
  }

  /**
   * Verificar si existe proveedor de transporte con nombre específico
   */
  async existeProveedorTransporteConNombre(tiendaId: string, nombreProveedor: string): Promise<boolean> {
    try {
      const configuracionBD = await this.prisma.configuracion_envio_entrega.findUnique({
        where: { tienda_id: tiendaId }
      });

      if (!configuracionBD) {
        return false;
      }

      const proveedores = configuracionBD.proveedores_transporte as ProveedorTransporteDto[];
      return proveedores.some(proveedor => proveedor.proveedor_transporte === nombreProveedor);
    } catch (error) {
      throw ExcepcionDominio.Respuesta500(
        'Error al verificar existencia de proveedor de transporte',
        'EnvioEntrega.ErrorVerificacionProveedor'
      );
    }
  }

  /**
   * Verificar si existe embalaje predeterminado
   */
  async existeEmbalajePredeterminado(tiendaId: string): Promise<boolean> {
    try {
      const configuracionBD = await this.prisma.configuracion_envio_entrega.findUnique({
        where: { tienda_id: tiendaId }
      });

      if (!configuracionBD) {
        return false;
      }

      const embalajes = configuracionBD.embalajes as EmbalajeDto[];
      return embalajes.some(embalaje => embalaje.es_predeterminado);
    } catch (error) {
      throw ExcepcionDominio.Respuesta500(
        'Error al verificar existencia de embalaje predeterminado',
        'EnvioEntrega.ErrorVerificacionEmbalaje'
      );
    }
  }

  /**
   * Obtener configuración completa
   */
  async obtenerConfiguracionCompleta(tiendaId: string): Promise<ConfiguracionEnvioEntrega | null> {
    return this.encontrarPorTiendaId(tiendaId);
  }

  /**
   * Métodos no implementados (para completar la interfaz)
   */

  async agregarMetodoEntrega(tiendaId: string, metodo: MetodoEntregaDto): Promise<ConfiguracionEnvioEntrega> {
    // Implementación similar a agregarPerfilEnvio
    throw new Error('Método no implementado');
  }

  async actualizarMetodoEntrega(
    tiendaId: string, 
    idMetodo: string, 
    metodoActualizado: Partial<MetodoEntregaDto>
  ): Promise<ConfiguracionEnvioEntrega> {
    // Implementación similar a actualizarPerfilEnvio
    throw new Error('Método no implementado');
  }

  async agregarEmbalaje(tiendaId: string, embalaje: EmbalajeDto): Promise<ConfiguracionEnvioEntrega> {
    // Implementación similar a agregarPerfilEnvio
    throw new Error('Método no implementado');
  }

  async actualizarEmbalaje(
    tiendaId: string, 
    idEmbalaje: string, 
    embalajeActualizado: Partial<EmbalajeDto>
  ): Promise<ConfiguracionEnvioEntrega> {
    // Implementación similar a actualizarPerfilEnvio
    throw new Error('Método no implementado');
  }

  async agregarProveedorTransporte(
    tiendaId: string, 
    proveedor: ProveedorTransporteDto
  ): Promise<ConfiguracionEnvioEntrega> {
    // Implementación similar a agregarPerfilEnvio
    throw new Error('Método no implementado');
  }

  async actualizarProveedorTransporte(
    tiendaId: string, 
    idProveedor: string, 
    proveedorActualizado: Partial<ProveedorTransporteDto>
  ): Promise<ConfiguracionEnvioEntrega> {
    // Implementación similar a actualizarPerfilEnvio
    throw new Error('Método no implementado');
  }
}