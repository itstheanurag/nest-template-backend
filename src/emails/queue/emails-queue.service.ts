import { Inject, Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

import { EMAILS_MODULE_OPTIONS } from '../email.constants';
import { EmailsModuleOptions } from '../emails.types';
import { EMAILS_QUEUE, EMAILS_SEND_JOB } from '../../queues/queue.constants';
import { EmailJobData } from './email-job.interface';

@Injectable()
export class EmailsQueueService {
  constructor(
    @InjectQueue(EMAILS_QUEUE)
    private readonly emailsQueue: Queue<EmailJobData>,
    @Inject(EMAILS_MODULE_OPTIONS)
    private readonly moduleOptions: EmailsModuleOptions,
  ) {}

  async enqueue(data: EmailJobData) {
    const defaultJobOptions = this.moduleOptions.defaultJobOptions;

    return this.emailsQueue.add(EMAILS_SEND_JOB, data, {
      attempts: defaultJobOptions?.attempts ?? 3,
      backoff: {
        type: 'exponential',
        delay: defaultJobOptions?.backoffDelay ?? 5000,
      },
      removeOnComplete: defaultJobOptions?.removeOnComplete ?? 100,
      removeOnFail: defaultJobOptions?.removeOnFail ?? 100,
    });
  }
}
