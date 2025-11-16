import { ExcepcionDominio } from '../../../comun/excepciones/excepcion-dominio';
import {
  PerfilEnvioDto,
  MetodoEntregaDto,
  EmbalajeDto,
  ProveedorTransporteDto,
  PlantillaDocumentacionDto,
  ZonaEnvioDto,
  TarifaEnvioDto,
  TipoTarifaEnum,
  TipoEntregaEnum,
  TipoEmbalajeEnum
} from '../../aplicacion/dto/configuracion-envio-entrega.dto';

/**
 * Entidad de Configuración de Envío y Entrega
 * Implementa todas las reglas de negocio y validaciones para gestión de envíos
 */
export class ConfiguracionEnvioEntrega {
  private constructor(
    private readonly _id: string,
    private readonly _tiendaId: string,
    private _perfilesEnvio: PerfilEnvioDto[] = [],
    private _metodosEntrega: MetodoEntregaDto[] = [],
    private _embalajes: EmbalajeDto[] = [],
    private _proveedoresTransporte: ProveedorTransporteDto[] = [],
    private _plantillasDocumentacion: PlantillaDocumentacionDto[] = [],
    private _fechaCreacion: Date = new Date(),
    private _fechaActualizacion: Date = new Date()
  ) {
    this.validar();
  }

  /**
   * Factory method para crear una nueva configuración de envío y entrega
   */
  public static crear(
    id: string,
    tiendaId: string,
    perfilesEnvio: PerfilEnvioDto[] = [],
    metodosEntrega: MetodoEntregaDto[] = [],
    embalajes: EmbalajeDto[] = [],
    proveedoresTransporte: ProveedorTransporteDto[] = [],
    plantillasDocumentacion: PlantillaDocumentacionDto[] = []
  ): ConfiguracionEnvioEntrega {
    return new ConfiguracionEnvioEntrega(
      id,
      tiendaId,
      perfilesEnvio,
      metodosEntrega,
      embalajes,
      proveedoresTransporte,
      plantillasDocumentacion
    );
  }

  /**
   * Factory method para reconstruir desde persistencia
   */
  public static reconstruir(
    id: string,
    tiendaId: string,
    perfilesEnvio: PerfilEnvioDto[] = [],
    metodosEntrega: MetodoEntregaDto[] = [],
    embalajes: EmbalajeDto[] = [],
    proveedoresTransporte: ProveedorTransporteDto[] = [],
    plantillasDocumentacion: PlantillaDocumentacionDto[] = [],
    fechaCreacion: Date = new Date(),
    fechaActualizacion: Date = new Date()
  ): ConfiguracionEnvioEntrega {
    return new ConfiguracionEnvioEntrega(
      id,
      tiendaId,
      perfilesEnvio,
      metodosEntrega,
      embalajes,
      proveedoresTransporte,
      plantillasDocumentacion,
      fechaCreacion,
      fechaActualizacion
    );
  }

  /**
   * Validaciones de dominio
   */
  private validar(): void {
    // Validar perfiles de envío
    this.validarPerfilesEnvio();

    // Validar métodos de entrega
    this.validarMetodosEntrega();

    // Validar embalajes
    this.validarEmbalajes();

    // Validar proveedores de transporte
    this.validarProveedoresTransporte();

    // Validar plantillas de documentación
    this.validarPlantillasDocumentacion();
  }

  /**
   * Validar perfiles de envío
   */
  private validarPerfilesEnvio(): void {
    const nombresPerfiles = this._perfilesEnvio.map(perfil => perfil.nombre_perfil);
    const nombresUnicos = new Set(nombresPerfiles);

    if (nombresPerfiles.length !== nombresUnicos.size) {
      throw ExcepcionDominio.Respuesta400(
        'Los nombres de los perfiles de envío deben ser únicos',
        'EnvioEntrega.NombrePerfilDuplicado'
      );
    }

    // Validar cada perfil individualmente
    for (const perfil of this._perfilesEnvio) {
      this.validarPerfilEnvio(perfil);
    }

    // Validar que no se solapen zonas de envío entre perfiles
    this.validarSolapamientoZonasEnvio();
  }

