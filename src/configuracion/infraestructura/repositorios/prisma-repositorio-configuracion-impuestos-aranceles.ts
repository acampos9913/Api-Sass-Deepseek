import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { ConfiguracionImpuestosAranceles } from '../../dominio/entidades/configuracion-impuestos-aranceles.entity';
import { RepositorioConfiguracionImpuestosAranceles } from '../../dominio/interfaces/repositorio-configuracion-impuestos-aranceles.interface';
import { 
  ServicioFiscal, 
  TipoImpuesto,
  RegionFiscalDto,
  TasaReducidaDto,
  TarifaArancelDto,
  CodigoAduaneroDto,
  CriteriosBusquedaImpuestosArancelesDto 
} from '../../aplicacion/dto/configuracion-impuestos-aranceles.dto';

@Injectable()
export class PrismaRepositorioConfiguracionImpuestosAranceles implements RepositorioConfiguracionImpuestosAranceles {
  constructor(private readonly prisma: PrismaService) {}

  async buscarPorTiendaId(tiendaId: string): Promise<ConfiguracionImpuestosAranceles | null> {
    try {
      const configuracion = await this.prisma.configuracionImpuestosAranceles.findUnique({
        where: { tienda_id: tiendaId }
      });

      if (!configuracion) {
        return null;
      }

      return ConfiguracionImpuestosAranceles.reconstruir(
        configuracion.id,
        configuracion.tienda_id,
        configuracion.servicio_fiscal as ServicioFiscal,
        configuracion.regiones_fiscales as RegionFiscalDto[],
        configuracion.tasa_estandar,
        configuracion.tasas_reducidas as TasaReducidaDto[],
        configuracion.impuesto_en_precio,
        configuracion.arancel_checkout,
        configuracion.tarifas_arancel as TarifaArancelDto[],
        configuracion.ddp_disponible,
        configuracion.codigos_aduaneros as CodigoAduaneroDto[],
        configuracion.incluir_en_precio,
        configuracion.impuesto_envios,
        configuracion.iva_digitales,
        configuracion.fecha_creacion,
        configuracion.fecha_actualizacion
      );
    } catch (error) {
      throw new Error(`Error al buscar configuración por tienda ID: ${error.message}`);
    }
  }

  async guardar(configuracion: ConfiguracionImpuestosAranceles): Promise<void> {
    try {
      await this.prisma.configuracionImpuestosAranceles.create({
        data: {
          id: configuracion.id,
          tienda_id: configuracion.tiendaId,
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
        }
      });
    } catch (error) {
      throw new Error(`Error al guardar configuración: ${error.message}`);
    }
  }

  async actualizar(configuracion: ConfiguracionImpuestosAranceles): Promise<void> {
    try {
      await this.prisma.configuracionImpuestosAranceles.update({
        where: { id: configuracion.id },
        data: {
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
          fecha_actualizacion: configuracion.fechaActualizacion,
        }
      });
    } catch (error) {
      throw new Error(`Error al actualizar configuración: ${error.message}`);
    }
  }

  async eliminarPorTiendaId(tiendaId: string): Promise<void> {
    try {
      await this.prisma.configuracionImpuestosAranceles.delete({
        where: { tienda_id: tiendaId }
      });
    } catch (error) {
      throw new Error(`Error al eliminar configuración: ${error.message}`);
    }
  }

  async existePorTiendaId(tiendaId: string): Promise<boolean> {
    try {
      const configuracion = await this.prisma.configuracionImpuestosAranceles.findUnique({
        where: { tienda_id: tiendaId }
      });
      return configuracion !== null;
    } catch (error) {
      throw new Error(`Error al verificar existencia: ${error.message}`);
    }
  }

  async buscarPorServicioFiscal(servicioFiscal: ServicioFiscal): Promise<ConfiguracionImpuestosAranceles[]> {
    try {
      const configuraciones = await this.prisma.configuracionImpuestosAranceles.findMany({
        where: { servicio_fiscal: servicioFiscal }
      });

      return configuraciones.map(config => 
        ConfiguracionImpuestosAranceles.reconstruir(
          config.id,
          config.tienda_id,
          config.servicio_fiscal as ServicioFiscal,
          config.regiones_fiscales as RegionFiscalDto[],
          config.tasa_estandar,
          config.tasas_reducidas as TasaReducidaDto[],
          config.impuesto_en_precio,
          config.arancel_checkout,
          config.tarifas_arancel as TarifaArancelDto[],
          config.ddp_disponible,
          config.codigos_aduaneros as CodigoAduaneroDto[],
          config.incluir_en_precio,
          config.impuesto_envios,
          config.iva_digitales,
          config.fecha_creacion,
          config.fecha_actualizacion
        )
      );
    } catch (error) {
      throw new Error(`Error al buscar por servicio fiscal: ${error.message}`);
    }
  }

