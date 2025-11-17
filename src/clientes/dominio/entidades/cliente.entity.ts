/**
 * Entidad de Cliente que representa un cliente en el sistema
 * Sigue los principios de Domain-Driven Design y Arquitectura Limpia
 */
export class Cliente {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly nombreCompleto: string,
    public readonly telefono: string | null,
    public readonly activo: boolean,
    public readonly fechaCreacion: Date,
    public readonly fechaActualizacion: Date,
    public readonly creadorId: string,
    public readonly totalGastado: number = 0,
    public readonly totalOrdenes: number = 0,
    public readonly fechaUltimaOrden: Date | null = null,
    public readonly tags: string[] = [],
    public readonly notas: string | null = null,
    public readonly aceptaMarketing: boolean = false,
    public readonly fuenteCliente: string = 'TIENDA_ONLINE',
    // Campos avanzados para producción según requisitos Shopify
    public readonly idioma: string = 'es',
    public readonly zonaHoraria: string = 'America/Lima',
    public readonly configuracionFiscal: 'RECAUDAR_IMPUESTOS' | 'RECAUDAR_SALVO_EXCEPCIONES' | 'NO_RECAUDAR_IMPUESTOS' = 'RECAUDAR_IMPUESTOS',
    public readonly aceptaSmsMarketing: boolean = false,
    public readonly creditoTienda: number = 0,
    public readonly direccionPredeterminadaId: string | null = null,
    public readonly estadoSuscripcionEmail: 'SUSCRITO' | 'NO_SUSCRITO' = 'NO_SUSCRITO',
    public readonly estadoSuscripcionSms: 'SUSCRITO' | 'NO_SUSCRITO' = 'NO_SUSCRITO',
    public readonly fechaUltimaActividad: Date = new Date(),
    public readonly grupoRfm: 'NUEVO' | 'OCASIONAL' | 'FRECUENTE' | 'FIEL' | 'VIP' = 'NUEVO',
  ) {}

  /**
   * Verifica si el cliente está activo y puede realizar operaciones
   */
  estaActivo(): boolean {
    return this.activo;
  }

  /**
   * Actualiza la información del cliente
   */
  actualizarInformacion(
    nombreCompleto?: string,
    telefono?: string | null,
    activo?: boolean,
    tags?: string[],
    notas?: string | null,
    aceptaMarketing?: boolean,
    idioma?: string,
    zonaHoraria?: string,
    configuracionFiscal?: 'RECAUDAR_IMPUESTOS' | 'RECAUDAR_SALVO_EXCEPCIONES' | 'NO_RECAUDAR_IMPUESTOS',
    aceptaSmsMarketing?: boolean,
    creditoTienda?: number,
    direccionPredeterminadaId?: string | null,
    estadoSuscripcionEmail?: 'SUSCRITO' | 'NO_SUSCRITO',
    estadoSuscripcionSms?: 'SUSCRITO' | 'NO_SUSCRITO',
  ): Cliente {
    return new Cliente(
      this.id,
      this.email,
      nombreCompleto || this.nombreCompleto,
      telefono !== undefined ? telefono : this.telefono,
      activo !== undefined ? activo : this.activo,
      this.fechaCreacion,
      new Date(),
      this.creadorId,
      this.totalGastado,
      this.totalOrdenes,
      this.fechaUltimaOrden,
      tags || this.tags,
      notas !== undefined ? notas : this.notas,
      aceptaMarketing !== undefined ? aceptaMarketing : this.aceptaMarketing,
      this.fuenteCliente,
      idioma || this.idioma,
      zonaHoraria || this.zonaHoraria,
      configuracionFiscal || this.configuracionFiscal,
      aceptaSmsMarketing !== undefined ? aceptaSmsMarketing : this.aceptaSmsMarketing,
      creditoTienda !== undefined ? creditoTienda : this.creditoTienda,
      direccionPredeterminadaId !== undefined ? direccionPredeterminadaId : this.direccionPredeterminadaId,
      estadoSuscripcionEmail || this.estadoSuscripcionEmail,
      estadoSuscripcionSms || this.estadoSuscripcionSms,
      new Date(), // Actualizar fecha de última actividad
      this.calcularGrupoRfm(), // Recalcular grupo RFM
    );
  }

  /**
   * Activa el cliente
   */
  activar(): Cliente {
    return this.actualizarInformacion(undefined, undefined, true);
  }

  /**
   * Desactiva el cliente
   */
  desactivar(): Cliente {
    return this.actualizarInformacion(undefined, undefined, false);
  }

  /**
   * Valida que el email tenga formato correcto
   */
  validarEmail(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(this.email);
  }

  /**
   * Valida que el teléfono tenga formato correcto (si existe)
   */
  validarTelefono(): boolean {
    if (!this.telefono) return true;
    
    // Formato básico de teléfono: permite números, espacios, paréntesis, guiones
    const telefonoRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{1,9}$/;
    return telefonoRegex.test(this.telefono);
  }

  /**
   * Obtiene las iniciales del cliente para avatares
   */
  obtenerIniciales(): string {
    const nombres = this.nombreCompleto.split(' ');
    if (nombres.length === 1) {
      return nombres[0].charAt(0).toUpperCase();
    }
    return (nombres[0].charAt(0) + nombres[nombres.length - 1].charAt(0)).toUpperCase();
  }

  /**
   * Actualiza las estadísticas del cliente después de una orden
   */
  actualizarEstadisticasOrden(
    montoOrden: number,
    fechaOrden: Date,
  ): Cliente {
    return new Cliente(
      this.id,
      this.email,
      this.nombreCompleto,
      this.telefono,
      this.activo,
      this.fechaCreacion,
      new Date(),
      this.creadorId,
      this.totalGastado + montoOrden,
      this.totalOrdenes + 1,
      fechaOrden,
      this.tags,
      this.notas,
      this.aceptaMarketing,
      this.fuenteCliente,
    );
  }

  /**
   * Agrega tags al cliente
   */
  agregarTags(nuevosTags: string[]): Cliente {
    const tagsUnicos = [...new Set([...this.tags, ...nuevosTags])];
    return this.actualizarInformacion(
      undefined,
      undefined,
      undefined,
      tagsUnicos,
      undefined,
      undefined,
    );
  }

  /**
   * Elimina tags del cliente
   */
  eliminarTags(tagsAEliminar: string[]): Cliente {
    const tagsActualizados = this.tags.filter(tag => !tagsAEliminar.includes(tag));
    return this.actualizarInformacion(
      undefined,
      undefined,
      undefined,
      tagsActualizados,
      undefined,
      undefined,
    );
  }

  /**
   * Verifica si el cliente pertenece a un segmento específico
   */
  perteneceASegmento(reglas: any): boolean {
    // Implementación básica de reglas de segmentación
    // En una implementación completa, esto evaluaría las reglas complejas
    if (reglas.totalGastadoMinimo && this.totalGastado < reglas.totalGastadoMinimo) {
      return false;
    }

    if (reglas.totalOrdenesMinimo && this.totalOrdenes < reglas.totalOrdenesMinimo) {
      return false;
    }

    if (reglas.tags && reglas.tags.length > 0) {
      const tieneTags = reglas.tags.some((tag: string) => this.tags.includes(tag));
      if (!tieneTags) return false;
    }

    if (reglas.aceptaMarketing && !this.aceptaMarketing) {
      return false;
    }

    if (reglas.fuenteCliente && reglas.fuenteCliente !== this.fuenteCliente) {
      return false;
    }

    return true;
  }

  /**
   * Obtiene el valor promedio por orden
   */
  obtenerValorPromedioOrden(): number {
    return this.totalOrdenes > 0 ? this.totalGastado / this.totalOrdenes : 0;
  }

  /**
   * Verifica si es un cliente frecuente (más de 3 órdenes)
   */
  esClienteFrecuente(): boolean {
    return this.totalOrdenes >= 3;
  }

  /**
   * Verifica si es un cliente valioso (gasto mayor a 500)
   */
  esClienteValioso(): boolean {
    return this.totalGastado >= 500;
  }

  /**
   * Calcula el grupo RFM (Recency, Frequency, Monetary) del cliente
   * Basado en la última compra, frecuencia de compras y monto gastado
   */
  calcularGrupoRfm(): 'NUEVO' | 'OCASIONAL' | 'FRECUENTE' | 'FIEL' | 'VIP' {
    if (this.totalOrdenes === 0) return 'NUEVO';

    const ahora = new Date();
    const diasDesdeUltimaOrden = this.fechaUltimaOrden
      ? Math.floor((ahora.getTime() - this.fechaUltimaOrden.getTime()) / (1000 * 60 * 60 * 24))
      : 365;

    // Lógica RFM simplificada para producción
    if (this.totalOrdenes >= 10 && this.totalGastado >= 1000 && diasDesdeUltimaOrden <= 30) {
      return 'VIP';
    } else if (this.totalOrdenes >= 5 && this.totalGastado >= 500 && diasDesdeUltimaOrden <= 90) {
      return 'FIEL';
    } else if (this.totalOrdenes >= 3 && diasDesdeUltimaOrden <= 180) {
      return 'FRECUENTE';
    } else if (this.totalOrdenes >= 1 && diasDesdeUltimaOrden <= 365) {
      return 'OCASIONAL';
    } else {
      return 'NUEVO';
    }
  }

  /**
   * Actualiza las suscripciones de marketing del cliente
   */
  actualizarSuscripciones(
    estadoSuscripcionEmail?: 'SUSCRITO' | 'NO_SUSCRITO',
    estadoSuscripcionSms?: 'SUSCRITO' | 'NO_SUSCRITO',
  ): Cliente {
    return this.actualizarInformacion(
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      estadoSuscripcionEmail,
      estadoSuscripcionSms,
    );
  }

  /**
   * Suscribe al cliente a email marketing
   */
  suscribirEmailMarketing(): Cliente {
    return this.actualizarSuscripciones('SUSCRITO', undefined);
  }

  /**
   * Desuscribe al cliente de email marketing
   */
  desuscribirEmailMarketing(): Cliente {
    return this.actualizarSuscripciones('NO_SUSCRITO', undefined);
  }

  /**
   * Suscribe al cliente a SMS marketing
   */
  suscribirSmsMarketing(): Cliente {
    return this.actualizarSuscripciones(undefined, 'SUSCRITO');
  }

  /**
   * Desuscribe al cliente de SMS marketing
   */
  desuscribirSmsMarketing(): Cliente {
    return this.actualizarSuscripciones(undefined, 'NO_SUSCRITO');
  }

  /**
   * Agrega crédito a la tienda del cliente
   */
  agregarCreditoTienda(monto: number): Cliente {
    if (monto <= 0) {
      throw new Error('El monto de crédito debe ser mayor a cero');
    }
    return this.actualizarInformacion(
      undefined, // nombreCompleto
      undefined, // telefono
      undefined, // activo
      undefined, // tags
      undefined, // notas
      undefined, // aceptaMarketing
      undefined, // idioma
      undefined, // zonaHoraria
      undefined, // configuracionFiscal
      undefined, // aceptaSmsMarketing
      this.creditoTienda + monto, // creditoTienda
      undefined, // direccionPredeterminadaId
      undefined, // estadoSuscripcionEmail
      undefined, // estadoSuscripcionSms
    );
  }

  /**
   * Utiliza crédito de la tienda del cliente
   */
  utilizarCreditoTienda(monto: number): Cliente {
    if (monto <= 0) {
      throw new Error('El monto a utilizar debe ser mayor a cero');
    }
    if (monto > this.creditoTienda) {
      throw new Error('Crédito insuficiente en la tienda');
    }
    return this.actualizarInformacion(
      undefined, // nombreCompleto
      undefined, // telefono
      undefined, // activo
      undefined, // tags
      undefined, // notas
      undefined, // aceptaMarketing
      undefined, // idioma
      undefined, // zonaHoraria
      undefined, // configuracionFiscal
      undefined, // aceptaSmsMarketing
      this.creditoTienda - monto, // creditoTienda
      undefined, // direccionPredeterminadaId
      undefined, // estadoSuscripcionEmail
      undefined, // estadoSuscripcionSms
    );
  }

  /**
   * Actualiza la configuración fiscal del cliente
   */
  actualizarConfiguracionFiscal(
    configuracionFiscal: 'RECAUDAR_IMPUESTOS' | 'RECAUDAR_SALVO_EXCEPCIONES' | 'NO_RECAUDAR_IMPUESTOS',
  ): Cliente {
    return this.actualizarInformacion(
      undefined, // nombreCompleto
      undefined, // telefono
      undefined, // activo
      undefined, // tags
      undefined, // notas
      undefined, // aceptaMarketing
      undefined, // idioma
      undefined, // zonaHoraria
      configuracionFiscal, // configuracionFiscal
      undefined, // aceptaSmsMarketing
      undefined, // creditoTienda
      undefined, // direccionPredeterminadaId
      undefined, // estadoSuscripcionEmail
      undefined, // estadoSuscripcionSms
    );
  }

  /**
   * Actualiza la dirección predeterminada del cliente
   */
  actualizarDireccionPredeterminada(direccionId: string | null): Cliente {
    return this.actualizarInformacion(
      undefined, // nombreCompleto
      undefined, // telefono
      undefined, // activo
      undefined, // tags
      undefined, // notas
      undefined, // aceptaMarketing
      undefined, // idioma
      undefined, // zonaHoraria
      undefined, // configuracionFiscal
      undefined, // aceptaSmsMarketing
      undefined, // creditoTienda
      direccionId, // direccionPredeterminadaId
      undefined, // estadoSuscripcionEmail
      undefined, // estadoSuscripcionSms
    );
  }

  /**
   * Actualiza la fecha de última actividad del cliente
   */
  actualizarUltimaActividad(): Cliente {
    return new Cliente(
      this.id,
      this.email,
      this.nombreCompleto,
      this.telefono,
      this.activo,
      this.fechaCreacion,
      new Date(),
      this.creadorId,
      this.totalGastado,
      this.totalOrdenes,
      this.fechaUltimaOrden,
      this.tags,
      this.notas,
      this.aceptaMarketing,
      this.fuenteCliente,
      this.idioma,
      this.zonaHoraria,
      this.configuracionFiscal,
      this.aceptaSmsMarketing,
      this.creditoTienda,
      this.direccionPredeterminadaId,
      this.estadoSuscripcionEmail,
      this.estadoSuscripcionSms,
      new Date(),
      this.grupoRfm,
    );
  }

  /**
   * Verifica si el cliente está suscrito a algún tipo de marketing
   */
  estaSuscritoAMarketing(): boolean {
    return this.estadoSuscripcionEmail === 'SUSCRITO' || this.estadoSuscripcionSms === 'SUSCRITO';
  }

  /**
   * Obtiene el tiempo como cliente en días
   */
  obtenerTiempoComoCliente(): number {
    const ahora = new Date();
    const diferenciaMs = ahora.getTime() - this.fechaCreacion.getTime();
    return Math.floor(diferenciaMs / (1000 * 60 * 60 * 24));
  }

  /**
   * Verifica si el cliente ha estado inactivo por más de X días
   */
  estaInactivoPor(dias: number): boolean {
    const ahora = new Date();
    const diferenciaMs = ahora.getTime() - this.fechaUltimaActividad.getTime();
    const diasInactivo = Math.floor(diferenciaMs / (1000 * 60 * 60 * 24));
    return diasInactivo > dias;
  }
}