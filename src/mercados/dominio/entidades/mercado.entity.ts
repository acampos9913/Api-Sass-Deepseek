import { EstadoMercado } from '../enums/estado-mercado.enum';

/**
 * Entidad de dominio para representar un mercado
 * Contiene la lógica de negocio pura y es independiente de frameworks
 */
export class Mercado {
  constructor(
    public readonly id: string,
    public readonly nombre: string,
    public readonly codigo: string,
    public readonly moneda: string,
    public readonly idioma: string,
    public readonly zonaHoraria: string,
    public readonly estado: EstadoMercado,
    public readonly activo: boolean,
    public readonly fechaCreacion: Date,
    public readonly fechaActualizacion: Date,
    public readonly tiendaId: string | null,
    public readonly configuracion: Record<string, any> | null,
  ) {}

  /**
   * Valida si el mercado está activo y disponible
   */
  validarDisponibilidad(): boolean {
    return this.activo && this.estado === EstadoMercado.ACTIVO;
  }

  /**
   * Valida la configuración del mercado
   */
  validarConfiguracion(): boolean {
    const config = this.configuracion;
    if (!config) {
      return true; // La configuración es opcional
    }

    // Validar que la configuración sea un objeto válido
    return typeof config === 'object' && !Array.isArray(config);
  }

  /**
   * Obtiene la configuración regional del mercado
   */
  obtenerConfiguracionRegional(): {
    moneda: string;
    idioma: string;
    zonaHoraria: string;
  } {
    return {
      moneda: this.moneda,
      idioma: this.idioma,
      zonaHoraria: this.zonaHoraria,
    };
  }

  /**
   * Valida si el mercado puede ser activado
   */
  puedeSerActivado(): boolean {
    return this.estado !== EstadoMercado.SUSPENDIDO && this.validarConfiguracion();
  }

  /**
   * Valida si el mercado puede ser suspendido
   */
  puedeSerSuspendido(): boolean {
    return this.estado === EstadoMercado.ACTIVO;
  }

  /**
   * Valida si el código del mercado es válido
   */
  validarCodigo(): boolean {
    const regexCodigo = /^[A-Z]{2,8}$/; // Código de 2 a 8 letras mayúsculas
    return regexCodigo.test(this.codigo);
  }

  /**
   * Valida si la moneda es válida
   */
  validarMoneda(): boolean {
    const monedasValidas = ['PEN', 'USD', 'EUR', 'BRL', 'ARS', 'CLP', 'COP', 'MXN'];
    return monedasValidas.includes(this.moneda);
  }

  /**
   * Valida si el idioma es válido
   */
  validarIdioma(): boolean {
    const idiomasValidos = ['es', 'en', 'pt', 'fr', 'de'];
    return idiomasValidos.includes(this.idioma);
  }

  /**
   * Valida si la zona horaria es válida
   */
  validarZonaHoraria(): boolean {
    const zonasValidas = [
      'America/Lima',
      'America/New_York',
      'America/Los_Angeles',
      'Europe/Madrid',
      'Europe/London',
      'America/Sao_Paulo',
      'America/Argentina/Buenos_Aires',
    ];
    return zonasValidas.includes(this.zonaHoraria);
  }

  /**
   * Valida toda la entidad
   */
  validar(): boolean {
    return (
      this.validarCodigo() &&
      this.validarMoneda() &&
      this.validarIdioma() &&
      this.validarZonaHoraria() &&
      this.validarConfiguracion()
    );
  }

  /**
   * Crea una copia del mercado con nuevos valores
   */
  actualizar(datos: {
    nombre?: string;
    moneda?: string;
    idioma?: string;
    zonaHoraria?: string;
    estado?: EstadoMercado;
    activo?: boolean;
    configuracion?: Record<string, any>;
  }): Mercado {
    return new Mercado(
      this.id,
      datos.nombre ?? this.nombre,
      this.codigo, // El código no se puede modificar
      datos.moneda ?? this.moneda,
      datos.idioma ?? this.idioma,
      datos.zonaHoraria ?? this.zonaHoraria,
      datos.estado ?? this.estado,
      datos.activo ?? this.activo,
      this.fechaCreacion,
      new Date(), // Actualizar fecha de actualización
      this.tiendaId,
      datos.configuracion ?? this.configuracion,
    );
  }

  /**
   * Activa el mercado
   */
  activar(): Mercado {
    if (!this.puedeSerActivado()) {
      throw new Error('No se puede activar el mercado en su estado actual');
    }

    return this.actualizar({
      estado: EstadoMercado.ACTIVO,
      activo: true,
    });
  }

  /**
   * Suspende el mercado
   */
  suspender(): Mercado {
    if (!this.puedeSerSuspendido()) {
      throw new Error('No se puede suspender el mercado en su estado actual');
    }

    return this.actualizar({
      estado: EstadoMercado.SUSPENDIDO,
      activo: false,
    });
  }

  /**
   * Desactiva el mercado
   */
  desactivar(): Mercado {
    return this.actualizar({
      estado: EstadoMercado.INACTIVO,
      activo: false,
    });
  }

  /**
   * Obtiene información resumida del mercado
   */
  obtenerResumen(): {
    id: string;
    nombre: string;
    codigo: string;
    moneda: string;
    idioma: string;
    estado: EstadoMercado;
    activo: boolean;
  } {
    return {
      id: this.id,
      nombre: this.nombre,
      codigo: this.codigo,
      moneda: this.moneda,
      idioma: this.idioma,
      estado: this.estado,
      activo: this.activo,
    };
  }
}