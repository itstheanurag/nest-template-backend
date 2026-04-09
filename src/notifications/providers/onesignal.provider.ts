import { Inject, Injectable, Logger, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { NOTIFICATIONS_MODULE_OPTIONS } from '../notification.constants';
import { NotificationsModuleOptions } from '../notifications.types';
import {
  NotificationProvider,
  PushNotificationOptions,
  PushNotificationResult,
} from './notification-provider.interface';

@Injectable()
export class OneSignalProvider implements NotificationProvider {
  private readonly logger = new Logger(OneSignalProvider.name);

  constructor(
    private readonly configService: ConfigService,
    @Optional()
    @Inject(NOTIFICATIONS_MODULE_OPTIONS)
    private readonly moduleOptions?: NotificationsModuleOptions,
  ) {}

  async send(
    options: PushNotificationOptions,
  ): Promise<PushNotificationResult> {
    try {
      const appId =
        this.moduleOptions?.onesignal?.appId ??
        this.configService.get<string>('ONESIGNAL_APP_ID');
      const apiKey =
        this.moduleOptions?.onesignal?.apiKey ??
        this.configService.get<string>('ONESIGNAL_API_KEY');
      const apiUrl =
        this.moduleOptions?.onesignal?.apiUrl ??
        'https://onesignal.com/api/v1/notifications';

      if (!appId || !apiKey) {
        throw new Error(
          'OneSignal credentials are missing. Provide ONESIGNAL_APP_ID and ONESIGNAL_API_KEY.',
        );
      }

      const recipients = Array.isArray(options.to) ? options.to : [options.to];

      const body: Record<string, any> = {
        app_id: appId,
        headings: { en: options.title },
        contents: { en: options.message },
        data: options.data,
        include_external_user_ids: recipients,
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          Authorization: `Basic ${apiKey}`,
        },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.errors?.[0] || 'Unknown OneSignal error');
      }

      this.logger.log(`Push sent via OneSignal: ${result.id}`);
      return { success: true, externalId: result.id };
    } catch (error: any) {
      this.logger.error(`OneSignal send failed: ${error.message}`, error.stack);
      return { success: false, error: error.message };
    }
  }
}
