import { ExcepcionDominio } from '../../../comun/excepciones/excepcion-dominio';
import {
  DominioDto,
  TipoDominioEnum,
  EstadoConexionDominioEnum,
  FuenteDominioEnum,
  HistorialCambioDominioDto
} from '../../aplicacion/dto/configuracion-dominios.dto';

/**
 * Entidad de Dominio para Configuración de Dominios
 * Implementa todas las reglas de negocio y validaciones
 */
export class ConfiguracionDominios {
  private constructor(
    private readonly _id: string,
    private readonly _tiendaId: string,
    private _dominios: DominioDto[] = [],
    private _dominioPrincipal?: string,
    private _redireccionamientoGlobal: boolean = false,
    private _fechaCreacion: Date = new Date(),
    private _fechaActualizacion: Date = new Date()
  ) {
    this.validar();
  }

  /**
   * Factory method para crear una nueva configuración de dominios
   */
  public static crear(
    id: string,
    tiendaId: string,
    dominios: DominioDto[] = [],
    dominioPrincipal?: string,
    redireccionamientoGlobal: boolean = false
  ): ConfiguracionDominios {
    return new ConfiguracionDominios(
      id,
      tiendaId,
      dominios,
      dominioPrincipal,
      redireccionamientoGlobal
    );
  }

  /**
   * Factory method para reconstruir desde persistencia
   */
  public static reconstruir(
    id: string,
    tiendaId: string,
    dominios: DominioDto[] = [],
    dominioPrincipal?: string,
    redireccionamientoGlobal: boolean = false,
    fechaCreacion: Date = new Date(),
    fechaActualizacion: Date = new Date()
  ): ConfiguracionDominios {
    return new ConfiguracionDominios(
      id,
      tiendaId,
      dominios,
      dominioPrincipal,
      redireccionamientoGlobal,
      fechaCreacion,
      fechaActualizacion
    );
  }

  /**
   * Validaciones de dominio
   */
  private validar(): void {
    // Validar que solo haya un dominio principal
    this.validarDominioPrincipalUnico();

    // Validar que los dominios sean únicos
    this.validarDominiosUnicos();

    // Validar formato de dominios
    this.validarFormatosDominios();

    // Validar redireccionamiento
    this.validarRedireccionamiento();
  }

  /**
   * Validar que solo haya un dominio principal
   */
  private validarDominioPrincipalUnico(): void {
    const dominiosPrincipales = this._dominios.filter(dominio =>
      dominio.tipo_dominio === TipoDominioEnum.PRINCIPAL
    );

    if (dominiosPrincipales.length > 1) {
      throw ExcepcionDominio.Respuesta400(
        'Solo puede haber un dominio principal por tienda',
        'Dominios.DominioPrincipalDuplicado'
      );
    }

    // Si hay un dominio principal, actualizar la referencia
    if (dominiosPrincipales.length === 1) {
      this._dominioPrincipal = dominiosPrincipales[0].nombre_dominio;
    } else {
      this._dominioPrincipal = undefined;
    }
  }

  /**
   * Validar que los dominios sean únicos
   */
  private validarDominiosUnicos(): void {
    const nombresDominios = this._dominios.map(dominio => dominio.nombre_dominio);
    const nombresUnicos = new Set(nombresDominios);

    if (nombresDominios.length !== nombresUnicos.size) {
      throw ExcepcionDominio.Respuesta400(
        'Los nombres de dominio deben ser únicos por tienda',
        'Dominios.NombreDominioDuplicado'
      );
    }
  }

  /**
   * Validar formatos de dominios
   */
  private validarFormatosDominios(): void {
    for (const dominio of this._dominios) {
      this.validarFormatoDominio(dominio);
    }
  }

