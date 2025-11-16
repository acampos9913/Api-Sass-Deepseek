import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpStatus,
  Inject
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { TipoRedSocial } from '../../dominio/enums/tipo-red-social.enum';
import { CrearConfiguracionRedSocialDto } from '../../aplicacion/dto/crear-configuracion-red-social.dto';
import { ServicioPublicacionAutomatica } from '../../aplicacion/servicios/servicio-publicacion-automatica';
import { CrearConfiguracionRedSocialCasoUso } from '../../dominio/casos-uso/crear-configuracion-red-social.caso-uso';
import type { RepositorioConfiguracionRedSocial } from '../../dominio/interfaces/repositorio-configuracion-red-social.interface';
import type { DatosProductoParaPublicacion } from '../../dominio/interfaces/adaptador-red-social.interface';

/**
 * Controlador para gestionar las integraciones con redes sociales
 * Proporciona endpoints para configurar, validar y gestionar la publicación automática de productos
 */
@ApiTags('Integraciones - Redes Sociales')
@Controller('api/v1/tiendas/:tiendaId/integraciones')
export class ControladorIntegraciones {
  constructor(
    @Inject('RepositorioConfiguracionRedSocial')
    private readonly repositorioConfiguracion: RepositorioConfiguracionRedSocial,
    private readonly servicioPublicacionAutomatica: ServicioPublicacionAutomatica,
    private readonly crearConfiguracionRedSocialCasoUso: CrearConfiguracionRedSocialCasoUso,
  ) {}

  /**
   * Obtiene todas las configuraciones de redes sociales para una tienda
   */
  @Get()
  @ApiOperation({ 
    summary: 'Obtener configuraciones de redes sociales',
    description: 'Retorna todas las configuraciones de integración con redes sociales para una tienda específica'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Lista de configuraciones obtenida exitosamente',
    schema: {
      example: {
        mensaje: 'Configuraciones obtenidas exitosamente',
        data: [
          {
            id: 'config_123',
            tienda_id: 'tienda_456',
            tipo_red_social: 'FACEBOOK',
            nombre_cuenta: 'Mi Tienda Facebook',
            activa: true,
            fecha_creacion: '2024-01-01T00:00:00.000Z',
            fecha_actualizacion: '2024-01-01T00:00:00.000Z'
          }
        ],
        tipo_mensaje: 'Exito',
        estado_respuesta: 200
      }
    }
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'No se encontraron configuraciones',
    schema: {
      example: {
        mensaje: 'No se encontraron configuraciones',
        data: [],
        tipo_mensaje: 'Exito',
        estado_respuesta: 200
      }
    }
  })
  async obtenerConfiguraciones(@Param('tiendaId') tiendaId: string) {
    const configuraciones = await this.repositorioConfiguracion.buscarPorTienda(tiendaId);
    
    return {
      mensaje: configuraciones.length > 0
        ? 'Configuraciones obtenidas exitosamente'
        : 'No se encontraron configuraciones',
      data: configuraciones,
      tipo_mensaje: 'Exito',
      estado_respuesta: HttpStatus.OK
    };
  }

  /**
   * Obtiene una configuración específica por ID
   */
  @Get(':configuracionId')
  @ApiOperation({ 
    summary: 'Obtener configuración específica',
    description: 'Retorna una configuración de integración específica por su ID'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Configuración obtenida exitosamente',
    schema: {
      example: {
        mensaje: 'Configuración obtenida exitosamente',
        data: {
          id: 'config_123',
          tienda_id: 'tienda_456',
          tipo_red_social: 'FACEBOOK',
          nombre_cuenta: 'Mi Tienda Facebook',
          activa: true,
          fecha_creacion: '2024-01-01T00:00:00.000Z',
          fecha_actualizacion: '2024-01-01T00:00:00.000Z'
        },
        tipo_mensaje: 'Exito',
        estado_respuesta: 200
      }
    }
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Configuración no encontrada',
    schema: {
      example: {
        mensaje: 'Configuración no encontrada',
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: 404
      }
    }
  })
  async obtenerConfiguracion(
    @Param('tiendaId') tiendaId: string,
    @Param('configuracionId') configuracionId: string
  ) {
    const configuracion = await this.repositorioConfiguracion.buscarPorId(configuracionId);
    
    if (!configuracion || configuracion.tienda_id !== tiendaId) {
      return {
        mensaje: 'Configuración no encontrada',
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: HttpStatus.NOT_FOUND
      };
    }

    return {
      mensaje: 'Configuración obtenida exitosamente',
      data: configuracion,
      tipo_mensaje: 'Exito',
      estado_respuesta: HttpStatus.OK
    };
  }

