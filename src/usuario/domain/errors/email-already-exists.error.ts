export class EmailAlreadyExistsError extends Error {
  constructor(email: string) {
    super(`Email ${email} já está registrado`);
    this.name = 'EmailAlreadyExistsError';
  }
}
