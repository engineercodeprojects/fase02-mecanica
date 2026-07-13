import { CallHandler, ExecutionContext } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { CorrelationIdInterceptor } from './correlation-id.interceptor';

const buildContext = (req: any, res: any): ExecutionContext =>
  ({
    getType: () => 'http',
    switchToHttp: () => ({
      getRequest: () => req,
      getResponse: () => res,
    }),
  }) as unknown as ExecutionContext;

describe('CorrelationIdInterceptor', () => {
  let interceptor: CorrelationIdInterceptor;

  beforeEach(() => {
    interceptor = new CorrelationIdInterceptor();
  });

  it('gera um UUID quando nenhum header de correlacao vem', (done) => {
    const req: any = { headers: {}, method: 'GET', url: '/x' };
    const res: any = { statusCode: 200, setHeader: jest.fn() };
    const handler: CallHandler = { handle: () => of('body') };

    interceptor.intercept(buildContext(req, res), handler).subscribe(() => {
      expect(req.correlationId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
      );
      expect(res.setHeader).toHaveBeenCalledWith(
        'x-correlation-id',
        req.correlationId,
      );
      done();
    });
  });

  it('preserva x-correlation-id quando vem do cliente', (done) => {
    const incoming = 'incoming-cid-123';
    const req: any = {
      headers: { 'x-correlation-id': incoming },
      method: 'POST',
      url: '/y',
    };
    const res: any = { statusCode: 201, setHeader: jest.fn() };
    const handler: CallHandler = { handle: () => of('body') };

    interceptor.intercept(buildContext(req, res), handler).subscribe(() => {
      expect(req.correlationId).toBe(incoming);
      expect(res.setHeader).toHaveBeenCalledWith('x-correlation-id', incoming);
      done();
    });
  });

  it('cai pro x-request-id quando nao tem x-correlation-id', (done) => {
    const req: any = {
      headers: { 'x-request-id': 'lb-id-456' },
      method: 'GET',
      url: '/z',
    };
    const res: any = { statusCode: 200, setHeader: jest.fn() };
    const handler: CallHandler = { handle: () => of('body') };

    interceptor.intercept(buildContext(req, res), handler).subscribe(() => {
      expect(req.correlationId).toBe('lb-id-456');
      done();
    });
  });

  it('propaga o valor no logger mesmo em caso de erro', (done) => {
    const req: any = { headers: {}, method: 'GET', url: '/err' };
    const res: any = { statusCode: 500, setHeader: jest.fn() };
    const handler: CallHandler = {
      handle: () => throwError(() => new Error('boom')),
    };

    interceptor.intercept(buildContext(req, res), handler).subscribe({
      error: (err) => {
        expect((err as Error).message).toBe('boom');
        expect(req.correlationId).toBeDefined();
        done();
      },
    });
  });

  it('nao toca em request quando o context nao eh HTTP', (done) => {
    const ctx = { getType: () => 'rpc' } as unknown as ExecutionContext;
    const handler: CallHandler = { handle: () => of('rpc-body') };

    interceptor.intercept(ctx, handler).subscribe((v) => {
      expect(v).toBe('rpc-body');
      done();
    });
  });
});
