import React from 'react';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';

import Badge from '@/components/ui/badge/Badge';
import Image from 'next/image';
import { projectResponseType } from '@jira-lite/contracts';
import Button from '@/components/ui/button/Button';

/*interface Order {
  id: number;
  user: {
    image: string;
    name: string;
    role: string;
  };
  projectName: string;
  team: {
    images: string[];
  };
  status: string;
  budget: string;
}*/

// Define the table data using the interface
/*const tableData: Order[] = [
  {
    id: 1,
    user: {
      image: "/images/user/user-17.jpg",
      name: "Lindsey Curtis",
      role: "Web Designer",
    },
    projectName: "Agency Website",
    team: {
      images: [
        "/images/user/user-22.jpg",
        "/images/user/user-23.jpg",
        "/images/user/user-24.jpg",
      ],
    },
    budget: "3.9K",
    status: "Active",
  },
  {
    id: 2,
    user: {
      image: "/images/user/user-18.jpg",
      name: "Kaiya George",
      role: "Project Manager",
    },
    projectName: "Technology",
    team: {
      images: ["/images/user/user-25.jpg", "/images/user/user-26.jpg"],
    },
    budget: "24.9K",
    status: "Pending",
  },
  {
    id: 3,
    user: {
      image: "/images/user/user-17.jpg",
      name: "Zain Geidt",
      role: "Content Writing",
    },
    projectName: "Blog Writing",
    team: {
      images: ["/images/user/user-27.jpg"],
    },
    budget: "12.7K",
    status: "Active",
  },
  {
    id: 4,
    user: {
      image: "/images/user/user-20.jpg",
      name: "Abram Schleifer",
      role: "Digital Marketer",
    },
    projectName: "Social Media",
    team: {
      images: [
        "/images/user/user-28.jpg",
        "/images/user/user-29.jpg",
        "/images/user/user-30.jpg",
      ],
    },
    budget: "2.8K",
    status: "Cancel",
  },
  {
    id: 5,
    user: {
      image: "/images/user/user-21.jpg",
      name: "Carla George",
      role: "Front-end Developer",
    },
    projectName: "Website",
    team: {
      images: [
        "/images/user/user-31.jpg",
        "/images/user/user-32.jpg",
        "/images/user/user-33.jpg",
      ],
    },
    budget: "4.5K",
    status: "Active",
  },
];*/

interface ProjectTableProps {
  initialData: projectResponseType[];
  onEditClick: (project: projectResponseType) => void;
  onDeleteClick: (project: projectResponseType) => void;
}

export default function ProjectsTable({
  initialData,
  onEditClick,
  onDeleteClick,
}: ProjectTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[1102px]">
          <Table>
            {/* Table Header */}
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  User
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Project Name
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Status
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Action
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Action
                </TableCell>
              </TableRow>
            </TableHeader>

            {/* Table Body */}
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {initialData.map((project) => (
                <TableRow key={project.id}>
                  {/* 1. Owner Field (Maps to User column) */}
                  <TableCell className="px-5 py-4 sm:px-6 text-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 overflow-hidden rounded-full flex items-center justify-center bg-gray-100 dark:bg-white/[0.05]">
                        {project.iconUrl ? (
                          <Image
                            width={40}
                            height={40}
                            src={project.iconUrl}
                            alt={project.name}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <span className="font-bold text-gray-400 text-theme-xs uppercase">
                            {project.name.substring(0, 2)}
                          </span>
                        )}
                      </div>
                      <div>
                        <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {project.name}
                        </span>
                        <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                          Owner ID: {project.ownerId}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  {/* 2. Project Name and Key Field */}
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {project.name}
                      </span>
                      <span className="text-xs text-gray-400 font-mono">[{project.key}]</span>
                    </div>
                  </TableCell>

                  {/* 3. Status Field (Static placeholder styled to match template conditionals) */}
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <Badge
                      size="sm"
                      color="success" // Hardcoded active status until your schema handles dynamic metrics
                    >
                      Active
                    </Badge>
                  </TableCell>

                  {/* 4. Budget Column (Maps your project creation date gracefully here) */}
                  <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    <Button size="sm" variant="outline" onClick={() => onEditClick(project)}>
                      Edit
                    </Button>
                  </TableCell>

                  {/* 5. Budget Column (Maps your project creation date gracefully here) */}
                  <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    <Button size="sm" variant="outline" onClick={() => onDeleteClick(project)}>
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
