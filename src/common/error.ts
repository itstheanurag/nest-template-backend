import { BaseException, HTTP_ERROR_MESSAGES } from '@app/core';
import { HttpStatus } from '@nestjs/common';

export const throwBadRequest = (messageKey: string) => {
  throw new BaseException(messageKey)
    .setName(HTTP_ERROR_MESSAGES[HttpStatus.BAD_REQUEST])
    .setStatusCode(HttpStatus.BAD_REQUEST)
    .getException();
};

export const throwNotFoundException = (messageKey: string) => {
  throw new BaseException(messageKey)
    .setName(HTTP_ERROR_MESSAGES[HttpStatus.NOT_FOUND])
    .setStatusCode(HttpStatus.NOT_FOUND)
    .getException();
};

export const throwTooManyRequests = (messageKey: string) => {
  throw new BaseException(messageKey)
    .setName(HTTP_ERROR_MESSAGES[HttpStatus.TOO_MANY_REQUESTS])
    .setStatusCode(HttpStatus.TOO_MANY_REQUESTS)
    .getException();
};

export const throwConflictException = (messageKey: string) => {
  throw new BaseException(messageKey)
    .setName(HTTP_ERROR_MESSAGES[HttpStatus.CONFLICT])
    .setStatusCode(HttpStatus.CONFLICT)
    .getException();
};

export const throwForbiddenException = (messageKey: string) => {
  throw new BaseException(messageKey)
    .setName(HTTP_ERROR_MESSAGES[HttpStatus.FORBIDDEN])
    .setStatusCode(HttpStatus.FORBIDDEN)
    .getException();
};

export const throwUnauthorizedException = (messageKey: string) => {
  throw new BaseException(messageKey)
    .setName(HTTP_ERROR_MESSAGES[HttpStatus.UNAUTHORIZED])
    .setStatusCode(HttpStatus.UNAUTHORIZED)
    .getException();
};
