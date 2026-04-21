import { plainToInstance } from 'class-transformer';
import { QueryUsuarioDto } from './query-usuario.dto';

describe('QueryUsuarioDto', () => {
  it('should transform page and limit strings to numbers', () => {
    const dto = plainToInstance(QueryUsuarioDto, { page: '2', limit: '5' });
    expect(dto.page).toBe(2);
    expect(dto.limit).toBe(5);
  });

  it('should transform ativo true string to boolean', () => {
    const dto = plainToInstance(QueryUsuarioDto, { ativo: 'true' });
    expect(dto.ativo).toBe(true);
  });

  it('should transform ativo boolean value directly', () => {
    const dto = plainToInstance(QueryUsuarioDto, { ativo: false });
    expect(dto.ativo).toBe(false);
  });

  it('should preserve role string field', () => {
    const dto = plainToInstance(QueryUsuarioDto, { role: 'MECANICO' });
    expect(dto.role).toBe('MECANICO');
  });
});
