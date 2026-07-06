import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { tap } from 'rxjs/operators';
import type { Observable } from 'rxjs';
import type { Request, Response } from 'express';

/**
 * Atribui um correlation ID a cada request HTTP e o propaga em
 * logs e header de resposta. Permite rastrear um fluxo end-to-end
 * mesmo quando ele cruza varios bounded contexts.
 *
 * Headers aceitos como fonte (em ordem de precedencia):
 * - x-correlation-id (custom)
 * - x-request-id (padrao de proxies/load balancers)
 *
 * Se nao vier nenhum, gera um UUID v4.
 */
@Injectable()
export class CorrelationIdInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const http = context.switchToHttp();
    const req = http.getRequest<
      Request & { correlationId?: string }
    >();
    const res = http.getResponse<Response>();

    const correlationId =
      (req.headers['x-correlation-id'] as string) ||
      (req.headers['x-request-id'] as string) ||
      randomUUID();

    req.correlationId = correlationId;
    res.setHeader('x-correlation-id', correlationId);

    const start = Date.now();
    const route = `${req.method} ${req.originalUrl ?? req.url}`;

    return next.handle().pipe(
      tap({
        next: () => {
          this.logger.log(
            `[${correlationId}] ${route} -> ${res.statusCode} (${Date.now() - start}ms)`,
          );
        },
        error: (err: Error) => {
          this.logger.error(
            `[${correlationId}] ${route} -> ERROR: ${err.message} (${Date.now() - start}ms)`,
          );
        },
      }),
    );
  }
}
