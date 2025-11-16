import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Query, 
  HttpCode, 
  HttpStatus,
  UsePipes,
  ValidationPipe 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { GestionCuentasClienteCasoUso } from '../../dominio/casos-uso/gestion-cuentas-cliente.caso-uso';
import { 
  CrearConfiguracionCuentasClienteDto, 
  ActualizarConfiguracionCuentasClienteDto,
  ModoCuentas,
  MetodoAutenticacion
} from '../../aplicacion/dto/configuracion-cuentas-cliente.dto';

@ApiTags('Configuración - Cuentas de Cliente')
@Controller('configuracion/cuentas-cliente')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class ControladorCuentasCliente {
  constructor(
    private readonly gestionCuentasClienteCasoUso: GestionCuentasClienteCasoUso,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Crear configuración de cuentas de cliente',
    description: 'Crea una nueva configuración para la gestión de cuentas de cliente en una tienda'
  })
  @ApiBody({ type: CrearConfiguracionCuentasClienteDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Configuración creada exitosamente',
    schema: {
      example: {
        mensaje: 'Configuración de cuentas de cliente creada exitosamente',
        data: {
          id: 'cuentas-cliente-123',
          tienda_id: 'tienda-456',
          modo_cuentas: 'recomendado',
          metodo_autenticacion: 'código de un solo uso',
          mostrar_enlaces_inicio: true,
          apps_conectadas: ['app-789'],
          personalizacion: false,
          credito_tienda: false,
          devolucion_autoservicio: false,
          reglas_devolucion: [],
          url_cuenta: 'https://mitienda.com/cuenta',
          dominio: 'cuentas.mitienda.com',
          fecha_creacion: '2023-01-01T00:00:00.000Z',
          fecha_actualizacion: '2023-01-01T00:00:00.000Z'
        },
        tipo_mensaje: 'CuentasCliente.CreadaExitosamente',
        estado_respuesta: 201
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Error de validación en los datos',
    schema: {
      example: {
        mensaje: 'En modo recomendado solo se permite código de un solo uso',
        data: null,
        tipo_mensaje: 'CuentasCliente.ModoRecomendadoIncompatible',
        estado_respuesta: 400
      }
    }
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Error interno del servidor',
    schema: {
      example: {
        mensaje: 'Error al crear configuración de cuentas de cliente: Error desconocido',
        data: null,
        tipo_mensaje: 'CuentasCliente.ErrorCreacion',
        estado_respuesta: 500
      }
    }
  })
  async crear(
    @Body() datos: CrearConfiguracionCuentasClienteDto
  ) {
    return await this.gestionCuentasClienteCasoUso.crear(datos);
  }

  @Get(':tiendaId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Obtener configuración de cuentas de cliente',
    description: 'Obtiene la configuración de cuentas de cliente por ID de tienda'
  })
  @ApiParam({ 
    name: 'tiendaId', 
    description: 'ID de la tienda',
    example: 'tienda-123'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Configuración obtenida exitosamente',
    schema: {
      example: {
        mensaje: 'Configuración de cuentas de cliente obtenida exitosamente',
        data: {
          id: 'cuentas-cliente-123',
          tienda_id: 'tienda-456',
          modo_cuentas: 'recomendado',
          metodo_autenticacion: 'código de un solo uso',
          mostrar_enlaces_inicio: true,
          apps_conectadas: ['app-789'],
          personalizacion: false,
          credito_tienda: false,
          devolucion_autoservicio: false,
          reglas_devolucion: [],
          url_cuenta: 'https://mitienda.com/cuenta',
          dominio: 'cuentas.mitienda.com',
          fecha_creacion: '2023-01-01T00:00:00.000Z',
          fecha_actualizacion: '2023-01-01T00:00:00.000Z'
        },
        tipo_mensaje: 'CuentasCliente.ObtenidaExitosamente',
        estado_respuesta: 200
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Configuración no encontrada',
    schema: {
      example: {
        mensaje: 'Configuración de cuentas de cliente no encontrada',
        data: null,
        tipo_mensaje: 'CuentasCliente.NoEncontrada',
        estado_respuesta: 404
      }
    }
  })
  async obtenerPorTiendaId(
    @Param('tiendaId') tiendaId: string
  ) {
    return await this.gestionCuentasClienteCasoUso.obtenerPorTiendaId(tiendaId);
  }

  @Put()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Actualizar configuración de cuentas de cliente',
    description: 'Actualiza la configuración existente de cuentas de cliente'
  })
  @ApiBody({ type: ActualizarConfiguracionCuentasClienteDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Configuración actualizada exitosamente',
    schema: {
      example: {
        mensaje: 'Configuración de cuentas de cliente actualizada exitosamente',
        data: {
          id: 'cuentas-cliente-123',
          tienda_id: 'tienda-456',
          modo_cuentas: 'clásico',
          metodo_autenticacion: 'contraseña',
          mostrar_enlaces_inicio: false,
          apps_conectadas: ['app-789', 'app-999'],
          personalizacion: true,
          credito_tienda: true,
          devolucion_autoservicio: true,
          reglas_devolucion: [{
            condicion: 'Productos no personalizados',
            limite_dias: 30,
            productos_excluidos: ['prod-123'],
            condiciones_adicionales: { requiere_embalaje_original: true }
          }],
          url_cuenta: 'https://mitienda.com/micuenta',
          dominio: 'micuenta.mitienda.com',
          fecha_creacion: '2023-01-01T00:00:00.000Z',
          fecha_actualizacion: '2023-01-02T00:00:00.000Z'
        },
        tipo_mensaje: 'CuentasCliente.ActualizadaExitosamente',
        estado_respuesta: 200
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Configuración no encontrada',
    schema: {
      example: {
        mensaje: 'Configuración de cuentas de cliente no encontrada',
        data: null,
        tipo_mensaje: 'CuentasCliente.NoEncontrada',
        estado_respuesta: 404
      }
    }
  })
  async actualizar(
    @Body() datos: ActualizarConfiguracionCuentasClienteDto
  ) {
    return await this.gestionCuentasClienteCasoUso.actualizar(datos);
  }

  @Delete(':tiendaId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Eliminar configuración de cuentas de cliente',
    description: 'Elimina la configuración de cuentas de cliente por ID de tienda'
  })
  @ApiParam({ 
    name: 'tiendaId', 
    description: 'ID de la tienda',
    example: 'tienda-123'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Configuración eliminada exitosamente',
    schema: {
      example: {
        mensaje: 'Configuración de cuentas de cliente eliminada exitosamente',
        data: { mensaje: 'Configuración eliminada exitosamente' },
        tipo_mensaje: 'CuentasCliente.EliminadaExitosamente',
        estado_respuesta: 200
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Configuración no encontrada',
    schema: {
      example: {
        mensaje: 'Configuración de cuentas de cliente no encontrada',
        data: null,
        tipo_mensaje: 'CuentasCliente.NoEncontrada',
        estado_respuesta: 404
      }
    }
  })
  async eliminar(
    @Param('tiendaId') tiendaId: string
  ) {
    return await this.gestionCuentasClienteCasoUso.eliminar(tiendaId);
  }

  @Get('estadisticas/totales')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Obtener estadísticas de configuraciones',
    description: 'Obtiene estadísticas generales de las configuraciones de cuentas de cliente'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Estadísticas obtenidas exitosamente',
    schema: {
      example: {
        mensaje: 'Estadísticas de configuraciones obtenidas exitosamente',
        data: {
          estadisticas: {
            totalConfiguraciones: 150,
            modoRecomendado: 100,
            modoClasico: 50,
            codigoUnicoUso: 100,
            contrasena: 50,
            creditoTiendaActivo: 30,
            devolucionAutoservicioActiva: 25
          }
        },
        tipo_mensaje: 'CuentasCliente.EstadisticasObtenidasExitosamente',
        estado_respuesta: 200
      }
    }
  })
  async obtenerEstadisticas() {
    return await this.gestionCuentasClienteCasoUso.obtenerEstadisticas();
  }

  @Get('buscar/criterios')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Buscar configuraciones por criterios',
    description: 'Busca configuraciones de cuentas de cliente por múltiples criterios'
  })
  @ApiQuery({ 
    name: 'modo_cuentas', 
    required: false,
    enum: ModoCuentas,
    description: 'Filtrar por modo de cuentas'
  })
  @ApiQuery({ 
    name: 'metodo_autenticacion', 
    required: false,
    enum: MetodoAutenticacion,
    description: 'Filtrar por método de autenticación'
  })
  @ApiQuery({ 
    name: 'credito_tienda', 
    required: false,
    type: Boolean,
    description: 'Filtrar por estado de crédito en tienda'
  })
  @ApiQuery({ 
    name: 'devolucion_autoservicio', 
    required: false,
    type: Boolean,
    description: 'Filtrar por estado de devolución autoservicio'
  })
  @ApiQuery({ 
    name: 'personalizacion', 
    required: false,
    type: Boolean,
    description: 'Filtrar por estado de personalización'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Configuraciones encontradas exitosamente',
    schema: {
      example: {
        mensaje: 'Configuraciones encontradas exitosamente',
        data: {
          configuraciones: [
            {
              id: 'cuentas-cliente-123',
              tienda_id: 'tienda-456',
              modo_cuentas: 'recomendado',
              metodo_autenticacion: 'código de un solo uso',
              mostrar_enlaces_inicio: true,
              apps_conectadas: ['app-789'],
              personalizacion: false,
              credito_tienda: false,
              devolucion_autoservicio: false,
              reglas_devolucion: [],
              url_cuenta: 'https://mitienda.com/cuenta',
              dominio: 'cuentas.mitienda.com',
              fecha_creacion: '2023-01-01T00:00:00.000Z',
              fecha_actualizacion: '2023-01-01T00:00:00.000Z'
            }
          ]
        },
        tipo_mensaje: 'CuentasCliente.ConfiguracionesEncontradasExitosamente',
        estado_respuesta: 200
      }
    }
  })
  async buscarPorCriterios(
    @Query('modo_cuentas') modoCuentas?: string,
    @Query('metodo_autenticacion') metodoAutenticacion?: string,
    @Query('credito_tienda') creditoTienda?: string,
    @Query('devolucion_autoservicio') devolucionAutoservicio?: string,
    @Query('personalizacion') personalizacion?: string,
  ) {
    const criterios: any = {};
    
    if (modoCuentas) criterios.modo_cuentas = modoCuentas;
    if (metodoAutenticacion) criterios.metodo_autenticacion = metodoAutenticacion;
    if (creditoTienda) criterios.credito_tienda = creditoTienda === 'true';
    if (devolucionAutoservicio) criterios.devolucion_autoservicio = devolucionAutoservicio === 'true';
    if (personalizacion) criterios.personalizacion = personalizacion === 'true';

    return await this.gestionCuentasClienteCasoUso.buscarPorCriterios(criterios);
  }

  @Get('validar/integridad/:tiendaId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Validar integridad de la configuración',
    description: 'Valida la integridad y consistencia de la configuración de cuentas de cliente'
  })
  @ApiParam({ 
    name: 'tiendaId', 
    description: 'ID de la tienda',
    example: 'tienda-123'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Validación completada exitosamente',
    schema: {
      example: {
        mensaje: 'La configuración es válida',
        data: { es_valida: true },
        tipo_mensaje: 'CuentasCliente.IntegridadValida',
        estado_respuesta: 200
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Configuración no encontrada',
    schema: {
      example: {
        mensaje: 'Configuración de cuentas de cliente no encontrada',
        data: null,
        tipo_mensaje: 'CuentasCliente.NoEncontrada',
        estado_respuesta: 404
      }
    }
  })
  async validarIntegridad(
    @Param('tiendaId') tiendaId: string
  ) {
    return await this.gestionCuentasClienteCasoUso.validarIntegridad(tiendaId);
  }
}