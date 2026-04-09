export class NameRequiredError extends Error {
  constructor() {
    super('Nome do servico e obrigatorio');
    this.name = 'NameRequiredError';
  }
}
