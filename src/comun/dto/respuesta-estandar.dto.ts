import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para respuesta estándar de la API
 * Sigue el estándar definido en las reglas de codificación
 */
export class RespuestaEstandarDto<T> {
  @ApiProperty({
    description: 'Mensaje descriptivo de la respuesta',
    example: 'Operación completada exitosamente',
  })
  mensaje: string;

  @ApiProperty({
    description: 'Datos de la respuesta (puede ser null en caso de error)',
    example: null,
    nullable: true,
  })
  data: T | null;

  @ApiProperty({
    description: 'Tipo de mensaje que indica la categoría del resultado',
    enum: [
      'Exito',
      'ErrorCliente',
      'ErrorServidor', 
      'Advertencia',
      'Autenticacion.TokenRequerido',
      'Autenticacion.OrigenInvalido',
      'Autenticacion.DominioNoAutorizado',
      'Autenticacion.TokenInvalido',
      'Producto.BusquedaError',
      'Producto.BusquedaIdError',
      'Producto.BusquedaSlugError',
      'Producto.BusquedaTextoError',
      'Producto.BusquedaMasVendidosError',
      'Producto.BusquedaMejorCalificadosError',
    ],
    example: 'Exito',
  })
  tipo_mensaje: string;

  @ApiProperty({
    description: 'Estado interno de la respuesta (código HTTP semántico)',
    example: 200,
    minimum: 100,
    maximum: 599,
  })
  estado_respuesta: number;
}

/**
 * DTO para respuestas con paginación
 */
export class RespuestaPaginadaDto<T> {
  @ApiProperty({
    description: 'Mensaje descriptivo de la respuesta',
    example: 'Productos obtenidos exitosamente',
  })
  mensaje: string;

  @ApiProperty({
    description: 'Datos de la respuesta con paginación',
    example: {
      productos: [],
      paginacion: {
        totalElementos: 100,
        totalPaginas: 5,
        paginaActual: 1,
        limite: 20,
        tieneSiguiente: true,
        tieneAnterior: false,
      },
    },
  })
  data: {
    productos: T[];
    paginacion: {
      totalElementos: number;
      totalPaginas: number;
      paginaActual: number;
      limite: number;
      tieneSiguiente: boolean;
      tieneAnterior: boolean;
    };
  };

  @ApiProperty({
    description: 'Tipo de mensaje',
    example: 'Exito',
  })
  tipo_mensaje: string;

  @ApiProperty({
    description: 'Estado interno de la respuesta',
    example: 200,
  })
  estado_respuesta: number;
}

/**
 * DTO para respuestas de error de validación
 */
export class RespuestaErrorValidacionDto {
  @ApiProperty({
    description: 'Mensaje de error de validación',
    example: 'Error de validación en los datos enviados',
  })
  mensaje: string;

  @ApiProperty({
    description: 'Detalles de los errores de validación',
    example: {
      errores: [
        {
          campo: 'titulo',
          mensaje: 'El título es requerido',
          valor: '',
        },
        {
          campo: 'precio',
          mensaje: 'El precio debe ser mayor a 0',
          valor: -10,
        },
      ],
    },
  })
  data: {
    errores: Array<{
      campo: string;
      mensaje: string;
      valor: any;
    }>;
  };

  @ApiProperty({
    description: 'Tipo de mensaje de error',
    example: 'ErrorCliente',
  })
  tipo_mensaje: string;

  @ApiProperty({
    description: 'Estado interno de la respuesta',
    example: 400,
  })
  estado_respuesta: number;
}

/**
 * DTO para respuestas de error de autenticación
 */
export class RespuestaErrorAutenticacionDto {
  @ApiProperty({
    description: 'Mensaje de error de autenticación',
    example: 'Token de autorización requerido',
  })
  mensaje: string;

  @ApiProperty({
    description: 'Datos adicionales del error (null en producción)',
    example: null,
    nullable: true,
  })
  data: null;

  @ApiProperty({
    description: 'Tipo de mensaje de autenticación',
    example: 'Autenticacion.TokenRequerido',
  })
  tipo_mensaje: string;

  @ApiProperty({
    description: 'Estado interno de la respuesta',
    example: 401,
  })
  estado_respuesta: number;
}