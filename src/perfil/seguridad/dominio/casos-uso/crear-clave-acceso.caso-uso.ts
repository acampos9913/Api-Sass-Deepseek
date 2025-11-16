import { Injectable } from '@nestjs/common';
import { ServicioRespuestaEstandar } from '../../../../comun/aplicacion/servicios/servicio-respuesta-estandar';
import type { RepositorioSeguridad } from '../interfaces/repositorio-seguridad.interface';
import { ExcepcionDominio } from '../../../../comun/excepciones/excepcion-dominio';

export class CrearClaveAccesoDto {
  tipo: string;
  estado: 'activa' | 'inactiva';
  dispositivos_vinculados: string[];
}

@Injectable()
export class CrearClaveAccesoCasoUso {
  constructor(
    private readonly repositorioSeguridad: RepositorioSeguridad,
  ) {}

  async ejecutar(usuarioId: string, datos: CrearClaveAccesoDto) {
    try {
      // Validaciones
      if (!datos.tipo || !datos.estado) {
        throw ExcepcionDominio.Respuesta400(
          'Tipo y estado de la clave de acceso son requeridos',
          'Seguridad.DatosClaveAccesoIncompletos'
        );
      }

      if (datos.dispositivos_vinculados && !Array.isArray(datos.dispositivos_vinculados)) {
        throw ExcepcionDominio.Respuesta400(
          'Los dispositivos vinculados deben ser un array',
          'Seguridad.DispositivosVinculadosInvalidos'
        );
      }

      const claveAcceso = await this.repositorioSeguridad.crearClaveAcceso(usuarioId, {
        usuario_id: usuarioId,
        tipo: datos.tipo,
        estado: datos.estado,
        dispositivos_vinculados: datos.dispositivos_vinculados || [],
        fecha_creacion: new Date(),
        fecha_actualizacion: new Date(),
      });

      return ServicioRespuestaEstandar.Respuesta200(
        'Clave de acceso creada exitosamente',
        claveAcceso,
        'Seguridad.ClaveAccesoCreadaExitosamente'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }

      throw ExcepcionDominio.Respuesta500(
        'Error al crear la clave de acceso',
        'Seguridad.ErrorCrearClaveAcceso'
      );
    }
  }
}