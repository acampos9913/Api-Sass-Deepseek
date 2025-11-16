/**
 * Clase base para excepciones de dominio
 * Implementa el patrón de excepciones simplificadas según los estándares de codificación
 */
export class ExcepcionDominio extends Error {
  public readonly codigoEstado: number;
  public readonly tipoMensaje: string;

  constructor(mensaje: string, codigoEstado: number, tipoMensaje: string) {
    super(mensaje);
    this.name = 'ExcepcionDominio';
    this.codigoEstado = codigoEstado;
    this.tipoMensaje = tipoMensaje;
    
    // Mantener el stack trace en entornos de desarrollo
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ExcepcionDominio);
    }
  }

  /**
   * Métodos estáticos para crear excepciones comunes
   */

  // Errores 400 - Bad Request
  static Respuesta400(mensaje: string, tipoMensaje: string): ExcepcionDominio {
    return new ExcepcionDominio(mensaje, 400, tipoMensaje);
  }

  // Errores 404 - Not Found
  static Respuesta404(mensaje: string, tipoMensaje: string): ExcepcionDominio {
    return new ExcepcionDominio(mensaje, 404, tipoMensaje);
  }

  // Errores 500 - Internal Server Error
  static Respuesta500(mensaje: string, tipoMensaje: string): ExcepcionDominio {
    return new ExcepcionDominio(mensaje, 500, tipoMensaje);
  }

  // Métodos de validación específicos
  static valorRequerido(nombreCampo: string, tipoMensaje: string = 'Validacion.ValorRequerido'): ExcepcionDominio {
    return this.Respuesta400(`El campo '${nombreCampo}' es requerido`, tipoMensaje);
  }

  static valorInvalido(nombreCampo: string, valor: any, tipoMensaje: string = 'Validacion.ValorInvalido'): ExcepcionDominio {
    return this.Respuesta400(`El valor '${valor}' para el campo '${nombreCampo}' es inválido`, tipoMensaje);
  }

  static valorFueraDeRango(nombreCampo: string, min: number, max: number, tipoMensaje: string = 'Validacion.ValorFueraDeRango'): ExcepcionDominio {
    return this.Respuesta400(`El campo '${nombreCampo}' debe estar entre ${min} y ${max}`, tipoMensaje);
  }

  static longitudInvalida(nombreCampo: string, min: number, max: number, tipoMensaje: string = 'Validacion.LongitudInvalida'): ExcepcionDominio {
    return this.Respuesta400(`El campo '${nombreCampo}' debe tener entre ${min} y ${max} caracteres`, tipoMensaje);
  }

  static formatoInvalido(nombreCampo: string, formato: string, tipoMensaje: string = 'Validacion.FormatoInvalido'): ExcepcionDominio {
    return this.Respuesta400(`El campo '${nombreCampo}' debe tener el formato: ${formato}`, tipoMensaje);
  }

  static duplicado(nombreRecurso: string, tipoMensaje: string = 'Recurso.Duplicado'): ExcepcionDominio {
    return this.Respuesta400(`El recurso '${nombreRecurso}' ya existe`, tipoMensaje);
  }

  static noEncontrado(nombreRecurso: string, tipoMensaje: string = 'Recurso.NoEncontrado'): ExcepcionDominio {
    return this.Respuesta404(`El recurso '${nombreRecurso}' no fue encontrado`, tipoMensaje);
  }

  static sinPermisos(mensaje: string = 'No tiene permisos para realizar esta acción', tipoMensaje: string = 'Seguridad.SinPermisos'): ExcepcionDominio {
    return new ExcepcionDominio(mensaje, 403, tipoMensaje);
  }

  static noAutorizado(mensaje: string = 'No autorizado', tipoMensaje: string = 'Seguridad.NoAutorizado'): ExcepcionDominio {
    return new ExcepcionDominio(mensaje, 401, tipoMensaje);
  }

  // Métodos estáticos adicionales para códigos HTTP comunes
  static Respuesta401(mensaje: string, tipoMensaje: string): ExcepcionDominio {
    return new ExcepcionDominio(mensaje, 401, tipoMensaje);
  }

  static Respuesta403(mensaje: string, tipoMensaje: string): ExcepcionDominio {
    return new ExcepcionDominio(mensaje, 403, tipoMensaje);
  }

  /**
   * Métodos para validaciones de negocio específicas
   */
  static estadoInvalido(estadoActual: string, estadoEsperado: string, tipoMensaje: string = 'Negocio.EstadoInvalido'): ExcepcionDominio {
    return this.Respuesta400(`Estado inválido: actual '${estadoActual}', esperado '${estadoEsperado}'`, tipoMensaje);
  }

  static transicionInvalida(estadoOrigen: string, estadoDestino: string, tipoMensaje: string = 'Negocio.TransicionInvalida'): ExcepcionDominio {
    return this.Respuesta400(`Transición inválida: de '${estadoOrigen}' a '${estadoDestino}'`, tipoMensaje);
  }

  static limiteExcedido(nombreLimite: string, valorActual: number, valorMaximo: number, tipoMensaje: string = 'Negocio.LimiteExcedido'): ExcepcionDominio {
    return this.Respuesta400(`Límite excedido: ${nombreLimite} (actual: ${valorActual}, máximo: ${valorMaximo})`, tipoMensaje);
  }

  static conflicto(mensaje: string, tipoMensaje: string = 'Negocio.Conflicto'): ExcepcionDominio {
    return new ExcepcionDominio(mensaje, 409, tipoMensaje);
  }

  /**
   * Método para crear excepciones personalizadas con cualquier código de estado
   */
  static crear(mensaje: string, codigoEstado: number, tipoMensaje: string): ExcepcionDominio {
    return new ExcepcionDominio(mensaje, codigoEstado, tipoMensaje);
  }

  /**
   * Método para convertir errores técnicos en excepciones de dominio
   */
  static desdeError(error: Error, tipoMensaje: string = 'Sistema.ErrorInesperado'): ExcepcionDominio {
    return new ExcepcionDominio(error.message, 500, tipoMensaje);
  }
}