import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WebhookTokenGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = request.headers['x-webhook-token'] as string | undefined;
    const expected = this.configService.get<string>('WEBHOOK_APPROVAL_TOKEN');

    if (!expected) {
      throw new UnauthorizedException(
        'WEBHOOK_APPROVAL_TOKEN nao configurado no ambiente',
      );
    }

    if (!token || token !== expected) {
      throw new UnauthorizedException('Token de webhook invalido ou ausente');
    }

    return true;
  }
}
