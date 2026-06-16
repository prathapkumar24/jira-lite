import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  success: boolean;
  timestamp: string;
  meta: {
    version: string;
  };
  data: T;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<
  T,
  ApiResponse<T>
> {
  intercept(
    _: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map(
        (data: T): ApiResponse<T> => ({
          success: true,
          timestamp: new Date().toISOString(),
          meta: { version: 'v1' },
          data,
        }),
      ),
    );
  }
}
