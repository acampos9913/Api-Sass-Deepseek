import { ExcepcionDominio } from '../../../comun/excepciones/excepcion-dominio';
import { 
  ConfiguracionAplicacionesCanalesVentaDto, 
  ActualizarConfiguracionAplicacionesCanalesVentaDto,
  CrearAppInstaladaDto,
  ActualizarAppInstaladaDto,
  AppInstaladaDto,
  CrearCanalVentaDto,
  ActualizarCanalVentaDto,
  CanalVentaDto,
  CrearAppDesarrolloDto,
  ActualizarAppDesarrolloDto,
  AppDesarrolloDto,
  CrearAppDesinstaladaDto,
  AppDesinstaladaDto,
  TipoAppEnum,
  TipoCanalEnum,
  EstadoAppEnum,
  EstadoRevisionEnum
} from '../../aplicacion/dto/configuracion-aplicaciones-canales-venta.dto';

/**
 * Entidad de dominio para la configuración de aplicaciones y canales de venta
 * Implementa la lógica de negocio y validaciones para la gestión de apps y canales
 */
export class ConfiguracionAplicacionesCanalesVenta {
  private constructor(
    public readonly id: string,
    public readonly tiendaId: string,
    public appsInstaladas: AppInstaladaDto[],
    public canalesVenta: CanalVentaDto[],
    public appsDesarrollo: AppDesarrolloDto[],
    public appsDesinstaladas: AppDesinstaladaDto[],
    public readonly fechaCreacion: Date,
    public fechaActualizacion: Date,
  ) {}

  /**
   * Método estático para crear una nueva configuración de aplicaciones y canales de venta
   */
  static crear(
    id: string,
    tiendaId: string,
    appsInstaladas: AppInstaladaDto[] = [],
    canalesVenta: CanalVentaDto[] = [],
    appsDesarrollo: AppDesarrolloDto[] = [],
    appsDesinstaladas: AppDesinstaladaDto[] = [],
  ): ConfiguracionAplicacionesCanalesVenta {
    ConfiguracionAplicacionesCanalesVenta.validarCamposObligatorios(tiendaId);

    // Validar arrays
    appsInstaladas.forEach(app => this.validarAppInstalada(app));
    canalesVenta.forEach(canal => this.validarCanalVenta(canal));
    appsDesarrollo.forEach(app => this.validarAppDesarrollo(app));
    appsDesinstaladas.forEach(app => this.validarAppDesinstalada(app));

    const fechaCreacion = new Date();
    const fechaActualizacion = new Date();

    return new ConfiguracionAplicacionesCanalesVenta(
      id,
      tiendaId,
      appsInstaladas,
      canalesVenta,
      appsDesarrollo,
      appsDesinstaladas,
      fechaCreacion,
      fechaActualizacion,
    );
  }

  /**
   * Método estático para crear desde DTO
   */
  static crearDesdeDto(
    id: string,
    tiendaId: string,
    dto: ConfiguracionAplicacionesCanalesVentaDto,
  ): ConfiguracionAplicacionesCanalesVenta {
    return this.crear(
      id,
      tiendaId,
      dto.apps_instaladas,
      dto.canales_venta,
      dto.apps_desarrollo,
      dto.apps_desinstaladas,
    );
  }


  /**
   * Métodos para gestionar aplicaciones instaladas
   */

  agregarAppInstalada(dto: CrearAppInstaladaDto): void {
    this.validarCrearAppInstalada(dto);

    // Verificar que no exista una app con el mismo nombre
    const appExistente = this.appsInstaladas.find(
      app => app.nombre_app.toLowerCase() === dto.nombre_app.toLowerCase()
    );

    if (appExistente) {
      throw ExcepcionDominio.duplicado(
        `Aplicación instalada con nombre '${dto.nombre_app}'`,
        'Aplicaciones.AppInstaladaDuplicada'
      );
    }

    const nuevaApp: AppInstaladaDto = {
      id: this.generarIdUnico(),
      nombre_app: dto.nombre_app,
      tipo_app: dto.tipo_app,
      instalada: true,
      fecha_instalacion: new Date(),
      version_app: dto.version_app,
      permisos: dto.permisos,
      token_acceso: dto.token_acceso,
      url_configuracion: dto.url_configuracion,
      fecha_actualizacion: new Date(),
    };

    this.appsInstaladas.push(nuevaApp);
    this.fechaActualizacion = new Date();
  }

