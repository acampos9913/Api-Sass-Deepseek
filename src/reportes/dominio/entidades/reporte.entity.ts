/**
 * Entidad de Dominio para Reportes y Analíticas
 * Contiene la lógica de negocio para la generación y validación de reportes
 * Sigue los principios de la Arquitectura Limpia
 */
export class Reporte {
  constructor(
    private readonly id: string,
    private readonly tipo: TipoReporte,
    private readonly datos: DatosReporte,
    private readonly parametros: ParametrosReporte,
    private readonly fechaGeneracion: Date,
    private readonly fechaInicio: Date,
    private readonly fechaFin: Date,
    private readonly estado: EstadoReporte,
  ) {}

  /**
   * Valida que el reporte sea válido para su generación
   */
  validar(): void {
    if (!this.id) {
      throw new Error('El ID del reporte es requerido');
    }

    if (!this.tipo) {
      throw new Error('El tipo de reporte es requerido');
    }

    if (!this.fechaInicio || !this.fechaFin) {
      throw new Error('Las fechas de inicio y fin son requeridas');
    }

    if (this.fechaInicio > this.fechaFin) {
      throw new Error('La fecha de inicio no puede ser mayor a la fecha de fin');
    }

    // Validar que el rango de fechas no sea mayor a 1 año
    const unAnioEnMs = 365 * 24 * 60 * 60 * 1000;
    if (this.fechaFin.getTime() - this.fechaInicio.getTime() > unAnioEnMs) {
      throw new Error('El rango de fechas no puede ser mayor a 1 año');
    }

    this.validarParametrosEspecificos();
  }

  /**
   * Valida parámetros específicos según el tipo de reporte
   */
  private validarParametrosEspecificos(): void {
    switch (this.tipo) {
      case TipoReporte.VENTAS_POR_PERIODO:
        this.validarParametrosVentasPorPeriodo();
        break;
      case TipoReporte.PRODUCTOS_MAS_VENDIDOS:
        this.validarParametrosProductosMasVendidos();
        break;
      case TipoReporte.CLIENTES_MAS_ACTIVOS:
        this.validarParametrosClientesMasActivos();
        break;
      case TipoReporte.DESCUENTOS_UTILIZADOS:
        this.validarParametrosDescuentosUtilizados();
        break;
      case TipoReporte.INVENTARIO_NIVELES:
        this.validarParametrosInventarioNiveles();
        break;
      default:
        throw new Error(`Tipo de reporte no válido: ${this.tipo}`);
    }
  }

  private validarParametrosVentasPorPeriodo(): void {
    if (!this.parametros.granularidad) {
      throw new Error('La granularidad es requerida para reportes de ventas por período');
    }

    if (!Object.values(GranularidadTiempo).includes(this.parametros.granularidad)) {
      throw new Error('Granularidad de tiempo no válida');
    }
  }

  private validarParametrosProductosMasVendidos(): void {
    if (this.parametros.limite && (this.parametros.limite < 1 || this.parametros.limite > 100)) {
      throw new Error('El límite debe estar entre 1 y 100');
    }
  }

  private validarParametrosClientesMasActivos(): void {
    if (this.parametros.limite && (this.parametros.limite < 1 || this.parametros.limite > 100)) {
      throw new Error('El límite debe estar entre 1 y 100');
    }
  }

  private validarParametrosDescuentosUtilizados(): void {
    // No hay parámetros específicos requeridos para este tipo de reporte
  }

  private validarParametrosInventarioNiveles(): void {
    if (this.parametros.nivelAlerta && (this.parametros.nivelAlerta < 0 || this.parametros.nivelAlerta > 100)) {
      throw new Error('El nivel de alerta debe estar entre 0 y 100');
    }
  }

  /**
   * Calcula métricas adicionales basadas en los datos del reporte
   */
  calcularMetricas(): MetricasReporte {
    switch (this.tipo) {
      case TipoReporte.VENTAS_POR_PERIODO:
        return this.calcularMetricasVentas();
      case TipoReporte.PRODUCTOS_MAS_VENDIDOS:
        return this.calcularMetricasProductos();
      case TipoReporte.CLIENTES_MAS_ACTIVOS:
        return this.calcularMetricasClientes();
      case TipoReporte.DESCUENTOS_UTILIZADOS:
        return this.calcularMetricasDescuentos();
      case TipoReporte.INVENTARIO_NIVELES:
        return this.calcularMetricasInventario();
      default:
        return {};
    }
  }

  private calcularMetricasVentas(): MetricasReporte {
    const datosVentas = this.datos as DatosVentasPorPeriodo;
    
    const totalVentas = datosVentas.ventas.reduce((total, venta) => total + venta.total, 0);
    const totalOrdenes = datosVentas.ventas.length;
    const promedioVenta = totalOrdenes > 0 ? totalVentas / totalOrdenes : 0;

    return {
      totalVentas,
      totalOrdenes,
      promedioVenta,
      crecimiento: this.calcularCrecimientoVentas(datosVentas),
    };
  }

  private calcularMetricasProductos(): MetricasReporte {
    const datosProductos = this.datos as DatosProductosMasVendidos;
    
    const totalUnidades = datosProductos.productos.reduce((total, producto) => total + producto.cantidadVendida, 0);
    const totalIngresos = datosProductos.productos.reduce((total, producto) => total + producto.ingresos, 0);

    return {
      totalUnidades,
      totalIngresos,
      productoMasVendido: datosProductos.productos[0]?.nombre || 'N/A',
    };
  }

