import { Module } from '@nestjs/common';
import { MembersController } from './members.controller';
import { MembersService } from './members.service';
import { InvitationsModule } from '../invitations/invitations.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [InvitationsModule, AuthModule],
  controllers: [MembersController],
  providers: [MembersService],
})
export class MembersModule {}
