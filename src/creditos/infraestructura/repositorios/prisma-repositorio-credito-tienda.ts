import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreditoTienda } from '../../dominio/entidades/credito-tienda.entity';
import { RecargaCredito } from '../../dominio/entidades/recarga-credito.entity';
import { CreditoUsado } from '../../dominio/entidades/credito-usado.entity';
import { TipoServicioCredito } from '../../dominio/entidades/recarga-credito.entity';
import type { RepositorioCreditoTienda } from '../../dominio/interfaces/repositorio-credito-tienda.interface';

@Injectable()
export class PrismaRepositorioCreditoTienda implements RepositorioCreditoTienda {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Guarda o actualiza el balance de créditos de una tienda
   */
  async guardarCreditoTienda(creditoTienda: CreditoTienda): Promise<CreditoTienda> {
    const datos = {
      id: creditoTienda.id,
      tienda_id: creditoTienda.tienda_id,
      creditos_disponibles: creditoTienda.creditos_disponibles,
      creditos_usados: creditoTienda.creditos_usados,
      fecha_creacion: creditoTienda.fecha_creacion,
      fecha_actualizacion: creditoTienda.fecha_actualizacion,
    };

    const creditoGuardado = await this.prisma.creditoTienda.upsert({
      where: { id: creditoTienda.id },
      create: datos,
      update: {
        creditos_disponibles: datos.creditos_disponibles,
        creditos_usados: datos.creditos_usados,
        fecha_actualizacion: datos.fecha_actualizacion,
      },
    });

    return CreditoTienda.crear({
      id: creditoGuardado.id,
      tienda_id: creditoGuardado.tienda_id,
      creditos_disponibles: creditoGuardado.creditos_disponibles,
      creditos_usados: creditoGuardado.creditos_usados,
      fecha_creacion: creditoGuardado.fecha_creacion,
      fecha_actualizacion: creditoGuardado.fecha_actualizacion,
    });
  }

  /**
   * Busca el balance de créditos por ID de tienda
   */
  async buscarCreditoTiendaPorId(tiendaId: string): Promise<CreditoTienda | null> {
    const credito = await this.prisma.creditoTienda.findFirst({
      where: { tienda_id: tiendaId },
    });

    if (!credito) {
      return null;
    }

    return CreditoTienda.crear({
      id: credito.id,
      tienda_id: credito.tienda_id,
      creditos_disponibles: credito.creditos_disponibles,
      creditos_usados: credito.creditos_usados,
      fecha_creacion: credito.fecha_creacion,
      fecha_actualizacion: credito.fecha_actualizacion,
    });
  }

  /**
   * Crea un balance inicial de créditos para una tienda
   */
  async crearCreditoTiendaInicial(tiendaId: string): Promise<CreditoTienda> {
    const creditoInicial = CreditoTienda.crear({
      tienda_id: tiendaId,
      creditos_disponibles: 0,
      creditos_usados: 0,
    });

    return await this.guardarCreditoTienda(creditoInicial);
  }

  /**
   * Guarda una recarga de créditos
   */
  async guardarRecargaCredito(recarga: RecargaCredito): Promise<RecargaCredito> {
    const datos = {
      id: recarga.id,
      tienda_id: recarga.tienda_id,
      monto_dolares: recarga.monto_dolares,
      creditos_agregados: recarga.creditos_agregados,
      id_pago_stripe: recarga.id_pago_stripe,
      estado: recarga.estado,
      fecha_recarga: recarga.fecha_recarga,
      fecha_actualizacion: recarga.fecha_actualizacion,
    };

    const recargaGuardada = await this.prisma.recargaCredito.create({
      data: datos,
    });

    return RecargaCredito.crear({
      id: recargaGuardada.id,
      tienda_id: recargaGuardada.tienda_id,
      monto_dolares: Number(recargaGuardada.monto_dolares),
      id_pago_stripe: recargaGuardada.id_pago_stripe || '',
      estado: recargaGuardada.estado as any,
      fecha_recarga: recargaGuardada.fecha_recarga,
      fecha_actualizacion: recargaGuardada.fecha_actualizacion,
    });
  }

