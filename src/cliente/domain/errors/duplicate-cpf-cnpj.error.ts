export class DuplicateCpfCnpjError extends Error {
  constructor(cpfCnpj: string) {
    super(`Ja existe um cliente com o CPF/CNPJ '${cpfCnpj}'`);
    this.name = "DuplicateCpfCnpjError";
  }
}