  async buscarPorTipoImpuesto(tipoImpuesto: TipoImpuesto): Promise<ConfiguracionImpuestosAranceles[]> {
    try {
      const configuraciones = await this.prisma.configuracionImpuestosAranceles.findMany({
        where: {
          regiones_fiscales: {
            path: ['$[*].tipo_impuesto'],
            array_contains: [tipoImpuesto]
          }
        }
      });

      return configuraciones.map(config => 
        ConfiguracionImpuestosAranceles.reconstruir(
          config.id,
          config.tienda_id,
          config.servicio_fiscal as ServicioFiscal,
          config.regiones_fiscales as RegionFiscalDto[],
          config.tasa_estandar,
          config.tasas_reducidas as TasaReducidaDto[],
          config.impuesto_en_precio,
          config.arancel_checkout,
          config.tarifas_arancel as TarifaArancelDto[],
          config.ddp_disponible,
          config.codigos_aduaneros as CodigoAduaneroDto[],
          config.incluir_en_precio,
          config.impuesto_envios,
          config.iva_digitales,
          config.fecha_creacion,
          config.fecha_actualizacion
        )
      );
    } catch (error) {
      throw new Error(`Error al buscar por tipo de impuesto: ${error.message}`);
    }
  }

  async buscarPorPais(pais: string): Promise<ConfiguracionImpuestosAranceles[]> {
    try {
      const configuraciones = await this.prisma.configuracionImpuestosAranceles.findMany({
        where: {
          regiones_fiscales: {
            path: ['$[*].pais'],
            array_contains: [pais]
          }
        }
      });

      return configuraciones.map(config => 
        ConfiguracionImpuestosAranceles.reconstruir(
          config.id,
          config.tienda_id,
          config.servicio_fiscal as ServicioFiscal,
          config.regiones_fiscales as RegionFiscalDto[],
          config.tasa_estandar,
          config.tasas_reducidas as TasaReducidaDto[],
          config.impuesto_en_precio,
          config.arancel_checkout,
          config.tarifas_arancel as TarifaArancelDto[],
          config.ddp_disponible,
          config.codigos_aduaneros as CodigoAduaneroDto[],
          config.incluir_en_precio,
          config.impuesto_envios,
          config.iva_digitales,
          config.fecha_creacion,
          config.fecha_actualizacion
        )
      );
    } catch (error) {
      throw new Error(`Error al buscar por país: ${error.message}`);
    }
  }

  async buscarConArancelCheckoutActivo(): Promise<ConfiguracionImpuestosAranceles[]> {
    try {
      const configuraciones = await this.prisma.configuracionImpuestosAranceles.findMany({
        where: { arancel_checkout: true }
      });

      return configuraciones.map(config => 
        ConfiguracionImpuestosAranceles.reconstruir(
          config.id,
          config.tienda_id,
          config.servicio_fiscal as ServicioFiscal,
          config.regiones_fiscales as RegionFiscalDto[],
          config.tasa_estandar,
          config.tasas_reducidas as TasaReducidaDto[],
          config.impuesto_en_precio,
          config.arancel_checkout,
          config.tarifas_arancel as TarifaArancelDto[],
          config.ddp_disponible,
          config.codigos_aduaneros as CodigoAduaneroDto[],
          config.incluir_en_precio,
          config.impuesto_envios,
          config.iva_digitales,
          config.fecha_creacion,
          config.fecha_actualizacion
        )
      );
    } catch (error) {
      throw new Error(`Error al buscar con arancel checkout activo: ${error.message}`);
    }
  }

  async buscarConDdpDisponible(): Promise<ConfiguracionImpuestosAranceles[]> {
    try {
      const configuraciones = await this.prisma.configuracionImpuestosAranceles.findMany({
        where: { ddp_disponible: true }
      });

      return configuraciones.map(config => 
        ConfiguracionImpuestosAranceles.reconstruir(
          config.id,
          config.tienda_id,
          config.servicio_fiscal as ServicioFiscal,
          config.regiones_fiscales as RegionFiscalDto[],
          config.tasa_estandar,
          config.tasas_reducidas as TasaReducidaDto[],
          config.impuesto_en_precio,
          config.arancel_checkout,
          config.tarifas_arancel as TarifaArancelDto[],
          config.ddp_disponible,
          config.codigos_aduaneros as CodigoAduaneroDto[],
          config.incluir_en_precio,
          config.impuesto_envios,
          config.iva_digitales,
          config.fecha_creacion,
          config.fecha_actualizacion
        )
      );
    } catch (error) {
      throw new Error(`Error al buscar con DDP disponible: ${error.message}`);
    }
  }

  async buscarConIvaDigitalesActivo(): Promise<ConfiguracionImpuestosAranceles[]> {
    try {
      const configuraciones = await this.prisma.configuracionImpuestosAranceles.findMany({
        where: { iva_digitales: true }
      });

      return configuraciones.map(config => 
        ConfiguracionImpuestosAranceles.reconstruir(
          config.id,
          config.tienda_id,
          config.servicio_fiscal as ServicioFiscal,
          config.regiones_fiscales as RegionFiscalDto[],
          config.tasa_estandar,
          config.tasas_reducidas as TasaReducidaDto[],
          config.impuesto_en_precio,
          config.arancel_checkout,
          config.tarifas_arancel as TarifaArancelDto[],
          config.ddp_disponible,
          config.codigos_aduaneros as CodigoAduaneroDto[],
          config.incluir_en_precio,
          config.impuesto_envios,
          config.iva_digitales,
          config.fecha_creacion,
          config.fecha_actualizacion
        )
      );
    } catch (error) {
      throw new Error(`Error al buscar con IVA digitales activo: ${error.message}`);
    }
  }

