import { nanoid } from 'nanoid';
import { TipoServicioCredito } from './recarga-credito.entity';

/**
 * Entidad que representa el uso de créditos por servicio
 * Registra cada consumo de créditos con detalles del servicio utilizado
 */
export class CreditoUsado {
  constructor(
    public readonly id: string,
    public readonly tienda_id: string,
    public readonly cantidad_creditos: number,
    public readonly tipo_servicio: TipoServicioCredito,
    public readonly descripcion_servicio: string,
    public readonly id_referencia: string | null,
    public readonly metadata: Record<string, any>,
    public readonly fecha_uso: Date,
  ) {}

  /**
   * Crea una nueva instancia de CreditoUsado
   */
  static crear(datos: {
    id?: string;
    tienda_id: string;
    cantidad_creditos: number;
    tipo_servicio: TipoServicioCredito;
    descripcion_servicio: string;
    id_referencia?: string | null;
    metadata?: Record<string, any>;
    fecha_uso?: Date;
  }): CreditoUsado {
    const id = datos.id || `cred_uso_${Date.now()}_${nanoid(10)}`;
    const fecha_uso = datos.fecha_uso || new Date();

    return new CreditoUsado(
      id,
      datos.tienda_id,
      datos.cantidad_creditos,
      datos.tipo_servicio,
      datos.descripcion_servicio,
      datos.id_referencia || null,
      datos.metadata || {},
      fecha_uso,
    );
  }

  /**
   * Obtiene la información del uso para mostrar en reportes
   */
  obtenerInformacionUso() {
    return {
      id: this.id,
      tienda_id: this.tienda_id,
      cantidad_creditos: this.cantidad_creditos,
      tipo_servicio: this.tipo_servicio,
      descripcion_servicio: this.descripcion_servicio,
      id_referencia: this.id_referencia,
      fecha_uso: this.fecha_uso,
      hora_uso: this.fecha_uso.toLocaleTimeString('es-PE'),
      metadata: this.metadata
    };
  }

  /**
   * Obtiene información para reportes diarios
   */
  obtenerInformacionDiaria() {
    const fecha = this.fecha_uso.toISOString().split('T')[0];
    
    return {
      fecha,
      cantidad_creditos: this.cantidad_creditos,
      tipo_servicio: this.tipo_servicio,
      descripcion_servicio: this.descripcion_servicio
    };
  }

  /**
   * Obtiene información para reportes mensuales
   */
  obtenerInformacionMensual() {
    const año = this.fecha_uso.getFullYear();
    const mes = this.fecha_uso.getMonth() + 1;
    
    return {
      año,
      mes,
      cantidad_creditos: this.cantidad_creditos,
      tipo_servicio: this.tipo_servicio
    };
  }
}