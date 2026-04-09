import { ModuleMetadata } from '@nestjs/common';

export type NotificationProviderName = 'onesignal' | 'fcm';

export interface OneSignalProviderOptions {
  appId?: string;
  apiKey?: string;
  apiUrl?: string;
}

export interface FcmProviderOptions {
  projectId?: string;
  clientEmail?: string;
  privateKey?: string;
  serviceAccountJson?: string;
  appName?: string;
}

export interface NotificationsModuleOptions {
  provider: NotificationProviderName;
  onesignal?: OneSignalProviderOptions;
  fcm?: FcmProviderOptions;
  defaultJobOptions?: {
    attempts?: number;
    backoffDelay?: number;
    removeOnComplete?: number;
    removeOnFail?: number;
  };
}

export interface NotificationsModuleAsyncOptions extends Pick<
  ModuleMetadata,
  'imports'
> {
  inject?: any[];
  useFactory: (
    ...args: any[]
  ) => Promise<NotificationsModuleOptions> | NotificationsModuleOptions;
}
