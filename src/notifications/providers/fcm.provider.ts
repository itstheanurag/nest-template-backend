import { Inject, Injectable, Logger, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { App, cert, getApp, getApps, initializeApp } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';

import { NOTIFICATIONS_MODULE_OPTIONS } from '../notification.constants';
import {
  FcmProviderOptions,
  NotificationsModuleOptions,
} from '../notifications.types';
import {
  NotificationProvider,
  PushNotificationOptions,
  PushNotificationResult,
} from './notification-provider.interface';

@Injectable()
export class FcmProvider implements NotificationProvider {
  private readonly logger = new Logger(FcmProvider.name);
  private app: App | null = null;

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
      const messaging = getMessaging(this.getOrCreateApp());
      const data = this.stringifyData(options.data);

      if (Array.isArray(options.to)) {
        const response = await messaging.sendEachForMulticast({
          tokens: options.to,
          notification: {
            title: options.title,
            body: options.message,
          },
          data,
        });

        if (response.failureCount > 0) {
          const firstError = response.responses.find(
            (item) => !item.success,
          )?.error;
          throw firstError ?? new Error('FCM multicast delivery failed');
        }

        const firstMessageId = response.responses[0]?.messageId;
        this.logger.log(
          `Push sent via FCM multicast to ${options.to.length} recipients`,
        );
        return { success: true, externalId: firstMessageId };
      }

      const messageId = await messaging.send({
        token: this.isTopicTarget(options.to) ? undefined : options.to,
        topic: this.isTopicTarget(options.to)
          ? this.normalizeTopic(options.to)
          : undefined,
        notification: {
          title: options.title,
          body: options.message,
        },
        data,
      });

      this.logger.log(`Push sent via FCM: ${messageId}`);
      return { success: true, externalId: messageId };
    } catch (error: any) {
      this.logger.error(`FCM send failed: ${error.message}`, error.stack);
      return { success: false, error: error.message };
    }
  }

  private getOrCreateApp(): App {
    if (this.app) {
      return this.app;
    }

    const fcmOptions = this.resolveOptions();
    const appName = fcmOptions.appName ?? 'notifications-fcm';

    this.app = getApps().some((app) => app.name === appName)
      ? getApp(appName)
      : initializeApp(
          {
            credential: cert(this.resolveServiceAccount(fcmOptions)),
            projectId: fcmOptions.projectId,
          },
          appName,
        );

    return this.app;
  }

  private resolveOptions(): FcmProviderOptions {
    return {
      projectId:
        this.moduleOptions?.fcm?.projectId ??
        this.configService.get<string>('FCM_PROJECT_ID'),
      clientEmail:
        this.moduleOptions?.fcm?.clientEmail ??
        this.configService.get<string>('FCM_CLIENT_EMAIL'),
      privateKey:
        this.moduleOptions?.fcm?.privateKey ??
        this.configService.get<string>('FCM_PRIVATE_KEY'),
      serviceAccountJson:
        this.moduleOptions?.fcm?.serviceAccountJson ??
        this.configService.get<string>('FCM_SERVICE_ACCOUNT_JSON'),
      appName:
        this.moduleOptions?.fcm?.appName ??
        this.configService.get<string>('FCM_APP_NAME'),
    };
  }

  private resolveServiceAccount(options: FcmProviderOptions) {
    if (options.serviceAccountJson) {
      return JSON.parse(options.serviceAccountJson);
    }

    if (!options.projectId || !options.clientEmail || !options.privateKey) {
      throw new Error(
        'FCM credentials are missing. Provide FCM_SERVICE_ACCOUNT_JSON or FCM_PROJECT_ID, FCM_CLIENT_EMAIL, and FCM_PRIVATE_KEY.',
      );
    }

    return {
      projectId: options.projectId,
      clientEmail: options.clientEmail,
      privateKey: options.privateKey.replace(/\\n/g, '\n'),
    };
  }

  private stringifyData(data?: Record<string, any>): Record<string, string> {
    if (!data) {
      return {};
    }

    return Object.entries(data).reduce<Record<string, string>>(
      (result, [key, value]) => {
        result[key] = typeof value === 'string' ? value : JSON.stringify(value);
        return result;
      },
      {},
    );
  }

  private isTopicTarget(target: string): boolean {
    return target.startsWith('/topics/') || target.startsWith('topics/');
  }

  private normalizeTopic(target: string): string {
    return target.replace(/^\/?topics\//, '');
  }
}
