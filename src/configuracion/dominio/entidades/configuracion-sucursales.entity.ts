import { ExcepcionDominio } from '../../../comun/excepciones/excepcion-dominio';
import { 
  ConfiguracionSucursalesDto, 
  EstadoSucursalEnum, 
  TipoSuscripcionPosEnum,
  DireccionSucursalDto,
  HorarioAperturaDto,
  ProductoAsignadoDto,
  ActualizarConfiguracionSucursalesDto 
} from '../../aplicacion/dto/configuracion-sucursales.dto';

/**
 * Entidad de dominio para la configuración de sucursales
 */
export class ConfiguracionSucursales {
  private readonly id: string;
  private readonly tiendaId: string;
  private nombreSucursal: string;
  private direccion: DireccionSucursalDto;
  private estado: EstadoSucursalEnum;
  private suscripcionPos?: TipoSuscripcionPosEnum;
  private capacidadStock?: number;
  private productosAsignados: ProductoAsignadoDto[];
  private ventasPersonaEstado: boolean;
  private metodosPagoLocal: string[];
  private responsable?: string;
  private horario?: HorarioAperturaDto;
  private telefono?: string;
  private email?: string;
  private readonly fechaCreacion: Date;
  private fechaActualizacion: Date;

  constructor(
    id: string,
    tiendaId: string,
    nombreSucursal: string,
    direccion: DireccionSucursalDto,
    estado: EstadoSucursalEnum,
    productosAsignados: ProductoAsignadoDto[] = [],
    ventasPersonaEstado: boolean = false,
    metodosPagoLocal: string[] = [],
    suscripcionPos?: TipoSuscripcionPosEnum,
    capacidadStock?: number,
    responsable?: string,
    horario?: HorarioAperturaDto,
    telefono?: string,
    email?: string,
    fechaCreacion?: Date,
    fechaActualizacion?: Date
  ) {
    this.id = id;
    this.tiendaId = tiendaId;
    this.nombreSucursal = nombreSucursal;
    this.direccion = direccion;
    this.estado = estado;
    this.suscripcionPos = suscripcionPos;
    this.capacidadStock = capacidadStock;
    this.productosAsignados = productosAsignados;
    this.ventasPersonaEstado = ventasPersonaEstado;
    this.metodosPagoLocal = metodosPagoLocal;
    this.responsable = responsable;
    this.horario = horario;
    this.telefono = telefono;
    this.email = email;
    this.fechaCreacion = fechaCreacion || new Date();
    this.fechaActualizacion = fechaActualizacion || new Date();

    this.validar();
  }

  /**
   * Valida la entidad de configuración de sucursales
   */
  private validar(): void {
    this.validarNombreSucursal();
    this.validarDireccion();
    this.validarEstado();
    this.validarSuscripcionPos();
    this.validarCapacidadStock();
    this.validarProductosAsignados();
    this.validarVentasPersona();
    this.validarMetodosPagoLocal();
    this.validarResponsable();
    this.validarHorario();
    this.validarContacto();
  }

  /**
   * Valida el nombre de la sucursal
   */
  private validarNombreSucursal(): void {
    if (!this.nombreSucursal || this.nombreSucursal.trim().length === 0) {
      throw ExcepcionDominio.Respuesta400(
        'El nombre de la sucursal es requerido',
        'Sucursal.NombreRequerido'
      );
    }

    if (this.nombreSucursal.length > 100) {
      throw ExcepcionDominio.Respuesta400(
        'El nombre de la sucursal no puede exceder 100 caracteres',
        'Sucursal.NombreMuyLargo'
      );
    }
  }

  /**
   * Valida la dirección de la sucursal
   */
  private validarDireccion(): void {
    if (!this.direccion) {
      throw ExcepcionDominio.Respuesta400(
        'La dirección es requerida',
        'Sucursal.DireccionRequerida'
      );
    }

    const camposDireccion = ['calle', 'ciudad', 'region', 'pais', 'codigo_postal'];
    for (const campo of camposDireccion) {
      if (!this.direccion[campo] || this.direccion[campo].trim().length === 0) {
        throw ExcepcionDominio.Respuesta400(
          `El campo ${campo} de la dirección es requerido`,
          'Sucursal.DireccionCampoRequerido'
        );
      }
    }

    if (this.direccion.calle.length > 200) {
      throw ExcepcionDominio.Respuesta400(
        'La calle no puede exceder 200 caracteres',
        'Sucursal.CalleMuyLarga'
      );
    }

    if (this.direccion.codigo_postal.length > 20) {
      throw ExcepcionDominio.Respuesta400(
        'El código postal no puede exceder 20 caracteres',
        'Sucursal.CodigoPostalMuyLargo'
      );
    }
  }

