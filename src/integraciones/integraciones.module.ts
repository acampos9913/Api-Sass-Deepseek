import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ControladorIntegraciones } from './presentacion/controladores/controlador-integraciones';
import { ServicioPublicacionAutomatica } from './aplicacion/servicios/servicio-publicacion-automatica';
import { FacebookAdaptador } from './infraestructura/adaptadores/facebook.adaptador';
import { InstagramAdaptador } from './infraestructura/adaptadores/instagram.adaptador';
import { TiktokAdaptador } from './infraestructura/adaptadores/tiktok.adaptador';
import { WhatsappAdaptador } from './infraestructura/adaptadores/whatsapp.adaptador';
import { PrismaRepositorioConfiguracionRedSocial } from './infraestructura/repositorios/prisma-repositorio-configuracion-red-social';
import { TipoRedSocial } from './dominio/enums/tipo-red-social.enum';

/**
 * Módulo de Integraciones con Redes Sociales
 * 
 * Este módulo proporciona funcionalidades para:
 * - Configurar integraciones con redes sociales (Facebook, Instagram, TikTok)
 * - Publicar productos automáticamente en redes sociales
 * - Sincronizar productos entre el sistema y las plataformas externas
 * - Validar tokens y permisos de APIs externas
 * - Gestionar productos sincronizados
 */
@Module({
  imports: [
    HttpModule.register({
      timeout: 30000, // 30 segundos de timeout para requests HTTP
      maxRedirects: 5,
    }),
  ],
  controllers: [ControladorIntegraciones],
  providers: [
    ServicioPublicacionAutomatica,
    FacebookAdaptador,
    InstagramAdaptador,
    TiktokAdaptador,
    WhatsappAdaptador,
    {
      provide: 'RepositorioConfiguracionRedSocial',
      useClass: PrismaRepositorioConfiguracionRedSocial,
    },
    // Provider para inicializar los adaptadores en el servicio de publicación automática
    {
      provide: 'INITIALIZE_ADAPTADORES',
      useFactory: (
        servicioPublicacionAutomatica: ServicioPublicacionAutomatica,
        facebookAdaptador: FacebookAdaptador,
        instagramAdaptador: InstagramAdaptador,
        tiktokAdaptador: TiktokAdaptador,
        whatsappAdaptador: WhatsappAdaptador,
      ) => {
        // Registrar todos los adaptadores disponibles en el servicio de publicación automática
        servicioPublicacionAutomatica.registrarAdaptador(TipoRedSocial.FACEBOOK, facebookAdaptador);
        servicioPublicacionAutomatica.registrarAdaptador(TipoRedSocial.INSTAGRAM, instagramAdaptador);
        servicioPublicacionAutomatica.registrarAdaptador(TipoRedSocial.TIKTOK, tiktokAdaptador);
        servicioPublicacionAutomatica.registrarAdaptador(TipoRedSocial.WHATSAPP, whatsappAdaptador);
        
        return 'Adaptadores inicializados';
      },
      inject: [
        ServicioPublicacionAutomatica,
        FacebookAdaptador,
        InstagramAdaptador,
        TiktokAdaptador,
        WhatsappAdaptador,
      ],
    },
  ],
  exports: [
    ServicioPublicacionAutomatica,
    'RepositorioConfiguracionRedSocial',
  ],
})
export class IntegracionesModule {}