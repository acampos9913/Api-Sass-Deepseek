import { Injectable, Inject } from '@nestjs/common';
import { ExcepcionDominio } from '../../../comun/excepciones/excepcion-dominio';
import { ServicioRespuestaEstandar } from '../../../comun/aplicacion/servicios/servicio-respuesta-estandar';
import { RestablecerContrasenaDto } from '../../aplicacion/dto/restablecer-contrasena.dto';
import type { RepositorioUsuario } from '../../../autenticacion/dominio/interfaces/repositorio-usuario.interface';
import type { RepositorioTokenRecuperacionContrasena } from '../interfaces/repositorio-token-recuperacion-contrasena.interface';
import { ServicioHashing } from '../../../comun/infraestructura/servicios/servicio-hashing';

/**
 * Caso de uso para restablecer la contraseña
 * Implementa la lógica de negocio para cambiar la contraseña tras verificación
 */
@Injectable()
export class RestablecerContrasenaCasoUso {
  constructor(
    @Inject('RepositorioUsuario')
    private readonly repositorioUsuario: RepositorioUsuario,
    @Inject('RepositorioTokenRecuperacionContrasena')
    private readonly repositorioTokenRecuperacion: RepositorioTokenRecuperacionContrasena,
    private readonly servicioHashing: ServicioHashing,
  ) {}

  /**
   * Ejecuta el proceso de restablecimiento de contraseña
   * @param datos - Datos para restablecer la contraseña
   * @returns Respuesta estándar indicando éxito o error
   */
  async ejecutar(datos: RestablecerContrasenaDto) {
    try {
      // Validar que las contraseñas coincidan
      if (datos.nuevaContrasena !== datos.confirmacionContrasena) {
        throw ExcepcionDominio.Respuesta400(
          'Las contraseñas no coinciden',
          'Admin.ContrasenasNoCoinciden'
        );
      }

      // Validar fortaleza de la nueva contraseña usando el servicio de hashing
      const validacionFortaleza = this.servicioHashing.validarFortalezaContrasena(datos.nuevaContrasena);
      if (!validacionFortaleza.valida) {
        throw ExcepcionDominio.Respuesta400(
          `La contraseña no cumple con los requisitos de seguridad: ${validacionFortaleza.errores.join(', ')}`,
          'Admin.ContrasenaDebil'
        );
      }

      // Buscar token por su valor
      const token = await this.repositorioTokenRecuperacion.encontrarPorToken(datos.token);
      
      if (!token) {
        throw ExcepcionDominio.Respuesta400(
          'Token de recuperación inválido o expirado',
          'Admin.TokenInvalido'
        );
      }

      // Verificar que el token no esté expirado
      if (this.tokenExpirado(token.expiracion)) {
        throw ExcepcionDominio.Respuesta400(
          'Token de recuperación expirado',
          'Admin.TokenExpirado'
        );
      }

      // Verificar que el token no esté utilizado
      if (token.utilizado) {
        throw ExcepcionDominio.Respuesta400(
          'Token de recuperación ya utilizado',
          'Admin.TokenUtilizado'
        );
      }

      // Buscar usuario asociado al token
      const usuario = await this.repositorioUsuario.buscarPorId(token.usuarioId);
      
      if (!usuario) {
        throw ExcepcionDominio.Respuesta400(
          'Usuario no encontrado',
          'Admin.UsuarioNoEncontrado'
        );
      }

      // Verificar que el usuario esté activo
      if (!usuario.activo) {
        throw ExcepcionDominio.Respuesta400(
          'La cuenta está desactivada',
          'Admin.CuentaDesactivada'
        );
      }

      // Generar hash seguro para la nueva contraseña
      const contrasenaHash = await this.servicioHashing.hash(datos.nuevaContrasena);
      
      // Actualizar contraseña del usuario con hash seguro
      const usuarioActualizado = new Usuario(
        usuario.id,
        usuario.email,
        contrasenaHash, // Ahora usamos el hash seguro
        usuario.nombreCompleto,
        usuario.rol,
        usuario.activo,
        usuario.fechaCreacion,
        new Date(),
        usuario.ultimoAcceso,
      );

      await this.repositorioUsuario.actualizar(usuarioActualizado);

      // Marcar token como utilizado
      await this.repositorioTokenRecuperacion.marcarComoUtilizado(token.id);

      // Eliminar otros tokens activos del usuario
      await this.repositorioTokenRecuperacion.eliminarExpiradosPorUsuario(usuario.id);

      return ServicioRespuestaEstandar.Respuesta200(
        'Contraseña restablecida exitosamente',
        { 
          usuario: {
            id: usuario.id,
            email: usuario.email,
          }
        },
        'Admin.ContrasenaRestablecidaExitosamente'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      
      throw ExcepcionDominio.Respuesta500(
        'Error interno del servidor durante el restablecimiento de contraseña',
        'Servidor.ErrorInterno'
      );
    }
  }

  /**
   * Valida la fortaleza de la contraseña
   * @param contrasena - Contraseña a validar
   * @returns boolean indicando si la contraseña es fuerte
   */
  private validarFortalezaContrasena(contrasena: string): boolean {
    // Mínimo 8 caracteres, al menos una mayúscula, una minúscula, un número y un carácter especial
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(contrasena);
  }

  /**
   * Verifica si un token ha expirado
   * @param fechaExpiracion - Fecha de expiración del token
   * @returns boolean indicando si el token está expirado
   */
  private tokenExpirado(fechaExpiracion: Date): boolean {
    return new Date() > new Date(fechaExpiracion);
  }
}

// Importamos Usuario aquí para evitar problemas de dependencia circular
import { Usuario } from '../../../autenticacion/dominio/entidades/usuario.entity';