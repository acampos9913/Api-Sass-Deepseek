import { nanoid } from 'nanoid';

/**
 * Tipos de servicio que consumen créditos
 */
export enum TipoServicioCredito {
  IA = 'IA',
  API = 'API',
  WEBHOOK = 'WEBHOOK',
  REDES_SOCIALES = 'REDES_SOCIALES',
  OTRO = 'OTRO'
}

/**
 * Entidad que representa una recarga de créditos
 */
export class RecargaCredito {
  constructor(
    public readonly id: string,
    public readonly tienda_id: string,
    public readonly monto_dolares: number,
    public readonly creditos_agregados: number,
    public readonly id_pago_stripe: string,
    public readonly estado: 'COMPLETADO' | 'PENDIENTE' | 'FALLIDO',
    public readonly fecha_recarga: Date,
    public readonly fecha_actualizacion: Date,
  ) {}

  /**
   * Crea una nueva instancia de RecargaCredito
   */
  static crear(datos: {
    id?: string;
    tienda_id: string;
    monto_dolares: number;
    id_pago_stripe: string;
    estado?: 'COMPLETADO' | 'PENDIENTE' | 'FALLIDO';
    fecha_recarga?: Date;
    fecha_actualizacion?: Date;
  }): RecargaCredito {
    const id = datos.id || `recarga_${Date.now()}_${nanoid(10)}`;
    const fecha_recarga = datos.fecha_recarga || new Date();
    const fecha_actualizacion = datos.fecha_actualizacion || new Date();
    const estado = datos.estado || 'PENDIENTE';
    
    // Calcular créditos agregados (1 dólar = 100 créditos)
    const creditos_agregados = datos.monto_dolares * 100;

    return new RecargaCredito(
      id,
      datos.tienda_id,
      datos.monto_dolares,
      creditos_agregados,
      datos.id_pago_stripe,
      estado,
      fecha_recarga,
      fecha_actualizacion,
    );
  }

  /**
   * Marca la recarga como completada
   */
  marcarCompletada(): void {
    (this as any).estado = 'COMPLETADO';
    (this as any).fecha_actualizacion = new Date();
  }

  /**
   * Marca la recarga como fallida
   */
  marcarFallida(): void {
    (this as any).estado = 'FALLIDO';
    (this as any).fecha_actualizacion = new Date();
  }

  /**
   * Valida que el monto cumple con el mínimo requerido
   */
  validarMontoMinimo(): boolean {
    return this.monto_dolares >= 5;
  }

  /**
   * Obtiene la información de la recarga para mostrar
   */
  obtenerInformacionRecarga() {
    return {
      id: this.id,
      tienda_id: this.tienda_id,
      monto_dolares: this.monto_dolares,
      creditos_agregados: this.creditos_agregados,
      estado: this.estado,
      fecha_recarga: this.fecha_recarga,
      tasa_conversion: '1 USD = 100 créditos'
    };
  }
}