import { Injectable } from '@nestjs/common';
import { ServicioRespuestaEstandar } from '../../../../comun/aplicacion/servicios/servicio-respuesta-estandar';
import type { RepositorioSeguridad } from '../interfaces/repositorio-seguridad.interface';
import { ExcepcionDominio } from '../../../../comun/excepciones/excepcion-dominio';

export class ActivarDesactivar2FADto {
  activar: boolean;
}

@Injectable()
export class ActivarDesactivar2FACasoUso {
  constructor(
    private readonly repositorioSeguridad: RepositorioSeguridad,
  ) {}

  async ejecutar(usuarioId: string, datos: ActivarDesactivar2FADto) {
    try {
      // Validaciones básicas
      if (typeof datos.activar !== 'boolean') {
        throw ExcepcionDominio.Respuesta400(
          'El campo activar debe ser un valor booleano',
          'Seguridad.Activar2FAInvalido'
        );
      }

      // Activar/desactivar 2FA
      const resultado = await this.repositorioSeguridad.activarDesactivar2FA(
        usuarioId, 
        datos.activar
      );

      if (!resultado) {
        throw ExcepcionDominio.Respuesta400(
          'Error al actualizar la autenticación en dos pasos',
          'Seguridad.ErrorActualizar2FA'
        );
      }

      const mensaje = datos.activar 
        ? 'Autenticación en dos pasos activada exitosamente'
        : 'Autenticación en dos pasos desactivada exitosamente';

      const tipoMensaje = datos.activar
        ? 'Seguridad.2FAActivadoExitosamente'
        : 'Seguridad.2FADesactivadoExitosamente';

      return ServicioRespuestaEstandar.Respuesta200(
        mensaje,
        { autenticacion_2pasos: datos.activar, actualizado: true },
        tipoMensaje
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }

      throw ExcepcionDominio.Respuesta500(
        'Error al actualizar la autenticación en dos pasos',
        'Seguridad.ErrorActualizar2FA'
      );
    }
  }
}