import { Injectable, Logger } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

import { NOTIFICATIONS_QUEUE } from '../../queues/queue.constants';
import { NotificationJobData } from '../queue/notification-job.interface';
import { NotificationsService } from './notifications.service';

@Injectable()
@Processor(NOTIFICATIONS_QUEUE)
export class NotificationsProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationsProcessor.name);

  constructor(private readonly notificationsService: NotificationsService) {
    super();
  }

  async process(job: Job<NotificationJobData>) {
    this.logger.log(`Processing notification job ${job.id}`);

    const result = await this.notificationsService.send(job.data);

    if (!result.success) {
      throw new Error(result.error ?? 'Notification delivery failed');
    }

    return result;
  }
}
