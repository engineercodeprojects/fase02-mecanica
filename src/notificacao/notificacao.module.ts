import { Logger, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClienteModule } from '../cliente/cliente.module';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificacaoService } from './application/notificacao.service';
import { OrdemDeServicoNotificacaoListener } from './application/listeners/ordem-de-servico.listener';
import { NOTIFICADOR } from './application/ports/notificador.port';
import { NOTIFICACAO_REPOSITORY } from './domain/notificacao.repository';
import { MockEmailNotificador } from './infrastructure/mock-notificador.adapter';
import { ClienteNotificacaoController } from './infrastructure/cliente-notificacao.controller';
import { NotificacaoController } from './infrastructure/notificacao.controller';
import { PrismaNotificacaoRepository } from './infrastructure/prisma-notificacao.repository';
import { WebhookNotificador } from './infrastructure/webhook-notificador.adapter';

const logger = new Logger('NotificacaoModule');

@Module({
  imports: [PrismaModule, ClienteModule],
  controllers: [NotificacaoController, ClienteNotificacaoController],
  providers: [
    NotificacaoService,
    OrdemDeServicoNotificacaoListener,
    {
      provide: NOTIFICACAO_REPOSITORY,
      useClass: PrismaNotificacaoRepository,
    },
    MockEmailNotificador,
    WebhookNotificador,
    {
      provide: NOTIFICADOR,
      useFactory: (
        config: ConfigService,
        mockEmail: MockEmailNotificador,
        webhook: WebhookNotificador,
      ) => {
        const provider = (
          config.get<string>('NOTIFICATION_PROVIDER') ??
          (config.get<string>('NODE_ENV') === 'production' ? 'webhook' : 'mock')
        ).toLowerCase();

        if (provider === 'webhook') {
          return [webhook];
        }
        if (provider !== 'mock') {
          logger.warn(
            `NOTIFICATION_PROVIDER=${provider} invalido; usando provider mock`,
          );
        }
        return [mockEmail];
      },
      inject: [ConfigService, MockEmailNotificador, WebhookNotificador],
    },
  ],
  exports: [NotificacaoService],
})
export class NotificacaoModule {}
