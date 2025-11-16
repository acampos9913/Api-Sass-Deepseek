import { Injectable, Inject } from '@nestjs/common';
import { CrearCajaCasoUso } from '../../dominio/casos-uso/crear-caja.caso-uso';
import type { RepositorioCaja } from '../../dominio/interfaces/repositorio-caja.interface';
import {
  CrearCajaDto,
  CrearCajaRespuestaDto,
  ListaCajasRespuestaDto,
  FiltrosCajaDto,
  CajaRespuestaDto,
  PaginacionDto,
  AbrirCajaDto,
  CerrarCajaDto,
  RegistrarVentaDto,
  RegistrarRetiroDto,
  ReporteCierreCajaDto,
} from '../dto/crear-caja.dto';
import { Caja, EstadoCaja } from '../../dominio/entidades/caja.entity';

/**
 * Servicio de aplicación para la gestión de cajas
 * Orquesta los casos de uso y adapta los datos entre capas
 */
@Injectable()
export class CajasService {
  constructor(
    private readonly crearCajaCasoUso: CrearCajaCasoUso,
    @Inject('RepositorioCaja')
    private readonly repositorioCaja: RepositorioCaja,
  ) {}

  /**
   * Crea una nueva caja
   * @param crearCajaDto - Datos para crear la caja
   * @returns Respuesta de la operación
   */
  async crearCaja(crearCajaDto: CrearCajaDto): Promise<CrearCajaRespuestaDto> {
    const resultado = await this.crearCajaCasoUso.ejecutar(crearCajaDto);

    // Convertir la entidad a DTO de respuesta si existe
    const data = resultado.data ? await this.mapearCajaARespuestaDto(resultado.data) : null;

    return {
      mensaje: resultado.mensaje,
      data,
      tipo_mensaje: resultado.tipo_mensaje,
      estado_respuesta: resultado.estado_respuesta,
    };
  }

  /**
   * Obtiene una lista de cajas con filtros
   * @param filtros - Filtros de búsqueda
   * @returns Lista de cajas con paginación
   */
  async obtenerCajas(filtros: FiltrosCajaDto): Promise<ListaCajasRespuestaDto> {
    try {
      // Aplicar paginación
      const pagina = filtros.pagina || 1;
      const limite = filtros.limite || 10;
      const skip = (pagina - 1) * limite;

      // Construir filtros para el repositorio
      const filtrosRepositorio = {
        sucursal_id: filtros.sucursal_id,
        estado: filtros.estado as EstadoCaja,
        usuario_apertura_id: filtros.usuario_apertura_id,
        fecha_apertura_desde: filtros.fecha_apertura_desde,
        fecha_apertura_hasta: filtros.fecha_apertura_hasta,
      };

      // Obtener cajas del repositorio
      const cajas = await this.repositorioCaja.buscarConFiltros(filtrosRepositorio);

      // Aplicar paginación manual
      const cajasPaginadas = cajas.slice(skip, skip + limite);

      // Mapear a DTOs de respuesta
      const elementos = await Promise.all(
        cajasPaginadas.map(async caja => 
          this.mapearCajaARespuestaDto(caja)
        )
      );

      // Construir respuesta de paginación
      const paginacion: PaginacionDto = {
        total_elementos: cajas.length,
        total_paginas: Math.ceil(cajas.length / limite),
        pagina_actual: pagina,
        limite: limite,
      };

      return {
        mensaje: 'Lista de cajas obtenida exitosamente',
        data: {
          elementos,
          paginacion,
        },
        tipo_mensaje: 'Exito',
        estado_respuesta: 200,
      };
    } catch (error) {
      console.error('Error en CajasService.obtenerCajas:', error);
      return {
        mensaje: 'Error interno del servidor al obtener cajas',
        data: {
          elementos: [],
          paginacion: {
            total_elementos: 0,
            total_paginas: 0,
            pagina_actual: 1,
            limite: 10,
          },
        },
        tipo_mensaje: 'ErrorServidor',
        estado_respuesta: 500,
      };
    }
  }

  /**
   * Obtiene una caja por su ID
   * @param id - ID de la caja
   * @returns Respuesta con la caja encontrada
   */
  async obtenerCajaPorId(id: string): Promise<CrearCajaRespuestaDto> {
    try {
      const caja = await this.repositorioCaja.buscarPorId(id);

      if (!caja) {
        return {
          mensaje: 'Caja no encontrada',
          data: null,
          tipo_mensaje: 'ErrorCliente',
          estado_respuesta: 404,
        };
      }

      return {
        mensaje: 'Caja encontrada exitosamente',
        data: await this.mapearCajaARespuestaDto(caja),
        tipo_mensaje: 'Exito',
        estado_respuesta: 200,
      };
    } catch (error) {
      console.error('Error en CajasService.obtenerCajaPorId:', error);
      return {
        mensaje: 'Error interno del servidor al obtener la caja',
        data: null,
        tipo_mensaje: 'ErrorServidor',
        estado_respuesta: 500,
      };
    }
  }

