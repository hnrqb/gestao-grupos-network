import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { ApplicationsModule } from './applications/applications.module';
import { InvitationsModule } from './invitations/invitations.module';
import { MembersModule } from './members/members.module';
import { IndicationsModule } from './indications/indications.module';
import { AuthModule } from './auth/auth.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    PrismaModule,
    ApplicationsModule,
    InvitationsModule,
    MembersModule,
    IndicationsModule,
    AuthModule,
    DashboardModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