  /**
   * Valida el estado de la sucursal
   */
  private validarEstado(): void {
    if (!Object.values(EstadoSucursalEnum).includes(this.estado)) {
      throw ExcepcionDominio.Respuesta400(
        'El estado de la sucursal debe ser "activa" o "inactiva"',
        'Sucursal.EstadoInvalido'
      );
    }
  }

  /**
   * Valida la suscripción POS
   */
  private validarSuscripcionPos(): void {
    if (this.suscripcionPos && !Object.values(TipoSuscripcionPosEnum).includes(this.suscripcionPos)) {
      throw ExcepcionDominio.Respuesta400(
        'El tipo de suscripción POS debe ser "POS Pro" o "POS Lite"',
        'Sucursal.SuscripcionPosInvalida'
      );
    }
  }

  /**
   * Valida la capacidad de stock
   */
  private validarCapacidadStock(): void {
    if (this.capacidadStock !== undefined && this.capacidadStock < 0) {
      throw ExcepcionDominio.Respuesta400(
        'La capacidad de stock no puede ser negativa',
        'Sucursal.CapacidadStockNegativa'
      );
    }
  }

  /**
   * Valida los productos asignados
   */
  private validarProductosAsignados(): void {
    if (!Array.isArray(this.productosAsignados)) {
      throw ExcepcionDominio.Respuesta400(
        'Los productos asignados deben ser un array',
        'Sucursal.ProductosAsignadosNoArray'
      );
    }

    for (const producto of this.productosAsignados) {
      if (!producto.producto_id || producto.producto_id.trim().length === 0) {
        throw ExcepcionDominio.Respuesta400(
          'El ID del producto es requerido',
          'Sucursal.ProductoIdRequerido'
        );
      }

      if (producto.cantidad < 0) {
        throw ExcepcionDominio.Respuesta400(
          'La cantidad de inventario no puede ser negativa',
          'Sucursal.CantidadInventarioNegativa'
        );
      }
    }
  }

  /**
   * Valida las ventas en persona
   */
  private validarVentasPersona(): void {
    if (this.ventasPersonaEstado && !this.suscripcionPos) {
      throw ExcepcionDominio.Respuesta400(
        'Para activar ventas en persona se requiere una suscripción POS activa',
        'Sucursal.VentasPersonaSinSuscripcion'
      );
    }
  }

  /**
   * Valida los métodos de pago local
   */
  private validarMetodosPagoLocal(): void {
    if (!Array.isArray(this.metodosPagoLocal)) {
      throw ExcepcionDominio.Respuesta400(
        'Los métodos de pago local deben ser un array',
        'Sucursal.MetodosPagoNoArray'
      );
    }

    for (const metodo of this.metodosPagoLocal) {
      if (!metodo || metodo.trim().length === 0) {
        throw ExcepcionDominio.Respuesta400(
          'El método de pago no puede estar vacío',
          'Sucursal.MetodoPagoVacio'
        );
      }
    }
  }

  /**
   * Valida el responsable
   */
  private validarResponsable(): void {
    if (this.responsable && !this.validarEmail(this.responsable)) {
      throw ExcepcionDominio.Respuesta400(
        'El responsable debe ser un email válido',
        'Sucursal.ResponsableEmailInvalido'
      );
    }
  }

  /**
   * Valida el horario
   */
  private validarHorario(): void {
    if (this.horario && !this.horario.lunes_viernes) {
      throw ExcepcionDominio.Respuesta400(
        'El horario de lunes a viernes es requerido',
        'Sucursal.HorarioLunesViernesRequerido'
      );
    }
  }

  /**
   * Valida la información de contacto
   */
  private validarContacto(): void {
    if (this.email && !this.validarEmail(this.email)) {
      throw ExcepcionDominio.Respuesta400(
        'El email de contacto debe ser un email válido',
        'Sucursal.EmailContactoInvalido'
      );
    }

    if (this.telefono && this.telefono.length > 20) {
      throw ExcepcionDominio.Respuesta400(
        'El teléfono no puede exceder 20 caracteres',
        'Sucursal.TelefonoMuyLargo'
      );
    }
  }

