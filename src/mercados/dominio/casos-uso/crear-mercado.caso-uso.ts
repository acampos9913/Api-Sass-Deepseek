import { Inject, Injectable } from '@nestjs/common';
import { Mercado } from '../entidades/mercado.entity';
import { EstadoMercado } from '../enums/estado-mercado.enum';
import type { RepositorioMercado } from '../interfaces/repositorio-mercado.interface';

/**
 * Caso de uso para crear un nuevo mercado en el sistema
 * Contiene la lógica de negocio específica para la creación de mercados
 */
@Injectable()
export class CrearMercadoCasoUso {
  constructor(
    @Inject('RepositorioMercado')
    private readonly repositorioMercado: RepositorioMercado,
  ) {}

  /**
   * Ejecuta el caso de uso para crear un mercado
   * @param datosMercado Datos del mercado a crear
   * @returns El mercado creado
   */
  async ejecutar(datosMercado: {
    nombre: string;
    codigo: string;
    moneda: string;
    idioma: string;
    zonaHoraria: string;
    estado?: EstadoMercado;
    activo?: boolean;
    tiendaId?: string | null;
    configuracion?: Record<string, any>;
  }): Promise<Mercado> {
    // Validar que el código no esté duplicado
    const codigoExistente = await this.repositorioMercado.existeCodigo(datosMercado.codigo);
    if (codigoExistente) {
      throw new Error('Ya existe un mercado con este código');
    }

    // Validar que la tienda exista (en una implementación real, validaríamos con el repositorio de tiendas)
    // Por ahora asumimos que la tiendaId es válida si se proporciona

    // Crear la entidad de mercado
    const fechaActual = new Date();
    const mercado = new Mercado(
      this.generarIdUnico(),
      datosMercado.nombre,
      datosMercado.codigo,
      datosMercado.moneda,
      datosMercado.idioma,
      datosMercado.zonaHoraria,
      datosMercado.estado || EstadoMercado.EN_CONFIGURACION,
      datosMercado.activo ?? true,
      fechaActual,
      fechaActual,
      datosMercado.tiendaId || null,
      datosMercado.configuracion || null,
    );

    // Validar la entidad
    if (!mercado.validar()) {
      throw new Error('Los datos del mercado no son válidos');
    }

    if (!mercado.validarCodigo()) {
      throw new Error('El formato del código no es válido');
    }

    if (!mercado.validarMoneda()) {
      throw new Error('La moneda especificada no es válida');
    }

    if (!mercado.validarIdioma()) {
      throw new Error('El idioma especificado no es válido');
    }

    if (!mercado.validarZonaHoraria()) {
      throw new Error('La zona horaria especificada no es válida');
    }

    if (!mercado.validarConfiguracion()) {
      throw new Error('La configuración del mercado no es válida');
    }

    // Persistir el mercado
    await this.repositorioMercado.crear({
      id: mercado.id,
      nombre: mercado.nombre,
      codigo: mercado.codigo,
      moneda: mercado.moneda,
      idioma: mercado.idioma,
      zonaHoraria: mercado.zonaHoraria,
      estado: mercado.estado,
      activo: mercado.activo,
      fechaCreacion: mercado.fechaCreacion,
      fechaActualizacion: mercado.fechaActualizacion,
      tiendaId: mercado.tiendaId,
      configuracion: mercado.configuracion,
    });

    return mercado;
  }

  /**
   * Genera un ID único para el mercado
   * @returns ID único generado
   */
  private generarIdUnico(): string {
    // En una implementación real, usaríamos una librería como nanoid
    // Por ahora usamos un timestamp + random para simular unicidad
    return `mercado_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}