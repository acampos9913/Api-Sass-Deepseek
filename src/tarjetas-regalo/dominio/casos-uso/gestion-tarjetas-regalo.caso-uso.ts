import { Injectable } from '@nestjs/common';
import { TarjetaRegalo, TransaccionTarjetaRegalo, EstadoTarjetaRegalo, TipoTransaccionTarjetaRegalo } from '../entidades/tarjeta-regalo.entity';
import type { RepositorioTarjetaRegalo } from '../interfaces/repositorio-tarjeta-regalo.interface';

/**
 * DTO para crear una tarjeta de regalo
 */
export interface CrearTarjetaRegaloDTO {
  montoInicial: number;
  tiendaId?: string;
  creadorId: string;
  usuarioId?: string;
  fechaExpiracion?: Date;
  notas?: string;
}

/**
 * DTO para activar una tarjeta de regalo
 */
export interface ActivarTarjetaRegaloDTO {
  tarjetaRegaloId: string;
}

/**
 * DTO para redimir una tarjeta de regalo
 */
export interface RedimirTarjetaRegaloDTO {
  tarjetaRegaloId: string;
  monto: number;
  ordenId?: string;
  notas?: string;
}

/**
 * DTO para ajustar el saldo de una tarjeta de regalo
 */
export interface AjustarSaldoTarjetaRegaloDTO {
  tarjetaRegaloId: string;
  nuevoMonto: number;
  motivo: string;
}

/**
 * DTO para cancelar una tarjeta de regalo
 */
export interface CancelarTarjetaRegaloDTO {
  tarjetaRegaloId: string;
  motivo: string;
}

/**
 * DTO para reactivar una tarjeta de regalo
 */
export interface ReactivarTarjetaRegaloDTO {
  tarjetaRegaloId: string;
}

/**
 * Resultado de la operación de tarjeta de regalo
 */
export interface ResultadoTarjetaRegalo {
  exito: boolean;
  mensaje: string;
  tarjetaRegalo?: TarjetaRegalo;
  errores?: string[];
}

/**
 * Caso de uso para la gestión de tarjetas de regalo
 * Coordina las operaciones de negocio relacionadas con tarjetas de regalo
 */
@Injectable()
export class GestionTarjetasRegaloCasoUso {
  constructor(private readonly repositorioTarjetaRegalo: RepositorioTarjetaRegalo) {}

  /**
   * Crea una nueva tarjeta de regalo en estado INACTIVA
   */
  async crearTarjetaRegalo(dto: CrearTarjetaRegaloDTO): Promise<ResultadoTarjetaRegalo> {
    try {
      // Validar datos de entrada
      const erroresValidacion = this.validarCreacionTarjetaRegalo(dto);
      if (erroresValidacion.length > 0) {
        return {
          exito: false,
          mensaje: 'Errores de validación en la creación de la tarjeta de regalo',
          errores: erroresValidacion,
        };
      }

      // Generar código único
      const codigo = await this.repositorioTarjetaRegalo.generarCodigoUnico();

      // Crear la tarjeta de regalo
      const tarjetaRegalo = TarjetaRegalo.crear(
        codigo,
        dto.montoInicial,
        dto.tiendaId || null,
        dto.creadorId,
        dto.usuarioId || null,
        dto.fechaExpiracion,
        dto.notas
      );

      // Guardar la tarjeta de regalo
      const tarjetaGuardada = await this.repositorioTarjetaRegalo.guardar(tarjetaRegalo);

      return {
        exito: true,
        mensaje: 'Tarjeta de regalo creada exitosamente',
        tarjetaRegalo: tarjetaGuardada,
      };
    } catch (error) {
      return {
        exito: false,
        mensaje: 'Error al crear la tarjeta de regalo',
        errores: [error.message],
      };
    }
  }

