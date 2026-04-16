export class TelefoneRequiredError extends Error {
  constructor() {
    super("Telefone do cliente e obrigatorio");
    this.name = "TelefoneRequiredError";
  }
}
