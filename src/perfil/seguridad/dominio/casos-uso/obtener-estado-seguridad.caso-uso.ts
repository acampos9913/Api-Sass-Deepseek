import { Injectable, Inject } from '@nestjs/common';
import { ServicioRespuestaEstandar } from '../../../../comun/aplicacion/servicios/servicio-respuesta-estandar';
import type { RepositorioSeguridad } from '../interfaces/repositorio-seguridad.interface';
import { ExcepcionDominio } from '../../../../comun/excepciones/excepcion-dominio';

@Injectable()
export class ObtenerEstadoSeguridadCasoUso {
  constructor(
    @Inject('RepositorioSeguridad') private readonly repositorioSeguridad: RepositorioSeguridad,
  ) {}

  async ejecutar(usuarioId: string) {
    try {
      const estadoSeguridad = await this.repositorioSeguridad.obtenerEstadoSeguridad(usuarioId);

      return ServicioRespuestaEstandar.Respuesta200(
        'Estado de seguridad obtenido exitosamente',
        estadoSeguridad,
        'Seguridad.EstadoObtenidoExitosamente'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }

      throw ExcepcionDominio.Respuesta500(
        'Error al obtener el estado de seguridad',
        'Seguridad.ErrorInterno'
      );
    }
  }
}