  /**
   * Activa una tarjeta de regalo
   */
  async activarTarjetaRegalo(dto: ActivarTarjetaRegaloDTO): Promise<ResultadoTarjetaRegalo> {
    try {
      const tarjetaRegalo = await this.repositorioTarjetaRegalo.buscarPorId(dto.tarjetaRegaloId);
      
      if (!tarjetaRegalo) {
        return {
          exito: false,
          mensaje: 'Tarjeta de regalo no encontrada',
          errores: ['La tarjeta de regalo especificada no existe'],
        };
      }

      // Activar la tarjeta
      tarjetaRegalo.activar();

      // Actualizar la tarjeta en el repositorio
      const tarjetaActualizada = await this.repositorioTarjetaRegalo.actualizar(tarjetaRegalo);

      return {
        exito: true,
        mensaje: 'Tarjeta de regalo activada exitosamente',
        tarjetaRegalo: tarjetaActualizada,
      };
    } catch (error) {
      return {
        exito: false,
        mensaje: 'Error al activar la tarjeta de regalo',
        errores: [error.message],
      };
    }
  }

  /**
   * Redime un monto de una tarjeta de regalo
   */
  async redimirTarjetaRegalo(dto: RedimirTarjetaRegaloDTO): Promise<ResultadoTarjetaRegalo> {
    try {
      const tarjetaRegalo = await this.repositorioTarjetaRegalo.buscarPorId(dto.tarjetaRegaloId);
      
      if (!tarjetaRegalo) {
        return {
          exito: false,
          mensaje: 'Tarjeta de regalo no encontrada',
          errores: ['La tarjeta de regalo especificada no existe'],
        };
      }

      // Validar que la tarjeta puede ser utilizada
      if (!tarjetaRegalo.puedeUtilizar()) {
        return {
          exito: false,
          mensaje: 'No se puede redimir la tarjeta de regalo',
          errores: ['La tarjeta no está activa, ha expirado o no tiene saldo disponible'],
        };
      }

      // Redimir el monto
      tarjetaRegalo.redimir(dto.monto, dto.ordenId ?? null, dto.notas);

      // Actualizar la tarjeta en el repositorio
      const tarjetaActualizada = await this.repositorioTarjetaRegalo.actualizar(tarjetaRegalo);

      // Registrar la transacción
      const transaccion = TransaccionTarjetaRegalo.crearRedencion(
        tarjetaRegalo.id,
        dto.monto,
        dto.ordenId ?? null,
        dto.notas
      );
      await this.repositorioTarjetaRegalo.registrarTransaccion(transaccion);

      return {
        exito: true,
        mensaje: 'Tarjeta de regalo redimida exitosamente',
        tarjetaRegalo: tarjetaActualizada,
      };
    } catch (error) {
      return {
        exito: false,
        mensaje: 'Error al redimir la tarjeta de regalo',
        errores: [error.message],
      };
    }
  }

  /**
   * Ajusta el saldo de una tarjeta de regalo
   */
  async ajustarSaldoTarjetaRegalo(dto: AjustarSaldoTarjetaRegaloDTO): Promise<ResultadoTarjetaRegalo> {
    try {
      const tarjetaRegalo = await this.repositorioTarjetaRegalo.buscarPorId(dto.tarjetaRegaloId);
      
      if (!tarjetaRegalo) {
        return {
          exito: false,
          mensaje: 'Tarjeta de regalo no encontrada',
          errores: ['La tarjeta de regalo especificada no existe'],
        };
      }

      // Validar que la tarjeta puede ser ajustada
      if (!tarjetaRegalo.puedeEditar()) {
        return {
          exito: false,
          mensaje: 'No se puede ajustar el saldo de la tarjeta de regalo',
          errores: ['La tarjeta no está en estado ACTIVA o INACTIVA'],
        };
      }

      // Ajustar el saldo
      tarjetaRegalo.ajustarSaldo(dto.nuevoMonto, dto.motivo);

      // Actualizar la tarjeta en el repositorio
      const tarjetaActualizada = await this.repositorioTarjetaRegalo.actualizar(tarjetaRegalo);

      return {
        exito: true,
        mensaje: 'Saldo de tarjeta de regalo ajustado exitosamente',
        tarjetaRegalo: tarjetaActualizada,
      };
    } catch (error) {
      return {
        exito: false,
        mensaje: 'Error al ajustar el saldo de la tarjeta de regalo',
        errores: [error.message],
      };
    }
  }

