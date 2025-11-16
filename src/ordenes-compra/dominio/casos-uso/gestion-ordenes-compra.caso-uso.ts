import { Injectable } from '@nestjs/common';
import { OrdenCompra, ItemOrdenCompra, EstadoOrdenCompra } from '../entidades/orden-compra.entity';
import type { RepositorioOrdenCompra } from '../interfaces/repositorio-orden-compra.interface';

/**
 * DTO para crear una orden de compra
 */
export interface CrearOrdenCompraDTO {
  proveedor: string;
  subtotal: number;
  impuestos: number;
  total: number;
  tiendaId?: string;
  creadorId: string;
  usuarioId?: string;
  notas?: string;
  fechaEsperada?: Date;
  items: CrearItemOrdenCompraDTO[];
}

/**
 * DTO para crear un item de orden de compra
 */
export interface CrearItemOrdenCompraDTO {
  productoId: string;
  cantidad: number;
  precioUnitario: number;
}

/**
 * DTO para actualizar una orden de compra
 */
export interface ActualizarOrdenCompraDTO {
  proveedor?: string;
  notas?: string;
  fechaEsperada?: Date;
  items?: ActualizarItemOrdenCompraDTO[];
}

/**
 * DTO para actualizar un item de orden de compra
 */
export interface ActualizarItemOrdenCompraDTO {
  id: string;
  cantidad?: number;
  precioUnitario?: number;
}

/**
 * DTO para recibir productos de una orden de compra
 */
export interface RecibirProductosOrdenCompraDTO {
  items: RecibirItemOrdenCompraDTO[];
}

/**
 * DTO para recibir un item de orden de compra
 */
export interface RecibirItemOrdenCompraDTO {
  itemId: string;
  cantidadRecibida: number;
}

/**
 * Resultado de la operación de orden de compra
 */
export interface ResultadoOrdenCompra {
  exito: boolean;
  mensaje: string;
  ordenCompra?: OrdenCompra;
  errores?: string[];
}

/**
 * Caso de uso para la gestión de órdenes de compra
 * Coordina las operaciones de negocio relacionadas con órdenes de compra
 */
@Injectable()
export class GestionOrdenesCompraCasoUso {
  constructor(private readonly repositorioOrdenCompra: RepositorioOrdenCompra) {}

  /**
   * Crea una nueva orden de compra en estado BORRADOR
   */
  async crearOrdenCompra(dto: CrearOrdenCompraDTO): Promise<ResultadoOrdenCompra> {
    try {
      // Validar datos de entrada
      const erroresValidacion = this.validarCreacionOrdenCompra(dto);
      if (erroresValidacion.length > 0) {
        return {
          exito: false,
          mensaje: 'Errores de validación en la creación de la orden de compra',
          errores: erroresValidacion,
        };
      }

      // Obtener siguiente número de orden
      const numeroOrden = await this.repositorioOrdenCompra.obtenerSiguienteNumeroOrden();

      // Crear la orden de compra
      const ordenCompra = OrdenCompra.crear(
        numeroOrden,
        dto.proveedor,
        dto.subtotal,
        dto.impuestos,
        dto.total,
        dto.tiendaId || null,
        dto.creadorId,
        dto.usuarioId || null,
        dto.notas,
        dto.fechaEsperada
      );

      // Agregar items a la orden
      for (const itemDTO of dto.items) {
        const item = ItemOrdenCompra.crear(
          itemDTO.productoId,
          itemDTO.cantidad,
          itemDTO.precioUnitario
        );
        ordenCompra.agregarItem(item);
      }

      // Guardar la orden de compra
      const ordenGuardada = await this.repositorioOrdenCompra.guardar(ordenCompra);

      return {
        exito: true,
        mensaje: 'Orden de compra creada exitosamente',
        ordenCompra: ordenGuardada,
      };
    } catch (error) {
      return {
        exito: false,
        mensaje: 'Error al crear la orden de compra',
        errores: [error.message],
      };
    }
  }

