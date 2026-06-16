import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class SanitizeUserInterceptor<T> implements NestInterceptor<T, unknown> {
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<unknown> {
    return next
      .handle()
      .pipe(
        map((data: T): unknown => this.recursivelyStripPasswordHashes(data)),
      );
  }

  /**
   * Automatically strips password hashes from outbound payloads to protect user credentials.
   */
  private recursivelyStripPasswordHashes(value: unknown): unknown {
    if (Array.isArray(value)) {
      return value.map((item) => this.recursivelyStripPasswordHashes(item));
    }

    if (value !== null && typeof value === 'object') {
      const sanitizedObject: Record<string, unknown> = {};
      const objectRecord = value as Record<string, unknown>;

      for (const key of Object.keys(objectRecord)) {
        if (key === 'passwordHash' || key === 'password') {
          continue; // Strip password fields before the data reaches the network boundary
        }

        // 6. Recursively clean nested child elements
        sanitizedObject[key] = this.recursivelyStripPasswordHashes(
          objectRecord[key],
        );
      }
      return sanitizedObject;
    }

    return value;
  }
}
