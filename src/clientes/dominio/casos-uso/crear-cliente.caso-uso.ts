import { Inject, Injectable } from '@nestjs/common';
import { Cliente } from '../entidades/cliente.entity';
import type { RepositorioCliente } from '../interfaces/repositorio-cliente.interface';
import { ExcepcionDominio } from '../../../comun/excepciones/excepcion-dominio';

/**
 * Caso de uso para crear un nuevo cliente en el sistema
 * Contiene la lógica de negocio específica para la creación de clientes
 */
@Injectable()
export class CrearClienteCasoUso {
  constructor(
    @Inject('RepositorioCliente')
    private readonly repositorioCliente: RepositorioCliente,
  ) {}

  /**
   * Ejecuta el caso de uso para crear un cliente
   * @param datosCliente Datos del cliente a crear
   * @param creadorId ID del usuario que está creando el cliente
   * @returns El cliente creado
   */
  async ejecutar(
    datosCliente: {
      email: string;
      nombreCompleto: string;
      telefono: string | null;
    },
    creadorId: string,
  ): Promise<Cliente> {
    // Validar que el email no esté duplicado
    const clienteExistente = await this.repositorioCliente.buscarPorEmail(
      datosCliente.email,
    );
    if (clienteExistente) {
      throw ExcepcionDominio.Respuesta400(
        'Ya existe un cliente con este email',
        'Cliente.EmailDuplicado'
      );
    }

    // Validar que el creador exista (podría validarse con el repositorio de usuarios)
    // Por ahora asumimos que el creadorId es válido

    // Crear la entidad de cliente
    const fechaActual = new Date();
    const cliente = new Cliente(
      this.generarIdUnico(),
      datosCliente.email,
      datosCliente.nombreCompleto,
      datosCliente.telefono,
      true, // Por defecto activo
      fechaActual,
      fechaActual,
      creadorId,
    );

    // Validar la entidad
    if (!cliente.validarEmail()) {
      throw ExcepcionDominio.Respuesta400(
        'El formato del email no es válido',
        'Cliente.EmailInvalido'
      );
    }

    if (!cliente.validarTelefono()) {
      throw ExcepcionDominio.Respuesta400(
        'El formato del teléfono no es válido',
        'Cliente.TelefonoInvalido'
      );
    }

    // Persistir el cliente
    await this.repositorioCliente.crear({
      id: cliente.id,
      email: cliente.email,
      nombreCompleto: cliente.nombreCompleto,
      telefono: cliente.telefono,
      activo: cliente.activo,
      fechaCreacion: cliente.fechaCreacion,
      fechaActualizacion: cliente.fechaActualizacion,
      creadorId: cliente.creadorId,
      totalGastado: 0,
      totalOrdenes: 0,
      fechaUltimaOrden: null,
      tags: [],
      notas: null,
      aceptaMarketing: false,
      fuenteCliente: 'MANUAL',
    });

    return cliente;
  }

  /**
   * Genera un ID único para el cliente
   * @returns ID único generado
   */
  private generarIdUnico(): string {
    // En una implementación real, usaríamos una librería como nanoid
    // Por ahora usamos un timestamp + random para simular unicidad
    return `cliente_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}