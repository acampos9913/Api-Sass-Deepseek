import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolUsuario } from '../../dominio/enums/rol-usuario.enum';

/**
 * Guard para control de roles
 * Verifica que el usuario tenga los roles necesarios para acceder al recurso
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const rolesRequeridos = this.reflector.getAllAndOverride<RolUsuario[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!rolesRequeridos) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    
    if (!user || !user.rol) {
      return false;
    }

    return rolesRequeridos.some((rol) => user.rol === rol);
  }
}