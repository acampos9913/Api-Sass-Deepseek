import { 
  Injectable, 
  CanActivate, 
  ExecutionContext, 
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { LoggingService } from '../../../logging/logging.service';
import { ExcepcionDominio } from '../../../comun/excepciones/excepcion-dominio';

/**
 * Interfaz para el payload del JWT con claims de dominio
 */
interface JwtPayload {
  sub: string;
  usuarioId: string;
  tiendaId?: string;
  roles: string[];
  clientId: string;
  origen: string;
  iat?: number;
  exp?: number;
}

/**
 * Guardia de autenticación JWT con validación de dominio
 * Implementa restricción de dominio mediante claims del token
 */
@Injectable()
export class JwtAutenticacionGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly loggingService: LoggingService,
  ) {}

  async canActivate(contexto: ExecutionContext): Promise<boolean> {
    const solicitud = contexto.switchToHttp().getRequest();
    const token = this.extraerTokenDeHeader(solicitud);

    if (!token) {
      this.loggingService.logErrorNegocio(
        'Autenticacion.TokenNoProporcionado',
        'Token de autenticación no proporcionado',
        {
          modulo: 'JwtAutenticacionGuard',
          url: solicitud.url,
          metodo: solicitud.method,
          ip: this.obtenerIP(solicitud),
        }
      );
      throw ExcepcionDominio.Respuesta401(
        'Token de autenticación requerido',
        'Autenticacion.TokenNoProporcionado'
      );
    }

    try {
      const payload = await this.verificarToken(token);
      this.validarClaimsDominio(payload, solicitud);
      
      // Adjuntar información del usuario a la solicitud
      solicitud.usuario = {
        id: payload.usuarioId,
        sub: payload.sub,
        roles: payload.roles,
        clientId: payload.clientId,
        origen: payload.origen,
      };

      if (payload.tiendaId) {
        solicitud.tiendaId = payload.tiendaId;
      }

      this.loggingService.log(
        'Autenticación exitosa',
        {
          modulo: 'JwtAutenticacionGuard',
          usuarioId: payload.usuarioId,
          clientId: payload.clientId,
          origen: payload.origen,
          url: solicitud.url,
          metodo: solicitud.method,
        }
      );

      return true;
    } catch (error) {
      this.loggingService.logErrorNegocio(
        'Autenticacion.TokenInvalido',
        error.message,
        {
          modulo: 'JwtAutenticacionGuard',
          url: solicitud.url,
          metodo: solicitud.method,
          ip: this.obtenerIP(solicitud),
          error: error.name,
        }
      );

      if (error instanceof ExcepcionDominio) {
        throw error;
      }

      throw ExcepcionDominio.Respuesta401(
        'Token de autenticación inválido o expirado',
        'Autenticacion.TokenInvalido'
      );
    }
  }

  /**
   * Extrae el token del header de autorización
   */
  private extraerTokenDeHeader(solicitud: Request): string | null {
    const autorizacion = solicitud.headers.authorization;
    
    if (!autorizacion) {
      return null;
    }

    const [tipo, token] = autorizacion.split(' ');
    
    if (tipo !== 'Bearer' || !token) {
      return null;
    }

    return token;
  }

  /**
   * Verifica y decodifica el token JWT
   */
  private async verificarToken(token: string): Promise<JwtPayload> {
    try {
      const secreto = this.configService.get<string>('JWT_SECRET');
      
      if (!secreto) {
        throw new Error('JWT_SECRET no configurado');
      }

      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: secreto,
      });

      return payload;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw ExcepcionDominio.Respuesta401(
          'Token expirado',
          'Autenticacion.TokenExpirado'
        );
      } else if (error.name === 'JsonWebTokenError') {
        throw ExcepcionDominio.Respuesta401(
          'Token inválido',
          'Autenticacion.TokenInvalido'
        );
      }
      
      throw error;
    }
  }

  /**
   * Valida los claims de dominio para restricción de origen
   */
  private validarClaimsDominio(payload: JwtPayload, solicitud: Request): void {
    // Validar que el token tenga claims de dominio requeridos
    if (!payload.clientId || !payload.origen) {
      throw ExcepcionDominio.Respuesta401(
        'Token no contiene claims de dominio válidos',
        'Autenticacion.ClaimsDominioInvalidos'
      );
    }

    // Validar el origen permitido
    const origenesPermitidos = this.configService.get<string[]>('ORIGENES_PERMITIDOS') || [];
    
    if (!origenesPermitidos.includes(payload.origen)) {
      throw ExcepcionDominio.Respuesta403(
        `Origen '${payload.origen}' no permitido`,
        'Autenticacion.OrigenNoPermitido'
      );
    }

    // Validar el clientId permitido
    const clientIdsPermitidos = this.configService.get<string[]>('CLIENT_IDS_PERMITIDOS') || [];
    
    if (!clientIdsPermitidos.includes(payload.clientId)) {
      throw ExcepcionDominio.Respuesta403(
        `Client ID '${payload.clientId}' no permitido`,
        'Autenticacion.ClientIdNoPermitido'
      );
    }

    // Validar roles mínimos si es necesario
    if (!payload.roles || payload.roles.length === 0) {
      throw ExcepcionDominio.Respuesta403(
        'Usuario sin roles asignados',
        'Autenticacion.UsuarioSinRoles'
      );
    }
  }

  /**
   * Obtiene la IP real del cliente considerando proxies
   */
  private obtenerIP(solicitud: Request): string {
    return (solicitud.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
           solicitud.ip ||
           solicitud.connection?.remoteAddress ||
           'Desconocida';
  }
}