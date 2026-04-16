export class InvalidEmailError extends Error {
  constructor() {
    super('Email invalido');
    this.name = 'InvalidEmailError';
  }
}
