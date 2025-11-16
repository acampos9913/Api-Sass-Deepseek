import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import type { RepositorioCliente } from '../../dominio/interfaces/repositorio-cliente.interface';
import { Cliente } from '../../dominio/entidades/cliente.entity';

/**
 * Implementación del repositorio de cliente usando Prisma
 * Adapta la interfaz de dominio a la implementación específica de Prisma
 */
@Injectable()
export class PrismaRepositorioCliente implements RepositorioCliente {
  constructor(private readonly prisma: PrismaClient) {}

  async crear(cliente: {
    id: string;
    email: string;
    nombreCompleto: string;
    telefono: string | null;
    activo: boolean;
    fechaCreacion: Date;
    fechaActualizacion: Date;
    creadorId: string;
    totalGastado: number;
    totalOrdenes: number;
    fechaUltimaOrden: Date | null;
    tags: string[];
    notas: string | null;
    aceptaMarketing: boolean;
    fuenteCliente: string;
  }): Promise<void> {
    await this.prisma.cliente.create({
      data: {
        id: cliente.id,
        email: cliente.email,
        nombre_completo: cliente.nombreCompleto,
        telefono: cliente.telefono,
        activo: cliente.activo,
        fecha_creacion: cliente.fechaCreacion,
        fecha_actualizacion: cliente.fechaActualizacion,
        creador_id: cliente.creadorId,
        total_gastado: cliente.totalGastado,
        total_ordenes: cliente.totalOrdenes,
        fecha_ultima_orden: cliente.fechaUltimaOrden,
        tags: cliente.tags,
        notas: cliente.notas,
        acepta_marketing: cliente.aceptaMarketing,
        fuente_cliente: cliente.fuenteCliente,
      },
    });
  }

  async buscarPorId(id: string): Promise<{
    id: string;
    email: string;
    nombreCompleto: string;
    telefono: string | null;
    activo: boolean;
    fechaCreacion: Date;
    fechaActualizacion: Date;
    creadorId: string;
    totalGastado: number;
    totalOrdenes: number;
    fechaUltimaOrden: Date | null;
    tags: string[];
    notas: string | null;
    aceptaMarketing: boolean;
    fuenteCliente: string;
  } | null> {
    const cliente = await this.prisma.cliente.findUnique({
      where: { id },
    });

    if (!cliente) {
      return null;
    }

    return {
      id: cliente.id,
      email: cliente.email,
      nombreCompleto: cliente.nombre_completo,
      telefono: cliente.telefono,
      activo: cliente.activo,
      fechaCreacion: cliente.fecha_creacion,
      fechaActualizacion: cliente.fecha_actualizacion,
      creadorId: cliente.creador_id,
      totalGastado: Number(cliente.total_gastado),
      totalOrdenes: cliente.total_ordenes,
      fechaUltimaOrden: cliente.fecha_ultima_orden,
      tags: cliente.tags,
      notas: cliente.notas,
      aceptaMarketing: cliente.acepta_marketing,
      fuenteCliente: cliente.fuente_cliente,
    };
  }

  async buscarPorEmail(email: string): Promise<{
    id: string;
    email: string;
    nombreCompleto: string;
    telefono: string | null;
    activo: boolean;
    fechaCreacion: Date;
    fechaActualizacion: Date;
    creadorId: string;
    totalGastado: number;
    totalOrdenes: number;
    fechaUltimaOrden: Date | null;
    tags: string[];
    notas: string | null;
    aceptaMarketing: boolean;
    fuenteCliente: string;
  } | null> {
    const cliente = await this.prisma.cliente.findUnique({
      where: { email },
    });

    if (!cliente) {
      return null;
    }

    return {
      id: cliente.id,
      email: cliente.email,
      nombreCompleto: cliente.nombre_completo,
      telefono: cliente.telefono,
      activo: cliente.activo,
      fechaCreacion: cliente.fecha_creacion,
      fechaActualizacion: cliente.fecha_actualizacion,
      creadorId: cliente.creador_id,
      totalGastado: Number(cliente.total_gastado),
      totalOrdenes: cliente.total_ordenes,
      fechaUltimaOrden: cliente.fecha_ultima_orden,
      tags: cliente.tags,
      notas: cliente.notas,
      aceptaMarketing: cliente.acepta_marketing,
      fuenteCliente: cliente.fuente_cliente,
    };
  }

