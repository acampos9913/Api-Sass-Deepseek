import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RepositorioConfiguracionIdiomas } from '../../dominio/interfaces/repositorio-configuracion-idiomas.interface';
import { ConfiguracionIdiomas } from '../../dominio/entidades/configuracion-idiomas.entity';
import {
  ConfiguracionIdiomasDto,
  ActualizarConfiguracionIdiomasDto,
  AsignarIdiomaDominioDto,
  ExportarIdiomasDto,
  ImportarIdiomasDto,
  EstadoIdiomaEnum,
  EstadoTraduccionEnum
} from '../../aplicacion/dto/configuracion-idiomas.dto';

/**
 * Implementación del repositorio de configuración de idiomas usando Prisma
 * 
 * @class PrismaRepositorioConfiguracionIdiomas
 * @implements {RepositorioConfiguracionIdiomas}
 */
@Injectable()
export class PrismaRepositorioConfiguracionIdiomas implements RepositorioConfiguracionIdiomas {
  
  /**
   * Constructor del repositorio
   * 
   * @param {PrismaService} prisma - Servicio de Prisma para acceso a base de datos
   */
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Guardar una nueva configuración de idiomas
   * 
   * @param {ConfiguracionIdiomas} configuracion - Entidad de configuración de idiomas
   * @returns {Promise<ConfiguracionIdiomas>} Configuración guardada
   */
  async guardar(configuracion: ConfiguracionIdiomas): Promise<ConfiguracionIdiomas> {
    try {
      // Si se está creando un idioma predeterminado, quitar el predeterminado anterior
      if (configuracion.predeterminado) {
        await this.prisma.configuracionIdiomas.updateMany({
          where: { 
            tienda_id: configuracion.tiendaId,
            predeterminado: true,
          },
          data: { predeterminado: false },
        });
      }

      const configuracionBD = await this.prisma.configuracionIdiomas.create({
        data: {
          tienda_id: configuracion.tiendaId,
          codigo_idioma: configuracion.codigoIdioma,
          nombre_idioma: configuracion.nombreIdioma,
          estado: this.aEstadoBD(configuracion.estado) as any,
          predeterminado: configuracion.predeterminado,
          dominios_asociados: configuracion.dominiosAsociados,
          estado_traduccion: this.aEstadoTraduccionBD(configuracion.estadoTraduccion) as any,
          porcentaje_traduccion: configuracion.porcentajeTraduccion,
        },
      });

      return this.aEntidad(configuracionBD);
    } catch (error) {
      if (error.code === 'P2002') {
        throw new Error(`Ya existe un idioma con el código '${configuracion.codigoIdioma}' para esta tienda`);
      }
      throw new Error(`Error al guardar configuración de idiomas: ${error.message}`);
    }
  }

  /**
   * Buscar configuración de idiomas por ID
   * 
   * @param {string} id - ID de la configuración de idiomas
   * @returns {Promise<ConfiguracionIdiomas | null>} Configuración encontrada o null
   */
  async buscarPorId(id: string): Promise<ConfiguracionIdiomas | null> {
    try {
      const configuracionBD = await this.prisma.configuracionIdiomas.findUnique({
        where: { id },
      });

      if (!configuracionBD) {
        return null;
      }

      return this.aEntidad(configuracionBD);
    } catch (error) {
      throw new Error(`Error al buscar configuración de idiomas por ID: ${error.message}`);
    }
  }

  /**
   * Buscar configuración de idiomas por ID de tienda y código de idioma
   * 
   * @param {string} tiendaId - ID de la tienda
   * @param {string} codigoIdioma - Código del idioma
   * @returns {Promise<ConfiguracionIdiomas | null>} Configuración encontrada o null
   */
  async buscarPorTiendaYCodigo(tiendaId: string, codigoIdioma: string): Promise<ConfiguracionIdiomas | null> {
    try {
      const configuracionBD = await this.prisma.configuracionIdiomas.findUnique({
        where: {
          tienda_id_codigo_idioma: {
            tienda_id: tiendaId,
            codigo_idioma: codigoIdioma,
          },
        },
      });

      if (!configuracionBD) {
        return null;
      }

      return this.aEntidad(configuracionBD);
    } catch (error) {
      throw new Error(`Error al buscar configuración de idiomas por tienda y código: ${error.message}`);
    }
  }

  /**
   * Listar todas las configuraciones de idiomas de una tienda
   * 
   * @param {string} tiendaId - ID de la tienda
   * @returns {Promise<ConfiguracionIdiomas[]>} Lista de configuraciones de idiomas
   */
  async listarPorTienda(tiendaId: string): Promise<ConfiguracionIdiomas[]> {
    try {
      const configuracionesBD = await this.prisma.configuracionIdiomas.findMany({
        where: { tienda_id: tiendaId },
        orderBy: { fecha_creacion: 'desc' },
      });

      return configuracionesBD.map(configuracionBD => this.aEntidad(configuracionBD));
    } catch (error) {
      throw new Error(`Error al listar configuraciones de idiomas por tienda: ${error.message}`);
    }
  }