  /**
   * Cancela una tarjeta de regalo
   */
  async cancelarTarjetaRegalo(dto: CancelarTarjetaRegaloDTO): Promise<ResultadoTarjetaRegalo> {
    try {
      const tarjetaRegalo = await this.repositorioTarjetaRegalo.buscarPorId(dto.tarjetaRegaloId);
      
      if (!tarjetaRegalo) {
        return {
          exito: false,
          mensaje: 'Tarjeta de regalo no encontrada',
          errores: ['La tarjeta de regalo especificada no existe'],
        };
      }

      // Validar que la tarjeta puede ser cancelada
      if (!tarjetaRegalo.puedeCancelar()) {
        return {
          exito: false,
          mensaje: 'No se puede cancelar la tarjeta de regalo',
          errores: ['La tarjeta no puede ser cancelada en su estado actual'],
        };
      }

      // Cancelar la tarjeta
      tarjetaRegalo.cancelar(dto.motivo);

      // Actualizar la tarjeta en el repositorio
      const tarjetaActualizada = await this.repositorioTarjetaRegalo.actualizar(tarjetaRegalo);

      return {
        exito: true,
        mensaje: 'Tarjeta de regalo cancelada exitosamente',
        tarjetaRegalo: tarjetaActualizada,
      };
    } catch (error) {
      return {
        exito: false,
        mensaje: 'Error al cancelar la tarjeta de regalo',
        errores: [error.message],
      };
    }
  }

  /**
   * Reactiva una tarjeta de regalo cancelada
   */
  async reactivarTarjetaRegalo(dto: ReactivarTarjetaRegaloDTO): Promise<ResultadoTarjetaRegalo> {
    try {
      const tarjetaRegalo = await this.repositorioTarjetaRegalo.buscarPorId(dto.tarjetaRegaloId);
      
      if (!tarjetaRegalo) {
        return {
          exito: false,
          mensaje: 'Tarjeta de regalo no encontrada',
          errores: ['La tarjeta de regalo especificada no existe'],
        };
      }

      // Reactivar la tarjeta
      tarjetaRegalo.reactivar();

      // Actualizar la tarjeta en el repositorio
      const tarjetaActualizada = await this.repositorioTarjetaRegalo.actualizar(tarjetaRegalo);

      return {
        exito: true,
        mensaje: 'Tarjeta de regalo reactivada exitosamente',
        tarjetaRegalo: tarjetaActualizada,
      };
    } catch (error) {
      return {
        exito: false,
        mensaje: 'Error al reactivar la tarjeta de regalo',
        errores: [error.message],
      };
    }
  }

  /**
   * Busca una tarjeta de regalo por su código
   */
  async buscarTarjetaRegaloPorCodigo(codigo: string): Promise<TarjetaRegalo | null> {
    try {
      return await this.repositorioTarjetaRegalo.buscarPorCodigo(codigo);
    } catch (error) {
      throw new Error(`Error al buscar tarjeta de regalo: ${error.message}`);
    }
  }

  /**
   * Lista tarjetas de regalo con filtros opcionales
   */
  async listarTarjetasRegalo(
    filtros?: any,
    paginacion?: { pagina: number; limite: number }
  ): Promise<{ tarjetas: TarjetaRegalo[]; total: number }> {
    try {
      const tarjetas = await this.repositorioTarjetaRegalo.listar(filtros, paginacion);
      const total = await this.repositorioTarjetaRegalo.contar(filtros);

      return {
        tarjetas,
        total,
      };
    } catch (error) {
      throw new Error(`Error al listar tarjetas de regalo: ${error.message}`);
    }
  }

