import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

/**
 * Guard para autenticación JWT
 * Protege los endpoints requiriendo un token JWT válido
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    // En una implementación real, aquí se agregaría lógica adicional de autorización
    return super.canActivate(context);
  }
}