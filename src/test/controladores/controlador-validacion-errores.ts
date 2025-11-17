import { Controller, Get, Post, Body, HttpStatus, HttpException } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ExcepcionDominio } from '../../comun/excepciones/excepcion-dominio';
import { LoggingService } from '../../logging/logging.service';

/**
 * Controlador para validar el manejo de errores en producción
 * Proporciona endpoints que generan diferentes tipos de errores para testing
 */
@ApiTags('Validación de Errores')
@Controller('test/errores')
export class ControladorValidacionErrores {
  constructor(private readonly loggingService: LoggingService) {}

  /**
   * Endpoint que genera una excepción de dominio (error de cliente 400)
   */
  @Get('excepcion-dominio')
  @ApiOperation({ summary: 'Generar excepción de dominio (error de cliente)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Error de cliente manejado correctamente con estado 200 y detalles en el cuerpo' 
  })
  generarExcepcionDominio() {
    this.loggingService.log('Generando excepción de dominio para testing', {
      modulo: 'ControladorValidacionErrores',
      tipo: 'excepcion-dominio'
    });

    throw ExcepcionDominio.Respuesta400(
      'Este es un error de cliente simulado para testing',
      'Test.ErrorCliente'
    );
  }

  /**
   * Endpoint que genera una excepción HTTP 404
   */
  @Get('excepcion-http-404')
  @ApiOperation({ summary: 'Generar excepción HTTP 404' })
  @ApiResponse({ 
    status: 200, 
    description: 'Error HTTP 404 manejado correctamente con estado 200 y detalles en el cuerpo' 
  })
  generarExcepcionHttp404() {
    this.loggingService.log('Generando excepción HTTP 404 para testing', {
      modulo: 'ControladorValidacionErrores',
      tipo: 'excepcion-http-404'
    });

    throw new HttpException(
      'Recurso no encontrado - simulado para testing',
      HttpStatus.NOT_FOUND
    );
  }

