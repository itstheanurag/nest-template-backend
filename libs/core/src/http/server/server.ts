import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import {
  DynamicModule,
  ForwardReference,
  Type,
  VersioningType,
  Logger,
} from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from '@fastify/helmet';
import * as fs from 'fs';
import * as path from 'path';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ServerOptions } from './server.interface';
import { ValidationPipe } from '@app/core/pipes';

type ModuleType = Type<any> | DynamicModule | ForwardReference;

export class ServerClass {
  private static appLogger = new Logger('HTTP');
  private static app: NestFastifyApplication | null = null;
  private static isShuttingDown = false;

  static async make(
    module: ModuleType,
    options?: ServerOptions,
  ): Promise<NestFastifyApplication> {
    const app = await NestFactory.create<NestFastifyApplication>(
      module,
      new FastifyAdapter(),
      {
        logger: ['log', 'error', 'warn', 'debug', 'verbose'],
      },
    );

    const config = app.get(ConfigService);

    this.setupVersioning(app, options);
    this.setupSwagger(app, config, options);
    this.setupCors(app, config);
    await app.register(helmet);
    this.setupValidation(app);
    this.setupRequestLogging(app, options);

    const port = options?.port || config.get<number>('PORT', 3000);
    await app.listen(port, '0.0.0.0');
    this.appLogger.log(`Server is running on: ${await app.getUrl()}`);

    this.app = app;
    app.enableShutdownHooks();
    this.setupGracefulShutdown(options);

    return app;
  }

  /**
   * Gracefully shutdown the server
   * @param timeoutMs - Maximum time to wait for in-flight requests (default: 10000ms)
   */
  static async shutdown(timeoutMs: number = 10000): Promise<void> {
    if (this.isShuttingDown) {
      this.appLogger.warn('Shutdown already in progress...');
      return;
    }

    if (!this.app) {
      this.appLogger.warn('No active server instance to shutdown');
      return;
    }

    this.isShuttingDown = true;
    this.appLogger.log('Initiating graceful shutdown...');

    const shutdownPromise = this.app.close();
    const timeoutPromise = new Promise<void>((_, reject) =>
      setTimeout(
        () => reject(new Error('Shutdown timeout exceeded')),
        timeoutMs,
      ),
    );

    try {
      await Promise.race([shutdownPromise, timeoutPromise]);
      this.appLogger.log('Server shut down gracefully');
    } catch (error) {
      this.appLogger.error(`Shutdown error: ${(error as Error).message}`);
    } finally {
      this.app = null;
      this.isShuttingDown = false;
    }
  }

  /**
   * Get the current application instance
   */
  static getApp(): NestFastifyApplication | null {
    return this.app;
  }

  private static setupGracefulShutdown(options?: ServerOptions) {
    const shutdownTimeout = options?.shutdownTimeoutMs ?? 10000;

    const handleSignal = async (signal: string) => {
      this.appLogger.log(`Received ${signal}, starting graceful shutdown...`);
      await this.shutdown(shutdownTimeout);
    };

    process.on('SIGTERM', () => handleSignal('SIGTERM'));
    process.on('SIGINT', () => handleSignal('SIGINT'));
  }

  private static setupVersioning(
    app: NestFastifyApplication,
    options?: ServerOptions,
  ) {
    if (options?.enableVersioning) {
      app.enableVersioning({
        type: VersioningType.URI,
        prefix: 'api/v',
        defaultVersion: '1',
      });
    }
  }

  private static setupSwagger(
    app: NestFastifyApplication,
    config: ConfigService,
    options?: ServerOptions,
  ) {
    if (!options?.enableApiDocumentation) return;

    const appName =
      process.env.npm_package_name ??
      config.get<string>('APP_NAME', 'NestJS App');
    const appVersion =
      process.env.npm_package_version ??
      config.get<string>('APP_VERSION', '1.0.0');

    const documentBuilder = new DocumentBuilder()
      .setTitle(appName)
      .setDescription(
        `${appName} is a gym exercise tracker app.
        \n\n[Download OpenAPI JSON](api/docs/api.json) | [Download OpenAPI YAML](api/docs/api.yaml)`,
      )
      .setVersion(appVersion)
      .addBearerAuth()
      .build();

    const swaggerDocument = SwaggerModule.createDocument(app, documentBuilder);

    // Save swagger JSON to file for agents
    try {
      const outputPath = path.resolve(process.cwd(), 'api.json');
      fs.writeFileSync(outputPath, JSON.stringify(swaggerDocument, null, 2), {
        encoding: 'utf8',
      });
      this.appLogger.log(`API documentation saved to: ${outputPath}`);
    } catch (error) {
      this.appLogger.error(
        `Failed to save API documentation: ${(error as Error).message}`,
      );
    }

    SwaggerModule.setup('api/docs', app, swaggerDocument, {
      swaggerOptions: { persistAuthorization: true },
      jsonDocumentUrl: 'api/docs/api.json',
      yamlDocumentUrl: 'api/docs/api.yaml',
    });
  }

  private static setupCors(app: NestFastifyApplication, config: ConfigService) {
    const allowedOrigins = config
      .get<string>('CORS_ALLOWED_ORIGINS', '')
      .split(',')
      .filter(Boolean);
    const allowedMethods = config
      .get<string>('CORS_ALLOWED_METHODS', '')
      .split(',')
      .filter(Boolean);

    app.enableCors({
      origin: (origin, callback) => {
        const allowed = !origin || allowedOrigins.includes(origin);

        if (!allowed) {
          this.appLogger.warn(`CORS blocked: origin=${origin}, method=N/A`);
          callback(new Error('Not allowed by CORS'), false);
        } else {
          callback(null, true);
        }
      },
      methods: allowedMethods,
      credentials: true,
    });

    this.appLogger.log(
      `CORS allowed: origin=${allowedOrigins.join(',') ?? 'direct request'}, allowedMethods=${allowedMethods.join(',')}`,
    );
  }

  private static setupValidation(app: NestFastifyApplication) {
    app.useGlobalPipes(new ValidationPipe());
  }

  private static setupRequestLogging(
    app: NestFastifyApplication,
    options?: ServerOptions,
  ) {
    if (!options?.enableServerLogs) return;

    app
      .getHttpAdapter()
      .getInstance()
      .addHook('onResponse', (req, res, done) => {
        const { method, url } = req;
        const duration = Date.now() - (req as any).startTime;
        this.appLogger.log(
          `${method} ${url} ${res.statusCode} - ${duration}ms`,
        );
        done();
      });

    // Track start time for duration calculation
    app
      .getHttpAdapter()
      .getInstance()
      .addHook('onRequest', (req, _res, done) => {
        (req as any).startTime = Date.now();
        done();
      });
  }
}
