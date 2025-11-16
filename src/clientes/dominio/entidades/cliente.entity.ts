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
}