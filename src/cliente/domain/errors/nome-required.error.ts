export class NomeRequiredError extends Error {
  constructor() {
    super("Nome do cliente e obrigatorio");
    this.name = "NomeRequiredError";
  }
}
