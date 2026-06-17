import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtPayload } from '../../interfaces/auth-backend.schema';
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    // Executes passport strategy authentication cycle
    return super.canActivate(context);
  }
  handleRequest<TUser = JwtPayload>(err: unknown, user: unknown): TUser {
    if (!err && user) {
      return user as TUser;
    }
    if (err instanceof Error) {
      throw err;
    }

    throw new UnauthorizedException(
      'Unauthorized access: Invalid or expired access token.',
    );
  }
}
