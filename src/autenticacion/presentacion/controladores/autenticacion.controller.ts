import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AutenticarUsuarioDto } from '../../aplicacion/dto/autenticar-usuario.dto';
import { AutenticarUsuarioCasoUso } from '../../dominio/casos-uso/autenticar-usuario.caso-uso';

/**
 * Controlador para la autenticación de usuarios
 * Sigue las convenciones de nomenclatura en español y documentación Swagger
 */
@ApiTags('Autenticación')
@Controller('api/v1/auth')
export class AutenticacionController {
  constructor(
    private readonly autenticarUsuarioCasoUso: AutenticarUsuarioCasoUso,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Autenticar usuario',
    description: 'Permite a un usuario administrador autenticarse en el sistema',
  })
  @ApiResponse({
    status: 200,
    description: 'Autenticación exitosa',
    schema: {
      example: {
        mensaje: 'Autenticación exitosa',
        data: {
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          usuario: {
            id: 'usuario123',
            email: 'admin@tiendanube.com',
            nombreCompleto: 'Administrador Principal',
            rol: 'ADMIN',
          },
        },
        tipo_mensaje: 'Exito',
        estado_respuesta: 200,
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Credenciales inválidas',
    schema: {
      example: {
        mensaje: 'Credenciales inválidas',
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: 401,
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Usuario inactivo',
    schema: {
      example: {
        mensaje: 'Usuario inactivo',
        data: null,
        tipo_mensaje: 'ErrorCliente',
        estado_respuesta: 403,
      },
    },
  })
  async login(@Body() autenticarUsuarioDto: AutenticarUsuarioDto) {
    return await this.autenticarUsuarioCasoUso.ejecutar(autenticarUsuarioDto);
  }
}