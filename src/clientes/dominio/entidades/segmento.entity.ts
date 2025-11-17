/**
 * Entidad de Segmento que representa un grupo de clientes con criterios específicos
 * Sigue los principios de Domain-Driven Design y Arquitectura Limpia
 * Implementa sistema de segmentación avanzada similar a Shopify
 */
export class Segmento {
  constructor(
    public readonly id: string,
    public readonly nombre: string,
    public readonly descripcion: string | null,
    public readonly tipo: 'MANUAL' | 'AUTOMATICO' | 'PREDEFINIDO',
    public readonly estado: 'ACTIVO' | 'INACTIVO' | 'BORRADOR',
    public readonly reglas: ReglasSegmento,
    public readonly porcentajeClientes: number,
    public readonly cantidadClientes: number,
    public readonly ultimaActividad: Date | null,
    public readonly creadorId: string,
    public readonly fechaCreacion: Date,
    public readonly fechaActualizacion: Date,
    public readonly tiendaId: string,
    public readonly plantillaId: string | null,
    public readonly etiquetas: string[] = [],
    public readonly esPublico: boolean = false,
    public readonly puedeCombinar: boolean = true,
  ) {}

  /**
   * Verifica si el segmento está activo
   */
  estaActivo(): boolean {
    return this.estado === 'ACTIVO';
  }

  /**
   * Actualiza la información del segmento
   */
  actualizarInformacion(
    nombre?: string,
    descripcion?: string | null,
    estado?: 'ACTIVO' | 'INACTIVO' | 'BORRADOR',
    reglas?: ReglasSegmento,
    etiquetas?: string[],
    esPublico?: boolean,
    puedeCombinar?: boolean,
  ): Segmento {
    return new Segmento(
      this.id,
      nombre || this.nombre,
      descripcion !== undefined ? descripcion : this.descripcion,
      this.tipo,
      estado || this.estado,
      reglas || this.reglas,
      this.porcentajeClientes,
      this.cantidadClientes,
      this.ultimaActividad,
      this.creadorId,
      this.fechaCreacion,
      new Date(),
      this.tiendaId,
      this.plantillaId,
      etiquetas || this.etiquetas,
      esPublico !== undefined ? esPublico : this.esPublico,
      puedeCombinar !== undefined ? puedeCombinar : this.puedeCombinar,
    );
  }

  /**
   * Activa el segmento
   */
  activar(): Segmento {
    return this.actualizarInformacion(undefined, undefined, 'ACTIVO');
  }

  /**
   * Desactiva el segmento
   */
  desactivar(): Segmento {
    return this.actualizarInformacion(undefined, undefined, 'INACTIVO');
  }

  /**
   * Duplica el segmento creando una copia con nuevo ID
   */
  duplicar(nuevoId: string, nuevoNombre?: string): Segmento {
    return new Segmento(
      nuevoId,
      nuevoNombre || `${this.nombre} (Copia)`,
      this.descripcion,
      this.tipo,
      'BORRADOR',
      this.reglas,
      0, // Se recalculará
      0, // Se recalculará
      null,
      this.creadorId,
      new Date(),
      new Date(),
      this.tiendaId,
      this.id, // Referencia al segmento original
      [...this.etiquetas],
      this.esPublico,
      this.puedeCombinar,
    );
  }

