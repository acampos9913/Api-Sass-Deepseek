import { Injectable } from '@nestjs/common';
import type { RepositorioPerfilGeneral } from '../interfaces/repositorio-perfil-general.interface';
import { ExcepcionDominio } from '../../../../comun/excepciones/excepcion-dominio';
import { ServicioRespuestaEstandar } from '../../../../comun/aplicacion/servicios/servicio-respuesta-estandar';

@Injectable()
export class ActualizarTelefonoPerfilCasoUso {
  constructor(
    private readonly repositorioPerfil: RepositorioPerfilGeneral,
  ) {}

  async ejecutar(usuarioId: string, telefono: string) {
    try {
      // Validar formato de teléfono
      this.validarTelefono(telefono);

      // Verificar que el usuario existe
      const usuarioExistente = await this.repositorioPerfil.encontrarPorId(usuarioId);
      if (!usuarioExistente) {
        throw ExcepcionDominio.Respuesta404(
          'Usuario no encontrado',
          'Perfil.UsuarioNoEncontrado'
        );
      }

      // Verificar que el nuevo teléfono no sea el mismo que el actual
      if (usuarioExistente.telefono === telefono) {
        throw ExcepcionDominio.Respuesta400(
          'El nuevo número de teléfono debe ser diferente al actual',
          'Perfil.TelefonoIgualActual'
        );
      }

      // Actualizar teléfono
      const usuarioActualizado = await this.repositorioPerfil.actualizarTelefono(usuarioId, telefono);

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
        telefonoVerificado: false, // Se reinicia la verificación al cambiar teléfono
        fechaCreacion: usuarioActualizado.fecha_creacion,
        fechaActualizacion: usuarioActualizado.fecha_actualizacion,
      };

      return ServicioRespuestaEstandar.Respuesta200(
        'Número de teléfono actualizado exitosamente. Se requiere verificación del nuevo número.',
        perfilDto,
        'Perfil.TelefonoActualizadoExitosamente'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      
      throw ExcepcionDominio.Respuesta500(
        'Error al actualizar el número de teléfono',
        'Perfil.ErrorActualizacionTelefono'
      );
    }
  }

  private validarTelefono(telefono: string): void {
    if (!telefono) {
      throw ExcepcionDominio.Respuesta400(
        'El número de teléfono es requerido',
        'Perfil.TelefonoRequerido'
      );
    }

    // Validar formato internacional E.164
    const telefonoRegex = /^\+[1-9]\d{1,14}$/;
    if (!telefonoRegex.test(telefono)) {
      throw ExcepcionDominio.Respuesta400(
        'El formato del número de teléfono no es válido. Debe seguir el formato internacional E.164 (ej: +51987654321)',
        'Perfil.FormatoTelefonoInvalido'
      );
    }

    // Validar longitud mínima y máxima
    if (telefono.length < 8 || telefono.length > 15) {
      throw ExcepcionDominio.Respuesta400(
        'El número de teléfono debe tener entre 8 y 15 dígitos',
        'Perfil.TelefonoLongitudInvalida'
      );
    }

    // Validar que el código de país sea válido (ejemplo básico)
    const codigosPaisPermitidos = ['+51', '+1', '+52', '+34', '+44', '+49', '+33', '+39', '+55'];
    const codigoPais = telefono.substring(0, 3);
    
    if (!codigosPaisPermitidos.includes(codigoPais)) {
      throw ExcepcionDominio.Respuesta400(
        'El código de país no está soportado. Códigos permitidos: +51 (Perú), +1 (EEUU/Canadá), +52 (México), +34 (España), +44 (Reino Unido), +49 (Alemania), +33 (Francia), +39 (Italia), +55 (Brasil)',
        'Perfil.CodigoPaisNoSoportado'
      );
    }
  }
}