  /**
   * Validar perfil de envío individual
   */
  private validarPerfilEnvio(perfil: PerfilEnvioDto): void {
    // Validar que tenga al menos una zona de envío
    if (perfil.zonas_envio.length === 0) {
      throw ExcepcionDominio.Respuesta400(
        `El perfil "${perfil.nombre_perfil}" debe tener al menos una zona de envío configurada`,
        'EnvioEntrega.PerfilSinZonas'
      );
    }

    // Validar que tenga al menos una tarifa
    if (perfil.tarifas.length === 0) {
      throw ExcepcionDominio.Respuesta400(
        `El perfil "${perfil.nombre_perfil}" debe tener al menos una tarifa configurada`,
        'EnvioEntrega.PerfilSinTarifas'
      );
    }

    // Validar tarifas
    for (const tarifa of perfil.tarifas) {
      this.validarTarifaEnvio(tarifa);
    }
  }

  /**
   * Validar tarifa de envío
   */
  private validarTarifaEnvio(tarifa: TarifaEnvioDto): void {
    if (tarifa.tipo === TipoTarifaEnum.FIJA && (!tarifa.monto || tarifa.monto <= 0)) {
      throw ExcepcionDominio.Respuesta400(
        'Las tarifas fijas deben tener un monto mayor a cero',
        'EnvioEntrega.TarifaFijaSinMonto'
      );
    }

    if (tarifa.tipo === TipoTarifaEnum.CALCULADA && !tarifa.condiciones) {
      throw ExcepcionDominio.Respuesta400(
        'Las tarifas calculadas deben tener condiciones definidas',
        'EnvioEntrega.TarifaCalculadaSinCondiciones'
      );
    }
  }

  /**
   * Validar solapamiento de zonas de envío
   */
  private validarSolapamientoZonasEnvio(): void {
    const todasZonas: ZonaEnvioDto[] = [];
    
    for (const perfil of this._perfilesEnvio) {
      todasZonas.push(...perfil.zonas_envio);
    }

    // Validar que no haya zonas duplicadas entre perfiles
    const zonasUnicas = new Set();
    
    for (const zona of todasZonas) {
      const claveZona = `${zona.pais}-${zona.region || 'sin-region'}-${zona.codigos_postales.join(',')}`;
      
      if (zonasUnicas.has(claveZona)) {
        throw ExcepcionDominio.Respuesta400(
          'No pueden existir zonas de envío duplicadas entre diferentes perfiles',
          'EnvioEntrega.ZonasDuplicadas'
        );
      }
      
      zonasUnicas.add(claveZona);
    }
  }

  /**
   * Validar métodos de entrega
   */
  private validarMetodosEntrega(): void {
    // Validar que no haya métodos duplicados por tipo
    const tiposMetodos = this._metodosEntrega.map(metodo => metodo.tipo_entrega);
    const tiposUnicos = new Set(tiposMetodos);

    if (tiposMetodos.length !== tiposUnicos.size) {
      throw ExcepcionDominio.Respuesta400(
        'No pueden existir múltiples métodos de entrega del mismo tipo',
        'EnvioEntrega.MetodoTipoDuplicado'
      );
    }

    // Validar que al menos un método esté activo
    const metodosActivos = this._metodosEntrega.filter(metodo => metodo.activo);
    if (metodosActivos.length === 0) {
      throw ExcepcionDominio.Respuesta400(
        'Debe haber al menos un método de entrega activo',
        'EnvioEntrega.SinMetodosActivos'
      );
    }
  }

  /**
   * Validar embalajes
   */
  private validarEmbalajes(): void {
    // Validar que haya al menos un embalaje predeterminado
    const embalajesPredeterminados = this._embalajes.filter(embalaje => embalaje.es_predeterminado);
    
    if (embalajesPredeterminados.length === 0 && this._embalajes.length > 0) {
      throw ExcepcionDominio.Respuesta400(
        'Debe haber al menos un embalaje predeterminado',
        'EnvioEntrega.SinEmbalajePredeterminado'
      );
    }

    // Validar que solo haya un embalaje predeterminado
    if (embalajesPredeterminados.length > 1) {
      throw ExcepcionDominio.Respuesta400(
        'Solo puede haber un embalaje predeterminado',
        'EnvioEntrega.MultiplesEmbalajesPredeterminados'
      );
    }

    // Validar dimensiones y pesos
    for (const embalaje of this._embalajes) {
      this.validarEmbalaje(embalaje);
    }
  }

