'use client';

import ComponentCard from '@/components/common/ComponentCard';
import React, { useState } from 'react';
import ProjectsTable from './ProjectsTable';
import { createProjectValidationSchema, projectResponseType } from '@jira-lite/contracts';
import ModalWrapper from '@/components/common/ModalWrapper';
import Button from '@/components/ui/button/Button';
import Label from '@/components/form/Label';
import Input from '@/components/form/input/InputField';
import { useForm } from 'react-hook-form';
import z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { apiClient } from '@/lib/api-client';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

interface ProjectContainerProps {
  initialData: projectResponseType[];
}
type ProjectFormData = z.infer<typeof createProjectValidationSchema>;
interface BackendErrorPayload {
  message?: string;
}

const ProjectContainer = ({ initialData }: ProjectContainerProps) => {
  const [activeModal, setActiveModal] = useState<'add' | 'edit' | 'delete' | null>(null);
  const [selectedProject, setSelectedProject] = useState<projectResponseType | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { user } = useAuth();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(createProjectValidationSchema),
  });

  const onSubmit = async (formData: ProjectFormData) => {
    console.log('onSubmit project');
    setErrorMessage(null);
    const isEditMode = activeModal === 'edit';
    try {
      // Hit your NestJS endpoint
      let response;
      if (isEditMode && selectedProject) {
        response = await apiClient.patch(`/projects/${selectedProject.id}`, formData);
        setSelectedProject(null);
      } else {
        response = await apiClient.post('/projects', formData);
      }
      console.log(response);

      router.refresh();
      setActiveModal(null);
      return { success: true };
    } catch (err: unknown) {
      console.error(err);
      const fallbackMessage = `Project ${activeModal === 'add' ? 'Create' : 'Update'} Failed`;
      let dynamicMessage = fallbackMessage;

      // 3. Use Axios's type guard to extract the server message safely
      if (axios.isAxiosError<BackendErrorPayload>(err)) {
        dynamicMessage = err.response?.data?.message || fallbackMessage;
      }

      setErrorMessage(dynamicMessage);
    }
  };

  const handleOpenAddModal = () => {
    console.log('handleOpenAddModal');
    setErrorMessage(null);
    setSelectedProject(null);
    setActiveModal('add');
    //reset(createProjectValidationSchema);
    reset({ name: '', key: '', description: '', ownerId: user?.id || '' });
  };

  const handleOpenEditModal = (project: projectResponseType) => {
    setErrorMessage(null);
    setSelectedProject(project);
    setActiveModal('edit');

    // 👈 Pre-fill form inputs with selected project data [1]
    reset({
      name: project.name,
      key: project.key,
      description: project.description,
      ownerId: user?.id || '',
    });
  };

  return (
    <div className="space-y-6">
      <ComponentCard
        title="Basic Table 1"
        action={
          <Button size="sm" variant="primary" onClick={handleOpenAddModal}>
            + Add Project
          </Button>
        }
      >
        <ProjectsTable
          initialData={initialData}
          onEditClick={handleOpenEditModal}
          onDeleteClick={(p) => {
            setSelectedProject(p);
            setActiveModal('delete');
          }}
        />
      </ComponentCard>
      {/* Reusable Modal for Add */}
      <ModalWrapper
        isOpen={activeModal === 'add' || activeModal === 'edit'}
        title={`${activeModal === 'add' ? 'Create Create New' : 'Update'} Project`}
        onClose={() => setActiveModal(null)}
      >
        <form
          className="space-y-6"
          onSubmit={handleSubmit(onSubmit, (errors) =>
            console.log('Zod Validation Failed:', errors),
          )}
        >
          <input type="hidden" value={user?.id || ''} {...register('ownerId')} />
          <div>
            <Label>Project Name</Label>
            <Input
              type="text"
              placeholder="Enter Project Name"
              {...register('name')}
              hint={errors.name && (errors.name.message as string)}
              error={!!errors.name}
            />
          </div>
          <div>
            <Label>Key</Label>
            <Input
              type="text"
              placeholder="Enter Project Key"
              {...register('key')}
              hint={errors.key && (errors.key.message as string)}
              error={!!errors.key}
            />
          </div>
          <div>
            <Label>Description</Label>
            <Input
              type="text"
              placeholder="Enter Project Description"
              {...register('description')}
              hint={errors.description && (errors.description.message as string)}
              error={!!errors.description}
            />
          </div>
          <Button size="sm" variant="primary" type="submit">
            {isSubmitting ? 'Saving...' : `${activeModal === 'add' ? 'Save' : 'Update'}`}
          </Button>
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
              {errorMessage}
            </div>
          )}
        </form>
      </ModalWrapper>

      {/* Reusable Modal for Edit */}
    </div>
  );
};

export default ProjectContainer;
