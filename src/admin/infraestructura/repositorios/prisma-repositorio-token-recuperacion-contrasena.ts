import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { RepositorioTokenRecuperacionContrasena } from '../../dominio/interfaces/repositorio-token-recuperacion-contrasena.interface';

/**
 * Implementación del repositorio de tokens de recuperación de contraseña usando Prisma
 * Sigue el patrón Repository para la capa de Infraestructura
 */
@Injectable()
export class PrismaRepositorioTokenRecuperacionContrasena implements RepositorioTokenRecuperacionContrasena {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crea un nuevo token de recuperación de contraseña
   * @param token - Token a crear
   * @returns Promise con el token creado
   */
  async crear(token: {
    id: string;
    usuarioId: string;
    token: string;
    codigo: string;
    expiracion: Date;
    utilizado: boolean;
  }) {
    return await this.prisma.tokenRecuperacionContrasena.create({
      data: {
        id: token.id,
        usuarioId: token.usuarioId,
        token: token.token,
        codigo: token.codigo,
        expiracion: token.expiracion,
        utilizado: token.utilizado,
      },
    });
  }

  /**
   * Encuentra un token por su valor
   * @param token - Valor del token
   * @returns Promise con el token encontrado o null
   */
  async encontrarPorToken(token: string) {
    return await this.prisma.tokenRecuperacionContrasena.findFirst({
      where: {
        token,
      },
    });
  }

  /**
   * Encuentra tokens activos por usuario
   * @param usuarioId - ID del usuario
   * @returns Promise con los tokens encontrados
   */
  async encontrarActivosPorUsuario(usuarioId: string) {
    return await this.prisma.tokenRecuperacionContrasena.findMany({
      where: {
        usuarioId,
        utilizado: false,
        expiracion: {
          gt: new Date(),
        },
      },
    });
  }

  /**
   * Marca un token como utilizado
   * @param tokenId - ID del token
   * @returns Promise con el token actualizado
   */
  async marcarComoUtilizado(tokenId: string) {
    return await this.prisma.tokenRecuperacionContrasena.update({
      where: {
        id: tokenId,
      },
      data: {
        utilizado: true,
      },
    });
  }

  /**
   * Elimina tokens expirados por usuario
   * @param usuarioId - ID del usuario
   * @returns Promise con el número de tokens eliminados
   */
  async eliminarExpiradosPorUsuario(usuarioId: string) {
    const result = await this.prisma.tokenRecuperacionContrasena.deleteMany({
      where: {
        usuarioId,
        OR: [
          { utilizado: true },
          { expiracion: { lt: new Date() } },
        ],
      },
    });

    return result.count;
  }

  /**
   * Elimina un token específico
   * @param tokenId - ID del token
   * @returns Promise con el token eliminado
   */
  async eliminar(tokenId: string) {
    return await this.prisma.tokenRecuperacionContrasena.delete({
      where: {
        id: tokenId,
      },
    });
  }
}