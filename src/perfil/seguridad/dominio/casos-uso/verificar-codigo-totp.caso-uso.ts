import { Injectable } from '@nestjs/common';
import * as speakeasy from 'speakeasy';
import { ServicioRespuestaEstandar } from '../../../../comun/aplicacion/servicios/servicio-respuesta-estandar';
import type { RepositorioSeguridad } from '../interfaces/repositorio-seguridad.interface';
import { ExcepcionDominio } from '../../../../comun/excepciones/excepcion-dominio';

export class VerificarCodigoTotpDto {
  codigo: string;
  metodoId?: string;
}

@Injectable()
export class VerificarCodigoTotpCasoUso {
  constructor(
    private readonly repositorioSeguridad: RepositorioSeguridad,
  ) {}

  async ejecutar(usuarioId: string, datos: VerificarCodigoTotpDto) {
    try {
      // Validaciones básicas
      if (!datos.codigo || datos.codigo.length !== 6 || !/^\d{6}$/.test(datos.codigo)) {
        throw ExcepcionDominio.Respuesta400(
          'El código TOTP debe tener exactamente 6 dígitos numéricos',
          'Seguridad.CodigoTotpInvalido'
        );
      }

      // Obtener estado de seguridad del usuario
      const estadoSeguridad = await this.repositorioSeguridad.obtenerEstadoSeguridad(usuarioId);

      // Verificar si el usuario tiene 2FA activado
      if (!estadoSeguridad.autenticacion2Pasos) {
        throw ExcepcionDominio.Respuesta400(
          'La autenticación en dos pasos no está activada',
          'Seguridad.2FANoActivado'
        );
      }

      // Buscar método de autenticación TOTP activo
      const metodoTotp = estadoSeguridad.metodosAutenticacion.find(
        metodo => metodo.tipo === 'codigo' && metodo.estado === 'activo'
      );

      if (!metodoTotp) {
        throw ExcepcionDominio.Respuesta400(
          'No se encontró un método de autenticación TOTP configurado',
          'Seguridad.MetodoTotpNoConfigurado'
        );
      }

      // Verificar código TOTP usando speakeasy (producción)
      const esValido = speakeasy.totp.verify({
        secret: metodoTotp.configuracion.secreto,
        token: datos.codigo,
        encoding: 'base32',
        window: 1 // Permite 1 período de 30 segundos antes/después
      });

      if (!esValido) {
        throw ExcepcionDominio.Respuesta400(
          'Código TOTP inválido o expirado',
          'Seguridad.CodigoTotpInvalido'
        );
      }

      return ServicioRespuestaEstandar.Respuesta200(
        'Código TOTP verificado exitosamente',
        {
          verificado: true,
          metodo_id: metodoTotp.id,
          timestamp: new Date()
        },
        'Seguridad.CodigoTotpVerificadoExitosamente'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }

      throw ExcepcionDominio.Respuesta500(
        'Error al verificar el código TOTP',
        'Seguridad.ErrorVerificarCodigoTotp'
      );
    }
  }
}