import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
// Guards y decorators de autenticación (implementados en otros módulos)
// import { JwtAuthGuard } from '../../../autenticacion/presentacion/guards/jwt-auth.guard';
// import { RolesGuard } from '../../../autenticacion/presentacion/guards/roles.guard';
// import { Roles } from '../../../autenticacion/presentacion/decorators/roles.decorator';
// import { RolUsuario } from '../../../autenticacion/dominio/enums/rol-usuario.enum';
import { CrearPaqueteDto } from '../../aplicacion/dto/crear-paquete.dto';
import { CrearPaqueteCasoUso } from '../../dominio/casos-uso/crear-paquete.caso-uso';
import { ListarPaquetesCasoUso } from '../../dominio/casos-uso/listar-paquetes.caso-uso';
import { PaqueteProducto } from '../../dominio/entidades/paquete-producto.entity';

/**
 * Controlador para la gestión de paquetes de productos
 * Proporciona endpoints para CRUD completo de paquetes
 */
@ApiTags('Paquetes')
@ApiBearerAuth()
@Controller('api/v1/paquetes')
// @UseGuards(JwtAuthGuard, RolesGuard)
export class PaquetesController {
  constructor(
    private readonly crearPaqueteCasoUso: CrearPaqueteCasoUso,
    private readonly listarPaquetesCasoUso: ListarPaquetesCasoUso,
  ) {}

