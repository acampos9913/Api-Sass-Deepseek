/**
 * Entidades de dominio para el módulo de seguridad del perfil
 */

export interface ClaveAccesoUsuario {
  id: string;
  usuario_id: string;
  tipo: string;
  estado: 'activa' | 'inactiva';
  dispositivos_vinculados: string[];
  fecha_creacion: Date;
  fecha_actualizacion: Date;
}

export interface DispositivoUsuario {
  id: string;
  usuario_id: string;
  navegador: string;
  sistema_operativo: string;
  fecha_inicio: Date;
  activo: boolean;
  ultima_actividad?: Date;
}

export interface MetodoAutenticacionUsuario {
  id: string;
  usuario_id: string;
  tipo: 'codigo' | 'clave_seguridad' | 'dispositivo_confianza';
  configuracion: Record<string, any>;
  estado: 'activo' | 'inactivo';
  fecha_creacion: Date;
}

export interface HistorialContrasena {
  id: string;
  usuario_id: string;
  contrasena_hash: string;
  fecha_cambio: Date;
  motivo?: string;
}

export interface IntentoInicioSesion {
  id: string;
  usuario_id: string;
  exito: boolean;
  fecha_intento: Date;
  direccion_ip?: string;
  user_agent?: string;
  navegador?: string;
  sistema_operativo?: string;
}