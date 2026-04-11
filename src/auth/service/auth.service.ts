import { Inject, Injectable } from '@nestjs/common';
import { fromNodeHeaders } from 'better-auth/node';
import { AUTH_INSTANCE } from '../auth.constants';
import { AuthInstance } from '../auth.types';

@Injectable()
export class AuthService {
  constructor(
    @Inject(AUTH_INSTANCE)
    private readonly auth: AuthInstance,
  ) {}

  get instance(): AuthInstance {
    return this.auth;
  }

  async getSession(headers: Record<string, string | string[] | undefined>) {
    return this.auth.api.getSession({
      headers: fromNodeHeaders(headers),
    });
  }
}
