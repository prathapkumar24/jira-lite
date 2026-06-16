'use client';

import { useForm, SubmitHandler, SubmitErrorHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ProjectSchema } from '@jira-lite/database/schemas';
import { z } from 'zod';

const createProjectFormSchema = ProjectSchema.pick({
  name: true,
  key: true,
});
type CreateProjectFormData = z.infer<typeof createProjectFormSchema>;

export default function CreateProjectForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateProjectFormData>({
    // Automatically enforces database-aligned fields via the ZodSchemas namespace
    resolver: zodResolver(createProjectFormSchema),
  });

  const onSubmit: SubmitHandler<CreateProjectFormData> = (data) => {
    console.log(data); // 'data' is now strictly typed with 'name' and 'key'
    fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }, // Added header for best practice
      body: JSON.stringify(data),
    });
  };

  const onError: SubmitErrorHandler<CreateProjectFormData> = (formErrors) => {
    console.error('❌ Form Validation Failed:', formErrors); // 'formErrors' is strictly typed
  };

  return (
    <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-4">
      <div>
        <label>Project Name</label>
        <input {...register('name')} className="border p-2 rounded" />
        {errors.name && <p className="text-red-500">{errors.name.message as string}</p>}
      </div>

      <div>
        <label>Key Code (e.g. JIRA)</label>
        <input {...register('key')} className="border p-2 rounded" />
        {errors.key && <p className="text-red-500">{errors.key.message as string}</p>}
      </div>

      <button type="submit" className="bg-blue-500 text-white p-2 rounded">
        Create Project
      </button>
    </form>
  );
}