  /**
   * Envía una orden de compra al proveedor
   */
  async enviarOrdenCompra(ordenCompraId: string): Promise<ResultadoOrdenCompra> {
    try {
      const ordenCompra = await this.repositorioOrdenCompra.buscarPorId(ordenCompraId);
      
      if (!ordenCompra) {
        return {
          exito: false,
          mensaje: 'Orden de compra no encontrada',
          errores: ['La orden de compra especificada no existe'],
        };
      }

      // Validar que la orden puede ser enviada
      if (!ordenCompra.puedeEditar()) {
        return {
          exito: false,
          mensaje: 'No se puede enviar la orden de compra',
          errores: ['La orden de compra no está en estado BORRADOR'],
        };
      }

      // Enviar la orden
      ordenCompra.enviar();

      // Actualizar la orden en el repositorio
      const ordenActualizada = await this.repositorioOrdenCompra.actualizar(ordenCompra);

      return {
        exito: true,
        mensaje: 'Orden de compra enviada exitosamente',
        ordenCompra: ordenActualizada,
      };
    } catch (error) {
      return {
        exito: false,
        mensaje: 'Error al enviar la orden de compra',
        errores: [error.message],
      };
    }
  }

  /**
   * Confirma una orden de compra con el proveedor
   */
  async confirmarOrdenCompra(ordenCompraId: string): Promise<ResultadoOrdenCompra> {
    try {
      const ordenCompra = await this.repositorioOrdenCompra.buscarPorId(ordenCompraId);
      
      if (!ordenCompra) {
        return {
          exito: false,
          mensaje: 'Orden de compra no encontrada',
          errores: ['La orden de compra especificada no existe'],
        };
      }

      // Confirmar la orden
      ordenCompra.confirmar();

      // Actualizar la orden en el repositorio
      const ordenActualizada = await this.repositorioOrdenCompra.actualizar(ordenCompra);

      return {
        exito: true,
        mensaje: 'Orden de compra confirmada exitosamente',
        ordenCompra: ordenActualizada,
      };
    } catch (error) {
      return {
        exito: false,
        mensaje: 'Error al confirmar la orden de compra',
        errores: [error.message],
      };
    }
  }

  /**
   * Recibe productos de una orden de compra
   */
  async recibirProductosOrdenCompra(
    ordenCompraId: string, 
    dto: RecibirProductosOrdenCompraDTO
  ): Promise<ResultadoOrdenCompra> {
    try {
      const ordenCompra = await this.repositorioOrdenCompra.buscarPorId(ordenCompraId);
      
      if (!ordenCompra) {
        return {
          exito: false,
          mensaje: 'Orden de compra no encontrada',
          errores: ['La orden de compra especificada no existe'],
        };
      }

      // Validar que la orden puede recibir productos
      if (ordenCompra.estado !== EstadoOrdenCompra.CONFIRMADA && 
          ordenCompra.estado !== EstadoOrdenCompra.PARCIALMENTE_RECIBIDA) {
        return {
          exito: false,
          mensaje: 'No se pueden recibir productos en esta orden',
          errores: ['La orden debe estar en estado CONFIRMADA o PARCIALMENTE_RECIBIDA para recibir productos'],
        };
      }

      // Procesar la recepción de cada item
      for (const itemDTO of dto.items) {
        ordenCompra.actualizarCantidadRecibida(itemDTO.itemId, itemDTO.cantidadRecibida);
      }

      // Actualizar la orden en el repositorio
      const ordenActualizada = await this.repositorioOrdenCompra.actualizar(ordenCompra);

      return {
        exito: true,
        mensaje: 'Productos recibidos exitosamente',
        ordenCompra: ordenActualizada,
      };
    } catch (error) {
      return {
        exito: false,
        mensaje: 'Error al recibir productos de la orden de compra',
        errores: [error.message],
      };
    }
  }

  /**
   * Completa la recepción de una orden de compra
   */
  async completarOrdenCompra(ordenCompraId: string): Promise<ResultadoOrdenCompra> {
    try {
      const ordenCompra = await this.repositorioOrdenCompra.buscarPorId(ordenCompraId);
      
      if (!ordenCompra) {
        return {
          exito: false,
          mensaje: 'Orden de compra no encontrada',
          errores: ['La orden de compra especificada no existe'],
        };
      }

      // Completar la orden
      ordenCompra.completar();

      // Actualizar la orden en el repositorio
      const ordenActualizada = await this.repositorioOrdenCompra.actualizar(ordenCompra);

      return {
        exito: true,
        mensaje: 'Orden de compra completada exitosamente',
        ordenCompra: ordenActualizada,
      };
    } catch (error) {
      return {
        exito: false,
        mensaje: 'Error al completar la orden de compra',
        errores: [error.message],
      };
    }
  }

