import { RecargaCredito } from './recarga-credito.entity';

describe('RecargaCredito', () => {
  describe('constructor', () => {
    it('debe crear una instancia válida de RecargaCredito', () => {
      const recargaCredito = new RecargaCredito(
        'recarga-123',
        'tienda-456',
        10.50,
        1050,
        'cs_test_123',
        'PENDIENTE',
        new Date('2024-01-01T00:00:00Z'),
        new Date('2024-01-01T00:00:00Z')
      );

      expect(recargaCredito).toBeDefined();
      expect(recargaCredito.id).toBe('recarga-123');
      expect(recargaCredito.tienda_id).toBe('tienda-456');
      expect(recargaCredito.monto_dolares).toBe(10.50);
      expect(recargaCredito.creditos_agregados).toBe(1050);
      expect(recargaCredito.id_pago_stripe).toBe('cs_test_123');
      expect(recargaCredito.estado).toBe('PENDIENTE');
    });
  });

  describe('crear', () => {
    it('debe crear una nueva instancia con ID generado si no se proporciona', () => {
      const recargaCredito = RecargaCredito.crear({
        tienda_id: 'tienda-456',
        monto_dolares: 10.50,
        id_pago_stripe: 'cs_test_123'
      });

      expect(recargaCredito).toBeDefined();
      expect(recargaCredito.id).toMatch(/^recarga_\d+_[a-zA-Z0-9_-]{10}$/);
      expect(recargaCredito.tienda_id).toBe('tienda-456');
      expect(recargaCredito.monto_dolares).toBe(10.50);
      expect(recargaCredito.creditos_agregados).toBe(1050); // 10.50 * 100
      expect(recargaCredito.id_pago_stripe).toBe('cs_test_123');
      expect(recargaCredito.estado).toBe('PENDIENTE');
      expect(recargaCredito.fecha_recarga).toBeInstanceOf(Date);
      expect(recargaCredito.fecha_actualizacion).toBeInstanceOf(Date);
    });

    it('debe usar el ID proporcionado si está disponible', () => {
      const recargaCredito = RecargaCredito.crear({
        id: 'recarga-personalizada',
        tienda_id: 'tienda-456',
        monto_dolares: 5,
        id_pago_stripe: 'cs_test_456'
      });

      expect(recargaCredito.id).toBe('recarga-personalizada');
    });

    it('debe calcular correctamente los créditos agregados', () => {
      const recargaCredito = RecargaCredito.crear({
        tienda_id: 'tienda-456',
        monto_dolares: 5,
        id_pago_stripe: 'cs_test_123'
      });

      expect(recargaCredito.creditos_agregados).toBe(500); // 5 * 100

      const recargaCredito2 = RecargaCredito.crear({
        tienda_id: 'tienda-456',
        monto_dolares: 10.50,
        id_pago_stripe: 'cs_test_123'
      });

      expect(recargaCredito2.creditos_agregados).toBe(1050); // 10.50 * 100
    });
  });

  describe('marcarCompletada', () => {
    it('debe cambiar el estado a COMPLETADO y actualizar fecha', () => {
      const recargaCredito = RecargaCredito.crear({
        tienda_id: 'tienda-456',
        monto_dolares: 10,
        id_pago_stripe: 'cs_test_123'
      });

      const fechaOriginal = recargaCredito.fecha_actualizacion;
      
      recargaCredito.marcarCompletada();

      expect(recargaCredito.estado).toBe('COMPLETADO');
      expect(recargaCredito.fecha_actualizacion).not.toBe(fechaOriginal);
      expect(recargaCredito.fecha_actualizacion.getTime()).toBeGreaterThan(fechaOriginal.getTime());
    });
  });

  describe('marcarFallida', () => {
    it('debe cambiar el estado a FALLIDO y actualizar fecha', () => {
      const recargaCredito = RecargaCredito.crear({
        tienda_id: 'tienda-456',
        monto_dolares: 10,
        id_pago_stripe: 'cs_test_123'
      });

      const fechaOriginal = recargaCredito.fecha_actualizacion;
      
      recargaCredito.marcarFallida();

      expect(recargaCredito.estado).toBe('FALLIDO');
      expect(recargaCredito.fecha_actualizacion).not.toBe(fechaOriginal);
      expect(recargaCredito.fecha_actualizacion.getTime()).toBeGreaterThan(fechaOriginal.getTime());
    });
  });

  describe('validarMontoMinimo', () => {
    it('debe retornar true cuando el monto es mayor o igual a 5', () => {
      const recargaCredito = RecargaCredito.crear({
        tienda_id: 'tienda-456',
        monto_dolares: 5,
        id_pago_stripe: 'cs_test_123'
      });

      expect(recargaCredito.validarMontoMinimo()).toBe(true);

      const recargaCredito2 = RecargaCredito.crear({
        tienda_id: 'tienda-456',
        monto_dolares: 10,
        id_pago_stripe: 'cs_test_123'
      });

      expect(recargaCredito2.validarMontoMinimo()).toBe(true);
    });

    it('debe retornar false cuando el monto es menor a 5', () => {
      const recargaCredito = RecargaCredito.crear({
        tienda_id: 'tienda-456',
        monto_dolares: 4.99,
        id_pago_stripe: 'cs_test_123'
      });

      expect(recargaCredito.validarMontoMinimo()).toBe(false);

      const recargaCredito2 = RecargaCredito.crear({
        tienda_id: 'tienda-456',
        monto_dolares: 1,
        id_pago_stripe: 'cs_test_123'
      });

      expect(recargaCredito2.validarMontoMinimo()).toBe(false);
    });
  });

  describe('obtenerInformacionRecarga', () => {
    it('debe retornar la información completa de la recarga', () => {
      const recargaCredito = RecargaCredito.crear({
        tienda_id: 'tienda-456',
        monto_dolares: 10.50,
        id_pago_stripe: 'cs_test_123'
      });

      const informacion = recargaCredito.obtenerInformacionRecarga();

      expect(informacion).toEqual({
        id: recargaCredito.id,
        tienda_id: 'tienda-456',
        monto_dolares: 10.50,
        creditos_agregados: 1050,
        estado: 'PENDIENTE',
        fecha_recarga: recargaCredito.fecha_recarga,
        tasa_conversion: '1 USD = 100 créditos'
      });
    });
  });

  describe('validaciones de negocio', () => {
    it('debe mantener la relación correcta entre monto USD y créditos', () => {
      const recargaCredito = RecargaCredito.crear({
        tienda_id: 'tienda-456',
        monto_dolares: 7.25,
        id_pago_stripe: 'cs_test_123'
      });

      expect(recargaCredito.monto_dolares * 100).toBe(recargaCredito.creditos_agregados);
      expect(recargaCredito.creditos_agregados).toBe(725);
    });

    it('debe validar que el monto mínimo es 5 USD', () => {
      const recargaCreditoValida = RecargaCredito.crear({
        tienda_id: 'tienda-456',
        monto_dolares: 5,
        id_pago_stripe: 'cs_test_123'
      });

      expect(recargaCreditoValida.validarMontoMinimo()).toBe(true);

      const recargaCreditoInvalida = RecargaCredito.crear({
        tienda_id: 'tienda-456',
        monto_dolares: 4.99,
        id_pago_stripe: 'cs_test_123'
      });

      expect(recargaCreditoInvalida.validarMontoMinimo()).toBe(false);
    });
  });
});