  /**
   * Validar formato de un dominio individual
   */
  private validarFormatoDominio(dominio: DominioDto): void {
    // Validar formato DNS básico
    const dominioRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    
    if (!dominioRegex.test(dominio.nombre_dominio)) {
      throw ExcepcionDominio.Respuesta400(
        `El formato del dominio "${dominio.nombre_dominio}" no es válido`,
        'Dominios.FormatoDominioInvalido'
      );
    }

    // Validar subdominios bajo el mismo dominio principal
    if (dominio.tipo_dominio === TipoDominioEnum.SUBDOMINIO) {
      this.validarSubdominio(dominio);
    }

    // Validar SSL para dominios principales
    if (dominio.tipo_dominio === TipoDominioEnum.PRINCIPAL && dominio.https && !dominio.ssl_activo) {
      throw ExcepcionDominio.Respuesta400(
        'El certificado SSL debe estar activo para dominios principales con HTTPS',
        'Dominios.SSLRequeridoParaHTTPS'
      );
    }
  }

  /**
   * Validar subdominio
   */
  private validarSubdominio(dominio: DominioDto): void {
    const dominioPrincipal = this._dominios.find(d =>
      d.tipo_dominio === TipoDominioEnum.PRINCIPAL
    );

    if (!dominioPrincipal) {
      throw ExcepcionDominio.Respuesta400(
        'No se puede agregar un subdominio sin un dominio principal configurado',
        'Dominios.DominioPrincipalRequerido'
      );
    }

    // Validar que el subdominio pertenezca al dominio principal
    if (!dominio.nombre_dominio.endsWith(`.${dominioPrincipal.nombre_dominio}`)) {
      throw ExcepcionDominio.Respuesta400(
        `El subdominio "${dominio.nombre_dominio}" debe pertenecer al dominio principal "${dominioPrincipal.nombre_dominio}"`,
        'Dominios.SubdominioNoPertenece'
      );
    }
  }

  /**
   * Validar redireccionamiento
   */
  private validarRedireccionamiento(): void {
    if (this._redireccionamientoGlobal && !this._dominioPrincipal) {
      throw ExcepcionDominio.Respuesta400(
        'No se puede activar el redireccionamiento global sin un dominio principal configurado',
        'Dominios.RedireccionamientoSinPrincipal'
      );
    }
  }

  /**
   * Métodos de negocio
   */

  /**
   * Agregar dominio
   */
  public agregarDominio(dominio: DominioDto): void {
    // Validar que no exista el dominio
    const dominioExistente = this._dominios.find(d => 
      d.nombre_dominio === dominio.nombre_dominio
    );

    if (dominioExistente) {
      throw ExcepcionDominio.Respuesta400(
        `El dominio "${dominio.nombre_dominio}" ya existe`,
        'Dominios.DominioExistente'
      );
    }

    this._dominios.push(dominio);
    this.validar();
    this._fechaActualizacion = new Date();
  }

  /**
   * Actualizar dominio
   */
  public actualizarDominio(nombreDominio: string, dominioActualizado: Partial<DominioDto>): void {
    const dominioIndex = this._dominios.findIndex(d => d.nombre_dominio === nombreDominio);
    
    if (dominioIndex === -1) {
      throw ExcepcionDominio.Respuesta404(
        `Dominio "${nombreDominio}" no encontrado`,
        'Dominios.DominioNoEncontrado'
      );
    }

    // Actualizar dominio
    this._dominios[dominioIndex] = {
      ...this._dominios[dominioIndex],
      ...dominioActualizado,
      nombre_dominio: this._dominios[dominioIndex].nombre_dominio // Mantener el nombre original
    };

    this.validar();
    this._fechaActualizacion = new Date();
  }

