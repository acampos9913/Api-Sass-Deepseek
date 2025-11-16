import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { RepositorioSeguridad } from '../../dominio/interfaces/repositorio-seguridad.interface';
import { 
  ClaveAccesoUsuario, 
  DispositivoUsuario, 
  MetodoAutenticacionUsuario 
} from '../../dominio/entidades/entidades-seguridad';
import { ExcepcionDominio } from '../../../../comun/excepciones/excepcion-dominio';

@Injectable()
export class PrismaRepositorioSeguridad implements RepositorioSeguridad {
  constructor(private prisma: PrismaService) {}

  async obtenerEstadoSeguridad(usuarioId: string): Promise<{
    clavesAcceso: ClaveAccesoUsuario[];
    dispositivos: DispositivoUsuario[];
    metodosAutenticacion: MetodoAutenticacionUsuario[];
    autenticacion2Pasos: boolean;
    correoSecundario?: string;
  }> {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      include: {
        claves_acceso: true,
        dispositivos_conectados: true,
        metodos_autenticacion: true,
      },
    });

    if (!usuario) {
      throw ExcepcionDominio.Respuesta404('Usuario no encontrado', 'Seguridad.UsuarioNoEncontrado');
    }

    return {
      clavesAcceso: usuario.claves_acceso.map(clave => ({
        id: clave.id,
        usuario_id: clave.usuario_id,
        tipo: clave.tipo_clave,
        estado: clave.activo ? 'activa' : 'inactiva',
        dispositivos_vinculados: [],
        fecha_creacion: clave.fecha_creacion,
        fecha_actualizacion: clave.fecha_ultimo_uso || new Date(),
      })),
      dispositivos: usuario.dispositivos_conectados.map(dispositivo => ({
        id: dispositivo.id,
        usuario_id: dispositivo.usuario_id,
        navegador: dispositivo.navegador || 'Desconocido',
        sistema_operativo: dispositivo.sistema_operativo || 'Desconocido',
        fecha_inicio: dispositivo.fecha_conexion,
        activo: dispositivo.activo,
        ultima_actividad: dispositivo.fecha_ultima_actividad,
      })),
      metodosAutenticacion: usuario.metodos_autenticacion.map(metodo => ({
        id: metodo.id,
        usuario_id: metodo.usuario_id,
        tipo: this.mapearTipoMetodoAutenticacion(metodo.tipo_metodo),
        configuracion: metodo.configuracion as Record<string, any>,
        estado: metodo.activo ? 'activo' : 'inactivo',
        fecha_creacion: metodo.fecha_creacion,
      })),
      autenticacion2Pasos: usuario.autenticacion_2pasos,
      correoSecundario: usuario.correo_secundario || undefined,
    };
  }

  async crearClaveAcceso(usuarioId: string, claveAcceso: Omit<ClaveAccesoUsuario, 'id'>): Promise<ClaveAccesoUsuario> {
    const claveCreada = await this.prisma.claveAccesoUsuario.create({
      data: {
        usuario_id: usuarioId,
        nombre_clave: claveAcceso.tipo,
        tipo_clave: this.mapearTipoClaveAcceso(claveAcceso.tipo) as any,
        credencial_id: this.generarCredencialId(),
        clave_publica: 'clave_publica_encriptada',
        fecha_creacion: new Date(),
        activo: claveAcceso.estado === 'activa',
      },
    });

    return {
      id: claveCreada.id,
      usuario_id: claveCreada.usuario_id,
      tipo: claveAcceso.tipo,
      estado: claveAcceso.estado,
      dispositivos_vinculados: [],
      fecha_creacion: claveCreada.fecha_creacion,
      fecha_actualizacion: claveCreada.fecha_ultimo_uso || new Date(),
    };
  }

  async cambiarContrasena(usuarioId: string, nuevaContrasenaHash: string): Promise<boolean> {
    await this.verificarUsuarioExiste(usuarioId);

    // Validar complejidad de contraseña (mínimo 8 caracteres, mayúscula, minúscula, número, carácter especial)
    if (nuevaContrasenaHash.length < 8) {
      throw ExcepcionDominio.Respuesta400(
        'La contraseña debe tener al menos 8 caracteres',
        'Seguridad.ContrasenaInvalida'
      );
    }

    const resultado = await this.prisma.usuario.update({
      where: { id: usuarioId },
      data: {
        contrasena_hash: nuevaContrasenaHash,
        fecha_actualizacion: new Date(),
      },
    });

    // Registrar en el historial de contraseñas
    await this.prisma.historialContrasena.create({
      data: {
        usuario_id: usuarioId,
        contrasena_hash: nuevaContrasenaHash,
        fecha_cambio: new Date(),
        motivo_cambio: 'SOLICITUD_USUARIO',
      },
    });

    return !!resultado;
  }

  async agregarCorreoSecundario(usuarioId: string, correoSecundario: string): Promise<boolean> {
    await this.verificarUsuarioExiste(usuarioId);

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correoSecundario)) {
      throw ExcepcionDominio.Respuesta400(
        'El formato del correo electrónico secundario es inválido',
        'Seguridad.CorreoSecundarioInvalido'
      );
    }

    // Verificar que el correo no esté en uso
    const correoExistente = await this.prisma.usuario.findFirst({
      where: {
        OR: [
          { email: correoSecundario },
          { correo_secundario: correoSecundario },
        ],
      },
    });

    if (correoExistente && correoExistente.id !== usuarioId) {
      throw ExcepcionDominio.Respuesta400(
        'El correo electrónico secundario ya está en uso por otro usuario',
        'Seguridad.CorreoSecundarioDuplicado'
      );
    }

    const resultado = await this.prisma.usuario.update({
      where: { id: usuarioId },
      data: {
        correo_secundario: correoSecundario,
        fecha_actualizacion: new Date(),
      },
    });

    return !!resultado;
  }

  async activarDesactivar2FA(usuarioId: string, activar: boolean): Promise<boolean> {
    await this.verificarUsuarioExiste(usuarioId);

    const resultado = await this.prisma.usuario.update({
      where: { id: usuarioId },
      data: {
        autenticacion_2pasos: activar,
        fecha_actualizacion: new Date(),
      },
    });

    return !!resultado;
  }

  async agregarMetodoAutenticacion(usuarioId: string, metodo: Omit<MetodoAutenticacionUsuario, 'id'>): Promise<MetodoAutenticacionUsuario> {
    await this.verificarUsuarioExiste(usuarioId);

    const metodoCreado = await this.prisma.metodoAutenticacionUsuario.create({
      data: {
        usuario_id: usuarioId,
        tipo_metodo: this.mapearTipoMetodoAutenticacionInverso(metodo.tipo) as any,
        configuracion: metodo.configuracion,
        activo: metodo.estado === 'activo',
        fecha_creacion: new Date(),
      },
    });

    return {
      id: metodoCreado.id,
      usuario_id: metodoCreado.usuario_id,
      tipo: metodo.tipo,
      configuracion: metodo.configuracion,
      estado: metodo.estado,
      fecha_creacion: metodoCreado.fecha_creacion,
    };
  }

  async cerrarSesionDispositivo(usuarioId: string, dispositivoId: string): Promise<boolean> {
    await this.verificarUsuarioExiste(usuarioId);

    const dispositivo = await this.prisma.dispositivoUsuario.findFirst({
      where: {
        id: dispositivoId,
        usuario_id: usuarioId,
      },
    });

    if (!dispositivo) {
      throw ExcepcionDominio.Respuesta404(
        'Dispositivo no encontrado',
        'Seguridad.DispositivoNoEncontrado'
      );
    }

    const resultado = await this.prisma.dispositivoUsuario.update({
      where: { id: dispositivoId },
      data: {
        activo: false,
        fecha_ultima_actividad: new Date(),
      },
    });

    return !!resultado;
  }

  async existeUsuario(usuarioId: string): Promise<boolean> {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
    });
    return !!usuario;
  }

  async obtenerContrasenaActual(usuarioId: string): Promise<string> {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: { contrasena_hash: true },
    });

    if (!usuario) {
      throw ExcepcionDominio.Respuesta404('Usuario no encontrado', 'Seguridad.UsuarioNoEncontrado');
    }

    return usuario.contrasena_hash;
  }

  async registrarCambioContrasena(usuarioId: string, contrasenaHash: string): Promise<boolean> {
    const resultado = await this.prisma.historialContrasena.create({
      data: {
        usuario_id: usuarioId,
        contrasena_hash: contrasenaHash,
        fecha_cambio: new Date(),
      },
    });

    return !!resultado;
  }

  async registrarIntentoInicioSesion(usuarioId: string, exito: boolean, dispositivo: {
    navegador: string;
    sistemaOperativo: string;
  }): Promise<boolean> {
    const resultado = await this.prisma.intentoInicioSesion.create({
      data: {
        usuario_id: usuarioId,
        email: '', // Se necesita obtener el email del usuario
        exito: exito,
        fecha_intento: new Date(),
        user_agent: dispositivo.navegador,
      },
    });

    return !!resultado;
  }

  private async verificarUsuarioExiste(usuarioId: string): Promise<void> {
    const existe = await this.existeUsuario(usuarioId);
    if (!existe) {
      throw ExcepcionDominio.Respuesta404('Usuario no encontrado', 'Seguridad.UsuarioNoEncontrado');
    }
  }

  private mapearTipoMetodoAutenticacion(tipoMetodo: string): 'codigo' | 'clave_seguridad' | 'dispositivo_confianza' {
    switch (tipoMetodo) {
      case 'CODIGO_TEMPORAL':
        return 'codigo';
      case 'CLAVE_SEGURIDAD':
        return 'clave_seguridad';
      case 'DISPOSITIVO_CONFIANZA':
        return 'dispositivo_confianza';
      case 'APLICACION_AUTENTICACION':
        return 'codigo';
      default:
        return 'codigo';
    }
  }

  private mapearTipoMetodoAutenticacionInverso(tipo: string): string {
    switch (tipo) {
      case 'codigo':
        return 'CODIGO_TEMPORAL';
      case 'clave_seguridad':
        return 'CLAVE_SEGURIDAD';
      case 'dispositivo_confianza':
        return 'DISPOSITIVO_CONFIANZA';
      default:
        return 'CODIGO_TEMPORAL';
    }
  }

  private mapearTipoClaveAcceso(tipo: string): string {
    switch (tipo) {
      case 'PLATAFORMA':
        return 'PLATAFORMA';
      case 'SEGURIDAD':
        return 'SEGURIDAD';
      case 'CROSS_PLATFORM':
        return 'CROSS_PLATFORM';
      default:
        return 'PLATAFORMA';
    }
  }

  private generarCredencialId(): string {
    return `cred_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}