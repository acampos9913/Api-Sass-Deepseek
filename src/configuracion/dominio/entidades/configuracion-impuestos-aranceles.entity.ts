import { 
  ServicioFiscal, 
  RegionFiscalDto, 
  TasaReducidaDto, 
  TarifaArancelDto, 
  CodigoAduaneroDto 
} from '../../aplicacion/dto/configuracion-impuestos-aranceles.dto';
import { nanoid } from 'nanoid';

export class ConfiguracionImpuestosAranceles {
  private constructor(
    public readonly id: string,
    public readonly tiendaId: string,
    private servicioFiscal: ServicioFiscal,
    private regionesFiscales: RegionFiscalDto[],
    private tasaEstandar: number,
    private tasasReducidas: TasaReducidaDto[],
    private impuestoEnPrecio: boolean,
    private arancelCheckout: boolean,
    private tarifasArancel: TarifaArancelDto[],
    private ddpDisponible: boolean,
    private codigosAduaneros: CodigoAduaneroDto[],
    private incluirEnPrecio: boolean,
    private impuestoEnvios: boolean,
    private ivaDigitales: boolean,
    public readonly fechaCreacion: Date,
    public fechaActualizacion: Date
  ) {}

  /**
   * Método estático para crear una nueva configuración de impuestos y aranceles
   */
  static crear(
    tiendaId: string,
    servicioFiscal: ServicioFiscal,
    regionesFiscales: RegionFiscalDto[],
    tasaEstandar: number,
    tasasReducidas: TasaReducidaDto[] = [],
    impuestoEnPrecio: boolean = false,
    arancelCheckout: boolean = false,
    tarifasArancel: TarifaArancelDto[] = [],
    ddpDisponible: boolean = false,
    codigosAduaneros: CodigoAduaneroDto[] = [],
    incluirEnPrecio: boolean = false,
    impuestoEnvios: boolean = false,
    ivaDigitales: boolean = false
  ): ConfiguracionImpuestosAranceles {
    const id = nanoid();
    const ahora = new Date();

    // Validaciones de creación
    ConfiguracionImpuestosAranceles.validarServicioFiscal(servicioFiscal);
    ConfiguracionImpuestosAranceles.validarRegionesFiscales(regionesFiscales);
    ConfiguracionImpuestosAranceles.validarTasaEstandar(tasaEstandar);
    ConfiguracionImpuestosAranceles.validarTasasReducidas(tasasReducidas, tasaEstandar);
    ConfiguracionImpuestosAranceles.validarTarifasArancel(tarifasArancel);
    ConfiguracionImpuestosAranceles.validarCodigosAduaneros(codigosAduaneros);
    ConfiguracionImpuestosAranceles.validarConsistenciaGlobal(
      incluirEnPrecio,
      regionesFiscales,
      tasasReducidas
    );

    return new ConfiguracionImpuestosAranceles(
      id,
      tiendaId,
      servicioFiscal,
      regionesFiscales,
      tasaEstandar,
      tasasReducidas,
      impuestoEnPrecio,
      arancelCheckout,
      tarifasArancel,
      ddpDisponible,
      codigosAduaneros,
      incluirEnPrecio,
      impuestoEnvios,
      ivaDigitales,
      ahora,
      ahora
    );
  }

