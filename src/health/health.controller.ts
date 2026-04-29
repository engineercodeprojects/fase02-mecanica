import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import { Public } from '../auth/infrastructure/decorators/public.decorator';

interface HealthResult {
  status: 'ok' | 'error';
  timestamp: string;
  uptime: number;
  checks: Record<string, { status: 'ok' | 'error'; message?: string }>;
}

@ApiTags('Health')
@Controller()
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Liveness probe — responde se o processo esta vivo.
   * Nao verifica dependencias (banco etc.); usado por k8s pra
   * decidir se o pod precisa ser reiniciado.
   */
  @Public()
  @Get('health')
  @ApiOperation({ summary: 'Liveness probe (sempre 200 enquanto o processo esta vivo)' })
  health(): HealthResult {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      checks: { app: { status: 'ok' } },
    };
  }

  /**
   * Readiness probe — verifica se as dependencias estao OK
   * (banco, etc.). Se falhar, k8s para de mandar trafego pro pod
   * mas nao reinicia.
   */
  @Public()
  @Get('ready')
  @ApiOperation({ summary: 'Readiness probe (verifica banco)' })
  async ready(): Promise<HealthResult> {
    const checks: HealthResult['checks'] = {};
    let allOk = true;

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      checks.database = { status: 'ok' };
    } catch (err) {
      allOk = false;
      checks.database = {
        status: 'error',
        message: err instanceof Error ? err.message : 'unknown',
      };
    }

    const result: HealthResult = {
      status: allOk ? 'ok' : 'error',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      checks,
    };

    if (!allOk) {
      throw new ServiceUnavailableException(result);
    }
    return result;
  }
}
