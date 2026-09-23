import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import { fetchFromServer } from '@/lib/api-server';
import { Metadata } from 'next';
import ProjectContainer from './ProjectContainer';

export const metadata: Metadata = {
  title: 'Next.js Basic Table | TailAdmin - Next.js Dashboard Template',
  description:
    'This is Next.js Basic Table  page for TailAdmin  Tailwind CSS Admin Dashboard Template',
  // other metadata
};

export default async function ProjectsPage() {
  const { data } = await fetchFromServer('/projects');
  //console.dir(data);
  return (
    <div>
      <PageBreadcrumb pageTitle="Basic Table" />
      <ProjectContainer initialData={data} />
    </div>
  );
}
/*
'use client';
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ProjectsTable from "@/components/tables/ProjectsTable";
import { apiClient } from "@/lib/api-client";
import { projectResponseType, projectResponseSchema } from "@jira-lite/contracts";
import { Metadata } from "next";
import React, { useEffect, useState } from "react";



export default function Projects() {
  const [projects, setProjects] = useState<projectResponseType[]>([]);

  useEffect(() => {
    async function getProjects() {
      try {
        const response = await apiClient.get('/projects');
        const projectsData = response.data.data;
        setProjects(projectsData);
      } catch (err: any) {
        console.log({
          success: false,
          message: err.response?.data?.message,
        });
        return {
          success: false,
          message: err.response?.data?.message || 'Projects listing failed.',
        };
      }
    }
    getProjects();
  }, [])
  //const initialProjects = await getProjects();
  return (
    <div>
      <PageBreadcrumb pageTitle="Basic Table" />
      <div className="space-y-6">
        <ComponentCard title="Basic Table 1">
          <ProjectsTable initialData={projects} />
        </ComponentCard>
      </div>
    </div>
  );
}
*/