  /**
   * Busca una recarga por ID
   */
  async buscarRecargaPorId(id: string): Promise<RecargaCredito | null> {
    const recarga = await this.prisma.recargaCredito.findUnique({
      where: { id },
    });

    if (!recarga) {
      return null;
    }

    return RecargaCredito.crear({
      id: recarga.id,
      tienda_id: recarga.tienda_id,
      monto_dolares: Number(recarga.monto_dolares),
      id_pago_stripe: recarga.id_pago_stripe || '',
      estado: recarga.estado as any,
      fecha_recarga: recarga.fecha_recarga,
      fecha_actualizacion: recarga.fecha_actualizacion,
    });
  }

  /**
   * Busca recargas por ID de tienda
   */
  async buscarRecargasPorTienda(tiendaId: string): Promise<RecargaCredito[]> {
    const recargas = await this.prisma.recargaCredito.findMany({
      where: { tienda_id: tiendaId },
      orderBy: { fecha_recarga: 'desc' },
    });

    return recargas.map(recarga =>
      RecargaCredito.crear({
        id: recarga.id,
        tienda_id: recarga.tienda_id,
        monto_dolares: Number(recarga.monto_dolares),
        id_pago_stripe: recarga.id_pago_stripe || '',
        estado: recarga.estado as any,
        fecha_recarga: recarga.fecha_recarga,
        fecha_actualizacion: recarga.fecha_actualizacion,
      })
    );
  }

  /**
   * Busca recargas por ID de pago de Stripe
   */
  async buscarRecargaPorPagoStripe(idPagoStripe: string): Promise<RecargaCredito | null> {
    const recarga = await this.prisma.recargaCredito.findFirst({
      where: { id_pago_stripe: idPagoStripe },
    });

    if (!recarga) {
      return null;
    }

    return RecargaCredito.crear({
      id: recarga.id,
      tienda_id: recarga.tienda_id,
      monto_dolares: Number(recarga.monto_dolares),
      id_pago_stripe: recarga.id_pago_stripe || '',
      estado: recarga.estado as any,
      fecha_recarga: recarga.fecha_recarga,
      fecha_actualizacion: recarga.fecha_actualizacion,
    });
  }

  /**
   * Actualiza el estado de una recarga
   */
  async actualizarEstadoRecarga(id: string, estado: 'COMPLETADO' | 'PENDIENTE' | 'FALLIDO'): Promise<RecargaCredito> {
    const recargaActualizada = await this.prisma.recargaCredito.update({
      where: { id },
      data: {
        estado,
        fecha_actualizacion: new Date(),
      },
    });

    return RecargaCredito.crear({
      id: recargaActualizada.id,
      tienda_id: recargaActualizada.tienda_id,
      monto_dolares: Number(recargaActualizada.monto_dolares),
      id_pago_stripe: recargaActualizada.id_pago_stripe || '',
      estado: recargaActualizada.estado as any,
      fecha_recarga: recargaActualizada.fecha_recarga,
      fecha_actualizacion: recargaActualizada.fecha_actualizacion,
    });
  }

  /**
   * Registra el uso de créditos
   */
  async registrarUsoCredito(creditoUsado: CreditoUsado): Promise<CreditoUsado> {
    const datos = {
      id: creditoUsado.id,
      tienda_id: creditoUsado.tienda_id,
      cantidad_creditos: creditoUsado.cantidad_creditos,
      tipo_servicio: creditoUsado.tipo_servicio,
      descripcion_servicio: creditoUsado.descripcion_servicio,
      id_referencia: creditoUsado.id_referencia,
      metadata: creditoUsado.metadata,
      fecha_uso: creditoUsado.fecha_uso,
    };

    const usoGuardado = await this.prisma.creditoUsado.create({
      data: datos,
    });

    return CreditoUsado.crear({
      id: usoGuardado.id,
      tienda_id: usoGuardado.tienda_id,
      cantidad_creditos: usoGuardado.cantidad_creditos,
      tipo_servicio: usoGuardado.tipo_servicio as TipoServicioCredito,
      descripcion_servicio: usoGuardado.descripcion_servicio,
      id_referencia: usoGuardado.id_referencia,
      metadata: usoGuardado.metadata as Record<string, any>,
      fecha_uso: usoGuardado.fecha_uso,
    });
  }

