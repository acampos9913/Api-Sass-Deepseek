import { nanoid } from 'nanoid';

/**
 * Entidad que representa el balance de créditos de una tienda
 * Mantiene el estado actual de créditos disponibles y usados
 */
export class CreditoTienda {
  constructor(
    public readonly id: string,
    public readonly tienda_id: string,
    public creditos_disponibles: number,
    public creditos_usados: number,
    public readonly fecha_creacion: Date,
    public fecha_actualizacion: Date,
  ) {}

  /**
   * Crea una nueva instancia de CreditoTienda
   */
  static crear(datos: {
    id?: string;
    tienda_id: string;
    creditos_disponibles?: number;
    creditos_usados?: number;
    fecha_creacion?: Date;
    fecha_actualizacion?: Date;
  }): CreditoTienda {
    const id = datos.id || `cred_tienda_${Date.now()}_${nanoid(10)}`;
    const fecha_creacion = datos.fecha_creacion || new Date();
    const fecha_actualizacion = datos.fecha_actualizacion || new Date();

    return new CreditoTienda(
      id,
      datos.tienda_id,
      datos.creditos_disponibles || 0,
      datos.creditos_usados || 0,
      fecha_creacion,
      fecha_actualizacion,
    );
  }

  /**
   * Agrega créditos al balance disponible
   */
  agregarCreditos(cantidad: number): void {
    if (cantidad <= 0) {
      throw new Error('La cantidad de créditos a agregar debe ser mayor a 0');
    }
    this.creditos_disponibles += cantidad;
    this.fecha_actualizacion = new Date();
  }

  /**
   * Consume créditos del balance disponible
   */
  consumirCreditos(cantidad: number): void {
    if (cantidad <= 0) {
      throw new Error('La cantidad de créditos a consumir debe ser mayor a 0');
    }
    if (cantidad > this.creditos_disponibles) {
      throw new Error('Créditos insuficientes');
    }
    this.creditos_disponibles -= cantidad;
    this.creditos_usados += cantidad;
    this.fecha_actualizacion = new Date();
  }

  /**
   * Obtiene el balance total (disponible + usados)
   */
  obtenerBalanceTotal(): number {
    return this.creditos_disponibles + this.creditos_usados;
  }

  /**
   * Valida si hay créditos suficientes para una operación
   */
  tieneCreditosSuficientes(cantidad: number): boolean {
    return this.creditos_disponibles >= cantidad;
  }
}