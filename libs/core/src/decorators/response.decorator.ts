import { CustomDecorator, SetMetadata } from '@nestjs/common';

export const ResponseMessageKey = 'RESPONSE_MESSAGE_KEY';
export const ResponseMessage = (message: string): CustomDecorator<string> =>
  SetMetadata(ResponseMessageKey, message);
