import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ServicoModule } from './servico/servico.module';
import { ProdutoModule } from './produto/produto.module';
import { ClienteModule } from './cliente/cliente.module';
import { VeiculoModule } from './veiculo/veiculo.module';
import { OrdemDeServicoModule } from './ordem-de-servico/ordem-de-servico.module';
import { UsuarioModule } from './usuario/usuario.module';
import { NotificacaoModule } from './notificacao/notificacao.module';
import { HealthModule } from './health/health.module';
import { CorrelationIdInterceptor } from './shared/infrastructure/correlation-id.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    EventEmitterModule.forRoot(),
    // Rate limit: 60 reqs / 60s por IP no default global
    // Endpoints sensiveis (auth/login) podem ter limites mais restritos via @Throttle
    ThrottlerModule.forRoot([
      { name: 'default', ttl: 60_000, limit: 60 },
    ]),
    PrismaModule,
    AuthModule,
    UsuarioModule,
    ServicoModule,
    ProdutoModule,
    ClienteModule,
    VeiculoModule,
    OrdemDeServicoModule,
    NotificacaoModule,
    HealthModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_INTERCEPTOR, useClass: CorrelationIdInterceptor },
  ],
})
export class AppModule {}
