export class InvalidCpfCnpjError extends Error {
  constructor(value: string) {
    super(`CPF/CNPJ invalido: '${value}'`);
    this.name = "InvalidCpfCnpjError";
  }
}
