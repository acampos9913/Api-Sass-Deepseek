import { Injectable, Inject } from '@nestjs/common';
import type { RepositorioSegmento } from '../interfaces/repositorio-segmento.interface';
import { Segmento } from '../entidades/segmento.entity';
import { ExcepcionDominio } from 'src/comun/excepciones/excepcion-dominio';
import { ServicioRespuestaEstandar } from 'src/comun/aplicacion/servicios/servicio-respuesta-estandar';

export interface DatosActualizarSegmento {
  nombre?: string;
  descripcion?: string;
  tipo?: string;
  estado?: string;
  reglas?: any;
  etiquetas?: string[];
  esPublico?: boolean;
  puedeCombinar?: boolean;
  puedeUsarEnCampanas?: boolean;
  descripcionResumida?: string;
}

@Injectable()
export class ActualizarSegmentoCasoUso {
  constructor(
    @Inject('RepositorioSegmento')
    private readonly repositorioSegmento: RepositorioSegmento,
  ) {}

  async ejecutar(
    tiendaId: string,
    segmentoId: string,
    datos: DatosActualizarSegmento,
  ) {
    try {
      // Validar que los datos no estén vacíos
      if (Object.keys(datos).length === 0) {
        throw ExcepcionDominio.Respuesta400(
          'Debe proporcionar al menos un campo para actualizar',
          'Segmento.DatosActualizacionVacios'
        );
      }

      // Obtener el segmento existente
      const segmentoExistente = await this.repositorioSegmento.encontrarPorId(
        segmentoId,
        tiendaId
      );

      if (!segmentoExistente) {
        throw ExcepcionDominio.Respuesta404(
          'Segmento no encontrado',
          'Segmento.NoEncontrado'
        );
      }

      // Validar unicidad del nombre si se está actualizando
      if (datos.nombre && datos.nombre !== segmentoExistente.nombre) {
        const segmentosConMismoNombre = await this.repositorioSegmento.encontrarPorNombre(
          datos.nombre,
          tiendaId
        );

        const segmentoDuplicado = segmentosConMismoNombre.find(
          segmento => segmento.id !== segmentoId
        );

        if (segmentoDuplicado) {
          throw ExcepcionDominio.Respuesta400(
            'Ya existe un segmento con ese nombre',
            'Segmento.NombreDuplicado'
          );
        }
      }

      // Validar reglas si se están actualizando para segmentos automáticos
      if (datos.reglas && datos.tipo !== 'MANUAL') {
        this.validarReglasSegmento(datos.reglas);
      }

      // Convertir el estado al tipo correcto si está presente
      const estado = datos.estado as 'ACTIVO' | 'INACTIVO' | 'BORRADOR' | undefined;

      // Usar el método de la entidad para actualizar la información
      const segmentoActualizado = segmentoExistente.actualizarInformacion(
        datos.nombre,
        datos.descripcion,
        estado,
        datos.reglas,
        datos.etiquetas,
        datos.esPublico,
        datos.puedeCombinar
      );

      // Guardar en el repositorio
      await this.repositorioSegmento.actualizar(segmentoActualizado);

      // Si el segmento es automático y se actualizaron las reglas, recalcular membresías
      if (datos.reglas && segmentoActualizado.tipo === 'AUTOMATICO') {
        await this.recalcularMembresiasAutomaticas(segmentoActualizado);
      }

      // Crear respuesta con los datos necesarios
      const respuesta = {
        id: segmentoActualizado.id,
        nombre: segmentoActualizado.nombre,
        descripcion: segmentoActualizado.descripcion,
        tipo: segmentoActualizado.tipo,
        estado: segmentoActualizado.estado,
        reglas: segmentoActualizado.reglas,
        etiquetas: segmentoActualizado.etiquetas,
        esPublico: segmentoActualizado.esPublico,
        puedeCombinar: segmentoActualizado.puedeCombinar,
        porcentajeClientes: segmentoActualizado.porcentajeClientes,
        cantidadClientes: segmentoActualizado.cantidadClientes,
        ultimaActividad: segmentoActualizado.ultimaActividad,
        fechaCreacion: segmentoActualizado.fechaCreacion,
        fechaActualizacion: segmentoActualizado.fechaActualizacion,
        tiendaId: segmentoActualizado.tiendaId,
        plantillaId: segmentoActualizado.plantillaId,
        descripcionResumida: segmentoActualizado.obtenerDescripcionResumida(),
      };

      return ServicioRespuestaEstandar.Respuesta200(
        'Segmento actualizado exitosamente',
        respuesta,
        'Segmento.ActualizadoExitosamente'
      );
    } catch (error) {
      // Si ya es una ExcepcionDominio, la relanzamos
      if (error instanceof ExcepcionDominio) {
        throw error;
      }

      // Para otros errores, lanzamos una excepción genérica
      throw ExcepcionDominio.Respuesta500(
        'Error al actualizar segmento',
        'Segmento.ErrorActualizacion'
      );
    }
  }

  private validarReglasSegmento(reglas: any): void {
    if (!reglas) {
      throw ExcepcionDominio.Respuesta400(
        'Las reglas son requeridas para segmentos automáticos',
        'Segmento.ReglasRequeridas'
      );
    }

    // Validar estructura básica de reglas
    if (!Array.isArray(reglas.condiciones)) {
      throw ExcepcionDominio.Respuesta400(
        'Las reglas deben contener un array de condiciones',
        'Segmento.ReglasEstructuraInvalida'
      );
    }

    if (reglas.condiciones.length === 0) {
      throw ExcepcionDominio.Respuesta400(
        'Debe definir al menos una condición para el segmento automático',
        'Segmento.CondicionesRequeridas'
      );
    }

    // Validar cada condición
    for (const condicion of reglas.condiciones) {
      if (!condicion.campo || !condicion.operador || condicion.valor === undefined) {
        throw ExcepcionDominio.Respuesta400(
          'Cada condición debe tener campo, operador y valor',
          'Segmento.CondicionIncompleta'
        );
      }

      // Validar operadores permitidos
      const operadoresPermitidos = [
        'IGUAL', 'DIFERENTE', 'MAYOR', 'MAYOR_IGUAL', 
        'MENOR', 'MENOR_IGUAL', 'CONTENGA', 'NO_CONTENGA',
        'INICIE_CON', 'TERMINE_CON'
      ];

      if (!operadoresPermitidos.includes(condicion.operador)) {
        throw ExcepcionDominio.Respuesta400(
          `Operador no válido: ${condicion.operador}`,
          'Segmento.OperadorInvalido'
        );
      }
    }

    // Validar operador lógico
    if (reglas.operadorLogico && !['AND', 'OR'].includes(reglas.operadorLogico)) {
      throw ExcepcionDominio.Respuesta400(
        'Operador lógico debe ser AND u OR',
        'Segmento.OperadorLogicoInvalido'
      );
    }
  }

  private async recalcularMembresiasAutomaticas(segmento: Segmento): Promise<void> {
    try {
      // En una implementación completa, aquí se recalcularían las membresías
      // basándose en las nuevas reglas del segmento automático
      // Por ahora, es un placeholder para la funcionalidad futura
      console.log(`Recalculando membresías para segmento automático: ${segmento.id}`);
      
      // Lógica para recalcular clientes que cumplen las nuevas reglas
      // y actualizar la tabla de membresías
    } catch (error) {
      console.error('Error al recalcular membresías automáticas:', error);
      // No lanzamos error aquí para no romper la actualización del segmento
      // pero podríamos registrar el error para monitoreo
    }
  }
}