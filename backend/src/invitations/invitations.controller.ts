import { Controller, Get, Param } from '@nestjs/common';
import { InvitationsService } from './invitations.service';

@Controller('invitations')
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  @Get(':token')
  validateToken(@Param('token') token: string) {
    return this.invitationsService.validateToken(token);
  }
}
