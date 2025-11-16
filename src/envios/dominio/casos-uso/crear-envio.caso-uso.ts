/**
 * Caso de Uso para Crear Envíos
 * Contiene la lógica de negocio para la creación de envíos
 * Sigue los principios de la Arquitectura Limpia
 */
import { Inject, Injectable } from '@nestjs/common';
import { Envio, DireccionEnvio, MetodoEnvio, DetallesEnvio, EstadoEnvio, TipoMetodoEnvio } from '../entidades/envio.entity';
import type { RepositorioEnvio } from '../interfaces/repositorio-envio.interface';
import { nanoid } from 'nanoid';
import { ServicioRespuestaEstandar, RespuestaEstandar } from '../../../comun/aplicacion/servicios/servicio-respuesta-estandar';
import { ExcepcionDominio } from '../../../comun/excepciones/excepcion-dominio';

@Injectable()
export class CrearEnvioCasoUso {
  constructor(
    @Inject('RepositorioEnvio')
    private readonly repositorioEnvio: RepositorioEnvio,
  ) {}

  /**
   * Ejecuta el caso de uso para crear un nuevo envío
   * @param datosEnvio - Datos necesarios para crear el envío
   * @returns Promise<RespuestaEstandar<Envio>> - Respuesta estándar con el envío creado
   */
  async ejecutar(datosEnvio: DatosCrearEnvio): Promise<RespuestaEstandar<Envio>> {
    // Validar datos de entrada
    this.validarDatosEntrada(datosEnvio);

    // Verificar que no exista un envío para la misma orden
    await this.verificarEnvioExistente(datosEnvio.ordenId);

    // Calcular costo del envío
    const costoEnvio = this.calcularCostoEnvio(datosEnvio);

    // Generar fecha estimada de entrega
    const fechaEstimadaEntrega = this.generarFechaEstimadaEntrega(datosEnvio.metodoEnvio);

    // Crear la entidad Envio
    const envio = new Envio(
      nanoid(), // Generar ID único
      datosEnvio.ordenId,
      datosEnvio.direccionEnvio,
      datosEnvio.metodoEnvio,
      EstadoEnvio.PENDIENTE,
      costoEnvio,
      fechaEstimadaEntrega,
      new Date(), // fechaCreacion
      new Date(), // fechaActualizacion
      null, // trackingNumber (se genera al procesar)
      null, // proveedorEnvio (se asigna al procesar)
      datosEnvio.detalles,
    );

    // Validar la entidad
    envio.validar();

    // Guardar el envío en el repositorio
    const envioCreado = await this.repositorioEnvio.guardar(envio);

    return ServicioRespuestaEstandar.Respuesta201(
      'Envío creado exitosamente',
      envioCreado,
      'Envio.CreadoExitosamente'
    );
  }

  /**
   * Valida los datos de entrada para crear un envío
   * @param datosEnvio - Datos a validar
   */
  private validarDatosEntrada(datosEnvio: DatosCrearEnvio): void {
    if (!datosEnvio.ordenId) {
      throw ExcepcionDominio.Respuesta400(
        'El ID de la orden es requerido',
        'Envio.OrdenIdRequerido'
      );
    }

    if (!datosEnvio.direccionEnvio) {
      throw ExcepcionDominio.Respuesta400(
        'La dirección de envío es requerida',
        'Envio.DireccionEnvioRequerida'
      );
    }

    if (!datosEnvio.metodoEnvio) {
      throw ExcepcionDominio.Respuesta400(
        'El método de envío es requerido',
        'Envio.MetodoEnvioRequerido'
      );
    }

    if (!datosEnvio.detalles) {
      throw ExcepcionDominio.Respuesta400(
        'Los detalles del envío son requeridos',
        'Envio.DetallesRequeridos'
      );
    }

    // Validar dirección de envío
    this.validarDireccionEnvio(datosEnvio.direccionEnvio);

    // Validar método de envío
    this.validarMetodoEnvio(datosEnvio.metodoEnvio);

    // Validar detalles del envío
    this.validarDetallesEnvio(datosEnvio.detalles);
  }

