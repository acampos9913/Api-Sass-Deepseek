import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { ConfiguracionCuentasCliente } from '../../dominio/entidades/configuracion-cuentas-cliente.entity';
import { RepositorioConfiguracionCuentasCliente } from '../../dominio/interfaces/repositorio-configuracion-cuentas-cliente.interface';
import { 
  ModoCuentas, 
  MetodoAutenticacion,
  ReglaDevolucionDto 
} from '../../aplicacion/dto/configuracion-cuentas-cliente.dto';

@Injectable()
export class PrismaRepositorioConfiguracionCuentasCliente implements RepositorioConfiguracionCuentasCliente {
  constructor(private readonly prisma: PrismaService) {}

  async buscarPorTiendaId(tiendaId: string): Promise<ConfiguracionCuentasCliente | null> {
    try {
      const configuracion = await this.prisma.configuracionCuentasCliente.findUnique({
        where: { tienda_id: tiendaId }
      });

      if (!configuracion) {
        return null;
      }

      return ConfiguracionCuentasCliente.reconstruir(
        configuracion.id,
        configuracion.tienda_id,
        configuracion.modo_cuentas as ModoCuentas,
        configuracion.metodo_autenticacion as MetodoAutenticacion,
        configuracion.mostrar_enlaces_inicio,
        configuracion.apps_conectadas as string[],
        configuracion.personalizacion,
        configuracion.credito_tienda,
        configuracion.devolucion_autoservicio,
        configuracion.reglas_devolucion as ReglaDevolucionDto[],
        configuracion.fecha_creacion,
        configuracion.fecha_actualizacion,
        configuracion.url_cuenta || undefined,
        configuracion.dominio || undefined
      );
    } catch (error) {
      throw new Error(`Error al buscar configuración por tienda ID: ${error.message}`);
    }
  }

  async guardar(configuracion: ConfiguracionCuentasCliente): Promise<void> {
    try {
      await this.prisma.configuracionCuentasCliente.create({
        data: {
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
        }
      });
    } catch (error) {
      throw new Error(`Error al guardar configuración: ${error.message}`);
    }
  }

  async actualizar(configuracion: ConfiguracionCuentasCliente): Promise<void> {
    try {
      await this.prisma.configuracionCuentasCliente.update({
        where: { id: configuracion.id },
        data: {
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
          fecha_actualizacion: configuracion.fechaActualizacion,
        }
      });
    } catch (error) {
      throw new Error(`Error al actualizar configuración: ${error.message}`);
    }
  }

  async eliminarPorTiendaId(tiendaId: string): Promise<void> {
    try {
      await this.prisma.configuracionCuentasCliente.delete({
        where: { tienda_id: tiendaId }
      });
    } catch (error) {
      throw new Error(`Error al eliminar configuración: ${error.message}`);
    }
  }

  async existePorTiendaId(tiendaId: string): Promise<boolean> {
    try {
      const configuracion = await this.prisma.configuracionCuentasCliente.findUnique({
        where: { tienda_id: tiendaId }
      });
      return configuracion !== null;
    } catch (error) {
      throw new Error(`Error al verificar existencia: ${error.message}`);
    }
  }

  async buscarPorModoCuentas(modoCuentas: string): Promise<ConfiguracionCuentasCliente[]> {
    try {
      const configuraciones = await this.prisma.configuracionCuentasCliente.findMany({
        where: { modo_cuentas: modoCuentas }
      });

      return configuraciones.map(config => 
        ConfiguracionCuentasCliente.reconstruir(
          config.id,
          config.tienda_id,
          config.modo_cuentas as ModoCuentas,
          config.metodo_autenticacion as MetodoAutenticacion,
          config.mostrar_enlaces_inicio,
          config.apps_conectadas as string[],
          config.personalizacion,
          config.credito_tienda,
          config.devolucion_autoservicio,
          config.reglas_devolucion as ReglaDevolucionDto[],
          config.fecha_creacion,
          config.fecha_actualizacion,
          config.url_cuenta || undefined,
          config.dominio || undefined
        )
      );
    } catch (error) {
      throw new Error(`Error al buscar por modo de cuentas: ${error.message}`);
    }
  }

