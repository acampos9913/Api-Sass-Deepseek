import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '../../generated/prisma';

/**
 * Servicio de Prisma para la conexión con la base de datos
 * Implementa OnModuleInit y OnModuleDestroy para gestionar la conexión
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      log: ['query', 'info', 'warn', 'error'],
      errorFormat: 'colorless',
    });
  }

  /**
   * Conecta a la base de datos cuando el módulo se inicializa
   */
  async onModuleInit() {
    await this.$connect();
  }

  /**
   * Desconecta de la base de datos cuando el módulo se destruye
   */
  async onModuleDestroy() {
    await this.$disconnect();
  }

  /**
   * Ejecuta una transacción con retry automático
   * @param fn - Función que contiene las operaciones de la transacción
   * @param maxRetries - Número máximo de reintentos (por defecto 3)
   */
  async executeTransaction<T>(
    fn: (prisma: PrismaClient) => Promise<T>,
    maxRetries: number = 3,
  ): Promise<T> {
    let retries = 0;
    
    while (retries < maxRetries) {
      try {
        return await this.$transaction(fn);
      } catch (error) {
        if (error.code === 'P2034') {
          // Error de transacción serializable, reintentar
          retries++;
          if (retries >= maxRetries) {
            throw new Error(`Transacción fallida después de ${maxRetries} intentos: ${error.message}`);
          }
          // Esperar un momento antes de reintentar
          await new Promise(resolve => setTimeout(resolve, 100 * retries));
        } else {
          // Otro tipo de error, no reintentar
          throw error;
        }
      }
    }
    
    throw new Error('Transacción fallida después de múltiples intentos');
  }

  /**
   * Limpia los datos de prueba (solo para entornos de desarrollo)
   */
  async cleanDatabase() {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('No se puede limpiar la base de datos en producción');
    }

    const models = Reflect.ownKeys(this).filter(key => 
      key[0] !== '_' && key[0] !== '$' && typeof this[key]?.deleteMany === 'function'
    );

    return Promise.all(
      models.map(modelKey => 
        this[modelKey].deleteMany()
      )
    );
  }
}