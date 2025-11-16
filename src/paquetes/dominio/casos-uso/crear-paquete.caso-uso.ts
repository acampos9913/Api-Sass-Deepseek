import { Inject, Injectable } from '@nestjs/common';
import { PaqueteProducto, ItemPaquete } from '../entidades/paquete-producto.entity';
import type { RepositorioPaquete } from '../interfaces/repositorio-paquete.interface';

/**
 * Caso de uso para crear un nuevo paquete de productos
 * Contiene la lógica de negocio específica para la creación de paquetes
 */
@Injectable()
export class CrearPaqueteCasoUso {
  constructor(
    @Inject('RepositorioPaquete')
    private readonly repositorioPaquete: RepositorioPaquete,
  ) {}

  /**
   * Ejecuta el caso de uso para crear un paquete
   * @param datos Datos del paquete a crear
   * @param creadorId ID del usuario que crea el paquete
   * @returns Entidad PaqueteProducto creada
   */
  async ejecutar(
    datos: {
      nombre: string;
      descripcion?: string | null;
      precio: number;
      precioComparacion?: number | null;
      sku?: string | null;
      activo?: boolean;
      tiendaId?: string | null;
      items: Array<{
        productoId: string;
        varianteId?: string | null;
        cantidad: number;
        precioUnitario?: number | null;
      }>;
    },
    creadorId: string,
  ): Promise<PaqueteProducto> {
    // Validaciones básicas
    if (!datos.nombre || datos.nombre.trim().length === 0) {
      throw new Error('El nombre del paquete es requerido');
    }

    if (datos.precio <= 0) {
      throw new Error('El precio del paquete debe ser mayor a 0');
    }

    if (!datos.items || datos.items.length === 0) {
      throw new Error('El paquete debe contener al menos un producto');
    }

    // Validar que no exista un paquete con el mismo SKU
    if (datos.sku) {
      const paqueteExistente = await this.repositorioPaquete.buscarPorSku(datos.sku);
      if (paqueteExistente) {
        throw new Error('Ya existe un paquete con este SKU');
      }
    }

    // Validar items
    const erroresItems: string[] = [];
    datos.items.forEach((item, index) => {
      if (!item.productoId) {
        erroresItems.push(`El item ${index + 1} no tiene un producto asignado`);
      }
      if (item.cantidad <= 0) {
        erroresItems.push(`El item ${index + 1} debe tener una cantidad mayor a 0`);
      }
    });

    if (erroresItems.length > 0) {
      throw new Error(`Errores en los items: ${erroresItems.join(', ')}`);
    }

    // Crear entidad de dominio
    const fechaActual = new Date();
    const itemsPaquete: ItemPaquete[] = datos.items.map(item => ({
      id: this.generarIdItem(),
      productoId: item.productoId,
      varianteId: item.varianteId || null,
      cantidad: item.cantidad,
      precioUnitario: item.precioUnitario || 0,
    }));

    const paquete = new PaqueteProducto(
      this.generarId(),
      datos.nombre.trim(),
      datos.descripcion?.trim() || null,
      datos.precio,
      datos.precioComparacion || null,
      datos.sku?.trim() || null,
      datos.activo ?? true,
      fechaActual,
      fechaActual,
      datos.tiendaId || null,
      creadorId,
      itemsPaquete,
    );

    // Validar la entidad de dominio
    const validacion = paquete.validarItems();
    if (!validacion.valido) {
      throw new Error(`Paquete inválido: ${validacion.errores.join(', ')}`);
    }

    // Verificar margen de ganancia mínimo
    if (!paquete.tieneMargenValido()) {
      throw new Error('El paquete debe tener un margen de ganancia mínimo del 10%');
    }

    // Verificar ahorro significativo
    if (!paquete.ofreceAhorroSignificativo()) {
      throw new Error('El paquete debe ofrecer un ahorro mínimo del 5% al cliente');
    }

    // Persistir en el repositorio
    await this.repositorioPaquete.crear({
      id: paquete.id,
      nombre: paquete.nombre,
      descripcion: paquete.descripcion,
      precio: paquete.precio,
      precioComparacion: paquete.precioComparacion,
      sku: paquete.sku,
      activo: paquete.activo,
      fechaCreacion: paquete.fechaCreacion,
      fechaActualizacion: paquete.fechaActualizacion,
      tiendaId: paquete.tiendaId,
      creadorId: paquete.creadorId,
      items: paquete.items.map(item => ({
        productoId: item.productoId,
        varianteId: item.varianteId,
        cantidad: item.cantidad,
        precioUnitario: item.precioUnitario,
      })),
    });

    return paquete;
  }

  /**
   * Genera un ID único para el paquete
   */
  private generarId(): string {
    return `paquete_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Genera un ID único para un item del paquete
   */
  private generarIdItem(): string {
    return `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}