  async buscarPorCriterios(criterios: CriteriosBusquedaImpuestosArancelesDto): Promise<ConfiguracionImpuestosAranceles[]> {
    try {
      const whereClause: any = {};

      if (criterios.servicio_fiscal) whereClause.servicio_fiscal = criterios.servicio_fiscal;
      if (criterios.arancel_checkout !== undefined) whereClause.arancel_checkout = criterios.arancel_checkout;
      if (criterios.ddp_disponible !== undefined) whereClause.ddp_disponible = criterios.ddp_disponible;
      if (criterios.iva_digitales !== undefined) whereClause.iva_digitales = criterios.iva_digitales;

      if (criterios.pais) {
        whereClause.regiones_fiscales = {
          path: ['$[*].pais'],
          array_contains: [criterios.pais]
        };
      }

      if (criterios.tipo_impuesto) {
        whereClause.regiones_fiscales = {
          ...whereClause.regiones_fiscales,
          path: ['$[*].tipo_impuesto'],
          array_contains: [criterios.tipo_impuesto]
        };
      }

      const configuraciones = await this.prisma.configuracionImpuestosAranceles.findMany({
        where: whereClause
      });

      return configuraciones.map(config => 
        ConfiguracionImpuestosAranceles.reconstruir(
          config.id,
          config.tienda_id,
          config.servicio_fiscal as ServicioFiscal,
          config.regiones_fiscales as RegionFiscalDto[],
          config.tasa_estandar,
          config.tasas_reducidas as TasaReducidaDto[],
          config.impuesto_en_precio,
          config.arancel_checkout,
          config.tarifas_arancel as TarifaArancelDto[],
          config.ddp_disponible,
          config.codigos_aduaneros as CodigoAduaneroDto[],
          config.incluir_en_precio,
          config.impuesto_envios,
          config.iva_digitales,
          config.fecha_creacion,
          config.fecha_actualizacion
        )
      );
    } catch (error) {
      throw new Error(`Error al buscar por criterios: ${error.message}`);
    }
  }

  async actualizarServicioFiscal(tiendaId: string, servicioFiscal: ServicioFiscal): Promise<void> {
    try {
      await this.prisma.configuracionImpuestosAranceles.update({
        where: { tienda_id: tiendaId },
        data: { 
          servicio_fiscal: servicioFiscal,
          fecha_actualizacion: new Date()
        }
      });
    } catch (error) {
      throw new Error(`Error al actualizar servicio fiscal: ${error.message}`);
    }
  }

  async actualizarTasaEstandar(tiendaId: string, tasaEstandar: number): Promise<void> {
    try {
      await this.prisma.configuracionImpuestosAranceles.update({
        where: { tienda_id: tiendaId },
        data: { 
          tasa_estandar: tasaEstandar,
          fecha_actualizacion: new Date()
        }
      });
    } catch (error) {
      throw new Error(`Error al actualizar tasa estándar: ${error.message}`);
    }
  }

  async actualizarIncluirEnPrecio(tiendaId: string, incluir: boolean): Promise<void> {
    try {
      await this.prisma.configuracionImpuestosAranceles.update({
        where: { tienda_id: tiendaId },
        data: { 
          incluir_en_precio: incluir,
          fecha_actualizacion: new Date()
        }
      });
    } catch (error) {
      throw new Error(`Error al actualizar incluir en precio: ${error.message}`);
    }
  }

  async actualizarArancelCheckout(tiendaId: string, activo: boolean): Promise<void> {
    try {
      await this.prisma.configuracionImpuestosAranceles.update({
        where: { tienda_id: tiendaId },
        data: { 
          arancel_checkout: activo,
          fecha_actualizacion: new Date()
        }
      });
    } catch (error) {
      throw new Error(`Error al actualizar arancel checkout: ${error.message}`);
    }
  }

  async actualizarDdpDisponible(tiendaId: string, disponible: boolean): Promise<void> {
    try {
      await this.prisma.configuracionImpuestosAranceles.update({
        where: { tienda_id: tiendaId },
        data: { 
          ddp_disponible: disponible,
          fecha_actualizacion: new Date()
        }
      });
    } catch (error) {
      throw new Error(`Error al actualizar DDP disponible: ${error.message}`);
    }
  }

  async actualizarImpuestoEnvios(tiendaId: string, activo: boolean): Promise<void> {
    try {
      await this.prisma.configuracionImpuestosAranceles.update({
        where: { tienda_id: tiendaId },
        data: { 
          impuesto_envios: activo,
          fecha_actualizacion: new Date()
        }
      });
    } catch (error) {
      throw new Error(`Error al actualizar impuesto envíos: ${error.message}`);
    }
  }

  async actualizarIvaDigitales(tiendaId: string, activo: boolean): Promise<void> {
    try {
      await this.prisma.configuracionImpuestosAranceles.update({
        where: { tienda_id: tiendaId },
        data: { 
          iva_digitales: activo,
          fecha_actualizacion: new Date()
        }
      });
    } catch (error) {
      throw new Error(`Error al actualizar IVA digitales: ${error.message}`);
    }
  }

  async agregarRegionFiscal(tiendaId: string, region: any): Promise<void> {
    try {
      const configuracion = await this.prisma.configuracionImpuestosAranceles.findUnique({
        where: { tienda_id: tiendaId }
      });

      if (!configuracion) {
        throw new Error('Configuración no encontrada');
      }

      const regionesActualizadas = [...(configuracion.regiones_fiscales as any[]), region];
      
      await this.prisma.configuracionImpuestosAranceles.update({
        where: { tienda_id: tiendaId },
        data: { 
          regiones_fiscales: regionesActualizadas,
          fecha_actualizacion: new Date()
        }
      });
    } catch (error) {
      throw new Error(`Error al agregar región fiscal: ${error.message}`);
    }
  }

