import { Controller, Get, Req, Param } from '@nestjs/common';

import { AuthService } from '../auth';
import { UserService } from './service/user.service';
import { throwUnauthorizedException } from 'src/common/error';

@Controller('users')
export class UserController {
  constructor(
    private readonly usersService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Get('me')
  async me(@Req() request: any) {
    const session = await this.authService.getSession(request.headers);

    if (!session?.user) throwUnauthorizedException('auth.SESSION_EXPIRED');

    return session.user;
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }
}
