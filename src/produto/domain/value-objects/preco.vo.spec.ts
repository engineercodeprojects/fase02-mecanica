import { InvalidPriceError } from '../errors/invalid-price.error';
import { Preco } from './preco.vo';

describe('Preco (Value Object - Produto)', () => {
  it('should create a valid Preco with a positive value', () => {
    const preco = new Preco(29.9);
    expect(preco.value).toBe(29.9);
  });

  it('should reject zero', () => {
    expect(() => new Preco(0)).toThrow(InvalidPriceError);
  });

  it('should reject negative values', () => {
    expect(() => new Preco(-10)).toThrow(InvalidPriceError);
  });

  it('should compare equality', () => {
    expect(new Preco(100).equals(new Preco(100))).toBe(true);
    expect(new Preco(100).equals(new Preco(200))).toBe(false);
  });
});
