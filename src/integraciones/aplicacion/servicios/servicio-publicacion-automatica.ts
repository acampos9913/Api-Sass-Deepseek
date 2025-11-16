import { Injectable, Inject } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { TipoRedSocial } from '../../dominio/enums/tipo-red-social.enum';
import { ProductoRedSocial } from '../../dominio/entidades/configuracion-red-social.entity';
import type {
  DatosProductoParaPublicacion,
  ResultadoPublicacion
} from '../../dominio/interfaces/adaptador-red-social.interface';
import type { RepositorioConfiguracionRedSocial } from '../../dominio/interfaces/repositorio-configuracion-red-social.interface';
import type { AdaptadorRedSocial } from '../../dominio/interfaces/adaptador-red-social.interface';

/**
 * Servicio que orquesta la publicación automática de productos en redes sociales
 * Se ejecuta cuando se crea o actualiza un producto en el sistema
 */
@Injectable()
export class ServicioPublicacionAutomatica {
  private readonly adaptadores: Map<TipoRedSocial, AdaptadorRedSocial> = new Map();

  constructor(
    private readonly httpService: HttpService,
    @Inject('RepositorioConfiguracionRedSocial')
    private readonly repositorioConfiguracion: RepositorioConfiguracionRedSocial,
  ) {}

  /**
   * Registra un adaptador para una red social específica
   */
  registrarAdaptador(tipo: TipoRedSocial, adaptador: AdaptadorRedSocial): void {
    this.adaptadores.set(tipo, adaptador);
  }

  /**
   * Publica automáticamente un producto en todas las redes sociales configuradas
   * @param producto - Datos del producto a publicar
   * @param tiendaId - ID de la tienda
   * @returns Resultados de publicación por red social
   */
  async publicarProductoEnRedesSociales(
    producto: DatosProductoParaPublicacion,
    tiendaId: string
  ): Promise<Map<TipoRedSocial, ResultadoPublicacion>> {
    const resultados = new Map<TipoRedSocial, ResultadoPublicacion>();

    try {
      // Obtener todas las configuraciones activas para esta tienda
      const configuraciones = await this.repositorioConfiguracion.buscarActivasPorTienda(tiendaId);

      for (const configuracion of configuraciones) {
        const adaptador = this.adaptadores.get(configuracion.tipo_red_social);
        
        if (!adaptador) {
          console.warn(`No hay adaptador registrado para ${configuracion.tipo_red_social}`);
          continue;
        }

        try {
          // Publicar el producto en la red social
          const resultado = await adaptador.publicarProducto(
            producto,
            configuracion.token_acceso,
            configuracion.configuracion_adicional
          );

          resultados.set(configuracion.tipo_red_social, resultado);

          // Si la publicación fue exitosa, registrar el producto sincronizado
          if (resultado.exito && resultado.id_externo) {
            const productoSincronizado = ProductoRedSocial.crear({
              id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              configuracion_red_social_id: configuracion.id,
              producto_id: producto.id,
              id_externo: resultado.id_externo,
              datos_externos: {
                url_publicacion: resultado.url_publicacion,
                ...resultado.datos_adicionales
              }
            });
            await this.repositorioConfiguracion.guardarProductoSincronizado(productoSincronizado);
          }

          // Registrar el resultado en la configuración
          // TODO: Implementar registro de resultados de publicación
          // await this.repositorioConfiguracion.registrarResultadoPublicacion(
          //   configuracion.id,
          //   resultado
          // );

        } catch (error) {
          console.error(`Error publicando en ${configuracion.tipo_red_social}:`, error);
          
          const resultadoError: ResultadoPublicacion = {
            exito: false,
            mensaje: `Error: ${error.message}`,
            fecha_publicacion: new Date(),
          };

          resultados.set(configuracion.tipo_red_social, resultadoError);

          // Registrar el error en la configuración
          // TODO: Implementar registro de resultados de publicación
          // await this.repositorioConfiguracion.registrarResultadoPublicacion(
          //   configuracion.id,
          //   resultadoError
          // );
        }
      }

      return resultados;

    } catch (error) {
      console.error('Error en publicación automática:', error);
      throw new Error(`Error al publicar producto en redes sociales: ${error.message}`);
    }
  }

