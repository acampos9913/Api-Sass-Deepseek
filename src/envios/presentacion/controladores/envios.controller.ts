/**
 * Controlador para la gestión de envíos
 * Expone los endpoints de la API para operaciones de envíos
 * Sigue los principios de la Arquitectura Limpia
 */
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
  UsePipes,
  ValidationPipe
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody
} from '@nestjs/swagger';
import { CrearEnvioCasoUso } from '../../dominio/casos-uso/crear-envio.caso-uso';
import { ListarEnviosCasoUso } from '../../dominio/casos-uso/listar-envios.caso-uso';
import type { FiltrosListarEnvios } from '../../dominio/casos-uso/listar-envios.caso-uso';
import { CrearEnvioDto } from '../../aplicacion/dto/crear-envio.dto';
import { EstadoEnvio, TipoMetodoEnvio } from '../../dominio/entidades/envio.entity';

@ApiTags('Envios')
@Controller('envios')
@UsePipes(new ValidationPipe({ transform: true }))
export class EnviosController {
  constructor(
    private readonly crearEnvioCasoUso: CrearEnvioCasoUso,
    private readonly listarEnviosCasoUso: ListarEnviosCasoUso,
  ) {}

  @Post()
  @ApiOperation({ 
    summary: 'Crear un nuevo envío',
    description: 'Crea un nuevo envío asociado a una orden. Afecta a la base de datos de escritura (PostgreSQL).'
  })
  @ApiBody({ type: CrearEnvioDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Envío creado exitosamente',
    schema: {
      example: {
        mensaje: 'Envío creado exitosamente.',
        data: {
          id: 'env_123456',
          ordenId: 'orden_123456',
          direccionEnvio: {
            nombreCompleto: 'Juan Pérez García',
            calle: 'Av. Principal 123',
            ciudad: 'Lima',
            estado: 'Lima',
            codigoPostal: '15001',
            pais: 'Perú',
            telefono: '+51987654321',
            email: 'juan.perez@example.com',
            instruccionesEspeciales: 'Dejar en recepción'
          },
          metodoEnvio: {
            tipo: 'ESTANDAR',
            tiempoEstimadoDias: 5,
            descripcion: 'Envío estándar con seguimiento',
            restricciones: ['No disponible los domingos']
          },
          estado: 'PENDIENTE',
          costo: 25.50,
          fechaEstimadaEntrega: '2024-12-20T00:00:00.000Z',
          fechaCreacion: '2024-12-15T10:30:00.000Z',
          fechaActualizacion: '2024-12-15T10:30:00.000Z',
          trackingNumber: null,
          proveedorEnvio: null,
          detalles: {
            pesoTotal: 2.5,
            dimensiones: {
              alto: 30,
              ancho: 20,
              largo: 15
            },
            esFragil: false,
            requiereFirma: true,
            esRegalo: false,
            valorAsegurado: 150.00,
            notas: 'Manejar con cuidado'
          }
        },
        tipo_mensaje: 'Exito',
        estado_respuesta: 200
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Error del cliente - Datos inválidos',
    schema: {
      example: {
        mensaje: 'El ID de la orden es requerido.',
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: 400
      }
    }
  })
  async crearEnvio(@Body() crearEnvioDto: CrearEnvioDto) {
    return await this.crearEnvioCasoUso.ejecutar(crearEnvioDto);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Listar envíos con filtros',
    description: 'Obtiene una lista paginada de envíos con opciones de filtrado. Consulta la base de datos de lectura (MongoDB).'
  })
  @ApiQuery({ name: 'pagina', required: false, type: Number, description: 'Número de página (por defecto 1)' })
  @ApiQuery({ name: 'limite', required: false, type: Number, description: 'Límite de elementos por página (por defecto 10)' })
  @ApiQuery({ name: 'estado', required: false, enum: EstadoEnvio, description: 'Filtrar por estado del envío' })
  @ApiQuery({ name: 'metodoEnvio', required: false, enum: TipoMetodoEnvio, description: 'Filtrar por método de envío' })
  @ApiQuery({ name: 'fechaInicio', required: false, type: Date, description: 'Fecha de inicio para filtro por rango' })
  @ApiQuery({ name: 'fechaFin', required: false, type: Date, description: 'Fecha de fin para filtro por rango' })
  @ApiQuery({ name: 'pais', required: false, type: String, description: 'Filtrar por país de destino' })
  @ApiQuery({ name: 'ciudad', required: false, type: String, description: 'Filtrar por ciudad de destino' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de envíos obtenida exitosamente',
    schema: {
      example: {
        mensaje: 'Lista de envíos obtenida.',
        data: {
          elementos: [
            {
              id: 'env_123456',
              ordenId: 'orden_123456',
              direccionEnvio: {
                nombreCompleto: 'Juan Pérez García',
                calle: 'Av. Principal 123',
                ciudad: 'Lima',
                codigoPostal: '15001',
                pais: 'Perú'
              },
              metodoEnvio: {
                tipo: 'ESTANDAR',
                tiempoEstimadoDias: 5
              },
              estado: 'PENDIENTE',
              costo: 25.50,
              fechaEstimadaEntrega: '2024-12-20T00:00:00.000Z',
              trackingNumber: 'TRK123456789'
            }
          ],
          paginacion: {
            totalElementos: 100,
            totalPaginas: 10,
            paginaActual: 1,
            limite: 10,
            tienePaginaAnterior: false,
            tienePaginaSiguiente: true
          }
        },
        tipo_mensaje: 'Exito',
        estado_respuesta: 200
      }
    }
  })
  async listarEnvios(@Query() filtros: FiltrosListarEnvios) {
    return await this.listarEnviosCasoUso.ejecutar(filtros);
  }

  @Get('estadisticas')
  @ApiOperation({ 
    summary: 'Obtener estadísticas de envíos',
    description: 'Obtiene estadísticas generales sobre los envíos del sistema.'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Estadísticas obtenidas exitosamente',
    schema: {
      example: {
        mensaje: 'Estadísticas de envíos obtenidas.',
        data: {
          totalEnvios: 150,
          enviosPendientes: 10,
          enviosProcesando: 5,
          enviosEnviados: 25,
          enviosEnTransito: 30,
          enviosEntregados: 75,
          enviosCancelados: 5,
          enviosAtrasados: 3,
          costoTotalEnvios: 3750.50,
          promedioTiempoEntrega: 4.2,
          metodosEnvioMasUtilizados: [
            {
              metodoEnvio: 'ESTANDAR',
              cantidad: 100,
              porcentaje: 66.67
            },
            {
              metodoEnvio: 'EXPRESS',
              cantidad: 35,
              porcentaje: 23.33
            },
            {
              metodoEnvio: 'GRATIS',
              cantidad: 15,
              porcentaje: 10.00
            }
          ]
        },
        tipo_mensaje: 'Exito',
        estado_respuesta: 200
      }
    }
  })
  async obtenerEstadisticas() {
    return await this.listarEnviosCasoUso.obtenerEstadisticas();
  }

  @Get('atrasados')
  @ApiOperation({ 
    summary: 'Listar envíos atrasados',
    description: 'Obtiene una lista de envíos que están atrasados según su fecha estimada de entrega.'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de envíos atrasados obtenida',
    schema: {
      example: {
        mensaje: 'Lista de envíos atrasados obtenida.',
        data: [
          {
            id: 'env_123456',
            ordenId: 'orden_123456',
            direccionEnvio: {
              nombreCompleto: 'Juan Pérez García',
              ciudad: 'Lima',
              pais: 'Perú'
            },
            estado: 'EN_TRANSITO',
            fechaEstimadaEntrega: '2024-12-10T00:00:00.000Z',
            trackingNumber: 'TRK123456789',
            estaAtrasado: true
          }
        ],
        tipo_mensaje: 'Exito',
        estado_respuesta: 200
      }
    }
  })
  async listarEnviosAtrasados() {
    return await this.listarEnviosCasoUso.listarEnviosAtrasados();
  }

  @Get('orden/:ordenId')
  @ApiOperation({ 
    summary: 'Obtener envíos por orden',
    description: 'Obtiene todos los envíos asociados a una orden específica.'
  })
  @ApiParam({ name: 'ordenId', description: 'ID de la orden' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Envíos de la orden obtenidos exitosamente',
    schema: {
      example: {
        mensaje: 'Envíos de la orden obtenidos.',
        data: [
          {
            id: 'env_123456',
            ordenId: 'orden_123456',
            estado: 'PENDIENTE',
            costo: 25.50,
            fechaEstimadaEntrega: '2024-12-20T00:00:00.000Z',
            trackingNumber: null
          }
        ],
        tipo_mensaje: 'Exito',
        estado_respuesta: 200
      }
    }
  })
  async obtenerEnviosPorOrden(@Param('ordenId') ordenId: string) {
    return await this.listarEnviosCasoUso.listarPorOrdenId(ordenId);
  }

  @Get('tracking/:trackingNumber')
  @ApiOperation({ 
    summary: 'Buscar envío por número de tracking',
    description: 'Busca un envío específico por su número de tracking.'
  })
  @ApiParam({ name: 'trackingNumber', description: 'Número de tracking del envío' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Envío encontrado exitosamente',
    schema: {
      example: {
        mensaje: 'Envío encontrado.',
        data: {
          id: 'env_123456',
          ordenId: 'orden_123456',
          direccionEnvio: {
            nombreCompleto: 'Juan Pérez García',
            calle: 'Av. Principal 123',
            ciudad: 'Lima',
            codigoPostal: '15001',
            pais: 'Perú'
          },
          metodoEnvio: {
            tipo: 'ESTANDAR',
            tiempoEstimadoDias: 5
          },
          estado: 'EN_TRANSITO',
          costo: 25.50,
          fechaEstimadaEntrega: '2024-12-20T00:00:00.000Z',
          fechaCreacion: '2024-12-15T10:30:00.000Z',
          fechaActualizacion: '2024-12-16T14:20:00.000Z',
          trackingNumber: 'TRK123456789',
          proveedorEnvio: 'Correo Nacional',
          detalles: {
            pesoTotal: 2.5,
            dimensiones: {
              alto: 30,
              ancho: 20,
              largo: 15
            },
            esFragil: false,
            requiereFirma: true,
            fechaEnvio: '2024-12-16T09:00:00.000Z'
          }
        },
        tipo_mensaje: 'Exito',
        estado_respuesta: 200
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Envío no encontrado',
    schema: {
      example: {
        mensaje: 'Envío no encontrado.',
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: 404
      }
    }
  })
  async buscarPorTrackingNumber(@Param('trackingNumber') trackingNumber: string) {
    return await this.listarEnviosCasoUso.buscarPorTrackingNumber(trackingNumber);
  }

  @Get('metodos-mas-utilizados')
  @ApiOperation({ 
    summary: 'Obtener métodos de envío más utilizados',
    description: 'Obtiene una lista de los métodos de envío más utilizados ordenados por frecuencia.'
  })
  @ApiQuery({ name: 'limite', required: false, type: Number, description: 'Límite de resultados (por defecto 5)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Métodos de envío más utilizados obtenidos',
    schema: {
      example: {
        mensaje: 'Métodos de envío más utilizados obtenidos.',
        data: [
          {
            metodoEnvio: 'ESTANDAR',
            cantidad: 100,
            porcentaje: 66.67
          },
          {
            metodoEnvio: 'EXPRESS',
            cantidad: 35,
            porcentaje: 23.33
          },
          {
            metodoEnvio: 'GRATIS',
            cantidad: 15,
            porcentaje: 10.00
          }
        ],
        tipo_mensaje: 'Exito',
        estado_respuesta: 200
      }
    }
  })
  async obtenerMetodosEnvioMasUtilizados(@Query('limite') limite?: number) {
    return await this.listarEnviosCasoUso.obtenerMetodosEnvioMasUtilizados(limite);
  }
}