import { OrdemDeServicoAuditLog } from './audit-log.entity';

export interface AuditLogRepository {
  create(log: OrdemDeServicoAuditLog): Promise<OrdemDeServicoAuditLog>;
  findByOrdemDeServicoId(
    ordemDeServicoId: string,
  ): Promise<OrdemDeServicoAuditLog[]>;
}

export const AUDIT_LOG_REPOSITORY = Symbol('AuditLogRepository');
