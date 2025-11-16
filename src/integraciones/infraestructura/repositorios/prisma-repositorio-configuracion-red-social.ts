import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import type { RepositorioConfiguracionRedSocial } from '../../dominio/interfaces/repositorio-configuracion-red-social.interface';
import { ConfiguracionRedSocial, ProductoRedSocial } from '../../dominio/entidades/configuracion-red-social.entity';
import { TipoRedSocial } from '../../dominio/enums/tipo-red-social.enum';

/**
 * Implementación del repositorio de configuración de red social usando Prisma
 * Gestiona todas las operaciones de base de datos para las configuraciones de redes sociales
 */
@Injectable()
export class PrismaRepositorioConfiguracionRedSocial implements RepositorioConfiguracionRedSocial {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Guarda una nueva configuración de red social
   * @param configuracion - Entidad de configuración a guardar
   * @returns La configuración guardada
   */
  async guardar(configuracion: ConfiguracionRedSocial): Promise<ConfiguracionRedSocial> {
    const configuracionPrisma = await this.prisma.configuracionRedSocial.create({
      data: {
        id: configuracion.id,
        tienda_id: configuracion.tienda_id,
        tipo_red_social: configuracion.tipo_red_social,
        nombre_cuenta: configuracion.nombre_cuenta,
        token_acceso: configuracion.token_acceso,
        token_renovacion: configuracion.token_renovacion,
        fecha_expiracion_token: configuracion.fecha_expiracion_token,
        configuracion_adicional: configuracion.configuracion_adicional,
        activa: configuracion.activa,
        fecha_creacion: configuracion.fecha_creacion,
        fecha_actualizacion: configuracion.fecha_actualizacion,
      },
      include: {
        productos_sincronizados: true,
      },
    });

    return this.mapearPrismaAConfiguracion(configuracionPrisma);
  }

  /**
   * Busca una configuración por su ID
   * @param id - ID de la configuración
   * @returns La configuración encontrada o null
   */
  async buscarPorId(id: string): Promise<ConfiguracionRedSocial | null> {
    const configuracionPrisma = await this.prisma.configuracionRedSocial.findUnique({
      where: { id },
      include: {
        productos_sincronizados: true,
      },
    });

    if (!configuracionPrisma) {
      return null;
    }

    return this.mapearPrismaAConfiguracion(configuracionPrisma);
  }

  /**
   * Busca configuraciones por ID de tienda
   * @param tienda_id - ID de la tienda
   * @returns Lista de configuraciones de la tienda
   */
  async buscarPorTienda(tienda_id: string): Promise<ConfiguracionRedSocial[]> {
    const configuracionesPrisma = await this.prisma.configuracionRedSocial.findMany({
      where: { tienda_id },
      include: {
        productos_sincronizados: true,
      },
      orderBy: {
        fecha_creacion: 'desc',
      },
    });

    return configuracionesPrisma.map(config => this.mapearPrismaAConfiguracion(config));
  }

  /**
   * Busca configuraciones por tipo de red social
   * @param tipo_red_social - Tipo de red social
   * @returns Lista de configuraciones del tipo especificado
   */
  async buscarPorTipoRedSocial(tipo_red_social: TipoRedSocial): Promise<ConfiguracionRedSocial[]> {
    const configuracionesPrisma = await this.prisma.configuracionRedSocial.findMany({
      where: { tipo_red_social },
      include: {
        productos_sincronizados: true,
      },
      orderBy: {
        fecha_creacion: 'desc',
      },
    });

    return configuracionesPrisma.map(config => this.mapearPrismaAConfiguracion(config));
  }

  /**
   * Busca configuraciones activas por tienda
   * @param tienda_id - ID de la tienda
   * @returns Lista de configuraciones activas de la tienda
   */
  async buscarActivasPorTienda(tienda_id: string): Promise<ConfiguracionRedSocial[]> {
    const configuracionesPrisma = await this.prisma.configuracionRedSocial.findMany({
      where: { 
        tienda_id,
        activa: true,
      },
      include: {
        productos_sincronizados: true,
      },
      orderBy: {
        fecha_creacion: 'desc',
      },
    });

    return configuracionesPrisma.map(config => this.mapearPrismaAConfiguracion(config));
  }

