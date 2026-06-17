import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../../common/decorators/roles.decorator';
import type { JwtPayload } from '../../interfaces/auth-backend.schema';
import { UserRoleType } from '@jira-lite/contracts';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. Get the required roles from the route metadata
    const requiredRoles = this.reflector.getAllAndOverride<UserRoleType[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no roles are defined on the route, allow access by default
    if (!requiredRoles) {
      return true;
    }

    // 2. Extract the request object and the user payload attached by JwtAuthGuard
    const request = context.switchToHttp().getRequest<{ user?: JwtPayload }>();

    const user = request.user;

    if (!user || !user.role) {
      throw new ForbiddenException(
        'Access denied: No authentication profile found',
      );
    }

    // 3. Check if the user's role matches any of the required route roles
    const hasRole = requiredRoles.includes(user.role);

    if (!hasRole) {
      throw new ForbiddenException(
        'Access denied: You do not have the required permissions',
      );
    }

    return true;
  }
}
