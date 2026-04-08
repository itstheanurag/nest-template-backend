import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { I18nContext } from '../../types';
import { BaseException } from '../../exceptions';
import { HTTP_ERROR_MESSAGES } from '../../http.constants';

/**
 * This class deals with http error responses
 * @category Core
 * @subcategory Response
 */
export class ErrorResponseBuilder {
  private statusCode: number;
  private message: string[] | Record<string, any>[];
  private error: string;
  private i18nContext: I18nContext;

  getStatusCode(): number {
    return this.statusCode;
  }

  setStatusCode(statusCode: number): void {
    this.statusCode = statusCode;
  }

  getMessage(): string[] | Record<string, any>[] {
    return this.message;
  }

  setMessage(message: string[] | Record<string, any>[]): void {
    this.message = message;
  }

  getError(): string {
    return this.error;
  }

  setError(error: string): void {
    this.error = error;
  }

  getI18nContext(): I18nContext {
    return this.i18nContext;
  }

  setI18nContext(i18n: any, args?: Record<string, any>): this {
    this.i18nContext = {
      provider: i18n,
      args: args,
    };
    return this;
  }

  private errorResponseSkeleton(): Record<string, unknown> {
    return {
      message: this.getMessage(),
      error: this.getError(),
    };
  }

  buildAndThrowWithBaseException(error: BaseException): HttpException {
    this.setStatusCode((error.getStatusCode && error.getStatusCode()) || 500);
    this.setMessage([
      this.getI18nContext()
        ? this.getI18nContext().provider.t(
            error.getMessage && error.getMessage(),
            { args: { ...this.getI18nContext().args, ...error.getData() } },
          )
        : error.getMessage && error.getMessage(),
    ]);
    this.setError(
      (error.getName && error.getName()) ||
        HTTP_ERROR_MESSAGES[HttpStatus.INTERNAL_SERVER_ERROR],
    );
    throw new HttpException(this.errorResponseSkeleton(), this.getStatusCode());
  }

  buildExceptionAndThrow(error: Error): void {
    // //  if it is a Database exception then throw usign DatabaseException;
    // DatabaseException.checkDbExceptionAndThrow(error);

    //  If error is of type BaseException then throw
    if (error instanceof BaseException) {
      this.buildAndThrowWithBaseException(error);
    }

    //  otherwise just throw the regular way;
    this.throwInternalServer([error.message]);
  }

  throwBadRequest(
    message: string[] | Record<string, any>[],
    error?: string,
  ): BadRequestException {
    this.setStatusCode(HttpStatus.BAD_REQUEST);
    this.setMessage(message);
    this.setError(error || HTTP_ERROR_MESSAGES[HttpStatus.BAD_REQUEST]);

    throw new BadRequestException(this.errorResponseSkeleton());
  }

  throwNotFound(
    message: string[] | Record<string, any>[],
    error?: string,
  ): NotFoundException {
    this.setStatusCode(HttpStatus.NOT_FOUND);
    this.setMessage(message);
    this.setError(error || HTTP_ERROR_MESSAGES[HttpStatus.NOT_FOUND]);

    throw new NotFoundException(this.errorResponseSkeleton());
  }

  throwInternalServer(
    message: string[] | Record<string, any>[],
    error?: string,
  ): InternalServerErrorException {
    this.setStatusCode(HttpStatus.INTERNAL_SERVER_ERROR);
    this.setMessage(message);
    this.setError(
      error || HTTP_ERROR_MESSAGES[HttpStatus.INTERNAL_SERVER_ERROR],
    );

    throw new InternalServerErrorException(this.errorResponseSkeleton());
  }

  throwConflict(
    message: string[] | Record<string, any>[],
    error?: string,
  ): ConflictException {
    this.setStatusCode(HttpStatus.CONFLICT);
    this.setMessage(message);
    this.setError(error || HTTP_ERROR_MESSAGES[HttpStatus.CONFLICT]);

    throw new ConflictException(this.errorResponseSkeleton());
  }

  throwUnauthorized(
    message: string[] | Record<string, any>[],
    error?: string,
  ): UnauthorizedException {
    this.setStatusCode(HttpStatus.UNAUTHORIZED);
    this.setMessage(message);
    this.setError(error || HTTP_ERROR_MESSAGES[HttpStatus.UNAUTHORIZED]);

    throw new UnauthorizedException(this.errorResponseSkeleton());
  }

  throwExpiredOrInvalidToken(message: string[], error?: string) {
    this.setStatusCode(498);
    this.setMessage(message);
    this.setError(error || HTTP_ERROR_MESSAGES[498]);
    throw new HttpException(this.errorResponseSkeleton(), this.getStatusCode());
  }

  throwExpiredOrInvalidRefreshToken(message: string[], error?: string) {
    this.setStatusCode(498);
    this.setMessage(message);
    this.setError(error || HTTP_ERROR_MESSAGES[498]);
    throw new HttpException(this.errorResponseSkeleton(), this.getStatusCode());
  }
}
