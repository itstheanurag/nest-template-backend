import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { I18nContext } from 'nestjs-i18n';
import { ErrorResponseBuilder } from '../http';

@Injectable()
export class ValidationPipe implements PipeTransform {
  async transform(
    value: unknown,
    { metatype }: ArgumentMetadata,
  ): Promise<unknown> {
    if (!metatype || this.isPrimitive(metatype)) {
      return value;
    }

    const object = plainToInstance(metatype, value ?? {}, {
      excludeExtraneousValues: true,
      exposeUnsetFields: false,
    });

    const errors = await validate(object as object, {
      stopAtFirstError: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    });

    if (errors.length > 0) {
      const translatedError = this.transformError(errors);
      throw new ErrorResponseBuilder().throwBadRequest(translatedError);
    }

    return object;
  }

  private isPrimitive(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return types.includes(metatype);
  }

  private transformError(errors: ValidationError[]): string[] {
    const messages: string[] = [];
    const i18n = I18nContext.current();

    for (const error of errors) {
      if (error.constraints) {
        for (const message of Object.values(error.constraints)) {
          // Check if message looks like an i18n key (contains a dot like 'validation.EMAIL_REQUIRED')
          const translated = this.translateMessage(message, i18n);
          messages.push(translated);
        }
      }
      if (error.children && error.children.length) {
        messages.push(...this.transformError(error.children));
      }
    }
    return messages;
  }

  /**
   * Translates an i18n key to its localized message.
   * If the key doesn't exist or i18n context is unavailable, returns the original message.
   */
  private translateMessage(
    message: string,
    i18n: I18nContext | undefined,
  ): string {
    if (!i18n) {
      return message;
    }

    // Check if message looks like an i18n key (format: 'namespace.KEY' or just 'KEY')
    if (message.includes('.')) {
      const translated = i18n.t(message) as string;
      // If translation returns the same key, it means translation not found
      return translated !== message ? translated : message;
    }

    return message;
  }
}
