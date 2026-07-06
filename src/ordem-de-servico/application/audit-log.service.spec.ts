import { Test, TestingModule } from '@nestjs/testing';
import { AuditLogService } from './audit-log.service';
import { AUDIT_LOG_REPOSITORY, AuditLogRepository } from '../domain/audit-log.repository';

describe('AuditLogService', () => {
  let service: AuditLogService;
  let repository: jest.Mocked<AuditLogRepository>;

  beforeEach(async () => {
    repository = {
      create: jest.fn(),
      findByOrdemDeServicoId: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditLogService,
        { provide: AUDIT_LOG_REPOSITORY, useValue: repository },
      ],
    }).compile();

    service = module.get(AuditLogService);
  });

  it('delega findByOrdemDeServicoId ao repository', async () => {
    repository.findByOrdemDeServicoId.mockResolvedValueOnce([]);

    await service.findByOrdemDeServicoId('os-1');

    expect(repository.findByOrdemDeServicoId).toHaveBeenCalledWith('os-1');
  });
});