  async buscarPorMetodoAutenticacion(metodoAutenticacion: string): Promise<ConfiguracionCuentasCliente[]> {
    try {
      const configuraciones = await this.prisma.configuracionCuentasCliente.findMany({
        where: { metodo_autenticacion: metodoAutenticacion }
      });

      return configuraciones.map(config => 
        ConfiguracionCuentasCliente.reconstruir(
          config.id,
          config.tienda_id,
          config.modo_cuentas as ModoCuentas,
          config.metodo_autenticacion as MetodoAutenticacion,
          config.mostrar_enlaces_inicio,
          config.apps_conectadas as string[],
          config.personalizacion,
          config.credito_tienda,
          config.devolucion_autoservicio,
          config.reglas_devolucion as ReglaDevolucionDto[],
          config.fecha_creacion,
          config.fecha_actualizacion,
          config.url_cuenta || undefined,
          config.dominio || undefined
        )
      );
    } catch (error) {
      throw new Error(`Error al buscar por método de autenticación: ${error.message}`);
    }
  }

  async buscarConCreditoTiendaActivo(): Promise<ConfiguracionCuentasCliente[]> {
    try {
      const configuraciones = await this.prisma.configuracionCuentasCliente.findMany({
        where: { credito_tienda: true }
      });

      return configuraciones.map(config => 
        ConfiguracionCuentasCliente.reconstruir(
          config.id,
          config.tienda_id,
          config.modo_cuentas as ModoCuentas,
          config.metodo_autenticacion as MetodoAutenticacion,
          config.mostrar_enlaces_inicio,
          config.apps_conectadas as string[],
          config.personalizacion,
          config.credito_tienda,
          config.devolucion_autoservicio,
          config.reglas_devolucion as ReglaDevolucionDto[],
          config.fecha_creacion,
          config.fecha_actualizacion,
          config.url_cuenta || undefined,
          config.dominio || undefined
        )
      );
    } catch (error) {
      throw new Error(`Error al buscar con crédito en tienda activo: ${error.message}`);
    }
  }

  async buscarConDevolucionAutoservicioActiva(): Promise<ConfiguracionCuentasCliente[]> {
    try {
      const configuraciones = await this.prisma.configuracionCuentasCliente.findMany({
        where: { devolucion_autoservicio: true }
      });

      return configuraciones.map(config => 
        ConfiguracionCuentasCliente.reconstruir(
          config.id,
          config.tienda_id,
          config.modo_cuentas as ModoCuentas,
          config.metodo_autenticacion as MetodoAutenticacion,
          config.mostrar_enlaces_inicio,
          config.apps_conectadas as string[],
          config.personalizacion,
          config.credito_tienda,
          config.devolucion_autoservicio,
          config.reglas_devolucion as ReglaDevolucionDto[],
          config.fecha_creacion,
          config.fecha_actualizacion,
          config.url_cuenta || undefined,
          config.dominio || undefined
        )
      );
    } catch (error) {
      throw new Error(`Error al buscar con devolución autoservicio activa: ${error.message}`);
    }
  }

  async actualizarModoCuentas(tiendaId: string, modoCuentas: string): Promise<void> {
    try {
      await this.prisma.configuracionCuentasCliente.update({
        where: { tienda_id: tiendaId },
        data: { 
          modo_cuentas: modoCuentas,
          fecha_actualizacion: new Date()
        }
      });
    } catch (error) {
      throw new Error(`Error al actualizar modo de cuentas: ${error.message}`);
    }
  }

  async actualizarMetodoAutenticacion(tiendaId: string, metodoAutenticacion: string): Promise<void> {
    try {
      await this.prisma.configuracionCuentasCliente.update({
        where: { tienda_id: tiendaId },
        data: { 
          metodo_autenticacion: metodoAutenticacion,
          fecha_actualizacion: new Date()
        }
      });
    } catch (error) {
      throw new Error(`Error al actualizar método de autenticación: ${error.message}`);
    }
  }

  async actualizarMostrarEnlacesInicio(tiendaId: string, mostrar: boolean): Promise<void> {
    try {
      await this.prisma.configuracionCuentasCliente.update({
        where: { tienda_id: tiendaId },
        data: { 
          mostrar_enlaces_inicio: mostrar,
          fecha_actualizacion: new Date()
        }
      });
    } catch (error) {
      throw new Error(`Error al actualizar mostrar enlaces de inicio: ${error.message}`);
    }
  }

