import { nanoid } from 'nanoid';
import { 
  TipoPlan,
  CicloFacturacion,
  EstadoSuscripcion,
  InformacionPlanDto,
  SuscripcionAdicionalDto,
  BeneficiosPlanDto,
  CambiarPlanDto,
  AgregarSuscripcionDto
} from '../../aplicacion/dto/configuracion-plan.dto';
import { ExcepcionDominio } from '../../../comun/excepciones/excepcion-dominio';

/**
 * Entidad de dominio para configuración de plan
 * Contiene la lógica de negocio y validaciones para la gestión de planes y suscripciones
 */
export class ConfiguracionPlan {
  public readonly id: string;
  public readonly tiendaId: string;
  
  // Configuraciones principales
  private _informacionPlan: InformacionPlanDto;
  private _suscripcionesAdicionales: SuscripcionAdicionalDto[];
  private _beneficiosPlan: BeneficiosPlanDto;
  private _configuracionAdicional?: Record<string, any>;

  // Auditoría
  public readonly fechaCreacion: Date;
  public fechaActualizacion: Date;

  /**
   * Constructor privado para forzar el uso de métodos de fábrica
   */
  private constructor(
    id: string,
    tiendaId: string,
    informacionPlan: InformacionPlanDto,
    suscripcionesAdicionales: SuscripcionAdicionalDto[],
    beneficiosPlan: BeneficiosPlanDto,
    configuracionAdicional?: Record<string, any>,
    fechaCreacion?: Date,
    fechaActualizacion?: Date
  ) {
    this.id = id;
    this.tiendaId = tiendaId;
    this._informacionPlan = informacionPlan;
    this._suscripcionesAdicionales = suscripcionesAdicionales;
    this._beneficiosPlan = beneficiosPlan;
    this._configuracionAdicional = configuracionAdicional;
    this.fechaCreacion = fechaCreacion || new Date();
    this.fechaActualizacion = fechaActualizacion || new Date();

    this.validar();
  }

  /**
   * Método de fábrica para crear una nueva configuración
   */
  static crear(
    tiendaId: string,
    informacionPlan: InformacionPlanDto,
    suscripcionesAdicionales: SuscripcionAdicionalDto[],
    beneficiosPlan: BeneficiosPlanDto,
    configuracionAdicional?: Record<string, any>
  ): ConfiguracionPlan {
    const id = nanoid();
    return new ConfiguracionPlan(
      id,
      tiendaId,
      informacionPlan,
      suscripcionesAdicionales,
      beneficiosPlan,
      configuracionAdicional
    );
  }

  /**
   * Método de fábrica para reconstruir desde persistencia
   */
  static reconstruir(
    id: string,
    tiendaId: string,
    informacionPlan: InformacionPlanDto,
    suscripcionesAdicionales: SuscripcionAdicionalDto[],
    beneficiosPlan: BeneficiosPlanDto,
    configuracionAdicional?: Record<string, any>,
    fechaCreacion?: Date,
    fechaActualizacion?: Date
  ): ConfiguracionPlan {
    return new ConfiguracionPlan(
      id,
      tiendaId,
      informacionPlan,
      suscripcionesAdicionales,
      beneficiosPlan,
      configuracionAdicional,
      fechaCreacion,
      fechaActualizacion
    );
  }

  /**
   * Validaciones de negocio
   */
  private validar(): void {
    // Validar que solo haya un plan activo por tienda
    if (!this._informacionPlan.tipo_plan) {
      throw ExcepcionDominio.Respuesta400(
        'El tipo de plan es requerido',
        'ConfiguracionPlan.TipoPlanRequerido'
      );
    }

    // Validar que la fecha de próximo cobro sea futura
    const fechaProximoCobro = new Date(this._informacionPlan.fecha_proximo_cobro);
    const hoy = new Date();
    if (fechaProximoCobro <= hoy) {
      throw ExcepcionDominio.Respuesta400(
        'La fecha de próximo cobro debe ser futura',
        'ConfiguracionPlan.FechaCobroInvalida'
      );
    }

    // Validar límites de empleados según el plan
    this.validarLimitesPlan();

    // Validar suscripciones adicionales
    this.validarSuscripcionesAdicionales();

    // Validar beneficios del plan
    this.validarBeneficiosPlan();
  }

