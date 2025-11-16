import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  HttpCode, 
  UsePipes, 
  ValidationPipe 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { GestionEnvioEntregaCasoUso } from '../../dominio/casos-uso/gestion-envio-entrega.caso-uso';
import { 
  ConfiguracionEnvioEntregaDto,
  ActualizarConfiguracionEnvioEntregaDto,
  CrearPerfilEnvioDto,
  ActualizarPerfilEnvioDto,
  TipoEntregaEnum
} from '../../aplicacion/dto/configuracion-envio-entrega.dto';

/**
 * Controlador para gestión de configuración de envío y entrega
 * Expone endpoints RESTful para todas las operaciones relacionadas con envíos
 */
@ApiTags('Configuración - Envío y Entrega')
@Controller('configuracion/envio-entrega')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class ControladorEnvioEntrega {
  constructor(
    private readonly gestionEnvioEntregaCasoUso: GestionEnvioEntregaCasoUso
  ) {}

  /**
   * Obtener configuración completa de envío y entrega
   */
  @Get(':tiendaId')
  @ApiOperation({ 
    summary: 'Obtener configuración de envío y entrega',
    description: 'Obtiene la configuración completa de envío y entrega para una tienda específica'
  })
  @ApiParam({ name: 'tiendaId', description: 'ID de la tienda', example: 'tienda-123' })
  @ApiResponse({ 
    status: 200, 
    description: 'Configuración obtenida exitosamente',
    schema: {
      example: {
        mensaje: 'Configuración de envío y entrega obtenida exitosamente',
        data: {
          perfiles_envio: [
            {
              id: 'perfil-123',
              nombre_perfil: 'Envío Express',
              zonas_envio: [
                {
                  pais: 'Perú',
                  region: 'Lima',
                  codigos_postales: ['15001', '15002']
                }
              ],
              tarifas: [
                {
                  tipo: 'fija',
                  monto: 15.50
                }
              ],
              productos: ['prod-123', 'prod-456'],
              fecha_creacion: '2024-01-01T00:00:00.000Z',
              fecha_actualizacion: '2024-01-01T00:00:00.000Z'
            }
          ],
          metodos_entrega: [
            {
              id: 'metodo-123',
              tipo_entrega: 'envio_nacional',
              activo: true,
              fecha_creacion: '2024-01-01T00:00:00.000Z',
              fecha_actualizacion: '2024-01-01T00:00:00.000Z'
            }
          ],
          embalajes: [
            {
              id: 'embalaje-123',
              tipo_embalaje: 'caja',
              dimensiones: { largo: 30, ancho: 20, alto: 10 },
              peso: 500,
              es_predeterminado: true,
              fecha_creacion: '2024-01-01T00:00:00.000Z',
              fecha_actualizacion: '2024-01-01T00:00:00.000Z'
            }
          ],
          proveedores_transporte: [
            {
              id: 'proveedor-123',
              proveedor_transporte: 'DHL Express',
              cuenta_proveedor: 'cuenta-dhl-123',
              activo: true,
              fecha_creacion: '2024-01-01T00:00:00.000Z',
              fecha_actualizacion: '2024-01-01T00:00:00.000Z'
            }
          ],
          plantillas_documentacion: [
            {
              id: 'plantilla-123',
              nota_entrega_template: '<p>Gracias por su compra</p>',
              nombre_tienda_etiqueta: 'Mi Tienda Online',
              fecha_creacion: '2024-01-01T00:00:00.000Z',
              fecha_actualizacion: '2024-01-01T00:00:00.000Z'
            }
          ]
        },
        tipo_mensaje: 'Proceso.Exito',
        estado_respuesta: 200
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Configuración no encontrada',
    schema: {
      example: {
        mensaje: 'Configuración de envío y entrega no encontrada',
        data: null,
        tipo_mensaje: 'EnvioEntrega.ConfiguracionNoEncontrada',
        estado_respuesta: 404
      }
    }
  })
  async obtenerConfiguracion(@Param('tiendaId') tiendaId: string) {
    return await this.gestionEnvioEntregaCasoUso.obtenerConfiguracion(tiendaId);
  }

  /**
   * Crear configuración de envío y entrega
   */
  @Post(':tiendaId')
  @HttpCode(201)
  @ApiOperation({ 
    summary: 'Crear configuración de envío y entrega',
    description: 'Crea una nueva configuración de envío y entrega para una tienda'
  })
  @ApiParam({ name: 'tiendaId', description: 'ID de la tienda', example: 'tienda-123' })
  @ApiResponse({ 
    status: 201, 
    description: 'Configuración creada exitosamente',
    schema: {
      example: {
        mensaje: 'Configuración de envío y entrega creada exitosamente',
        data: {
          perfiles_envio: [],
          metodos_entrega: [],
          embalajes: [],
          proveedores_transporte: [],
          plantillas_documentacion: []
        },
        tipo_mensaje: 'Proceso.Exito',
        estado_respuesta: 201
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Ya existe configuración para esta tienda',
    schema: {
      example: {
        mensaje: 'Ya existe una configuración de envío y entrega para esta tienda',
        data: null,
        tipo_mensaje: 'EnvioEntrega.ConfiguracionExistente',
        estado_respuesta: 400
      }
    }
  })
  async crearConfiguracion(
    @Param('tiendaId') tiendaId: string,
    @Body() datos: ConfiguracionEnvioEntregaDto
  ) {
    return await this.gestionEnvioEntregaCasoUso.crearConfiguracion(tiendaId, datos);
  }

  /**
   * Actualizar configuración de envío y entrega
   */
  @Put(':tiendaId')
  @ApiOperation({ 
    summary: 'Actualizar configuración de envío y entrega',
    description: 'Actualiza la configuración existente de envío y entrega para una tienda'
  })
  @ApiParam({ name: 'tiendaId', description: 'ID de la tienda', example: 'tienda-123' })
  @ApiResponse({ 
    status: 200, 
    description: 'Configuración actualizada exitosamente'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Configuración no encontrada'
  })
  async actualizarConfiguracion(
    @Param('tiendaId') tiendaId: string,
    @Body() datos: ActualizarConfiguracionEnvioEntregaDto
  ) {
    return await this.gestionEnvioEntregaCasoUso.actualizarConfiguracion(tiendaId, datos);
  }

  /**
   * Eliminar configuración de envío y entrega
   */
  @Delete(':tiendaId')
  @ApiOperation({ 
    summary: 'Eliminar configuración de envío y entrega',
    description: 'Elimina la configuración de envío y entrega de una tienda'
  })
  @ApiParam({ name: 'tiendaId', description: 'ID de la tienda', example: 'tienda-123' })
  @ApiResponse({ 
    status: 200, 
    description: 'Configuración eliminada exitosamente'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Configuración no encontrada'
  })
  async eliminarConfiguracion(@Param('tiendaId') tiendaId: string) {
    return await this.gestionEnvioEntregaCasoUso.eliminarConfiguracion(tiendaId);
  }

  /**
   * Gestión de perfiles de envío
   */

  /**
   * Agregar perfil de envío
   */
  @Post(':tiendaId/perfiles')
  @HttpCode(201)
  @ApiOperation({ 
    summary: 'Agregar perfil de envío',
    description: 'Agrega un nuevo perfil de envío a la configuración existente'
  })
  @ApiParam({ name: 'tiendaId', description: 'ID de la tienda', example: 'tienda-123' })
  @ApiResponse({ 
    status: 201, 
    description: 'Perfil de envío agregado exitosamente'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Configuración no encontrada'
  })
  async agregarPerfilEnvio(
    @Param('tiendaId') tiendaId: string,
    @Body() datos: CrearPerfilEnvioDto
  ) {
    return await this.gestionEnvioEntregaCasoUso.agregarPerfilEnvio(tiendaId, datos);
  }

  /**
   * Actualizar perfil de envío
   */
  @Put(':tiendaId/perfiles/:idPerfil')
  @ApiOperation({ 
    summary: 'Actualizar perfil de envío',
    description: 'Actualiza un perfil de envío existente'
  })
  @ApiParam({ name: 'tiendaId', description: 'ID de la tienda', example: 'tienda-123' })
  @ApiParam({ name: 'idPerfil', description: 'ID del perfil de envío', example: 'perfil-123' })
  @ApiResponse({ 
    status: 200, 
    description: 'Perfil de envío actualizado exitosamente'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Configuración o perfil no encontrado'
  })
  async actualizarPerfilEnvio(
    @Param('tiendaId') tiendaId: string,
    @Param('idPerfil') idPerfil: string,
    @Body() datos: ActualizarPerfilEnvioDto
  ) {
    return await this.gestionEnvioEntregaCasoUso.actualizarPerfilEnvio(tiendaId, idPerfil, datos);
  }

  /**
   * Eliminar perfil de envío
   */
  @Delete(':tiendaId/perfiles/:idPerfil')
  @ApiOperation({ 
    summary: 'Eliminar perfil de envío',
    description: 'Elimina un perfil de envío existente'
  })
  @ApiParam({ name: 'tiendaId', description: 'ID de la tienda', example: 'tienda-123' })
  @ApiParam({ name: 'idPerfil', description: 'ID del perfil de envío', example: 'perfil-123' })
  @ApiResponse({ 
    status: 200, 
    description: 'Perfil de envío eliminado exitosamente'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Configuración o perfil no encontrado'
  })
  async eliminarPerfilEnvio(
    @Param('tiendaId') tiendaId: string,
    @Param('idPerfil') idPerfil: string
  ) {
    return await this.gestionEnvioEntregaCasoUso.eliminarPerfilEnvio(tiendaId, idPerfil);
  }

  /**
   * Gestión de métodos de entrega
   */

  /**
   * Activar/desactivar método de entrega
   */
  @Put(':tiendaId/metodos-entrega/:tipo/toggle')
  @ApiOperation({ 
    summary: 'Activar/desactivar método de entrega',
    description: 'Activa o desactiva un método de entrega específico'
  })
  @ApiParam({ name: 'tiendaId', description: 'ID de la tienda', example: 'tienda-123' })
  @ApiParam({ 
    name: 'tipo', 
    description: 'Tipo de método de entrega', 
    enum: TipoEntregaEnum,
    example: 'envio_nacional'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Estado del método de entrega cambiado exitosamente'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Configuración o método no encontrado'
  })
  async toggleMetodoEntrega(
    @Param('tiendaId') tiendaId: string,
    @Param('tipo') tipo: TipoEntregaEnum,
    @Body('activar') activar: boolean
  ) {
    return await this.gestionEnvioEntregaCasoUso.toggleMetodoEntrega(tiendaId, tipo, activar);
  }

  /**
   * Obtener métodos de entrega activos
   */
  @Get(':tiendaId/metodos-entrega/activos')
  @ApiOperation({ 
    summary: 'Obtener métodos de entrega activos',
    description: 'Obtiene todos los métodos de entrega que están actualmente activos'
  })
  @ApiParam({ name: 'tiendaId', description: 'ID de la tienda', example: 'tienda-123' })
  @ApiResponse({ 
    status: 200, 
    description: 'Métodos de entrega activos obtenidos exitosamente'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Configuración no encontrada'
  })
  async obtenerMetodosEntregaActivos(@Param('tiendaId') tiendaId: string) {
    return await this.gestionEnvioEntregaCasoUso.obtenerMetodosEntregaActivos(tiendaId);
  }

  /**
   * Gestión de embalajes
   */

  /**
   * Establecer embalaje predeterminado
   */
  @Put(':tiendaId/embalajes/:idEmbalaje/predeterminado')
  @ApiOperation({ 
    summary: 'Establecer embalaje predeterminado',
    description: 'Establece un embalaje específico como predeterminado'
  })
  @ApiParam({ name: 'tiendaId', description: 'ID de la tienda', example: 'tienda-123' })
  @ApiParam({ name: 'idEmbalaje', description: 'ID del embalaje', example: 'embalaje-123' })
  @ApiResponse({ 
    status: 200, 
    description: 'Embalaje predeterminado establecido exitosamente'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Configuración o embalaje no encontrado'
  })
  async establecerEmbalajePredeterminado(
    @Param('tiendaId') tiendaId: string,
    @Param('idEmbalaje') idEmbalaje: string
  ) {
    return await this.gestionEnvioEntregaCasoUso.establecerEmbalajePredeterminado(tiendaId, idEmbalaje);
  }

  /**
   * Obtener embalaje predeterminado
   */
  @Get(':tiendaId/embalajes/predeterminado')
  @ApiOperation({ 
    summary: 'Obtener embalaje predeterminado',
    description: 'Obtiene el embalaje actualmente establecido como predeterminado'
  })
  @ApiParam({ name: 'tiendaId', description: 'ID de la tienda', example: 'tienda-123' })
  @ApiResponse({ 
    status: 200, 
    description: 'Embalaje predeterminado obtenido exitosamente'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Configuración o embalaje no encontrado'
  })
  async obtenerEmbalajePredeterminado(@Param('tiendaId') tiendaId: string) {
    return await this.gestionEnvioEntregaCasoUso.obtenerEmbalajePredeterminado(tiendaId);
  }

  /**
   * Gestión de proveedores de transporte
   */

  /**
   * Activar/desactivar proveedor de transporte
   */
  @Put(':tiendaId/proveedores-transporte/:idProveedor/toggle')
  @ApiOperation({ 
    summary: 'Activar/desactivar proveedor de transporte',
    description: 'Activa o desactiva un proveedor de transporte específico'
  })
  @ApiParam({ name: 'tiendaId', description: 'ID de la tienda', example: 'tienda-123' })
  @ApiParam({ name: 'idProveedor', description: 'ID del proveedor', example: 'proveedor-123' })
  @ApiResponse({ 
    status: 200, 
    description: 'Estado del proveedor de transporte cambiado exitosamente'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Configuración o proveedor no encontrado'
  })
  async toggleProveedorTransporte(
    @Param('tiendaId') tiendaId: string,
    @Param('idProveedor') idProveedor: string,
    @Body('activar') activar: boolean
  ) {
    return await this.gestionEnvioEntregaCasoUso.toggleProveedorTransporte(tiendaId, idProveedor, activar);
  }

  /**
   * Obtener proveedores de transporte activos
   */
  @Get(':tiendaId/proveedores-transporte/activos')
  @ApiOperation({ 
    summary: 'Obtener proveedores de transporte activos',
    description: 'Obtiene todos los proveedores de transporte que están actualmente activos'
  })
  @ApiParam({ name: 'tiendaId', description: 'ID de la tienda', example: 'tienda-123' })
  @ApiResponse({ 
    status: 200, 
    description: 'Proveedores de transporte activos obtenidos exitosamente'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Configuración no encontrada'
  })
  async obtenerProveedoresTransporteActivos(@Param('tiendaId') tiendaId: string) {
    return await this.gestionEnvioEntregaCasoUso.obtenerProveedoresTransporteActivos(tiendaId);
  }
}