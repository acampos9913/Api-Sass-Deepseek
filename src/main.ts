import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe, Logger, INestApplication } from '@nestjs/common';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { AppModule } from './app.module';
import { LoggingService } from './logging/logging.service';

/**
 * Configura las medidas de seguridad para la aplicación
 */
function configurarSeguridad(app: INestApplication): void {
  // Helmet para seguridad HTTP
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    crossOriginEmbedderPolicy: false,
  }));

  // Rate limiting para prevenir ataques de fuerza bruta
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: process.env.NODE_ENV === 'production' ? 100 : 1000, // Límite de solicitudes por ventana
    message: {
      mensaje: 'Demasiadas solicitudes desde esta IP, por favor intente nuevamente después de 15 minutos',
      data: null,
      tipo_mensaje: 'Error.Cliente',
      estado_respuesta: 429,
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.use(limiter);

  // Compresión para mejorar el rendimiento
  app.use(compression());
}

/**
 * Configura la documentación Swagger con todas las especificaciones
 */
function configurarSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('Ecommerce Tiendanube API')
    .setDescription(`
# API Ecommerce Tiendanube

API completa para sistema ecommerce tipo Shopify con arquitectura limpia y multi-tenant.

## Arquitectura
- **Clean Architecture** con separación estricta de capas
- **CQRS Híbrido**: PostgreSQL para escrituras, MongoDB para lecturas
- **Sincronización**: Apache Kafka para mantener coherencia entre bases de datos

## Estándares de Respuesta
Todas las respuestas siguen el formato:
\`\`\`json
{
  "mensaje": "string",
  "data": "any | null",
  "tipo_mensaje": "string",
  "estado_respuesta": "number"
}
\`\`\`

## Manejo de Errores
- **Errores 4xx**: Se retornan con HTTP 200 y estado_respuesta en el cuerpo
- **Errores 5xx**: Se retornan con HTTP 500 y mensajes genéricos en producción

## Seguridad
- Autenticación JWT con claims de dominio
- Rate limiting en endpoints críticos
- Validación estricta de inputs
- CORS configurado con lista blanca
    `)
    .setVersion('1.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'JWT',
      description: 'Ingrese el token JWT',
      in: 'header',
    }, 'JWT-auth')
    .addApiKey({
      type: 'apiKey',
      name: 'X-API-Key',
      in: 'header',
      description: 'Clave API para integraciones externas'
    }, 'API-Key')
    .addTag('autenticacion', 'Endpoints para autenticación y gestión de usuarios')
    .addTag('productos', 'Endpoints para gestión de productos y variantes')
    .addTag('ordenes', 'Endpoints para gestión de órdenes y pedidos')
    .addTag('clientes', 'Endpoints para gestión de clientes')
    .addTag('inventario', 'Endpoints para gestión de inventario y stock')
    .addTag('descuentos', 'Endpoints para gestión de descuentos y promociones')
    .addTag('reportes', 'Endpoints para reportes y analíticas')
    .addTag('envios', 'Endpoints para gestión de envíos')
    .addTag('colecciones', 'Endpoints para gestión de colecciones de productos')
    .addTag('ordenes-compra', 'Endpoints para órdenes de compra')
    .addTag('transferencias', 'Endpoints para transferencias de productos')
    .addTag('tarjetas-regalo', 'Endpoints para tarjetas de regalo y cupones')
    .addTag('integraciones', 'Endpoints para integraciones con redes sociales')
    .addTag('creditos', 'Endpoints para gestión de créditos y recargas')
    .addTag('configuracion-tienda', 'Endpoints para configuración de tienda')
    .addTag('punto-venta', 'Endpoints para punto de venta (POS)')
    .addTag('planes', 'Endpoints para gestión de planes y suscripciones')
    .addTag('paquetes', 'Endpoints para gestión de paquetes de productos')
    .addTag('mercados', 'Endpoints para gestión de mercados')
    .addTag('tienda-online', 'Endpoints para tienda online y temas')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Ecommerce Tiendanube API Docs',
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info { margin: 20px 0 }
      .swagger-ui .scheme-container { margin: 20px 0 }
    `,
    customfavIcon: '/favicon.ico',
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
      showExtensions: true,
      showCommonExtensions: true,
      defaultModelsExpandDepth: 2,
      defaultModelExpandDepth: 2,
    },
  });
}

/**
 * Configura la validación global
 */
function configurarValidacion(app: INestApplication): void {
  // Configuración global de validación
  app.useGlobalPipes(new ValidationPipe({
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
  }));
}

/**
 * Configura CORS con lista blanca estricta
 */
function configurarCORS(app: INestApplication): void {
  const origenesPermitidos = process.env.ORIGENES_PERMITIDOS
    ? process.env.ORIGENES_PERMITIDOS.split(',')
    : ['http://localhost:3001', 'http://localhost:3000'];

  app.enableCors({
    origin: (origin, callback) => {
      // Permitir solicitudes sin origen (como aplicaciones móviles o herramientas de testing)
      if (!origin) return callback(null, true);
      
      if (origenesPermitidos.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Origen no permitido por CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'X-API-Key',
      'X-Correlation-Id',
      'Accept',
      'Accept-Language',
    ],
    exposedHeaders: [
      'X-RateLimit-Limit',
      'X-RateLimit-Remaining',
      'X-RateLimit-Reset',
    ],
    credentials: true,
    maxAge: 86400, // 24 horas
  });
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  // Configurar logging global
  const loggingService = app.get(LoggingService);
  app.useLogger(loggingService);

  // Configurar todas las funcionalidades
  configurarSeguridad(app);
  configurarSwagger(app);
  configurarValidacion(app);
  configurarCORS(app);

  // Configurar puerto y arrancar aplicación
  const puerto = process.env.PORT ?? 3000;
  await app.listen(puerto);

  // Log de inicio
  loggingService.log('🚀 Aplicación iniciada exitosamente', {
    modulo: 'Bootstrap',
    puerto,
    entorno: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });

  loggingService.log(`📚 Documentación Swagger disponible en: http://localhost:${puerto}/api/docs`, {
    modulo: 'Bootstrap',
    tipo: 'documentacion',
  });
}
bootstrap();
