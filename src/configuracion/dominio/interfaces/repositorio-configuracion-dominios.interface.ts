import { ConfiguracionDominios } from '../entidades/configuracion-dominios.entity';
import { DominioDto } from '../../aplicacion/dto/configuracion-dominios.dto';

/**
 * Interfaz del repositorio para Configuración de Dominios
 * Define los contratos que deben cumplir las implementaciones de repositorio
 */
export interface RepositorioConfiguracionDominios {
  /**
   * Encontrar configuración de dominios por ID de tienda
   */
  encontrarPorTiendaId(tiendaId: string): Promise<ConfiguracionDominios | null>;

  /**
   * Encontrar configuración de dominios por ID
   */
  encontrarPorId(id: string): Promise<ConfiguracionDominios | null>;

  /**
   * Guardar configuración de dominios (crear o actualizar)
   */
  guardar(configuracion: ConfiguracionDominios): Promise<ConfiguracionDominios>;

  /**
   * Crear nueva configuración de dominios
   */
  crear(configuracion: ConfiguracionDominios): Promise<ConfiguracionDominios>;

  /**
   * Actualizar configuración de dominios existente
   */
  actualizar(configuracion: ConfiguracionDominios): Promise<ConfiguracionDominios>;

  /**
   * Eliminar configuración de dominios
   */
  eliminar(id: string): Promise<void>;

  /**
   * Verificar si existe configuración para una tienda
   */
  existePorTiendaId(tiendaId: string): Promise<boolean>;

  /**
   * Encontrar dominio específico por nombre
   */
  encontrarDominioPorNombre(tiendaId: string, nombreDominio: string): Promise<DominioDto | null>;

  /**
   * Encontrar dominios por tipo
   */
  encontrarDominiosPorTipo(tiendaId: string, tipo: string): Promise<DominioDto[]>;

  /**
   * Encontrar dominios conectados
   */
  encontrarDominiosConectados(tiendaId: string): Promise<DominioDto[]>;

  /**
   * Contar dominios por tienda
   */
  contarDominiosPorTienda(tiendaId: string): Promise<number>;
}