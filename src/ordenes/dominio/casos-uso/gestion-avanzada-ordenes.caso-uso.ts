import { Inject, Injectable } from '@nestjs/common';
import { Orden, DatosClienteSnapshot, DatosEnvioSnapshot, DatosFacturacionSnapshot } from '../entidades/orden.entity';
import { EstadoOrden, EstadoPago, MetodoPago } from '../enums/estado-orden.enum';
import type { RepositorioOrden } from '../interfaces/repositorio-orden.interface';
import type { RepositorioCliente } from '../../../clientes/dominio/interfaces/repositorio-cliente.interface';
import { ExcepcionDominio } from '../../../comun/excepciones/excepcion-dominio';

/**
 * DTO para exportar órdenes a CSV
 */
export interface ExportarOrdenesCsvDto {
  fechaDesde?: Date;
  fechaHasta?: Date;
  estado?: EstadoOrden;
  estadoPago?: EstadoPago;
  incluirAbandonadas?: boolean;
  soloBorradores?: boolean;
  soloArchivadas?: boolean;
}

/**
 * DTO para actualizar datos del cliente en una orden
 */
export interface ActualizarDatosClienteDto {
  email: string;
  nombreCompleto: string;
  telefono?: string;
}

/**
 * DTO para actualizar datos de envío en una orden
 */
export interface ActualizarDatosEnvioDto {
  direccion: string;
  ciudad: string;
  provincia: string;
  codigoPostal: string;
  pais: string;
}

/**
 * DTO para actualizar datos de facturación en una orden
 */
export interface ActualizarDatosFacturacionDto {
  direccion: string;
  ciudad: string;
  provincia: string;
  codigoPostal: string;
  pais: string;
  ruc?: string;
  razonSocial?: string;
}

/**
 * Resultado de exportación CSV
 */
export interface ResultadoExportacionCsv {
  contenido: string;
  nombreArchivo: string;
  cantidadRegistros: number;
}

/**
 * Caso de uso para gestión avanzada de órdenes (Shopify-like)
 * Incluye todas las funcionalidades avanzadas solicitadas
 */
@Injectable()
export class GestionAvanzadaOrdenesCasoUso {
  constructor(
    @Inject('RepositorioOrden')
    private readonly repositorioOrden: RepositorioOrden,
    @Inject('RepositorioCliente')
    private readonly repositorioCliente: RepositorioCliente,
  ) {}

  /**
   * Lista órdenes abandonadas con filtros por fecha
   */
  async listarAbandonadas(
    fechaDesde?: Date,
    fechaHasta?: Date,
    pagina: number = 1,
    limite: number = 20,
  ) {
    this.validarPaginacion(pagina, limite);

    const { ordenes, total } = await this.repositorioOrden.listarAbandonadas(
      fechaDesde,
      fechaHasta,
      pagina,
      limite,
    );

    const totalPaginas = Math.ceil(total / limite);
    const tieneSiguiente = pagina < totalPaginas;
    const tieneAnterior = pagina > 1;

    return {
      ordenes,
      paginacion: {
        totalElementos: total,
        totalPaginas,
        paginaActual: pagina,
        limite,
        tieneSiguiente,
        tieneAnterior,
      },
    };
  }

  /**
   * Lista borradores de órdenes
   */
  async listarBorradores(pagina: number = 1, limite: number = 20) {
    this.validarPaginacion(pagina, limite);

    const { ordenes, total } = await this.repositorioOrden.listarBorradores(
      pagina,
      limite,
    );

    const totalPaginas = Math.ceil(total / limite);
    const tieneSiguiente = pagina < totalPaginas;
    const tieneAnterior = pagina > 1;

    return {
      ordenes,
      paginacion: {
        totalElementos: total,
        totalPaginas,
        paginaActual: pagina,
        limite,
        tieneSiguiente,
        tieneAnterior,
      },
    };
  }

  /**
   * Lista órdenes archivadas
   */
  async listarArchivadas(pagina: number = 1, limite: number = 20) {
    this.validarPaginacion(pagina, limite);

    const { ordenes, total } = await this.repositorioOrden.listarArchivadas(
      pagina,
      limite,
    );

    const totalPaginas = Math.ceil(total / limite);
    const tieneSiguiente = pagina < totalPaginas;
    const tieneAnterior = pagina > 1;

    return {
      ordenes,
      paginacion: {
        totalElementos: total,
        totalPaginas,
        paginaActual: pagina,
        limite,
        tieneSiguiente,
        tieneAnterior,
      },
    };
  }

