import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { JwtPayload } from '../../interfaces/auth-backend.schema';

export const GetUser = createParamDecorator(
  (data: keyof JwtPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<{ user?: JwtPayload }>();
    // If a specific property is requested, return it (e.g., @GetUser('id'))
    const user = request.user;
    if (!user) {
      return undefined;
    }

    if (data) {
      return user[data];
    }
    // Otherwise, return the whole user object
    return user;
  },
);
