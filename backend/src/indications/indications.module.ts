import { Module } from '@nestjs/common';
import { IndicationsController } from './indications.controller';
import { IndicationsService } from './indications.service';
import { MemberGuard } from '../common/guards/member.guard';

@Module({
  controllers: [IndicationsController],
  providers: [IndicationsService, MemberGuard],
})
export class IndicationsModule {}


