import { Injectable } from '@nestjs/common';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import { ServicioRespuestaEstandar } from '../../../../comun/aplicacion/servicios/servicio-respuesta-estandar';
import type { RepositorioSeguridad } from '../interfaces/repositorio-seguridad.interface';
import { ExcepcionDominio } from '../../../../comun/excepciones/excepcion-dominio';

@Injectable()
export class GenerarSecretoTotpCasoUso {
  constructor(
    private readonly repositorioSeguridad: RepositorioSeguridad,
  ) {}

  async ejecutar(usuarioId: string, email: string) {
    try {
      // Verificar que el usuario existe
      const usuarioExiste = await this.repositorioSeguridad.existeUsuario(usuarioId);
      if (!usuarioExiste) {
        throw ExcepcionDominio.Respuesta404('Usuario no encontrado', 'Seguridad.UsuarioNoEncontrado');
      }

      // Generar secreto TOTP base32 usando speakeasy (producción)
      const secretoGenerado = speakeasy.generateSecret({
        length: 20,
        name: `Ecommerce Tiendanube:${email}`,
        issuer: 'Ecommerce Tiendanube',
      });

      const secreto = secretoGenerado.base32;
      const otpauthUrl = secretoGenerado.otpauth_url!;
      
      // Generar QR code con qrcode (producción)
      const qrCodeUrl = await QRCode.toDataURL(otpauthUrl);

      // Guardar el secreto temporalmente
      const metodoConfiguracion = {
        secreto: secreto,
        otpauth_url: otpauthUrl,
        fecha_generacion: new Date(),
        temporal: true,
      };

      // Agregar método de autenticación temporal
      await this.repositorioSeguridad.agregarMetodoAutenticacion(
        usuarioId,
        {
          usuario_id: usuarioId,
          tipo: 'codigo',
          configuracion: metodoConfiguracion,
          estado: 'inactivo',
          fecha_creacion: new Date(),
        }
      );

      return ServicioRespuestaEstandar.Respuesta200(
        'Secreto TOTP generado exitosamente',
        {
          secreto: secreto,
          qr_code_url: qrCodeUrl,
          otpauth_url: otpauthUrl,
          mensaje: 'Escanea el código QR con tu aplicación de autenticación o ingresa el secreto manualmente'
        },
        'Seguridad.SecretoTotpGeneradoExitosamente'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }

      throw ExcepcionDominio.Respuesta500(
        'Error al generar el secreto TOTP',
        'Seguridad.ErrorGenerarSecretoTotp'
      );
    }
  }
}