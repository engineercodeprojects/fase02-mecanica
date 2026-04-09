export class InvalidEstimatedTimeError extends Error {
  constructor() {
    super('Tempo estimado deve ser um valor positivo');
    this.name = 'InvalidEstimatedTimeError';
  }
}
