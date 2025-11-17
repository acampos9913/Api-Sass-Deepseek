import { Injectable, NestMiddleware, Inject } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import type { RepositorioMetricas } from '../../dominio/interfaces/repositorio-metricas.interface';

@Injectable()
export class MetricasMiddleware implements NestMiddleware {
  constructor(
    @Inject('RepositorioMetricas')
    private readonly repositorioMetricas: RepositorioMetricas,
  ) {}

  use(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();
    const { method, originalUrl } = req;

    // Registrar información de la request
    res.on('finish', () => {
      const tiempoRespuesta = Date.now() - startTime;
      const { statusCode } = res;

      this.repositorioMetricas.registrarRequest({
        endpoint: originalUrl,
        metodo: method,
        tiempoRespuesta,
        codigoEstado: statusCode,
        timestamp: new Date(),
      });
    });

    next();
  }
}