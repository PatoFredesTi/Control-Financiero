import { Module } from '@nestjs/common';
import { SystemReadinessController } from './system-readiness.controller';
import { SystemReadinessService } from './system-readiness.service';

@Module({
  controllers: [SystemReadinessController],
  providers: [SystemReadinessService],
})
export class SystemReadinessModule {}
