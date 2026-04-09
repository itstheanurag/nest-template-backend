import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { DATABASE, DATABASE_CLIENT } from './database.constants';
import { DatabaseService } from './database.service';
import * as schema from './schema';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: DATABASE_CLIENT,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const connectionString =
          configService.get<string>('DATABASE_URL') ??
          'postgresql://postgres:postgres@localhost:5432/nest_template';
        const databaseSsl =
          configService.get<string>('DATABASE_SSL') === 'true' ||
          connectionString.includes('sslmode=require');
        const maxConnections = Number(
          configService.get<string>('DATABASE_MAX_CONNECTIONS') ?? 10,
        );

        return postgres(connectionString, {
          max: maxConnections,
          ssl: databaseSsl ? 'require' : undefined,
          prepare: false,
        });
      },
    },
    {
      provide: DATABASE,
      inject: [DATABASE_CLIENT],
      useFactory: (client: ReturnType<typeof postgres>) =>
        drizzle(client, { schema }),
    },
    DatabaseService,
  ],
  exports: [DATABASE_CLIENT, DATABASE, DatabaseService],
})
export class DatabaseModule {}