  /**
   * Actualiza un producto en todas las redes sociales donde fue publicado
   * @param productoId - ID del producto en el sistema
   * @param producto - Datos actualizados del producto
   * @param tiendaId - ID de la tienda
   * @param configuracionIds - IDs específicos de configuraciones para actualizar (opcional)
   * @returns Resultados de actualización por red social
   */
  async actualizarProductoEnRedesSociales(
    productoId: string,
    producto: DatosProductoParaPublicacion,
    tiendaId: string,
    configuracionIds?: string[]
  ): Promise<Map<TipoRedSocial, ResultadoPublicacion>> {
    const resultados = new Map<TipoRedSocial, ResultadoPublicacion>();

    try {
      // Obtener todos los productos sincronizados para este producto
      const productosSincronizados = await this.repositorioConfiguracion.buscarProductosSincronizadosPorProducto(productoId);

      for (const productoSincronizado of productosSincronizados) {
        const configuracion = await this.repositorioConfiguracion.buscarPorId(productoSincronizado.configuracion_red_social_id);
        
        if (!configuracion || !configuracion.activa) {
          continue;
        }

        // Si se especificaron configuraciones específicas, filtrar por ellas
        if (configuracionIds && configuracionIds.length > 0) {
          if (!configuracionIds.includes(configuracion.id)) {
            continue;
          }
        }

        const adaptador = this.adaptadores.get(configuracion.tipo_red_social);
        
        if (!adaptador) {
          console.warn(`No hay adaptador registrado para ${configuracion.tipo_red_social}`);
          continue;
        }

        try {
          // Actualizar el producto en la red social
          const resultado = await adaptador.actualizarProducto(
            productoSincronizado.id_externo,
            producto,
            configuracion.token_acceso,
            configuracion.configuracion_adicional
          );

          resultados.set(configuracion.tipo_red_social, resultado);

          // Registrar el resultado en la configuración
          // TODO: Implementar registro de resultados de publicación
          // await this.repositorioConfiguracion.registrarResultadoPublicacion(
          //   configuracion.id,
          //   resultado
          // );

        } catch (error) {
          console.error(`Error actualizando en ${configuracion.tipo_red_social}:`, error);
          
          const resultadoError: ResultadoPublicacion = {
            exito: false,
            mensaje: `Error: ${error.message}`,
            fecha_publicacion: new Date(),
          };

          resultados.set(configuracion.tipo_red_social, resultadoError);

          // Registrar el error en la configuración
          // TODO: Implementar registro de resultados de publicación
          // await this.repositorioConfiguracion.registrarResultadoPublicacion(
          //   configuracion.id,
          //   resultadoError
          // );
        }
      }

      return resultados;

    } catch (error) {
      console.error('Error en actualización automática:', error);
      throw new Error(`Error al actualizar producto en redes sociales: ${error.message}`);
    }
  }

  /**
   * Elimina un producto de todas las redes sociales donde fue publicado
   * @param productoId - ID del producto en el sistema
   * @param tiendaId - ID de la tienda
   * @param configuracionIds - IDs específicos de configuraciones para eliminar (opcional)
   * @returns Resultados de eliminación por red social
   */
  async eliminarProductoDeRedesSociales(
    productoId: string,
    tiendaId: string,
    configuracionIds?: string[]
  ): Promise<Map<TipoRedSocial, ResultadoPublicacion>> {
    const resultados = new Map<TipoRedSocial, ResultadoPublicacion>();

    try {
      // Obtener todos los productos sincronizados para este producto
      const productosSincronizados = await this.repositorioConfiguracion.buscarProductosSincronizadosPorProducto(productoId);

      for (const productoSincronizado of productosSincronizados) {
        const configuracion = await this.repositorioConfiguracion.buscarPorId(productoSincronizado.configuracion_red_social_id);
        
        if (!configuracion) {
          continue;
        }

        // Si se especificaron configuraciones específicas, filtrar por ellas
        if (configuracionIds && configuracionIds.length > 0) {
          if (!configuracionIds.includes(configuracion.id)) {
            continue;
          }
        }

        const adaptador = this.adaptadores.get(configuracion.tipo_red_social);
        
        if (!adaptador) {
          console.warn(`No hay adaptador registrado para ${configuracion.tipo_red_social}`);
          continue;
        }

        try {
          // Eliminar el producto de la red social
          const resultado = await adaptador.eliminarProducto(
            productoSincronizado.id_externo,
            configuracion.token_acceso,
            configuracion.configuracion_adicional
          );

          resultados.set(configuracion.tipo_red_social, resultado);

          // Actualizar el estado del producto sincronizado
          productoSincronizado.cambiarEstado('INACTIVO');
          await this.repositorioConfiguracion.actualizarProductoSincronizado(productoSincronizado);

          // Registrar el resultado en la configuración
          // TODO: Implementar registro de resultados de publicación
          // await this.repositorioConfiguracion.registrarResultadoPublicacion(
          //   configuracion.id,
          //   resultado
          // );

        } catch (error) {
          console.error(`Error eliminando de ${configuracion.tipo_red_social}:`, error);
          
          const resultadoError: ResultadoPublicacion = {
            exito: false,
            mensaje: `Error: ${error.message}`,
            fecha_publicacion: new Date(),
          };

          resultados.set(configuracion.tipo_red_social, resultadoError);

          // Registrar el error en la configuración
          // TODO: Implementar registro de resultados de publicación
          // await this.repositorioConfiguracion.registrarResultadoPublicacion(
          //   configuracion.id,
          //   resultadoError
          // );
        }
      }

      return resultados;

    } catch (error) {
      console.error('Error en eliminación automática:', error);
      throw new Error(`Error al eliminar producto de redes sociales: ${error.message}`);
    }
  }

