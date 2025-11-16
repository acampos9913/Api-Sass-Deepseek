import { Injectable, Inject } from '@nestjs/common';
import { Reporte, TipoReporte, EstadoReporte, ParametrosReporte, DatosReporte } from '../entidades/reporte.entity';
import type { RepositorioReporte } from '../interfaces/repositorio-reporte.interface';
import type { RepositorioOrden } from '../../../ordenes/dominio/interfaces/repositorio-orden.interface';
import type { RepositorioProducto } from '../../../productos/dominio/interfaces/repositorio-producto.interface';
import type { RepositorioCliente } from '../../../clientes/dominio/interfaces/repositorio-cliente.interface';
import type { RepositorioDescuento } from '../../../descuentos/dominio/interfaces/repositorio-descuento.interface';

/**
 * Parámetros para generar un reporte
 */
export interface ParametrosGenerarReporte {
  tipo: TipoReporte;
  fechaInicio: Date;
  fechaFin: Date;
  parametros: ParametrosReporte;
}

/**
 * Caso de uso para generar reportes y analíticas
 * Sigue los principios de la arquitectura limpia
 */
@Injectable()
export class GenerarReporteCasoUso {
  constructor(
    @Inject('RepositorioReporte')
    private readonly repositorioReporte: RepositorioReporte,
    @Inject('RepositorioOrden')
    private readonly repositorioOrden: RepositorioOrden,
    @Inject('RepositorioProducto')
    private readonly repositorioProducto: RepositorioProducto,
    @Inject('RepositorioCliente')
    private readonly repositorioCliente: RepositorioCliente,
    @Inject('RepositorioDescuento')
    private readonly repositorioDescuento: RepositorioDescuento,
  ) {}

  /**
   * Ejecuta el caso de uso para generar un reporte
   * @param parametros Parámetros para generar el reporte
   * @returns El reporte generado
   */
  async ejecutar(parametros: ParametrosGenerarReporte): Promise<Reporte> {
    // Validar parámetros básicos
    this.validarParametrosBasicos(parametros);

    // Generar ID único para el reporte
    const id = this.generarIdUnico();

    // Crear reporte con estado pendiente
    const reporte = new Reporte(
      id,
      parametros.tipo,
      {} as DatosReporte, // Datos vacíos inicialmente
      parametros.parametros,
      new Date(),
      parametros.fechaInicio,
      parametros.fechaFin,
      EstadoReporte.PENDIENTE,
    );

    // Validar el reporte
    reporte.validar();

    // Guardar reporte en estado pendiente
    await this.repositorioReporte.crear({
      id: reporte.getId(),
      tipo: reporte.getTipo(),
      datos: reporte.getDatos(),
      parametros: reporte.getParametros(),
      fechaGeneracion: reporte.getFechaGeneracion(),
      fechaInicio: reporte.getFechaInicio(),
      fechaFin: reporte.getFechaFin(),
      estado: reporte.getEstado(),
    });

    try {
      // Generar datos del reporte según el tipo
      const datos = await this.generarDatosReporte(parametros);
      
      // Actualizar reporte con datos y estado completado
      const reporteCompletado = new Reporte(
        reporte.getId(),
        reporte.getTipo(),
        datos,
        reporte.getParametros(),
        reporte.getFechaGeneracion(),
        reporte.getFechaInicio(),
        reporte.getFechaFin(),
        EstadoReporte.COMPLETADO,
      );

      // Calcular métricas
      const metricas = reporteCompletado.calcularMetricas();

      // Actualizar reporte en el repositorio
      await this.repositorioReporte.actualizarEstado(
        reporteCompletado.getId(),
        reporteCompletado.getEstado(),
        reporteCompletado.getDatos(),
        metricas,
      );

      return reporteCompletado;
    } catch (error) {
      // Actualizar reporte con estado de error
      await this.repositorioReporte.actualizarEstado(
        reporte.getId(),
        EstadoReporte.ERROR,
      );

      throw new Error(`Error al generar reporte: ${error.message}`);
    }
  }

  /**
   * Valida los parámetros básicos para generar un reporte
   */
  private validarParametrosBasicos(parametros: ParametrosGenerarReporte): void {
    if (!parametros.tipo) {
      throw new Error('El tipo de reporte es requerido');
    }

    if (!parametros.fechaInicio || !parametros.fechaFin) {
      throw new Error('Las fechas de inicio y fin son requeridas');
    }

    if (parametros.fechaInicio > parametros.fechaFin) {
      throw new Error('La fecha de inicio no puede ser mayor a la fecha de fin');
    }

    // Validar que el rango de fechas no sea mayor a 1 año
    const unAnioEnMs = 365 * 24 * 60 * 60 * 1000;
    if (parametros.fechaFin.getTime() - parametros.fechaInicio.getTime() > unAnioEnMs) {
      throw new Error('El rango de fechas no puede ser mayor a 1 año');
    }
  }

