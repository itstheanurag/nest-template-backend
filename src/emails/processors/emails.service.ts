import { Inject, Injectable } from '@nestjs/common';

import {
  EMAIL_PROVIDER_TOKEN,
  EmailProvider,
  SendEmailOptions,
  SendEmailResult,
} from '../providers/email-provider.interface';

@Injectable()
export class EmailsService {
  constructor(
    @Inject(EMAIL_PROVIDER_TOKEN)
    private readonly emailProvider: EmailProvider,
  ) {}

  send(options: SendEmailOptions): Promise<SendEmailResult> {
    return this.emailProvider.send(options);
  }
}
