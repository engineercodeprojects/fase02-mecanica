export class NameRequiredError extends Error {
  constructor() {
    super('Nome do usuario e obrigatorio');
    this.name = 'NameRequiredError';
  }
}
