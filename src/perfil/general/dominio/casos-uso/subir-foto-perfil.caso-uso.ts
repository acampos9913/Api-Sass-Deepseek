import { Injectable } from '@nestjs/common';
import type { RepositorioPerfilGeneral } from '../interfaces/repositorio-perfil-general.interface';
import { ExcepcionDominio } from '../../../../comun/excepciones/excepcion-dominio';
import { ServicioRespuestaEstandar } from '../../../../comun/aplicacion/servicios/servicio-respuesta-estandar';

@Injectable()
export class SubirFotoPerfilCasoUso {
  constructor(
    private readonly repositorioPerfil: RepositorioPerfilGeneral,
  ) {}

  async ejecutar(usuarioId: string, fotoBase64: string) {
    try {
      // Validar que la foto sea base64 válida
      this.validarFotoBase64(fotoBase64);

      // Verificar que el usuario existe
      const usuarioExistente = await this.repositorioPerfil.encontrarPorId(usuarioId);
      if (!usuarioExistente) {
        throw ExcepcionDominio.Respuesta404(
          'Usuario no encontrado',
          'Perfil.UsuarioNoEncontrado'
        );
      }

      // Validar tamaño de la foto (máximo 5MB en base64)
      if (fotoBase64.length > 7 * 1024 * 1024) { // ~7MB para base64 overhead
        throw ExcepcionDominio.Respuesta400(
          'La foto no puede superar los 5MB',
          'Perfil.FotoTamañoExcedido'
        );
      }

      // Actualizar foto de perfil
      const usuarioActualizado = await this.repositorioPerfil.actualizarFoto(usuarioId, fotoBase64);

      const perfilDto = {
        id: usuarioActualizado.id,
        nombre: usuarioActualizado.nombre,
        apellido: usuarioActualizado.apellido,
        email: usuarioActualizado.email,
        foto: usuarioActualizado.foto,
        telefono: usuarioActualizado.telefono,
        idioma: usuarioActualizado.idioma,
        zonaHoraria: usuarioActualizado.zona_horaria,
        correoVerificado: !!usuarioActualizado.fecha_verificacion_correo,
        telefonoVerificado: !!usuarioActualizado.fecha_verificacion_telefono,
        fechaCreacion: usuarioActualizado.fecha_creacion,
        fechaActualizacion: usuarioActualizado.fecha_actualizacion,
      };

      return ServicioRespuestaEstandar.Respuesta200(
        'Foto de perfil actualizada exitosamente',
        perfilDto,
        'Perfil.FotoActualizadaExitosamente'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      
      throw ExcepcionDominio.Respuesta500(
        'Error al actualizar la foto de perfil',
        'Perfil.ErrorActualizacionFoto'
      );
    }
  }

  private validarFotoBase64(fotoBase64: string): void {
    if (!fotoBase64) {
      throw ExcepcionDominio.Respuesta400(
        'La foto es requerida',
        'Perfil.FotoRequerida'
      );
    }

    // Validar formato base64 básico
    const base64Regex = /^data:image\/(jpeg|jpg|png|gif|webp);base64,[A-Za-z0-9+/]+={0,2}$/;
    if (!base64Regex.test(fotoBase64)) {
      throw ExcepcionDominio.Respuesta400(
        'Formato de foto inválido. Debe ser una imagen en formato base64 válida (JPEG, JPG, PNG, GIF, WEBP)',
        'Perfil.FormatoFotoInvalido'
      );
    }

    // Extraer el tipo MIME y validar
    const mimeType = fotoBase64.split(';')[0].split(':')[1];
    const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    
    if (!tiposPermitidos.includes(mimeType)) {
      throw ExcepcionDominio.Respuesta400(
        'Tipo de imagen no permitido. Formatos permitidos: JPEG, JPG, PNG, GIF, WEBP',
        'Perfil.TipoImagenNoPermitido'
      );
    }
  }
}