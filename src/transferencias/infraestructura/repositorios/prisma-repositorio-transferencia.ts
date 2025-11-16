import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { RepositorioTransferencia, FiltrosTransferencia, Paginacion, TransferenciaCSVDTO, ItemTransferenciaCSVDTO, ValidacionCSVResultado } from '../../dominio/interfaces/repositorio-transferencia.interface';
import { TransferenciaProducto, ItemTransferencia, EstadoTransferencia } from '../../dominio/entidades/transferencia-producto.entity';

/**
 * Implementación del repositorio de transferencias usando Prisma
 * Incluye funcionalidades de importación/exportación CSV
 */
@Injectable()
export class PrismaRepositorioTransferencia implements RepositorioTransferencia {
  constructor(private readonly prisma: PrismaService) {}

  async guardar(transferencia: TransferenciaProducto): Promise<TransferenciaProducto> {
    const transferenciaGuardada = await this.prisma.transferenciaProducto.create({
      data: {
        numero_transferencia: transferencia.numeroTransferencia,
        ubicacion_origen: transferencia.ubicacionOrigen,
        ubicacion_destino: transferencia.ubicacionDestino,
        estado: transferencia.estado as any, // Conversión a enum de Prisma
        fecha_esperada: transferencia.fechaEsperada,
        fecha_completada: transferencia.fechaCompletada,
        notas: transferencia.notas,
        tienda_id: transferencia.tiendaId,
        creador_id: transferencia.creadorId,
        usuario_id: transferencia.usuarioId,
        items: {
          create: transferencia.items.map(item => ({
            producto_id: item.productoId,
            cantidad_solicitada: item.cantidadSolicitada,
            cantidad_enviada: item.cantidadEnviada,
            cantidad_recibida: item.cantidadRecibida,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    return this.mapearPrismaAEntidad(transferenciaGuardada);
  }

  async buscarPorId(id: string): Promise<TransferenciaProducto | null> {
    const transferencia = await this.prisma.transferenciaProducto.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });

    return transferencia ? this.mapearPrismaAEntidad(transferencia) : null;
  }

  async buscarPorNumeroTransferencia(numeroTransferencia: string): Promise<TransferenciaProducto | null> {
    const transferencia = await this.prisma.transferenciaProducto.findUnique({
      where: { numero_transferencia: numeroTransferencia },
      include: {
        items: true,
      },
    });

    return transferencia ? this.mapearPrismaAEntidad(transferencia) : null;
  }

  async listar(filtros?: FiltrosTransferencia, paginacion?: Paginacion): Promise<TransferenciaProducto[]> {
    const where = this.construirWhere(filtros);
    const skip = paginacion ? (paginacion.pagina - 1) * paginacion.limite : undefined;
    const take = paginacion?.limite;

    const transferencias = await this.prisma.transferenciaProducto.findMany({
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

    return transferencias.map(transferencia => this.mapearPrismaAEntidad(transferencia));
  }

  async contar(filtros?: FiltrosTransferencia): Promise<number> {
    const where = this.construirWhere(filtros);
    return this.prisma.transferenciaProducto.count({ where });
  }

  async eliminar(id: string): Promise<void> {
    await this.prisma.transferenciaProducto.delete({
      where: { id },
    });
  }

  async actualizar(transferencia: TransferenciaProducto): Promise<TransferenciaProducto> {
    // Primero actualizar la transferencia
    const transferenciaActualizada = await this.prisma.transferenciaProducto.update({
      where: { id: transferencia.id },
      data: {
        ubicacion_origen: transferencia.ubicacionOrigen,
        ubicacion_destino: transferencia.ubicacionDestino,
        estado: transferencia.estado as any,
        fecha_esperada: transferencia.fechaEsperada,
        fecha_completada: transferencia.fechaCompletada,
        notas: transferencia.notas,
        fecha_actualizacion: new Date(),
      },
      include: {
        items: true,
      },
    });

    return this.mapearPrismaAEntidad(transferenciaActualizada);
  }

  async exportarCSV(filtros?: FiltrosTransferencia): Promise<string> {
    const transferencias = await this.listar(filtros);
    
    const cabeceras = [
      'Número Transferencia',
      'Ubicación Origen',
      'Ubicación Destino',
      'Estado',
      'Fecha Esperada',
      'Fecha Completada',
      'Notas',
      'Producto ID',
      'Cantidad Solicitada',
      'Cantidad Enviada',
      'Cantidad Recibida',
      'Porcentaje Envío',
      'Porcentaje Recepción'
    ];

    const lineas = transferencias.flatMap(transferencia => 
      transferencia.items.map(item => [
        transferencia.numeroTransferencia,
        transferencia.ubicacionOrigen,
        transferencia.ubicacionDestino,
        transferencia.estado,
        transferencia.fechaEsperada?.toISOString().split('T')[0] || '',
        transferencia.fechaCompletada?.toISOString().split('T')[0] || '',
        transferencia.notas || '',
        item.productoId,
        item.cantidadSolicitada.toString(),
        item.cantidadEnviada.toString(),
        item.cantidadRecibida.toString(),
        item.obtenerPorcentajeEnvio().toFixed(2),
        item.obtenerPorcentajeRecepcion().toFixed(2)
      ])
    );

    const csvContent = [
      cabeceras.join(','),
      ...lineas.map(fila => fila.join(','))
    ].join('\n');

    return csvContent;
  }

  async importarCSV(csvData: string, tiendaId?: string, usuarioId?: string): Promise<TransferenciaProducto[]> {
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

    const transferenciasCreadas: TransferenciaProducto[] = [];

    for (const dato of validacion.datos) {
      const numeroTransferencia = await this.obtenerSiguienteNumeroTransferencia();
      
      const transferencia = TransferenciaProducto.crear(
        numeroTransferencia,
        dato.ubicacionOrigen,
        dato.ubicacionDestino,
        tiendaId || null,
        usuarioId || '', // En un caso real, esto vendría del usuario autenticado
        usuarioId || null,
        dato.notas,
        dato.fechaEsperada
      );

      // Agregar items
      for (const itemDTO of dato.items) {
        const item = ItemTransferencia.crear(
          itemDTO.productoId,
          itemDTO.cantidadSolicitada
        );
        transferencia.agregarItem(item);
      }

      const transferenciaGuardada = await this.guardar(transferencia);
      transferenciasCreadas.push(transferenciaGuardada);
    }

    return transferenciasCreadas;
  }

  async obtenerSiguienteNumeroTransferencia(): Promise<string> {
    const ultimaTransferencia = await this.prisma.transferenciaProducto.findFirst({
      orderBy: {
        fecha_creacion: 'desc',
      },
      select: {
        numero_transferencia: true,
      },
    });

    if (!ultimaTransferencia) {
      return 'TRF-000001';
    }

    const ultimoNumero = parseInt(ultimaTransferencia.numero_transferencia.split('-')[1]);
    const siguienteNumero = (ultimoNumero + 1).toString().padStart(6, '0');
    return `TRF-${siguienteNumero}`;
  }

  private construirWhere(filtros?: FiltrosTransferencia): any {
    const where: any = {};

    if (filtros?.tiendaId) {
      where.tienda_id = filtros.tiendaId;
    }

    if (filtros?.ubicacionOrigen) {
      where.ubicacion_origen = {
        contains: filtros.ubicacionOrigen,
        mode: 'insensitive' as any,
      };
    }

    if (filtros?.ubicacionDestino) {
      where.ubicacion_destino = {
        contains: filtros.ubicacionDestino,
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

    if (filtros?.numeroTransferencia) {
      where.numero_transferencia = {
        contains: filtros.numeroTransferencia,
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

  private mapearPrismaAEntidad(transferenciaPrisma: any): TransferenciaProducto {
    const items = transferenciaPrisma.items.map((item: any) => 
      new ItemTransferencia(
        item.id,
        item.transferencia_id,
        item.producto_id,
        item.cantidad_solicitada,
        item.cantidad_enviada,
        item.cantidad_recibida
      )
    );

    return new TransferenciaProducto(
      transferenciaPrisma.id,
      transferenciaPrisma.numero_transferencia,
      transferenciaPrisma.ubicacion_origen,
      transferenciaPrisma.ubicacion_destino,
      transferenciaPrisma.estado as EstadoTransferencia,
      transferenciaPrisma.fecha_esperada,
      transferenciaPrisma.fecha_completada,
      transferenciaPrisma.notas,
      transferenciaPrisma.fecha_creacion,
      transferenciaPrisma.fecha_actualizacion,
      transferenciaPrisma.tienda_id,
      transferenciaPrisma.creador_id,
      transferenciaPrisma.usuario_id,
      items
    );
  }

  private validarCSV(datos: string[], cabeceras: string[]): ValidacionCSVResultado {
    const errores: string[] = [];
    const datosValidados: TransferenciaCSVDTO[] = [];

    // Verificar cabeceras mínimas requeridas
    const cabecerasRequeridas = ['Ubicación Origen', 'Ubicación Destino', 'Producto ID', 'Cantidad Solicitada'];
    const cabecerasFaltantes = cabecerasRequeridas.filter(cabecera => 
      !cabeceras.includes(cabecera)
    );

    if (cabecerasFaltantes.length > 0) {
      errores.push(`Cabeceras faltantes: ${cabecerasFaltantes.join(', ')}`);
      return { esValido: false, errores, datos: [] };
    }

    // Agrupar datos por transferencia (asumiendo que cada transferencia puede tener múltiples líneas)
    const transferenciasMap = new Map<string, TransferenciaCSVDTO>();

    for (let i = 0; i < datos.length; i++) {
      const linea = datos[i];
      const valores = linea.split(',').map(valor => valor.trim());
      
      try {
        const ubicacionOrigen = valores[cabeceras.indexOf('Ubicación Origen')];
        const ubicacionDestino = valores[cabeceras.indexOf('Ubicación Destino')];
        const productoId = valores[cabeceras.indexOf('Producto ID')];
        const cantidadSolicitada = parseInt(valores[cabeceras.indexOf('Cantidad Solicitada')]);

        // Validaciones básicas
        if (!ubicacionOrigen) {
          errores.push(`Línea ${i + 2}: Ubicación Origen es requerida`);
          continue;
        }

        if (!ubicacionDestino) {
          errores.push(`Línea ${i + 2}: Ubicación Destino es requerida`);
          continue;
        }

        if (!productoId) {
          errores.push(`Línea ${i + 2}: Producto ID es requerido`);
          continue;
        }

        if (isNaN(cantidadSolicitada) || cantidadSolicitada <= 0) {
          errores.push(`Línea ${i + 2}: Cantidad Solicitada debe ser un número mayor a 0`);
          continue;
        }

        const claveTransferencia = `${ubicacionOrigen}-${ubicacionDestino}`;
        
        if (!transferenciasMap.has(claveTransferencia)) {
          const fechaEsperadaIndex = cabeceras.indexOf('Fecha Esperada');
          const notasIndex = cabeceras.indexOf('Notas');
          
          transferenciasMap.set(claveTransferencia, {
            numeroTransferencia: '', // Se asignará al crear
            ubicacionOrigen,
            ubicacionDestino,
            fechaEsperada: fechaEsperadaIndex >= 0 && valores[fechaEsperadaIndex] ? 
              new Date(valores[fechaEsperadaIndex]) : undefined,
            notas: notasIndex >= 0 ? valores[notasIndex] : undefined,
            items: []
          });
        }

        const transferencia = transferenciasMap.get(claveTransferencia)!;
        
        // Verificar que el producto no esté duplicado en la misma transferencia
        const productoExistente = transferencia.items.find(item => item.productoId === productoId);
        if (productoExistente) {
          errores.push(`Línea ${i + 2}: El producto ${productoId} ya existe en la transferencia`);
          continue;
        }

        transferencia.items.push({
          productoId,
          cantidadSolicitada,
          cantidadEnviada: 0,
          cantidadRecibida: 0
        });

      } catch (error) {
        errores.push(`Línea ${i + 2}: Error procesando datos - ${error}`);
      }
    }

    datosValidados.push(...transferenciasMap.values());

    return {
      esValido: errores.length === 0,
      errores,
      datos: datosValidados
    };
  }
}