  async agregarAppConectada(tiendaId: string, appId: string): Promise<void> {
    try {
      const configuracion = await this.prisma.configuracionCuentasCliente.findUnique({
        where: { tienda_id: tiendaId }
      });

      if (!configuracion) {
        throw new Error('Configuración no encontrada');
      }

      const appsActualizadas = [...(configuracion.apps_conectadas as string[]), appId];
      
      await this.prisma.configuracionCuentasCliente.update({
        where: { tienda_id: tiendaId },
        data: { 
          apps_conectadas: appsActualizadas,
          fecha_actualizacion: new Date()
        }
      });
    } catch (error) {
      throw new Error(`Error al agregar app conectada: ${error.message}`);
    }
  }

  async removerAppConectada(tiendaId: string, appId: string): Promise<void> {
    try {
      const configuracion = await this.prisma.configuracionCuentasCliente.findUnique({
        where: { tienda_id: tiendaId }
      });

      if (!configuracion) {
        throw new Error('Configuración no encontrada');
      }

      const appsActualizadas = (configuracion.apps_conectadas as string[]).filter(id => id !== appId);
      
      await this.prisma.configuracionCuentasCliente.update({
        where: { tienda_id: tiendaId },
        data: { 
          apps_conectadas: appsActualizadas,
          fecha_actualizacion: new Date()
        }
      });
    } catch (error) {
      throw new Error(`Error al remover app conectada: ${error.message}`);
    }
  }

  async actualizarPersonalizacion(tiendaId: string, activa: boolean): Promise<void> {
    try {
      await this.prisma.configuracionCuentasCliente.update({
        where: { tienda_id: tiendaId },
        data: { 
          personalizacion: activa,
          fecha_actualizacion: new Date()
        }
      });
    } catch (error) {
      throw new Error(`Error al actualizar personalización: ${error.message}`);
    }
  }

  async actualizarCreditoTienda(tiendaId: string, activo: boolean): Promise<void> {
    try {
      await this.prisma.configuracionCuentasCliente.update({
        where: { tienda_id: tiendaId },
        data: { 
          credito_tienda: activo,
          fecha_actualizacion: new Date()
        }
      });
    } catch (error) {
      throw new Error(`Error al actualizar crédito en tienda: ${error.message}`);
    }
  }

  async actualizarDevolucionAutoservicio(tiendaId: string, activa: boolean): Promise<void> {
    try {
      await this.prisma.configuracionCuentasCliente.update({
        where: { tienda_id: tiendaId },
        data: { 
          devolucion_autoservicio: activa,
          fecha_actualizacion: new Date()
        }
      });
    } catch (error) {
      throw new Error(`Error al actualizar devolución autoservicio: ${error.message}`);
    }
  }

  async agregarReglaDevolucion(tiendaId: string, regla: any): Promise<void> {
    try {
      const configuracion = await this.prisma.configuracionCuentasCliente.findUnique({
        where: { tienda_id: tiendaId }
      });

      if (!configuracion) {
        throw new Error('Configuración no encontrada');
      }

      const reglasActualizadas = [...(configuracion.reglas_devolucion as any[]), regla];
      
      await this.prisma.configuracionCuentasCliente.update({
        where: { tienda_id: tiendaId },
        data: { 
          reglas_devolucion: reglasActualizadas,
          fecha_actualizacion: new Date()
        }
      });
    } catch (error) {
      throw new Error(`Error al agregar regla de devolución: ${error.message}`);
    }
  }

  async removerReglaDevolucion(tiendaId: string, index: number): Promise<void> {
    try {
      const configuracion = await this.prisma.configuracionCuentasCliente.findUnique({
        where: { tienda_id: tiendaId }
      });

      if (!configuracion) {
        throw new Error('Configuración no encontrada');
      }

      const reglasActualizadas = (configuracion.reglas_devolucion as any[]).filter((_, i) => i !== index);
      
      await this.prisma.configuracionCuentasCliente.update({
        where: { tienda_id: tiendaId },
        data: { 
          reglas_devolucion: reglasActualizadas,
          fecha_actualizacion: new Date()
        }
      });
    } catch (error) {
      throw new Error(`Error al remover regla de devolución: ${error.message}`);
    }
  }

