import { CreditoTienda } from './credito-tienda.entity';

describe('CreditoTienda Entity', () => {
  describe('Creación', () => {
    it('debe crear una instancia con valores por defecto', () => {
      const creditoTienda = CreditoTienda.crear({
        tienda_id: 'tienda_123',
        creditos_disponibles: 100,
        creditos_usados: 50,
      });

      expect(creditoTienda).toBeInstanceOf(CreditoTienda);
      expect(creditoTienda.id).toBeDefined();
      expect(creditoTienda.tienda_id).toBe('tienda_123');
      expect(creditoTienda.creditos_disponibles).toBe(100);
      expect(creditoTienda.creditos_usados).toBe(50);
      expect(creditoTienda.fecha_creacion).toBeInstanceOf(Date);
      expect(creditoTienda.fecha_actualizacion).toBeInstanceOf(Date);
    });

    it('debe crear una instancia con balance cero cuando no se especifican créditos', () => {
      const creditoTienda = CreditoTienda.crear({
        tienda_id: 'tienda_123',
      });

      expect(creditoTienda.creditos_disponibles).toBe(0);
      expect(creditoTienda.creditos_usados).toBe(0);
    });
  });

  describe('Métodos de negocio', () => {
    let creditoTienda: CreditoTienda;

    beforeEach(() => {
      creditoTienda = CreditoTienda.crear({
        tienda_id: 'tienda_123',
        creditos_disponibles: 100,
        creditos_usados: 50,
      });
    });

    it('debe agregar créditos correctamente', () => {
      creditoTienda.agregarCreditos(50);

      expect(creditoTienda.creditos_disponibles).toBe(150);
      expect(creditoTienda.creditos_usados).toBe(50); // No cambia
      expect(creditoTienda.fecha_actualizacion).not.toBe(creditoTienda.fecha_creacion);
    });

    it('debe consumir créditos correctamente', () => {
      creditoTienda.consumirCreditos(30);

      expect(creditoTienda.creditos_disponibles).toBe(70);
      expect(creditoTienda.creditos_usados).toBe(80);
      expect(creditoTienda.fecha_actualizacion).not.toBe(creditoTienda.fecha_creacion);
    });

    it('debe lanzar error al consumir más créditos de los disponibles', () => {
      expect(() => {
        creditoTienda.consumirCreditos(150);
      }).toThrow('Créditos insuficientes');
    });

    it('debe verificar correctamente si tiene créditos suficientes', () => {
      expect(creditoTienda.tieneCreditosSuficientes(50)).toBe(true);
      expect(creditoTienda.tieneCreditosSuficientes(100)).toBe(true);
      expect(creditoTienda.tieneCreditosSuficientes(101)).toBe(false);
    });

    it('debe calcular el balance total correctamente', () => {
      expect(creditoTienda.obtenerBalanceTotal()).toBe(150);
    });

    it('debe actualizar la fecha de actualización al modificar créditos', () => {
      const fechaOriginal = creditoTienda.fecha_actualizacion;
      
      // Esperar un poco para asegurar diferencia de tiempo
      setTimeout(() => {
        creditoTienda.agregarCreditos(10);
        expect(creditoTienda.fecha_actualizacion).not.toBe(fechaOriginal);
        expect(creditoTienda.fecha_actualizacion.getTime()).toBeGreaterThan(fechaOriginal.getTime());
      }, 10);
    });
  });

  describe('Validaciones', () => {
    it('debe lanzar error al crear con créditos negativos', () => {
      expect(() => {
        CreditoTienda.crear({
          tienda_id: 'tienda_123',
          creditos_disponibles: -10,
          creditos_usados: -5,
        });
      }).toThrow('Los créditos no pueden ser negativos');
    });

    it('debe lanzar error al agregar créditos negativos', () => {
      const creditoTienda = CreditoTienda.crear({
        tienda_id: 'tienda_123',
        creditos_disponibles: 100,
      });

      expect(() => {
        creditoTienda.agregarCreditos(-10);
      }).toThrow('La cantidad de créditos a agregar debe ser positiva');
    });

    it('debe lanzar error al consumir créditos negativos', () => {
      const creditoTienda = CreditoTienda.crear({
        tienda_id: 'tienda_123',
        creditos_disponibles: 100,
      });

      expect(() => {
        creditoTienda.consumirCreditos(-10);
      }).toThrow('La cantidad de créditos a consumir debe ser positiva');
    });
  });
});