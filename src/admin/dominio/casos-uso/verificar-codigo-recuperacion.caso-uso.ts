import { Injectable, Inject } from '@nestjs/common';
import { ExcepcionDominio } from '../../../comun/excepciones/excepcion-dominio';
import { ServicioRespuestaEstandar } from '../../../comun/aplicacion/servicios/servicio-respuesta-estandar';
import { VerificarCodigoRecuperacionDto } from '../../aplicacion/dto/verificar-codigo-recuperacion.dto';
import type { RepositorioTokenRecuperacionContrasena } from '../interfaces/repositorio-token-recuperacion-contrasena.interface';

/**
 * Caso de uso para verificar el código de recuperación de contraseña
 * Implementa la lógica de negocio para validar códigos de recuperación
 */
@Injectable()
export class VerificarCodigoRecuperacionCasoUso {
  constructor(
    @Inject('RepositorioTokenRecuperacionContrasena')
    private readonly repositorioTokenRecuperacion: RepositorioTokenRecuperacionContrasena,
  ) {}

  /**
   * Ejecuta el proceso de verificación del código de recuperación
   * @param datos - Datos de verificación del código
   * @returns Respuesta estándar indicando éxito o error
   */
  async ejecutar(datos: VerificarCodigoRecuperacionDto) {
    try {
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

      // Verificar que el código coincida
      if (token.codigo !== datos.codigo) {
        throw ExcepcionDominio.Respuesta400(
          'Código de verificación incorrecto',
          'Admin.CodigoIncorrecto'
        );
      }

      // Marcar token como utilizado
      await this.repositorioTokenRecuperacion.marcarComoUtilizado(token.id);

      return ServicioRespuestaEstandar.Respuesta200(
        'Código verificado exitosamente',
        { 
          token: datos.token,
          valido: true 
        },
        'Admin.CodigoVerificadoExitosamente'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      
      throw ExcepcionDominio.Respuesta500(
        'Error interno del servidor durante la verificación del código',
        'Servidor.ErrorInterno'
      );
    }
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