/**
 * Caso de uso para crear un nuevo segmento de clientes
 * Implementa la lógica de negocio para la creación de segmentos
 * Sigue los principios de Domain-Driven Design y Arquitectura Limpia
 */
import { Injectable } from '@nestjs/common';
import type { RepositorioSegmento } from '../interfaces/repositorio-segmento.interface';
import { Segmento, ReglasSegmento } from '../entidades/segmento.entity';
import { ExcepcionDominio } from '../../../comun/excepciones/excepcion-dominio';
import { ServicioRespuestaEstandar, RespuestaEstandar } from '../../../comun/aplicacion/servicios/servicio-respuesta-estandar';

export interface CrearSegmentoDto {
  nombre: string;
  descripcion?: string | null;
  tipo: 'MANUAL' | 'AUTOMATICO' | 'PREDEFINIDO';
  reglas: ReglasSegmento;
  etiquetas?: string[];
  esPublico?: boolean;
  puedeCombinar?: boolean;
  tiendaId: string;
  creadorId: string;
}

@Injectable()
export class CrearSegmentoCasoUso {
  constructor(private readonly repositorioSegmento: RepositorioSegmento) {}

  /**
   * Ejecuta el caso de uso para crear un nuevo segmento
   */
  async ejecutar(datos: CrearSegmentoDto): Promise<RespuestaEstandar> {
    try {
      // Validar datos de entrada
      await this.validarDatosEntrada(datos);

      // Verificar que el nombre no exista
      const nombreExiste = await this.repositorioSegmento.existeNombre(
        datos.nombre,
        datos.tiendaId
      );

      if (nombreExiste) {
        throw ExcepcionDominio.Respuesta400(
          `Ya existe un segmento con el nombre "${datos.nombre}"`,
          'Segmento.NombreDuplicado'
        );
      }

      // Validar reglas de segmentación
      const segmentoTemporal = new Segmento(
        'temp-id',
        datos.nombre,
        datos.descripcion || null,
        datos.tipo,
        'BORRADOR',
        datos.reglas,
        0,
        0,
        null,
        datos.creadorId,
        new Date(),
        new Date(),
        datos.tiendaId,
        null,
        datos.etiquetas || [],
        datos.esPublico || false,
        datos.puedeCombinar !== undefined ? datos.puedeCombinar : true
      );

      if (!segmentoTemporal.validarReglas()) {
        throw ExcepcionDominio.Respuesta400(
          'Las reglas de segmentación no son válidas',
          'Segmento.ReglasInvalidas'
        );
      }

      // Validar que las reglas sean ejecutables
      const reglasEjecutables = await this.repositorioSegmento.validarReglasEjecutables(
        datos.reglas,
        datos.tiendaId
      );

      if (!reglasEjecutables) {
        throw ExcepcionDominio.Respuesta400(
          'Las reglas de segmentación no pueden ser ejecutadas',
          'Segmento.ReglasNoEjecutables'
        );
      }

      // Crear ID único para el segmento
      const segmentoId = this.generarIdSegmento();

      // Crear la entidad de segmento
      const segmento = new Segmento(
        segmentoId,
        datos.nombre,
        datos.descripcion || null,
        datos.tipo,
        'ACTIVO', // Por defecto activo al crear
        datos.reglas,
        0, // porcentajeClientes - se calculará después
        0, // cantidadClientes - se calculará después
        new Date(), // ultimaActividad
        datos.creadorId,
        new Date(), // fechaCreacion
        new Date(), // fechaActualizacion
        datos.tiendaId,
        null, // plantillaId
        datos.etiquetas || [],
        datos.esPublico || false,
        datos.puedeCombinar !== undefined ? datos.puedeCombinar : true
      );

      // Guardar el segmento
      const segmentoGuardado = await this.repositorioSegmento.guardar(segmento);

      // Actualizar estadísticas del segmento
      const segmentoConEstadisticas = await this.repositorioSegmento.actualizarEstadisticasSegmento(
        segmentoGuardado.id,
        datos.tiendaId
      );

      return ServicioRespuestaEstandar.Respuesta201(
        this.aDto(segmentoConEstadisticas),
        'Segmento creado exitosamente',
        'Segmento.CreadoExitosamente'
      );

    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      
      // Error inesperado
      throw ExcepcionDominio.Respuesta500(
        'Error inesperado al crear el segmento',
        'Segmento.ErrorCrear'
      );
    }
  }

