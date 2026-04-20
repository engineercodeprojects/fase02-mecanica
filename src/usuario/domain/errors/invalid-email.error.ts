export class InvalidEmailError extends Error {
  constructor(email: string) {
    super(`Email ${email} é inválido`);
    this.name = 'InvalidEmailError';
  }
}
