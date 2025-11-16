import { Inject, Injectable } from '@nestjs/common';
import { Descuento } from '../entidades/descuento.entity';
import { TipoDescuento } from '../enums/tipo-descuento.enum';
import type { RepositorioDescuento } from '../interfaces/repositorio-descuento.interface';
import { ServicioRespuestaEstandar, RespuestaEstandar } from '../../../comun/aplicacion/servicios/servicio-respuesta-estandar';
import { ExcepcionDominio } from '../../../comun/excepciones/excepcion-dominio';

/**
 * Caso de uso para crear un nuevo descuento o promoción
 * Contiene la lógica de negocio específica para la creación de descuentos
 */
@Injectable()
export class CrearDescuentoCasoUso {
  constructor(
    @Inject('RepositorioDescuento')
    private readonly repositorioDescuento: RepositorioDescuento,
  ) {}

  /**
   * Ejecuta el caso de uso para crear un descuento
   * @param datosDescuento Datos del descuento a crear
   * @returns Respuesta estándar con el descuento creado
   */
  async ejecutar(datosDescuento: {
    codigo: string;
    tipo: TipoDescuento;
    valor: number;
    valorMinimo?: number | null;
    usosMaximos?: number | null;
    fechaInicio?: Date | null;
    fechaFin?: Date | null;
    // Nuevos campos para descuentos avanzados
    configuracionAvanzada?: Record<string, any> | null;
    reglasValidacion?: Record<string, any> | null;
    restricciones?: Record<string, any> | null;
    nombreCampana?: string | null;
    utmSource?: string | null;
    utmMedium?: string | null;
    utmCampaign?: string | null;
    cantidadLleva?: number | null;
    cantidadPaga?: number | null;
    productosAplicables?: string[];
    coleccionesAplicables?: string[];
    paisesPermitidos?: string[];
    segmentosPermitidos?: string[];
    requisitosMinimos?: Record<string, any> | null;
  }): Promise<RespuestaEstandar<Descuento>> {
    // Validar que el código no esté duplicado
    const descuentoExistente = await this.repositorioDescuento.buscarPorCodigo(
      datosDescuento.codigo,
    );
    if (descuentoExistente) {
      throw ExcepcionDominio.Respuesta400(
        'Ya existe un descuento con este código',
        'Descuento.CodigoDuplicado'
      );
    }

    // Validar parámetros básicos
    if (datosDescuento.valor < 0) {
      throw ExcepcionDominio.Respuesta400(
        'El valor del descuento no puede ser negativo',
        'Descuento.ValorNegativo'
      );
    }

    // Validar porcentaje (0-100)
    if (
      datosDescuento.tipo === TipoDescuento.PORCENTAJE &&
      datosDescuento.valor > 100
    ) {
      throw ExcepcionDominio.Respuesta400(
        'El porcentaje de descuento no puede ser mayor a 100%',
        'Descuento.PorcentajeInvalido'
      );
    }

    // Validar fechas si se proporcionan
    if (datosDescuento.fechaInicio && datosDescuento.fechaFin) {
      if (datosDescuento.fechaInicio > datosDescuento.fechaFin) {
        throw ExcepcionDominio.Respuesta400(
          'La fecha de inicio no puede ser mayor que la fecha de fin',
          'Descuento.FechasInvalidas'
        );
      }
    }

    // Validar usos máximos
    if (datosDescuento.usosMaximos && datosDescuento.usosMaximos < 0) {
      throw ExcepcionDominio.Respuesta400(
        'Los usos máximos no pueden ser negativos',
        'Descuento.UsosMaximosInvalidos'
      );
    }

    // Crear la entidad de descuento
    const fechaActual = new Date();
    const descuento = new Descuento(
      this.generarIdUnico(),
      datosDescuento.codigo.toUpperCase().trim(),
      datosDescuento.tipo,
      datosDescuento.valor,
      datosDescuento.valorMinimo ?? null,
      datosDescuento.usosMaximos ?? null,
      0, // Usos actuales inician en 0
      datosDescuento.fechaInicio ?? null,
      datosDescuento.fechaFin ?? null,
      true, // Por defecto activo
      fechaActual,
      fechaActual,
      // Nuevos campos para descuentos avanzados
      datosDescuento.configuracionAvanzada ?? null,
      datosDescuento.reglasValidacion ?? null,
      datosDescuento.restricciones ?? null,
      datosDescuento.nombreCampana ?? null,
      datosDescuento.utmSource ?? null,
      datosDescuento.utmMedium ?? null,
      datosDescuento.utmCampaign ?? null,
      datosDescuento.cantidadLleva ?? null,
      datosDescuento.cantidadPaga ?? null,
      datosDescuento.productosAplicables ?? [],
      datosDescuento.coleccionesAplicables ?? [],
      datosDescuento.paisesPermitidos ?? [],
      datosDescuento.segmentosPermitidos ?? [],
      datosDescuento.requisitosMinimos ?? null,
    );

    // Validar la entidad
    if (!descuento.validar()) {
      throw ExcepcionDominio.Respuesta400(
        'Los datos del descuento no son válidos',
        'Descuento.DatosInvalidos'
      );
    }

    // Persistir el descuento
    await this.repositorioDescuento.crear({
      id: descuento.id,
      codigo: descuento.codigo,
      tipo: descuento.tipo,
      valor: descuento.valor,
      valorMinimo: descuento.valorMinimo,
      usosMaximos: descuento.usosMaximos,
      usosActuales: descuento.usosActuales,
      fechaInicio: descuento.fechaInicio,
      fechaFin: descuento.fechaFin,
      activo: descuento.activo,
      fechaCreacion: descuento.fechaCreacion,
      fechaActualizacion: descuento.fechaActualizacion,
    });

    return ServicioRespuestaEstandar.Respuesta201(
      'Descuento creado exitosamente',
      descuento,
      'Descuento.CreadoExitosamente'
    );
  }

  /**
   * Genera un ID único para el descuento
   */
  private generarIdUnico(): string {
    return `descuento_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}