  /**
   * Crea una nueva configuración de integración con red social
   */
  @Post()
  @ApiOperation({ 
    summary: 'Crear configuración de red social',
    description: 'Crea una nueva configuración de integración con una red social específica'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Configuración creada exitosamente',
    schema: {
      example: {
        mensaje: 'Configuración creada exitosamente',
        data: {
          id: 'config_123',
          tienda_id: 'tienda_456',
          tipo_red_social: 'FACEBOOK',
          nombre_cuenta: 'Mi Tienda Facebook',
          activa: true,
          fecha_creacion: '2024-01-01T00:00:00.000Z',
          fecha_actualizacion: '2024-01-01T00:00:00.000Z'
        },
        tipo_mensaje: 'Exito',
        estado_respuesta: 200
      }
    }
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Ya existe una configuración activa para esta red social',
    schema: {
      example: {
        mensaje: 'Ya existe una configuración activa para Facebook en esta tienda',
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: 400
      }
    }
  })
  async crearConfiguracion(
    @Param('tiendaId') tiendaId: string,
    @Body() crearConfiguracionDto: CrearConfiguracionRedSocialDto
  ) {
    const datosCreacion = {
      ...crearConfiguracionDto,
      tienda_id: tiendaId
    };
    
    return await this.crearConfiguracionRedSocialCasoUso.ejecutar(datosCreacion);
  }

  /**
   * Actualiza una configuración existente
   */
  @Put(':configuracionId')
  @ApiOperation({ 
    summary: 'Actualizar configuración de red social',
    description: 'Actualiza una configuración de integración existente'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Configuración actualizada exitosamente',
    schema: {
      example: {
        mensaje: 'Configuración actualizada exitosamente',
        data: {
          id: 'config_123',
          tienda_id: 'tienda_456',
          tipo_red_social: 'FACEBOOK',
          nombre_cuenta: 'Mi Tienda Facebook Actualizada',
          activa: true,
          fecha_creacion: '2024-01-01T00:00:00.000Z',
          fecha_actualizacion: '2024-01-02T00:00:00.000Z'
        },
        tipo_mensaje: 'Exito',
        estado_respuesta: 200
      }
    }
  })
  async actualizarConfiguracion(
    @Param('tiendaId') tiendaId: string,
    @Param('configuracionId') configuracionId: string,
    @Body() actualizarConfiguracionDto: Partial<CrearConfiguracionRedSocialDto>
  ) {
    const configuracionExistente = await this.repositorioConfiguracion.buscarPorId(configuracionId);
    
    if (!configuracionExistente || configuracionExistente.tienda_id !== tiendaId) {
      return {
        mensaje: 'Configuración no encontrada',
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: HttpStatus.NOT_FOUND
      };
    }

    // Actualizar los campos permitidos
    if (actualizarConfiguracionDto.nombre_cuenta !== undefined) {
      (configuracionExistente as any).nombre_cuenta = actualizarConfiguracionDto.nombre_cuenta;
    }

    if (actualizarConfiguracionDto.token_acceso !== undefined) {
      (configuracionExistente as any).token_acceso = actualizarConfiguracionDto.token_acceso;
    }

    if (actualizarConfiguracionDto.token_renovacion !== undefined) {
      (configuracionExistente as any).token_renovacion = actualizarConfiguracionDto.token_renovacion;
    }

    if (actualizarConfiguracionDto.fecha_expiracion_token !== undefined) {
      (configuracionExistente as any).fecha_expiracion_token = actualizarConfiguracionDto.fecha_expiracion_token;
    }

    if (actualizarConfiguracionDto.configuracion_adicional !== undefined) {
      configuracionExistente.actualizarConfiguracionAdicional(actualizarConfiguracionDto.configuracion_adicional);
    }

    // Actualizar fecha de actualización
    (configuracionExistente as any).fecha_actualizacion = new Date();

    const configuracionActualizada = await this.repositorioConfiguracion.actualizar(configuracionExistente);

    return {
      mensaje: 'Configuración actualizada exitosamente',
      data: configuracionActualizada,
      tipo_mensaje: 'Exito',
      estado_respuesta: HttpStatus.OK
    };
  }

