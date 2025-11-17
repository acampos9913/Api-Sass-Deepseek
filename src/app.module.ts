import { Module, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AutenticacionModule } from './autenticacion/autenticacion.module';
import { ProductosModule } from './productos/productos.module';
import { OrdenesModule } from './ordenes/ordenes.module';
import { ClientesModule } from './clientes/clientes.module';
import { InventarioModule } from './inventario/inventario.module';
import { DescuentosModule } from './descuentos/descuentos.module';
import { ReportesModule } from './reportes/reportes.module';
import { EnviosModule } from './envios/envios.module';
import { OrdenesCompraModule } from './ordenes-compra/ordenes-compra.module';
import { TransferenciasModule } from './transferencias/transferencias.module';
import { TarjetasRegaloModule } from './tarjetas-regalo/tarjetas-regalo.module';
import { PrismaService } from '../prisma/prisma.service';
import { ColeccionesModule } from './colecciones/colecciones.module';
import { PaquetesModule } from './paquetes/paquetes.module';
import { MercadosModule } from './mercados/mercados.module';
import { TiendaOnlineModule } from './tienda-online/tienda-online.module';
import { IntegracionesModule } from './integraciones/integraciones.module';
import { CreditosModule } from './creditos/creditos.module';
import { ConfiguracionTiendaModule } from './configuracion/configuracion-tienda.module';
import { MongodbModule } from './mongodb/mongodb.module';
import { ExcepcionGlobalFiltro } from './filtros/excepcion-global.filtro';
import { LoggingModule } from './logging/logging.module';
import { ValidationPipe } from '@nestjs/common';
import { PuntoVentaModule } from './punto-venta/punto-venta.module';
import { PlanesModule } from './planes/planes.module';
import { TestModule } from './test/test.module';

/**
 * Módulo principal de la aplicación
 * Configura todas las dependencias globales y módulos de funcionalidad
 */
@Module({
  imports: [
    // Configuración global de variables de entorno
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validationOptions: {
        allowUnknown: false,
        abortEarly: true,
      },
    }),
    
    // Módulos de infraestructura global
    LoggingModule,
    
    // Módulos de funcionalidad organizados por dominio
    AutenticacionModule,
    ProductosModule,
    OrdenesModule,
    ClientesModule,
    InventarioModule,
    DescuentosModule,
    ReportesModule,
    EnviosModule,
    ColeccionesModule,
    PaquetesModule,
    MercadosModule,
    TiendaOnlineModule,
    OrdenesCompraModule,
    TransferenciasModule,
    TarjetasRegaloModule,
    IntegracionesModule,
    CreditosModule,
    ConfiguracionTiendaModule,
    PuntoVentaModule,
    PlanesModule,
    MongodbModule,
    
    // Módulo de testing solo en desarrollo
    ...(process.env.NODE_ENV === 'development' ? [TestModule] : []),
  ],
  controllers: [AppController],
  providers: [
    // Servicios principales
    AppService,
    PrismaService,
    
    // Configuración global de validación
    {
      provide: APP_PIPE,
      useFactory: () => new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
        exceptionFactory: (errors) => {
          const mensajes = errors.map(error => {
            const constraints = Object.values(error.constraints || {});
            return `${error.property}: ${constraints.join(', ')}`;
          });
          return new Error(`Errores de validación: ${mensajes.join('; ')}`);
        },
      }),
    },
    
    // Filtro global de excepciones
    {
      provide: APP_FILTER,
      useClass: ExcepcionGlobalFiltro,
    },
  ],
  exports: [
    PrismaService,
  ],
})
export class AppModule {
  private readonly logger = new Logger(AppModule.name);

  constructor(private readonly configService: ConfigService) {
    this.validarConfiguracion();
  }

  /**
   * Valida la configuración crítica al iniciar la aplicación
   */
  private validarConfiguracion(): void {
    const configuracionesCriticas = [
      'DATABASE_URL',
      'MONGODB_URI',
      'JWT_SECRET',
    ];

    const configuracionesFaltantes = configuracionesCriticas.filter(
      config => !this.configService.get(config)
    );

    if (configuracionesFaltantes.length > 0) {
      this.logger.warn(
        `Configuraciones críticas faltantes: ${configuracionesFaltantes.join(', ')}`,
        { modulo: 'AppModule', tipo: 'configuracion' }
      );
    } else {
      this.logger.log(
        'Todas las configuraciones críticas están presentes',
        { modulo: 'AppModule', tipo: 'configuracion' }
      );
    }

    // Validar entorno
    const entorno = this.configService.get('NODE_ENV') || 'development';
    this.logger.log(`Aplicación iniciada en entorno: ${entorno}`, {
      modulo: 'AppModule',
      entorno,
      timestamp: new Date().toISOString(),
    });
  }
}
