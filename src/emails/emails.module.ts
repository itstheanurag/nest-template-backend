import { DynamicModule, Module, Provider } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';

import { EMAILS_QUEUE } from '../queues/queue.constants';
import { EMAILS_MODULE_OPTIONS } from './email.constants';
import { EmailsModuleAsyncOptions, EmailsModuleOptions } from './emails.types';
import { EmailsProcessor } from './processors/emails.processor';
import {
  EMAIL_PROVIDER_TOKEN,
  EmailProvider,
} from './providers/email-provider.interface';
import { SmtpProvider } from './providers/smtp.provider';
import { EmailsQueueService } from './queue/emails-queue.service';
import { EmailsService } from './processors/emails.service';

@Module({})
export class EmailsModule {
  static register(options: EmailsModuleOptions): DynamicModule {
    return this.createDynamicModule([
      {
        provide: EMAILS_MODULE_OPTIONS,
        useValue: options,
      },
    ]);
  }

  static registerAsync(options: EmailsModuleAsyncOptions): DynamicModule {
    return this.createDynamicModule(
      [
        {
          provide: EMAILS_MODULE_OPTIONS,
          useFactory: options.useFactory,
          inject: options.inject ?? [],
        },
      ],
      options.imports,
    );
  }

  private static createDynamicModule(
    optionsProviders: Provider[],
    imports: DynamicModule['imports'] = [],
  ): DynamicModule {
    return {
      module: EmailsModule,
      imports: [...imports, BullModule.registerQueue({ name: EMAILS_QUEUE })],
      providers: [
        ...optionsProviders,
        SmtpProvider,
        EmailsService,
        EmailsQueueService,
        EmailsProcessor,
        {
          provide: EMAIL_PROVIDER_TOKEN,
          useFactory: (smtpProvider: SmtpProvider): EmailProvider =>
            smtpProvider,
          inject: [SmtpProvider],
        },
      ],
      exports: [EmailsService, EmailsQueueService, EMAIL_PROVIDER_TOKEN],
    };
  }
}
