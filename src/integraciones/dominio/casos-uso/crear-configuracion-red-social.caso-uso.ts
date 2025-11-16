import { Injectable } from '@nestjs/common';
import { ConfiguracionRedSocial } from '../entidades/configuracion-red-social.entity';
import { TipoRedSocial } from '../enums/tipo-red-social.enum';
import type { RepositorioConfiguracionRedSocial } from '../interfaces/repositorio-configuracion-red-social.interface';
import { ServicioRespuestaEstandar } from '../../../comun/aplicacion/servicios/servicio-respuesta-estandar';
import { ExcepcionDominio } from '../../../comun/excepciones/excepcion-dominio';
import type { RespuestaEstandar } from '../../../comun/aplicacion/servicios/servicio-respuesta-estandar';
import { nanoid } from 'nanoid';

/**
 * Datos necesarios para crear una configuración de red social
 */
interface CrearConfiguracionRedSocialDto {
  tienda_id: string;
  tipo_red_social: TipoRedSocial;
  nombre_cuenta: string;
  token_acceso: string;
  token_renovacion?: string;
  fecha_expiracion_token?: Date;
  configuracion_adicional?: Record<string, any>;
}

/**
 * Caso de uso para crear una configuración de integración con red social
 * Gestiona la lógica de negocio para conectar una tienda con una red social
 */
@Injectable()
export class CrearConfiguracionRedSocialCasoUso {
  constructor(
    private readonly repositorioConfiguracionRedSocial: RepositorioConfiguracionRedSocial,
  ) {}

  /**
   * Ejecuta el caso de uso para crear una configuración de red social
   * @param datos - Datos para crear la configuración
   * @returns Respuesta con la configuración creada o error
   */
  async ejecutar(datos: CrearConfiguracionRedSocialDto): Promise<RespuestaEstandar> {
    // Validar datos de entrada
    const erroresValidacion = this.validarDatosEntrada(datos);
    if (erroresValidacion.length > 0) {
      throw ExcepcionDominio.Respuesta400(
        `Datos de entrada inválidos: ${erroresValidacion.join(', ')}`,
        'IntegracionRedSocial.DatosInvalidos'
      );
    }

      // Verificar si ya existe una configuración activa para esta tienda y red social
      const existeConfiguracionActiva = await this.repositorioConfiguracionRedSocial.existeActivaPorTiendaYTipo(
        datos.tienda_id,
        datos.tipo_red_social
      );

    if (existeConfiguracionActiva) {
      throw ExcepcionDominio.Respuesta400(
        `Ya existe una configuración activa para ${datos.tipo_red_social} en esta tienda`,
        'IntegracionRedSocial.ConfiguracionActivaExistente'
      );
    }

      // Verificar si ya existe una configuración con el mismo nombre de cuenta
      const existeConNombreCuenta = await this.repositorioConfiguracionRedSocial.existeConNombreCuenta(
        datos.nombre_cuenta,
        datos.tipo_red_social
      );

    if (existeConNombreCuenta) {
      throw ExcepcionDominio.Respuesta400(
        `Ya existe una configuración con el nombre de cuenta "${datos.nombre_cuenta}" para ${datos.tipo_red_social}`,
        'IntegracionRedSocial.NombreCuentaExistente'
      );
    }

      // Validar token con la API de la red social
      const validacionToken = await this.validarTokenConRedSocial(datos);
    if (!validacionToken.valido) {
      throw ExcepcionDominio.Respuesta400(
        validacionToken.mensaje || 'Token de acceso inválido o expirado',
        'IntegracionRedSocial.TokenInvalido'
      );
    }

      // Generar ID único para la configuración
      const id = this.generarIdUnico();

      // Crear la entidad de configuración
      const configuracion = ConfiguracionRedSocial.crear({
        id,
        tienda_id: datos.tienda_id,
        tipo_red_social: datos.tipo_red_social,
        nombre_cuenta: datos.nombre_cuenta,
        token_acceso: datos.token_acceso,
        token_renovacion: datos.token_renovacion,
        fecha_expiracion_token: datos.fecha_expiracion_token,
        configuracion_adicional: {
          ...datos.configuracion_adicional,
          ...validacionToken.datosAdicionales,
        },
        activa: true,
      });

      // Validar la entidad
      configuracion.validar();

      // Guardar en el repositorio
      const configuracionGuardada = await this.repositorioConfiguracionRedSocial.guardar(configuracion);

    return ServicioRespuestaEstandar.Respuesta201(
      `Configuración de ${datos.tipo_red_social} creada exitosamente`,
      configuracionGuardada,
      'IntegracionRedSocial.ConfiguracionCreada'
    );
  }

