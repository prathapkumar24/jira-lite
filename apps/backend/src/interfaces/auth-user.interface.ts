import type { z } from 'zod';
import type { UserSchema } from '@jira-lite/database/schemas';

// 1. Infer the full TypeScript type from your Prisma-Zod schema
type FullUser = z.infer<typeof UserSchema>;

// 2. Pick only the exact fields your Auth Controller interacts with
export type UserPayload = Pick<
  FullUser,
  'id' | 'email' | 'name' | 'mobileNumber' | 'role' | 'isActive' | 'createdAt'
>;

export type JwtPayload = Pick<FullUser, 'id' | 'email' | 'role'>;

export type UserResponse = Pick<
  FullUser,
  'id' | 'email' | 'name' | 'mobileNumber' | 'role' | 'isActive' | 'createdAt'
>;
