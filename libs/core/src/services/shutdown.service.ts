import { Injectable, Logger, OnApplicationShutdown } from '@nestjs/common';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { ServerOptions } from '../http/server/server.interface';
const APPLICATION_SHUTDOWN_TIME = 5000;

@Injectable()
export class ShutdownService implements OnApplicationShutdown {
  private readonly logger = new Logger(ShutdownService.name);
  private app: NestFastifyApplication | null = null;
  private isShuttingDown = false;

  /**
   * Subscribes to system signals (SIGTERM, SIGINT) to initiate graceful shutdown.
   */
  subscribeToShutdown(
    app: NestFastifyApplication,
    options?: ServerOptions,
  ): void {
    this.app = app;
    const shutdownTimeout =
      options?.shutdownTimeoutMs ?? APPLICATION_SHUTDOWN_TIME;

    const handleSignal = async (signal: string) => {
      this.logger.log(`Received ${signal}, starting graceful shutdown...`);
      await this.shutdown(shutdownTimeout);
    };

    process.on('SIGTERM', () => handleSignal('SIGTERM'));
    process.on('SIGINT', () => handleSignal('SIGINT'));
  }

  /**
   * Orchestrates the graceful shutdown of the application.
   */
  async shutdown(timeoutMs: number = APPLICATION_SHUTDOWN_TIME): Promise<void> {
    if (this.isShuttingDown) {
      this.logger.warn('Shutdown already in progress...');
      return;
    }

    if (!this.app) {
      this.logger.warn('No active application instance to shutdown');
      return;
    }

    this.isShuttingDown = true;
    this.logger.log('Initiating graceful shutdown sequence...');

    const shutdownPromise = this.app.close();
    const timeoutPromise = new Promise<void>((_, reject) =>
      setTimeout(() => {
        reject(new Error('Shutdown timeout exceeded'));
      }, timeoutMs),
    );

    try {
      await Promise.race([shutdownPromise, timeoutPromise]);
      this.logger.log('Application shut down gracefully');
      // For shell processes to exit cleanly after async ops
      process.exit(0);
    } catch (error) {
      this.logger.error(`Shutdown error: ${(error as Error).message}`);
      process.exit(1);
    } finally {
      this.app = null;
      this.isShuttingDown = false;
    }
  }

  /**
   * Implementation of NestJS OnApplicationShutdown hook.
   * This is called by NestJS during app.close()
   */
  onApplicationShutdown(signal?: string): void {
    if (signal) {
      this.logger.log(
        `NestJS lifecycle: Application shutting down on signal: ${signal}`,
      );
    } else {
      this.logger.log('NestJS lifecycle: Application shutting down...');
    }
  }
}
