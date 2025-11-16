import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { RepositorioConfiguracionUsuarios } from '../../dominio/interfaces/repositorio-configuracion-usuarios.interface';
import { TipoMetodoAutenticacion } from '../../dominio/enums/tipo-metodo-autenticacion.enum';

/**
 * Implementación del repositorio de configuración de usuarios usando Prisma ORM
 * Sigue la interfaz definida en el dominio
 */
@Injectable()
export class PrismaRepositorioConfiguracionUsuarios implements RepositorioConfiguracionUsuarios {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Obtiene la configuración de usuarios para una tienda
   */
  async obtenerConfiguracion(tiendaId: string) {
    const configuracion = await this.prisma.configuracionUsuarios.findUnique({
      where: { tienda_id: tiendaId },
    });

    if (!configuracion) {
      return this.obtenerConfiguracionPorDefecto();
    }

    const configuracionData = configuracion.configuracion_usuarios as any;

    return {
      modoCuentas: configuracionData?.modoCuentas ?? 'recomendado',
      metodoAutenticacion: configuracionData?.metodoAutenticacion ?? 'codigo_unico',
      mostrarEnlacesInicioSesion: configuracionData?.mostrarEnlacesInicioSesion ?? true,
      appsConectadas: configuracionData?.appsConectadas ?? [],
      personalizacionActiva: configuracionData?.personalizacionActiva ?? false,
      creditoTienda: configuracionData?.creditoTienda ?? false,
      devolucionAutoservicio: configuracionData?.devolucionAutoservicio ?? false,
      reglasDevolucion: configuracionData?.reglasDevolucion ?? [],
      urlCuenta: configuracionData?.urlCuenta ?? '',
      dominioPersonalizado: configuracionData?.dominioPersonalizado,
      metodosAutenticacion: configuracionData?.metodosAutenticacion ?? [],
    };
  }

  /**
   * Actualiza la configuración de usuarios
   */
  async actualizarConfiguracion(
    tiendaId: string,
    datos: {
      modoCuentas?: 'recomendado' | 'clasico';
      metodoAutenticacion?: 'codigo_unico' | 'contrasena';
      mostrarEnlacesInicioSesion?: boolean;
      appsConectadas?: string[];
      personalizacionActiva?: boolean;
      creditoTienda?: boolean;
      devolucionAutoservicio?: boolean;
      reglasDevolucion?: Array<{
        condicion: string;
        limite: number;
        aplicable: boolean;
      }>;
      urlCuenta?: string;
      dominioPersonalizado?: string;
      metodosAutenticacion?: Array<{
        tipo: TipoMetodoAutenticacion;
        habilitado: boolean;
        configuracion?: any;
      }>;
    },
  ): Promise<void> {
    const configuracionExistente = await this.prisma.configuracionUsuarios.findUnique({
      where: { tienda_id: tiendaId },
    });

    const configuracionActual = configuracionExistente?.configuracion_usuarios as any ?? {};

    const configuracionActualizada = {
      ...configuracionActual,
      ...datos,
    };

    await this.prisma.configuracionUsuarios.upsert({
      where: { tienda_id: tiendaId },
      update: {
        configuracion_usuarios: configuracionActualizada,
        fecha_actualizacion: new Date(),
      },
      create: {
        tienda_id: tiendaId,
        configuracion_usuarios: configuracionActualizada,
        fecha_creacion: new Date(),
        fecha_actualizacion: new Date(),
      },
    });
  }

  /**
   * Agrega una app conectada
   */
  async agregarAppConectada(tiendaId: string, appId: string): Promise<void> {
    const configuracion = await this.obtenerConfiguracion(tiendaId);
    const appsActualizadas = [...configuracion.appsConectadas, appId];

    await this.actualizarConfiguracion(tiendaId, {
      appsConectadas: appsActualizadas,
    });
  }

  /**
   * Elimina una app conectada
   */
  async eliminarAppConectada(tiendaId: string, appId: string): Promise<void> {
    const configuracion = await this.obtenerConfiguracion(tiendaId);
    const appsActualizadas = configuracion.appsConectadas.filter(app => app !== appId);

    await this.actualizarConfiguracion(tiendaId, {
      appsConectadas: appsActualizadas,
    });
  }

  /**
   * Verifica si una app está conectada
   */
  async existeAppConectada(tiendaId: string, appId: string): Promise<boolean> {
    const configuracion = await this.obtenerConfiguracion(tiendaId);
    return configuracion.appsConectadas.includes(appId);
  }

  /**
   * Obtiene todas las apps conectadas
   */
  async obtenerAppsConectadas(tiendaId: string): Promise<string[]> {
    const configuracion = await this.obtenerConfiguracion(tiendaId);
    return configuracion.appsConectadas;
  }

