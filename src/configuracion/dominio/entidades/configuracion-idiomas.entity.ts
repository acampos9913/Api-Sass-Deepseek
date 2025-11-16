import { ExcepcionDominio } from '../../../comun/excepciones/excepcion-dominio';
import {
  ConfiguracionIdiomasDto,
  ActualizarConfiguracionIdiomasDto,
  AsignarIdiomaDominioDto,
  EstadoIdiomaEnum,
  EstadoTraduccionEnum,
  FormatoArchivoEnum
} from '../../aplicacion/dto/configuracion-idiomas.dto';

/**
 * Entidad de Configuración de Idiomas
 * Implementa todas las reglas de negocio y validaciones para gestión multilingüe
 */
export class ConfiguracionIdiomas {
  private constructor(
    private readonly _id: string,
    private readonly _tiendaId: string,
    private _codigoIdioma: string,
    private _nombreIdioma: string,
    private _estado: EstadoIdiomaEnum,
    private _predeterminado: boolean,
    private _dominiosAsociados: string[] = [],
    private _estadoTraduccion: EstadoTraduccionEnum,
    private _porcentajeTraduccion: number,
    private _fechaCreacion: Date = new Date(),
    private _fechaActualizacion: Date = new Date()
  ) {
    this.validar();
  }

  /**
   * Factory method para crear una nueva configuración de idiomas
   */
  public static crear(
    id: string,
    tiendaId: string,
    codigoIdioma: string,
    nombreIdioma: string,
    estado: EstadoIdiomaEnum,
    predeterminado: boolean,
    dominiosAsociados: string[] = [],
    estadoTraduccion: EstadoTraduccionEnum = EstadoTraduccionEnum.SIN_TRADUCIR,
    porcentajeTraduccion: number = 0
  ): ConfiguracionIdiomas {
    return new ConfiguracionIdiomas(
      id,
      tiendaId,
      codigoIdioma,
      nombreIdioma,
      estado,
      predeterminado,
      dominiosAsociados,
      estadoTraduccion,
      porcentajeTraduccion
    );
  }

  /**
   * Factory method para reconstruir desde persistencia
   */
  public static reconstruir(
    id: string,
    tiendaId: string,
    codigoIdioma: string,
    nombreIdioma: string,
    estado: EstadoIdiomaEnum,
    predeterminado: boolean,
    dominiosAsociados: string[] = [],
    estadoTraduccion: EstadoTraduccionEnum,
    porcentajeTraduccion: number,
    fechaCreacion: Date = new Date(),
    fechaActualizacion: Date = new Date()
  ): ConfiguracionIdiomas {
    return new ConfiguracionIdiomas(
      id,
      tiendaId,
      codigoIdioma,
      nombreIdioma,
      estado,
      predeterminado,
      dominiosAsociados,
      estadoTraduccion,
      porcentajeTraduccion,
      fechaCreacion,
      fechaActualizacion
    );
  }

  /**
   * Validaciones de dominio
   */
  private validar(): void {
    this.validarCodigoIdioma();
    this.validarNombreIdioma();
    this.validarPorcentajeTraduccion();
    this.validarDominiosAsociados();
    this.validarConsistenciaEstado();
  }

  /**
   * Validar código de idioma según ISO 639-1
   */
  private validarCodigoIdioma(): void {
    const codigosValidos = [
      'es', 'en', 'fr', 'am', 'af', 'sq', 'ar', 'hy', 'as', 'az', 'eu', 'be', 'bn', 'bs', 'bg', 'ca', 
      'zh', 'hr', 'cs', 'da', 'nl', 'eo', 'et', 'fi', 'gl', 'ga', 'de', 'el', 'gu', 'ht', 'he', 'hi', 
      'hu', 'is', 'id', 'it', 'ja', 'kn', 'kk', 'km', 'ko', 'lv', 'lt', 'mk', 'ms', 'ml', 'mt', 'mr', 
      'mn', 'ne', 'no', 'fa', 'pl', 'pt', 'pa', 'ro', 'ru', 'sr', 'sk', 'sl', 'so', 'st', 'sw', 'sv', 
      'tl', 'ta', 'te', 'th', 'tr', 'uk', 'ur', 'uz', 'vi', 'cy', 'xh', 'yi', 'zu'
    ];

    if (!codigosValidos.includes(this._codigoIdioma)) {
      throw ExcepcionDominio.Respuesta400(
        `Código de idioma "${this._codigoIdioma}" no es válido. Debe ser un código ISO 639-1 válido.`,
        'Idiomas.CodigoInvalido'
      );
    }
  }

