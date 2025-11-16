import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from '../../../prisma/prisma.service';
import { ServicioRespuestaEstandar } from '../../comun/aplicacion/servicios/servicio-respuesta-estandar';
import { SeguridadController } from './presentacion/controladores/seguridad.controller';
import { RepositorioSeguridad } from './dominio/interfaces/repositorio-seguridad.interface';
import { PrismaRepositorioSeguridad } from './infraestructura/repositorios/prisma-repositorio-seguridad';
import { ObtenerEstadoSeguridadCasoUso } from './dominio/casos-uso/obtener-estado-seguridad.caso-uso';
import { GenerarSecretoTotpCasoUso } from './dominio/casos-uso/generar-secreto-totp.caso-uso';
import { VerificarCodigoTotpCasoUso } from './dominio/casos-uso/verificar-codigo-totp.caso-uso';
import { CrearClaveAccesoCasoUso } from './dominio/casos-uso/crear-clave-acceso.caso-uso';
import { CambiarContrasenaCasoUso } from './dominio/casos-uso/cambiar-contrasena.caso-uso';
import { AgregarCorreoSecundarioCasoUso } from './dominio/casos-uso/agregar-correo-secundario.caso-uso';
import { ActivarDesactivar2FACasoUso } from './dominio/casos-uso/activar-desactivar-2fa.caso-uso';
import { AgregarMetodoAutenticacionCasoUso } from './dominio/casos-uso/agregar-metodo-autenticacion.caso-uso';
import { CerrarSesionDispositivoCasoUso } from './dominio/casos-uso/cerrar-sesion-dispositivo.caso-uso';

@Module({
  imports: [JwtModule],
  controllers: [SeguridadController],
  providers: [
    PrismaService,
    ServicioRespuestaEstandar,
    {
      provide: 'RepositorioSeguridad',
      useClass: PrismaRepositorioSeguridad,
    },
    ObtenerEstadoSeguridadCasoUso,
    CrearClaveAccesoCasoUso,
    CambiarContrasenaCasoUso,
    AgregarCorreoSecundarioCasoUso,
    ActivarDesactivar2FACasoUso,
    AgregarMetodoAutenticacionCasoUso,
    CerrarSesionDispositivoCasoUso,
    GenerarSecretoTotpCasoUso,
    VerificarCodigoTotpCasoUso,
  ],
  exports: ['RepositorioSeguridad'],
})
export class SeguridadModule {}