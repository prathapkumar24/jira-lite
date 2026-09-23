import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { ZodValidationPipe } from 'nestjs-zod';
import { Logger } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter.js';
import { ResponseInterceptor } from './common/interceptors/response.interceptor.js';
//import { LoggerMiddleware } from './common/middleware/logger.middleware';

async function bootstrap() {
  const logger = new Logger('API-Bootstrap');
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn'],
  });

  // Inject Cookie Parser Middleware
  app.use(cookieParser());

  // Set Global Routing Prefix
  app.setGlobalPrefix('api/v1');

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());

  // Configure CORS securely (No wildcards permitted when handling credentialed requests)
  app.enableCors({
    origin: 'http://localhost:4000', // Explicit Next.js location
    credentials: true, // Essential to allow exchange of HttpOnly cookies
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Bind Global NestJS Pipe configured with nestjs-zod class-validation mappings
  app.useGlobalPipes(new ZodValidationPipe());

  const port = process.env.PORT || 3001;
  await app.listen(process.env.PORT ?? 3001);
  logger.log(
    `NestJS Security Service running on: http://localhost:${port}/api/v1`,
  );
}
void bootstrap();