  private calcularMetricasClientes(): MetricasReporte {
    const datosClientes = this.datos as DatosClientesMasActivos;
    
    const totalClientes = datosClientes.clientes.length;
    const promedioCompras = totalClientes > 0 
      ? datosClientes.clientes.reduce((total, cliente) => total + cliente.totalCompras, 0) / totalClientes 
      : 0;

    return {
      totalClientes,
      promedioCompras,
      clienteMasValioso: datosClientes.clientes[0]?.nombre || 'N/A',
    };
  }

  private calcularMetricasDescuentos(): MetricasReporte {
    const datosDescuentos = this.datos as DatosDescuentosUtilizados;
    
    const totalDescuentos = datosDescuentos.descuentos.length;
    const totalAhorro = datosDescuentos.descuentos.reduce((total, descuento) => total + descuento.totalAhorro, 0);

    return {
      totalDescuentos,
      totalAhorro,
      descuentoMasUtilizado: datosDescuentos.descuentos[0]?.codigo || 'N/A',
    };
  }

  private calcularMetricasInventario(): MetricasReporte {
    const datosInventario = this.datos as DatosInventarioNiveles;
    
    const totalProductos = datosInventario.productos.length;
    const productosBajoStock = datosInventario.productos.filter(p => p.nivelAlerta).length;
    const porcentajeBajoStock = totalProductos > 0 ? (productosBajoStock / totalProductos) * 100 : 0;

    return {
      totalProductos,
      productosBajoStock,
      porcentajeBajoStock,
    };
  }

  private calcularCrecimientoVentas(datosVentas: DatosVentasPorPeriodo): number {
    if (datosVentas.ventas.length < 2) return 0;

    const ventasOrdenadas = [...datosVentas.ventas].sort((a, b) => 
      new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
    );

    const primeraVenta = ventasOrdenadas[0].total;
    const ultimaVenta = ventasOrdenadas[ventasOrdenadas.length - 1].total;

    if (primeraVenta === 0) return 0;
    
    return ((ultimaVenta - primeraVenta) / primeraVenta) * 100;
  }

  // Getters
  getId(): string { return this.id; }
  getTipo(): TipoReporte { return this.tipo; }
  getDatos(): DatosReporte { return this.datos; }
  getParametros(): ParametrosReporte { return this.parametros; }
  getFechaGeneracion(): Date { return this.fechaGeneracion; }
  getFechaInicio(): Date { return this.fechaInicio; }
  getFechaFin(): Date { return this.fechaFin; }
  getEstado(): EstadoReporte { return this.estado; }
}

/**
 * Enumeración de tipos de reporte disponibles
 */
export enum TipoReporte {
  VENTAS_POR_PERIODO = 'VENTAS_POR_PERIODO',
  PRODUCTOS_MAS_VENDIDOS = 'PRODUCTOS_MAS_VENDIDOS',
  CLIENTES_MAS_ACTIVOS = 'CLIENTES_MAS_ACTIVOS',
  DESCUENTOS_UTILIZADOS = 'DESCUENTOS_UTILIZADOS',
  INVENTARIO_NIVELES = 'INVENTARIO_NIVELES',
}

/**
 * Enumeración de estados del reporte
 */
export enum EstadoReporte {
  PENDIENTE = 'PENDIENTE',
  PROCESANDO = 'PROCESANDO',
  COMPLETADO = 'COMPLETADO',
  ERROR = 'ERROR',
}

/**
 * Enumeración de granularidad de tiempo para reportes
 */
export enum GranularidadTiempo {
  DIARIO = 'DIARIO',
  SEMANAL = 'SEMANAL',
  MENSUAL = 'MENSUAL',
  TRIMESTRAL = 'TRIMESTRAL',
  ANUAL = 'ANUAL',
}

/**
 * Interfaz para parámetros de reporte
 */
export interface ParametrosReporte {
  granularidad?: GranularidadTiempo;
  limite?: number;
  nivelAlerta?: number;
  categoriaId?: string;
  vendedorId?: string;
  [key: string]: any;
}

/**
 * Interfaz para métricas del reporte
 */
export interface MetricasReporte {
  [key: string]: number | string;
}

/**
 * Interfaces específicas para cada tipo de dato de reporte
 */
export interface DatosVentasPorPeriodo {
  ventas: Array<{
    fecha: string;
    total: number;
    cantidadOrdenes: number;
    promedioOrden: number;
  }>;
}

export interface DatosProductosMasVendidos {
  productos: Array<{
    id: string;
    nombre: string;
    cantidadVendida: number;
    ingresos: number;
    precioPromedio: number;
  }>;
}

export interface DatosClientesMasActivos {
  clientes: Array<{
    id: string;
    nombre: string;
    email: string;
    totalCompras: number;
    valorTotal: number;
    ultimaCompra: Date;
  }>;
}

export interface DatosDescuentosUtilizados {
  descuentos: Array<{
    id: string;
    codigo: string;
    tipo: string;
    usos: number;
    totalAhorro: number;
    tasaConversion: number;
  }>;
}

export interface DatosInventarioNiveles {
  productos: Array<{
    id: string;
    nombre: string;
    stockActual: number;
    stockMinimo: number;
    nivelAlerta: boolean;
    ultimaActualizacion: Date;
  }>;
}

/**
 * Tipo unión para todos los tipos de datos de reporte
 */
export type DatosReporte = 
  | DatosVentasPorPeriodo 
  | DatosProductosMasVendidos 
  | DatosClientesMasActivos 
  | DatosDescuentosUtilizados 
  | DatosInventarioNiveles;