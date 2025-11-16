import { Module } from '@nestjs/common';
import { PerfilGeneralModule } from './general/perfil-general.module';
import { SeguridadModule } from './seguridad/seguridad.module';

@Module({
  imports: [
    PerfilGeneralModule,
    SeguridadModule,
  ],
  exports: [
    PerfilGeneralModule,
    SeguridadModule,
  ],
})
export class PerfilModule {}