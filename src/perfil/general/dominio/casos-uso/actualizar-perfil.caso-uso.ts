import { Injectable } from '@nestjs/common';
import type { RepositorioPerfilGeneral } from '../interfaces/repositorio-perfil-general.interface';
import { ExcepcionDominio } from '../../../../comun/excepciones/excepcion-dominio';
import { ServicioRespuestaEstandar } from '../../../../comun/aplicacion/servicios/servicio-respuesta-estandar';

export interface ActualizarPerfilDto {
  nombre?: string;
  apellido?: string;
  idioma?: string;
  zonaHoraria?: string;
}

@Injectable()
export class ActualizarPerfilCasoUso {
  constructor(
    private readonly repositorioPerfil: RepositorioPerfilGeneral,
  ) {}

  async ejecutar(usuarioId: string, datos: ActualizarPerfilDto) {
    try {
      // Validar datos de entrada
      this.validarDatosPerfil(datos);

      // Verificar que el usuario existe
      const usuarioExistente = await this.repositorioPerfil.encontrarPorId(usuarioId);
      if (!usuarioExistente) {
        throw ExcepcionDominio.Respuesta404(
          'Usuario no encontrado',
          'Perfil.UsuarioNoEncontrado'
        );
      }

      // Actualizar perfil
      const usuarioActualizado = await this.repositorioPerfil.actualizar(usuarioId, datos);

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
        'Perfil actualizado exitosamente',
        perfilDto,
        'Perfil.ActualizadoExitosamente'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      
      throw ExcepcionDominio.Respuesta500(
        'Error al actualizar el perfil del usuario',
        'Perfil.ErrorActualizacion'
      );
    }
  }

  private validarDatosPerfil(datos: ActualizarPerfilDto): void {
    if (datos.nombre && !this.validarNombre(datos.nombre)) {
      throw ExcepcionDominio.Respuesta400(
        'El nombre debe tener al menos 2 caracteres y solo contener letras y espacios',
        'Perfil.NombreInvalido'
      );
    }

    if (datos.apellido && !this.validarNombre(datos.apellido)) {
      throw ExcepcionDominio.Respuesta400(
        'El apellido debe tener al menos 2 caracteres y solo contener letras y espacios',
        'Perfil.ApellidoInvalido'
      );
    }

    if (datos.idioma && !this.validarIdioma(datos.idioma)) {
      throw ExcepcionDominio.Respuesta400(
        'El idioma seleccionado no es válido',
        'Perfil.IdiomaInvalido'
      );
    }

    if (datos.zonaHoraria && !this.validarZonaHoraria(datos.zonaHoraria)) {
      throw ExcepcionDominio.Respuesta400(
        'La zona horaria seleccionada no es válida',
        'Perfil.ZonaHorariaInvalida'
      );
    }
  }

  private validarNombre(nombre: string): boolean {
    const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,50}$/;
    return regex.test(nombre);
  }

  private validarIdioma(idioma: string): boolean {
    const idiomasPermitidos = ['es', 'en', 'fr', 'de', 'it', 'pt', 'ru', 'zh', 'ja', 'ko'];
    return idiomasPermitidos.includes(idioma);
  }

  private validarZonaHoraria(zonaHoraria: string): boolean {
    const zonasHorariasPermitidas = [
      'America/Lima',
      'America/New_York',
      'America/Los_Angeles',
      'Europe/Madrid',
      'Europe/London',
      'Asia/Tokyo',
      'Australia/Sydney'
    ];
    return zonasHorariasPermitidas.includes(zonaHoraria);
  }
}