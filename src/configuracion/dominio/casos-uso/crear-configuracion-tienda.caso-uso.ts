import { Injectable, Inject } from '@nestjs/common';
import {
  ConfiguracionTienda,
  Moneda,
  ConfiguracionImpuestos,
  DireccionTienda,
  ContactoTienda,
  ConfiguracionEnvio,
  ConfiguracionPagos,
  ConfiguracionGeneral,
  ConfiguracionFacturacion
} from '../entidades/configuracion-tienda.entity';
import type { RepositorioConfiguracionTienda } from '../interfaces/repositorio-configuracion-tienda.interface';

/**
 * Parámetros para crear una configuración de tienda
 */
export interface ParametrosCrearConfiguracionTienda {
  nombreTienda: string;
  descripcionTienda?: string;
  moneda: Moneda;
  impuestos: ConfiguracionImpuestos;
  direccion: DireccionTienda;
  contacto: ContactoTienda;
  configuracionEnvio: ConfiguracionEnvio;
  configuracionPagos: ConfiguracionPagos;
  configuracionGeneral: ConfiguracionGeneral;
  configuracionFacturacion: ConfiguracionFacturacion;
}

/**
 * Caso de uso para crear configuraciones de tienda
 * Sigue los principios de la arquitectura limpia
 */
@Injectable()
export class CrearConfiguracionTiendaCasoUso {
  constructor(
    @Inject('RepositorioConfiguracionTienda')
    private readonly repositorioConfiguracionTienda: RepositorioConfiguracionTienda,
  ) {}

  /**
   * Ejecuta el caso de uso para crear una configuración de tienda
   * @param parametros Parámetros para crear la configuración
   * @returns La configuración de tienda creada
   */
  async ejecutar(parametros: ParametrosCrearConfiguracionTienda): Promise<ConfiguracionTienda> {
    // Validar que no exista una configuración con el mismo nombre
    await this.validarNombreUnico(parametros.nombreTienda);

    // Generar ID único para la configuración
    const id = this.generarIdUnico();

    // Crear entidad de configuración de tienda
    const configuracionTienda = new ConfiguracionTienda(
      id,
      parametros.nombreTienda,
      parametros.descripcionTienda || null,
      parametros.moneda,
      parametros.impuestos,
      parametros.direccion,
      parametros.contacto,
      parametros.configuracionEnvio,
      parametros.configuracionPagos,
      parametros.configuracionGeneral,
      parametros.configuracionFacturacion,
      new Date(),
      new Date(),
    );

    // Validar la configuración
    configuracionTienda.validar();

    // Guardar en el repositorio
    await this.repositorioConfiguracionTienda.crear({
      id: configuracionTienda.getId(),
      nombreTienda: configuracionTienda.getNombreTienda(),
      descripcionTienda: configuracionTienda.getDescripcionTienda(),
      moneda: configuracionTienda.getMoneda(),
      impuestos: configuracionTienda.getImpuestos(),
      direccion: configuracionTienda.getDireccion(),
      contacto: configuracionTienda.getContacto(),
      configuracionEnvio: configuracionTienda.getConfiguracionEnvio(),
      configuracionPagos: configuracionTienda.getConfiguracionPagos(),
      configuracionGeneral: configuracionTienda.getConfiguracionGeneral(),
      configuracionFacturacion: configuracionTienda.getConfiguracionFacturacion(),
      fechaCreacion: configuracionTienda.getFechaCreacion(),
      fechaActualizacion: configuracionTienda.getFechaActualizacion(),
    });

    // Activar esta configuración como la configuración activa
    await this.repositorioConfiguracionTienda.activarConfiguracion(id);

    return configuracionTienda;
  }

  /**
   * Valida que el nombre de la configuración sea único
   */
  private async validarNombreUnico(nombre: string): Promise<void> {
    const existe = await this.repositorioConfiguracionTienda.existeNombre(nombre);
    if (existe) {
      throw new Error(`Ya existe una configuración con el nombre: ${nombre}`);
    }
  }

  /**
   * Genera un ID único para la configuración
   */
  private generarIdUnico(): string {
    return `config_tienda_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}