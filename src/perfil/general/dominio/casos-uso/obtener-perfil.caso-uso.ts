import { Injectable } from '@nestjs/common';
import type { RepositorioPerfilGeneral } from '../interfaces/repositorio-perfil-general.interface';
import { ExcepcionDominio } from '../../../../comun/excepciones/excepcion-dominio';
import { ServicioRespuestaEstandar } from '../../../../comun/aplicacion/servicios/servicio-respuesta-estandar';

@Injectable()
export class ObtenerPerfilCasoUso {
  constructor(
    private readonly repositorioPerfil: RepositorioPerfilGeneral,
  ) {}

  async ejecutar(usuarioId: string) {
    try {
      const usuario = await this.repositorioPerfil.encontrarPorId(usuarioId);

      if (!usuario) {
        throw ExcepcionDominio.Respuesta404(
          'Usuario no encontrado',
          'Perfil.UsuarioNoEncontrado'
        );
      }

      const perfilDto = {
        id: usuario.id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        foto: usuario.foto,
        telefono: usuario.telefono,
        idioma: usuario.idioma,
        zonaHoraria: usuario.zona_horaria,
        correoVerificado: !!usuario.fecha_verificacion_correo,
        telefonoVerificado: !!usuario.fecha_verificacion_telefono,
        serviciosExternos: usuario.serviciosExternos || [],
        fechaCreacion: usuario.fecha_creacion,
        fechaActualizacion: usuario.fecha_actualizacion,
      };

      return ServicioRespuestaEstandar.Respuesta200(
        'Perfil obtenido exitosamente',
        perfilDto,
        'Perfil.ObtenidoExitosamente'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      
      throw ExcepcionDominio.Respuesta500(
        'Error al obtener el perfil del usuario',
        'Perfil.ErrorObtencion'
      );
    }
  }
}