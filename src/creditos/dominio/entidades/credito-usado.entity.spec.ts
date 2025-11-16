import { CreditoUsado } from './credito-usado.entity';
import { TipoServicioCredito } from './recarga-credito.entity';

describe('CreditoUsado', () => {
  describe('constructor', () => {
    it('debe crear una instancia válida de CreditoUsado', () => {
      const fechaUso = new Date('2024-01-01T10:00:00Z');
      const creditoUsado = new CreditoUsado(
        'credito-123',
        'tienda-456',
        50,
        TipoServicioCredito.IA,
        'Generación de descripción automática',
        'prod-789',
        { modelo: 'gpt-4', tokens: 1000 },
        fechaUso
      );

      expect(creditoUsado).toBeDefined();
      expect(creditoUsado.id).toBe('credito-123');
      expect(creditoUsado.tienda_id).toBe('tienda-456');
      expect(creditoUsado.cantidad_creditos).toBe(50);
      expect(creditoUsado.tipo_servicio).toBe(TipoServicioCredito.IA);
      expect(creditoUsado.descripcion_servicio).toBe('Generación de descripción automática');
      expect(creditoUsado.id_referencia).toBe('prod-789');
      expect(creditoUsado.metadata).toEqual({ modelo: 'gpt-4', tokens: 1000 });
      expect(creditoUsado.fecha_uso).toBe(fechaUso);
    });

    it('debe permitir id_referencia null', () => {
      const creditoUsado = new CreditoUsado(
        'credito-123',
        'tienda-456',
        25,
        TipoServicioCredito.REDES_SOCIALES,
        'Publicación en Facebook',
        null,
        { plataforma: 'facebook' },
        new Date()
      );

      expect(creditoUsado.id_referencia).toBeNull();
    });

    it('debe inicializar metadata vacío si no se proporciona', () => {
      const creditoUsado = new CreditoUsado(
        'credito-123',
        'tienda-456',
        10,
        TipoServicioCredito.API,
        'Llamada API externa',
        null,
        {},
        new Date()
      );

      expect(creditoUsado.metadata).toEqual({});
    });
  });

  describe('crear', () => {
    it('debe crear una nueva instancia con ID generado si no se proporciona', () => {
      const creditoUsado = CreditoUsado.crear({
        tienda_id: 'tienda-456',
        cantidad_creditos: 30,
        tipo_servicio: TipoServicioCredito.WEBHOOK,
        descripcion_servicio: 'Procesamiento de webhook'
      });

      expect(creditoUsado).toBeDefined();
      expect(creditoUsado.id).toMatch(/^cred_uso_\d+_[a-zA-Z0-9_-]{10}$/);
      expect(creditoUsado.tienda_id).toBe('tienda-456');
      expect(creditoUsado.cantidad_creditos).toBe(30);
      expect(creditoUsado.tipo_servicio).toBe(TipoServicioCredito.WEBHOOK);
      expect(creditoUsado.descripcion_servicio).toBe('Procesamiento de webhook');
      expect(creditoUsado.id_referencia).toBeNull();
      expect(creditoUsado.metadata).toEqual({});
      expect(creditoUsado.fecha_uso).toBeInstanceOf(Date);
    });

    it('debe usar el ID proporcionado si está disponible', () => {
      const creditoUsado = CreditoUsado.crear({
        id: 'credito-personalizado',
        tienda_id: 'tienda-456',
        cantidad_creditos: 15,
        tipo_servicio: TipoServicioCredito.OTRO,
        descripcion_servicio: 'Servicio personalizado'
      });

      expect(creditoUsado.id).toBe('credito-personalizado');
    });

    it('debe incluir id_referencia y metadata si se proporcionan', () => {
      const metadata = { detalle: 'información adicional', categoria: 'marketing' };
      const creditoUsado = CreditoUsado.crear({
        tienda_id: 'tienda-456',
        cantidad_creditos: 20,
        tipo_servicio: TipoServicioCredito.REDES_SOCIALES,
        descripcion_servicio: 'Campaña en Instagram',
        id_referencia: 'camp-123',
        metadata: metadata
      });

      expect(creditoUsado.id_referencia).toBe('camp-123');
      expect(creditoUsado.metadata).toEqual(metadata);
    });
  });

  describe('obtenerInformacionUso', () => {
    it('debe retornar la información completa del uso', () => {
      const fechaUso = new Date('2024-01-01T14:30:00Z');
      const creditoUsado = new CreditoUsado(
        'credito-123',
        'tienda-456',
        75,
        TipoServicioCredito.IA,
        'Análisis de sentimiento',
        'analisis-789',
        { modelo: 'sentiment-analysis', lenguaje: 'español' },
        fechaUso
      );

      const informacion = creditoUsado.obtenerInformacionUso();

      expect(informacion).toEqual({
        id: 'credito-123',
        tienda_id: 'tienda-456',
        cantidad_creditos: 75,
        tipo_servicio: TipoServicioCredito.IA,
        descripcion_servicio: 'Análisis de sentimiento',
        id_referencia: 'analisis-789',
        fecha_uso: fechaUso,
        hora_uso: fechaUso.toLocaleTimeString('es-PE'),
        metadata: { modelo: 'sentiment-analysis', lenguaje: 'español' }
      });
    });

    it('debe incluir hora_uso en formato español', () => {
      const fechaUso = new Date('2024-01-01T14:30:00Z');
      const creditoUsado = CreditoUsado.crear({
        tienda_id: 'tienda-456',
        cantidad_creditos: 10,
        tipo_servicio: TipoServicioCredito.API,
        descripcion_servicio: 'Consulta API',
        fecha_uso: fechaUso
      });

      const informacion = creditoUsado.obtenerInformacionUso();
      
      // Verificar que la hora está en formato español (HH:MM:SS)
      expect(informacion.hora_uso).toMatch(/^\d{1,2}:\d{2}:\d{2}$/);
    });
  });

  describe('obtenerInformacionDiaria', () => {
    it('debe retornar información para reportes diarios', () => {
      const fechaUso = new Date('2024-01-15T10:00:00Z');
      const creditoUsado = new CreditoUsado(
        'credito-123',
        'tienda-456',
        25,
        TipoServicioCredito.WEBHOOK,
        'Webhook de pedido',
        'order-789',
        {},
        fechaUso
      );

      const informacionDiaria = creditoUsado.obtenerInformacionDiaria();

      expect(informacionDiaria).toEqual({
        fecha: '2024-01-15',
        cantidad_creditos: 25,
        tipo_servicio: TipoServicioCredito.WEBHOOK,
        descripcion_servicio: 'Webhook de pedido'
      });
    });

    it('debe formatear correctamente la fecha en YYYY-MM-DD', () => {
      const fechaUso = new Date('2024-12-25T23:59:59Z');
      const creditoUsado = CreditoUsado.crear({
        tienda_id: 'tienda-456',
        cantidad_creditos: 5,
        tipo_servicio: TipoServicioCredito.OTRO,
        descripcion_servicio: 'Servicio nocturno',
        fecha_uso: fechaUso
      });

      const informacionDiaria = creditoUsado.obtenerInformacionDiaria();

      expect(informacionDiaria.fecha).toBe('2024-12-25');
    });
  });

  describe('obtenerInformacionMensual', () => {
    it('debe retornar información para reportes mensuales', () => {
      const fechaUso = new Date('2024-03-15T14:30:00Z');
      const creditoUsado = new CreditoUsado(
        'credito-123',
        'tienda-456',
        100,
        TipoServicioCredito.REDES_SOCIALES,
        'Publicación programada',
        'post-789',
        {},
        fechaUso
      );

      const informacionMensual = creditoUsado.obtenerInformacionMensual();

      expect(informacionMensual).toEqual({
        año: 2024,
        mes: 3, // Marzo es el mes 3
        cantidad_creditos: 100,
        tipo_servicio: TipoServicioCredito.REDES_SOCIALES
      });
    });

    it('debe manejar correctamente los meses (enero = 1, diciembre = 12)', () => {
      const fechaEnero = new Date('2024-01-15T10:00:00Z');
      const creditoEnero = CreditoUsado.crear({
        tienda_id: 'tienda-456',
        cantidad_creditos: 10,
        tipo_servicio: TipoServicioCredito.API,
        descripcion_servicio: 'Enero',
        fecha_uso: fechaEnero
      });

      const fechaDiciembre = new Date('2024-12-15T10:00:00Z');
      const creditoDiciembre = CreditoUsado.crear({
        tienda_id: 'tienda-456',
        cantidad_creditos: 20,
        tipo_servicio: TipoServicioCredito.IA,
        descripcion_servicio: 'Diciembre',
        fecha_uso: fechaDiciembre
      });

      expect(creditoEnero.obtenerInformacionMensual().mes).toBe(1);
      expect(creditoDiciembre.obtenerInformacionMensual().mes).toBe(12);
    });
  });

  describe('validaciones de negocio', () => {
    it('debe permitir diferentes tipos de servicio', () => {
      const servicios = Object.values(TipoServicioCredito);
      
      servicios.forEach(tipoServicio => {
        const creditoUsado = CreditoUsado.crear({
          tienda_id: 'tienda-456',
          cantidad_creditos: 10,
          tipo_servicio: tipoServicio,
          descripcion_servicio: `Servicio ${tipoServicio}`
        });

        expect(creditoUsado.tipo_servicio).toBe(tipoServicio);
        expect(servicios).toContain(creditoUsado.tipo_servicio);
      });
    });

    it('debe manejar metadata complejo correctamente', () => {
      const metadataComplejo = {
        usuario: 'user123',
        timestamp: 1700000000,
        configuracion: {
          calidad: 'alta',
          formato: 'json'
        },
        resultados: ['éxito', 'procesado']
      };

      const creditoUsado = CreditoUsado.crear({
        tienda_id: 'tienda-456',
        cantidad_creditos: 45,
        tipo_servicio: TipoServicioCredito.IA,
        descripcion_servicio: 'Procesamiento complejo',
        metadata: metadataComplejo
      });

      expect(creditoUsado.metadata).toEqual(metadataComplejo);
    });

    it('debe mantener la integridad de los datos entre métodos', () => {
      const fechaUso = new Date('2024-06-10T09:15:00Z');
      const creditoUsado = CreditoUsado.crear({
        tienda_id: 'tienda-789',
        cantidad_creditos: 60,
        tipo_servicio: TipoServicioCredito.WEBHOOK,
        descripcion_servicio: 'Integración con sistema externo',
        id_referencia: 'webhook-456',
        metadata: { origen: 'sistema-externo', version: '2.0' },
        fecha_uso: fechaUso
      });

      // Verificar consistencia entre todos los métodos
      const infoUso = creditoUsado.obtenerInformacionUso();
      const infoDiaria = creditoUsado.obtenerInformacionDiaria();
      const infoMensual = creditoUsado.obtenerInformacionMensual();

      expect(infoUso.cantidad_creditos).toBe(60);
      expect(infoDiaria.cantidad_creditos).toBe(60);
      expect(infoMensual.cantidad_creditos).toBe(60);

      expect(infoUso.tipo_servicio).toBe(TipoServicioCredito.WEBHOOK);
      expect(infoDiaria.tipo_servicio).toBe(TipoServicioCredito.WEBHOOK);
      expect(infoMensual.tipo_servicio).toBe(TipoServicioCredito.WEBHOOK);

      expect(infoDiaria.fecha).toBe('2024-06-10');
      expect(infoMensual.año).toBe(2024);
      expect(infoMensual.mes).toBe(6); // Junio es el mes 6
    });
  });
});