  /**
   * Valida la dirección de envío
   * @param direccionEnvio - Dirección a validar
   */
  private validarDireccionEnvio(direccionEnvio: DireccionEnvio): void {
    if (!direccionEnvio.nombreCompleto) {
      throw new Error('El nombre completo del destinatario es requerido');
    }

    if (!direccionEnvio.calle) {
      throw new Error('La calle de la dirección es requerida');
    }

    if (!direccionEnvio.ciudad) {
      throw new Error('La ciudad de la dirección es requerida');
    }

    if (!direccionEnvio.codigoPostal) {
      throw new Error('El código postal de la dirección es requerido');
    }

    if (!direccionEnvio.pais) {
      throw new Error('El país de la dirección es requerido');
    }

    if (direccionEnvio.nombreCompleto.length > 200) {
      throw new Error('El nombre completo no puede exceder 200 caracteres');
    }

    if (direccionEnvio.calle.length > 200) {
      throw new Error('La calle no puede exceder 200 caracteres');
    }

    if (direccionEnvio.ciudad.length > 100) {
      throw new Error('La ciudad no puede exceder 100 caracteres');
    }

    if (direccionEnvio.codigoPostal.length > 20) {
      throw new Error('El código postal no puede exceder 20 caracteres');
    }

    if (direccionEnvio.pais.length > 100) {
      throw new Error('El país no puede exceder 100 caracteres');
    }

    if (direccionEnvio.telefono && direccionEnvio.telefono.length > 20) {
      throw new Error('El teléfono no puede exceder 20 caracteres');
    }

    if (direccionEnvio.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(direccionEnvio.email)) {
        throw new Error('El email del destinatario no tiene un formato válido');
      }
    }
  }

  /**
   * Valida el método de envío
   * @param metodoEnvio - Método de envío a validar
   */
  private validarMetodoEnvio(metodoEnvio: MetodoEnvio): void {
    if (!metodoEnvio.tipo) {
      throw new Error('El tipo de método de envío es requerido');
    }

    if (!Object.values(TipoMetodoEnvio).includes(metodoEnvio.tipo)) {
      throw new Error('Tipo de método de envío no válido');
    }

    if (metodoEnvio.tiempoEstimadoDias < 1) {
      throw new Error('El tiempo estimado de envío debe ser al menos 1 día');
    }

    if (metodoEnvio.tiempoEstimadoDias > 90) {
      throw new Error('El tiempo estimado de envío no puede exceder 90 días');
    }
  }

  /**
   * Valida los detalles del envío
   * @param detalles - Detalles del envío a validar
   */
  private validarDetallesEnvio(detalles: DetallesEnvio): void {
    if (detalles.pesoTotal < 0) {
      throw new Error('El peso total no puede ser negativo');
    }

    if (detalles.pesoTotal > 1000) {
      throw new Error('El peso total no puede exceder 1000 kg');
    }

    if (detalles.dimensiones.alto < 0) {
      throw new Error('La altura no puede ser negativa');
    }

    if (detalles.dimensiones.ancho < 0) {
      throw new Error('El ancho no puede ser negativo');
    }

    if (detalles.dimensiones.largo < 0) {
      throw new Error('El largo no puede ser negativo');
    }

    if (detalles.valorAsegurado < 0) {
      throw new Error('El valor asegurado no puede ser negativo');
    }

    if (detalles.esFragil && detalles.pesoTotal > 50) {
      throw new Error('Los paquetes frágiles no pueden pesar más de 50 kg');
    }
  }

  /**
   * Verifica si ya existe un envío para la orden
   * @param ordenId - ID de la orden a verificar
   */
  private async verificarEnvioExistente(ordenId: string): Promise<void> {
    const existeEnvio = await this.repositorioEnvio.existeEnvioParaOrden(ordenId);
    if (existeEnvio) {
      throw ExcepcionDominio.Respuesta400(
        `Ya existe un envío para la orden con ID: ${ordenId}`,
        'Envio.OrdenYaTieneEnvio'
      );
    }
  }

  /**
   * Calcula el costo del envío basado en los datos proporcionados
   * @param datosEnvio - Datos del envío
   * @returns number - Costo calculado del envío
   */
  private calcularCostoEnvio(datosEnvio: DatosCrearEnvio): number {
    let costoBase = 0;

    // Costo base por método de envío
    switch (datosEnvio.metodoEnvio.tipo) {
      case TipoMetodoEnvio.ESTANDAR:
        costoBase = 10;
        break;
      case TipoMetodoEnvio.EXPRESS:
        costoBase = 25;
        break;
      case TipoMetodoEnvio.INTERNACIONAL:
        costoBase = 50;
        break;
      case TipoMetodoEnvio.GRATIS:
        return 0;
    }

    // Costo por peso (USD por kg)
    const costoPeso = datosEnvio.detalles.pesoTotal * 2;

    // Costo por volumen (USD por m³)
    const volumen = (datosEnvio.detalles.dimensiones.alto * datosEnvio.detalles.dimensiones.ancho * datosEnvio.detalles.dimensiones.largo) / 1000000;
    const costoVolumen = volumen * 100;

    // Costo adicional por características especiales
    let costoAdicional = 0;
    if (datosEnvio.detalles.esFragil) {
      costoAdicional += 5;
    }
    if (datosEnvio.detalles.requiereFirma) {
      costoAdicional += 3;
    }
    if (datosEnvio.detalles.esRegalo) {
      costoAdicional += 2;
    }

    return costoBase + costoPeso + costoVolumen + costoAdicional;
  }

  /**
   * Genera la fecha estimada de entrega basada en el método de envío
   * @param metodoEnvio - Método de envío
   * @returns Date - Fecha estimada de entrega
   */
  private generarFechaEstimadaEntrega(metodoEnvio: MetodoEnvio): Date {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() + metodoEnvio.tiempoEstimadoDias);
    return fecha;
  }
}

/**
 * Interfaz para los datos necesarios para crear un envío
 */
export interface DatosCrearEnvio {
  ordenId: string;
  direccionEnvio: DireccionEnvio;
  metodoEnvio: MetodoEnvio;
  detalles: DetallesEnvio;
}