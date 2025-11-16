import { Injectable, Inject } from '@nestjs/common';
import { Caja, EstadoCaja } from '../entidades/caja.entity';
import type { RepositorioCaja } from '../interfaces/repositorio-caja.interface';
import type { RepositorioSucursal } from '../interfaces/repositorio-sucursal.interface';

/**
 * DTO para la creación de cajas
 */
export interface CrearCajaDto {
  sucursal_id: string;
  nombre: string;
  saldo_inicial: number;
}

/**
 * Respuesta del caso de uso
 */
export interface CrearCajaRespuesta {
  mensaje: string;
  data: Caja | null;
  tipo_mensaje: 'Exito' | 'ErrorCliente' | 'ErrorServidor';
  estado_respuesta: number;
}

/**
 * Caso de uso para crear una nueva caja
 * Implementa las reglas de negocio para la creación de cajas
 */
@Injectable()
export class CrearCajaCasoUso {
  constructor(
    @Inject('RepositorioCaja')
    private readonly repositorioCaja: RepositorioCaja,
    @Inject('RepositorioSucursal')
    private readonly repositorioSucursal: RepositorioSucursal,
  ) {}

  /**
   * Ejecuta el caso de uso para crear una caja
   * @param datos - Datos para crear la caja
   * @returns Promise con la respuesta del caso de uso
   */
  async ejecutar(datos: CrearCajaDto): Promise<CrearCajaRespuesta> {
    try {
      // Validar datos de entrada
      const erroresValidacion = this.validarDatosEntrada(datos);
      if (erroresValidacion.length > 0) {
        return {
          mensaje: `Datos de entrada inválidos: ${erroresValidacion.join(', ')}`,
          data: null,
          tipo_mensaje: 'ErrorCliente',
          estado_respuesta: 400,
        };
      }

      // Verificar que la sucursal existe y está activa
      const sucursal = await this.repositorioSucursal.buscarPorId(datos.sucursal_id);
      if (!sucursal) {
        return {
          mensaje: 'La sucursal especificada no existe',
          data: null,
          tipo_mensaje: 'ErrorCliente',
          estado_respuesta: 404,
        };
      }

      if (!sucursal.activo) {
        return {
          mensaje: 'No se puede crear una caja en una sucursal inactiva',
          data: null,
          tipo_mensaje: 'ErrorCliente',
          estado_respuesta: 409,
        };
      }

      // Verificar si ya existe una caja con el mismo nombre en la misma sucursal
      const existeCaja = await this.repositorioCaja.existeConNombre(
        datos.nombre,
        datos.sucursal_id,
      );

      if (existeCaja) {
        return {
          mensaje: 'Ya existe una caja con el mismo nombre en esta sucursal',
          data: null,
          tipo_mensaje: 'ErrorCliente',
          estado_respuesta: 409,
        };
      }

      // Verificar límite de cajas por sucursal
      const puedeCrearCaja = await this.puedeCrearCaja(datos.sucursal_id);
      if (!puedeCrearCaja) {
        return {
          mensaje: 'Se ha alcanzado el límite máximo de cajas para esta sucursal',
          data: null,
          tipo_mensaje: 'ErrorCliente',
          estado_respuesta: 409,
        };
      }

      // Crear la entidad de caja
      const fechaActual = new Date();
      const caja = new Caja(
        this.generarIdUnico(),
        datos.sucursal_id,
        datos.nombre,
        EstadoCaja.CERRADA,
        datos.saldo_inicial,
        datos.saldo_inicial, // saldo_actual igual al inicial
        fechaActual,
        fechaActual,
      );

      // Guardar la caja
      const cajaGuardada = await this.repositorioCaja.guardar(caja);

      return {
        mensaje: 'Caja creada exitosamente',
        data: cajaGuardada,
        tipo_mensaje: 'Exito',
        estado_respuesta: 201,
      };
    } catch (error) {
      // Registrar el error para monitoreo
      console.error('Error en CrearCajaCasoUso:', error);

      return {
        mensaje: 'Error interno del servidor al crear la caja',
        data: null,
        tipo_mensaje: 'ErrorServidor',
        estado_respuesta: 500,
      };
    }
  }

  /**
   * Valida los datos de entrada
   * @param datos - Datos a validar
   * @returns Array de mensajes de error, vacío si no hay errores
   */
  private validarDatosEntrada(datos: CrearCajaDto): string[] {
    const errores: string[] = [];

    if (!datos.sucursal_id || datos.sucursal_id.trim().length === 0) {
      errores.push('El ID de la sucursal es requerido');
    }

    if (!datos.nombre || datos.nombre.trim().length === 0) {
      errores.push('El nombre de la caja es requerido');
    } else if (datos.nombre.length > 50) {
      errores.push('El nombre no puede exceder 50 caracteres');
    } else if (datos.nombre.length < 2) {
      errores.push('El nombre debe tener al menos 2 caracteres');
    }

    if (datos.saldo_inicial === undefined || datos.saldo_inicial === null) {
      errores.push('El saldo inicial es requerido');
    } else if (datos.saldo_inicial < 0) {
      errores.push('El saldo inicial no puede ser negativo');
    } else if (datos.saldo_inicial > 1000000) {
      errores.push('El saldo inicial no puede exceder 1,000,000');
    }

    return errores;
  }

  /**
   * Genera un ID único para la caja
   * @returns ID único generado
   */
  private generarIdUnico(): string {
    return `caja_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Verifica si se puede crear una nueva caja en la sucursal
   * @param sucursal_id - ID de la sucursal
   * @returns Promise con boolean indicando si se puede crear
   */
  private async puedeCrearCaja(sucursal_id: string): Promise<boolean> {
    try {
      const cajasExistentes = await this.repositorioCaja.buscarPorSucursal(sucursal_id);
      const limiteCajas = await this.obtenerLimiteCajas(sucursal_id);
      
      return cajasExistentes.length < limiteCajas;
    } catch (error) {
      console.error('Error al verificar límite de cajas:', error);
      return false;
    }
  }

  /**
   * Obtiene el límite de cajas por sucursal según el plan
   * @param sucursal_id - ID de la sucursal
   * @returns Promise con el límite de cajas permitidas
   */
  private async obtenerLimiteCajas(sucursal_id: string): Promise<number> {
    // En una implementación real, aquí se consultaría el plan de la tienda
    // Por ahora, retornamos un límite fijo como placeholder
    return 5;
  }

  /**
   * Valida permisos del usuario para crear cajas
   * @param usuario_id - ID del usuario
   * @param sucursal_id - ID de la sucursal
   * @returns Promise con boolean indicando si tiene permisos
   */
  async validarPermisosUsuario(usuario_id: string, sucursal_id: string): Promise<boolean> {
    // En una implementación real, aquí se validarían los permisos del usuario
    // contra la sucursal específica
    // Por ahora, retornamos true como placeholder
    return true;
  }
}