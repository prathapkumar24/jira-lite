import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { prisma, Prisma } from '@jira-lite/database'; // Import the client instance from your shared package

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  // Use a proxy pattern so "this.prisma.user" routes straight to your shared instance
  public readonly user: Prisma.UserDelegate = prisma.user;
  public readonly project: Prisma.ProjectDelegate = prisma.project;
  public readonly projectMember: Prisma.ProjectMemberDelegate =
    prisma.projectMember;
  public readonly task: Prisma.TaskDelegate = prisma.task;
  public readonly taskAttachment: Prisma.TaskAttachmentDelegate =
    prisma.taskAttachment;
  public readonly taskComment: Prisma.TaskCommentDelegate = prisma.taskComment;
  // public readonly post = prisma.post; // Add other models as needed

  async onModuleInit() {
    await prisma.$connect(); // Connects to the DB when NestJS boots up
  }

  async onModuleDestroy() {
    await prisma.$disconnect(); // Cleans up connections on shutdown
  }
}
