import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { RepositorioConfiguracionTienda } from '../../dominio/interfaces/repositorio-configuracion-tienda.interface';
import { Moneda, ConfiguracionImpuestos, DireccionTienda, ContactoTienda, ConfiguracionEnvio, ConfiguracionPagos, ConfiguracionGeneral, ConfiguracionFacturacion } from '../../dominio/entidades/configuracion-tienda.entity';

/**
 * Implementación del repositorio de configuración de tienda usando Prisma ORM
 * Sigue la interfaz definida en el dominio
 */
@Injectable()
export class PrismaRepositorioConfiguracionTienda implements RepositorioConfiguracionTienda {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Crea una nueva configuración de tienda en el sistema
   */
  async crear(configuracion: {
    id: string;
    nombreTienda: string;
    descripcionTienda: string | null;
    moneda: Moneda;
    impuestos: ConfiguracionImpuestos;
    direccion: DireccionTienda;
    contacto: ContactoTienda;
    configuracionEnvio: ConfiguracionEnvio;
    configuracionPagos: ConfiguracionPagos;
    configuracionGeneral: ConfiguracionGeneral;
    configuracionFacturacion: ConfiguracionFacturacion;
    fechaCreacion: Date;
    fechaActualizacion: Date;
  }): Promise<void> {
    await this.prisma.configuracionTienda.create({
      data: {
        id: configuracion.id,
        nombre_tienda: configuracion.nombreTienda,
        descripcion_tienda: configuracion.descripcionTienda,
        moneda: configuracion.moneda,
        impuestos: configuracion.impuestos,
        direccion: configuracion.direccion,
        contacto: configuracion.contacto,
        configuracion_envio: configuracion.configuracionEnvio,
        configuracion_pagos: configuracion.configuracionPagos,
        configuracion_general: configuracion.configuracionGeneral,
        configuracion_facturacion: configuracion.configuracionFacturacion,
        activa: false, // Por defecto no activa
        fecha_creacion: configuracion.fechaCreacion,
        fecha_actualizacion: configuracion.fechaActualizacion,
      },
    });
  }

  /**
   * Busca la configuración de tienda por su ID único
   */
  async buscarPorId(id: string): Promise<{
    id: string;
    nombreTienda: string;
    descripcionTienda: string | null;
    moneda: Moneda;
    impuestos: ConfiguracionImpuestos;
    direccion: DireccionTienda;
    contacto: ContactoTienda;
    configuracionEnvio: ConfiguracionEnvio;
    configuracionPagos: ConfiguracionPagos;
    configuracionGeneral: ConfiguracionGeneral;
    configuracionFacturacion: ConfiguracionFacturacion;
    fechaCreacion: Date;
    fechaActualizacion: Date;
  } | null> {
    const configuracion = await this.prisma.configuracionTienda.findUnique({
      where: { id },
    });

    if (!configuracion) {
      return null;
    }

    return {
      id: configuracion.id,
      nombreTienda: configuracion.nombre_tienda,
      descripcionTienda: configuracion.descripcion_tienda,
      moneda: configuracion.moneda as Moneda,
      impuestos: configuracion.impuestos as ConfiguracionImpuestos,
      direccion: configuracion.direccion as DireccionTienda,
      contacto: configuracion.contacto as ContactoTienda,
      configuracionEnvio: configuracion.configuracion_envio as ConfiguracionEnvio,
      configuracionPagos: configuracion.configuracion_pagos as ConfiguracionPagos,
      configuracionGeneral: configuracion.configuracion_general as ConfiguracionGeneral,
      configuracionFacturacion: configuracion.configuracion_facturacion as ConfiguracionFacturacion,
      fechaCreacion: configuracion.fecha_creacion,
      fechaActualizacion: configuracion.fecha_actualizacion,
    };
  }

  /**
   * Obtiene la configuración activa de la tienda
   */
  async obtenerConfiguracionActiva(): Promise<{
    id: string;
    nombreTienda: string;
    descripcionTienda: string | null;
    moneda: Moneda;
    impuestos: ConfiguracionImpuestos;
    direccion: DireccionTienda;
    contacto: ContactoTienda;
    configuracionEnvio: ConfiguracionEnvio;
    configuracionPagos: ConfiguracionPagos;
    configuracionGeneral: ConfiguracionGeneral;
    configuracionFacturacion: ConfiguracionFacturacion;
    fechaCreacion: Date;
    fechaActualizacion: Date;
  } | null> {
    const configuracion = await this.prisma.configuracionTienda.findFirst({
      where: { activa: true },
    });

    if (!configuracion) {
      return null;
    }

    return {
      id: configuracion.id,
      nombreTienda: configuracion.nombre_tienda,
      descripcionTienda: configuracion.descripcion_tienda,
      moneda: configuracion.moneda as Moneda,
      impuestos: configuracion.impuestos as ConfiguracionImpuestos,
      direccion: configuracion.direccion as DireccionTienda,
      contacto: configuracion.contacto as ContactoTienda,
      configuracionEnvio: configuracion.configuracion_envio as ConfiguracionEnvio,
      configuracionPagos: configuracion.configuracion_pagos as ConfiguracionPagos,
      configuracionGeneral: configuracion.configuracion_general as ConfiguracionGeneral,
      configuracionFacturacion: configuracion.configuracion_facturacion as ConfiguracionFacturacion,
      fechaCreacion: configuracion.fecha_creacion,
      fechaActualizacion: configuracion.fecha_actualizacion,
    };
  }