  /**
   * Duplica una orden existente
   */
  async duplicarOrden(ordenId: string, creadorId: string): Promise<Orden> {
    const ordenOriginal = await this.repositorioOrden.buscarPorId(ordenId);
    
    if (!ordenOriginal) {
      throw ExcepcionDominio.Respuesta404(
        'Orden no encontrada',
        'Orden.NoEncontrada'
      );
    }

    if (!ordenOriginal.puedeDuplicar()) {
      throw ExcepcionDominio.Respuesta400(
        'Esta orden no puede ser duplicada',
        'Orden.NoPuedeDuplicar'
      );
    }

    return await this.repositorioOrden.duplicarOrden(ordenId, creadorId);
  }

  /**
   * Crea una reposición de una orden
   */
  async crearReposicion(ordenId: string, creadorId: string): Promise<Orden> {
    const ordenOriginal = await this.repositorioOrden.buscarPorId(ordenId);
    
    if (!ordenOriginal) {
      throw ExcepcionDominio.Respuesta404(
        'Orden no encontrada',
        'Orden.NoEncontrada'
      );
    }

    if (!ordenOriginal.puedeReemplazar()) {
      throw ExcepcionDominio.Respuesta400(
        'Esta orden no puede ser reemplazada',
        'Orden.NoPuedeReemplazar'
      );
    }

    return await this.repositorioOrden.crearReposicion(ordenId, creadorId);
  }

  /**
   * Marca una orden como pagada
   */
  async marcarComoPagada(ordenId: string): Promise<Orden> {
    const orden = await this.repositorioOrden.buscarPorId(ordenId);
    
    if (!orden) {
      throw ExcepcionDominio.Respuesta404(
        'Orden no encontrada',
        'Orden.NoEncontrada'
      );
    }

    if (orden.estadoPago === EstadoPago.PAGADO) {
      throw ExcepcionDominio.Respuesta400(
        'La orden ya está marcada como pagada',
        'Orden.YaPagada'
      );
    }

    const ordenActualizada = orden.marcarComoPagada(new Date());
    return await this.repositorioOrden.actualizar(ordenActualizada);
  }

  /**
   * Archiva una orden
   */
  async archivarOrden(ordenId: string): Promise<Orden> {
    const orden = await this.repositorioOrden.buscarPorId(ordenId);
    
    if (!orden) {
      throw ExcepcionDominio.Respuesta404(
        'Orden no encontrada',
        'Orden.NoEncontrada'
      );
    }

    if (orden.estaArchivada()) {
      throw ExcepcionDominio.Respuesta400(
        'La orden ya está archivada',
        'Orden.YaArchivada'
      );
    }

    const ordenActualizada = orden.archivar();
    return await this.repositorioOrden.actualizar(ordenActualizada);
  }

  /**
   * Desarchiva una orden
   */
  async desarchivarOrden(ordenId: string): Promise<Orden> {
    const orden = await this.repositorioOrden.buscarPorId(ordenId);
    
    if (!orden) {
      throw ExcepcionDominio.Respuesta404(
        'Orden no encontrada',
        'Orden.NoEncontrada'
      );
    }

    if (!orden.estaArchivada()) {
      throw ExcepcionDominio.Respuesta400(
        'La orden no está archivada',
        'Orden.NoArchivada'
      );
    }

    const ordenActualizada = orden.desarchivar();
    return await this.repositorioOrden.actualizar(ordenActualizada);
  }

  /**
   * Cancela una orden con motivo
   */
  async cancelarOrden(ordenId: string, motivo: string): Promise<Orden> {
    const orden = await this.repositorioOrden.buscarPorId(ordenId);
    
    if (!orden) {
      throw ExcepcionDominio.Respuesta404(
        'Orden no encontrada',
        'Orden.NoEncontrada'
      );
    }

    if (!orden.puedeCancelar()) {
      throw ExcepcionDominio.Respuesta400(
        'Esta orden no puede ser cancelada',
        'Orden.NoPuedeCancelar'
      );
    }

    if (!motivo || motivo.trim().length === 0) {
      throw ExcepcionDominio.Respuesta400(
        'El motivo de cancelación es requerido',
        'Orden.MotivoCancelacionRequerido'
      );
    }

    const ordenActualizada = orden.cancelar(motivo.trim());
    return await this.repositorioOrden.actualizar(ordenActualizada);
  }

  /**
   * Agrega notas internas a una orden
   */
  async agregarNotasInternas(ordenId: string, notas: string): Promise<Orden> {
    const orden = await this.repositorioOrden.buscarPorId(ordenId);
    
    if (!orden) {
      throw ExcepcionDominio.Respuesta404(
        'Orden no encontrada',
        'Orden.NoEncontrada'
      );
    }

    if (!notas || notas.trim().length === 0) {
      throw ExcepcionDominio.Respuesta400(
        'Las notas internas son requeridas',
        'Orden.NotasInternasRequeridas'
      );
    }

    const ordenActualizada = orden.agregarNotasInternas(notas.trim());
    return await this.repositorioOrden.actualizar(ordenActualizada);
  }