  /**
   * Validar límites según el tipo de plan
   */
  private validarLimitesPlan(): void {
    const limitesPorPlan: Record<TipoPlan, { empleados: number; tiendas: number }> = {
      [TipoPlan.STARTER]: { empleados: 2, tiendas: 1 },
      [TipoPlan.GROW]: { empleados: 5, tiendas: 3 },
      [TipoPlan.PRO]: { empleados: 15, tiendas: 10 },
      [TipoPlan.ENTERPRISE]: { empleados: 50, tiendas: 25 }
    };

    const limites = limitesPorPlan[this._informacionPlan.tipo_plan];

    if (this._informacionPlan.empleados_permitidos > limites.empleados) {
      throw ExcepcionDominio.Respuesta400(
        `El plan ${this._informacionPlan.tipo_plan} permite máximo ${limites.empleados} empleados`,
        'ConfiguracionPlan.LimiteEmpleadosExcedido'
      );
    }

    if (this._informacionPlan.tiendas_locales_por_mercado > limites.tiendas) {
      throw ExcepcionDominio.Respuesta400(
        `El plan ${this._informacionPlan.tipo_plan} permite máximo ${limites.tiendas} tiendas por mercado`,
        'ConfiguracionPlan.LimiteTiendasExcedido'
      );
    }
  }

  /**
   * Validar suscripciones adicionales
   */
  private validarSuscripcionesAdicionales(): void {
    const nombresUnicos = new Set<string>();
    
    for (const suscripcion of this._suscripcionesAdicionales) {
      // Validar nombres únicos
      if (nombresUnicos.has(suscripcion.nombre)) {
        throw ExcepcionDominio.Respuesta400(
          `La suscripción '${suscripcion.nombre}' está duplicada`,
          'ConfiguracionPlan.SuscripcionDuplicada'
        );
      }
      nombresUnicos.add(suscripcion.nombre);

      // Validar fecha de próximo cobro
      const fechaCobro = new Date(suscripcion.fecha_proximo_cobro);
      const hoy = new Date();
      if (fechaCobro <= hoy) {
        throw ExcepcionDominio.Respuesta400(
          `La fecha de cobro de la suscripción '${suscripcion.nombre}' debe ser futura`,
          'ConfiguracionPlan.FechaCobroSuscripcionInvalida'
        );
      }

      // Validar precio
      if (suscripcion.precio < 0) {
        throw ExcepcionDominio.Respuesta400(
          `El precio de la suscripción '${suscripcion.nombre}' no puede ser negativo`,
          'ConfiguracionPlan.PrecioSuscripcionInvalido'
        );
      }
    }
  }

  /**
   * Validar beneficios del plan
   */
  private validarBeneficiosPlan(): void {
    if (!this._beneficiosPlan.funciones_incluidas || this._beneficiosPlan.funciones_incluidas.length === 0) {
      throw ExcepcionDominio.Respuesta400(
        'El plan debe incluir al menos una función',
        'ConfiguracionPlan.FuncionesRequeridas'
      );
    }
  }

  /**
   * Getters para acceder a las propiedades privadas
   */
  getInformacionPlan(): InformacionPlanDto {
    return { ...this._informacionPlan };
  }

  getSuscripcionesAdicionales(): SuscripcionAdicionalDto[] {
    return this._suscripcionesAdicionales.map(suscripcion => ({ ...suscripcion }));
  }

  getBeneficiosPlan(): BeneficiosPlanDto {
    return { ...this._beneficiosPlan };
  }

  getConfiguracionAdicional(): Record<string, any> | undefined {
    return this._configuracionAdicional ? { ...this._configuracionAdicional } : undefined;
  }

  /**
   * Métodos para actualizar configuraciones específicas
   */
  actualizarInformacionPlan(nuevaInformacion: InformacionPlanDto): void {
    this._informacionPlan = nuevaInformacion;
    this.validar();
    this.fechaActualizacion = new Date();
  }

  actualizarSuscripcionesAdicionales(nuevasSuscripciones: SuscripcionAdicionalDto[]): void {
    this._suscripcionesAdicionales = nuevasSuscripciones;
    this.validar();
    this.fechaActualizacion = new Date();
  }

  actualizarBeneficiosPlan(nuevosBeneficios: BeneficiosPlanDto): void {
    this._beneficiosPlan = nuevosBeneficios;
    this.validar();
    this.fechaActualizacion = new Date();
  }

  actualizarConfiguracionAdicional(nuevaConfiguracion: Record<string, any>): void {
    this._configuracionAdicional = nuevaConfiguracion;
    this.validar();
    this.fechaActualizacion = new Date();
  }

