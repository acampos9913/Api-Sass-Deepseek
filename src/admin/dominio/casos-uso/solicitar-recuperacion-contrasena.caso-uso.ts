import { Injectable, Inject } from '@nestjs/common';
import { ExcepcionDominio } from '../../../comun/excepciones/excepcion-dominio';
import { ServicioRespuestaEstandar } from '../../../comun/aplicacion/servicios/servicio-respuesta-estandar';
import { SolicitarRecuperacionContrasenaDto } from '../../aplicacion/dto/solicitar-recuperacion-contrasena.dto';
import type { RepositorioUsuario } from '../../../autenticacion/dominio/interfaces/repositorio-usuario.interface';
import type { RepositorioTokenRecuperacionContrasena } from '../interfaces/repositorio-token-recuperacion-contrasena.interface';
import type { ServicioEmail } from '../../../comun/infraestructura/servicios/servicio-email';

/**
 * Caso de uso para solicitar la recuperación de contraseña
 * Implementa la lógica de negocio para generar tokens de recuperación
 */
@Injectable()
export class SolicitarRecuperacionContrasenaCasoUso {
  constructor(
    @Inject('RepositorioUsuario')
    private readonly repositorioUsuario: RepositorioUsuario,
    @Inject('RepositorioTokenRecuperacionContrasena')
    private readonly repositorioTokenRecuperacion: RepositorioTokenRecuperacionContrasena,
    @Inject('ServicioEmail')
    private readonly servicioEmail: ServicioEmail,
  ) {}

  /**
   * Ejecuta el proceso de solicitud de recuperación de contraseña
   * @param datos - Datos de solicitud de recuperación
   * @returns Respuesta estándar indicando éxito o error
   */
  async ejecutar(datos: SolicitarRecuperacionContrasenaDto) {
    try {
      // Buscar usuario por email
      const usuario = await this.repositorioUsuario.buscarPorEmail(datos.email);
      
      // Por seguridad, no revelamos si el email existe o no
      if (!usuario) {
        // Simulamos éxito para no revelar información
        return ServicioRespuestaEstandar.Respuesta200(
          'Si el email existe, se ha enviado un código de recuperación',
          null,
          'Admin.RecuperacionSolicitada'
        );
      }

      // Verificar que el usuario esté activo
      if (!usuario.activo) {
        return ServicioRespuestaEstandar.Respuesta200(
          'Si el email existe, se ha enviado un código de recuperación',
          null,
          'Admin.RecuperacionSolicitada'
        );
      }

      // Limpiar tokens expirados existentes
      await this.repositorioTokenRecuperacion.eliminarExpiradosPorUsuario(usuario.id);

      // Generar token y código de recuperación
      const tokenRecuperacion = this.generarTokenRecuperacion();
      const codigoRecuperacion = this.generarCodigoRecuperacion();

      // Crear token en el repositorio
      await this.repositorioTokenRecuperacion.crear({
        id: this.generarIdUnico(),
        usuarioId: usuario.id,
        token: tokenRecuperacion,
        codigo: codigoRecuperacion,
        expiracion: new Date(Date.now() + 15 * 60 * 1000), // 15 minutos
        utilizado: false,
      });

      // Enviar código de recuperación por email usando el servicio real
      await this.servicioEmail.enviarCodigoRecuperacion(
        usuario.email,
        codigoRecuperacion,
        usuario.nombreCompleto
      );

      return ServicioRespuestaEstandar.Respuesta200(
        'Si el email existe, se ha enviado un código de recuperación',
        { token: tokenRecuperacion }, // En producción, no enviaríamos el token
        'Admin.RecuperacionSolicitada'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      
      throw ExcepcionDominio.Respuesta500(
        'Error interno del servidor durante la solicitud de recuperación',
        'Servidor.ErrorInterno'
      );
    }
  }

  /**
   * Genera un token único para la recuperación
   * @returns Token generado
   */
  private generarTokenRecuperacion(): string {
    return `rec_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`;
  }

  /**
   * Genera un código numérico de 6 dígitos
   * @returns Código de 6 dígitos
   */
  private generarCodigoRecuperacion(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Genera un ID único para el token
   * @returns ID único generado
   */
  private generarIdUnico(): string {
    return `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}