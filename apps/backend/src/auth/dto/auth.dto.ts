import { createZodDto } from 'nestjs-zod';
import { registerInputSchema, loginInputSchema } from '@jira-lite/contracts';
import { z } from 'zod';
// Build registration rules directly from the Database User Schema
const registerValidationSchema = registerInputSchema.extend({
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

// Login schema inherits user validation constraints
const loginValidationSchema = loginInputSchema.extend({
  email: z.email({ message: 'Must be a valid email structure.' }),
  passwordHash: z
    .string()
    .min(1, { message: 'Password credentials are required.' }),
});
// NestJS-Zod Class DTO definitions
export class RegisterDto extends createZodDto(registerValidationSchema) {}
export class LoginDto extends createZodDto(loginValidationSchema) {}
