import { Inject, Injectable } from '@nestjs/common';

import {
  NOTIFICATION_PROVIDER_TOKEN,
  NotificationProvider,
  PushNotificationOptions,
  PushNotificationResult,
} from '../providers/notification-provider.interface';

@Injectable()
export class NotificationsService {
  constructor(
    @Inject(NOTIFICATION_PROVIDER_TOKEN)
    private readonly notificationProvider: NotificationProvider,
  ) {}

  send(options: PushNotificationOptions): Promise<PushNotificationResult> {
    return this.notificationProvider.send(options);
  }
}
