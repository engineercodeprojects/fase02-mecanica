import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WebhookTokenGuard } from './webhook-token.guard';

describe('WebhookTokenGuard', () => {
  let guard: WebhookTokenGuard;
  let configService: ConfigService;

  const createContext = (
    token?: string,
  ): ExecutionContext =>
    ({
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({
        getRequest: () => ({
          headers: token ? { 'x-webhook-token': token } : {},
        }),
      }),
    }) as unknown as ExecutionContext;

  beforeEach(() => {
    configService = new ConfigService({
      WEBHOOK_APPROVAL_TOKEN: 'test-webhook-token',
    });
    guard = new WebhookTokenGuard(configService);
  });

  it('should allow access when X-Webhook-Token matches', () => {
    const result = guard.canActivate(
      createContext('test-webhook-token'),
    );
    expect(result).toBe(true);
  });

  it('should throw UnauthorizedException when token is missing', () => {
    expect(() => guard.canActivate(createContext())).toThrow(
      UnauthorizedException,
    );
  });

  it('should throw UnauthorizedException when token is wrong', () => {
    expect(() => guard.canActivate(createContext('wrong-token'))).toThrow(
      UnauthorizedException,
    );
  });

  it('should throw UnauthorizedException when WEBHOOK_APPROVAL_TOKEN is not configured', () => {
    const emptyConfigService = new ConfigService({});
    const guardWithoutToken = new WebhookTokenGuard(emptyConfigService);

    expect(() =>
      guardWithoutToken.canActivate(createContext('any-token')),
    ).toThrow(UnauthorizedException);
  });
});
