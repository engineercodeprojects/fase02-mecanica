export class InvalidRoleError extends Error {
  constructor(role: string) {
    super(`Role ${role} é inválido`);
    this.name = 'InvalidRoleError';
  }
}
