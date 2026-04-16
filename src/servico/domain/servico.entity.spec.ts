import { NameRequiredError } from './errors/name-required.error';
import { InvalidPriceError } from './errors/invalid-price.error';
import { InvalidEstimatedTimeError } from './errors/invalid-estimated-time.error';
import { Servico } from './servico.entity';

describe('Servico (Entity)', () => {
  const validProps = {
    nome: 'Troca de oleo',
    descricao: 'Troca de oleo do motor com filtro',
    precoBase: 149.9,
    tempoEstimadoHoras: 1.5,
  };

  describe('creation', () => {
    it('should create a valid Servico', () => {
      const servico = Servico.create(validProps);

      expect(servico.nome).toBe('Troca de oleo');
      expect(servico.descricao).toBe('Troca de oleo do motor com filtro');
      expect(servico.precoBase.value).toBe(149.9);
      expect(servico.tempoEstimadoHoras).toBe(1.5);
      expect(servico.ativo).toBe(true);
    });

    it('should throw when nome is empty', () => {
      expect(() => Servico.create({ ...validProps, nome: '' })).toThrow(
        NameRequiredError,
      );
    });

    it('should throw when preco is zero', () => {
      expect(() => Servico.create({ ...validProps, precoBase: 0 })).toThrow(
        InvalidPriceError,
      );
    });

    it('should throw when preco is negative', () => {
      expect(() => Servico.create({ ...validProps, precoBase: -50 })).toThrow(
        InvalidPriceError,
      );
    });

    it('should throw when tempoEstimadoHoras is zero or negative', () => {
      expect(() =>
        Servico.create({ ...validProps, tempoEstimadoHoras: 0 }),
      ).toThrow(InvalidEstimatedTimeError);

      expect(() =>
        Servico.create({ ...validProps, tempoEstimadoHoras: -1 }),
      ).toThrow(InvalidEstimatedTimeError);
    });

    it('should allow optional descricao', () => {
      const servico = Servico.create({ ...validProps, descricao: undefined });
      expect(servico.descricao).toBeUndefined();
    });
  });

  describe('reconstitute', () => {
    it('should reconstitute from persistence data', () => {
      const servico = Servico.reconstitute({
        id: 'abc-123',
        nome: 'Alinhamento',
        descricao: null,
        precoBase: 80,
        tempoEstimadoHoras: 0.5,
        ativo: false,
      });

      expect(servico.id).toBe('abc-123');
      expect(servico.nome).toBe('Alinhamento');
      expect(servico.descricao).toBeNull();
      expect(servico.precoBase.value).toBe(80);
      expect(servico.ativo).toBe(false);
    });
  });

  describe('update', () => {
    it('should update fields', () => {
      const servico = Servico.create(validProps);
      servico.update({ nome: 'Troca de oleo sintetico', precoBase: 199.9 });

      expect(servico.nome).toBe('Troca de oleo sintetico');
      expect(servico.precoBase.value).toBe(199.9);
    });

    it('should reject invalid preco on update', () => {
      const servico = Servico.create(validProps);
      expect(() => servico.update({ precoBase: -10 })).toThrow(
        InvalidPriceError,
      );
    });

    it('should reject empty nome on update', () => {
      const servico = Servico.create(validProps);
      expect(() => servico.update({ nome: '' })).toThrow(
        NameRequiredError,
      );
    });
  });

  describe('deactivate / activate', () => {
    it('should deactivate a servico', () => {
      const servico = Servico.create(validProps);
      servico.deactivate();
      expect(servico.ativo).toBe(false);
    });

    it('should activate a servico', () => {
      const servico = Servico.create(validProps);
      servico.deactivate();
      servico.activate();
      expect(servico.ativo).toBe(true);
    });
  });
});
