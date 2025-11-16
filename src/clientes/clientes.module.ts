import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ClientesController } from './presentacion/controladores/clientes.controller';
import { CrearClienteCasoUso } from './dominio/casos-uso/crear-cliente.caso-uso';
import { ListarClientesCasoUso } from './dominio/casos-uso/listar-clientes.caso-uso';
import { PrismaRepositorioCliente } from './infraestructura/repositorios/prisma-repositorio-cliente';

/**
 * Módulo de Clientes para la gestión de clientes en el sistema
 * Sigue la arquitectura limpia con separación de capas
 */
@Module({
  controllers: [ClientesController],
  providers: [
    // Casos de uso
    CrearClienteCasoUso,
    ListarClientesCasoUso,
    
    // Repositorio
    {
      provide: 'RepositorioCliente',
      useClass: PrismaRepositorioCliente,
    },
    
    // Cliente de Prisma
    {
      provide: PrismaClient,
      useValue: new PrismaClient(),
    },
  ],
  exports: [CrearClienteCasoUso, ListarClientesCasoUso],
})
export class ClientesModule {}