  /**
   * Valida un email
   */
  private validarEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Actualiza la configuración de sucursales
   */
  public actualizar(datos: ActualizarConfiguracionSucursalesDto): void {
    if (datos.nombre_sucursal !== undefined) {
      this.nombreSucursal = datos.nombre_sucursal;
    }

    if (datos.direccion !== undefined) {
      this.direccion = datos.direccion;
    }

    if (datos.estado !== undefined) {
      this.estado = datos.estado;
    }

    if (datos.suscripcion_pos !== undefined) {
      this.suscripcionPos = datos.suscripcion_pos;
    }

    if (datos.capacidad_stock !== undefined) {
      this.capacidadStock = datos.capacidad_stock;
    }

    if (datos.productos_asignados !== undefined) {
      this.productosAsignados = datos.productos_asignados;
    }

    if (datos.ventas_persona_estado !== undefined) {
      this.ventasPersonaEstado = datos.ventas_persona_estado;
    }

    if (datos.metodos_pago_local !== undefined) {
      this.metodosPagoLocal = datos.metodos_pago_local;
    }

    if (datos.responsable !== undefined) {
      this.responsable = datos.responsable;
    }

    if (datos.horario !== undefined) {
      this.horario = datos.horario;
    }

    if (datos.telefono !== undefined) {
      this.telefono = datos.telefono;
    }

    if (datos.email !== undefined) {
      this.email = datos.email;
    }

    this.fechaActualizacion = new Date();
    this.validar();
  }

  /**
   * Activa la sucursal
   */
  public activar(): void {
    this.estado = EstadoSucursalEnum.ACTIVA;
    this.fechaActualizacion = new Date();
  }

  /**
   * Desactiva la sucursal
   */
  public desactivar(): void {
    this.estado = EstadoSucursalEnum.INACTIVA;
    this.fechaActualizacion = new Date();
  }

  /**
   * Asigna productos a la sucursal
   */
  public asignarProductos(productos: ProductoAsignadoDto[]): void {
    this.productosAsignados = productos;
    this.fechaActualizacion = new Date();
    this.validarProductosAsignados();
  }

  /**
   * Getters
   */
  public getId(): string {
    return this.id;
  }

  public getTiendaId(): string {
    return this.tiendaId;
  }

  public getNombreSucursal(): string {
    return this.nombreSucursal;
  }

  public getDireccion(): DireccionSucursalDto {
    return this.direccion;
  }

  public getEstado(): EstadoSucursalEnum {
    return this.estado;
  }

  public getSuscripcionPos(): TipoSuscripcionPosEnum | undefined {
    return this.suscripcionPos;
  }

  public getCapacidadStock(): number | undefined {
    return this.capacidadStock;
  }

  public getProductosAsignados(): ProductoAsignadoDto[] {
    return this.productosAsignados;
  }

  public getVentasPersonaEstado(): boolean {
    return this.ventasPersonaEstado;
  }

  public getMetodosPagoLocal(): string[] {
    return this.metodosPagoLocal;
  }

  public getResponsable(): string | undefined {
    return this.responsable;
  }

  public getHorario(): HorarioAperturaDto | undefined {
    return this.horario;
  }

  public getTelefono(): string | undefined {
    return this.telefono;
  }

  public getEmail(): string | undefined {
    return this.email;
  }

  public getFechaCreacion(): Date {
    return this.fechaCreacion;
  }

  public getFechaActualizacion(): Date {
    return this.fechaActualizacion;
  }

  /**
   * Crea una instancia desde DTO
   */
  public static crearDesdeDto(
    id: string,
    tiendaId: string,
    datos: ConfiguracionSucursalesDto,
    fechaCreacion?: Date,
    fechaActualizacion?: Date
  ): ConfiguracionSucursales {
    return new ConfiguracionSucursales(
      id,
      tiendaId,
      datos.nombre_sucursal,
      datos.direccion,
      datos.estado,
      datos.productos_asignados || [],
      datos.ventas_persona_estado || false,
      datos.metodos_pago_local || [],
      datos.suscripcion_pos,
      datos.capacidad_stock,
      datos.responsable,
      datos.horario,
      datos.telefono,
      datos.email,
      fechaCreacion,
      fechaActualizacion
    );
  }

  /**
   * Convierte a DTO
   */
  public aDto(): ConfiguracionSucursalesDto {
    return {
      nombre_sucursal: this.nombreSucursal,
      direccion: this.direccion,
      estado: this.estado,
      suscripcion_pos: this.suscripcionPos,
      capacidad_stock: this.capacidadStock,
      productos_asignados: this.productosAsignados,
      ventas_persona_estado: this.ventasPersonaEstado,
      metodos_pago_local: this.metodosPagoLocal,
      responsable: this.responsable,
      horario: this.horario,
      telefono: this.telefono,
      email: this.email
    };
  }
}