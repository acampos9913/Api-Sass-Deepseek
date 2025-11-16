import { Injectable, CanActivate, ExecutionContext, Inject } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ServicioCreditosTienda } from '../servicios/servicio-creditos-tienda';

/**
 * Decorador para especificar los créditos requeridos para un endpoint
 */
export const CREDITOS_REQUERIDOS_KEY = 'creditos_requeridos';

/**
 * Decorador para especificar el tipo de servicio que consume créditos
 */
export const TIPO_SERVICIO_KEY = 'tipo_servicio';

/**
 * Decorador para especificar créditos requeridos
 */
export function CreditosRequeridos(cantidad: number, tipoServicio?: string) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata(CREDITOS_REQUERIDOS_KEY, cantidad, descriptor.value);
    if (tipoServicio) {
      Reflect.defineMetadata(TIPO_SERVICIO_KEY, tipoServicio, descriptor.value);
    }
  };
}

/**
 * Guardia que verifica si una tienda tiene créditos suficientes
 * para ejecutar una operación específica
 */
@Injectable()
export class VerificacionCreditosGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @Inject(ServicioCreditosTienda)
    private readonly servicioCreditosTienda: ServicioCreditosTienda,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Obtener los metadatos del decorador
    const creditosRequeridos = this.reflector.get<number>(
      CREDITOS_REQUERIDOS_KEY,
      context.getHandler(),
    );

    const tipoServicio = this.reflector.get<string>(
      TIPO_SERVICIO_KEY,
      context.getHandler(),
    );

    // Si no se especificaron créditos requeridos, permitir el acceso
    if (!creditosRequeridos) {
      return true;
    }

    // Obtener la tiendaId del request
    const request = context.switchToHttp().getRequest();
    const tiendaId = this.obtenerTiendaId(request);

    if (!tiendaId) {
      throw new Error('ID de tienda no encontrado en la solicitud');
    }

    // Verificar si la tienda tiene créditos suficientes
    const tieneSuficientes = await this.servicioCreditosTienda.verificarCreditosSuficientes(
      tiendaId,
      creditosRequeridos,
    );

    if (!tieneSuficientes) {
      throw new Error(`Créditos insuficientes. Se requieren ${creditosRequeridos} créditos`);
    }

    // Si se especificó un tipo de servicio, registrar el uso de créditos
    if (tipoServicio && tieneSuficientes) {
      // Esperar a que se complete la operación para registrar el uso
      // Esto se manejará en el controlador o servicio específico
      // para evitar registrar usos en caso de error
    }

    return true;
  }

  /**
   * Extrae el ID de la tienda del request
   * Puede venir de diferentes fuentes según la implementación
   */
  private obtenerTiendaId(request: any): string | null {
    // Intentar obtener de los parámetros de ruta
    if (request.params.tiendaId) {
      return request.params.tiendaId;
    }

    // Intentar obtener del cuerpo de la solicitud
    if (request.body && request.body.tiendaId) {
      return request.body.tiendaId;
    }

    // Intentar obtener del query string
    if (request.query.tiendaId) {
      return request.query.tiendaId;
    }

    // Intentar obtener del token JWT (si está disponible)
    if (request.user && request.user.tiendaId) {
      return request.user.tiendaId;
    }

    return null;
  }

  /**
   * Método auxiliar para registrar el uso de créditos después de una operación exitosa
   */
  async registrarUsoCreditos(
    tiendaId: string,
    cantidad: number,
    tipoServicio: string,
    descripcionServicio: string,
    idReferencia?: string,
    metadata?: Record<string, any>,
  ): Promise<void> {
    try {
      await this.servicioCreditosTienda.usarCreditos(
        tiendaId,
        cantidad,
        tipoServicio as any, // Convertir al enum
        descripcionServicio,
        idReferencia,
        metadata,
      );
    } catch (error) {
      // Log del error pero no interrumpir el flujo principal
      console.error('Error al registrar uso de créditos:', error.message);
    }
  }
}