  /**
   * Validar embalaje individual
   */
  private validarEmbalaje(embalaje: EmbalajeDto): void {
    const { dimensiones, peso } = embalaje;

    if (dimensiones.largo <= 0 || dimensiones.ancho <= 0 || dimensiones.alto <= 0) {
      throw ExcepcionDominio.Respuesta400(
        'Las dimensiones del embalaje deben ser mayores a cero',
        'EnvioEntrega.DimensionesInvalidas'
      );
    }

    if (peso <= 0) {
      throw ExcepcionDominio.Respuesta400(
        'El peso del embalaje debe ser mayor a cero',
        'EnvioEntrega.PesoInvalido'
      );
    }
  }

  /**
   * Validar proveedores de transporte
   */
  private validarProveedoresTransporte(): void {
    const nombresProveedores = this._proveedoresTransporte.map(proveedor => proveedor.proveedor_transporte);
    const nombresUnicos = new Set(nombresProveedores);

    if (nombresProveedores.length !== nombresUnicos.size) {
      throw ExcepcionDominio.Respuesta400(
        'Los nombres de los proveedores de transporte deben ser únicos',
        'EnvioEntrega.NombreProveedorDuplicado'
      );
    }

    // Validar cuentas únicas
    const cuentasProveedores = this._proveedoresTransporte.map(proveedor => proveedor.cuenta_proveedor);
    const cuentasUnicas = new Set(cuentasProveedores);

    if (cuentasProveedores.length !== cuentasUnicas.size) {
      throw ExcepcionDominio.Respuesta400(
        'Las cuentas de proveedores de transporte deben ser únicas',
        'EnvioEntrega.CuentaProveedorDuplicada'
      );
    }
  }

  /**
   * Validar plantillas de documentación
   */
  private validarPlantillasDocumentacion(): void {
    // Validar que no haya nombres de tienda duplicados en plantillas
    const nombresTienda = this._plantillasDocumentacion
      .filter(plantilla => plantilla.nombre_tienda_etiqueta)
      .map(plantilla => plantilla.nombre_tienda_etiqueta);

    const nombresUnicos = new Set(nombresTienda);

    if (nombresTienda.length !== nombresUnicos.size) {
      throw ExcepcionDominio.Respuesta400(
        'Los nombres de tienda en las plantillas de documentación deben ser únicos',
        'EnvioEntrega.NombreTiendaDuplicado'
      );
    }
  }

  /**
   * Métodos de negocio - Perfiles de Envío
   */

  /**
   * Agregar perfil de envío
   */
  public agregarPerfilEnvio(perfil: PerfilEnvioDto): void {
    // Validar que no exista un perfil con el mismo nombre
    const perfilExistente = this._perfilesEnvio.find(p => p.nombre_perfil === perfil.nombre_perfil);
    
    if (perfilExistente) {
      throw ExcepcionDominio.Respuesta400(
        `Ya existe un perfil de envío con el nombre "${perfil.nombre_perfil}"`,
        'EnvioEntrega.PerfilExistente'
      );
    }

    this._perfilesEnvio.push(perfil);
    this.validar();
    this._fechaActualizacion = new Date();
  }

  /**
   * Actualizar perfil de envío
   */
  public actualizarPerfilEnvio(idPerfil: string, perfilActualizado: Partial<PerfilEnvioDto>): void {
    const perfilIndex = this._perfilesEnvio.findIndex(p => p.id === idPerfil);
    
    if (perfilIndex === -1) {
      throw ExcepcionDominio.Respuesta404(
        `Perfil de envío con ID "${idPerfil}" no encontrado`,
        'EnvioEntrega.PerfilNoEncontrado'
      );
    }

    // Actualizar perfil
    this._perfilesEnvio[perfilIndex] = {
      ...this._perfilesEnvio[perfilIndex],
      ...perfilActualizado,
      id: this._perfilesEnvio[perfilIndex].id // Mantener el ID original
    };

    this.validar();
    this._fechaActualizacion = new Date();
  }

  /**
   * Eliminar perfil de envío
   */
  public eliminarPerfilEnvio(idPerfil: string): void {
    const perfilIndex = this._perfilesEnvio.findIndex(p => p.id === idPerfil);
    
    if (perfilIndex === -1) {
      throw ExcepcionDominio.Respuesta404(
        `Perfil de envío con ID "${idPerfil}" no encontrado`,
        'EnvioEntrega.PerfilNoEncontrado'
      );
    }

    this._perfilesEnvio.splice(perfilIndex, 1);
    this.validar();
    this._fechaActualizacion = new Date();
  }