  /**
   * Obtiene una tarjeta de regalo por su ID
   */
  async obtenerTarjetaRegaloPorId(id: string): Promise<TarjetaRegalo | null> {
    try {
      return await this.repositorioTarjetaRegalo.buscarPorId(id);
    } catch (error) {
      throw new Error(`Error al obtener tarjeta de regalo: ${error.message}`);
    }
  }

  /**
   * Obtiene el historial de transacciones de una tarjeta de regalo
   */
  async obtenerHistorialTransacciones(tarjetaRegaloId: string): Promise<TransaccionTarjetaRegalo[]> {
    try {
      return await this.repositorioTarjetaRegalo.obtenerHistorialTransacciones(tarjetaRegaloId);
    } catch (error) {
      throw new Error(`Error al obtener historial de transacciones: ${error.message}`);
    }
  }

  /**
   * Exporta tarjetas de regalo a CSV
   */
  async exportarTarjetasRegaloCSV(filtros?: any): Promise<string> {
    try {
      return await this.repositorioTarjetaRegalo.exportarCSV(filtros);
    } catch (error) {
      throw new Error(`Error al exportar tarjetas de regalo a CSV: ${error.message}`);
    }
  }

  /**
   * Importa tarjetas de regalo desde CSV
   */
  async importarTarjetasRegaloCSV(
    csvData: string, 
    tiendaId?: string, 
    usuarioId?: string
  ): Promise<TarjetaRegalo[]> {
    try {
      return await this.repositorioTarjetaRegalo.importarCSV(csvData, tiendaId, usuarioId);
    } catch (error) {
      throw new Error(`Error al importar tarjetas de regalo desde CSV: ${error.message}`);
    }
  }

  /**
   * Verifica el estado de una tarjeta de regalo y actualiza por expiración
   */
  async verificarEstadoTarjetaRegalo(tarjetaRegaloId: string): Promise<ResultadoTarjetaRegalo> {
    try {
      const tarjetaRegalo = await this.repositorioTarjetaRegalo.buscarPorId(tarjetaRegaloId);
      
      if (!tarjetaRegalo) {
        return {
          exito: false,
          mensaje: 'Tarjeta de regalo no encontrada',
          errores: ['La tarjeta de regalo especificada no existe'],
        };
      }

      // Actualizar estado por expiración
      tarjetaRegalo.actualizarEstadoPorExpiracion();

      // Si el estado cambió, actualizar en el repositorio
      if (tarjetaRegalo.estado === EstadoTarjetaRegalo.EXPIRADA) {
        const tarjetaActualizada = await this.repositorioTarjetaRegalo.actualizar(tarjetaRegalo);
        return {
          exito: true,
          mensaje: 'Estado de tarjeta de regalo actualizado por expiración',
          tarjetaRegalo: tarjetaActualizada,
        };
      }

      return {
        exito: true,
        mensaje: 'Estado de tarjeta de regalo verificado',
        tarjetaRegalo,
      };
    } catch (error) {
      return {
        exito: false,
        mensaje: 'Error al verificar el estado de la tarjeta de regalo',
        errores: [error.message],
      };
    }
  }

  /**
   * Valida los datos para crear una tarjeta de regalo
   */
  private validarCreacionTarjetaRegalo(dto: CrearTarjetaRegaloDTO): string[] {
    const errores: string[] = [];

    if (dto.montoInicial <= 0) {
      errores.push('El monto inicial debe ser mayor a 0');
    }

    if (!dto.creadorId) {
      errores.push('El creador es requerido');
    }

    if (dto.fechaExpiracion && dto.fechaExpiracion <= new Date()) {
      errores.push('La fecha de expiración debe ser futura');
    }

    return errores;
  }
}