  async listar(filtros: {
    pagina: number;
    limite: number;
    activo?: boolean;
    busqueda?: string;
    tags?: string[];
    fuenteCliente?: string;
    aceptaMarketing?: boolean;
    totalGastadoMinimo?: number;
    totalGastadoMaximo?: number;
    totalOrdenesMinimo?: number;
    totalOrdenesMaximo?: number;
    fechaCreacionDesde?: Date;
    fechaCreacionHasta?: Date;
    fechaUltimaOrdenDesde?: Date;
    fechaUltimaOrdenHasta?: Date;
    ordenarPor?: string;
    orden?: 'asc' | 'desc';
  }): Promise<{
    clientes: Array<{
      id: string;
      email: string;
      nombreCompleto: string;
      telefono: string | null;
      activo: boolean;
      fechaCreacion: Date;
      fechaActualizacion: Date;
      creadorId: string;
      totalGastado: number;
      totalOrdenes: number;
      fechaUltimaOrden: Date | null;
      tags: string[];
      notas: string | null;
      aceptaMarketing: boolean;
      fuenteCliente: string;
    }>;
    total: number;
  }> {
    const skip = (filtros.pagina - 1) * filtros.limite;

    // Construir condiciones where
    const where: any = {};

    if (filtros.activo !== undefined) {
      where.activo = filtros.activo;
    }

    if (filtros.busqueda) {
      where.OR = [
        { email: { contains: filtros.busqueda, mode: 'insensitive' } },
        { nombre_completo: { contains: filtros.busqueda, mode: 'insensitive' } },
        { telefono: { contains: filtros.busqueda, mode: 'insensitive' } },
      ];
    }

    if (filtros.tags && filtros.tags.length > 0) {
      where.tags = { hasSome: filtros.tags };
    }

    if (filtros.fuenteCliente) {
      where.fuente_cliente = filtros.fuenteCliente;
    }

    if (filtros.aceptaMarketing !== undefined) {
      where.acepta_marketing = filtros.aceptaMarketing;
    }

    if (filtros.totalGastadoMinimo !== undefined || filtros.totalGastadoMaximo !== undefined) {
      where.total_gastado = {};
      if (filtros.totalGastadoMinimo !== undefined) {
        where.total_gastado.gte = filtros.totalGastadoMinimo;
      }
      if (filtros.totalGastadoMaximo !== undefined) {
        where.total_gastado.lte = filtros.totalGastadoMaximo;
      }
    }

    if (filtros.totalOrdenesMinimo !== undefined || filtros.totalOrdenesMaximo !== undefined) {
      where.total_ordenes = {};
      if (filtros.totalOrdenesMinimo !== undefined) {
        where.total_ordenes.gte = filtros.totalOrdenesMinimo;
      }
      if (filtros.totalOrdenesMaximo !== undefined) {
        where.total_ordenes.lte = filtros.totalOrdenesMaximo;
      }
    }

    if (filtros.fechaCreacionDesde || filtros.fechaCreacionHasta) {
      where.fecha_creacion = {};
      if (filtros.fechaCreacionDesde) {
        where.fecha_creacion.gte = filtros.fechaCreacionDesde;
      }
      if (filtros.fechaCreacionHasta) {
        where.fecha_creacion.lte = filtros.fechaCreacionHasta;
      }
    }

    if (filtros.fechaUltimaOrdenDesde || filtros.fechaUltimaOrdenHasta) {
      where.fecha_ultima_orden = {};
      if (filtros.fechaUltimaOrdenDesde) {
        where.fecha_ultima_orden.gte = filtros.fechaUltimaOrdenDesde;
      }
      if (filtros.fechaUltimaOrdenHasta) {
        where.fecha_ultima_orden.lte = filtros.fechaUltimaOrdenHasta;
      }
    }

    // Configurar ordenamiento
    const orderBy: any = {};
    const campoOrden = filtros.ordenarPor || 'fecha_creacion';
    const direccionOrden = filtros.orden || 'desc';
    
    orderBy[campoOrden] = direccionOrden;

    const [clientes, total] = await Promise.all([
      this.prisma.cliente.findMany({
        where,
        skip,
        take: filtros.limite,
        orderBy,
      }),
      this.prisma.cliente.count({ where }),
    ]);

    return {
      clientes: clientes.map((cliente) => ({
        id: cliente.id,
        email: cliente.email,
        nombreCompleto: cliente.nombre_completo,
        telefono: cliente.telefono,
        activo: cliente.activo,
        fechaCreacion: cliente.fecha_creacion,
        fechaActualizacion: cliente.fecha_actualizacion,
        creadorId: cliente.creador_id,
        totalGastado: Number(cliente.total_gastado),
        totalOrdenes: cliente.total_ordenes,
        fechaUltimaOrden: cliente.fecha_ultima_orden,
        tags: cliente.tags,
        notas: cliente.notas,
        aceptaMarketing: cliente.acepta_marketing,
        fuenteCliente: cliente.fuente_cliente,
      })),
      total,
    };
  }

