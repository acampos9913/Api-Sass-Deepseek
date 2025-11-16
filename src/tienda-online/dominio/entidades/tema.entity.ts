import { ExcepcionDominio } from '../../../comun/excepciones/excepcion-dominio';

/**
 * Entidad de Dominio para Temas de la Tienda Online
 * Sigue los principios de Domain-Driven Design y Arquitectura Limpia
 */
export class Tema {
  private constructor(
    private readonly _id: string,
    private _nombre: string,
    private _descripcion: string | null,
    private _activo: boolean,
    private _esPredeterminado: boolean,
    private _configuracion: Record<string, any>,
    private _fechaCreacion: Date,
    private _fechaActualizacion: Date,
    private _tiendaId: string | null,
    private _creadorId: string,
  ) {}

  /**
   * Factory method para crear un nuevo Tema
   */
  public static crear(
    id: string,
    nombre: string,
    descripcion: string | null,
    activo: boolean,
    esPredeterminado: boolean,
    configuracion: Record<string, any>,
    creadorId: string,
    tiendaId: string | null,
  ): Tema {
    this.validarParametrosCreacion(
      id,
      nombre,
      configuracion,
      creadorId,
    );

    const fechaActual = new Date();
    return new Tema(
      id,
      nombre,
      descripcion,
      activo,
      esPredeterminado,
      configuracion,
      fechaActual,
      fechaActual,
      tiendaId,
      creadorId,
    );
  }

  /**
   * Factory method para reconstruir un Tema desde la persistencia
   */
  public static reconstruir(
    id: string,
    nombre: string,
    descripcion: string | null,
    activo: boolean,
    esPredeterminado: boolean,
    configuracion: Record<string, any>,
    fechaCreacion: Date,
    fechaActualizacion: Date,
    tiendaId: string | null,
    creadorId: string,
  ): Tema {
    this.validarParametrosReconstruccion(
      id,
      nombre,
      configuracion,
      creadorId,
      fechaCreacion,
      fechaActualizacion,
    );

    return new Tema(
      id,
      nombre,
      descripcion,
      activo,
      esPredeterminado,
      configuracion,
      fechaCreacion,
      fechaActualizacion,
      tiendaId,
      creadorId,
    );
  }

  /**
   * Validaciones de parámetros para creación
   */
  private static validarParametrosCreacion(
    id: string,
    nombre: string,
    configuracion: Record<string, any>,
    creadorId: string,
  ): void {
    if (!id || id.trim().length === 0) {
      throw ExcepcionDominio.valorRequerido('ID del tema', 'Tema.IdRequerido');
    }

    if (!nombre || nombre.trim().length === 0) {
      throw ExcepcionDominio.valorRequerido('nombre del tema', 'Tema.NombreRequerido');
    }

    if (nombre.trim().length > 100) {
      throw ExcepcionDominio.longitudInvalida('nombre del tema', 1, 100, 'Tema.NombreLongitudInvalida');
    }

    if (!configuracion || typeof configuracion !== 'object') {
      throw ExcepcionDominio.valorRequerido('configuración del tema como objeto', 'Tema.ConfiguracionRequerida');
    }

    if (!creadorId || creadorId.trim().length === 0) {
      throw ExcepcionDominio.valorRequerido('ID del creador', 'Tema.CreadorIdRequerido');
    }
  }

  /**
   * Validaciones de parámetros para reconstrucción
   */
  private static validarParametrosReconstruccion(
    id: string,
    nombre: string,
    configuracion: Record<string, any>,
    creadorId: string,
    fechaCreacion: Date,
    fechaActualizacion: Date,
  ): void {
    this.validarParametrosCreacion(id, nombre, configuracion, creadorId);

    if (!fechaCreacion) {
      throw ExcepcionDominio.valorRequerido('fecha de creación', 'Tema.FechaCreacionRequerida');
    }

    if (!fechaActualizacion) {
      throw ExcepcionDominio.valorRequerido('fecha de actualización', 'Tema.FechaActualizacionRequerida');
    }

    if (fechaActualizacion < fechaCreacion) {
      throw ExcepcionDominio.valorInvalido('fecha de actualización no puede ser anterior a la fecha de creación', 'Tema.FechaActualizacionInvalida');
    }
  }