  /**
   * Agrega una regla de devolución
   */
  async agregarReglaDevolucion(
    tiendaId: string,
    regla: {
      condicion: string;
      limite: number;
      aplicable: boolean;
    },
  ): Promise<void> {
    const configuracion = await this.obtenerConfiguracion(tiendaId);
    const reglasActualizadas = [...configuracion.reglasDevolucion, regla];

    await this.actualizarConfiguracion(tiendaId, {
      reglasDevolucion: reglasActualizadas,
    });
  }

  /**
   * Actualiza una regla de devolución
   */
  async actualizarReglaDevolucion(
    tiendaId: string,
    reglaId: string,
    datos: {
      condicion?: string;
      limite?: number;
      aplicable?: boolean;
    },
  ): Promise<void> {
    const configuracion = await this.obtenerConfiguracion(tiendaId);
    const reglasActualizadas = configuracion.reglasDevolucion.map((regla, index) => {
      if (index.toString() === reglaId) {
        return {
          ...regla,
          ...datos,
        };
      }
      return regla;
    });

    await this.actualizarConfiguracion(tiendaId, {
      reglasDevolucion: reglasActualizadas,
    });
  }

  /**
   * Elimina una regla de devolución
   */
  async eliminarReglaDevolucion(tiendaId: string, reglaId: string): Promise<void> {
    const configuracion = await this.obtenerConfiguracion(tiendaId);
    const reglasActualizadas = configuracion.reglasDevolucion.filter((_, index) => 
      index.toString() !== reglaId
    );

    await this.actualizarConfiguracion(tiendaId, {
      reglasDevolucion: reglasActualizadas,
    });
  }

  /**
   * Obtiene todas las reglas de devolución
   */
  async obtenerReglasDevolucion(tiendaId: string) {
    const configuracion = await this.obtenerConfiguracion(tiendaId);
    return configuracion.reglasDevolucion.map((regla, index) => ({
      id: index.toString(),
      ...regla,
    }));
  }

  /**
   * Verifica si una regla de devolución existe
   */
  async existeReglaDevolucion(tiendaId: string, condicion: string): Promise<boolean> {
    const configuracion = await this.obtenerConfiguracion(tiendaId);
    return configuracion.reglasDevolucion.some(regla => 
      regla.condicion.toLowerCase() === condicion.toLowerCase()
    );
  }

  /**
   * Obtiene la configuración de autenticación
   */
  async obtenerConfiguracionAutenticacion(tiendaId: string) {
    const configuracion = await this.obtenerConfiguracion(tiendaId);
    return {
      modoCuentas: configuracion.modoCuentas,
      metodoAutenticacion: configuracion.metodoAutenticacion,
      mostrarEnlacesInicioSesion: configuracion.mostrarEnlacesInicioSesion,
      metodosAutenticacion: configuracion.metodosAutenticacion,
    };
  }

  /**
   * Actualiza la configuración de autenticación
   */
  async actualizarConfiguracionAutenticacion(
    tiendaId: string,
    datos: {
      modoCuentas?: 'recomendado' | 'clasico';
      metodoAutenticacion?: 'codigo_unico' | 'contrasena';
      mostrarEnlacesInicioSesion?: boolean;
      metodosAutenticacion?: Array<{
        tipo: TipoMetodoAutenticacion;
        habilitado: boolean;
        configuracion?: any;
      }>;
    },
  ): Promise<void> {
    await this.actualizarConfiguracion(tiendaId, datos);
  }

  /**
   * Agrega un método de autenticación
   */
  async agregarMetodoAutenticacion(
    tiendaId: string,
    metodo: {
      tipo: TipoMetodoAutenticacion;
      habilitado: boolean;
      configuracion?: any;
    },
  ): Promise<void> {
    const configuracion = await this.obtenerConfiguracion(tiendaId);
    const metodosActualizados = [...configuracion.metodosAutenticacion, metodo];

    await this.actualizarConfiguracion(tiendaId, {
      metodosAutenticacion: metodosActualizados,
    });
  }

  /**
   * Actualiza un método de autenticación
   */
  async actualizarMetodoAutenticacion(
    tiendaId: string,
    metodoId: string,
    datos: {
      habilitado?: boolean;
      configuracion?: any;
    },
  ): Promise<void> {
    const configuracion = await this.obtenerConfiguracion(tiendaId);
    const metodosActualizados = configuracion.metodosAutenticacion.map((metodo, index) => {
      if (index.toString() === metodoId) {
        return {
          ...metodo,
          ...datos,
        };
      }
      return metodo;
    });

    await this.actualizarConfiguracion(tiendaId, {
      metodosAutenticacion: metodosActualizados,
    });
  }

  /**
   * Elimina un método de autenticación
   */
  async eliminarMetodoAutenticacion(tiendaId: string, metodoId: string): Promise<void> {
    const configuracion = await this.obtenerConfiguracion(tiendaId);
    const metodosActualizados = configuracion.metodosAutenticacion.filter((_, index) => 
      index.toString() !== metodoId
    );

    await this.actualizarConfiguracion(tiendaId, {
      metodosAutenticacion: metodosActualizados,
    });
  }

