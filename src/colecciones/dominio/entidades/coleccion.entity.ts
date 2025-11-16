/**
 * Entidad de Colección que representa una colección de productos en el sistema
 * Sigue los principios de Domain-Driven Design y Arquitectura Limpia
 * Incluye funcionalidades para colecciones manuales y automáticas
 */
export class Coleccion {
  constructor(
    public readonly id: string,
    public readonly nombre: string,
    public readonly descripcion: string | null,
    public readonly slug: string,
    public readonly imagenUrl: string | null,
    public readonly estado: 'ACTIVA' | 'ARCHIVADA' | 'ELIMINADA',
    public readonly tipo: 'MANUAL' | 'AUTOMATICA',
    public readonly reglas: any | null, // Reglas para colecciones automáticas
    public readonly visibleTiendaOnline: boolean,
    public readonly visiblePointOfSale: boolean,
    public readonly fechaCreacion: Date,
    public readonly fechaActualizacion: Date,
    public readonly tiendaId: string,
    public readonly creadorId: string,
  ) {}

  /**
   * Verifica si la colección está activa y visible
   */
  estaActiva(): boolean {
    return this.estado === 'ACTIVA';
  }

  /**
   * Verifica si la colección es automática
   */
  esAutomatica(): boolean {
    return this.tipo === 'AUTOMATICA';
  }

  /**
   * Verifica si la colección es manual
   */
  esManual(): boolean {
    return this.tipo === 'MANUAL';
  }

  /**
   * Cambia el estado de la colección
   */
  cambiarEstado(nuevoEstado: 'ACTIVA' | 'ARCHIVADA' | 'ELIMINADA'): Coleccion {
    return new Coleccion(
      this.id,
      this.nombre,
      this.descripcion,
      this.slug,
      this.imagenUrl,
      nuevoEstado,
      this.tipo,
      this.reglas,
      this.visibleTiendaOnline,
      this.visiblePointOfSale,
      this.fechaCreacion,
      new Date(),
      this.tiendaId,
      this.creadorId,
    );
  }

  /**
   * Actualiza la visibilidad por canal de la colección
   */
  actualizarVisibilidadCanales(tiendaOnline: boolean, pointOfSale: boolean): Coleccion {
    return new Coleccion(
      this.id,
      this.nombre,
      this.descripcion,
      this.slug,
      this.imagenUrl,
      this.estado,
      this.tipo,
      this.reglas,
      tiendaOnline,
      pointOfSale,
      this.fechaCreacion,
      new Date(),
      this.tiendaId,
      this.creadorId,
    );
  }

  /**
   * Actualiza las reglas de la colección (solo para colecciones automáticas)
   */
  actualizarReglas(reglas: any): Coleccion {
    if (this.tipo !== 'AUTOMATICA') {
      throw new Error('Solo las colecciones automáticas pueden tener reglas');
    }

    return new Coleccion(
      this.id,
      this.nombre,
      this.descripcion,
      this.slug,
      this.imagenUrl,
      this.estado,
      this.tipo,
      reglas,
      this.visibleTiendaOnline,
      this.visiblePointOfSale,
      this.fechaCreacion,
      new Date(),
      this.tiendaId,
      this.creadorId,
    );
  }

  /**
   * Verifica si la colección puede ser archivada
   */
  puedeArchivar(): boolean {
    return this.estado === 'ACTIVA';
  }

  /**
   * Verifica si la colección puede ser eliminada
   */
  puedeEliminar(): boolean {
    return this.estado !== 'ELIMINADA';
  }

  /**
   * Verifica si la colección está visible en algún canal
   */
  estaVisibleEnAlgunCanal(): boolean {
    return this.visibleTiendaOnline || this.visiblePointOfSale;
  }

  /**
   * Genera un slug a partir del nombre
   */
  static generarSlug(nombre: string): string {
    return nombre
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }

  /**
   * Valida las reglas para colecciones automáticas
   */
  validarReglas(): boolean {
    if (this.tipo !== 'AUTOMATICA' || !this.reglas) {
      return true;
    }

    // Validar estructura básica de reglas
    const reglas = this.reglas;
    if (!Array.isArray(reglas.condiciones)) {
      return false;
    }

    // Validar cada condición
    for (const condicion of reglas.condiciones) {
      if (!condicion.campo || !condicion.operador || condicion.valor === undefined) {
        return false;
      }

      // Validar campos permitidos
      const camposPermitidos = ['titulo', 'precio', 'categoria', 'tags', 'proveedor', 'inventario'];
      if (!camposPermitidos.includes(condicion.campo)) {
        return false;
      }

      // Validar operadores permitidos
      const operadoresPermitidos = ['equals', 'not_equals', 'contains', 'not_contains', 'greater_than', 'less_than'];
      if (!operadoresPermitidos.includes(condicion.operador)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Duplica la colección creando una nueva con datos similares
   */
  duplicar(): Coleccion {
    const nuevoId = `col-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const fechaActual = new Date();
    const nuevoSlug = `${this.slug}-copia-${Date.now()}`;
    
    return new Coleccion(
      nuevoId,
      `${this.nombre} (Copia)`,
      this.descripcion,
      nuevoSlug,
      this.imagenUrl,
      'ACTIVA',
      this.tipo,
      this.reglas ? JSON.parse(JSON.stringify(this.reglas)) : null,
      this.visibleTiendaOnline,
      this.visiblePointOfSale,
      fechaActual,
      fechaActual,
      this.tiendaId,
      this.creadorId,
    );
  }
}