  /**
   * Valida los datos de entrada
   * @param datos - Datos a validar
   * @returns Array de mensajes de error
   */
  private validarDatosEntrada(datos: CrearConfiguracionRedSocialDto): string[] {
    const errores: string[] = [];

    if (!datos.tienda_id) {
      errores.push('El ID de la tienda es requerido');
    }

    if (!datos.tipo_red_social) {
      errores.push('El tipo de red social es requerido');
    } else if (!Object.values(TipoRedSocial).includes(datos.tipo_red_social)) {
      errores.push('El tipo de red social no es válido');
    }

    if (!datos.nombre_cuenta) {
      errores.push('El nombre de la cuenta es requerido');
    } else if (datos.nombre_cuenta.length < 3) {
      errores.push('El nombre de la cuenta debe tener al menos 3 caracteres');
    }

    if (!datos.token_acceso) {
      errores.push('El token de acceso es requerido');
    } else if (datos.token_acceso.length < 10) {
      errores.push('El token de acceso parece ser inválido');
    }

    // Validar fecha de expiración si se proporciona
    if (datos.fecha_expiracion_token && datos.fecha_expiracion_token <= new Date()) {
      errores.push('La fecha de expiración del token no puede ser en el pasado');
    }

    return errores;
  }

  /**
   * Valida el token con la API de la red social correspondiente
   * @param datos - Datos de la configuración
   * @returns Resultado de la validación
   */
  private async validarTokenConRedSocial(datos: CrearConfiguracionRedSocialDto): Promise<{
    valido: boolean;
    mensaje?: string;
    datosAdicionales?: Record<string, any>;
  }> {
    try {
      // En una implementación real, aquí se haría una llamada a la API de la red social
      // para validar que el token es válido y obtener información adicional
      
      switch (datos.tipo_red_social) {
        case TipoRedSocial.FACEBOOK:
          return await this.validarTokenFacebook(datos);
        
        case TipoRedSocial.INSTAGRAM:
          return await this.validarTokenInstagram(datos);
        
        case TipoRedSocial.TIKTOK:
          return await this.validarTokenTikTok(datos);
        
        case TipoRedSocial.GOOGLE:
          return await this.validarTokenGoogle(datos);
        
        default:
          throw ExcepcionDominio.Respuesta400(
            `Tipo de red social no soportado: ${datos.tipo_red_social}`,
            'IntegracionRedSocial.TipoNoSoportado'
          );
      }
    } catch (error) {
      console.error(`Error validando token con ${datos.tipo_red_social}:`, error);
      throw ExcepcionDominio.Respuesta400(
        `Error al validar el token con ${datos.tipo_red_social}: ${error.message}`,
        'IntegracionRedSocial.ErrorValidacionToken'
      );
    }
  }

  /**
   * Valida token de Facebook usando Facebook Graph API
   * Realiza una llamada real a la API para verificar la validez del token
   * y obtener información de la página de negocio conectada
   */
  private async validarTokenFacebook(datos: CrearConfiguracionRedSocialDto): Promise<{
    valido: boolean;
    mensaje?: string;
    datosAdicionales?: Record<string, any>;
  }> {
    try {
      // Validar token básico con Facebook Graph API
      const respuesta = await fetch(
        `https://graph.facebook.com/v19.0/me?fields=id,name,email&access_token=${datos.token_acceso}`
      );

      if (!respuesta.ok) {
        const errorData = await respuesta.json().catch(() => ({}));
        throw ExcepcionDominio.Respuesta400(
          `Token de Facebook inválido: ${errorData.error?.message || 'Error de autenticación'}`,
          'IntegracionRedSocial.TokenFacebookInvalido'
        );
      }

      const datosUsuario = await respuesta.json();

      // Obtener páginas de Facebook administradas por el usuario
      const respuestaPaginas = await fetch(
        `https://graph.facebook.com/v19.0/me/accounts?fields=id,name,category,access_token,perms&access_token=${datos.token_acceso}`
      );

      if (!respuestaPaginas.ok) {
        throw ExcepcionDominio.Respuesta400(
          'No se pudieron obtener las páginas de Facebook administradas',
          'IntegracionRedSocial.PaginasFacebookNoObtenidas'
        );
      }

      const datosPaginas = await respuestaPaginas.json();
      const paginas = datosPaginas.data || [];

      // Verificar permisos de las páginas
      const paginasConPermisos = paginas.map((pagina: any) => ({
        id: pagina.id,
        nombre: pagina.name,
        categoria: pagina.category,
        permisos: pagina.perms || [],
        tiene_permisos_publicacion: pagina.perms?.includes('CREATE_CONTENT') && pagina.perms?.includes('MANAGE')
      }));

      // Verificar que al menos una página tenga permisos de publicación
      const paginasPublicables = paginasConPermisos.filter((pagina: any) => pagina.tiene_permisos_publicacion);
      
      if (paginasPublicables.length === 0) {
        throw ExcepcionDominio.Respuesta400(
          'No se encontraron páginas de Facebook con permisos de publicación. Se requieren permisos CREATE_CONTENT y MANAGE.',
          'IntegracionRedSocial.PermisosFacebookInsuficientes'
        );
      }

      // Obtener permisos del token de usuario
      const respuestaPermisos = await fetch(
        `https://graph.facebook.com/v19.0/me/permissions?access_token=${datos.token_acceso}`
      );

      let permisosUsuario: string[] = [];
      if (respuestaPermisos.ok) {
        const datosPermisos = await respuestaPermisos.json();
        permisosUsuario = datosPermisos.data?.map((permiso: any) => permiso.permission) || [];
      }

      return {
        valido: true,
        datosAdicionales: {
          id_usuario_facebook: datosUsuario.id,
          nombre_usuario: datosUsuario.name,
          email: datosUsuario.email,
          paginas_administradas: paginasConPermisos,
          paginas_publicables: paginasPublicables,
          permisos_usuario: permisosUsuario,
          api_version: 'v19.0',
          fecha_validacion: new Date().toISOString(),
          valido_hasta: datos.fecha_expiracion_token || this.calcularFechaExpiracionPredeterminada()
        }
      };
    } catch (error) {
      console.error('Error validando token de Facebook:', error);
      throw ExcepcionDominio.Respuesta400(
        `Error de conexión con Facebook: ${error.message}`,
        'IntegracionRedSocial.ErrorConexionFacebook'
      );
    }
  }