  /**
   * Método estático para reconstruir una entidad desde la base de datos
   */
  static reconstruir(
    id: string,
    tiendaId: string,
    servicioFiscal: ServicioFiscal,
    regionesFiscales: RegionFiscalDto[],
    tasaEstandar: number,
    tasasReducidas: TasaReducidaDto[],
    impuestoEnPrecio: boolean,
    arancelCheckout: boolean,
    tarifasArancel: TarifaArancelDto[],
    ddpDisponible: boolean,
    codigosAduaneros: CodigoAduaneroDto[],
    incluirEnPrecio: boolean,
    impuestoEnvios: boolean,
    ivaDigitales: boolean,
    fechaCreacion: Date,
    fechaActualizacion: Date
  ): ConfiguracionImpuestosAranceles {
    return new ConfiguracionImpuestosAranceles(
      id,
      tiendaId,
      servicioFiscal,
      regionesFiscales,
      tasaEstandar,
      tasasReducidas,
      impuestoEnPrecio,
      arancelCheckout,
      tarifasArancel,
      ddpDisponible,
      codigosAduaneros,
      incluirEnPrecio,
      impuestoEnvios,
      ivaDigitales,
      fechaCreacion,
      fechaActualizacion
    );
  }

  // Getters
  getServicioFiscal(): ServicioFiscal {
    return this.servicioFiscal;
  }

  getRegionesFiscales(): RegionFiscalDto[] {
    return [...this.regionesFiscales];
  }

  getTasaEstandar(): number {
    return this.tasaEstandar;
  }

  getTasasReducidas(): TasaReducidaDto[] {
    return [...this.tasasReducidas];
  }

  getImpuestoEnPrecio(): boolean {
    return this.impuestoEnPrecio;
  }

  getArancelCheckout(): boolean {
    return this.arancelCheckout;
  }

  getTarifasArancel(): TarifaArancelDto[] {
    return [...this.tarifasArancel];
  }

  getDdpDisponible(): boolean {
    return this.ddpDisponible;
  }

  getCodigosAduaneros(): CodigoAduaneroDto[] {
    return [...this.codigosAduaneros];
  }

  getIncluirEnPrecio(): boolean {
    return this.incluirEnPrecio;
  }

  getImpuestoEnvios(): boolean {
    return this.impuestoEnvios;
  }

  getIvaDigitales(): boolean {
    return this.ivaDigitales;
  }

  // Métodos de negocio
  cambiarServicioFiscal(nuevoServicio: ServicioFiscal): void {
    ConfiguracionImpuestosAranceles.validarServicioFiscal(nuevoServicio);
    this.servicioFiscal = nuevoServicio;
    this.actualizarFecha();
  }

  agregarRegionFiscal(region: RegionFiscalDto): void {
    ConfiguracionImpuestosAranceles.validarRegionFiscal(region);
    
    // Verificar que no exista ya la región
    const regionExistente = this.regionesFiscales.find(r => 
      r.pais === region.pais && r.estado_region === region.estado_region
    );
    
    if (regionExistente) {
      throw new Error(`Ya existe una región fiscal para ${region.pais}, ${region.estado_region}`);
    }

    this.regionesFiscales.push(region);
    this.actualizarFecha();
  }

  actualizarRegionFiscal(pais: string, estadoRegion: string, nuevaRegion: RegionFiscalDto): void {
    const index = this.regionesFiscales.findIndex(r => 
      r.pais === pais && r.estado_region === estadoRegion
    );

    if (index === -1) {
      throw new Error(`Región fiscal no encontrada: ${pais}, ${estadoRegion}`);
    }

    ConfiguracionImpuestosAranceles.validarRegionFiscal(nuevaRegion);
    this.regionesFiscales[index] = nuevaRegion;
    this.actualizarFecha();
  }

  removerRegionFiscal(pais: string, estadoRegion: string): void {
    const index = this.regionesFiscales.findIndex(r => 
      r.pais === pais && r.estado_region === estadoRegion
    );

    if (index === -1) {
      throw new Error(`Región fiscal no encontrada: ${pais}, ${estadoRegion}`);
    }

    this.regionesFiscales.splice(index, 1);
    this.actualizarFecha();
  }

  cambiarTasaEstandar(nuevaTasa: number): void {
    ConfiguracionImpuestosAranceles.validarTasaEstandar(nuevaTasa);
    ConfiguracionImpuestosAranceles.validarTasasReducidas(this.tasasReducidas, nuevaTasa);
    this.tasaEstandar = nuevaTasa;
    this.actualizarFecha();
  }

