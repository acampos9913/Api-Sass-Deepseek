import { ExcepcionDominio } from '../../../comun/excepciones/excepcion-dominio';
import { 
  ModoCuentas, 
  MetodoAutenticacion, 
  ReglaDevolucionDto 
} from '../../aplicacion/dto/configuracion-cuentas-cliente.dto';

export class ConfiguracionCuentasCliente {
  private constructor(
    public readonly id: string,
    public readonly tiendaId: string,
    private modoCuentas: ModoCuentas,
    private metodoAutenticacion: MetodoAutenticacion,
    private mostrarEnlacesInicio: boolean,
    private appsConectadas: string[],
    private personalizacion: boolean,
    private creditoTienda: boolean,
    private devolucionAutoservicio: boolean,
    private reglasDevolucion: ReglaDevolucionDto[],
    private urlCuenta?: string,
    private dominio?: string,
    public readonly fechaCreacion: Date = new Date(),
    public fechaActualizacion: Date = new Date()
  ) {}

  /**
   * Factory method para crear una nueva configuración de cuentas de cliente
   */
  public static crear(
    id: string,
    tiendaId: string,
    modoCuentas: ModoCuentas,
    metodoAutenticacion: MetodoAutenticacion,
    mostrarEnlacesInicio: boolean = true,
    appsConectadas: string[] = [],
    personalizacion: boolean = false,
    creditoTienda: boolean = false,
    devolucionAutoservicio: boolean = false,
    reglasDevolucion: ReglaDevolucionDto[] = [],
    urlCuenta?: string,
    dominio?: string
  ): ConfiguracionCuentasCliente {
    this.validarCreacion(
      modoCuentas,
      metodoAutenticacion,
      urlCuenta,
      dominio,
      appsConectadas,
      creditoTienda,
      devolucionAutoservicio,
      reglasDevolucion
    );

    return new ConfiguracionCuentasCliente(
      id,
      tiendaId,
      modoCuentas,
      metodoAutenticacion,
      mostrarEnlacesInicio,
      appsConectadas,
      personalizacion,
      creditoTienda,
      devolucionAutoservicio,
      reglasDevolucion,
      urlCuenta,
      dominio
    );
  }

  /**
   * Factory method para reconstruir desde la base de datos
   */
  public static reconstruir(
    id: string,
    tiendaId: string,
    modoCuentas: ModoCuentas,
    metodoAutenticacion: MetodoAutenticacion,
    mostrarEnlacesInicio: boolean,
    appsConectadas: string[],
    personalizacion: boolean,
    creditoTienda: boolean,
    devolucionAutoservicio: boolean,
    reglasDevolucion: ReglaDevolucionDto[],
    fechaCreacion: Date,
    fechaActualizacion: Date,
    urlCuenta?: string,
    dominio?: string
  ): ConfiguracionCuentasCliente {
    return new ConfiguracionCuentasCliente(
      id,
      tiendaId,
      modoCuentas,
      metodoAutenticacion,
      mostrarEnlacesInicio,
      appsConectadas,
      personalizacion,
      creditoTienda,
      devolucionAutoservicio,
      reglasDevolucion,
      urlCuenta,
      dominio,
      fechaCreacion,
      fechaActualizacion
    );
  }

