import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';
import { ZodValidationException } from 'nestjs-zod';
import { z } from 'zod';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = 500;
    let message = 'An unexpected error occurred';
    let errors: unknown = null;

    // 1. Check if the error is a specialized nestjs-zod validation exception
    if (exception instanceof ZodValidationException) {
      status = exception.getStatus(); // 👈 Uses the getStatus method from your snippet
      message = 'Validation failed';

      // Use the native package getter to extract the raw Zod structural array
      const zodError: unknown = exception.getZodError();
      if (zodError instanceof z.ZodError) {
        try {
          // ZodError messages are usually valid JSON strings containing the issue array
          errors = JSON.parse(zodError.message) as Record<string, unknown>[];
        } catch (e) {
          // Fallback if the message isn't JSON or fails parsing
          if (e instanceof Error) {
            console.error(
              'Failed to parse ZodError string metadata:',
              e.message,
            );
          }
          errors = zodError.message;
        }
      }
    }
    // 2. Handle standard fall  back HTTP exceptions
    else if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.message;
      const exceptionResponse: unknown = exception.getResponse();

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const responseRecord = exceptionResponse as Record<string, unknown>;
        if ('message' in responseRecord) {
          errors = responseRecord.message;
        } else if ('errors' in responseRecord) {
          errors = responseRecord.errors;
        }
      }
    }

    // 3. Output the exact unified object contract to the client
    response.status(status).json({
      success: false, // 👈 Explicitly forces the failure state boolean
      message,
      statusCode: status,
      ...(errors ? { errors } : {}),
    });
  }
}