  /**
   * Busca una configuración activa por tienda y tipo de red social
   * @param tienda_id - ID de la tienda
   * @param tipo_red_social - Tipo de red social
   * @returns La configuración encontrada o null
   */
  async buscarActivaPorTiendaYTipo(tienda_id: string, tipo_red_social: TipoRedSocial): Promise<ConfiguracionRedSocial | null> {
    const configuracionPrisma = await this.prisma.configuracionRedSocial.findFirst({
      where: { 
        tienda_id,
        tipo_red_social,
        activa: true,
      },
      include: {
        productos_sincronizados: true,
      },
    });

    if (!configuracionPrisma) {
      return null;
    }

    return this.mapearPrismaAConfiguracion(configuracionPrisma);
  }

  /**
   * Actualiza una configuración existente
   * @param configuracion - Entidad de configuración con datos actualizados
   * @returns La configuración actualizada
   */
  async actualizar(configuracion: ConfiguracionRedSocial): Promise<ConfiguracionRedSocial> {
    const configuracionPrisma = await this.prisma.configuracionRedSocial.update({
      where: { id: configuracion.id },
      data: {
        tienda_id: configuracion.tienda_id,
        tipo_red_social: configuracion.tipo_red_social,
        nombre_cuenta: configuracion.nombre_cuenta,
        token_acceso: configuracion.token_acceso,
        token_renovacion: configuracion.token_renovacion,
        fecha_expiracion_token: configuracion.fecha_expiracion_token,
        configuracion_adicional: configuracion.configuracion_adicional,
        activa: configuracion.activa,
        fecha_actualizacion: configuracion.fecha_actualizacion,
      },
      include: {
        productos_sincronizados: true,
      },
    });

    return this.mapearPrismaAConfiguracion(configuracionPrisma);
  }

  /**
   * Elimina una configuración por su ID
   * @param id - ID de la configuración a eliminar
   */
  async eliminar(id: string): Promise<void> {
    await this.prisma.configuracionRedSocial.delete({
      where: { id },
    });
  }

  /**
   * Desactiva una configuración
   * @param id - ID de la configuración a desactivar
   * @returns La configuración actualizada
   */
  async desactivar(id: string): Promise<ConfiguracionRedSocial> {
    const configuracionPrisma = await this.prisma.configuracionRedSocial.update({
      where: { id },
      data: {
        activa: false,
        fecha_actualizacion: new Date(),
      },
      include: {
        productos_sincronizados: true,
      },
    });

    return this.mapearPrismaAConfiguracion(configuracionPrisma);
  }

  /**
   * Activa una configuración
   * @param id - ID de la configuración a activar
   * @returns La configuración actualizada
   */
  async activar(id: string): Promise<ConfiguracionRedSocial> {
    const configuracionPrisma = await this.prisma.configuracionRedSocial.update({
      where: { id },
      data: {
        activa: true,
        fecha_actualizacion: new Date(),
      },
      include: {
        productos_sincronizados: true,
      },
    });

    return this.mapearPrismaAConfiguracion(configuracionPrisma);
  }

  /**
   * Verifica si existe una configuración activa para una tienda y tipo de red social
   * @param tienda_id - ID de la tienda
   * @param tipo_red_social - Tipo de red social
   * @returns true si existe una configuración activa
   */
  async existeActivaPorTiendaYTipo(tienda_id: string, tipo_red_social: TipoRedSocial): Promise<boolean> {
    const configuracion = await this.prisma.configuracionRedSocial.findFirst({
      where: { 
        tienda_id,
        tipo_red_social,
        activa: true,
      },
    });

    return !!configuracion;
  }

  /**
   * Verifica si existe una configuración con el mismo nombre de cuenta para el mismo tipo de red social
   * @param nombre_cuenta - Nombre de la cuenta
   * @param tipo_red_social - Tipo de red social
   * @returns true si existe una configuración con el mismo nombre de cuenta
   */
  async existeConNombreCuenta(nombre_cuenta: string, tipo_red_social: TipoRedSocial): Promise<boolean> {
    const configuracion = await this.prisma.configuracionRedSocial.findFirst({
      where: { 
        nombre_cuenta,
        tipo_red_social,
      },
    });

    return !!configuracion;
  }