  actualizarAppInstalada(appId: string, dto: ActualizarAppInstaladaDto): void {
    const appIndex = this.appsInstaladas.findIndex(app => app.id === appId);
    
    if (appIndex === -1) {
      throw ExcepcionDominio.Respuesta404(
        'Aplicación instalada no encontrada',
        'Aplicaciones.AppInstaladaNoEncontrada'
      );
    }

    if (dto.nombre_app !== undefined) {
      // Verificar que el nuevo nombre no esté en uso por otra app
      const nombreExistente = this.appsInstaladas.find(
        (app, index) =>
          app.nombre_app.toLowerCase() === dto.nombre_app!.toLowerCase() &&
          index !== appIndex
      );

      if (nombreExistente) {
        throw ExcepcionDominio.duplicado(
          `Aplicación instalada con nombre '${dto.nombre_app}'`,
          'Aplicaciones.AppInstaladaDuplicada'
        );
      }
    }

    this.validarActualizarAppInstalada(dto);

    const appActual = this.appsInstaladas[appIndex];
    this.appsInstaladas[appIndex] = {
      ...appActual,
      ...dto,
      fecha_actualizacion: new Date(),
    };

    this.fechaActualizacion = new Date();
  }

  eliminarAppInstalada(appId: string): void {
    const appIndex = this.appsInstaladas.findIndex(app => app.id === appId);
    
    if (appIndex === -1) {
      throw ExcepcionDominio.Respuesta404(
        'Aplicación instalada no encontrada',
        'Aplicaciones.AppInstaladaNoEncontrada'
      );
    }

    this.appsInstaladas.splice(appIndex, 1);
    this.fechaActualizacion = new Date();
  }

  /**
   * Métodos para gestionar canales de venta
   */

  agregarCanalVenta(dto: CrearCanalVentaDto): void {
    this.validarCrearCanalVenta(dto);

    // Verificar que no exista un canal con el mismo nombre
    const canalExistente = this.canalesVenta.find(
      canal => canal.nombre_canal.toLowerCase() === dto.nombre_canal.toLowerCase()
    );

    if (canalExistente) {
      throw ExcepcionDominio.duplicado(
        `Canal de venta con nombre '${dto.nombre_canal}'`,
        'Aplicaciones.CanalVentaDuplicado'
      );
    }

    const nuevoCanal: CanalVentaDto = {
      id: this.generarIdUnico(),
      nombre_canal: dto.nombre_canal,
      url_canal: dto.url_canal,
      activo: true,
      tipo_canal: dto.tipo_canal,
      configuracion: dto.configuracion,
      fecha_creacion: new Date(),
      fecha_actualizacion: new Date(),
    };

    this.canalesVenta.push(nuevoCanal);
    this.fechaActualizacion = new Date();
  }

  actualizarCanalVenta(canalId: string, dto: ActualizarCanalVentaDto): void {
    const canalIndex = this.canalesVenta.findIndex(canal => canal.id === canalId);
    
    if (canalIndex === -1) {
      throw ExcepcionDominio.Respuesta404(
        'Canal de venta no encontrado',
        'Aplicaciones.CanalVentaNoEncontrado'
      );
    }

    if (dto.nombre_canal !== undefined) {
      // Verificar que el nuevo nombre no esté en uso por otro canal
      const nombreExistente = this.canalesVenta.find(
        (canal, index) =>
          canal.nombre_canal.toLowerCase() === dto.nombre_canal!.toLowerCase() &&
          index !== canalIndex
      );

      if (nombreExistente) {
        throw ExcepcionDominio.duplicado(
          `Canal de venta con nombre '${dto.nombre_canal}'`,
          'Aplicaciones.CanalVentaDuplicado'
        );
      }
    }

    this.validarActualizarCanalVenta(dto);

    const canalActual = this.canalesVenta[canalIndex];
    this.canalesVenta[canalIndex] = {
      ...canalActual,
      ...dto,
      fecha_actualizacion: new Date(),
    };

    this.fechaActualizacion = new Date();
  }

