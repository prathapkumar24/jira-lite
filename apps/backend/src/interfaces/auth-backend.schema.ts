import type { z } from 'zod';
import type { UserSchema } from '@jira-lite/database/schemas';

// 1. Infer the full TypeScript type from your Prisma-Zod schema
type FullUser = z.infer<typeof UserSchema>;

export type JwtPayload = Pick<FullUser, 'id' | 'email' | 'role'>;
