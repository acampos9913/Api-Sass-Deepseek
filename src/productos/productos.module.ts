import { Module } from '@nestjs/common';
import { ProductosController } from './presentacion/controladores/productos.controller';
import { CrearProductoCasoUso } from './dominio/casos-uso/crear-producto.caso-uso';
import { ListarProductosCasoUso } from './dominio/casos-uso/listar-productos.caso-uso';
import { PrismaRepositorioProductoAvanzado } from './infraestructura/repositorios/prisma-repositorio-producto.avanzado';
import { ProductosMongodbModule } from '../mongodb/productos-mongodb.module';

/**
 * Módulo de Productos para el sistema ecommerce Tiendanube
 * Sigue la arquitectura limpia y convenciones en español
 * Implementa arquitectura híbrida CQRS:
 * - PostgreSQL (Prisma) para escrituras (Comandos)
 * - MongoDB para lecturas (Consultas)
 */
@Module({
  imports: [ProductosMongodbModule],
  controllers: [ProductosController],
  providers: [
    CrearProductoCasoUso,
    ListarProductosCasoUso,
    {
      provide: 'RepositorioProducto',
      useClass: PrismaRepositorioProductoAvanzado,
    },
  ],
  exports: [CrearProductoCasoUso, ListarProductosCasoUso],
})
export class ProductosModule {}