  /**
   * Listar configuraciones de idiomas por estado
   * 
   * @param {string} tiendaId - ID de la tienda
   * @param {EstadoIdiomaEnum} estado - Estado del idioma
   * @returns {Promise<ConfiguracionIdiomas[]>} Lista de idiomas con el estado especificado
   */
  async listarPorEstado(tiendaId: string, estado: EstadoIdiomaEnum): Promise<ConfiguracionIdiomas[]> {
    try {
      const configuracionesBD = await this.prisma.configuracionIdiomas.findMany({
        where: { 
          tienda_id: tiendaId,
          estado: this.aEstadoBD(estado) as any,
        },
        orderBy: { fecha_creacion: 'desc' },
      });

      return configuracionesBD.map(configuracionBD => this.aEntidad(configuracionBD));
    } catch (error) {
      throw new Error(`Error al listar idiomas por estado: ${error.message}`);
    }
  }

  /**
   * Listar configuraciones de idiomas por estado de traducción
   * 
   * @param {string} tiendaId - ID de la tienda
   * @param {EstadoTraduccionEnum} estadoTraduccion - Estado de traducción
   * @returns {Promise<ConfiguracionIdiomas[]>} Lista de idiomas con el estado de traducción especificado
   */
  async listarPorEstadoTraduccion(tiendaId: string, estadoTraduccion: EstadoTraduccionEnum): Promise<ConfiguracionIdiomas[]> {
    try {
      const configuracionesBD = await this.prisma.configuracionIdiomas.findMany({
        where: { 
          tienda_id: tiendaId,
          estado_traduccion: this.aEstadoTraduccionBD(estadoTraduccion) as any,
        },
        orderBy: { fecha_creacion: 'desc' },
      });

      return configuracionesBD.map(configuracionBD => this.aEntidad(configuracionBD));
    } catch (error) {
      throw new Error(`Error al listar idiomas por estado de traducción: ${error.message}`);
    }
  }

  /**
   * Obtener el idioma predeterminado de una tienda
   * 
   * @param {string} tiendaId - ID de la tienda
   * @returns {Promise<ConfiguracionIdiomas | null>} Idioma predeterminado o null
   */
  async obtenerPredeterminado(tiendaId: string): Promise<ConfiguracionIdiomas | null> {
    try {
      const configuracionBD = await this.prisma.configuracionIdiomas.findFirst({
        where: { 
          tienda_id: tiendaId,
          predeterminado: true,
        },
      });

      if (!configuracionBD) {
        return null;
      }

      return this.aEntidad(configuracionBD);
    } catch (error) {
      throw new Error(`Error al obtener idioma predeterminado: ${error.message}`);
    }
  }

  /**
   * Verificar si existe un idioma con el código específico en la tienda
   * 
   * @param {string} tiendaId - ID de la tienda
   * @param {string} codigoIdioma - Código del idioma
   * @returns {Promise<boolean>} True si existe, false en caso contrario
   */
  async existePorCodigo(tiendaId: string, codigoIdioma: string): Promise<boolean> {
    try {
      const count = await this.prisma.configuracionIdiomas.count({
        where: {
          tienda_id: tiendaId,
          codigo_idioma: codigoIdioma,
        },
      });

      return count > 0;
    } catch (error) {
      throw new Error(`Error al verificar existencia por código: ${error.message}`);
    }
  }

  /**
   * Contar idiomas por estado en una tienda
   * 
   * @param {string} tiendaId - ID de la tienda
   * @param {EstadoIdiomaEnum} estado - Estado del idioma
   * @returns {Promise<number>} Número de idiomas con el estado especificado
   */
  async contarPorEstado(tiendaId: string, estado: EstadoIdiomaEnum): Promise<number> {
    try {
      return await this.prisma.configuracionIdiomas.count({
        where: { 
          tienda_id: tiendaId,
          estado: this.aEstadoBD(estado) as any,
        },
      });
    } catch (error) {
      throw new Error(`Error al contar idiomas por estado: ${error.message}`);
    }
  }

  /**
   * Contar idiomas por estado de traducción en una tienda
   * 
   * @param {string} tiendaId - ID de la tienda
   * @param {EstadoTraduccionEnum} estadoTraduccion - Estado de traducción
   * @returns {Promise<number>} Número de idiomas con el estado de traducción especificado
   */
  async contarPorEstadoTraduccion(tiendaId: string, estadoTraduccion: EstadoTraduccionEnum): Promise<number> {
    try {
      return await this.prisma.configuracionIdiomas.count({
        where: { 
          tienda_id: tiendaId,
          estado_traduccion: this.aEstadoTraduccionBD(estadoTraduccion) as any,
        },
      });
    } catch (error) {
      throw new Error(`Error al contar idiomas por estado de traducción: ${error.message}`);
    }
  }