  /**
   * Valida token de Instagram usando Instagram Graph API
   * Realiza una llamada real a la API para verificar la validez del token
   * y obtener información adicional de la cuenta
   */
  private async validarTokenInstagram(datos: CrearConfiguracionRedSocialDto): Promise<{
    valido: boolean;
    mensaje?: string;
    datosAdicionales?: Record<string, any>;
  }> {
    try {
      // Validar token con Instagram Graph API
      const respuesta = await fetch(
        `https://graph.instagram.com/me?fields=id,username,account_type,media_count,followers_count,follows_count&access_token=${datos.token_acceso}`
      );

      if (!respuesta.ok) {
        const errorData = await respuesta.json().catch(() => ({}));
        throw ExcepcionDominio.Respuesta400(
          `Token de Instagram inválido: ${errorData.error?.message || 'Error de autenticación'}`,
          'IntegracionRedSocial.TokenInstagramInvalido'
        );
      }

      const datosCuenta = await respuesta.json();

      // Verificar permisos adicionales necesarios para publicar
      const respuestaPermisos = await fetch(
        `https://graph.instagram.com/me/permissions?access_token=${datos.token_acceso}`
      );

      let permisos: string[] = [];
      if (respuestaPermisos.ok) {
        const datosPermisos = await respuestaPermisos.json();
        permisos = datosPermisos.data?.map((permiso: any) => permiso.permission) || [];
      }

      // Verificar que la cuenta tenga los permisos mínimos requeridos
      const permisosRequeridos = ['instagram_basic', 'pages_show_list'];
      const permisosFaltantes = permisosRequeridos.filter(permiso => !permisos.includes(permiso));
      
      if (permisosFaltantes.length > 0) {
        throw ExcepcionDominio.Respuesta400(
          `Permisos insuficientes. Se requieren: ${permisosFaltantes.join(', ')}`,
          'IntegracionRedSocial.PermisosInstagramInsuficientes'
        );
      }

      // Obtener páginas de Instagram conectadas (para cuentas de negocio)
      let paginasInstagram: any[] = [];
      try {
        const respuestaPaginas = await fetch(
          `https://graph.instagram.com/me/accounts?access_token=${datos.token_acceso}`
        );
        
        if (respuestaPaginas.ok) {
          const datosPaginas = await respuestaPaginas.json();
          paginasInstagram = datosPaginas.data || [];
        }
      } catch (error) {
        console.warn('No se pudieron obtener las páginas de Instagram:', error);
      }

      return {
        valido: true,
        datosAdicionales: {
          id_cuenta_instagram: datosCuenta.id,
          nombre_usuario: datosCuenta.username,
          tipo_cuenta: datosCuenta.account_type || 'PERSONAL',
          cantidad_media: datosCuenta.media_count || 0,
          seguidores: datosCuenta.followers_count || 0,
          siguiendo: datosCuenta.follows_count || 0,
          permisos_otorgados: permisos,
          paginas_conectadas: paginasInstagram,
          api_version: 'v19.0',
          fecha_validacion: new Date().toISOString(),
          valido_hasta: datos.fecha_expiracion_token || this.calcularFechaExpiracionPredeterminada()
        }
      };
    } catch (error) {
      console.error('Error validando token de Instagram:', error);
      throw ExcepcionDominio.Respuesta400(
        `Error de conexión con Instagram: ${error.message}`,
        'IntegracionRedSocial.ErrorConexionInstagram'
      );
    }
  }

