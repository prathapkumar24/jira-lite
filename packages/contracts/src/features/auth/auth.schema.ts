import { UserSchema } from '@jira-lite/database/schemas';
import z, { number, string } from 'zod';

const registerInputSchema = UserSchema.pick({
  name: true,
  email: true,
  username: true,
  passwordHash: true,
  mobileNumber: true,
  avatarUrl: true,
}).extend({
  // This overrides the picked property to accept undefined/null on registration
  avatarUrl: z.string().nullable().optional(),
});

const loginInputSchema = UserSchema.pick({
  email: true,
  passwordHash: true,
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

export type registerResponseType = z.infer<typeof registerResponseSchema>;
export type loginResponseType = z.infer<typeof loginResponseSchema>;

export const registerValidationSchema = registerInputSchema.extend({
  email: z.email({ message: 'Must be a valid email structure.' }),
  passwordHash: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters long.' })
    .max(100, { message: 'Password must not exceed 100 characters.' })
    .refine((val) => /[A-Z]/.test(val), {
      message: 'Password must contain at least 1 uppercase letter.',
    })
    .refine((val) => /[a-z]/.test(val), {
      message: 'Password must contain at least 1 lowercase letter.',
    })
    .refine((val) => /\d/.test(val), {
      message: 'Password must contain at least 1 number.',
    })
    .refine((val) => /[^A-Za-z0-9]/.test(val), {
      message: 'Password must contain at least 1 special character.',
    }),
  name: z
    .string()
    .min(2, { message: 'Display Name must contain at least 2 characters.' })
    .max(50, { message: 'Display Name cannot exceed 50 characters.' }),
  mobileNumber: z.string().regex(/^\+[1-9]\d{1,14}$/, {
    message: 'Must be a valid international E.164 phone number.',
  }),
  avatarUrl: z.string().nullable().optional(),
});
export type registerInputType = z.infer<typeof registerValidationSchema>;

// Login schema inherits user validation constraints
export const loginValidationSchema = loginInputSchema.extend({
  email: z.email({ message: 'Must be a valid email structure.' }),
  passwordHash: z.string().min(1, { message: 'Password credentials are required.' }),
});
export type loginInputType = z.infer<typeof loginValidationSchema>;

export type UserRoleType = z.infer<typeof UserSchema>['role'];