  async actualizarUrlCuenta(tiendaId: string, url: string): Promise<void> {
    try {
      await this.prisma.configuracionCuentasCliente.update({
        where: { tienda_id: tiendaId },
        data: { 
          url_cuenta: url,
          fecha_actualizacion: new Date()
        }
      });
    } catch (error) {
      throw new Error(`Error al actualizar URL de cuenta: ${error.message}`);
    }
  }

  async actualizarDominio(tiendaId: string, dominio: string): Promise<void> {
    try {
      await this.prisma.configuracionCuentasCliente.update({
        where: { tienda_id: tiendaId },
        data: { 
          dominio: dominio,
          fecha_actualizacion: new Date()
        }
      });
    } catch (error) {
      throw new Error(`Error al actualizar dominio: ${error.message}`);
    }
  }

  async validarAppInstalada(tiendaId: string, appId: string): Promise<boolean> {
    // Implementación simplificada - en producción se validaría contra la tabla de apps instaladas
    try {
      const app = await this.prisma.configuracionAplicacionesCanalesVenta.findFirst({
        where: { 
          tienda_id: tiendaId,
          apps_instaladas: {
            path: ['$[*].id'],
            array_contains: [appId]
          }
        }
      });
      return app !== null;
    } catch (error) {
      throw new Error(`Error al validar app instalada: ${error.message}`);
    }
  }

  async validarDominioExistente(tiendaId: string, dominio: string): Promise<boolean> {
    try {
      const configuracionDominios = await this.prisma.configuracionDominios.findUnique({
        where: { tienda_id: tiendaId }
      });

      if (!configuracionDominios) {
        return false;
      }

      const dominios = configuracionDominios.dominios as any[];
      return dominios.some(d => d.nombre_dominio === dominio);
    } catch (error) {
      throw new Error(`Error al validar dominio existente: ${error.message}`);
    }
  }

  async obtenerEstadisticas(): Promise<{
    totalConfiguraciones: number;
    modoRecomendado: number;
    modoClasico: number;
    codigoUnicoUso: number;
    contrasena: number;
    creditoTiendaActivo: number;
    devolucionAutoservicioActiva: number;
  }> {
    try {
      const totalConfiguraciones = await this.prisma.configuracionCuentasCliente.count();
      const modoRecomendado = await this.prisma.configuracionCuentasCliente.count({
        where: { modo_cuentas: ModoCuentas.RECOMENDADO }
      });
      const modoClasico = await this.prisma.configuracionCuentasCliente.count({
        where: { modo_cuentas: ModoCuentas.CLASICO }
      });
      const codigoUnicoUso = await this.prisma.configuracionCuentasCliente.count({
        where: { metodo_autenticacion: MetodoAutenticacion.CODIGO_UNICO_USO }
      });
      const contrasena = await this.prisma.configuracionCuentasCliente.count({
        where: { metodo_autenticacion: MetodoAutenticacion.CONTRASENA }
      });
      const creditoTiendaActivo = await this.prisma.configuracionCuentasCliente.count({
        where: { credito_tienda: true }
      });
      const devolucionAutoservicioActiva = await this.prisma.configuracionCuentasCliente.count({
        where: { devolucion_autoservicio: true }
      });

      return {
        totalConfiguraciones,
        modoRecomendado,
        modoClasico,
        codigoUnicoUso,
        contrasena,
        creditoTiendaActivo,
        devolucionAutoservicioActiva
      };
    } catch (error) {
      throw new Error(`Error al obtener estadísticas: ${error.message}`);
    }
  }