  /**
   * Guarda un producto sincronizado
   * @param productoSincronizado - Entidad de producto sincronizado a guardar
   * @returns El producto sincronizado guardado
   */
  async guardarProductoSincronizado(productoSincronizado: ProductoRedSocial): Promise<ProductoRedSocial> {
    const productoSincronizadoPrisma = await this.prisma.productoRedSocial.create({
      data: {
        id: productoSincronizado.id,
        configuracion_red_social_id: productoSincronizado.configuracion_red_social_id,
        producto_id: productoSincronizado.producto_id,
        id_externo: productoSincronizado.id_externo,
        datos_externos: productoSincronizado.datos_externos,
        fecha_sincronizacion: productoSincronizado.fecha_sincronizacion,
        fecha_actualizacion: productoSincronizado.fecha_actualizacion,
        estado: productoSincronizado.estado,
      },
    });

    return this.mapearPrismaAProductoSincronizado(productoSincronizadoPrisma);
  }

  /**
   * Busca un producto sincronizado por su ID
   * @param id - ID del producto sincronizado
   * @returns El producto sincronizado encontrado o null
   */
  async buscarProductoSincronizadoPorId(id: string): Promise<ProductoRedSocial | null> {
    const productoSincronizadoPrisma = await this.prisma.productoRedSocial.findUnique({
      where: { id },
    });

    if (!productoSincronizadoPrisma) {
      return null;
    }

    return this.mapearPrismaAProductoSincronizado(productoSincronizadoPrisma);
  }

  /**
   * Busca productos sincronizados por ID de configuración de red social
   * @param configuracion_red_social_id - ID de la configuración de red social
   * @returns Lista de productos sincronizados de la configuración
   */
  async buscarProductosSincronizadosPorConfiguracion(configuracion_red_social_id: string): Promise<ProductoRedSocial[]> {
    const productosSincronizadosPrisma = await this.prisma.productoRedSocial.findMany({
      where: { configuracion_red_social_id },
      orderBy: {
        fecha_sincronizacion: 'desc',
      },
    });

    return productosSincronizadosPrisma.map(producto => this.mapearPrismaAProductoSincronizado(producto));
  }

  /**
   * Busca productos sincronizados por ID de producto
   * @param producto_id - ID del producto
   * @returns Lista de productos sincronizados del producto
   */
  async buscarProductosSincronizadosPorProducto(producto_id: string): Promise<ProductoRedSocial[]> {
    const productosSincronizadosPrisma = await this.prisma.productoRedSocial.findMany({
      where: { producto_id },
      orderBy: {
        fecha_sincronizacion: 'desc',
      },
    });

    return productosSincronizadosPrisma.map(producto => this.mapearPrismaAProductoSincronizado(producto));
  }

  /**
   * Busca un producto sincronizado por ID de configuración y ID de producto
   * @param configuracion_red_social_id - ID de la configuración de red social
   * @param producto_id - ID del producto
   * @returns El producto sincronizado encontrado o null
   */
  async buscarProductoSincronizadoPorConfiguracionYProducto(
    configuracion_red_social_id: string,
    producto_id: string
  ): Promise<ProductoRedSocial | null> {
    const productoSincronizadoPrisma = await this.prisma.productoRedSocial.findFirst({
      where: { 
        configuracion_red_social_id,
        producto_id,
      },
    });

    if (!productoSincronizadoPrisma) {
      return null;
    }

    return this.mapearPrismaAProductoSincronizado(productoSincronizadoPrisma);
  }

  /**
   * Actualiza un producto sincronizado existente
   * @param productoSincronizado - Entidad de producto sincronizado con datos actualizados
   * @returns El producto sincronizado actualizado
   */
  async actualizarProductoSincronizado(productoSincronizado: ProductoRedSocial): Promise<ProductoRedSocial> {
    const productoSincronizadoPrisma = await this.prisma.productoRedSocial.update({
      where: { id: productoSincronizado.id },
      data: {
        configuracion_red_social_id: productoSincronizado.configuracion_red_social_id,
        producto_id: productoSincronizado.producto_id,
        id_externo: productoSincronizado.id_externo,
        datos_externos: productoSincronizado.datos_externos,
        fecha_sincronizacion: productoSincronizado.fecha_sincronizacion,
        fecha_actualizacion: productoSincronizado.fecha_actualizacion,
        estado: productoSincronizado.estado,
      },
    });

    return this.mapearPrismaAProductoSincronizado(productoSincronizadoPrisma);
  }