  /**
   * Endpoint que genera una excepción HTTP 500
   */
  @Get('excepcion-http-500')
  @ApiOperation({ summary: 'Generar excepción HTTP 500' })
  @ApiResponse({ 
    status: 500, 
    description: 'Error HTTP 500 manejado correctamente con estado 500' 
  })
  generarExcepcionHttp500() {
    this.loggingService.log('Generando excepción HTTP 500 para testing', {
      modulo: 'ControladorValidacionErrores',
      tipo: 'excepcion-http-500'
    });

    throw new HttpException(
      'Error interno del servidor - simulado para testing',
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }

  /**
   * Endpoint que genera un error no manejado (Error genérico)
   */
  @Get('error-no-manejado')
  @ApiOperation({ summary: 'Generar error no manejado' })
  @ApiResponse({ 
    status: 500, 
    description: 'Error no manejado capturado por el filtro global' 
  })
  generarErrorNoManejado() {
    this.loggingService.log('Generando error no manejado para testing', {
      modulo: 'ControladorValidacionErrores',
      tipo: 'error-no-manejado'
    });

    // Simular un error no manejado (no es HttpException ni ExcepcionDominio)
    throw new Error('Este es un error genérico no manejado - simulado para testing');
  }

  /**
   * Endpoint que simula un error de validación con datos inválidos
   */
  @Post('error-validacion')
  @ApiOperation({ summary: 'Generar error de validación' })
  @ApiResponse({ 
    status: 200, 
    description: 'Error de validación manejado correctamente' 
  })
  generarErrorValidacion(@Body() datos: any) {
    this.loggingService.log('Generando error de validación para testing', {
      modulo: 'ControladorValidacionErrores',
      tipo: 'error-validacion',
      datosRecibidos: datos
    });

    // El ValidationPipe global manejará automáticamente este error
    // si los datos no cumplen con las validaciones
    if (!datos.nombre || !datos.email) {
      throw ExcepcionDominio.Respuesta400(
        'Datos de validación inválidos: nombre y email son requeridos',
        'Validacion.CamposRequeridos'
      );
    }

    return {
      mensaje: 'Validación exitosa',
      data: datos,
      tipo_mensaje: 'Validacion.Exitosa',
      estado_respuesta: 200
    };
  }

  /**
   * Endpoint que simula un error de base de datos
   */
  @Get('error-base-datos')
  @ApiOperation({ summary: 'Generar error de base de datos simulado' })
  @ApiResponse({ 
    status: 500, 
    description: 'Error de base de datos manejado correctamente' 
  })
  generarErrorBaseDatos() {
    this.loggingService.log('Generando error de base deatos para testing', {
      modulo: 'ControladorValidacionErrores',
      tipo: 'error-base-datos'
    });

    // Simular un error de base de datos
    const errorBD = new Error('Connection timeout to database');
    errorBD.name = 'DatabaseConnectionError';
    
    throw new HttpException(
      {
        mensaje: 'Error de conexión a la base de datos',
        error: 'DatabaseConnectionError',
        tipo_mensaje: 'BaseDatos.ErrorConexion'
      },
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }

  /**
   * Endpoint que simula un error de autenticación
   */
  @Get('error-autenticacion')
  @ApiOperation({ summary: 'Generar error de autenticación' })
  @ApiResponse({ 
    status: 200, 
    description: 'Error de autenticación manejado correctamente' 
  })
  generarErrorAutenticacion() {
    this.loggingService.log('Generando error de autenticación para testing', {
      modulo: 'ControladorValidacionErrores',
      tipo: 'error-autenticacion'
    });

    throw new HttpException(
      'Credenciales inválidas - acceso denegado',
      HttpStatus.UNAUTHORIZED
    );
  }

  /**
   * Endpoint que simula un error de autorización
   */
  @Get('error-autorizacion')
  @ApiOperation({ summary: 'Generar error de autorización' })
  @ApiResponse({ 
    status: 200, 
    description: 'Error de autorización manejado correctamente' 
  })
  generarErrorAutorizacion() {
    this.loggingService.log('Generando error de autorización para testing', {
      modulo: 'ControladorValidacionErrores',
      tipo: 'error-autorizacion'
    });

    throw new HttpException(
      'No tienes permisos para acceder a este recurso',
      HttpStatus.FORBIDDEN
    );
  }

  /**
   * Endpoint que valida el logging estructurado
   */
  @Get('logging-estructurado')
  @ApiOperation({ summary: 'Validar logging estructurado' })
  @ApiResponse({ 
    status: 200, 
    description: 'Logs estructurados generados correctamente' 
  })
  validarLoggingEstructurado() {
    // Generar diferentes niveles de log
    this.loggingService.log('Mensaje de log informativo', {
      modulo: 'ControladorValidacionErrores',
      tipo: 'logging-test',
      nivel: 'info',
      datosEjemplo: { usuario: 'test', accion: 'validacion' }
    });

    this.loggingService.warn('Mensaje de advertencia', {
      modulo: 'ControladorValidacionErrores',
      tipo: 'logging-test',
      nivel: 'warn',
      contexto: 'validacion-manejo-errores'
    });

    this.loggingService.error('Mensaje de error simulado', new Error('Error simulado para testing').stack || 'Stack no disponible', {
      modulo: 'ControladorValidacionErrores',
      tipo: 'logging-test',
      nivel: 'error',
      severidad: 'alta'
    });

    this.loggingService.logErrorNegocio(
      'Test.ErrorNegocio',
      'Error de negocio simulado para testing',
      {
        modulo: 'ControladorValidacionErrores',
        tipo: 'error-negocio',
        codigo: 'TEST001',
        contexto: 'validacion'
      }
    );

    return {
      mensaje: 'Logs estructurados generados exitosamente',
      data: {
        logsGenerados: ['info', 'warn', 'error', 'error-negocio'],
        correlationId: this.loggingService.getCorrelationId(),
        requestId: this.loggingService.getRequestId()
      },
      tipo_mensaje: 'Logging.Exitoso',
      estado_respuesta: 200
    };
  }

  /**
   * Endpoint que simula un timeout
   */
  @Get('timeout')
  @ApiOperation({ summary: 'Simular timeout de solicitud' })
  @ApiResponse({ 
    status: 200, 
    description: 'Timeout simulado correctamente' 
  })
  async simularTimeout() {
    this.loggingService.log('Simulando timeout para testing', {
      modulo: 'ControladorValidacionErrores',
      tipo: 'timeout',
      duracion: 5000
    });

    // Simular una operación que toma más tiempo del esperado
    await new Promise(resolve => setTimeout(resolve, 5000));

    return {
      mensaje: 'Timeout simulado completado',
      data: { duracion: 5000 },
      tipo_mensaje: 'Test.TimeoutCompletado',
      estado_respuesta: 200
    };
  }
}