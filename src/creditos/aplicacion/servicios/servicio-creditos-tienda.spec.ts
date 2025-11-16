import { Test, TestingModule } from '@nestjs/testing';
import { ServicioCreditosTienda } from './servicio-creditos-tienda';
import { CreditoTienda } from '../../dominio/entidades/credito-tienda.entity';
import { RecargaCredito } from '../../dominio/entidades/recarga-credito.entity';
import { CreditoUsado } from '../../dominio/entidades/credito-usado.entity';
import { TipoServicioCredito } from '../../dominio/entidades/recarga-credito.entity';
import type { RepositorioCreditoTienda } from '../../dominio/interfaces/repositorio-credito-tienda.interface';

describe('ServicioCreditosTienda', () => {
  let servicio: ServicioCreditosTienda;
  let repositorioMock: jest.Mocked<RepositorioCreditoTienda>;

  beforeEach(async () => {
    // Mock del repositorio
    repositorioMock = {
      buscarCreditoTiendaPorId: jest.fn(),
      crearCreditoTiendaInicial: jest.fn(),
      guardarCreditoTienda: jest.fn(),
      buscarRecargaPorPagoStripe: jest.fn(),
      guardarRecargaCredito: jest.fn(),
      actualizarEstadoRecarga: jest.fn(),
      verificarCreditosSuficientes: jest.fn(),
      registrarUsoCredito: jest.fn(),
      obtenerResumenMensual: jest.fn(),
      obtenerUsoDiarioPorMes: jest.fn(),
      obtenerHistorialCompleto: jest.fn(),
      buscarRecargasPorTienda: jest.fn(),
      buscarUsosPorTienda: jest.fn(),
      buscarUsosPorTiendaYTipoServicio: jest.fn(),
      obtenerTopServiciosConsumo: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServicioCreditosTienda,
        {
          provide: 'RepositorioCreditoTienda',
          useValue: repositorioMock,
        },
      ],
    }).compile();

    servicio = module.get<ServicioCreditosTienda>(ServicioCreditosTienda);
  });

  describe('obtenerBalance', () => {
    it('debe retornar el balance existente de la tienda', async () => {
      const creditoTiendaMock = new CreditoTienda(
        'credito-123',
        'tienda-456',
        1000,
        200,
        new Date('2024-01-01T00:00:00Z'),
        new Date('2024-01-01T00:00:00Z')
      );

      repositorioMock.buscarCreditoTiendaPorId.mockResolvedValue(creditoTiendaMock);

      const resultado = await servicio.obtenerBalance('tienda-456');

      expect(resultado).toBe(creditoTiendaMock);
      expect(repositorioMock.buscarCreditoTiendaPorId).toHaveBeenCalledWith('tienda-456');
      expect(repositorioMock.crearCreditoTiendaInicial).not.toHaveBeenCalled();
    });

    it('debe crear balance inicial si no existe', async () => {
      const creditoTiendaMock = new CreditoTienda(
        'credito-nuevo',
        'tienda-456',
        0,
        0,
        new Date(),
        new Date()
      );

      repositorioMock.buscarCreditoTiendaPorId.mockResolvedValue(null);
      repositorioMock.crearCreditoTiendaInicial.mockResolvedValue(creditoTiendaMock);

      const resultado = await servicio.obtenerBalance('tienda-456');

      expect(resultado).toBe(creditoTiendaMock);
      expect(repositorioMock.buscarCreditoTiendaPorId).toHaveBeenCalledWith('tienda-456');
      expect(repositorioMock.crearCreditoTiendaInicial).toHaveBeenCalledWith('tienda-456');
    });
  });

  describe('crearRecargaCredito', () => {
    it('debe crear una recarga de créditos exitosamente', async () => {
      const recargaMock = RecargaCredito.crear({
        tienda_id: 'tienda-456',
        monto_dolares: 10,
        id_pago_stripe: 'cs_test_123',
        estado: 'PENDIENTE',
      });

      repositorioMock.buscarRecargaPorPagoStripe.mockResolvedValue(null);
      repositorioMock.guardarRecargaCredito.mockResolvedValue(recargaMock);

      const resultado = await servicio.crearRecargaCredito('tienda-456', 10, 'cs_test_123');

      expect(resultado).toBe(recargaMock);
      expect(repositorioMock.buscarRecargaPorPagoStripe).toHaveBeenCalledWith('cs_test_123');
      expect(repositorioMock.guardarRecargaCredito).toHaveBeenCalled();
    });

    it('debe lanzar error si el monto es menor a 5 USD', async () => {
      await expect(
        servicio.crearRecargaCredito('tienda-456', 4.99, 'cs_test_123')
      ).rejects.toThrow('El monto mínimo para recargar es 5 USD');
    });

    it('debe lanzar error si ya existe una recarga con el mismo pago de Stripe', async () => {
      const recargaExistente = RecargaCredito.crear({
        tienda_id: 'tienda-456',
        monto_dolares: 10,
        id_pago_stripe: 'cs_test_123',
      });

      repositorioMock.buscarRecargaPorPagoStripe.mockResolvedValue(recargaExistente);

      await expect(
        servicio.crearRecargaCredito('tienda-456', 10, 'cs_test_123')
      ).rejects.toThrow('Ya existe una recarga con este pago de Stripe');
    });
  });

  describe('procesarRecargaCompletada', () => {
    it('debe procesar una recarga completada exitosamente', async () => {
      const recargaMock = RecargaCredito.crear({
        tienda_id: 'tienda-456',
        monto_dolares: 10,
        id_pago_stripe: 'cs_test_123',
        estado: 'PENDIENTE',
      });

      const creditoTiendaMock = new CreditoTienda(
        'credito-123',
        'tienda-456',
        500,
        100,
        new Date(),
        new Date()
      );

      const recargaActualizada = RecargaCredito.crear({
        ...recargaMock,
        estado: 'COMPLETADO',
      });

      repositorioMock.buscarRecargaPorPagoStripe.mockResolvedValue(recargaMock);
      repositorioMock.buscarCreditoTiendaPorId.mockResolvedValue(creditoTiendaMock);
      repositorioMock.guardarCreditoTienda.mockResolvedValue(creditoTiendaMock);
      repositorioMock.actualizarEstadoRecarga.mockResolvedValue(recargaActualizada);

      const resultado = await servicio.procesarRecargaCompletada('cs_test_123');

      expect(resultado).toBe(recargaActualizada);
      expect(recargaMock.marcarCompletada).toHaveBeenCalled();
      expect(creditoTiendaMock.agregarCreditos).toHaveBeenCalledWith(1000); // 10 USD * 100 créditos
      expect(repositorioMock.guardarCreditoTienda).toHaveBeenCalledWith(creditoTiendaMock);
      expect(repositorioMock.actualizarEstadoRecarga).toHaveBeenCalledWith(recargaMock.id, 'COMPLETADO');
    });

    it('debe crear balance inicial si no existe', async () => {
      const recargaMock = RecargaCredito.crear({
        tienda_id: 'tienda-456',
        monto_dolares: 10,
        id_pago_stripe: 'cs_test_123',
        estado: 'PENDIENTE',
      });

      const creditoTiendaMock = new CreditoTienda(
        'credito-nuevo',
        'tienda-456',
        0,
        0,
        new Date(),
        new Date()
      );

      const recargaActualizada = RecargaCredito.crear({
        ...recargaMock,
        estado: 'COMPLETADO',
      });

      repositorioMock.buscarRecargaPorPagoStripe.mockResolvedValue(recargaMock);
      repositorioMock.buscarCreditoTiendaPorId.mockResolvedValue(null);
      repositorioMock.crearCreditoTiendaInicial.mockResolvedValue(creditoTiendaMock);
      repositorioMock.guardarCreditoTienda.mockResolvedValue(creditoTiendaMock);
      repositorioMock.actualizarEstadoRecarga.mockResolvedValue(recargaActualizada);

      await servicio.procesarRecargaCompletada('cs_test_123');

      expect(repositorioMock.crearCreditoTiendaInicial).toHaveBeenCalledWith('tienda-456');
    });

    it('debe retornar recarga si ya está completada', async () => {
      const recargaMock = RecargaCredito.crear({
        tienda_id: 'tienda-456',
        monto_dolares: 10,
        id_pago_stripe: 'cs_test_123',
        estado: 'COMPLETADO',
      });

      repositorioMock.buscarRecargaPorPagoStripe.mockResolvedValue(recargaMock);

      const resultado = await servicio.procesarRecargaCompletada('cs_test_123');

      expect(resultado).toBe(recargaMock);
      expect(repositorioMock.buscarCreditoTiendaPorId).not.toHaveBeenCalled();
    });

    it('debe lanzar error si la recarga no existe', async () => {
      repositorioMock.buscarRecargaPorPagoStripe.mockResolvedValue(null);

      await expect(
        servicio.procesarRecargaCompletada('cs_test_inexistente')
      ).rejects.toThrow('Recarga no encontrada');
    });
  });

  describe('marcarRecargaFallida', () => {
    it('debe marcar una recarga como fallida', async () => {
      const recargaMock = RecargaCredito.crear({
        tienda_id: 'tienda-456',
        monto_dolares: 10,
        id_pago_stripe: 'cs_test_123',
        estado: 'PENDIENTE',
      });

      const recargaActualizada = RecargaCredito.crear({
        ...recargaMock,
        estado: 'FALLIDO',
      });

      repositorioMock.buscarRecargaPorPagoStripe.mockResolvedValue(recargaMock);
      repositorioMock.actualizarEstadoRecarga.mockResolvedValue(recargaActualizada);

      const resultado = await servicio.marcarRecargaFallida('cs_test_123');

      expect(resultado).toBe(recargaActualizada);
      expect(recargaMock.marcarFallida).toHaveBeenCalled();
      expect(repositorioMock.actualizarEstadoRecarga).toHaveBeenCalledWith(recargaMock.id, 'FALLIDO');
    });

    it('debe lanzar error si la recarga no existe', async () => {
      repositorioMock.buscarRecargaPorPagoStripe.mockResolvedValue(null);

      await expect(
        servicio.marcarRecargaFallida('cs_test_inexistente')
      ).rejects.toThrow('Recarga no encontrada');
    });
  });

  describe('usarCreditos', () => {
    it('debe usar créditos exitosamente', async () => {
      const creditoTiendaMock = new CreditoTienda(
        'credito-123',
        'tienda-456',
        1000,
        200,
        new Date(),
        new Date()
      );

      const creditoUsadoMock = CreditoUsado.crear({
        tienda_id: 'tienda-456',
        cantidad_creditos: 50,
        tipo_servicio: TipoServicioCredito.IA,
        descripcion_servicio: 'Generación de descripción',
        id_referencia: 'prod-789',
        metadata: { modelo: 'gpt-4' },
      });

      repositorioMock.verificarCreditosSuficientes.mockResolvedValue(true);
      repositorioMock.buscarCreditoTiendaPorId.mockResolvedValue(creditoTiendaMock);
      repositorioMock.guardarCreditoTienda.mockResolvedValue(creditoTiendaMock);
      repositorioMock.registrarUsoCredito.mockResolvedValue(creditoUsadoMock);

      const resultado = await servicio.usarCreditos(
        'tienda-456',
        50,
        TipoServicioCredito.IA,
        'Generación de descripción',
        'prod-789',
        { modelo: 'gpt-4' }
      );

      expect(resultado).toBe(creditoUsadoMock);
      expect(repositorioMock.verificarCreditosSuficientes).toHaveBeenCalledWith('tienda-456', 50);
      expect(creditoTiendaMock.consumirCreditos).toHaveBeenCalledWith(50);
      expect(repositorioMock.guardarCreditoTienda).toHaveBeenCalledWith(creditoTiendaMock);
      expect(repositorioMock.registrarUsoCredito).toHaveBeenCalled();
    });

    it('debe lanzar error si no hay créditos suficientes', async () => {
      repositorioMock.verificarCreditosSuficientes.mockResolvedValue(false);

      await expect(
        servicio.usarCreditos(
          'tienda-456',
          1000,
          TipoServicioCredito.IA,
          'Servicio costoso'
        )
      ).rejects.toThrow('Créditos insuficientes');
    });
  });

  describe('métodos de consulta', () => {
    it('debe obtener resumen mensual', async () => {
      const resumenMock = {
        creditos_disponibles: 500,
        creditos_usados: 200,
        creditos_agregados: 700,
        total_recargas: 2,
        total_usos: 5
      };

      repositorioMock.obtenerResumenMensual.mockResolvedValue(resumenMock);

      const resultado = await servicio.obtenerResumenMensual('tienda-456', 2024, 1);

      expect(resultado).toBe(resumenMock);
      expect(repositorioMock.obtenerResumenMensual).toHaveBeenCalledWith('tienda-456', 2024, 1);
    });

    it('debe obtener uso diario por mes', async () => {
      const usoDiarioMock = [
        {
          fecha: '2024-01-01',
          creditos_usados: 50,
          cantidad_operaciones: 3,
          servicios: [
            { tipo_servicio: TipoServicioCredito.IA, creditos_usados: 30 },
            { tipo_servicio: TipoServicioCredito.API, creditos_usados: 20 }
          ]
        },
        {
          fecha: '2024-01-02',
          creditos_usados: 75,
          cantidad_operaciones: 2,
          servicios: [
            { tipo_servicio: TipoServicioCredito.REDES_SOCIALES, creditos_usados: 75 }
          ]
        }
      ];

      repositorioMock.obtenerUsoDiarioPorMes.mockResolvedValue(usoDiarioMock);

      const resultado = await servicio.obtenerUsoDiarioPorMes('tienda-456', 2024, 1);

      expect(resultado).toBe(usoDiarioMock);
      expect(repositorioMock.obtenerUsoDiarioPorMes).toHaveBeenCalledWith('tienda-456', 2024, 1);
    });

    it('debe obtener historial completo', async () => {
      const recargasMock = [
        RecargaCredito.crear({ tienda_id: 'tienda-456', monto_dolares: 10, id_pago_stripe: 'cs_test_1' })
      ];
      const usosMock = [
        CreditoUsado.crear({
          tienda_id: 'tienda-456',
          cantidad_creditos: 50,
          tipo_servicio: TipoServicioCredito.IA,
          descripcion_servicio: 'Servicio 1'
        })
      ];
      
      const historialMock = {
        recargas: recargasMock,
        usos: usosMock,
        total_recargas: 1,
        total_usos: 1
      };

      repositorioMock.obtenerHistorialCompleto.mockResolvedValue(historialMock);

      const resultado = await servicio.obtenerHistorialCompleto('tienda-456', 10, 1);

      expect(resultado).toBe(historialMock);
      expect(repositorioMock.obtenerHistorialCompleto).toHaveBeenCalledWith('tienda-456', 10, 1);
    });

    it('debe obtener recargas de la tienda', async () => {
      const recargasMock = [
        RecargaCredito.crear({ tienda_id: 'tienda-456', monto_dolares: 10, id_pago_stripe: 'cs_test_1' }),
        RecargaCredito.crear({ tienda_id: 'tienda-456', monto_dolares: 20, id_pago_stripe: 'cs_test_2' })
      ];

      repositorioMock.buscarRecargasPorTienda.mockResolvedValue(recargasMock);

      const resultado = await servicio.obtenerRecargas('tienda-456');

      expect(resultado).toBe(recargasMock);
      expect(repositorioMock.buscarRecargasPorTienda).toHaveBeenCalledWith('tienda-456');
    });

    it('debe obtener usos de créditos de la tienda', async () => {
      const usosMock = [
        CreditoUsado.crear({
          tienda_id: 'tienda-456',
          cantidad_creditos: 50,
          tipo_servicio: TipoServicioCredito.IA,
          descripcion_servicio: 'Servicio 1'
        }),
        CreditoUsado.crear({
          tienda_id: 'tienda-456',
          cantidad_creditos: 25,
          tipo_servicio: TipoServicioCredito.API,
          descripcion_servicio: 'Servicio 2'
        })
      ];

      repositorioMock.buscarUsosPorTienda.mockResolvedValue(usosMock);

      const resultado = await servicio.obtenerUsos('tienda-456');

      expect(resultado).toBe(usosMock);
      expect(repositorioMock.buscarUsosPorTienda).toHaveBeenCalledWith('tienda-456');
    });

    it('debe obtener usos por tipo de servicio', async () => {
      const usosMock = [
        CreditoUsado.crear({
          tienda_id: 'tienda-456',
          cantidad_creditos: 50,
          tipo_servicio: TipoServicioCredito.IA,
          descripcion_servicio: 'Servicio IA'
        })
      ];

      repositorioMock.buscarUsosPorTiendaYTipoServicio.mockResolvedValue(usosMock);

      const resultado = await servicio.obtenerUsosPorTipoServicio('tienda-456', TipoServicioCredito.IA);

      expect(resultado).toBe(usosMock);
      expect(repositorioMock.buscarUsosPorTiendaYTipoServicio).toHaveBeenCalledWith('tienda-456', TipoServicioCredito.IA);
    });

    it('debe obtener top servicios de consumo', async () => {
      const topServiciosMock = [
        {
          tipo_servicio: TipoServicioCredito.IA,
          total_creditos: 500,
          cantidad_operaciones: 10
        },
        {
          tipo_servicio: TipoServicioCredito.REDES_SOCIALES,
          total_creditos: 300,
          cantidad_operaciones: 5
        }
      ];

      repositorioMock.obtenerTopServiciosConsumo.mockResolvedValue(topServiciosMock);

      const resultado = await servicio.obtenerTopServiciosConsumo('tienda-456', 5);

      expect(resultado).toBe(topServiciosMock);
      expect(repositorioMock.obtenerTopServiciosConsumo).toHaveBeenCalledWith('tienda-456', 5);
    });
  });

  describe('verificarCreditosSuficientes', () => {
    it('debe verificar créditos suficientes', async () => {
      repositorioMock.verificarCreditosSuficientes.mockResolvedValue(true);

      const resultado = await servicio.verificarCreditosSuficientes('tienda-456', 100);

      expect(resultado).toBe(true);
      expect(repositorioMock.verificarCreditosSuficientes).toHaveBeenCalledWith('tienda-456', 100);
    });
  });

  describe('obtenerInformacionBalanceDetallada', () => {
    it('debe retornar información detallada del balance', async () => {
      const creditoTiendaMock = new CreditoTienda(
        'credito-123',
        'tienda-456',
        750,  // créditos disponibles
        250,  // créditos usados
        new Date('2024-01-01T00:00:00Z'),
        new Date('2024-01-01T00:00:00Z')
      );

      repositorioMock.buscarCreditoTiendaPorId.mockResolvedValue(creditoTiendaMock);

      const resultado = await servicio.obtenerInformacionBalanceDetallada('tienda-456');

      expect(resultado).toEqual({
        creditos_disponibles: 750,
        creditos_usados: 250,
        balance_total: 1000,
        tasa_conversion: '1 USD = 100 créditos',
        valor_dolar_disponible: 7.5,  // 750 / 100
        valor_dolar_usado: 2.5,       // 250 / 100
        fecha_actualizacion: creditoTiendaMock.fecha_actualizacion,
      });
    });
  });
});