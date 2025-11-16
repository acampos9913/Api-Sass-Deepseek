import { Injectable, Inject } from '@nestjs/common';
import { ExcepcionDominio } from '../../../comun/excepciones/excepcion-dominio';
import { ServicioRespuestaEstandar } from '../../../comun/aplicacion/servicios/servicio-respuesta-estandar';
import { RegistrarAdminDto } from '../../aplicacion/dto/registrar-admin.dto';
import type { RepositorioUsuario } from '../../../autenticacion/dominio/interfaces/repositorio-usuario.interface';
import type { ServicioHashing } from '../../../comun/infraestructura/servicios/servicio-hashing';
import type { ServicioEmail } from '../../../comun/infraestructura/servicios/servicio-email';
import { RolUsuario } from '../../../autenticacion/dominio/enums/rol-usuario.enum';
import { Usuario } from '../../../autenticacion/dominio/entidades/usuario.entity';

/**
 * Caso de uso para registrar un nuevo administrador
 * Implementa la lógica de negocio para el registro de administradores
 */
@Injectable()
export class RegistrarAdminCasoUso {
  constructor(
    @Inject('RepositorioUsuario')
    private readonly repositorioUsuario: RepositorioUsuario,
    @Inject('ServicioHashing')
    private readonly servicioHashing: ServicioHashing,
    @Inject('ServicioEmail')
    private readonly servicioEmail: ServicioEmail,
  ) {}

  /**
   * Ejecuta el proceso de registro de administrador
   * @param datos - Datos de registro del administrador
   * @returns Respuesta estándar con el usuario creado o error
   */
  async ejecutar(datos: RegistrarAdminDto) {
    try {
      // Validar que el email no esté en uso
      const usuarioExistente = await this.repositorioUsuario.buscarPorEmail(datos.email);
      
      if (usuarioExistente) {
        throw ExcepcionDominio.Respuesta400(
          'El correo electrónico ya está en uso',
          'Admin.EmailEnUso'
        );
      }

      // Validar que las contraseñas coincidan
      if (datos.contrasena !== datos.confirmacionContrasena) {
        throw ExcepcionDominio.Respuesta400(
          'Las contraseñas no coinciden',
          'Admin.ContrasenasNoCoinciden'
        );
      }

      // Validar fortaleza de contraseña usando el servicio
      const validacionContrasena = this.servicioHashing.validarFortalezaContrasena(datos.contrasena);
      if (!validacionContrasena.valida) {
        throw ExcepcionDominio.Respuesta400(
          `La contraseña no cumple con los requisitos de seguridad: ${validacionContrasena.errores.join(', ')}`,
          'Admin.ContrasenaDebil'
        );
      }

      // Generar hash seguro de la contraseña
      const contrasenaHash = await this.servicioHashing.hash(datos.contrasena);

      // Crear entidad de usuario con hash seguro
      const usuario = new Usuario(
        this.generarIdUnico(),
        datos.email,
        contrasenaHash, // Hash seguro en lugar de texto plano
        `${datos.nombre} ${datos.apellido}`,
        RolUsuario.ADMIN, // Por defecto, rol ADMIN para nuevos registros
        true, // Activo por defecto
        new Date(),
        new Date(),
      );

      // Guardar usuario en el repositorio
      const usuarioCreado = await this.repositorioUsuario.guardar(usuario);

      // Enviar email de bienvenida
      await this.servicioEmail.enviarNotificacionRegistro(
        usuarioCreado.email,
        usuarioCreado.nombreCompleto
      );

      return ServicioRespuestaEstandar.Respuesta201(
        'Administrador registrado exitosamente',
        {
          usuario: {
            id: usuarioCreado.id,
            email: usuarioCreado.email,
            nombreCompleto: usuarioCreado.nombreCompleto,
            rol: usuarioCreado.rol,
          },
        },
        'Admin.RegistroExitoso'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      
      throw ExcepcionDominio.Respuesta500(
        'Error interno del servidor durante el registro',
        'Servidor.ErrorInterno'
      );
    }
  }


  /**
   * Genera un ID único para el usuario
   * @returns ID único generado
   */
  private generarIdUnico(): string {
    // En producción, usar una librería como nanoid
    return `usr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}