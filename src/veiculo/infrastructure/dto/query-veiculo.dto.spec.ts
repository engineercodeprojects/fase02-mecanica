import { plainToInstance } from 'class-transformer';
import { QueryVeiculoDto } from './query-veiculo.dto';

describe('QueryVeiculoDto', () => {
  it('should transform page and limit strings to numbers', () => {
    const dto = plainToInstance(QueryVeiculoDto, { page: '2', limit: '5' });
    expect(dto.page).toBe(2);
    expect(dto.limit).toBe(5);
  });

  it('should use default values when page and limit are not provided', () => {
    const dto = new QueryVeiculoDto();
    expect(dto.page).toBe(1);
    expect(dto.limit).toBe(10);
  });
});
