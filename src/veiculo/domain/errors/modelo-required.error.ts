export class ModeloRequiredError extends Error {
  constructor() {
    super("Modelo do veiculo e obrigatorio");
    this.name = "ModeloRequiredError";
  }
}
