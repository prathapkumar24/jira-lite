import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import { Server } from 'http';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service'; // 👈 Added to clean the database
import { registerInputType, registerResponseType } from '@jira-lite/contracts';

describe('AppController (e2e)', () => {
  let app: INestApplication<Server>;
  let prisma: PrismaService; // 👈 Track prisma instance

  const GLOBAL_PREFIX = 'api/v1';

  const testUserDto: registerInputType = {
    email: 'controller-flow@jira-lite.com',
    username: 'jira_tester',
    passwordHash: 'SecurePassword123!',
    name: 'Jira Test User',
    mobileNumber: '9999999999',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule], // 👈 FIX 1: Removed AuthModule because AppModule already handles it
      providers: [PrismaService],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser()); // 👈 Match your working configuration layout

    // Set your route bindings properly
    app.setGlobalPrefix(GLOBAL_PREFIX);

    await app.init();

    // Get the PrismaService instance from the compiled module
    prisma = moduleFixture.get<PrismaService>(PrismaService);
  });

  beforeEach(async () => {
    // 👈 FIX 2: Clear the database BEFORE each test to prevent email unique conflicts
    await prisma.user.deleteMany({ where: { email: testUserDto.email } });
  });

  afterAll(async () => {
    // Clean up our footprint and tear down the app instance gracefully
    await prisma.user.deleteMany({ where: { email: testUserDto.email } });
    await app.close();
  });

  it('/ (GET)', async () => {
    const response: request.Response = await request(app.getHttpServer())
      .get(`/${GLOBAL_PREFIX}/`)
      .expect(HttpStatus.OK);

    expect(response.text).toBe('Hello World!');
  });

  it('should pass DTO pipeline and create a structural user record (Happy Path)', async () => {
    // 👈 FIX 3: Rewritten using native 'await' for cleaner execution flow
    const response: request.Response = await request(app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/auth/register`)
      .send(testUserDto)
      .expect(HttpStatus.CREATED); // Expects 201

    const body = response.body as registerResponseType;
    // Assert your data expectations clearly
    expect(body).toHaveProperty('id');
    expect(body.email).toBe(testUserDto.email);
    expect(body).not.toHaveProperty('passwordHash');
  });
});
