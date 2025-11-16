import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class TwoFactorAuthGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id;

    if (!userId) {
      throw new UnauthorizedException('Usuario no autenticado');
    }

    // Verificar si el usuario tiene 2FA activado
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: userId },
      select: { autenticacion_2pasos: true }
    });

    if (!usuario) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    // Si el usuario tiene 2FA activado, verificar que haya pasado la verificación
    if (usuario.autenticacion_2pasos) {
      const twoFactorVerified = request.headers['x-2fa-verified'];
      if (!twoFactorVerified || twoFactorVerified !== 'true') {
        throw new UnauthorizedException('Verificación de dos factores requerida');
      }
    }

    return true;
  }
}