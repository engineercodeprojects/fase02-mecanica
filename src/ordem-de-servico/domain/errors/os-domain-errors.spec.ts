import { OsNaoPertenceAoClienteError } from './os-nao-pertence-ao-cliente.error';
import { InvalidDescricaoError } from './invalid-descricao.error';

describe('OS Domain Errors', () => {
  describe('OsNaoPertenceAoClienteError', () => {
    it('should create error with correct message and name', () => {
      const error = new OsNaoPertenceAoClienteError('os-123');
      expect(error.message).toContain('os-123');
      expect(error.name).toBe('OsNaoPertenceAoClienteError');
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe('InvalidDescricaoError', () => {
    it('should create error with provided message', () => {
      const error = new InvalidDescricaoError('custom message');
      expect(error.message).toBe('custom message');
      expect(error.name).toBe('InvalidDescricaoError');
    });

    it('should use default message when no argument provided', () => {
      const error = new InvalidDescricaoError();
      expect(error.message).toBe('Descricao invalida');
    });
  });
});
