import { Controller, Get, Put, Post, Patch, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../autenticacion/presentacion/guardias/jwt-auth.guardia';
import { ObtenerPerfilCasoUso } from '../../dominio/casos-uso/obtener-perfil.caso-uso';
import { ActualizarPerfilCasoUso } from '../../dominio/casos-uso/actualizar-perfil.caso-uso';
import { SubirFotoPerfilCasoUso } from '../../dominio/casos-uso/subir-foto-perfil.caso-uso';
import { CambiarCorreoPerfilCasoUso } from '../../dominio/casos-uso/cambiar-correo-perfil.caso-uso';
import { ActualizarTelefonoPerfilCasoUso } from '../../dominio/casos-uso/actualizar-telefono-perfil.caso-uso';
import { VincularServicioExternoCasoUso } from '../../dominio/casos-uso/vincular-servicio-externo.caso-uso';
import type { ActualizarPerfilDto } from '../../dominio/casos-uso/actualizar-perfil.caso-uso';
import type { VincularServicioExternoDto } from '../../dominio/casos-uso/vincular-servicio-externo.caso-uso';

@ApiTags('Perfil General')
@ApiBearerAuth()
@Controller('perfil/general')
@UseGuards(JwtAuthGuard)
export class PerfilGeneralController {
  constructor(
    private readonly obtenerPerfilCasoUso: ObtenerPerfilCasoUso,
    private readonly actualizarPerfilCasoUso: ActualizarPerfilCasoUso,
    private readonly subirFotoPerfilCasoUso: SubirFotoPerfilCasoUso,
    private readonly cambiarCorreoPerfilCasoUso: CambiarCorreoPerfilCasoUso,
    private readonly actualizarTelefonoPerfilCasoUso: ActualizarTelefonoPerfilCasoUso,
    private readonly vincularServicioExternoCasoUso: VincularServicioExternoCasoUso,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Obtener información completa del perfil del usuario' })
  @ApiResponse({ status: 200, description: 'Perfil obtenido exitosamente' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async obtenerPerfil(@Request() req) {
    return await this.obtenerPerfilCasoUso.ejecutar(req.user.id);
  }

  @Put()
  @ApiOperation({ summary: 'Actualizar información básica del perfil' })
  @ApiResponse({ status: 200, description: 'Perfil actualizado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async actualizarPerfil(@Request() req, @Body() datos: ActualizarPerfilDto) {
    return await this.actualizarPerfilCasoUso.ejecutar(req.user.id, datos);
  }

  @Post('foto')
  @ApiOperation({ summary: 'Subir o actualizar foto de perfil' })
  @ApiResponse({ status: 200, description: 'Foto de perfil actualizada exitosamente' })
  @ApiResponse({ status: 400, description: 'Formato o tamaño de foto inválido' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async subirFotoPerfil(@Request() req, @Body() body: { foto: string }) {
    return await this.subirFotoPerfilCasoUso.ejecutar(req.user.id, body.foto);
  }

  @Patch('correo')
  @ApiOperation({ summary: 'Cambiar correo electrónico del usuario' })
  @ApiResponse({ status: 200, description: 'Correo electrónico actualizado exitosamente' })
  @ApiResponse({ status: 400, description: 'Formato de correo inválido o igual al actual' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async cambiarCorreo(@Request() req, @Body() body: { correo: string }) {
    return await this.cambiarCorreoPerfilCasoUso.ejecutar(req.user.id, body.correo);
  }

  @Patch('telefono')
  @ApiOperation({ summary: 'Actualizar número de teléfono del usuario' })
  @ApiResponse({ status: 200, description: 'Número de teléfono actualizado exitosamente' })
  @ApiResponse({ status: 400, description: 'Formato de teléfono inválido o igual al actual' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async actualizarTelefono(@Request() req, @Body() body: { telefono: string }) {
    return await this.actualizarTelefonoPerfilCasoUso.ejecutar(req.user.id, body.telefono);
  }

  @Post('servicios-externos')
  @ApiOperation({ summary: 'Vincular servicio externo al perfil del usuario' })
  @ApiResponse({ status: 200, description: 'Servicio externo vinculado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos de servicio externo inválidos o ya vinculado' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async vincularServicioExterno(@Request() req, @Body() datos: VincularServicioExternoDto) {
    return await this.vincularServicioExternoCasoUso.ejecutar(req.user.id, datos);
  }
}