  /**
   * Abre una caja
   * @param id - ID de la caja
   * @param abrirCajaDto - Datos para abrir la caja
   * @returns Respuesta de la operación
   */
  async abrirCaja(id: string, abrirCajaDto: AbrirCajaDto): Promise<CrearCajaRespuestaDto> {
    try {
      const caja = await this.repositorioCaja.abrirCaja(
        id,
        abrirCajaDto.usuario_id,
        abrirCajaDto.saldo_inicial
      );

      return {
        mensaje: 'Caja abierta exitosamente',
        data: await this.mapearCajaARespuestaDto(caja),
        tipo_mensaje: 'Exito',
        estado_respuesta: 200,
      };
    } catch (error) {
      console.error('Error en CajasService.abrirCaja:', error);
      
      if (error.message.includes('ya está abierta') || error.message.includes('no está abierta')) {
        return {
          mensaje: error.message,
          data: null,
          tipo_mensaje: 'ErrorCliente',
          estado_respuesta: 409,
        };
      }

      return {
        mensaje: 'Error interno del servidor al abrir la caja',
        data: null,
        tipo_mensaje: 'ErrorServidor',
        estado_respuesta: 500,
      };
    }
  }

  /**
   * Cierra una caja
   * @param id - ID de la caja
   * @param cerrarCajaDto - Datos para cerrar la caja
   * @returns Respuesta de la operación
   */
  async cerrarCaja(id: string, cerrarCajaDto: CerrarCajaDto): Promise<CrearCajaRespuestaDto> {
    try {
      const caja = await this.repositorioCaja.cerrarCaja(id, cerrarCajaDto.usuario_id);

      return {
        mensaje: 'Caja cerrada exitosamente',
        data: await this.mapearCajaARespuestaDto(caja),
        tipo_mensaje: 'Exito',
        estado_respuesta: 200,
      };
    } catch (error) {
      console.error('Error en CajasService.cerrarCaja:', error);
      
      if (error.message.includes('no está abierta')) {
        return {
          mensaje: error.message,
          data: null,
          tipo_mensaje: 'ErrorCliente',
          estado_respuesta: 409,
        };
      }

      return {
        mensaje: 'Error interno del servidor al cerrar la caja',
        data: null,
        tipo_mensaje: 'ErrorServidor',
        estado_respuesta: 500,
      };
    }
  }

  /**
   * Registra una venta en la caja
   * @param id - ID de la caja
   * @param registrarVentaDto - Datos de la venta
   * @returns Respuesta de la operación
   */
  async registrarVenta(id: string, registrarVentaDto: RegistrarVentaDto): Promise<CrearCajaRespuestaDto> {
    try {
      const caja = await this.repositorioCaja.registrarVenta(id, registrarVentaDto.monto_venta);

      return {
        mensaje: 'Venta registrada exitosamente',
        data: await this.mapearCajaARespuestaDto(caja),
        tipo_mensaje: 'Exito',
        estado_respuesta: 200,
      };
    } catch (error) {
      console.error('Error en CajasService.registrarVenta:', error);
      
      if (error.message.includes('No se pueden registrar ventas')) {
        return {
          mensaje: error.message,
          data: null,
          tipo_mensaje: 'ErrorCliente',
          estado_respuesta: 409,
        };
      }

      return {
        mensaje: 'Error interno del servidor al registrar la venta',
        data: null,
        tipo_mensaje: 'ErrorServidor',
        estado_respuesta: 500,
      };
    }
  }

  /**
   * Registra un retiro de la caja
   * @param id - ID de la caja
   * @param registrarRetiroDto - Datos del retiro
   * @returns Respuesta de la operación
   */
  async registrarRetiro(id: string, registrarRetiroDto: RegistrarRetiroDto): Promise<CrearCajaRespuestaDto> {
    try {
      const caja = await this.repositorioCaja.registrarRetiro(id, registrarRetiroDto.monto_retiro);

      return {
        mensaje: 'Retiro registrado exitosamente',
        data: await this.mapearCajaARespuestaDto(caja),
        tipo_mensaje: 'Exito',
        estado_respuesta: 200,
      };
    } catch (error) {
      console.error('Error en CajasService.registrarRetiro:', error);
      
      if (error.message.includes('No se pueden registrar retiros') || error.message.includes('Saldo insuficiente')) {
        return {
          mensaje: error.message,
          data: null,
          tipo_mensaje: 'ErrorCliente',
          estado_respuesta: 409,
        };
      }

      return {
        mensaje: 'Error interno del servidor al registrar el retiro',
        data: null,
        tipo_mensaje: 'ErrorServidor',
        estado_respuesta: 500,
      };
    }
  }

