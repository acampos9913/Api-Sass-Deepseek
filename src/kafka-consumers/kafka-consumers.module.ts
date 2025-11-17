import { Module } from '@nestjs/common';
import { MongodbModule } from '../mongodb/mongodb.module';
import { KafkaService } from '../comun/infraestructura/servicios/kafka.service';
import { LoggingService } from '../logging/logging.service';
import { ProductoConsumer } from './consumers/producto.consumer';

@Module({
  imports: [MongodbModule],
  providers: [
    KafkaService,
    LoggingService,
    ProductoConsumer,
  ],
  exports: [ProductoConsumer],
})
export class KafkaConsumersModule {}