import { Injectable, Logger } from '@nestjs/common';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { ConfigService } from '@nestjs/config';

/**
 * Servicio de email para envío de notificaciones y códigos de recuperación
 * Implementa Amazon SES para envío real de emails en producción
 */
@Injectable()
export class ServicioEmail {
  private readonly logger = new Logger(ServicioEmail.name);
  private readonly sesClient: SESClient;
  private readonly emailFrom: string;

  constructor(private configService: ConfigService) {
    // Configurar cliente SES con credenciales de AWS
    this.sesClient = new SESClient({
      region: this.configService.get('AWS_REGION') || 'us-east-1',
      credentials: {
        accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID') || '',
        secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY') || '',
      },
    });

    this.emailFrom = this.configService.get('EMAIL_FROM') || 'noreply@ecommerce-saas.com';
  }

  /**
   * Envía un código de recuperación de contraseña por email
   * @param destinatario Email del destinatario
   * @param codigo Código de 6 dígitos para recuperación
   * @param nombreDestinatario Nombre del destinatario (opcional)
   */
  async enviarCodigoRecuperacion(
    destinatario: string, 
    codigo: string, 
    nombreDestinatario?: string
  ): Promise<void> {
    const asunto = 'Código de recuperación de contraseña - Ecommerce SaaS';
    const contenidoHtml = this.generarContenidoCodigoRecuperacion(codigo, nombreDestinatario);
    const contenidoTexto = this.generarContenidoTextoCodigoRecuperacion(codigo, nombreDestinatario);
    
    await this.enviarEmailSES(destinatario, asunto, contenidoHtml, contenidoTexto);
  }

  /**
   * Envía una notificación de registro exitoso
   * @param destinatario Email del destinatario
   * @param nombreDestinatario Nombre del destinatario
   */
  async enviarNotificacionRegistro(
    destinatario: string,
    nombreDestinatario: string
  ): Promise<void> {
    const asunto = 'Bienvenido a Ecommerce SaaS - Registro exitoso';
    const contenidoHtml = this.generarContenidoRegistroExitoso(nombreDestinatario);
    const contenidoTexto = this.generarContenidoTextoRegistroExitoso(nombreDestinatario);
    
    await this.enviarEmailSES(destinatario, asunto, contenidoHtml, contenidoTexto);
  }

  /**
   * Envía una notificación de cambio de contraseña exitoso
   * @param destinatario Email del destinatario
   * @param nombreDestinatario Nombre del destinatario
   */
  async enviarNotificacionCambioContrasena(
    destinatario: string,
    nombreDestinatario: string
  ): Promise<void> {
    const asunto = 'Contraseña actualizada - Ecommerce SaaS';
    const contenidoHtml = this.generarContenidoCambioContrasena(nombreDestinatario);
    const contenidoTexto = this.generarContenidoTextoCambioContrasena(nombreDestinatario);
    
    await this.enviarEmailSES(destinatario, asunto, contenidoHtml, contenidoTexto);
  }

  /**
   * Método interno para enviar email usando Amazon SES
   */
  private async enviarEmailSES(
    destinatario: string, 
    asunto: string, 
    contenidoHtml: string,
    contenidoTexto: string
  ): Promise<void> {
    try {
      const command = new SendEmailCommand({
        Source: this.emailFrom,
        Destination: {
          ToAddresses: [destinatario],
        },
        Message: {
          Subject: {
            Data: asunto,
            Charset: 'UTF-8',
          },
          Body: {
            Html: {
              Data: contenidoHtml,
              Charset: 'UTF-8',
            },
            Text: {
              Data: contenidoTexto,
              Charset: 'UTF-8',
            },
          },
        },
      });

      const result = await this.sesClient.send(command);
      this.logger.log(`Email enviado exitosamente a ${destinatario}. MessageId: ${result.MessageId}`);
      
    } catch (error) {
      this.logger.error(`Error al enviar email a ${destinatario}:`, error);
      throw new Error(`No se pudo enviar el email: ${error.message}`);
    }
  }