  /**
   * Valida token de TikTok usando TikTok Business API
   * Realiza una llamada real a la API para verificar la validez del token
   * y obtener información del perfil de negocio
   */
  private async validarTokenTikTok(datos: CrearConfiguracionRedSocialDto): Promise<{
    valido: boolean;
    mensaje?: string;
    datosAdicionales?: Record<string, any>;
  }> {
    try {
      // Validar token con TikTok Business API - Obtener información del usuario
      const respuesta = await fetch(
        'https://business-api.tiktok.com/open_api/v1.3/user/info/',
        {
          method: 'GET',
          headers: {
            'Access-Token': datos.token_acceso,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!respuesta.ok) {
        const errorData = await respuesta.json().catch(() => ({}));
        throw ExcepcionDominio.Respuesta400(
          `Token de TikTok inválido: ${errorData.message || 'Error de autenticación'}`,
          'IntegracionRedSocial.TokenTikTokInvalido'
        );
      }

      const datosUsuario = await respuesta.json();

      // Verificar que la respuesta contenga datos válidos
      if (!datosUsuario.data || !datosUsuario.data.user) {
        throw ExcepcionDominio.Respuesta400(
          'Respuesta inválida de TikTok Business API',
          'IntegracionRedSocial.RespuestaTikTokInvalida'
        );
      }

      const usuario = datosUsuario.data.user;

      // Obtener información de las cuentas de TikTok administradas
      const respuestaCuentas = await fetch(
        'https://business-api.tiktok.com/open_api/v1.3/tt_user/info/',
        {
          method: 'GET',
          headers: {
            'Access-Token': datos.token_acceso,
            'Content-Type': 'application/json'
          }
        }
      );

      let cuentasTikTok: any[] = [];
      if (respuestaCuentas.ok) {
        const datosCuentas = await respuestaCuentas.json();
        cuentasTikTok = datosCuentas.data?.tt_user || [];
      }

      // Verificar permisos de publicación
      const tienePermisosPublicacion = usuario.scopes?.includes('video.upload') ||
                                      usuario.scopes?.includes('video.publish');

      if (!tienePermisosPublicacion) {
        throw ExcepcionDominio.Respuesta400(
          'El token no tiene permisos de publicación de videos. Se requieren permisos video.upload o video.publish.',
          'IntegracionRedSocial.PermisosTikTokInsuficientes'
        );
      }

      return {
        valido: true,
        datosAdicionales: {
          id_usuario_tiktok: usuario.open_id,
          nombre_display: usuario.display_name,
          nombre_usuario: usuario.username,
          avatar: usuario.avatar_url,
          scopes: usuario.scopes || [],
          cuentas_conectadas: cuentasTikTok,
          tipo_cuenta: usuario.is_business ? 'BUSINESS' : 'PERSONAL',
          verificada: usuario.is_verified,
          api_version: 'v1.3',
          fecha_validacion: new Date().toISOString(),
          valido_hasta: datos.fecha_expiracion_token || this.calcularFechaExpiracionPredeterminada()
        }
      };
    } catch (error) {
      console.error('Error validando token de TikTok:', error);
      throw ExcepcionDominio.Respuesta400(
        `Error de conexión con TikTok: ${error.message}`,
        'IntegracionRedSocial.ErrorConexionTikTok'
      );
    }
  }

  /**
   * Valida token de Google
   */
  private async validarTokenGoogle(datos: CrearConfiguracionRedSocialDto): Promise<{
    valido: boolean;
    mensaje?: string;
    datosAdicionales?: Record<string, any>;
  }> {
    // Simulación de validación con Google API
    // En producción, se haría una llamada real a:
    // GET https://www.googleapis.com/oauth2/v1/tokeninfo?access_token={token}
    
    return {
      valido: true,
      datosAdicionales: {
        api_version: 'v1',
        permisos: ['https://www.googleapis.com/auth/youtube.upload'],
        tipo_cuenta: 'CHANNEL'
      }
    };
  }

  /**
   * Genera un ID único para la configuración usando nanoid
   * @returns ID único
   */
  private generarIdUnico(): string {
    return `config_rs_${nanoid(16)}`;
  }

  /**
   * Calcula una fecha de expiración predeterminada (60 días desde ahora)
   * para tokens que no especifican fecha de expiración
   * @returns Fecha de expiración predeterminada
   */
  private calcularFechaExpiracionPredeterminada(): Date {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() + 60); // 60 días por defecto para tokens de Instagram
    return fecha;
  }
}