  async actualizarRegionFiscal(tiendaId: string, pais: string, estadoRegion: string, nuevaRegion: any): Promise<void> {
    try {
      const configuracion = await this.prisma.configuracionImpuestosAranceles.findUnique({
        where: { tienda_id: tiendaId }
      });

      if (!configuracion) {
        throw new Error('Configuración no encontrada');
      }

      const regionesActualizadas = (configuracion.regiones_fiscales as any[]).map(region => 
        region.pais === pais && region.estado_region === estadoRegion ? nuevaRegion : region
      );
      
      await this.prisma.configuracionImpuestosAranceles.update({
        where: { tienda_id: tiendaId },
        data: { 
          regiones_fiscales: regionesActualizadas,
          fecha_actualizacion: new Date()
        }
      });
    } catch (error) {
      throw new Error(`Error al actualizar región fiscal: ${error.message}`);
    }
  }

  async removerRegionFiscal(tiendaId: string, pais: string, estadoRegion: string): Promise<void> {
    try {
      const configuracion = await this.prisma.configuracionImpuestosAranceles.findUnique({
        where: { tienda_id: tiendaId }
      });

      if (!configuracion) {
        throw new Error('Configuración no encontrada');
      }

      const regionesActualizadas = (configuracion.regiones_fiscales as any[]).filter(region => 
        !(region.pais === pais && region.estado_region === estadoRegion)
      );
      
      await this.prisma.configuracionImpuestosAranceles.update({
        where: { tienda_id: tiendaId },
        data: { 
          regiones_fiscales: regionesActualizadas,
          fecha_actualizacion: new Date()
        }
      });
    } catch (error) {
      throw new Error(`Error al remover región fiscal: ${error.message}`);
    }
  }

  async agregarTasaReducida(tiendaId: string, tasa: any): Promise<void> {
    try {
      const configuracion = await this.prisma.configuracionImpuestosAranceles.findUnique({
        where: { tienda_id: tiendaId }
      });

      if (!configuracion) {
        throw new Error('Configuración no encontrada');
      }

      const tasasActualizadas = [...(configuracion.tasas_reducidas as any[]), tasa];
      
      await this.prisma.configuracionImpuestosAranceles.update({
        where: { tienda_id: tiendaId },
        data: { 
          tasas_reducidas: tasasActualizadas,
          fecha_actualizacion: new Date()
        }
      });
    } catch (error) {
      throw new Error(`Error al agregar tasa reducida: ${error.message}`);
    }
  }

  async actualizarTasaReducida(tiendaId: string, descripcion: string, nuevaTasa: any): Promise<void> {
    try {
      const configuracion = await this.prisma.configuracionImpuestosAranceles.findUnique({
        where: { tienda_id: tiendaId }
      });

      if (!configuracion) {
        throw new Error('Configuración no encontrada');
      }

      const tasasActualizadas = (configuracion.tasas_reducidas as any[]).map(tasa => 
        tasa.descripcion === descripcion ? nuevaTasa : tasa
      );
      
      await this.prisma.configuracionImpuestosAranceles.update({
        where: { tienda_id: tiendaId },
        data: { 
          tasas_reducidas: tasasActualizadas,
          fecha_actualizacion: new Date()
        }
      });
    } catch (error) {
      throw new Error(`Error al actualizar tasa reducida: ${error.message}`);
    }
  }

  async removerTasaReducida(tiendaId: string, descripcion: string): Promise<void> {
    try {
      const configuracion = await this.prisma.configuracionImpuestosAranceles.findUnique({
        where: { tienda_id: tiendaId }
      });

      if (!configuracion) {
        throw new Error('Configuración no encontrada');
      }

      const tasasActualizadas = (configuracion.tasas_reducidas as any[]).filter(tasa => 
        tasa.descripcion !== descripcion
      );
      
      await this.prisma.configuracionImpuestosAranceles.update({
        where: { tienda_id: tiendaId },
        data: { 
          tasas_reducidas: tasasActualizadas,
          fecha_actualizacion: new Date()
        }
      });
    } catch (error) {
      throw new Error(`Error al remover tasa reducida: ${error.message}`);
    }
  }

  async agregarTarifaArancel(tiendaId: string, tarifa: any): Promise<void> {
    try {
      const configuracion = await this.prisma.configuracionImpuestosAranceles.findUnique({
        where: { tienda_id: tiendaId }
      });

      if (!configuracion) {
        throw new Error('Configuración no encontrada');
      }

      const tarifasActualizadas = [...(configuracion.tarifas_arancel as any[]), tarifa];
      
      await this.prisma.configuracionImpuestosAranceles.update({
        where: { tienda_id: tiendaId },
        data: { 
          tarifas_arancel: tarifasActualizadas,
          fecha_actualizacion: new Date()
        }
      });
    } catch (error) {
      throw new Error(`Error al agregar tarifa de arancel: ${error.message}`);
    }
  }

  async actualizarTarifaArancel(tiendaId: string, index: number, nuevaTarifa: any): Promise<void> {
    try {
      const configuracion = await this.prisma.configuracionImpuestosAranceles.findUnique({
        where: { tienda_id: tiendaId }
      });

      if (!configuracion) {
        throw new Error('Configuración no encontrada');
      }

      const tarifasActualizadas = (configuracion.tarifas_arancel as any[]).map((tarifa, i) => 
        i === index ? nuevaTarifa : tarifa
      );
      
      await this.prisma.configuracionImpuestosAranceles.update({
        where: { tienda_id: tiendaId },
        data: { 
          tarifas_arancel: tarifasActualizadas,
          fecha_actualizacion: new Date()
        }
      });
    } catch (error) {
      throw new Error(`Error al actualizar tarifa de arancel: ${error.message}`);
    }
  }

