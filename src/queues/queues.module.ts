import { Global, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('REDIS_HOST') ?? '127.0.0.1',
          port: Number(configService.get<string>('REDIS_PORT') ?? 6379),
          username: configService.get<string>('REDIS_USERNAME') || undefined,
          password: configService.get<string>('REDIS_PASSWORD') || undefined,
          db: Number(configService.get<string>('REDIS_DB') ?? 0),
        },
        prefix: configService.get<string>('QUEUE_PREFIX') ?? 'nest-template',
      }),
    }),
  ],
  exports: [BullModule],
})
export class QueuesModule {}
