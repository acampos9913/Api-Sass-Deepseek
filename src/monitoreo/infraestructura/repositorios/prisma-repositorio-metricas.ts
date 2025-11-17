import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { RepositorioMetricas } from '../../dominio/interfaces/repositorio-metricas.interface';
import { 
  RequestMetrica, 
  MetricasTiempoRespuesta, 
  MetricasThroughput, 
  MetricasRecursos, 
  PeriodoTiempo, 
  EndpointUso 
} from '../../dominio/interfaces/repositorio-metricas.interface';

@Injectable()
export class PrismaRepositorioMetricas implements RepositorioMetricas {
  constructor(private readonly prisma: PrismaClient) {}

  async contarProductos(): Promise<number> {
    return this.prisma.producto.count();
  }

  async contarClientes(): Promise<number> {
    return this.prisma.cliente.count();
  }

  async contarPedidos(): Promise<number> {
    return this.prisma.pedido.count();
  }

  async obtenerTotalVentas(): Promise<number> {
    const resultado = await this.prisma.pedido.aggregate({
      _sum: {
        total: true,
      },
      where: {
        estado: 'completado',
      },
    });
    return resultado._sum.total || 0;
  }

  async contarProductosActivos(): Promise<number> {
    return this.prisma.producto.count({
      where: {
        estado: 'activo',
      },
    });
  }

  async contarProductosInactivos(): Promise<number> {
    return this.prisma.producto.count({
      where: {
        estado: 'inactivo',
      },
    });
  }

  async contarPedidosPendientes(): Promise<number> {
    return this.prisma.pedido.count({
      where: {
        estado: 'pendiente',
      },
    });
  }

  async contarPedidosCompletados(): Promise<number> {
    return this.prisma.pedido.count({
      where: {
        estado: 'completado',
      },
    });
  }

  async contarPedidosCancelados(): Promise<number> {
    return this.prisma.pedido.count({
      where: {
        estado: 'cancelado',
      },
    });
  }

  async obtenerTiempoRespuestaPromedio(): Promise<number> {
    // En producción, esto vendría de una tabla de métricas de requests
    // Por ahora simulamos un valor
    return 150; // ms
  }

  async obtenerUsoCPU(): Promise<number> {
    // Simulación del uso de CPU
    // En producción, usaría una librería como os-utils
    return Math.random() * 100;
  }

  async obtenerMetricasTiempoRespuesta(periodo: PeriodoTiempo): Promise<MetricasTiempoRespuesta> {
    // En producción, esto consultaría una tabla de métricas de requests
    // Por ahora simulamos datos
    return {
      promedio: 120,
      p95: 250,
      p99: 500,
      maximo: 1000,
    };
  }

  async obtenerMetricasThroughput(periodo: PeriodoTiempo): Promise<MetricasThroughput> {
    // En producción, esto consultaría una tabla de métricas de requests
    // Por ahora simulamos datos
    const requestsPorSegundo = Math.random() * 50 + 10;
    const erroresPorSegundo = Math.random() * 2;
    const tasaExito = ((requestsPorSegundo - erroresPorSegundo) / requestsPorSegundo) * 100;

    return {
      requestsPorSegundo,
      erroresPorSegundo,
      tasaExito,
    };
  }

  async obtenerMetricasRecursos(): Promise<MetricasRecursos> {
    const usoMemoria = process.memoryUsage().heapUsed / 1024 / 1024; // MB
    const usoCPU = await this.obtenerUsoCPU();
    
    // Simulación de conexiones activas
    const conexionesActivas = Math.floor(Math.random() * 100) + 1;

    return {
      usoMemoria,
      usoCPU,
      conexionesActivas,
    };
  }

  async obtenerEndpointsMasUsados(periodo: string): Promise<EndpointUso[]> {
    // En producción, esto consultaría una tabla de logs de requests
    // Por ahora simulamos datos
    return [
      { endpoint: '/api/productos', cantidadRequests: 1500, tasaExito: 98.5 },
      { endpoint: '/api/pedidos', cantidadRequests: 800, tasaExito: 95.2 },
      { endpoint: '/api/clientes', cantidadRequests: 600, tasaExito: 99.1 },
      { endpoint: '/api/auth/login', cantidadRequests: 400, tasaExito: 97.8 },
      { endpoint: '/api/carrito', cantidadRequests: 350, tasaExito: 96.5 },
    ];
  }

  async contarClientesActivos(periodo: string): Promise<number> {
    // Un cliente activo es uno que ha realizado al menos una compra en el período
    const fechaLimite = this.calcularFechaLimite(periodo);
    
    return this.prisma.cliente.count({
      where: {
        pedidos: {
          some: {
            fechaCreacion: {
              gte: fechaLimite,
            },
          },
        },
      },
    });
  }

  async contarNuevasRegistraciones(periodo: string): Promise<number> {
    const fechaLimite = this.calcularFechaLimite(periodo);
    
    return this.prisma.cliente.count({
      where: {
        fechaCreacion: {
          gte: fechaLimite,
        },
      },
    });
  }

  async registrarRequest(metrica: RequestMetrica): Promise<void> {
    // En producción, esto insertaría en una tabla de métricas de requests
    // Por ahora solo registramos en consola para demostración
    console.log('Métrica de request registrada:', {
      endpoint: metrica.endpoint,
      metodo: metrica.metodo,
      tiempoRespuesta: metrica.tiempoRespuesta,
      codigoEstado: metrica.codigoEstado,
      timestamp: metrica.timestamp,
    });
  }

  private calcularFechaLimite(periodo: string): Date {
    const ahora = new Date();
    let fechaLimite: Date;

    switch (periodo) {
      case '1d':
        fechaLimite = new Date(ahora.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        fechaLimite = new Date(ahora.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        fechaLimite = new Date(ahora.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        fechaLimite = new Date(ahora.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    return fechaLimite;
  }
}