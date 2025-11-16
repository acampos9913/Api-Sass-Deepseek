import { 
  TipoProveedorPago, 
  MetodoPago, 
  ModoCapturaPago, 
  CaducidadGiftcard,
  ProveedorPagoDto,
  MetodoPagoDto,
  MetodoPagoManualDto,
  ConfiguracionGiftcardDto,
  PersonalizacionPagosDto
} from '../../aplicacion/dto/configuracion-pagos.dto';
import { ExcepcionDominio } from '../../../comun/excepciones/excepcion-dominio';

/**
 * Entidad de dominio para configuración de pagos
 * Implementa las reglas de negocio según las especificaciones de Shopify
 */
export class ConfiguracionPagos {
  private constructor(
    public readonly id: string,
    public readonly tiendaId: string,
    private modoCaptura: ModoCapturaPago,
    private proveedoresPago: ProveedorPagoDto[],
    private metodosPago: MetodoPagoDto[],
    private metodosPagoManuales: MetodoPagoManualDto[],
    private configuracionGiftcard: ConfiguracionGiftcardDto,
    private personalizacion?: PersonalizacionPagosDto,
    private configuracionAdicional?: Record<string, any>,
    public readonly fechaCreacion: Date = new Date(),
    public fechaActualizacion: Date = new Date()
  ) {}

