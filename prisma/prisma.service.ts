import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * Servicio de Prisma para manejar la conexión a la base de datos
 * Incluye manejo de ciclo de vida de la conexión
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      log: ['query', 'info', 'warn', 'error'],
      errorFormat: 'pretty',
    });
  }

  /**
   * Inicializa la conexión con la base de datos cuando el módulo se inicia
   */
  async onModuleInit() {
    await this.$connect();
  }

  /**
   * Cierra la conexión con la base de datos cuando el módulo se destruye
   */
  async onModuleDestroy() {
    await this.$disconnect();
  }

  /**
   * Método para realizar transacciones de base de datos
   * @param fn - Función que contiene las operaciones de la transacción
   * @returns Resultado de la transacción
   */
  async transaccion<T>(fn: (prisma: PrismaClient) => Promise<T>): Promise<T> {
    return await this.$transaction(fn);
  }

  /**
   * Limpia todos los datos de la base de datos (solo para desarrollo/testing)
   */
  async limpiarBaseDatos(): Promise<void> {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('No se puede limpiar la base de datos en producción');
    }

    const modelos = Object.keys(this).filter(key => 
      !key.startsWith('_') && !key.startsWith('$') && key !== 'constructor'
    );

    for (const modelo of modelos) {
      try {
        await (this as any)[modelo].deleteMany({});
      } catch (error) {
        console.warn(`No se pudo limpiar el modelo ${modelo}:`, error.message);
      }
    }
  }

  /**
   * Verifica la salud de la conexión a la base de datos
   */
  async verificarSalud(): Promise<{ estado: string; mensaje: string }> {
    try {
      await this.$queryRaw`SELECT 1`;
      return {
        estado: 'saludable',
        mensaje: 'Conexión a la base de datos establecida correctamente'
      };
    } catch (error) {
      return {
        estado: 'error',
        mensaje: `Error en la conexión a la base de datos: ${error.message}`
      };
    }
  }

  /**
   * Obtiene estadísticas de la base de datos
   */
  async obtenerEstadisticas(): Promise<{
    totalProductos: number;
    totalUsuarios: number;
    totalOrdenes: number;
    totalClientes: number;
  }> {
    const [totalProductos, totalUsuarios, totalOrdenes, totalClientes] = await Promise.all([
      this.producto.count(),
      this.usuario.count(),
      this.orden.count(),
      this.cliente.count(),
    ]);

    return {
      totalProductos,
      totalUsuarios,
      totalOrdenes,
      totalClientes,
    };
  }
}