import { Module } from '@nestjs/common';
import { MercadosController } from './presentacion/controladores/mercados.controller';
import { CrearMercadoCasoUso } from './dominio/casos-uso/crear-mercado.caso-uso';
import { ListarMercadosCasoUso } from './dominio/casos-uso/listar-mercados.caso-uso';
import { RepositorioMercado } from './dominio/interfaces/repositorio-mercado.interface';
import { PrismaRepositorioMercado } from './infraestructura/repositorios/prisma-repositorio-mercado';

export const REPOSITORIO_MERCADO_TOKEN = 'RepositorioMercado';

@Module({
  controllers: [MercadosController],
  providers: [
    CrearMercadoCasoUso,
    ListarMercadosCasoUso,
    {
      provide: REPOSITORIO_MERCADO_TOKEN,
      useClass: PrismaRepositorioMercado,
    },
  ],
  exports: [REPOSITORIO_MERCADO_TOKEN],
})
export class MercadosModule {}