  /**
   * Método estático para crear una nueva configuración de pagos
   */
  static crear(
    tiendaId: string,
    modoCaptura: ModoCapturaPago,
    proveedoresPago: ProveedorPagoDto[],
    metodosPago: MetodoPagoDto[],
    metodosPagoManuales: MetodoPagoManualDto[],
    configuracionGiftcard: ConfiguracionGiftcardDto,
    personalizacion?: PersonalizacionPagosDto,
    configuracionAdicional?: Record<string, any>
  ): ConfiguracionPagos {
    const id = `config-pagos-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const configuracion = new ConfiguracionPagos(
      id,
      tiendaId,
      modoCaptura,
      proveedoresPago,
      metodosPago,
      metodosPagoManuales,
      configuracionGiftcard,
      personalizacion,
      configuracionAdicional
    );

    configuracion.validarReglasNegocio();

    return configuracion;
  }

  /**
   * Método estático para reconstruir una configuración desde la base de datos
   */
  static reconstruir(
    id: string,
    tiendaId: string,
    modoCaptura: ModoCapturaPago,
    proveedoresPago: ProveedorPagoDto[],
    metodosPago: MetodoPagoDto[],
    metodosPagoManuales: MetodoPagoManualDto[],
    configuracionGiftcard: ConfiguracionGiftcardDto,
    personalizacion?: PersonalizacionPagosDto,
    configuracionAdicional?: Record<string, any>,
    fechaCreacion?: Date,
    fechaActualizacion?: Date
  ): ConfiguracionPagos {
    return new ConfiguracionPagos(
      id,
      tiendaId,
      modoCaptura,
      proveedoresPago,
      metodosPago,
      metodosPagoManuales,
      configuracionGiftcard,
      personalizacion,
      configuracionAdicional,
      fechaCreacion || new Date(),
      fechaActualizacion || new Date()
    );
  }

  /**
   * Validar todas las reglas de negocio
   */
  private validarReglasNegocio(): void {
    this.validarProveedoresPago();
    this.validarMetodosPago();
    this.validarMetodosPagoManuales();
    this.validarConfiguracionGiftcard();
    this.validarPersonalizacion();
    this.validarConfiguracionAdicional();
  }

  /**
   * Validar proveedores de pago
   */
  private validarProveedoresPago(): void {
    if (!this.proveedoresPago || this.proveedoresPago.length === 0) {
      throw ExcepcionDominio.Respuesta400(
        'Debe haber al menos un proveedor de pago configurado',
        'ConfiguracionPagos.ProveedoresRequeridos'
      );
    }

    // Verificar que no haya proveedores duplicados
    const nombresProveedores = this.proveedoresPago.map(p => p.nombre_proveedor);
    const nombresUnicos = new Set(nombresProveedores);
    if (nombresUnicos.size !== nombresProveedores.length) {
      throw ExcepcionDominio.Respuesta400(
        'No puede haber proveedores de pago duplicados',
        'ConfiguracionPagos.ProveedoresDuplicados'
      );
    }

    // Verificar que al menos un proveedor esté activo
    const proveedoresActivos = this.proveedoresPago.filter(p => p.activo);
    if (proveedoresActivos.length === 0) {
      throw ExcepcionDominio.Respuesta400(
        'Debe haber al menos un proveedor de pago activo',
        'ConfiguracionPagos.ProveedorActivoRequerido'
      );
    }

    // Validar comisiones
    this.proveedoresPago.forEach(proveedor => {
      if (proveedor.comision_transaccion < 0 || proveedor.comision_transaccion > 100) {
        throw ExcepcionDominio.Respuesta400(
          `La comisión del proveedor ${proveedor.nombre_proveedor} debe estar entre 0 y 100`,
          'ConfiguracionPagos.ComisionInvalida'
        );
      }
    });
  }

  /**
   * Validar métodos de pago
   */
  private validarMetodosPago(): void {
    if (!this.metodosPago || this.metodosPago.length === 0) {
      throw ExcepcionDominio.Respuesta400(
        'Debe haber al menos un método de pago configurado',
        'ConfiguracionPagos.MetodosRequeridos'
      );
    }

    // Verificar que no haya métodos duplicados
    const tiposMetodos = this.metodosPago.map(m => m.metodo);
    const tiposUnicos = new Set(tiposMetodos);
    if (tiposUnicos.size !== tiposMetodos.length) {
      throw ExcepcionDominio.Respuesta400(
        'No puede haber métodos de pago duplicados',
        'ConfiguracionPagos.MetodosDuplicados'
      );
    }

    // Verificar que al menos un método esté activo
    const metodosActivos = this.metodosPago.filter(m => m.activo);
    if (metodosActivos.length === 0) {
      throw ExcepcionDominio.Respuesta400(
        'Debe haber al menos un método de pago activo',
        'ConfiguracionPagos.MetodoActivoRequerido'
      );
    }

    // Validar compatibilidad entre proveedores y métodos
    this.validarCompatibilidadProveedoresMetodos();
  }

  /**
   * Validar compatibilidad entre proveedores y métodos de pago
   */
  private validarCompatibilidadProveedoresMetodos(): void {
    const proveedoresActivos = this.proveedoresPago.filter(p => p.activo);
    const metodosActivos = this.metodosPago.filter(m => m.activo);

    // Si hay métodos activos, debe haber al menos un proveedor activo que los soporte
    if (metodosActivos.length > 0 && proveedoresActivos.length === 0) {
      throw ExcepcionDominio.Respuesta400(
        'No hay proveedores activos que soporten los métodos de pago configurados',
        'ConfiguracionPagos.CompatibilidadProveedoresMetodos'
      );
    }
  }

  /**
   * Validar métodos de pago manuales
   */
  private validarMetodosPagoManuales(): void {
    if (!this.metodosPagoManuales) {
      return;
    }

    // Verificar que no haya métodos manuales duplicados
    const nombresManuales = this.metodosPagoManuales.map(m => m.nombre_metodo);
    const nombresUnicos = new Set(nombresManuales);
    if (nombresUnicos.size !== nombresManuales.length) {
      throw ExcepcionDominio.Respuesta400(
        'No puede haber métodos de pago manuales duplicados',
        'ConfiguracionPagos.MetodosManualesDuplicados'
      );
    }

    // Validar instrucciones
    this.metodosPagoManuales.forEach(metodo => {
      if (!metodo.instrucciones || metodo.instrucciones.trim().length === 0) {
        throw ExcepcionDominio.Respuesta400(
          `El método manual ${metodo.nombre_metodo} debe tener instrucciones`,
          'ConfiguracionPagos.InstruccionesRequeridas'
        );
      }

      if (metodo.tiempo_procesamiento !== undefined && metodo.tiempo_procesamiento < 0) {
        throw ExcepcionDominio.Respuesta400(
          `El tiempo de procesamiento del método ${metodo.nombre_metodo} no puede ser negativo`,
          'ConfiguracionPagos.TiempoProcesamientoInvalido'
        );
      }
    });
  }

  /**
   * Validar configuración de tarjetas de regalo
   */
  private validarConfiguracionGiftcard(): void {
    if (!this.configuracionGiftcard) {
      throw ExcepcionDominio.Respuesta400(
        'La configuración de tarjetas de regalo es requerida',
        'ConfiguracionPagos.ConfiguracionGiftcardRequerida'
      );
    }

    // Validar fecha de expiración si aplica
    if (this.configuracionGiftcard.caducidad === CaducidadGiftcard.FECHA_DEFINIDA) {
      if (!this.configuracionGiftcard.fecha_expiracion) {
        throw ExcepcionDominio.Respuesta400(
          'La fecha de expiración es requerida cuando la caducidad es por fecha definida',
          'ConfiguracionPagos.FechaExpiracionRequerida'
        );
      }

      const fechaExpiracion = new Date(this.configuracionGiftcard.fecha_expiracion);
      if (fechaExpiracion <= new Date()) {
        throw ExcepcionDominio.Respuesta400(
          'La fecha de expiración debe ser futura',
          'ConfiguracionPagos.FechaExpiracionFutura'
        );
      }
    }

    // Validar montos
    if (this.configuracionGiftcard.monto_minimo !== undefined && 
        this.configuracionGiftcard.monto_maximo !== undefined) {
      if (this.configuracionGiftcard.monto_minimo > this.configuracionGiftcard.monto_maximo) {
        throw ExcepcionDominio.Respuesta400(
          'El monto mínimo no puede ser mayor al monto máximo',
          'ConfiguracionPagos.MontosGiftcardInconsistentes'
        );
      }
    }

    if (this.configuracionGiftcard.monto_minimo !== undefined && 
        this.configuracionGiftcard.monto_minimo < 0) {
      throw ExcepcionDominio.Respuesta400(
        'El monto mínimo no puede ser negativo',
        'ConfiguracionPagos.MontoMinimoInvalido'
      );
    }

    if (this.configuracionGiftcard.monto_maximo !== undefined && 
        this.configuracionGiftcard.monto_maximo < 0) {
      throw ExcepcionDominio.Respuesta400(
        'El monto máximo no puede ser negativo',
        'ConfiguracionPagos.MontoMaximoInvalido'
      );
    }
  }

  /**
   * Validar personalización
   */
  private validarPersonalizacion(): void {
    if (!this.personalizacion) {
      return;
    }

    // Validar color si se proporciona
    if (this.personalizacion.color_primario) {
      const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
      if (!colorRegex.test(this.personalizacion.color_primario)) {
        throw ExcepcionDominio.Respuesta400(
          'El color primario debe ser un código hexadecimal válido',
          'ConfiguracionPagos.ColorInvalido'
        );
      }
    }

    // Validar que si se muestran términos, haya texto
    if (this.personalizacion.mostrar_terminos && 
        (!this.personalizacion.texto_terminos || this.personalizacion.texto_terminos.trim().length === 0)) {
      throw ExcepcionDominio.Respuesta400(
        'El texto de términos y condiciones es requerido cuando se muestran términos',
        'ConfiguracionPagos.TextoTerminosRequerido'
      );
    }
  }

  /**
   * Validar configuración adicional
   */
  private validarConfiguracionAdicional(): void {
    if (!this.configuracionAdicional) {
      return;
    }

    // Validar reintentos
    if (this.configuracionAdicional.reintentos !== undefined) {
      if (this.configuracionAdicional.reintentos < 0 || this.configuracionAdicional.reintentos > 10) {
        throw ExcepcionDominio.Respuesta400(
          'Los reintentos deben estar entre 0 y 10',
          'ConfiguracionPagos.ReintentosInvalidos'
        );
      }
    }

    // Validar tiempo de expiración
    if (this.configuracionAdicional.tiempo_expiracion !== undefined) {
      if (this.configuracionAdicional.tiempo_expiracion < 1 || this.configuracionAdicional.tiempo_expiracion > 1440) {
        throw ExcepcionDominio.Respuesta400(
          'El tiempo de expiración debe estar entre 1 y 1440 minutos',
          'ConfiguracionPagos.TiempoExpiracionInvalido'
        );
      }
    }
  }

  /**
   * Verificar si la configuración es válida
   */
  esValida(): boolean {
    try {
      this.validarReglasNegocio();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Cambiar modo de captura
   */
  cambiarModoCaptura(nuevoModo: ModoCapturaPago): void {
    this.modoCaptura = nuevoModo;
    this.fechaActualizacion = new Date();
  }

  /**
   * Agregar proveedor de pago
   */
  agregarProveedorPago(proveedor: ProveedorPagoDto): void {
    const existe = this.proveedoresPago.some(p => p.nombre_proveedor === proveedor.nombre_proveedor);
    if (existe) {
      throw ExcepcionDominio.Respuesta400(
        `Ya existe un proveedor con el nombre ${proveedor.nombre_proveedor}`,
        'ConfiguracionPagos.ProveedorYaExiste'
      );
    }

    this.proveedoresPago.push(proveedor);
    this.fechaActualizacion = new Date();
    this.validarProveedoresPago();
  }

  /**
   * Actualizar proveedor de pago
   */
  actualizarProveedorPago(nombreProveedor: string, nuevoProveedor: ProveedorPagoDto): void {
    const index = this.proveedoresPago.findIndex(p => p.nombre_proveedor === nombreProveedor);
    if (index === -1) {
      throw ExcepcionDominio.Respuesta404(
        `Proveedor ${nombreProveedor} no encontrado`,
        'ConfiguracionPagos.ProveedorNoEncontrado'
      );
    }

    // Verificar que no haya conflicto de nombres (excepto con sí mismo)
    const conflictos = this.proveedoresPago.filter((p, i) => 
      i !== index && p.nombre_proveedor === nuevoProveedor.nombre_proveedor
    );
    if (conflictos.length > 0) {
      throw ExcepcionDominio.Respuesta400(
        `Ya existe otro proveedor con el nombre ${nuevoProveedor.nombre_proveedor}`,
        'ConfiguracionPagos.ProveedorDuplicado'
      );
    }

    this.proveedoresPago[index] = nuevoProveedor;
    this.fechaActualizacion = new Date();
    this.validarProveedoresPago();
  }

  /**
   * Remover proveedor de pago
   */
  removerProveedorPago(nombreProveedor: string): void {
    const index = this.proveedoresPago.findIndex(p => p.nombre_proveedor === nombreProveedor);
    if (index === -1) {
      throw ExcepcionDominio.Respuesta404(
        `Proveedor ${nombreProveedor} no encontrado`,
        'ConfiguracionPagos.ProveedorNoEncontrado'
      );
    }

    // Verificar que no sea el único proveedor activo
    const proveedoresActivos = this.proveedoresPago.filter(p => p.activo);
    if (proveedoresActivos.length === 1 && this.proveedoresPago[index].activo) {
      throw ExcepcionDominio.Respuesta400(
        'No se puede eliminar el único proveedor activo',
        'ConfiguracionPagos.ProveedorActivoUnico'
      );
    }

    this.proveedoresPago.splice(index, 1);
    this.fechaActualizacion = new Date();
    this.validarProveedoresPago();
  }

  /**
   * Agregar método de pago
   */
  agregarMetodoPago(metodo: MetodoPagoDto): void {
    const existe = this.metodosPago.some(m => m.metodo === metodo.metodo);
    if (existe) {
      throw ExcepcionDominio.Respuesta400(
        `Ya existe un método de pago ${metodo.metodo}`,
        'ConfiguracionPagos.MetodoYaExiste'
      );
    }

    this.metodosPago.push(metodo);
    this.fechaActualizacion = new Date();
    this.validarMetodosPago();
  }

  /**
   * Actualizar método de pago
   */
  actualizarMetodoPago(tipoMetodo: MetodoPago, nuevoMetodo: MetodoPagoDto): void {
    const index = this.metodosPago.findIndex(m => m.metodo === tipoMetodo);
    if (index === -1) {
      throw ExcepcionDominio.Respuesta404(
        `Método de pago ${tipoMetodo} no encontrado`,
        'ConfiguracionPagos.MetodoNoEncontrado'
      );
    }

    this.metodosPago[index] = nuevoMetodo;
    this.fechaActualizacion = new Date();
    this.validarMetodosPago();
  }

  /**
   * Remover método de pago
   */
  removerMetodoPago(tipoMetodo: MetodoPago): void {
    const index = this.metodosPago.findIndex(m => m.metodo === tipoMetodo);
    if (index === -1) {
      throw ExcepcionDominio.Respuesta404(
        `Método de pago ${tipoMetodo} no encontrado`,
        'ConfiguracionPagos.MetodoNoEncontrado'
      );
    }

    // Verificar que no sea el único método activo
    const metodosActivos = this.metodosPago.filter(m => m.activo);
    if (metodosActivos.length === 1 && this.metodosPago[index].activo) {
      throw ExcepcionDominio.Respuesta400(
        'No se puede eliminar el único método de pago activo',
        'ConfiguracionPagos.MetodoActivoUnico'
      );
    }

    this.metodosPago.splice(index, 1);
    this.fechaActualizacion = new Date();
    this.validarMetodosPago();
  }

  /**
   * Agregar método de pago manual
   */
  agregarMetodoPagoManual(metodo: MetodoPagoManualDto): void {
    const existe = this.metodosPagoManuales.some(m => m.nombre_metodo === metodo.nombre_metodo);
    if (existe) {
      throw ExcepcionDominio.Respuesta400(
        `Ya existe un método de pago manual ${metodo.nombre_metodo}`,
        'ConfiguracionPagos.MetodoManualYaExiste'
      );
    }

    this.metodosPagoManuales.push(metodo);
    this.fechaActualizacion = new Date();
    this.validarMetodosPagoManuales();
  }

  /**
   * Actualizar método de pago manual
   */
  actualizarMetodoPagoManual(nombreMetodo: string, nuevoMetodo: MetodoPagoManualDto): void {
    const index = this.metodosPagoManuales.findIndex(m => m.nombre_metodo === nombreMetodo);
    if (index === -1) {
      throw ExcepcionDominio.Respuesta404(
        `Método de pago manual ${nombreMetodo} no encontrado`,
        'ConfiguracionPagos.MetodoManualNoEncontrado'
      );
    }

    this.metodosPagoManuales[index] = nuevoMetodo;
    this.fechaActualizacion = new Date();
    this.validarMetodosPagoManuales();
  }

  /**
   * Remover método de pago manual
   */
  removerMetodoPagoManual(nombreMetodo: string): void {
    const index = this.metodosPagoManuales.findIndex(m => m.nombre_metodo === nombreMetodo);
    if (index === -1) {
      throw ExcepcionDominio.Respuesta404(
        `Método de pago manual ${nombreMetodo} no encontrado`,
        'ConfiguracionPagos.MetodoManualNoEncontrado'
      );
    }

    this.metodosPagoManuales.splice(index, 1);
    this.fechaActualizacion = new Date();
    this.validarMetodosPagoManuales();
  }

  /**
   * Actualizar configuración de giftcard
   */
  actualizarConfiguracionGiftcard(nuevaConfiguracion: ConfiguracionGiftcardDto): void {
    this.configuracionGiftcard = nuevaConfiguracion;
    this.fechaActualizacion = new Date();
    this.validarConfiguracionGiftcard();
  }

  /**
   * Actualizar personalización
   */
  actualizarPersonalizacion(nuevaPersonalizacion?: PersonalizacionPagosDto): void {
    this.personalizacion = nuevaPersonalizacion;
    this.fechaActualizacion = new Date();
    if (nuevaPersonalizacion) {
      this.validarPersonalizacion();
    }
  }

  /**
   * Actualizar configuración adicional
   */
  actualizarConfiguracionAdicional(nuevaConfiguracion?: Record<string, any>): void {
    this.configuracionAdicional = nuevaConfiguracion;
    this.fechaActualizacion = new Date();
    if (nuevaConfiguracion) {
      this.validarConfiguracionAdicional();
    }
  }

  // Getters
  getModoCaptura(): ModoCapturaPago {
    return this.modoCaptura;
  }

  getProveedoresPago(): ProveedorPagoDto[] {
    return [...this.proveedoresPago];
  }

  getMetodosPago(): MetodoPagoDto[] {
    return [...this.metodosPago];
  }

  getMetodosPagoManuales(): MetodoPagoManualDto[] {
    return [...this.metodosPagoManuales];
  }

  getConfiguracionGiftcard(): ConfiguracionGiftcardDto {
    return { ...this.configuracionGiftcard };
  }

  getPersonalizacion(): PersonalizacionPagosDto | undefined {
    return this.personalizacion ? { ...this.personalizacion } : undefined;
  }

  getConfiguracionAdicional(): Record<string, any> | undefined {
    return this.configuracionAdicional ? { ...this.configuracionAdicional } : undefined;
  }

  /**
   * Verificar si un método de pago está activo
   */
  esMetodoPagoActivo(metodo: MetodoPago): boolean {
    const metodoConfigurado = this.metodosPago.find(m => m.metodo === metodo);
    return metodoConfigurado ? metodoConfigurado.activo : false;
  }

  /**
   * Verificar si un proveedor está activo
   */
  esProveedorActivo(nombreProveedor: string): boolean {
    const proveedor = this.proveedoresPago.find(p => p.nombre_proveedor === nombreProveedor);
    return proveedor ? proveedor.activo : false;
  }

  /**
   * Obtener proveedores activos
   */
  obtenerProveedoresActivos(): ProveedorPagoDto[] {
    return this.proveedoresPago.filter(p => p.activo);
  }

  /**
   * Obtener métodos de pago activos
   */
  obtenerMetodosActivos(): MetodoPagoDto[] {
    return this.metodosPago.filter(m => m.activo);
  }

  /**
   * Obtener métodos de pago manuales activos
   */
  obtenerMetodosManualesActivos(): MetodoPagoManualDto[] {
    return this.metodosPagoManuales.filter(m => m.activo);
  }

  /**
   * Verificar si las giftcards están activas
   */
  sonGiftcardsActivas(): boolean {
    return this.configuracionGiftcard.activo;
  }

  /**
   * Calcular comisión total para un monto
   */
  calcularComisionTotal(monto: number): number {
    const proveedoresActivos = this.obtenerProveedoresActivos();
    if (proveedoresActivos.length === 0) {
      return 0;
    }

    // Usar la comisión del primer proveedor activo
    const comision = proveedoresActivos[0].comision_transaccion;
    return (monto * comision) / 100;
  }
}