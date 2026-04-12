import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { CoreService } from './core.service';
import { createLoggerConfig } from './logging';
import { ShutdownService } from './services/shutdown.service';

@Module({
  imports: [
    ConfigModule,
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: createLoggerConfig,
    }),
  ],
  providers: [CoreService, ShutdownService],
  exports: [CoreService, ShutdownService, LoggerModule],
})
export class CoreModule {}
