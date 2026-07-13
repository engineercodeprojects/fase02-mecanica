import { Inject, Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { OsAcaoEvent } from '../../../shared/domain/events/os-acao.event';
import { OrdemDeServicoAuditLog } from '../../domain/audit-log.entity';
import {
  AUDIT_LOG_REPOSITORY,
  AuditLogRepository,
} from '../../domain/audit-log.repository';

/**
 * Escuta todas as acoes da OrdemDeServico e grava no audit log.
 *
 * Eh fire-and-forget: se a gravacao falhar, o fluxo principal nao
 * eh impactado (apenas log de erro).
 */
@Injectable()
export class OsAuditListener {
  private readonly logger = new Logger(OsAuditListener.name);

  constructor(
    @Inject(AUDIT_LOG_REPOSITORY)
    private readonly repository: AuditLogRepository,
  ) {}

  @OnEvent(OsAcaoEvent.EVENT_NAME)
  async handle(event: OsAcaoEvent): Promise<void> {
    try {
      const log = OrdemDeServicoAuditLog.create({
        ordemDeServicoId: event.ordemDeServicoId,
        acao: event.acao,
        statusAnterior: event.statusAnterior,
        statusNovo: event.statusNovo,
        usuarioId: event.usuarioId,
        metadata: event.metadata,
      });
      await this.repository.create(log);
    } catch (err) {
      this.logger.error(
        `Falha ao gravar audit log para OS ${event.numero}: ${err instanceof Error ? err.message : err}`,
      );
    }
  }
}
