import { Injectable } from '@nestjs/common';
import type { RepositorioMetricas } from '../../dominio/interfaces/repositorio-metricas.interface';

export interface MetricasSistema {
  totalProductos: number;
  totalClientes: number;
  totalPedidos: number;
  totalVentas: number;
  productosActivos: number;
  productosInactivos: number;
  pedidosPendientes: number;
  pedidosCompletados: number;
  pedidosCancelados: number;
  tasaConversion: number;
  tiempoRespuestaPromedio: number;
  usoMemoria: number;
  usoCPU: number;
  timestamp: Date;
}

export interface MetricasRendimiento {
  tiempoRespuesta: {
    promedio: number;
    p95: number;
    p99: number;
    maximo: number;
  };
  throughput: {
    requestsPorSegundo: number;
    erroresPorSegundo: number;
    tasaExito: number;
  };
  recursos: {
    usoMemoria: number;
    usoCPU: number;
    conexionesActivas: number;
  };
  periodoTiempo: {
    desde: Date;
    hasta: Date;
  };
}

export interface EstadisticasUso {
  endpointsMasUsados: Array<{
    endpoint: string;
    cantidadRequests: number;
    tasaExito: number;
  }>;
  clientesActivos: number;
  nuevasRegistraciones: number;
  periodoTiempo: string;
}

@Injectable()
export class ServicioMetricas {
  constructor(
    private readonly repositorioMetricas: RepositorioMetricas,
  ) {}

  async obtenerMetricasSistema(): Promise<MetricasSistema> {
    // Obtener métricas básicas del sistema
    const [
      totalProductos,
      totalClientes,
      totalPedidos,
      totalVentas,
      productosActivos,
      productosInactivos,
      pedidosPendientes,
      pedidosCompletados,
      pedidosCancelados,
    ] = await Promise.all([
      this.repositorioMetricas.contarProductos(),
      this.repositorioMetricas.contarClientes(),
      this.repositorioMetricas.contarPedidos(),
      this.repositorioMetricas.obtenerTotalVentas(),
      this.repositorioMetricas.contarProductosActivos(),
      this.repositorioMetricas.contarProductosInactivos(),
      this.repositorioMetricas.contarPedidosPendientes(),
      this.repositorioMetricas.contarPedidosCompletados(),
      this.repositorioMetricas.contarPedidosCancelados(),
    ]);

    // Calcular tasa de conversión
    const tasaConversion = totalClientes > 0 ? (totalPedidos / totalClientes) * 100 : 0;

    // Obtener métricas de sistema
    const tiempoRespuestaPromedio = await this.repositorioMetricas.obtenerTiempoRespuestaPromedio();
    const usoMemoria = process.memoryUsage().heapUsed / 1024 / 1024; // MB
    const usoCPU = await this.repositorioMetricas.obtenerUsoCPU();

    return {
      totalProductos,
      totalClientes,
      totalPedidos,
      totalVentas,
      productosActivos,
      productosInactivos,
      pedidosPendientes,
      pedidosCompletados,
      pedidosCancelados,
      tasaConversion,
      tiempoRespuestaPromedio,
      usoMemoria,
      usoCPU,
      timestamp: new Date(),
    };
  }

  async obtenerMetricasRendimiento(
    desde?: Date,
    hasta?: Date,
  ): Promise<MetricasRendimiento> {
    const periodoTiempo = {
      desde: desde || new Date(Date.now() - 24 * 60 * 60 * 1000), // Últimas 24 horas por defecto
      hasta: hasta || new Date(),
    };

    const [
      tiempoRespuesta,
      throughput,
      recursos,
    ] = await Promise.all([
      this.repositorioMetricas.obtenerMetricasTiempoRespuesta(periodoTiempo),
      this.repositorioMetricas.obtenerMetricasThroughput(periodoTiempo),
      this.repositorioMetricas.obtenerMetricasRecursos(),
    ]);

    return {
      tiempoRespuesta,
      throughput,
      recursos,
      periodoTiempo,
    };
  }

  async obtenerEstadisticasUso(periodo: string = '7d'): Promise<EstadisticasUso> {
    const [
      endpointsMasUsados,
      clientesActivos,
      nuevasRegistraciones,
    ] = await Promise.all([
      this.repositorioMetricas.obtenerEndpointsMasUsados(periodo),
      this.repositorioMetricas.contarClientesActivos(periodo),
      this.repositorioMetricas.contarNuevasRegistraciones(periodo),
    ]);

    return {
      endpointsMasUsados,
      clientesActivos,
      nuevasRegistraciones,
      periodoTiempo: periodo,
    };
  }

  async registrarMetricaRequest(
    endpoint: string,
    metodo: string,
    tiempoRespuesta: number,
    codigoEstado: number,
  ): Promise<void> {
    await this.repositorioMetricas.registrarRequest({
      endpoint,
      metodo,
      tiempoRespuesta,
      codigoEstado,
      timestamp: new Date(),
    });
  }
}