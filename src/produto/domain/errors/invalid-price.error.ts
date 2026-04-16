export class InvalidPriceError extends Error {
  constructor() {
    super('Preco deve ser um valor positivo');
    this.name = 'InvalidPriceError';
  }
}