  /**
   * Validaciones de creación
   */
  private static validarCreacion(
    modoCuentas: ModoCuentas,
    metodoAutenticacion: MetodoAutenticacion,
    urlCuenta?: string,
    dominio?: string,
    appsConectadas: string[] = [],
    creditoTienda: boolean = false,
    devolucionAutoservicio: boolean = false,
    reglasDevolucion: ReglaDevolucionDto[] = []
  ): void {
    // Validar que exista al menos una forma de autenticación activa
    if (!modoCuentas || !metodoAutenticacion) {
      throw ExcepcionDominio.Respuesta400(
        'Debe existir al menos una forma de autenticación activa',
        'CuentasCliente.AutenticacionRequerida'
      );
    }

    // Validar compatibilidad entre modo recomendado y método de autenticación
    if (modoCuentas === ModoCuentas.RECOMENDADO && 
        metodoAutenticacion !== MetodoAutenticacion.CODIGO_UNICO_USO) {
      throw ExcepcionDominio.Respuesta400(
        'En modo recomendado solo se permite código de un solo uso',
        'CuentasCliente.ModoRecomendadoIncompatible'
      );
    }

    // Validar URL segura si se proporciona
    if (urlCuenta && !this.esUrlSegura(urlCuenta)) {
      throw ExcepcionDominio.Respuesta400(
        'La URL de cuenta debe ser segura (HTTPS)',
        'CuentasCliente.UrlInsegura'
      );
    }

    // Validar apps conectadas
    if (appsConectadas.length > 0) {
      this.validarAppsConectadas(appsConectadas);
    }

    // Validar reglas de devolución
    if (devolucionAutoservicio && reglasDevolucion.length === 0) {
      throw ExcepcionDominio.Respuesta400(
        'Debe proporcionar reglas de devolución cuando se activa devolución autoservicio',
        'CuentasCliente.ReglasDevolucionRequeridas'
      );
    }

    // Validar crédito en tienda requiere autenticación
    if (creditoTienda && !metodoAutenticacion) {
      throw ExcepcionDominio.Respuesta400(
        'El crédito en tienda requiere autenticación activa',
        'CuentasCliente.CreditoRequiereAutenticacion'
      );
    }
  }

  /**
   * Métodos de acceso (getters)
   */
  public getModoCuentas(): ModoCuentas {
    return this.modoCuentas;
  }

  public getMetodoAutenticacion(): MetodoAutenticacion {
    return this.metodoAutenticacion;
  }

  public getMostrarEnlacesInicio(): boolean {
    return this.mostrarEnlacesInicio;
  }

  public getAppsConectadas(): string[] {
    return [...this.appsConectadas];
  }

  public getPersonalizacion(): boolean {
    return this.personalizacion;
  }

  public getCreditoTienda(): boolean {
    return this.creditoTienda;
  }

  public getDevolucionAutoservicio(): boolean {
    return this.devolucionAutoservicio;
  }

  public getReglasDevolucion(): ReglaDevolucionDto[] {
    return [...this.reglasDevolucion];
  }

  public getUrlCuenta(): string | undefined {
    return this.urlCuenta;
  }

  public getDominio(): string | undefined {
    return this.dominio;
  }

  /**
   * Métodos de mutación (setters con validación)
   */
  public cambiarModoCuentas(nuevoModo: ModoCuentas): void {
    if (nuevoModo === ModoCuentas.RECOMENDADO && 
        this.metodoAutenticacion !== MetodoAutenticacion.CODIGO_UNICO_USO) {
      throw ExcepcionDominio.Respuesta400(
        'No se puede cambiar a modo recomendado sin código de un solo uso',
        'CuentasCliente.CambioModoInvalido'
      );
    }
    this.modoCuentas = nuevoModo;
    this.actualizarFecha();
  }

  public cambiarMetodoAutenticacion(nuevoMetodo: MetodoAutenticacion): void {
    if (this.modoCuentas === ModoCuentas.RECOMENDADO && 
        nuevoMetodo !== MetodoAutenticacion.CODIGO_UNICO_USO) {
      throw ExcepcionDominio.Respuesta400(
        'En modo recomendado solo se permite código de un solo uso',
        'CuentasCliente.MetodoAutenticacionInvalido'
      );
    }
    this.metodoAutenticacion = nuevoMetodo;
    this.actualizarFecha();
  }

  public cambiarMostrarEnlacesInicio(mostrar: boolean): void {
    this.mostrarEnlacesInicio = mostrar;
    this.actualizarFecha();
  }

  public agregarAppConectada(appId: string): void {
    if (!this.appsConectadas.includes(appId)) {
      this.appsConectadas.push(appId);
      this.actualizarFecha();
    }
  }

  public removerAppConectada(appId: string): void {
    this.appsConectadas = this.appsConectadas.filter(id => id !== appId);
    this.actualizarFecha();
  }

  public cambiarPersonalizacion(activa: boolean): void {
    this.personalizacion = activa;
    this.actualizarFecha();
  }