  /**
   * Valida todas las configuraciones activas para una tienda
   * @param tiendaId - ID de la tienda
   * @returns Resultados de validación por red social
   */
  async validarConfiguraciones(tiendaId: string): Promise<
    Map<TipoRedSocial, {
      valido: boolean;
      mensaje?: string;
      permisos?: string[];
      datosCuenta?: Record<string, any>;
    }>
  > {
    const resultados = new Map();

    try {
      const configuraciones = await this.repositorioConfiguracion.buscarActivasPorTienda(tiendaId);

      for (const configuracion of configuraciones) {
        const adaptador = this.adaptadores.get(configuracion.tipo_red_social);
        
        if (!adaptador) {
          resultados.set(configuracion.tipo_red_social, {
            valido: false,
            mensaje: `No hay adaptador registrado para ${configuracion.tipo_red_social}`
          });
          continue;
        }

        try {
          const resultado = await adaptador.validarToken(configuracion.token_acceso);
          resultados.set(configuracion.tipo_red_social, resultado);

          // Actualizar el estado de la configuración basado en la validación
          if (!resultado.valido) {
            await this.repositorioConfiguracion.desactivar(configuracion.id);
          }

        } catch (error) {
          console.error(`Error validando configuración de ${configuracion.tipo_red_social}:`, error);
          
          resultados.set(configuracion.tipo_red_social, {
            valido: false,
            mensaje: `Error de validación: ${error.message}`
          });

          // Desactivar la configuración si hay error de validación
          await this.repositorioConfiguracion.desactivar(configuracion.id);
        }
      }

      return resultados;

    } catch (error) {
      console.error('Error en validación de configuraciones:', error);
      throw new Error(`Error al validar configuraciones: ${error.message}`);
    }
  }
  /**
   * Publica productos seleccionados en configuraciones específicas de redes sociales
   * @param productos - Array de productos a publicar
   * @param tiendaId - ID de la tienda
   * @param configuracionIds - IDs de configuraciones específicas donde publicar
   * @returns Resultados de publicación por producto y red social
   */
  async publicarProductosSeleccionadosEnRedesSociales(
    productos: DatosProductoParaPublicacion[],
    tiendaId: string,
    configuracionIds: string[]
  ): Promise<Map<string, Map<TipoRedSocial, ResultadoPublicacion>>> {
    const resultados = new Map<string, Map<TipoRedSocial, ResultadoPublicacion>>();

    try {
      // Obtener las configuraciones específicas
      const configuraciones = await Promise.all(
        configuracionIds.map(id => this.repositorioConfiguracion.buscarPorId(id))
      );

      const configuracionesValidas = configuraciones.filter(
        config => config && config.tienda_id === tiendaId && config.activa
      );

      for (const producto of productos) {
        const resultadosProducto = new Map<TipoRedSocial, ResultadoPublicacion>();

        for (const configuracion of configuracionesValidas) {
          // TypeScript ahora sabe que configuracion no es null por el filtro anterior
          const config = configuracion!;
          
          const adaptador = this.adaptadores.get(config.tipo_red_social);
          
          if (!adaptador) {
            console.warn(`No hay adaptador registrado para ${config.tipo_red_social}`);
            continue;
          }

          try {
            // Verificar si el producto ya está sincronizado
            const productoSincronizadoExistente = await this.repositorioConfiguracion
              .buscarProductoSincronizadoPorConfiguracionYProducto(config.id, producto.id);

            let resultado: ResultadoPublicacion;

            if (productoSincronizadoExistente) {
              // Actualizar producto existente
              resultado = await adaptador.actualizarProducto(
                productoSincronizadoExistente.id_externo,
                producto,
                config.token_acceso,
                config.configuracion_adicional
              );
            } else {
              // Publicar nuevo producto
              resultado = await adaptador.publicarProducto(
                producto,
                config.token_acceso,
                config.configuracion_adicional
              );

              // Registrar el producto sincronizado si la publicación fue exitosa
              if (resultado.exito && resultado.id_externo) {
                const productoSincronizado = ProductoRedSocial.crear({
                  id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                  configuracion_red_social_id: config.id,
                  producto_id: producto.id,
                  id_externo: resultado.id_externo,
                  datos_externos: {
                    url_publicacion: resultado.url_publicacion,
                    ...resultado.datos_adicionales
                  }
                });
                await this.repositorioConfiguracion.guardarProductoSincronizado(productoSincronizado);
              }
            }

            resultadosProducto.set(config.tipo_red_social, resultado);

          } catch (error) {
            console.error(`Error publicando producto ${producto.id} en ${config.tipo_red_social}:`, error);
            
            const resultadoError: ResultadoPublicacion = {
              exito: false,
              mensaje: `Error: ${error.message}`,
              fecha_publicacion: new Date(),
            };

            resultadosProducto.set(config.tipo_red_social, resultadoError);
          }
        }

        resultados.set(producto.id, resultadosProducto);
      }

      return resultados;

    } catch (error) {
      console.error('Error en publicación selectiva:', error);
      throw new Error(`Error al publicar productos seleccionados en redes sociales: ${error.message}`);
    }
  }
}