export interface ServicioExternoUsuario {
  id: string;
  proveedor: 'APPLE' | 'FACEBOOK' | 'GOOGLE';
  idExterno: string;
  emailExterno?: string;
  activo: boolean;
  fechaConexion: Date;
  fechaActualizacion: Date;
  fechaDesconexion?: Date;
}

export interface RepositorioPerfilGeneral {
  encontrarPorId(id: string): Promise<any | null>;
  actualizar(id: string, datos: any): Promise<any>;
  actualizarFoto(id: string, foto: string): Promise<any>;
  actualizarCorreo(id: string, correo: string): Promise<any>;
  actualizarTelefono(id: string, telefono: string): Promise<any>;
  vincularServicioExterno(id: string, servicio: ServicioExternoUsuario): Promise<any>;
  encontrarServiciosExternos(id: string): Promise<ServicioExternoUsuario[]>;
}