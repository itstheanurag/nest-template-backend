import { ErrorResponseBuilder } from '@app/core/http/response-builders/error';
import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ExceptionInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((err) =>
        throwError(() => {
          const i18nService =
            context.switchToHttp().getRequest().i18nService ?? null;

          if (i18nService && err.message) {
            // Handle message as array or string
            if (Array.isArray(err.message)) {
              err.message = err.message.map((msg: string) =>
                i18nService.t(msg),
              );
            } else if (typeof err.message === 'string') {
              err.message = i18nService.t(err.message);
            }
          }

          if (
            err instanceof BadRequestException ||
            err instanceof ErrorResponseBuilder
          ) {
            return err;
          } else {
            new ErrorResponseBuilder().buildExceptionAndThrow(err);
          }
        }),
      ),
    );
  }
}
