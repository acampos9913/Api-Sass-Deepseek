import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO para la respuesta de producto
 * Incluye todos los campos necesarios para el frontend
 */
export class RespuestaProductoDto {
  @ApiProperty({
    description: 'ID único del producto',
    example: 'prod-123456789',
  })
  id: string;

  @ApiProperty({
    description: 'Título del producto',
    example: 'Camiseta de algodón orgánico',
  })
  titulo: string;

  @ApiPropertyOptional({
    description: 'Descripción detallada del producto',
    example: 'Camiseta 100% algodón orgánico, disponible en múltiples colores y tallas',
  })
  descripcion?: string;

  @ApiProperty({
    description: 'Precio de venta del producto',
    example: 29.99,
  })
  precio: number;

  @ApiPropertyOptional({
    description: 'Precio de comparación (precio original)',
    example: 39.99,
  })
  precioComparacion?: number;

  @ApiPropertyOptional({
    description: 'SKU único del producto',
    example: 'CAM-ALG-BLK-M',
  })
  sku?: string;

  @ApiPropertyOptional({
    description: 'Código de barras del producto',
    example: '1234567890123',
  })
  codigoBarras?: string;

  @ApiPropertyOptional({
    description: 'Peso del producto en gramos',
    example: 150,
  })
  peso?: number;

  @ApiPropertyOptional({
    description: 'Ancho del producto en centímetros',
    example: 20,
  })
  ancho?: number;

  @ApiPropertyOptional({
    description: 'Alto del producto en centímetros',
    example: 30,
  })
  alto?: number;

  @ApiPropertyOptional({
    description: 'Profundidad del producto en centímetros',
    example: 2,
  })
  profundidad?: number;

  @ApiProperty({
    description: 'Indica si el producto está visible para los clientes',
    example: true,
  })
  visible: boolean;

  @ApiProperty({
    description: 'Fecha de creación del producto',
    example: '2024-01-01T00:00:00.000Z',
  })
  fechaCreacion: Date;

  @ApiProperty({
    description: 'Fecha de última actualización del producto',
    example: '2024-01-01T00:00:00.000Z',
  })
  fechaActualizacion: Date;

  @ApiProperty({
    description: 'ID del usuario que creó el producto',
    example: 'user-123',
  })
  creadorId: string;

  @ApiProperty({
    description: 'ID de la tienda a la que pertenece el producto',
    example: 'tienda-123',
  })
  tiendaId: string;

  @ApiPropertyOptional({
    description: 'Información del proveedor',
    example: 'Proveedor XYZ',
  })
  proveedor?: string;

  @ApiProperty({
    description: 'Estado del producto',
    example: 'ACTIVO',
    enum: ['ACTIVO', 'INACTIVO', 'ARCHIVADO'],
  })
  estado: string;

  @ApiProperty({
    description: 'Indica si el producto es visible en la tienda online',
    example: true,
  })
  visibleTiendaOnline: boolean;

  @ApiProperty({
    description: 'Indica si el producto es visible en el punto de venta',
    example: true,
  })
  visiblePointOfSale: boolean;

  @ApiProperty({
    description: 'Tipo de producto',
    example: 'FISICO',
    enum: ['FISICO', 'DIGITAL', 'SERVICIO'],
  })
  tipoProducto: string;

  @ApiProperty({
    description: 'Indica si el producto requiere envío',
    example: true,
  })
  requiereEnvio: boolean;

  @ApiProperty({
    description: 'Indica si el inventario es gestionado',
    example: true,
  })
  inventarioGestionado: boolean;

  @ApiProperty({
    description: 'Cantidad disponible en inventario',
    example: 100,
  })
  cantidadInventario: number;

  @ApiProperty({
    description: 'Indica si se permite backorder',
    example: false,
  })
  permiteBackorder: boolean;

