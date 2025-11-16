import { Injectable, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

/**
 * Interfaz para el payload del token JWT
 */
export interface PayloadJwt {
  sub?: string;
  email?: string;
  rol?: string;
  tipo?: string;
  exp?: number;
  iat?: number;
  iss?: string;
  aud?: string;
  [key: string]: any; // Para propiedades adicionales que pueda tener el token
}

/**
 * Servicio para manejo de tokens JWT
 * Encapsula la funcionalidad de generación y verificación de tokens JWT
 */
@Injectable()
export class ServicioJwt {
  constructor(
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Genera un token JWT de acceso
   * @param usuarioId - ID del usuario
   * @param email - Email del usuario
   * @param rol - Rol del usuario
   * @returns Token JWT firmado
   */
  generarTokenAcceso(usuarioId: string, email: string, rol: string): string {
    const payload: PayloadJwt = {
      sub: usuarioId,
      email,
      rol,
      tipo: 'access_token',
    };

    return this.jwtService.sign(payload, {
      expiresIn: '24h', // 24 horas de expiración
      issuer: 'ecommerce-saas',
      audience: 'ecommerce-admin',
    });
  }

  /**
   * Genera un token JWT de refresh
   * @param usuarioId - ID del usuario
   * @returns Token JWT de refresh
   */
  generarTokenRefresh(usuarioId: string): string {
    const payload: PayloadJwt = {
      sub: usuarioId,
      tipo: 'refresh_token',
    };

    return this.jwtService.sign(payload, {
      expiresIn: '7d', // 7 días de expiración
      issuer: 'ecommerce-saas',
      audience: 'ecommerce-admin',
    });
  }

  /**
   * Verifica y decodifica un token JWT
   * @param token - Token JWT a verificar
   * @returns Payload decodificado o null si es inválido
   */
  verificarToken(token: string): PayloadJwt | null {
    try {
      return this.jwtService.verify(token, {
        issuer: 'ecommerce-saas',
        audience: 'ecommerce-admin',
      });
    } catch (error) {
      return null;
    }
  }

  /**
   * Decodifica un token JWT sin verificar la firma
   * @param token - Token JWT a decodificar
   * @returns Payload decodificado
   */
  decodificarToken(token: string): PayloadJwt {
    return this.jwtService.decode(token) as PayloadJwt;
  }

  /**
   * Extrae el ID de usuario del token JWT
   * @param token - Token JWT
   * @returns ID del usuario o null si no es válido
   */
  extraerUsuarioId(token: string): string | null {
    try {
      const payload = this.verificarToken(token);
      return payload?.sub || null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Extrae el rol del usuario del token JWT
   * @param token - Token JWT
   * @returns Rol del usuario o null si no es válido
   */
  extraerRol(token: string): string | null {
    try {
      const payload = this.verificarToken(token);
      return payload?.rol || null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Verifica si un token está próximo a expirar
   * @param token - Token JWT
   * @param minutosAntes - Minutos antes de la expiración para considerar próximo
   * @returns boolean indicando si está próximo a expirar
   */
  estaProximoAExpiar(token: string, minutosAntes: number = 30): boolean {
    try {
      const payload = this.verificarToken(token);
      if (!payload || !payload.exp) return false;

      const tiempoExpiracion = payload.exp * 1000; // Convertir a milisegundos
      const tiempoActual = Date.now();
      const tiempoRestante = tiempoExpiracion - tiempoActual;

      return tiempoRestante <= (minutosAntes * 60 * 1000);
    } catch (error) {
      return false;
    }
  }

  /**
   * Genera un par de tokens (access + refresh)
   * @param usuarioId - ID del usuario
   * @param email - Email del usuario
   * @param rol - Rol del usuario
   * @returns Objeto con tokens de acceso y refresh
   */
  generarParTokens(usuarioId: string, email: string, rol: string) {
    return {
      accessToken: this.generarTokenAcceso(usuarioId, email, rol),
      refreshToken: this.generarTokenRefresh(usuarioId),
    };
  }
}