  /**
   * Elimina una configuración de integración
   */
  @Delete(':configuracionId')
  @ApiOperation({ 
    summary: 'Eliminar configuración de red social',
    description: 'Elimina una configuración de integración y todos sus productos sincronizados'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Configuración eliminada exitosamente',
    schema: {
      example: {
        mensaje: 'Configuración eliminada exitosamente',
        data: null,
        tipo_mensaje: 'Exito',
        estado_respuesta: 200
      }
    }
  })
  async eliminarConfiguracion(
    @Param('tiendaId') tiendaId: string,
    @Param('configuracionId') configuracionId: string
  ) {
    const configuracion = await this.repositorioConfiguracion.buscarPorId(configuracionId);
    
    if (!configuracion || configuracion.tienda_id !== tiendaId) {
      return {
        mensaje: 'Configuración no encontrada',
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: HttpStatus.NOT_FOUND
      };
    }

    await this.repositorioConfiguracion.eliminar(configuracionId);

    return {
      mensaje: 'Configuración eliminada exitosamente',
      data: null,
      tipo_mensaje: 'Exito',
      estado_respuesta: HttpStatus.OK
    };
  }

  /**
   * Activa una configuración de integración
   */
  @Post(':configuracionId/activar')
  @ApiOperation({ 
    summary: 'Activar configuración de red social',
    description: 'Activa una configuración de integración previamente desactivada'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Configuración activada exitosamente',
    schema: {
      example: {
        mensaje: 'Configuración activada exitosamente',
        data: {
          id: 'config_123',
          activa: true
        },
        tipo_mensaje: 'Exito',
        estado_respuesta: 200
      }
    }
  })
  async activarConfiguracion(
    @Param('tiendaId') tiendaId: string,
    @Param('configuracionId') configuracionId: string
  ) {
    const configuracion = await this.repositorioConfiguracion.buscarPorId(configuracionId);
    
    if (!configuracion || configuracion.tienda_id !== tiendaId) {
      return {
        mensaje: 'Configuración no encontrada',
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: HttpStatus.NOT_FOUND
      };
    }

    const configuracionActivada = await this.repositorioConfiguracion.activar(configuracionId);

    return {
      mensaje: 'Configuración activada exitosamente',
      data: configuracionActivada,
      tipo_mensaje: 'Exito',
      estado_respuesta: HttpStatus.OK
    };
  }

  /**
   * Desactiva una configuración de integración
   */
  @Post(':configuracionId/desactivar')
  @ApiOperation({ 
    summary: 'Desactivar configuración de red social',
    description: 'Desactiva una configuración de integración activa'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Configuración desactivada exitosamente',
    schema: {
      example: {
        mensaje: 'Configuración desactivada exitosamente',
        data: {
          id: 'config_123',
          activa: false
        },
        tipo_mensaje: 'Exito',
        estado_respuesta: 200
      }
    }
  })
  async desactivarConfiguracion(
    @Param('tiendaId') tiendaId: string,
    @Param('configuracionId') configuracionId: string
  ) {
    const configuracion = await this.repositorioConfiguracion.buscarPorId(configuracionId);
    
    if (!configuracion || configuracion.tienda_id !== tiendaId) {
      return {
        mensaje: 'Configuración no encontrada',
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: HttpStatus.NOT_FOUND
      };
    }

    const configuracionDesactivada = await this.repositorioConfiguracion.desactivar(configuracionId);

    return {
      mensaje: 'Configuración desactivada exitosamente',
      data: configuracionDesactivada,
      tipo_mensaje: 'Exito',
      estado_respuesta: HttpStatus.OK
    };
  }

