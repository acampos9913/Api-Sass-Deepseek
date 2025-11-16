import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

/**
 * Servicio para hashing seguro de contraseñas usando bcrypt
 * Implementa métodos para hashing y verificación segura
 */
@Injectable()
export class ServicioHashing {
  
  /**
   * Número de salt rounds para bcrypt (mayor = más seguro pero más lento)
   * En producción, se recomienda entre 12-15
   */
  private readonly saltRounds = 12;

  /**
   * Genera un hash seguro para una contraseña
   * @param contrasena Contraseña en texto plano
   * @returns Promise con el hash generado
   */
  async hash(contrasena: string): Promise<string> {
    try {
      return await bcrypt.hash(contrasena, this.saltRounds);
    } catch (error) {
      throw new Error(`Error al generar hash de contraseña: ${error.message}`);
    }
  }

  /**
   * Verifica si una contraseña coincide con un hash
   * @param contrasena Contraseña en texto plano a verificar
   * @param hash Hash almacenado para comparación
   * @returns Promise con boolean indicando si coinciden
   */
  async verificar(contrasena: string, hash: string): Promise<boolean> {
    try {
      return await bcrypt.compare(contrasena, hash);
    } catch (error) {
      throw new Error(`Error al verificar contraseña: ${error.message}`);
    }
  }

  /**
   * Valida la fortaleza de una contraseña según políticas de seguridad
   * @param contrasena Contraseña a validar
   * @returns Objeto con resultado de validación
   */
  validarFortalezaContrasena(contrasena: string): { valida: boolean; errores: string[] } {
    const errores: string[] = [];

    if (contrasena.length < 8) {
      errores.push('La contraseña debe tener al menos 8 caracteres');
    }

    if (!/(?=.*[a-z])/.test(contrasena)) {
      errores.push('La contraseña debe contener al menos una letra minúscula');
    }

    if (!/(?=.*[A-Z])/.test(contrasena)) {
      errores.push('La contraseña debe contener al menos una letra mayúscula');
    }

    if (!/(?=.*\d)/.test(contrasena)) {
      errores.push('La contraseña debe contener al menos un número');
    }

    if (!/(?=.*[@$!%*?&])/.test(contrasena)) {
      errores.push('La contraseña debe contener al menos un carácter especial (@$!%*?&)');
    }

    // Validación adicional: no permitir contraseñas comunes
    const contraseñasComunes = [
      'password', '12345678', 'qwerty', 'admin', 'welcome',
      'contraseña', 'password123', 'abc123', 'letmein'
    ];

    if (contraseñasComunes.includes(contrasena.toLowerCase())) {
      errores.push('La contraseña es demasiado común y no es segura');
    }

    return {
      valida: errores.length === 0,
      errores
    };
  }

  /**
   * Genera una contraseña aleatoria segura
   * @param longitud Longitud de la contraseña (default: 16)
   * @returns Contraseña aleatoria segura
   */
  generarContrasenaAleatoria(longitud: number = 16): string {
    const caracteres = {
      minusculas: 'abcdefghijklmnopqrstuvwxyz',
      mayusculas: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      numeros: '0123456789',
      especiales: '@$!%*?&'
    };

    // Asegurar al menos un carácter de cada tipo
    let contraseña = 
      this.obtenerCaracterAleatorio(caracteres.minusculas) +
      this.obtenerCaracterAleatorio(caracteres.mayusculas) +
      this.obtenerCaracterAleatorio(caracteres.numeros) +
      this.obtenerCaracterAleatorio(caracteres.especiales);

    // Completar con caracteres aleatorios
    const todosCaracteres = 
      caracteres.minusculas + caracteres.mayusculas + caracteres.numeros + caracteres.especiales;

    for (let i = contraseña.length; i < longitud; i++) {
      contraseña += this.obtenerCaracterAleatorio(todosCaracteres);
    }

    // Mezclar la contraseña para que no sea predecible
    return contraseña.split('').sort(() => Math.random() - 0.5).join('');
  }

  /**
   * Obtiene un carácter aleatorio de una cadena
   * @param cadena Cadena de caracteres
   * @returns Carácter aleatorio
   */
  private obtenerCaracterAleatorio(cadena: string): string {
    return cadena[Math.floor(Math.random() * cadena.length)];
  }
}