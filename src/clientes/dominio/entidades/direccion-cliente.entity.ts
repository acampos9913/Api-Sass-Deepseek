/**
 * Entidad de DirecciónCliente que representa una dirección de cliente
 * Sigue los principios de Domain-Driven Design y Arquitectura Limpia
 */
export class DireccionCliente {
  constructor(
    public readonly id: string,
    public readonly clienteId: string,
    public readonly tipo: 'PRINCIPAL' | 'ENVIO' | 'FACTURACION',
    public readonly nombreCompleto: string,
    public readonly empresa: string | null,
    public readonly direccion: string,
    public readonly apartamento: string | null,
    public readonly ciudad: string,
    public readonly region: string,
    public readonly codigoPostal: string,
    public readonly pais: string,
    public readonly telefono: string | null,
    public readonly esPredeterminada: boolean,
    public readonly fechaCreacion: Date,
    public readonly fechaActualizacion: Date,
  ) {}

  /**
   * Verifica si la dirección es válida para envíos
   */
  esValidaParaEnvio(): boolean {
    return !!(this.direccion && this.ciudad && this.region && this.pais && this.codigoPostal);
  }

  /**
   * Actualiza la información de la dirección
   */
  actualizarInformacion(
    nombreCompleto?: string,
    empresa?: string | null,
    direccion?: string,
    apartamento?: string | null,
    ciudad?: string,
    region?: string,
    codigoPostal?: string,
    pais?: string,
    telefono?: string | null,
    esPredeterminada?: boolean,
  ): DireccionCliente {
    return new DireccionCliente(
      this.id,
      this.clienteId,
      this.tipo,
      nombreCompleto || this.nombreCompleto,
      empresa !== undefined ? empresa : this.empresa,
      direccion || this.direccion,
      apartamento !== undefined ? apartamento : this.apartamento,
      ciudad || this.ciudad,
      region || this.region,
      codigoPostal || this.codigoPostal,
      pais || this.pais,
      telefono !== undefined ? telefono : this.telefono,
      esPredeterminada !== undefined ? esPredeterminada : this.esPredeterminada,
      this.fechaCreacion,
      new Date(),
    );
  }

  /**
   * Marca la dirección como predeterminada
   */
  marcarComoPredeterminada(): DireccionCliente {
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
      true,
    );
  }

  /**
   * Valida que todos los campos obligatorios estén presentes
   */
  validarCamposObligatorios(): boolean {
    return !!(this.nombreCompleto && this.direccion && this.ciudad && this.region && this.pais && this.codigoPostal);
  }

  /**
   * Obtiene la dirección formateada para mostrar
   */
  obtenerDireccionFormateada(): string {
    const partes = [
      this.direccion,
      this.apartamento,
      this.ciudad,
      this.region,
      this.codigoPostal,
      this.pais,
    ].filter(parte => parte);

    return partes.join(', ');
  }

  /**
   * Verifica si la dirección pertenece a un país específico
   */
  perteneceAPais(pais: string): boolean {
    return this.pais.toLowerCase() === pais.toLowerCase();
  }
}