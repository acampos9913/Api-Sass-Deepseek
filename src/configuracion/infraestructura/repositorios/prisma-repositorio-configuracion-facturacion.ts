import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { ConfiguracionFacturacion } from '../../dominio/entidades/configuracion-facturacion.entity';
import { RepositorioConfiguracionFacturacion } from '../../dominio/interfaces/repositorio-configuracion-facturacion.interface';
import {
  DireccionFiscalDto,
  TipoMetodoPago,
  CicloFacturacion,
  EstadoFactura,
  FrecuenciaRecordatorio,
  MetodoPagoDto,
  FacturaHistorialDto,
  NotificacionPagoDto
} from '../../aplicacion/dto/configuracion-facturacion.dto';

/**
 * Implementación del Repositorio de Configuración de Facturación con Prisma
 * Adaptador de persistencia para la entidad de dominio ConfiguracionFacturacion
 */
@Injectable()
export class PrismaRepositorioConfiguracionFacturacion implements RepositorioConfiguracionFacturacion {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Guarda una nueva configuración de facturación
   */
  async guardar(configuracion: ConfiguracionFacturacion): Promise<ConfiguracionFacturacion> {
    try {
      const datos = {
        id: configuracion.id,
        tienda_id: configuracion.tiendaId,
        nombre_empresa: configuracion.nombreEmpresa,
        direccion_fiscal: configuracion.direccionFiscal,
        email_facturacion: configuracion.emailFacturacion,
        telefono_contacto: configuracion.telefonoContacto,
        id_fiscal: configuracion.idFiscal,
        metodos_pago: configuracion.metodosPago,
        ciclo_facturacion: configuracion.cicloFacturacion,
        fecha_proxima: configuracion.fechaProxima,
        historial_facturas: configuracion.historialFacturas,
        notificaciones: configuracion.notificaciones,
        fecha_creacion: configuracion.fechaCreacion,
        fecha_actualizacion: configuracion.fechaActualizacion
      };

      // Guardar en la base de datos usando el campo configuracion_facturacion de ConfiguracionTienda
      await this.prisma.configuracionTienda.upsert({
        where: { tienda_id: configuracion.tiendaId },
        update: {
          configuracion_facturacion: datos,
          fecha_actualizacion: new Date()
        },
        create: {
          clave: `facturacion_${configuracion.tiendaId}`,
          valor: JSON.stringify(datos),
          tipo: 'JSON',
          descripcion: 'Configuración de facturación de la tienda',
          tienda_id: configuracion.tiendaId,
          configuracion_facturacion: datos,
          fecha_creacion: new Date(),
          fecha_actualizacion: new Date()
        }
      });

      return configuracion;
    } catch (error) {
      throw new Error(`Error al guardar configuración de facturación: ${error.message}`);
    }
  }

  /**
   * Actualiza una configuración de facturación existente
   */
  async actualizar(configuracion: ConfiguracionFacturacion): Promise<ConfiguracionFacturacion> {
    try {
      const datos = {
        id: configuracion.id,
        tienda_id: configuracion.tiendaId,
        nombre_empresa: configuracion.nombreEmpresa,
        direccion_fiscal: configuracion.direccionFiscal,
        email_facturacion: configuracion.emailFacturacion,
        telefono_contacto: configuracion.telefonoContacto,
        id_fiscal: configuracion.idFiscal,
        metodos_pago: configuracion.metodosPago,
        ciclo_facturacion: configuracion.cicloFacturacion,
        fecha_proxima: configuracion.fechaProxima,
        historial_facturas: configuracion.historialFacturas,
        notificaciones: configuracion.notificaciones,
        fecha_creacion: configuracion.fechaCreacion,
        fecha_actualizacion: configuracion.fechaActualizacion
      };

      await this.prisma.configuracionTienda.update({
        where: { tienda_id: configuracion.tiendaId },
        data: {
          configuracion_facturacion: datos,
          fecha_actualizacion: new Date()
        }
      });

      return configuracion;
    } catch (error) {
      throw new Error(`Error al actualizar configuración de facturación: ${error.message}`);
    }
  }

  /**
   * Busca la configuración de facturación por ID de tienda
   */
  async buscarPorTiendaId(tiendaId: string): Promise<ConfiguracionFacturacion | null> {
    try {
      const configuracion = await this.prisma.configuracionTienda.findFirst({
        where: {
          tienda_id: tiendaId,
          configuracion_facturacion: { not: null }
        }
      });

      if (!configuracion || !configuracion.configuracion_facturacion) {
        return null;
      }

      const datos = configuracion.configuracion_facturacion as any;

      return ConfiguracionFacturacion.reconstruir(
        datos.id,
        datos.tienda_id,
        datos.nombre_empresa,
        datos.direccion_fiscal,
        datos.email_facturacion,
        datos.telefono_contacto,
        datos.id_fiscal,
        datos.metodos_pago,
        datos.ciclo_facturacion,
        new Date(datos.fecha_proxima),
        datos.historial_facturas,
        datos.notificaciones,
        new Date(datos.fecha_creacion),
        new Date(datos.fecha_actualizacion)
      );
    } catch (error) {
      throw new Error(`Error al buscar configuración de facturación por tienda ID: ${error.message}`);
    }
  }

