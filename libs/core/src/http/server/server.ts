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
  Logger as NestjsPinoLogger,
  LoggerErrorInterceptor,
} from 'nestjs-pino';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ServerOptions } from './server.interface';
import { ValidationPipe } from '@app/core/pipes';
import { ShutdownService } from '../../services/shutdown.service';

type ModuleType = Type<any> | DynamicModule | ForwardReference;

export class ServerClass {
  private static appLogger = new Logger('HTTP');
  private static app: NestFastifyApplication | null = null;

  static async make(
    module: ModuleType,
    options?: ServerOptions,
  ): Promise<NestFastifyApplication> {
    const app = await NestFactory.create<NestFastifyApplication>(
      module,
      new FastifyAdapter(),
      {
        bufferLogs: true,
      },
    );

    app.useLogger(app.get(NestjsPinoLogger));
    app.useGlobalInterceptors(new LoggerErrorInterceptor());

    const config = app.get(ConfigService);

    this.setupVersioning(app, options);
    this.setupSwagger(app, config, options);
    this.setupCors(app, config);
    await app.register(helmet);
    this.setupValidation(app);

    const port =
      options?.port ||
      config.get<number>('app.port') ||
      config.get<number>('APP_PORT') ||
      config.get<number>('PORT', 3000);

    await app.listen(port, '0.0.0.0');
    this.appLogger.log(`Server is running on: ${await app.getUrl()}`);

    this.app = app;
    app.enableShutdownHooks();

    // Initialize graceful shutdown via injectable service
    const shutdownService = app.get(ShutdownService);
    shutdownService.subscribeToShutdown(app, options);

    return app;
  }

  /**
   * Get the current application instance
   */
  static getApp(): NestFastifyApplication | null {
    return this.app;
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
      .setDescription(`${appName} is a gym exercise tracker app.`)
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
}