  agregarTasaReducida(tasa: TasaReducidaDto): void {
    ConfiguracionImpuestosAranceles.validarTasaReducida(tasa, this.tasaEstandar);
    
    // Verificar que no exista ya una tasa con la misma descripción
    const tasaExistente = this.tasasReducidas.find(t => 
      t.descripcion === tasa.descripcion
    );
    
    if (tasaExistente) {
      throw new Error(`Ya existe una tasa reducida con la descripción: ${tasa.descripcion}`);
    }

    this.tasasReducidas.push(tasa);
    this.actualizarFecha();
  }

  actualizarTasaReducida(descripcion: string, nuevaTasa: TasaReducidaDto): void {
    const index = this.tasasReducidas.findIndex(t => t.descripcion === descripcion);

    if (index === -1) {
      throw new Error(`Tasa reducida no encontrada: ${descripcion}`);
    }

    ConfiguracionImpuestosAranceles.validarTasaReducida(nuevaTasa, this.tasaEstandar);
    this.tasasReducidas[index] = nuevaTasa;
    this.actualizarFecha();
  }

  removerTasaReducida(descripcion: string): void {
    const index = this.tasasReducidas.findIndex(t => t.descripcion === descripcion);

    if (index === -1) {
      throw new Error(`Tasa reducida no encontrada: ${descripcion}`);
    }

    this.tasasReducidas.splice(index, 1);
    this.actualizarFecha();
  }

  cambiarIncluirEnPrecio(incluir: boolean): void {
    ConfiguracionImpuestosAranceles.validarConsistenciaGlobal(
      incluir,
      this.regionesFiscales,
      this.tasasReducidas
    );
    this.incluirEnPrecio = incluir;
    this.actualizarFecha();
  }

  cambiarArancelCheckout(activo: boolean): void {
    this.arancelCheckout = activo;
    this.actualizarFecha();
  }

  agregarTarifaArancel(tarifa: TarifaArancelDto): void {
    ConfiguracionImpuestosAranceles.validarTarifaArancel(tarifa);
    this.tarifasArancel.push(tarifa);
    this.actualizarFecha();
  }

  actualizarTarifaArancel(index: number, nuevaTarifa: TarifaArancelDto): void {
    if (index < 0 || index >= this.tarifasArancel.length) {
      throw new Error('Índice de tarifa de arancel inválido');
    }

    ConfiguracionImpuestosAranceles.validarTarifaArancel(nuevaTarifa);
    this.tarifasArancel[index] = nuevaTarifa;
    this.actualizarFecha();
  }

  removerTarifaArancel(index: number): void {
    if (index < 0 || index >= this.tarifasArancel.length) {
      throw new Error('Índice de tarifa de arancel inválido');
    }

    this.tarifasArancel.splice(index, 1);
    this.actualizarFecha();
  }

  cambiarDdpDisponible(disponible: boolean): void {
    this.ddpDisponible = disponible;
    this.actualizarFecha();
  }

  agregarCodigoAduanero(codigo: CodigoAduaneroDto): void {
    ConfiguracionImpuestosAranceles.validarCodigoAduanero(codigo);
    
    // Verificar que no exista ya el código SA
    const codigoExistente = this.codigosAduaneros.find(c => 
      c.codigo_sa === codigo.codigo_sa
    );
    
    if (codigoExistente) {
      throw new Error(`Ya existe un código aduanero con el código SA: ${codigo.codigo_sa}`);
    }

    this.codigosAduaneros.push(codigo);
    this.actualizarFecha();
  }

  actualizarCodigoAduanero(codigoSa: string, nuevoCodigo: CodigoAduaneroDto): void {
    const index = this.codigosAduaneros.findIndex(c => c.codigo_sa === codigoSa);

    if (index === -1) {
      throw new Error(`Código aduanero no encontrado: ${codigoSa}`);
    }

    ConfiguracionImpuestosAranceles.validarCodigoAduanero(nuevoCodigo);
    this.codigosAduaneros[index] = nuevoCodigo;
    this.actualizarFecha();
  }

