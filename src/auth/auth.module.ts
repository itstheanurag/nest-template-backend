import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from '@better-auth/drizzle-adapter';
import { DATABASE } from '../database';
import * as schema from '../database/schema';
import { AuthController } from './auth.controller';
import { AUTH_INSTANCE } from './auth.constants';
import { AuthService } from './auth.service';

@Module({
  imports: [ConfigModule],
  controllers: [AuthController],
  providers: [
    {
      provide: AUTH_INSTANCE,
      inject: [DATABASE, ConfigService],
      useFactory: (db: any, configService: ConfigService) => {
        const baseURL = configService.get<string>('BETTER_AUTH_URL');
        const secret =
          configService.get<string>('BETTER_AUTH_SECRET') ??
          'development-secret-change-me';
        const trustedOrigins = (
          configService.get<string>('BETTER_AUTH_TRUSTED_ORIGINS') ??
          configService.get<string>('CORS_ALLOWED_ORIGINS') ??
          ''
        )
          .split(',')
          .map((origin) => origin.trim())
          .filter(Boolean);

        return betterAuth({
          appName: configService.get<string>('APP_NAME') ?? 'nest-template',
          baseURL,
          basePath: '/auth',
          secret,
          trustedOrigins,
          database: drizzleAdapter(db, {
            provider: 'pg',
            schema,
            usePlural: true,
          }),
          emailAndPassword: {
            enabled: true,
          },
          user: {
            additionalFields: {},
          },
          session: {
            expiresIn: 60 * 60 * 24 * 7,
            updateAge: 60 * 60 * 24,
          },
        });
      },
    },
    AuthService,
  ],
  exports: [AUTH_INSTANCE, AuthService],
})
export class AuthModule {}
