import { SetMetadata } from '@nestjs/common';
import { UserRoleType } from '@jira-lite/contracts';

// Match this to your Prisma enum roles (e.g., 'USER', 'ADMIN')

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRoleType[]) =>
  SetMetadata(ROLES_KEY, roles);
