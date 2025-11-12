import { Module } from '@nestjs/common';
import { MemberAuthService } from './member-auth.service';
import { PrismaModule } from '../prisma/prisma.module';
import { MemberAuthController } from './member-auth.controller';

@Module({
  imports: [PrismaModule],
  providers: [MemberAuthService],
  controllers: [MemberAuthController],
  exports: [MemberAuthService],
})
export class AuthModule {}