  /**
   * Valida que las reglas del segmento sean correctas
   */
  validarReglas(): boolean {
    if (!this.reglas || !Array.isArray(this.reglas.condiciones)) {
      return false;
    }

    // Validar que haya al menos una condición
    if (this.reglas.condiciones.length === 0) {
      return false;
    }

    // Validar cada condición individualmente
    for (const condicion of this.reglas.condiciones) {
      if (!this.validarCondicion(condicion)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Valida una condición individual
   */
  private validarCondicion(condicion: CondicionSegmento): boolean {
    if (!condicion.campo || !condicion.operador) {
      return false;
    }

    // Validar valores según el tipo de campo
    switch (condicion.campo) {
      case 'totalGastado':
      case 'totalOrdenes':
      case 'creditoTienda':
        return this.validarCondicionNumerica(condicion);
      
      case 'fechaCreacion':
      case 'fechaUltimaOrden':
      case 'fechaUltimaActividad':
        return this.validarCondicionFecha(condicion);
      
      case 'tags':
      case 'fuenteCliente':
      case 'grupoRfm':
        return this.validarCondicionTexto(condicion);
      
      case 'aceptaMarketing':
      case 'aceptaSmsMarketing':
      case 'activo':
        return this.validarCondicionBooleana(condicion);
      
      default:
        return false;
    }
  }

  /**
   * Valida condición numérica
   */
  private validarCondicionNumerica(condicion: CondicionSegmento): boolean {
    if (condicion.operador === 'ENTRE') {
      return Array.isArray(condicion.valor) && 
             condicion.valor.length === 2 && 
             typeof condicion.valor[0] === 'number' && 
             typeof condicion.valor[1] === 'number';
    }
    return typeof condicion.valor === 'number';
  }

  /**
   * Valida condición de fecha
   */
  private validarCondicionFecha(condicion: CondicionSegmento): boolean {
    if (condicion.operador === 'ENTRE') {
      return Array.isArray(condicion.valor) && 
             condicion.valor.length === 2 && 
             (condicion.valor[0] instanceof Date || typeof condicion.valor[0] === 'string') &&
             (condicion.valor[1] instanceof Date || typeof condicion.valor[1] === 'string');
    }
    return condicion.valor instanceof Date || typeof condicion.valor === 'string';
  }

  /**
   * Valida condición de texto
   */
  private validarCondicionTexto(condicion: CondicionSegmento): boolean {
    if (condicion.operador === 'EN' || condicion.operador === 'NO_EN') {
      return Array.isArray(condicion.valor) && condicion.valor.length > 0;
    }
    return typeof condicion.valor === 'string' && condicion.valor.length > 0;
  }

  /**
   * Valida condición booleana
   */
  private validarCondicionBooleana(condicion: CondicionSegmento): boolean {
    return typeof condicion.valor === 'boolean';
  }

  /**
   * Genera la consulta SQL-like para el segmento
   */
  generarConsultaSqlLike(): string {
    const condiciones = this.reglas.condiciones.map(condicion => 
      this.generarCondicionSqlLike(condicion)
    ).join(` ${this.reglas.logica === 'Y' ? 'AND' : 'OR'} `);

    return `FROM clientes WHERE ${condiciones} ORDER BY fecha_ultima_actividad DESC`;
  }

  /**
   * Genera condición SQL-like individual
   */
  private generarCondicionSqlLike(condicion: CondicionSegmento): string {
    const campo = this.mapearCampoSql(condicion.campo);
    const operador = this.mapearOperadorSql(condicion.operador);
    const valor = this.formatearValorSql(condicion.valor, condicion.operador);

    return `${campo} ${operador} ${valor}`;
  }

  /**
   * Mapea campos a nombres de base de datos
   */
  private mapearCampoSql(campo: string): string {
    const mapeo: Record<string, string> = {
      'totalGastado': 'total_gastado',
      'totalOrdenes': 'total_ordenes',
      'fechaCreacion': 'fecha_creacion',
      'fechaUltimaOrden': 'fecha_ultima_orden',
      'fechaUltimaActividad': 'fecha_ultima_actividad',
      'aceptaMarketing': 'acepta_marketing',
      'aceptaSmsMarketing': 'acepta_sms_marketing',
      'activo': 'activo',
      'creditoTienda': 'credito_tienda',
      'grupoRfm': 'grupo_rfm',
      'fuenteCliente': 'fuente_cliente',
      'tags': 'tags',
    };
    return mapeo[campo] || campo;
  }

  /**
   * Mapea operadores a SQL
   */
  private mapearOperadorSql(operador: string): string {
    const mapeo: Record<string, string> = {
      'IGUAL': '=',
      'MAYOR_QUE': '>',
      'MENOR_QUE': '<',
      'MAYOR_O_IGUAL': '>=',
      'MENOR_O_IGUAL': '<=',
      'DIFERENTE': '!=',
      'CONTENGA': 'LIKE',
      'NO_CONTENGA': 'NOT LIKE',
      'COMIENCE_CON': 'LIKE',
      'TERMINE_CON': 'LIKE',
      'EN': 'IN',
      'NO_EN': 'NOT IN',
      'ENTRE': 'BETWEEN',
    };
    return mapeo[operador] || operador;
  }

  /**
   * Formatea valores para SQL
   */
  private formatearValorSql(valor: any, operador: string): string {
    if (operador === 'ENTRE') {
      const [inicio, fin] = valor as [any, any];
      return `${this.formatearValorSimpleSql(inicio)} AND ${this.formatearValorSimpleSql(fin)}`;
    }

    if (operador === 'EN' || operador === 'NO_EN') {
      const valores = Array.isArray(valor) ? valor : [valor];
      const valoresFormateados = valores.map(v => this.formatearValorSimpleSql(v));
      return `(${valoresFormateados.join(', ')})`;
    }

    if (operador === 'CONTENGA' || operador === 'NO_CONTENGA') {
      return `'%${valor}%'`;
    }

    if (operador === 'COMIENCE_CON') {
      return `'${valor}%'`;
    }

    if (operador === 'TERMINE_CON') {
      return `'%${valor}'`;
    }

    return this.formatearValorSimpleSql(valor);
  }

  /**
   * Formatea valor simple para SQL
   */
  private formatearValorSimpleSql(valor: any): string {
    if (typeof valor === 'string') {
      return `'${valor.replace(/'/g, "''")}'`;
    }
    if (valor instanceof Date) {
      return `'${valor.toISOString()}'`;
    }
    if (typeof valor === 'boolean') {
      return valor ? 'TRUE' : 'FALSE';
    }
    return valor.toString();
  }

  /**
   * Actualiza estadísticas del segmento
   */
  actualizarEstadisticas(
    cantidadClientes: number,
    porcentajeClientes: number,
    ultimaActividad: Date,
  ): Segmento {
    return new Segmento(
      this.id,
      this.nombre,
      this.descripcion,
      this.tipo,
      this.estado,
      this.reglas,
      porcentajeClientes,
      cantidadClientes,
      ultimaActividad,
      this.creadorId,
      this.fechaCreacion,
      new Date(),
      this.tiendaId,
      this.plantillaId,
      this.etiquetas,
      this.esPublico,
      this.puedeCombinar,
    );
  }

  /**
   * Verifica si el segmento puede ser usado en campañas
   */
  puedeUsarEnCampanas(): boolean {
    return this.estaActivo() && this.cantidadClientes > 0;
  }

  /**
   * Obtiene la descripción resumida del segmento
   */
  obtenerDescripcionResumida(): string {
    const condiciones = this.reglas.condiciones.length;
    return `${this.nombre} - ${condiciones} condición(es) - ${this.cantidadClientes} clientes`;
  }
}

/**
 * Interfaz para las reglas de segmentación
 */
export interface ReglasSegmento {
  condiciones: CondicionSegmento[];
  logica: 'Y' | 'O'; // AND u OR
  descripcionLogica?: string;
}

/**
 * Interfaz para una condición de segmentación
 */
export interface CondicionSegmento {
  campo: string;
  operador: 'IGUAL' | 'MAYOR_QUE' | 'MENOR_QUE' | 'MAYOR_O_IGUAL' | 'MENOR_O_IGUAL' | 
           'DIFERENTE' | 'CONTENGA' | 'NO_CONTENGA' | 'COMIENCE_CON' | 'TERMINE_CON' | 
           'EN' | 'NO_EN' | 'ENTRE';
  valor: any;
  negado?: boolean;
}