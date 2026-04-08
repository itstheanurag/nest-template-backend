import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import type { ObjectSchema } from 'joi';
import { ErrorResponseBuilder } from '../http';
@Injectable()
export class JoiValidationPipe implements PipeTransform {
  constructor(private schema: ObjectSchema) {}

  transform(value: any, metadata: ArgumentMetadata) {
    // Handle undefined or null body
    if (value === undefined || value === null) {
      return value;
    }

    if (metadata.type === 'query' || metadata.type === 'body') {
      if (!(value instanceof Object)) {
        return value;
      }

      const { error } = this.schema.validate(value, { abortEarly: false });

      if (error) {
        if (error.message) {
          new ErrorResponseBuilder().throwBadRequest([error.message]);
        }

        new ErrorResponseBuilder().throwBadRequest(
          error.details.map((detail) => detail.message),
        );
      }
    }
    return value;
  }
}
