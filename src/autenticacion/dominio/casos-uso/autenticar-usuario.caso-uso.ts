import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { Usuario } from '../entidades/usuario.entity';
import type { RepositorioUsuario } from '../interfaces/repositorio-usuario.interface';
import { ServicioRespuestaEstandar } from '../../../comun/aplicacion/servicios/servicio-respuesta-estandar';
import { ExcepcionDominio } from '../../../comun/excepciones/excepcion-dominio';
import type { RespuestaEstandar } from '../../../comun/aplicacion/servicios/servicio-respuesta-estandar';

/**
 * DTO de entrada para la autenticación
 */
export interface CredencialesAutenticacion {
  email: string;
  contrasena: string;
}

/**
 * DTO de respuesta con el token de autenticación
 */
export interface RespuestaAutenticacion {
  token: string;
  usuario: {
    id: string;
    email: string;
    nombreCompleto: string;
    rol: string;
  };
}

/**
 * Caso de uso para autenticar un usuario
 * Sigue los principios de Domain-Driven Design y Arquitectura Limpia
 */
@Injectable()
export class AutenticarUsuarioCasoUso {
  constructor(
    @Inject('RepositorioUsuario')
    private readonly repositorioUsuario: RepositorioUsuario,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Ejecuta el caso de uso de autenticación
   * @param credenciales - Credenciales del usuario (email y contraseña)
   * @returns Promise con la respuesta de autenticación estándar
   */
  async ejecutar(
    credenciales: CredencialesAutenticacion,
  ): Promise<RespuestaEstandar> {
    // Buscar usuario por email
    const usuario = await this.repositorioUsuario.buscarPorEmail(
      credenciales.email,
    );

    if (!usuario) {
      throw ExcepcionDominio.Respuesta400(
        'Credenciales inválidas',
        'Autenticacion.CredencialesInvalidas'
      );
    }

    // Verificar si el usuario está activo
    if (!usuario.puedeOperar()) {
      throw ExcepcionDominio.Respuesta400(
        'Usuario inactivo',
        'Autenticacion.UsuarioInactivo'
      );
    }

    // Verificar contraseña
    const contrasenaValida = await bcrypt.compare(
      credenciales.contrasena,
      usuario.contrasenaHash,
    );

    if (!contrasenaValida) {
      throw ExcepcionDominio.Respuesta400(
        'Credenciales inválidas',
        'Autenticacion.CredencialesInvalidas'
      );
    }

    // Actualizar último acceso
    const usuarioActualizado = usuario.actualizarUltimoAcceso();
    await this.repositorioUsuario.actualizar(usuarioActualizado);

    // Generar token JWT
    const token = this.generarToken(usuarioActualizado);

    const datosAutenticacion: RespuestaAutenticacion = {
      token,
      usuario: {
        id: usuarioActualizado.id,
        email: usuarioActualizado.email,
        nombreCompleto: usuarioActualizado.nombreCompleto,
        rol: usuarioActualizado.rol,
      },
    };

    return ServicioRespuestaEstandar.Respuesta200(
      'Autenticación exitosa',
      datosAutenticacion,
      'Autenticacion.Exito'
    );
  }

  /**
   * Genera un token JWT para el usuario
   * @param usuario - Usuario para el que se genera el token
   * @returns Token JWT firmado
   */
  private generarToken(usuario: Usuario): string {
    const payload = {
      sub: usuario.id,
      email: usuario.email,
      rol: usuario.rol,
      nombre: usuario.nombreCompleto,
    };

    return this.jwtService.sign(payload);
  }
}