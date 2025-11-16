import { Injectable } from '@nestjs/common';
import type { RepositorioPerfilGeneral, ServicioExternoUsuario } from '../interfaces/repositorio-perfil-general.interface';
import { ExcepcionDominio } from '../../../../comun/excepciones/excepcion-dominio';
import { ServicioRespuestaEstandar } from '../../../../comun/aplicacion/servicios/servicio-respuesta-estandar';

export interface VincularServicioExternoDto {
  proveedor: 'APPLE' | 'FACEBOOK' | 'GOOGLE';
  idExterno: string;
  emailExterno?: string;
}

@Injectable()
export class VincularServicioExternoCasoUso {
  constructor(
    private readonly repositorioPerfil: RepositorioPerfilGeneral,
  ) {}

  async ejecutar(usuarioId: string, datos: VincularServicioExternoDto) {
    try {
      // Validar datos de entrada
      this.validarDatosServicioExterno(datos);

      // Verificar que el usuario existe
      const usuarioExistente = await this.repositorioPerfil.encontrarPorId(usuarioId);
      if (!usuarioExistente) {
        throw ExcepcionDominio.Respuesta404(
          'Usuario no encontrado',
          'Perfil.UsuarioNoEncontrado'
        );
      }

      // Verificar que el servicio externo no esté ya vinculado
      const serviciosExistentes = await this.repositorioPerfil.encontrarServiciosExternos(usuarioId);
      const servicioYaVinculado = serviciosExistentes.find(
        servicio => servicio.proveedor === datos.proveedor && servicio.activo
      );

      if (servicioYaVinculado) {
        throw ExcepcionDominio.Respuesta400(
          `Ya existe una vinculación activa con ${datos.proveedor}`,
          'Perfil.ServicioYaVinculado'
        );
      }

      // Crear objeto de servicio externo
      const servicioExterno: ServicioExternoUsuario = {
        id: '', // Se generará en la base de datos
        proveedor: datos.proveedor,
        idExterno: datos.idExterno,
        emailExterno: datos.emailExterno,
        activo: true,
        fechaConexion: new Date(),
        fechaActualizacion: new Date(),
      };

      // Vincular servicio externo
      const usuarioActualizado = await this.repositorioPerfil.vincularServicioExterno(usuarioId, servicioExterno);

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
        serviciosExternos: await this.repositorioPerfil.encontrarServiciosExternos(usuarioId),
        fechaCreacion: usuarioActualizado.fecha_creacion,
        fechaActualizacion: usuarioActualizado.fecha_actualizacion,
      };

      return ServicioRespuestaEstandar.Respuesta200(
        `Servicio ${datos.proveedor} vinculado exitosamente`,
        perfilDto,
        'Perfil.ServicioVinculadoExitosamente'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      
      throw ExcepcionDominio.Respuesta500(
        `Error al vincular el servicio ${datos.proveedor}`,
        'Perfil.ErrorVinculacionServicio'
      );
    }
  }

  private validarDatosServicioExterno(datos: VincularServicioExternoDto): void {
    if (!datos.proveedor) {
      throw ExcepcionDominio.Respuesta400(
        'El proveedor del servicio externo es requerido',
        'Perfil.ProveedorRequerido'
      );
    }

    if (!['APPLE', 'FACEBOOK', 'GOOGLE'].includes(datos.proveedor)) {
      throw ExcepcionDominio.Respuesta400(
        'Proveedor de servicio externo no válido. Proveedores permitidos: APPLE, FACEBOOK, GOOGLE',
        'Perfil.ProveedorInvalido'
      );
    }

    if (!datos.idExterno) {
      throw ExcepcionDominio.Respuesta400(
        'El ID externo del servicio es requerido',
        'Perfil.IdExternoRequerido'
      );
    }

    if (datos.idExterno.length < 1 || datos.idExterno.length > 255) {
      throw ExcepcionDominio.Respuesta400(
        'El ID externo debe tener entre 1 y 255 caracteres',
        'Perfil.IdExternoLongitudInvalida'
      );
    }

    if (datos.emailExterno) {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(datos.emailExterno)) {
        throw ExcepcionDominio.Respuesta400(
          'El formato del correo electrónico externo no es válido',
          'Perfil.FormatoEmailExternoInvalido'
        );
      }
    }
  }
}