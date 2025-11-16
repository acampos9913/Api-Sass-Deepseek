import { Injectable } from '@nestjs/common';
import type { RepositorioPerfilGeneral } from '../interfaces/repositorio-perfil-general.interface';
import { ExcepcionDominio } from '../../../../comun/excepciones/excepcion-dominio';
import { ServicioRespuestaEstandar } from '../../../../comun/aplicacion/servicios/servicio-respuesta-estandar';

@Injectable()
export class CambiarCorreoPerfilCasoUso {
  constructor(
    private readonly repositorioPerfil: RepositorioPerfilGeneral,
  ) {}

  async ejecutar(usuarioId: string, nuevoCorreo: string) {
    try {
      // Validar formato de correo
      this.validarCorreo(nuevoCorreo);

      // Verificar que el usuario existe
      const usuarioExistente = await this.repositorioPerfil.encontrarPorId(usuarioId);
      if (!usuarioExistente) {
        throw ExcepcionDominio.Respuesta404(
          'Usuario no encontrado',
          'Perfil.UsuarioNoEncontrado'
        );
      }

      // Verificar que el nuevo correo no sea el mismo que el actual
      if (usuarioExistente.email === nuevoCorreo) {
        throw ExcepcionDominio.Respuesta400(
          'El nuevo correo electrónico debe ser diferente al actual',
          'Perfil.CorreoIgualActual'
        );
      }

      // Actualizar correo electrónico
      const usuarioActualizado = await this.repositorioPerfil.actualizarCorreo(usuarioId, nuevoCorreo);

      const perfilDto = {
        id: usuarioActualizado.id,
        nombre: usuarioActualizado.nombre,
        apellido: usuarioActualizado.apellido,
        email: usuarioActualizado.email,
        foto: usuarioActualizado.foto,
        telefono: usuarioActualizado.telefono,
        idioma: usuarioActualizado.idioma,
        zonaHoraria: usuarioActualizado.zona_horaria,
        correoVerificado: false, // Se reinicia la verificación al cambiar correo
        telefonoVerificado: !!usuarioActualizado.fecha_verificacion_telefono,
        fechaCreacion: usuarioActualizado.fecha_creacion,
        fechaActualizacion: usuarioActualizado.fecha_actualizacion,
      };

      return ServicioRespuestaEstandar.Respuesta200(
        'Correo electrónico actualizado exitosamente. Se requiere verificación del nuevo correo.',
        perfilDto,
        'Perfil.CorreoActualizadoExitosamente'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      
      throw ExcepcionDominio.Respuesta500(
        'Error al actualizar el correo electrónico',
        'Perfil.ErrorActualizacionCorreo'
      );
    }
  }

  private validarCorreo(correo: string): void {
    if (!correo) {
      throw ExcepcionDominio.Respuesta400(
        'El correo electrónico es requerido',
        'Perfil.CorreoRequerido'
      );
    }

    // Validar formato de correo electrónico
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(correo)) {
      throw ExcepcionDominio.Respuesta400(
        'El formato del correo electrónico no es válido',
        'Perfil.FormatoCorreoInvalido'
      );
    }

    // Validar longitud máxima
    if (correo.length > 254) {
      throw ExcepcionDominio.Respuesta400(
        'El correo electrónico no puede exceder los 254 caracteres',
        'Perfil.CorreoDemasiadoLargo'
      );
    }
  }
}