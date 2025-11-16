import { Injectable } from '@nestjs/common';
import type { RepositorioConfiguracionImpuestosAranceles } from '../interfaces/repositorio-configuracion-impuestos-aranceles.interface';
import { ConfiguracionImpuestosAranceles } from '../entidades/configuracion-impuestos-aranceles.entity';
import { ServicioRespuestaEstandar } from '../../../comun/aplicacion/servicios/servicio-respuesta-estandar';
import { ExcepcionDominio } from '../../../comun/excepciones/excepcion-dominio';
import {
  CrearConfiguracionImpuestosArancelesDto,
  ActualizarConfiguracionImpuestosArancelesDto,
  CriteriosBusquedaImpuestosArancelesDto,
  ServicioFiscal,
  TipoImpuesto,
  RespuestaConfiguracionImpuestosArancelesDto
} from '../../aplicacion/dto/configuracion-impuestos-aranceles.dto';

@Injectable()
export class GestionImpuestosArancelesCasoUso {
  constructor(
    private readonly repositorio: RepositorioConfiguracionImpuestosAranceles,
  ) {}

  async crearConfiguracion(datos: CrearConfiguracionImpuestosArancelesDto) {
    try {
      // Verificar si ya existe una configuración para esta tienda
      const existe = await this.repositorio.existePorTiendaId(datos.tiendaId);
      if (existe) {
        throw ExcepcionDominio.Respuesta400(
          'Ya existe una configuración de impuestos y aranceles para esta tienda',
          'ConfiguracionImpuestosAranceles.YaExiste'
        );
      }

      // Crear la configuración
      const configuracion = ConfiguracionImpuestosAranceles.crear(
        datos.tiendaId,
        datos.servicio_fiscal,
        datos.regiones_fiscales,
        datos.tasa_estandar,
        datos.tasas_reducidas,
        datos.impuesto_en_precio,
        datos.arancel_checkout,
        datos.tarifas_arancel,
        datos.ddp_disponible,
        datos.codigos_aduaneros,
        datos.incluir_en_precio,
        datos.impuesto_envios,
        datos.iva_digitales
      );

      // Guardar en el repositorio
      await this.repositorio.guardar(configuracion);

      return ServicioRespuestaEstandar.Respuesta201(
        'Configuración de impuestos y aranceles creada exitosamente',
        this.aDto(configuracion),
        'ConfiguracionImpuestosAranceles.CreadaExitosamente'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        `Error al crear configuración: ${error.message}`,
        'ConfiguracionImpuestosAranceles.ErrorCreacion'
      );
    }
  }

  async obtenerPorTiendaId(tiendaId: string) {
    try {
      const configuracion = await this.repositorio.buscarPorTiendaId(tiendaId);
      
      if (!configuracion) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de impuestos y aranceles no encontrada',
          'ConfiguracionImpuestosAranceles.NoEncontrada'
        );
      }

