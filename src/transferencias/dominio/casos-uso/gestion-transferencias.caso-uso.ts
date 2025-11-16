import { Injectable } from '@nestjs/common';
import { TransferenciaProducto, ItemTransferencia, EstadoTransferencia } from '../entidades/transferencia-producto.entity';
import type { RepositorioTransferencia } from '../interfaces/repositorio-transferencia.interface';

/**
 * DTO para crear una transferencia de productos
 */
export interface CrearTransferenciaDTO {
  ubicacionOrigen: string;
  ubicacionDestino: string;
  tiendaId?: string;
  creadorId: string;
  usuarioId?: string;
  notas?: string;
  fechaEsperada?: Date;
  items: CrearItemTransferenciaDTO[];
}

/**
 * DTO para crear un item de transferencia
 */
export interface CrearItemTransferenciaDTO {
  productoId: string;
  cantidadSolicitada: number;
}

/**
 * DTO para actualizar una transferencia
 */
export interface ActualizarTransferenciaDTO {
  ubicacionOrigen?: string;
  ubicacionDestino?: string;
  notas?: string;
  fechaEsperada?: Date;
  items?: ActualizarItemTransferenciaDTO[];
}

/**
 * DTO para actualizar un item de transferencia
 */
export interface ActualizarItemTransferenciaDTO {
  id: string;
  cantidadSolicitada?: number;
}

/**
 * DTO para enviar productos de una transferencia
 */
export interface EnviarProductosTransferenciaDTO {
  items: EnviarItemTransferenciaDTO[];
}

/**
 * DTO para enviar un item de transferencia
 */
export interface EnviarItemTransferenciaDTO {
  itemId: string;
  cantidadEnviada: number;
}

/**
 * DTO para recibir productos de una transferencia
 */
export interface RecibirProductosTransferenciaDTO {
  items: RecibirItemTransferenciaDTO[];
}

/**
 * DTO para recibir un item de transferencia
 */
export interface RecibirItemTransferenciaDTO {
  itemId: string;
  cantidadRecibida: number;
}

/**
 * Resultado de la operación de transferencia
 */
export interface ResultadoTransferencia {
  exito: boolean;
  mensaje: string;
  transferencia?: TransferenciaProducto;
  errores?: string[];
}

/**
 * Caso de uso para la gestión de transferencias de productos
 * Coordina las operaciones de negocio relacionadas con transferencias
 */
@Injectable()
export class GestionTransferenciasCasoUso {
  constructor(private readonly repositorioTransferencia: RepositorioTransferencia) {}

  /**
   * Crea una nueva transferencia en estado BORRADOR
   */
  async crearTransferencia(dto: CrearTransferenciaDTO): Promise<ResultadoTransferencia> {
    try {
      // Validar datos de entrada
      const erroresValidacion = this.validarCreacionTransferencia(dto);
      if (erroresValidacion.length > 0) {
        return {
          exito: false,
          mensaje: 'Errores de validación en la creación de la transferencia',
          errores: erroresValidacion,
        };
      }

      // Obtener siguiente número de transferencia
      const numeroTransferencia = await this.repositorioTransferencia.obtenerSiguienteNumeroTransferencia();

      // Crear la transferencia
      const transferencia = TransferenciaProducto.crear(
        numeroTransferencia,
        dto.ubicacionOrigen,
        dto.ubicacionDestino,
        dto.tiendaId || null,
        dto.creadorId,
        dto.usuarioId || null,
        dto.notas,
        dto.fechaEsperada
      );

      // Agregar items a la transferencia
      for (const itemDTO of dto.items) {
        const item = ItemTransferencia.crear(
          itemDTO.productoId,
          itemDTO.cantidadSolicitada
        );
        transferencia.agregarItem(item);
      }

      // Guardar la transferencia
      const transferenciaGuardada = await this.repositorioTransferencia.guardar(transferencia);

      return {
        exito: true,
        mensaje: 'Transferencia creada exitosamente',
        transferencia: transferenciaGuardada,
      };
    } catch (error) {
      return {
        exito: false,
        mensaje: 'Error al crear la transferencia',
        errores: [error.message],
      };
    }
  }