  async removerTarifaArancel(tiendaId: string, index: number): Promise<void> {
    try {
      const configuracion = await this.prisma.configuracionImpuestosAranceles.findUnique({
        where: { tienda_id: tiendaId }
      });

      if (!configuracion) {
        throw new Error('Configuración no encontrada');
      }

      const tarifasActualizadas = (configuracion.tarifas_arancel as any[]).filter((_, i) => i !== index);
      
      await this.prisma.configuracionImpuestosAranceles.update({
        where: { tienda_id: tiendaId },
        data: { 
          tarifas_arancel: tarifasActualizadas,
          fecha_actualizacion: new Date()
        }
      });
    } catch (error) {
      throw new Error(`Error al remover tarifa de arancel: ${error.message}`);
    }
  }

  async agregarCodigoAduanero(tiendaId: string, codigo: any): Promise<void> {
    try {
      const configuracion = await this.prisma.configuracionImpuestosAranceles.findUnique({
        where: { tienda_id: tiendaId }
      });

      if (!configuracion) {
        throw new Error('Configuración no encontrada');
      }

      const codigosActualizados = [...(configuracion.codigos_aduaneros as any[]), codigo];
      
      await this.prisma.configuracionImpuestosAranceles.update({
        where: { tienda_id: tiendaId },
        data: { 
          codigos_aduaneros: codigosActualizados,
          fecha_actualizacion: new Date()
        }
      });
    } catch (error) {
      throw new Error(`Error al agregar código aduanero: ${error.message}`);
    }
  }

  async actualizarCodigoAduanero(tiendaId: string, codigoSa: string, nuevoCodigo: any): Promise<void> {
    try {
      const configuracion = await this.prisma.configuracionImpuestosAranceles.findUnique({
        where: { tienda_id: tiendaId }
      });

      if (!configuracion) {
        throw new Error('Configuración no encontrada');
      }

      const codigosActualizados = (configuracion.codigos_aduaneros as any[]).map(codigo => 
        codigo.codigo_sa === codigoSa ? nuevoCodigo : codigo
      );
      
      await this.prisma.configuracionImpuestosAranceles.update({
        where: { tienda_id: tiendaId },
        data: { 
          codigos_aduaneros: codigosActualizados,
          fecha_actualizacion: new Date()
        }
      });
    } catch (error) {
      throw new Error(`Error al actualizar código aduanero: ${error.message}`);
    }
  }

  async removerCodigoAduanero(tiendaId: string, codigoSa: string): Promise<void> {
    try {
      const configuracion = await this.prisma.configuracionImpuestosAranceles.findUnique({
        where: { tienda_id: tiendaId }
      });

      if (!configuracion) {
        throw new Error('Configuración no encontrada');
      }

      const codigosActualizados = (configuracion.codigos_aduaneros as any[]).filter(codigo => 
        codigo.codigo_sa !== codigoSa
      );
      
      await this.prisma.configuracionImpuestosAranceles.update({
        where: { tienda_id: tiendaId },
        data: { 
          codigos_aduaneros: codigosActualizados,
          fecha_actualizacion: new Date()
        }
      });
    } catch (error) {
      throw new Error(`Error al remover código aduanero: ${error.message}`);
    }
  }

  async validarRegionFiscalExistente(tiendaId: string, pais: string, estadoRegion: string): Promise<boolean> {
    try {
      const configuracion = await this.prisma.configuracionImpuestosAranceles.findUnique({
        where: { tienda_id: tiendaId }
      });

      if (!configuracion) {
        return false;
      }

      const regiones = configuracion.regiones_fiscales as any[];
      return regiones.some(region => region.pais === pais && region.estado_region === estadoRegion);
    } catch (error) {
      throw new Error(`Error al validar región fiscal existente: ${error.message}`);
    }
  }

  async validarCodigoSaExistente(tiendaId: string, codigoSa: string): Promise<boolean> {
    try {
      const configuracion = await this.prisma.configuracionImpuestosAranceles.findUnique({
        where: { tienda_id: tiendaId }
      });

      if (!configuracion) {
        return false;
      }

      const codigos = configuracion.codigos_aduaneros as any[];
      return codigos.some(codigo => codigo.codigo_sa === codigoSa);
    } catch (error) {
      throw new Error(`Error al validar código SA existente: ${error.message}`);
    }
  }

  async validarTasaReducidaExistente(tiendaId: string, descripcion: string): Promise<boolean> {
    try {
      const configuracion = await this.prisma.configuracionImpuestosAranceles.findUnique({
        where: { tienda_id: tiendaId }
      });

      if (!configuracion) {
        return false;
      }

      const tasas = configuracion.tasas_reducidas as any[];
      return tasas.some(tasa => tasa.descripcion === descripcion);
    } catch (error) {
      throw new Error(`Error al validar tasa reducida existente: ${error.message}`);
    }
  }

