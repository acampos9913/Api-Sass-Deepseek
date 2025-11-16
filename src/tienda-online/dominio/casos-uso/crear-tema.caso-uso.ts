import { Injectable } from '@nestjs/common';
import { Tema } from '../entidades/tema.entity';
import type { RepositorioTema } from '../interfaces/repositorio-tema.interface';
import { ExcepcionDominio } from '../../../comun/excepciones/excepcion-dominio';

/**
 * Datos requeridos para crear un tema
 */
export interface DatosCrearTema {
  nombre: string;
  descripcion: string | null;
  activo: boolean;
  esPredeterminado: boolean;
  configuracion: Record<string, any>;
  creadorId: string;
  tiendaId: string | null;
}

/**
 * Caso de Uso para crear un nuevo tema
 * Sigue los principios de Domain-Driven Design y Clean Architecture
 */
@Injectable()
export class CrearTemaCasoUso {
  constructor(private readonly repositorioTema: RepositorioTema) {}

  /**
   * Ejecuta el caso de uso para crear un nuevo tema
   * @param datos - Datos necesarios para crear el tema
   * @returns Promise con el tema creado
   */
  async ejecutar(datos: DatosCrearTema): Promise<Tema> {
    // Validar reglas de negocio antes de crear el tema
    await this.validarReglasNegocio(datos);

    // Crear la entidad de dominio
    const id = this.generarId();
    const tema = Tema.crear(
      id,
      datos.nombre,
      datos.descripcion,
      datos.activo,
      datos.esPredeterminado,
      datos.configuracion,
      datos.creadorId,
      datos.tiendaId,
    );

    // Si el tema es activo, desactivar otros temas activos
    if (datos.activo && datos.tiendaId) {
      await this.repositorioTema.desactivarTodosLosTemas(datos.tiendaId, id);
    }

    // Si el tema es predeterminado, quitar predeterminado de otros temas
    if (datos.esPredeterminado && datos.tiendaId) {
      await this.repositorioTema.quitarPredeterminadoDeTodosLosTemas(datos.tiendaId, id);
    }

    // Guardar en el repositorio
    const temaGuardado = await this.repositorioTema.guardar(tema);

    return temaGuardado;
  }

  /**
   * Valida las reglas de negocio antes de crear el tema
   * @param datos - Datos del tema a crear
   * @throws ExcepcionDominio si alguna regla de negocio no se cumple
   */
  private async validarReglasNegocio(datos: DatosCrearTema): Promise<void> {
    // Validar que no exista un tema activo si este será activo
    if (datos.activo && datos.tiendaId) {
      const existeTemaActivo = await this.repositorioTema.existeTemaActivo(datos.tiendaId);
      if (existeTemaActivo && !datos.esPredeterminado) {
        throw ExcepcionDominio.limiteExcedido('tema activo', 1, 1, 'Tema.LimiteTemaActivo');
      }
    }

    // Validar que no exista un tema predeterminado si este será predeterminado
    if (datos.esPredeterminado && datos.tiendaId) {
      const existeTemaPredeterminado = await this.repositorioTema.existeTemaPredeterminado(datos.tiendaId);
      if (existeTemaPredeterminado) {
        throw ExcepcionDominio.limiteExcedido('tema predeterminado', 1, 1, 'Tema.LimiteTemaPredeterminado');
      }
    }

    // Validar que la configuración tenga la estructura básica requerida
    this.validarEstructuraConfiguracion(datos.configuracion);
  }

  /**
   * Valida la estructura básica de la configuración del tema
   * @param configuracion - Configuración a validar
   * @throws ExcepcionDominio si la configuración no tiene la estructura requerida
   */
  private validarEstructuraConfiguracion(configuracion: Record<string, any>): void {
    if (!configuracion.colores || typeof configuracion.colores !== 'object') {
      throw ExcepcionDominio.valorRequerido('sección "colores" en la configuración', 'Tema.ConfiguracionColoresRequerida');
    }

    if (!configuracion.fuentes || typeof configuracion.fuentes !== 'object') {
      throw ExcepcionDominio.valorRequerido('sección "fuentes" en la configuración', 'Tema.ConfiguracionFuentesRequerida');
    }

    if (!configuracion.estilos || typeof configuracion.estilos !== 'object') {
      throw ExcepcionDominio.valorRequerido('sección "estilos" en la configuración', 'Tema.ConfiguracionEstilosRequerida');
    }

    // Validar colores básicos requeridos
    const coloresRequeridos = ['primario', 'secundario', 'texto', 'fondo'];
    for (const color of coloresRequeridos) {
      if (!configuracion.colores[color]) {
        throw ExcepcionDominio.valorRequerido(`color "${color}" en la configuración`, 'Tema.ColorRequerido');
      }
    }

    // Validar fuentes básicas requeridas
    const fuentesRequeridas = ['principal', 'secundaria'];
    for (const fuente of fuentesRequeridas) {
      if (!configuracion.fuentes[fuente]) {
        throw ExcepcionDominio.valorRequerido(`fuente "${fuente}" en la configuración`, 'Tema.FuenteRequerida');
      }
    }
  }

  /**
   * Genera un ID único para el tema
   * @returns ID único generado
   */
  private generarId(): string {
    // Usar nanoid o similar en producción
    // Por ahora usamos un UUID simple para el ejemplo
    return `tema_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}