  /**
   * Suspende una caja temporalmente
   * @param id - ID de la caja
   * @returns Respuesta de la operación
   */
  async suspenderCaja(id: string): Promise<CrearCajaRespuestaDto> {
    try {
      const caja = await this.repositorioCaja.suspenderCaja(id);

      return {
        mensaje: 'Caja suspendida exitosamente',
        data: await this.mapearCajaARespuestaDto(caja),
        tipo_mensaje: 'Exito',
        estado_respuesta: 200,
      };
    } catch (error) {
      console.error('Error en CajasService.suspenderCaja:', error);
      
      if (error.message.includes('Solo se pueden suspender cajas abiertas')) {
        return {
          mensaje: error.message,
          data: null,
          tipo_mensaje: 'ErrorCliente',
          estado_respuesta: 409,
        };
      }

      return {
        mensaje: 'Error interno del servidor al suspender la caja',
        data: null,
        tipo_mensaje: 'ErrorServidor',
        estado_respuesta: 500,
      };
    }
  }

  /**
   * Reanuda una caja suspendida
   * @param id - ID de la caja
   * @returns Respuesta de la operación
   */
  async reanudarCaja(id: string): Promise<CrearCajaRespuestaDto> {
    try {
      const caja = await this.repositorioCaja.reanudarCaja(id);

      return {
        mensaje: 'Caja reanudada exitosamente',
        data: await this.mapearCajaARespuestaDto(caja),
        tipo_mensaje: 'Exito',
        estado_respuesta: 200,
      };
    } catch (error) {
      console.error('Error en CajasService.reanudarCaja:', error);
      
      if (error.message.includes('Solo se pueden reanudar cajas suspendidas')) {
        return {
          mensaje: error.message,
          data: null,
          tipo_mensaje: 'ErrorCliente',
          estado_respuesta: 409,
        };
      }

      return {
        mensaje: 'Error interno del servidor al reanudar la caja',
        data: null,
        tipo_mensaje: 'ErrorServidor',
        estado_respuesta: 500,
      };
    }
  }

  /**
   * Obtiene cajas por sucursal
   * @param sucursal_id - ID de la sucursal
   * @returns Lista de cajas de la sucursal
   */
  async obtenerCajasPorSucursal(sucursal_id: string): Promise<ListaCajasRespuestaDto> {
    try {
      const cajas = await this.repositorioCaja.buscarPorSucursal(sucursal_id);
      
      const elementos = await Promise.all(
        cajas.map(caja => this.mapearCajaARespuestaDto(caja))
      );

      const paginacion: PaginacionDto = {
        total_elementos: elementos.length,
        total_paginas: 1,
        pagina_actual: 1,
        limite: elementos.length,
      };

      return {
        mensaje: 'Lista de cajas por sucursal obtenida exitosamente',
        data: {
          elementos,
          paginacion,
        },
        tipo_mensaje: 'Exito',
        estado_respuesta: 200,
      };
    } catch (error) {
      console.error('Error en CajasService.obtenerCajasPorSucursal:', error);
      return {
        mensaje: 'Error interno del servidor al obtener cajas por sucursal',
        data: {
          elementos: [],
          paginacion: {
            total_elementos: 0,
            total_paginas: 0,
            pagina_actual: 1,
            limite: 0,
          },
        },
        tipo_mensaje: 'ErrorServidor',
        estado_respuesta: 500,
      };
    }
  }