  public cambiarCreditoTienda(activo: boolean): void {
    if (activo && !this.metodoAutenticacion) {
      throw ExcepcionDominio.Respuesta400(
        'No se puede activar crédito en tienda sin autenticación',
        'CuentasCliente.CreditoRequiereAutenticacion'
      );
    }
    this.creditoTienda = activo;
    this.actualizarFecha();
  }

  public cambiarDevolucionAutoservicio(activa: boolean): void {
    if (activa && this.reglasDevolucion.length === 0) {
      throw ExcepcionDominio.Respuesta400(
        'Debe configurar reglas de devolución antes de activar devolución autoservicio',
        'CuentasCliente.ReglasDevolucionRequeridas'
      );
    }
    this.devolucionAutoservicio = activa;
    this.actualizarFecha();
  }

  public agregarReglaDevolucion(regla: ReglaDevolucionDto): void {
    this.validarReglaDevolucion(regla);
    this.reglasDevolucion.push(regla);
    this.actualizarFecha();
  }

  public removerReglaDevolucion(index: number): void {
    if (index >= 0 && index < this.reglasDevolucion.length) {
      this.reglasDevolucion.splice(index, 1);
      this.actualizarFecha();
    }
  }

  public cambiarUrlCuenta(url: string): void {
    if (url && !ConfiguracionCuentasCliente.esUrlSegura(url)) {
      throw ExcepcionDominio.Respuesta400(
        'La URL de cuenta debe ser segura (HTTPS)',
        'CuentasCliente.UrlInsegura'
      );
    }
    this.urlCuenta = url;
    this.actualizarFecha();
  }

  public cambiarDominio(dominio: string): void {
    this.dominio = dominio;
    this.actualizarFecha();
  }

  /**
   * Métodos de validación estáticos
   */
  private static esUrlSegura(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  }

  private static validarAppsConectadas(apps: string[]): void {
    // Validar que las apps sean strings no vacíos
    const appsInvalidas = apps.filter(app => !app || typeof app !== 'string');
    if (appsInvalidas.length > 0) {
      throw ExcepcionDominio.Respuesta400(
        'Las apps conectadas deben ser IDs válidos',
        'CuentasCliente.AppsInvalidas'
      );
    }
  }

  private validarReglaDevolucion(regla: ReglaDevolucionDto): void {
    if (!regla.condicion || !regla.limite_dias) {
      throw ExcepcionDominio.Respuesta400(
        'La regla de devolución debe tener condición y límite de días',
        'CuentasCliente.ReglaDevolucionIncompleta'
      );
    }

    if (regla.limite_dias <= 0) {
      throw ExcepcionDominio.Respuesta400(
        'El límite de días debe ser mayor a cero',
        'CuentasCliente.LimiteDiasInvalido'
      );
    }
  }

  /**
   * Método para actualizar la fecha de actualización
   */
  private actualizarFecha(): void {
    this.fechaActualizacion = new Date();
  }

  /**
   * Método para verificar si la configuración es válida
   */
  public esValida(): boolean {
    try {
      ConfiguracionCuentasCliente.validarCreacion(
        this.modoCuentas,
        this.metodoAutenticacion,
        this.urlCuenta,
        this.dominio,
        this.appsConectadas,
        this.creditoTienda,
        this.devolucionAutoservicio,
        this.reglasDevolucion
      );
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Método para obtener un snapshot de la entidad
   */
  public toJSON(): any {
    return {
      id: this.id,
      tiendaId: this.tiendaId,
      modoCuentas: this.modoCuentas,
      metodoAutenticacion: this.metodoAutenticacion,
      mostrarEnlacesInicio: this.mostrarEnlacesInicio,
      appsConectadas: this.appsConectadas,
      personalizacion: this.personalizacion,
      creditoTienda: this.creditoTienda,
      devolucionAutoservicio: this.devolucionAutoservicio,
      reglasDevolucion: this.reglasDevolucion,
      urlCuenta: this.urlCuenta,
      dominio: this.dominio,
      fechaCreacion: this.fechaCreacion,
      fechaActualizacion: this.fechaActualizacion
    };
  }
}