import { SetMetadata } from '@nestjs/common';
import { RolUsuario } from '../../dominio/enums/rol-usuario.enum';

/**
 * Decorador para definir los roles requeridos para acceder a un endpoint
 * @param roles - Array de roles permitidos
 * @returns Decorador de metadatos
 */
export const Roles = (...roles: RolUsuario[]) => SetMetadata('roles', roles);