  /**
   * Eliminar dominio
   */
  public eliminarDominio(nombreDominio: string): void {
    const dominioIndex = this._dominios.findIndex(d => d.nombre_dominio === nombreDominio);
    
    if (dominioIndex === -1) {
      throw ExcepcionDominio.Respuesta404(
        `Dominio "${nombreDominio}" no encontrado`,
        'Dominios.DominioNoEncontrado'
      );
    }

    const dominio = this._dominios[dominioIndex];

    // No permitir eliminar el dominio principal si hay redireccionamiento activo
    if (dominio.tipo_dominio === TipoDominioEnum.PRINCIPAL && this._redireccionamientoGlobal) {
      throw ExcepcionDominio.Respuesta400(
        'No se puede eliminar el dominio principal mientras el redireccionamiento global esté activo',
        'Dominios.DominioPrincipalConRedireccionamiento'
      );
    }

    this._dominios.splice(dominioIndex, 1);
    this.validar();
    this._fechaActualizacion = new Date();
  }

  /**
   * Establecer dominio principal
   */
  public establecerDominioPrincipal(nombreDominio: string): void {
    const dominio = this._dominios.find(d => d.nombre_dominio === nombreDominio);
    
    if (!dominio) {
      throw ExcepcionDominio.Respuesta404(
        `Dominio "${nombreDominio}" no encontrado`,
        'Dominios.DominioNoEncontrado'
      );
    }

    // Quitar dominio principal actual
    this._dominios.forEach(d => {
      if (d.tipo_dominio === TipoDominioEnum.PRINCIPAL) {
        d.tipo_dominio = TipoDominioEnum.SECUNDARIO;
      }
    });

    // Establecer nuevo dominio principal
    dominio.tipo_dominio = TipoDominioEnum.PRINCIPAL;
    this._dominioPrincipal = dominio.nombre_dominio;

    this.validar();
    this._fechaActualizacion = new Date();
  }

  /**
   * Activar/desactivar redireccionamiento global
   */
  public toggleRedireccionamientoGlobal(activar: boolean): void {
    if (activar && !this._dominioPrincipal) {
      throw ExcepcionDominio.Respuesta400(
        'No se puede activar el redireccionamiento global sin un dominio principal configurado',
        'Dominios.RedireccionamientoSinPrincipal'
      );
    }

    this._redireccionamientoGlobal = activar;
    this._fechaActualizacion = new Date();
  }

  /**
   * Agregar historial de cambios a un dominio
   */
  public agregarHistorialDominio(nombreDominio: string, tipoCambio: string, responsable: string): void {
    const dominio = this._dominios.find(d => d.nombre_dominio === nombreDominio);
    
    if (!dominio) {
      throw ExcepcionDominio.Respuesta404(
        `Dominio "${nombreDominio}" no encontrado`,
        'Dominios.DominioNoEncontrado'
      );
    }

    const historialItem: HistorialCambioDominioDto = {
      fecha: new Date(),
      tipo_cambio: tipoCambio,
      responsable: responsable
    };

    if (!dominio.historial) {
      dominio.historial = [];
    }

    dominio.historial.push(historialItem);
    this._fechaActualizacion = new Date();
  }

  /**
   * Obtener dominio por nombre
   */
  public obtenerDominio(nombreDominio: string): DominioDto | undefined {
    return this._dominios.find(d => d.nombre_dominio === nombreDominio);
  }

  /**
   * Obtener dominios por tipo
   */
  public obtenerDominiosPorTipo(tipo: TipoDominioEnum): DominioDto[] {
    return this._dominios.filter(d => d.tipo_dominio === tipo);
  }

  /**
   * Verificar si un dominio está conectado
   */
  public estaDominioConectado(nombreDominio: string): boolean {
    const dominio = this.obtenerDominio(nombreDominio);
    return dominio ? dominio.estado === EstadoConexionDominioEnum.CONECTADO : false;
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

  get dominios(): DominioDto[] {
    return this._dominios;
  }

  get dominioPrincipal(): string | undefined {
    return this._dominioPrincipal;
  }

  get redireccionamientoGlobal(): boolean {
    return this._redireccionamientoGlobal;
  }

  get fechaCreacion(): Date {
    return this._fechaCreacion;
  }

  get fechaActualizacion(): Date {
    return this._fechaActualizacion;
  }
}