  /**
   * Obtiene todos los métodos de autenticación
   */
  async obtenerMetodosAutenticacion(tiendaId: string) {
    const configuracion = await this.obtenerConfiguracion(tiendaId);
    return configuracion.metodosAutenticacion.map((metodo, index) => ({
      id: index.toString(),
      ...metodo,
    }));
  }

  /**
   * Verifica si un método de autenticación existe
   */
  async existeMetodoAutenticacion(tiendaId: string, tipo: TipoMetodoAutenticacion): Promise<boolean> {
    const configuracion = await this.obtenerConfiguracion(tiendaId);
    return configuracion.metodosAutenticacion.some(metodo => 
      metodo.tipo === tipo
    );
  }

  /**
   * Obtiene la configuración de crédito en tienda
   */
  async obtenerConfiguracionCredito(tiendaId: string) {
    const configuracion = await this.obtenerConfiguracion(tiendaId);
    return {
      creditoTienda: configuracion.creditoTienda,
      reglasCredito: configuracion.reglasDevolucion, // Usamos las mismas reglas para simplificar
    };
  }

  /**
   * Actualiza la configuración de crédito en tienda
   */
  async actualizarConfiguracionCredito(
    tiendaId: string,
    datos: {
      creditoTienda?: boolean;
      reglasCredito?: Array<{
        condicion: string;
        montoMaximo: number;
        aplicable: boolean;
      }>;
    },
  ): Promise<void> {
    const reglasDevolucionConvertidas = datos.reglasCredito?.map(regla => ({
      condicion: regla.condicion,
      limite: regla.montoMaximo,
      aplicable: regla.aplicable,
    }));

    await this.actualizarConfiguracion(tiendaId, {
      creditoTienda: datos.creditoTienda,
      reglasDevolucion: reglasDevolucionConvertidas,
    });
  }

  /**
   * Agrega una regla de crédito
   */
  async agregarReglaCredito(
    tiendaId: string,
    regla: {
      condicion: string;
      montoMaximo: number;
      aplicable: boolean;
    },
  ): Promise<void> {
    const configuracion = await this.obtenerConfiguracion(tiendaId);
    const reglasActualizadas = [...configuracion.reglasDevolucion, regla];

    await this.actualizarConfiguracion(tiendaId, {
      reglasDevolucion: reglasActualizadas,
    });
  }

  /**
   * Actualiza una regla de crédito
   */
  async actualizarReglaCredito(
    tiendaId: string,
    reglaId: string,
    datos: {
      condicion?: string;
      montoMaximo?: number;
      aplicable?: boolean;
    },
  ): Promise<void> {
    const configuracion = await this.obtenerConfiguracion(tiendaId);
    const reglasActualizadas = configuracion.reglasDevolucion.map((regla, index) => {
      if (index.toString() === reglaId) {
        return {
          ...regla,
          ...datos,
        };
      }
      return regla;
    });

    await this.actualizarConfiguracion(tiendaId, {
      reglasDevolucion: reglasActualizadas,
    });
  }

  /**
   * Elimina una regla de crédito
   */
  async eliminarReglaCredito(tiendaId: string, reglaId: string): Promise<void> {
    const configuracion = await this.obtenerConfiguracion(tiendaId);
    const reglasActualizadas = configuracion.reglasDevolucion.filter((_, index) => 
      index.toString() !== reglaId
    );

    await this.actualizarConfiguracion(tiendaId, {
      reglasDevolucion: reglasActualizadas,
    });
  }

  /**
   * Obtiene todas las reglas de crédito
   */
  async obtenerReglasCredito(tiendaId: string) {
    const configuracion = await this.obtenerConfiguracion(tiendaId);
    return configuracion.reglasDevolucion.map((regla, index) => ({
      id: index.toString(),
      condicion: regla.condicion,
      montoMaximo: regla.limite,
      aplicable: regla.aplicable,
    }));
  }

  /**
   * Verifica si una regla de crédito existe
   */
  async existeReglaCredito(tiendaId: string, condicion: string): Promise<boolean> {
    const configuracion = await this.obtenerConfiguracion(tiendaId);
    return configuracion.reglasDevolucion.some(regla => 
      regla.condicion.toLowerCase() === condicion.toLowerCase()
    );
  }

  /**
   * Obtiene la configuración de usuarios por defecto
   */
  obtenerConfiguracionPorDefecto() {
    return {
      modoCuentas: 'recomendado' as const,
      metodoAutenticacion: 'codigo_unico' as const,
      mostrarEnlacesInicioSesion: true as const,
      appsConectadas: [] as [],
      personalizacionActiva: false as const,
      creditoTienda: false as const,
      devolucionAutoservicio: false as const,
      reglasDevolucion: [] as [],
      urlCuenta: '' as '',
      metodosAutenticacion: [
        {
          tipo: TipoMetodoAutenticacion.CODIGO_UNICO,
          habilitado: true,
          configuracion: {},
        },
        {
          tipo: TipoMetodoAutenticacion.CONTRASENA,
          habilitado: false,
          configuracion: {},
        },
      ],
    };
  }
}