  eliminarCanalVenta(canalId: string): void {
    const canalIndex = this.canalesVenta.findIndex(canal => canal.id === canalId);
    
    if (canalIndex === -1) {
      throw ExcepcionDominio.Respuesta404(
        'Canal de venta no encontrado',
        'Aplicaciones.CanalVentaNoEncontrado'
      );
    }

    this.canalesVenta.splice(canalIndex, 1);
    this.fechaActualizacion = new Date();
  }

  /**
   * Métodos para gestionar apps en desarrollo
   */

  agregarAppDesarrollo(dto: CrearAppDesarrolloDto): void {
    this.validarCrearAppDesarrollo(dto);

    // Verificar que no exista una app con el mismo nombre
    const appExistente = this.appsDesarrollo.find(
      app => app.nombre_app.toLowerCase() === dto.nombre_app.toLowerCase()
    );

    if (appExistente) {
      throw ExcepcionDominio.duplicado(
        `Aplicación en desarrollo con nombre '${dto.nombre_app}'`,
        'Aplicaciones.AppDesarrolloDuplicada'
      );
    }

    const nuevaApp: AppDesarrolloDto = {
      id: this.generarIdUnico(),
      nombre_app: dto.nombre_app,
      estado: dto.estado,
      fecha_creacion: new Date(),
      token_dev: dto.token_dev,
      responsable: dto.responsable,
      scopes: dto.scopes,
      version: dto.version,
      sandbox: dto.sandbox,
      dev_endpoint: dto.dev_endpoint,
      webhooks_errores: dto.webhooks_errores,
      env_vars: dto.env_vars,
      revision_estado: EstadoRevisionEnum.PENDIENTE,
      fecha_actualizacion: new Date(),
    };

    this.appsDesarrollo.push(nuevaApp);
    this.fechaActualizacion = new Date();
  }

  actualizarAppDesarrollo(appId: string, dto: ActualizarAppDesarrolloDto): void {
    const appIndex = this.appsDesarrollo.findIndex(app => app.id === appId);
    
    if (appIndex === -1) {
      throw ExcepcionDominio.Respuesta404(
        'Aplicación en desarrollo no encontrada',
        'Aplicaciones.AppDesarrolloNoEncontrada'
      );
    }

    if (dto.nombre_app !== undefined) {
      // Verificar que el nuevo nombre no esté en uso por otra app
      const nombreExistente = this.appsDesarrollo.find(
        (app, index) =>
          app.nombre_app.toLowerCase() === dto.nombre_app!.toLowerCase() &&
          index !== appIndex
      );

      if (nombreExistente) {
        throw ExcepcionDominio.duplicado(
          `Aplicación en desarrollo con nombre '${dto.nombre_app}'`,
          'Aplicaciones.AppDesarrolloDuplicada'
        );
      }
    }

    this.validarActualizarAppDesarrollo(dto);

    const appActual = this.appsDesarrollo[appIndex];
    this.appsDesarrollo[appIndex] = {
      ...appActual,
      ...dto,
      fecha_actualizacion: new Date(),
    };

    this.fechaActualizacion = new Date();
  }

  eliminarAppDesarrollo(appId: string): void {
    const appIndex = this.appsDesarrollo.findIndex(app => app.id === appId);
    
    if (appIndex === -1) {
      throw ExcepcionDominio.Respuesta404(
        'Aplicación en desarrollo no encontrada',
        'Aplicaciones.AppDesarrolloNoEncontrada'
      );
    }

    this.appsDesarrollo.splice(appIndex, 1);
    this.fechaActualizacion = new Date();
  }

  /**
   * Métodos para gestionar apps desinstaladas
   */

  agregarAppDesinstalada(dto: CrearAppDesinstaladaDto): void {
    this.validarCrearAppDesinstalada(dto);

    const nuevaApp: AppDesinstaladaDto = {
      id: this.generarIdUnico(),
      nombre_app: dto.nombre_app,
      motivo_desinstalacion: dto.motivo_desinstalacion,
      fecha_desinstalacion: new Date(),
      datos_anteriores: dto.datos_anteriores,
      fecha_actualizacion: new Date(),
    };

    this.appsDesinstaladas.push(nuevaApp);
    this.fechaActualizacion = new Date();
  }

