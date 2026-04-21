import { plainToInstance } from 'class-transformer';
import { QueryOrdemDeServicoDto } from './query-ordem-de-servico.dto';

describe('QueryOrdemDeServicoDto', () => {
  it('should transform page and limit strings to numbers', () => {
    const dto = plainToInstance(QueryOrdemDeServicoDto, { page: '2', limit: '5' });
    expect(dto.page).toBe(2);
    expect(dto.limit).toBe(5);
  });

  it('should preserve optional string fields', () => {
    const dto = plainToInstance(QueryOrdemDeServicoDto, {
      clienteId: 'uuid-123',
      status: 'RECEBIDA',
      numero: 'OS-001',
    });
    expect(dto.clienteId).toBe('uuid-123');
    expect(dto.status).toBe('RECEBIDA');
    expect(dto.numero).toBe('OS-001');
  });
});