  /**
   * Cancela una orden de compra
   */
  async cancelarOrdenCompra(ordenCompraId: string, motivo: string): Promise<ResultadoOrdenCompra> {
    try {
      const ordenCompra = await this.repositorioOrdenCompra.buscarPorId(ordenCompraId);
      
      if (!ordenCompra) {
        return {
          exito: false,
          mensaje: 'Orden de compra no encontrada',
          errores: ['La orden de compra especificada no existe'],
        };
      }

      // Validar que la orden puede ser cancelada
      if (!ordenCompra.puedeCancelar()) {
        return {
          exito: false,
          mensaje: 'No se puede cancelar la orden de compra',
          errores: ['La orden no puede ser cancelada en su estado actual'],
        };
      }

      // Cancelar la orden
      ordenCompra.cancelar(motivo);

      // Actualizar la orden en el repositorio
      const ordenActualizada = await this.repositorioOrdenCompra.actualizar(ordenCompra);

      return {
        exito: true,
        mensaje: 'Orden de compra cancelada exitosamente',
        ordenCompra: ordenActualizada,
      };
    } catch (error) {
      return {
        exito: false,
        mensaje: 'Error al cancelar la orden de compra',
        errores: [error.message],
      };
    }
  }

  /**
   * Lista órdenes de compra con filtros opcionales
   */
  async listarOrdenesCompra(
    filtros?: any,
    paginacion?: { pagina: number; limite: number }
  ): Promise<{ ordenes: OrdenCompra[]; total: number }> {
    try {
      const ordenes = await this.repositorioOrdenCompra.listar(filtros, paginacion);
      const total = await this.repositorioOrdenCompra.contar(filtros);

      return {
        ordenes,
        total,
      };
    } catch (error) {
      throw new Error(`Error al listar órdenes de compra: ${error.message}`);
    }
  }

  /**
   * Obtiene una orden de compra por su ID
   */
  async obtenerOrdenCompraPorId(id: string): Promise<OrdenCompra | null> {
    try {
      return await this.repositorioOrdenCompra.buscarPorId(id);
    } catch (error) {
      throw new Error(`Error al obtener orden de compra: ${error.message}`);
    }
  }

  /**
   * Exporta órdenes de compra a CSV
   */
  async exportarOrdenesCompraCSV(filtros?: any): Promise<string> {
    try {
      return await this.repositorioOrdenCompra.exportarCSV(filtros);
    } catch (error) {
      throw new Error(`Error al exportar órdenes de compra a CSV: ${error.message}`);
    }
  }

  /**
   * Importa órdenes de compra desde CSV
   */
  async importarOrdenesCompraCSV(
    csvData: string, 
    tiendaId?: string, 
    usuarioId?: string
  ): Promise<OrdenCompra[]> {
    try {
      return await this.repositorioOrdenCompra.importarCSV(csvData, tiendaId, usuarioId);
    } catch (error) {
      throw new Error(`Error al importar órdenes de compra desde CSV: ${error.message}`);
    }
  }

  /**
   * Valida los datos para crear una orden de compra
   */
  private validarCreacionOrdenCompra(dto: CrearOrdenCompraDTO): string[] {
    const errores: string[] = [];

    if (!dto.proveedor || dto.proveedor.trim() === '') {
      errores.push('El proveedor es requerido');
    }

    if (dto.subtotal <= 0) {
      errores.push('El subtotal debe ser mayor a 0');
    }

    if (dto.impuestos < 0) {
      errores.push('Los impuestos no pueden ser negativos');
    }

    if (dto.total <= 0) {
      errores.push('El total debe ser mayor a 0');
    }

    if (!dto.creadorId) {
      errores.push('El creador es requerido');
    }

    if (!dto.items || dto.items.length === 0) {
      errores.push('La orden de compra debe tener al menos un item');
    } else {
      dto.items.forEach((item, index) => {
        if (!item.productoId) {
          errores.push(`El item ${index + 1} debe tener un producto ID`);
        }

        if (item.cantidad <= 0) {
          errores.push(`El item ${index + 1} debe tener una cantidad mayor a 0`);
        }

        if (item.precioUnitario <= 0) {
          errores.push(`El item ${index + 1} debe tener un precio unitario mayor a 0`);
        }
      });
    }

    return errores;
  }
}