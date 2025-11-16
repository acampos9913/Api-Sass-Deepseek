import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { RepositorioOrdenCompra, FiltrosOrdenCompra, Paginacion, OrdenCompraCSVDTO, ItemOrdenCompraCSVDTO, ValidacionCSVResultado } from '../../dominio/interfaces/repositorio-orden-compra.interface';
import { OrdenCompra, ItemOrdenCompra, EstadoOrdenCompra } from '../../dominio/entidades/orden-compra.entity';

/**
 * Implementación del repositorio de órdenes de compra usando Prisma
 * Incluye funcionalidades de importación/exportación CSV
 */
@Injectable()
export class PrismaRepositorioOrdenCompra implements RepositorioOrdenCompra {
  constructor(private readonly prisma: PrismaService) {}

  async guardar(ordenCompra: OrdenCompra): Promise<OrdenCompra> {
    const ordenCompraGuardada = await this.prisma.ordenCompra.create({
      data: {
        numero_orden: ordenCompra.numeroOrden,
        proveedor: ordenCompra.proveedor,
        estado: ordenCompra.estado as any, // Conversión a enum de Prisma
        fecha_esperada: ordenCompra.fechaEsperada,
        fecha_entrega: ordenCompra.fechaEntrega,
        subtotal: ordenCompra.subtotal,
        impuestos: ordenCompra.impuestos,
        total: ordenCompra.total,
        notas: ordenCompra.notas,
        tienda_id: ordenCompra.tiendaId,
        creador_id: ordenCompra.creadorId,
        usuario_id: ordenCompra.usuarioId,
        items: {
          create: ordenCompra.items.map(item => ({
            producto_id: item.productoId,
            cantidad: item.cantidad,
            precio_unitario: item.precioUnitario,
            total: item.total,
            cantidad_recibida: item.cantidadRecibida,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    return this.mapearPrismaAEntidad(ordenCompraGuardada);
  }

  async buscarPorId(id: string): Promise<OrdenCompra | null> {
    const ordenCompra = await this.prisma.ordenCompra.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });

    return ordenCompra ? this.mapearPrismaAEntidad(ordenCompra) : null;
  }

  async buscarPorNumeroOrden(numeroOrden: string): Promise<OrdenCompra | null> {
    const ordenCompra = await this.prisma.ordenCompra.findUnique({
      where: { numero_orden: numeroOrden },
      include: {
        items: true,
      },
    });

    return ordenCompra ? this.mapearPrismaAEntidad(ordenCompra) : null;
  }

  async listar(filtros?: FiltrosOrdenCompra, paginacion?: Paginacion): Promise<OrdenCompra[]> {
    const where = this.construirWhere(filtros);
    const skip = paginacion ? (paginacion.pagina - 1) * paginacion.limite : undefined;
    const take = paginacion?.limite;

    const ordenesCompra = await this.prisma.ordenCompra.findMany({
      where,
      include: {
        items: true,
      },
      skip,
      take,
      orderBy: {
        fecha_creacion: 'desc',
      },
    });

    return ordenesCompra.map(ordenCompra => this.mapearPrismaAEntidad(ordenCompra));
  }

  async contar(filtros?: FiltrosOrdenCompra): Promise<number> {
    const where = this.construirWhere(filtros);
    return this.prisma.ordenCompra.count({ where });
  }

  async eliminar(id: string): Promise<void> {
    await this.prisma.ordenCompra.delete({
      where: { id },
    });
  }

  async actualizar(ordenCompra: OrdenCompra): Promise<OrdenCompra> {
    // Primero actualizar la orden
    const ordenActualizada = await this.prisma.ordenCompra.update({
      where: { id: ordenCompra.id },
      data: {
        proveedor: ordenCompra.proveedor,
        estado: ordenCompra.estado as any,
        fecha_esperada: ordenCompra.fechaEsperada,
        fecha_entrega: ordenCompra.fechaEntrega,
        subtotal: ordenCompra.subtotal,
        impuestos: ordenCompra.impuestos,
        total: ordenCompra.total,
        notas: ordenCompra.notas,
        fecha_actualizacion: new Date(),
      },
      include: {
        items: true,
      },
    });

    return this.mapearPrismaAEntidad(ordenActualizada);
  }

  async exportarCSV(filtros?: FiltrosOrdenCompra): Promise<string> {
    const ordenesCompra = await this.listar(filtros);
    
    const cabeceras = [
      'Número Orden',
      'Proveedor',
      'Estado',
      'Fecha Esperada',
      'Fecha Entrega',
      'Subtotal',
      'Impuestos',
      'Total',
      'Notas',
      'Producto ID',
      'Cantidad',
      'Precio Unitario',
      'Total Item',
      'Cantidad Recibida'
    ];

    const lineas = ordenesCompra.flatMap(orden => 
      orden.items.map(item => [
        orden.numeroOrden,
        orden.proveedor,
        orden.estado,
        orden.fechaEsperada?.toISOString().split('T')[0] || '',
        orden.fechaEntrega?.toISOString().split('T')[0] || '',
        orden.subtotal.toString(),
        orden.impuestos.toString(),
        orden.total.toString(),
        orden.notas || '',
        item.productoId,
        item.cantidad.toString(),
        item.precioUnitario.toString(),
        item.total.toString(),
        item.cantidadRecibida.toString()
      ])
    );

    const csvContent = [
      cabeceras.join(','),
      ...lineas.map(fila => fila.join(','))
    ].join('\n');

    return csvContent;
  }

  async importarCSV(csvData: string, tiendaId?: string, usuarioId?: string): Promise<OrdenCompra[]> {
    const lineas = csvData.split('\n').filter(linea => linea.trim());
    
    if (lineas.length < 2) {
      throw new Error('El archivo CSV está vacío o no tiene el formato correcto');
    }

    const cabeceras = lineas[0].split(',').map(cabecera => cabecera.trim());
    const datos = lineas.slice(1);

    // Validar el CSV
    const validacion = this.validarCSV(datos, cabeceras);
    if (!validacion.esValido) {
      throw new Error(`Errores en el CSV: ${validacion.errores.join(', ')}`);
    }

    const ordenesCompraCreadas: OrdenCompra[] = [];

    for (const dato of validacion.datos) {
      const numeroOrden = await this.obtenerSiguienteNumeroOrden();
      
      const ordenCompra = OrdenCompra.crear(
        numeroOrden,
        dato.proveedor,
        dato.subtotal,
        dato.impuestos,
        dato.total,
        tiendaId || null,
        usuarioId || '', // En un caso real, esto vendría del usuario autenticado
        usuarioId || null,
        dato.notas,
        dato.fechaEsperada
      );

      // Agregar items
      for (const itemDTO of dato.items) {
        const item = ItemOrdenCompra.crear(
          itemDTO.productoId,
          itemDTO.cantidad,
          itemDTO.precioUnitario
        );
        ordenCompra.agregarItem(item);
      }

      const ordenGuardada = await this.guardar(ordenCompra);
      ordenesCompraCreadas.push(ordenGuardada);
    }

    return ordenesCompraCreadas;
  }

  async obtenerSiguienteNumeroOrden(): Promise<string> {
    const ultimaOrden = await this.prisma.ordenCompra.findFirst({
      orderBy: {
        fecha_creacion: 'desc',
      },
      select: {
        numero_orden: true,
      },
    });

    if (!ultimaOrden) {
      return 'OC-000001';
    }

    const ultimoNumero = parseInt(ultimaOrden.numero_orden.split('-')[1]);
    const siguienteNumero = (ultimoNumero + 1).toString().padStart(6, '0');
    return `OC-${siguienteNumero}`;
  }

  private construirWhere(filtros?: FiltrosOrdenCompra): any {
    const where: any = {};

    if (filtros?.tiendaId) {
      where.tienda_id = filtros.tiendaId;
    }

    if (filtros?.proveedor) {
      where.proveedor = {
        contains: filtros.proveedor,
        mode: 'insensitive' as any,
      };
    }

    if (filtros?.estado) {
      where.estado = filtros.estado;
    }

    if (filtros?.fechaDesde || filtros?.fechaHasta) {
      where.fecha_creacion = {};
      
      if (filtros.fechaDesde) {
        where.fecha_creacion.gte = filtros.fechaDesde;
      }
      
      if (filtros.fechaHasta) {
        where.fecha_creacion.lte = filtros.fechaHasta;
      }
    }

    if (filtros?.numeroOrden) {
      where.numero_orden = {
        contains: filtros.numeroOrden,
        mode: 'insensitive' as any,
      };
    }

    if (filtros?.creadorId) {
      where.creador_id = filtros.creadorId;
    }

    if (filtros?.usuarioId) {
      where.usuario_id = filtros.usuarioId;
    }

    return where;
  }

  private mapearPrismaAEntidad(ordenCompraPrisma: any): OrdenCompra {
    const items = ordenCompraPrisma.items.map((item: any) => 
      new ItemOrdenCompra(
        item.id,
        item.orden_compra_id,
        item.producto_id,
        item.cantidad,
        Number(item.precio_unitario),
        Number(item.total),
        item.cantidad_recibida
      )
    );

    return new OrdenCompra(
      ordenCompraPrisma.id,
      ordenCompraPrisma.numero_orden,
      ordenCompraPrisma.proveedor,
      ordenCompraPrisma.estado as EstadoOrdenCompra,
      ordenCompraPrisma.fecha_esperada,
      ordenCompraPrisma.fecha_entrega,
      Number(ordenCompraPrisma.subtotal),
      Number(ordenCompraPrisma.impuestos),
      Number(ordenCompraPrisma.total),
      ordenCompraPrisma.notas,
      ordenCompraPrisma.fecha_creacion,
      ordenCompraPrisma.fecha_actualizacion,
      ordenCompraPrisma.tienda_id,
      ordenCompraPrisma.creador_id,
      ordenCompraPrisma.usuario_id,
      items
    );
  }

  private validarCSV(datos: string[], cabeceras: string[]): ValidacionCSVResultado {
    const errores: string[] = [];
    const datosValidados: OrdenCompraCSVDTO[] = [];

    // Verificar cabeceras mínimas requeridas
    const cabecerasRequeridas = ['Proveedor', 'Subtotal', 'Impuestos', 'Total', 'Producto ID', 'Cantidad', 'Precio Unitario'];
    const cabecerasFaltantes = cabecerasRequeridas.filter(cabecera => 
      !cabeceras.includes(cabecera)
    );

    if (cabecerasFaltantes.length > 0) {
      errores.push(`Cabeceras faltantes: ${cabecerasFaltantes.join(', ')}`);
      return { esValido: false, errores, datos: [] };
    }

    // Agrupar datos por orden (asumiendo que cada orden puede tener múltiples líneas)
    const ordenesMap = new Map<string, OrdenCompraCSVDTO>();

    for (let i = 0; i < datos.length; i++) {
      const linea = datos[i];
      const valores = linea.split(',').map(valor => valor.trim());
      
      try {
        const proveedor = valores[cabeceras.indexOf('Proveedor')];
        const subtotal = parseFloat(valores[cabeceras.indexOf('Subtotal')]);
        const impuestos = parseFloat(valores[cabeceras.indexOf('Impuestos')]);
        const total = parseFloat(valores[cabeceras.indexOf('Total')]);
        const productoId = valores[cabeceras.indexOf('Producto ID')];
        const cantidad = parseInt(valores[cabeceras.indexOf('Cantidad')]);
        const precioUnitario = parseFloat(valores[cabeceras.indexOf('Precio Unitario')]);

        // Validaciones básicas
        if (!proveedor) {
          errores.push(`Línea ${i + 2}: Proveedor es requerido`);
          continue;
        }

        if (isNaN(subtotal) || subtotal < 0) {
          errores.push(`Línea ${i + 2}: Subtotal debe ser un número válido`);
          continue;
        }

        if (isNaN(impuestos) || impuestos < 0) {
          errores.push(`Línea ${i + 2}: Impuestos debe ser un número válido`);
          continue;
        }

        if (isNaN(total) || total < 0) {
          errores.push(`Línea ${i + 2}: Total debe ser un número válido`);
          continue;
        }

        if (!productoId) {
          errores.push(`Línea ${i + 2}: Producto ID es requerido`);
          continue;
        }

        if (isNaN(cantidad) || cantidad <= 0) {
          errores.push(`Línea ${i + 2}: Cantidad debe ser un número mayor a 0`);
          continue;
        }

        if (isNaN(precioUnitario) || precioUnitario <= 0) {
          errores.push(`Línea ${i + 2}: Precio Unitario debe ser un número mayor a 0`);
          continue;
        }

        const claveOrden = `${proveedor}-${subtotal}-${impuestos}-${total}`;
        
        if (!ordenesMap.has(claveOrden)) {
          const fechaEsperadaIndex = cabeceras.indexOf('Fecha Esperada');
          const notasIndex = cabeceras.indexOf('Notas');
          
          ordenesMap.set(claveOrden, {
            numeroOrden: '', // Se asignará al crear
            proveedor,
            fechaEsperada: fechaEsperadaIndex >= 0 && valores[fechaEsperadaIndex] ? 
              new Date(valores[fechaEsperadaIndex]) : undefined,
            subtotal,
            impuestos,
            total,
            notas: notasIndex >= 0 ? valores[notasIndex] : undefined,
            items: []
          });
        }

        const orden = ordenesMap.get(claveOrden)!;
        orden.items.push({
          productoId,
          cantidad,
          precioUnitario,
          total: cantidad * precioUnitario
        });

      } catch (error) {
        errores.push(`Línea ${i + 2}: Error procesando datos - ${error}`);
      }
    }

    datosValidados.push(...ordenesMap.values());

    return {
      esValido: errores.length === 0,
      errores,
      datos: datosValidados
    };
  }
}