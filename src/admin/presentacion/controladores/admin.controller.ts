import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { IniciarSesionAdminDto } from '../../aplicacion/dto/iniciar-sesion-admin.dto';
import { RegistrarAdminDto } from '../../aplicacion/dto/registrar-admin.dto';
import { SolicitarRecuperacionContrasenaDto } from '../../aplicacion/dto/solicitar-recuperacion-contrasena.dto';
import { VerificarCodigoRecuperacionDto } from '../../aplicacion/dto/verificar-codigo-recuperacion.dto';
import { RestablecerContrasenaDto } from '../../aplicacion/dto/restablecer-contrasena.dto';
import { IniciarSesionAdminCasoUso } from '../../dominio/casos-uso/iniciar-sesion-admin.caso-uso';
import { RegistrarAdminCasoUso } from '../../dominio/casos-uso/registrar-admin.caso-uso';
import { SolicitarRecuperacionContrasenaCasoUso } from '../../dominio/casos-uso/solicitar-recuperacion-contrasena.caso-uso';
import { VerificarCodigoRecuperacionCasoUso } from '../../dominio/casos-uso/verificar-codigo-recuperacion.caso-uso';
import { RestablecerContrasenaCasoUso } from '../../dominio/casos-uso/restablecer-contrasena.caso-uso';

/**
 * Controlador para la gestión de autenticación y recuperación de contraseña de administradores
 * Expone endpoints RESTful para login, registro y recuperación de contraseña
 */
@ApiTags('Admin - Autenticación')
@Controller('admin')
export class AdminController {
  constructor(
    private readonly iniciarSesionAdminCasoUso: IniciarSesionAdminCasoUso,
    private readonly registrarAdminCasoUso: RegistrarAdminCasoUso,
    private readonly solicitarRecuperacionContrasenaCasoUso: SolicitarRecuperacionContrasenaCasoUso,
    private readonly verificarCodigoRecuperacionCasoUso: VerificarCodigoRecuperacionCasoUso,
    private readonly restablecerContrasenaCasoUso: RestablecerContrasenaCasoUso,
  ) {}

  @Post('iniciar-sesion')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Iniciar sesión como administrador',
    description: 'Autentica a un administrador con email y contraseña'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Inicio de sesión exitoso' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Credenciales inválidas o cuenta desactivada' 
  })
  async iniciarSesion(@Body() datos: IniciarSesionAdminDto) {
    return await this.iniciarSesionAdminCasoUso.ejecutar(datos);
  }

  @Post('registrar')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Registrar nuevo administrador',
    description: 'Crea una nueva cuenta de administrador y tienda'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Administrador registrado exitosamente' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Datos inválidos o email ya en uso' 
  })
  async registrar(@Body() datos: RegistrarAdminDto) {
    return await this.registrarAdminCasoUso.ejecutar(datos);
  }

  @Post('solicitar-recuperacion-contrasena')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Solicitar recuperación de contraseña',
    description: 'Envía un código de recuperación al email del administrador'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Solicitud de recuperación procesada (siempre retorna éxito por seguridad)' 
  })
  async solicitarRecuperacionContrasena(@Body() datos: SolicitarRecuperacionContrasenaDto) {
    return await this.solicitarRecuperacionContrasenaCasoUso.ejecutar(datos);
  }

  @Post('verificar-codigo-recuperacion')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Verificar código de recuperación',
    description: 'Valida el código de recuperación enviado por email'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Código verificado exitosamente' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Código inválido, expirado o ya utilizado' 
  })
  async verificarCodigoRecuperacion(@Body() datos: VerificarCodigoRecuperacionDto) {
    return await this.verificarCodigoRecuperacionCasoUso.ejecutar(datos);
  }

  @Post('restablecer-contrasena')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Restablecer contraseña',
    description: 'Cambia la contraseña después de verificar el código de recuperación'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Contraseña restablecida exitosamente' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Token inválido, expirado o contraseñas no coinciden' 
  })
  async restablecerContrasena(@Body() datos: RestablecerContrasenaDto) {
    return await this.restablecerContrasenaCasoUso.ejecutar(datos);
  }
}