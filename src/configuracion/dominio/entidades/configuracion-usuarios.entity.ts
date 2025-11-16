/**
 * Entidad de Dominio para la Configuración de Usuarios
 * Representa la configuración completa de gestión de usuarios, roles y seguridad
 */
export interface ConfiguracionUsuarios {
  id: string;
  tiendaId: string;
  
  // Configuración de Políticas de Usuarios
  politicasUsuarios: PoliticasUsuarios;
  
  // Configuración de Roles y Permisos
  configuracionRoles: ConfiguracionRoles;
  
  // Configuración de Seguridad
  configuracionSeguridad: ConfiguracionSeguridad;
  
  // Configuración de Colaboradores
  configuracionColaboradores: ConfiguracionColaboradores;
  
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

/**
 * Políticas de Gestión de Usuarios
 */
export interface PoliticasUsuarios {
  autenticacionDosPasosObligatoria: boolean;
  longitudMinimaContrasena: number;
  expiracionContrasenaDias: number;
  maximoIntentosInicioSesion: number;
  bloqueoTemporalMinutos: number;
  requiereVerificacionEmail: boolean;
  politicasContrasena: string[];
}

/**
 * Configuración de Roles y Permisos
 */
export interface ConfiguracionRoles {
  rolesPredeterminados: RolPredeterminado[];
  rolesPersonalizados: RolPersonalizado[];
  permisosDisponibles: string[];
}

/**
 * Rol Predeterminado del Sistema
 */
export interface RolPredeterminado {
  nombre: string;
  descripcion: string;
  permisos: string[];
  restricciones: string[];
  gestionadoPorSistema: boolean;
  numeroEmpleados: number;
}

/**
 * Rol Personalizado Configurado
 */
export interface RolPersonalizado {
  id: string;
  nombre: string;
  descripcion: string;
  permisos: string[];
  restricciones: string[];
  numeroEmpleados: number;
  fechaCreacion: Date;
}

/**
 * Configuración de Seguridad
 */
export interface ConfiguracionSeguridad {
  registroActividad: RegistroActividad;
  dispositivosConectados: ConfiguracionDispositivos;
  metodosAutenticacion: MetodoAutenticacion[];
}

/**
 * Configuración de Registro de Actividad
 */
export interface RegistroActividad {
  habilitado: boolean;
  retencionDias: number;
  eventosRegistrados: string[];
}

/**
 * Configuración de Dispositivos Conectados
 */
export interface ConfiguracionDispositivos {
  maximoDispositivosPorUsuario: number;
  sesionesConcurrentes: boolean;
  expiracionSesionHoras: number;
}

/**
 * Método de Autenticación Configurado
 */
export interface MetodoAutenticacion {
  tipo: TipoMetodoAutenticacion;
  habilitado: boolean;
  configuracion: any;
}

/**
 * Configuración de Colaboradores
 */
export interface ConfiguracionColaboradores {
  codigoColaborador: string;
  fechaGeneracion: Date;
  expiracionCodigoDias: number;
  solicitudesPendientes: SolicitudColaborador[];
}

/**
 * Solicitud de Colaborador Pendiente
 */
export interface SolicitudColaborador {
  id: string;
  email: string;
  nombre: string;
  rolSolicitado: string;
  fechaSolicitud: Date;
  estado: EstadoSolicitudColaborador;
}

/**
 * Enumeraciones
 */
export enum TipoMetodoAutenticacion {
  CODIGO_TEMPORAL = 'CODIGO_TEMPORAL',
  CLAVE_SEGURIDAD = 'CLAVE_SEGURIDAD',
  DISPOSITIVO_CONFIANZA = 'DISPOSITIVO_CONFIANZA',
  APLICACION_AUTENTICACION = 'APLICACION_AUTENTICACION'
}

export enum EstadoSolicitudColaborador {
  PENDIENTE = 'PENDIENTE',
  APROBADA = 'APROBADA',
  RECHAZADA = 'RECHAZADA',
  EXPIRADA = 'EXPIRADA'
}

/**
 * Factory para crear instancias de ConfiguracionUsuarios
 */
export class ConfiguracionUsuariosFactory {
  static crearConfiguracionPorDefecto(tiendaId: string): ConfiguracionUsuarios {
    return {
      id: `config-usuarios-${Date.now()}`,
      tiendaId,
      politicasUsuarios: {
        autenticacionDosPasosObligatoria: true,
        longitudMinimaContrasena: 8,
        expiracionContrasenaDias: 90,
        maximoIntentosInicioSesion: 5,
        bloqueoTemporalMinutos: 30,
        requiereVerificacionEmail: true,
        politicasContrasena: [
          'Mínimo 8 caracteres',
          'Al menos una mayúscula',
          'Al menos una minúscula', 
          'Al menos un número',
          'Al menos un carácter especial'
        ]
      },
      configuracionRoles: {
        rolesPredeterminados: [
          {
            nombre: 'Desarrollador de aplicaciones',
            descripcion: 'Este rol otorga permisos para desarrollar apps y gestionar tiendas en desarrollo.',
            permisos: ['Desarrollar apps', 'Gestionar apps de partners', 'Crear, gestionar y copiar tiendas en desarrollo'],
            restricciones: ['Sin acceso a datos de producción', 'No puede gestionar usuarios', 'Sin acceso a información financiera'],
            gestionadoPorSistema: true,
            numeroEmpleados: 0
          },
          {
            nombre: 'Atención al cliente',
            descripcion: 'Acceso limitado para atender consultas de clientes.',
            permisos: ['Ver órdenes', 'Ver clientes', 'Responder tickets de soporte'],
            restricciones: ['No puede modificar configuraciones', 'No acceso a datos financieros'],
            gestionadoPorSistema: true,
            numeroEmpleados: 0
          },
          {
            nombre: 'Especialista en marketing',
            descripcion: 'Permisos para gestionar campañas de marketing y promociones.',
            permisos: ['Gestionar descuentos', 'Ver analytics', 'Crear campañas'],
            restricciones: ['No acceso a configuración de tienda', 'No puede gestionar usuarios'],
            gestionadoPorSistema: true,
            numeroEmpleados: 0
          },
          {
            nombre: 'Editor de tiendas online',
            descripcion: 'Permisos para editar contenido de la tienda online.',
            permisos: ['Editar páginas', 'Gestionar productos', 'Modificar temas'],
            restricciones: ['No acceso a configuración', 'No puede gestionar usuarios'],
            gestionadoPorSistema: true,
            numeroEmpleados: 0
          },
          {
            nombre: 'Administrador',
            descripcion: 'Acceso completo a todas las funciones de la tienda.',
            permisos: ['Todos los permisos'],
            restricciones: [],
            gestionadoPorSistema: true,
            numeroEmpleados: 0
          }
        ],
        rolesPersonalizados: [],
        permisosDisponibles: [
          'Gestionar productos',
          'Gestionar órdenes',
          'Gestionar clientes',
          'Gestionar inventario',
          'Gestionar descuentos',
          'Ver analytics',
          'Gestionar configuración',
          'Gestionar usuarios',
          'Gestionar temas',
          'Gestionar páginas',
          'Gestionar integraciones',
          'Acceso a datos financieros'
        ]
      },
      configuracionSeguridad: {
        registroActividad: {
          habilitado: true,
          retencionDias: 365,
          eventosRegistrados: [
            'Inicio de sesión',
            'Cambio de contraseña',
            'Creación de usuario',
            'Modificación de rol',
            'Acceso a datos sensibles'
          ]
        },
        dispositivosConectados: {
          maximoDispositivosPorUsuario: 5,
          sesionesConcurrentes: true,
          expiracionSesionHoras: 24
        },
        metodosAutenticacion: [
          {
            tipo: TipoMetodoAutenticacion.CODIGO_TEMPORAL,
            habilitado: true,
            configuracion: {}
          },
          {
            tipo: TipoMetodoAutenticacion.APLICACION_AUTENTICACION,
            habilitado: true,
            configuracion: {}
          }
        ]
      },
      configuracionColaboradores: {
        codigoColaborador: this.generarCodigoColaborador(),
        fechaGeneracion: new Date(),
        expiracionCodigoDias: 30,
        solicitudesPendientes: []
      },
      fechaCreacion: new Date(),
      fechaActualizacion: new Date()
    };
  }

  private static generarCodigoColaborador(): string {
    return Math.random().toString(36).substring(2, 6).toUpperCase();
  }
}