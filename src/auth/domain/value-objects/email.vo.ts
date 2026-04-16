import { InvalidEmailError } from '../errors/invalid-email.error';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class Email {
  readonly value: string;

  constructor(value: string) {
    if (!value || !EMAIL_REGEX.test(value)) {
      throw new InvalidEmailError();
    }
    this.value = value.toLowerCase();
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }
}
