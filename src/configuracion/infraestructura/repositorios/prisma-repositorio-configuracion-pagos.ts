import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { ConfiguracionPagos } from '../../dominio/entidades/configuracion-pagos.entity';
import type { RepositorioConfiguracionPagos } from '../../dominio/interfaces/repositorio-configuracion-pagos.interface';
import { 
  ModoCapturaPago,
  TipoProveedorPago,
  MetodoPago,
  CaducidadGiftcard,
  ProveedorPagoDto,
  MetodoPagoDto,
  MetodoPagoManualDto,
  ConfiguracionGiftcardDto,
  PersonalizacionPagosDto,
  CriteriosBusquedaPagosDto
} from '../../aplicacion/dto/configuracion-pagos.dto';
import { ExcepcionDominio } from '../../../comun/excepciones/excepcion-dominio';

/**
 * Implementación del repositorio de configuración de pagos usando Prisma
 * Maneja la persistencia en PostgreSQL para operaciones de escritura
 */
@Injectable()
export class PrismaRepositorioConfiguracionPagos implements RepositorioConfiguracionPagos {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Busca configuración de pagos por ID de tienda
   */
  async buscarPorTiendaId(tiendaId: string): Promise<ConfiguracionPagos | null> {
    try {
      const configuracionDB = await this.prisma.configuracionPagos.findUnique({
        where: { tiendaId },
        include: {
          proveedoresPago: true,
          metodosPago: true,
          metodosPagoManuales: true,
        },
      });

      if (!configuracionDB) {
        return null;
      }

      return this.aEntidad(configuracionDB);
    } catch (error) {
      throw ExcepcionDominio.Respuesta500(
        'Error al buscar configuración de pagos por tienda',
        'ConfiguracionPagos.ErrorBusqueda'
      );
    }
  }

  /**
   * Busca configuración de pagos por ID
   */
  async buscarPorId(id: string): Promise<ConfiguracionPagos | null> {
    try {
      const configuracionDB = await this.prisma.configuracionPagos.findUnique({
        where: { id },
        include: {
          proveedoresPago: true,
          metodosPago: true,
          metodosPagoManuales: true,
        },
      });

      if (!configuracionDB) {
        return null;
      }

      return this.aEntidad(configuracionDB);
    } catch (error) {
      throw ExcepcionDominio.Respuesta500(
        'Error al buscar configuración de pagos por ID',
        'ConfiguracionPagos.ErrorBusqueda'
      );
    }
  }

  /**
   * Verifica si existe configuración para una tienda
   */
  async existePorTiendaId(tiendaId: string): Promise<boolean> {
    try {
      const count = await this.prisma.configuracionPagos.count({
        where: { tiendaId },
      });
      return count > 0;
    } catch (error) {
      throw ExcepcionDominio.Respuesta500(
        'Error al verificar existencia de configuración de pagos',
        'ConfiguracionPagos.ErrorVerificacion'
      );
    }
  }