  /**
   * Busca usos de créditos por ID de tienda
   */
  async buscarUsosPorTienda(tiendaId: string): Promise<CreditoUsado[]> {
    const usos = await this.prisma.creditoUsado.findMany({
      where: { tienda_id: tiendaId },
      orderBy: { fecha_uso: 'desc' },
    });

    return usos.map(uso =>
      CreditoUsado.crear({
        id: uso.id,
        tienda_id: uso.tienda_id,
        cantidad_creditos: uso.cantidad_creditos,
        tipo_servicio: uso.tipo_servicio as TipoServicioCredito,
        descripcion_servicio: uso.descripcion_servicio,
        id_referencia: uso.id_referencia,
        metadata: uso.metadata as Record<string, any>,
        fecha_uso: uso.fecha_uso,
      })
    );
  }

  /**
   * Busca usos de créditos por tienda y rango de fechas
   */
  async buscarUsosPorTiendaYRango(tiendaId: string, fechaInicio: Date, fechaFin: Date): Promise<CreditoUsado[]> {
    const usos = await this.prisma.creditoUsado.findMany({
      where: {
        tienda_id: tiendaId,
        fecha_uso: {
          gte: fechaInicio,
          lte: fechaFin,
        },
      },
      orderBy: { fecha_uso: 'asc' },
    });

    return usos.map(uso =>
      CreditoUsado.crear({
        id: uso.id,
        tienda_id: uso.tienda_id,
        cantidad_creditos: uso.cantidad_creditos,
        tipo_servicio: uso.tipo_servicio as TipoServicioCredito,
        descripcion_servicio: uso.descripcion_servicio,
        id_referencia: uso.id_referencia,
        metadata: uso.metadata as Record<string, any>,
        fecha_uso: uso.fecha_uso,
      })
    );
  }

  /**
   * Busca usos de créditos por tienda y tipo de servicio
   */
  async buscarUsosPorTiendaYTipoServicio(tiendaId: string, tipoServicio: TipoServicioCredito): Promise<CreditoUsado[]> {
    const usos = await this.prisma.creditoUsado.findMany({
      where: {
        tienda_id: tiendaId,
        tipo_servicio: tipoServicio,
      },
      orderBy: { fecha_uso: 'desc' },
    });

    return usos.map(uso =>
      CreditoUsado.crear({
        id: uso.id,
        tienda_id: uso.tienda_id,
        cantidad_creditos: uso.cantidad_creditos,
        tipo_servicio: uso.tipo_servicio as TipoServicioCredito,
        descripcion_servicio: uso.descripcion_servicio,
        id_referencia: uso.id_referencia,
        metadata: uso.metadata as Record<string, any>,
        fecha_uso: uso.fecha_uso,
      })
    );
  }

  /**
   * Obtiene el resumen mensual de créditos por tienda
   */
  async obtenerResumenMensual(tiendaId: string, año: number, mes: number) {
    const fechaInicio = new Date(año, mes - 1, 1);
    const fechaFin = new Date(año, mes, 0, 23, 59, 59, 999);

    // Obtener balance actual
    const balance = await this.buscarCreditoTiendaPorId(tiendaId);
    
    // Obtener recargas del mes
    const recargasMes = await this.prisma.recargaCredito.findMany({
      where: {
        tienda_id: tiendaId,
        fecha_recarga: {
          gte: fechaInicio,
          lte: fechaFin,
        },
        estado: 'COMPLETADO',
      },
    });

    // Obtener usos del mes
    const usosMes = await this.prisma.creditoUsado.findMany({
      where: {
        tienda_id: tiendaId,
        fecha_uso: {
          gte: fechaInicio,
          lte: fechaFin,
        },
      },
    });

    const creditosAgregados = recargasMes.reduce((sum, recarga) => sum + recarga.creditos_agregados, 0);
    const creditosUsados = usosMes.reduce((sum, uso) => sum + uso.cantidad_creditos, 0);

    return {
      creditos_disponibles: balance?.creditos_disponibles || 0,
      creditos_usados: balance?.creditos_usados || 0,
      creditos_agregados: creditosAgregados,
      total_recargas: recargasMes.length,
      total_usos: usosMes.length,
    };
  }

