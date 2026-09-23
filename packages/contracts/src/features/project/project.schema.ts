import { ProjectSchema } from '@jira-lite/database/schemas';
import z from 'zod';

const projectInputSchema = ProjectSchema.pick({
  name: true,
  description: true,
  key: true,
  iconUrl: true,
  ownerId: true,
});

export const createProjectValidationSchema = projectInputSchema.extend({
  name: z
    .string()
    .min(2, { message: 'Project Name must contain at least 2 characters.' })
    .max(50, { message: 'Project Name cannot exceed 50 characters.' }),
  description: z.string().nullable().optional(),

  key: z.string().max(5, { message: 'Project Key cannot exceed 5 characters.' }),
  ownerId: z.string(),
  iconUrl: z.string().optional(),
});

export const projectResponseSchema = ProjectSchema.pick({
  id: true,
  name: true,
  description: true,
  key: true,
  createdAt: true,
  iconUrl: true,
  ownerId: true,
});

export type projectResponseType = z.infer<typeof projectResponseSchema>;
