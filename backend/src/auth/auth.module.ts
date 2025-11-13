import { Module } from '@nestjs/common';
import { MemberAuthService } from './member-auth.service';
import { PrismaModule } from '../prisma/prisma.module';
import { MemberAuthController } from './member-auth.controller';
import { AdminAuthService } from './admin-auth.service';
import { AdminAuthController } from './admin-auth.controller';

@Module({
  imports: [PrismaModule],
  providers: [MemberAuthService, AdminAuthService],
  controllers: [MemberAuthController, AdminAuthController],
  exports: [MemberAuthService, AdminAuthService],
})
export class AuthModule {}
