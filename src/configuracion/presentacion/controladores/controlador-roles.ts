/**
 * Controlador para la gestión de configuración de roles
 * Maneja las operaciones CRUD para roles personalizados y configuración de seguridad
 */
import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { GestionRolesCasoUso } from '../../dominio/casos-uso/gestion-roles.caso-uso';
import { CrearRolPersonalizadoDto } from 'src/configuracion/aplicacion/dto/crear-rol-personalizado.dto';
import { ActualizarRolPersonalizadoDto } from 'src/configuracion/aplicacion/dto/actualizar-rol-personalizado.dto';
import { ActualizarConfiguracionSeguridadDto } from 'src/configuracion/aplicacion/dto/actualizar-configuracion-seguridad.dto';

@ApiTags('Configuración - Roles')
@ApiBearerAuth()
@Controller('configuracion/tiendas/:tiendaId/roles')
export class ControladorRoles {
  constructor(
    private readonly gestionRolesCasoUso: GestionRolesCasoUso,
  ) {}

  /**
   * Obtiene todos los roles disponibles (predeterminados y personalizados)
   */
  @Get()
  @ApiOperation({ 
    summary: 'Obtener todos los roles',
    description: 'Retorna la lista completa de roles predeterminados y personalizados de la tienda'
  })
  @ApiParam({ name: 'tiendaId', description: 'ID de la tienda' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de roles obtenida exitosamente',
    schema: {
      example: {
        mensaje: 'Roles obtenidos exitosamente',
        data: {
          rolesPredeterminados: [
            {
              nombre: 'Administrador',
              descripcion: 'Rol con acceso completo',
              permisos: ['acceso_completo'],
              restricciones: [],
              gestionadoPorSistema: true,
              numeroEmpleados: 0
            }
          ],
          rolesPersonalizados: [
            {
              id: 'rol-123',
              nombre: 'Supervisor',
              descripcion: 'Rol para supervisores',
              permisos: ['ver_reportes', 'gestionar_empleados'],
              restricciones: ['sin_acceso_financiero'],
              numeroEmpleados: 2,
              fechaCreacion: '2024-01-01T00:00:00.000Z'
            }
          ]
        },
        tipo_mensaje: 'Roles.ObtenidosExitosamente',
        estado_respuesta: 200
      }
    }
  })
  async obtenerRoles(@Param('tiendaId') tiendaId: string) {
    return await this.gestionRolesCasoUso.obtenerRoles(tiendaId);
  }