  /**
   * Métodos de negocio específicos
   */
  cambiarPlan(datosCambio: CambiarPlanDto): void {
    // Validar que el nuevo plan sea diferente
    if (datosCambio.nuevo_plan === this._informacionPlan.tipo_plan) {
      throw ExcepcionDominio.Respuesta400(
        'El nuevo plan debe ser diferente al actual',
        'ConfiguracionPlan.PlanIgual'
      );
    }

    // Actualizar información del plan
    this._informacionPlan.tipo_plan = datosCambio.nuevo_plan;
    this._informacionPlan.ciclo_facturacion = datosCambio.ciclo_facturacion;
    
    // Actualizar nombre del plan según el tipo
    const nombresPlan: Record<TipoPlan, string> = {
      [TipoPlan.STARTER]: 'Starter',
      [TipoPlan.GROW]: 'Grow',
      [TipoPlan.PRO]: 'Pro',
      [TipoPlan.ENTERPRISE]: 'Enterprise'
    };
    this._informacionPlan.nombre_plan = nombresPlan[datosCambio.nuevo_plan];

    // Actualizar precio según el nuevo plan y ciclo
    this.actualizarPrecioPorPlan(datosCambio.nuevo_plan, datosCambio.ciclo_facturacion);

    // Actualizar límites según el nuevo plan
    this.actualizarLimitesPorPlan(datosCambio.nuevo_plan);

    this.validar();
    this.fechaActualizacion = new Date();
  }

  /**
   * Actualizar precio según plan y ciclo de facturación
   */
  private actualizarPrecioPorPlan(nuevoPlan: TipoPlan, cicloFacturacion: CicloFacturacion): void {
    const preciosBase: Record<TipoPlan, number> = {
      [TipoPlan.STARTER]: 29.99,
      [TipoPlan.GROW]: 79.99,
      [TipoPlan.PRO]: 199.99,
      [TipoPlan.ENTERPRISE]: 499.99
    };

    let precioBase = preciosBase[nuevoPlan];

    // Aplicar descuento por facturación anual
    if (cicloFacturacion === CicloFacturacion.ANUAL) {
      precioBase = precioBase * 12 * 0.8; // 20% de descuento anual
      this._informacionPlan.ahorro_anual = preciosBase[nuevoPlan] * 12 * 0.2;
    } else {
      this._informacionPlan.ahorro_anual = undefined;
    }

    this._informacionPlan.precio_mensual = precioBase;
  }

  /**
   * Actualizar límites según el plan
   */
  private actualizarLimitesPorPlan(nuevoPlan: TipoPlan): void {
    const limitesPorPlan: Record<TipoPlan, { empleados: number; tiendas: number; descuento: number }> = {
      [TipoPlan.STARTER]: { empleados: 2, tiendas: 1, descuento: 0 },
      [TipoPlan.GROW]: { empleados: 5, tiendas: 3, descuento: 20 },
      [TipoPlan.PRO]: { empleados: 15, tiendas: 10, descuento: 30 },
      [TipoPlan.ENTERPRISE]: { empleados: 50, tiendas: 25, descuento: 50 }
    };

    const limites = limitesPorPlan[nuevoPlan];
    this._informacionPlan.empleados_permitidos = limites.empleados;
    this._informacionPlan.tiendas_locales_por_mercado = limites.tiendas;
    this._informacionPlan.descuento_envios = limites.descuento;
  }

  /**
   * Agregar suscripción adicional
   */
  agregarSuscripcionAdicional(suscripcion: AgregarSuscripcionDto): void {
    const nuevaSuscripcion: SuscripcionAdicionalDto = {
      ...suscripcion,
      fecha_proximo_cobro: new Date().toISOString().split('T')[0], // Fecha actual
      estado: EstadoSuscripcion.ACTIVA
    };

    // Verificar que no exista ya una suscripción con el mismo nombre
    const existe = this._suscripcionesAdicionales.some(s => s.nombre === suscripcion.nombre);
    if (existe) {
      throw ExcepcionDominio.Respuesta400(
        `Ya existe una suscripción con el nombre '${suscripcion.nombre}'`,
        'ConfiguracionPlan.SuscripcionYaExiste'
      );
    }

    this._suscripcionesAdicionales.push(nuevaSuscripcion);
    this.validar();
    this.fechaActualizacion = new Date();
  }