  /**
   * Genera un ID único para el reporte
   */
  private generarIdUnico(): string {
    return `reporte_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Genera los datos del reporte según el tipo
   */
  private async generarDatosReporte(parametros: ParametrosGenerarReporte): Promise<DatosReporte> {
    switch (parametros.tipo) {
      case TipoReporte.VENTAS_POR_PERIODO:
        return await this.generarDatosVentasPorPeriodo(parametros);
      case TipoReporte.PRODUCTOS_MAS_VENDIDOS:
        return await this.generarDatosProductosMasVendidos(parametros);
      case TipoReporte.CLIENTES_MAS_ACTIVOS:
        return await this.generarDatosClientesMasActivos(parametros);
      case TipoReporte.DESCUENTOS_UTILIZADOS:
        return await this.generarDatosDescuentosUtilizados(parametros);
      case TipoReporte.INVENTARIO_NIVELES:
        return await this.generarDatosInventarioNiveles(parametros);
      default:
        throw new Error(`Tipo de reporte no soportado: ${parametros.tipo}`);
    }
  }

  /**
   * Genera datos para reporte de ventas por período
   */
  private async generarDatosVentasPorPeriodo(parametros: ParametrosGenerarReporte): Promise<any> {
    // Obtener órdenes del período
    // Nota: En una implementación real, esto consultaría la base de datos
    // Para este ejemplo, usamos datos de ejemplo
    const ordenesEjemplo = [
      {
        id: 'orden_1',
        total: 1500,
        fechaCreacion: new Date('2024-01-01'),
        estado: 'COMPLETADA',
      },
      {
        id: 'orden_2',
        total: 1800,
        fechaCreacion: new Date('2024-01-02'),
        estado: 'COMPLETADA',
      },
    ];

    // Agrupar por período según granularidad
    const ventasAgrupadas = this.agruparVentasPorPeriodo(
      ordenesEjemplo,
      parametros.parametros.granularidad
    );

    return {
      ventas: ventasAgrupadas,
    };
  }

  /**
   * Genera datos para reporte de productos más vendidos
   */
  private async generarDatosProductosMasVendidos(parametros: ParametrosGenerarReporte): Promise<any> {
    // En una implementación real, esto consultaría la base de datos
    // Para este ejemplo, retornamos datos de ejemplo
    return {
      productos: [
        {
          id: 'prod_1',
          nombre: 'Producto Ejemplo 1',
          cantidadVendida: 150,
          ingresos: 7500,
          precioPromedio: 50,
        },
        {
          id: 'prod_2',
          nombre: 'Producto Ejemplo 2',
          cantidadVendida: 120,
          ingresos: 6000,
          precioPromedio: 50,
        },
      ],
    };
  }

  /**
   * Genera datos para reporte de clientes más activos
   */
  private async generarDatosClientesMasActivos(parametros: ParametrosGenerarReporte): Promise<any> {
    // En una implementación real, esto consultaría la base de datos
    // Para este ejemplo, retornamos datos de ejemplo
    return {
      clientes: [
        {
          id: 'cliente_1',
          nombre: 'Juan Pérez',
          email: 'juan@example.com',
          totalCompras: 15,
          valorTotal: 2500,
          ultimaCompra: new Date(),
        },
        {
          id: 'cliente_2',
          nombre: 'María García',
          email: 'maria@example.com',
          totalCompras: 12,
          valorTotal: 1800,
          ultimaCompra: new Date(),
        },
      ],
    };
  }

  /**
   * Genera datos para reporte de descuentos utilizados
   */
  private async generarDatosDescuentosUtilizados(parametros: ParametrosGenerarReporte): Promise<any> {
    // En una implementación real, esto consultaría la base de datos
    // Para este ejemplo, retornamos datos de ejemplo
    return {
      descuentos: [
        {
          id: 'descuento_1',
          codigo: 'VERANO2024',
          tipo: 'PORCENTAJE',
          usos: 45,
          totalAhorro: 2250,
          tasaConversion: 0.15,
        },
        {
          id: 'descuento_2',
          codigo: 'PRIMAVERA24',
          tipo: 'MONTO_FIJO',
          usos: 30,
          totalAhorro: 1500,
          tasaConversion: 0.10,
        },
      ],
    };
  }

  /**
   * Genera datos para reporte de niveles de inventario
   */
  private async generarDatosInventarioNiveles(parametros: ParametrosGenerarReporte): Promise<any> {
    // En una implementación real, esto consultaría la base de datos
    // Para este ejemplo, retornamos datos de ejemplo
    return {
      productos: [
        {
          id: 'prod_1',
          nombre: 'Producto Ejemplo 1',
          stockActual: 15,
          stockMinimo: 10,
          nivelAlerta: false,
          ultimaActualizacion: new Date(),
        },
        {
          id: 'prod_2',
          nombre: 'Producto Ejemplo 2',
          stockActual: 5,
          stockMinimo: 10,
          nivelAlerta: true,
          ultimaActualizacion: new Date(),
        },
      ],
    };
  }

  /**
   * Agrupa ventas por período según la granularidad
   */
  private agruparVentasPorPeriodo(ordenes: any[], granularidad?: string): any[] {
    // En una implementación real, esto agruparía las órdenes por período
    // Para este ejemplo, retornamos datos de ejemplo
    return [
      {
        fecha: '2024-01-01',
        total: 1500,
        cantidadOrdenes: 15,
        promedioOrden: 100,
      },
      {
        fecha: '2024-01-02',
        total: 1800,
        cantidadOrdenes: 18,
        promedioOrden: 100,
      },
    ];
  }
}