  eliminarAppDesinstalada(appId: string): void {
    const appIndex = this.appsDesinstaladas.findIndex(app => app.id === appId);
    
    if (appIndex === -1) {
      throw ExcepcionDominio.Respuesta404(
        'Aplicación desinstalada no encontrada',
        'Aplicaciones.AppDesinstaladaNoEncontrada'
      );
    }

    this.appsDesinstaladas.splice(appIndex, 1);
    this.fechaActualizacion = new Date();
  }

  /**
   * Métodos de consulta
   */

  obtenerAppInstaladaPorId(appId: string): AppInstaladaDto | null {
    return this.appsInstaladas.find(app => app.id === appId) || null;
  }

  obtenerCanalVentaPorId(canalId: string): CanalVentaDto | null {
    return this.canalesVenta.find(canal => canal.id === canalId) || null;
  }

  obtenerAppDesarrolloPorId(appId: string): AppDesarrolloDto | null {
    return this.appsDesarrollo.find(app => app.id === appId) || null;
  }

  obtenerAppsInstaladasPorTipo(tipo: TipoAppEnum): AppInstaladaDto[] {
    return this.appsInstaladas.filter(app => app.tipo_app === tipo);
  }

  obtenerCanalesVentaPorTipo(tipo: TipoCanalEnum): CanalVentaDto[] {
    return this.canalesVenta.filter(canal => canal.tipo_canal === tipo);
  }

  obtenerAppsDesarrolloPorEstado(estado: EstadoAppEnum): AppDesarrolloDto[] {
    return this.appsDesarrollo.filter(app => app.estado === estado);
  }

  contarAppsInstaladas(): number {
    return this.appsInstaladas.length;
  }

  contarCanalesVentaActivos(): number {
    return this.canalesVenta.filter(canal => canal.activo).length;
  }

  contarAppsEnDesarrollo(): number {
    return this.appsDesarrollo.length;
  }

  /**
   * Método para convertir a DTO de respuesta
   */
  aDto(): any {
    return {
      id: this.id,
      tienda_id: this.tiendaId,
      apps_instaladas: this.appsInstaladas,
      canales_venta: this.canalesVenta,
      apps_desarrollo: this.appsDesarrollo,
      apps_desinstaladas: this.appsDesinstaladas,
      fecha_creacion: this.fechaCreacion,
      fecha_actualizacion: this.fechaActualizacion,
    };
  }

  /**
   * Validaciones privadas
   */

  private static validarCamposObligatorios(tiendaId: string): void {
    if (!tiendaId || tiendaId.trim() === '') {
      throw ExcepcionDominio.valorRequerido('tienda_id', 'Aplicaciones.TiendaIdRequerido');
    }
  }

  private static validarAppInstalada(app: AppInstaladaDto): void {
    if (!app.nombre_app || app.nombre_app.trim() === '') {
      throw ExcepcionDominio.valorRequerido('nombre_app', 'Aplicaciones.NombreAppRequerido');
    }

    if (!app.tipo_app) {
      throw ExcepcionDominio.valorRequerido('tipo_app', 'Aplicaciones.TipoAppRequerido');
    }

    if (!Object.values(TipoAppEnum).includes(app.tipo_app)) {
      throw ExcepcionDominio.valorInvalido(
        'tipo_app',
        app.tipo_app,
        'Aplicaciones.TipoAppInvalido'
      );
    }

    if (!Array.isArray(app.permisos)) {
      throw ExcepcionDominio.valorInvalido(
        'permisos',
        app.permisos,
        'Aplicaciones.PermisosDebeSerArray'
      );
    }

    if (app.url_configuracion && !this.esUrlValida(app.url_configuracion)) {
      throw ExcepcionDominio.valorInvalido(
        'url_configuracion',
        app.url_configuracion,
        'Aplicaciones.UrlConfiguracionInvalida'
      );
    }
  }

