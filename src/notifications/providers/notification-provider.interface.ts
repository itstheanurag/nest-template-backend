export interface PushNotificationOptions {
  to: string | string[]; // User IDs, player IDs, or segment names
  title: string;
  message: string;
  data?: Record<string, any>;
}

export interface PushNotificationResult {
  success: boolean;
  externalId?: string;
  error?: string;
}

export interface NotificationProvider {
  /**
   * Send a push notification using the configured provider.
   */
  send(options: PushNotificationOptions): Promise<PushNotificationResult>;
}

/**
 * Injection token used by NestJS DI to resolve the active NotificationProvider.
 */
export const NOTIFICATION_PROVIDER_TOKEN = Symbol('NOTIFICATION_PROVIDER');
