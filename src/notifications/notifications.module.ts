import { DynamicModule, Module, Provider } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';

import { NOTIFICATIONS_QUEUE } from '../queues/queue.constants';
import { NOTIFICATIONS_MODULE_OPTIONS } from './notification.constants';
import {
  NotificationProviderName,
  NotificationsModuleAsyncOptions,
  NotificationsModuleOptions,
} from './notifications.types';
import { NotificationsProcessor } from './processors/notifications.processor';
import { FcmProvider } from './providers/fcm.provider';
import {
  NOTIFICATION_PROVIDER_TOKEN,
  NotificationProvider,
} from './providers/notification-provider.interface';
import { OneSignalProvider } from './providers/onesignal.provider';
import { NotificationsQueueService } from './queue/notifications-queue.service';
import { NotificationsService } from './processors/notifications.service';

@Module({})
export class NotificationsModule {
  static register(options: NotificationsModuleOptions): DynamicModule {
    return this.createDynamicModule([
      {
        provide: NOTIFICATIONS_MODULE_OPTIONS,
        useValue: options,
      },
    ]);
  }

  static registerAsync(
    options: NotificationsModuleAsyncOptions,
  ): DynamicModule {
    return this.createDynamicModule(
      [
        {
          provide: NOTIFICATIONS_MODULE_OPTIONS,
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
      module: NotificationsModule,
      imports: [
        ...imports,
        BullModule.registerQueue({ name: NOTIFICATIONS_QUEUE }),
      ],
      providers: [
        ...optionsProviders,
        OneSignalProvider,
        FcmProvider,
        NotificationsService,
        NotificationsQueueService,
        NotificationsProcessor,
        {
          provide: NOTIFICATION_PROVIDER_TOKEN,
          useFactory: (
            options: NotificationsModuleOptions,
            oneSignalProvider: OneSignalProvider,
            fcmProvider: FcmProvider,
          ): NotificationProvider => {
            switch (options.provider) {
              case 'onesignal':
                return oneSignalProvider;
              case 'fcm':
                return fcmProvider;
              default:
                return NotificationsModule.throwUnsupportedProvider(
                  options.provider,
                );
            }
          },
          inject: [
            NOTIFICATIONS_MODULE_OPTIONS,
            OneSignalProvider,
            FcmProvider,
          ],
        },
      ],
      exports: [
        NotificationsService,
        NotificationsQueueService,
        NOTIFICATION_PROVIDER_TOKEN,
      ],
    };
  }

  private static throwUnsupportedProvider(
    provider: NotificationProviderName,
  ): never {
    throw new Error(`Unsupported notification provider: ${provider}`);
  }
}
