import { ExcepcionDominio } from '../../../comun/excepciones/excepcion-dominio';

/**
 * Entidad de Dominio para Páginas de la Tienda Online
 * Sigue los principios de Domain-Driven Design y Arquitectura Limpia
 */
export class Pagina {
  private constructor(
    private readonly _id: string,
    private _titulo: string,
    private _contenido: string | null,
    private _slug: string,
    private _metaTitulo: string | null,
    private _metaDescripcion: string | null,
    private _visible: boolean,
    private _fechaCreacion: Date,
    private _fechaActualizacion: Date,
    private _fechaPublicacion: Date | null,
    private _autorId: string,
    private _tiendaId: string | null,
  ) {}

  /**
   * Factory method para crear una nueva Página
   */
  public static crear(
    id: string,
    titulo: string,
    contenido: string | null,
    slug: string,
    metaTitulo: string | null,
    metaDescripcion: string | null,
    visible: boolean,
    autorId: string,
    tiendaId: string | null,
  ): Pagina {
    this.validarParametrosCreacion(
      id,
      titulo,
      slug,
      autorId,
    );

    const fechaActual = new Date();
    return new Pagina(
      id,
      titulo,
      contenido,
      slug,
      metaTitulo,
      metaDescripcion,
      visible,
      fechaActual,
      fechaActual,
      visible ? fechaActual : null,
      autorId,
      tiendaId,
    );
  }

  /**
   * Factory method para reconstruir una Página desde la persistencia
   */
  public static reconstruir(
    id: string,
    titulo: string,
    contenido: string | null,
    slug: string,
    metaTitulo: string | null,
    metaDescripcion: string | null,
    visible: boolean,
    fechaCreacion: Date,
    fechaActualizacion: Date,
    fechaPublicacion: Date | null,
    autorId: string,
    tiendaId: string | null,
  ): Pagina {
    this.validarParametrosReconstruccion(
      id,
      titulo,
      slug,
      autorId,
      fechaCreacion,
      fechaActualizacion,
    );

    return new Pagina(
      id,
      titulo,
      contenido,
      slug,
      metaTitulo,
      metaDescripcion,
      visible,
      fechaCreacion,
      fechaActualizacion,
      fechaPublicacion,
      autorId,
      tiendaId,
    );
  }

  /**
   * Validaciones de parámetros para creación
   */
  private static validarParametrosCreacion(
    id: string,
    titulo: string,
    slug: string,
    autorId: string,
  ): void {
    if (!id || id.trim().length === 0) {
      throw ExcepcionDominio.valorRequerido('ID de la página', 'Pagina.IdRequerido');
    }

    if (!titulo || titulo.trim().length === 0) {
      throw ExcepcionDominio.valorRequerido('título de la página', 'Pagina.TituloRequerido');
    }

    if (titulo.trim().length > 255) {
      throw ExcepcionDominio.longitudInvalida('título de la página', 1, 255, 'Pagina.TituloLongitudInvalida');
    }

    if (!slug || slug.trim().length === 0) {
      throw ExcepcionDominio.valorRequerido('slug de la página', 'Pagina.SlugRequerido');
    }

    if (!this.validarSlug(slug)) {
      throw ExcepcionDominio.formatoInvalido('slug de la página', 'caracteres alfanuméricos y guiones', 'Pagina.SlugFormatoInvalido');
    }

    if (!autorId || autorId.trim().length === 0) {
      throw ExcepcionDominio.valorRequerido('ID del autor', 'Pagina.AutorIdRequerido');
    }
  }

