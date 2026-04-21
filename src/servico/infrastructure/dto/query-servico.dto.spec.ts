import { plainToInstance } from 'class-transformer';
import { QueryServicoDto } from './query-servico.dto';

describe('QueryServicoDto', () => {
  it('should transform page and limit strings to numbers', () => {
    const dto = plainToInstance(QueryServicoDto, { page: '2', limit: '20' });
    expect(dto.page).toBe(2);
    expect(dto.limit).toBe(20);
  });

  it('should use default values when page and limit are not provided', () => {
    const dto = new QueryServicoDto();
    expect(dto.page).toBe(1);
    expect(dto.limit).toBe(10);
  });
});