  @Post()
  // @Roles(RolUsuario.ADMIN, RolUsuario.EDITOR)
  @ApiOperation({
    summary: 'Crear un nuevo paquete de productos',
    description: 'Crea un nuevo paquete o combo de productos en el sistema',
  })
  @ApiResponse({
    status: 201,
    description: 'Paquete creado exitosamente',
    schema: {
      example: {
        mensaje: 'Paquete creado exitosamente',
        data: {
          id: 'paquete_123456789',
          nombre: 'Paquete Básico de Maquillaje',
          descripcion: 'Incluye base, rubor y máscara de pestañas',
          precio: 89.99,
          precioComparacion: 120.50,
          sku: 'PKG-MAQUILLAJE-BASICO',
          activo: true,
          fechaCreacion: '2024-01-01T00:00:00.000Z',
          fechaActualizacion: '2024-01-01T00:00:00.000Z',
          tiendaId: 'tienda_123456789',
          creadorId: 'usuario_123456789',
          items: [
            {
              id: 'item_123456789',
              productoId: 'prod_123456789',
              varianteId: 'var_123456789',
              cantidad: 1,
              precioUnitario: 45.50,
            },
          ],
          costoTotal: 45.50,
          margenGanancia: 97.78,
          ahorroCliente: 30.51,
          porcentajeAhorro: 25.33,
          ofreceAhorroSignificativo: true,
          tieneMargenValido: true,
        },
        tipo_mensaje: 'Exito',
        estado_respuesta: 201,
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Error de validación (SKU duplicado, precio inválido, etc.)',
    schema: {
      example: {
        mensaje: 'Ya existe un paquete con este SKU',
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: 400,
      },
    },
  })
  async crear(
    @Body() crearPaqueteDto: CrearPaqueteDto,
    // En una implementación real, obtendríamos el usuario del token JWT
    @Param('usuarioId') usuarioId: string = 'usuario_actual',
  ) {
    try {
      const paquete = await this.crearPaqueteCasoUso.ejecutar(
        {
          nombre: crearPaqueteDto.nombre,
          descripcion: crearPaqueteDto.descripcion,
          precio: crearPaqueteDto.precio,
          precioComparacion: crearPaqueteDto.precioComparacion,
          sku: crearPaqueteDto.sku,
          activo: crearPaqueteDto.activo ?? true,
          tiendaId: crearPaqueteDto.tiendaId,
          items: crearPaqueteDto.items,
        },
        usuarioId,
      );

      return {
        mensaje: 'Paquete creado exitosamente',
        data: this.aDto(paquete),
        tipo_mensaje: 'Exito',
        estado_respuesta: HttpStatus.CREATED,
      };
    } catch (error) {
      return {
        mensaje: error.message,
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: HttpStatus.BAD_REQUEST,
      };
    }
  }

  @Get()
  // @Roles(RolUsuario.ADMIN, RolUsuario.EDITOR, RolUsuario.VENDEDOR)
  @ApiOperation({
    summary: 'Listar paquetes de productos',
    description: 'Obtiene una lista paginada de paquetes con filtros opcionales',
  })
  @ApiQuery({
    name: 'pagina',
    required: false,
    type: Number,
    description: 'Número de página (por defecto: 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'limite',
    required: false,
    type: Number,
    description: 'Límite de elementos por página (por defecto: 20, máximo: 100)',
    example: 20,
  })
  @ApiQuery({
    name: 'activo',
    required: false,
    type: Boolean,
    description: 'Filtrar por estado activo/inactivo',
    example: true,
  })
  @ApiQuery({
    name: 'busqueda',
    required: false,
    type: String,
    description: 'Texto para buscar en nombre, descripción o SKU',
    example: 'maquillaje',
  })
  @ApiQuery({
    name: 'tienda_id',
    required: false,
    type: String,
    description: 'Filtrar por ID de tienda',
    example: 'tienda_123456789',
  })
  @ApiQuery({
    name: 'ordenar_por',
    required: false,
    type: String,
    description: 'Campo para ordenar (nombre, precio, fecha_creacion)',
    example: 'precio',
  })
  @ApiQuery({
    name: 'orden',
    required: false,
    type: String,
    description: 'Dirección del orden (asc, desc)',
    example: 'desc',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de paquetes obtenida exitosamente',
    schema: {
      example: {
        mensaje: 'Lista de paquetes obtenida exitosamente',
        data: {
          elementos: [
            {
              id: 'paquete_123456789',
              nombre: 'Paquete Básico de Maquillaje',
              descripcion: 'Incluye base, rubor y máscara de pestañas',
              precio: 89.99,
              precioComparacion: 120.50,
              sku: 'PKG-MAQUILLAJE-BASICO',
              activo: true,
              fechaCreacion: '2024-01-01T00:00:00.000Z',
              fechaActualizacion: '2024-01-01T00:00:00.000Z',
              tiendaId: 'tienda_123456789',
              creadorId: 'usuario_123456789',
              items: [
                {
                  id: 'item_123456789',
                  productoId: 'prod_123456789',
                  varianteId: 'var_123456789',
                  cantidad: 1,
                  precioUnitario: 45.50,
                },
              ],
              costoTotal: 45.50,
              margenGanancia: 97.78,
              ahorroCliente: 30.51,
              porcentajeAhorro: 25.33,
              ofreceAhorroSignificativo: true,
              tieneMargenValido: true,
            },
          ],
          paginacion: {
            total_elementos: 100,
            total_paginas: 10,
            pagina_actual: 1,
            limite: 10,
            tiene_siguiente: true,
            tiene_anterior: false,
          },
        },
        tipo_mensaje: 'Exito',
        estado_respuesta: 200,
      },
    },
  })
  async listar(
    @Query('pagina') pagina: number = 1,
    @Query('limite') limite: number = 20,
    @Query('activo') activo?: boolean,
    @Query('busqueda') busqueda?: string,
    @Query('tienda_id') tiendaId?: string,
    @Query('ordenar_por') ordenarPor?: string,
    @Query('orden') orden?: 'asc' | 'desc',
  ) {
    try {
      const resultado = await this.listarPaquetesCasoUso.ejecutar({
        pagina: Number(pagina),
        limite: Number(limite),
        activo: activo !== undefined ? Boolean(activo) : undefined,
        busqueda,
        tiendaId,
        ordenarPor,
        orden,
      });

      return {
        mensaje: 'Lista de paquetes obtenida exitosamente',
        data: {
          elementos: resultado.paquetes.map((paquete) => this.aDto(paquete)),
          paginacion: resultado.paginacion,
        },
        tipo_mensaje: 'Exito',
        estado_respuesta: HttpStatus.OK,
      };
    } catch (error) {
      return {
        mensaje: error.message,
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: HttpStatus.BAD_REQUEST,
      };
    }
  }

  @Get('estadisticas')
  // @Roles(RolUsuario.ADMIN, RolUsuario.EDITOR)
  @ApiOperation({
    summary: 'Obtener estadísticas de paquetes',
    description: 'Obtiene estadísticas generales sobre los paquetes del sistema',
  })
  @ApiQuery({
    name: 'tienda_id',
    required: false,
    type: String,
    description: 'Filtrar por ID de tienda',
    example: 'tienda_123456789',
  })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas obtenidas exitosamente',
    schema: {
      example: {
        mensaje: 'Estadísticas de paquetes obtenidas exitosamente',
        data: {
          totalPaquetes: 50,
          paquetesActivos: 45,
          paquetesInactivos: 5,
          paquetesNuevosHoy: 3,
          promedioPrecio: 150.75,
          paquetesConAhorro: 40,
        },
        tipo_mensaje: 'Exito',
        estado_respuesta: 200,
      },
    },
  })
  async obtenerEstadisticas(@Query('tienda_id') tiendaId?: string) {
    try {
      const repositorio = this.listarPaquetesCasoUso['repositorioPaquete'];
      const estadisticas = await repositorio.obtenerEstadisticas(tiendaId);

      return {
        mensaje: 'Estadísticas de paquetes obtenidas exitosamente',
        data: estadisticas,
        tipo_mensaje: 'Exito',
        estado_respuesta: HttpStatus.OK,
      };
    } catch (error) {
      return {
        mensaje: error.message,
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: HttpStatus.BAD_REQUEST,
      };
    }
  }

