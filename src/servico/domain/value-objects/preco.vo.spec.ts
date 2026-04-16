import { InvalidPriceError } from "../errors/invalid-price.error";
import { Preco } from "./preco.vo";

describe("Preco (Value Object)", () => {
  it("should create a valid Preco with a positive value", () => {
    const preco = new Preco(149.9);
    expect(preco.value).toBe(149.9);
  });

  it("should reject zero", () => {
    expect(() => new Preco(0)).toThrow(InvalidPriceError);
  });

  it("should reject negative values", () => {
    expect(() => new Preco(-10)).toThrow(InvalidPriceError);
  });

  it("should compare equality between two Preco instances", () => {
    const a = new Preco(100);
    const b = new Preco(100);
    const c = new Preco(200);

    expect(a.equals(b)).toBe(true);
    expect(a.equals(c)).toBe(false);
  });
});
