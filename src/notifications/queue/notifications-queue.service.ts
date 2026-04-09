import { Inject, Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';

import { NOTIFICATIONS_MODULE_OPTIONS } from '../notification.constants';
import { NotificationsModuleOptions } from '../notifications.types';
import { NotificationJobData } from './notification-job.interface';
import {
  NOTIFICATIONS_QUEUE,
  NOTIFICATIONS_SEND_JOB,
} from '../../queues/queue.constants';

@Injectable()
export class NotificationsQueueService {
  constructor(
    @InjectQueue(NOTIFICATIONS_QUEUE)
    private readonly notificationsQueue: Queue<NotificationJobData>,
    @Inject(NOTIFICATIONS_MODULE_OPTIONS)
    private readonly moduleOptions: NotificationsModuleOptions,
  ) {}

  async enqueue(data: NotificationJobData) {
    const defaultJobOptions = this.moduleOptions.defaultJobOptions;

    return this.notificationsQueue.add(NOTIFICATIONS_SEND_JOB, data, {
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