  async obtenerEstadisticas(): Promise<{
    totalConfiguraciones: number;
    shopifyTax: number;
    manual: number;
    basicTax: number;
    conArancelCheckout: number;
    conDdpDisponible: number;
    conIvaDigitales: number;
    regionesFiscalesPromedio: number;
  }> {
    try {
      const totalConfiguraciones = await this.prisma.configuracionImpuestosAranceles.count();
      const shopifyTax = await this.prisma.configuracionImpuestosAranceles.count({
        where: { servicio_fiscal: ServicioFiscal.SHOPIFY_TAX }
      });
      const manual = await this.prisma.configuracionImpuestosAranceles.count({
        where: { servicio_fiscal: ServicioFiscal.MANUAL }
      });
      const basicTax = await this.prisma.configuracionImpuestosAranceles.count({
        where: { servicio_fiscal: ServicioFiscal.BASIC_TAX }
      });
      const conArancelCheckout = await this.prisma.configuracionImpuestosAranceles.count({
        where: { arancel_checkout: true }
      });
      const conDdpDisponible = await this.prisma.configuracionImpuestosAranceles.count({
        where: { ddp_disponible: true }
      });
      const conIvaDigitales = await this.prisma.configuracionImpuestosAranceles.count({
        where: { iva_digitales: true }
      });

      // Calcular promedio de regiones fiscales
      const todasConfiguraciones = await this.prisma.configuracionImpuestosAranceles.findMany({
        select: { regiones_fiscales: true }
      });
      
      const totalRegiones = todasConfiguraciones.reduce((total, config) => 
        total + (config.regiones_fiscales as any[]).length, 0
      );
      const regionesFiscalesPromedio = totalConfiguraciones > 0 ? totalRegiones / totalConfiguraciones : 0;

      return {
        totalConfiguraciones,
        shopifyTax,
        manual,
        basicTax,
        conArancelCheckout,
        conDdpDisponible,
        conIvaDigitales,
        regionesFiscalesPromedio
      };
    } catch (error) {
      throw new Error(`Error al obtener estadísticas: ${error.message}`);
    }
  }

  async obtenerEstadisticasPorPais(): Promise<Array<{
    pais: string;
    totalConfiguraciones: number;
    tasaPromedio: number;
  }>> {
    try {
      const configuraciones = await this.prisma.configuracionImpuestosAranceles.findMany({
        select: { regiones_fiscales: true }
      });

      const estadisticasPorPais = new Map<string, { total: number; sumaTasas: number }>();

      configuraciones.forEach(config => {
        const regiones = config.regiones_fiscales as any[];
        regiones.forEach(region => {
          const pais = region.pais;
          const tasa = region.tasa_estandar;

          if (!estadisticasPorPais.has(pais)) {
            estadisticasPorPais.set(pais, { total: 0, sumaTasas: 0 });
          }

          const estadisticas = estadisticasPorPais.get(pais)!;
          estadisticas.total += 1;
          estadisticas.sumaTasas += tasa;
        });
      });

      return Array.from(estadisticasPorPais.entries()).map(([pais, { total, sumaTasas }]) => ({
        pais,
        totalConfiguraciones: total,
        tasaPromedio: total > 0 ? sumaTasas / total : 0
      }));
    } catch (error) {
      throw new Error(`Error al obtener estadísticas por país: ${error.message}`);
    }
  }

  async obtenerEstadisticasPorTipoImpuesto(): Promise<Array<{
    tipoImpuesto: TipoImpuesto;
    totalConfiguraciones: number;
    paises: string[];
  }>> {
    try {
      const configuraciones = await this.prisma.configuracionImpuestosAranceles.findMany({
        select: { regiones_fiscales: true }
      });

      const estadisticasPorTipo = new Map<TipoImpuesto, { total: number; paises: Set<string> }>();

      configuraciones.forEach(config => {
        const regiones = config.regiones_fiscales as any[];
        regiones.forEach(region => {
          const tipoImpuesto = region.tipo_impuesto as TipoImpuesto;
          const pais = region.pais;

          if (!estadisticasPorTipo.has(tipoImpuesto)) {
            estadisticasPorTipo.set(tipoImpuesto, { total: 0, paises: new Set() });
          }

          const estadisticas = estadisticasPorTipo.get(tipoImpuesto)!;
          estadisticas.total += 1;
          estadisticas.paises.add(pais);
        });
      });

      return Array.from(estadisticasPorTipo.entries()).map(([tipoImpuesto, { total, paises }]) => ({
        tipoImpuesto,
        totalConfiguraciones: total,
        paises: Array.from(paises)
      }));
    } catch (error) {
      throw new Error(`Error al obtener estadísticas por tipo de impuesto: ${error.message}`);
    }
  }

  async realizarBackup(): Promise<any> {
    try {
      const configuraciones = await this.prisma.configuracionImpuestosAranceles.findMany();
      return {
        fecha_backup: new Date(),
        total_configuraciones: configuraciones.length,
        configuraciones: configuraciones
      };
    } catch (error) {
      throw new Error(`Error al realizar backup: ${error.message}`);
    }
  }

  async restaurarDesdeBackup(backup: any): Promise<void> {
    try {
      if (backup.configuraciones && Array.isArray(backup.configuraciones)) {
        for (const config of backup.configuraciones) {
          await this.prisma.configuracionImpuestosAranceles.upsert({
            where: { id: config.id },
            update: config,
            create: config
          });
        }
      }
    } catch (error) {
      throw new Error(`Error al restaurar desde backup: ${error.message}`);
    }
  }

