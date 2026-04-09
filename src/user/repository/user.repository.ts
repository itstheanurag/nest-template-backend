import { Inject, Injectable } from '@nestjs/common';
import { desc, eq } from 'drizzle-orm';
import { DATABASE } from '../../database';
import type { DatabaseInstance } from '../../database';
import { users } from '../schema/users.schema';

@Injectable()
export class UserRepository {
  constructor(@Inject(DATABASE) private readonly db: DatabaseInstance) {}

  findAll() {
    return this.db.select().from(users).orderBy(desc(users.createdAt));
  }

  async findById(id: string) {
    return this.db.query.users.findFirst({
      where: eq(users.id, id),
    });
  }

  async findByEmail(email: string) {
    return this.db.query.users.findFirst({
      where: eq(users.email, email.toLowerCase()),
    });
  }
}
