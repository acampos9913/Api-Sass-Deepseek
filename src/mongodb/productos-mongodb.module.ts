import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductoEsquema, ProductoLectura } from './esquemas/producto.esquema';
import { MongodbRepositorioProducto } from './repositorios/mongodb-repositorio-producto';

/**
 * Módulo de MongoDB específico para operaciones de lectura de productos
 * Siguiendo arquitectura híbrida CQRS
 */
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ProductoLectura.name, schema: ProductoEsquema }
    ]),
  ],
  providers: [
    MongodbRepositorioProducto,
  ],
  exports: [
    MongodbRepositorioProducto,
  ],
})
export class ProductosMongodbModule {}