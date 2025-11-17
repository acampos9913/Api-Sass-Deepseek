import { LogLevel } from '@nestjs/common';

/**
 * Configuración de logging para diferentes entornos
 */
export interface ConfiguracionLogging {
  nivel: LogLevel;
  formato: 'json' | 'texto';
  habilitarColores: boolean;
  habilitarTimestamps: boolean;
  incluirContexto: boolean;
  maximoTamanoArchivo: string;
  maximoArchivos: number;
  directorioLogs: string;
  habilitarLogsHttp: boolean;
  habilitarLogsBaseDatos: boolean;
  habilitarLogsAuditoria: boolean;
  umbralAlertaDuracion: number; // en milisegundos
}

/**
 * Configuración por entorno para logging
 */
export const configuracionLogging: Record<string, ConfiguracionLogging> = {
  desarrollo: {
    nivel: 'debug',
    formato: 'texto',
    habilitarColores: true,
    habilitarTimestamps: true,
    incluirContexto: true,
    maximoTamanoArchivo: '10m',
    maximoArchivos: 5,
    directorioLogs: 'logs',
    habilitarLogsHttp: true,
    habilitarLogsBaseDatos: true,
    habilitarLogsAuditoria: true,
    umbralAlertaDuracion: 1000, // 1 segundo
  },
  produccion: {
    nivel: 'log',
    formato: 'json',
    habilitarColores: false,
    habilitarTimestamps: true,
    incluirContexto: true,
    maximoTamanoArchivo: '100m',
    maximoArchivos: 10,
    directorioLogs: '/var/log/ecommerce-tiendanube',
    habilitarLogsHttp: true,
    habilitarLogsBaseDatos: false, // En producción, solo logs críticos
    habilitarLogsAuditoria: true,
    umbralAlertaDuracion: 5000, // 5 segundos
  },
  prueba: {
    nivel: 'error',
    formato: 'texto',
    habilitarColores: false,
    habilitarTimestamps: true,
    incluirContexto: false,
    maximoTamanoArchivo: '1m',
    maximoArchivos: 1,
    directorioLogs: 'logs',
    habilitarLogsHttp: false,
    habilitarLogsBaseDatos: false,
    habilitarLogsAuditoria: false,
    umbralAlertaDuracion: 1000,
  },
};

/**
 * Obtiene la configuración de logging según el entorno
 */
export function obtenerConfiguracionLogging(entorno: string): ConfiguracionLogging {
  return configuracionLogging[entorno] || configuracionLogging.desarrollo;
}

/**
 * Niveles de log permitidos
 */
export const nivelesLog = {
  error: 0,
  warn: 1,
  log: 2,
  debug: 3,
  verbose: 4,
} as const;

/**
 * Tipos de log especializados
 */
export enum TipoLog {
  HTTP = 'http',
  BASE_DATOS = 'database',
  AUDITORIA = 'auditoria',
  METRICA = 'metrica',
  EVENTO_NEGOCIO = 'evento_negocio',
  ERROR_NEGOCIO = 'error_negocio',
  CONSULTA_BD = 'consulta_bd',
  INICIO_SOLICITUD = 'inicio_solicitud',
  FIN_SOLICITUD = 'fin_solicitud',
  METRICA_RENDIMIENTO = 'metrica_rendimiento',
}

/**
 * Configuración de alertas por tipo de log
 */
export interface ConfiguracionAlerta {
  habilitada: boolean;
  umbral: number;
  canal: string; // 'email', 'slack', 'webhook'
  destinatarios: string[];
}

export const configuracionAlertas: Record<TipoLog, ConfiguracionAlerta> = {
  [TipoLog.HTTP]: {
    habilitada: true,
    umbral: 5000, // 5 segundos
    canal: 'email',
    destinatarios: ['devops@tiendanube.com'],
  },
  [TipoLog.BASE_DATOS]: {
    habilitada: true,
    umbral: 3000, // 3 segundos
    canal: 'slack',
    destinatarios: ['#database-alerts'],
  },
  [TipoLog.AUDITORIA]: {
    habilitada: true,
    umbral: 0, // Siempre alertar
    canal: 'webhook',
    destinatarios: ['https://auditoria.tiendanube.com/webhook'],
  },
  [TipoLog.METRICA]: {
    habilitada: false,
    umbral: 0,
    canal: 'email',
    destinatarios: [],
  },
  [TipoLog.EVENTO_NEGOCIO]: {
    habilitada: false,
    umbral: 0,
    canal: 'email',
    destinatarios: [],
  },
  [TipoLog.ERROR_NEGOCIO]: {
    habilitada: true,
    umbral: 0, // Siempre alertar
    canal: 'email',
    destinatarios: ['soporte@tiendanube.com', 'dev@tiendanube.com'],
  },
  [TipoLog.CONSULTA_BD]: {
    habilitada: true,
    umbral: 2000, // 2 segundos
    canal: 'slack',
    destinatarios: ['#performance-alerts'],
  },
  [TipoLog.INICIO_SOLICITUD]: {
    habilitada: false,
    umbral: 0,
    canal: 'email',
    destinatarios: [],
  },
  [TipoLog.FIN_SOLICITUD]: {
    habilitada: false,
    umbral: 0,
    canal: 'email',
    destinatarios: [],
  },
  [TipoLog.METRICA_RENDIMIENTO]: {
    habilitada: true,
    umbral: 10000, // 10 segundos
    canal: 'webhook',
    destinatarios: ['https://monitoreo.tiendanube.com/alerts'],
  },
};

/**
 * Configuración de rotación de logs
 */
export interface ConfiguracionRotacion {
  frecuencia: 'diaria' | 'semanal' | 'mensual' | 'por-tamano';
  mantenerDias: number;
  comprimir: boolean;
  fechaPatron: string;
}

export const configuracionRotacion: ConfiguracionRotacion = {
  frecuencia: 'diaria',
  mantenerDias: 30,
  comprimir: true,
  fechaPatron: 'YYYY-MM-DD',
};

/**
 * Configuración de agregación de logs
 */
export interface ConfiguracionAgregacion {
  habilitada: boolean;
  servicio: 'elasticsearch' | 'splunk' | 'datadog' | 'loki';
  endpoint: string;
  apiKey: string;
  indice: string;
  batchSize: number;
  intervalo: number;
}

export const configuracionAgregacion: ConfiguracionAgregacion = {
  habilitada: true,
  servicio: 'elasticsearch',
  endpoint: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
  apiKey: process.env.ELASTICSEARCH_API_KEY || '',
  indice: 'ecommerce-tiendanube-logs',
  batchSize: 100,
  intervalo: 5000, // 5 segundos
};