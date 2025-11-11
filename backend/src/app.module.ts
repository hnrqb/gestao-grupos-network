import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ApplicationsModule } from './applications/applications.module';
import { InvitationsModule } from './invitations/invitations.module';
import { MembersModule } from './members/members.module';

@Module({
  imports: [PrismaModule, ApplicationsModule, InvitationsModule, MembersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
