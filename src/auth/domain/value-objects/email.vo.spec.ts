import { InvalidEmailError } from '../errors/invalid-email.error';
import { Email } from './email.vo';

describe('Email (Value Object)', () => {
  it('should create a valid Email', () => {
    const email = new Email('user@example.com');
    expect(email.value).toBe('user@example.com');
  });

  it('should normalize email to lowercase', () => {
    const email = new Email('USER@EXAMPLE.COM');
    expect(email.value).toBe('user@example.com');
  });

  it('should reject invalid email format', () => {
    expect(() => new Email('invalid')).toThrow(InvalidEmailError);
    expect(() => new Email('a@b')).toThrow(InvalidEmailError);
    expect(() => new Email('')).toThrow(InvalidEmailError);
  });

  it('should compare equality', () => {
    expect(new Email('a@a.com').equals(new Email('A@A.COM'))).toBe(true);
    expect(new Email('a@a.com').equals(new Email('b@b.com'))).toBe(false);
  });
});