  removerCodigoAduanero(codigoSa: string): void {
    const index = this.codigosAduaneros.findIndex(c => c.codigo_sa === codigoSa);

    if (index === -1) {
      throw new Error(`Código aduanero no encontrado: ${codigoSa}`);
    }

    this.codigosAduaneros.splice(index, 1);
    this.actualizarFecha();
  }

  cambiarImpuestoEnvios(activo: boolean): void {
    this.impuestoEnvios = activo;
    this.actualizarFecha();
  }

  cambiarIvaDigitales(activo: boolean): void {
    this.ivaDigitales = activo;
    this.actualizarFecha();
  }

  // Métodos de validación estáticos
  private static validarServicioFiscal(servicio: ServicioFiscal): void {
    if (!Object.values(ServicioFiscal).includes(servicio)) {
      throw new Error(`Servicio fiscal inválido: ${servicio}`);
    }
  }

  private static validarRegionesFiscales(regiones: RegionFiscalDto[]): void {
    if (!regiones || regiones.length === 0) {
      throw new Error('Debe configurarse al menos una región fiscal');
    }

    // Verificar que no haya países duplicados
    const paises = new Set<string>();
    for (const region of regiones) {
      const clave = `${region.pais}-${region.estado_region}`;
      if (paises.has(clave)) {
        throw new Error(`Región fiscal duplicada: ${region.pais}, ${region.estado_region}`);
      }
      paises.add(clave);

      this.validarRegionFiscal(region);
    }
  }

  private static validarRegionFiscal(region: RegionFiscalDto): void {
    if (!region.pais || region.pais.trim() === '') {
      throw new Error('El país de la región fiscal es requerido');
    }

    if (!region.estado_region || region.estado_region.trim() === '') {
      throw new Error('El estado/región de la región fiscal es requerido');
    }

    if (region.tasa_estandar < 0 || region.tasa_estandar > 100) {
      throw new Error('La tasa estándar de la región debe estar entre 0 y 100');
    }
  }

  private static validarTasaEstandar(tasa: number): void {
    if (tasa < 0 || tasa > 100) {
      throw new Error('La tasa estándar debe estar entre 0 y 100');
    }
  }

  private static validarTasasReducidas(tasas: TasaReducidaDto[], tasaEstandar: number): void {
    if (!tasas) return;

    const porcentajes = new Set<number>();
    for (const tasa of tasas) {
      this.validarTasaReducida(tasa, tasaEstandar);
      
      if (porcentajes.has(tasa.porcentaje)) {
        throw new Error(`Porcentaje duplicado en tasas reducidas: ${tasa.porcentaje}`);
      }
      porcentajes.add(tasa.porcentaje);
    }
  }

  private static validarTasaReducida(tasa: TasaReducidaDto, tasaEstandar: number): void {
    if (!tasa.descripcion || tasa.descripcion.trim() === '') {
      throw new Error('La descripción de la tasa reducida es requerida');
    }

    if (tasa.porcentaje < 0 || tasa.porcentaje > 100) {
      throw new Error('El porcentaje de la tasa reducida debe estar entre 0 y 100');
    }

    if (tasa.porcentaje >= tasaEstandar) {
      throw new Error('La tasa reducida debe ser menor que la tasa estándar');
    }
  }

  private static validarTarifaArancel(tarifa: TarifaArancelDto): void {
    if (tarifa.monto < 0) {
      throw new Error('El monto de la tarifa de arancel no puede ser negativo');
    }
  }

  private static validarTarifasArancel(tarifas: TarifaArancelDto[]): void {
    if (!tarifas) return;

    for (const tarifa of tarifas) {
      ConfiguracionImpuestosAranceles.validarTarifaArancel(tarifa);
    }
  }