  /**
   * Genera el contenido HTML para el código de recuperación
   */
  private generarContenidoCodigoRecuperacion(codigo: string, nombre?: string): string {
    const saludo = nombre ? `Hola ${nombre},` : 'Hola,';
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #007bff; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .code { 
            font-size: 32px; 
            font-weight: bold; 
            text-align: center; 
            letter-spacing: 8px;
            color: #007bff;
            margin: 20px 0;
            padding: 15px;
            background: white;
            border: 2px dashed #007bff;
            border-radius: 8px;
          }
          .footer { 
            padding: 20px; 
            text-align: center; 
            font-size: 12px; 
            color: #666; 
          }
          .warning { 
            background: #fff3cd; 
            border: 1px solid #ffeaa7; 
            padding: 10px; 
            border-radius: 4px; 
            margin: 15px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Ecommerce SaaS</h1>
            <p>Recuperación de Contraseña</p>
          </div>
          
          <div class="content">
            <p>${saludo}</p>
            
            <p>Has solicitado restablecer tu contraseña. Utiliza el siguiente código para completar el proceso:</p>
            
            <div class="code">${codigo}</div>
            
            <div class="warning">
              <strong>⚠️ Importante:</strong>
              <ul>
                <li>Este código expira en 15 minutos</li>
                <li>No compartas este código con nadie</li>
                <li>Si no solicitaste este cambio, ignora este mensaje</li>
              </ul>
            </div>
            
            <p>Si tienes problemas con el código, puedes solicitar uno nuevo desde la aplicación.</p>
          </div>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} Ecommerce SaaS. Todos los derechos reservados.</p>
            <p>Este es un mensaje automático, por favor no respondas a este email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Genera el contenido de texto plano para el código de recuperación
   */
  private generarContenidoTextoCodigoRecuperacion(codigo: string, nombre?: string): string {
    const saludo = nombre ? `Hola ${nombre},` : 'Hola,';
    
    return `
${saludo}

Has solicitado restablecer tu contraseña. Utiliza el siguiente código para completar el proceso:

Código: ${codigo}

⚠️ Importante:
- Este código expira en 15 minutos
- No compartas este código con nadie
- Si no solicitaste este cambio, ignora este mensaje

Si tienes problemas con el código, puedes solicitar uno nuevo desde la aplicación.

© ${new Date().getFullYear()} Ecommerce SaaS. Todos los derechos reservados.
Este es un mensaje automático, por favor no respondas a este email.
    `.trim();
  }

  /**
   * Genera el contenido HTML para registro exitoso
   */
  private generarContenidoRegistroExitoso(nombre: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #28a745; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Ecommerce SaaS</h1>
            <p>¡Bienvenido!</p>
          </div>
          
          <div class="content">
            <p>Hola ${nombre},</p>
            
            <p>¡Tu cuenta ha sido creada exitosamente!</p>
            
            <p>Ahora puedes acceder a todas las funcionalidades de nuestra plataforma de ecommerce.</p>
            
            <p><strong>Próximos pasos recomendados:</strong></p>
            <ul>
              <li>Completa tu perfil de tienda</li>
              <li>Configura tus métodos de pago</li>
              <li>Agrega tus primeros productos</li>
              <li>Personaliza el diseño de tu tienda</li>
            </ul>
            
            <p>Si necesitas ayuda, no dudes en contactar a nuestro equipo de soporte.</p>
          </div>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} Ecommerce SaaS. Todos los derechos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Genera el contenido de texto plano para registro exitoso
   */
  private generarContenidoTextoRegistroExitoso(nombre: string): string {
    return `
Hola ${nombre},

¡Tu cuenta ha sido creada exitosamente!

Ahora puedes acceder a todas las funcionalidades de nuestra plataforma de ecommerce.

Próximos pasos recomendados:
- Completa tu perfil de tienda
- Configura tus métodos de pago
- Agrega tus primeros productos
- Personaliza el diseño de tu tienda

Si necesitas ayuda, no dudes en contactar a nuestro equipo de soporte.

© ${new Date().getFullYear()} Ecommerce SaaS. Todos los derechos reservados.
    `.trim();
  }

  /**
   * Genera el contenido HTML para cambio de contraseña
   */
  private generarContenidoCambioContrasena(nombre: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #17a2b8; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 10px; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Ecommerce SaaS</h1>
            <p>Contraseña Actualizada</p>
          </div>
          
          <div class="content">
            <p>Hola ${nombre},</p>
            
            <p>Tu contraseña ha sido actualizada exitosamente.</p>
            
            <div class="warning">
              <strong>Información de seguridad:</strong>
              <p>Si no realizaste este cambio, por favor contacta inmediatamente a nuestro equipo de soporte.</p>
            </div>
            
            <p>Para mayor seguridad, te recomendamos:</p>
            <ul>
              <li>Utilizar una contraseña única y segura</li>
              <li>Habilitar la autenticación de dos factores</li>
              <li>Revisar periódicamente tu actividad de inicio de sesión</li>
            </ul>
          </div>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} Ecommerce SaaS. Todos los derechos reservados.</p>
            <p>Este es un mensaje automático, por favor no respondas a este email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Genera el contenido de texto plano para cambio de contraseña
   */
  private generarContenidoTextoCambioContrasena(nombre: string): string {
    return `
Hola ${nombre},

Tu contraseña ha sido actualizada exitosamente.

Información de seguridad:
Si no realizaste este cambio, por favor contacta inmediatamente a nuestro equipo de soporte.

Para mayor seguridad, te recomendamos:
- Utilizar una contraseña única y segura
- Habilitar la autenticación de dos factores
- Revisar periódicamente tu actividad de inicio de sesión

© ${new Date().getFullYear()} Ecommerce SaaS. Todos los derechos reservados.
Este es un mensaje automático, por favor no respondas a este email.
    `.trim();
  }
}