  private validarCrearAppInstalada(dto: CrearAppInstaladaDto): void {
    if (!dto.nombre_app || dto.nombre_app.trim() === '') {
      throw ExcepcionDominio.valorRequerido('nombre_app', 'Aplicaciones.NombreAppRequerido');
    }

    if (!dto.tipo_app) {
      throw ExcepcionDominio.valorRequerido('tipo_app', 'Aplicaciones.TipoAppRequerido');
    }

    if (!Object.values(TipoAppEnum).includes(dto.tipo_app)) {
      throw ExcepcionDominio.valorInvalido(
        'tipo_app',
        dto.tipo_app,
        'Aplicaciones.TipoAppInvalido'
      );
    }

    if (!Array.isArray(dto.permisos) || dto.permisos.length === 0) {
      throw ExcepcionDominio.valorRequerido('permisos', 'Aplicaciones.PermisosRequeridos');
    }

    if (dto.url_configuracion && !ConfiguracionAplicacionesCanalesVenta.esUrlValida(dto.url_configuracion)) {
      throw ExcepcionDominio.valorInvalido(
        'url_configuracion',
        dto.url_configuracion,
        'Aplicaciones.UrlConfiguracionInvalida'
      );
    }
  }

  private validarActualizarAppInstalada(dto: ActualizarAppInstaladaDto): void {
    if (dto.nombre_app && dto.nombre_app.trim() === '') {
      throw ExcepcionDominio.valorRequerido('nombre_app', 'Aplicaciones.NombreAppRequerido');
    }

    if (dto.tipo_app && !Object.values(TipoAppEnum).includes(dto.tipo_app)) {
      throw ExcepcionDominio.valorInvalido(
        'tipo_app',
        dto.tipo_app,
        'Aplicaciones.TipoAppInvalido'
      );
    }

    if (dto.permisos && (!Array.isArray(dto.permisos) || dto.permisos.length === 0)) {
      throw ExcepcionDominio.valorRequerido('permisos', 'Aplicaciones.PermisosRequeridos');
    }

    if (dto.url_configuracion && !ConfiguracionAplicacionesCanalesVenta.esUrlValida(dto.url_configuracion)) {
      throw ExcepcionDominio.valorInvalido(
        'url_configuracion',
        dto.url_configuracion,
        'Aplicaciones.UrlConfiguracionInvalida'
      );
    }
  }

  private static validarCanalVenta(canal: CanalVentaDto): void {
    if (!canal.nombre_canal || canal.nombre_canal.trim() === '') {
      throw ExcepcionDominio.valorRequerido('nombre_canal', 'Aplicaciones.NombreCanalRequerido');
    }

    if (!canal.tipo_canal) {
      throw ExcepcionDominio.valorRequerido('tipo_canal', 'Aplicaciones.TipoCanalRequerido');
    }

    if (!Object.values(TipoCanalEnum).includes(canal.tipo_canal)) {
      throw ExcepcionDominio.valorInvalido(
        'tipo_canal',
        canal.tipo_canal,
        'Aplicaciones.TipoCanalInvalido'
      );
    }

    if (canal.url_canal && !this.esUrlValida(canal.url_canal)) {
      throw ExcepcionDominio.valorInvalido(
        'url_canal',
        canal.url_canal,
        'Aplicaciones.UrlCanalInvalida'
      );
    }
  }

  private validarCrearCanalVenta(dto: CrearCanalVentaDto): void {
    if (!dto.nombre_canal || dto.nombre_canal.trim() === '') {
      throw ExcepcionDominio.valorRequerido('nombre_canal', 'Aplicaciones.NombreCanalRequerido');
    }

    if (!dto.tipo_canal) {
      throw ExcepcionDominio.valorRequerido('tipo_canal', 'Aplicaciones.TipoCanalRequerido');
    }

    if (!Object.values(TipoCanalEnum).includes(dto.tipo_canal)) {
      throw ExcepcionDominio.valorInvalido(
        'tipo_canal',
        dto.tipo_canal,
        'Aplicaciones.TipoCanalInvalido'
      );
    }

    if (dto.url_canal && !ConfiguracionAplicacionesCanalesVenta.esUrlValida(dto.url_canal)) {
      throw ExcepcionDominio.valorInvalido(
        'url_canal',
        dto.url_canal,
        'Aplicaciones.UrlCanalInvalida'
      );
    }
  }

