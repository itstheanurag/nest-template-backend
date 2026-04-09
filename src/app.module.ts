import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CoreModule } from '@app/core';
import config from '../config';
import { AuthModule } from './auth';
import { DatabaseModule } from './database';
import { EmailsModule } from './emails';
import { NotificationProviderName, NotificationsModule } from './notifications';
import { QueuesModule } from './queues';
import { UsersModule } from './user';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: config,
    }),
    DatabaseModule,
    QueuesModule,
    CoreModule,
    NotificationsModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        provider: (configService.get<string>('NOTIFICATIONS_PROVIDER') ??
          'fcm') as NotificationProviderName,
        onesignal: {
          appId: configService.get<string>('ONESIGNAL_APP_ID'),
          apiKey: configService.get<string>('ONESIGNAL_API_KEY'),
        },
        fcm: {
          projectId: configService.get<string>('FCM_PROJECT_ID'),
          clientEmail: configService.get<string>('FCM_CLIENT_EMAIL'),
          privateKey: configService.get<string>('FCM_PRIVATE_KEY'),
          serviceAccountJson: configService.get<string>(
            'FCM_SERVICE_ACCOUNT_JSON',
          ),
          appName: configService.get<string>('FCM_APP_NAME'),
        },
        defaultJobOptions: {
          attempts: Number(
            configService.get<string>('NOTIFICATIONS_QUEUE_ATTEMPTS') ?? 3,
          ),
          backoffDelay: Number(
            configService.get<string>('NOTIFICATIONS_QUEUE_BACKOFF_MS') ?? 5000,
          ),
        },
      }),
    }),
    EmailsModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        provider: 'smtp',
        smtp: {
          host: configService.get<string>('SMTP_HOST'),
          port: Number(configService.get<string>('SMTP_PORT') ?? 587),
          secure: configService.get<string>('SMTP_SECURE') === 'true',
          user: configService.get<string>('SMTP_USER'),
          pass: configService.get<string>('SMTP_PASS'),
          from: configService.get<string>('SMTP_FROM'),
        },
        defaultJobOptions: {
          attempts: Number(
            configService.get<string>('EMAILS_QUEUE_ATTEMPTS') ?? 3,
          ),
          backoffDelay: Number(
            configService.get<string>('EMAILS_QUEUE_BACKOFF_MS') ?? 5000,
          ),
        },
      }),
    }),
    AuthModule,
    UsersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
