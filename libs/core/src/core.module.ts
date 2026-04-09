import { Module } from '@nestjs/common';
import { CoreService } from './core.service';
import { ShutdownService } from './services/shutdown.service';

@Module({
  providers: [CoreService, ShutdownService],
  exports: [CoreService, ShutdownService],
})
export class CoreModule {}
