import { HttpStatus } from '@nestjs/common';

export const HTTP_ERROR_MESSAGES = {
  [HttpStatus.BAD_REQUEST]: 'Bad Request',
  [HttpStatus.NOT_FOUND]: 'Not Found',
  [HttpStatus.INTERNAL_SERVER_ERROR]: 'Internal Server Error',
  [HttpStatus.CONFLICT]: 'Conflict',
  [HttpStatus.UNAUTHORIZED]: 'Unauthorized',
  [HttpStatus.FORBIDDEN]: 'Forbidden',
  [HttpStatus.UNPROCESSABLE_ENTITY]: 'Unprocessable Entity',
  [HttpStatus.TOO_MANY_REQUESTS]: 'Too Many Requests',
  [498]: 'Invalid Token',
};