  /**
   * Obtiene cajas abiertas por sucursal
   * @param sucursal_id - ID de la sucursal
   * @returns Lista de cajas abiertas de la sucursal
   */
  async obtenerCajasAbiertasPorSucursal(sucursal_id: string): Promise<ListaCajasRespuestaDto> {
    try {
      const cajas = await this.repositorioCaja.buscarAbiertasPorSucursal(sucursal_id);
      
      const elementos = await Promise.all(
        cajas.map(caja => this.mapearCajaARespuestaDto(caja))
      );

      const paginacion: PaginacionDto = {
        total_elementos: elementos.length,
        total_paginas: 1,
        pagina_actual: 1,
        limite: elementos.length,
      };

      return {
        mensaje: 'Lista de cajas abiertas por sucursal obtenida exitosamente',
        data: {
          elementos,
          paginacion,
        },
        tipo_mensaje: 'Exito',
        estado_respuesta: 200,
      };
    } catch (error) {
      console.error('Error en CajasService.obtenerCajasAbiertasPorSucursal:', error);
      return {
        mensaje: 'Error interno del servidor al obtener cajas abiertas por sucursal',
        data: {
          elementos: [],
          paginacion: {
            total_elementos: 0,
            total_paginas: 0,
            pagina_actual: 1,
            limite: 0,
          },
        },
        tipo_mensaje: 'ErrorServidor',
        estado_respuesta: 500,
      };
    }
  }

  /**
   * Obtiene estadísticas de cajas por sucursal
   * @param sucursal_id - ID de la sucursal
   * @returns Estadísticas de las cajas
   */
  async obtenerEstadisticasPorSucursal(sucursal_id: string) {
    try {
      const estadisticas = await this.repositorioCaja.obtenerEstadisticasPorSucursal(sucursal_id);

      return {
        mensaje: 'Estadísticas obtenidas exitosamente',
        data: estadisticas,
        tipo_mensaje: 'Exito',
        estado_respuesta: 200,
      };
    } catch (error) {
      console.error('Error en CajasService.obtenerEstadisticasPorSucursal:', error);
      return {
        mensaje: 'Error interno del servidor al obtener estadísticas',
        data: null,
        tipo_mensaje: 'ErrorServidor',
        estado_respuesta: 500,
      };
    }
  }

  /**
   * Obtiene el reporte de cierre de caja
   * @param caja_id - ID de la caja
   * @returns Reporte de cierre
   */
  async obtenerReporteCierre(caja_id: string) {
    try {
      const reporte = await this.repositorioCaja.obtenerReporteCierre(caja_id);

      return {
        mensaje: 'Reporte de cierre obtenido exitosamente',
        data: reporte,
        tipo_mensaje: 'Exito',
        estado_respuesta: 200,
      };
    } catch (error) {
      console.error('Error en CajasService.obtenerReporteCierre:', error);
      return {
        mensaje: 'Error interno del servidor al obtener el reporte de cierre',
        data: null,
        tipo_mensaje: 'ErrorServidor',
        estado_respuesta: 500,
      };
    }
  }

  /**
   * Obtiene el historial de operaciones de una caja
   * @param caja_id - ID de la caja
   * @param fecha_desde - Fecha desde
   * @param fecha_hasta - Fecha hasta
   * @returns Historial de operaciones
   */
  async obtenerHistorialOperaciones(caja_id: string, fecha_desde?: Date, fecha_hasta?: Date) {
    try {
      const historial = await this.repositorioCaja.obtenerHistorialOperaciones(
        caja_id,
        fecha_desde,
        fecha_hasta
      );

      return {
        mensaje: 'Historial de operaciones obtenido exitosamente',
        data: historial,
        tipo_mensaje: 'Exito',
        estado_respuesta: 200,
      };
    } catch (error) {
      console.error('Error en CajasService.obtenerHistorialOperaciones:', error);
      return {
        mensaje: 'Error interno del servidor al obtener el historial de operaciones',
        data: [],
        tipo_mensaje: 'ErrorServidor',
        estado_respuesta: 500,
      };
    }
  }

  /**
   * Mapea una entidad Caja a un DTO de respuesta
   * @param caja - Entidad de caja
   * @returns DTO de respuesta de caja
   */
  private async mapearCajaARespuestaDto(caja: Caja): Promise<CajaRespuestaDto> {
    // En una implementación real, estos valores vendrían del repositorio
    const estadisticas = await this.repositorioCaja.obtenerEstadisticasPorSucursal(caja.sucursal_id);
    
    return {
      id: caja.id,
      sucursal_id: caja.sucursal_id,
      nombre: caja.nombre,
      estado: caja.estado,
      saldo_inicial: caja.saldo_inicial,
      saldo_actual: caja.saldo_actual,
      fecha_apertura: caja.fecha_apertura,
      fecha_cierre: caja.fecha_cierre,
      usuario_apertura_id: caja.usuario_apertura_id,
      usuario_cierre_id: caja.usuario_cierre_id,
      fecha_creacion: caja.fecha_creacion,
      fecha_actualizacion: caja.fecha_actualizacion,
      cantidad_tickets: caja.tickets?.length || 0,
      total_ventas_dia: caja.calcularTotalVentasDelDia(),
      diferencia: caja.calcularDiferencia(),
    };
  }
}