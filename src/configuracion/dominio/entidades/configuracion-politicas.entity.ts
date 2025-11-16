import { ExcepcionDominio } from '../../../comun/excepciones/excepcion-dominio';
import { ConfiguracionPoliticasDto, ActualizarConfiguracionPoliticasDto, EstadoReglasDevolucionEnum, TipoReglaDevolucionEnum, ReglaDevolucionDto, PoliticaPrivacidadDto, TerminosServicioDto, PoliticaEnvioDto, InformacionContactoDto } from '../../aplicacion/dto/configuracion-politicas.dto';

/**
 * Entidad de dominio para la configuración de políticas
 * Implementa la lógica de negocio y validaciones para la gestión de políticas y devoluciones
 */
export class ConfiguracionPoliticas {
  private constructor(
    public readonly id: string,
    public readonly tiendaId: string,
    public estadoReglasDevolucion: EstadoReglasDevolucionEnum,
    public reglasDevolucion: ReglaDevolucionDto[],
    public politicaPrivacidad: PoliticaPrivacidadDto,
    public terminosServicio: TerminosServicioDto,
    public politicaEnvios: PoliticaEnvioDto,
    public informacionContacto: InformacionContactoDto,
    public productosVentaFinal: string[],
    public readonly fechaCreacion: Date,
    public fechaActualizacion: Date,
  ) {}

