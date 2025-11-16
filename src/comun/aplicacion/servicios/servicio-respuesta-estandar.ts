import { Injectable } from '@nestjs/common';

/**
 * Interfaz para la respuesta estándar según la arquitectura definida
 * Sigue el estándar de respuesta API con estructura uniforme
 */
export interface RespuestaEstandar<T = any> {
  mensaje: string;
  data: T | null;
  tipo_mensaje: string;
  estado_respuesta: number;
}

/**
 * Servicio para construir respuestas estándar según la arquitectura definida
 * Implementa métodos estáticos específicos por código HTTP según los estándares
 * Centraliza la lógica de construcción de respuestas en la capa de aplicación
 */
@Injectable()
export class ServicioRespuestaEstandar {
  /**
   * Construye una respuesta exitosa (200 OK)
   */
  static Respuesta200<T>(mensaje: string, data: T, tipoMensaje: string = 'Proceso.Exito'): RespuestaEstandar<T> {
    return {
      mensaje,
      data,
      tipo_mensaje: tipoMensaje,
      estado_respuesta: 200,
    };
  }

  /**
   * Construye una respuesta de creación exitosa (201 Created)
   */
  static Respuesta201<T>(mensaje: string, data: T, tipoMensaje: string = 'Proceso.Exito'): RespuestaEstandar<T> {
    return {
      mensaje,
      data,
      tipo_mensaje: tipoMensaje,
      estado_respuesta: 201,
    };
  }
}