  async actualizar(
    id: string,
    datos: {
      nombreCompleto?: string;
      telefono?: string | null;
      activo?: boolean;
      fechaActualizacion: Date;
      totalGastado?: number;
      totalOrdenes?: number;
      fechaUltimaOrden?: Date | null;
      tags?: string[];
      notas?: string | null;
      aceptaMarketing?: boolean;
      fuenteCliente?: string;
    },
  ): Promise<void> {
    await this.prisma.cliente.update({
      where: { id },
      data: {
        ...(datos.nombreCompleto && { nombre_completo: datos.nombreCompleto }),
        ...(datos.telefono !== undefined && { telefono: datos.telefono }),
        ...(datos.activo !== undefined && { activo: datos.activo }),
        ...(datos.totalGastado !== undefined && { total_gastado: datos.totalGastado }),
        ...(datos.totalOrdenes !== undefined && { total_ordenes: datos.totalOrdenes }),
        ...(datos.fechaUltimaOrden !== undefined && { fecha_ultima_orden: datos.fechaUltimaOrden }),
        ...(datos.tags !== undefined && { tags: datos.tags }),
        ...(datos.notas !== undefined && { notas: datos.notas }),
        ...(datos.aceptaMarketing !== undefined && { acepta_marketing: datos.aceptaMarketing }),
        ...(datos.fuenteCliente !== undefined && { fuente_cliente: datos.fuenteCliente }),
        fecha_actualizacion: datos.fechaActualizacion,
      },
    });
  }

  async eliminar(id: string): Promise<void> {
    await this.prisma.cliente.delete({
      where: { id },
    });
  }

  async obtenerEstadisticas(): Promise<{
    totalClientes: number;
    clientesActivos: number;
    clientesInactivos: number;
    clientesNuevosHoy: number;
    totalGastado: number;
    promedioGastoPorCliente: number;
    clientesConOrdenes: number;
    clientesSinOrdenes: number;
    clientesFrecuentes: number;
    clientesValiosos: number;
    aceptanMarketing: number;
  }> {
    const hoy = new Date();
    const inicioDelDia = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());

    const [
      totalClientes,
      clientesActivos,
      clientesInactivos,
      clientesNuevosHoy,
      totalGastadoResult,
      clientesConOrdenes,
      clientesFrecuentes,
      clientesValiosos,
      aceptanMarketing,
    ] = await Promise.all([
      this.prisma.cliente.count(),
      this.prisma.cliente.count({ where: { activo: true } }),
      this.prisma.cliente.count({ where: { activo: false } }),
      this.prisma.cliente.count({
        where: {
          fecha_creacion: {
            gte: inicioDelDia,
          },
        },
      }),
      this.prisma.cliente.aggregate({
        _sum: { total_gastado: true },
      }),
      this.prisma.cliente.count({ where: { total_ordenes: { gt: 0 } } }),
      this.prisma.cliente.count({ where: { total_ordenes: { gte: 3 } } }),
      this.prisma.cliente.count({ where: { total_gastado: { gte: 500 } } }),
      this.prisma.cliente.count({ where: { acepta_marketing: true } }),
    ]);

    const totalGastado = Number(totalGastadoResult._sum.total_gastado || 0);
    const promedioGastoPorCliente = totalClientes > 0 ? totalGastado / totalClientes : 0;
    const clientesSinOrdenes = totalClientes - clientesConOrdenes;

