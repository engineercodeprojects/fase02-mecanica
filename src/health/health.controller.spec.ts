import { ServiceUnavailableException } from '@nestjs/common';
import { HealthController } from './health.controller';
import { PrismaService } from '../prisma/prisma.service';

function makePrisma(queryImpl: () => Promise<unknown>): PrismaService {
  return { $queryRaw: jest.fn(queryImpl) } as unknown as PrismaService;
}

describe('HealthController', () => {
  it('liveness returns ok with timestamp', () => {
    const controller = new HealthController(makePrisma(async () => [{ ok: 1 }]));
    const result = controller.liveness();
    expect(result.status).toBe('ok');
    expect(typeof result.timestamp).toBe('string');
    expect(() => new Date(result.timestamp)).not.toThrow();
  });

  it('readiness returns ready when the database responds', async () => {
    const controller = new HealthController(makePrisma(async () => [{ ok: 1 }]));
    await expect(controller.readiness()).resolves.toEqual({ status: 'ready' });
  });

  it('readiness throws 503 when the database is unreachable', async () => {
    const controller = new HealthController(
      makePrisma(async () => {
        throw new Error('connection refused');
      }),
    );
    await expect(controller.readiness()).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });
});
