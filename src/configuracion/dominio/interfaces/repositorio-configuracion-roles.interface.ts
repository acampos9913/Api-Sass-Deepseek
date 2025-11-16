/**
 * Interfaz para el repositorio de configuración de roles
 */
export interface RepositorioConfiguracionRoles {
  /**
   * Crea un rol personalizado
   */
  crearRolPersonalizado(
    tiendaId: string,
    rol: {
      id: string;
      nombre: string;
      descripcion: string;
      permisos: string[];
      restricciones: string[];
    },
  ): Promise<void>;

  /**
   * Actualiza un rol personalizado
   */
  actualizarRolPersonalizado(
    tiendaId: string,
    rolId: string,
    datos: {
      nombre?: string;
      descripcion?: string;
      permisos?: string[];
      restricciones?: string[];
    },
  ): Promise<void>;

  /**
   * Elimina un rol personalizado
   */
  eliminarRolPersonalizado(tiendaId: string, rolId: string): Promise<void>;

  /**
   * Obtiene todos los roles disponibles
   */
  obtenerRoles(tiendaId: string): Promise<{
    rolesPredeterminados: Array<{
      nombre: string;
      descripcion: string;
      permisos: string[];
      restricciones: string[];
      gestionadoPorSistema: boolean;
      numeroEmpleados: number;
    }>;
    rolesPersonalizados: Array<{
      id: string;
      nombre: string;
      descripcion: string;
      permisos: string[];
      restricciones: string[];
      numeroEmpleados: number;
      fechaCreacion: Date;
    }>;
  }>;

  /**
   * Verifica si un nombre de rol ya existe
   */
  existeNombreRol(tiendaId: string, nombre: string, rolIdExcluir?: string): Promise<boolean>;

  /**
   * Obtiene la configuración de seguridad
   */
  obtenerConfiguracionSeguridad(tiendaId: string): Promise<{
    politicasUsuarios: {
      autenticacionDosPasosObligatoria: boolean;
      longitudMinimaContrasena: number;
      expiracionContrasenaDias: number;
      maximoIntentosInicioSesion: number;
      bloqueoTemporalMinutos: number;
      requiereVerificacionEmail: boolean;
      politicasContrasena: string[];
    };
    configuracionSeguridad: {
      registroActividad: {
        habilitado: boolean;
        retencionDias: number;
        eventosRegistrados: string[];
      };
      dispositivosConectados: {
        maximoDispositivosPorUsuario: number;
        sesionesConcurrentes: boolean;
        notificacionesNuevoDispositivo: boolean;
      };
      colaboradores: {
        codigoColaborador: string;
        solicitudesPendientes: number;
        maximoColaboradores: number;
      };
    };
  }>;

  /**
   * Actualiza la configuración de seguridad
   */
  actualizarConfiguracionSeguridad(
    tiendaId: string,
    datos: {
      politicasUsuarios?: {
        autenticacionDosPasosObligatoria?: boolean;
        longitudMinimaContrasena?: number;
        expiracionContrasenaDias?: number;
        maximoIntentosInicioSesion?: number;
        bloqueoTemporalMinutos?: number;
        requiereVerificacionEmail?: boolean;
        politicasContrasena?: string[];
      };
      configuracionSeguridad?: {
        registroActividad?: {
          habilitado?: boolean;
          retencionDias?: number;
          eventosRegistrados?: string[];
        };
        dispositivosConectados?: {
          maximoDispositivosPorUsuario?: number;
          sesionesConcurrentes?: boolean;
          notificacionesNuevoDispositivo?: boolean;
        };
        colaboradores?: {
          codigoColaborador?: string;
          solicitudesPendientes?: number;
          maximoColaboradores?: number;
        };
      };
    },
  ): Promise<void>;

  /**
   * Genera un nuevo código de colaborador
   */
  generarCodigoColaborador(tiendaId: string): Promise<string>;

  /**
   * Obtiene las solicitudes de colaborador pendientes
   */
  obtenerSolicitudesColaborador(tiendaId: string): Promise<Array<{
    id: string;
    email: string;
    nombre: string;
    fechaSolicitud: Date;
    estado: 'pendiente' | 'aprobada' | 'rechazada';
  }>>;

  /**
   * Aprueba una solicitud de colaborador
   */
  aprobarSolicitudColaborador(tiendaId: string, solicitudId: string): Promise<void>;

  /**
   * Rechaza una solicitud de colaborador
   */
  rechazarSolicitudColaborador(tiendaId: string, solicitudId: string): Promise<void>;

  /**
   * Obtiene el registro de actividad de usuarios
   */
  obtenerRegistroActividad(
    tiendaId: string,
    filtros?: {
      evento?: string;
      recurso?: string;
      fechaInicio?: Date;
      fechaFin?: Date;
      usuario?: string;
    },
  ): Promise<Array<{
    id: string;
    evento: string;
    recurso: string;
    fecha: Date;
    usuario: string;
    detalles: string;
  }>>;

  /**
   * Exporta el registro de actividad
   */
  exportarRegistroActividad(
    tiendaId: string,
    filtros?: {
      evento?: string;
      recurso?: string;
      fechaInicio?: Date;
      fechaFin?: Date;
      usuario?: string;
    },
  ): Promise<string>;
}