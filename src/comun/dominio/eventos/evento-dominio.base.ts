/**
 * Clase base para todos los eventos de dominio en el sistema
 * Implementa el patrón de eventos de dominio para la arquitectura CQRS
 */
export abstract class EventoDominio {
  public readonly idEvento: string;
  public readonly fechaCreacion: Date;
  public readonly tipoEvento: string;
  public readonly version: number;

  constructor(tipoEvento: string, version: number = 1) {
    this.idEvento = this.generarIdEvento();
    this.fechaCreacion = new Date();
    this.tipoEvento = tipoEvento;
    this.version = version;
  }

  /**
   * Genera un ID único para el evento
   */
  private generarIdEvento(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Serializa el evento para su envío a Kafka
   */
  public serializar(): string {
    return JSON.stringify({
      idEvento: this.idEvento,
      tipoEvento: this.tipoEvento,
      fechaCreacion: this.fechaCreacion.toISOString(),
      version: this.version,
      datos: this.obtenerDatosEvento(),
    });
  }

  /**
   * Método abstracto que debe implementar cada evento específico
   * para proporcionar sus datos específicos
   */
  protected abstract obtenerDatosEvento(): any;
}

/**
 * Interfaz para el publicador de eventos de dominio
 */
export interface PublicadorEventosDominio {
  publicar(evento: EventoDominio): Promise<void>;
  publicarLote(eventos: EventoDominio[]): Promise<void>;
}

/**
 * Interfaz para el consumidor de eventos de dominio
 */
export interface ConsumidorEventosDominio {
  suscribir(topic: string, handler: (evento: any) => Promise<void>): void;
  iniciar(): Promise<void>;
  detener(): Promise<void>;
}