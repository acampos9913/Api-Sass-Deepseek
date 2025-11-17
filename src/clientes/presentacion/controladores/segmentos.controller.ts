/**
 * Controlador para la gestión de segmentos de clientes
 * Expone endpoints REST para operaciones CRUD y gestión avanzada de segmentos
 * Sigue los principios de Arquitectura Limpia y separación de responsabilidades
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
  UsePipes,
  ValidationPipe,
  HttpCode,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { CrearSegmentoCasoUso, CrearSegmentoDto } from '../../dominio/casos-uso/crear-segmento.caso-uso';
import { ListarSegmentosCasoUso } from '../../dominio/casos-uso/listar-segmentos.caso-uso';
import { ActualizarSegmentoCasoUso } from '../../dominio/casos-uso/actualizar-segmento.caso-uso';
import { EliminarSegmentoCasoUso } from '../../dominio/casos-uso/eliminar-segmento.caso-uso';
import { GestionarMembresiaSegmentoCasoUso } from '../../dominio/casos-uso/gestionar-membresia-segmento.caso-uso';
import { LoggingInterceptor } from '../../../logging/interceptores/logging.interceptor';
import { ParametrosRutaSegmentoDto } from '../dto/parametros-ruta-segmento.dto';
import { CrearSegmentoRequestDto } from '../dto/crear-segmento-request.dto';
import { ActualizarSegmentoRequestDto } from '../dto/actualizar-segmento-request.dto';
import { AgregarClienteSegmentoDto } from '../dto/agregar-cliente-segmento.dto';
import { RespuestaEstandar } from '../../../comun/aplicacion/interfaces/respuesta-estandar.interface';

@ApiTags('Segmentos')
@Controller('tiendas/:tiendaId/segmentos')
@UseInterceptors(LoggingInterceptor)
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class SegmentosController {
  constructor(
    private readonly crearSegmentoCasoUso: CrearSegmentoCasoUso,
    private readonly listarSegmentosCasoUso: ListarSegmentosCasoUso,
    private readonly actualizarSegmentoCasoUso: ActualizarSegmentoCasoUso,
    private readonly eliminarSegmentoCasoUso: EliminarSegmentoCasoUso,
    private readonly gestionarMembresiaSegmentoCasoUso: GestionarMembresiaSegmentoCasoUso,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Crear nuevo segmento de clientes',
    description: 'Crea un segmento de clientes con reglas de segmentación específicas'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Segmento creado exitosamente',
    schema: {
      example: {
        mensaje: 'Segmento creado exitosamente',
        data: {
          id: 'seg_abc123',
          nombre: 'Clientes VIP',
          descripcion: 'Segmento para clientes con alto valor',
          tipo: 'AUTOMATICO',
          estado: 'ACTIVO',
          porcentajeClientes: 15,
          cantidadClientes: 45,
          ultimaActividad: '2024-01-15T10:30:00.000Z',
          fechaCreacion: '2024-01-15T10:30:00.000Z',
          fechaActualizacion: '2024-01-15T10:30:00.000Z',
          tiendaId: 'tienda-123',
          etiquetas: ['VIP', 'AltoValor'],
          esPublico: true,
          puedeCombinar: true,
          puedeUsarEnCampanas: true,
          descripcionResumida: 'Segmento automático: Clientes VIP',
          consultaSqlLike: 'FROM customers WHERE total_spent > 1000 AND orders_count >= 5'
        },
        tipo_mensaje: 'Segmento.CreadoExitosamente',
        estado_respuesta: 201
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Error de validación en los datos del segmento',
    schema: {
      example: {
        mensaje: 'Ya existe un segmento con el nombre "Clientes VIP"',
        data: null,
        tipo_mensaje: 'Segmento.NombreDuplicado',
        estado_respuesta: 400
      }
    }
  })
  async crearSegmento(
    @Param() parametros: ParametrosRutaSegmentoDto,
    @Body() datos: CrearSegmentoRequestDto,
  ): Promise<RespuestaEstandar> {
    const dtoCrearSegmento: CrearSegmentoDto = {
      ...datos,
      tiendaId: parametros.tiendaId,
      creadorId: 'usuario-actual', // En producción, obtener del token JWT
    };

    return await this.crearSegmentoCasoUso.ejecutar(dtoCrearSegmento);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar segmentos de clientes',
    description: 'Obtiene la lista de segmentos de clientes con filtros y paginación'
  })
  @ApiQuery({
    name: 'pagina',
    required: false,
    description: 'Número de página para paginación',
    type: Number,
    example: 1
  })
  @ApiQuery({
    name: 'limite',
    required: false,
    description: 'Límite de resultados por página',
    type: Number,
    example: 20
  })
  @ApiQuery({
    name: 'tipo',
    required: false,
    description: 'Filtrar por tipo de segmento',
    enum: ['MANUAL', 'AUTOMATICO', 'PREDEFINIDO']
  })
  @ApiQuery({
    name: 'estado',
    required: false,
    description: 'Filtrar por estado del segmento',
    enum: ['ACTIVO', 'INACTIVO', 'BORRADOR']
  })
  @ApiQuery({
    name: 'etiqueta',
    required: false,
    description: 'Filtrar por etiqueta',
    type: String
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de segmentos obtenida exitosamente',
    schema: {
      example: {
        mensaje: 'Segmentos obtenidos exitosamente',
        data: {
          segmentos: [
            {
              id: 'seg_abc123',
              nombre: 'Clientes VIP',
              descripcion: 'Segmento para clientes con alto valor',
              tipo: 'AUTOMATICO',
              estado: 'ACTIVO',
              porcentajeClientes: 15,
              cantidadClientes: 45,
              ultimaActividad: '2024-01-15T10:30:00.000Z',
              fechaCreacion: '2024-01-15T10:30:00.000Z',
              fechaActualizacion: '2024-01-15T10:30:00.000Z',
              tiendaId: 'tienda-123',
              etiquetas: ['VIP', 'AltoValor'],
              esPublico: true,
              puedeCombinar: true
            }
          ],
          paginacion: {
            pagina: 1,
            limite: 20,
            total: 1,
            totalPaginas: 1
          }
        },
        tipo_mensaje: 'Segmentos.ListadosExitosamente',
        estado_respuesta: 200
      }
    }
  })
  async listarSegmentos(
    @Param() parametros: ParametrosRutaSegmentoDto,
    @Query('pagina') pagina: number = 1,
    @Query('limite') limite: number = 20,
    @Query('tipo') tipo?: string,
    @Query('estado') estado?: string,
    @Query('etiqueta') etiqueta?: string,
  ): Promise<RespuestaEstandar> {
    const filtros = {
      tiendaId: parametros.tiendaId,
      pagina: Math.max(1, pagina),
      limite: Math.min(Math.max(1, limite), 100),
      tipo,
      estado,
      etiqueta
    };

    return await this.listarSegmentosCasoUso.ejecutar(filtros);
  }

  @Get(':segmentoId')
  @ApiOperation({
    summary: 'Obtener segmento por ID',
    description: 'Obtiene los detalles completos de un segmento específico'
  })
  @ApiParam({
    name: 'segmentoId',
    description: 'ID del segmento a obtener',
    type: String
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Segmento obtenido exitosamente',
    schema: {
      example: {
        mensaje: 'Segmento obtenido exitosamente',
        data: {
          id: 'seg_abc123',
          nombre: 'Clientes VIP',
          descripcion: 'Segmento para clientes con alto valor',
          tipo: 'AUTOMATICO',
          estado: 'ACTIVO',
          porcentajeClientes: 15,
          cantidadClientes: 45,
          ultimaActividad: '2024-01-15T10:30:00.000Z',
          fechaCreacion: '2024-01-15T10:30:00.000Z',
          fechaActualizacion: '2024-01-15T10:30:00.000Z',
          tiendaId: 'tienda-123',
          etiquetas: ['VIP', 'AltoValor'],
          esPublico: true,
          puedeCombinar: true,
          reglas: {
            logica: 'Y',
            condiciones: [
              {
                campo: 'total_gastado',
                operador: 'MAYOR_QUE',
                valor: 1000
              },
              {
                campo: 'cantidad_pedidos',
                operador: 'MAYOR_O_IGUAL_QUE',
                valor: 5
              }
            ]
          },
          clientes: [
            {
              id: 'cliente-123',
              nombre: 'Juan Pérez',
              email: 'juan@example.com',
              totalGastado: 1500,
              cantidadPedidos: 8
            }
          ]
        },
        tipo_mensaje: 'Segmento.ObtenidoExitosamente',
        estado_respuesta: 200
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Segmento no encontrado',
    schema: {
      example: {
        mensaje: 'Segmento no encontrado',
        data: null,
        tipo_mensaje: 'Segmento.NoEncontrado',
        estado_respuesta: 404
      }
    }
  })
  async obtenerSegmento(
    @Param() parametros: ParametrosRutaSegmentoDto,
  ): Promise<RespuestaEstandar> {
    return await this.listarSegmentosCasoUso.obtenerPorId(
      parametros.segmentoId,
      parametros.tiendaId
    );
  }

  @Put(':segmentoId')
  @ApiOperation({
    summary: 'Actualizar segmento',
    description: 'Actualiza los datos de un segmento existente'
  })
  @ApiParam({
    name: 'segmentoId',
    description: 'ID del segmento a actualizar',
    type: String
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Segmento actualizado exitosamente',
    schema: {
      example: {
        mensaje: 'Segmento actualizado exitosamente',
        data: {
          id: 'seg_abc123',
          nombre: 'Clientes VIP Actualizado',
          descripcion: 'Segmento actualizado para clientes con alto valor',
          tipo: 'AUTOMATICO',
          estado: 'ACTIVO',
          porcentajeClientes: 15,
          cantidadClientes: 45,
          ultimaActividad: '2024-01-15T10:30:00.000Z',
          fechaCreacion: '2024-01-15T10:30:00.000Z',
          fechaActualizacion: '2024-01-15T11:30:00.000Z',
          tiendaId: 'tienda-123',
          etiquetas: ['VIP', 'AltoValor', 'Actualizado'],
          esPublico: true,
          puedeCombinar: true
        },
        tipo_mensaje: 'Segmento.ActualizadoExitosamente',
        estado_respuesta: 200
      }
    }
  })
  async actualizarSegmento(
    @Param() parametros: ParametrosRutaSegmentoDto,
    @Body() datos: ActualizarSegmentoRequestDto,
  ): Promise<RespuestaEstandar> {
    return await this.actualizarSegmentoCasoUso.ejecutar({
      ...datos,
      segmentoId: parametros.segmentoId,
      tiendaId: parametros.tiendaId,
      actualizadorId: 'usuario-actual' // En producción, obtener del token JWT
    });
  }

  @Delete(':segmentoId')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Eliminar segmento',
    description: 'Elimina un segmento de clientes'
  })
  @ApiParam({
    name: 'segmentoId',
    description: 'ID del segmento a eliminar',
    type: String
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Segmento eliminado exitosamente',
    schema: {
      example: {
        mensaje: 'Segmento eliminado exitosamente',
        data: null,
        tipo_mensaje: 'Segmento.EliminadoExitosamente',
        estado_respuesta: 200
      }
    }
  })
  async eliminarSegmento(
    @Param() parametros: ParametrosRutaSegmentoDto,
  ): Promise<RespuestaEstandar> {
    return await this.eliminarSegmentoCasoUso.ejecutar({
      segmentoId: parametros.segmentoId,
      tiendaId: parametros.tiendaId,
      eliminadorId: 'usuario-actual' // En producción, obtener del token JWT
    });
  }

  @Post(':segmentoId/clientes/:clienteId')
  @ApiOperation({
    summary: 'Agregar cliente a segmento manual',
    description: 'Agrega un cliente específico a un segmento manual'
  })
  @ApiParam({
    name: 'segmentoId',
    description: 'ID del segmento al que agregar el cliente',
    type: String
  })
  @ApiParam({
    name: 'clienteId',
    description: 'ID del cliente a agregar',
    type: String
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Cliente agregado al segmento exitosamente',
    schema: {
      example: {
        mensaje: 'Cliente agregado al segmento exitosamente',
        data: {
          segmentoId: 'seg_abc123',
          clienteId: 'cliente-123',
          fechaAgregado: '2024-01-15T10:30:00.000Z'
        },
        tipo_mensaje: 'Segmento.ClienteAgregadoExitosamente',
        estado_respuesta: 200
      }
    }
  })
  async agregarClienteSegmento(
    @Param() parametros: ParametrosRutaSegmentoDto,
    @Body() datos: AgregarClienteSegmentoDto,
  ): Promise<RespuestaEstandar> {
    const dtoMembresia: AgregarClienteSegmentoDto = {
      segmentoId: parametros.segmentoId,
      clienteId: parametros.clienteId,
      tiendaId: parametros.tiendaId,
      ...datos
    };

    return await this.gestionarMembresiaSegmentoCasoUso.agregarCliente(dtoMembresia);
  }

  @Delete(':segmentoId/clientes/:clienteId')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Remover cliente de segmento manual',
    description: 'Remueve un cliente específico de un segmento manual'
  })
  @ApiParam({
    name: 'segmentoId',
    description: 'ID del segmento del que remover el cliente',
    type: String
  })
  @ApiParam({
    name: 'clienteId',
    description: 'ID del cliente a remover',
    type: String
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Cliente removido del segmento exitosamente',
    schema: {
      example: {
        mensaje: 'Cliente removido del segmento exitosamente',
        data: {
          segmentoId: 'seg_abc123',
          clienteId: 'cliente-123',
          fechaRemovido: '2024-01-15T10:30:00.000Z'
        },
        tipo_mensaje: 'Segmento.ClienteRemovidoExitosamente',
        estado_respuesta: 200
      }
    }
  })
  async removerClienteSegmento(
    @Param() parametros: ParametrosRutaSegmentoDto,
  ): Promise<RespuestaEstandar> {
    return await this.gestionarMembresiaSegmentoCasoUso.removerCliente({
      segmentoId: parametros.segmentoId,
      clienteId: parametros.clienteId,
      tiendaId: parametros.tiendaId,
      removerId: 'usuario-actual' // En producción, obtener del token JWT
    });
  }

  @Get(':segmentoId/clientes')
  @ApiOperation({
    summary: 'Listar clientes del segmento',
    description: 'Obtiene la lista de clientes pertenecientes a un segmento específico'
  })
  @ApiParam({
    name: 'segmentoId',
    description: 'ID del segmento del que obtener los clientes',
    type: String
  })
  @ApiQuery({
    name: 'pagina',
    required: false,
    description: 'Número de página para paginación',
    type: Number,
    example: 1
  })
  @ApiQuery({
    name: 'limite',
    required: false,
    description: 'Límite de resultados por página',
    type: Number,
    example: 20
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Clientes del segmento obtenidos exitosamente',
    schema: {
      example: {
        mensaje: 'Clientes del segmento obtenidos exitosamente',
        data: {
          clientes: [
            {
              id: 'cliente-123',
              nombre: 'Juan Pérez',
              email: 'juan@example.com',
              telefono: '+1234567890',
              totalGastado: 1500,
              cantidadPedidos: 8,
              fechaRegistro: '2024-01-01T00:00:00.000Z',
              ultimaCompra: '2024-01-14T15:30:00.000Z',
              direccion: {
                calle: 'Av. Principal 123',
                ciudad: 'Lima',
                region: 'Lima',
                pais: 'Perú',
                codigoPostal: '15001'
              },
              suscripcionEmail: true,
              etiquetas: ['VIP', 'Frecuente']
            }
          ],
          paginacion: {
            pagina: 1,
            limite: 20,
            total: 1,
            totalPaginas: 1
          }
        },
        tipo_mensaje: 'Segmento.ClientesObtenidosExitosamente',
        estado_respuesta: 200
      }
    }
  })
  async listarClientesSegmento(
    @Param() parametros: ParametrosRutaSegmentoDto,
    @Query('pagina') pagina: number = 1,
    @Query('limite') limite: number = 20,
  ): Promise<RespuestaEstandar> {
    return await this.gestionarMembresiaSegmentoCasoUso.listarClientes({
      segmentoId: parametros.segmentoId,
      tiendaId: parametros.tiendaId,
      pagina: Math.max(1, pagina),
      limite: Math.min(Math.max(1, limite), 100)
    });
  }
}