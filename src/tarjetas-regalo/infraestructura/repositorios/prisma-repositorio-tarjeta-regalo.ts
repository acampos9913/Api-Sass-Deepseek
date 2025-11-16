import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { RepositorioTarjetaRegalo, FiltrosTarjetaRegalo, Paginacion, TarjetaRegaloCSVDTO, ValidacionCSVResultado } from '../../dominio/interfaces/repositorio-tarjeta-regalo.interface';
import { TarjetaRegalo, TransaccionTarjetaRegalo, EstadoTarjetaRegalo, TipoTransaccionTarjetaRegalo } from '../../dominio/entidades/tarjeta-regalo.entity';

/**
 * Implementación del repositorio de tarjetas de regalo usando Prisma
 * Incluye funcionalidades de importación/exportación CSV
 */
@Injectable()
export class PrismaRepositorioTarjetaRegalo implements RepositorioTarjetaRegalo {
  constructor(private readonly prisma: PrismaService) {}

  async guardar(tarjetaRegalo: TarjetaRegalo): Promise<TarjetaRegalo> {
    const tarjetaRegaloGuardada = await this.prisma.tarjetaRegalo.create({
      data: {
        codigo: tarjetaRegalo.codigo,
        monto_inicial: tarjetaRegalo.montoInicial,
        monto_actual: tarjetaRegalo.montoActual,
        estado: tarjetaRegalo.estado as any, // Conversión a enum de Prisma
        fecha_expiracion: tarjetaRegalo.fechaExpiracion,
        fecha_activacion: tarjetaRegalo.fechaActivacion,
        fecha_redimida: tarjetaRegalo.fechaRedimida,
        notas: tarjetaRegalo.notas,
        tienda_id: tarjetaRegalo.tiendaId,
        creador_id: tarjetaRegalo.creadorId,
        usuario_id: tarjetaRegalo.usuarioId,
        transacciones: {
          create: tarjetaRegalo.transacciones.map(transaccion => ({
            tipo: transaccion.tipo as any,
            monto: transaccion.monto,
            orden_id: transaccion.ordenId,
            notas: transaccion.notas,
          })),
        },
      },
      include: {
        transacciones: true,
      },
    });

    return this.mapearPrismaAEntidad(tarjetaRegaloGuardada);
  }

  async buscarPorId(id: string): Promise<TarjetaRegalo | null> {
    const tarjetaRegalo = await this.prisma.tarjetaRegalo.findUnique({
      where: { id },
      include: {
        transacciones: {
          orderBy: {
            fecha_creacion: 'desc',
          },
        },
      },
    });

    return tarjetaRegalo ? this.mapearPrismaAEntidad(tarjetaRegalo) : null;
  }

  async buscarPorCodigo(codigo: string): Promise<TarjetaRegalo | null> {
    const tarjetaRegalo = await this.prisma.tarjetaRegalo.findUnique({
      where: { codigo },
      include: {
        transacciones: {
          orderBy: {
            fecha_creacion: 'desc',
          },
        },
      },
    });

    return tarjetaRegalo ? this.mapearPrismaAEntidad(tarjetaRegalo) : null;
  }

  async listar(filtros?: FiltrosTarjetaRegalo, paginacion?: Paginacion): Promise<TarjetaRegalo[]> {
    const where = this.construirWhere(filtros);
    const skip = paginacion ? (paginacion.pagina - 1) * paginacion.limite : undefined;
    const take = paginacion?.limite;

    const tarjetasRegalo = await this.prisma.tarjetaRegalo.findMany({
      where,
      include: {
        transacciones: {
          orderBy: {
            fecha_creacion: 'desc',
          },
        },
      },
      skip,
      take,
      orderBy: {
        fecha_creacion: 'desc',
      },
    });

    return tarjetasRegalo.map(tarjetaRegalo => this.mapearPrismaAEntidad(tarjetaRegalo));
  }

  async contar(filtros?: FiltrosTarjetaRegalo): Promise<number> {
    const where = this.construirWhere(filtros);
    return this.prisma.tarjetaRegalo.count({ where });
  }

  async eliminar(id: string): Promise<void> {
    await this.prisma.tarjetaRegalo.delete({
      where: { id },
    });
  }

