import { Injectable, Inject } from '@nestjs/common';
import { Sucursal } from '../entidades/sucursal.entity';
import type { RepositorioSucursal } from '../interfaces/repositorio-sucursal.interface';

/**
 * DTO para la creación de sucursales
 */
export interface CrearSucursalDto {
  nombre: string;
  direccion: string;
  ciudad: string;
  provincia: string;
  codigo_postal: string;
  pais: string;
  telefono?: string;
  email?: string;
  tienda_id: string;
}

/**
 * Respuesta del caso de uso
 */
export interface CrearSucursalRespuesta {
  mensaje: string;
  data: Sucursal | null;
  tipo_mensaje: 'Exito' | 'ErrorCliente' | 'ErrorServidor';
  estado_respuesta: number;
}

/**
 * Caso de uso para crear una nueva sucursal
 * Implementa las reglas de negocio para la creación de sucursales
 */
@Injectable()
export class CrearSucursalCasoUso {
  constructor(
    @Inject('RepositorioSucursal')
    private readonly repositorioSucursal: RepositorioSucursal,
  ) {}

  /**
   * Ejecuta el caso de uso para crear una sucursal
   * @param datos - Datos para crear la sucursal
   * @returns Promise con la respuesta del caso de uso
   */
  async ejecutar(datos: CrearSucursalDto): Promise<CrearSucursalRespuesta> {
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

      // Verificar si ya existe una sucursal con el mismo nombre en la misma tienda
      const existeSucursal = await this.repositorioSucursal.existeConNombre(
        datos.nombre,
        datos.tienda_id,
      );

      if (existeSucursal) {
        return {
          mensaje: 'Ya existe una sucursal con el mismo nombre en esta tienda',
          data: null,
          tipo_mensaje: 'ErrorCliente',
          estado_respuesta: 409,
        };
      }

      // Crear la entidad de sucursal
      const fechaActual = new Date();
      const sucursal = new Sucursal(
        this.generarIdUnico(),
        datos.nombre,
        datos.direccion,
        datos.ciudad,
        datos.provincia,
        datos.codigo_postal,
        datos.pais,
        true, // activa por defecto
        fechaActual,
        fechaActual,
        datos.tienda_id,
        datos.telefono,
        datos.email,
      );

      // Validar la entidad
      if (!sucursal.validarInformacion()) {
        return {
          mensaje: 'La información de la sucursal no es válida',
          data: null,
          tipo_mensaje: 'ErrorCliente',
          estado_respuesta: 400,
        };
      }

      // Guardar la sucursal
      const sucursalGuardada = await this.repositorioSucursal.guardar(sucursal);

      return {
        mensaje: 'Sucursal creada exitosamente',
        data: sucursalGuardada,
        tipo_mensaje: 'Exito',
        estado_respuesta: 201,
      };
    } catch (error) {
      // Registrar el error para monitoreo
      console.error('Error en CrearSucursalCasoUso:', error);

      return {
        mensaje: 'Error interno del servidor al crear la sucursal',
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
  private validarDatosEntrada(datos: CrearSucursalDto): string[] {
    const errores: string[] = [];

    if (!datos.nombre || datos.nombre.trim().length === 0) {
      errores.push('El nombre es requerido');
    } else if (datos.nombre.length > 100) {
      errores.push('El nombre no puede exceder 100 caracteres');
    }

    if (!datos.direccion || datos.direccion.trim().length === 0) {
      errores.push('La dirección es requerida');
    } else if (datos.direccion.length > 200) {
      errores.push('La dirección no puede exceder 200 caracteres');
    }

    if (!datos.ciudad || datos.ciudad.trim().length === 0) {
      errores.push('La ciudad es requerida');
    } else if (datos.ciudad.length > 50) {
      errores.push('La ciudad no puede exceder 50 caracteres');
    }

    if (!datos.provincia || datos.provincia.trim().length === 0) {
      errores.push('La provincia es requerida');
    } else if (datos.provincia.length > 50) {
      errores.push('La provincia no puede exceder 50 caracteres');
    }

    if (!datos.codigo_postal || datos.codigo_postal.trim().length === 0) {
      errores.push('El código postal es requerido');
    } else if (datos.codigo_postal.length > 10) {
      errores.push('El código postal no puede exceder 10 caracteres');
    }

    if (!datos.pais || datos.pais.trim().length === 0) {
      errores.push('El país es requerido');
    } else if (datos.pais.length > 50) {
      errores.push('El país no puede exceder 50 caracteres');
    }

    if (!datos.tienda_id || datos.tienda_id.trim().length === 0) {
      errores.push('El ID de la tienda es requerido');
    }

    if (datos.telefono && datos.telefono.length > 20) {
      errores.push('El teléfono no puede exceder 20 caracteres');
    }

    if (datos.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(datos.email)) {
        errores.push('El formato del email no es válido');
      } else if (datos.email.length > 100) {
        errores.push('El email no puede exceder 100 caracteres');
      }
    }

    return errores;
  }

  /**
   * Genera un ID único para la sucursal
   * @returns ID único generado
   */
  private generarIdUnico(): string {
    return `suc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Valida permisos del usuario para crear sucursales
   * @param usuario_id - ID del usuario
   * @param tienda_id - ID de la tienda
   * @returns Promise con boolean indicando si tiene permisos
   */
  async validarPermisosUsuario(usuario_id: string, tienda_id: string): Promise<boolean> {
    // En una implementación real, aquí se validarían los permisos del usuario
    // contra la tienda específica
    // Por ahora, retornamos true como placeholder
    return true;
  }

  /**
   * Obtiene límites de sucursales por plan de tienda
   * @param tienda_id - ID de la tienda
   * @returns Promise con el límite de sucursales permitidas
   */
  async obtenerLimiteSucursales(tienda_id: string): Promise<number> {
    // En una implementación real, aquí se consultaría el plan de la tienda
    // Por ahora, retornamos un límite alto como placeholder
    return 10;
  }

  /**
   * Verifica si la tienda puede crear más sucursales
   * @param tienda_id - ID de la tienda
   * @returns Promise con boolean indicando si puede crear más sucursales
   */
  async puedeCrearSucursal(tienda_id: string): Promise<boolean> {
    try {
      const sucursalesExistentes = await this.repositorioSucursal.buscarPorTienda(tienda_id);
      const limiteSucursales = await this.obtenerLimiteSucursales(tienda_id);
      
      return sucursalesExistentes.length < limiteSucursales;
    } catch (error) {
      console.error('Error al verificar límite de sucursales:', error);
      return false;
    }
  }
}