import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { projectResponseType } from '@jira-lite/contracts';
import { GetUser } from '../common/decorators/get-user.decorator';
import * as AuthTypes from '../interfaces/auth-backend.schema';

@Controller('projects')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'MEMBER')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  async create(
    @Body() createProjectDto: CreateProjectDto,
    @GetUser() user: AuthTypes.JwtPayload,
  ): Promise<projectResponseType> {
    return this.projectService.create(createProjectDto, user.id);
  }

  @Get()
  async findAll(): Promise<projectResponseType[]> {
    return await this.projectService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<projectResponseType> {
    return await this.projectService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
  ): Promise<projectResponseType> {
    return this.projectService.update(id, updateProjectDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.projectService.remove(id);
  }
}
