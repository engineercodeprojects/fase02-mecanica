export class NameRequiredError extends Error {
  constructor() {
    super('Nome do produto e obrigatorio');
    this.name = 'NameRequiredError';
  }
}
