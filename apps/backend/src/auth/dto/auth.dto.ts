import { createZodDto } from 'nestjs-zod';
import {
  registerValidationSchema,
  loginValidationSchema,
} from '@jira-lite/contracts';

// NestJS-Zod Class DTO definitions
export class RegisterDto extends createZodDto(registerValidationSchema) {}
export class LoginDto extends createZodDto(loginValidationSchema) {}
