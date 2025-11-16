import { Module } from '@nestjs/common';
import { PaginasController } from './presentacion/controladores/paginas.controller';
import { TemasController } from './presentacion/controladores/temas.controller';
import { CrearPaginaCasoUso } from './dominio/casos-uso/crear-pagina.caso-uso';
import { CrearTemaCasoUso } from './dominio/casos-uso/crear-tema.caso-uso';
import { RepositorioPagina } from './dominio/interfaces/repositorio-pagina.interface';
import { RepositorioTema } from './dominio/interfaces/repositorio-tema.interface';
import { PrismaRepositorioPagina } from './infraestructura/repositorios/prisma-repositorio-pagina';
import { PrismaRepositorioTema } from './infraestructura/repositorios/prisma-repositorio-tema';
import { PrismaService } from '../../prisma/prisma.service';

export const REPOSITORIO_PAGINA_TOKEN = 'RepositorioPagina';
export const REPOSITORIO_TEMA_TOKEN = 'RepositorioTema';

@Module({
  controllers: [PaginasController, TemasController],
  providers: [
    CrearPaginaCasoUso,
    CrearTemaCasoUso,
    PrismaService,
    {
      provide: REPOSITORIO_PAGINA_TOKEN,
      useClass: PrismaRepositorioPagina,
    },
    {
      provide: REPOSITORIO_TEMA_TOKEN,
      useClass: PrismaRepositorioTema,
    },
  ],
  exports: [REPOSITORIO_PAGINA_TOKEN, REPOSITORIO_TEMA_TOKEN],
})
export class TiendaOnlineModule {}