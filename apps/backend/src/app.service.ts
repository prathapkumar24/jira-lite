import { Injectable } from '@nestjs/common';
import { prisma } from '@jira-lite/database';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  async getProjects(): Promise<string> {
    const projects = await prisma.project.findFirst({
      select: {
        id: true, // 💡 Only fetch the ID column to minimize database memory usage
      },
    });

    // If ticket is not null, it means at least one row exists
    return projects ? 'found' : 'not found';
  }
}