  /**
   * Actualiza la información de configuración de tienda existente
   */
  async actualizar(
    id: string,
    datos: {
      nombreTienda?: string;
      descripcionTienda?: string | null;
      moneda?: Moneda;
      impuestos?: ConfiguracionImpuestos;
      direccion?: DireccionTienda;
      contacto?: ContactoTienda;
      configuracionEnvio?: ConfiguracionEnvio;
      configuracionPagos?: ConfiguracionPagos;
      configuracionGeneral?: ConfiguracionGeneral;
      configuracionFacturacion?: ConfiguracionFacturacion;
      fechaActualizacion: Date;
    },
  ): Promise<void> {
    const updateData: any = {
      fecha_actualizacion: datos.fechaActualizacion,
    };

    if (datos.nombreTienda !== undefined) updateData.nombre_tienda = datos.nombreTienda;
    if (datos.descripcionTienda !== undefined) updateData.descripcion_tienda = datos.descripcionTienda;
    if (datos.moneda !== undefined) updateData.moneda = datos.moneda;
    if (datos.impuestos !== undefined) updateData.impuestos = datos.impuestos;
    if (datos.direccion !== undefined) updateData.direccion = datos.direccion;
    if (datos.contacto !== undefined) updateData.contacto = datos.contacto;
    if (datos.configuracionEnvio !== undefined) updateData.configuracion_envio = datos.configuracionEnvio;
    if (datos.configuracionPagos !== undefined) updateData.configuracion_pagos = datos.configuracionPagos;
    if (datos.configuracionGeneral !== undefined) updateData.configuracion_general = datos.configuracionGeneral;
    if (datos.configuracionFacturacion !== undefined) updateData.configuracion_facturacion = datos.configuracionFacturacion;

    await this.prisma.configuracionTienda.update({
      where: { id },
      data: updateData,
    });
  }

  /**
   * Elimina una configuración de tienda del sistema
   */
  async eliminar(id: string): Promise<void> {
    await this.prisma.configuracionTienda.delete({
      where: { id },
    });
  }

  /**
   * Activa una configuración específica como la configuración activa de la tienda
   */
  async activarConfiguracion(id: string): Promise<void> {
    // Primero desactivar todas las configuraciones
    await this.prisma.configuracionTienda.updateMany({
      where: { activa: true },
      data: { activa: false },
    });

    // Activar la configuración específica
    await this.prisma.configuracionTienda.update({
      where: { id },
      data: { activa: true, fecha_actualizacion: new Date() },
    });
  }

  /**
   * Obtiene el historial de configuraciones de la tienda
   */
  async obtenerHistorial(filtros: {
    pagina: number;
    limite: number;
  }): Promise<{
    configuraciones: Array<{
      id: string;
      nombreTienda: string;
      fechaCreacion: Date;
      fechaActualizacion: Date;
      activa: boolean;
    }>;
    total: number;
  }> {
    const skip = (filtros.pagina - 1) * filtros.limite;

    const [configuraciones, total] = await Promise.all([
      this.prisma.configuracionTienda.findMany({
        skip,
        take: filtros.limite,
        orderBy: {
          fecha_creacion: 'desc',
        },
        select: {
          id: true,
          nombre_tienda: true,
          fecha_creacion: true,
          fecha_actualizacion: true,
          activa: true,
        },
      }),
      this.prisma.configuracionTienda.count(),
    ]);

    return {
      configuraciones: configuraciones.map(config => ({
        id: config.id,
        nombreTienda: config.nombre_tienda,
        fechaCreacion: config.fecha_creacion,
        fechaActualizacion: config.fecha_actualizacion,
        activa: config.activa,
      })),
      total,
    };
  }

  /**
   * Verifica si existe una configuración con el mismo nombre
   */
  async existeNombre(nombre: string, idExcluir?: string): Promise<boolean> {
    const where: any = {
      nombre_tienda: nombre,
    };

    if (idExcluir) {
      where.id = { not: idExcluir };
    }

    const count = await this.prisma.configuracionTienda.count({ where });
    return count > 0;
  }

