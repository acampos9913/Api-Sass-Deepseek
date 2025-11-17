import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Kafka, Producer, Consumer, Admin, logLevel } from 'kafkajs';
import { ConfigService } from '@nestjs/config';
import { LoggingService } from '../../../logging/logging.service';
import { PublicadorEventosDominio, ConsumidorEventosDominio } from '../../dominio/eventos/evento-dominio.base';

/**
 * Servicio de Kafka para la mensajería y sincronización CQRS
 * Implementa tanto el publicador como el consumidor de eventos
 */
@Injectable()
export class KafkaService implements PublicadorEventosDominio, ConsumidorEventosDominio, OnModuleInit, OnModuleDestroy {
  private kafka: Kafka;
  private producer: Producer;
  private consumer: Consumer;
  private admin: Admin;
  private handlers: Map<string, (evento: any) => Promise<void>> = new Map();

  constructor(
    private readonly configService: ConfigService,
    private readonly loggingService: LoggingService,
  ) {
    this.inicializarKafka();
  }

  /**
   * Inicializa la conexión con Kafka
   */
  private inicializarKafka(): void {
    const brokers = this.configService.get<string>('KAFKA_BROKERS', 'localhost:9092').split(',');
    const clientId = this.configService.get<string>('KAFKA_CLIENT_ID', 'ecommerce-sass');
    const groupId = this.configService.get<string>('KAFKA_GROUP_ID', 'ecommerce-sass-group');

    this.kafka = new Kafka({
      clientId,
      brokers,
      logLevel: logLevel.INFO,
      retry: {
        initialRetryTime: 100,
        retries: 8,
      },
    });

    this.producer = this.kafka.producer();
    this.consumer = this.kafka.consumer({ groupId });
    this.admin = this.kafka.admin();

    this.loggingService.log('Servicio Kafka inicializado', {
      modulo: 'KafkaService',
      brokers,
      clientId,
      groupId,
    });
  }

  /**
   * Inicializa el servicio al arrancar el módulo
   */
  async onModuleInit(): Promise<void> {
    try {
      await this.producer.connect();
      await this.consumer.connect();
      await this.admin.connect();

      this.loggingService.log('Conexiones Kafka establecidas', {
        modulo: 'KafkaService'
      });

      // Crear topics necesarios si no existen
      await this.crearTopicsNecesarios();
    } catch (error) {
      this.loggingService.error('Error al inicializar Kafka', error.stack, {
        modulo: 'KafkaService'
      });
      throw error;
    }
  }

  /**
   * Limpia recursos al destruir el módulo
   */
  async onModuleDestroy(): Promise<void> {
    try {
      await this.producer.disconnect();
      await this.consumer.disconnect();
      await this.admin.disconnect();
      
      this.loggingService.log('Conexiones Kafka cerradas', {
        modulo: 'KafkaService'
      });
    } catch (error) {
      this.loggingService.error('Error al cerrar conexiones Kafka', error.stack, {
        modulo: 'KafkaService'
      });
    }
  }

  /**
   * Crea los topics necesarios para el sistema
   */
  private async crearTopicsNecesarios(): Promise<void> {
    const topics = [
      {
        topic: 'productos',
        numPartitions: 3,
        replicationFactor: 1,
      },
      {
        topic: 'clientes',
        numPartitions: 2,
        replicationFactor: 1,
      },
      {
        topic: 'ordenes',
        numPartitions: 3,
        replicationFactor: 1,
      },
      {
        topic: 'inventario',
        numPartitions: 2,
        replicationFactor: 1,
      },
      {
        topic: 'descuentos',
        numPartitions: 1,
        replicationFactor: 1,
      },
    ];

    try {
      await this.admin.createTopics({
        topics,
        waitForLeaders: true,
      });
      this.loggingService.log('Topics Kafka creados/verificados', {
        modulo: 'KafkaService',
        topics: topics.map(t => t.topic)
      });
    } catch (error) {
      this.loggingService.warn('Error al crear topics Kafka (puede que ya existan)', {
        modulo: 'KafkaService',
        error: error.message
      });
    }
  }

  /**
   * Publica un evento de dominio en Kafka
   */
  async publicar(evento: any): Promise<void> {
    try {
      const topic = this.obtenerTopicParaEvento(evento.tipoEvento);
      const mensaje = {
        value: typeof evento.serializar === 'function' ? evento.serializar() : JSON.stringify(evento),
        key: this.obtenerClaveMensaje(evento),
        headers: {
          'event-type': evento.tipoEvento,
          'event-version': evento.version?.toString() || '1',
          'timestamp': new Date().toISOString(),
        },
      };

      await this.producer.send({
        topic,
        messages: [mensaje],
      });

      this.loggingService.logEventoNegocio(
        'evento_publicado',
        evento.tipoEvento,
        evento.idEvento || evento.idProducto || 'unknown',
        'publicacion_exitosa',
        { topic, tipoEvento: evento.tipoEvento },
        { modulo: 'KafkaService' }
      );
    } catch (error) {
      this.loggingService.error(`Error al publicar evento ${evento.tipoEvento}`, error.stack, {
        modulo: 'KafkaService',
        evento: evento.tipoEvento,
        topic: this.obtenerTopicParaEvento(evento.tipoEvento),
      });
      throw error;
    }
  }

