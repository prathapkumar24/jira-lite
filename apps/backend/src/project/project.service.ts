import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@jira-lite/database';

@Injectable()
export class ProjectService {
  constructor(private prisma: PrismaService) {}

  async create(createProjectDto: CreateProjectDto, ownerId: string) {
    try {
      const project = await this.prisma.project.create({
        data: {
          name: createProjectDto.name,
          description: createProjectDto.description,
          key: createProjectDto.key,
          iconUrl: createProjectDto.iconUrl,
          ownerId: ownerId,
        },
      });
      return project;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // P2002: Unique constraint failed (e.g., duplicate project name/slug)
        if (error.code === 'P2002') {
          throw new ConflictException(
            'A project with this unique value already exists',
          );
        }
      }
      throw new InternalServerErrorException('Failed to create project');
    }
  }

  async findAll() {
    try {
      const projects = await this.prisma.project.findMany();
      return projects;
    } catch {
      // findMany rarely throws Prisma errors unless the database is down
      throw new InternalServerErrorException('Failed to fetch projects');
    }
  }

  async findOne(id: string) {
    try {
      const project = await this.prisma.project.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          description: true,
          key: true,
          createdAt: true,
          iconUrl: true,
          ownerId: true,
        },
      });
      if (!project) {
        throw new NotFoundException(`Project with ID ${id} not found`);
      }
      return project;
    } catch (error) {
      // Re-throw if it's already our HTTP exception
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to fetch project');
    }
  }

  async update(id: string, updateProjectDto: UpdateProjectDto) {
    try {
      return await this.prisma.project.update({
        where: { id },
        data: {
          name: updateProjectDto.name,
          description: updateProjectDto.description,
          key: updateProjectDto.key,
          iconUrl: updateProjectDto.iconUrl,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // P2025: Record to update not found
        if (error.code === 'P2025') {
          throw new NotFoundException(`Project with ID ${id} not found`);
        }
        // P2002: Unique constraint failed during an update
        if (error.code === 'P2002') {
          throw new ConflictException(
            'Conflict with an existing project record',
          );
        }
      }
      throw new InternalServerErrorException('Failed to update project');
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.project.delete({
        where: { id },
      });
    } catch (error) {
      // Prisma error code P2025 means "Record to delete does not exist."
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // TypeScript now knows 'error' is PrismaClientKnownRequestError
        if (error.code === 'P2025') {
          throw new NotFoundException(`Project with ID ${id} not found`);
        }
      }
      throw error;
    }
  }
}
