import { InvalidPriceError } from '../errors/invalid-price.error';

export class Preco {
  readonly value: number;

  constructor(value: number) {
    if (value <= 0) {
      throw new InvalidPriceError();
    }
    this.value = value;
  }

  equals(other: Preco): boolean {
    return this.value === other.value;
  }
}
