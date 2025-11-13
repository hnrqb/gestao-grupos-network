import { Module } from '@nestjs/common';
import { IndicationsController } from './indications.controller';
import { IndicationsService } from './indications.service';
import { MemberJwtGuard } from '../common/guards/member-jwt.guard';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [IndicationsController],
  providers: [IndicationsService, MemberJwtGuard],
})
export class IndicationsModule {}
