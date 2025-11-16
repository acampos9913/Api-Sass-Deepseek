import { Injectable } from '@nestjs/common';
import { ServicioRespuestaEstandar } from '../../../../comun/aplicacion/servicios/servicio-respuesta-estandar';
import type { RepositorioSeguridad } from '../interfaces/repositorio-seguridad.interface';
import { ExcepcionDominio } from '../../../../comun/excepciones/excepcion-dominio';

@Injectable()
export class CerrarSesionDispositivoCasoUso {
  constructor(
    private readonly repositorioSeguridad: RepositorioSeguridad,
  ) {}

  async ejecutar(usuarioId: string, dispositivoId: string) {
    try {
      // Validaciones básicas
      if (!dispositivoId) {
        throw ExcepcionDominio.Respuesta400(
          'El ID del dispositivo es requerido',
          'Seguridad.DispositivoIdRequerido'
        );
      }

      // Cerrar sesión en el dispositivo
      const resultado = await this.repositorioSeguridad.cerrarSesionDispositivo(
        usuarioId, 
        dispositivoId
      );

      if (!resultado) {
        throw ExcepcionDominio.Respuesta500(
          'Error al cerrar sesión en el dispositivo',
          'Seguridad.ErrorCerrarSesionDispositivo'
        );
      }

      return ServicioRespuestaEstandar.Respuesta200(
        'Sesión cerrada exitosamente en el dispositivo',
        { dispositivo_id: dispositivoId, sesion_cerrada: true },
        'Seguridad.SesionDispositivoCerradaExitosamente'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }

      throw ExcepcionDominio.Respuesta500(
        'Error al cerrar sesión en el dispositivo',
        'Seguridad.ErrorCerrarSesionDispositivo'
      );
    }
  }
}