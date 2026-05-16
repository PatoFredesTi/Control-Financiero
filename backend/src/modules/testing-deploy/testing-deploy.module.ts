import { Module } from '@nestjs/common';
import { TestingDeployController } from './testing-deploy.controller';
import { TestingDeployService } from './testing-deploy.service';

@Module({
  controllers: [TestingDeployController],
  providers: [TestingDeployService],
})
export class TestingDeployModule {}