  /**
   * Método estático para crear una nueva configuración de políticas
   */
  static crear(
    id: string,
    tiendaId: string,
    estadoReglasDevolucion: EstadoReglasDevolucionEnum,
    reglasDevolucion: ReglaDevolucionDto[],
    politicaPrivacidad: PoliticaPrivacidadDto,
    terminosServicio: TerminosServicioDto,
    politicaEnvios: PoliticaEnvioDto,
    informacionContacto: InformacionContactoDto,
    productosVentaFinal: string[] = [],
  ): ConfiguracionPoliticas {
    ConfiguracionPoliticas.validarCamposObligatorios(
      estadoReglasDevolucion,
      reglasDevolucion,
      politicaPrivacidad,
      terminosServicio,
      politicaEnvios,
      informacionContacto
    );

    ConfiguracionPoliticas.validarReglasDevolucion(reglasDevolucion);
    ConfiguracionPoliticas.validarPoliticaPrivacidad(politicaPrivacidad);
    ConfiguracionPoliticas.validarTerminosServicio(terminosServicio);
    ConfiguracionPoliticas.validarPoliticaEnvios(politicaEnvios);
    ConfiguracionPoliticas.validarInformacionContacto(informacionContacto);
    ConfiguracionPoliticas.validarProductosVentaFinal(productosVentaFinal);

    const fechaCreacion = new Date();
    const fechaActualizacion = new Date();

    return new ConfiguracionPoliticas(
      id,
      tiendaId,
      estadoReglasDevolucion,
      reglasDevolucion,
      politicaPrivacidad,
      terminosServicio,
      politicaEnvios,
      informacionContacto,
      productosVentaFinal,
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
    dto: ConfiguracionPoliticasDto,
  ): ConfiguracionPoliticas {
    return this.crear(
      id,
      tiendaId,
      dto.estado_reglas_devolucion as EstadoReglasDevolucionEnum,
      dto.reglas_devolucion,
      dto.politica_privacidad,
      dto.terminos_servicio,
      dto.politica_envios,
      dto.informacion_contacto,
      dto.productos_venta_final || [],
    );
  }

  /**
   * Método para actualizar la configuración de políticas
   */
  actualizar(dto: ActualizarConfiguracionPoliticasDto): void {
    if (dto.estado_reglas_devolucion !== undefined) {
      this.estadoReglasDevolucion = dto.estado_reglas_devolucion as EstadoReglasDevolucionEnum;
    }

    if (dto.reglas_devolucion !== undefined) {
      ConfiguracionPoliticas.validarReglasDevolucion(dto.reglas_devolucion);
      this.reglasDevolucion = dto.reglas_devolucion;
    }

    if (dto.politica_privacidad !== undefined) {
      ConfiguracionPoliticas.validarPoliticaPrivacidad(dto.politica_privacidad);
      this.politicaPrivacidad = dto.politica_privacidad;
    }

    if (dto.terminos_servicio !== undefined) {
      ConfiguracionPoliticas.validarTerminosServicio(dto.terminos_servicio);
      this.terminosServicio = dto.terminos_servicio;
    }

    if (dto.politica_envios !== undefined) {
      ConfiguracionPoliticas.validarPoliticaEnvios(dto.politica_envios);
      this.politicaEnvios = dto.politica_envios;
    }

    if (dto.informacion_contacto !== undefined) {
      ConfiguracionPoliticas.validarInformacionContacto(dto.informacion_contacto);
      this.informacionContacto = dto.informacion_contacto;
    }

    if (dto.productos_venta_final !== undefined) {
      ConfiguracionPoliticas.validarProductosVentaFinal(dto.productos_venta_final);
      this.productosVentaFinal = dto.productos_venta_final;
    }

    this.fechaActualizacion = new Date();
  }

  /**
   * Método para activar las reglas de devolución
   */
  activarReglasDevolucion(): void {
    this.estadoReglasDevolucion = EstadoReglasDevolucionEnum.ACTIVADO;
    this.fechaActualizacion = new Date();
  }

  /**
   * Método para desactivar las reglas de devolución
   */
  desactivarReglasDevolucion(): void {
    this.estadoReglasDevolucion = EstadoReglasDevolucionEnum.DESACTIVADO;
    this.fechaActualizacion = new Date();
  }

  /**
   * Método para agregar una regla de devolución
   */
  agregarReglaDevolucion(regla: ReglaDevolucionDto): void {
    ConfiguracionPoliticas.validarReglaDevolucion(regla);
    
    // Verificar que no exista una regla con el mismo tipo y condición
    const reglaExistente = this.reglasDevolucion.find(
      r => r.tipo === regla.tipo && r.condicion === regla.condicion
    );

    if (reglaExistente) {
      throw ExcepcionDominio.duplicado(
        `Regla de devolución con tipo '${regla.tipo}' y condición '${regla.condicion}'`,
        'Politicas.ReglaDevolucionDuplicada'
      );
    }

    this.reglasDevolucion.push(regla);
    this.fechaActualizacion = new Date();
  }

  /**
   * Método para actualizar una regla de devolución
   */
  actualizarReglaDevolucion(indice: number, regla: ReglaDevolucionDto): void {
    if (indice < 0 || indice >= this.reglasDevolucion.length) {
      throw ExcepcionDominio.Respuesta404(
        'Regla de devolución no encontrada',
        'Politicas.ReglaDevolucionNoEncontrada'
      );
    }

    ConfiguracionPoliticas.validarReglaDevolucion(regla);
    this.reglasDevolucion[indice] = regla;
    this.fechaActualizacion = new Date();
  }

  /**
   * Método para eliminar una regla de devolución
   */
  eliminarReglaDevolucion(indice: number): void {
    if (indice < 0 || indice >= this.reglasDevolucion.length) {
      throw ExcepcionDominio.Respuesta404(
        'Regla de devolución no encontrada',
        'Politicas.ReglaDevolucionNoEncontrada'
      );
    }

    this.reglasDevolucion.splice(indice, 1);
    this.fechaActualizacion = new Date();
  }

  /**
   * Método para agregar un producto a venta final
   */
  agregarProductoVentaFinal(productoId: string): void {
    ConfiguracionPoliticas.validarIdProducto(productoId);

    if (this.productosVentaFinal.includes(productoId)) {
      throw ExcepcionDominio.duplicado(
        `Producto '${productoId}' en venta final`,
        'Politicas.ProductoVentaFinalDuplicado'
      );
    }

    this.productosVentaFinal.push(productoId);
    this.fechaActualizacion = new Date();
  }

  /**
   * Método para eliminar un producto de venta final
   */
  eliminarProductoVentaFinal(productoId: string): void {
    ConfiguracionPoliticas.validarIdProducto(productoId);

    const indice = this.productosVentaFinal.indexOf(productoId);
    if (indice === -1) {
      throw ExcepcionDominio.Respuesta404(
        'Producto no encontrado en venta final',
        'Politicas.ProductoVentaFinalNoEncontrado'
      );
    }

    this.productosVentaFinal.splice(indice, 1);
    this.fechaActualizacion = new Date();
  }

  /**
   * Método para verificar si las reglas de devolución están activas
   */
  reglasDevolucionEstanActivas(): boolean {
    return this.estadoReglasDevolucion === EstadoReglasDevolucionEnum.ACTIVADO;
  }

  /**
   * Método para verificar si un producto es de venta final
   */
  esProductoVentaFinal(productoId: string): boolean {
    return this.productosVentaFinal.includes(productoId);
  }

  /**
   * Método para obtener reglas de devolución activas
   */
  obtenerReglasDevolucionActivas(): ReglaDevolucionDto[] {
    return this.reglasDevolucion.filter(regla => regla.activo);
  }

  /**
   * Método para convertir a DTO de respuesta
   */
  aDto(): any {
    return {
      id: this.id,
      tienda_id: this.tiendaId,
      estado_reglas_devolucion: this.estadoReglasDevolucion,
      reglas_devolucion: this.reglasDevolucion,
      politica_privacidad: this.politicaPrivacidad,
      terminos_servicio: this.terminosServicio,
      politica_envios: this.politicaEnvios,
      informacion_contacto: this.informacionContacto,
      productos_venta_final: this.productosVentaFinal,
      fecha_creacion: this.fechaCreacion,
      fecha_actualizacion: this.fechaActualizacion,
    };
  }

  /**
   * Validaciones privadas
   */

  private static validarCamposObligatorios(
    estadoReglasDevolucion: EstadoReglasDevolucionEnum,
    reglasDevolucion: ReglaDevolucionDto[],
    politicaPrivacidad: PoliticaPrivacidadDto,
    terminosServicio: TerminosServicioDto,
    politicaEnvios: PoliticaEnvioDto,
    informacionContacto: InformacionContactoDto,
  ): void {
    if (!estadoReglasDevolucion) {
      throw ExcepcionDominio.valorRequerido('estado_reglas_devolucion', 'Politicas.EstadoReglasDevolucionRequerido');
    }

    if (!reglasDevolucion || !Array.isArray(reglasDevolucion)) {
      throw ExcepcionDominio.valorRequerido('reglas_devolucion', 'Politicas.ReglasDevolucionRequeridas');
    }

    if (!politicaPrivacidad) {
      throw ExcepcionDominio.valorRequerido('politica_privacidad', 'Politicas.PoliticaPrivacidadRequerida');
    }

    if (!terminosServicio) {
      throw ExcepcionDominio.valorRequerido('terminos_servicio', 'Politicas.TerminosServicioRequeridos');
    }

    if (!politicaEnvios) {
      throw ExcepcionDominio.valorRequerido('politica_envios', 'Politicas.PoliticaEnviosRequerida');
    }

    if (!informacionContacto) {
      throw ExcepcionDominio.valorRequerido('informacion_contacto', 'Politicas.InformacionContactoRequerida');
    }
  }

  private static validarReglasDevolucion(reglas: ReglaDevolucionDto[]): void {
    if (!Array.isArray(reglas)) {
      throw ExcepcionDominio.valorInvalido(
        'reglas_devolucion',
        reglas,
        'Politicas.ReglasDevolucionDebeSerArray'
      );
    }

    for (const regla of reglas) {
      this.validarReglaDevolucion(regla);
    }
  }

  private static validarReglaDevolucion(regla: ReglaDevolucionDto): void {
    if (!regla.tipo) {
      throw ExcepcionDominio.valorRequerido('tipo', 'Politicas.TipoReglaRequerido');
    }

    if (!Object.values(TipoReglaDevolucionEnum).includes(regla.tipo as TipoReglaDevolucionEnum)) {
      throw ExcepcionDominio.valorInvalido(
        'tipo',
        regla.tipo,
        'Politicas.TipoReglaInvalido'
      );
    }

    if (!regla.condicion) {
      throw ExcepcionDominio.valorRequerido('condicion', 'Politicas.CondicionReglaRequerida');
    }

    if (regla.condicion.length > 500) {
      throw ExcepcionDominio.longitudInvalida(
        'condicion',
        1,
        500,
        'Politicas.CondicionReglaLongitudInvalida'
      );
    }

    // Validaciones específicas por tipo de regla
    switch (regla.tipo) {
      case TipoReglaDevolucionEnum.PLAZO_DIAS:
        if (regla.valor === undefined || regla.valor < 1 || regla.valor > 365) {
          throw ExcepcionDominio.valorFueraDeRango(
            'valor',
            1,
            365,
            'Politicas.PlazoDiasFueraDeRango'
          );
        }
        break;

      case TipoReglaDevolucionEnum.CARGO_DEVOLUCION:
        if (regla.valor === undefined || regla.valor < 0 || regla.valor > 100) {
          throw ExcepcionDominio.valorFueraDeRango(
            'valor',
            0,
            100,
            'Politicas.CargoDevolucionFueraDeRango'
          );
        }
        break;
    }
  }

  private static validarPoliticaPrivacidad(politica: PoliticaPrivacidadDto): void {
    if (!politica.titulo || politica.titulo.trim() === '') {
      throw ExcepcionDominio.valorRequerido('titulo', 'Politicas.TituloPoliticaPrivacidadRequerido');
    }

    if (politica.titulo.length > 200) {
      throw ExcepcionDominio.longitudInvalida(
        'titulo',
        1,
        200,
        'Politicas.TituloPoliticaPrivacidadLongitudInvalida'
      );
    }

    if (!politica.contenido || politica.contenido.trim() === '') {
      throw ExcepcionDominio.valorRequerido('contenido', 'Politicas.ContenidoPoliticaPrivacidadRequerido');
    }

    if (!politica.fecha_actualizacion) {
      throw ExcepcionDominio.valorRequerido('fecha_actualizacion', 'Politicas.FechaActualizacionPoliticaPrivacidadRequerida');
    }
  }

  private static validarTerminosServicio(terminos: TerminosServicioDto): void {
    if (!terminos.titulo || terminos.titulo.trim() === '') {
      throw ExcepcionDominio.valorRequerido('titulo', 'Politicas.TituloTerminosServicioRequerido');
    }

    if (terminos.titulo.length > 200) {
      throw ExcepcionDominio.longitudInvalida(
        'titulo',
        1,
        200,
        'Politicas.TituloTerminosServicioLongitudInvalida'
      );
    }

    if (!terminos.contenido || terminos.contenido.trim() === '') {
      throw ExcepcionDominio.valorRequerido('contenido', 'Politicas.ContenidoTerminosServicioRequerido');
    }

    if (!terminos.fecha_actualizacion) {
      throw ExcepcionDominio.valorRequerido('fecha_actualizacion', 'Politicas.FechaActualizacionTerminosServicioRequerida');
    }
  }

  private static validarPoliticaEnvios(politica: PoliticaEnvioDto): void {
    if (!politica.titulo || politica.titulo.trim() === '') {
      throw ExcepcionDominio.valorRequerido('titulo', 'Politicas.TituloPoliticaEnviosRequerido');
    }

    if (politica.titulo.length > 200) {
      throw ExcepcionDominio.longitudInvalida(
        'titulo',
        1,
        200,
        'Politicas.TituloPoliticaEnviosLongitudInvalida'
      );
    }

    if (!politica.contenido || politica.contenido.trim() === '') {
      throw ExcepcionDominio.valorRequerido('contenido', 'Politicas.ContenidoPoliticaEnviosRequerido');
    }

    if (!politica.fecha_actualizacion) {
      throw ExcepcionDominio.valorRequerido('fecha_actualizacion', 'Politicas.FechaActualizacionPoliticaEnviosRequerida');
    }
  }

  private static validarInformacionContacto(contacto: InformacionContactoDto): void {
    if (!contacto.email || contacto.email.trim() === '') {
      throw ExcepcionDominio.valorRequerido('email', 'Politicas.EmailContactoRequerido');
    }

    // Validación básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contacto.email)) {
      throw ExcepcionDominio.valorInvalido(
        'email',
        contacto.email,
        'Politicas.EmailContactoInvalido'
      );
    }

    if (contacto.telefono && contacto.telefono.length > 20) {
      throw ExcepcionDominio.longitudInvalida(
        'telefono',
        0,
        20,
        'Politicas.TelefonoContactoLongitudInvalida'
      );
    }

    if (contacto.direccion && contacto.direccion.length > 500) {
      throw ExcepcionDominio.longitudInvalida(
        'direccion',
        0,
        500,
        'Politicas.DireccionContactoLongitudInvalida'
      );
    }

    if (contacto.horario_atencion && contacto.horario_atencion.length > 100) {
      throw ExcepcionDominio.longitudInvalida(
        'horario_atencion',
        0,
        100,
        'Politicas.HorarioAtencionLongitudInvalida'
      );
    }
  }

  private static validarProductosVentaFinal(productos: string[]): void {
    if (!Array.isArray(productos)) {
      throw ExcepcionDominio.valorInvalido(
        'productos_venta_final',
        productos,
        'Politicas.ProductosVentaFinalDebeSerArray'
      );
    }

    for (const productoId of productos) {
      this.validarIdProducto(productoId);
    }
  }

  private static validarIdProducto(productoId: string): void {
    if (!productoId || productoId.trim() === '') {
      throw ExcepcionDominio.valorRequerido('producto_id', 'Politicas.ProductoIdRequerido');
    }

    if (productoId.length > 50) {
      throw ExcepcionDominio.longitudInvalida(
        'producto_id',
        1,
        50,
        'Politicas.ProductoIdLongitudInvalida'
      );
    }
  }
}