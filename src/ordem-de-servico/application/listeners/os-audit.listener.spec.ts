import { Test, TestingModule } from '@nestjs/testing';
import { OsAuditListener } from './os-audit.listener';
import { AUDIT_LOG_REPOSITORY, AuditLogRepository } from '../../domain/audit-log.repository';
import { OsAcaoEvent } from '../../../shared/domain/events/os-acao.event';
import { OrdemDeServicoAuditLog } from '../../domain/audit-log.entity';

describe('OsAuditListener', () => {
  let listener: OsAuditListener;
  let repository: jest.Mocked<AuditLogRepository>;

  beforeEach(async () => {
    repository = {
      create: jest.fn().mockImplementation(async (l) => l),
      findByOrdemDeServicoId: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OsAuditListener,
        { provide: AUDIT_LOG_REPOSITORY, useValue: repository },
      ],
    }).compile();

    listener = module.get(OsAuditListener);
  });

  it('grava audit log quando recebe OsAcaoEvent', async () => {
    const event = new OsAcaoEvent(
      'os-1',
      'OS-2026-001',
      'COMPLETAR_DIAGNOSTICO',
      'EM_DIAGNOSTICO',
      'AGUARDANDO_APROVACAO',
      'usr-1',
      { auto: true },
    );

    await listener.handle(event);

    expect(repository.create).toHaveBeenCalledTimes(1);
    const arg = repository.create.mock.calls[0][0] as OrdemDeServicoAuditLog;
    expect(arg.ordemDeServicoId).toBe('os-1');
    expect(arg.acao).toBe('COMPLETAR_DIAGNOSTICO');
    expect(arg.statusAnterior).toBe('EM_DIAGNOSTICO');
    expect(arg.statusNovo).toBe('AGUARDANDO_APROVACAO');
    expect(arg.usuarioId).toBe('usr-1');
    expect(arg.metadata).toEqual({ auto: true });
  });

  it('engole erro de persistencia (nao bloqueia fluxo principal)', async () => {
    repository.create.mockRejectedValueOnce(new Error('db down'));
    const event = new OsAcaoEvent('os-1', 'OS-1', 'CRIAR', null, 'RECEBIDA', null);

    await expect(listener.handle(event)).resolves.toBeUndefined();
  });
});
