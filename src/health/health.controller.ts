import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { Public } from '../auth/infrastructure/decorators/public.decorator';
import { PrismaService } from '../prisma/prisma.service';

interface HealthResult {
  status: 'ok' | 'ready' | 'not-ready';
  timestamp: string;
  uptime: number;
  checks?: Record<string, { status: 'ok' | 'error'; message?: string }>;
}

@ApiTags('Health')
@SkipThrottle()
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Liveness probe - o processo esta de pe' })
  @ApiOkResponse({
    description: 'Aplicacao respondendo',
    schema: {
      example: {
        status: 'ok',
        timestamp: '2024-01-01T00:00:00.000Z',
        uptime: 123.45,
        checks: { app: { status: 'ok' } },
      },
    },
  })
  liveness(): HealthResult {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      checks: { app: { status: 'ok' } },
    };
  }

  @Get('ready')
  @Public()
  @ApiOperation({ summary: 'Readiness probe - verifica conectividade com o banco' })
  @ApiOkResponse({
    description: 'Banco acessivel',
    schema: {
      example: {
        status: 'ready',
        timestamp: '2024-01-01T00:00:00.000Z',
        uptime: 123.45,
        checks: { database: { status: 'ok' } },
      },
    },
  })
  @ApiResponse({
    status: 503,
    description: 'Banco inacessivel',
    schema: {
      example: {
        status: 'not-ready',
        timestamp: '2024-01-01T00:00:00.000Z',
        uptime: 123.45,
        checks: { database: { status: 'error', message: 'connection refused' } },
      },
    },
  })
  async readiness(): Promise<HealthResult> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        status: 'ready',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        checks: { database: { status: 'ok' } },
      };
    } catch (err) {
      throw new ServiceUnavailableException({
        status: 'not-ready',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        checks: {
          database: {
            status: 'error',
            message: err instanceof Error ? err.message : 'unknown',
          },
        },
      });
    }
  }
}
