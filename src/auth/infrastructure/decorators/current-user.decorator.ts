import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Usuario } from '../../domain/usuario.entity';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): Usuario | undefined => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