  /**
   * Actualiza los datos del cliente en una orden
   */
  async actualizarDatosCliente(
    ordenId: string,
    datosCliente: ActualizarDatosClienteDto,
  ): Promise<Orden> {
    const orden = await this.repositorioOrden.buscarPorId(ordenId);
    
    if (!orden) {
      throw ExcepcionDominio.Respuesta404(
        'Orden no encontrada',
        'Orden.NoEncontrada'
      );
    }

    // Validar datos del cliente
    if (!datosCliente.email || !datosCliente.nombreCompleto) {
      throw ExcepcionDominio.Respuesta400(
        'Email y nombre completo son requeridos',
        'Orden.DatosClienteRequeridos'
      );
    }

    const datosClienteSnapshot: DatosClienteSnapshot = {
      id: orden.clienteId,
      email: datosCliente.email,
      nombreCompleto: datosCliente.nombreCompleto,
      telefono: datosCliente.telefono,
    };

    const ordenActualizada = new Orden(
      orden.id,
      orden.numeroOrden,
      orden.clienteId,
      orden.estado,
      orden.subtotal,
      orden.impuestos,
      orden.total,
      orden.metodoPago,
      orden.estadoPago,
      orden.metodoEnvio,
      orden.costoEnvio,
      orden.direccionEnvioId,
      orden.notas,
      orden.notasInternas,
      orden.fechaCreacion,
      new Date(),
      orden.fechaPago,
      orden.fechaEnvio,
      orden.fechaEntrega,
      orden.fechaAbandono,
      orden.esBorrador,
      orden.archivada,
      orden.motivoCancelacion,
      datosClienteSnapshot,
      orden.datosEnvio,
      orden.datosFacturacion,
      orden.creadorId,
      orden.ordenOriginalId,
    );

    return await this.repositorioOrden.actualizar(ordenActualizada);
  }

  /**
   * Actualiza los datos de envío en una orden
   */
  async actualizarDatosEnvio(
    ordenId: string,
    datosEnvio: ActualizarDatosEnvioDto,
  ): Promise<Orden> {
    const orden = await this.repositorioOrden.buscarPorId(ordenId);
    
    if (!orden) {
      throw ExcepcionDominio.Respuesta404(
        'Orden no encontrada',
        'Orden.NoEncontrada'
      );
    }

    // Validar datos de envío
    if (!datosEnvio.direccion || !datosEnvio.ciudad || !datosEnvio.provincia || !datosEnvio.codigoPostal || !datosEnvio.pais) {
      throw ExcepcionDominio.Respuesta400(
        'Todos los campos de envío son requeridos',
        'Orden.DatosEnvioRequeridos'
      );
    }

    const datosEnvioSnapshot: DatosEnvioSnapshot = {
      direccion: datosEnvio.direccion,
      ciudad: datosEnvio.ciudad,
      provincia: datosEnvio.provincia,
      codigoPostal: datosEnvio.codigoPostal,
      pais: datosEnvio.pais,
    };

    const ordenActualizada = new Orden(
      orden.id,
      orden.numeroOrden,
      orden.clienteId,
      orden.estado,
      orden.subtotal,
      orden.impuestos,
      orden.total,
      orden.metodoPago,
      orden.estadoPago,
      orden.metodoEnvio,
      orden.costoEnvio,
      orden.direccionEnvioId,
      orden.notas,
      orden.notasInternas,
      orden.fechaCreacion,
      new Date(),
      orden.fechaPago,
      orden.fechaEnvio,
      orden.fechaEntrega,
      orden.fechaAbandono,
      orden.esBorrador,
      orden.archivada,
      orden.motivoCancelacion,
      orden.datosCliente,
      datosEnvioSnapshot,
      orden.datosFacturacion,
      orden.creadorId,
      orden.ordenOriginalId,
    );

    return await this.repositorioOrden.actualizar(ordenActualizada);
  }

