export class DuplicateNameError extends Error {
  constructor(nome: string) {
    super(`Ja existe um servico com o nome '${nome}'`);
    this.name = 'DuplicateNameError';
  }
}
