import { ServiceUnavailableException } from '@nestjs/common';
import { HealthController } from './health.controller';
import { PrismaService } from '../prisma/prisma.service';

function makePrisma(queryImpl: () => Promise<unknown>): PrismaService {
  return { $queryRaw: jest.fn(queryImpl) } as unknown as PrismaService;
}

describe('HealthController', () => {
  it('liveness returns ok with timestamp, uptime and app check', () => {
    const prisma = makePrisma(async () => [{ ok: 1 }]);
    const controller = new HealthController(prisma);

    const result = controller.liveness();

    expect(result.status).toBe('ok');
    expect(typeof result.timestamp).toBe('string');
    expect(new Date(result.timestamp).toISOString()).toBe(result.timestamp);
    expect(typeof result.uptime).toBe('number');
    expect(result.checks?.app.status).toBe('ok');
    expect(prisma.$queryRaw).not.toHaveBeenCalled();
  });

  it('readiness returns ready when the database responds', async () => {
    const controller = new HealthController(makePrisma(async () => [{ ok: 1 }]));

    await expect(controller.readiness()).resolves.toMatchObject({
      status: 'ready',
      checks: { database: { status: 'ok' } },
    });
  });

  it('readiness throws 503 with database error details when unreachable', async () => {
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
