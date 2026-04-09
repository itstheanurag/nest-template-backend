import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../repository';
import { throwNotFoundException } from 'src/common/error';

@Injectable()
export class UserService {
  constructor(private readonly usersRepository: UserRepository) {}

  findAll() {
    return this.usersRepository.findAll();
  }

  async findById(id: string) {
    const user = await this.usersRepository.findById(id);
    if (!user) throwNotFoundException('user.NOT_FOUND');
    return user;
  }

  async findByEmail(email: string) {
    return this.usersRepository.findByEmail(email);
  }
}
