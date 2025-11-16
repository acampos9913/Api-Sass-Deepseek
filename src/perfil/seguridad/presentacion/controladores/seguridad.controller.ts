import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../autenticacion/presentacion/guardias/jwt-auth.guardia';
import { ObtenerEstadoSeguridadCasoUso } from '../../dominio/casos-uso/obtener-estado-seguridad.caso-uso';
import { CrearClaveAccesoCasoUso, CrearClaveAccesoDto } from '../../dominio/casos-uso/crear-clave-acceso.caso-uso';
import { CambiarContrasenaCasoUso, CambiarContrasenaDto } from '../../dominio/casos-uso/cambiar-contrasena.caso-uso';
import { AgregarCorreoSecundarioCasoUso, AgregarCorreoSecundarioDto } from '../../dominio/casos-uso/agregar-correo-secundario.caso-uso';
import { ActivarDesactivar2FACasoUso, ActivarDesactivar2FADto } from '../../dominio/casos-uso/activar-desactivar-2fa.caso-uso';
import { AgregarMetodoAutenticacionCasoUso, AgregarMetodoAutenticacionDto } from '../../dominio/casos-uso/agregar-metodo-autenticacion.caso-uso';
import { CerrarSesionDispositivoCasoUso } from '../../dominio/casos-uso/cerrar-sesion-dispositivo.caso-uso';
import { GenerarSecretoTotpCasoUso } from '../../dominio/casos-uso/generar-secreto-totp.caso-uso';
import { VerificarCodigoTotpCasoUso, VerificarCodigoTotpDto } from '../../dominio/casos-uso/verificar-codigo-totp.caso-uso';

@ApiTags('Perfil - Seguridad')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('perfil/seguridad')
export class SeguridadController {
  constructor(
    private readonly obtenerEstadoSeguridadCasoUso: ObtenerEstadoSeguridadCasoUso,
    private readonly crearClaveAccesoCasoUso: CrearClaveAccesoCasoUso,
    private readonly cambiarContrasenaCasoUso: CambiarContrasenaCasoUso,
    private readonly agregarCorreoSecundarioCasoUso: AgregarCorreoSecundarioCasoUso,
    private readonly activarDesactivar2FACasoUso: ActivarDesactivar2FACasoUso,
    private readonly agregarMetodoAutenticacionCasoUso: AgregarMetodoAutenticacionCasoUso,
    private readonly cerrarSesionDispositivoCasoUso: CerrarSesionDispositivoCasoUso,
    private readonly generarSecretoTotpCasoUso: GenerarSecretoTotpCasoUso,
    private readonly verificarCodigoTotpCasoUso: VerificarCodigoTotpCasoUso,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Obtener estado completo de seguridad del usuario' })
  @ApiResponse({ status: 200, description: 'Estado de seguridad obtenido exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async obtenerEstadoSeguridad(@Req() req: any) {
    const usuarioId = req.user.id;
    return await this.obtenerEstadoSeguridadCasoUso.ejecutar(usuarioId);
  }

  @Post('claves-acceso')
  @ApiOperation({ summary: 'Crear una nueva clave de acceso' })
  @ApiResponse({ status: 200, description: 'Clave de acceso creada exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos de clave de acceso inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async crearClaveAcceso(@Req() req: any, @Body() datos: CrearClaveAccesoDto) {
    const usuarioId = req.user.id;
    return await this.crearClaveAccesoCasoUso.ejecutar(usuarioId, datos);
  }

  @Patch('contrasena')
  @ApiOperation({ summary: 'Cambiar la contraseña del usuario' })
  @ApiResponse({ status: 200, description: 'Contraseña cambiada exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos de contraseña inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async cambiarContrasena(@Req() req: any, @Body() datos: CambiarContrasenaDto) {
    const usuarioId = req.user.id;
    return await this.cambiarContrasenaCasoUso.ejecutar(usuarioId, datos);
  }

  @Post('correo-secundario')
  @ApiOperation({ summary: 'Agregar correo electrónico secundario' })
  @ApiResponse({ status: 200, description: 'Correo secundario agregado exitosamente' })
  @ApiResponse({ status: 400, description: 'Correo electrónico inválido o ya en uso' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async agregarCorreoSecundario(@Req() req: any, @Body() datos: AgregarCorreoSecundarioDto) {
    const usuarioId = req.user.id;
    return await this.agregarCorreoSecundarioCasoUso.ejecutar(usuarioId, datos);
  }

  @Patch('autenticacion-2pasos')
  @ApiOperation({ summary: 'Activar o desactivar autenticación en dos pasos' })
  @ApiResponse({ status: 200, description: 'Autenticación en dos pasos actualizada exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async activarDesactivar2FA(@Req() req: any, @Body() datos: ActivarDesactivar2FADto) {
    const usuarioId = req.user.id;
    return await this.activarDesactivar2FACasoUso.ejecutar(usuarioId, datos);
  }

  @Post('metodos-autenticacion')
  @ApiOperation({ summary: 'Agregar método de autenticación' })
  @ApiResponse({ status: 200, description: 'Método de autenticación agregado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos de método de autenticación inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async agregarMetodoAutenticacion(@Req() req: any, @Body() datos: AgregarMetodoAutenticacionDto) {
    const usuarioId = req.user.id;
    return await this.agregarMetodoAutenticacionCasoUso.ejecutar(usuarioId, datos);
  }

  @Delete('dispositivos/:dispositivoId')
  @ApiOperation({ summary: 'Cerrar sesión en un dispositivo específico' })
  @ApiResponse({ status: 200, description: 'Sesión cerrada exitosamente en el dispositivo' })
  @ApiResponse({ status: 400, description: 'ID de dispositivo inválido' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Dispositivo no encontrado' })
  async cerrarSesionDispositivo(@Req() req: any, @Param('dispositivoId') dispositivoId: string) {
    const usuarioId = req.user.id;
    return await this.cerrarSesionDispositivoCasoUso.ejecutar(usuarioId, dispositivoId);
  }

  @Post('totp/generar-secreto')
  @ApiOperation({ summary: 'Generar secreto TOTP para autenticación en dos pasos' })
  @ApiResponse({ status: 200, description: 'Secreto TOTP generado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async generarSecretoTotp(@Req() req: any) {
    const usuarioId = req.user.id;
    const email = req.user.email;
    return await this.generarSecretoTotpCasoUso.ejecutar(usuarioId, email);
  }

  @Post('totp/verificar-codigo')
  @ApiOperation({ summary: 'Verificar código TOTP para autenticación en dos pasos' })
  @ApiResponse({ status: 200, description: 'Código TOTP verificado exitosamente' })
  @ApiResponse({ status: 400, description: 'Código TOTP inválido' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async verificarCodigoTotp(@Req() req: any, @Body() datos: VerificarCodigoTotpDto) {
    const usuarioId = req.user.id;
    return await this.verificarCodigoTotpCasoUso.ejecutar(usuarioId, datos);
  }
}