  /**
   * Actualizar una configuración de idiomas existente
   * 
   * @param {string} id - ID de la configuración a actualizar
   * @param {ActualizarConfiguracionIdiomasDto} datos - Datos para actualizar
   * @returns {Promise<ConfiguracionIdiomas>} Configuración actualizada
   */
  async actualizar(id: string, datos: ActualizarConfiguracionIdiomasDto): Promise<ConfiguracionIdiomas> {
    try {
      // Si se está estableciendo como predeterminado, quitar el predeterminado anterior
      if (datos.predeterminado) {
        const configuracionActual = await this.prisma.configuracionIdiomas.findUnique({
          where: { id },
        });

        if (configuracionActual) {
          await this.prisma.configuracionIdiomas.updateMany({
            where: { 
              tienda_id: configuracionActual.tienda_id,
              predeterminado: true,
              id: { not: id }, // Excluir la configuración actual
            },
            data: { predeterminado: false },
          });
        }
      }

      const datosActualizacion: any = {};
      
      if (datos.codigo_idioma !== undefined) {
        datosActualizacion.codigo_idioma = datos.codigo_idioma;
      }
      if (datos.nombre_idioma !== undefined) {
        datosActualizacion.nombre_idioma = datos.nombre_idioma;
      }
      if (datos.estado !== undefined) {
        datosActualizacion.estado = this.aEstadoBD(datos.estado);
      }
      if (datos.predeterminado !== undefined) {
        datosActualizacion.predeterminado = datos.predeterminado;
      }
      if (datos.dominios_asociados !== undefined) {
        datosActualizacion.dominios_asociados = datos.dominios_asociados;
      }
      if (datos.estado_traduccion !== undefined) {
        datosActualizacion.estado_traduccion = this.aEstadoTraduccionBD(datos.estado_traduccion);
      }
      if (datos.porcentaje_traduccion !== undefined) {
        datosActualizacion.porcentaje_traduccion = datos.porcentaje_traduccion;
      }

      const configuracionBD = await this.prisma.configuracionIdiomas.update({
        where: { id },
        data: datosActualizacion,
      });

      return this.aEntidad(configuracionBD);
    } catch (error) {
      if (error.code === 'P2002') {
        throw new Error(`Ya existe un idioma con el código '${datos.codigo_idioma}' para esta tienda`);
      }
      if (error.code === 'P2025') {
        throw new Error(`Configuración de idiomas con ID '${id}' no encontrada`);
      }
      throw new Error(`Error al actualizar configuración de idiomas: ${error.message}`);
    }
  }

