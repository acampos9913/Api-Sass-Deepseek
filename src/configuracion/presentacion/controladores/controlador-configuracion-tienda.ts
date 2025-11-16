import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpCode, HttpStatus, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';
import { CrearConfiguracionTiendaDto } from '../../aplicacion/dto/crear-configuracion-tienda.dto';
import { CrearConfiguracionTiendaCasoUso } from '../../dominio/casos-uso/crear-configuracion-tienda.caso-uso';
import type { RepositorioConfiguracionTienda } from '../../dominio/interfaces/repositorio-configuracion-tienda.interface';
import { ConfiguracionTienda } from '../../dominio/entidades/configuracion-tienda.entity';

/**
 * Controlador para la gestión de configuración de tienda
 * Sigue los principios de Arquitectura Limpia y convenciones en español
 */
@ApiTags('Configuración Tienda')
@Controller('api/v1/configuracion-tienda')
export class ControladorConfiguracionTienda {
  constructor(
    private readonly crearConfiguracionTiendaCasoUso: CrearConfiguracionTiendaCasoUso,
    @Inject('RepositorioConfiguracionTienda')
    private readonly repositorioConfiguracionTienda: RepositorioConfiguracionTienda,
  ) {}

  /**
   * Crea una nueva configuración de tienda
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Crear configuración de tienda',
    description: 'Crea una nueva configuración para la tienda con todos los campos de configuración general'
  })
  @ApiBody({ type: CrearConfiguracionTiendaDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Configuración de tienda creada exitosamente',
    schema: {
      example: {
        mensaje: 'Configuración de tienda creada exitosamente',
        data: {
          id: 'config-123',
          nombreTienda: 'Mi Tienda Online',
          fechaCreacion: '2024-01-01T00:00:00.000Z'
        },
        tipo_mensaje: 'Exito',
        estado_respuesta: 201
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Datos de entrada inválidos',
    schema: {
      example: {
        mensaje: 'El nombre de la tienda es requerido',
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: 400
      }
    }
  })
  @ApiResponse({ 
    status: 409, 
    description: 'Ya existe una configuración con el mismo nombre',
    schema: {
      example: {
        mensaje: 'Ya existe una configuración con el mismo nombre',
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: 409
      }
    }
  })
  async crearConfiguracionTienda(@Body() crearConfiguracionTiendaDto: CrearConfiguracionTiendaDto) {
    try {
      // Convertir DTO a parámetros del caso de uso
      const parametros = {
        ...crearConfiguracionTiendaDto,
        moneda: {
          ...crearConfiguracionTiendaDto.moneda,
          decimales: crearConfiguracionTiendaDto.moneda.decimales ?? 2,
        },
      };
      const configuracionTienda = await this.crearConfiguracionTiendaCasoUso.ejecutar(parametros);
      
      return {
        mensaje: 'Configuración de tienda creada exitosamente',
        data: {
          id: configuracionTienda.getId(),
          nombreTienda: configuracionTienda.getNombreTienda(),
          fechaCreacion: configuracionTienda.getFechaCreacion()
        },
        tipo_mensaje: 'Exito',
        estado_respuesta: 201
      };
    } catch (error) {
      return {
        mensaje: error.message,
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: 400
      };
    }
  }

  /**
   * Obtiene la configuración activa de la tienda
   */
  @Get('activa')
  @ApiOperation({ 
    summary: 'Obtener configuración activa',
    description: 'Obtiene la configuración actualmente activa de la tienda'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Configuración activa obtenida exitosamente',
    schema: {
      example: {
        mensaje: 'Configuración activa obtenida exitosamente',
        data: {
          id: 'config-123',
          nombreTienda: 'Mi Tienda Online',
          descripcionTienda: 'Descripción de mi tienda',
          moneda: {
            codigo: 'USD',
            simbolo: '$',
            decimales: 2
          },
          impuestos: {
            impuestoVenta: 18,
            incluirImpuestosEnPrecios: false,
            pais: 'Perú'
          },
          direccion: {
            calle: 'Calle Principal 123',
            ciudad: 'Lima',
            estado: 'Lima',
            codigoPostal: '15001',
            pais: 'Perú'
          },
          contacto: {
            email: 'contacto@mitienda.com',
            telefono: '+51987654321',
            sitioWeb: 'https://mitienda.com'
          },
          configuracionEnvio: {
            costoEnvioGratisMinimo: 100,
            tiempoProcesamientoDias: 2,
            politicasEnvio: 'Envío estándar en 3-5 días hábiles'
          },
          configuracionPagos: {
            metodosPagoAceptados: ['TARJETA_CREDITO', 'PAYPAL'],
            monedaPorDefecto: 'USD'
          },
          configuracionGeneral: {
            zonaHoraria: 'America/Lima',
            idioma: 'es',
            mantenimiento: false,
            mensajeMantenimiento: 'Estamos en mantenimiento',
            terminosServicio: 'Términos de servicio',
            politicaPrivacidad: 'Política de privacidad',
            nombreTienda: 'Mi Tienda Online',
            correoContacto: 'contacto@mitienda.com',
            telefonoContacto: '+51987654321',
            direccionFacturacion: 'Calle Principal 123, Lima, Perú',
            monedaPredeterminada: 'USD',
            regionRespaldo: 'Perú',
            sistemaUnidades: 'Métrico',
            unidadPeso: 'kg',
            prefijoPedido: 'ORD',
            sufijoPedido: 'SHOP',
            procesarPedidoAutomaticamente: 'Sí - todos los artículos',
            archivarPedidoAutomaticamente: '30 días después de la entrega'
          },
          fechaCreacion: '2024-01-01T00:00:00.000Z',
          fechaActualizacion: '2024-01-01T00:00:00.000Z'
        },
        tipo_mensaje: 'Exito',
        estado_respuesta: 200
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'No existe configuración activa',
    schema: {
      example: {
        mensaje: 'No existe configuración activa para la tienda',
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: 404
      }
    }
  })
  async obtenerConfiguracionActiva() {
    try {
      const configuracion = await this.repositorioConfiguracionTienda.obtenerConfiguracionActiva();
      
      if (!configuracion) {
        return {
          mensaje: 'No existe configuración activa para la tienda',
          data: null,
          tipo_mensaje: 'ErrorCliente',
          estado_respuesta: 404
        };
      }

      return {
        mensaje: 'Configuración activa obtenida exitosamente',
        data: configuracion,
        tipo_mensaje: 'Exito',
        estado_respuesta: 200
      };
    } catch (error) {
      return {
        mensaje: error.message,
        data: null,
        tipo_mensaje: 'ErrorServidor',
        estado_respuesta: 500
      };
    }
  }

  /**
   * Obtiene una configuración específica por ID
   */
  @Get(':id')
  @ApiOperation({ 
    summary: 'Obtener configuración por ID',
    description: 'Obtiene una configuración específica de tienda por su ID único'
  })
  @ApiParam({ name: 'id', description: 'ID único de la configuración' })
  @ApiResponse({ 
    status: 200, 
    description: 'Configuración obtenida exitosamente'
  })
  @ApiResponse({ 
    status: 404, 
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
  async obtenerConfiguracionPorId(@Param('id') id: string) {
    try {
      const configuracion = await this.repositorioConfiguracionTienda.buscarPorId(id);
      
      if (!configuracion) {
        return {
          mensaje: 'Configuración no encontrada',
          data: null,
          tipo_mensaje: 'ErrorCliente',
          estado_respuesta: 404
        };
      }

      return {
        mensaje: 'Configuración obtenida exitosamente',
        data: configuracion,
        tipo_mensaje: 'Exito',
        estado_respuesta: 200
      };
    } catch (error) {
      return {
        mensaje: error.message,
        data: null,
        tipo_mensaje: 'ErrorServidor',
        estado_respuesta: 500
      };
    }
  }

  /**
   * Actualiza una configuración existente
   */
  @Put(':id')
  @ApiOperation({ 
    summary: 'Actualizar configuración',
    description: 'Actualiza una configuración existente de tienda'
  })
  @ApiParam({ name: 'id', description: 'ID único de la configuración a actualizar' })
  @ApiBody({ type: CrearConfiguracionTiendaDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Configuración actualizada exitosamente',
    schema: {
      example: {
        mensaje: 'Configuración actualizada exitosamente',
        data: {
          id: 'config-123',
          fechaActualizacion: '2024-01-02T00:00:00.000Z'
        },
        tipo_mensaje: 'Exito',
        estado_respuesta: 200
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Configuración no encontrada'
  })
  async actualizarConfiguracion(
    @Param('id') id: string,
    @Body() actualizarConfiguracionTiendaDto: CrearConfiguracionTiendaDto
  ) {
    try {
      // Primero verificamos que exista la configuración
      const configuracionExistente = await this.repositorioConfiguracionTienda.buscarPorId(id);
      if (!configuracionExistente) {
        return {
          mensaje: 'Configuración no encontrada',
          data: null,
          tipo_mensaje: 'ErrorCliente',
          estado_respuesta: 404
        };
      }

      // Convertir DTO a parámetros del repositorio
      const datosActualizacion = {
        ...actualizarConfiguracionTiendaDto,
        moneda: {
          ...actualizarConfiguracionTiendaDto.moneda,
          decimales: actualizarConfiguracionTiendaDto.moneda.decimales ?? 2,
        },
        fechaActualizacion: new Date()
      };

      // Actualizamos la configuración
      await this.repositorioConfiguracionTienda.actualizar(id, datosActualizacion);

      return {
        mensaje: 'Configuración actualizada exitosamente',
        data: {
          id,
          fechaActualizacion: new Date()
        },
        tipo_mensaje: 'Exito',
        estado_respuesta: 200
      };
    } catch (error) {
      return {
        mensaje: error.message,
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: 400
      };
    }
  }

  /**
   * Activa una configuración específica
   */
  @Put(':id/activar')
  @ApiOperation({ 
    summary: 'Activar configuración',
    description: 'Activa una configuración específica como la configuración activa de la tienda'
  })
  @ApiParam({ name: 'id', description: 'ID único de la configuración a activar' })
  @ApiResponse({ 
    status: 200, 
    description: 'Configuración activada exitosamente',
    schema: {
      example: {
        mensaje: 'Configuración activada exitosamente',
        data: {
          id: 'config-123',
          activada: true
        },
        tipo_mensaje: 'Exito',
        estado_respuesta: 200
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Configuración no encontrada'
  })
  async activarConfiguracion(@Param('id') id: string) {
    try {
      // Verificamos que exista la configuración
      const configuracion = await this.repositorioConfiguracionTienda.buscarPorId(id);
      if (!configuracion) {
        return {
          mensaje: 'Configuración no encontrada',
          data: null,
          tipo_mensaje: 'ErrorCliente',
          estado_respuesta: 404
        };
      }

      await this.repositorioConfiguracionTienda.activarConfiguracion(id);

      return {
        mensaje: 'Configuración activada exitosamente',
        data: {
          id,
          activada: true
        },
        tipo_mensaje: 'Exito',
        estado_respuesta: 200
      };
    } catch (error) {
      return {
        mensaje: error.message,
        data: null,
        tipo_mensaje: 'ErrorServidor',
        estado_respuesta: 500
      };
    }
  }

  /**
   * Obtiene el historial de configuraciones
   */
  @Get()
  @ApiOperation({ 
    summary: 'Obtener historial de configuraciones',
    description: 'Obtiene el historial de configuraciones de tienda con paginación'
  })
  @ApiQuery({ name: 'pagina', required: false, description: 'Número de página (por defecto: 1)' })
  @ApiQuery({ name: 'limite', required: false, description: 'Límite de elementos por página (por defecto: 10)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Historial obtenido exitosamente',
    schema: {
      example: {
        mensaje: 'Historial de configuraciones obtenido exitosamente',
        data: {
          elementos: [
            {
              id: 'config-123',
              nombreTienda: 'Mi Tienda Online',
              fechaCreacion: '2024-01-01T00:00:00.000Z',
              fechaActualizacion: '2024-01-01T00:00:00.000Z',
              activa: true
            }
          ],
          paginacion: {
            total_elementos: 1,
            total_paginas: 1,
            pagina_actual: 1,
            limite: 10
          }
        },
        tipo_mensaje: 'Exito',
        estado_respuesta: 200
      }
    }
  })
  async obtenerHistorial(
    @Query('pagina') pagina: number = 1,
    @Query('limite') limite: number = 10
  ) {
    try {
      const resultado = await this.repositorioConfiguracionTienda.obtenerHistorial({
        pagina: Number(pagina),
        limite: Number(limite)
      });

      return {
        mensaje: 'Historial de configuraciones obtenido exitosamente',
        data: {
          elementos: resultado.configuraciones,
          paginacion: {
            total_elementos: resultado.total,
            total_paginas: Math.ceil(resultado.total / limite),
            pagina_actual: pagina,
            limite: limite
          }
        },
        tipo_mensaje: 'Exito',
        estado_respuesta: 200
      };
    } catch (error) {
      return {
        mensaje: error.message,
        data: null,
        tipo_mensaje: 'ErrorServidor',
        estado_respuesta: 500
      };
    }
  }

  /**
   * Elimina una configuración
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ 
    summary: 'Eliminar configuración',
    description: 'Elimina una configuración específica de tienda'
  })
  @ApiParam({ name: 'id', description: 'ID único de la configuración a eliminar' })
  @ApiResponse({ 
    status: 204, 
    description: 'Configuración eliminada exitosamente'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Configuración no encontrada'
  })
  async eliminarConfiguracion(@Param('id') id: string) {
    try {
      // Verificamos que exista la configuración
      const configuracion = await this.repositorioConfiguracionTienda.buscarPorId(id);
      if (!configuracion) {
        return {
          mensaje: 'Configuración no encontrada',
          data: null,
          tipo_mensaje: 'ErrorCliente',
          estado_respuesta: 404
        };
      }

      await this.repositorioConfiguracionTienda.eliminar(id);

      return {
        mensaje: 'Configuración eliminada exitosamente',
        data: null,
        tipo_mensaje: 'Exito',
        estado_respuesta: 204
      };
    } catch (error) {
      return {
        mensaje: error.message,
        data: null,
        tipo_mensaje: 'ErrorServidor',
        estado_respuesta: 500
      };
    }
  }

  /**
   * Obtiene estadísticas de configuraciones
   */
  @Get('estadisticas/generales')
  @ApiOperation({ 
    summary: 'Obtener estadísticas',
    description: 'Obtiene estadísticas generales sobre las configuraciones de tienda'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Estadísticas obtenidas exitosamente',
    schema: {
      example: {
        mensaje: 'Estadísticas obtenidas exitosamente',
        data: {
          totalConfiguraciones: 5,
          configuracionActiva: 'Mi Tienda Online',
          ultimaActualizacion: '2024-01-01T00:00:00.000Z'
        },
        tipo_mensaje: 'Exito',
        estado_respuesta: 200
      }
    }
  })
  async obtenerEstadisticas() {
    try {
      const estadisticas = await this.repositorioConfiguracionTienda.obtenerEstadisticas();

      return {
        mensaje: 'Estadísticas obtenidas exitosamente',
        data: estadisticas,
        tipo_mensaje: 'Exito',
        estado_respuesta: 200
      };
    } catch (error) {
      return {
        mensaje: error.message,
        data: null,
        tipo_mensaje: 'ErrorServidor',
        estado_respuesta: 500
      };
    }
  }
}