      return ServicioRespuestaEstandar.Respuesta200(
        'Configuración de impuestos y aranceles obtenida exitosamente',
        this.aDto(configuracion),
        'ConfiguracionImpuestosAranceles.ObtenidaExitosamente'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        `Error al obtener configuración: ${error.message}`,
        'ConfiguracionImpuestosAranceles.ErrorObtencion'
      );
    }
  }

  async actualizarConfiguracion(tiendaId: string, datos: ActualizarConfiguracionImpuestosArancelesDto) {
    try {
      const configuracion = await this.repositorio.buscarPorTiendaId(tiendaId);
      
      if (!configuracion) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de impuestos y aranceles no encontrada',
          'ConfiguracionImpuestosAranceles.NoEncontrada'
        );
      }

      // Aplicar cambios según los campos proporcionados
      if (datos.servicio_fiscal !== undefined) {
        configuracion.cambiarServicioFiscal(datos.servicio_fiscal);
      }

      if (datos.regiones_fiscales !== undefined) {
        // Para simplificar, reemplazamos todas las regiones
        // En una implementación más avanzada, podríamos hacer actualizaciones incrementales
        configuracion.getRegionesFiscales().forEach(region => {
          configuracion.removerRegionFiscal(region.pais, region.estado_region);
        });
        datos.regiones_fiscales.forEach(region => {
          configuracion.agregarRegionFiscal(region);
        });
      }

      if (datos.tasa_estandar !== undefined) {
        configuracion.cambiarTasaEstandar(datos.tasa_estandar);
      }

      if (datos.tasas_reducidas !== undefined) {
        // Reemplazar todas las tasas reducidas
        configuracion.getTasasReducidas().forEach(tasa => {
          configuracion.removerTasaReducida(tasa.descripcion);
        });
        datos.tasas_reducidas.forEach(tasa => {
          configuracion.agregarTasaReducida(tasa);
        });
      }

      if (datos.incluir_en_precio !== undefined) {
        configuracion.cambiarIncluirEnPrecio(datos.incluir_en_precio);
      }

      if (datos.arancel_checkout !== undefined) {
        configuracion.cambiarArancelCheckout(datos.arancel_checkout);
      }

      if (datos.tarifas_arancel !== undefined) {
        // Reemplazar todas las tarifas de arancel
        for (let i = configuracion.getTarifasArancel().length - 1; i >= 0; i--) {
          configuracion.removerTarifaArancel(i);
        }
        datos.tarifas_arancel.forEach(tarifa => {
          configuracion.agregarTarifaArancel(tarifa);
        });
      }

      if (datos.ddp_disponible !== undefined) {
        configuracion.cambiarDdpDisponible(datos.ddp_disponible);
      }

      if (datos.codigos_aduaneros !== undefined) {
        // Reemplazar todos los códigos aduaneros
        configuracion.getCodigosAduaneros().forEach(codigo => {
          configuracion.removerCodigoAduanero(codigo.codigo_sa);
        });
        datos.codigos_aduaneros.forEach(codigo => {
          configuracion.agregarCodigoAduanero(codigo);
        });
      }

      if (datos.impuesto_envios !== undefined) {
        configuracion.cambiarImpuestoEnvios(datos.impuesto_envios);
      }

      if (datos.iva_digitales !== undefined) {
        configuracion.cambiarIvaDigitales(datos.iva_digitales);
      }

      // Validar que la configuración sigue siendo válida
      if (!configuracion.esValida()) {
        throw ExcepcionDominio.Respuesta400(
          'La configuración actualizada no es válida',
          'ConfiguracionImpuestosAranceles.ConfiguracionInvalida'
        );
      }

      // Actualizar en el repositorio
      await this.repositorio.actualizar(configuracion);

      return ServicioRespuestaEstandar.Respuesta200(
        'Configuración de impuestos y aranceles actualizada exitosamente',
        this.aDto(configuracion),
        'ConfiguracionImpuestosAranceles.ActualizadaExitosamente'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        `Error al actualizar configuración: ${error.message}`,
        'ConfiguracionImpuestosAranceles.ErrorActualizacion'
      );
    }
  }

  async eliminarConfiguracion(tiendaId: string) {
    try {
      const existe = await this.repositorio.existePorTiendaId(tiendaId);
      
      if (!existe) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de impuestos y aranceles no encontrada',
          'ConfiguracionImpuestosAranceles.NoEncontrada'
        );
      }

      await this.repositorio.eliminarPorTiendaId(tiendaId);

      return ServicioRespuestaEstandar.Respuesta200(
        'Configuración de impuestos y aranceles eliminada exitosamente',
        null,
        'ConfiguracionImpuestosAranceles.EliminadaExitosamente'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        `Error al eliminar configuración: ${error.message}`,
        'ConfiguracionImpuestosAranceles.ErrorEliminacion'
      );
    }
  }

  async buscarPorCriterios(criterios: CriteriosBusquedaImpuestosArancelesDto) {
    try {
      const configuraciones = await this.repositorio.buscarPorCriterios(criterios);

      return ServicioRespuestaEstandar.Respuesta200(
        'Configuraciones encontradas exitosamente',
        configuraciones.map(config => this.aDto(config)),
        'ConfiguracionImpuestosAranceles.BusquedaExitosa'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        `Error al buscar configuraciones: ${error.message}`,
        'ConfiguracionImpuestosAranceles.ErrorBusqueda'
      );
    }
  }

  async obtenerEstadisticas() {
    try {
      const estadisticas = await this.repositorio.obtenerEstadisticas();

      return ServicioRespuestaEstandar.Respuesta200(
        'Estadísticas obtenidas exitosamente',
        estadisticas,
        'ConfiguracionImpuestosAranceles.EstadisticasObtenidas'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        `Error al obtener estadísticas: ${error.message}`,
        'ConfiguracionImpuestosAranceles.ErrorEstadisticas'
      );
    }
  }

  async calcularImpuesto(tiendaId: string, monto: number, pais: string, estadoRegion: string) {
    try {
      const configuracion = await this.repositorio.buscarPorTiendaId(tiendaId);
      
      if (!configuracion) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de impuestos y aranceles no encontrada',
          'ConfiguracionImpuestosAranceles.NoEncontrada'
        );
      }

      const impuesto = configuracion.calcularImpuesto(monto, pais, estadoRegion);

      return ServicioRespuestaEstandar.Respuesta200(
        'Impuesto calculado exitosamente',
        { impuesto, monto, pais, estadoRegion },
        'ConfiguracionImpuestosAranceles.ImpuestoCalculado'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        `Error al calcular impuesto: ${error.message}`,
        'ConfiguracionImpuestosAranceles.ErrorCalculoImpuesto'
      );
    }
  }

  async validarIntegridad(tiendaId: string) {
    try {
      const configuracion = await this.repositorio.buscarPorTiendaId(tiendaId);
      
      if (!configuracion) {
        throw ExcepcionDominio.Respuesta404(
          'Configuración de impuestos y aranceles no encontrada',
          'ConfiguracionImpuestosAranceles.NoEncontrada'
        );
      }

      const esValida = configuracion.esValida();

      return ServicioRespuestaEstandar.Respuesta200(
        esValida
          ? 'La configuración es válida'
          : 'La configuración tiene problemas de integridad',
        { esValida },
        esValida
          ? 'ConfiguracionImpuestosAranceles.IntegridadValida'
          : 'ConfiguracionImpuestosAranceles.IntegridadInvalida'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        `Error al validar integridad: ${error.message}`,
        'ConfiguracionImpuestosAranceles.ErrorValidacionIntegridad'
      );
    }
  }

  async obtenerTasasAplicables(tiendaId: string, pais: string, estadoRegion: string) {
    try {
      const tasas = await this.repositorio.obtenerTasasAplicables(tiendaId, pais, estadoRegion);

      return ServicioRespuestaEstandar.Respuesta200(
        'Tasas aplicables obtenidas exitosamente',
        tasas,
        'ConfiguracionImpuestosAranceles.TasasObtenidas'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        `Error al obtener tasas aplicables: ${error.message}`,
        'ConfiguracionImpuestosAranceles.ErrorObtencionTasas'
      );
    }
  }

  async exportarConfiguracion(tiendaId: string) {
    try {
      const datosExportacion = await this.repositorio.exportarConfiguracion(tiendaId);

      return ServicioRespuestaEstandar.Respuesta200(
        datosExportacion,
        'Configuración exportada exitosamente',
        'ConfiguracionImpuestosAranceles.ExportacionExitosa'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        `Error al exportar configuración: ${error.message}`,
        'ConfiguracionImpuestosAranceles.ErrorExportacion'
      );
    }
  }

  async importarConfiguracion(tiendaId: string, datos: any) {
    try {
      await this.repositorio.importarConfiguracion(tiendaId, datos);

      return ServicioRespuestaEstandar.Respuesta200(
        'Configuración importada exitosamente',
        null,
        'ConfiguracionImpuestosAranceles.ImportacionExitosa'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        `Error al importar configuración: ${error.message}`,
        'ConfiguracionImpuestosAranceles.ErrorImportacion'
      );
    }
  }

  async obtenerConfiguracionesConProblemas() {
    try {
      const configuraciones = await this.repositorio.obtenerConfiguracionesConProblemas();

      return ServicioRespuestaEstandar.Respuesta200(
        'Configuraciones con problemas obtenidas exitosamente',
        configuraciones.map(config => this.aDto(config)),
        'ConfiguracionImpuestosAranceles.ConfiguracionesConProblemasObtenidas'
      );
    } catch (error) {
      if (error instanceof ExcepcionDominio) {
        throw error;
      }
      throw ExcepcionDominio.Respuesta500(
        `Error al obtener configuraciones con problemas: ${error.message}`,
        'ConfiguracionImpuestosAranceles.ErrorObtencionConfiguracionesProblemas'
      );
    }
  }

  private aDto(configuracion: ConfiguracionImpuestosAranceles) {
    return {
      id: configuracion.id,
      tiendaId: configuracion.tiendaId,
      servicio_fiscal: configuracion.getServicioFiscal(),
      regiones_fiscales: configuracion.getRegionesFiscales(),
      tasa_estandar: configuracion.getTasaEstandar(),
      tasas_reducidas: configuracion.getTasasReducidas(),
      impuesto_en_precio: configuracion.getImpuestoEnPrecio(),
      arancel_checkout: configuracion.getArancelCheckout(),
      tarifas_arancel: configuracion.getTarifasArancel(),
      ddp_disponible: configuracion.getDdpDisponible(),
      codigos_aduaneros: configuracion.getCodigosAduaneros(),
      incluir_en_precio: configuracion.getIncluirEnPrecio(),
      impuesto_envios: configuracion.getImpuestoEnvios(),
      iva_digitales: configuracion.getIvaDigitales(),
      fecha_creacion: configuracion.fechaCreacion,
      fecha_actualizacion: configuracion.fechaActualizacion,
    };
  }
}