  /**
   * Envía una transferencia (marca como enviada)
   */
  async enviarTransferencia(transferenciaId: string): Promise<ResultadoTransferencia> {
    try {
      const transferencia = await this.repositorioTransferencia.buscarPorId(transferenciaId);
      
      if (!transferencia) {
        return {
          exito: false,
          mensaje: 'Transferencia no encontrada',
          errores: ['La transferencia especificada no existe'],
        };
      }

      // Validar que la transferencia puede ser enviada
      if (!transferencia.puedeEditar()) {
        return {
          exito: false,
          mensaje: 'No se puede enviar la transferencia',
          errores: ['La transferencia no está en estado BORRADOR'],
        };
      }

      // Enviar la transferencia
      transferencia.enviar();

      // Actualizar la transferencia en el repositorio
      const transferenciaActualizada = await this.repositorioTransferencia.actualizar(transferencia);

      return {
        exito: true,
        mensaje: 'Transferencia enviada exitosamente',
        transferencia: transferenciaActualizada,
      };
    } catch (error) {
      return {
        exito: false,
        mensaje: 'Error al enviar la transferencia',
        errores: [error.message],
      };
    }
  }

  /**
   * Envía productos específicos de una transferencia
   */
  async enviarProductosTransferencia(
    transferenciaId: string, 
    dto: EnviarProductosTransferenciaDTO
  ): Promise<ResultadoTransferencia> {
    try {
      const transferencia = await this.repositorioTransferencia.buscarPorId(transferenciaId);
      
      if (!transferencia) {
        return {
          exito: false,
          mensaje: 'Transferencia no encontrada',
          errores: ['La transferencia especificada no existe'],
        };
      }

      // Validar que la transferencia puede recibir envíos
      if (transferencia.estado !== EstadoTransferencia.ENVIADA && 
          transferencia.estado !== EstadoTransferencia.PARCIALMENTE_RECIBIDA) {
        return {
          exito: false,
          mensaje: 'No se pueden enviar productos en esta transferencia',
          errores: ['La transferencia debe estar en estado ENVIADA o PARCIALMENTE_RECIBIDA para enviar productos'],
        };
      }

      // Procesar el envío de cada item
      for (const itemDTO of dto.items) {
        transferencia.actualizarCantidadEnviada(itemDTO.itemId, itemDTO.cantidadEnviada);
      }

      // Actualizar la transferencia en el repositorio
      const transferenciaActualizada = await this.repositorioTransferencia.actualizar(transferencia);

      return {
        exito: true,
        mensaje: 'Productos enviados exitosamente',
        transferencia: transferenciaActualizada,
      };
    } catch (error) {
      return {
        exito: false,
        mensaje: 'Error al enviar productos de la transferencia',
        errores: [error.message],
      };
    }
  }

  /**
   * Recibe productos de una transferencia
   */
  async recibirProductosTransferencia(
    transferenciaId: string, 
    dto: RecibirProductosTransferenciaDTO
  ): Promise<ResultadoTransferencia> {
    try {
      const transferencia = await this.repositorioTransferencia.buscarPorId(transferenciaId);
      
      if (!transferencia) {
        return {
          exito: false,
          mensaje: 'Transferencia no encontrada',
          errores: ['La transferencia especificada no existe'],
        };
      }

      // Validar que la transferencia puede recibir productos
      if (transferencia.estado !== EstadoTransferencia.ENVIADA && 
          transferencia.estado !== EstadoTransferencia.PARCIALMENTE_RECIBIDA) {
        return {
          exito: false,
          mensaje: 'No se pueden recibir productos en esta transferencia',
          errores: ['La transferencia debe estar en estado ENVIADA o PARCIALMENTE_RECIBIDA para recibir productos'],
        };
      }

      // Procesar la recepción de cada item
      for (const itemDTO of dto.items) {
        transferencia.actualizarCantidadRecibida(itemDTO.itemId, itemDTO.cantidadRecibida);
      }

      // Actualizar la transferencia en el repositorio
      const transferenciaActualizada = await this.repositorioTransferencia.actualizar(transferencia);

      return {
        exito: true,
        mensaje: 'Productos recibidos exitosamente',
        transferencia: transferenciaActualizada,
      };
    } catch (error) {
      return {
        exito: false,
        mensaje: 'Error al recibir productos de la transferencia',
        errores: [error.message],
      };
    }
  }

  /**
   * Completa la recepción de una transferencia
   */
  async completarTransferencia(transferenciaId: string): Promise<ResultadoTransferencia> {
    try {
      const transferencia = await this.repositorioTransferencia.buscarPorId(transferenciaId);
      
      if (!transferencia) {
        return {
          exito: false,
          mensaje: 'Transferencia no encontrada',
          errores: ['La transferencia especificada no existe'],
        };
      }

      // Completar la transferencia
      transferencia.completar();

      // Actualizar la transferencia en el repositorio
      const transferenciaActualizada = await this.repositorioTransferencia.actualizar(transferencia);

      return {
        exito: true,
        mensaje: 'Transferencia completada exitosamente',
        transferencia: transferenciaActualizada,
      };
    } catch (error) {
      return {
        exito: false,
        mensaje: 'Error al completar la transferencia',
        errores: [error.message],
      };
    }
  }

