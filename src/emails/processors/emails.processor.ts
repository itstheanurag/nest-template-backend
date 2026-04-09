import { Injectable, Logger } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

import { EMAILS_QUEUE } from '../../queues/queue.constants';
import { EmailsService } from './emails.service';
import { EmailJobData } from '../queue/email-job.interface';

@Injectable()
@Processor(EMAILS_QUEUE)
export class EmailsProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailsProcessor.name);

  constructor(private readonly emailsService: EmailsService) {
    super();
  }

  async process(job: Job<EmailJobData>) {
    this.logger.log(`Processing email job ${job.id}`);

    const result = await this.emailsService.send(job.data);

    if (!result.success) {
      throw new Error(result.error ?? 'Email delivery failed');
    }

    return result;
  }
}