  /**
   * Actualiza los datos de facturación en una orden
   */
  async actualizarDatosFacturacion(
    ordenId: string,
    datosFacturacion: ActualizarDatosFacturacionDto,
  ): Promise<Orden> {
    const orden = await this.repositorioOrden.buscarPorId(ordenId);
    
    if (!orden) {
      throw ExcepcionDominio.Respuesta404(
        'Orden no encontrada',
        'Orden.NoEncontrada'
      );
    }

    // Validar datos de facturación
    if (!datosFacturacion.direccion || !datosFacturacion.ciudad || !datosFacturacion.provincia || !datosFacturacion.codigoPostal || !datosFacturacion.pais) {
      throw ExcepcionDominio.Respuesta400(
        'Todos los campos de facturación son requeridos',
        'Orden.DatosFacturacionRequeridos'
      );
    }

    const datosFacturacionSnapshot: DatosFacturacionSnapshot = {
      direccion: datosFacturacion.direccion,
      ciudad: datosFacturacion.ciudad,
      provincia: datosFacturacion.provincia,
      codigoPostal: datosFacturacion.codigoPostal,
      pais: datosFacturacion.pais,
      ruc: datosFacturacion.ruc,
      razonSocial: datosFacturacion.razonSocial,
    };

    const ordenActualizada = new Orden(
      orden.id,
      orden.numeroOrden,
      orden.clienteId,
      orden.estado,
      orden.subtotal,
      orden.impuestos,
      orden.total,
      orden.metodoPago,
      orden.estadoPago,
      orden.metodoEnvio,
      orden.costoEnvio,
      orden.direccionEnvioId,
      orden.notas,
      orden.notasInternas,
      orden.fechaCreacion,
      new Date(),
      orden.fechaPago,
      orden.fechaEnvio,
      orden.fechaEntrega,
      orden.fechaAbandono,
      orden.esBorrador,
      orden.archivada,
      orden.motivoCancelacion,
      orden.datosCliente,
      orden.datosEnvio,
      datosFacturacionSnapshot,
      orden.creadorId,
      orden.ordenOriginalId,
    );

    return await this.repositorioOrden.actualizar(ordenActualizada);
  }

  /**
   * Exporta órdenes a CSV
   */
  async exportarOrdenesCsv(datos: ExportarOrdenesCsvDto): Promise<ResultadoExportacionCsv> {
    // Construir filtros para la consulta
    const filtros = {
      estado: datos.estado,
      estadoPago: datos.estadoPago,
      fechaDesde: datos.fechaDesde,
      fechaHasta: datos.fechaHasta,
      soloBorradores: datos.soloBorradores,
      soloArchivadas: datos.soloArchivadas,
      incluirAbandonadas: datos.incluirAbandonadas,
    };

    // Obtener todas las órdenes (sin paginación para exportación completa)
    const { ordenes } = await this.repositorioOrden.listar(1, 10000, filtros);

    // Generar contenido CSV
    const cabeceras = [
      'Número Orden',
      'Cliente',
      'Email Cliente',
      'Estado',
      'Estado Pago',
      'Subtotal',
      'Impuestos',
      'Costo Envío',
      'Total',
      'Fecha Creación',
      'Fecha Pago',
      'Método Pago',
      'Método Envío',
      'Notas',
      'Dirección Envío',
      'Ciudad',
      'Provincia',
      'Código Postal',
      'País',
    ];

    const lineas = ordenes.map(orden => [
      orden.numeroOrden,
      orden.datosCliente?.nombreCompleto || 'N/A',
      orden.datosCliente?.email || 'N/A',
      orden.estado,
      orden.estadoPago,
      orden.subtotal.toFixed(2),
      orden.impuestos.toFixed(2),
      orden.costoEnvio.toFixed(2),
      orden.total.toFixed(2),
      orden.fechaCreacion.toISOString().split('T')[0],
      orden.fechaPago ? orden.fechaPago.toISOString().split('T')[0] : 'N/A',
      orden.metodoPago || 'N/A',
      orden.metodoEnvio || 'N/A',
      orden.notas || 'N/A',
      orden.datosEnvio?.direccion || 'N/A',
      orden.datosEnvio?.ciudad || 'N/A',
      orden.datosEnvio?.provincia || 'N/A',
      orden.datosEnvio?.codigoPostal || 'N/A',
      orden.datosEnvio?.pais || 'N/A',
    ]);

    // Generar contenido CSV
    const contenidoCsv = [
      cabeceras.join(','),
      ...lineas.map(linea => linea.map(campo => `"${campo}"`).join(','))
    ].join('\n');

    // Generar nombre de archivo
    const fechaActual = new Date().toISOString().split('T')[0];
    const nombreArchivo = `ordenes_exportadas_${fechaActual}.csv`;

    return {
      contenido: contenidoCsv,
      nombreArchivo,
      cantidadRegistros: ordenes.length,
    };
  }

  /**
   * Valida parámetros de paginación
   */
  private validarPaginacion(pagina: number, limite: number): void {
    if (pagina < 1) {
      throw ExcepcionDominio.Respuesta400(
        'La página debe ser mayor o igual a 1',
        'Orden.PaginaInvalida'
      );
    }

    if (limite < 1 || limite > 100) {
      throw ExcepcionDominio.Respuesta400(
        'El límite debe estar entre 1 y 100',
        'Orden.LimiteInvalido'
      );
    }
  }
}