import { plainToInstance } from 'class-transformer';
import { QueryProdutoDto } from './query-produto.dto';

describe('QueryProdutoDto', () => {
  it('should transform page and limit strings to numbers', () => {
    const dto = plainToInstance(QueryProdutoDto, { page: '3', limit: '15' });
    expect(dto.page).toBe(3);
    expect(dto.limit).toBe(15);
  });

  it('should use default values when page and limit are not provided', () => {
    const dto = new QueryProdutoDto();
    expect(dto.page).toBe(1);
    expect(dto.limit).toBe(10);
  });
});