  /**
   * Crea un nuevo rol personalizado
   */
  @Post('personalizados')
  @ApiOperation({ 
    summary: 'Crear rol personalizado',
    description: 'Crea un nuevo rol personalizado para la tienda'
  })
  @ApiParam({ name: 'tiendaId', description: 'ID de la tienda' })
  @ApiResponse({ 
    status: 201, 
    description: 'Rol personalizado creado exitosamente',
    schema: {
      example: {
        mensaje: 'Rol personalizado creado exitosamente',
        data: null,
        tipo_mensaje: 'Roles.CreadoExitosamente',
        estado_respuesta: 201
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Error de validación o nombre duplicado',
    schema: {
      example: {
        mensaje: 'Ya existe un rol con el nombre "Supervisor"',
        data: null,
        tipo_mensaje: 'Roles.NombreDuplicado',
        estado_respuesta: 400
      }
    }
  })
  async crearRolPersonalizado(
    @Param('tiendaId') tiendaId: string,
    @Body() crearRolDto: CrearRolPersonalizadoDto,
  ) {
    return await this.gestionRolesCasoUso.crearRolPersonalizado(tiendaId, crearRolDto);
  }

  /**
   * Actualiza un rol personalizado existente
   */
  @Put('personalizados/:rolId')
  @ApiOperation({ 
    summary: 'Actualizar rol personalizado',
    description: 'Actualiza un rol personalizado existente'
  })
  @ApiParam({ name: 'tiendaId', description: 'ID de la tienda' })
  @ApiParam({ name: 'rolId', description: 'ID del rol personalizado' })
  @ApiResponse({ 
    status: 200, 
    description: 'Rol personalizado actualizado exitosamente',
    schema: {
      example: {
        mensaje: 'Rol personalizado actualizado exitosamente',
        data: null,
        tipo_mensaje: 'Roles.ActualizadoExitosamente',
        estado_respuesta: 200
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Rol no encontrado',
    schema: {
      example: {
        mensaje: 'Rol personalizado no encontrado',
        data: null,
        tipo_mensaje: 'Roles.RolNoEncontrado',
        estado_respuesta: 404
      }
    }
  })
  async actualizarRolPersonalizado(
    @Param('tiendaId') tiendaId: string,
    @Param('rolId') rolId: string,
    @Body() actualizarRolDto: ActualizarRolPersonalizadoDto,
  ) {
    return await this.gestionRolesCasoUso.actualizarRolPersonalizado(tiendaId, rolId, actualizarRolDto);
  }

  /**
   * Elimina un rol personalizado
   */
  @Delete('personalizados/:rolId')
  @ApiOperation({ 
    summary: 'Eliminar rol personalizado',
    description: 'Elimina un rol personalizado existente'
  })
  @ApiParam({ name: 'tiendaId', description: 'ID de la tienda' })
  @ApiParam({ name: 'rolId', description: 'ID del rol personalizado' })
  @ApiResponse({ 
    status: 200, 
    description: 'Rol personalizado eliminado exitosamente',
    schema: {
      example: {
        mensaje: 'Rol personalizado eliminado exitosamente',
        data: null,
        tipo_mensaje: 'Roles.EliminadoExitosamente',
        estado_respuesta: 200
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'No se puede eliminar un rol en uso',
    schema: {
      example: {
        mensaje: 'No se puede eliminar un rol que está siendo usado por empleados',
        data: null,
        tipo_mensaje: 'Roles.RolEnUso',
        estado_respuesta: 400
      }
    }
  })
  async eliminarRolPersonalizado(
    @Param('tiendaId') tiendaId: string,
    @Param('rolId') rolId: string,
  ) {
    return await this.gestionRolesCasoUso.eliminarRolPersonalizado(tiendaId, rolId);
  }

  /**
   * Obtiene la configuración de seguridad
   */
  @Get('seguridad')
  @ApiOperation({ 
    summary: 'Obtener configuración de seguridad',
    description: 'Retorna la configuración actual de seguridad de la tienda'
  })
  @ApiParam({ name: 'tiendaId', description: 'ID de la tienda' })
  @ApiResponse({ 
    status: 200, 
    description: 'Configuración de seguridad obtenida exitosamente',
    schema: {
      example: {
        mensaje: 'Configuración de seguridad obtenida exitosamente',
        data: {
          politicasUsuarios: {
            autenticacionDosPasosObligatoria: false,
            longitudMinimaContrasena: 8,
            expiracionContrasenaDias: 90,
            maximoIntentosInicioSesion: 5,
            bloqueoTemporalMinutos: 30,
            requiereVerificacionEmail: true,
            politicasContrasena: ['minimo_8_caracteres', 'mezcla_mayusculas_minusculas']
          },
          configuracionSeguridad: {
            registroActividad: {
              habilitado: true,
              retencionDias: 365,
              eventosRegistrados: ['login', 'logout', 'cambio_contrasena']
            },
            dispositivosConectados: {
              maximoDispositivosPorUsuario: 5,
              sesionesConcurrentes: true,
              notificacionesNuevoDispositivo: true
            },
            colaboradores: {
              codigoColaborador: 'ABC123',
              solicitudesPendientes: 0,
              maximoColaboradores: 10
            }
          }
        },
        tipo_mensaje: 'Seguridad.ObtenidaExitosamente',
        estado_respuesta: 200
      }
    }
  })
  async obtenerConfiguracionSeguridad(@Param('tiendaId') tiendaId: string) {
    return await this.gestionRolesCasoUso.obtenerConfiguracionSeguridad(tiendaId);
  }

  /**
   * Actualiza la configuración de seguridad
   */
  @Put('seguridad')
  @ApiOperation({ 
    summary: 'Actualizar configuración de seguridad',
    description: 'Actualiza la configuración de seguridad de la tienda'
  })
  @ApiParam({ name: 'tiendaId', description: 'ID de la tienda' })
  @ApiResponse({ 
    status: 200, 
    description: 'Configuración de seguridad actualizada exitosamente',
    schema: {
      example: {
        mensaje: 'Configuración de seguridad actualizada exitosamente',
        data: null,
        tipo_mensaje: 'Seguridad.ActualizadaExitosamente',
        estado_respuesta: 200
      }
    }
  })
  async actualizarConfiguracionSeguridad(
    @Param('tiendaId') tiendaId: string,
    @Body() actualizarSeguridadDto: ActualizarConfiguracionSeguridadDto,
  ) {
    return await this.gestionRolesCasoUso.actualizarConfiguracionSeguridad(tiendaId, actualizarSeguridadDto);
  }

  /**
   * Genera un nuevo código de colaborador
   */
  @Post('colaboradores/codigo')
  @ApiOperation({ 
    summary: 'Generar código de colaborador',
    description: 'Genera un nuevo código de colaborador para la tienda'
  })
  @ApiParam({ name: 'tiendaId', description: 'ID de la tienda' })
  @ApiResponse({ 
    status: 200, 
    description: 'Código de colaborador generado exitosamente',
    schema: {
      example: {
        mensaje: 'Código de colaborador generado exitosamente',
        data: 'ABC123',
        tipo_mensaje: 'Colaboradores.CodigoGeneradoExitosamente',
        estado_respuesta: 200
      }
    }
  })
  async generarCodigoColaborador(@Param('tiendaId') tiendaId: string) {
    return await this.gestionRolesCasoUso.generarCodigoColaborador(tiendaId);
  }

  /**
   * Obtiene las solicitudes de colaborador pendientes
   */
  @Get('colaboradores/solicitudes')
  @ApiOperation({ 
    summary: 'Obtener solicitudes de colaborador',
    description: 'Retorna las solicitudes de colaborador pendientes'
  })
  @ApiParam({ name: 'tiendaId', description: 'ID de la tienda' })
  @ApiResponse({ 
    status: 200, 
    description: 'Solicitudes obtenidas exitosamente',
    schema: {
      example: {
        mensaje: 'Solicitudes de colaborador obtenidas exitosamente',
        data: [
          {
            id: 'solicitud-123',
            email: 'colaborador@example.com',
            nombre: 'Juan Pérez',
            fechaSolicitud: '2024-01-01T00:00:00.000Z',
            estado: 'pendiente'
          }
        ],
        tipo_mensaje: 'Colaboradores.SolicitudesObtenidasExitosamente',
        estado_respuesta: 200
      }
    }
  })
  async obtenerSolicitudesColaborador(@Param('tiendaId') tiendaId: string) {
    return await this.gestionRolesCasoUso.obtenerSolicitudesColaborador(tiendaId);
  }

  /**
   * Aprueba una solicitud de colaborador
   */
  @Post('colaboradores/solicitudes/:solicitudId/aprobar')
  @ApiOperation({ 
    summary: 'Aprobar solicitud de colaborador',
    description: 'Aprueba una solicitud de colaborador pendiente'
  })
  @ApiParam({ name: 'tiendaId', description: 'ID de la tienda' })
  @ApiParam({ name: 'solicitudId', description: 'ID de la solicitud' })
  @ApiResponse({ 
    status: 200, 
    description: 'Solicitud aprobada exitosamente',
    schema: {
      example: {
        mensaje: 'Solicitud de colaborador aprobada exitosamente',
        data: null,
        tipo_mensaje: 'Colaboradores.SolicitudAprobadaExitosamente',
        estado_respuesta: 200
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Solicitud no encontrada',
    schema: {
      example: {
        mensaje: 'Solicitud de colaborador no encontrada',
        data: null,
        tipo_mensaje: 'Colaboradores.SolicitudNoEncontrada',
        estado_respuesta: 404
      }
    }
  })
  async aprobarSolicitudColaborador(
    @Param('tiendaId') tiendaId: string,
    @Param('solicitudId') solicitudId: string,
  ) {
    return await this.gestionRolesCasoUso.aprobarSolicitudColaborador(tiendaId, solicitudId);
  }

  /**
   * Rechaza una solicitud de colaborador
   */
  @Post('colaboradores/solicitudes/:solicitudId/rechazar')
  @ApiOperation({ 
    summary: 'Rechazar solicitud de colaborador',
    description: 'Rechaza una solicitud de colaborador pendiente'
  })
  @ApiParam({ name: 'tiendaId', description: 'ID de la tienda' })
  @ApiParam({ name: 'solicitudId', description: 'ID de la solicitud' })
  @ApiResponse({ 
    status: 200, 
    description: 'Solicitud rechazada exitosamente',
    schema: {
      example: {
        mensaje: 'Solicitud de colaborador rechazada exitosamente',
        data: null,
        tipo_mensaje: 'Colaboradores.SolicitudRechazadaExitosamente',
        estado_respuesta: 200
      }
    }
  })
  async rechazarSolicitudColaborador(
    @Param('tiendaId') tiendaId: string,
    @Param('solicitudId') solicitudId: string,
  ) {
    return await this.gestionRolesCasoUso.rechazarSolicitudColaborador(tiendaId, solicitudId);
  }

  /**
   * Obtiene el registro de actividad de usuarios
   */
  @Get('actividad')
  @ApiOperation({ 
    summary: 'Obtener registro de actividad',
    description: 'Retorna el registro de actividad de usuarios con filtros opcionales'
  })
  @ApiParam({ name: 'tiendaId', description: 'ID de la tienda' })
  @ApiQuery({ name: 'evento', required: false, description: 'Filtrar por tipo de evento' })
  @ApiQuery({ name: 'recurso', required: false, description: 'Filtrar por recurso afectado' })
  @ApiQuery({ name: 'fechaInicio', required: false, description: 'Filtrar desde fecha (ISO 8601)' })
  @ApiQuery({ name: 'fechaFin', required: false, description: 'Filtrar hasta fecha (ISO 8601)' })
  @ApiQuery({ name: 'usuario', required: false, description: 'Filtrar por usuario' })
  @ApiResponse({ 
    status: 200, 
    description: 'Registro de actividad obtenido exitosamente',
    schema: {
      example: {
        mensaje: 'Registro de actividad obtenido exitosamente',
        data: [
          {
            id: 'actividad-123',
            evento: 'login',
            recurso: 'Usuario',
            fecha: '2024-01-01T00:00:00.000Z',
            usuario: 'usuario@example.com',
            detalles: 'Inicio de sesión exitoso'
          }
        ],
        tipo_mensaje: 'Actividad.ObtenidaExitosamente',
        estado_respuesta: 200
      }
    }
  })
  async obtenerRegistroActividad(
    @Param('tiendaId') tiendaId: string,
    @Query('evento') evento?: string,
    @Query('recurso') recurso?: string,
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin') fechaFin?: string,
    @Query('usuario') usuario?: string,
  ) {
    const filtros = {
      evento,
      recurso,
      fechaInicio: fechaInicio ? new Date(fechaInicio) : undefined,
      fechaFin: fechaFin ? new Date(fechaFin) : undefined,
      usuario,
    };

    return await this.gestionRolesCasoUso.obtenerRegistroActividad(tiendaId, filtros);
  }

  /**
   * Exporta el registro de actividad en formato CSV
   */
  @Get('actividad/exportar')
  @ApiOperation({ 
    summary: 'Exportar registro de actividad',
    description: 'Exporta el registro de actividad en formato CSV'
  })
  @ApiParam({ name: 'tiendaId', description: 'ID de la tienda' })
  @ApiQuery({ name: 'evento', required: false, description: 'Filtrar por tipo de evento' })
  @ApiQuery({ name: 'recurso', required: false, description: 'Filtrar por recurso afectado' })
  @ApiQuery({ name: 'fechaInicio', required: false, description: 'Filtrar desde fecha (ISO 8601)' })
  @ApiQuery({ name: 'fechaFin', required: false, description: 'Filtrar hasta fecha (ISO 8601)' })
  @ApiQuery({ name: 'usuario', required: false, description: 'Filtrar por usuario' })
  @ApiResponse({ 
    status: 200, 
    description: 'Registro de actividad exportado exitosamente',
    schema: {
      example: {
        mensaje: 'Registro de actividad exportado exitosamente',
        data: 'ID,Evento,Recurso,Fecha,Usuario,Detalles\nactividad-123,login,Usuario,2024-01-01T00:00:00.000Z,usuario@example.com,"Inicio de sesión exitoso"',
        tipo_mensaje: 'Actividad.ExportadaExitosamente',
        estado_respuesta: 200
      }
    }
  })
  async exportarRegistroActividad(
    @Param('tiendaId') tiendaId: string,
    @Query('evento') evento?: string,
    @Query('recurso') recurso?: string,
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin') fechaFin?: string,
    @Query('usuario') usuario?: string,
  ) {
    const filtros = {
      evento,
      recurso,
      fechaInicio: fechaInicio ? new Date(fechaInicio) : undefined,
      fechaFin: fechaFin ? new Date(fechaFin) : undefined,
      usuario,
    };

    return await this.gestionRolesCasoUso.exportarRegistroActividad(tiendaId, filtros);
  }
}