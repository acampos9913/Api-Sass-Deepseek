import { Injectable } from '@nestjs/common';
import { Descuento } from '../entidades/descuento.entity';
import { TipoDescuento } from '../enums/tipo-descuento.enum';
import type { RepositorioDescuento } from '../interfaces/repositorio-descuento.interface';
import { ServicioRespuestaEstandar, RespuestaEstandar } from '../../../comun/aplicacion/servicios/servicio-respuesta-estandar';
import { ExcepcionDominio } from '../../../comun/excepciones/excepcion-dominio';

/**
 * Interfaz para los parámetros de listar descuentos
 */
export interface ParametrosListarDescuentos {
  pagina: number;
  limite: number;
  activo?: boolean;
  tipo?: TipoDescuento;
  busqueda?: string;
}

/**
 * Interfaz para el resultado paginado de descuentos
 */
export interface ResultadoListarDescuentos {
  elementos: Descuento[];
  paginacion: {
    totalElementos: number;
    totalPaginas: number;
    paginaActual: number;
    limite: number;
    tieneSiguiente: boolean;
    tieneAnterior: boolean;
  };
}

/**
 * Caso de uso para listar descuentos con paginación y filtros
 * Sigue los principios de la arquitectura limpia
 */
@Injectable()
export class ListarDescuentosCasoUso {
  constructor(
    private readonly repositorioDescuento: RepositorioDescuento,
  ) {}

  /**
   * Ejecuta el caso de uso para listar descuentos
   * @param parametros Parámetros de paginación y filtros
   * @returns Respuesta estándar con lista paginada de descuentos
   */
  async ejecutar(parametros: ParametrosListarDescuentos): Promise<RespuestaEstandar<any>> {
    // Validar parámetros de paginación
    this.validarParametrosPaginacion(parametros.pagina, parametros.limite);

    // Calcular offset para la paginación
    const offset = (parametros.pagina - 1) * parametros.limite;

    // Obtener descuentos del repositorio
    const resultado = await this.repositorioDescuento.listar({
      pagina: parametros.pagina,
      limite: parametros.limite,
      activo: parametros.activo,
      tipo: parametros.tipo,
      busqueda: parametros.busqueda,
    });

    // Convertir los datos del repositorio a entidades Descuento
    const elementos = resultado.descuentos.map(descuentoData =>
      new Descuento(
        descuentoData.id,
        descuentoData.codigo,
        descuentoData.tipo,
        descuentoData.valor,
        descuentoData.valorMinimo,
        descuentoData.usosMaximos,
        descuentoData.usosActuales,
        descuentoData.fechaInicio,
        descuentoData.fechaFin,
        descuentoData.activo,
        descuentoData.fechaCreacion,
        descuentoData.fechaActualizacion
      )
    );

    const totalElementos = resultado.total;

    // Calcular información de paginación
    const totalPaginas = Math.ceil(totalElementos / parametros.limite);
    const tieneSiguiente = parametros.pagina < totalPaginas;
    const tieneAnterior = parametros.pagina > 1;

    const data = {
      elementos: elementos,
      paginacion: {
        totalElementos,
        totalPaginas,
        paginaActual: parametros.pagina,
        limite: parametros.limite,
        tieneSiguiente,
        tieneAnterior,
      },
    };

    return ServicioRespuestaEstandar.Respuesta200(
      'Lista de descuentos obtenida exitosamente',
      data,
      'Descuento.ListaObtenida'
    );
  }

  /**
   * Valida los parámetros de paginación
   * @param pagina Número de página
   * @param limite Límite de elementos por página
   */
  private validarParametrosPaginacion(pagina: number, limite: number): void {
    if (pagina < 1) {
      throw ExcepcionDominio.Respuesta400(
        'El número de página debe ser mayor o igual a 1',
        'Descuento.PaginaInvalida'
      );
    }

    if (limite < 1 || limite > 100) {
      throw ExcepcionDominio.Respuesta400(
        'El límite debe estar entre 1 y 100',
        'Descuento.LimiteInvalido'
      );
    }
  }
}