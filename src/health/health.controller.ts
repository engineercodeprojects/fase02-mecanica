import {
  Controller,
  Get,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { Public } from '../auth/infrastructure/decorators/public.decorator';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('Health')
@SkipThrottle()
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Liveness probe — o processo está de pé' })
  @ApiOkResponse({ description: 'Aplicação respondendo', schema: { example: { status: 'ok', timestamp: '2024-01-01T00:00:00.000Z' } } })
  liveness(): { status: string; timestamp: string } {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  @Get('ready')
  @Public()
  @ApiOperation({ summary: 'Readiness probe — verifica conectividade com o banco' })
  @ApiOkResponse({ description: 'Banco acessível', schema: { example: { status: 'ready' } } })
  @ApiResponse({ status: 503, description: 'Banco inacessível', schema: { example: { status: 'not-ready', database: 'unreachable' } } })
  async readiness(): Promise<{ status: string }> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'ready' };
    } catch {
      throw new ServiceUnavailableException({
        status: 'not-ready',
        database: 'unreachable',
      });
    }
  }
}
