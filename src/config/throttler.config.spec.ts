import {
  THROTTLER_LIMIT,
  THROTTLER_TTL_MS,
  shouldSkipThrottling,
} from './throttler.config';

describe('throttler.config', () => {
  describe('shouldSkipThrottling', () => {
    it('nao ignora o throttler num ambiente de producao limpo', () => {
      expect(shouldSkipThrottling({ NODE_ENV: 'production' })).toBe(false);
    });

    it('ignora quando THROTTLER_DISABLED === "true" (hook de teste de carga)', () => {
      expect(
        shouldSkipThrottling({
          NODE_ENV: 'production',
          THROTTLER_DISABLED: 'true',
        }),
      ).toBe(true);
    });

    it('nao ignora quando THROTTLER_DISABLED tem outro valor', () => {
      expect(
        shouldSkipThrottling({
          NODE_ENV: 'production',
          THROTTLER_DISABLED: 'false',
        }),
      ).toBe(false);
      expect(
        shouldSkipThrottling({
          NODE_ENV: 'production',
          THROTTLER_DISABLED: '1',
        }),
      ).toBe(false);
    });

    it('ignora quando NODE_ENV === "test"', () => {
      expect(shouldSkipThrottling({ NODE_ENV: 'test' })).toBe(true);
    });

    it('ignora quando JEST_WORKER_ID esta presente', () => {
      expect(
        shouldSkipThrottling({ NODE_ENV: 'production', JEST_WORKER_ID: '1' }),
      ).toBe(true);
    });

    it('nao ignora com JEST_WORKER_ID vazio', () => {
      expect(
        shouldSkipThrottling({ NODE_ENV: 'production', JEST_WORKER_ID: '' }),
      ).toBe(false);
    });

    it('usa process.env por padrao quando nenhum env e passado', () => {
      const original = process.env.THROTTLER_DISABLED;
      process.env.THROTTLER_DISABLED = 'true';
      try {
        expect(shouldSkipThrottling()).toBe(true);
      } finally {
        if (original === undefined) delete process.env.THROTTLER_DISABLED;
        else process.env.THROTTLER_DISABLED = original;
      }
    });
  });

  it('expoe as constantes de limite/ttl usadas pelo ThrottlerModule', () => {
    expect(THROTTLER_TTL_MS).toBe(60_000);
    expect(THROTTLER_LIMIT).toBe(100);
  });
});