  private validarActualizarCanalVenta(dto: ActualizarCanalVentaDto): void {
    if (dto.nombre_canal && dto.nombre_canal.trim() === '') {
      throw ExcepcionDominio.valorRequerido('nombre_canal', 'Aplicaciones.NombreCanalRequerido');
    }

    if (dto.tipo_canal && !Object.values(TipoCanalEnum).includes(dto.tipo_canal)) {
      throw ExcepcionDominio.valorInvalido(
        'tipo_canal',
        dto.tipo_canal,
        'Aplicaciones.TipoCanalInvalido'
      );
    }

    if (dto.url_canal && !ConfiguracionAplicacionesCanalesVenta.esUrlValida(dto.url_canal)) {
      throw ExcepcionDominio.valorInvalido(
        'url_canal',
        dto.url_canal,
        'Aplicaciones.UrlCanalInvalida'
      );
    }
  }

  private static validarAppDesarrollo(app: AppDesarrolloDto): void {
    if (!app.nombre_app || app.nombre_app.trim() === '') {
      throw ExcepcionDominio.valorRequerido('nombre_app', 'Aplicaciones.NombreAppRequerido');
    }

    if (!app.estado) {
      throw ExcepcionDominio.valorRequerido('estado', 'Aplicaciones.EstadoAppRequerido');
    }

    if (!Object.values(EstadoAppEnum).includes(app.estado)) {
      throw ExcepcionDominio.valorInvalido(
        'estado',
        app.estado,
        'Aplicaciones.EstadoAppInvalido'
      );
    }

    if (!app.token_dev || app.token_dev.trim() === '') {
      throw ExcepcionDominio.valorRequerido('token_dev', 'Aplicaciones.TokenDevRequerido');
    }

    if (!app.responsable || app.responsable.trim() === '') {
      throw ExcepcionDominio.valorRequerido('responsable', 'Aplicaciones.ResponsableRequerido');
    }

    if (!this.esEmailValido(app.responsable)) {
      throw ExcepcionDominio.valorInvalido(
        'responsable',
        app.responsable,
        'Aplicaciones.ResponsableEmailInvalido'
      );
    }

    if (!Array.isArray(app.scopes) || app.scopes.length === 0) {
      throw ExcepcionDominio.valorRequerido('scopes', 'Aplicaciones.ScopesRequeridos');
    }

    if (app.dev_endpoint && !this.esUrlValida(app.dev_endpoint)) {
      throw ExcepcionDominio.valorInvalido(
        'dev_endpoint',
        app.dev_endpoint,
        'Aplicaciones.DevEndpointInvalido'
      );
    }

    if (app.webhooks_errores && !this.esUrlValida(app.webhooks_errores)) {
      throw ExcepcionDominio.valorInvalido(
        'webhooks_errores',
        app.webhooks_errores,
        'Aplicaciones.WebhooksErroresInvalido'
      );
    }

    if (app.revision_estado && !Object.values(EstadoRevisionEnum).includes(app.revision_estado)) {
      throw ExcepcionDominio.valorInvalido(
        'revision_estado',
        app.revision_estado,
        'Aplicaciones.RevisionEstadoInvalido'
      );
    }
  }

  private validarCrearAppDesarrollo(dto: CrearAppDesarrolloDto): void {
    if (!dto.nombre_app || dto.nombre_app.trim() === '') {
      throw ExcepcionDominio.valorRequerido('nombre_app', 'Aplicaciones.NombreAppRequerido');
    }

    if (!dto.estado) {
      throw ExcepcionDominio.valorRequerido('estado', 'Aplicaciones.EstadoAppRequerido');
    }

    if (!Object.values(EstadoAppEnum).includes(dto.estado)) {
      throw ExcepcionDominio.valorInvalido(
        'estado',
        dto.estado,
        'Aplicaciones.EstadoAppInvalido'
      );
    }

    if (!dto.token_dev || dto.token_dev.trim() === '') {
      throw ExcepcionDominio.valorRequerido('token_dev', 'Aplicaciones.TokenDevRequerido');
    }

    if (!dto.responsable || dto.responsable.trim() === '') {
      throw ExcepcionDominio.valorRequerido('responsable', 'Aplicaciones.ResponsableRequerido');
    }

    if (!ConfiguracionAplicacionesCanalesVenta.esEmailValido(dto.responsable)) {
      throw ExcepcionDominio.valorInvalido(
        'responsable',
        dto.responsable,
        'Aplicaciones.ResponsableEmailInvalido'
      );
    }

    if (!Array.isArray(dto.scopes) || dto.scopes.length === 0) {
      throw ExcepcionDominio.valorRequerido('scopes', 'Aplicaciones.ScopesRequeridos');
    }

    if (dto.dev_endpoint && !ConfiguracionAplicacionesCanalesVenta.esUrlValida(dto.dev_endpoint)) {
      throw ExcepcionDominio.valorInvalido(
        'dev_endpoint',
        dto.dev_endpoint,
        'Aplicaciones.DevEndpointInvalido'
      );
    }

    if (dto.webhooks_errores && !ConfiguracionAplicacionesCanalesVenta.esUrlValida(dto.webhooks_errores)) {
      throw ExcepcionDominio.valorInvalido(
        'webhooks_errores',
        dto.webhooks_errores,
        'Aplicaciones.WebhooksErroresInvalido'
      );
    }
  }

