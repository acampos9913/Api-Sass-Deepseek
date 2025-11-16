import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Usuario } from '../../dominio/entidades/usuario.entity';
import { RolUsuario } from '../../dominio/enums/rol-usuario.enum';
import type { RepositorioUsuario } from '../../dominio/interfaces/repositorio-usuario.interface';

/**
 * Repositorio de Usuario implementado con Prisma
 * Sigue el principio de inversión de dependencias (DIP)
 */
@Injectable()
export class PrismaRepositorioUsuario implements RepositorioUsuario {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Convierte un modelo de Prisma a una entidad de Dominio
   */
  private aEntidad(prismaUsuario: any): Usuario {
    return new Usuario(
      prismaUsuario.id,
      prismaUsuario.email,
      prismaUsuario.contrasena_hash,
      prismaUsuario.nombre_completo,
      prismaUsuario.rol as RolUsuario,
      prismaUsuario.activo,
      prismaUsuario.fecha_creacion,
      prismaUsuario.fecha_actualizacion,
      prismaUsuario.ultimo_acceso,
    );
  }

  /**
   * Convierte una entidad de Dominio a un objeto para Prisma
   */
  private aPrisma(usuario: Usuario): any {
    return {
      id: usuario.id,
      email: usuario.email,
      contrasena_hash: usuario.contrasenaHash,
      nombre_completo: usuario.nombreCompleto,
      rol: usuario.rol,
      activo: usuario.activo,
      fecha_creacion: usuario.fechaCreacion,
      fecha_actualizacion: usuario.fechaActualizacion,
      ultimo_acceso: usuario.ultimoAcceso,
    };
  }

  async buscarPorId(id: string): Promise<Usuario | null> {
    const prismaUsuario = await this.prisma.usuario.findUnique({
      where: { id },
    });

    if (!prismaUsuario) {
      return null;
    }

    return this.aEntidad(prismaUsuario);
  }

  async buscarPorEmail(email: string): Promise<Usuario | null> {
    const prismaUsuario = await this.prisma.usuario.findUnique({
      where: { email },
    });

    if (!prismaUsuario) {
      return null;
    }

    return this.aEntidad(prismaUsuario);
  }

  async guardar(usuario: Usuario): Promise<Usuario> {
    const prismaUsuario = await this.prisma.usuario.create({
      data: this.aPrisma(usuario),
    });

    return this.aEntidad(prismaUsuario);
  }

  async actualizar(usuario: Usuario): Promise<Usuario> {
    const prismaUsuario = await this.prisma.usuario.update({
      where: { id: usuario.id },
      data: this.aPrisma(usuario),
    });

    return this.aEntidad(prismaUsuario);
  }

  async eliminar(id: string): Promise<void> {
    await this.prisma.usuario.delete({
      where: { id },
    });
  }

  async listar(
    pagina: number,
    limite: number,
  ): Promise<{ usuarios: Usuario[]; total: number }> {
    const skip = (pagina - 1) * limite;

    const [prismaUsuarios, total] = await Promise.all([
      this.prisma.usuario.findMany({
        skip,
        take: limite,
        orderBy: { fecha_creacion: 'desc' },
      }),
      this.prisma.usuario.count(),
    ]);

    const usuarios = prismaUsuarios.map(prismaUsuario =>
      this.aEntidad(prismaUsuario),
    );

    return { usuarios, total };
  }
}