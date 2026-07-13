import { Inject, Injectable } from '@nestjs/common';
import { OrdemDeServicoAuditLog } from '../domain/audit-log.entity';
import {
  AUDIT_LOG_REPOSITORY,
  AuditLogRepository,
} from '../domain/audit-log.repository';

@Injectable()
export class AuditLogService {
  constructor(
    @Inject(AUDIT_LOG_REPOSITORY)
    private readonly repository: AuditLogRepository,
  ) {}

  async findByOrdemDeServicoId(
    ordemDeServicoId: string,
  ): Promise<OrdemDeServicoAuditLog[]> {
    return this.repository.findByOrdemDeServicoId(ordemDeServicoId);
  }
}