  private validarActualizarAppDesarrollo(dto: ActualizarAppDesarrolloDto): void {
    if (dto.nombre_app && dto.nombre_app.trim() === '') {
      throw ExcepcionDominio.valorRequerido('nombre_app', 'Aplicaciones.NombreAppRequerido');
    }

    if (dto.estado && !Object.values(EstadoAppEnum).includes(dto.estado)) {
      throw ExcepcionDominio.valorInvalido(
        'estado',
        dto.estado,
        'Aplicaciones.EstadoAppInvalido'
      );
    }

    if (dto.token_dev && dto.token_dev.trim() === '') {
      throw ExcepcionDominio.valorRequerido('token_dev', 'Aplicaciones.TokenDevRequerido');
    }

    if (dto.responsable && dto.responsable.trim() === '') {
      throw ExcepcionDominio.valorRequerido('responsable', 'Aplicaciones.ResponsableRequerido');
    }

    if (dto.responsable && !ConfiguracionAplicacionesCanalesVenta.esEmailValido(dto.responsable)) {
      throw ExcepcionDominio.valorInvalido(
        'responsable',
        dto.responsable,
        'Aplicaciones.ResponsableEmailInvalido'
      );
    }

    if (dto.scopes && (!Array.isArray(dto.scopes) || dto.scopes.length === 0)) {
      throw ExcepcionDominio.valorRequerido('scopes', 'Aplicaciones.ScopesRequeridos');
    }

    if (dto.dev_endpoint && !ConfiguracionAplicacionesCanalesVenta.esUrlValida(dto.dev_endpoint)) {
      throw ExcepcionDominio.valorInvalido(
        'dev_endpoint',
        dto.dev_endpoint,
        'Aplicaciones.DevEndpointInvalido'
      );
    }

    if (dto.webhooks_errores && !ConfiguracionAplicacionesCanalesVenta.esUrlValida(dto.webhooks_errores)) {
      throw ExcepcionDominio.valorInvalido(
        'webhooks_errores',
        dto.webhooks_errores,
        'Aplicaciones.WebhooksErroresInvalido'
      );
    }

    if (dto.revision_estado && !Object.values(EstadoRevisionEnum).includes(dto.revision_estado)) {
      throw ExcepcionDominio.valorInvalido(
        'revision_estado',
        dto.revision_estado,
        'Aplicaciones.RevisionEstadoInvalido'
      );
    }
  }

  private static validarAppDesinstalada(app: AppDesinstaladaDto): void {
    if (!app.nombre_app || app.nombre_app.trim() === '') {
      throw ExcepcionDominio.valorRequerido('nombre_app', 'Aplicaciones.NombreAppRequerido');
    }
  }

  private validarCrearAppDesinstalada(dto: CrearAppDesinstaladaDto): void {
    if (!dto.nombre_app || dto.nombre_app.trim() === '') {
      throw ExcepcionDominio.valorRequerido('nombre_app', 'Aplicaciones.NombreAppRequerido');
    }
  }

  /**
   * Métodos de utilidad
   */

  private static esUrlValida(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  private static esEmailValido(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private generarIdUnico(): string {
    return `app-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}