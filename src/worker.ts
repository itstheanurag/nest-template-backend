import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Logger as NestjsPinoLogger } from 'nestjs-pino';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    bufferLogs: true,
  });

  app.useLogger(app.get(NestjsPinoLogger));
  app.flushLogs();

  app.enableShutdownHooks();
  const logger = new Logger('WorkerBootstrap');
  logger.log('Queue worker context started');
}

void bootstrap();
