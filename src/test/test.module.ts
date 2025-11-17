import { Module } from '@nestjs/common';
import { LoggingService } from '../logging/logging.service';
import { ControladorValidacionErrores } from './controladores/controlador-validacion-errores';

/**
 * Módulo de testing para validar el manejo de errores y logging en producción
 * Este módulo solo debe estar activo en entornos de desarrollo y testing
 */
@Module({
  controllers: [ControladorValidacionErrores],
  providers: [LoggingService],
  exports: [LoggingService],
})
export class TestModule {}