  /**
   * Busca la configuración de facturación por ID
   */
  async buscarPorId(id: string): Promise<ConfiguracionFacturacion | null> {
    try {
      const configuracion = await this.prisma.configuracionTienda.findFirst({
        where: {
          configuracion_facturacion: {
            path: ['id'],
            equals: id
          }
        }
      });

      if (!configuracion || !configuracion.configuracion_facturacion) {
        return null;
      }

      const datos = configuracion.configuracion_facturacion as any;

      return ConfiguracionFacturacion.reconstruir(
        datos.id,
        datos.tienda_id,
        datos.nombre_empresa,
        datos.direccion_fiscal,
        datos.email_facturacion,
        datos.telefono_contacto,
        datos.id_fiscal,
        datos.metodos_pago,
        datos.ciclo_facturacion,
        new Date(datos.fecha_proxima),
        datos.historial_facturas,
        datos.notificaciones,
        new Date(datos.fecha_creacion),
        new Date(datos.fecha_actualizacion)
      );
    } catch (error) {
      throw new Error(`Error al buscar configuración de facturación por ID: ${error.message}`);
    }
  }

  /**
   * Elimina una configuración de facturación
   */
  async eliminar(id: string): Promise<void> {
    try {
      await this.prisma.configuracionTienda.updateMany({
        where: {
          configuracion_facturacion: {
            path: ['id'],
            equals: id
          }
        },
        data: {
          configuracion_facturacion: null,
          fecha_actualizacion: new Date()
        }
      });
    } catch (error) {
      throw new Error(`Error al eliminar configuración de facturación: ${error.message}`);
    }
  }

  /**
   * Verifica si existe una configuración de facturación para una tienda
   */
  async existePorTiendaId(tiendaId: string): Promise<boolean> {
    try {
      const configuracion = await this.prisma.configuracionTienda.findFirst({
        where: {
          tienda_id: tiendaId,
          configuracion_facturacion: { not: null }
        }
      });

      return !!configuracion;
    } catch (error) {
      throw new Error(`Error al verificar existencia de configuración de facturación: ${error.message}`);
    }
  }

  /**
   * Lista todas las configuraciones de facturación (para administración)
   */
  async listarTodas(pagina: number = 1, limite: number = 10): Promise<ConfiguracionFacturacion[]> {
    try {
      const skip = (pagina - 1) * limite;

      const configuraciones = await this.prisma.configuracionTienda.findMany({
        where: {
          configuracion_facturacion: { not: null }
        },
        skip,
        take: limite,
        orderBy: {
          fecha_creacion: 'desc'
        }
      });

      return configuraciones
        .filter(config => config.configuracion_facturacion)
        .map(config => {
          const datos = config.configuracion_facturacion as any;
          return ConfiguracionFacturacion.reconstruir(
            datos.id,
            datos.tienda_id,
            datos.nombre_empresa,
            datos.direccion_fiscal,
            datos.email_facturacion,
            datos.telefono_contacto,
            datos.id_fiscal,
            datos.metodos_pago,
            datos.ciclo_facturacion,
            new Date(datos.fecha_proxima),
            datos.historial_facturas,
            datos.notificaciones,
            new Date(datos.fecha_creacion),
            new Date(datos.fecha_actualizacion)
          );
        });
    } catch (error) {
      throw new Error(`Error al listar configuraciones de facturación: ${error.message}`);
    }
  }

  /**
   * Cuenta el total de configuraciones de facturación
   */
  async contarTotal(): Promise<number> {
    try {
      return await this.prisma.configuracionTienda.count({
        where: {
          configuracion_facturacion: { not: null }
        }
      });
    } catch (error) {
      throw new Error(`Error al contar configuraciones de facturación: ${error.message}`);
    }
  }

  /**
   * Busca configuraciones por criterios específicos
   */
  async buscarPorCriterios(
    criterios: {
      tiendaId?: string;
      nombreEmpresa?: string;
      emailFacturacion?: string;
      idFiscal?: string;
    },
    pagina: number = 1,
    limite: number = 10
  ): Promise<ConfiguracionFacturacion[]> {
    try {
      const skip = (pagina - 1) * limite;
      const whereConditions: any[] = [{ configuracion_facturacion: { not: null } }];

      if (criterios.tiendaId) {
        whereConditions.push({
          tienda_id: criterios.tiendaId
        });
      }

      if (criterios.nombreEmpresa) {
        whereConditions.push({
          configuracion_facturacion: {
            path: ['nombre_empresa'],
            string_contains: criterios.nombreEmpresa
          }
        });
      }

      if (criterios.emailFacturacion) {
        whereConditions.push({
          configuracion_facturacion: {
            path: ['email_facturacion'],
            string_contains: criterios.emailFacturacion
          }
        });
      }

      if (criterios.idFiscal) {
        whereConditions.push({
          configuracion_facturacion: {
            path: ['id_fiscal'],
            string_contains: criterios.idFiscal
          }
        });
      }

      const configuraciones = await this.prisma.configuracionTienda.findMany({
        where: {
          AND: whereConditions
        },
        skip,
        take: limite,
        orderBy: {
          fecha_creacion: 'desc'
        }
      });

      return configuraciones
        .filter(config => config.configuracion_facturacion)
        .map(config => {
          const datos = config.configuracion_facturacion as any;
          return ConfiguracionFacturacion.reconstruir(
            datos.id,
            datos.tienda_id,
            datos.nombre_empresa,
            datos.direccion_fiscal,
            datos.email_facturacion,
            datos.telefono_contacto,
            datos.id_fiscal,
            datos.metodos_pago,
            datos.ciclo_facturacion,
            new Date(datos.fecha_proxima),
            datos.historial_facturas,
            datos.notificaciones,
            new Date(datos.fecha_creacion),
            new Date(datos.fecha_actualizacion)
          );
        });
    } catch (error) {
      throw new Error(`Error al buscar configuraciones por criterios: ${error.message}`);
    }
  }
}