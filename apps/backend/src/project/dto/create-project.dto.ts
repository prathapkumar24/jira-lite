import { createZodDto } from 'nestjs-zod';
import { createProjectValidationSchema } from '@jira-lite/contracts';
//import { keyof, z } from 'zod';

export class CreateProjectDto extends createZodDto(
  createProjectValidationSchema,
) {}
