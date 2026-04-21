import { InvalidPriceError } from './errors/invalid-price.error';
import { InvalidQuantityError } from './errors/invalid-quantity.error';
import { InsufficientStockError } from './errors/insufficient-stock.error';
import { NameRequiredError } from './errors/name-required.error';
import { Produto } from './produto.entity';

describe('Produto (Entity)', () => {
  const validProps = {
    nome: 'Filtro de oleo',
    descricao: 'Filtro de oleo para motor',
    precoUnitario: 29.9,
    quantidadeEstoque: 50,
    estoqueMinimo: 10,
  };

  describe('create', () => {
    it('should create a valid Produto', () => {
      const produto = Produto.create(validProps);

      expect(produto.nome).toBe('Filtro de oleo');
      expect(produto.descricao).toBe('Filtro de oleo para motor');
      expect(produto.precoUnitario.value).toBe(29.9);
      expect(produto.quantidadeEstoque).toBe(50);
      expect(produto.quantidadeReservada).toBe(0);
      expect(produto.estoqueMinimo).toBe(10);
      expect(produto.ativo).toBe(true);
    });

    it('should throw when nome is empty', () => {
      expect(() => Produto.create({ ...validProps, nome: '' })).toThrow(NameRequiredError);
    });

    it('should throw when preco is zero or negative', () => {
      expect(() => Produto.create({ ...validProps, precoUnitario: 0 })).toThrow(InvalidPriceError);
      expect(() => Produto.create({ ...validProps, precoUnitario: -5 })).toThrow(InvalidPriceError);
    });

    it('should throw when quantidadeEstoque is negative', () => {
      expect(() => Produto.create({ ...validProps, quantidadeEstoque: -1 })).toThrow(InvalidQuantityError);
    });

    it('should throw when estoqueMinimo is negative', () => {
      expect(() => Produto.create({ ...validProps, estoqueMinimo: -1 })).toThrow(InvalidQuantityError);
    });

    it('should allow quantidadeEstoque and estoqueMinimo as zero', () => {
      const produto = Produto.create({ ...validProps, quantidadeEstoque: 0, estoqueMinimo: 0 });
      expect(produto.quantidadeEstoque).toBe(0);
      expect(produto.estoqueMinimo).toBe(0);
    });

    it('should allow optional descricao', () => {
      const produto = Produto.create({ ...validProps, descricao: undefined });
      expect(produto.descricao).toBeUndefined();
    });
  });

  describe('reconstitute', () => {
    it('should reconstitute from persistence data', () => {
      const produto = Produto.reconstitute({
        id: 'abc-123',
        nome: 'Pastilha de freio',
        descricao: null,
        precoUnitario: 89.9,
        quantidadeEstoque: 20,
        quantidadeReservada: 5,
        estoqueMinimo: 5,
        ativo: true,
      });

      expect(produto.id).toBe('abc-123');
      expect(produto.quantidadeReservada).toBe(5);
      expect(produto.quantidadeDisponivel).toBe(15);
    });
  });

  describe('stock management', () => {
    it('should calculate quantidadeDisponivel correctly', () => {
      const produto = Produto.reconstitute({
        id: '1',
        nome: 'Filtro',
        descricao: null,
        precoUnitario: 30,
        quantidadeEstoque: 50,
        quantidadeReservada: 10,
        estoqueMinimo: 5,
        ativo: true,
      });

      expect(produto.quantidadeDisponivel).toBe(40);
    });

    it('should reserve stock', () => {
      const produto = Produto.create(validProps);
      produto.reserve(5);

      expect(produto.quantidadeReservada).toBe(5);
      expect(produto.quantidadeDisponivel).toBe(45);
    });

    it('should throw when reserving more than available', () => {
      const produto = Produto.create(validProps);
      expect(() => produto.reserve(51)).toThrow(InsufficientStockError);
    });

    it('should release reserved stock', () => {
      const produto = Produto.create(validProps);
      produto.reserve(10);
      produto.release(5);

      expect(produto.quantidadeReservada).toBe(5);
      expect(produto.quantidadeDisponivel).toBe(45);
    });

    it('should deduct stock (consume reserved)', () => {
      const produto = Produto.create(validProps);
      produto.reserve(10);
      produto.deduct(10);

      expect(produto.quantidadeEstoque).toBe(40);
      expect(produto.quantidadeReservada).toBe(0);
    });

    it('should add stock', () => {
      const produto = Produto.create(validProps);
      produto.addStock(20);

      expect(produto.quantidadeEstoque).toBe(70);
    });
  });

  describe('low stock alert', () => {
    it('should return true when stock is at or below minimum', () => {
      const produto = Produto.create({ ...validProps, quantidadeEstoque: 10, estoqueMinimo: 10 });
      expect(produto.isLowStock()).toBe(true);
    });

    it('should return true when stock is below minimum', () => {
      const produto = Produto.create({ ...validProps, quantidadeEstoque: 5, estoqueMinimo: 10 });
      expect(produto.isLowStock()).toBe(true);
    });

    it('should return false when stock is above minimum', () => {
      const produto = Produto.create(validProps);
      expect(produto.isLowStock()).toBe(false);
    });
  });

  describe('update', () => {
    it('should update fields', () => {
      const produto = Produto.create(validProps);
      produto.update({ nome: 'Filtro premium', precoUnitario: 49.9 });

      expect(produto.nome).toBe('Filtro premium');
      expect(produto.precoUnitario.value).toBe(49.9);
    });

    it('should reject invalid preco on update', () => {
      const produto = Produto.create(validProps);
      expect(() => produto.update({ precoUnitario: -10 })).toThrow(InvalidPriceError);
    });

    it('should reject empty nome on update', () => {
      const produto = Produto.create(validProps);
      expect(() => produto.update({ nome: '' })).toThrow(NameRequiredError);
    });

    it('should update descricao when provided', () => {
      const produto = Produto.create(validProps);
      produto.update({ descricao: 'Nova descricao' });
      expect(produto.descricao).toBe('Nova descricao');
    });

    it('should update estoqueMinimo when provided', () => {
      const produto = Produto.create(validProps);
      produto.update({ estoqueMinimo: 20 });
      expect(produto.estoqueMinimo).toBe(20);
    });

    it('should throw for invalid estoqueMinimo on update', () => {
      const produto = Produto.create(validProps);
      expect(() => produto.update({ estoqueMinimo: -1 })).toThrow();
    });
  });

  describe('deactivate / activate', () => {
    it('should deactivate and activate', () => {
      const produto = Produto.create(validProps);
      produto.deactivate();
      expect(produto.ativo).toBe(false);
      produto.activate();
      expect(produto.ativo).toBe(true);
    });
  });
});
