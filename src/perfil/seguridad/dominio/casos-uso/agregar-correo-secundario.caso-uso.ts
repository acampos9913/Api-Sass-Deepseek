import { Injectable } from '@nestjs/common';
import { ServicioRespuestaEstandar } from '../../../../comun/aplicacion/servicios/servicio-respuesta-estandar';
import type { RepositorioSeguridad } from '../interfaces/repositorio-seguridad.interface';
import { ExcepcionDominio } from '../../../../comun/excepciones/excepcion-dominio';

export class AgregarCorreoSecundarioDto {
  correo_secundario: string;
}

@Injectable()
export class AgregarCorreoSecundarioCasoUso {
  constructor(
    private readonly repositorioSeguridad: RepositorioSeguridad,
  ) {}

  async ejecutar(usuarioId: string, datos: AgregarCorreoSecundarioDto) {
    try {
      // Validaciones básicas
      if (!datos.correo_secundario) {
        throw ExcepcionDominio.Respuesta400(
          'El correo electrónico secundario es requerido',
          'Seguridad.CorreoSecundarioRequerido'
        );
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(datos.correo_secundario)) {
        throw ExcepcionDominio.Respuesta400(
          'El formato del correo electrónico secundario es inválido',
          'Seguridad.CorreoSecundarioInvalido'
        );
      }

      // Agregar correo secundario
      const resultado = await this.repositorioSeguridad.agregarCorreoSecundario(
        usuarioId, 
        datos.correo_secundario
      );

      if (!resultado) {
        throw ExcepcionDominio.Respuesta500(
          'Error al agregar el correo electrónico secundario',
          'Seguridad.ErrorAgregarCorreoSecundario'
        );
      }

      return ServicioRespuestaEstandar.Respuesta200(
        'Correo electrónico secundario agregado exitosamente',
        { correo_secundario: datos.correo_secundario, agregado: true },
        'Seguridad.CorreoSecundarioAgregadoExitosamente'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }

      throw ExcepcionDominio.Respuesta500(
        'Error al agregar el correo electrónico secundario',
        'Seguridad.ErrorAgregarCorreoSecundario'
      );
    }
  }
}