  /**
   * Valida los datos de entrada del segmento
   */
  private async validarDatosEntrada(datos: CrearSegmentoDto): Promise<void> {
    // Validar nombre
    if (!datos.nombre || datos.nombre.trim().length === 0) {
      throw ExcepcionDominio.Respuesta400(
        'El nombre del segmento es requerido',
        'Segmento.NombreRequerido'
      );
    }

    if (datos.nombre.length > 100) {
      throw ExcepcionDominio.Respuesta400(
        'El nombre del segmento no puede exceder 100 caracteres',
        'Segmento.NombreMuyLargo'
      );
    }

    // Validar descripción
    if (datos.descripcion && datos.descripcion.length > 500) {
      throw ExcepcionDominio.Respuesta400(
        'La descripción no puede exceder 500 caracteres',
        'Segmento.DescripcionMuyLarga'
      );
    }

    // Validar tipo
    if (!['MANUAL', 'AUTOMATICO', 'PREDEFINIDO'].includes(datos.tipo)) {
      throw ExcepcionDominio.Respuesta400(
        'El tipo de segmento no es válido',
        'Segmento.TipoInvalido'
      );
    }

    // Validar reglas
    if (!datos.reglas || !Array.isArray(datos.reglas.condiciones)) {
      throw ExcepcionDominio.Respuesta400(
        'Las reglas de segmentación son requeridas',
        'Segmento.ReglasRequeridas'
      );
    }

    if (datos.reglas.condiciones.length === 0) {
      throw ExcepcionDominio.Respuesta400(
        'Debe haber al menos una condición de segmentación',
        'Segmento.CondicionesRequeridas'
      );
    }

    // Validar lógica
    if (!datos.reglas.logica || !['Y', 'O'].includes(datos.reglas.logica)) {
      throw ExcepcionDominio.Respuesta400(
        'La lógica de segmentación debe ser "Y" (AND) u "O" (OR)',
        'Segmento.LogicaInvalida'
      );
    }

    // Validar tienda
    if (!datos.tiendaId || datos.tiendaId.trim().length === 0) {
      throw ExcepcionDominio.Respuesta400(
        'El ID de la tienda es requerido',
        'Segmento.TiendaRequerida'
      );
    }

    // Validar creador
    if (!datos.creadorId || datos.creadorId.trim().length === 0) {
      throw ExcepcionDominio.Respuesta400(
        'El ID del creador es requerido',
        'Segmento.CreadorRequerido'
      );
    }

    // Validar etiquetas
    if (datos.etiquetas && datos.etiquetas.length > 20) {
      throw ExcepcionDominio.Respuesta400(
        'No se pueden agregar más de 20 etiquetas',
        'Segmento.DemasiadasEtiquetas'
      );
    }

    if (datos.etiquetas) {
      for (const etiqueta of datos.etiquetas) {
        if (etiqueta.length > 50) {
          throw ExcepcionDominio.Respuesta400(
            'Las etiquetas no pueden exceder 50 caracteres',
            'Segmento.EtiquetaMuyLarga'
          );
        }
      }
    }
  }

  /**
   * Genera un ID único para el segmento
   */
  private generarIdSegmento(): string {
    // En producción, usaríamos una librería como nanoid o cuid
    // Por ahora usamos un timestamp + random para simular
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `seg_${timestamp}_${random}`;
  }

  /**
   * Convierte la entidad Segmento a DTO para respuesta
   */
  private aDto(segmento: Segmento): any {
    return {
      id: segmento.id,
      nombre: segmento.nombre,
      descripcion: segmento.descripcion,
      tipo: segmento.tipo,
      estado: segmento.estado,
      porcentajeClientes: segmento.porcentajeClientes,
      cantidadClientes: segmento.cantidadClientes,
      ultimaActividad: segmento.ultimaActividad,
      fechaCreacion: segmento.fechaCreacion,
      fechaActualizacion: segmento.fechaActualizacion,
      tiendaId: segmento.tiendaId,
      etiquetas: segmento.etiquetas,
      esPublico: segmento.esPublico,
      puedeCombinar: segmento.puedeCombinar,
      puedeUsarEnCampanas: segmento.puedeUsarEnCampanas(),
      descripcionResumida: segmento.obtenerDescripcionResumida(),
      consultaSqlLike: segmento.generarConsultaSqlLike()
    };
  }
}