  async sincronizarConSistemaExterno(tiendaId: string): Promise<void> {
    // Implementación placeholder para sincronización con sistemas externos
    console.log(`Sincronizando configuración de impuestos y aranceles para tienda ${tiendaId}`);
  }

  async validarIntegridad(tiendaId: string): Promise<boolean> {
    try {
      const configuracion = await this.buscarPorTiendaId(tiendaId);
      return configuracion ? configuracion.esValida() : false;
    } catch (error) {
      throw new Error(`Error al validar integridad: ${error.message}`);
    }
  }

  async obtenerHistorialCambios(tiendaId: string): Promise<any[]> {
    // Implementación simplificada - en producción se usaría una tabla de historial
    try {
      const configuracion = await this.prisma.configuracionImpuestosAranceles.findUnique({
        where: { tienda_id: tiendaId }
      });

      if (!configuracion) {
        return [];
      }

      return [{
        fecha: configuracion.fecha_actualizacion,
        tipo: 'ACTUALIZACION',
        descripcion: 'Última actualización de configuración'
      }];
    } catch (error) {
      throw new Error(`Error al obtener historial de cambios: ${error.message}`);
    }
  }

  async limpiarConfiguracionesObsoletas(): Promise<void> {
    try {
      const fechaLimite = new Date();
      fechaLimite.setMonth(fechaLimite.getMonth() - 6); // 6 meses atrás

      const configuracionesObsoletas = await this.prisma.configuracionImpuestosAranceles.findMany({
        where: {
          fecha_actualizacion: { lt: fechaLimite }
        }
      });

      for (const config of configuracionesObsoletas) {
        await this.prisma.configuracionImpuestosAranceles.delete({
          where: { id: config.id }
        });
      }
    } catch (error) {
      throw new Error(`Error al limpiar configuraciones obsoletas: ${error.message}`);
    }
  }

  async migrarConfiguracion(tiendaId: string, versionAnterior: string, versionNueva: string): Promise<void> {
    // Implementación placeholder para migración de versiones
    console.log(`Migrando configuración de ${versionAnterior} a ${versionNueva} para tienda ${tiendaId}`);
  }

  async obtenerConfiguracionesConProblemas(): Promise<ConfiguracionImpuestosAranceles[]> {
    try {
      const todasConfiguraciones = await this.prisma.configuracionImpuestosAranceles.findMany();

      const configuracionesConProblemas = todasConfiguraciones.filter(config => {
        try {
          const entidad = ConfiguracionImpuestosAranceles.reconstruir(
            config.id,
            config.tienda_id,
            config.servicio_fiscal as ServicioFiscal,
            config.regiones_fiscales as RegionFiscalDto[],
            config.tasa_estandar,
            config.tasas_reducidas as TasaReducidaDto[],
            config.impuesto_en_precio,
            config.arancel_checkout,
            config.tarifas_arancel as TarifaArancelDto[],
            config.ddp_disponible,
            config.codigos_aduaneros as CodigoAduaneroDto[],
            config.incluir_en_precio,
            config.impuesto_envios,
            config.iva_digitales,
            config.fecha_creacion,
            config.fecha_actualizacion
          );
          return !entidad.esValida();
        } catch {
          return true;
        }
      });

      return configuracionesConProblemas.map(config => 
        ConfiguracionImpuestosAranceles.reconstruir(
          config.id,
          config.tienda_id,
          config.servicio_fiscal as ServicioFiscal,
          config.regiones_fiscales as RegionFiscalDto[],
          config.tasa_estandar,
          config.tasas_reducidas as TasaReducidaDto[],
          config.impuesto_en_precio,
          config.arancel_checkout,
          config.tarifas_arancel as TarifaArancelDto[],
          config.ddp_disponible,
          config.codigos_aduaneros as CodigoAduaneroDto[],
          config.incluir_en_precio,
          config.impuesto_envios,
          config.iva_digitales,
          config.fecha_creacion,
          config.fecha_actualizacion
        )
      );
    } catch (error) {
      throw new Error(`Error al obtener configuraciones con problemas: ${error.message}`);
    }
  }

  async obtenerConfiguracionesSinRegionesFiscales(): Promise<ConfiguracionImpuestosAranceles[]> {
    try {
      const configuraciones = await this.prisma.configuracionImpuestosAranceles.findMany({
        where: {
          OR: [
            { regiones_fiscales: { equals: [] } },
            { regiones_fiscales: { equals: null } }
          ]
        }
      });

      return configuraciones.map(config => 
        ConfiguracionImpuestosAranceles.reconstruir(
          config.id,
          config.tienda_id,
          config.servicio_fiscal as ServicioFiscal,
          config.regiones_fiscales as RegionFiscalDto[],
          config.tasa_estandar,
          config.tasas_reducidas as TasaReducidaDto[],
          config.impuesto_en_precio,
          config.arancel_checkout,
          config.tarifas_arancel as TarifaArancelDto[],
          config.ddp_disponible,
          config.codigos_aduaneros as CodigoAduaneroDto[],
          config.incluir_en_precio,
          config.impuesto_envios,
          config.iva_digitales,
          config.fecha_creacion,
          config.fecha_actualizacion
        )
      );
    } catch (error) {
      throw new Error(`Error al obtener configuraciones sin regiones fiscales: ${error.message}`);
    }
  }