  /**
   * Validar nombre del idioma
   */
  private validarNombreIdioma(): void {
    if (!this._nombreIdioma || this._nombreIdioma.trim().length < 2) {
      throw ExcepcionDominio.Respuesta400(
        'El nombre del idioma debe tener al menos 2 caracteres',
        'Idiomas.NombreInvalido'
      );
    }

    if (this._nombreIdioma.length > 50) {
      throw ExcepcionDominio.Respuesta400(
        'El nombre del idioma no puede exceder los 50 caracteres',
        'Idiomas.NombreDemasiadoLargo'
      );
    }
  }

  /**
   * Validar porcentaje de traducción
   */
  private validarPorcentajeTraduccion(): void {
    if (this._porcentajeTraduccion < 0 || this._porcentajeTraduccion > 100) {
      throw ExcepcionDominio.Respuesta400(
        'El porcentaje de traducción debe estar entre 0 y 100',
        'Idiomas.PorcentajeTraduccionInvalido'
      );
    }

    // Validar consistencia entre estado de traducción y porcentaje
    if (this._estadoTraduccion === EstadoTraduccionEnum.TRADUCIDO && this._porcentajeTraduccion < 100) {
      throw ExcepcionDominio.Respuesta400(
        'Un idioma marcado como "traducido" debe tener el 100% de traducción completada',
        'Idiomas.EstadoTraduccionInconsistente'
      );
    }

    if (this._estadoTraduccion === EstadoTraduccionEnum.SIN_TRADUCIR && this._porcentajeTraduccion > 0) {
      throw ExcepcionDominio.Respuesta400(
        'Un idioma marcado como "sin traducir" debe tener 0% de traducción',
        'Idiomas.EstadoTraduccionInconsistente'
      );
    }
  }

  /**
   * Validar dominios asociados
   */
  private validarDominiosAsociados(): void {
    const dominiosUnicos = new Set(this._dominiosAsociados);
    
    if (this._dominiosAsociados.length !== dominiosUnicos.size) {
      throw ExcepcionDominio.Respuesta400(
        'No pueden existir dominios duplicados en la lista de dominios asociados',
        'Idiomas.DominiosDuplicados'
      );
    }

    // Validar formato de dominios
    for (const dominio of this._dominiosAsociados) {
      if (!this.esDominioValido(dominio)) {
        throw ExcepcionDominio.Respuesta400(
          `El dominio "${dominio}" no tiene un formato válido`,
          'Idiomas.DominioInvalido'
        );
      }
    }
  }

  /**
   * Validar consistencia del estado
   */
  private validarConsistenciaEstado(): void {
    // Un idioma no publicado no puede ser predeterminado
    if (this._estado === EstadoIdiomaEnum.NO_PUBLICADO && this._predeterminado) {
      throw ExcepcionDominio.Respuesta400(
        'Un idioma no publicado no puede ser el idioma predeterminado',
        'Idiomas.EstadoPredeterminadoInconsistente'
      );
    }

    // Un idioma sin traducir no puede estar publicado
    if (this._estado === EstadoIdiomaEnum.PUBLICADO && this._estadoTraduccion === EstadoTraduccionEnum.SIN_TRADUCIR) {
      throw ExcepcionDominio.Respuesta400(
        'Un idioma sin traducir no puede estar publicado',
        'Idiomas.EstadoPublicacionInconsistente'
      );
    }
  }