  /**
   * Validaciones de parámetros para reconstrucción
   */
  private static validarParametrosReconstruccion(
    id: string,
    titulo: string,
    slug: string,
    autorId: string,
    fechaCreacion: Date,
    fechaActualizacion: Date,
  ): void {
    this.validarParametrosCreacion(id, titulo, slug, autorId);

    if (!fechaCreacion) {
      throw ExcepcionDominio.valorRequerido('fecha de creación', 'Pagina.FechaCreacionRequerida');
    }

    if (!fechaActualizacion) {
      throw ExcepcionDominio.valorRequerido('fecha de actualización', 'Pagina.FechaActualizacionRequerida');
    }

    if (fechaActualizacion < fechaCreacion) {
      throw ExcepcionDominio.valorInvalido('fecha de actualización', 'no puede ser anterior a la fecha de creación', 'Pagina.FechaActualizacionInvalida');
    }
  }

  /**
   * Valida que el slug tenga formato válido
   */
  private static validarSlug(slug: string): boolean {
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    return slugRegex.test(slug);
  }

  /**
   * Métodos de negocio
   */

  /**
   * Publicar la página
   */
  public publicar(): void {
    if (this._visible) {
      throw ExcepcionDominio.estadoInvalido('publicada', 'no publicada', 'Pagina.YaPublicada');
    }

    this._visible = true;
    this._fechaPublicacion = new Date();
    this._fechaActualizacion = new Date();
  }

  /**
   * Ocultar la página
   */
  public ocultar(): void {
    if (!this._visible) {
      throw ExcepcionDominio.estadoInvalido('oculta', 'publicada', 'Pagina.YaOculta');
    }

    this._visible = false;
    this._fechaActualizacion = new Date();
  }

  /**
   * Actualizar el contenido de la página
   */
  public actualizarContenido(
    titulo: string,
    contenido: string | null,
    metaTitulo: string | null,
    metaDescripcion: string | null,
  ): void {
    if (!titulo || titulo.trim().length === 0) {
      throw ExcepcionDominio.valorRequerido('título', 'Pagina.TituloRequerido');
    }

    if (titulo.trim().length > 255) {
      throw ExcepcionDominio.longitudInvalida('título', 1, 255, 'Pagina.TituloLongitudInvalida');
    }

    this._titulo = titulo;
    this._contenido = contenido;
    this._metaTitulo = metaTitulo;
    this._metaDescripcion = metaDescripcion;
    this._fechaActualizacion = new Date();
  }

  /**
   * Actualizar el slug de la página
   */
  public actualizarSlug(slug: string): void {
    if (!slug || slug.trim().length === 0) {
      throw ExcepcionDominio.valorRequerido('slug', 'Pagina.SlugRequerido');
    }

    if (!Pagina.validarSlug(slug)) {
      throw ExcepcionDominio.formatoInvalido('slug', 'caracteres alfanuméricos y guiones', 'Pagina.SlugFormatoInvalido');
    }

    this._slug = slug;
    this._fechaActualizacion = new Date();
  }

  /**
   * Getters
   */
  get id(): string {
    return this._id;
  }

  get titulo(): string {
    return this._titulo;
  }

  get contenido(): string | null {
    return this._contenido;
  }

  get slug(): string {
    return this._slug;
  }

  get metaTitulo(): string | null {
    return this._metaTitulo;
  }

  get metaDescripcion(): string | null {
    return this._metaDescripcion;
  }

  get visible(): boolean {
    return this._visible;
  }

  get fechaCreacion(): Date {
    return this._fechaCreacion;
  }

  get fechaActualizacion(): Date {
    return this._fechaActualizacion;
  }

  get fechaPublicacion(): Date | null {
    return this._fechaPublicacion;
  }

  get autorId(): string {
    return this._autorId;
  }

  get tiendaId(): string | null {
    return this._tiendaId;
  }

  /**
   * Verifica si la página está publicada
   */
  get estaPublicada(): boolean {
    return this._visible && this._fechaPublicacion !== null;
  }

  /**
   * Verifica si la página pertenece a una tienda específica
   */
  public perteneceATienda(tiendaId: string): boolean {
    return this._tiendaId === tiendaId;
  }

  /**
   * Verifica si la página fue creada por un autor específico
   */
  public fueCreadaPorAutor(autorId: string): boolean {
    return this._autorId === autorId;
  }
}