  /**
   * Valida todas las configuraciones activas de una tienda
   */
  @Post('validar')
  @ApiOperation({ 
    summary: 'Validar configuraciones de redes sociales',
    description: 'Valida el estado y permisos de todas las configuraciones activas de una tienda'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Configuraciones validadas exitosamente',
    schema: {
      example: {
        mensaje: 'Configuraciones validadas exitosamente',
        data: {
          FACEBOOK: {
            valido: true,
            permisos: ['catalog_management', 'pages_manage_posts'],
            datosCuenta: {
              usuario_id: '123456',
              usuario_nombre: 'Mi Tienda'
            }
          },
          INSTAGRAM: {
            valido: false,
            mensaje: 'Token de acceso expirado'
          }
        },
        tipo_mensaje: 'Exito',
        estado_respuesta: 200
      }
    }
  })
  async validarConfiguraciones(@Param('tiendaId') tiendaId: string) {
    const resultados = await this.servicioPublicacionAutomatica.validarConfiguraciones(tiendaId);

    return {
      mensaje: 'Configuraciones validadas exitosamente',
      data: Object.fromEntries(resultados),
      tipo_mensaje: 'Exito',
      estado_respuesta: HttpStatus.OK
    };
  }

  /**
   * Obtiene los productos sincronizados para una configuración específica
   */
  @Get(':configuracionId/productos-sincronizados')
  @ApiOperation({ 
    summary: 'Obtener productos sincronizados',
    description: 'Retorna todos los productos sincronizados para una configuración específica'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Productos sincronizados obtenidos exitosamente',
    schema: {
      example: {
        mensaje: 'Productos sincronizados obtenidos exitosamente',
        data: [
          {
            id: 'sync_123',
            producto_id: 'prod_456',
            id_externo: 'facebook_product_789',
            estado: 'ACTIVO',
            fecha_sincronizacion: '2024-01-01T00:00:00.000Z'
          }
        ],
        tipo_mensaje: 'Exito',
        estado_respuesta: 200
      }
    }
  })
  async obtenerProductosSincronizados(
    @Param('tiendaId') tiendaId: string,
    @Param('configuracionId') configuracionId: string
  ) {
    const configuracion = await this.repositorioConfiguracion.buscarPorId(configuracionId);
    
    if (!configuracion || configuracion.tienda_id !== tiendaId) {
      return {
        mensaje: 'Configuración no encontrada',
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: HttpStatus.NOT_FOUND
      };
    }

    const productosSincronizados = await this.repositorioConfiguracion.buscarProductosSincronizadosPorConfiguracion(configuracionId);

    return {
      mensaje: 'Productos sincronizados obtenidos exitosamente',
      data: productosSincronizados,
      tipo_mensaje: 'Exito',
      estado_respuesta: HttpStatus.OK
    };
  }

