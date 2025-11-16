import { Injectable } from '@nestjs/common';

/**
 * Servicio para integración con Stripe
 * Maneja la creación de sesiones de pago y verificación de pagos
 */
@Injectable()
export class StripeService {
  private readonly stripe: any;
  private readonly webhookSecret: string;

  constructor() {
    // Inicializar Stripe con la clave secreta
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY no está definida en las variables de entorno');
    }
    this.webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
    
    // Importar Stripe dinámicamente
    this.stripe = require('stripe')(stripeSecretKey);
  }

  /**
   * Crea una sesión de pago para recarga de créditos
   */
  async crearSesionPagoRecarga(
    tiendaId: string,
    montoDolares: number,
    descripcion: string,
    metadata: Record<string, any> = {},
  ): Promise<{ id: string; url_pago: string }> {
    try {
      // Validar monto mínimo
      if (montoDolares < 5) {
        throw new Error('El monto mínimo para recargar es 5 USD');
      }

      // Calcular créditos (1 USD = 100 créditos)
      const creditos = Math.floor(montoDolares * 100);

      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `Recarga de ${creditos} créditos`,
                description: descripcion,
                metadata: {
                  tienda_id: tiendaId,
                  tipo: 'recarga_creditos',
                  ...metadata,
                },
              },
              unit_amount: Math.floor(montoDolares * 100), // Stripe usa centavos
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/creditos/recarga-exitosa?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/creditos/recarga-cancelada`,
        metadata: {
          tienda_id: tiendaId,
          monto_dolares: montoDolares.toString(),
          creditos_agregados: creditos.toString(),
          tipo: 'recarga_creditos',
          ...metadata,
        },
      });

      return {
        id: session.id,
        url_pago: session.url,
      };
    } catch (error) {
      throw new Error(`Error al crear sesión de pago: ${error.message}`);
    }
  }

  /**
   * Verifica el estado de un pago
   */
  async verificarEstadoPago(sessionId: string): Promise<{
    estado: string;
    id_pago: string;
    monto_total: number;
    metadata: Record<string, any>;
  }> {
    try {
      const session = await this.stripe.checkout.sessions.retrieve(sessionId, {
        expand: ['payment_intent'],
      });

      return {
        estado: session.payment_status,
        id_pago: session.payment_intent?.id || session.id,
        monto_total: session.amount_total ? session.amount_total / 100 : 0,
        metadata: session.metadata || {},
      };
    } catch (error) {
      throw new Error(`Error al verificar estado de pago: ${error.message}`);
    }
  }

  /**
   * Procesa un webhook de Stripe
   */
  async procesarWebhook(payload: Buffer, signature: string): Promise<any> {
    try {
      // Verificar la firma del webhook
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        this.webhookSecret,
      );

      // Procesar diferentes tipos de eventos
      switch (event.type) {
        case 'checkout.session.completed':
          return await this.procesarCheckoutCompletado(event.data.object);
        
        case 'checkout.session.expired':
          return await this.procesarCheckoutExpirado(event.data.object);
        
        case 'payment_intent.succeeded':
          return await this.procesarPagoExitoso(event.data.object);
        
        case 'payment_intent.payment_failed':
          return await this.procesarPagoFallido(event.data.object);
        
        default:
          return { tipo: event.type, procesado: false };
      }
    } catch (error) {
      throw new Error(`Error al procesar webhook: ${error.message}`);
    }
  }

  /**
   * Procesa un checkout completado
   */
  private async procesarCheckoutCompletado(session: any): Promise<any> {
    return {
      tipo: 'checkout.session.completed',
      id_sesion: session.id,
      id_pago: session.payment_intent,
      estado_pago: session.payment_status,
      metadata: session.metadata,
      procesado: true,
    };
  }

  /**
   * Procesa un checkout expirado
   */
  private async procesarCheckoutExpirado(session: any): Promise<any> {
    return {
      tipo: 'checkout.session.expired',
      id_sesion: session.id,
      metadata: session.metadata,
      procesado: true,
    };
  }

  /**
   * Procesa un pago exitoso
   */
  private async procesarPagoExitoso(paymentIntent: any): Promise<any> {
    return {
      tipo: 'payment_intent.succeeded',
      id_pago: paymentIntent.id,
      monto: paymentIntent.amount / 100,
      moneda: paymentIntent.currency,
      metadata: paymentIntent.metadata,
      procesado: true,
    };
  }

  /**
   * Procesa un pago fallido
   */
  private async procesarPagoFallido(paymentIntent: any): Promise<any> {
    return {
      tipo: 'payment_intent.payment_failed',
      id_pago: paymentIntent.id,
      monto: paymentIntent.amount / 100,
      moneda: paymentIntent.currency,
      error: paymentIntent.last_payment_error,
      metadata: paymentIntent.metadata,
      procesado: true,
    };
  }

  /**
   * Crea un reembolso
   */
  async crearReembolso(
    idPago: string,
    monto?: number,
    motivo?: string,
  ): Promise<{ id: string; estado: string; monto: number }> {
    try {
      const refund = await this.stripe.refunds.create({
        payment_intent: idPago,
        amount: monto ? Math.floor(monto * 100) : undefined,
        reason: motivo || 'requested_by_customer',
      });

      return {
        id: refund.id,
        estado: refund.status,
        monto: refund.amount / 100,
      };
    } catch (error) {
      throw new Error(`Error al crear reembolso: ${error.message}`);
    }
  }

  /**
   * Obtiene los detalles de un pago
   */
  async obtenerDetallesPago(idPago: string): Promise<any> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(idPago);
      
      return {
        id: paymentIntent.id,
        estado: paymentIntent.status,
        monto: paymentIntent.amount / 100,
        moneda: paymentIntent.currency,
        fecha_creacion: new Date(paymentIntent.created * 1000),
        metadata: paymentIntent.metadata,
        metodo_pago: paymentIntent.payment_method_types?.[0],
        descripcion: paymentIntent.description,
      };
    } catch (error) {
      throw new Error(`Error al obtener detalles de pago: ${error.message}`);
    }
  }
}