  async buscarPorCriterios(criterios: {
    modoCuentas?: string;
    metodoAutenticacion?: string;
    creditoTienda?: boolean;
    devolucionAutoservicio?: boolean;
    personalizacion?: boolean;
  }): Promise<ConfiguracionCuentasCliente[]> {
    try {
      const whereClause: any = {};

      if (criterios.modoCuentas) whereClause.modo_cuentas = criterios.modoCuentas;
      if (criterios.metodoAutenticacion) whereClause.metodo_autenticacion = criterios.metodoAutenticacion;
      if (criterios.creditoTienda !== undefined) whereClause.credito_tienda = criterios.creditoTienda;
      if (criterios.devolucionAutoservicio !== undefined) whereClause.devolucion_autoservicio = criterios.devolucionAutoservicio;
      if (criterios.personalizacion !== undefined) whereClause.personalizacion = criterios.personalizacion;

      const configuraciones = await this.prisma.configuracionCuentasCliente.findMany({
        where: whereClause
      });

      return configuraciones.map(config => 
        ConfiguracionCuentasCliente.reconstruir(
          config.id,
          config.tienda_id,
          config.modo_cuentas as ModoCuentas,
          config.metodo_autenticacion as MetodoAutenticacion,
          config.mostrar_enlaces_inicio,
          config.apps_conectadas as string[],
          config.personalizacion,
          config.credito_tienda,
          config.devolucion_autoservicio,
          config.reglas_devolucion as ReglaDevolucionDto[],
          config.fecha_creacion,
          config.fecha_actualizacion,
          config.url_cuenta || undefined,
          config.dominio || undefined
        )
      );
    } catch (error) {
      throw new Error(`Error al buscar por criterios: ${error.message}`);
    }
  }

  async realizarBackup(): Promise<any> {
    try {
      const configuraciones = await this.prisma.configuracionCuentasCliente.findMany();
      return {
        fecha_backup: new Date(),
        total_configuraciones: configuraciones.length,
        configuraciones: configuraciones
      };
    } catch (error) {
      throw new Error(`Error al realizar backup: ${error.message}`);
    }
  }

  async restaurarDesdeBackup(backup: any): Promise<void> {
    try {
      if (backup.configuraciones && Array.isArray(backup.configuraciones)) {
        for (const config of backup.configuraciones) {
          await this.prisma.configuracionCuentasCliente.upsert({
            where: { id: config.id },
            update: config,
            create: config
          });
        }
      }
    } catch (error) {
      throw new Error(`Error al restaurar desde backup: ${error.message}`);
    }
  }

  async sincronizarConSistemaExterno(tiendaId: string): Promise<void> {
    // Implementación placeholder para sincronización con sistemas externos
    console.log(`Sincronizando configuración de cuentas de cliente para tienda ${tiendaId}`);
  }

  async validarIntegridad(tiendaId: string): Promise<boolean> {
    try {
      const configuracion = await this.buscarPorTiendaId(tiendaId);
      return configuracion ? configuracion.esValida() : false;
    } catch (error) {
      throw new Error(`Error al validar integridad: ${error.message}`);
    }
  }

  async obtenerHistorialCambios(tiendaId: string): Promise<any[]> {
    // Implementación simplificada - en producción se usaría una tabla de historial
    try {
      const configuracion = await this.prisma.configuracionCuentasCliente.findUnique({
        where: { tienda_id: tiendaId }
      });

      if (!configuracion) {
        return [];
      }

      return [{
        fecha: configuracion.fecha_actualizacion,
        tipo: 'ACTUALIZACION',
        descripcion: 'Última actualización de configuración'
      }];
    } catch (error) {
      throw new Error(`Error al obtener historial de cambios: ${error.message}`);
    }
  }

  async limpiarConfiguracionesObsoletas(): Promise<void> {
    try {
      const fechaLimite = new Date();
      fechaLimite.setMonth(fechaLimite.getMonth() - 6); // 6 meses atrás

      const configuracionesObsoletas = await this.prisma.configuracionCuentasCliente.findMany({
        where: {
          fecha_actualizacion: { lt: fechaLimite }
        }
      });

      for (const config of configuracionesObsoletas) {
        await this.prisma.configuracionCuentasCliente.delete({
          where: { id: config.id }
        });
      }
    } catch (error) {
      throw new Error(`Error al limpiar configuraciones obsoletas: ${error.message}`);
    }
  }

  async migrarConfiguracion(tiendaId: string, versionAnterior: string, versionNueva: string): Promise<void> {
    // Implementación placeholder para migración de versiones
    console.log(`Migrando configuración de ${versionAnterior} a ${versionNueva} para tienda ${tiendaId}`);
  }
}