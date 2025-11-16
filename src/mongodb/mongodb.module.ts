import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import mongodbConfig from './configuracion/mongodb.config';

/**
 * Módulo de MongoDB para lecturas optimizadas
 * Siguiendo arquitectura híbrida CQRS
 */
@Module({
  imports: [
    ConfigModule.forFeature(mongodbConfig),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('mongodb.uri'),
        ...configService.get('mongodb.options'),
      }),
      inject: [ConfigService],
    }),
  ],
  exports: [MongooseModule],
})
export class MongodbModule {}