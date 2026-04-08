import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  debug: +process.env.APP_DEBUG! || 1,
  port: +process.env.APP_PORT! || 3000,
}));
