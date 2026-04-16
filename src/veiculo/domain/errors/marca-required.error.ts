export class MarcaRequiredError extends Error {
  constructor() {
    super("Marca do veiculo e obrigatoria");
    this.name = "MarcaRequiredError";
  }
}
