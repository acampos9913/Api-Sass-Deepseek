import { Injectable } from '@nestjs/common';
import { ServicioRespuestaEstandar } from '../../../../comun/aplicacion/servicios/servicio-respuesta-estandar';
import type { RepositorioSeguridad } from '../interfaces/repositorio-seguridad.interface';
import { ExcepcionDominio } from '../../../../comun/excepciones/excepcion-dominio';

export class AgregarMetodoAutenticacionDto {
  tipo: 'codigo' | 'clave_seguridad' | 'dispositivo_confianza';
  configuracion: Record<string, any>;
  estado: 'activo' | 'inactivo';
}

@Injectable()
export class AgregarMetodoAutenticacionCasoUso {
  constructor(
    private readonly repositorioSeguridad: RepositorioSeguridad,
  ) {}

  async ejecutar(usuarioId: string, datos: AgregarMetodoAutenticacionDto) {
    try {
      // Validaciones básicas
      if (!datos.tipo || !datos.estado) {
        throw ExcepcionDominio.Respuesta400(
          'Tipo y estado del método de autenticación son requeridos',
          'Seguridad.DatosMetodoAutenticacionIncompletos'
        );
      }

      // Validar tipo de método
      const tiposValidos = ['codigo', 'clave_seguridad', 'dispositivo_confianza'];
      if (!tiposValidos.includes(datos.tipo)) {
        throw ExcepcionDominio.Respuesta400(
          'Tipo de método de autenticación inválido',
          'Seguridad.TipoMetodoAutenticacionInvalido'
        );
      }

      // Validar estado
      const estadosValidos = ['activo', 'inactivo'];
      if (!estadosValidos.includes(datos.estado)) {
        throw ExcepcionDominio.Respuesta400(
          'Estado del método de autenticación inválido',
          'Seguridad.EstadoMetodoAutenticacionInvalido'
        );
      }

      // Validar configuración
      if (!datos.configuracion || typeof datos.configuracion !== 'object') {
        throw ExcepcionDominio.Respuesta400(
          'La configuración del método de autenticación es requerida y debe ser un objeto',
          'Seguridad.ConfiguracionMetodoAutenticacionInvalida'
        );
      }

      // Agregar método de autenticación
      const metodo = await this.repositorioSeguridad.agregarMetodoAutenticacion(
        usuarioId,
        {
          usuario_id: usuarioId,
          tipo: datos.tipo,
          configuracion: datos.configuracion,
          estado: datos.estado,
          fecha_creacion: new Date(),
        }
      );

      return ServicioRespuestaEstandar.Respuesta200(
        'Método de autenticación agregado exitosamente',
        metodo,
        'Seguridad.MetodoAutenticacionAgregadoExitosamente'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }

      throw ExcepcionDominio.Respuesta500(
        'Error al agregar el método de autenticación',
        'Seguridad.ErrorAgregarMetodoAutenticacion'
      );
    }
  }
}