import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponseEnvelope } from '@jira-lite/contracts';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<
  T,
  ApiResponseEnvelope<T>
> {
  intercept(
    _: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiResponseEnvelope<T>> {
    return next.handle().pipe(
      map(
        (data: T): ApiResponseEnvelope<T> => ({
          success: true,
          timestamp: new Date().toISOString(),
          meta: { version: 'v1' },
          data,
        }),
      ),
    );
  }
}
