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
import { CrearDescuentoDto } from '../../aplicacion/dto/crear-descuento.dto';
import { CrearDescuentoCasoUso } from '../../dominio/casos-uso/crear-descuento.caso-uso';
import { ListarDescuentosCasoUso, ParametrosListarDescuentos } from '../../dominio/casos-uso/listar-descuentos.caso-uso';
import { Descuento } from '../../dominio/entidades/descuento.entity';
import { TipoDescuento } from '../../dominio/enums/tipo-descuento.enum';

/**
 * Controlador para la gestión de descuentos y promociones
 * Proporciona endpoints para CRUD completo de descuentos
 */
@ApiTags('Descuentos')
@ApiBearerAuth()
@Controller('api/v1/descuentos')
// @UseGuards(JwtAuthGuard, RolesGuard)
export class DescuentosController {
  constructor(
    private readonly crearDescuentoCasoUso: CrearDescuentoCasoUso,
    private readonly listarDescuentosCasoUso: ListarDescuentosCasoUso,
  ) {}

  @Post()
  // @Roles(RolUsuario.ADMIN, RolUsuario.EDITOR)
  @ApiOperation({
    summary: 'Crear un nuevo descuento o promoción',
    description: 'Crea un nuevo descuento en el sistema con la información proporcionada',
  })
  @ApiResponse({
    status: 201,
    description: 'Descuento creado exitosamente',
    schema: {
      example: {
        mensaje: 'Descuento creado exitosamente',
        data: {
          id: 'descuento_123456789',
          codigo: 'VERANO2024',
          tipo: 'PORCENTAJE',
          valor: 15,
          valorMinimo: 100,
          usosMaximos: 100,
          usosActuales: 0,
          fechaInicio: '2024-01-01T00:00:00.000Z',
          fechaFin: '2024-12-31T23:59:59.999Z',
          activo: true,
          fechaCreacion: '2024-01-01T00:00:00.000Z',
          fechaActualizacion: '2024-01-01T00:00:00.000Z',
        },
        tipo_mensaje: 'Exito',
        estado_respuesta: 201,
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Error de validación (código duplicado, datos inválidos)',
    schema: {
      example: {
        mensaje: 'Ya existe un descuento con este código',
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: 400,
      },
    },
  })
  async crear(@Body() crearDescuentoDto: CrearDescuentoDto) {
    return await this.crearDescuentoCasoUso.ejecutar({
      codigo: crearDescuentoDto.codigo,
      tipo: crearDescuentoDto.tipo,
      valor: crearDescuentoDto.valor,
      valorMinimo: crearDescuentoDto.valorMinimo ?? null,
      usosMaximos: crearDescuentoDto.usosMaximos ?? null,
      fechaInicio: crearDescuentoDto.fechaInicio ? new Date(crearDescuentoDto.fechaInicio) : null,
      fechaFin: crearDescuentoDto.fechaFin ? new Date(crearDescuentoDto.fechaFin) : null,
      // Nuevos campos para descuentos avanzados
      configuracionAvanzada: crearDescuentoDto.configuracionAvanzada ?? null,
      reglasValidacion: crearDescuentoDto.reglasValidacion ?? null,
      restricciones: crearDescuentoDto.restricciones ?? null,
      nombreCampana: crearDescuentoDto.nombreCampana ?? null,
      utmSource: crearDescuentoDto.utmSource ?? null,
      utmMedium: crearDescuentoDto.utmMedium ?? null,
      utmCampaign: crearDescuentoDto.utmCampaign ?? null,
      cantidadLleva: crearDescuentoDto.cantidadLleva ?? null,
      cantidadPaga: crearDescuentoDto.cantidadPaga ?? null,
      productosAplicables: crearDescuentoDto.productosAplicables ?? [],
      coleccionesAplicables: crearDescuentoDto.coleccionesAplicables ?? [],
      paisesPermitidos: crearDescuentoDto.paisesPermitidos ?? [],
      segmentosPermitidos: crearDescuentoDto.segmentosPermitidos ?? [],
      requisitosMinimos: crearDescuentoDto.requisitosMinimos ?? null,
    });
  }

  @Get()
  // @Roles(RolUsuario.ADMIN, RolUsuario.EDITOR, RolUsuario.VENDEDOR)
  @ApiOperation({
    summary: 'Listar descuentos',
    description: 'Obtiene una lista paginada de descuentos con filtros opcionales',
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
    name: 'tipo',
    required: false,
    enum: TipoDescuento,
    description: 'Filtrar por tipo de descuento',
    example: TipoDescuento.PORCENTAJE,
  })
  @ApiQuery({
    name: 'busqueda',
    required: false,
    type: String,
    description: 'Texto para buscar en código de descuento',
    example: 'VERANO',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de descuentos obtenida exitosamente',
    schema: {
      example: {
        mensaje: 'Lista de descuentos obtenida exitosamente',
        data: {
          elementos: [
            {
              id: 'descuento_123456789',
              codigo: 'VERANO2024',
              tipo: 'PORCENTAJE',
              valor: 15,
              valorMinimo: 100,
              usosMaximos: 100,
              usosActuales: 0,
              fechaInicio: '2024-01-01T00:00:00.000Z',
              fechaFin: '2024-12-31T23:59:59.999Z',
              activo: true,
              fechaCreacion: '2024-01-01T00:00:00.000Z',
              fechaActualizacion: '2024-01-01T00:00:00.000Z',
            },
          ],
          paginacion: {
            total_elementos: 50,
            total_paginas: 5,
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
    @Query('tipo') tipo?: TipoDescuento,
    @Query('busqueda') busqueda?: string,
  ) {
    const parametros: ParametrosListarDescuentos = {
      pagina: Number(pagina),
      limite: Number(limite),
      activo: activo !== undefined ? Boolean(activo) : undefined,
      tipo,
      busqueda,
    };

    return await this.listarDescuentosCasoUso.ejecutar(parametros);
  }

  @Get('validar/:codigo')
  // @Roles(RolUsuario.ADMIN, RolUsuario.EDITOR, RolUsuario.VENDEDOR)
  @ApiOperation({
    summary: 'Validar descuento',
    description: 'Valida si un código de descuento es válido y puede ser aplicado',
  })
  @ApiResponse({
    status: 200,
    description: 'Descuento validado exitosamente',
    schema: {
      example: {
        mensaje: 'Descuento válido',
        data: {
          id: 'descuento_123456789',
          codigo: 'VERANO2024',
          tipo: 'PORCENTAJE',
          valor: 15,
          valorMinimo: 100,
          usosMaximos: 100,
          usosActuales: 25,
          fechaInicio: '2024-01-01T00:00:00.000Z',
          fechaFin: '2024-12-31T23:59:59.999Z',
          activo: true,
          fechaCreacion: '2024-01-01T00:00:00.000Z',
          fechaActualizacion: '2024-01-01T00:00:00.000Z',
          descuentoAplicable: 15,
          descripcion: 'Descuento del 15%',
        },
        tipo_mensaje: 'Exito',
        estado_respuesta: 200,
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Descuento no válido',
    schema: {
      example: {
        mensaje: 'El descuento ha expirado',
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: 400,
      },
    },
  })
  async validar(
    @Param('codigo') codigo: string,
    @Query('monto') monto: number = 0,
  ) {
    return {
      mensaje: 'Endpoint de validar descuento - pendiente de implementación',
      data: null,
      tipo_mensaje: 'Advertencia',
      estado_respuesta: HttpStatus.NOT_IMPLEMENTED,
    };
  }

  @Get('estadisticas')
  // @Roles(RolUsuario.ADMIN, RolUsuario.EDITOR)
  @ApiOperation({
    summary: 'Obtener estadísticas de descuentos',
    description: 'Obtiene estadísticas generales sobre los descuentos del sistema',
  })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas obtenidas exitosamente',
    schema: {
      example: {
        mensaje: 'Estadísticas de descuentos obtenidas exitosamente',
        data: {
          totalDescuentos: 50,
          descuentosActivos: 35,
          descuentosInactivos: 15,
          descuentosPorTipo: {
            PORCENTAJE: 25,
            MONTO_FIJO: 15,
            ENVIO_GRATIS: 10,
          },
          totalUsos: 1500,
        },
        tipo_mensaje: 'Exito',
        estado_respuesta: 200,
      },
    },
  })
  async obtenerEstadisticas() {
    return {
      mensaje: 'Endpoint de estadísticas - pendiente de implementación',
      data: null,
      tipo_mensaje: 'Advertencia',
      estado_respuesta: HttpStatus.NOT_IMPLEMENTED,
    };
  }

  @Get('alertas/proximos-expirar')
  // @Roles(RolUsuario.ADMIN, RolUsuario.EDITOR)
  @ApiOperation({
    summary: 'Obtener descuentos próximos a expirar',
    description: 'Obtiene descuentos que están próximos a expirar en los próximos días',
  })
  @ApiQuery({
    name: 'dias',
    required: false,
    type: Number,
    description: 'Número de días para considerar próximos a expirar (por defecto: 7)',
    example: 7,
  })
  @ApiResponse({
    status: 200,
    description: 'Alertas obtenidas exitosamente',
    schema: {
      example: {
        mensaje: 'Descuentos próximos a expirar obtenidos exitosamente',
        data: {
          elementos: [
            {
              id: 'descuento_123456789',
              codigo: 'VERANO2024',
              tipo: 'PORCENTAJE',
              fechaFin: '2024-12-31T23:59:59.999Z',
              activo: true,
            },
          ],
          total: 1,
        },
        tipo_mensaje: 'Exito',
        estado_respuesta: 200,
      },
    },
  })
  async obtenerProximosAExpirar(@Query('dias') dias: number = 7) {
    return {
      mensaje: 'Endpoint de alertas próximos a expirar - pendiente de implementación',
      data: null,
      tipo_mensaje: 'Advertencia',
      estado_respuesta: HttpStatus.NOT_IMPLEMENTED,
    };
  }

  @Get('alertas/pocos-usos')
  // @Roles(RolUsuario.ADMIN, RolUsuario.EDITOR)
  @ApiOperation({
    summary: 'Obtener descuentos con pocos usos restantes',
    description: 'Obtiene descuentos que están cerca de alcanzar su límite de usos',
  })
  @ApiQuery({
    name: 'porcentaje',
    required: false,
    type: Number,
    description: 'Porcentaje mínimo de uso para considerar alerta (por defecto: 80)',
    example: 80,
  })
  @ApiResponse({
    status: 200,
    description: 'Alertas obtenidas exitosamente',
    schema: {
      example: {
        mensaje: 'Descuentos con pocos usos restantes obtenidos exitosamente',
        data: {
          elementos: [
            {
              id: 'descuento_123456789',
              codigo: 'VERANO2024',
              tipo: 'PORCENTAJE',
              usosActuales: 90,
              usosMaximos: 100,
              activo: true,
            },
          ],
          total: 1,
        },
        tipo_mensaje: 'Exito',
        estado_respuesta: 200,
      },
    },
  })
  async obtenerConPocosUsosRestantes(@Query('porcentaje') porcentaje: number = 80) {
    return {
      mensaje: 'Endpoint de alertas pocos usos - pendiente de implementación',
      data: null,
      tipo_mensaje: 'Advertencia',
      estado_respuesta: HttpStatus.NOT_IMPLEMENTED,
    };
  }

  @Get(':id')
  // @Roles(RolUsuario.ADMIN, RolUsuario.EDITOR, RolUsuario.VENDEDOR)
  @ApiOperation({
    summary: 'Obtener descuento por ID',
    description: 'Obtiene la información completa de un descuento específico',
  })
  @ApiResponse({
    status: 200,
    description: 'Descuento obtenido exitosamente',
    schema: {
      example: {
        mensaje: 'Descuento obtenido exitosamente',
        data: {
          id: 'descuento_123456789',
          codigo: 'VERANO2024',
          tipo: 'PORCENTAJE',
          valor: 15,
          valorMinimo: 100,
          usosMaximos: 100,
          usosActuales: 0,
          fechaInicio: '2024-01-01T00:00:00.000Z',
          fechaFin: '2024-12-31T23:59:59.999Z',
          activo: true,
          fechaCreacion: '2024-01-01T00:00:00.000Z',
          fechaActualizacion: '2024-01-01T00:00:00.000Z',
        },
        tipo_mensaje: 'Exito',
        estado_respuesta: 200,
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Descuento no encontrado',
    schema: {
      example: {
        mensaje: 'Descuento no encontrado',
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: 404,
      },
    },
  })
  async obtenerPorId(@Param('id') id: string) {
    return {
      mensaje: 'Endpoint de obtener por ID - pendiente de implementación',
      data: null,
      tipo_mensaje: 'Advertencia',
      estado_respuesta: HttpStatus.NOT_IMPLEMENTED,
    };
  }

  @Put(':id')
  // @Roles(RolUsuario.ADMIN, RolUsuario.EDITOR)
  @ApiOperation({
    summary: 'Actualizar descuento',
    description: 'Actualiza la información de un descuento existente',
  })
  @ApiResponse({
    status: 200,
    description: 'Descuento actualizado exitosamente',
    schema: {
      example: {
        mensaje: 'Descuento actualizado exitosamente',
        data: {
          id: 'descuento_123456789',
          codigo: 'VERANO2024',
          tipo: 'PORCENTAJE',
          valor: 20,
          valorMinimo: 100,
          usosMaximos: 100,
          usosActuales: 0,
          fechaInicio: '2024-01-01T00:00:00.000Z',
          fechaFin: '2024-12-31T23:59:59.999Z',
          activo: true,
          fechaCreacion: '2024-01-01T00:00:00.000Z',
          fechaActualizacion: '2024-01-02T00:00:00.000Z',
        },
        tipo_mensaje: 'Exito',
        estado_respuesta: 200,
      },
    },
  })
  async actualizar(@Param('id') id: string) {
    return {
      mensaje: 'Endpoint de actualización - pendiente de implementación',
      data: null,
      tipo_mensaje: 'Advertencia',
      estado_respuesta: HttpStatus.NOT_IMPLEMENTED,
    };
  }

  @Delete(':id')
  // @Roles(RolUsuario.ADMIN, RolUsuario.EDITOR)
  @ApiOperation({
    summary: 'Eliminar descuento',
    description: 'Elimina permanentemente un descuento del sistema',
  })
  @ApiResponse({
    status: 200,
    description: 'Descuento eliminado exitosamente',
    schema: {
      example: {
        mensaje: 'Descuento eliminado exitosamente',
        data: null,
        tipo_mensaje: 'Exito',
        estado_respuesta: 200,
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Descuento no encontrado',
    schema: {
      example: {
        mensaje: 'Descuento no encontrado',
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: 404,
      },
    },
  })
  async eliminar(@Param('id') id: string) {
    return {
      mensaje: 'Endpoint de eliminación - pendiente de implementación',
      data: null,
      tipo_mensaje: 'Advertencia',
      estado_respuesta: HttpStatus.NOT_IMPLEMENTED,
    };
  }
}