  /**
   * Remover suscripción adicional
   */
  removerSuscripcionAdicional(nombreSuscripcion: string): void {
    const indice = this._suscripcionesAdicionales.findIndex(s => s.nombre === nombreSuscripcion);
    
    if (indice === -1) {
      throw ExcepcionDominio.Respuesta404(
        `Suscripción '${nombreSuscripcion}' no encontrada`,
        'ConfiguracionPlan.SuscripcionNoEncontrada'
      );
    }

    this._suscripcionesAdicionales.splice(indice, 1);
    this.validar();
    this.fechaActualizacion = new Date();
  }

  /**
   * Cambiar estado de suscripción adicional
   */
  cambiarEstadoSuscripcion(nombreSuscripcion: string, nuevoEstado: EstadoSuscripcion): void {
    const suscripcion = this._suscripcionesAdicionales.find(s => s.nombre === nombreSuscripcion);
    
    if (!suscripcion) {
      throw ExcepcionDominio.Respuesta404(
        `Suscripción '${nombreSuscripcion}' no encontrada`,
        'ConfiguracionPlan.SuscripcionNoEncontrada'
      );
    }

    suscripcion.estado = nuevoEstado;
    this.validar();
    this.fechaActualizacion = new Date();
  }

  /**
   * Cambiar ciclo de facturación
   */
  cambiarCicloFacturacion(nuevoCiclo: CicloFacturacion): void {
    if (nuevoCiclo === this._informacionPlan.ciclo_facturacion) {
      throw ExcepcionDominio.Respuesta400(
        'El nuevo ciclo de facturación debe ser diferente al actual',
        'ConfiguracionPlan.CicloFacturacionIgual'
      );
    }

    this._informacionPlan.ciclo_facturacion = nuevoCiclo;
    this.actualizarPrecioPorPlan(this._informacionPlan.tipo_plan, nuevoCiclo);
    this.validar();
    this.fechaActualizacion = new Date();
  }

  /**
   * Métodos de validación de compatibilidad
   */
  puedeCambiarAPlan(nuevoPlan: TipoPlan): boolean {
    // Un plan no puede cambiar a uno inferior (según la lógica de negocio)
    const jerarquia: Record<TipoPlan, number> = {
      [TipoPlan.STARTER]: 1,
      [TipoPlan.GROW]: 2,
      [TipoPlan.PRO]: 3,
      [TipoPlan.ENTERPRISE]: 4
    };

    return jerarquia[nuevoPlan] >= jerarquia[this._informacionPlan.tipo_plan];
  }

  tieneSuscripcionesActivas(): boolean {
    return this._suscripcionesAdicionales.some(s => s.estado === EstadoSuscripcion.ACTIVA);
  }

  estaEnPeriodoDePrueba(): boolean {
    // Lógica para determinar si está en período de prueba
    // Por ejemplo, si la fecha de creación es menor a 30 días
    const diasPrueba = 30;
    const fechaLimite = new Date(this.fechaCreacion);
    fechaLimite.setDate(fechaLimite.getDate() + diasPrueba);
    
    return new Date() <= fechaLimite;
  }

  /**
   * Método para obtener el costo total mensual
   */
  obtenerCostoTotalMensual(): number {
    const costoPlan = this._informacionPlan.precio_mensual;
    const costoSuscripciones = this._suscripcionesAdicionales
      .filter(s => s.estado === EstadoSuscripcion.ACTIVA)
      .reduce((total, suscripcion) => total + suscripcion.precio, 0);

    return costoPlan + costoSuscripciones;
  }

  /**
   * Método para obtener resumen de configuración
   */
  obtenerResumen(): {
    tipoPlan: TipoPlan;
    nombrePlan: string;
    costoMensual: number;
    empleadosPermitidos: number;
    tiendasPermitidas: number;
    suscripcionesActivas: number;
    cicloFacturacion: CicloFacturacion;
  } {
    return {
      tipoPlan: this._informacionPlan.tipo_plan,
      nombrePlan: this._informacionPlan.nombre_plan,
      costoMensual: this.obtenerCostoTotalMensual(),
      empleadosPermitidos: this._informacionPlan.empleados_permitidos,
      tiendasPermitidas: this._informacionPlan.tiendas_locales_por_mercado,
      suscripcionesActivas: this._suscripcionesAdicionales.filter(s => s.estado === EstadoSuscripcion.ACTIVA).length,
      cicloFacturacion: this._informacionPlan.ciclo_facturacion
    };
  }
}