  /**
   * Publica un lote de eventos en Kafka
   */
  async publicarLote(eventos: any[]): Promise<void> {
    if (eventos.length === 0) return;

    const mensajesPorTopic = new Map<string, any[]>();

    // Agrupar mensajes por topic
    for (const evento of eventos) {
      const topic = this.obtenerTopicParaEvento(evento.tipoEvento);
      if (!mensajesPorTopic.has(topic)) {
        mensajesPorTopic.set(topic, []);
      }

      mensajesPorTopic.get(topic)!.push({
        value: typeof evento.serializar === 'function' ? evento.serializar() : JSON.stringify(evento),
        key: this.obtenerClaveMensaje(evento),
        headers: {
          'event-type': evento.tipoEvento,
          'event-version': evento.version?.toString() || '1',
          'timestamp': new Date().toISOString(),
        },
      });
    }

    // Enviar mensajes por topic
    for (const [topic, mensajes] of mensajesPorTopic) {
      try {
        await this.producer.send({
          topic,
          messages: mensajes,
        });

        this.loggingService.log(`Lote de eventos publicado en topic ${topic}`, {
          modulo: 'KafkaService',
          cantidadEventos: mensajes.length,
          topic,
          tiposEventos: [...new Set(mensajes.map(m => JSON.parse(m.value).tipoEvento))],
        });
      } catch (error) {
        this.loggingService.error(`Error al publicar lote en topic ${topic}`, error.stack, {
          modulo: 'KafkaService',
          topic,
          cantidadEventos: mensajes.length,
        });
        throw error;
      }
    }
  }

  /**
   * Suscribe un handler a un topic específico
   */
  suscribir(topic: string, handler: (evento: any) => Promise<void>): void {
    this.handlers.set(topic, handler);
    
    this.consumer.subscribe({ topic, fromBeginning: false });
    this.loggingService.log(`Handler suscrito al topic ${topic}`, {
      modulo: 'KafkaService',
      topic
    });
  }

  /**
   * Inicia el consumidor de Kafka
   */
  async iniciar(): Promise<void> {
    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const handler = this.handlers.get(topic);
          if (!handler) {
            this.loggingService.warn(`No hay handler registrado para el topic ${topic}`, {
              modulo: 'KafkaService',
              topic,
              partition,
              offset: message.offset,
            });
            return;
          }

          const evento = this.parsearMensajeKafka(message);
          await handler(evento);

          this.loggingService.logEventoNegocio(
            'evento_procesado',
            evento.tipoEvento,
            evento.idEvento || 'unknown',
            'procesamiento_exitoso',
            { topic, partition, offset: message.offset },
            { modulo: 'KafkaService' }
          );
        } catch (error) {
          this.loggingService.error(`Error al procesar mensaje en topic ${topic}`, error.stack, {
            modulo: 'KafkaService',
            topic,
            partition,
            offset: message.offset,
            key: message.key?.toString(),
          });
        }
      },
    });

    this.loggingService.log('Consumidor Kafka iniciado', {
      modulo: 'KafkaService'
    });
  }

  /**
   * Detiene el consumidor de Kafka
   */
  async detener(): Promise<void> {
    await this.consumer.stop();
    this.loggingService.log('Consumidor Kafka detenido', {
      modulo: 'KafkaService'
    });
  }

  /**
   * Obtiene el topic apropiado para un tipo de evento
   */
  private obtenerTopicParaEvento(tipoEvento: string): string {
    if (tipoEvento.includes('Producto')) return 'productos';
    if (tipoEvento.includes('Cliente')) return 'clientes';
    if (tipoEvento.includes('Orden')) return 'ordenes';
    if (tipoEvento.includes('Inventario')) return 'inventario';
    if (tipoEvento.includes('Descuento')) return 'descuentos';
    
    return 'eventos-generales';
  }

  /**
   * Obtiene la clave del mensaje para particionamiento
   */
  private obtenerClaveMensaje(evento: any): string {
    // Usar tiendaId para particionamiento si está disponible
    if (evento.tiendaId) return evento.tiendaId;
    if (evento.idProducto) return evento.idProducto;
    if (evento.idCliente) return evento.idCliente;
    
    return 'default';
  }

  /**
   * Parsea el mensaje de Kafka a un objeto
   */
  private parsearMensajeKafka(message: any): any {
    try {
      const value = message.value?.toString();
      if (!value) {
        throw new Error('Mensaje sin contenido');
      }
      
      return JSON.parse(value);
    } catch (error) {
      this.loggingService.error('Error al parsear mensaje Kafka', error.stack, {
        modulo: 'KafkaService',
        value: message.value?.toString(),
        key: message.key?.toString(),
      });
      throw error;
    }
  }

  /**
   * Obtiene el estado del servicio Kafka
   */
  async obtenerEstado(): Promise<any> {
    try {
      const metadata = await this.admin.fetchTopicMetadata();
      const producerMetrics = await this.producer.events;
      const consumerMetrics = await this.consumer.events;

      return {
        conectado: true,
        topics: metadata.topics.map(topic => ({
          nombre: topic.name,
          particiones: topic.partitions.length,
        })),
        metricas: {
          producer: producerMetrics,
          consumer: consumerMetrics,
        },
        handlersRegistrados: Array.from(this.handlers.keys()),
      };
    } catch (error) {
      return {
        conectado: false,
        error: error.message,
      };
    }
  }
}