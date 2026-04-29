import { Test, TestingModule } from '@nestjs/testing';
import { ServiceUnavailableException } from '@nestjs/common';
import { HealthController } from './health.controller';
import { PrismaService } from '../prisma/prisma.service';

describe('HealthController', () => {
  let controller: HealthController;
  let prisma: { $queryRaw: jest.Mock };

  beforeEach(async () => {
    prisma = { $queryRaw: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [{ provide: PrismaService, useValue: prisma }],
    }).compile();

    controller = module.get(HealthController);
  });

  describe('GET /health (liveness)', () => {
    it('retorna status ok com uptime e timestamp', () => {
      const result = controller.health();

      expect(result.status).toBe('ok');
      expect(result.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      expect(typeof result.uptime).toBe('number');
      expect(result.checks.app.status).toBe('ok');
    });

    it('NAO chama o banco (liveness eh independente de dependencias)', () => {
      controller.health();
      expect(prisma.$queryRaw).not.toHaveBeenCalled();
    });
  });

  describe('GET /ready (readiness)', () => {
    it('retorna ok quando o banco responde', async () => {
      prisma.$queryRaw.mockResolvedValueOnce([{ '?column?': 1 }]);

      const result = await controller.ready();

      expect(result.status).toBe('ok');
      expect(result.checks.database.status).toBe('ok');
      expect(prisma.$queryRaw).toHaveBeenCalledTimes(1);
    });

    it('lanca ServiceUnavailable quando o banco esta down', async () => {
      prisma.$queryRaw.mockRejectedValueOnce(new Error('connection refused'));

      await expect(controller.ready()).rejects.toThrow(
        ServiceUnavailableException,
      );
    });

    it('inclui mensagem de erro do banco no payload de falha', async () => {
      prisma.$queryRaw.mockRejectedValueOnce(new Error('timeout'));

      try {
        await controller.ready();
        fail('expected ServiceUnavailableException');
      } catch (err) {
        const payload = (err as ServiceUnavailableException).getResponse() as {
          checks: { database: { status: string; message: string } };
        };
        expect(payload.checks.database.status).toBe('error');
        expect(payload.checks.database.message).toBe('timeout');
      }
    });
  });
});