  @Get('disponibilidad/:id')
  // @Roles(RolUsuario.ADMIN, RolUsuario.EDITOR, RolUsuario.VENDEDOR)
  @ApiOperation({
    summary: 'Verificar disponibilidad de paquete',
    description: 'Verifica la disponibilidad de inventario para un paquete específico',
  })
  @ApiResponse({
    status: 200,
    description: 'Disponibilidad verificada exitosamente',
    schema: {
      example: {
        mensaje: 'Disponibilidad verificada exitosamente',
        data: {
          disponible: true,
          productosFaltantes: [],
        },
        tipo_mensaje: 'Exito',
        estado_respuesta: 200,
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Paquete no disponible',
    schema: {
      example: {
        mensaje: 'Paquete no disponible',
        data: {
          disponible: false,
          productosFaltantes: [
            {
              productoId: 'prod_123456789',
              varianteId: 'var_123456789',
              cantidadRequerida: 2,
              cantidadDisponible: 1,
            },
          ],
        },
        tipo_mensaje: 'Advertencia',
        estado_respuesta: 200,
      },
    },
  })
  async verificarDisponibilidad(@Param('id') id: string) {
    try {
      const repositorio = this.listarPaquetesCasoUso['repositorioPaquete'];
      const disponibilidad = await repositorio.verificarDisponibilidad(id);

      return {
        mensaje: disponibilidad.disponible 
          ? 'Paquete disponible' 
          : 'Paquete no disponible',
        data: disponibilidad,
        tipo_mensaje: disponibilidad.disponible ? 'Exito' : 'Advertencia',
        estado_respuesta: HttpStatus.OK,
      };
    } catch (error) {
      return {
        mensaje: error.message,
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: HttpStatus.BAD_REQUEST,
      };
    }
  }

  @Get('buscar-por-producto/:productoId')
  // @Roles(RolUsuario.ADMIN, RolUsuario.EDITOR, RolUsuario.VENDEDOR)
  @ApiOperation({
    summary: 'Buscar paquetes por producto',
    description: 'Obtiene todos los paquetes que contienen un producto específico',
  })
  @ApiQuery({
    name: 'variante_id',
    required: false,
    type: String,
    description: 'ID de la variante específica',
    example: 'var_123456789',
  })
  @ApiResponse({
    status: 200,
    description: 'Búsqueda completada exitosamente',
    schema: {
      example: {
        mensaje: 'Búsqueda completada exitosamente',
        data: {
          elementos: [
            {
              id: 'paquete_123456789',
              nombre: 'Paquete Básico de Maquillaje',
              descripcion: 'Incluye base, rubor y máscara de pestañas',
              precio: 89.99,
              precioComparacion: 120.50,
              sku: 'PKG-MAQUILLAJE-BASICO',
              activo: true,
              fechaCreacion: '2024-01-01T00:00:00.000Z',
              fechaActualizacion: '2024-01-01T00:00:00.000Z',
              tiendaId: 'tienda_123456789',
              creadorId: 'usuario_123456789',
              cantidadEnPaquete: 1,
            },
          ],
        },
        tipo_mensaje: 'Exito',
        estado_respuesta: 200,
      },
    },
  })
  async buscarPorProducto(
    @Param('productoId') productoId: string,
    @Query('variante_id') varianteId?: string,
  ) {
    try {
      const repositorio = this.listarPaquetesCasoUso['repositorioPaquete'];
      const paquetes = await repositorio.buscarPorProducto(productoId, varianteId);

      return {
        mensaje: 'Búsqueda completada exitosamente',
        data: { elementos: paquetes },
        tipo_mensaje: 'Exito',
        estado_respuesta: HttpStatus.OK,
      };
    } catch (error) {
      return {
        mensaje: error.message,
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: HttpStatus.BAD_REQUEST,
      };
    }
  }

  @Get(':id')
  // @Roles(RolUsuario.ADMIN, RolUsuario.EDITOR, RolUsuario.VENDEDOR)
  @ApiOperation({
    summary: 'Obtener paquete por ID',
    description: 'Obtiene la información completa de un paquete específico',
  })
  @ApiResponse({
    status: 200,
    description: 'Paquete obtenido exitosamente',
    schema: {
      example: {
        mensaje: 'Paquete obtenido exitosamente',
        data: {
          id: 'paquete_123456789',
          nombre: 'Paquete Básico de Maquillaje',
          descripcion: 'Incluye base, rubor y máscara de pestañas',
          precio: 89.99,
          precioComparacion: 120.50,
          sku: 'PKG-MAQUILLAJE-BASICO',
          activo: true,
          fechaCreacion: '2024-01-01T00:00:00.000Z',
          fechaActualizacion: '2024-01-01T00:00:00.000Z',
          tiendaId: 'tienda_123456789',
          creadorId: 'usuario_123456789',
          items: [
            {
              id: 'item_123456789',
              productoId: 'prod_123456789',
              varianteId: 'var_123456789',
              cantidad: 1,
              precioUnitario: 45.50,
            },
          ],
          costoTotal: 45.50,
          margenGanancia: 97.78,
          ahorroCliente: 30.51,
          porcentajeAhorro: 25.33,
          ofreceAhorroSignificativo: true,
          tieneMargenValido: true,
        },
        tipo_mensaje: 'Exito',
        estado_respuesta: 200,
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Paquete no encontrado',
    schema: {
      example: {
        mensaje: 'Paquete no encontrado',
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: 404,
      },
    },
  })
  async obtenerPorId(@Param('id') id: string) {
    try {
      const repositorio = this.listarPaquetesCasoUso['repositorioPaquete'];
      const paquete = await repositorio.buscarPorId(id);

      if (!paquete) {
        return {
          mensaje: 'Paquete no encontrado',
          data: null,
          tipo_mensaje: 'ErrorCliente',
          estado_respuesta: HttpStatus.NOT_FOUND,
        };
      }

      // Convertir a entidad de dominio para calcular métricas
      const paqueteEntity = new PaqueteProducto(
        paquete.id,
        paquete.nombre,
        paquete.descripcion,
        paquete.precio,
        paquete.precioComparacion,
        paquete.sku,
        paquete.activo,
        paquete.fechaCreacion,
        paquete.fechaActualizacion,
        paquete.tiendaId,
        paquete.creadorId,
        paquete.items.map(item => ({
          id: item.id,
          productoId: item.productoId,
          varianteId: item.varianteId,
          cantidad: item.cantidad,
          precioUnitario: item.precioUnitario || 0,
        })),
      );

      return {
        mensaje: 'Paquete obtenido exitosamente',
        data: this.aDto(paqueteEntity),
        tipo_mensaje: 'Exito',
        estado_respuesta: HttpStatus.OK,
      };
    } catch (error) {
      return {
        mensaje: error.message,
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: HttpStatus.BAD_REQUEST,
      };
    }
  }

  /**
   * Convierte una entidad PaqueteProducto a un DTO para la respuesta
   */
  private aDto(paquete: PaqueteProducto) {
    return {
      id: paquete.id,
      nombre: paquete.nombre,
      descripcion: paquete.descripcion,
      precio: paquete.precio,
      precioComparacion: paquete.precioComparacion,
      sku: paquete.sku,
      activo: paquete.activo,
      fechaCreacion: paquete.fechaCreacion,
      fechaActualizacion: paquete.fechaActualizacion,
      tiendaId: paquete.tiendaId,
      creadorId: paquete.creadorId,
      items: paquete.items,
      costoTotal: paquete.calcularCostoTotal(),
      margenGanancia: paquete.calcularMargenGanancia(),
      ahorroCliente: paquete.obtenerAhorroCliente(),
      porcentajeAhorro: paquete.obtenerPorcentajeAhorro(),
      ofreceAhorroSignificativo: paquete.ofreceAhorroSignificativo(),
      tieneMargenValido: paquete.tieneMargenValido(),
    };
  }
}