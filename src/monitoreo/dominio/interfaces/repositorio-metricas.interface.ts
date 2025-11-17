export interface RequestMetrica {
  endpoint: string;
  metodo: string;
  tiempoRespuesta: number;
  codigoEstado: number;
  timestamp: Date;
}

export interface MetricasTiempoRespuesta {
  promedio: number;
  p95: number;
  p99: number;
  maximo: number;
}

export interface MetricasThroughput {
  requestsPorSegundo: number;
  erroresPorSegundo: number;
  tasaExito: number;
}

export interface MetricasRecursos {
  usoMemoria: number;
  usoCPU: number;
  conexionesActivas: number;
}

export interface PeriodoTiempo {
  desde: Date;
  hasta: Date;
}

export interface EndpointUso {
  endpoint: string;
  cantidadRequests: number;
  tasaExito: number;
}

export interface RepositorioMetricas {
  // Métodos para contar entidades
  contarProductos(): Promise<number>;
  contarClientes(): Promise<number>;
  contarPedidos(): Promise<number>;
  obtenerTotalVentas(): Promise<number>;
  contarProductosActivos(): Promise<number>;
  contarProductosInactivos(): Promise<number>;
  contarPedidosPendientes(): Promise<number>;
  contarPedidosCompletados(): Promise<number>;
  contarPedidosCancelados(): Promise<number>;

  // Métodos para métricas de rendimiento
  obtenerTiempoRespuestaPromedio(): Promise<number>;
  obtenerUsoCPU(): Promise<number>;
  obtenerMetricasTiempoRespuesta(periodo: PeriodoTiempo): Promise<MetricasTiempoRespuesta>;
  obtenerMetricasThroughput(periodo: PeriodoTiempo): Promise<MetricasThroughput>;
  obtenerMetricasRecursos(): Promise<MetricasRecursos>;

  // Métodos para estadísticas de uso
  obtenerEndpointsMasUsados(periodo: string): Promise<EndpointUso[]>;
  contarClientesActivos(periodo: string): Promise<number>;
  contarNuevasRegistraciones(periodo: string): Promise<number>;

  // Métodos para registrar métricas
  registrarRequest(metrica: RequestMetrica): Promise<void>;
}