  async obtenerConfiguracionesConTasasInconsistentes(): Promise<ConfiguracionImpuestosAranceles[]> {
    try {
      const todasConfiguraciones = await this.prisma.configuracionImpuestosAranceles.findMany();

      const configuracionesInconsistentes = todasConfiguraciones.filter(config => {
        const tasasReducidas = config.tasas_reducidas as any[];
        return tasasReducidas.some(tasa => tasa.porcentaje >= config.tasa_estandar);
      });

      return configuracionesInconsistentes.map(config => 
        ConfiguracionImpuestosAranceles.reconstruir(
          config.id,
          config.tienda_id,
          config.servicio_fiscal as ServicioFiscal,
          config.regiones_fiscales as RegionFiscalDto[],
          config.tasa_estandar,
          config.tasas_reducidas as TasaReducidaDto[],
          config.impuesto_en_precio,
          config.arancel_checkout,
          config.tarifas_arancel as TarifaArancelDto[],
          config.ddp_disponible,
          config.codigos_aduaneros as CodigoAduaneroDto[],
          config.incluir_en_precio,
          config.impuesto_envios,
          config.iva_digitales,
          config.fecha_creacion,
          config.fecha_actualizacion
        )
      );
    } catch (error) {
      throw new Error(`Error al obtener configuraciones con tasas inconsistentes: ${error.message}`);
    }
  }

  // Métodos restantes de la interfaz con implementaciones placeholder
  async buscarConfiguracionesPorRangoTasa(min: number, max: number): Promise<ConfiguracionImpuestosAranceles[]> {
    return this.buscarPorCriterios({});
  }

  async buscarConfiguracionesConTasasReducidas(): Promise<ConfiguracionImpuestosAranceles[]> {
    return this.buscarPorCriterios({});
  }

  async buscarConfiguracionesConCodigosAduaneros(): Promise<ConfiguracionImpuestosAranceles[]> {
    return this.buscarPorCriterios({});
  }

  async buscarConfiguracionesConTarifasArancel(): Promise<ConfiguracionImpuestosAranceles[]> {
    return this.buscarPorCriterios({});
  }

  async validarCompatibilidadServicioFiscal(tiendaId: string, servicioFiscal: ServicioFiscal): Promise<boolean> {
    return true;
  }

  async validarCompatibilidadRegionFiscal(tiendaId: string, pais: string, estadoRegion: string): Promise<boolean> {
    return true;
  }

  async validarCompatibilidadTasaReducida(tiendaId: string, porcentaje: number): Promise<boolean> {
    return true;
  }

  async validarCompatibilidadCodigoAduanero(tiendaId: string, codigoSa: string): Promise<boolean> {
    return true;
  }

  async calcularImpuestoParaOrden(tiendaId: string, monto: number, pais: string, estadoRegion: string): Promise<number> {
    const configuracion = await this.buscarPorTiendaId(tiendaId);
    return configuracion ? configuracion.calcularImpuesto(monto, pais, estadoRegion) : 0;
  }

  async calcularArancelParaProducto(tiendaId: string, productoId: string, paisDestino: string): Promise<number> {
    return 0;
  }

  async obtenerTasasAplicables(tiendaId: string, pais: string, estadoRegion: string): Promise<{
    tasaEstandar: number;
    tasasReducidas: Array<{ descripcion: string; porcentaje: number }>;
  }> {
    const configuracion = await this.buscarPorTiendaId(tiendaId);
    const region = configuracion?.obtenerRegionFiscal(pais, estadoRegion);
    
    return {
      tasaEstandar: region?.tasa_estandar || 0,
      tasasReducidas: configuracion?.getTasasReducidas() || []
    };
  }

  async exportarConfiguracion(tiendaId: string): Promise<any> {
    const configuracion = await this.buscarPorTiendaId(tiendaId);
    return configuracion ? this.aDto(configuracion) : null;
  }

  async importarConfiguracion(tiendaId: string, datos: any): Promise<void> {
    // Implementación simplificada - en producción se validaría y procesaría los datos
    const existe = await this.existePorTiendaId(tiendaId);
    
    if (existe) {
      await this.eliminarPorTiendaId(tiendaId);
    }

    // Crear nueva configuración con los datos importados
    const configuracion = ConfiguracionImpuestosAranceles.reconstruir(
      datos.id,
      tiendaId,
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
      datos.iva_digitales,
      new Date(datos.fecha_creacion),
      new Date()
    );

    await this.guardar(configuracion);
  }

  async optimizarConsultasFiscales(): Promise<void> {
    // Implementación placeholder para optimización
    console.log('Optimizando consultas fiscales...');
  }

  async reindexarConfiguraciones(): Promise<void> {
    // Implementación placeholder para reindexación
    console.log('Reindexando configuraciones...');
  }

  async obtenerMetricasRendimiento(): Promise<{
    consultasPorSegundo: number;
    tiempoRespuestaPromedio: number;
    configuracionesActivas: number;
    erroresRecientes: number;
  }> {
    return {
      consultasPorSegundo: 0,
      tiempoRespuestaPromedio: 0,
      configuracionesActivas: await this.prisma.configuracionImpuestosAranceles.count(),
      erroresRecientes: 0
    };
  }

  async notificarCambiosFiscales(tiendaId: string, cambios: any): Promise<void> {
    // Implementación placeholder para notificaciones
    console.log(`Notificando cambios fiscales para tienda ${tiendaId}:`, cambios);
  }

  async obtenerNotificacionesPendientes(tiendaId: string): Promise<any[]> {
    return [];
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