  @ApiPropertyOptional({
    description: 'Tags del producto para búsqueda y filtrado',
    example: ['nuevo', 'algodón', 'orgánico'],
    type: [String],
  })
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Metatítulo para SEO',
    example: 'Camiseta de algodón orgánico | Tienda Online',
  })
  metatitulo?: string;

  @ApiPropertyOptional({
    description: 'Metadescripción para SEO',
    example: 'Compra nuestra camiseta de algodón orgánico 100% natural. Disponible en múltiples colores y tallas.',
  })
  metadescripcion?: string;

  @ApiPropertyOptional({
    description: 'Slug del producto para URLs amigables',
    example: 'camiseta-algodon-organico',
  })
  slug?: string;

  @ApiPropertyOptional({
    description: 'Fecha de publicación del producto',
    example: '2024-01-01T00:00:00.000Z',
  })
  fechaPublicacion?: Date;

  @ApiPropertyOptional({
    description: 'Fecha de archivado del producto',
    example: '2024-12-31T00:00:00.000Z',
  })
  fechaArchivado?: Date;

  @ApiPropertyOptional({
    description: 'Fecha de eliminación del producto',
    example: '2025-12-31T00:00:00.000Z',
  })
  fechaEliminado?: Date;

  @ApiProperty({
    description: 'Indica si el producto tiene descuento',
    example: true,
  })
  tieneDescuento: boolean;

  @ApiPropertyOptional({
    description: 'Porcentaje de descuento aplicado',
    example: 25,
  })
  porcentajeDescuento?: number;

  @ApiProperty({
    description: 'Indica si el producto está disponible para la venta',
    example: true,
  })
  estaDisponible: boolean;

  @ApiProperty({
    description: 'Indica si el producto está publicado',
    example: true,
  })
  estaPublicado: boolean;

  @ApiPropertyOptional({
    description: 'URL de la imagen principal del producto',
    example: 'https://ejemplo.com/imagenes/camiseta-algodon.jpg',
  })
  imagenPrincipal?: string;

  @ApiPropertyOptional({
    description: 'URLs de las imágenes adicionales del producto',
    example: [
      'https://ejemplo.com/imagenes/camiseta-algodon-1.jpg',
      'https://ejemplo.com/imagenes/camiseta-algodon-2.jpg'
    ],
    type: [String],
  })
  imagenesAdicionales?: string[];

  @ApiPropertyOptional({
    description: 'Categorías a las que pertenece el producto',
    example: [
      { id: 'cat-123', nombre: 'Ropa' },
      { id: 'cat-456', nombre: 'Camisetas' }
    ],
  })
  categorias?: Array<{ id: string; nombre: string }>;

  @ApiPropertyOptional({
    description: 'Colecciones a las que pertenece el producto',
    example: [
      { id: 'col-123', nombre: 'Nueva Colección' },
      { id: 'col-456', nombre: 'Ofertas' }
    ],
  })
  colecciones?: Array<{ id: string; nombre: string }>;

  @ApiPropertyOptional({
    description: 'Variantes del producto (tallas, colores, etc.)',
    example: [
      {
        id: 'var-123',
        nombre: 'Talla M - Negro',
        sku: 'CAM-ALG-BLK-M',
        precio: 29.99,
        cantidadInventario: 50,
        atributos: { talla: 'M', color: 'Negro' }
      }
    ],
  })
  variantes?: Array<{
    id: string;
    nombre: string;
    sku: string;
    precio: number;
    cantidadInventario: number;
    atributos: Record<string, string>;
  }>;

  @ApiPropertyOptional({
    description: 'Total de ventas del producto',
    example: 150,
  })
  totalVentas?: number;

  @ApiPropertyOptional({
    description: 'Promedio de calificaciones del producto',
    example: 4.5,
  })
  promedioCalificacion?: number;

  @ApiPropertyOptional({
    description: 'Total de reseñas del producto',
    example: 25,
  })
  totalResenas?: number;
}