  /**
   * Eliminar una configuración de idiomas
   * 
   * @param {string} id - ID de la configuración a eliminar
   * @returns {Promise<void>}
   */
  async eliminar(id: string): Promise<void> {
    try {
      await this.prisma.configuracionIdiomas.delete({
        where: { id },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new Error(`Configuración de idiomas con ID '${id}' no encontrada`);
      }
      throw new Error(`Error al eliminar configuración de idiomas: ${error.message}`);
    }
  }

  /**
   * Asignar idioma a dominio
   * 
   * @param {string} id - ID de la configuración de idiomas
   * @param {AsignarIdiomaDominioDto} asignacion - Datos de asignación
   * @returns {Promise<ConfiguracionIdiomas>} Configuración actualizada
   */
  async asignarADominio(id: string, asignacion: AsignarIdiomaDominioDto): Promise<ConfiguracionIdiomas> {
    try {
      const configuracion = await this.buscarPorId(id);
      if (!configuracion) {
        throw new Error(`Configuración de idiomas con ID '${id}' no encontrada`);
      }

      const dominiosActuales = configuracion.dominiosAsociados;
      if (!dominiosActuales.includes(asignacion.dominio)) {
        dominiosActuales.push(asignacion.dominio);
      }

      const configuracionBD = await this.prisma.configuracionIdiomas.update({
        where: { id },
        data: { dominios_asociados: dominiosActuales },
      });

      return this.aEntidad(configuracionBD);
    } catch (error) {
      if (error.code === 'P2025') {
        throw new Error(`Configuración de idiomas con ID '${id}' no encontrada`);
      }
      throw new Error(`Error al asignar idioma a dominio: ${error.message}`);
    }
  }

  /**
   * Desasignar idioma de dominio
   * 
   * @param {string} id - ID de la configuración de idiomas
   * @param {string} dominio - Dominio a desasignar
   * @returns {Promise<ConfiguracionIdiomas>} Configuración actualizada
   */
  async desasignarDeDominio(id: string, dominio: string): Promise<ConfiguracionIdiomas> {
    try {
      const configuracion = await this.buscarPorId(id);
      if (!configuracion) {
        throw new Error(`Configuración de idiomas con ID '${id}' no encontrada`);
      }

      const dominiosActuales = configuracion.dominiosAsociados.filter(d => d !== dominio);

      const configuracionBD = await this.prisma.configuracionIdiomas.update({
        where: { id },
        data: { dominios_asociados: dominiosActuales },
      });

      return this.aEntidad(configuracionBD);
    } catch (error) {
      if (error.code === 'P2025') {
        throw new Error(`Configuración de idiomas con ID '${id}' no encontrada`);
      }
      throw new Error(`Error al desasignar idioma de dominio: ${error.message}`);
    }
  }

  /**
   * Listar idiomas asignados a un dominio específico
   * 
   * @param {string} dominio - Dominio a buscar
   * @returns {Promise<ConfiguracionIdiomas[]>} Lista de idiomas asignados al dominio
   */
  async listarPorDominio(dominio: string): Promise<ConfiguracionIdiomas[]> {
    try {
      const configuracionesBD = await this.prisma.configuracionIdiomas.findMany({
        where: {
          dominios_asociados: {
            has: dominio,
          },
        },
        orderBy: { fecha_creacion: 'desc' },
      });

      return configuracionesBD.map(configuracionBD => this.aEntidad(configuracionBD));
    } catch (error) {
      throw new Error(`Error al listar idiomas por dominio: ${error.message}`);
    }
  }

  /**
   * Obtener el idioma predeterminado de un dominio
   * 
   * @param {string} dominio - Dominio a buscar
   * @returns {Promise<ConfiguracionIdiomas | null>} Idioma predeterminado del dominio o null
   */
  async obtenerPredeterminadoPorDominio(dominio: string): Promise<ConfiguracionIdiomas | null> {
    try {
      const configuracionBD = await this.prisma.configuracionIdiomas.findFirst({
        where: {
          dominios_asociados: {
            has: dominio,
          },
          predeterminado: true,
        },
      });

      if (!configuracionBD) {
        return null;
      }

      return this.aEntidad(configuracionBD);
    } catch (error) {
      throw new Error(`Error al obtener idioma predeterminado por dominio: ${error.message}`);
    }
  }

  /**
   * Establecer idioma como predeterminado de la tienda
   * 
   * @param {string} id - ID de la configuración de idiomas
   * @returns {Promise<ConfiguracionIdiomas>} Configuración actualizada
   */
  async establecerComoPredeterminado(id: string): Promise<ConfiguracionIdiomas> {
    try {
      const configuracion = await this.buscarPorId(id);
      if (!configuracion) {
        throw new Error(`Configuración de idiomas con ID '${id}' no encontrada`);
      }

      // Quitar predeterminado de todos los idiomas de la tienda
      await this.prisma.configuracionIdiomas.updateMany({
        where: { 
          tienda_id: configuracion.tiendaId,
          predeterminado: true,
        },
        data: { predeterminado: false },
      });

      // Establecer este idioma como predeterminado
      const configuracionBD = await this.prisma.configuracionIdiomas.update({
        where: { id },
        data: { predeterminado: true },
      });

      return this.aEntidad(configuracionBD);
    } catch (error) {
      if (error.code === 'P2025') {
        throw new Error(`Configuración de idiomas con ID '${id}' no encontrada`);
      }
      throw new Error(`Error al establecer como predeterminado: ${error.message}`);
    }
  }

  /**
   * Quitar idioma como predeterminado de la tienda
   * 
   * @param {string} id - ID de la configuración de idiomas
   * @returns {Promise<ConfiguracionIdiomas>} Configuración actualizada
   */
  async quitarComoPredeterminado(id: string): Promise<ConfiguracionIdiomas> {
    try {
      const configuracionBD = await this.prisma.configuracionIdiomas.update({
        where: { id },
        data: { predeterminado: false },
      });

      return this.aEntidad(configuracionBD);
    } catch (error) {
      if (error.code === 'P2025') {
        throw new Error(`Configuración de idiomas con ID '${id}' no encontrada`);
      }
      throw new Error(`Error al quitar como predeterminado: ${error.message}`);
    }
  }

  /**
   * Publicar idioma
   * 
   * @param {string} id - ID de la configuración de idiomas
   * @returns {Promise<ConfiguracionIdiomas>} Configuración actualizada
   */
  async publicar(id: string): Promise<ConfiguracionIdiomas> {
    try {
      const configuracionBD = await this.prisma.configuracionIdiomas.update({
        where: { id },
        data: { estado: 'PUBLICADO' },
      });

      return this.aEntidad(configuracionBD);
    } catch (error) {
      if (error.code === 'P2025') {
        throw new Error(`Configuración de idiomas con ID '${id}' no encontrada`);
      }
      throw new Error(`Error al publicar idioma: ${error.message}`);
    }
  }

  /**
   * Despublicar idioma
   * 
   * @param {string} id - ID de la configuración de idiomas
   * @returns {Promise<ConfiguracionIdiomas>} Configuración actualizada
   */
  async despublicar(id: string): Promise<ConfiguracionIdiomas> {
    try {
      const configuracionBD = await this.prisma.configuracionIdiomas.update({
        where: { id },
        data: { estado: 'NO_PUBLICADO' },
      });

      return this.aEntidad(configuracionBD);
    } catch (error) {
      if (error.code === 'P2025') {
        throw new Error(`Configuración de idiomas con ID '${id}' no encontrada`);
      }
      throw new Error(`Error al despublicar idioma: ${error.message}`);
    }
  }

  /**
   * Actualizar progreso de traducción
   * 
   * @param {string} id - ID de la configuración de idiomas
   * @param {number} porcentaje - Porcentaje de traducción (0-100)
   * @param {EstadoTraduccionEnum} [estado] - Estado de traducción (opcional)
   * @returns {Promise<ConfiguracionIdiomas>} Configuración actualizada
   */
  async actualizarProgresoTraduccion(id: string, porcentaje: number, estado?: EstadoTraduccionEnum): Promise<ConfiguracionIdiomas> {
    try {
      const datosActualizacion: any = { porcentaje_traduccion: porcentaje };
      
      if (estado) {
        datosActualizacion.estado_traduccion = this.aEstadoTraduccionBD(estado);
      }

      const configuracionBD = await this.prisma.configuracionIdiomas.update({
        where: { id },
        data: datosActualizacion,
      });

      return this.aEntidad(configuracionBD);
    } catch (error) {
      if (error.code === 'P2025') {
        throw new Error(`Configuración de idiomas con ID '${id}' no encontrada`);
      }
      throw new Error(`Error al actualizar progreso de traducción: ${error.message}`);
    }
  }

  /**
   * Marcar como completamente traducido
   * 
   * @param {string} id - ID de la configuración de idiomas
   * @returns {Promise<ConfiguracionIdiomas>} Configuración actualizada
   */
  async marcarComoTraducido(id: string): Promise<ConfiguracionIdiomas> {
    try {
      const configuracionBD = await this.prisma.configuracionIdiomas.update({
        where: { id },
        data: { 
          porcentaje_traduccion: 100,
          estado_traduccion: 'TRADUCIDO',
        },
      });

      return this.aEntidad(configuracionBD);
    } catch (error) {
      if (error.code === 'P2025') {
        throw new Error(`Configuración de idiomas con ID '${id}' no encontrada`);
      }
      throw new Error(`Error al marcar como traducido: ${error.message}`);
    }
  }

  /**
   * Exportar configuración de idiomas
   * 
   * @param {ExportarIdiomasDto} datos - Datos de exportación
   * @param {string} tiendaId - ID de la tienda
   * @returns {Promise<string>} Contenido exportado
   */
  async exportar(datos: ExportarIdiomasDto, tiendaId: string): Promise<string> {
    try {
      let configuraciones: ConfiguracionIdiomas[];

      if (datos.filtro === 'publicados') {
        configuraciones = await this.listarPorEstado(tiendaId, EstadoIdiomaEnum.PUBLICADO);
      } else {
        configuraciones = await this.listarPorTienda(tiendaId);
      }

      const datosExportacion = configuraciones.map(config => ({
        codigo_idioma: config.codigoIdioma,
        nombre_idioma: config.nombreIdioma,
        estado: config.estado,
        predeterminado: config.predeterminado,
        dominios_asociados: config.dominiosAsociados,
        estado_traduccion: config.estadoTraduccion,
        porcentaje_traduccion: config.porcentajeTraduccion,
      }));

      if (datos.formato === 'json') {
        return JSON.stringify(datosExportacion, null, 2);
      } else {
        // Formato CSV
        const cabeceras = ['Código', 'Nombre', 'Estado', 'Predeterminado', 'Dominios', 'Estado Traducción', 'Porcentaje Traducción'];
        const filas = datosExportacion.map(item => [
          item.codigo_idioma,
          item.nombre_idioma,
          item.estado,
          item.predeterminado ? 'Sí' : 'No',
          item.dominios_asociados.join(';'),
          item.estado_traduccion,
          item.porcentaje_traduccion,
        ]);

        const contenidoCSV = [cabeceras, ...filas]
          .map(fila => fila.map(campo => `"${String(campo).replace(/"/g, '""')}"`).join(','))
          .join('\n');

        return contenidoCSV;
      }
    } catch (error) {
      throw new Error(`Error al exportar configuración de idiomas: ${error.message}`);
    }
  }

  /**
   * Importar configuración de idiomas
   * 
   * @param {ImportarIdiomasDto} datos - Datos de importación
   * @param {string} tiendaId - ID de la tienda
   * @returns {Promise<ConfiguracionIdiomas[]>} Configuraciones importadas
   */
  async importar(datos: ImportarIdiomasDto, tiendaId: string): Promise<ConfiguracionIdiomas[]> {
    try {
      let datosImportacion: any[];

      if (datos.formato === 'json') {
        datosImportacion = JSON.parse(Buffer.from(datos.contenido, 'base64').toString());
      } else {
        // Formato CSV - implementación básica
        const contenido = Buffer.from(datos.contenido, 'base64').toString();
        const lineas = contenido.split('\n').filter(linea => linea.trim());
        const cabeceras = lineas[0].split(',').map(h => h.replace(/"/g, '').trim());
        datosImportacion = lineas.slice(1).map(linea => {
          const valores = linea.split(',').map(v => v.replace(/^"|"$/g, '').replace(/""/g, '"'));
          const objeto: any = {};
          cabeceras.forEach((cabecera, index) => {
            objeto[cabecera.toLowerCase().replace(/\s+/g, '_')] = valores[index];
          });
          return objeto;
        });
      }

      const configuracionesImportadas: ConfiguracionIdiomas[] = [];

      for (const datosIdioma of datosImportacion) {
        try {
          const existe = await this.existePorCodigo(tiendaId, datosIdioma.codigo_idioma);
          
          if (existe && datos.estrategia_conflicto === 'omitir') {
            continue;
          }

          if (existe && datos.estrategia_conflicto === 'sobrescribir') {
            const configuracionExistente = await this.buscarPorTiendaYCodigo(tiendaId, datosIdioma.codigo_idioma);
            if (configuracionExistente) {
              await this.eliminar(configuracionExistente.id);
            }
          }

          const configuracion = ConfiguracionIdiomas.crear(
            this.generarId(),
            tiendaId,
            datosIdioma.codigo_idioma,
            datosIdioma.nombre_idioma,
            datosIdioma.estado as any,
            datosIdioma.predeterminado === 'true' || datosIdioma.predeterminado === true,
            Array.isArray(datosIdioma.dominios_asociados)
              ? datosIdioma.dominios_asociados
              : (datosIdioma.dominios_asociados || '').split(';').filter(Boolean),
            datosIdioma.estado_traduccion as any,
            parseInt(datosIdioma.porcentaje_traduccion) || 0
          );

          const configuracionGuardada = await this.guardar(configuracion);
          configuracionesImportadas.push(configuracionGuardada);
        } catch (error) {
          console.warn(`Error al importar idioma ${datosIdioma.codigo_idioma}: ${error.message}`);
          if (datos.estrategia_conflicto !== 'fusionar') {
            throw error;
          }
        }
      }

      return configuracionesImportadas;
    } catch (error) {
      throw new Error(`Error al importar configuración de idiomas: ${error.message}`);
    }
  }

  /**
   * Verificar si puede establecer como predeterminado
   * 
   * @param {string} id - ID de la configuración de idiomas
   * @returns {Promise<boolean>} True si puede establecerse como predeterminado
   */
  async puedeEstablecerComoPredeterminado(id: string): Promise<boolean> {
    try {
      const configuracion = await this.buscarPorId(id);
      if (!configuracion) {
        return false;
      }

      return configuracion.estado === EstadoIdiomaEnum.PUBLICADO;
    } catch (error) {
      throw new Error(`Error al verificar si puede establecer como predeterminado: ${error.message}`);
    }
  }

  /**
   * Verificar si puede ser eliminado
   * 
   * @param {string} id - ID de la configuración de idiomas
   * @returns {Promise<boolean>} True si puede ser eliminado
   */
  async puedeSerEliminado(id: string): Promise<boolean> {
    try {
      const configuracion = await this.buscarPorId(id);
      if (!configuracion) {
        return false;
      }

      // No se puede eliminar el idioma predeterminado
      return !configuracion.predeterminado;
    } catch (error) {
      throw new Error(`Error al verificar si puede ser eliminado: ${error.message}`);
    }
  }

  /**
   * Verificar si puede ser despublicado
   * 
   * @param {string} id - ID de la configuración de idiomas
   * @returns {Promise<boolean>} True si puede ser despublicado
   */
  async puedeSerDespublicado(id: string): Promise<boolean> {
    try {
      const configuracion = await this.buscarPorId(id);
      if (!configuracion) {
        return false;
      }

      // No se puede despublicar el idioma predeterminado
      return !configuracion.predeterminado;
    } catch (error) {
      throw new Error(`Error al verificar si puede ser despublicado: ${error.message}`);
    }
  }

  /**
   * Obtener estadísticas de idiomas
   * 
   * @param {string} tiendaId - ID de la tienda
   * @returns {Promise<object>} Estadísticas de idiomas
   */
  async obtenerEstadisticas(tiendaId: string): Promise<{
    total: number;
    publicados: number;
    no_publicados: number;
    predeterminados: number;
    sin_traducir: number;
    en_progreso: number;
    traducidos: number;
    porcentaje_traduccion_promedio: number;
  }> {
    try {
      const [
        total,
        publicados,
        no_publicados,
        predeterminados,
        sin_traducir,
        en_progreso,
        traducidos,
        configuraciones
      ] = await Promise.all([
        this.prisma.configuracionIdiomas.count({ where: { tienda_id: tiendaId } }),
        this.prisma.configuracionIdiomas.count({ where: { tienda_id: tiendaId, estado: 'PUBLICADO' } }),
        this.prisma.configuracionIdiomas.count({ where: { tienda_id: tiendaId, estado: 'NO_PUBLICADO' } }),
        this.prisma.configuracionIdiomas.count({ where: { tienda_id: tiendaId, predeterminado: true } }),
        this.prisma.configuracionIdiomas.count({ where: { tienda_id: tiendaId, estado_traduccion: 'SIN_TRADUCIR' } }),
        this.prisma.configuracionIdiomas.count({ where: { tienda_id: tiendaId, estado_traduccion: 'EN_PROGRESO' } }),
        this.prisma.configuracionIdiomas.count({ where: { tienda_id: tiendaId, estado_traduccion: 'TRADUCIDO' } }),
        this.prisma.configuracionIdiomas.findMany({ where: { tienda_id: tiendaId } }),
      ]);

      const porcentajePromedio = configuraciones.length > 0
        ? configuraciones.reduce((sum, config) => sum + config.porcentaje_traduccion, 0) / configuraciones.length
        : 0;

      return {
        total,
        publicados,
        no_publicados,
        predeterminados,
        sin_traducir,
        en_progreso,
        traducidos,
        porcentaje_traduccion_promedio: Math.round(porcentajePromedio),
      };
    } catch (error) {
      throw new Error(`Error al obtener estadísticas de idiomas: ${error.message}`);
    }
  }

  /**
   * Buscar idiomas por nombre o código (búsqueda)
   * 
   * @param {string} tiendaId - ID de la tienda
   * @param {string} termino - Término de búsqueda
   * @returns {Promise<ConfiguracionIdiomas[]>} Lista de idiomas encontrados
   */
  async buscar(tiendaId: string, termino: string): Promise<ConfiguracionIdiomas[]> {
    try {
      const configuracionesBD = await this.prisma.configuracionIdiomas.findMany({
        where: {
          tienda_id: tiendaId,
          OR: [
            { nombre_idioma: { contains: termino, mode: 'insensitive' } },
            { codigo_idioma: { contains: termino, mode: 'insensitive' } },
          ],
        },
        orderBy: { fecha_creacion: 'desc' },
      });

      return configuracionesBD.map(configuracionBD => this.aEntidad(configuracionBD));
    } catch (error) {
      throw new Error(`Error al buscar idiomas: ${error.message}`);
    }
  }

  /**
   * Obtener idiomas con bajo progreso de traducción
   * 
   * @param {string} tiendaId - ID de la tienda
   * @param {number} porcentajeMinimo - Porcentaje mínimo considerado como bajo progreso
   * @returns {Promise<ConfiguracionIdiomas[]>} Lista de idiomas con bajo progreso
   */
  async obtenerConBajoProgreso(tiendaId: string, porcentajeMinimo: number): Promise<ConfiguracionIdiomas[]> {
    try {
      const configuracionesBD = await this.prisma.configuracionIdiomas.findMany({
        where: {
          tienda_id: tiendaId,
          porcentaje_traduccion: { lt: porcentajeMinimo },
        },
        orderBy: { porcentaje_traduccion: 'asc' },
      });

      return configuracionesBD.map(configuracionBD => this.aEntidad(configuracionBD));
    } catch (error) {
      throw new Error(`Error al obtener idiomas con bajo progreso: ${error.message}`);
    }
  }

  /**
   * Obtener idiomas que necesitan atención (sin traducir o bajo progreso)
   * 
   * @param {string} tiendaId - ID de la tienda
   * @returns {Promise<ConfiguracionIdiomas[]>} Lista de idiomas que necesitan atención
   */
  async obtenerQueNecesitanAtencion(tiendaId: string): Promise<ConfiguracionIdiomas[]> {
    try {
      const configuracionesBD = await this.prisma.configuracionIdiomas.findMany({
        where: {
          tienda_id: tiendaId,
          OR: [
            { estado_traduccion: 'SIN_TRADUCIR' },
            { porcentaje_traduccion: { lt: 50 } },
          ],
        },
        orderBy: { porcentaje_traduccion: 'asc' },
      });

      return configuracionesBD.map(configuracionBD => this.aEntidad(configuracionBD));
    } catch (error) {
      throw new Error(`Error al obtener idiomas que necesitan atención: ${error.message}`);
    }
  }

  /**
   * Actualizar múltiples idiomas
   * 
   * @param {string[]} ids - IDs de las configuraciones a actualizar
   * @param {Partial<ActualizarConfiguracionIdiomasDto>} datos - Datos para actualizar
   * @returns {Promise<ConfiguracionIdiomas[]>} Configuraciones actualizadas
   */
  async actualizarMultiple(ids: string[], datos: Partial<ActualizarConfiguracionIdiomasDto>): Promise<ConfiguracionIdiomas[]> {
    try {
      const datosActualizacion: any = {};
      
      if (datos.estado !== undefined) {
        datosActualizacion.estado = this.aEstadoBD(datos.estado);
      }
      if (datos.estado_traduccion !== undefined) {
        datosActualizacion.estado_traduccion = this.aEstadoTraduccionBD(datos.estado_traduccion);
      }
      if (datos.porcentaje_traduccion !== undefined) {
        datosActualizacion.porcentaje_traduccion = datos.porcentaje_traduccion;
      }

      await this.prisma.configuracionIdiomas.updateMany({
        where: { id: { in: ids } },
        data: datosActualizacion,
      });

      const configuracionesActualizadas = await Promise.all(
        ids.map(id => this.buscarPorId(id))
      );

      return configuracionesActualizadas.filter(Boolean) as ConfiguracionIdiomas[];
    } catch (error) {
      throw new Error(`Error al actualizar múltiples idiomas: ${error.message}`);
    }
  }

  /**
   * Eliminar múltiples idiomas
   * 
   * @param {string[]} ids - IDs de las configuraciones a eliminar
   * @returns {Promise<void>}
   */
  async eliminarMultiple(ids: string[]): Promise<void> {
    try {
      await this.prisma.configuracionIdiomas.deleteMany({
        where: { id: { in: ids } },
      });
    } catch (error) {
      throw new Error(`Error al eliminar múltiples idiomas: ${error.message}`);
    }
  }

  /**
   * Establecer predeterminado masivamente (solo uno puede ser predeterminado)
   * 
   * @param {string} idPredeterminado - ID del idioma a establecer como predeterminado
   * @param {string} tiendaId - ID de la tienda
   * @returns {Promise<ConfiguracionIdiomas[]>} Configuraciones actualizadas
   */
  async establecerPredeterminadoMasivo(idPredeterminado: string, tiendaId: string): Promise<ConfiguracionIdiomas[]> {
    try {
      // Quitar predeterminado de todos los idiomas de la tienda
      await this.prisma.configuracionIdiomas.updateMany({
        where: { 
          tienda_id: tiendaId,
          predeterminado: true,
        },
        data: { predeterminado: false },
      });

      // Establecer el idioma especificado como predeterminado
      await this.prisma.configuracionIdiomas.update({
        where: { id: idPredeterminado },
        data: { predeterminado: true },
      });

      return await this.listarPorTienda(tiendaId);
    } catch (error) {
      throw new Error(`Error al establecer predeterminado masivamente: ${error.message}`);
    }
  }

  /**
   * Convierte un estado de idioma del DTO al formato de base de datos
   * 
   * @private
   * @param {string} estado - Estado del idioma
   * @returns {string} Estado en formato de base de datos
   */
  private aEstadoBD(estado: string): string {
    switch (estado) {
      case EstadoIdiomaEnum.PUBLICADO:
        return 'PUBLICADO';
      case EstadoIdiomaEnum.NO_PUBLICADO:
        return 'NO_PUBLICADO';
      default:
        return 'NO_PUBLICADO';
    }
  }

  /**
   * Convierte un estado de traducción del DTO al formato de base de datos
   * 
   * @private
   * @param {string} estadoTraduccion - Estado de traducción
   * @returns {string} Estado de traducción en formato de base de datos
   */
  private aEstadoTraduccionBD(estadoTraduccion: string): string {
    switch (estadoTraduccion) {
      case EstadoTraduccionEnum.SIN_TRADUCIR:
        return 'SIN_TRADUCIR';
      case EstadoTraduccionEnum.EN_PROGRESO:
        return 'EN_PROGRESO';
      case EstadoTraduccionEnum.TRADUCIDO:
        return 'TRADUCIDO';
      default:
        return 'SIN_TRADUCIR';
    }
  }

  /**
   * Convierte un registro de base de datos a una entidad de dominio
   * 
   * @private
   * @param {any} configuracionBD - Registro de base de datos
   * @returns {ConfiguracionIdiomas} Entidad de dominio
   */
  private aEntidad(configuracionBD: any): ConfiguracionIdiomas {
    return ConfiguracionIdiomas.reconstruir(
      configuracionBD.id,
      configuracionBD.tienda_id,
      configuracionBD.codigo_idioma,
      configuracionBD.nombre_idioma,
      this.aEstadoDTO(configuracionBD.estado) as any,
      configuracionBD.predeterminado,
      configuracionBD.dominios_asociados,
      this.aEstadoTraduccionDTO(configuracionBD.estado_traduccion) as any,
      configuracionBD.porcentaje_traduccion,
      configuracionBD.fecha_creacion,
      configuracionBD.fecha_actualizacion
    );
  }

  /**
   * Convierte un estado de idioma de base de datos al formato DTO
   * 
   * @private
   * @param {string} estado - Estado de base de datos
   * @returns {string} Estado en formato DTO
   */
  private aEstadoDTO(estado: string): string {
    switch (estado) {
      case 'PUBLICADO':
        return EstadoIdiomaEnum.PUBLICADO;
      case 'NO_PUBLICADO':
        return EstadoIdiomaEnum.NO_PUBLICADO;
      default:
        return EstadoIdiomaEnum.NO_PUBLICADO;
    }
  }

  /**
   * Convierte un estado de traducción de base de datos al formato DTO
   * 
   * @private
   * @param {string} estadoTraduccion - Estado de traducción de base de datos
   * @returns {string} Estado de traducción en formato DTO
   */
  private aEstadoTraduccionDTO(estadoTraduccion: string): string {
    switch (estadoTraduccion) {
      case 'SIN_TRADUCIR':
        return EstadoTraduccionEnum.SIN_TRADUCIR;
      case 'EN_PROGRESO':
        return EstadoTraduccionEnum.EN_PROGRESO;
      case 'TRADUCIDO':
        return EstadoTraduccionEnum.TRADUCIDO;
      default:
        return EstadoTraduccionEnum.SIN_TRADUCIR;
    }
    }
  
    /**
     * Genera un ID único para nuevas configuraciones
     */
    private generarId(): string {
      return `idioma_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}