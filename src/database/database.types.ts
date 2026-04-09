import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { Sql } from 'postgres';

import * as schema from './schema';

export type DatabaseClient = Sql<Record<string, unknown>>;
export type DatabaseInstance = PostgresJsDatabase<typeof schema>;