  /**
   * Obtiene estadísticas de configuraciones
   */
  async obtenerEstadisticas(): Promise<{
    totalConfiguraciones: number;
    configuracionActiva: string | null;
    ultimaActualizacion: Date | null;
  }> {
    const [
      totalConfiguraciones,
      configuracionActiva,
      ultimaActualizacion,
    ] = await Promise.all([
      this.prisma.configuracionTienda.count(),
      this.prisma.configuracionTienda.findFirst({
        where: { activa: true },
        select: { nombre_tienda: true },
      }),
      this.prisma.configuracionTienda.findFirst({
        orderBy: { fecha_actualizacion: 'desc' },
        select: { fecha_actualizacion: true },
      }),
    ]);

    return {
      totalConfiguraciones,
      configuracionActiva: configuracionActiva?.nombre_tienda || null,
      ultimaActualizacion: ultimaActualizacion?.fecha_actualizacion || null,
    };
  }

  /**
   * Restaura una configuración anterior como la configuración activa
   */
  async restaurarConfiguracion(id: string): Promise<void> {
    await this.activarConfiguracion(id);
  }

  /**
   * Obtiene la configuración por defecto del sistema
   */
  async obtenerConfiguracionPorDefecto(): Promise<{
    nombreTienda: string;
    moneda: Moneda;
    impuestos: ConfiguracionImpuestos;
    direccion: DireccionTienda;
    contacto: ContactoTienda;
    configuracionEnvio: ConfiguracionEnvio;
    configuracionPagos: ConfiguracionPagos;
    configuracionGeneral: ConfiguracionGeneral;
    configuracionFacturacion: ConfiguracionFacturacion;
  }> {
    // Configuración por defecto del sistema
    return {
      nombreTienda: 'Mi Tienda Online',
      moneda: {
        codigo: 'USD',
        simbolo: '$',
        decimales: 2,
      },
      impuestos: {
        impuestoVenta: 0,
        incluirImpuestosEnPrecios: false,
      },
      direccion: {
        calle: 'Calle Principal 123',
        ciudad: 'Ciudad',
        codigoPostal: '12345',
        pais: 'País',
      },
      contacto: {
        email: 'contacto@mitienda.com',
        telefono: '+1 234 567 8900',
        sitioWeb: 'https://mitienda.com',
      },
      configuracionEnvio: {
        costoEnvioGratisMinimo: 100,
        tiempoProcesamientoDias: 2,
        politicasEnvio: 'Envío estándar en 3-5 días hábiles',
      },
      configuracionPagos: {
        metodosPagoAceptados: ['TARJETA_CREDITO', 'PAYPAL'],
        monedaPorDefecto: 'USD',
      },
      configuracionGeneral: {
        zonaHoraria: 'America/Lima',
        idioma: 'es',
        mantenimiento: false,
        mensajeMantenimiento: 'Estamos en mantenimiento, volveremos pronto.',
        terminosServicio: 'Términos de servicio de la tienda',
        politicaPrivacidad: 'Política de privacidad de la tienda',
        nombreTienda: 'Mi Tienda Online',
        correoContacto: 'contacto@mitienda.com',
        telefonoContacto: '+1234567890',
        direccionFacturacion: 'Calle Principal 123, Ciudad, País',
        monedaPredeterminada: 'USD',
        regionRespaldo: 'Estados Unidos',
        sistemaUnidades: 'Métrico',
        unidadPeso: 'kg',
        prefijoPedido: 'ORD',
        sufijoPedido: 'SHOP',
        procesarPedidoAutomaticamente: 'Sí - todos los artículos',
        archivarPedidoAutomaticamente: true,
      },
      configuracionFacturacion: {
        nombre_empresa: 'Mi Tienda Online S.A.',
        direccion_fiscal: {
          calle: 'Calle Principal 123',
          ciudad: 'Ciudad',
          region: 'Estado',
          pais: 'País',
          codigo_postal: '12345',
        },
        email_facturacion: 'facturacion@mitienda.com',
        telefono_contacto: '+1234567890',
        id_fiscal: '12345678901',
        metodos_pago: [
          {
            tipo_metodo: 'tarjeta de crédito',
            datos_metodo: {
              ultimos_digitos: '4242',
              banco_emisor: 'Visa',
              fecha_expiracion: '12/25',
            },
            estado_activo: true,
            fecha_registro: new Date().toISOString(),
          },
        ],
        ciclo_facturacion: 'mensual',
        fecha_proxima: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        historial_facturas: [],
        notificaciones: {
          email_destinatario: 'admin@mitienda.com',
          frecuencia: 'antes de vencimiento',
          estado_envio: true,
        },
      },
    };
  }
}