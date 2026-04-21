import { InvalidEmailError } from './invalid-email.error';

describe('InvalidEmailError', () => {
  it('should create error with correct message', () => {
    const error = new InvalidEmailError('invalid-email');
    expect(error.message).toBe('Email invalid-email é inválido');
    expect(error.name).toBe('InvalidEmailError');
    expect(error).toBeInstanceOf(Error);
  });
});
