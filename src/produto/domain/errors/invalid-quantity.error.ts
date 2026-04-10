export class InvalidQuantityError extends Error {
  constructor(field: string) {
    super(`${field} deve ser um valor positivo ou zero`);
    this.name = 'InvalidQuantityError';
  }
}
