import { ConfiguracionPagos } from '../entidades/configuracion-pagos.entity';
import {
  CriteriosBusquedaPagosDto
} from '../../aplicacion/dto/configuracion-pagos.dto';

/**
 * Interfaz para el repositorio de configuración de pagos
 * Define las operaciones de persistencia siguiendo el patrón Repository
 */
export interface RepositorioConfiguracionPagos {
  // Operaciones básicas CRUD
  buscarPorTiendaId(tiendaId: string): Promise<ConfiguracionPagos | null>;
  buscarPorId(id: string): Promise<ConfiguracionPagos | null>;
  guardar(configuracion: ConfiguracionPagos): Promise<void>;
  actualizar(configuracion: ConfiguracionPagos): Promise<void>;
  eliminarPorTiendaId(tiendaId: string): Promise<void>;
  eliminarPorId(id: string): Promise<void>;
  existePorTiendaId(tiendaId: string): Promise<boolean>;

  // Búsquedas específicas
  buscarPorCriterios(criterios: CriteriosBusquedaPagosDto): Promise<ConfiguracionPagos[]>;

  // Listado y estadísticas
  listarTodos(pagina: number, limite: number): Promise<{ configuraciones: ConfiguracionPagos[]; total: number }>;
  obtenerEstadisticas(): Promise<any>;

  // Operaciones de backup y restauración
  realizarBackup(): Promise<any>;
  restaurarDesdeBackup(backup: any): Promise<void>;
}