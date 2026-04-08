import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// Get the user object/entity that is populated by Passport-JWT
export const GetUser = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    if (user) {
      user['jwt'] = request.headers.authorization.split(' ')[1];
    }
    return data ? user && user[data] : user;
  },
);
