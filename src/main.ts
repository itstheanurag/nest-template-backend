import { ServerClass } from '@app/core';
import { AppModule } from './app.module';

ServerClass.make(AppModule, {
  enableVersioning: true,
  enableApiDocumentation: process.env.NODE_ENV !== 'production' ? true : false,
  enableServerLogs: process.env.NODE_ENV === 'production' ? true : false,
});
