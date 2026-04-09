export const NOTIFICATIONS_MODULE_OPTIONS = Symbol(
  'NOTIFICATIONS_MODULE_OPTIONS',
);

export const NOTIFICATIONS_TABLE = 'notifications';

export enum NotificationType {
  ANNOUNCEMENT = 'announcement',
  TRANSACTIONAL = 'transactional',
  REMINDER = 'reminder',
}

export enum NotificationStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SENT = 'sent',
  FAILED = 'failed',
  READ = 'read',
}

export enum NotificationTargetType {
  ALL = 'all',
  USER = 'user',
  SEGMENT = 'segment',
}