  /**
   * Guarda una nueva configuración de pagos
   */
  async guardar(configuracion: ConfiguracionPagos): Promise<void> {
    try {
      const datos = this.aDatosPrisma(configuracion);

      await this.prisma.configuracionPagos.create({
        data: {
          ...datos,
          proveedoresPago: {
            create: configuracion.getProveedoresPago().map(proveedor => ({
              tipoProveedor: proveedor.tipo_proveedor,
              nombreProveedor: proveedor.nombre_proveedor,
              comisionTransaccion: proveedor.comision_transaccion,
              activo: proveedor.activo,
              configuracionAdicional: proveedor.configuracion_adicional,
            })),
          },
          metodosPago: {
            create: configuracion.getMetodosPago().map(metodo => ({
              metodo: metodo.metodo,
              activo: metodo.activo,
              configuracion: metodo.configuracion,
            })),
          },
          metodosPagoManuales: {
            create: configuracion.getMetodosPagoManuales().map(manual => ({
              nombreMetodo: manual.nombre_metodo,
              instrucciones: manual.instrucciones,
              activo: manual.activo,
              tiempoProcesamiento: manual.tiempo_procesamiento,
            })),
          },
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw ExcepcionDominio.Respuesta400(
          'Ya existe una configuración de pagos para esta tienda',
          'ConfiguracionPagos.YaExiste'
        );
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al guardar configuración de pagos',
        'ConfiguracionPagos.ErrorGuardado'
      );
    }
  }

  /**
   * Actualiza una configuración de pagos existente
   */
  async actualizar(configuracion: ConfiguracionPagos): Promise<void> {
    try {
      const datos = this.aDatosPrisma(configuracion);

      await this.prisma.configuracionPagos.update({
        where: { id: configuracion.id },
        data: {
          ...datos,
          proveedoresPago: {
            deleteMany: {},
            create: configuracion.getProveedoresPago().map(proveedor => ({
              tipoProveedor: proveedor.tipo_proveedor,
              nombreProveedor: proveedor.nombre_proveedor,
              comisionTransaccion: proveedor.comision_transaccion,
              activo: proveedor.activo,
              configuracionAdicional: proveedor.configuracion_adicional,
            })),
          },
          metodosPago: {
            deleteMany: {},
            create: configuracion.getMetodosPago().map(metodo => ({
              metodo: metodo.metodo,
              activo: metodo.activo,
              configuracion: metodo.configuracion,
            })),
          },
          metodosPagoManuales: {
            deleteMany: {},
            create: configuracion.getMetodosPagoManuales().map(manual => ({
              nombreMetodo: manual.nombre_metodo,
              instrucciones: manual.instrucciones,
              activo: manual.activo,
              tiempoProcesamiento: manual.tiempo_procesamiento,
            })),
          },
        },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de pagos no encontrada',
          'ConfiguracionPagos.NoEncontrada'
        );
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al actualizar configuración de pagos',
        'ConfiguracionPagos.ErrorActualizacion'
      );
    }
  }

  /**
   * Elimina configuración de pagos por ID de tienda
   */
  async eliminarPorTiendaId(tiendaId: string): Promise<void> {
    try {
      await this.prisma.configuracionPagos.delete({
        where: { tiendaId },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de pagos no encontrada',
          'ConfiguracionPagos.NoEncontrada'
        );
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al eliminar configuración de pagos',
        'ConfiguracionPagos.ErrorEliminacion'
      );
    }
  }

  /**
   * Elimina configuración de pagos por ID
   */
  async eliminarPorId(id: string): Promise<void> {
    try {
      await this.prisma.configuracionPagos.delete({
        where: { id },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de pagos no encontrada',
          'ConfiguracionPagos.NoEncontrada'
        );
      }
      throw ExcepcionDominio.Respuesta500(
        'Error al eliminar configuración de pagos',
        'ConfiguracionPagos.ErrorEliminacion'
      );
    }
  }

  /**
   * Lista todas las configuraciones de pagos con paginación
   */
  async listarTodos(pagina: number, limite: number): Promise<{ configuraciones: ConfiguracionPagos[]; total: number }> {
    try {
      const [configuracionesDB, total] = await Promise.all([
        this.prisma.configuracionPagos.findMany({
          skip: (pagina - 1) * limite,
          take: limite,
          include: {
            proveedoresPago: true,
            metodosPago: true,
            metodosPagoManuales: true,
          },
          orderBy: { fechaCreacion: 'desc' },
        }),
        this.prisma.configuracionPagos.count(),
      ]);

      const configuraciones = configuracionesDB.map(config => this.aEntidad(config));

      return { configuraciones, total };
    } catch (error) {
      throw ExcepcionDominio.Respuesta500(
        'Error al listar configuraciones de pagos',
        'ConfiguracionPagos.ErrorListado'
      );
    }
  }

  /**
   * Busca configuraciones por criterios específicos
   */
  async buscarPorCriterios(criterios: CriteriosBusquedaPagosDto): Promise<ConfiguracionPagos[]> {
    try {
      const where: any = {};

      if (criterios.modo_captura) {
        where.modoCaptura = criterios.modo_captura;
      }

      if (criterios.tipo_proveedor) {
        where.proveedoresPago = {
          some: {
            tipoProveedor: criterios.tipo_proveedor,
          },
        };
      }

      if (criterios.metodo_pago) {
        where.metodosPago = {
          some: {
            metodo: criterios.metodo_pago,
          },
        };
      }

      if (criterios.giftcards_activas !== undefined) {
        where.configuracionGiftcard = {
          activo: criterios.giftcards_activas,
        };
      }

      if (criterios.metodos_manuales_activos !== undefined) {
        where.metodosPagoManuales = {
          some: {
            activo: criterios.metodos_manuales_activos,
          },
        };
      }

      const configuracionesDB = await this.prisma.configuracionPagos.findMany({
        where,
        include: {
          proveedoresPago: true,
          metodosPago: true,
          metodosPagoManuales: true,
        },
      });

      return configuracionesDB.map(config => this.aEntidad(config));
    } catch (error) {
      throw ExcepcionDominio.Respuesta500(
        'Error al buscar configuraciones por criterios',
        'ConfiguracionPagos.ErrorBusquedaCriterios'
      );
    }
  }

  /**
   * Obtiene estadísticas de uso de métodos de pago
   */
  async obtenerEstadisticas(): Promise<any> {
    try {
      const [totalConfiguraciones, configuracionesPorModo, metodosMasPopulares] = await Promise.all([
        this.prisma.configuracionPagos.count(),
        this.prisma.configuracionPagos.groupBy({
          by: ['modoCaptura'],
          _count: {
            id: true,
          },
        }),
        this.prisma.metodoPago.groupBy({
          by: ['metodo'],
          _count: {
            id: true,
          },
          where: {
            activo: true,
          },
        }),
      ]);

      return {
        total_configuraciones: totalConfiguraciones,
        configuraciones_por_modo: configuracionesPorModo.map(item => ({
          modo_captura: item.modoCaptura,
          cantidad: item._count.id,
        })),
        metodos_mas_populares: metodosMasPopulares.map(item => ({
          metodo: item.metodo,
          cantidad: item._count.id,
        })),
      };
    } catch (error) {
      throw ExcepcionDominio.Respuesta500(
        'Error al obtener estadísticas de pagos',
        'ConfiguracionPagos.ErrorEstadisticas'
      );
    }
  }

  /**
   * Realiza backup de configuraciones de pagos
   */
  async realizarBackup(): Promise<any> {
    try {
      const configuraciones = await this.prisma.configuracionPagos.findMany({
        include: {
          proveedoresPago: true,
          metodosPago: true,
          metodosPagoManuales: true,
        },
      });

      const backupData = {
        fecha_backup: new Date().toISOString(),
        total_configuraciones: configuraciones.length,
        configuraciones: configuraciones.map(config => ({
          id: config.id,
          tiendaId: config.tiendaId,
          modoCaptura: config.modoCaptura,
          proveedoresPago: config.proveedoresPago,
          metodosPago: config.metodosPago,
          metodosPagoManuales: config.metodosPagoManuales,
          configuracionGiftcard: config.configuracionGiftcard,
          personalizacion: config.personalizacion,
          configuracionAdicional: config.configuracionAdicional,
          fechaCreacion: config.fechaCreacion,
          fechaActualizacion: config.fechaActualizacion,
        })),
      };

      return backupData;
    } catch (error) {
      throw ExcepcionDominio.Respuesta500(
        'Error al realizar backup de configuraciones de pagos',
        'ConfiguracionPagos.ErrorBackup'
      );
    }
  }

  /**
   * Restaura configuraciones de pagos desde backup
   */
  async restaurarDesdeBackup(backupData: any): Promise<void> {
    try {
      // Eliminar todas las configuraciones existentes
      await this.prisma.configuracionPagos.deleteMany();

      // Restaurar desde backup
      for (const config of backupData.configuraciones) {
        await this.prisma.configuracionPagos.create({
          data: {
            id: config.id,
            tiendaId: config.tiendaId,
            modoCaptura: config.modoCaptura,
            configuracionGiftcard: config.configuracionGiftcard,
            personalizacion: config.personalizacion,
            configuracionAdicional: config.configuracionAdicional,
            fechaCreacion: config.fechaCreacion,
            fechaActualizacion: config.fechaActualizacion,
            proveedoresPago: {
              create: config.proveedoresPago.map((proveedor: any) => ({
                tipoProveedor: proveedor.tipoProveedor,
                nombreProveedor: proveedor.nombreProveedor,
                comisionTransaccion: proveedor.comisionTransaccion,
                activo: proveedor.activo,
                configuracionAdicional: proveedor.configuracionAdicional,
              })),
            },
            metodosPago: {
              create: config.metodosPago.map((metodo: any) => ({
                metodo: metodo.metodo,
                activo: metodo.activo,
                configuracion: metodo.configuracion,
              })),
            },
            metodosPagoManuales: {
              create: config.metodosPagoManuales.map((manual: any) => ({
                nombreMetodo: manual.nombreMetodo,
                instrucciones: manual.instrucciones,
                activo: manual.activo,
                tiempoProcesamiento: manual.tiempoProcesamiento,
              })),
            },
          },
        });
      }
    } catch (error) {
      throw ExcepcionDominio.Respuesta500(
        'Error al restaurar configuraciones de pagos desde backup',
        'ConfiguracionPagos.ErrorRestauracion'
      );
    }
  }

  /**
   * Convierte datos de Prisma a entidad de dominio
   */
  private aEntidad(datos: any): ConfiguracionPagos {
    const proveedoresPago: ProveedorPagoDto[] = datos.proveedoresPago.map((proveedor: any) => ({
      tipo_proveedor: proveedor.tipoProveedor,
      nombre_proveedor: proveedor.nombreProveedor,
      comision_transaccion: proveedor.comisionTransaccion,
      activo: proveedor.activo,
      configuracion_adicional: proveedor.configuracionAdicional,
    }));

    const metodosPago: MetodoPagoDto[] = datos.metodosPago.map((metodo: any) => ({
      metodo: metodo.metodo,
      activo: metodo.activo,
      configuracion: metodo.configuracion,
    }));

    const metodosPagoManuales: MetodoPagoManualDto[] = datos.metodosPagoManuales.map((manual: any) => ({
      nombre_metodo: manual.nombreMetodo,
      instrucciones: manual.instrucciones,
      activo: manual.activo,
      tiempo_procesamiento: manual.tiempoProcesamiento,
    }));

    const configuracionGiftcard: ConfiguracionGiftcardDto = {
      activo: datos.configuracionGiftcard?.activo || false,
      caducidad: datos.configuracionGiftcard?.caducidad || CaducidadGiftcard.NUNCA,
      fecha_expiracion: datos.configuracionGiftcard?.fechaExpiracion,
      monto_minimo: datos.configuracionGiftcard?.montoMinimo,
      monto_maximo: datos.configuracionGiftcard?.montoMaximo,
    };

    return ConfiguracionPagos.reconstruir(
      datos.id,
      datos.tiendaId,
      datos.modoCaptura,
      proveedoresPago,
      metodosPago,
      metodosPagoManuales,
      configuracionGiftcard,
      datos.personalizacion,
      datos.configuracionAdicional,
      datos.fechaCreacion,
      datos.fechaActualizacion
    );
  }

  /**
   * Convierte entidad de dominio a datos de Prisma
   */
  private aDatosPrisma(configuracion: ConfiguracionPagos): any {
    return {
      id: configuracion.id,
      tiendaId: configuracion.tiendaId,
      modoCaptura: configuracion.getModoCaptura(),
      configuracionGiftcard: configuracion.getConfiguracionGiftcard(),
      personalizacion: configuracion.getPersonalizacion(),
      configuracionAdicional: configuracion.getConfiguracionAdicional(),
      fechaCreacion: configuracion.fechaCreacion,
      fechaActualizacion: configuracion.fechaActualizacion,
    };
  }
}