    return {
      totalClientes,
      clientesActivos,
      clientesInactivos,
      clientesNuevosHoy,
      totalGastado,
      promedioGastoPorCliente,
      clientesConOrdenes,
      clientesSinOrdenes,
      clientesFrecuentes,
      clientesValiosos,
      aceptanMarketing,
    };
  }

  async exportarCSV(filtros?: {
    activo?: boolean;
    tags?: string[];
    fuenteCliente?: string;
    aceptaMarketing?: boolean;
    totalGastadoMinimo?: number;
    totalGastadoMaximo?: number;
    totalOrdenesMinimo?: number;
    totalOrdenesMaximo?: number;
    fechaCreacionDesde?: Date;
    fechaCreacionHasta?: Date;
  }): Promise<string> {
    const where: any = {};

    if (filtros?.activo !== undefined) {
      where.activo = filtros.activo;
    }

    if (filtros?.tags && filtros.tags.length > 0) {
      where.tags = { hasSome: filtros.tags };
    }

    if (filtros?.fuenteCliente) {
      where.fuente_cliente = filtros.fuenteCliente;
    }

    if (filtros?.aceptaMarketing !== undefined) {
      where.acepta_marketing = filtros.aceptaMarketing;
    }

    if (filtros?.totalGastadoMinimo !== undefined || filtros?.totalGastadoMaximo !== undefined) {
      where.total_gastado = {};
      if (filtros.totalGastadoMinimo !== undefined) {
        where.total_gastado.gte = filtros.totalGastadoMinimo;
      }
      if (filtros.totalGastadoMaximo !== undefined) {
        where.total_gastado.lte = filtros.totalGastadoMaximo;
      }
    }

    if (filtros?.totalOrdenesMinimo !== undefined || filtros?.totalOrdenesMaximo !== undefined) {
      where.total_ordenes = {};
      if (filtros.totalOrdenesMinimo !== undefined) {
        where.total_ordenes.gte = filtros.totalOrdenesMinimo;
      }
      if (filtros.totalOrdenesMaximo !== undefined) {
        where.total_ordenes.lte = filtros.totalOrdenesMaximo;
      }
    }

    if (filtros?.fechaCreacionDesde || filtros?.fechaCreacionHasta) {
      where.fecha_creacion = {};
      if (filtros.fechaCreacionDesde) {
        where.fecha_creacion.gte = filtros.fechaCreacionDesde;
      }
      if (filtros.fechaCreacionHasta) {
        where.fecha_creacion.lte = filtros.fechaCreacionHasta;
      }
    }

    const clientes = await this.prisma.cliente.findMany({
      where,
      orderBy: { fecha_creacion: 'desc' },
    });

    // Generar CSV
    const headers = [
      'ID',
      'Email',
      'Nombre Completo',
      'Teléfono',
      'Activo',
      'Total Gastado',
      'Total Órdenes',
      'Fecha Última Orden',
      'Tags',
      'Notas',
      'Acepta Marketing',
      'Fuente Cliente',
      'Fecha Creación',
      'Fecha Actualización',
    ];

    const rows = clientes.map(cliente => [
      cliente.id,
      cliente.email,
      cliente.nombre_completo,
      cliente.telefono || '',
      cliente.activo ? 'Sí' : 'No',
      Number(cliente.total_gastado).toString(),
      cliente.total_ordenes.toString(),
      cliente.fecha_ultima_orden?.toISOString() || '',
      cliente.tags.join(';'),
      cliente.notas || '',
      cliente.acepta_marketing ? 'Sí' : 'No',
      cliente.fuente_cliente,
      cliente.fecha_creacion.toISOString(),
      cliente.fecha_actualizacion.toISOString(),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(field => `"${field}"`).join(','))
    ].join('\n');

    return csvContent;
  }

  async importarCSV(csvData: string, creadorId: string): Promise<{
    exitosos: number;
    fallidos: number;
    errores: Array<{ linea: number; error: string }>;
  }> {
    const lineas = csvData.split('\n').filter(linea => linea.trim());
    const errores: Array<{ linea: number; error: string }> = [];
    let exitosos = 0;

    // Saltar la primera línea (encabezados)
    for (let i = 1; i < lineas.length; i++) {
      try {
        const campos = this.parseCSVLine(lineas[i]);
        
        if (campos.length < 3) {
          errores.push({ linea: i + 1, error: 'Formato de línea inválido' });
          continue;
        }

        const [email, nombreCompleto, telefono] = campos;
        
        // Validaciones básicas
        if (!email || !this.validarEmail(email)) {
          errores.push({ linea: i + 1, error: 'Email inválido o vacío' });
          continue;
        }

        if (!nombreCompleto) {
          errores.push({ linea: i + 1, error: 'Nombre completo requerido' });
          continue;
        }

        // Verificar si el email ya existe
        const clienteExistente = await this.buscarPorEmail(email);
        if (clienteExistente) {
          errores.push({ linea: i + 1, error: 'Email ya existe en el sistema' });
          continue;
        }

        // Crear cliente
        await this.crear({
          id: this.generarId(),
          email,
          nombreCompleto,
          telefono: telefono || null,
          activo: true,
          fechaCreacion: new Date(),
          fechaActualizacion: new Date(),
          creadorId,
          totalGastado: 0,
          totalOrdenes: 0,
          fechaUltimaOrden: null,
          tags: [],
          notas: null,
          aceptaMarketing: false,
          fuenteCliente: 'IMPORTACION_CSV',
        });

        exitosos++;
      } catch (error) {
        errores.push({ linea: i + 1, error: `Error interno: ${error.message}` });
      }
    }

    return {
      exitosos,
      fallidos: errores.length,
      errores,
    };
  }

  async obtenerSegmentos(): Promise<Array<{
    id: string;
    nombre: string;
    descripcion: string;
    tipo: string;
    reglas: any;
    activo: boolean;
    fechaCreacion: Date;
    fechaActualizacion: Date;
    tiendaId: string | null;
    creadorId: string;
  }>> {
    const segmentos = await this.prisma.segmentoCliente.findMany({
      orderBy: { fecha_creacion: 'desc' },
    });

    return segmentos.map(segmento => ({
      id: segmento.id,
      nombre: segmento.nombre,
      descripcion: segmento.descripcion || '',
      tipo: segmento.tipo,
      reglas: segmento.reglas,
      activo: segmento.activo,
      fechaCreacion: segmento.fecha_creacion,
      fechaActualizacion: segmento.fecha_actualizacion,
      tiendaId: segmento.tienda_id,
      creadorId: segmento.creador_id,
    }));
  }

  async aplicarSegmentosAutomaticos(): Promise<{
    clientesActualizados: number;
    segmentosAplicados: number;
  }> {
    const segmentos = await this.prisma.segmentoCliente.findMany({
      where: {
        tipo: 'AUTOMATICO',
        activo: true
      },
    });

    let clientesActualizados = 0;
    let segmentosAplicados = 0;

    for (const segmento of segmentos) {
      const clientes = await this.prisma.cliente.findMany();
      
      for (const cliente of clientes) {
        // Verificar si el cliente cumple las reglas del segmento
        const clienteEntity = new Cliente(
          cliente.id,
          cliente.email,
          cliente.nombre_completo,
          cliente.telefono,
          cliente.activo,
          cliente.fecha_creacion,
          cliente.fecha_actualizacion,
          cliente.creador_id,
          Number(cliente.total_gastado),
          cliente.total_ordenes,
          cliente.fecha_ultima_orden,
          cliente.tags,
          cliente.notas,
          cliente.acepta_marketing,
          cliente.fuente_cliente,
        );

        if (clienteEntity.perteneceASegmento(segmento.reglas)) {
          // Agregar al segmento si no está ya
          const existeRelacion = await this.prisma.clienteSegmento.findUnique({
            where: {
              cliente_id_segmento_id: {
                cliente_id: cliente.id,
                segmento_id: segmento.id,
              },
            },
          });

          if (!existeRelacion) {
            await this.prisma.clienteSegmento.create({
              data: {
                cliente_id: cliente.id,
                segmento_id: segmento.id,
                fecha_agregado: new Date(),
              },
            });
            clientesActualizados++;
          }
        }
      }
      segmentosAplicados++;
    }

    return {
      clientesActualizados,
      segmentosAplicados,
    };
  }

  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    result.push(current.trim());
    return result;
  }

  private validarEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private generarId(): string {
    return `cliente_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}