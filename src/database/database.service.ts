import { Inject, Injectable, OnApplicationShutdown } from '@nestjs/common';

import { DATABASE, DATABASE_CLIENT } from './database.constants';
import { DatabaseClient, DatabaseInstance } from './database.types';

@Injectable()
export class DatabaseService implements OnApplicationShutdown {
  constructor(
    @Inject(DATABASE_CLIENT)
    readonly client: DatabaseClient,
    @Inject(DATABASE)
    readonly db: DatabaseInstance,
  ) {}

  async onApplicationShutdown(): Promise<void> {
    await this.client.end({ timeout: 5 });
  }
}
