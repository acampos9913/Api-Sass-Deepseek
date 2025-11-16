import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { RepositorioPerfilGeneral, ServicioExternoUsuario } from '../../dominio/interfaces/repositorio-perfil-general.interface';

@Injectable()
export class PrismaRepositorioPerfilGeneral implements RepositorioPerfilGeneral {
  constructor(private readonly prisma: PrismaService) {}

  async encontrarPorId(id: string): Promise<any | null> {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id },
    });

    if (!usuario) return null;

    // Obtener servicios externos por separado
    const serviciosExternos = await this.encontrarServiciosExternos(id);

    return {
      ...usuario,
      serviciosExternos,
    };
  }

  async actualizar(id: string, datos: any): Promise<any> {
    const updateData: any = {
      fecha_actualizacion: new Date(),
    };

    if (datos.nombre !== undefined) updateData.nombre = datos.nombre;
    if (datos.apellido !== undefined) updateData.apellido = datos.apellido;
    if (datos.idioma !== undefined) updateData.idioma = datos.idioma;
    if (datos.zonaHoraria !== undefined) updateData.zona_horaria = datos.zonaHoraria;

    return await this.prisma.usuario.update({
      where: { id },
      data: updateData,
    });
  }

  async actualizarFoto(id: string, foto: string): Promise<any> {
    return await this.prisma.usuario.update({
      where: { id },
      data: {
        foto: foto,
        fecha_actualizacion: new Date(),
      },
    });
  }

  async actualizarCorreo(id: string, correo: string): Promise<any> {
    return await this.prisma.usuario.update({
      where: { id },
      data: {
        email: correo,
        fecha_verificacion_correo: null,
        fecha_actualizacion: new Date(),
      },
    });
  }

  async actualizarTelefono(id: string, telefono: string): Promise<any> {
    return await this.prisma.usuario.update({
      where: { id },
      data: {
        telefono: telefono,
        fecha_verificacion_telefono: null,
        fecha_actualizacion: new Date(),
      },
    });
  }

  async vincularServicioExterno(id: string, servicio: ServicioExternoUsuario): Promise<any> {
    // Crear el servicio externo
    await this.prisma.servicioExternoUsuario.create({
      data: {
        usuario_id: id,
        proveedor: servicio.proveedor,
        id_externo: servicio.idExterno,
        email_externo: servicio.emailExterno,
        activo: servicio.activo,
        fecha_conexion: servicio.fechaConexion,
        fecha_actualizacion: servicio.fechaActualizacion,
      },
    });

    // Actualizar fecha de actualización del usuario
    await this.prisma.usuario.update({
      where: { id },
      data: {
        fecha_actualizacion: new Date(),
      },
    });

    return await this.encontrarPorId(id);
  }

  async encontrarServiciosExternos(id: string): Promise<ServicioExternoUsuario[]> {
    try {
      const servicios = await this.prisma.servicioExternoUsuario.findMany({
        where: { usuario_id: id, activo: true },
      });

      return servicios.map(servicio => ({
        id: servicio.id,
        proveedor: servicio.proveedor as 'APPLE' | 'FACEBOOK' | 'GOOGLE',
        idExterno: servicio.id_externo,
        emailExterno: servicio.email_externo || undefined,
        activo: servicio.activo,
        fechaConexion: servicio.fecha_conexion,
        fechaActualizacion: servicio.fecha_actualizacion,
        fechaDesconexion: servicio.fecha_desconexion || undefined,
      }));
    } catch (error) {
      // Si la tabla no existe, retornar array vacío
      return [];
    }
  }
}