  /**
   * Actualiza productos seleccionados en configuraciones específicas de redes sociales
   */
  @Post('actualizar-productos-seleccionados')
  @ApiOperation({
    summary: 'Actualizar productos seleccionados en redes sociales específicas',
    description: 'Actualiza productos específicos en configuraciones de redes sociales seleccionadas'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Productos actualizados exitosamente en las redes sociales seleccionadas',
    schema: {
      example: {
        mensaje: 'Productos actualizados exitosamente en las redes sociales seleccionadas',
        data: {
          'prod_123': {
            'FACEBOOK': {
              exito: true,
              mensaje: 'Producto actualizado exitosamente en Facebook',
              id_externo: 'facebook_product_789',
              fecha_publicacion: '2024-01-01T00:00:00.000Z'
            },
            'WHATSAPP': {
              exito: true,
              mensaje: 'Producto actualizado exitosamente en WhatsApp Business',
              id_externo: 'whatsapp_product_456',
              fecha_publicacion: '2024-01-01T00:00:00.000Z'
            }
          }
        },
        tipo_mensaje: 'Exito',
        estado_respuesta: 200
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Error al actualizar productos',
    schema: {
      example: {
        mensaje: 'Error al actualizar productos en redes sociales',
        data: null,
        tipo_mensaje: 'ErrorServidor',
        estado_respuesta: 500
      }
    }
  })
  async actualizarProductosSeleccionados(
    @Param('tiendaId') tiendaId: string,
    @Body() body: {
      productos: DatosProductoParaPublicacion[];
      configuracion_ids: string[];
    }
  ) {
    const { productos, configuracion_ids } = body;

    if (!productos || productos.length === 0) {
      return {
        mensaje: 'No se proporcionaron productos para actualizar',
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: HttpStatus.BAD_REQUEST
      };
    }

    if (!configuracion_ids || configuracion_ids.length === 0) {
      return {
        mensaje: 'No se proporcionaron configuraciones de redes sociales',
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: HttpStatus.BAD_REQUEST
      };
    }

    // Validar que todas las configuraciones pertenezcan a la tienda
    for (const configuracionId of configuracion_ids) {
      const configuracion = await this.repositorioConfiguracion.buscarPorId(configuracionId);
      if (!configuracion || configuracion.tienda_id !== tiendaId) {
        return {
          mensaje: `La configuración ${configuracionId} no pertenece a esta tienda o no existe`,
          data: null,
          tipo_mensaje: 'ErrorCliente',
          estado_respuesta: HttpStatus.BAD_REQUEST
        };
      }
    }

    const resultados = await this.servicioPublicacionAutomatica.publicarProductosSeleccionadosEnRedesSociales(
      productos,
      tiendaId,
      configuracion_ids
    );

    return {
      mensaje: 'Productos actualizados exitosamente en las redes sociales seleccionadas',
      data: Object.fromEntries(resultados),
      tipo_mensaje: 'Exito',
      estado_respuesta: HttpStatus.OK
    };
  }

  /**
   * Actualiza un producto en configuraciones específicas de redes sociales
   */
  @Post(':configuracionId/actualizar-producto')
  @ApiOperation({
    summary: 'Actualizar producto en configuración específica',
    description: 'Actualiza un producto en una configuración de red social específica'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Producto actualizado exitosamente',
    schema: {
      example: {
        mensaje: 'Producto actualizado exitosamente en Facebook',
        data: {
          exito: true,
          mensaje: 'Producto actualizado exitosamente en Facebook',
          id_externo: 'facebook_product_789',
          fecha_publicacion: '2024-01-01T00:00:00.000Z'
        },
        tipo_mensaje: 'Exito',
        estado_respuesta: 200
      }
    }
  })
  async actualizarProductoEnConfiguracion(
    @Param('tiendaId') tiendaId: string,
    @Param('configuracionId') configuracionId: string,
    @Body() producto: DatosProductoParaPublicacion
  ) {
    const configuracion = await this.repositorioConfiguracion.buscarPorId(configuracionId);
    
    if (!configuracion || configuracion.tienda_id !== tiendaId) {
      return {
        mensaje: 'Configuración no encontrada',
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: HttpStatus.NOT_FOUND
      };
    }

    const resultados = await this.servicioPublicacionAutomatica.actualizarProductoEnRedesSociales(
      producto.id,
      producto,
      tiendaId,
      [configuracionId]
    );

    const resultado = resultados.get(configuracion.tipo_red_social);

    if (!resultado) {
      return {
        mensaje: 'No se pudo actualizar el producto en la red social',
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: HttpStatus.BAD_REQUEST
      };
    }

    return {
      mensaje: resultado.exito
        ? `Producto actualizado exitosamente en ${configuracion.tipo_red_social}`
        : `Error al actualizar producto en ${configuracion.tipo_red_social}`,
      data: resultado,
      tipo_mensaje: resultado.exito ? 'Exito' : 'ErrorCliente',
      estado_respuesta: resultado.exito ? HttpStatus.OK : HttpStatus.BAD_REQUEST
    };
  }
}