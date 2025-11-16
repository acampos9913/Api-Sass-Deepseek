import { registerAs } from '@nestjs/config';

/**
 * Configuración de MongoDB para lecturas optimizadas
 * Siguiendo arquitectura híbrida CQRS
 */
export default registerAs('mongodb', () => ({
  uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce-tiendanube',
  options: {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  },
  // Configuración específica para colecciones de lectura
  colecciones: {
    productos: 'productos_lectura',
    clientes: 'clientes_lectura', 
    ordenes: 'ordenes_lectura',
    tiendas: 'tiendas_lectura',
    colecciones: 'colecciones_lectura',
    descuentos: 'descuentos_lectura',
    envios: 'envios_lectura',
    inventario: 'inventario_lectura',
    mercados: 'mercados_lectura',
    paquetes: 'paquetes_lectura',
    paginas: 'paginas_lectura',
    temas: 'temas_lectura',
    reportes: 'reportes_lectura',
    integraciones: 'integraciones_lectura',
  }
}));