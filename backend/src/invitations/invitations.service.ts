import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InvitationsService {
  constructor(private prisma: PrismaService) {}

  async validateToken(token: string) {
    const invitationToken = await this.prisma.invitationToken.findUnique({
      where: { token },
      include: {
        application: true,
      },
    });

    if (!invitationToken) {
      throw new NotFoundException('Token inválido');
    }

    if (invitationToken.used) {
      throw new BadRequestException('Token já utilizado');
    }

    if (new Date() > invitationToken.expiresAt) {
      throw new BadRequestException('Token expirado');
    }

    return {
      valid: true,
      application: {
        id: invitationToken.application.id,
        fullName: invitationToken.application.fullName,
        email: invitationToken.application.email,
        company: invitationToken.application.company,
      },
    };
  }

  async markAsUsed(token: string) {
    await this.prisma.invitationToken.update({
      where: { token },
      data: { used: true },
    });
  }
}