  /**
   * Métodos de negocio - Métodos de Entrega
   */

  /**
   * Activar/desactivar método de entrega
   */
  public toggleMetodoEntrega(tipo: TipoEntregaEnum, activar: boolean): void {
    const metodo = this._metodosEntrega.find(m => m.tipo_entrega === tipo);
    
    if (!metodo) {
      throw ExcepcionDominio.Respuesta404(
        `Método de entrega tipo "${tipo}" no encontrado`,
        'EnvioEntrega.MetodoNoEncontrado'
      );
    }

    metodo.activo = activar;
    this.validar();
    this._fechaActualizacion = new Date();
  }

  /**
   * Obtener métodos de entrega activos
   */
  public obtenerMetodosEntregaActivos(): MetodoEntregaDto[] {
    return this._metodosEntrega.filter(metodo => metodo.activo);
  }

  /**
   * Métodos de negocio - Embalajes
   */

  /**
   * Establecer embalaje predeterminado
   */
  public establecerEmbalajePredeterminado(idEmbalaje: string): void {
    // Quitar predeterminado actual
    this._embalajes.forEach(embalaje => {
      embalaje.es_predeterminado = false;
    });

    // Establecer nuevo predeterminado
    const embalaje = this._embalajes.find(e => e.id === idEmbalaje);
    
    if (!embalaje) {
      throw ExcepcionDominio.Respuesta404(
        `Embalaje con ID "${idEmbalaje}" no encontrado`,
        'EnvioEntrega.EmbalajeNoEncontrado'
      );
    }

    embalaje.es_predeterminado = true;
    this.validar();
    this._fechaActualizacion = new Date();
  }

  /**
   * Obtener embalaje predeterminado
   */
  public obtenerEmbalajePredeterminado(): EmbalajeDto | undefined {
    return this._embalajes.find(embalaje => embalaje.es_predeterminado);
  }

  /**
   * Métodos de negocio - Proveedores de Transporte
   */

  /**
   * Activar/desactivar proveedor de transporte
   */
  public toggleProveedorTransporte(idProveedor: string, activar: boolean): void {
    const proveedor = this._proveedoresTransporte.find(p => p.id === idProveedor);
    
    if (!proveedor) {
      throw ExcepcionDominio.Respuesta404(
        `Proveedor de transporte con ID "${idProveedor}" no encontrado`,
        'EnvioEntrega.ProveedorNoEncontrado'
      );
    }

    proveedor.activo = activar;
    this._fechaActualizacion = new Date();
  }

  /**
   * Obtener proveedores de transporte activos
   */
  public obtenerProveedoresTransporteActivos(): ProveedorTransporteDto[] {
    return this._proveedoresTransporte.filter(proveedor => proveedor.activo);
  }

  /**
   * Métodos de negocio - Plantillas de Documentación
   */

  /**
   * Actualizar plantilla de documentación
   */
  public actualizarPlantillaDocumentacion(idPlantilla: string, plantillaActualizada: Partial<PlantillaDocumentacionDto>): void {
    const plantillaIndex = this._plantillasDocumentacion.findIndex(p => p.id === idPlantilla);
    
    if (plantillaIndex === -1) {
      throw ExcepcionDominio.Respuesta404(
        `Plantilla de documentación con ID "${idPlantilla}" no encontrado`,
        'EnvioEntrega.PlantillaNoEncontrada'
      );
    }

    this._plantillasDocumentacion[plantillaIndex] = {
      ...this._plantillasDocumentacion[plantillaIndex],
      ...plantillaActualizada,
      id: this._plantillasDocumentacion[plantillaIndex].id // Mantener el ID original
    };

    this.validar();
    this._fechaActualizacion = new Date();
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

  get perfilesEnvio(): PerfilEnvioDto[] {
    return this._perfilesEnvio;
  }

  get metodosEntrega(): MetodoEntregaDto[] {
    return this._metodosEntrega;
  }

  get embalajes(): EmbalajeDto[] {
    return this._embalajes;
  }

  get proveedoresTransporte(): ProveedorTransporteDto[] {
    return this._proveedoresTransporte;
  }

  get plantillasDocumentacion(): PlantillaDocumentacionDto[] {
    return this._plantillasDocumentacion;
  }

  get fechaCreacion(): Date {
    return this._fechaCreacion;
  }

  get fechaActualizacion(): Date {
    return this._fechaActualizacion;
  }
}