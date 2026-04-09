import { Module } from '@nestjs/common';

import { AuthModule } from '../auth';
import { UserController } from './user.controller';
import { UserRepository } from './repository';
import { UserService } from './service';

@Module({
  imports: [AuthModule],
  controllers: [UserController],
  providers: [UserRepository, UserService],
  exports: [UserRepository, UserService],
})
export class UserModule {}
