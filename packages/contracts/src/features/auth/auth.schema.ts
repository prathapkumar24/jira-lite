import { UserSchema } from '@jira-lite/database/schemas';
import z, { number, string } from 'zod';

export const registerInputSchema = UserSchema.pick({
  name: true,
  email: true,
  username: true,
  passwordHash: true,
  mobileNumber: true,
  avatarUrl: true,
});

export const registerResponseSchema = UserSchema.pick({
  id: true,
  email: true,
  name: true,
  mobileNumber: true,
  role: true,
  isActive: true,
  createdAt: true,
});

export type registerResponseType = z.infer<typeof registerResponseSchema>;

export const loginInputSchema = UserSchema.pick({
  email: true,
  passwordHash: true,
});

export const loginResponseSchema = {
  accessToken: string,
  expiresInSeconds: number,
  user: UserSchema.pick({
    id: true,
    name: true,
    role: true, // Automatically inherits your Prisma Enum validation logic!
  }).transform(({ name, ...rest }) => ({
    displayName: name, // Remap the key safely
    ...rest,
  })),
};

export type loginResponseType = z.infer<typeof loginResponseSchema>;

export type UserRoleType = z.infer<typeof UserSchema>['role'];