  /**
   * Cancela una transferencia
   */
  async cancelarTransferencia(transferenciaId: string, motivo: string): Promise<ResultadoTransferencia> {
    try {
      const transferencia = await this.repositorioTransferencia.buscarPorId(transferenciaId);
      
      if (!transferencia) {
        return {
          exito: false,
          mensaje: 'Transferencia no encontrada',
          errores: ['La transferencia especificada no existe'],
        };
      }

      // Validar que la transferencia puede ser cancelada
      if (!transferencia.puedeCancelar()) {
        return {
          exito: false,
          mensaje: 'No se puede cancelar la transferencia',
          errores: ['La transferencia no puede ser cancelada en su estado actual'],
        };
      }

      // Cancelar la transferencia
      transferencia.cancelar(motivo);

      // Actualizar la transferencia en el repositorio
      const transferenciaActualizada = await this.repositorioTransferencia.actualizar(transferencia);

      return {
        exito: true,
        mensaje: 'Transferencia cancelada exitosamente',
        transferencia: transferenciaActualizada,
      };
    } catch (error) {
      return {
        exito: false,
        mensaje: 'Error al cancelar la transferencia',
        errores: [error.message],
      };
    }
  }

  /**
   * Lista transferencias con filtros opcionales
   */
  async listarTransferencias(
    filtros?: any,
    paginacion?: { pagina: number; limite: number }
  ): Promise<{ transferencias: TransferenciaProducto[]; total: number }> {
    try {
      const transferencias = await this.repositorioTransferencia.listar(filtros, paginacion);
      const total = await this.repositorioTransferencia.contar(filtros);

      return {
        transferencias,
        total,
      };
    } catch (error) {
      throw new Error(`Error al listar transferencias: ${error.message}`);
    }
  }

  /**
   * Obtiene una transferencia por su ID
   */
  async obtenerTransferenciaPorId(id: string): Promise<TransferenciaProducto | null> {
    try {
      return await this.repositorioTransferencia.buscarPorId(id);
    } catch (error) {
      throw new Error(`Error al obtener transferencia: ${error.message}`);
    }
  }

  /**
   * Exporta transferencias a CSV
   */
  async exportarTransferenciasCSV(filtros?: any): Promise<string> {
    try {
      return await this.repositorioTransferencia.exportarCSV(filtros);
    } catch (error) {
      throw new Error(`Error al exportar transferencias a CSV: ${error.message}`);
    }
  }

  /**
   * Importa transferencias desde CSV
   */
  async importarTransferenciasCSV(
    csvData: string, 
    tiendaId?: string, 
    usuarioId?: string
  ): Promise<TransferenciaProducto[]> {
    try {
      return await this.repositorioTransferencia.importarCSV(csvData, tiendaId, usuarioId);
    } catch (error) {
      throw new Error(`Error al importar transferencias desde CSV: ${error.message}`);
    }
  }

  /**
   * Valida los datos para crear una transferencia
   */
  private validarCreacionTransferencia(dto: CrearTransferenciaDTO): string[] {
    const errores: string[] = [];

    if (!dto.ubicacionOrigen || dto.ubicacionOrigen.trim() === '') {
      errores.push('La ubicación de origen es requerida');
    }

    if (!dto.ubicacionDestino || dto.ubicacionDestino.trim() === '') {
      errores.push('La ubicación de destino es requerida');
    }

    if (dto.ubicacionOrigen === dto.ubicacionDestino) {
      errores.push('La ubicación de origen y destino no pueden ser la misma');
    }

    if (!dto.creadorId) {
      errores.push('El creador es requerido');
    }

    if (!dto.items || dto.items.length === 0) {
      errores.push('La transferencia debe tener al menos un item');
    } else {
      dto.items.forEach((item, index) => {
        if (!item.productoId) {
          errores.push(`El item ${index + 1} debe tener un producto ID`);
        }

        if (item.cantidadSolicitada <= 0) {
          errores.push(`El item ${index + 1} debe tener una cantidad solicitada mayor a 0`);
        }
      });
    }

    return errores;
  }
}