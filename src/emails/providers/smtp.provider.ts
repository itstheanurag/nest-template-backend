import { Inject, Injectable, Logger, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport, Transporter } from 'nodemailer';

import { EMAILS_MODULE_OPTIONS } from '../email.constants';
import { EmailsModuleOptions, SmtpProviderOptions } from '../emails.types';
import {
  EmailProvider,
  SendEmailOptions,
  SendEmailResult,
} from './email-provider.interface';

@Injectable()
export class SmtpProvider implements EmailProvider {
  private readonly logger = new Logger(SmtpProvider.name);
  private transporter: Transporter | null = null;

  constructor(
    private readonly configService: ConfigService,
    @Optional()
    @Inject(EMAILS_MODULE_OPTIONS)
    private readonly moduleOptions?: EmailsModuleOptions,
  ) {}

  async send(options: SendEmailOptions): Promise<SendEmailResult> {
    try {
      const smtpOptions = this.resolveOptions();
      const info = await this.getTransporter().sendMail({
        from: options.from ?? smtpOptions.from,
        to: options.to,
        cc: options.cc,
        bcc: options.bcc,
        replyTo: options.replyTo,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });

      this.logger.log(`Email sent via SMTP: ${info.messageId}`);
      return { success: true, externalId: info.messageId };
    } catch (error: any) {
      this.logger.error(`SMTP send failed: ${error.message}`, error.stack);
      return { success: false, error: error.message };
    }
  }

  private getTransporter(): Transporter {
    if (this.transporter) {
      return this.transporter;
    }

    const smtpOptions = this.resolveOptions();

    if (!smtpOptions.host || !smtpOptions.port || !smtpOptions.from) {
      throw new Error(
        'SMTP configuration is missing. Provide SMTP_HOST, SMTP_PORT, and SMTP_FROM.',
      );
    }

    this.transporter = createTransport({
      host: smtpOptions.host,
      port: smtpOptions.port,
      secure: smtpOptions.secure ?? smtpOptions.port === 465,
      auth:
        smtpOptions.user && smtpOptions.pass
          ? {
              user: smtpOptions.user,
              pass: smtpOptions.pass,
            }
          : undefined,
    });

    return this.transporter;
  }

  private resolveOptions(): SmtpProviderOptions {
    return {
      host:
        this.moduleOptions?.smtp?.host ??
        this.configService.get<string>('SMTP_HOST'),
      port: Number(
        this.moduleOptions?.smtp?.port ??
          this.configService.get<string>('SMTP_PORT') ??
          587,
      ),
      secure:
        this.moduleOptions?.smtp?.secure ??
        this.configService.get<string>('SMTP_SECURE') === 'true',
      user:
        this.moduleOptions?.smtp?.user ??
        this.configService.get<string>('SMTP_USER'),
      pass:
        this.moduleOptions?.smtp?.pass ??
        this.configService.get<string>('SMTP_PASS'),
      from:
        this.moduleOptions?.smtp?.from ??
        this.configService.get<string>('SMTP_FROM'),
    };
  }
}
