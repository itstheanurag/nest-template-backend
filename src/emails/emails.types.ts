import { ModuleMetadata } from '@nestjs/common';

export type EmailProviderName = 'smtp';

export interface SmtpProviderOptions {
  host?: string;
  port?: number;
  secure?: boolean;
  user?: string;
  pass?: string;
  from?: string;
}

export interface EmailsModuleOptions {
  provider: EmailProviderName;
  smtp?: SmtpProviderOptions;
  defaultJobOptions?: {
    attempts?: number;
    backoffDelay?: number;
    removeOnComplete?: number;
    removeOnFail?: number;
  };
}

export interface EmailsModuleAsyncOptions extends Pick<
  ModuleMetadata,
  'imports'
> {
  inject?: any[];
  useFactory: (
    ...args: any[]
  ) => Promise<EmailsModuleOptions> | EmailsModuleOptions;
}