  /**
   * Verificar si un dominio es válido
   */
  private esDominioValido(dominio: string): boolean {
    const dominioRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z]{2,})+$/;
    return dominioRegex.test(dominio);
  }

  /**
   * Métodos de negocio - Gestión básica
   */

  /**
   * Actualizar configuración de idiomas
   */
  public actualizar(datos: ActualizarConfiguracionIdiomasDto): void {
    if (datos.codigo_idioma !== undefined) {
      this._codigoIdioma = datos.codigo_idioma;
    }

    if (datos.nombre_idioma !== undefined) {
      this._nombreIdioma = datos.nombre_idioma;
    }

    if (datos.estado !== undefined) {
      this._estado = datos.estado as EstadoIdiomaEnum;
    }

    if (datos.predeterminado !== undefined) {
      this._predeterminado = datos.predeterminado;
    }

    if (datos.dominios_asociados !== undefined) {
      this._dominiosAsociados = datos.dominios_asociados;
    }

    if (datos.estado_traduccion !== undefined) {
      this._estadoTraduccion = datos.estado_traduccion as EstadoTraduccionEnum;
    }

    if (datos.porcentaje_traduccion !== undefined) {
      this._porcentajeTraduccion = datos.porcentaje_traduccion;
    }

    this._fechaActualizacion = new Date();
    this.validar();
  }

  /**
   * Publicar idioma
   */
  public publicar(): void {
    if (this._estadoTraduccion === EstadoTraduccionEnum.SIN_TRADUCIR) {
      throw ExcepcionDominio.Respuesta400(
        'No se puede publicar un idioma sin traducciones',
        'Idiomas.NoSePuedePublicarSinTraducciones'
      );
    }

    this._estado = EstadoIdiomaEnum.PUBLICADO;
    this._fechaActualizacion = new Date();
    this.validar();
  }

  /**
   * Despublicar idioma
   */
  public despublicar(): void {
    this._estado = EstadoIdiomaEnum.NO_PUBLICADO;
    
    // Si era predeterminado, quitar predeterminado
    if (this._predeterminado) {
      this._predeterminado = false;
    }

    this._fechaActualizacion = new Date();
    this.validar();
  }

  /**
   * Establecer como idioma predeterminado
   */
  public establecerComoPredeterminado(): void {
    if (this._estado === EstadoIdiomaEnum.NO_PUBLICADO) {
      throw ExcepcionDominio.Respuesta400(
        'No se puede establecer como predeterminado un idioma no publicado',
        'Idiomas.NoSePuedeEstablecerPredeterminadoNoPublicado'
      );
    }

    this._predeterminado = true;
    this._fechaActualizacion = new Date();
    this.validar();
  }

  /**
   * Quitar como idioma predeterminado
   */
  public quitarComoPredeterminado(): void {
    this._predeterminado = false;
    this._fechaActualizacion = new Date();
    this.validar();
  }

  /**
   * Métodos de negocio - Gestión de traducciones
   */

  /**
   * Actualizar progreso de traducción
   */
  public actualizarProgresoTraduccion(porcentaje: number, estado?: EstadoTraduccionEnum): void {
    this._porcentajeTraduccion = porcentaje;
    
    if (estado) {
      this._estadoTraduccion = estado;
    } else {
      // Determinar estado automáticamente basado en porcentaje
      if (porcentaje === 0) {
        this._estadoTraduccion = EstadoTraduccionEnum.SIN_TRADUCIR;
      } else if (porcentaje === 100) {
        this._estadoTraduccion = EstadoTraduccionEnum.TRADUCIDO;
      } else {
        this._estadoTraduccion = EstadoTraduccionEnum.EN_PROGRESO;
      }
    }

    this._fechaActualizacion = new Date();
    this.validar();
  }

  /**
   * Marcar como completamente traducido
   */
  public marcarComoTraducido(): void {
    this._porcentajeTraduccion = 100;
    this._estadoTraduccion = EstadoTraduccionEnum.TRADUCIDO;
    this._fechaActualizacion = new Date();
    this.validar();
  }

  /**
   * Métodos de negocio - Gestión de dominios
   */

  /**
   * Asignar idioma a dominio
   */
  public asignarADominio(asignacion: AsignarIdiomaDominioDto): void {
    if (this._dominiosAsociados.includes(asignacion.dominio)) {
      throw ExcepcionDominio.Respuesta400(
        `El idioma ya está asignado al dominio "${asignacion.dominio}"`,
        'Idiomas.DominioYaAsignado'
      );
    }

    this._dominiosAsociados.push(asignacion.dominio);
    this._fechaActualizacion = new Date();
    this.validar();
  }

  /**
   * Desasignar idioma de dominio
   */
  public desasignarDeDominio(dominio: string): void {
    const dominioIndex = this._dominiosAsociados.indexOf(dominio);
    
    if (dominioIndex === -1) {
      throw ExcepcionDominio.Respuesta404(
        `El idioma no está asignado al dominio "${dominio}"`,
        'Idiomas.DominioNoAsignado'
      );
    }

    this._dominiosAsociados.splice(dominioIndex, 1);
    this._fechaActualizacion = new Date();
    this.validar();
  }

  /**
   * Obtener dominios asociados
   */
  public obtenerDominiosAsociados(): string[] {
    return [...this._dominiosAsociados];
  }

  /**
   * Verificar si está asignado a un dominio específico
   */
  public estaAsignadoADominio(dominio: string): boolean {
    return this._dominiosAsociados.includes(dominio);
  }

  /**
   * Métodos de negocio - Validaciones de negocio
   */

  /**
   * Verificar si puede ser eliminado
   */
  public puedeSerEliminado(): boolean {
    // No se puede eliminar el idioma predeterminado
    if (this._predeterminado) {
      return false;
    }

    // No se puede eliminar si está asignado a dominios
    if (this._dominiosAsociados.length > 0) {
      return false;
    }

    return true;
  }

  /**
   * Verificar si puede ser despublicado
   */
  public puedeSerDespublicado(): boolean {
    // No se puede despublicar si es el único idioma publicado
    // Esta validación requiere contexto externo, se manejará en el caso de uso
    return true;
  }

  /**
   * Métodos de utilidad
   */

  /**
   * Convertir a DTO
   */
  public aDto(): ConfiguracionIdiomasDto {
    return {
      codigo_idioma: this._codigoIdioma,
      nombre_idioma: this._nombreIdioma,
      estado: this._estado,
      predeterminado: this._predeterminado,
      dominios_asociados: this._dominiosAsociados,
      estado_traduccion: this._estadoTraduccion,
      porcentaje_traduccion: this._porcentajeTraduccion
    };
  }

  /**
   * Obtener resumen del estado de traducción
   */
  public obtenerResumenTraduccion(): { estado: string; porcentaje: number; puedePublicar: boolean } {
    return {
      estado: this._estadoTraduccion,
      porcentaje: this._porcentajeTraduccion,
      puedePublicar: this._estadoTraduccion !== EstadoTraduccionEnum.SIN_TRADUCIR && this._porcentajeTraduccion > 0
    };
  }

  /**
   * Getters
   */
  get id(): string {
    return this._id;
  }

  get tiendaId(): string {
    return this._tiendaId;
  }

  get codigoIdioma(): string {
    return this._codigoIdioma;
  }

  get nombreIdioma(): string {
    return this._nombreIdioma;
  }

  get estado(): EstadoIdiomaEnum {
    return this._estado;
  }

  get predeterminado(): boolean {
    return this._predeterminado;
  }

  get dominiosAsociados(): string[] {
    return this._dominiosAsociados;
  }

  get estadoTraduccion(): EstadoTraduccionEnum {
    return this._estadoTraduccion;
  }

  get porcentajeTraduccion(): number {
    return this._porcentajeTraduccion;
  }

  get fechaCreacion(): Date {
    return this._fechaCreacion;
  }

  get fechaActualizacion(): Date {
    return this._fechaActualizacion;
  }

  /**
   * Métodos estáticos para validaciones
   */

  /**
   * Validar formato de archivo de importación/exportación
   */
  public static validarFormatoArchivo(formato: string): boolean {
    return Object.values(FormatoArchivoEnum).includes(formato as FormatoArchivoEnum);
  }

  /**
   * Validar estrategia de conflicto
   */
  public static validarEstrategiaConflicto(estrategia: string): boolean {
    const estrategiasValidas = ['sobrescribir', 'omitir', 'fusionar'];
    return estrategiasValidas.includes(estrategia);
  }

  /**
   * Validar filtro de exportación
   */
  public static validarFiltroExportacion(filtro: string): boolean {
    const filtrosValidos = ['todos', 'publicados'];
    return filtrosValidos.includes(filtro);
  }
}