  /**
   * Métodos de negocio
   */

  /**
   * Activar el tema
   */
  public activar(): void {
    if (this._activo) {
      throw ExcepcionDominio.estadoInvalido('El tema ya está activo', 'Tema.YaActivo');
    }

    this._activo = true;
    this._fechaActualizacion = new Date();
  }

  /**
   * Desactivar el tema
   */
  public desactivar(): void {
    if (!this._activo) {
      throw ExcepcionDominio.estadoInvalido('El tema ya está inactivo', 'Tema.YaInactivo');
    }

    this._activo = false;
    this._fechaActualizacion = new Date();
  }

  /**
   * Establecer como tema predeterminado
   */
  public establecerComoPredeterminado(): void {
    if (this._esPredeterminado) {
      throw ExcepcionDominio.estadoInvalido('El tema ya es predeterminado', 'Tema.YaPredeterminado');
    }

    this._esPredeterminado = true;
    this._fechaActualizacion = new Date();
  }

  /**
   * Quitar como tema predeterminado
   */
  public quitarComoPredeterminado(): void {
    if (!this._esPredeterminado) {
      throw ExcepcionDominio.estadoInvalido('El tema no es predeterminado', 'Tema.NoEsPredeterminado');
    }

    this._esPredeterminado = false;
    this._fechaActualizacion = new Date();
  }

  /**
   * Actualizar la configuración del tema
   */
  public actualizarConfiguracion(configuracion: Record<string, any>): void {
    if (!configuracion || typeof configuracion !== 'object') {
      throw ExcepcionDominio.valorRequerido('configuración del tema como objeto', 'Tema.ConfiguracionRequerida');
    }

    this._configuracion = configuracion;
    this._fechaActualizacion = new Date();
  }

  /**
   * Actualizar información básica del tema
   */
  public actualizarInformacion(
    nombre: string,
    descripcion: string | null,
  ): void {
    if (!nombre || nombre.trim().length === 0) {
      throw ExcepcionDominio.valorRequerido('nombre del tema', 'Tema.NombreRequerido');
    }

    if (nombre.trim().length > 100) {
      throw ExcepcionDominio.longitudInvalida('nombre del tema', 1, 100, 'Tema.NombreLongitudInvalida');
    }

    this._nombre = nombre;
    this._descripcion = descripcion;
    this._fechaActualizacion = new Date();
  }

  /**
   * Getters
   */
  get id(): string {
    return this._id;
  }

  get nombre(): string {
    return this._nombre;
  }

  get descripcion(): string | null {
    return this._descripcion;
  }

  get activo(): boolean {
    return this._activo;
  }

  get esPredeterminado(): boolean {
    return this._esPredeterminado;
  }

  get configuracion(): Record<string, any> {
    return this._configuracion;
  }

  get fechaCreacion(): Date {
    return this._fechaCreacion;
  }

  get fechaActualizacion(): Date {
    return this._fechaActualizacion;
  }

  get tiendaId(): string | null {
    return this._tiendaId;
  }

  get creadorId(): string {
    return this._creadorId;
  }

  /**
   * Verifica si el tema está activo
   */
  get estaActivo(): boolean {
    return this._activo;
  }

  /**
   * Verifica si el tema es predeterminado
   */
  get esPredeterminadoActivo(): boolean {
    return this._esPredeterminado && this._activo;
  }

  /**
   * Verifica si el tema pertenece a una tienda específica
   */
  public perteneceATienda(tiendaId: string): boolean {
    return this._tiendaId === tiendaId;
  }

  /**
   * Verifica si el tema fue creado por un usuario específico
   */
  public fueCreadoPorUsuario(creadorId: string): boolean {
    return this._creadorId === creadorId;
  }

  /**
   * Obtiene una configuración específica del tema
   */
  public obtenerConfiguracion(clave: string): any {
    return this._configuracion[clave];
  }

  /**
   * Actualiza una configuración específica del tema
   */
  public actualizarConfiguracionEspecifica(clave: string, valor: any): void {
    this._configuracion[clave] = valor;
    this._fechaActualizacion = new Date();
  }
}