  /**
   * Elimina un producto sincronizado por su ID
   * @param id - ID del producto sincronizado a eliminar
   */
  async eliminarProductoSincronizado(id: string): Promise<void> {
    await this.prisma.productoRedSocial.delete({
      where: { id },
    });
  }

  /**
   * Elimina todos los productos sincronizados de una configuración de red social
   * @param configuracion_red_social_id - ID de la configuración de red social
   */
  async eliminarProductosSincronizadosPorConfiguracion(configuracion_red_social_id: string): Promise<void> {
    await this.prisma.productoRedSocial.deleteMany({
      where: { configuracion_red_social_id },
    });
  }

  /**
   * Busca configuraciones con tokens próximos a expirar
   * @param horas - Horas antes de la expiración para considerar próximo a expirar (default: 24)
   * @returns Lista de configuraciones con tokens próximos a expirar
   */
  async buscarConTokensProximosAExpiracion(horas: number = 24): Promise<ConfiguracionRedSocial[]> {
    const fechaLimite = new Date();
    fechaLimite.setHours(fechaLimite.getHours() + horas);

    const configuracionesPrisma = await this.prisma.configuracionRedSocial.findMany({
      where: {
        fecha_expiracion_token: {
          lte: fechaLimite,
          not: null,
        },
        activa: true,
      },
      include: {
        productos_sincronizados: true,
      },
    });

    return configuracionesPrisma.map(config => this.mapearPrismaAConfiguracion(config));
  }

  /**
   * Actualiza los tokens de una configuración
   * @param id - ID de la configuración
   * @param token_acceso - Nuevo token de acceso
   * @param token_renovacion - Nuevo token de renovación
   * @param fecha_expiracion - Nueva fecha de expiración
   * @returns La configuración actualizada
   */
  async actualizarTokens(
    id: string,
    token_acceso: string,
    token_renovacion: string | null,
    fecha_expiracion: Date
  ): Promise<ConfiguracionRedSocial> {
    const configuracionPrisma = await this.prisma.configuracionRedSocial.update({
      where: { id },
      data: {
        token_acceso,
        token_renovacion,
        fecha_expiracion_token: fecha_expiracion,
        fecha_actualizacion: new Date(),
      },
      include: {
        productos_sincronizados: true,
      },
    });

    return this.mapearPrismaAConfiguracion(configuracionPrisma);
  }

  /**
   * Mapea un objeto Prisma a una entidad ConfiguracionRedSocial del dominio
   * @param configuracionPrisma - Objeto Prisma de configuración
   * @returns Entidad ConfiguracionRedSocial del dominio
   */
  private mapearPrismaAConfiguracion(configuracionPrisma: any): ConfiguracionRedSocial {
    const productosSincronizados = configuracionPrisma.productos_sincronizados?.map(
      (producto: any) => this.mapearPrismaAProductoSincronizado(producto)
    ) || [];

    return new ConfiguracionRedSocial(
      configuracionPrisma.id,
      configuracionPrisma.tienda_id,
      configuracionPrisma.tipo_red_social as TipoRedSocial,
      configuracionPrisma.nombre_cuenta,
      configuracionPrisma.token_acceso,
      configuracionPrisma.token_renovacion,
      configuracionPrisma.fecha_expiracion_token,
      configuracionPrisma.configuracion_adicional as Record<string, any>,
      configuracionPrisma.activa,
      configuracionPrisma.fecha_creacion,
      configuracionPrisma.fecha_actualizacion,
      productosSincronizados
    );
  }

  /**
   * Mapea un objeto Prisma a una entidad ProductoRedSocial del dominio
   * @param productoSincronizadoPrisma - Objeto Prisma de producto sincronizado
   * @returns Entidad ProductoRedSocial del dominio
   */
  private mapearPrismaAProductoSincronizado(productoSincronizadoPrisma: any): ProductoRedSocial {
    return new ProductoRedSocial(
      productoSincronizadoPrisma.id,
      productoSincronizadoPrisma.configuracion_red_social_id,
      productoSincronizadoPrisma.producto_id,
      productoSincronizadoPrisma.id_externo,
      productoSincronizadoPrisma.datos_externos as Record<string, any>,
      productoSincronizadoPrisma.fecha_sincronizacion,
      productoSincronizadoPrisma.fecha_actualizacion,
      productoSincronizadoPrisma.estado as 'ACTIVO' | 'INACTIVO' | 'ERROR'
    );
  }
}