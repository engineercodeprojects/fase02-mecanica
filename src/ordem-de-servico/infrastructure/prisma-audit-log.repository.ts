import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { OrdemDeServicoAuditLog } from '../domain/audit-log.entity';
import { AuditLogRepository } from '../domain/audit-log.repository';

@Injectable()
export class PrismaAuditLogRepository implements AuditLogRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(log: OrdemDeServicoAuditLog): Promise<OrdemDeServicoAuditLog> {
    const record = await this.prisma.ordemDeServicoAuditLog.create({
      data: {
        ordemDeServicoId: log.ordemDeServicoId,
        acao: log.acao,
        statusAnterior: log.statusAnterior,
        statusNovo: log.statusNovo,
        usuarioId: log.usuarioId,
        metadata: log.metadata as never,
      },
    });
    return this.toDomain(record);
  }

  async findByOrdemDeServicoId(
    ordemDeServicoId: string,
  ): Promise<OrdemDeServicoAuditLog[]> {
    const records = await this.prisma.ordemDeServicoAuditLog.findMany({
      where: { ordemDeServicoId },
      orderBy: { createdAt: 'asc' },
    });
    return records.map((r) => this.toDomain(r));
  }

  private toDomain(record: {
    id: string;
    ordemDeServicoId: string;
    acao: string;
    statusAnterior: string | null;
    statusNovo: string | null;
    usuarioId: string | null;
    metadata: unknown;
    createdAt: Date;
  }): OrdemDeServicoAuditLog {
    return OrdemDeServicoAuditLog.reconstitute({
      id: record.id,
      ordemDeServicoId: record.ordemDeServicoId,
      acao: record.acao,
      statusAnterior: record.statusAnterior,
      statusNovo: record.statusNovo,
      usuarioId: record.usuarioId,
      metadata: record.metadata as Record<string, unknown> | null,
      createdAt: record.createdAt,
    });
  }
}