  async actualizar(tarjetaRegalo: TarjetaRegalo): Promise<TarjetaRegalo> {
    const tarjetaActualizada = await this.prisma.tarjetaRegalo.update({
      where: { id: tarjetaRegalo.id },
      data: {
        monto_inicial: tarjetaRegalo.montoInicial,
        monto_actual: tarjetaRegalo.montoActual,
        estado: tarjetaRegalo.estado as any,
        fecha_expiracion: tarjetaRegalo.fechaExpiracion,
        fecha_activacion: tarjetaRegalo.fechaActivacion,
        fecha_redimida: tarjetaRegalo.fechaRedimida,
        notas: tarjetaRegalo.notas,
      },
      include: {
        transacciones: {
          orderBy: {
            fecha_creacion: 'desc',
          },
        },
      },
    });

    return this.mapearPrismaAEntidad(tarjetaActualizada);
  }

  async exportarCSV(filtros?: FiltrosTarjetaRegalo): Promise<string> {
    const tarjetasRegalo = await this.listar(filtros);
    
    const cabeceras = [
      'Código',
      'Monto Inicial',
      'Monto Actual',
      'Estado',
      'Fecha Creación',
      'Fecha Expiración',
      'Fecha Activación',
      'Fecha Redimida',
      'Notas',
      'Saldo Disponible',
      'Porcentaje Uso',
      'Días Restantes'
    ];

    const lineas = tarjetasRegalo.map(tarjeta => [
      tarjeta.codigo,
      tarjeta.montoInicial.toString(),
      tarjeta.montoActual.toString(),
      tarjeta.estado,
      tarjeta.fechaCreacion.toISOString().split('T')[0],
      tarjeta.fechaExpiracion?.toISOString().split('T')[0] || '',
      tarjeta.fechaActivacion?.toISOString().split('T')[0] || '',
      tarjeta.fechaRedimida?.toISOString().split('T')[0] || '',
      tarjeta.notas || '',
      tarjeta.obtenerSaldoDisponible().toString(),
      tarjeta.obtenerPorcentajeUso().toFixed(2),
      tarjeta.obtenerDiasRestantes()?.toString() || 'N/A'
    ]);

    const csvContent = [
      cabeceras.join(','),
      ...lineas.map(fila => fila.join(','))
    ].join('\n');

    return csvContent;
  }

  async importarCSV(csvData: string, tiendaId?: string, usuarioId?: string): Promise<TarjetaRegalo[]> {
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

    const tarjetasRegaloCreadas: TarjetaRegalo[] = [];

    for (const dato of validacion.datos) {
      const codigo = await this.generarCodigoUnico();
      
      const tarjetaRegalo = TarjetaRegalo.crear(
        codigo,
        dato.montoInicial,
        tiendaId || null,
        usuarioId || '', // En un caso real, esto vendría del usuario autenticado
        usuarioId || null,
        dato.fechaExpiracion,
        dato.notas
      );

      const tarjetaGuardada = await this.guardar(tarjetaRegalo);
      tarjetasRegaloCreadas.push(tarjetaGuardada);
    }

    return tarjetasRegaloCreadas;
  }

  async generarCodigoUnico(): Promise<string> {
    let codigo: string;
    let existeCodigo: boolean;
    
    do {
      // Generar código alfanumérico de 12 caracteres
      codigo = this.generarCodigo(12);
      existeCodigo = await this.verificarCodigoExistente(codigo);
    } while (existeCodigo);

    return codigo;
  }

  async registrarTransaccion(transaccion: TransaccionTarjetaRegalo): Promise<void> {
    await this.prisma.transaccionTarjetaRegalo.create({
      data: {
        tarjeta_regalo_id: transaccion.tarjetaRegaloId,
        tipo: transaccion.tipo as any,
        monto: transaccion.monto,
        orden_id: transaccion.ordenId,
        notas: transaccion.notas,
      },
    });
  }

  async obtenerHistorialTransacciones(tarjetaRegaloId: string): Promise<TransaccionTarjetaRegalo[]> {
    const transacciones = await this.prisma.transaccionTarjetaRegalo.findMany({
      where: {
        tarjeta_regalo_id: tarjetaRegaloId,
      },
      orderBy: {
        fecha_creacion: 'desc',
      },
    });

    return transacciones.map(transaccion => 
      new TransaccionTarjetaRegalo(
        transaccion.id,
        transaccion.tarjeta_regalo_id,
        transaccion.tipo as TipoTransaccionTarjetaRegalo,
        Number(transaccion.monto),
        transaccion.orden_id,
        transaccion.notas,
        transaccion.fecha_creacion
      )
    );
  }

