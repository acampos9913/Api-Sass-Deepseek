import { Injectable } from '@nestjs/common';
import { Pagina } from '../entidades/pagina.entity';
import type { RepositorioPagina } from '../interfaces/repositorio-pagina.interface';
import { ExcepcionDominio } from '../../../comun/excepciones/excepcion-dominio';

/**
 * Datos requeridos para crear una página
 */
export interface DatosCrearPagina {
  titulo: string;
  contenido: string | null;
  slug: string;
  metaTitulo: string | null;
  metaDescripcion: string | null;
  visible: boolean;
  autorId: string;
  tiendaId: string | null;
}

/**
 * Caso de Uso para crear una nueva página
 * Sigue los principios de Domain-Driven Design y Clean Architecture
 */
@Injectable()
export class CrearPaginaCasoUso {
  constructor(private readonly repositorioPagina: RepositorioPagina) {}

  /**
   * Ejecuta el caso de uso para crear una nueva página
   * @param datos - Datos necesarios para crear la página
   * @returns Promise con la página creada
   */
  async ejecutar(datos: DatosCrearPagina): Promise<Pagina> {
    // Validar que el slug no esté en uso
    await this.validarSlugUnico(datos.slug);

    // Crear la entidad de dominio
    const id = this.generarId();
    const pagina = Pagina.crear(
      id,
      datos.titulo,
      datos.contenido,
      datos.slug,
      datos.metaTitulo,
      datos.metaDescripcion,
      datos.visible,
      datos.autorId,
      datos.tiendaId,
    );

    // Guardar en el repositorio
    const paginaGuardada = await this.repositorioPagina.guardar(pagina);

    return paginaGuardada;
  }

  /**
   * Valida que el slug sea único
   * @param slug - Slug a validar
   * @throws ExcepcionDominio si el slug ya está en uso
   */
  private async validarSlugUnico(slug: string): Promise<void> {
    const existe = await this.repositorioPagina.existeConSlug(slug);
    if (existe) {
      throw ExcepcionDominio.duplicado(`página con slug '${slug}'`, 'Pagina.SlugDuplicado');
    }
  }

  /**
   * Genera un ID único para la página
   * @returns ID único generado
   */
  private generarId(): string {
    // Usar nanoid o similar en producción
    // Por ahora usamos un UUID simple para el ejemplo
    return `pag_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}