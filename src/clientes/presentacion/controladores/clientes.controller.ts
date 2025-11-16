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
import { CrearClienteDto } from '../../aplicacion/dto/crear-cliente.dto';
import { CrearClienteCasoUso } from '../../dominio/casos-uso/crear-cliente.caso-uso';
import { ListarClientesCasoUso } from '../../dominio/casos-uso/listar-clientes.caso-uso';
import { Cliente } from '../../dominio/entidades/cliente.entity';

/**
 * Controlador para la gestión de clientes
 * Proporciona endpoints para CRUD completo de clientes
 */
@ApiTags('Clientes')
@ApiBearerAuth()
@Controller('api/v1/clientes')
// @UseGuards(JwtAuthGuard, RolesGuard)
export class ClientesController {
  constructor(
    private readonly crearClienteCasoUso: CrearClienteCasoUso,
    private readonly listarClientesCasoUso: ListarClientesCasoUso,
  ) {}

  @Post()
  // @Roles(RolUsuario.ADMIN, RolUsuario.EDITOR, RolUsuario.VENDEDOR)
  @ApiOperation({
    summary: 'Crear un nuevo cliente',
    description: 'Crea un nuevo cliente en el sistema con la información proporcionada',
  })
  @ApiResponse({
    status: 201,
    description: 'Cliente creado exitosamente',
    schema: {
      example: {
        mensaje: 'Cliente creado exitosamente',
        data: {
          id: 'cliente_123456789',
          email: 'cliente@ejemplo.com',
          nombreCompleto: 'Juan Pérez García',
          telefono: '+51 987654321',
          activo: true,
          fechaCreacion: '2024-01-01T00:00:00.000Z',
          fechaActualizacion: '2024-01-01T00:00:00.000Z',
          creadorId: 'usuario_123456789',
        },
        tipo_mensaje: 'Exito',
        estado_respuesta: 201,
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Error de validación (email duplicado, formato inválido)',
    schema: {
      example: {
        mensaje: 'Ya existe un cliente con este email',
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: 400,
      },
    },
  })
  async crear(
    @Body() crearClienteDto: CrearClienteDto,
    // En una implementación real, obtendríamos el usuario del token JWT
    @Param('usuarioId') usuarioId: string = 'usuario_actual',
  ) {
    const cliente = await this.crearClienteCasoUso.ejecutar(
      {
        email: crearClienteDto.email,
        nombreCompleto: crearClienteDto.nombreCompleto,
        telefono: crearClienteDto.telefono ?? null,
      },
      usuarioId,
    );

    return {
      mensaje: 'Cliente creado exitosamente',
      data: this.aDto(cliente),
      tipo_mensaje: 'Exito',
      estado_respuesta: HttpStatus.CREATED,
    };
  }

  @Get()
  // @Roles(RolUsuario.ADMIN, RolUsuario.EDITOR, RolUsuario.VENDEDOR)
  @ApiOperation({
    summary: 'Listar clientes',
    description: 'Obtiene una lista paginada de clientes con filtros opcionales',
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
    description: 'Texto para buscar en email, nombre o teléfono',
    example: 'juan',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de clientes obtenida exitosamente',
    schema: {
      example: {
        mensaje: 'Lista de clientes obtenida exitosamente',
        data: {
          elementos: [
            {
              id: 'cliente_123456789',
              email: 'cliente@ejemplo.com',
              nombreCompleto: 'Juan Pérez García',
              telefono: '+51 987654321',
              activo: true,
              fechaCreacion: '2024-01-01T00:00:00.000Z',
              fechaActualizacion: '2024-01-01T00:00:00.000Z',
              creadorId: 'usuario_123456789',
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
    @Query('tags') tags?: string,
    @Query('fuente_cliente') fuenteCliente?: string,
    @Query('acepta_marketing') aceptaMarketing?: boolean,
    @Query('total_gastado_minimo') totalGastadoMinimo?: number,
    @Query('total_gastado_maximo') totalGastadoMaximo?: number,
    @Query('total_ordenes_minimo') totalOrdenesMinimo?: number,
    @Query('total_ordenes_maximo') totalOrdenesMaximo?: number,
    @Query('fecha_creacion_desde') fechaCreacionDesde?: string,
    @Query('fecha_creacion_hasta') fechaCreacionHasta?: string,
    @Query('fecha_ultima_orden_desde') fechaUltimaOrdenDesde?: string,
    @Query('fecha_ultima_orden_hasta') fechaUltimaOrdenHasta?: string,
    @Query('ordenar_por') ordenarPor?: string,
    @Query('orden') orden?: 'asc' | 'desc',
  ) {
    const filtros: any = {
      pagina: Number(pagina),
      limite: Number(limite),
      activo: activo !== undefined ? Boolean(activo) : undefined,
      busqueda,
      fuenteCliente,
      aceptaMarketing: aceptaMarketing !== undefined ? Boolean(aceptaMarketing) : undefined,
      totalGastadoMinimo: totalGastadoMinimo !== undefined ? Number(totalGastadoMinimo) : undefined,
      totalGastadoMaximo: totalGastadoMaximo !== undefined ? Number(totalGastadoMaximo) : undefined,
      totalOrdenesMinimo: totalOrdenesMinimo !== undefined ? Number(totalOrdenesMinimo) : undefined,
      totalOrdenesMaximo: totalOrdenesMaximo !== undefined ? Number(totalOrdenesMaximo) : undefined,
      ordenarPor,
      orden,
    };

    // Procesar tags
    if (tags) {
      filtros.tags = tags.split(',').map(tag => tag.trim());
    }

    // Procesar fechas
    if (fechaCreacionDesde) {
      filtros.fechaCreacionDesde = new Date(fechaCreacionDesde);
    }
    if (fechaCreacionHasta) {
      filtros.fechaCreacionHasta = new Date(fechaCreacionHasta);
    }
    if (fechaUltimaOrdenDesde) {
      filtros.fechaUltimaOrdenDesde = new Date(fechaUltimaOrdenDesde);
    }
    if (fechaUltimaOrdenHasta) {
      filtros.fechaUltimaOrdenHasta = new Date(fechaUltimaOrdenHasta);
    }

    const resultado = await this.listarClientesCasoUso.ejecutar(filtros);

    return {
      mensaje: 'Lista de clientes obtenida exitosamente',
      data: {
        elementos: resultado.clientes.map((cliente) => this.aDto(cliente)),
        paginacion: resultado.paginacion,
      },
      tipo_mensaje: 'Exito',
      estado_respuesta: HttpStatus.OK,
    };
  }

  @Get('estadisticas')
  // @Roles(RolUsuario.ADMIN, RolUsuario.EDITOR)
  @ApiOperation({
    summary: 'Obtener estadísticas de clientes',
    description: 'Obtiene estadísticas generales sobre los clientes del sistema',
  })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas obtenidas exitosamente',
    schema: {
      example: {
        mensaje: 'Estadísticas de clientes obtenidas exitosamente',
        data: {
          totalClientes: 150,
          clientesActivos: 120,
          clientesInactivos: 30,
          clientesNuevosHoy: 5,
        },
        tipo_mensaje: 'Exito',
        estado_respuesta: 200,
      },
    },
  })
  async obtenerEstadisticas() {
    // Obtener repositorio directamente para estadísticas avanzadas
    const repositorio = this.listarClientesCasoUso['repositorioCliente'];
    const estadisticas = await repositorio.obtenerEstadisticas();

    return {
      mensaje: 'Estadísticas de clientes obtenidas exitosamente',
      data: estadisticas,
      tipo_mensaje: 'Exito',
      estado_respuesta: HttpStatus.OK,
    };
  }

  @Get('buscar')
  // @Roles(RolUsuario.ADMIN, RolUsuario.EDITOR, RolUsuario.VENDEDOR)
  @ApiOperation({
    summary: 'Buscar clientes',
    description: 'Busca clientes por email, nombre o teléfono (búsqueda en tiempo real)',
  })
  @ApiQuery({
    name: 'q',
    required: true,
    type: String,
    description: 'Término de búsqueda',
    example: 'juan@ejemplo.com',
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
              id: 'cliente_123456789',
              email: 'juan@ejemplo.com',
              nombreCompleto: 'Juan Pérez García',
              telefono: '+51 987654321',
              activo: true,
              fechaCreacion: '2024-01-01T00:00:00.000Z',
              fechaActualizacion: '2024-01-01T00:00:00.000Z',
              creadorId: 'usuario_123456789',
            },
          ],
        },
        tipo_mensaje: 'Exito',
        estado_respuesta: 200,
      },
    },
  })
  async buscar(@Query('q') termino: string) {
    const resultado = await this.listarClientesCasoUso.ejecutar({
      pagina: 1,
      limite: 10,
      busqueda: termino,
    });

    return {
      mensaje: 'Búsqueda completada exitosamente',
      data: {
        elementos: resultado.clientes.map((cliente) => this.aDto(cliente)),
      },
      tipo_mensaje: 'Exito',
      estado_respuesta: HttpStatus.OK,
    };
  }

  @Get(':id')
  // @Roles(RolUsuario.ADMIN, RolUsuario.EDITOR, RolUsuario.VENDEDOR)
  @ApiOperation({
    summary: 'Obtener cliente por ID',
    description: 'Obtiene la información completa de un cliente específico',
  })
  @ApiResponse({
    status: 200,
    description: 'Cliente obtenido exitosamente',
    schema: {
      example: {
        mensaje: 'Cliente obtenido exitosamente',
        data: {
          id: 'cliente_123456789',
          email: 'cliente@ejemplo.com',
          nombreCompleto: 'Juan Pérez García',
          telefono: '+51 987654321',
          activo: true,
          fechaCreacion: '2024-01-01T00:00:00.000Z',
          fechaActualizacion: '2024-01-01T00:00:00.000Z',
          creadorId: 'usuario_123456789',
        },
        tipo_mensaje: 'Exito',
        estado_respuesta: 200,
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Cliente no encontrado',
    schema: {
      example: {
        mensaje: 'Cliente no encontrado',
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: 404,
      },
    },
  })
  async obtenerPorId(@Param('id') id: string) {
    // Implementar lógica para obtener cliente por ID
    throw new Error('Endpoint de obtención por ID - pendiente de implementación');
  }

  @Put(':id')
  // @Roles(RolUsuario.ADMIN, RolUsuario.EDITOR, RolUsuario.VENDEDOR)
  @ApiOperation({
    summary: 'Actualizar cliente',
    description: 'Actualiza la información de un cliente existente',
  })
  @ApiResponse({
    status: 200,
    description: 'Cliente actualizado exitosamente',
    schema: {
      example: {
        mensaje: 'Cliente actualizado exitosamente',
        data: {
          id: 'cliente_123456789',
          email: 'cliente@ejemplo.com',
          nombreCompleto: 'Juan Pérez García Actualizado',
          telefono: '+51 987654321',
          activo: true,
          fechaCreacion: '2024-01-01T00:00:00.000Z',
          fechaActualizacion: '2024-01-02T00:00:00.000Z',
          creadorId: 'usuario_123456789',
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
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Eliminar cliente',
    description: 'Elimina permanentemente un cliente del sistema',
  })
  @ApiResponse({
    status: 204,
    description: 'Cliente eliminado exitosamente',
  })
  @ApiResponse({
    status: 200,
    description: 'Cliente no encontrado',
    schema: {
      example: {
        mensaje: 'Cliente no encontrado',
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

  @Get('exportar/csv')
  @ApiOperation({
    summary: 'Exportar clientes a CSV',
    description: 'Exporta clientes a formato CSV con filtros avanzados',
  })
  @ApiQuery({
    name: 'activo',
    required: false,
    type: Boolean,
    description: 'Filtrar por estado activo/inactivo',
  })
  @ApiQuery({
    name: 'tags',
    required: false,
    type: String,
    description: 'Tags separados por coma para filtrar',
  })
  @ApiQuery({
    name: 'fuente_cliente',
    required: false,
    type: String,
    description: 'Filtrar por fuente del cliente',
  })
  @ApiQuery({
    name: 'acepta_marketing',
    required: false,
    type: Boolean,
    description: 'Filtrar por aceptación de marketing',
  })
  @ApiQuery({
    name: 'total_gastado_minimo',
    required: false,
    type: Number,
    description: 'Filtrar por gasto mínimo',
  })
  @ApiQuery({
    name: 'total_gastado_maximo',
    required: false,
    type: Number,
    description: 'Filtrar por gasto máximo',
  })
  @ApiQuery({
    name: 'total_ordenes_minimo',
    required: false,
    type: Number,
    description: 'Filtrar por número mínimo de órdenes',
  })
  @ApiQuery({
    name: 'total_ordenes_maximo',
    required: false,
    type: Number,
    description: 'Filtrar por número máximo de órdenes',
  })
  @ApiQuery({
    name: 'fecha_creacion_desde',
    required: false,
    type: String,
    description: 'Filtrar por fecha de creación desde',
  })
  @ApiQuery({
    name: 'fecha_creacion_hasta',
    required: false,
    type: String,
    description: 'Filtrar por fecha de creación hasta',
  })
  async exportarCSV(
    @Query('activo') activo?: boolean,
    @Query('tags') tags?: string,
    @Query('fuente_cliente') fuenteCliente?: string,
    @Query('acepta_marketing') aceptaMarketing?: boolean,
    @Query('total_gastado_minimo') totalGastadoMinimo?: number,
    @Query('total_gastado_maximo') totalGastadoMaximo?: number,
    @Query('total_ordenes_minimo') totalOrdenesMinimo?: number,
    @Query('total_ordenes_maximo') totalOrdenesMaximo?: number,
    @Query('fecha_creacion_desde') fechaCreacionDesde?: string,
    @Query('fecha_creacion_hasta') fechaCreacionHasta?: string,
  ) {
    const filtros: any = {
      activo: activo !== undefined ? Boolean(activo) : undefined,
      fuenteCliente,
      aceptaMarketing: aceptaMarketing !== undefined ? Boolean(aceptaMarketing) : undefined,
      totalGastadoMinimo: totalGastadoMinimo !== undefined ? Number(totalGastadoMinimo) : undefined,
      totalGastadoMaximo: totalGastadoMaximo !== undefined ? Number(totalGastadoMaximo) : undefined,
      totalOrdenesMinimo: totalOrdenesMinimo !== undefined ? Number(totalOrdenesMinimo) : undefined,
      totalOrdenesMaximo: totalOrdenesMaximo !== undefined ? Number(totalOrdenesMaximo) : undefined,
    };

    if (tags) {
      filtros.tags = tags.split(',').map(tag => tag.trim());
    }

    if (fechaCreacionDesde) {
      filtros.fechaCreacionDesde = new Date(fechaCreacionDesde);
    }
    if (fechaCreacionHasta) {
      filtros.fechaCreacionHasta = new Date(fechaCreacionHasta);
    }

    const repositorio = this.listarClientesCasoUso['repositorioCliente'];
    const csvData = await repositorio.exportarCSV(filtros);

    return {
      mensaje: 'Clientes exportados exitosamente a CSV',
      data: {
        csv: csvData,
        nombre_archivo: `clientes_${new Date().toISOString().split('T')[0]}.csv`,
        total_registros: csvData.split('\n').length - 1, // Excluir encabezado
      },
      tipo_mensaje: 'Exito',
      estado_respuesta: HttpStatus.OK,
    };
  }

  @Post('importar/csv')
  @ApiOperation({
    summary: 'Importar clientes desde CSV',
    description: 'Importa clientes desde un archivo CSV',
  })
  @ApiResponse({
    status: 200,
    description: 'Clientes importados exitosamente',
    schema: {
      example: {
        mensaje: 'Clientes importados exitosamente',
        data: {
          exitosos: 10,
          fallidos: 2,
          errores: [
            { linea: 5, error: 'Email inválido' },
            { linea: 8, error: 'Nombre completo requerido' }
          ],
        },
        tipo_mensaje: 'Exito',
        estado_respuesta: 200,
      },
    },
  })
  async importarCSV(
    @Body() body: { csvData: string },
    // En una implementación real, obtendríamos el usuario del token JWT
    @Param('usuarioId') usuarioId: string = 'usuario_actual',
  ) {
    const repositorio = this.listarClientesCasoUso['repositorioCliente'];
    const resultado = await repositorio.importarCSV(body.csvData, usuarioId);

    return {
      mensaje: 'Importación de clientes completada',
      data: resultado,
      tipo_mensaje: 'Exito',
      estado_respuesta: HttpStatus.OK,
    };
  }

  @Get('segmentos')
  @ApiOperation({
    summary: 'Obtener segmentos de clientes',
    description: 'Obtiene todos los segmentos de clientes disponibles',
  })
  async obtenerSegmentos() {
    const repositorio = this.listarClientesCasoUso['repositorioCliente'];
    const segmentos = await repositorio.obtenerSegmentos();

    return {
      mensaje: 'Segmentos obtenidos exitosamente',
      data: { elementos: segmentos },
      tipo_mensaje: 'Exito',
      estado_respuesta: HttpStatus.OK,
    };
  }

  @Post('segmentos/aplicar-automaticos')
  @ApiOperation({
    summary: 'Aplicar segmentos automáticos',
    description: 'Aplica segmentos automáticos a todos los clientes',
  })
  async aplicarSegmentosAutomaticos() {
    const repositorio = this.listarClientesCasoUso['repositorioCliente'];
    const resultado = await repositorio.aplicarSegmentosAutomaticos();

    return {
      mensaje: 'Segmentos automáticos aplicados exitosamente',
      data: resultado,
      tipo_mensaje: 'Exito',
      estado_respuesta: HttpStatus.OK,
    };
  }

  /**
   * Convierte una entidad Cliente a un DTO para la respuesta
   */
  private aDto(cliente: Cliente) {
    return {
      id: cliente.id,
      email: cliente.email,
      nombreCompleto: cliente.nombreCompleto,
      telefono: cliente.telefono,
      activo: cliente.activo,
      fechaCreacion: cliente.fechaCreacion,
      fechaActualizacion: cliente.fechaActualizacion,
      creadorId: cliente.creadorId,
      totalGastado: cliente.totalGastado,
      totalOrdenes: cliente.totalOrdenes,
      fechaUltimaOrden: cliente.fechaUltimaOrden,
      tags: cliente.tags,
      notas: cliente.notas,
      aceptaMarketing: cliente.aceptaMarketing,
      fuenteCliente: cliente.fuenteCliente,
      valorPromedioOrden: cliente.obtenerValorPromedioOrden(),
      esClienteFrecuente: cliente.esClienteFrecuente(),
      esClienteValioso: cliente.esClienteValioso(),
    };
  }
}