  private construirWhere(filtros?: FiltrosTarjetaRegalo): any {
    const where: any = {};

    if (filtros?.tiendaId) {
      where.tienda_id = filtros.tiendaId;
    }

    if (filtros?.estado) {
      where.estado = filtros.estado;
    }

    if (filtros?.codigo) {
      where.codigo = {
        contains: filtros.codigo,
        mode: 'insensitive' as any,
      };
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

    if (filtros?.fechaExpiracionDesde || filtros?.fechaExpiracionHasta) {
      where.fecha_expiracion = {};
      
      if (filtros.fechaExpiracionDesde) {
        where.fecha_expiracion.gte = filtros.fechaExpiracionDesde;
      }
      
      if (filtros.fechaExpiracionHasta) {
        where.fecha_expiracion.lte = filtros.fechaExpiracionHasta;
      }
    }

    if (filtros?.creadorId) {
      where.creador_id = filtros.creadorId;
    }

    if (filtros?.usuarioId) {
      where.usuario_id = filtros.usuarioId;
    }

    return where;
  }

  private mapearPrismaAEntidad(tarjetaRegaloPrisma: any): TarjetaRegalo {
    const transacciones = tarjetaRegaloPrisma.transacciones.map((transaccion: any) => 
      new TransaccionTarjetaRegalo(
        transaccion.id,
        transaccion.tarjeta_regalo_id,
        transaccion.tipo as TipoTransaccionTarjetaRegalo,
        Number(transaccion.monto),
        transaccion.orden_id,
        transaccion.notas,
        transaccion.fecha_creacion
      )
    );

    return new TarjetaRegalo(
      tarjetaRegaloPrisma.id,
      tarjetaRegaloPrisma.codigo,
      Number(tarjetaRegaloPrisma.monto_inicial),
      Number(tarjetaRegaloPrisma.monto_actual),
      tarjetaRegaloPrisma.estado as EstadoTarjetaRegalo,
      tarjetaRegaloPrisma.fecha_creacion,
      tarjetaRegaloPrisma.fecha_expiracion,
      tarjetaRegaloPrisma.fecha_activacion,
      tarjetaRegaloPrisma.fecha_redimida,
      tarjetaRegaloPrisma.notas,
      tarjetaRegaloPrisma.tienda_id,
      tarjetaRegaloPrisma.creador_id,
      tarjetaRegaloPrisma.usuario_id,
      transacciones
    );
  }

  private validarCSV(datos: string[], cabeceras: string[]): ValidacionCSVResultado {
    const errores: string[] = [];
    const datosValidados: TarjetaRegaloCSVDTO[] = [];

    // Verificar cabeceras mínimas requeridas
    const cabecerasRequeridas = ['Monto Inicial'];
    const cabecerasFaltantes = cabecerasRequeridas.filter(cabecera => 
      !cabeceras.includes(cabecera)
    );

    if (cabecerasFaltantes.length > 0) {
      errores.push(`Cabeceras faltantes: ${cabecerasFaltantes.join(', ')}`);
      return { esValido: false, errores, datos: [] };
    }

    for (let i = 0; i < datos.length; i++) {
      const linea = datos[i];
      const valores = linea.split(',').map(valor => valor.trim());
      
      try {
        const montoInicial = parseFloat(valores[cabeceras.indexOf('Monto Inicial')]);

        // Validaciones básicas
        if (isNaN(montoInicial) || montoInicial <= 0) {
          errores.push(`Línea ${i + 2}: Monto Inicial debe ser un número mayor a 0`);
          continue;
        }

        const fechaExpiracionIndex = cabeceras.indexOf('Fecha Expiración');
        const notasIndex = cabeceras.indexOf('Notas');

        const tarjetaRegaloDTO: TarjetaRegaloCSVDTO = {
          codigo: '', // Se generará automáticamente
          montoInicial,
          fechaExpiracion: fechaExpiracionIndex >= 0 && valores[fechaExpiracionIndex] ? 
            new Date(valores[fechaExpiracionIndex]) : undefined,
          notas: notasIndex >= 0 ? valores[notasIndex] : undefined,
        };

        datosValidados.push(tarjetaRegaloDTO);

      } catch (error) {
        errores.push(`Línea ${i + 2}: Error procesando datos - ${error}`);
      }
    }

    return {
      esValido: errores.length === 0,
      errores,
      datos: datosValidados
    };
  }

  private generarCodigo(longitud: number): string {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let resultado = '';
    
    for (let i = 0; i < longitud; i++) {
      resultado += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    
    return resultado;
  }

  private async verificarCodigoExistente(codigo: string): Promise<boolean> {
    const tarjetaExistente = await this.prisma.tarjetaRegalo.findUnique({
      where: { codigo },
    });
    
    return tarjetaExistente !== null;
  }
}