  private static validarCodigosAduaneros(codigos: CodigoAduaneroDto[]): void {
    if (!codigos) return;

    const codigosSa = new Set<string>();
    for (const codigo of codigos) {
      this.validarCodigoAduanero(codigo);
      
      if (codigosSa.has(codigo.codigo_sa)) {
        throw new Error(`Código SA duplicado: ${codigo.codigo_sa}`);
      }
      codigosSa.add(codigo.codigo_sa);
    }
  }

  private static validarCodigoAduanero(codigo: CodigoAduaneroDto): void {
    if (!codigo.pais_origen || codigo.pais_origen.trim() === '') {
      throw new Error('El país de origen del código aduanero es requerido');
    }

    if (!codigo.codigo_sa || codigo.codigo_sa.trim() === '') {
      throw new Error('El código SA es requerido');
    }

    if (!codigo.descripcion || codigo.descripcion.trim() === '') {
      throw new Error('La descripción del código aduanero es requerida');
    }

    // Validación básica del formato HS (6-10 dígitos con puntos)
    const hsPattern = /^\d{4,6}(\.\d{2,4})?$/;
    if (!hsPattern.test(codigo.codigo_sa)) {
      throw new Error(`Formato de código SA inválido: ${codigo.codigo_sa}`);
    }
  }

  private static validarConsistenciaGlobal(
    incluirEnPrecio: boolean,
    regionesFiscales: RegionFiscalDto[],
    tasasReducidas: TasaReducidaDto[]
  ): void {
    if (incluirEnPrecio && regionesFiscales.length === 0) {
      throw new Error('No se puede incluir impuesto en precio sin regiones fiscales configuradas');
    }

    if (incluirEnPrecio && tasasReducidas.length > 0) {
      throw new Error('No se puede incluir impuesto en precio cuando hay tasas reducidas configuradas');
    }
  }

  // Métodos de utilidad
  obtenerRegionFiscal(pais: string, estadoRegion: string): RegionFiscalDto | null {
    return this.regionesFiscales.find(r => 
      r.pais === pais && r.estado_region === estadoRegion
    ) || null;
  }

  obtenerTasaReducidaPorDescripcion(descripcion: string): TasaReducidaDto | null {
    return this.tasasReducidas.find(t => t.descripcion === descripcion) || null;
  }

  obtenerCodigoAduaneroPorSa(codigoSa: string): CodigoAduaneroDto | null {
    return this.codigosAduaneros.find(c => c.codigo_sa === codigoSa) || null;
  }

  calcularImpuesto(monto: number, pais: string, estadoRegion: string): number {
    const region = this.obtenerRegionFiscal(pais, estadoRegion);
    if (!region || !region.recauda) {
      return 0;
    }

    return (monto * region.tasa_estandar) / 100;
  }

  esValida(): boolean {
    try {
      ConfiguracionImpuestosAranceles.validarServicioFiscal(this.servicioFiscal);
      ConfiguracionImpuestosAranceles.validarRegionesFiscales(this.regionesFiscales);
      ConfiguracionImpuestosAranceles.validarTasaEstandar(this.tasaEstandar);
      ConfiguracionImpuestosAranceles.validarTasasReducidas(this.tasasReducidas, this.tasaEstandar);
      ConfiguracionImpuestosAranceles.validarTarifasArancel(this.tarifasArancel);
      ConfiguracionImpuestosAranceles.validarCodigosAduaneros(this.codigosAduaneros);
      ConfiguracionImpuestosAranceles.validarConsistenciaGlobal(
        this.incluirEnPrecio,
        this.regionesFiscales,
        this.tasasReducidas
      );
      return true;
    } catch {
      return false;
    }
  }

  private actualizarFecha(): void {
    this.fechaActualizacion = new Date();
  }
}