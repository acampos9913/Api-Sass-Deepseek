import { Injectable, Inject } from '@nestjs/common';
import { ExcepcionDominio } from '../../../comun/excepciones/excepcion-dominio';
import { ServicioRespuestaEstandar } from '../../../comun/aplicacion/servicios/servicio-respuesta-estandar';
import { IniciarSesionAdminDto } from '../../aplicacion/dto/iniciar-sesion-admin.dto';
import type { RepositorioUsuario } from '../../../autenticacion/dominio/interfaces/repositorio-usuario.interface';
import type { RepositorioTokenRecuperacionContrasena } from '../interfaces/repositorio-token-recuperacion-contrasena.interface';
import { RolUsuario } from '../../../autenticacion/dominio/enums/rol-usuario.enum';
import { ServicioJwt } from '../../../comun/infraestructura/servicios/servicio-jwt';
import { ServicioHashing } from '../../../comun/infraestructura/servicios/servicio-hashing';

/**
 * Caso de uso para iniciar sesión de administrador
 * Implementa la lógica de negocio para autenticar administradores
 */
@Injectable()
export class IniciarSesionAdminCasoUso {
  constructor(
    @Inject('RepositorioUsuario')
    private readonly repositorioUsuario: RepositorioUsuario,
    @Inject('RepositorioTokenRecuperacionContrasena')
    private readonly repositorioTokenRecuperacion: RepositorioTokenRecuperacionContrasena,
    private readonly servicioJwt: ServicioJwt,
    private readonly servicioHashing: ServicioHashing,
  ) {}

  /**
   * Ejecuta el proceso de inicio de sesión para administradores
   * @param datos - Datos de inicio de sesión
   * @returns Respuesta estándar con token de acceso o error
   */
  async ejecutar(datos: IniciarSesionAdminDto) {
    try {
      // Validar que el usuario existe
      const usuario = await this.repositorioUsuario.buscarPorEmail(datos.email);
      
      if (!usuario) {
        throw ExcepcionDominio.Respuesta400(
          'Credenciales inválidas',
          'Admin.CredencialesInvalidas'
        );
      }

      // Verificar que el usuario es administrador
      if (!usuario.esAdministrador()) {
        throw ExcepcionDominio.Respuesta400(
          'Acceso denegado. Se requieren permisos de administrador',
          'Admin.PermisosInsuficientes'
        );
      }

      // Verificar contraseña usando bcrypt
      const contrasenaValida = await this.servicioHashing.verificar(
        datos.contrasena,
        usuario.contrasenaHash
      );
      
      if (!contrasenaValida) {
        throw ExcepcionDominio.Respuesta400(
          'Credenciales inválidas',
          'Admin.CredencialesInvalidas'
        );
      }

      // Verificar si el usuario está activo
      if (!usuario.activo) {
        throw ExcepcionDominio.Respuesta400(
          'La cuenta está desactivada',
          'Admin.CuentaDesactivada'
        );
      }

      // Limpiar tokens de recuperación expirados
      await this.repositorioTokenRecuperacion.eliminarExpiradosPorUsuario(usuario.id);

      // Generar tokens de acceso reales con JWT
      const tokens = this.servicioJwt.generarParTokens(
        usuario.id,
        usuario.email,
        usuario.rol
      );

      return ServicioRespuestaEstandar.Respuesta200(
        'Inicio de sesión exitoso',
        {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          usuario: {
            id: usuario.id,
            email: usuario.email,
            nombreCompleto: usuario.nombreCompleto,
            rol: usuario.rol,
          },
        },
        'Admin.InicioSesionExitoso'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      
      throw ExcepcionDominio.Respuesta500(
        'Error interno del servidor',
        'Servidor.ErrorInterno'
      );
    }
  }

  /**
   * Verifica la contraseña del usuario
   * @param contrasenaIngresada - Contraseña ingresada por el usuario
   * @param contrasenaAlmacenada - Contraseña almacenada en la base de datos
   * @returns Promise que resuelve a boolean indicando si la contraseña es válida
   */
  private async verificarContrasena(contrasenaIngresada: string, contrasenaAlmacenada: string): Promise<boolean> {
    // En un escenario real, esto usaría bcrypt.compare
    // Por ahora simulamos la verificación
    return contrasenaIngresada === contrasenaAlmacenada;
  }

  /**
   * Genera un token de acceso temporal
   * En producción, esto debería usar JWT
   * @param usuarioId - ID del usuario
   * @param email - Email del usuario
   * @param rol - Rol del usuario
   * @returns Token de acceso
   */
  private generarTokenAcceso(usuarioId: string, email: string, rol: string): string {
    // En un escenario real, esto generaría un JWT
    const payload = {
      sub: usuarioId,
      email,
      rol,
      iat: Date.now(),
      exp: Date.now() + (24 * 60 * 60 * 1000), // 24 horas
    };
    
    // Simulación de token (en producción usar JWT)
    return Buffer.from(JSON.stringify(payload)).toString('base64');
  }
}