  /**
   * Obtiene el uso diario de créditos por mes
   */
  async obtenerUsoDiarioPorMes(tiendaId: string, año: number, mes: number) {
    const fechaInicio = new Date(año, mes - 1, 1);
    const fechaFin = new Date(año, mes, 0, 23, 59, 59, 999);

    const usos = await this.prisma.creditoUsado.findMany({
      where: {
        tienda_id: tiendaId,
        fecha_uso: {
          gte: fechaInicio,
          lte: fechaFin,
        },
      },
      orderBy: { fecha_uso: 'asc' },
    });

    // Agrupar por día
    const usoPorDia = new Map<string, {
      fecha: string;
      creditos_usados: number;
      cantidad_operaciones: number;
      servicios: Map<TipoServicioCredito, number>;
    }>();

    for (const uso of usos) {
      const fecha = uso.fecha_uso.toISOString().split('T')[0];
      
      if (!usoPorDia.has(fecha)) {
        usoPorDia.set(fecha, {
          fecha,
          creditos_usados: 0,
          cantidad_operaciones: 0,
          servicios: new Map(),
        });
      }

      const dia = usoPorDia.get(fecha)!;
      dia.creditos_usados += uso.cantidad_creditos;
      dia.cantidad_operaciones += 1;

      const servicioActual = dia.servicios.get(uso.tipo_servicio as TipoServicioCredito) || 0;
      dia.servicios.set(uso.tipo_servicio as TipoServicioCredito, servicioActual + uso.cantidad_creditos);
    }

    // Convertir a array y formatear servicios
    return Array.from(usoPorDia.values()).map(dia => ({
      fecha: dia.fecha,
      creditos_usados: dia.creditos_usados,
      cantidad_operaciones: dia.cantidad_operaciones,
      servicios: Array.from(dia.servicios.entries()).map(([tipo_servicio, creditos_usados]) => ({
        tipo_servicio,
        creditos_usados,
      })),
    }));
  }

  /**
   * Obtiene el historial completo de créditos (recargas y usos)
   */
  async obtenerHistorialCompleto(tiendaId: string, limite = 50, pagina = 1) {
    const skip = (pagina - 1) * limite;

    const [recargas, usos, totalRecargas, totalUsos] = await Promise.all([
      this.prisma.recargaCredito.findMany({
        where: { tienda_id: tiendaId },
        orderBy: { fecha_recarga: 'desc' },
        take: limite,
        skip,
      }),
      this.prisma.creditoUsado.findMany({
        where: { tienda_id: tiendaId },
        orderBy: { fecha_uso: 'desc' },
        take: limite,
        skip,
      }),
      this.prisma.recargaCredito.count({ where: { tienda_id: tiendaId } }),
      this.prisma.creditoUsado.count({ where: { tienda_id: tiendaId } }),
    ]);

    return {
      recargas: recargas.map(recarga =>
        RecargaCredito.crear({
          id: recarga.id,
          tienda_id: recarga.tienda_id,
          monto_dolares: Number(recarga.monto_dolares),
          id_pago_stripe: recarga.id_pago_stripe || '',
          estado: recarga.estado as any,
          fecha_recarga: recarga.fecha_recarga,
          fecha_actualizacion: recarga.fecha_actualizacion,
        })
      ),
      usos: usos.map(uso =>
        CreditoUsado.crear({
          id: uso.id,
          tienda_id: uso.tienda_id,
          cantidad_creditos: uso.cantidad_creditos,
          tipo_servicio: uso.tipo_servicio as TipoServicioCredito,
          descripcion_servicio: uso.descripcion_servicio,
          id_referencia: uso.id_referencia,
          metadata: uso.metadata as Record<string, any>,
          fecha_uso: uso.fecha_uso,
        })
      ),
      total_recargas: totalRecargas,
      total_usos: totalUsos,
    };
  }

  /**
   * Verifica si una tienda tiene créditos suficientes
   */
  async verificarCreditosSuficientes(tiendaId: string, cantidad: number): Promise<boolean> {
    const balance = await this.buscarCreditoTiendaPorId(tiendaId);
    return balance ? balance.tieneCreditosSuficientes(cantidad) : false;
  }

  /**
   * Obtiene el top de servicios que más créditos consumen
   */
  async obtenerTopServiciosConsumo(tiendaId: string, limite = 5) {
    const usos = await this.prisma.creditoUsado.groupBy({
      by: ['tipo_servicio'],
      where: { tienda_id: tiendaId },
      _sum: {
        cantidad_creditos: true,
      },
      _count: {
        id: true,
      },
      orderBy: {
        _sum: {
          cantidad_creditos: 'desc',
        },
      },
      take: limite,
    });

    return usos.map(uso => ({
      tipo_servicio: uso.tipo_servicio as TipoServicioCredito,
      total_creditos: uso._sum.cantidad_creditos || 0,
      cantidad_operaciones: uso._count.id,
    }));
  }
}