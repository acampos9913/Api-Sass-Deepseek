import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';

/**
 * Guardia para validación avanzada de dominios
 * Implementa seguridad más allá del CORS con validación de claims JWT
 * 
 * Este guardia verifica que el JWT contenga un claim que identifique el cliente/origen
 * que generó el token, previniendo que APIs sean llamadas desde dominios no autorizados
 */
@Injectable()
export class ValidacionDominioGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Obtener metadatos del controlador/método
    const dominiosPermitidos = this.reflector.get<string[]>(
      'dominiosPermitidos',
      context.getHandler(),
    ) || this.reflector.get<string[]>('dominiosPermitidos', context.getClass());

    // Si no hay restricciones de dominio, permitir acceso
    if (!dominiosPermitidos || dominiosPermitidos.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const authorizationHeader = request.headers.authorization;

    if (!authorizationHeader) {
      throw new UnauthorizedException({
        mensaje: 'Token de autorización requerido',
        data: null,
        tipo_mensaje: 'Autenticacion.TokenRequerido',
        estado_respuesta: 401,
      });
    }

    // Extraer token del header
    const token = authorizationHeader.replace('Bearer ', '');

    try {
      // Verificar y decodificar el token
      const payload = this.jwtService.verify(token, {
        ignoreExpiration: false,
      });

      // Verificar claim de origen/cliente
      const origenCliente = payload.origen || payload.client_id || payload.aud;

      if (!origenCliente) {
        throw new UnauthorizedException({
          mensaje: 'Token no contiene información de origen válida',
          data: null,
          tipo_mensaje: 'Autenticacion.OrigenInvalido',
          estado_respuesta: 401,
        });
      }

      // Verificar si el origen está en la lista de dominios permitidos
      const origenPermitido = dominiosPermitidos.includes(origenCliente);

      if (!origenPermitido) {
        throw new UnauthorizedException({
          mensaje: `Acceso no autorizado desde el origen: ${origenCliente}`,
          data: null,
          tipo_mensaje: 'Autenticacion.DominioNoAutorizado',
          estado_respuesta: 403,
        });
      }

      // Agregar información del origen al request para uso posterior
      request.dominioOrigen = origenCliente;
      request.usuario = payload; // Mantener información del usuario

      return true;

    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      // Manejar errores de JWT
      throw new UnauthorizedException({
        mensaje: 'Token inválido o expirado',
        data: null,
        tipo_mensaje: 'Autenticacion.TokenInvalido',
        estado_respuesta: 401,
      });
    }
  }
}

/**
 * Decorador para especificar dominios permitidos en un controlador o método
 * @param dominios - Array de identificadores de dominios/clientes permitidos
 */
export function DominiosPermitidos(...dominios: string[]) {
  return Reflect.metadata('dominiosPermitidos', dominios);
}